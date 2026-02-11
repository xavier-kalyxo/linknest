import type { InferSelectModel } from "drizzle-orm";
import type { blocks as blocksSchema, pages } from "@/lib/db/schema";
import type { LayoutType } from "@/lib/templates";
import type { ThemeTokens, BlockStyleOverrides } from "@/lib/templates/theme";
import { themeToCssVars, computeBlockResolvedStyle } from "@/lib/templates/theme";
import { getTemplate } from "@/lib/templates";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { AvatarFallback } from "@/components/ui/avatar-fallback";

type Page = InferSelectModel<typeof pages>;
type Block = InferSelectModel<typeof blocksSchema>;

interface TemplateRendererProps {
  page: Page;
  blocks: Block[];
  showBadge?: boolean;
  showReport?: boolean;
  isPreview?: boolean;
}

export function TemplateRenderer({
  page,
  blocks,
  showBadge = true,
  showReport = false,
  isPreview = false,
}: TemplateRendererProps) {
  const template = getTemplate(page.templateId);
  const theme = {
    ...template.defaultTheme,
    ...(page.theme as Partial<ThemeTokens>),
  } as ThemeTokens;
  const cssVars = themeToCssVars(theme);
  const layout = template.layout;

  const backgroundStyle: React.CSSProperties = {};
  if (theme.backgroundEffect === "gradient" && theme.backgroundGradient) {
    backgroundStyle.backgroundImage = theme.backgroundGradient;
  }

  return (
    <div
      className="min-h-screen"
      style={{
        ...cssVars,
        backgroundColor: "var(--ln-color-bg)",
        color: "var(--ln-color-text)",
        fontFamily: "var(--ln-font-body)",
        fontSize: "var(--ln-font-size-base)",
        lineHeight: "var(--ln-line-height-body)",
        ...backgroundStyle,
        ...(isPreview ? { pointerEvents: "none" as const } : {}),
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
        <PageHeader page={page} />

        {/* Blocks */}
        <BlockLayout layout={layout} blocks={blocks} theme={theme} />

        {/* Badge + Report */}
        <footer className="mt-16 flex flex-col items-center gap-2 text-center">
          {showBadge && (
            <a
              href="/"
              className="text-xs transition-opacity hover:opacity-80"
              style={{ color: "var(--ln-color-text-muted)" }}
            >
              Made with LinkNest
            </a>
          )}
          {showReport && (
            <a
              href={`/report/${page.id}`}
              className="text-[10px] transition-opacity hover:opacity-80"
              style={{ color: "var(--ln-color-text-muted)", opacity: 0.5 }}
            >
              Report this page
            </a>
          )}
        </footer>
      </div>
    </div>
  );
}

function PageHeader({ page }: { page: Page }) {
  return (
    <div className="mb-10 flex flex-col items-center text-center">
      <div className="mb-4">
        <AvatarFallback
          avatarUrl={page.avatarUrl}
          name={page.title}
          slug={page.slug}
          size={96}
        />
      </div>
      <p
        className="mb-1 text-sm font-medium"
        style={{ color: "var(--ln-color-text-muted)" }}
      >
        @{page.slug}
      </p>
      <h1
        style={{
          fontFamily: "var(--ln-font-heading)",
          fontWeight: "var(--ln-font-weight-heading)",
          fontSize: `calc(var(--ln-font-size-base) * 1.25)`,
          color: "var(--ln-color-text)",
        }}
      >
        {page.title}
      </h1>
      {page.bio && (
        <p
          className="mt-1 max-w-md"
          style={{ color: "var(--ln-color-text-muted)" }}
        >
          {page.bio}
        </p>
      )}
    </div>
  );
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

function BlockLayout({
  layout,
  blocks,
  theme,
}: {
  layout: LayoutType;
  blocks: Block[];
  theme: ThemeTokens;
}) {
  const sorted = [...blocks].sort((a, b) => a.position - b.position);

  if (layout === "left-aligned") {
    return (
      <div
        className="flex flex-col"
        style={{ gap: "var(--ln-block-gap)", alignItems: "flex-start" }}
      >
        {sorted.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            resolvedStyle={resolveBlockStyle(theme, block)}
          />
        ))}
      </div>
    );
  }

  if (layout === "card-grid" || layout === "bento-grid") {
    return (
      <div
        className="flex flex-col items-center"
        style={{ gap: "var(--ln-block-gap)" }}
      >
        {sorted.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            resolvedStyle={resolveBlockStyle(theme, block)}
          />
        ))}
      </div>
    );
  }

  // Default: centered-stack
  return (
    <div
      className="flex flex-col items-center"
      style={{ gap: "var(--ln-block-gap)" }}
    >
      {sorted.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          resolvedStyle={resolveBlockStyle(theme, block)}
        />
      ))}
    </div>
  );
}
