import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pages, blocks } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { getUserWorkspace } from "@/lib/queries";
import { TemplateRenderer } from "@/components/templates/template-renderer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ pageId: string }>;
}

async function getPageData(pageId: string, workspaceId: string) {
  const [page] = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, pageId), eq(pages.workspaceId, workspaceId)))
    .limit(1);

  return page ?? null;
}

async function getPageBlocks(pageId: string) {
  return db
    .select()
    .from(blocks)
    .where(eq(blocks.pageId, pageId))
    .orderBy(asc(blocks.position));
}

export default async function PreviewPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const workspace = await getUserWorkspace(session.user.id);
  if (!workspace) {
    notFound();
  }

  const { pageId } = await params;
  const page = await getPageData(pageId, workspace.id);

  if (!page) {
    notFound();
  }

  const pageBlocks = await getPageBlocks(page.id);

  return (
    <div className="min-h-screen bg-gray-100">
      <TemplateRenderer page={page} blocks={pageBlocks} showReport={false} />
    </div>
  );
}
