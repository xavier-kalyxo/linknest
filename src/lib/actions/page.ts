"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pages, blocks, pendingUrlScans } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserWorkspace } from "@/lib/queries";
import { checkUrls } from "@/lib/safe-browsing";
import { checkRateLimit, mutationRateLimit } from "@/lib/rate-limit";
import type { ThemeTokens } from "@/lib/templates/theme";
import {
  COLOR_PALETTES,
  SYSTEM_FONTS,
  FREE_BUTTON_STYLES,
} from "@/lib/templates/theme";
import { getTemplate } from "@/lib/templates";
import { hasFeature, type PlanId } from "@/lib/entitlements";

// ─── Validation Schemas ─────────────────────────────────────────────────────

const updatePageSchema = z.object({
  pageId: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().max(2048).optional().or(z.literal("")),
  templateId: z.string().max(63).optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
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

// ─── Update Page Settings ───────────────────────────────────────────────────

export async function updatePage(input: z.infer<typeof updatePageSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const rl = await checkRateLimit(mutationRateLimit, session.user.id);
  if (!rl.success) return { error: "Too many requests. Please slow down." };

  const parsed = updatePageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input" };
  }

  const result = await verifyPageOwnership(parsed.data.pageId, session.user.id);
  if (!result) {
    return { error: "Page not found" };
  }

  const { page, workspace } = result;

  // Gate: Premium templates
  if (parsed.data.templateId !== undefined) {
    const template = getTemplate(parsed.data.templateId);
    if (
      template.tier === "pro" &&
      !hasFeature(workspace.plan as PlanId, "premium_templates")
    ) {
      return { error: "Premium templates require a Pro plan" };
    }
  }

  const { pageId, ...updates } = parsed.data;
  const cleanUpdates: Record<string, unknown> = { updatedAt: new Date() };

  if (updates.title !== undefined) cleanUpdates.title = updates.title;
  if (updates.bio !== undefined) cleanUpdates.bio = updates.bio || null;
  if (updates.avatarUrl !== undefined)
    cleanUpdates.avatarUrl = updates.avatarUrl || null;
  if (updates.templateId !== undefined)
    cleanUpdates.templateId = updates.templateId;
  if (updates.seoTitle !== undefined)
    cleanUpdates.seoTitle = updates.seoTitle || null;
  if (updates.seoDescription !== undefined)
    cleanUpdates.seoDescription = updates.seoDescription || null;

  const [updated] = await db
    .update(pages)
    .set(cleanUpdates)
    .where(eq(pages.id, pageId))
    .returning();

  return { page: updated };
}

// ─── Update Theme ───────────────────────────────────────────────────────────

export async function updateTheme(pageId: string, theme: Partial<ThemeTokens>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const result = await verifyPageOwnership(pageId, session.user.id);
  if (!result) {
    return { error: "Page not found" };
  }

  const { page, workspace } = result;
  const plan = workspace.plan as PlanId;

  // Gate 1: Custom hex colors
  if (!hasFeature(plan, "custom_colors")) {
    const colorFields = [
      "colorBackground",
      "colorSurface",
      "colorPrimary",
      "colorSecondary",
      "colorText",
      "colorTextMuted",
      "colorAccent",
      "borderColor",
    ] as const;
    const allowedColors = new Set(
      COLOR_PALETTES.flatMap((p) => Object.values(p.colors)),
    );
    for (const field of colorFields) {
      if (theme[field] && !allowedColors.has(theme[field])) {
        return {
          error: "Custom colors require a Pro plan. Choose a curated palette.",
        };
      }
    }
  }

  // Gate 2: Google Fonts
  if (!hasFeature(plan, "google_fonts")) {
    const systemFontValues = new Set(SYSTEM_FONTS.map((f) => f.value));
    for (const field of ["fontHeading", "fontBody"] as const) {
      if (theme[field] && !systemFontValues.has(theme[field])) {
        return { error: "Google Fonts require a Pro plan" };
      }
    }
  }

  // Gate 3: Pro button styles
  if (!hasFeature(plan, "animated_buttons") && theme.buttonStyle) {
    const freeStyles: string[] = [...FREE_BUTTON_STYLES];
    if (!freeStyles.includes(theme.buttonStyle)) {
      return { error: "This button style requires a Pro plan" };
    }
  }

  // Merge with existing theme
  const currentTheme = (page.theme ?? {}) as Partial<ThemeTokens>;
  const mergedTheme = { ...currentTheme, ...theme, version: 1 };

  const [updated] = await db
    .update(pages)
    .set({ theme: mergedTheme, updatedAt: new Date() })
    .where(eq(pages.id, pageId))
    .returning();

  return { page: updated };
}

// ─── Publish Page ───────────────────────────────────────────────────────────

export async function publishPage(pageId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const result = await verifyPageOwnership(pageId, session.user.id);
  if (!result) {
    return { error: "Page not found" };
  }

  const { page } = result;

  // Collect all outbound URLs from the page's blocks
  const pageBlocks = await db
    .select({ url: blocks.url })
    .from(blocks)
    .where(eq(blocks.pageId, pageId));

  const urls = pageBlocks
    .map((b) => b.url)
    .filter((u): u is string => Boolean(u));

  // Check URLs against Google Safe Browsing
  if (urls.length > 0) {
    const result = await checkUrls(urls);

    if (!result.safe) {
      return {
        error: `Cannot publish: ${result.flaggedUrls.length} URL(s) flagged as unsafe. Remove or replace them to publish.`,
        flaggedUrls: result.flaggedUrls,
      };
    }

    // If the check timed out (fail-open), queue URLs for background rescan
    if (result.timedOut) {
      await db.insert(pendingUrlScans).values(
        urls.map((url) => ({ pageId, url })),
      );
    }
  }

  const [updated] = await db
    .update(pages)
    .set({
      isPublished: true,
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(pages.id, pageId))
    .returning();

  // Revalidate the public page cache (use internal path without @)
  revalidatePath(`/${page.slug}`);

  return { page: updated };
}

// ─── Unpublish Page ─────────────────────────────────────────────────────────

export async function unpublishPage(pageId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const result = await verifyPageOwnership(pageId, session.user.id);
  if (!result) {
    return { error: "Page not found" };
  }

  const { page } = result;

  const [updated] = await db
    .update(pages)
    .set({
      isPublished: false,
      updatedAt: new Date(),
    })
    .where(eq(pages.id, pageId))
    .returning();

  // Revalidate the public page cache
  revalidatePath(`/${page.slug}`);

  return { page: updated };
}
