"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  total: number | null;
  clicks: number | null;
  daily: number[];
  labels: string[];
  days: number;
  configured: boolean;
  error?: string;
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AnalyticsData };

export function AnalyticsCard({
  slug,
  title,
}: {
  slug: string;
  title?: string;
}) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/analytics?slug=${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const body = (await res.json()) as AnalyticsData;
        if (cancelled) return;
        if (!res.ok || body.error) {
          setState({
            status: "error",
            message: body.error ?? "Analytics are temporarily unavailable.",
          });
          return;
        }
        setState({ status: "ready", data: body });
      })
      // A rejected fetch used to leave the card pulsing forever, which reads as
      // "still loading" rather than "this failed".
      .catch(() => {
        if (!cancelled) {
          setState({
            status: "error",
            message: "Couldn't load analytics. Check your connection.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const heading = title ? `${title} — @${slug}` : `@${slug}`;

  if (state.status === "loading") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="mb-3 text-xs font-medium text-gray-400">{heading}</p>
        <div className="h-20 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="mb-2 text-xs font-medium text-gray-400">{heading}</p>
        <p className="text-sm text-gray-500">{state.message}</p>
      </div>
    );
  }

  const { data } = state;
  const max = Math.max(...data.daily, 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      {/* The page each card belongs to — with several pages these were
          previously an unlabelled stack of identical cards. */}
      <p className="mb-3 text-xs font-medium text-gray-400">{heading}</p>

      <div className="mb-4 flex items-baseline justify-between">
        <div className="flex gap-8">
          <div>
            <p className="text-sm text-gray-500">Views ({data.days} days)</p>
            <p className="text-2xl font-bold">
              {data.configured ? (data.total ?? 0).toLocaleString() : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Link clicks</p>
            <p className="text-2xl font-bold">
              {data.configured ? (data.clicks ?? 0).toLocaleString() : "—"}
            </p>
          </div>
        </div>
        {!data.configured && (
          <span className="text-xs text-gray-400">
            Analytics not set up yet
          </span>
        )}
      </div>

      {/* Sparkline */}
      <div className="flex items-end gap-1" style={{ height: 48 }}>
        {data.daily.map((value, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-sm bg-black transition-all"
              style={{
                height: `${Math.max((value / max) * 48, 2)}px`,
                opacity: value > 0 ? 1 : 0.15,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1">
        {data.labels.map((label, i) => (
          <span key={i} className="flex-1 text-center text-[9px] text-gray-400">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
