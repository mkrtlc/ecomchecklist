import type { AuditCheck } from "./types";

export const lcpScoreCheck: AuditCheck = {
  definition: {
    id: "lcp-score",
    title: "Largest Contentful Paint (LCP)",
    category: "performance",
    severity: "critical",
    whyImportant:
      "LCP measures when the largest content element becomes visible. Poor LCP (>2.5s) frustrates users and hurts conversions. Google uses LCP as a Core Web Vital for ranking.",
    howToFix:
      "Optimize the largest element (usually hero image). Use WebP/AVIF formats, proper sizing, and preload hints. Eliminate render-blocking resources. Use a CDN for faster delivery.",
    references: [
      {
        title: "Web.dev: LCP",
        url: "https://web.dev/lcp/",
      },
      {
        title: "Optimize LCP",
        url: "https://web.dev/optimize-lcp/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.pagespeed) {
      return {
        checkId: "lcp-score",
        status: "warn",
        evidence: ["No PageSpeed adapter configured - LCP requires Lighthouse analysis"],
        urlsTested: [ctx.url],
      };
    }

    const res = await adapters.pagespeed.getMobilePerformanceScore0to100(ctx.url);
    const raw = res.raw as { lighthouseResult?: { audits?: { "largest-contentful-paint"?: { numericValue?: number } } } } | undefined;
    
    const lcpMs = raw?.lighthouseResult?.audits?.["largest-contentful-paint"]?.numericValue;
    
    if (lcpMs === undefined) {
      // Fall back to overall performance score as proxy
      const score = res.score0to100;
      return {
        checkId: "lcp-score",
        status: score >= 90 ? "pass" : score >= 50 ? "warn" : "fail",
        evidence: [`Performance score: ${score}/100 (LCP metric not available)`],
        urlsTested: [ctx.url],
      };
    }

    const lcpSeconds = lcpMs / 1000;
    // LCP thresholds: Good < 2.5s, Needs Improvement < 4s, Poor >= 4s
    const status = lcpSeconds <= 2.5 ? "pass" : lcpSeconds <= 4 ? "warn" : "fail";

    return {
      checkId: "lcp-score",
      status,
      evidence: [`LCP: ${lcpSeconds.toFixed(2)}s (Good: ≤2.5s, Poor: >4s)`],
      urlsTested: [ctx.url],
    };
  },
};
