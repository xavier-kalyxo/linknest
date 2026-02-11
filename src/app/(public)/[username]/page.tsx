import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { pages, blocks, workspaces } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { TemplateRenderer } from "@/components/templates/template-renderer";
import type { ThemeTokens } from "@/lib/templates/theme";

interface Props {
  params: Promise<{ username: string }>;
}

export const revalidate = false;

async function getPageData(slug: string) {
  const result = await db
    .select({
      page: pages,
      plan: workspaces.plan,
    })
    .from(pages)
    .innerJoin(workspaces, eq(pages.workspaceId, workspaces.id))
    .where(eq(pages.slug, slug))
    .limit(1);

  return result[0] ?? null;
}

async function getPageBlocks(pageId: string) {
  return db
    .select()
    .from(blocks)
    .where(eq(blocks.pageId, pageId))
    .orderBy(asc(blocks.position));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const result = await getPageData(username);

  if (!result) {
    return { title: "Not Found" };
  }

  const { page } = result;

  return {
    title: page.seoTitle || page.title,
    description:
      page.seoDescription || page.bio || `${page.title} — LinkNest`,
    openGraph: {
      title: page.seoTitle || page.title,
      description:
        page.seoDescription || page.bio || `${page.title} — LinkNest`,
      type: "profile",
    },
  };
}

export default async function PublicPage({ params }: Props) {
  const { username } = await params;
  const result = await getPageData(username);

  if (!result || !result.page.isPublished) {
    notFound();
  }

  const { page, plan } = result;
  const pageBlocks = await getPageBlocks(page.id);

  const theme = page.theme as Partial<ThemeTokens> | null;
  const isPro = plan === "pro";
  const showBadge = !(isPro && theme?.hideBranding);

  return (
    <TemplateRenderer
      page={page}
      blocks={pageBlocks}
      showBadge={showBadge}
      showReport
    />
  );
}
