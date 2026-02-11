import { describe, it, expect } from "vitest";
import { validateStyleOverrides } from "./block-validation";
import type { BlockStyleOverrides } from "@/lib/templates/theme";

describe("validateStyleOverrides", () => {
  // ── Shape validation (all plans) ──────────────────────────────────────────

  it("accepts valid variant on free plan", () => {
    expect(validateStyleOverrides({ variant: "outline" }, "free")).toBeNull();
  });

  it("rejects invalid variant", () => {
    expect(
      validateStyleOverrides({ variant: "bogus" as any }, "free"),
    ).toBe("Invalid variant");
  });

  it("rejects invalid hex bgColor", () => {
    expect(
      validateStyleOverrides({ bgColor: "red" }, "pro"),
    ).toBe("Invalid background color format");
  });

  it("rejects short hex bgColor", () => {
    expect(
      validateStyleOverrides({ bgColor: "#FFF" }, "pro"),
    ).toBe("Invalid background color format");
  });

  it("accepts valid 6-digit hex bgColor on pro", () => {
    expect(
      validateStyleOverrides({ bgColor: "#FF0000" }, "pro"),
    ).toBeNull();
  });

  it("rejects invalid textColor format", () => {
    expect(
      validateStyleOverrides({ textColor: "rgb(0,0,0)" }, "pro"),
    ).toBe("Invalid text color format");
  });

  it("rejects borderRadius out of range (negative)", () => {
    expect(
      validateStyleOverrides({ borderRadius: -1 }, "pro"),
    ).toBe("Border radius must be 0-32");
  });

  it("rejects borderRadius out of range (too high)", () => {
    expect(
      validateStyleOverrides({ borderRadius: 33 }, "pro"),
    ).toBe("Border radius must be 0-32");
  });

  it("rejects non-integer borderRadius", () => {
    expect(
      validateStyleOverrides({ borderRadius: 4.5 }, "pro"),
    ).toBe("Border radius must be 0-32");
  });

  it("accepts borderRadius 0", () => {
    expect(
      validateStyleOverrides({ borderRadius: 0 }, "pro"),
    ).toBeNull();
  });

  it("accepts borderRadius 32", () => {
    expect(
      validateStyleOverrides({ borderRadius: 32 }, "pro"),
    ).toBeNull();
  });

  it("rejects invalid shadow value", () => {
    expect(
      validateStyleOverrides({ shadow: "lg" as any }, "pro"),
    ).toBe("Invalid shadow value");
  });

  it("accepts valid shadow values", () => {
    expect(validateStyleOverrides({ shadow: "none" }, "pro")).toBeNull();
    expect(validateStyleOverrides({ shadow: "sm" }, "pro")).toBeNull();
    expect(validateStyleOverrides({ shadow: "md" }, "pro")).toBeNull();
  });

  it("rejects invalid buttonStyle", () => {
    expect(
      validateStyleOverrides({ buttonStyle: "rainbow" as any }, "pro"),
    ).toBe("Invalid button style");
  });

  it("accepts valid buttonStyle on pro", () => {
    expect(
      validateStyleOverrides({ buttonStyle: "glass" }, "pro"),
    ).toBeNull();
  });

  // ── Plan gating ───────────────────────────────────────────────────────────

  it("free plan: rejects bgColor (Pro-only)", () => {
    expect(
      validateStyleOverrides({ bgColor: "#FF0000" }, "free"),
    ).toBe("Block style customization requires a Pro plan");
  });

  it("free plan: rejects textColor (Pro-only)", () => {
    expect(
      validateStyleOverrides({ textColor: "#000000" }, "free"),
    ).toBe("Block style customization requires a Pro plan");
  });

  it("free plan: rejects borderRadius (Pro-only)", () => {
    expect(
      validateStyleOverrides({ borderRadius: 8 }, "free"),
    ).toBe("Block style customization requires a Pro plan");
  });

  it("free plan: rejects shadow (Pro-only)", () => {
    expect(
      validateStyleOverrides({ shadow: "sm" }, "free"),
    ).toBe("Block style customization requires a Pro plan");
  });

  it("free plan: allows variant alone", () => {
    expect(
      validateStyleOverrides({ variant: "primary" }, "free"),
    ).toBeNull();
  });

  it("free plan: rejects variant + bgColor combo", () => {
    expect(
      validateStyleOverrides({ variant: "primary", bgColor: "#FF0000" }, "free"),
    ).toBe("Block style customization requires a Pro plan");
  });

  it("pro plan: accepts full custom overrides", () => {
    const overrides: BlockStyleOverrides = {
      variant: "outline",
      bgColor: "#1A1A2E",
      textColor: "#FFFFFF",
      borderRadius: 12,
      shadow: "md",
      buttonStyle: "neon",
    };
    expect(validateStyleOverrides(overrides, "pro")).toBeNull();
  });
});
