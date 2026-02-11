"use client";

import type { InferSelectModel } from "drizzle-orm";
import type { pages, blocks as blocksSchema } from "@/lib/db/schema";
import type { ThemeTokens, BlockStyleOverrides } from "@/lib/templates/theme";
import { themeToCssVars, computeBlockResolvedStyle } from "@/lib/templates/theme";
import { getTemplate } from "@/lib/templates";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { AvatarFallback } from "@/components/ui/avatar-fallback";

type Page = InferSelectModel<typeof pages>;
type Block = InferSelectModel<typeof blocksSchema>;

interface LivePreviewProps {
  page: Page;
  blocks: Block[];
  theme: ThemeTokens;
}

function resolveBlockStyle(
  theme: ThemeTokens,
  block: Block,
): React.CSSProperties | undefined {
  const content = block.content as Record<string, unknown> | null;
  const overrides = content?.styleOverrides as BlockStyleOverrides | undefined;
  if (!overrides || Object.keys(overrides).length === 0) return undefined;
  return computeBlockResolvedStyle(theme, overrides) as React.CSSProperties;
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
              <div className="mb-4">
                <AvatarFallback
                  avatarUrl={page.avatarUrl}
                  name={page.title}
                  slug={page.slug}
                  size={80}
                />
              </div>
              <p
                className="mb-1 text-xs font-medium"
                style={{ color: "var(--ln-color-text-muted)" }}
              >
                @{page.slug}
              </p>
              <h1
                style={{
                  fontFamily: "var(--ln-font-heading)",
                  fontWeight: "var(--ln-font-weight-heading)",
                  fontSize: `calc(var(--ln-font-size-base) * 1.2)`,
                  color: "var(--ln-color-text)",
                }}
              >
                {page.title}
              </h1>
              {page.bio && (
                <p
                  className="mt-1"
                  style={{
                    color: "var(--ln-color-text-muted)",
                    fontSize: "0.8125rem",
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
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    resolvedStyle={resolveBlockStyle(theme, block)}
                  />
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
