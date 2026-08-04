import { normalizeSlug } from "@/lib/slugs";

/**
 * Cache tag for a public page's data (page row + blocks).
 *
 * The public route renders dynamically, so `revalidatePath` does not apply to
 * it. Data-layer caching keyed by this tag is what makes public pages cheap,
 * and revalidating the tag is what makes edits show up immediately.
 */
export function publicPageTag(slug: string): string {
  return `page:${normalizeSlug(slug)}`;
}
