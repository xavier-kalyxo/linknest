import type { InferSelectModel } from "drizzle-orm";
import type { blocks } from "@/lib/db/schema";

type Block = InferSelectModel<typeof blocks>;

export function HeaderBlock({ block }: { block: Block }) {
  return (
    <h2
      className="w-full"
      style={{
        fontFamily: "var(--ln-font-heading)",
        fontWeight: "var(--ln-font-weight-heading)",
        fontSize: `calc(var(--ln-font-size-base) * 1.25)`,
        color: "var(--ln-color-text)",
        lineHeight: 1.3,
      }}
    >
      {block.label || "Heading"}
    </h2>
  );
}
