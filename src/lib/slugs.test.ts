import { describe, it, expect } from "vitest";
import {
  validateSlug,
  normalizeSlug,
  isReservedSlug,
  getPublicPageUrl,
} from "./slugs";

describe("validateSlug", () => {
  // Regression: /api/pages did `if (validateSlug(slug))`. The result object is
  // always truthy, so EVERY page creation returned 400 and Pro's multi-page
  // feature never worked. Asserting the shape is what makes that impossible.
  it("returns a result object that must be read via .valid, not truthiness", () => {
    const ok = validateSlug("mycoolpage");
    expect(ok).toEqual({ valid: true });
    expect(Boolean(ok)).toBe(true); // truthy even on success

    const bad = validateSlug("ab");
    expect(bad.valid).toBe(false);
    expect(Boolean(bad)).toBe(true); // ...and truthy on failure too
  });

  it("accepts valid slugs", () => {
    for (const slug of ["abc", "my-page", "user123", "a-b-c"]) {
      expect(validateSlug(slug).valid, slug).toBe(true);
    }
  });

  it("rejects slugs that are too short or too long", () => {
    expect(validateSlug("ab").valid).toBe(false);
    expect(validateSlug("a".repeat(64)).valid).toBe(false);
    expect(validateSlug("a".repeat(63)).valid).toBe(true);
  });

  it("rejects empty input", () => {
    expect(validateSlug("").valid).toBe(false);
  });

  it("rejects invalid characters and leading/trailing hyphens", () => {
    for (const slug of ["my_page", "my page", "my.page", "-abc", "abc-", "émile"]) {
      expect(validateSlug(slug).valid, slug).toBe(false);
    }
  });

  it("rejects reserved system and premium slugs", () => {
    for (const slug of ["dashboard", "api", "login", "admin", "john", "shop"]) {
      expect(validateSlug(slug).valid, slug).toBe(false);
      expect(isReservedSlug(slug), slug).toBe(true);
    }
  });

  it("validates against the normalized form", () => {
    expect(validateSlug("  MyPage  ").valid).toBe(true);
    expect(validateSlug("DASHBOARD").valid).toBe(false);
  });
});

describe("normalizeSlug", () => {
  // Regression: raw input was persisted while validation ran on the normalized
  // form, so " MyName " created a page unreachable at its own URL, and "JANE"
  // could be claimed alongside an existing "jane".
  it("lowercases and trims", () => {
    expect(normalizeSlug("  MyName  ")).toBe("myname");
    expect(normalizeSlug("JANE-DOE")).toBe("jane-doe");
  });

  it("is idempotent", () => {
    const once = normalizeSlug(" Foo ");
    expect(normalizeSlug(once)).toBe(once);
  });
});

describe("getPublicPageUrl", () => {
  it("builds the canonical @-prefixed path", () => {
    expect(getPublicPageUrl("jane")).toBe("/@jane");
  });
});
