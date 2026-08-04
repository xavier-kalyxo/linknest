import { ImageResponse } from "next/og";
import sharp from "sharp";
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

/**
 * Fetch the page's own avatar and re-encode it to PNG.
 *
 * Uploads are stored as WebP, which the image renderer cannot decode, so the
 * card previously always fell back to initials — even for accounts that had
 * uploaded a perfectly good logo.
 */
async function loadAvatar(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const png = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(200, 200, { fit: "cover" })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null; // fall back to initials
  }
}

/**
 * Load a real typeface for the card.
 *
 * Without this the renderer falls back to a generic sans, so every card looked
 * like a system dialog regardless of the page's own typography. Subsetting to
 * the glyphs actually used keeps the download small.
 */
async function loadFont(
  family: string,
  weight: number,
  text: string,
): Promise<ArrayBuffer | null> {
  try {
    const url =
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}` +
      `&text=${encodeURIComponent(text)}`;
    // A browser UA would get woff2, which the renderer cannot parse; the
    // default UA yields TrueType.
    const css = await fetch(url).then((r) => (r.ok ? r.text() : ""));
    const src = css.match(/src:\s*url\((https:[^)]+)\)/)?.[1];
    if (!src) return null;
    const font = await fetch(src);
    return font.ok ? await font.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Trim to a word boundary rather than mid-word. */
function truncate(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:—-]$/, "")}…`;
}

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
      avatarUrl: pages.avatarUrl,
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

  const live = Boolean(page?.isPublished);
  const title = live ? page!.title : "LinkNest";
  const rawBio = live ? (page!.bio ?? "") : "One link for everything.";
  const handle = live ? `@${page!.slug}` : "linknest.click";

  // Two lines of title at most, and never mid-word.
  const displayTitle = truncate(title, 52);
  const displayBio = truncate(rawBio, 96);

  // Long titles step down so they stay on two lines without shrinking to
  // illegibility on a phone-sized preview thumbnail.
  const titleSize =
    displayTitle.length > 38 ? 60 : displayTitle.length > 24 ? 70 : 80;

  const [avatar, fontRegular, fontBold] = await Promise.all([
    loadAvatar(live ? page!.avatarUrl : null),
    loadFont("Inter", 400, `${displayBio}${handle}`),
    loadFont("Inter", 700, displayTitle),
  ]);

  const fonts = [
    ...(fontBold
      ? [{ name: "Inter", data: fontBold, weight: 700 as const, style: "normal" as const }]
      : []),
    ...(fontRegular
      ? [{ name: "Inter", data: fontRegular, weight: 400 as const, style: "normal" as const }]
      : []),
  ];

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
          padding: "72px 96px",
          fontFamily: fonts.length ? "Inter" : "sans-serif",
        }}
      >
        {avatar ? (
          <img
            src={avatar}
            width={132}
            height={132}
            style={{
              width: 132,
              height: 132,
              borderRadius: 66,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 132,
              height: 132,
              // Explicit half-of-width radius: a large arbitrary value renders
              // as a squashed superellipse rather than a circle.
              borderRadius: 66,
              backgroundColor: theme.colorPrimary,
              color: theme.colorBackground,
              fontSize: 54,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            {getInitials(title)}
          </div>
        )}

        <div
          style={{
            fontSize: titleSize,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: -1.5,
            marginTop: 44,
            maxWidth: 940,
          }}
        >
          {displayTitle}
        </div>

        {displayBio ? (
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              marginTop: 22,
              textAlign: "center",
              color: theme.colorTextMuted,
              maxWidth: 820,
            }}
          >
            {displayBio}
          </div>
        ) : null}

        {/* Accent rule ties the card to the page's brand colour and separates
            the handle from the body copy. */}
        <div
          style={{
            width: 72,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.colorPrimary,
            marginTop: 40,
          }}
        />

        <div
          style={{
            fontSize: 26,
            marginTop: 24,
            color: theme.colorPrimary,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          {handle}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
