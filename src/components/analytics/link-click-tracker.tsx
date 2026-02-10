"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * Attaches click tracking to all link blocks on a public page.
 * Captures `link_click` events with block_id and url properties.
 */
export function LinkClickTracker() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        "a[data-link-id]",
      );
      if (!link) return;

      posthog.capture("link_click", {
        block_id: link.dataset.linkId,
        url: link.href,
        label: link.textContent?.trim(),
      });
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return null;
}
