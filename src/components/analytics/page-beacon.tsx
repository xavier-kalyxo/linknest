"use client";

import { useEffect } from "react";

/**
 * Public-page analytics beacon.
 *
 * Replaces posthog-js (~50 KB brotli) with a delegated click listener and two
 * fetch calls. Posts to our own origin, so ad blockers that block *.posthog.com
 * no longer erase traffic, and no third-party script runs on visitor pages.
 */
export function PageBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const send = (payload: Record<string, unknown>) => {
      const body = JSON.stringify({ slug, ...payload });

      // sendBeacon survives the page unloading, which a plain fetch does not —
      // it is the difference between counting a click and losing it when the
      // browser navigates away.
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/collect",
          new Blob([body], { type: "application/json" }),
        );
        return;
      }
      fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    };

    send({ event: "$pageview" });

    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        "a[data-link-id]",
      );
      if (!link) return;

      send({
        event: "link_click",
        blockId: link.dataset.linkId,
        url: link.href,
        label: link.textContent?.trim().slice(0, 255),
      });
    };

    // `pointerdown` rather than `click`: it fires for middle-click and
    // cmd/ctrl-click, which open a new tab without ever producing a click
    // event, and it lands before navigation begins.
    document.addEventListener("pointerdown", onClick);
    return () => document.removeEventListener("pointerdown", onClick);
  }, [slug]);

  return null;
}
