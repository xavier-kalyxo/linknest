import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserWorkspace, getWorkspacePages } from "@/lib/queries";
import { getLimit, type PlanId } from "@/lib/entitlements";
import { normalizeSlug } from "@/lib/slugs";
import { SITE_URL } from "@/lib/site";

/**
 * GET /api/analytics?slug=<page-slug>
 *
 * Queries PostHog for pageview and link-click data for a specific page.
 * The window follows the workspace plan (7 days free, 90 days Pro).
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getUserWorkspace(session.user.id);
  if (!workspace) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  const rawSlug = request.nextUrl.searchParams.get("slug");
  if (!rawSlug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }
  const slug = normalizeSlug(rawSlug);

  // Verify the page belongs to this workspace
  const pages = await getWorkspacePages(workspace.id);
  const page = pages.find((p) => p.slug === slug);
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  // Plan-scoped window. This was hardcoded to 7 days for everyone, so Pro's
  // advertised 90-day history did not exist.
  const days = getLimit(workspace.plan as PlanId, "analytics_days");
  const emptyLabels = getDayLabels(days);

  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  // If PostHog is not configured, return placeholder data. This is an operator
  // misconfiguration, not something the account owner can fix, so log it loudly
  // — otherwise every customer silently sees an empty dashboard.
  if (!apiKey || !projectId) {
    console.error(
      "[analytics] POSTHOG_PERSONAL_API_KEY / POSTHOG_PROJECT_ID are not set — " +
        "analytics is returning empty data for every user.",
    );
    return NextResponse.json({
      total: 0,
      clicks: 0,
      daily: Array(days).fill(0),
      labels: emptyLabels,
      days,
      configured: false,
    });
  }

  // Match the page's canonical URL exactly. "icontains /@<slug>" credited every
  // view of @jordan and @jones to @jo, because a slug may be a prefix of
  // another slug — so short-handle owners saw inflated counts and long-handle
  // owners had their traffic double-counted into someone else's dashboard.
  const canonicalUrl = `${SITE_URL}/@${slug}`;
  const urls = [canonicalUrl, `${canonicalUrl}/`];

  // HogQL via /query/. The previous implementation posted to
  // /api/projects/:id/insights/trend/, which PostHog has retired — it answers
  // 403 "Legacy insight endpoints are not available for this user", so the
  // dashboard could never have shown a number regardless of the API key.
  const HOGQL = `
    SELECT toDate(timestamp) AS day, count() AS c
    FROM events
    WHERE event = {event}
      AND properties.$current_url IN {urls}
      AND timestamp >= now() - INTERVAL {days} DAY
    GROUP BY day
    ORDER BY day`;

  async function queryDaily(event: string): Promise<Map<string, number>> {
    const res = await fetch(`${host}/api/projects/${projectId}/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query: HOGQL,
          // Parameterized, not interpolated — the slug reaches this from a
          // query string.
          values: { event, urls, days },
        },
      }),
    });

    if (!res.ok) {
      throw new Error(
        `PostHog query failed for ${event}: ${res.status} ${await res.text()}`,
      );
    }

    const body = (await res.json()) as { results?: [string, number][] };
    return new Map((body.results ?? []).map(([day, c]) => [day, Number(c)]));
  }

  try {
    const [viewsByDay, clicksByDay] = await Promise.all([
      queryDaily("$pageview"),
      // Clicks were captured on public pages but never queried, so the single
      // most useful metric for a link-in-bio product was invisible to its owner.
      queryDaily("link_click").catch(() => new Map<string, number>()),
    ]);

    // PostHog returns only days that have events; expand to a dense series so
    // the sparkline's bars line up with its labels.
    const daily: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      daily.push(viewsByDay.get(d.toISOString().slice(0, 10)) ?? 0);
    }

    const total = daily.reduce((sum, n) => sum + n, 0);
    const clickTotal = [...clicksByDay.values()].reduce((sum, n) => sum + n, 0);

    return NextResponse.json({
      total,
      clicks: clickTotal,
      daily,
      labels: emptyLabels,
      days,
      configured: true,
    });
  } catch (error) {
    console.error("[analytics] PostHog query failed:", error);
    // 502 rather than a 200 full of zeros: an outage used to be indistinguishable
    // from "nobody visited your page", which is worse than showing an error.
    return NextResponse.json(
      {
        total: null,
        clicks: null,
        daily: [],
        labels: emptyLabels,
        days,
        configured: true,
        error: "Analytics are temporarily unavailable.",
      },
      { status: 502 },
    );
  }
}

function getDayLabels(days: number): string[] {
  const labels: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(
      days > 14
        ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : d.toLocaleDateString("en-US", { weekday: "short" }),
    );
  }
  return labels;
}
