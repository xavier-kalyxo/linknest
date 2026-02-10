import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserWorkspace, getWorkspacePages } from "@/lib/queries";

/**
 * GET /api/analytics?slug=<page-slug>
 *
 * Queries PostHog for pageview data for a specific page.
 * Returns 7-day daily view counts for the dashboard sparkline.
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

  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  // Verify the page belongs to this workspace
  const pages = await getWorkspacePages(workspace.id);
  const page = pages.find((p) => p.slug === slug);
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  // If PostHog is not configured, return placeholder data
  if (!apiKey || !projectId) {
    return NextResponse.json({
      total: 0,
      daily: Array(7).fill(0),
      labels: getLast7DayLabels(),
      configured: false,
    });
  }

  try {
    // Query PostHog trends API for $pageview events on this page's URL
    const res = await fetch(`${host}/api/projects/${projectId}/insights/trend/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        events: [
          {
            id: "$pageview",
            type: "events",
            properties: [
              {
                key: "$current_url",
                value: `/@${slug}`,
                operator: "icontains",
                type: "event",
              },
            ],
          },
        ],
        date_from: "-7d",
        interval: "day",
      }),
    });

    if (!res.ok) {
      return NextResponse.json({
        total: 0,
        daily: Array(7).fill(0),
        labels: getLast7DayLabels(),
        configured: true,
        error: "PostHog API error",
      });
    }

    const data = await res.json();
    const daily: number[] = data.result?.[0]?.data ?? Array(7).fill(0);
    const labels: string[] =
      data.result?.[0]?.labels ?? getLast7DayLabels();
    const total = daily.reduce((sum: number, n: number) => sum + n, 0);

    return NextResponse.json({ total, daily, labels, configured: true });
  } catch {
    return NextResponse.json({
      total: 0,
      daily: Array(7).fill(0),
      labels: getLast7DayLabels(),
      configured: true,
      error: "Failed to fetch analytics",
    });
  }
}

function getLast7DayLabels(): string[] {
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
  }
  return labels;
}
