import type { AuditCheck } from "./types";

function analyzeCachingHints(html: string): { hasCacheHints: boolean; evidence: string[] } {
  const evidence: string[] = [];
  let hasCacheHints = false;

  // Check for service worker registration (indicates caching strategy)
  if (/navigator\.serviceWorker\.register/i.test(html) || /serviceWorker/i.test(html)) {
    hasCacheHints = true;
    evidence.push("Service Worker detected (likely caching enabled)");
  }

  // Check for preload/prefetch hints
  const preloadMatch = html.match(/<link[^>]*rel=["']preload["'][^>]*>/gi) || [];
  const prefetchMatch = html.match(/<link[^>]*rel=["']prefetch["'][^>]*>/gi) || [];
  
  if (preloadMatch.length > 0 || prefetchMatch.length > 0) {
    hasCacheHints = true;
    evidence.push(`Found ${preloadMatch.length} preload and ${prefetchMatch.length} prefetch hints`);
  }

  // Check for versioned/hashed assets (indicates cache busting strategy)
  const hasVersionedAssets = /\.(js|css)\?v=|\.[\da-f]{8,}\.(js|css)/i.test(html);
  if (hasVersionedAssets) {
    hasCacheHints = true;
    evidence.push("Versioned/hashed assets detected (cache busting enabled)");
  }

  if (!hasCacheHints) {
    evidence.push("No caching indicators found (full analysis requires HTTP header inspection)");
  }

  return { hasCacheHints, evidence };
}

export const cachingHeadersCheck: AuditCheck = {
  definition: {
    id: "caching-headers",
    title: "Browser Caching Headers",
    category: "performance",
    severity: "medium",
    whyImportant:
      "Proper caching headers reduce server load and dramatically speed up repeat visits. Returning customers see faster page loads, improving their experience and conversion likelihood.",
    howToFix:
      "Set Cache-Control headers for static assets (images, CSS, JS) with long max-age. Use versioned filenames for cache busting. Implement ETags for dynamic content. Consider a CDN.",
    references: [
      {
        title: "Web.dev: HTTP Caching",
        url: "https://web.dev/http-cache/",
      },
      {
        title: "MDN: Cache-Control",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "caching-headers",
        status: "warn",
        evidence: ["No HTML fetch adapter configured - caching requires HTTP header inspection"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const { hasCacheHints, evidence } = analyzeCachingHints(html);

    // Without header access, we can only do partial analysis
    return {
      checkId: "caching-headers",
      status: hasCacheHints ? "pass" : "warn",
      evidence,
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { analyzeCachingHints };
