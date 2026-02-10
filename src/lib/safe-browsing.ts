// src/lib/safe-browsing.ts — Google Safe Browsing Lookup API v4 integration

const API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
const API_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find";
const TIMEOUT_MS = 2000;

interface ThreatMatch {
  threatType: string;
  platformType: string;
  threat: { url: string };
  cacheDuration: string;
}

interface SafeBrowsingResponse {
  matches?: ThreatMatch[];
}

export interface SafeBrowsingResult {
  safe: boolean;
  flaggedUrls: string[];
  timedOut: boolean;
}

/**
 * Check a list of URLs against Google Safe Browsing.
 * Returns { safe: true } if all URLs pass, or { safe: false, flaggedUrls } if any fail.
 * On timeout or API error, returns { safe: true, timedOut: true } — fail-open.
 */
export async function checkUrls(urls: string[]): Promise<SafeBrowsingResult> {
  if (!API_KEY || urls.length === 0) {
    return { safe: true, flaggedUrls: [], timedOut: false };
  }

  // Deduplicate and filter out empty URLs
  const uniqueUrls = [...new Set(urls.filter(Boolean))];
  if (uniqueUrls.length === 0) {
    return { safe: true, flaggedUrls: [], timedOut: false };
  }

  const body = {
    client: {
      clientId: "linknest",
      clientVersion: "1.0.0",
    },
    threatInfo: {
      threatTypes: [
        "MALWARE",
        "SOCIAL_ENGINEERING",
        "UNWANTED_SOFTWARE",
        "POTENTIALLY_HARMFUL_APPLICATION",
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: uniqueUrls.map((url) => ({ url })),
    },
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(
        "Safe Browsing API error:",
        response.status,
        await response.text(),
      );
      return { safe: true, flaggedUrls: [], timedOut: true };
    }

    const data = (await response.json()) as SafeBrowsingResponse;

    if (data.matches && data.matches.length > 0) {
      const flaggedUrls = data.matches.map((m) => m.threat.url);
      return { safe: false, flaggedUrls, timedOut: false };
    }

    return { safe: true, flaggedUrls: [], timedOut: false };
  } catch (error) {
    // Abort / timeout / network error → fail-open
    console.error("Safe Browsing check failed (fail-open):", error);
    return { safe: true, flaggedUrls: [], timedOut: true };
  }
}

// ─── Banned URL Patterns ────────────────────────────────────────────────────

const BANNED_PATTERNS = [
  /^javascript:/i,
  /^data:/i,
  /^vbscript:/i,
  /<meta[^>]+http-equiv\s*=\s*["']?refresh/i,
];

/**
 * Check if a URL matches any banned pattern.
 * Returns the reason if banned, null if OK.
 */
export function checkBannedUrl(url: string): string | null {
  if (!url) return null;

  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(url)) {
      return "This URL type is not allowed for security reasons.";
    }
  }

  return null;
}
