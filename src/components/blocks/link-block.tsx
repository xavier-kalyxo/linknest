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
        color: "var(--ln-color-primary)",
        backgroundColor: "var(--ln-color-surface)",
        borderRadius: "var(--ln-btn-radius)",
        padding: "var(--ln-btn-py) var(--ln-btn-px)",
        borderWidth: "var(--ln-border-width)",
        borderColor: "var(--ln-border-color)",
        borderStyle: "solid",
      }}
    >
      {block.label || block.url}
    </a>
  );
}
