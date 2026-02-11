import { hasFeature, type PlanId } from "@/lib/entitlements";
import {
  VALID_VARIANTS,
  ALL_BUTTON_STYLES,
  type BlockStyleOverrides,
} from "@/lib/templates/theme";

export const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
export const VALID_SHADOWS = new Set(["none", "sm", "md"]);

export function validateStyleOverrides(
  overrides: BlockStyleOverrides,
  plan: PlanId,
): string | null {
  // Shape validation (all plans)
  if (overrides.variant && !(VALID_VARIANTS as readonly string[]).includes(overrides.variant)) {
    return "Invalid variant";
  }
  if (overrides.bgColor && !HEX_COLOR_RE.test(overrides.bgColor)) {
    return "Invalid background color format";
  }
  if (overrides.textColor && !HEX_COLOR_RE.test(overrides.textColor)) {
    return "Invalid text color format";
  }
  if (overrides.borderRadius !== undefined && (overrides.borderRadius < 0 || overrides.borderRadius > 32 || !Number.isInteger(overrides.borderRadius))) {
    return "Border radius must be 0-32";
  }
  if (overrides.shadow && !VALID_SHADOWS.has(overrides.shadow)) {
    return "Invalid shadow value";
  }
  if (overrides.buttonStyle && !(ALL_BUTTON_STYLES as readonly string[]).includes(overrides.buttonStyle)) {
    return "Invalid button style";
  }

  // Plan gating
  if (!hasFeature(plan, "custom_colors")) {
    const proKeys = Object.keys(overrides).filter((k) => k !== "variant");
    if (proKeys.length > 0) {
      return "Block style customization requires a Pro plan";
    }
  }

  return null;
}
