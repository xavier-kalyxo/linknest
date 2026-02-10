import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageReports, pages } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

const VALID_REASONS = ["phishing", "malware", "spam", "other"] as const;

export async function POST(request: NextRequest) {
  const { pageId, reason, details } = (await request.json()) as {
    pageId: string;
    reason: string;
    details?: string;
  };

  if (!pageId || !reason) {
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

  // Get reporter IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

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
