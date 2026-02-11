import type { InferSelectModel } from "drizzle-orm";
import type { blocks } from "@/lib/db/schema";

type Block = InferSelectModel<typeof blocks>;

export function LinkBlock({ block }: { block: Block }) {
  if (!block.url) return null;

  return (
    <a
      href={block.url}
      target="_blank"
      rel="noopener noreferrer me"
      data-link-id={block.id}
      className="block w-full text-center transition-transform hover:scale-[1.02]"
      style={{
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
      }}
    >
      {block.label || block.url}
    </a>
  );
}
