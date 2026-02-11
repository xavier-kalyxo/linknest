"use client";

import type { InferSelectModel } from "drizzle-orm";
import type { pages, blocks as blocksSchema } from "@/lib/db/schema";
import type { ThemeTokens } from "@/lib/templates/theme";
import { themeToCssVars } from "@/lib/templates/theme";
import { getTemplate } from "@/lib/templates";
import { BlockRenderer } from "@/components/blocks/block-renderer";

type Page = InferSelectModel<typeof pages>;
type Block = InferSelectModel<typeof blocksSchema>;

interface LivePreviewProps {
  page: Page;
  blocks: Block[];
  theme: ThemeTokens;
}

export function LivePreview({ page, blocks, theme }: LivePreviewProps) {
  const template = getTemplate(page.templateId);
  const cssVars = themeToCssVars(theme);
  const sorted = [...blocks].sort((a, b) => a.position - b.position);

  const backgroundStyle: React.CSSProperties = {};
  if (theme.backgroundEffect === "gradient" && theme.backgroundGradient) {
    backgroundStyle.backgroundImage = theme.backgroundGradient;
  }

  return (
    <div className="relative">
      {/* Phone frame */}
      <div className="h-[700px] w-[375px] overflow-hidden rounded-[2.5rem] border-[8px] border-gray-800 bg-white shadow-xl">
        <div
          className="h-full overflow-y-auto"
          style={{
            ...cssVars,
            backgroundColor: "var(--ln-color-bg)",
            color: "var(--ln-color-text)",
            fontFamily: "var(--ln-font-body)",
            fontSize: "var(--ln-font-size-base)",
            lineHeight: "var(--ln-line-height-body)",
            ...backgroundStyle,
          } as React.CSSProperties}
        >
          <div
            className="mx-auto"
            style={{
              maxWidth: "var(--ln-content-max-width)",
              paddingLeft: "var(--ln-page-px)",
              paddingRight: "var(--ln-page-px)",
              paddingTop: "var(--ln-page-py)",
              paddingBottom: "var(--ln-page-py)",
            }}
          >
            {/* Avatar + Bio */}
            <div className="mb-8 flex flex-col items-center text-center">
              {page.avatarUrl && (
                <div className="mb-4 h-16 w-16 overflow-hidden rounded-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={page.avatarUrl}
                    alt={page.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <h1
                style={{
                  fontFamily: "var(--ln-font-heading)",
                  fontWeight: "var(--ln-font-weight-heading)",
                  fontSize: `calc(var(--ln-font-size-base) * 1.4)`,
                  color: "var(--ln-color-text)",
                }}
              >
                {page.title}
              </h1>
              {page.bio && (
                <p
                  className="mt-2"
                  style={{
                    color: "var(--ln-color-text-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  {page.bio}
                </p>
              )}
            </div>

            {/* Blocks */}
            <div
              className={`flex flex-col ${template.layout === "left-aligned" ? "items-start" : "items-center"}`}
              style={{ gap: "var(--ln-block-gap)" }}
            >
              {sorted
                .filter((b) => b.isVisible)
                .map((block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))}
            </div>

            {/* Badge */}
            {!theme.hideBranding && (
              <div className="mt-8 text-center">
                <span
                  className="text-[10px]"
                  style={{ color: "var(--ln-color-text-muted)" }}
                >
                  Made with LinkNest
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
