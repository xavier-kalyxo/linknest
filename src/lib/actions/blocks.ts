"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { blocks, pages } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getUserWorkspace } from "@/lib/queries";
import { checkBannedUrl } from "@/lib/safe-browsing";
import { checkRateLimit, mutationRateLimit } from "@/lib/rate-limit";
import { getLimit, type PlanId } from "@/lib/entitlements";

// ─── Validation Schemas ─────────────────────────────────────────────────────

const blockTypeSchema = z.enum(["link", "header", "text", "divider", "image"]);

const createBlockSchema = z.object({
  pageId: z.string().uuid(),
  type: blockTypeSchema,
  label: z.string().max(255).optional(),
  url: z.string().url().max(2048).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
});

const updateBlockSchema = z.object({
  id: z.string().uuid(),
  label: z.string().max(255).optional(),
  url: z.string().url().max(2048).optional().or(z.literal("")),
  content: z.record(z.string(), z.unknown()).optional(),
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

  // Check for banned URL patterns
  if (parsed.data.url) {
    const banned = checkBannedUrl(parsed.data.url);
    if (banned) return { error: banned };
  }

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
      url: parsed.data.url ?? null,
      content: parsed.data.content ?? {},
    })
    .returning();

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

  // Check for banned URL patterns
  if (parsed.data.url) {
    const banned = checkBannedUrl(parsed.data.url);
    if (banned) return { error: banned };
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.label !== undefined) updates.label = parsed.data.label;
  if (parsed.data.url !== undefined)
    updates.url = parsed.data.url || null;
  if (parsed.data.content !== undefined) updates.content = parsed.data.content;
  if (parsed.data.isVisible !== undefined)
    updates.isVisible = parsed.data.isVisible;

  const [updated] = await db
    .update(blocks)
    .set(updates)
    .where(eq(blocks.id, parsed.data.id))
    .returning();

  return { block: updated };
}

// ─── Delete Block ───────────────────────────────────────────────────────────

export async function deleteBlock(blockId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

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

  const parsed = reorderBlocksSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const result = await verifyPageOwnership(parsed.data.pageId, session.user.id);
  if (!result) {
    return { error: "Page not found" };
  }

  const { page } = result;

  // Update positions in order
  const updates = parsed.data.blockIds.map((id, index) =>
    db
      .update(blocks)
      .set({ position: index, updatedAt: new Date() })
      .where(and(eq(blocks.id, id), eq(blocks.pageId, page.id))),
  );

  await Promise.all(updates);

  return { success: true };
}
