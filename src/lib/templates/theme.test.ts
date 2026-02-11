import { describe, it, expect } from "vitest";
import { computeBlockResolvedStyle, type BlockStyleOverrides } from "./theme";
import type { ThemeTokens } from "./theme";

// Minimal theme fixture for testing
const theme: ThemeTokens = {
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
  pagePaddingY: 48,
  borderRadius: 12,
  borderWidth: 0,
  borderColor: "#E5E7EB",
  buttonStyle: "filled",
  buttonRadius: 8,
  buttonPaddingX: 24,
  buttonPaddingY: 16,
  shadow: "none",
  backgroundEffect: "none",
};

describe("computeBlockResolvedStyle", () => {
  it("returns empty object for empty overrides", () => {
    expect(computeBlockResolvedStyle(theme, {} as BlockStyleOverrides)).toEqual(
      {},
    );
  });

  it("resolves 'primary' variant from theme", () => {
    const result = computeBlockResolvedStyle(theme, { variant: "primary" });
    expect(result.backgroundColor).toBe(theme.colorSurface);
    expect(result.color).toBe(theme.colorPrimary);
  });

  it("resolves 'secondary' variant with tinted background", () => {
    const result = computeBlockResolvedStyle(theme, { variant: "secondary" });
    expect(result.backgroundColor).toBe(theme.colorSecondary + "20");
    expect(result.color).toBe(theme.colorText);
  });

  it("resolves 'outline' variant with border", () => {
    const result = computeBlockResolvedStyle(theme, { variant: "outline" });
    expect(result.backgroundColor).toBe("transparent");
    expect(result.borderWidth).toBe("1px");
    expect(result.borderColor).toBe(theme.borderColor);
  });

  it("resolves 'subtle' variant", () => {
    const result = computeBlockResolvedStyle(theme, { variant: "subtle" });
    expect(result.backgroundColor).toBe(theme.colorBackground);
    expect(result.color).toBe(theme.colorTextMuted);
  });

  it("auto-contrast: bgColor without textColor flips text to white on dark bg", () => {
    const result = computeBlockResolvedStyle(theme, { bgColor: "#000000" });
    expect(result.backgroundColor).toBe("#000000");
    expect(result.color).toBe("#FFFFFF");
  });

  it("auto-contrast: bgColor without textColor flips text to black on light bg", () => {
    const result = computeBlockResolvedStyle(theme, { bgColor: "#FFFFFF" });
    expect(result.backgroundColor).toBe("#FFFFFF");
    expect(result.color).toBe("#000000");
  });

  it("does not auto-flip when both bgColor and textColor are set", () => {
    const result = computeBlockResolvedStyle(theme, {
      bgColor: "#000000",
      textColor: "#FF0000",
    });
    expect(result.backgroundColor).toBe("#000000");
    expect(result.color).toBe("#FF0000");
  });

  it("applies borderRadius as px string", () => {
    const result = computeBlockResolvedStyle(theme, { borderRadius: 16 });
    expect(result.borderRadius).toBe("16px");
  });

  it("applies shadow mapping", () => {
    const result = computeBlockResolvedStyle(theme, { shadow: "md" });
    expect(result.boxShadow).toContain("rgba(0,0,0,0.15)");
  });

  it("shadow 'none' resolves to 'none'", () => {
    const result = computeBlockResolvedStyle(theme, { shadow: "none" });
    expect(result.boxShadow).toBe("none");
  });

  it("buttonStyle 'outline' produces transparent bg and border", () => {
    const result = computeBlockResolvedStyle(theme, { buttonStyle: "outline" });
    expect(result.backgroundColor).toBe("transparent");
    expect(result.borderWidth).toBe("2px");
    expect(result.borderColor).toBe(theme.colorPrimary);
  });

  it("buttonStyle 'neon' produces accent glow shadow", () => {
    const result = computeBlockResolvedStyle(theme, { buttonStyle: "neon" });
    expect(result.backgroundColor).toBe("transparent");
    expect(result.color).toBe(theme.colorAccent);
    expect(result.boxShadow).toContain(theme.colorAccent);
  });

  it("buttonStyle can be overridden by explicit bgColor/textColor", () => {
    const result = computeBlockResolvedStyle(theme, {
      buttonStyle: "neon",
      bgColor: "#FF0000",
      textColor: "#00FF00",
    });
    expect(result.backgroundColor).toBe("#FF0000");
    expect(result.color).toBe("#00FF00");
  });
});
