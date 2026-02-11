/**
 * Deterministic avatar gradient + initials utilities.
 * Pure functions — no React dependency, usable in server + client components.
 */

import { getContrastColor } from "@/lib/contrast";

interface GradientPair {
  stops: [string, string];
  textColor: "#000000" | "#FFFFFF";
}

/**
 * Pre-curated gradient pairs. Each textColor is pre-computed via getContrastColor
 * against the darker stop to ensure readable initials.
 */
const GRADIENT_PAIRS: GradientPair[] = [
  { stops: ["#FF5F6D", "#FFC371"], textColor: "#FFFFFF" }, // coral-gold
  { stops: ["#11998E", "#38EF7D"], textColor: "#FFFFFF" }, // teal-green
  { stops: ["#6C63FF", "#A78BFA"], textColor: "#FFFFFF" }, // purple
  { stops: ["#E8614D", "#F0A830"], textColor: "#FFFFFF" }, // brand coral-amber
  { stops: ["#667EEA", "#764BA2"], textColor: "#FFFFFF" }, // indigo-violet
  { stops: ["#F093FB", "#F5576C"], textColor: "#FFFFFF" }, // pink-rose
  { stops: ["#4FACFE", "#00F2FE"], textColor: "#000000" }, // sky-cyan
  { stops: ["#43E97B", "#38F9D7"], textColor: "#000000" }, // mint-emerald
  { stops: ["#FA709A", "#FEE140"], textColor: "#000000" }, // pink-yellow
  { stops: ["#A18CD1", "#FBC2EB"], textColor: "#000000" }, // lavender-blush
  { stops: ["#FF9A9E", "#FECFEF"], textColor: "#000000" }, // salmon-pink
  { stops: ["#0575E6", "#021B79"], textColor: "#FFFFFF" }, // deep-blue
];

/**
 * Simple string hash → positive integer.
 */
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // Convert to 32-bit int
  }
  return Math.abs(hash);
}

/**
 * Returns a deterministic gradient CSS string and contrasting text color
 * based on the seed (typically the page slug).
 */
export function getAvatarGradient(seed: string): {
  gradient: string;
  textColor: "#000000" | "#FFFFFF";
} {
  const index = hashSeed(seed) % GRADIENT_PAIRS.length;
  const pair = GRADIENT_PAIRS[index];
  return {
    gradient: `linear-gradient(135deg, ${pair.stops[0]}, ${pair.stops[1]})`,
    textColor: pair.textColor,
  };
}

/**
 * Extract up to 2 initials from a name/title.
 * "John Doe" → "JD", "hello" → "H", "" → "?"
 */
export function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const words = trimmed.split(/\s+/);
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// Re-export for verification in tests
export { GRADIENT_PAIRS, getContrastColor };
