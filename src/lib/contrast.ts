/**
 * Returns "#000000" or "#FFFFFF" depending on which has better contrast
 * against the given hex background color.
 *
 * Uses the WCAG relative luminance formula.
 */
export function getContrastColor(hexBg: string): "#000000" | "#FFFFFF" {
  const hex = hexBg.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  // sRGB → linear
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  // Threshold ~0.179 gives best split for AA contrast
  return luminance > 0.179 ? "#000000" : "#FFFFFF";
}
