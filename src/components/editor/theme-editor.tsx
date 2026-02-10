"use client";

import { useCallback } from "react";
import type { ThemeTokens } from "@/lib/templates/theme";
import {
  COLOR_PALETTES,
  SYSTEM_FONTS,
  GOOGLE_FONTS,
  FREE_BUTTON_STYLES,
  PRO_BUTTON_STYLES,
} from "@/lib/templates/theme";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import { updateTheme as saveTheme } from "@/lib/actions/page";

interface ThemeEditorProps {
  pageId: string;
  theme: ThemeTokens;
  plan: "free" | "pro";
  templateId: string;
  onThemeChange: (updates: Partial<ThemeTokens>) => void;
}

export function ThemeEditor({
  pageId,
  theme,
  plan,
  templateId,
  onThemeChange,
}: ThemeEditorProps) {
  const buttonStyles = plan === "pro" ? PRO_BUTTON_STYLES : FREE_BUTTON_STYLES;
  const allFonts = plan === "pro" ? [...SYSTEM_FONTS, ...GOOGLE_FONTS] : SYSTEM_FONTS;

  const handleChange = useCallback(
    (updates: Partial<ThemeTokens>) => {
      onThemeChange(updates);
      // Debounced save — for now, save immediately
      saveTheme(pageId, updates);
    },
    [pageId, onThemeChange],
  );

  return (
    <div className="space-y-6">
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
                  // Switch template: update layout tokens from template defaults
                  // but preserve user's color customizations
                  const defaults = tmpl.defaultTheme;
                  handleChange({
                    borderRadius: defaults.borderRadius,
                    buttonStyle: defaults.buttonStyle,
                    buttonRadius: defaults.buttonRadius,
                    shadow: defaults.shadow,
                    backgroundEffect: defaults.backgroundEffect,
                    backgroundGradient: defaults.backgroundGradient,
                  });
                }}
                className={`relative rounded-lg border-2 p-3 text-left text-xs transition-colors ${
                  isActive
                    ? "border-black"
                    : isLocked
                      ? "cursor-not-allowed border-gray-100 opacity-60"
                      : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div
                  className="mb-2 h-8 w-full rounded"
                  style={{
                    backgroundColor: tmpl.defaultTheme.colorBackground,
                    border: `1px solid ${tmpl.defaultTheme.borderColor}`,
                  }}
                />
                <span className="font-medium">{tmpl.name}</span>
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
              {allFonts.map((font) => (
                <option key={font.id} value={font.value}>
                  {font.name}
                </option>
              ))}
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
              {allFonts.map((font) => (
                <option key={font.id} value={font.value}>
                  {font.name}
                </option>
              ))}
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
        <h3 className="mb-3 text-sm font-semibold">Corner Radius</h3>
        <input
          type="range"
          min={0}
          max={24}
          value={theme.borderRadius}
          onChange={(e) =>
            handleChange({ borderRadius: Number(e.target.value) })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>Sharp</span>
          <span>{theme.borderRadius}px</span>
          <span>Round</span>
        </div>
      </section>
    </div>
  );
}
