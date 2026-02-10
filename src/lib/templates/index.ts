// src/lib/templates/index.ts — Template definitions (code-defined, not in DB)

import type { ThemeTokens } from "./theme";

export type LayoutType =
  | "centered-stack"
  | "left-aligned"
  | "card-grid"
  | "bento-grid";

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: "minimal" | "bold" | "playful" | "professional" | "creative";
  tier: "free" | "pro";
  layout: LayoutType;
  defaultTheme: ThemeTokens;
}

// ─── Free Templates (6) ────────────────────────────────────────────────────

const cleanSlate: TemplateDefinition = {
  id: "clean-slate",
  name: "Clean Slate",
  description: "Minimal and universally clean. The perfect starting point.",
  category: "minimal",
  tier: "free",
  layout: "centered-stack",
  defaultTheme: {
    version: 1,
    colorBackground: "#FFFFFF",
    colorSurface: "#F8F9FA",
    colorPrimary: "#1A1A2E",
    colorSecondary: "#6C63FF",
    colorText: "#1A1A1A",
    colorTextMuted: "#6B7280",
    colorAccent: "#6C63FF",
    fontHeading: "Inter, system-ui, sans-serif",
    fontBody: "Inter, system-ui, sans-serif",
    fontSizeBase: 16,
    fontWeightHeading: 700,
    lineHeightBody: 1.5,
    spacingUnit: 8,
    contentMaxWidth: 680,
    blockGap: 16,
    pagePaddingX: 20,
    pagePaddingY: 40,
    borderRadius: 12,
    borderWidth: 0,
    borderColor: "#E5E7EB",
    buttonStyle: "filled",
    buttonRadius: 8,
    buttonPaddingX: 24,
    buttonPaddingY: 14,
    shadow: "none",
    backgroundEffect: "none",
  },
};

const midnight: TemplateDefinition = {
  id: "midnight",
  name: "Midnight",
  description: "Dark mode elegance for creators and musicians.",
  category: "bold",
  tier: "free",
  layout: "centered-stack",
  defaultTheme: {
    version: 1,
    colorBackground: "#0F0F1A",
    colorSurface: "#1A1A2E",
    colorPrimary: "#E0E0E0",
    colorSecondary: "#7C7CFF",
    colorText: "#E8E8E8",
    colorTextMuted: "#9CA3AF",
    colorAccent: "#7C7CFF",
    fontHeading: "Inter, system-ui, sans-serif",
    fontBody: "Inter, system-ui, sans-serif",
    fontSizeBase: 16,
    fontWeightHeading: 700,
    lineHeightBody: 1.5,
    spacingUnit: 8,
    contentMaxWidth: 680,
    blockGap: 16,
    pagePaddingX: 20,
    pagePaddingY: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2D2D44",
    buttonStyle: "outline",
    buttonRadius: 8,
    buttonPaddingX: 24,
    buttonPaddingY: 14,
    shadow: "none",
    backgroundEffect: "none",
  },
};

const coralReef: TemplateDefinition = {
  id: "coral-reef",
  name: "Coral Reef",
  description: "Warm gradients and rounded corners for lifestyle brands.",
  category: "playful",
  tier: "free",
  layout: "centered-stack",
  defaultTheme: {
    version: 1,
    colorBackground: "#FFF5F0",
    colorSurface: "#FFE8DB",
    colorPrimary: "#C2410C",
    colorSecondary: "#FB923C",
    colorText: "#431407",
    colorTextMuted: "#9A7568",
    colorAccent: "#FB923C",
    fontHeading: "Georgia, serif",
    fontBody: "Inter, system-ui, sans-serif",
    fontSizeBase: 16,
    fontWeightHeading: 700,
    lineHeightBody: 1.6,
    spacingUnit: 8,
    contentMaxWidth: 680,
    blockGap: 16,
    pagePaddingX: 24,
    pagePaddingY: 48,
    borderRadius: 16,
    borderWidth: 0,
    borderColor: "#FECACA",
    buttonStyle: "pill",
    buttonRadius: 999,
    buttonPaddingX: 28,
    buttonPaddingY: 14,
    shadow: "sm",
    backgroundEffect: "gradient",
    backgroundGradient:
      "linear-gradient(180deg, #FFF5F0 0%, #FFE8DB 100%)",
  },
};

const ink: TemplateDefinition = {
  id: "ink",
  name: "Ink",
  description: "High contrast and bold typography for writers.",
  category: "professional",
  tier: "free",
  layout: "left-aligned",
  defaultTheme: {
    version: 1,
    colorBackground: "#FAFAFA",
    colorSurface: "#FFFFFF",
    colorPrimary: "#000000",
    colorSecondary: "#374151",
    colorText: "#000000",
    colorTextMuted: "#6B7280",
    colorAccent: "#000000",
    fontHeading: "Georgia, serif",
    fontBody: "Georgia, serif",
    fontSizeBase: 17,
    fontWeightHeading: 700,
    lineHeightBody: 1.7,
    spacingUnit: 8,
    contentMaxWidth: 640,
    blockGap: 20,
    pagePaddingX: 24,
    pagePaddingY: 48,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#000000",
    buttonStyle: "outline",
    buttonRadius: 0,
    buttonPaddingX: 24,
    buttonPaddingY: 14,
    shadow: "none",
    backgroundEffect: "none",
  },
};

const pastelDream: TemplateDefinition = {
  id: "pastel-dream",
  name: "Pastel Dream",
  description: "Soft pastels and playful energy for Gen-Z creators.",
  category: "playful",
  tier: "free",
  layout: "centered-stack",
  defaultTheme: {
    version: 1,
    colorBackground: "#FDF4FF",
    colorSurface: "#FAE8FF",
    colorPrimary: "#A855F7",
    colorSecondary: "#EC4899",
    colorText: "#3B0764",
    colorTextMuted: "#7E47A0",
    colorAccent: "#EC4899",
    fontHeading: "system-ui, -apple-system, sans-serif",
    fontBody: "system-ui, -apple-system, sans-serif",
    fontSizeBase: 16,
    fontWeightHeading: 800,
    lineHeightBody: 1.5,
    spacingUnit: 8,
    contentMaxWidth: 680,
    blockGap: 14,
    pagePaddingX: 20,
    pagePaddingY: 40,
    borderRadius: 20,
    borderWidth: 0,
    borderColor: "#E9D5FF",
    buttonStyle: "pill",
    buttonRadius: 999,
    buttonPaddingX: 28,
    buttonPaddingY: 16,
    shadow: "sm",
    backgroundEffect: "gradient",
    backgroundGradient:
      "linear-gradient(135deg, #FDF4FF 0%, #FAE8FF 50%, #FFF1F2 100%)",
  },
};

const neonGlow: TemplateDefinition = {
  id: "neon-glow",
  name: "Neon Glow",
  description: "Dark with neon accents for DJs, gaming, and nightlife.",
  category: "bold",
  tier: "free",
  layout: "centered-stack",
  defaultTheme: {
    version: 1,
    colorBackground: "#09090B",
    colorSurface: "#18181B",
    colorPrimary: "#22D3EE",
    colorSecondary: "#A78BFA",
    colorText: "#F4F4F5",
    colorTextMuted: "#A1A1AA",
    colorAccent: "#22D3EE",
    fontHeading: "system-ui, -apple-system, sans-serif",
    fontBody: "system-ui, -apple-system, sans-serif",
    fontSizeBase: 16,
    fontWeightHeading: 800,
    lineHeightBody: 1.5,
    spacingUnit: 8,
    contentMaxWidth: 680,
    blockGap: 16,
    pagePaddingX: 20,
    pagePaddingY: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272A",
    buttonStyle: "outline",
    buttonRadius: 8,
    buttonPaddingX: 24,
    buttonPaddingY: 14,
    shadow: "md",
    backgroundEffect: "none",
  },
};

// ─── Premium Templates (2) ──────────────────────────────────────────────────

const glass: TemplateDefinition = {
  id: "glass",
  name: "Glass",
  description: "Glassmorphism with blur effects. Visually striking.",
  category: "creative",
  tier: "pro",
  layout: "card-grid",
  defaultTheme: {
    version: 1,
    colorBackground: "#1E1E2E",
    colorSurface: "rgba(255, 255, 255, 0.08)",
    colorPrimary: "#CDD6F4",
    colorSecondary: "#89B4FA",
    colorText: "#CDD6F4",
    colorTextMuted: "#9399B2",
    colorAccent: "#89B4FA",
    fontHeading: "Inter, system-ui, sans-serif",
    fontBody: "Inter, system-ui, sans-serif",
    fontSizeBase: 16,
    fontWeightHeading: 600,
    lineHeightBody: 1.5,
    spacingUnit: 8,
    contentMaxWidth: 720,
    blockGap: 16,
    pagePaddingX: 24,
    pagePaddingY: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    buttonStyle: "glass",
    buttonRadius: 12,
    buttonPaddingX: 24,
    buttonPaddingY: 14,
    shadow: "lg",
    backgroundEffect: "gradient",
    backgroundGradient:
      "linear-gradient(135deg, #1E1E2E 0%, #2D2B55 50%, #1E1E2E 100%)",
  },
};

const bentoBox: TemplateDefinition = {
  id: "bento-box",
  name: "Bento Box",
  description: "Bento grid layout with varied sizes. High wow factor.",
  category: "creative",
  tier: "pro",
  layout: "bento-grid",
  defaultTheme: {
    version: 1,
    colorBackground: "#FAFAF9",
    colorSurface: "#FFFFFF",
    colorPrimary: "#1C1917",
    colorSecondary: "#A16207",
    colorText: "#1C1917",
    colorTextMuted: "#78716C",
    colorAccent: "#A16207",
    fontHeading: "system-ui, -apple-system, sans-serif",
    fontBody: "system-ui, -apple-system, sans-serif",
    fontSizeBase: 16,
    fontWeightHeading: 700,
    lineHeightBody: 1.5,
    spacingUnit: 8,
    contentMaxWidth: 740,
    blockGap: 12,
    pagePaddingX: 20,
    pagePaddingY: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7E5E4",
    buttonStyle: "filled",
    buttonRadius: 12,
    buttonPaddingX: 20,
    buttonPaddingY: 12,
    shadow: "sm",
    backgroundEffect: "none",
  },
};

// ─── Exports ────────────────────────────────────────────────────────────────

export const TEMPLATES: TemplateDefinition[] = [
  cleanSlate,
  midnight,
  coralReef,
  ink,
  pastelDream,
  neonGlow,
  glass,
  bentoBox,
];

export const TEMPLATE_MAP = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t]),
) as Record<string, TemplateDefinition>;

export function getTemplate(id: string): TemplateDefinition {
  return TEMPLATE_MAP[id] ?? cleanSlate;
}

export function getDefaultTheme(templateId: string): ThemeTokens {
  return getTemplate(templateId).defaultTheme;
}
