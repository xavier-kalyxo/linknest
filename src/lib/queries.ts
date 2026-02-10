import { db } from "@/lib/db";
import { workspaceMembers, workspaces, pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get the workspace for a user (at MVP, each user has exactly one workspace).
 */
export async function getUserWorkspace(userId: string) {
  const result = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      plan: workspaces.plan,
      stripeCustomerId: workspaces.stripeCustomerId,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get all pages for a workspace.
 */
export async function getWorkspacePages(workspaceId: string) {
  return db
    .select()
    .from(pages)
    .where(eq(pages.workspaceId, workspaceId))
    .orderBy(pages.createdAt);
}

/**
 * Check if a page slug is already taken.
 */
export async function isSlugTaken(slug: string): Promise<boolean> {
  const result = await db
    .select({ id: pages.id })
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);

  return result.length > 0;
}
