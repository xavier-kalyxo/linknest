import type { InferSelectModel } from "drizzle-orm";
import type { blocks } from "@/lib/db/schema";

type Block = InferSelectModel<typeof blocks>;

export function ImageBlock({ block }: { block: Block }) {
  const content = block.content as { imageUrl?: string; alt?: string } | null;
  const imageUrl = content?.imageUrl || block.url;
  const alt = content?.alt || block.label || "";

  if (!imageUrl) return null;

  return (
    <div className="w-full overflow-hidden" style={{ borderRadius: "var(--ln-border-radius)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={alt}
        className="h-auto w-full"
        loading="lazy"
      />
    </div>
  );
}
