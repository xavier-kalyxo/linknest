import { db } from "@/lib/db";
import { workspaceMembers, workspaces, pages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { normalizeSlug } from "@/lib/slugs";

/**
 * Get the workspace for a user (at MVP, each user has exactly one workspace).
 *
 * Ordered by creation so the result stays stable once a user belongs to more
 * than one workspace — an unordered LIMIT 1 would let the editor, dashboard,
 * entitlement checks and uploads each target a different workspace.
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
    .orderBy(asc(workspaces.createdAt), asc(workspaces.id))
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
 *
 * Also checks `workspaces.slug`: that column is unique too, and onboarding
 * claims both at once. Checking only `pages` let a user pass the availability
 * check and then fail forever on the workspace unique constraint.
 */
export async function isSlugTaken(slug: string): Promise<boolean> {
  const normalized = normalizeSlug(slug);

  const [takenPage] = await db
    .select({ id: pages.id })
    .from(pages)
    .where(eq(pages.slug, normalized))
    .limit(1);

  if (takenPage) return true;

  const [takenWorkspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.slug, normalized))
    .limit(1);

  return Boolean(takenWorkspace);
}
