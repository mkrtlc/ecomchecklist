import type { AuditCheck } from "./types";

export const clsScoreCheck: AuditCheck = {
  definition: {
    id: "cls-score",
    title: "Cumulative Layout Shift (CLS)",
    category: "performance",
    severity: "high",
    whyImportant:
      "CLS measures visual stability. Layout shifts frustrate users, especially when they accidentally click wrong elements. Poor CLS can cause customers to add wrong items or miss buttons.",
    howToFix:
      "Set explicit dimensions on images and embeds. Reserve space for ads and dynamic content. Use transform animations instead of layout-triggering properties. Avoid inserting content above existing content.",
    references: [
      {
        title: "Web.dev: CLS",
        url: "https://web.dev/cls/",
      },
      {
        title: "Optimize CLS",
        url: "https://web.dev/optimize-cls/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.pagespeed) {
      return {
        checkId: "cls-score",
        status: "warn",
        evidence: ["No PageSpeed adapter configured - CLS requires Lighthouse analysis"],
        urlsTested: [ctx.url],
      };
    }

    const res = await adapters.pagespeed.getMobilePerformanceScore0to100(ctx.url);
    const raw = res.raw as { lighthouseResult?: { audits?: { "cumulative-layout-shift"?: { numericValue?: number } } } } | undefined;
    
    const cls = raw?.lighthouseResult?.audits?.["cumulative-layout-shift"]?.numericValue;
    
    if (cls === undefined) {
      const score = res.score0to100;
      return {
        checkId: "cls-score",
        status: score >= 90 ? "pass" : score >= 50 ? "warn" : "fail",
        evidence: [`Performance score: ${score}/100 (CLS metric not available)`],
        urlsTested: [ctx.url],
      };
    }

    // CLS thresholds: Good <= 0.1, Needs Improvement <= 0.25, Poor > 0.25
    const status = cls <= 0.1 ? "pass" : cls <= 0.25 ? "warn" : "fail";

    return {
      checkId: "cls-score",
      status,
      evidence: [`CLS: ${cls.toFixed(3)} (Good: ≤0.1, Poor: >0.25)`],
      urlsTested: [ctx.url],
    };
  },
};
