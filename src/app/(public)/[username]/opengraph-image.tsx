import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { normalizeSlug } from "@/lib/slugs";
import type { ThemeTokens } from "@/lib/templates/theme";
import { getTemplate } from "@/lib/templates";
import { getInitials } from "@/lib/avatar";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "LinkNest page preview";

/**
 * Social preview card for a public page.
 *
 * Without this, every LinkNest link shared to X / iMessage / WhatsApp — which is
 * the entire distribution channel for a link-in-bio product — renders as a bare
 * text row. The card is drawn from the page's own theme so the preview matches
 * what the visitor lands on.
 */
export default async function Image({
  params,
}: {
  // Next 16 passes params as a Promise here, same as in page.tsx.
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const slug = normalizeSlug(username);

  const [page] = await db
    .select({
      title: pages.title,
      bio: pages.bio,
      slug: pages.slug,
      theme: pages.theme,
      templateId: pages.templateId,
      isPublished: pages.isPublished,
    })
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);

  const template = getTemplate(page?.templateId ?? "clean-slate");
  const theme = {
    ...template.defaultTheme,
    ...((page?.theme ?? {}) as Partial<ThemeTokens>),
  } as ThemeTokens;

  const title = page?.isPublished ? page.title : "LinkNest";
  const bio = page?.isPublished ? (page.bio ?? "") : "One link for everything.";
  const handle = page?.isPublished ? `@${page.slug}` : "linknest.click";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colorBackground,
          color: theme.colorText,
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 999,
            backgroundColor: theme.colorPrimary,
            color: theme.colorBackground,
            fontSize: 56,
            fontWeight: 700,
            marginBottom: 36,
          }}
        >
          {getInitials(title)}
        </div>

        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>

        {bio ? (
          <div
            style={{
              fontSize: 32,
              marginTop: 24,
              textAlign: "center",
              color: theme.colorTextMuted,
              maxWidth: 900,
            }}
          >
            {bio.length > 120 ? `${bio.slice(0, 117)}…` : bio}
          </div>
        ) : null}

        <div
          style={{
            fontSize: 28,
            marginTop: 48,
            color: theme.colorTextMuted,
          }}
        >
          {handle}
        </div>
      </div>
    ),
    size,
  );
}
