import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserWorkspace } from "@/lib/queries";
import { createPresignedUploadUrl, getR2PublicUrl } from "@/lib/r2";
import { db } from "@/lib/db";
import { assets } from "@/lib/db/schema";
import { getLimit } from "@/lib/entitlements";
import { eq, sql } from "drizzle-orm";
import type { PlanId } from "@/lib/entitlements";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getUserWorkspace(session.user.id);
  if (!workspace) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  const body = await request.json();
  const { filename, contentType, contentLength } = body as {
    filename: string;
    contentType: string;
    contentLength: number;
  };

  if (!filename || !contentType || !contentLength) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Check asset storage limit
  const [usage] = await db
    .select({ total: sql<number>`COALESCE(SUM(${assets.sizeBytes}), 0)` })
    .from(assets)
    .where(eq(assets.workspaceId, workspace.id));

  const limit = getLimit(workspace.plan as PlanId, "max_asset_bytes");
  if ((usage?.total ?? 0) + contentLength > limit) {
    return NextResponse.json(
      { error: "Storage limit reached. Upgrade to Pro for more space." },
      { status: 400 },
    );
  }

  // Generate presigned upload URL
  const result = await createPresignedUploadUrl({
    workspaceId: workspace.id,
    filename,
    contentType,
    contentLength,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Record the asset in the database
  const publicUrl = getR2PublicUrl(result.key);
  const [asset] = await db
    .insert(assets)
    .values({
      workspaceId: workspace.id,
      filename,
      r2Key: result.key,
      url: publicUrl,
      mimeType: contentType,
      sizeBytes: contentLength,
    })
    .returning();

  return NextResponse.json({
    uploadUrl: result.url,
    publicUrl,
    assetId: asset.id,
  });
}
