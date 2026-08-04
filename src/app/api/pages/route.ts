import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserWorkspace, getWorkspacePages } from "@/lib/queries";
import { getLimit } from "@/lib/entitlements";
import { validateSlug, isReservedSlug, normalizeSlug } from "@/lib/slugs";
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
    title?: unknown;
    slug?: unknown;
  };

  // Validate inputs
  if (typeof title !== "string" || !title.trim() || title.length > 255) {
    return NextResponse.json({ error: "Invalid title" }, { status: 400 });
  }

  if (typeof slug !== "string") {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  // validateSlug returns a result object — it is always truthy, so it must be
  // read via .valid, never checked for truthiness.
  const slugCheck = validateSlug(slug);
  if (!slugCheck.valid) {
    return NextResponse.json({ error: slugCheck.reason }, { status: 400 });
  }

  // Persist the normalized form: lookups on the public route are
  // case-sensitive, so storing raw input would make the page unreachable.
  const normalizedSlug = normalizeSlug(slug);

  if (isReservedSlug(normalizedSlug)) {
    return NextResponse.json(
      { error: "This username is reserved" },
      { status: 400 },
    );
  }

  if (await isSlugTaken(normalizedSlug)) {
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

  try {
    const [page] = await db
      .insert(pages)
      .values({
        workspaceId: workspace.id,
        slug: normalizedSlug,
        title: title.trim(),
        templateId: "clean-slate",
        theme: {},
      })
      .returning();

    return NextResponse.json({ page });
  } catch {
    // Unique-constraint violation: someone claimed the slug between the
    // availability check and the insert.
    return NextResponse.json(
      { error: "This username is already taken" },
      { status: 409 },
    );
  }
}
