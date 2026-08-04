/**
 * Canonical public origin of the app.
 *
 * Used for metadataBase, sitemap/robots URLs and Stripe return URLs. Several
 * call sites previously interpolated `process.env.AUTH_URL` directly, which
 * silently produced strings like "undefined/dashboard/billing" when unset.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.AUTH_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");

/** Absolute URL for a path within the app. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
