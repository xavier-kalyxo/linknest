import type { InferSelectModel } from "drizzle-orm";
import type { blocks as blocksSchema, pages } from "@/lib/db/schema";
import type { LayoutType } from "@/lib/templates";
import type { ThemeTokens } from "@/lib/templates/theme";
import { themeToCssVars } from "@/lib/templates/theme";
import { getTemplate } from "@/lib/templates";
import { BlockRenderer } from "@/components/blocks/block-renderer";

type Page = InferSelectModel<typeof pages>;
type Block = InferSelectModel<typeof blocksSchema>;

interface TemplateRendererProps {
  page: Page;
  blocks: Block[];
  showBadge?: boolean;
  showReport?: boolean;
}

export function TemplateRenderer({
  page,
  blocks,
  showBadge = true,
  showReport = false,
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
        <BlockLayout layout={layout} blocks={blocks} />

        {/* Badge + Report */}
        <footer className="mt-12 flex flex-col items-center gap-2 text-center">
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
    <div className="mb-8 flex flex-col items-center text-center">
      {page.avatarUrl && (
        <div
          className="mb-4 h-20 w-20 overflow-hidden rounded-full"
          style={{ borderWidth: "var(--ln-border-width)", borderColor: "var(--ln-border-color)", borderStyle: "solid" }}
        >
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
          fontSize: `calc(var(--ln-font-size-base) * 1.5)`,
          color: "var(--ln-color-text)",
        }}
      >
        {page.title}
      </h1>
      {page.bio && (
        <p
          className="mt-2 max-w-md"
          style={{ color: "var(--ln-color-text-muted)" }}
        >
          {page.bio}
        </p>
      )}
    </div>
  );
}

function BlockLayout({
  layout,
  blocks,
}: {
  layout: LayoutType;
  blocks: Block[];
}) {
  const sorted = [...blocks].sort((a, b) => a.position - b.position);

  if (layout === "left-aligned") {
    return (
      <div
        className="flex flex-col"
        style={{ gap: "var(--ln-block-gap)", alignItems: "flex-start" }}
      >
        {sorted.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    );
  }

  if (layout === "card-grid") {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2"
        style={{ gap: "var(--ln-block-gap)" }}
      >
        {sorted.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </div>
    );
  }

  if (layout === "bento-grid") {
    return (
      <div
        className="grid grid-cols-2 sm:grid-cols-3"
        style={{ gap: "var(--ln-block-gap)" }}
      >
        {sorted.map((block, i) => (
          <div
            key={block.id}
            className={i === 0 ? "col-span-2 sm:col-span-2" : ""}
          >
            <BlockRenderer block={block} />
          </div>
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
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}
