"use client";

import { useCallback, useRef, useState } from "react";
import type { InferSelectModel } from "drizzle-orm";
import type { pages } from "@/lib/db/schema";
import type { ThemeTokens } from "@/lib/templates/theme";
import { updatePage, updateTheme as saveTheme } from "@/lib/actions/page";
import { AvatarFallback } from "@/components/ui/avatar-fallback";

type Page = InferSelectModel<typeof pages>;

interface PageSettingsProps {
  page: Page;
  plan: "free" | "pro";
  theme: ThemeTokens;
  onPageChange: (updates: Partial<Page>) => void;
  onThemeChange: (updates: Partial<ThemeTokens>) => void;
}

export function PageSettings({ page, plan, theme, onPageChange, onThemeChange }: PageSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleSave = useCallback(
    (field: string, value: string) => {
      onPageChange({ [field]: value } as Partial<Page>);
      updatePage({ pageId: page.id, [field]: value });
    },
    [page.id, onPageChange],
  );

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "avatar");

        const res = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const { url } = await res.json();
        onPageChange({ avatarUrl: url } as Partial<Page>);
        await updatePage({ pageId: page.id, avatarUrl: url });
      } catch (error) {
        console.error("Avatar upload error:", error);
      } finally {
        setUploading(false);
      }
    },
    [page.id, onPageChange],
  );

  const handleRemoveAvatar = useCallback(async () => {
    onPageChange({ avatarUrl: "" } as Partial<Page>);
    await updatePage({ pageId: page.id, avatarUrl: "" });
  }, [page.id, onPageChange]);

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">Avatar</h3>
        <div className="flex items-center gap-4">
          <div
            className="cursor-pointer"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <AvatarFallback
              avatarUrl={page.avatarUrl}
              name={page.title}
              slug={page.slug}
              size={64}
            />
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-left text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload image"}
            </button>
            {page.avatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                disabled={uploading}
                className="text-left text-xs text-gray-400 hover:text-red-500 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarUpload(file);
              e.target.value = "";
            }}
          />
        </div>
      </section>

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
          <span className="text-sm text-gray-500">linknest.click/@{page.slug}</span>
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

      {/* Branding */}
      {plan === "pro" && (
        <section>
          <h3 className="mb-3 text-sm font-semibold">Branding</h3>
          <label className="flex items-center justify-between gap-3">
            <div>
              <span className="text-sm">Hide &quot;Made with LinkNest&quot;</span>
              <p className="text-xs text-gray-400">
                Remove the LinkNest badge from your public page
              </p>
            </div>
            <input
              type="checkbox"
              checked={theme.hideBranding ?? false}
              onChange={(e) => {
                onThemeChange({ hideBranding: e.target.checked });
                saveTheme(page.id, { hideBranding: e.target.checked });
              }}
              className="h-4 w-4 rounded border-gray-300"
            />
          </label>
        </section>
      )}
    </div>
  );
}
