import { describe, it, expect } from "vitest";
import { resolvePlanOverride } from "./queries";

/**
 * Plan resolution is duplicated across queries: getUserWorkspace() serves the
 * dashboard/editor/server actions, and the public page has its own join.
 *
 * When only the first applied overrides, the two disagreed — a comped Pro
 * account could tick "Hide Made with LinkNest", have it validated, saved and
 * echoed back by the editor, and still see the badge on the live page, because
 * the render path read the raw workspaces.plan column. Any new query that
 * resolves a plan must go through this helper.
 */
describe("resolvePlanOverride", () => {
  it("returns the comped plan", () => {
    expect(resolvePlanOverride({ plan: "pro" })).toBe("pro");
    expect(resolvePlanOverride({ plan: "free" })).toBe("free");
  });

  it("returns null when there is no override, so the column wins", () => {
    for (const value of [null, undefined, {}, "pro", 42, []]) {
      expect(resolvePlanOverride(value)).toBeNull();
    }
  });

  it("ignores unrecognised plan values rather than trusting them", () => {
    // The value column is jsonb — an unexpected write must not grant a plan.
    for (const value of [
      { plan: "enterprise" },
      { plan: true },
      { plan: null },
      { plan: "PRO" },
    ]) {
      expect(resolvePlanOverride(value)).toBeNull();
    }
  });

  it("badge visibility follows the resolved plan, not the raw column", () => {
    // Mirrors the check in src/app/(public)/[username]/page.tsx
    const showBadge = (plan: string | null, hideBranding: boolean) =>
      !(plan === "pro" && hideBranding);

    const columnPlan = "free"; // reset by Stripe reconciliation
    const comped = resolvePlanOverride({ plan: "pro" }) ?? columnPlan;

    expect(showBadge(comped, true)).toBe(false); // comped Pro hides it
    expect(showBadge(columnPlan, true)).toBe(true); // the pre-fix behaviour

    // A free account can never hide the badge, even if the flag is somehow set.
    const free = resolvePlanOverride(null) ?? "free";
    expect(showBadge(free, true)).toBe(true);
  });
});
