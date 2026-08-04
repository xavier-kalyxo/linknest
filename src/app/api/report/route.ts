import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageReports, pages } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { getClientIp } from "@/lib/request-ip";

const VALID_REASONS = ["phishing", "malware", "spam", "other"] as const;

export async function POST(request: NextRequest) {
  // Require a JSON content type. request.json() parses any body, which made
  // this a CORS "simple request": a third-party page could silently file
  // reports from every visitor's own IP, defeating the per-IP limit and
  // manufacturing a takedown signal against a competitor.
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json(
      { error: "Unsupported content type" },
      { status: 415 },
    );
  }

  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("host");
    let sameOrigin = false;
    try {
      sameOrigin = new URL(origin).host === host;
    } catch {
      sameOrigin = false;
    }
    if (!sameOrigin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let body: { pageId?: unknown; reason?: unknown; details?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { pageId, reason, details } = body as {
    pageId: string;
    reason: string;
    details?: string;
  };

  if (typeof pageId !== "string" || typeof reason !== "string") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!VALID_REASONS.includes(reason as (typeof VALID_REASONS)[number])) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  // Verify the page exists
  const [page] = await db
    .select({ id: pages.id })
    .from(pages)
    .where(eq(pages.id, pageId))
    .limit(1);

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const ip = await getClientIp();

  // Rate limit: max 3 reports per IP per day
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(pageReports)
    .where(
      and(
        eq(pageReports.reporterIp, ip),
        gte(pageReports.createdAt, oneDayAgo),
      ),
    );

  if ((countResult?.count ?? 0) >= 3) {
    return NextResponse.json(
      { error: "Too many reports. Try again later." },
      { status: 429 },
    );
  }

  await db.insert(pageReports).values({
    pageId,
    reporterIp: ip,
    reason,
    details: details?.slice(0, 1000) || null,
  });

  return NextResponse.json({ success: true });
}
