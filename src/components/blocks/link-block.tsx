import type { InferSelectModel } from "drizzle-orm";
import type { blocks } from "@/lib/db/schema";

type Block = InferSelectModel<typeof blocks>;

interface LinkBlockProps {
  block: Block;
  resolvedStyle?: React.CSSProperties;
}

export function LinkBlock({ block, resolvedStyle }: LinkBlockProps) {
  if (!block.url) return null;

  // tel: and mailto: hand off to another app. Opening them in a new tab leaves
  // the visitor staring at a blank page behind the dialer or mail client — on
  // desktop it is simply a dead tab. Only http(s) destinations get _blank.
  const isExternalPage = /^https?:/i.test(block.url);

  const baseStyle: React.CSSProperties = {
    fontFamily: "var(--ln-font-body)",
    fontSize: "var(--ln-font-size-base)",
    color: "var(--ln-btn-text)",
    backgroundColor: "var(--ln-btn-bg)",
    borderRadius: "var(--ln-btn-radius)",
    padding: "var(--ln-btn-py) var(--ln-btn-px)",
    borderWidth: "var(--ln-btn-border-w)",
    borderColor: "var(--ln-btn-border-c)",
    borderStyle: "solid",
    boxShadow: "var(--ln-btn-shadow)",
    backdropFilter: "var(--ln-btn-backdrop)",
    WebkitBackdropFilter: "var(--ln-btn-backdrop)",
    // Two-tone focus ring. Deliberately NOT built from --ln-color-accent: on
    // several templates the accent is byte-identical to the button's resting
    // border (so focus would look the same as blur), and the accent is
    // user-editable, meaning a page owner could tune their own focus indicator
    // into invisibility. Text-on-background always contrasts by construction,
    // and the outer halo guarantees a visible edge whichever side it lands on.
    outlineColor: "var(--ln-color-text)",
  };

  return (
    <a
      href={block.url}
      {...(isExternalPage
        ? { target: "_blank", rel: "noopener noreferrer me" }
        : {})}
      data-link-id={block.id}
      className="block w-full text-center transition-transform hover:scale-[1.02] focus-visible:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[box-shadow:0_0_0_4px_var(--ln-color-bg)]"
      style={resolvedStyle ? { ...baseStyle, ...resolvedStyle } : baseStyle}
    >
      {block.label || block.url}
    </a>
  );
}
