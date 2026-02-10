import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserWorkspace, getWorkspacePages } from "@/lib/queries";
import { getLimit } from "@/lib/entitlements";
import { validateSlug, isReservedSlug } from "@/lib/slugs";
import { isSlugTaken } from "@/lib/queries";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getUserWorkspace(session.user.id);
  if (!workspace) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  const plan = workspace.plan as "free" | "pro";
  const { title, slug } = (await request.json()) as {
    title: string;
    slug: string;
  };

  // Validate inputs
  if (!title || title.length > 255) {
    return NextResponse.json({ error: "Invalid title" }, { status: 400 });
  }

  const slugError = validateSlug(slug);
  if (slugError) {
    return NextResponse.json({ error: slugError }, { status: 400 });
  }

  if (isReservedSlug(slug)) {
    return NextResponse.json(
      { error: "This username is reserved" },
      { status: 400 },
    );
  }

  if (await isSlugTaken(slug)) {
    return NextResponse.json(
      { error: "This username is already taken" },
      { status: 400 },
    );
  }

  // Check page limit
  const existingPages = await getWorkspacePages(workspace.id);
  const maxPages = getLimit(plan, "max_pages");
  if (existingPages.length >= maxPages) {
    return NextResponse.json(
      { error: "Page limit reached. Upgrade to Pro for more pages." },
      { status: 403 },
    );
  }

  const [page] = await db
    .insert(pages)
    .values({
      workspaceId: workspace.id,
      slug,
      title,
      templateId: "clean-slate",
      theme: {},
    })
    .returning();

  return NextResponse.json({ page });
}
