"use client";

import { useState, useCallback, useMemo } from "react";
import type { InferSelectModel } from "drizzle-orm";
import type { pages, blocks as blocksSchema } from "@/lib/db/schema";
import type { ThemeTokens } from "@/lib/templates/theme";
import { getTemplate } from "@/lib/templates";
import { updatePage, updateTheme as saveTheme, resetTheme } from "@/lib/actions/page";
import { BlockList } from "./block-list";
import { PageSettings } from "./page-settings";
import { ThemeEditor } from "./theme-editor";
import { LivePreview } from "./live-preview";
import { PublishBar } from "./publish-bar";
import { MobilePreviewOverlay } from "./mobile-preview-overlay";
import Link from "next/link";

type Page = InferSelectModel<typeof pages>;
type Block = InferSelectModel<typeof blocksSchema>;

interface EditorShellProps {
  page: Page;
  initialBlocks: Block[];
  plan: "free" | "pro";
}

export function EditorShell({ page, initialBlocks, plan }: EditorShellProps) {
  const [pageState, setPageState] = useState(page);
  const [blocksState, setBlocksState] = useState(initialBlocks);
  const [activeTab, setActiveTab] = useState<"blocks" | "style" | "settings">(
    "blocks",
  );
  const [previewMode, setPreviewMode] = useState<"effective" | "base">(
    "effective",
  );

  // Derive theme from pageState — single source of truth (no separate theme state)
  const template = useMemo(
    () => getTemplate(pageState.templateId),
    [pageState.templateId],
  );
  const userOverrides = (pageState.theme ?? {}) as Partial<ThemeTokens>;
  const theme = useMemo(
    () => ({ ...template.defaultTheme, ...userOverrides }) as ThemeTokens,
    [template.defaultTheme, userOverrides],
  );
  const displayTheme = previewMode === "base" ? template.defaultTheme : theme;

  const handlePageUpdate = useCallback(
    (updates: Partial<Page>) => {
      setPageState((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const handleThemeUpdate = useCallback(
    async (updates: Partial<ThemeTokens>) => {
      const prev = pageState;
      const newOverrides = { ...userOverrides, ...updates };
      setPageState((p) => ({ ...p, theme: newOverrides as Record<string, unknown> }));
      try {
        await saveTheme(pageState.id, updates);
      } catch {
        setPageState(prev);
      }
    },
    [pageState, userOverrides],
  );

  const handleTemplateChange = useCallback(
    async (templateId: string) => {
      const prev = pageState;
      setPageState((p) => ({ ...p, templateId }));
      try {
        await updatePage({ pageId: pageState.id, templateId });
      } catch {
        setPageState(prev);
      }
    },
    [pageState],
  );

  const handleResetOverrides = useCallback(async () => {
    const prev = pageState;
    setPageState((p) => ({ ...p, theme: {} as Record<string, unknown> }));
    try {
      await resetTheme(pageState.id);
    } catch {
      setPageState(prev);
    }
  }, [pageState]);

  const handleBlocksUpdate = useCallback((newBlocks: Block[]) => {
    setBlocksState(newBlocks);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            &larr; Back
          </Link>
          <span className="text-sm font-medium">{pageState.title}</span>
        </div>
        <PublishBar page={pageState} theme={theme} onPageChange={handlePageUpdate} />
      </header>

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — editing controls */}
        <div className="flex w-full flex-col overflow-y-auto border-r border-gray-200 bg-white md:w-[420px]">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {(["blocks", "style", "settings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-black text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "blocks" && (
              <BlockList
                pageId={page.id}
                blocks={blocksState}
                onBlocksChange={handleBlocksUpdate}
                plan={plan}
                theme={theme}
              />
            )}
            {activeTab === "style" && (
              <ThemeEditor
                pageId={page.id}
                theme={theme}
                themeBase={template.defaultTheme}
                userOverrides={userOverrides}
                plan={plan}
                templateId={pageState.templateId}
                previewMode={previewMode}
                onPreviewModeChange={setPreviewMode}
                onThemeChange={handleThemeUpdate}
                onTemplateChange={handleTemplateChange}
                onResetOverrides={handleResetOverrides}
              />
            )}
            {activeTab === "settings" && (
              <PageSettings
                page={pageState}
                plan={plan}
                theme={theme}
                onPageChange={handlePageUpdate}
                onThemeChange={handleThemeUpdate}
              />
            )}
          </div>
        </div>

        {/* Right panel — live preview */}
        <div className="hidden flex-1 items-center justify-center bg-gray-100 p-8 md:flex">
          <LivePreview page={pageState} blocks={blocksState} theme={displayTheme} />
        </div>
      </div>

      {/* Mobile preview overlay */}
      <MobilePreviewOverlay page={pageState} blocks={blocksState} theme={displayTheme} />
    </div>
  );
}
