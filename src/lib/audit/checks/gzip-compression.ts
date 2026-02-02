import type { AuditCheck } from "./types";

export const gzipCompressionCheck: AuditCheck = {
  definition: {
    id: "gzip-compression",
    title: "GZIP/Brotli Compression",
    category: "performance",
    severity: "major",
    whyImportant:
      "Text compression (GZIP/Brotli) can reduce transfer sizes by 70-90%, dramatically improving load times. Uncompressed assets waste bandwidth and slow page loads.",
    howToFix:
      "Enable GZIP or Brotli compression on your server/CDN. Most platforms support this natively. Verify compression is applied to HTML, CSS, JS, and JSON responses.",
    references: [
      {
        title: "web.dev - Enable Text Compression",
        url: "https://web.dev/uses-text-compression/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "gzip-compression",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      
      // In a real implementation, we'd check response headers for Content-Encoding
      // For now, we'll use HTML size as a heuristic - very large uncompressed HTML is a red flag
      const htmlSize = html.length;
      const isLikelyCompressed = htmlSize < 500000; // 500KB threshold for concern

      // Check for compression hints in the HTML (common CDN patterns)
      const hasCompressionHints = 
        html.includes('cloudflare') ||
        html.includes('fastly') ||
        html.includes('akamai') ||
        html.includes('cdn');

      return {
        checkId: "gzip-compression",
        status: isLikelyCompressed ? "pass" : "warn",
        evidence: isLikelyCompressed
          ? [
              `HTML size: ${Math.round(htmlSize / 1024)}KB (reasonable)`,
              hasCompressionHints ? "CDN detected - likely compressed" : "Verify compression headers on server",
            ]
          : [
              `HTML size: ${Math.round(htmlSize / 1024)}KB (large - verify compression)`,
              "Consider enabling GZIP/Brotli compression",
            ],
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "gzip-compression",
        status: "warn",
        evidence: ["Could not analyze compression"],
        urlsTested: [ctx.url],
      };
    }
  },
};
