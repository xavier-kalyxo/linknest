"use client";

import { useCallback } from "react";
import type { InferSelectModel } from "drizzle-orm";
import type { pages } from "@/lib/db/schema";
import { updatePage } from "@/lib/actions/page";

type Page = InferSelectModel<typeof pages>;

interface PageSettingsProps {
  page: Page;
  onPageChange: (updates: Partial<Page>) => void;
}

export function PageSettings({ page, onPageChange }: PageSettingsProps) {
  const handleSave = useCallback(
    (field: string, value: string) => {
      onPageChange({ [field]: value } as Partial<Page>);
      updatePage({ pageId: page.id, [field]: value });
    },
    [page.id, onPageChange],
  );

  return (
    <div className="space-y-6">
      {/* Page info */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">Page Info</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">Title</label>
            <input
              type="text"
              value={page.title}
              onChange={(e) => handleSave("title", e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Bio</label>
            <textarea
              value={page.bio ?? ""}
              onChange={(e) => handleSave("bio", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              placeholder="Tell visitors about yourself..."
            />
          </div>
        </div>
      </section>

      {/* SEO */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">SEO</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">
              SEO Title{" "}
              <span className="text-gray-400">
                ({(page.seoTitle ?? "").length}/70)
              </span>
            </label>
            <input
              type="text"
              value={page.seoTitle ?? ""}
              onChange={(e) => handleSave("seoTitle", e.target.value)}
              maxLength={70}
              placeholder={page.title}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">
              SEO Description{" "}
              <span className="text-gray-400">
                ({(page.seoDescription ?? "").length}/160)
              </span>
            </label>
            <textarea
              value={page.seoDescription ?? ""}
              onChange={(e) => handleSave("seoDescription", e.target.value)}
              maxLength={160}
              rows={2}
              placeholder="A brief description for search engines..."
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Public URL */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">Public URL</h3>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <span className="text-sm text-gray-500">linknest.com/@{page.slug}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/@${page.slug}`,
              );
            }}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600"
          >
            Copy
          </button>
        </div>
      </section>
    </div>
  );
}
