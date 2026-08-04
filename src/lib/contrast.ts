/** WCAG AA minimum contrast ratio for normal-size body text. */
export const WCAG_AA_NORMAL = 4.5;

const toLinear = (c: number) =>
  c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

/**
 * Parse a CSS colour into [r,g,b] 0-255, or null if unsupported.
 *
 * Handles 3- and 6-digit hex plus rgb()/rgba() — the Glass template stores
 * colorSurface as "rgba(255, 255, 255, 0.08)", so a hex-only parser throws NaN
 * on real product data.
 */
export function parseColor(input: string): [number, number, number] | null {
  const value = input.trim();

  const rgb = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const parts = rgb[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null;
    return [parts[0], parts[1], parts[2]];
  }

  const hex = value.replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;

  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** WCAG relative luminance, or null if the colour can't be parsed. */
export function relativeLuminance(color: string): number | null {
  const rgb = parseColor(color);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((c) => toLinear(c / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours (1–21), or null if unparseable. */
export function contrastRatio(a: string, b: string): number | null {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la === null || lb === null) return null;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Every colour stop in a CSS gradient string. */
export function gradientStops(gradient: string): string[] {
  return [
    ...gradient.matchAll(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g),
  ].map((m) => m[0]);
}

/**
 * Returns "#000000" or "#FFFFFF" depending on which has better contrast
 * against the given hex background color.
 *
 * Uses the WCAG relative luminance formula.
 */
export function getContrastColor(hexBg: string): "#000000" | "#FFFFFF" {
  const luminance = relativeLuminance(hexBg) ?? 0;

  // Threshold ~0.179 gives best split for AA contrast
  return luminance > 0.179 ? "#000000" : "#FFFFFF";
}
