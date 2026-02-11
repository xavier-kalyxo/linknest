"use client";

import { useCallback, useState } from "react";
import type { ThemeTokens } from "@/lib/templates/theme";
import {
  COLOR_PALETTES,
  SYSTEM_FONTS,
  GOOGLE_FONTS,
  FREE_BUTTON_STYLES,
  PRO_BUTTON_STYLES,
} from "@/lib/templates/theme";
import { TEMPLATES } from "@/lib/templates";
import { TemplateMiniPreview } from "./template-mini-preview";

interface ThemeEditorProps {
  pageId: string;
  theme: ThemeTokens;
  themeBase: ThemeTokens;
  userOverrides: Partial<ThemeTokens>;
  plan: "free" | "pro";
  templateId: string;
  previewMode: "effective" | "base";
  onPreviewModeChange: (mode: "effective" | "base") => void;
  onThemeChange: (updates: Partial<ThemeTokens>) => void;
  onTemplateChange: (templateId: string) => void;
  onResetOverrides: () => void;
}

export function ThemeEditor({
  pageId,
  theme,
  themeBase,
  userOverrides,
  plan,
  templateId,
  previewMode,
  onPreviewModeChange,
  onThemeChange,
  onTemplateChange,
  onResetOverrides,
}: ThemeEditorProps) {
  const buttonStyles = plan === "pro" ? PRO_BUTTON_STYLES : FREE_BUTTON_STYLES;
  const hasOverrides = Object.keys(userOverrides).length > 0;
  const [switchBanner, setSwitchBanner] = useState(false);

  const handleChange = useCallback(
    (updates: Partial<ThemeTokens>) => {
      onThemeChange(updates);
    },
    [onThemeChange],
  );

  return (
    <div className="space-y-6">
      {/* Preview mode toggle + Reset */}
      {hasOverrides && (
        <section className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-500">
            <input
              type="checkbox"
              checked={previewMode === "base"}
              onChange={(e) =>
                onPreviewModeChange(e.target.checked ? "base" : "effective")
              }
              className="h-3.5 w-3.5 rounded border-gray-300"
            />
            Preview theme defaults
          </label>
          <button
            onClick={onResetOverrides}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Reset all
          </button>
        </section>
      )}

      {/* Template switch banner */}
      {switchBanner && hasOverrides && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Theme updated. Your custom colors were preserved.{" "}
          <button
            onClick={() => {
              onResetOverrides();
              setSwitchBanner(false);
            }}
            className="font-medium underline"
          >
            Reset to Theme Defaults
          </button>
        </div>
      )}

      {/* Template picker */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">Template</h3>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((tmpl) => {
            const isLocked = tmpl.tier === "pro" && plan === "free";
            const isActive = tmpl.id === templateId;

            return (
              <button
                key={tmpl.id}
                disabled={isLocked}
                onClick={() => {
                  onTemplateChange(tmpl.id);
                  if (hasOverrides) setSwitchBanner(true);
                }}
                className={`relative rounded-lg border-2 p-3 text-left text-xs transition-colors ${
                  isActive
                    ? "border-black"
                    : isLocked
                      ? "cursor-not-allowed border-gray-100 opacity-60"
                      : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <TemplateMiniPreview template={tmpl} />
                <span className="mt-2 block font-medium">{tmpl.name}</span>
                {isLocked && (
                  <span className="absolute right-2 top-2 rounded bg-gray-800 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Color palette */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">Colors</h3>
        {plan === "free" ? (
          <div className="space-y-2">
            {COLOR_PALETTES.map((palette) => (
              <button
                key={palette.id}
                onClick={() => handleChange(palette.colors)}
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex gap-1">
                  {[
                    palette.colors.colorBackground,
                    palette.colors.colorPrimary,
                    palette.colors.colorSecondary,
                    palette.colors.colorAccent,
                  ].map((color, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-sm">{palette.name}</span>
              </button>
            ))}
            <p className="mt-2 text-xs text-gray-400">
              Upgrade to Pro for custom hex colors
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(
              [
                ["colorBackground", "Background"],
                ["colorSurface", "Surface"],
                ["colorPrimary", "Primary"],
                ["colorSecondary", "Secondary"],
                ["colorText", "Text"],
                ["colorTextMuted", "Muted Text"],
                ["colorAccent", "Accent"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-xs text-gray-600">{label}</label>
                <input
                  type="color"
                  value={theme[key]}
                  onChange={(e) => handleChange({ [key]: e.target.value })}
                  className="h-8 w-12 cursor-pointer rounded border border-gray-200"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Fonts */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">Fonts</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">Heading Font</label>
            <select
              value={theme.fontHeading}
              onChange={(e) =>
                handleChange({ fontHeading: e.target.value })
              }
              className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
            >
              <optgroup label="Default Fonts">
                {SYSTEM_FONTS.map((font) => (
                  <option key={font.id} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </optgroup>
              {plan === "pro" && (
                <optgroup label="Google Fonts">
                  {GOOGLE_FONTS.map((font) => (
                    <option key={font.id} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Body Font</label>
            <select
              value={theme.fontBody}
              onChange={(e) =>
                handleChange({ fontBody: e.target.value })
              }
              className="mt-1 w-full rounded border border-gray-200 px-2 py-1.5 text-sm"
            >
              <optgroup label="Default Fonts">
                {SYSTEM_FONTS.map((font) => (
                  <option key={font.id} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </optgroup>
              {plan === "pro" && (
                <optgroup label="Google Fonts">
                  {GOOGLE_FONTS.map((font) => (
                    <option key={font.id} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          {plan === "free" && (
            <p className="text-xs text-gray-400">
              Upgrade to Pro for 30+ Google Fonts
            </p>
          )}
        </div>
      </section>

      {/* Button style */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">Button Style</h3>
        <div className="grid grid-cols-3 gap-2">
          {buttonStyles.map((style) => (
            <button
              key={style}
              onClick={() => handleChange({ buttonStyle: style })}
              className={`rounded-lg border-2 px-3 py-2 text-xs font-medium capitalize transition-colors ${
                theme.buttonStyle === style
                  ? "border-black bg-black text-white"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </section>

      {/* Border radius */}
      <section>
        <h3 className={`mb-3 text-sm font-semibold ${theme.buttonStyle === "pill" ? "text-gray-300" : ""}`}>Corner Radius</h3>
        <input
          type="range"
          min={0}
          max={24}
          disabled={theme.buttonStyle === "pill"}
          value={theme.buttonRadius}
          onChange={(e) =>
            handleChange({ buttonRadius: Number(e.target.value) })
          }
          className="w-full disabled:opacity-40"
        />
        <div className={`flex justify-between text-xs ${theme.buttonStyle === "pill" ? "text-gray-300" : "text-gray-400"}`}>
          <span>Sharp</span>
          <span>{theme.buttonStyle === "pill" ? "Auto" : `${theme.buttonRadius}px`}</span>
          <span>Round</span>
        </div>
      </section>
    </div>
  );
}
