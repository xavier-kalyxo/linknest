import { describe, it, expect } from "vitest";

/**
 * Mirrors the rule in src/components/blocks/link-block.tsx.
 *
 * Every link block used to render target="_blank" unconditionally. For a tel:
 * link — which a local business page will have — that hands off to the dialer
 * while leaving a blank tab behind, and on desktop it is just a dead tab.
 */
const isExternalPage = (url: string) => /^https?:/i.test(url);

describe("link block target behaviour", () => {
  it("opens web destinations in a new tab", () => {
    for (const url of [
      "https://oui.digital/pricing/",
      "http://example.com",
      "HTTPS://EXAMPLE.COM",
      "https://tidycal.com/ouidigitalstudio/website-teardown",
    ]) {
      expect(isExternalPage(url), url).toBe(true);
    }
  });

  it("keeps app handoffs in the same tab", () => {
    for (const url of ["tel:+16192590530", "mailto:hi@oui.digital"]) {
      expect(isExternalPage(url), url).toBe(false);
    }
  });

  it("does not treat a lookalike scheme as a web page", () => {
    // normalizeUrl() already blocks these, but the target rule must not be the
    // thing that lets one through.
    for (const url of ["javascript:alert(1)", "data:text/html,x"]) {
      expect(isExternalPage(url), url).toBe(false);
    }
  });
});
