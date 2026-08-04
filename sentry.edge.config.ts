import * as Sentry from "@sentry/nextjs";

// Prefer the server-only SENTRY_DSN; fall back to the public one so a single
// variable still works. Server observability should not depend on a value that
// is deliberately exposed to the browser.
const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  tracesSampleRate: 0.1,
});
