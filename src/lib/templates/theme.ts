// src/lib/templates/theme.ts — ThemeTokens type definition and CSS pipeline

export interface ThemeTokens {
  version: 1;

  // Colors
  colorBackground: string;
  colorSurface: string;
  colorPrimary: string;
  colorSecondary: string;
  colorText: string;
  colorTextMuted: string;
  colorAccent: string;

  // Typography
  fontHeading: string;
  fontBody: string;
  fontSizeBase: number;
  fontWeightHeading: number;
  lineHeightBody: number;

  // Spacing & Layout
  spacingUnit: number;
  contentMaxWidth: number;
  blockGap: number;
  pagePaddingX: number;
  pagePaddingY: number;

  // Borders & Shapes
  borderRadius: number;
  borderWidth: number;
  borderColor: string;

  // Buttons
  buttonStyle:
    | "filled"
    | "outline"
    | "ghost"
    | "pill"
    | "shadow"
    | "neon"
    | "glass"
    | "minimal";
  buttonRadius: number;
  buttonPaddingX: number;
  buttonPaddingY: number;

  // Effects
  shadow: "none" | "sm" | "md" | "lg";
  backgroundEffect: "none" | "gradient" | "pattern" | "blur";
  backgroundGradient?: string;
}

/**
 * Convert ThemeTokens to CSS custom properties for injection on the root element.
 */
export function themeToCssVars(theme: ThemeTokens): Record<string, string> {
  return {
    "--ln-color-bg": theme.colorBackground,
    "--ln-color-surface": theme.colorSurface,
    "--ln-color-primary": theme.colorPrimary,
    "--ln-color-secondary": theme.colorSecondary,
    "--ln-color-text": theme.colorText,
    "--ln-color-text-muted": theme.colorTextMuted,
    "--ln-color-accent": theme.colorAccent,

    "--ln-font-heading": theme.fontHeading,
    "--ln-font-body": theme.fontBody,
    "--ln-font-size-base": `${theme.fontSizeBase}px`,
    "--ln-font-weight-heading": `${theme.fontWeightHeading}`,
    "--ln-line-height-body": `${theme.lineHeightBody}`,

    "--ln-spacing-unit": `${theme.spacingUnit}px`,
    "--ln-content-max-width": `${theme.contentMaxWidth}px`,
    "--ln-block-gap": `${theme.blockGap}px`,
    "--ln-page-px": `${theme.pagePaddingX}px`,
    "--ln-page-py": `${theme.pagePaddingY}px`,

    "--ln-border-radius": `${theme.borderRadius}px`,
    "--ln-border-width": `${theme.borderWidth}px`,
    "--ln-border-color": theme.borderColor,

    "--ln-btn-radius": `${theme.buttonRadius}px`,
    "--ln-btn-px": `${theme.buttonPaddingX}px`,
    "--ln-btn-py": `${theme.buttonPaddingY}px`,
  };
}

/**
 * Merge a partial theme update onto an existing theme.
 */
export function mergeTheme(
  base: ThemeTokens,
  partial: Partial<ThemeTokens>,
): ThemeTokens {
  return { ...base, ...partial, version: 1 };
}

// ─── Curated Color Palettes (Free Tier) ─────────────────────────────────────

export interface ColorPalette {
  id: string;
  name: string;
  colors: {
    colorBackground: string;
    colorSurface: string;
    colorPrimary: string;
    colorSecondary: string;
    colorText: string;
    colorTextMuted: string;
    colorAccent: string;
    borderColor: string;
  };
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "classic",
    name: "Classic",
    colors: {
      colorBackground: "#FFFFFF",
      colorSurface: "#F8F9FA",
      colorPrimary: "#1A1A2E",
      colorSecondary: "#6C63FF",
      colorText: "#1A1A1A",
      colorTextMuted: "#6B7280",
      colorAccent: "#6C63FF",
      borderColor: "#E5E7EB",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    colors: {
      colorBackground: "#0F0F1A",
      colorSurface: "#1A1A2E",
      colorPrimary: "#E0E0E0",
      colorSecondary: "#7C7CFF",
      colorText: "#E8E8E8",
      colorTextMuted: "#9CA3AF",
      colorAccent: "#7C7CFF",
      borderColor: "#2D2D44",
    },
  },
  {
    id: "warm",
    name: "Warm",
    colors: {
      colorBackground: "#FFF8F0",
      colorSurface: "#FFF0E0",
      colorPrimary: "#8B4513",
      colorSecondary: "#E07C4F",
      colorText: "#3D2B1F",
      colorTextMuted: "#8B7355",
      colorAccent: "#E07C4F",
      borderColor: "#E8D5C4",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: {
      colorBackground: "#F0F7FF",
      colorSurface: "#E0EFFF",
      colorPrimary: "#1E3A5F",
      colorSecondary: "#3B82F6",
      colorText: "#1A2A3A",
      colorTextMuted: "#64748B",
      colorAccent: "#3B82F6",
      borderColor: "#CBD5E1",
    },
  },
  {
    id: "rose",
    name: "Rose",
    colors: {
      colorBackground: "#FFF5F7",
      colorSurface: "#FFE4E8",
      colorPrimary: "#831843",
      colorSecondary: "#EC4899",
      colorText: "#2D1B28",
      colorTextMuted: "#9D7A8A",
      colorAccent: "#EC4899",
      borderColor: "#F3D1D8",
    },
  },
];

// ─── System Fonts (Free Tier) ───────────────────────────────────────────────

export const SYSTEM_FONTS = [
  { id: "inter", name: "Inter", value: "Inter, system-ui, sans-serif" },
  { id: "georgia", name: "Georgia", value: "Georgia, serif" },
  {
    id: "system",
    name: "System",
    value: "system-ui, -apple-system, sans-serif",
  },
  { id: "mono", name: "Mono", value: "ui-monospace, monospace" },
  {
    id: "helvetica",
    name: "Helvetica",
    value: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  },
  {
    id: "times",
    name: "Times",
    value: "'Times New Roman', Times, serif",
  },
];

// ─── Google Fonts (Pro Tier) ────────────────────────────────────────────────

export const GOOGLE_FONTS = [
  { id: "poppins", name: "Poppins", value: "'Poppins', sans-serif" },
  { id: "roboto", name: "Roboto", value: "'Roboto', sans-serif" },
  { id: "lato", name: "Lato", value: "'Lato', sans-serif" },
  { id: "open-sans", name: "Open Sans", value: "'Open Sans', sans-serif" },
  { id: "montserrat", name: "Montserrat", value: "'Montserrat', sans-serif" },
  { id: "raleway", name: "Raleway", value: "'Raleway', sans-serif" },
  { id: "playfair", name: "Playfair Display", value: "'Playfair Display', serif" },
  { id: "merriweather", name: "Merriweather", value: "'Merriweather', serif" },
  { id: "lora", name: "Lora", value: "'Lora', serif" },
  { id: "nunito", name: "Nunito", value: "'Nunito', sans-serif" },
  { id: "work-sans", name: "Work Sans", value: "'Work Sans', sans-serif" },
  { id: "rubik", name: "Rubik", value: "'Rubik', sans-serif" },
  { id: "karla", name: "Karla", value: "'Karla', sans-serif" },
  { id: "space-grotesk", name: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { id: "dm-sans", name: "DM Sans", value: "'DM Sans', sans-serif" },
  { id: "dm-serif", name: "DM Serif Display", value: "'DM Serif Display', serif" },
  { id: "josefin", name: "Josefin Sans", value: "'Josefin Sans', sans-serif" },
  { id: "quicksand", name: "Quicksand", value: "'Quicksand', sans-serif" },
  { id: "fira-sans", name: "Fira Sans", value: "'Fira Sans', sans-serif" },
  { id: "source-serif", name: "Source Serif 4", value: "'Source Serif 4', serif" },
  { id: "cabin", name: "Cabin", value: "'Cabin', sans-serif" },
  { id: "barlow", name: "Barlow", value: "'Barlow', sans-serif" },
  { id: "bitter", name: "Bitter", value: "'Bitter', serif" },
  { id: "libre-baskerville", name: "Libre Baskerville", value: "'Libre Baskerville', serif" },
  { id: "crimson-text", name: "Crimson Text", value: "'Crimson Text', serif" },
  { id: "inconsolata", name: "Inconsolata", value: "'Inconsolata', monospace" },
  { id: "jetbrains-mono", name: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { id: "overpass", name: "Overpass", value: "'Overpass', sans-serif" },
  { id: "archivo", name: "Archivo", value: "'Archivo', sans-serif" },
  { id: "sora", name: "Sora", value: "'Sora', sans-serif" },
];

// ─── Button Styles ──────────────────────────────────────────────────────────

export const FREE_BUTTON_STYLES = [
  "filled",
  "outline",
  "pill",
] as const;

export const PRO_BUTTON_STYLES = [
  "filled",
  "outline",
  "pill",
  "shadow",
  "neon",
  "glass",
] as const;
