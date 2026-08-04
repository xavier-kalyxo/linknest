import { describe, it, expect } from "vitest";
import { normalizeUrl } from "./safe-browsing";

/**
 * These cases are the reason URL checking is an allowlist on the *parsed*
 * protocol rather than a set of anchored regexes. The WHATWG URL parser strips
 * ASCII tab/LF/CR and leading whitespace before resolving the scheme, so every
 * string below resolves to javascript:/data: in a browser while matching no
 * ^javascript:/^data: pattern. They were previously stored verbatim and
 * rendered straight into an <a href>, giving stored XSS on the app's origin.
 */
describe("normalizeUrl — dangerous scheme rejection", () => {
  const dangerous = [
    "javascript:alert(1)",
    " javascript:alert(1)",
    "\tjavascript:alert(1)",
    "java\tscript:alert(1)",
    "java\nscript:alert(1)",
    "java\rscript:alert(1)",
    "JaVa\tScRiPt:alert(document.domain)",
    "JAVASCRIPT:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "da\tta:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "blob:https://example.com/uuid",
  ];

  for (const url of dangerous) {
    it(`rejects ${JSON.stringify(url)}`, () => {
      const result = normalizeUrl(url);
      expect(result, `${url} must not be accepted`).toHaveProperty("error");
    });
  }

  it("rejects every dangerous input that a browser would resolve to a script scheme", () => {
    for (const url of dangerous) {
      let protocol: string | null = null;
      try {
        protocol = new URL(url).protocol;
      } catch {
        protocol = null;
      }
      if (protocol === "javascript:" || protocol === "data:") {
        expect(normalizeUrl(url), url).toHaveProperty("error");
      }
    }
  });
});

describe("normalizeUrl — allowed schemes", () => {
  it("accepts http and https", () => {
    expect(normalizeUrl("https://example.com")).toEqual({
      url: "https://example.com/",
    });
    expect(normalizeUrl("http://example.com/path?q=1")).toEqual({
      url: "http://example.com/path?q=1",
    });
  });

  it("accepts mailto and tel", () => {
    expect(normalizeUrl("mailto:hi@example.com")).toEqual({
      url: "mailto:hi@example.com",
    });
    expect(normalizeUrl("tel:+15551234567")).toEqual({
      url: "tel:+15551234567",
    });
  });

  it("returns the normalized href, so what we store is what a browser resolves", () => {
    const result = normalizeUrl("  https://Example.com/a  ");
    expect(result).toHaveProperty("url");
    expect((result as { url: string }).url).toBe("https://example.com/a");
  });

  it("rejects input that is not a URL at all", () => {
    for (const input of ["", "   ", "example.com", "not a url"]) {
      expect(normalizeUrl(input), input).toHaveProperty("error");
    }
  });
});
