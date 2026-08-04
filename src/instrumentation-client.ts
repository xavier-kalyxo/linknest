import * as Sentry from "@sentry/nextjs";

/**
 * Browser Sentry bootstrap.
 *
 * Replaces sentry.client.config.ts, which Turbopack does not load — and Next 16
 * builds with Turbopack, so the old file was dead code regardless of whether a
 * DSN was set.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  // Public pages are user-generated content; keep URLs but drop anything that
  // could carry a visitor's input.
  sendDefaultPii: false,
});

/** Lets Sentry tie client-side navigations to their originating transaction. */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
