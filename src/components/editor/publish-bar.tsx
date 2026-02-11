"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { InferSelectModel } from "drizzle-orm";
import type { pages } from "@/lib/db/schema";
import type { ThemeTokens } from "@/lib/templates/theme";
import { publishPage, unpublishPage, updateTheme } from "@/lib/actions/page";
import { getPublicPageUrl } from "@/lib/slugs";
import { ShareModal } from "./share-modal";

type Page = InferSelectModel<typeof pages>;

interface PublishBarProps {
  page: Page;
  theme: ThemeTokens;
  onPageChange: (updates: Partial<Page>) => void;
}

export function PublishBar({ page, theme, onPageChange }: PublishBarProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handlePublish = useCallback(async () => {
    const wasPublished = page.isPublished;
    setIsPublishing(true);
    try {
      // Save current theme state before publishing
      const themeResult = await updateTheme(page.id, theme);
      if (themeResult.error) {
        alert(themeResult.error);
        return;
      }

      const result = await publishPage(page.id);
      if (result.error) {
        alert(result.error);
        return;
      }

      // Update client state so button switches to "Update"
      onPageChange({ isPublished: true, publishedAt: new Date() });

      // Confetti on first publish
      if (!wasPublished) {
        import("canvas-confetti").then((confetti) => {
          confetti.default({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        });
        // Auto-open share modal on first publish
        setShowShare(true);
      }

      router.refresh();
    } catch (err) {
      alert("Something went wrong. Please try again.");
      console.error("Publish error:", err);
    } finally {
      setIsPublishing(false);
    }
  }, [page.id, page.isPublished, theme, router, onPageChange]);

  const handleUnpublish = useCallback(async () => {
    await unpublishPage(page.id);
    onPageChange({ isPublished: false });
    router.refresh();
  }, [page.id, router, onPageChange]);

  return (
    <>
      <div className="flex items-center gap-3">
        <a
          href={`/dashboard/preview/${page.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Preview
        </a>
        {page.isPublished && (
          <>
            <button
              onClick={() => setShowShare(true)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Share
            </button>
            <a
              href={getPublicPageUrl(page.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              View &rarr;
            </a>
            <button
              onClick={handleUnpublish}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50"
            >
              Unpublish
            </button>
          </>
        )}
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="rounded-lg bg-black px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {isPublishing
            ? "Publishing..."
            : page.isPublished
              ? "Update"
              : "Publish"}
        </button>
      </div>

      <ShareModal
        slug={page.slug}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />
    </>
  );
}
