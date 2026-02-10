import type { InferSelectModel } from "drizzle-orm";
import type { blocks } from "@/lib/db/schema";
import { LinkBlock } from "./link-block";
import { HeaderBlock } from "./header-block";
import { TextBlock } from "./text-block";
import { DividerBlock } from "./divider-block";
import { ImageBlock } from "./image-block";

type Block = InferSelectModel<typeof blocks>;

export function BlockRenderer({ block }: { block: Block }) {
  if (!block.isVisible) return null;

  switch (block.type) {
    case "link":
      return <LinkBlock block={block} />;
    case "header":
      return <HeaderBlock block={block} />;
    case "text":
      return <TextBlock block={block} />;
    case "divider":
      return <DividerBlock />;
    case "image":
      return <ImageBlock block={block} />;
    default:
      return null;
  }
}
