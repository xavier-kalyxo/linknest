import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { pages, blocks } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { TemplateRenderer } from "@/components/templates/template-renderer";

interface Props {
  params: Promise<{ username: string }>;
}

export const revalidate = false;

async function getPageData(slug: string) {
  const [page] = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const page = await getPageData(username);

  if (!page) {
    return { title: "Not Found" };
  }

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
  const page = await getPageData(username);

  if (!page || !page.isPublished) {
    notFound();
  }

  const pageBlocks = await getPageBlocks(page.id);

  return <TemplateRenderer page={page} blocks={pageBlocks} showReport />;
}
