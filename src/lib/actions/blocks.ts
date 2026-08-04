"use server";

import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blocks, pages } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getUserWorkspace } from "@/lib/queries";
import { publicPageTag } from "@/lib/cache-tags";
import { normalizeUrl } from "@/lib/safe-browsing";
import { checkRateLimit, mutationRateLimit } from "@/lib/rate-limit";
import { getLimit, type PlanId } from "@/lib/entitlements";
import { type BlockStyleOverrides } from "@/lib/templates/theme";
import { validateStyleOverrides } from "./block-validation";

// ─── Validation Schemas ─────────────────────────────────────────────────────

const blockTypeSchema = z.enum(["link", "header", "text", "divider", "image"]);

// `content` is rendered directly by the block components, so its shape must be
// closed. A bare z.record(z.unknown()) let a non-string land in a JSX text slot
// ("Objects are not valid as a React child"), which throws during SSR and takes
// down the whole public page. styleOverrides is shape- and plan-checked
// separately by validateStyleOverrides().
const blockStyleOverridesSchema = z
  .object({
    variant: z.string().max(32).optional(),
    bgColor: z.string().max(32).optional(),
    textColor: z.string().max(32).optional(),
    borderRadius: z.number().optional(),
    shadow: z.string().max(16).optional(),
    buttonStyle: z.string().max(32).optional(),
  })
  .strict();

const blockContentSchema = z
  .object({
    text: z.string().max(5000).optional(),
    imageUrl: z.string().max(2048).optional(),
    alt: z.string().max(255).optional(),
    styleOverrides: blockStyleOverridesSchema.optional(),
  })
  .strict();

// `url` is deliberately NOT z.url(): zod accepts any scheme new URL() parses,
// including javascript:. normalizeUrl() applies the scheme allowlist and
// returns the value we persist.
const createBlockSchema = z.object({
  pageId: z.string().uuid(),
  type: blockTypeSchema,
  label: z.string().max(255).optional(),
  url: z.string().max(2048).optional(),
  content: blockContentSchema.optional(),
});

const updateBlockSchema = z.object({
  id: z.string().uuid(),
  label: z.string().max(255).optional(),
  url: z.string().max(2048).optional(),
  content: blockContentSchema.optional(),
  isVisible: z.boolean().optional(),
});

const reorderBlocksSchema = z.object({
  pageId: z.string().uuid(),
  blockIds: z.array(z.string().uuid()),
});

// ─── Helpers ────────────────────────────────────────────────────────────────

async function verifyPageOwnership(pageId: string, userId: string) {
  const workspace = await getUserWorkspace(userId);
  if (!workspace) return null;

  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, pageId), eq(pages.workspaceId, workspace.id)))
    .limit(1);

  if (!page) return null;
  return { page, workspace };
}

/** Normalize any URLs carried inside a block's content payload. */
function normalizeContent(
  content: z.infer<typeof blockContentSchema> | undefined,
): { content: Record<string, unknown> } | { error: string } {
  if (!content) return { content: {} };

  const normalized: Record<string, unknown> = { ...content };

  if (content.imageUrl) {
    const result = normalizeUrl(content.imageUrl);
    if ("error" in result) return { error: "Invalid image URL." };
    normalized.imageUrl = result.url;
  }

  return { content: normalized };
}

// ─── Create Block ───────────────────────────────────────────────────────────

export async function createBlock(input: z.infer<typeof createBlockSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const rl = await checkRateLimit(mutationRateLimit, session.user.id);
  if (!rl.success) return { error: "Too many requests. Please slow down." };

  const parsed = createBlockSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const result = await verifyPageOwnership(parsed.data.pageId, session.user.id);
  if (!result) {
    return { error: "Page not found" };
  }

  const { page, workspace } = result;

  // Validate + normalize the URL against the scheme allowlist
  let normalizedUrl: string | null = null;
  if (parsed.data.url) {
    const urlResult = normalizeUrl(parsed.data.url);
    if ("error" in urlResult) return { error: urlResult.error };
    normalizedUrl = urlResult.url;
  }

  const contentResult = normalizeContent(parsed.data.content);
  if ("error" in contentResult) return { error: contentResult.error };

  // Gate: Block count limit
  const [blockCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(blocks)
    .where(eq(blocks.pageId, page.id));
  const limit = getLimit(workspace.plan as PlanId, "max_blocks_per_page");
  if ((blockCount?.count ?? 0) >= limit) {
    return { error: `Block limit reached (${limit}). Upgrade to Pro for more.` };
  }

  // Get the next position
  const [maxPos] = await db
    .select({ max: sql<number>`COALESCE(MAX(${blocks.position}), -1)` })
    .from(blocks)
    .where(eq(blocks.pageId, page.id));

  const [block] = await db
    .insert(blocks)
    .values({
      pageId: page.id,
      type: parsed.data.type,
      position: (maxPos?.max ?? -1) + 1,
      label: parsed.data.label ?? null,
      url: normalizedUrl,
      content: contentResult.content,
    })
    .returning();

  revalidatePath(`/${page.slug}`);
  revalidateTag(publicPageTag(page.slug), "max");

  return { block };
}

// ─── Update Block ───────────────────────────────────────────────────────────

export async function updateBlock(input: z.infer<typeof updateBlockSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const rl2 = await checkRateLimit(mutationRateLimit, session.user.id);
  if (!rl2.success) return { error: "Too many requests. Please slow down." };

  const parsed = updateBlockSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  // Verify ownership through the block's page
  const [block] = await db
    .select({ pageId: blocks.pageId })
    .from(blocks)
    .where(eq(blocks.id, parsed.data.id))
    .limit(1);

  if (!block) {
    return { error: "Block not found" };
  }

  const result = await verifyPageOwnership(block.pageId, session.user.id);
  if (!result) {
    return { error: "Unauthorized" };
  }

  const { workspace, page } = result;

  // Validate + normalize the URL against the scheme allowlist
  let normalizedUrl: string | null = null;
  if (parsed.data.url) {
    const urlResult = normalizeUrl(parsed.data.url);
    if ("error" in urlResult) return { error: urlResult.error };
    normalizedUrl = urlResult.url;
  }

  const contentResult = normalizeContent(parsed.data.content);
  if ("error" in contentResult) return { error: contentResult.error };

  // Validate style overrides (only when content.styleOverrides is being written)
  if (parsed.data.content) {
    const overrides = parsed.data.content.styleOverrides as
      | BlockStyleOverrides
      | undefined;
    if (overrides && Object.keys(overrides).length > 0) {
      const err = validateStyleOverrides(overrides, workspace.plan as PlanId);
      if (err) return { error: err };
    }
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.label !== undefined) updates.label = parsed.data.label;
  if (parsed.data.url !== undefined) updates.url = normalizedUrl;
  if (parsed.data.content !== undefined)
    updates.content = contentResult.content;
  if (parsed.data.isVisible !== undefined)
    updates.isVisible = parsed.data.isVisible;

  const [updated] = await db
    .update(blocks)
    .set(updates)
    .where(eq(blocks.id, parsed.data.id))
    .returning();

  revalidatePath(`/${page.slug}`);
  revalidateTag(publicPageTag(page.slug), "max");

  return { block: updated };
}

// ─── Delete Block ───────────────────────────────────────────────────────────

export async function deleteBlock(blockId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const rl = await checkRateLimit(mutationRateLimit, session.user.id);
  if (!rl.success) return { error: "Too many requests. Please slow down." };

  const [block] = await db
    .select({ pageId: blocks.pageId })
    .from(blocks)
    .where(eq(blocks.id, blockId))
    .limit(1);

  if (!block) {
    return { error: "Block not found" };
  }

  const result = await verifyPageOwnership(block.pageId, session.user.id);
  if (!result) {
    return { error: "Unauthorized" };
  }

  await db.delete(blocks).where(eq(blocks.id, blockId));

  revalidatePath(`/${result.page.slug}`);
  revalidateTag(publicPageTag(result.page.slug), "max");

  return { success: true };
}

// ─── Reorder Blocks ─────────────────────────────────────────────────────────

export async function reorderBlocks(
  input: z.infer<typeof reorderBlocksSchema>,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const rl = await checkRateLimit(mutationRateLimit, session.user.id);
  if (!rl.success) return { error: "Too many requests. Please slow down." };

  const parsed = reorderBlocksSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const result = await verifyPageOwnership(parsed.data.pageId, session.user.id);
  if (!result) {
    return { error: "Page not found" };
  }

  const { page } = result;
  const { blockIds } = parsed.data;

  // The incoming list must be an exact permutation of the page's blocks.
  // Without this, a duplicated id would collapse two blocks onto one position
  // and a short list would leave stale positions behind, making ORDER BY
  // position non-deterministic.
  const owned = await db
    .select({ id: blocks.id })
    .from(blocks)
    .where(eq(blocks.pageId, page.id));

  const ownedIds = new Set(owned.map((b) => b.id));
  const uniqueIncoming = new Set(blockIds);

  if (
    uniqueIncoming.size !== blockIds.length ||
    blockIds.length !== ownedIds.size ||
    blockIds.some((id) => !ownedIds.has(id))
  ) {
    return { error: "Block order is out of date. Refresh and try again." };
  }

  // One transaction: a partial failure must not leave duplicate positions.
  await db.transaction(async (tx) => {
    for (const [index, id] of blockIds.entries()) {
      await tx
        .update(blocks)
        .set({ position: index, updatedAt: new Date() })
        .where(and(eq(blocks.id, id), eq(blocks.pageId, page.id)));
    }
  });

  revalidatePath(`/${page.slug}`);
  revalidateTag(publicPageTag(page.slug), "max");

  return { success: true };
}
