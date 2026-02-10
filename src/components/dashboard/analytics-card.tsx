"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  total: number;
  daily: number[];
  labels: string[];
  configured: boolean;
}

export function AnalyticsCard({ slug }: { slug: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch(`/api/analytics?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => null);
  }, [slug]);

  if (!data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="h-20 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  const max = Math.max(...data.daily, 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="text-sm text-gray-500">Views (7 days)</p>
          <p className="text-2xl font-bold">{data.total.toLocaleString()}</p>
        </div>
        {!data.configured && (
          <span className="text-xs text-gray-400">
            Configure PostHog for live data
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
