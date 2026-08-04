import * as Sentry from "@sentry/nextjs";

/**
 * Server + edge Sentry bootstrap.
 *
 * Next.js calls register() once per runtime at startup. Without this file the
 * sentry.server.config / sentry.edge.config modules are never imported, so
 * Sentry.init() never runs and every captureException() is a no-op — which is
 * the state this project was in.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

/**
 * Required for Next.js to report errors thrown inside Server Components,
 * route handlers and server actions. Error boundaries alone do not cover these.
 */
export const onRequestError = Sentry.captureRequestError;
