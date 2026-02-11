"use client";

import { useState, useCallback } from "react";
import type { InferSelectModel } from "drizzle-orm";
import type { pages, blocks as blocksSchema } from "@/lib/db/schema";
import type { ThemeTokens } from "@/lib/templates/theme";
import { getTemplate } from "@/lib/templates";
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
  const template = getTemplate(page.templateId);
  const savedTheme = (page.theme ?? {}) as Partial<ThemeTokens>;
  const fullTheme = { ...template.defaultTheme, ...savedTheme } as ThemeTokens;

  const [pageState, setPageState] = useState(page);
  const [blocksState, setBlocksState] = useState(initialBlocks);
  const [theme, setTheme] = useState<ThemeTokens>(fullTheme);
  const [activeTab, setActiveTab] = useState<"blocks" | "style" | "settings">(
    "blocks",
  );

  const handlePageUpdate = useCallback(
    (updates: Partial<Page>) => {
      setPageState((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const handleThemeUpdate = useCallback(
    (updates: Partial<ThemeTokens>) => {
      setTheme((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

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
              />
            )}
            {activeTab === "style" && (
              <ThemeEditor
                pageId={page.id}
                theme={theme}
                plan={plan}
                templateId={pageState.templateId}
                onThemeChange={handleThemeUpdate}
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
          <LivePreview page={pageState} blocks={blocksState} theme={theme} />
        </div>
      </div>

      {/* Mobile preview overlay */}
      <MobilePreviewOverlay page={pageState} blocks={blocksState} theme={theme} />
    </div>
  );
}
