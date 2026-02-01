import type { AuditCheck } from "./types";

export const inpScoreCheck: AuditCheck = {
  definition: {
    id: "inp-score",
    title: "Interaction to Next Paint (INP)",
    category: "performance",
    severity: "high",
    whyImportant:
      "INP measures responsiveness to user interactions (replacing FID). Slow interactions frustrate users during critical actions like adding to cart or checkout. Google uses INP as a Core Web Vital.",
    howToFix:
      "Break up long JavaScript tasks. Use web workers for heavy computation. Optimize event handlers. Reduce main thread blocking. Defer non-critical JavaScript.",
    references: [
      {
        title: "Web.dev: INP",
        url: "https://web.dev/inp/",
      },
      {
        title: "Optimize INP",
        url: "https://web.dev/optimize-inp/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.pagespeed) {
      return {
        checkId: "inp-score",
        status: "warn",
        evidence: ["No PageSpeed adapter configured - INP requires Lighthouse analysis"],
        urlsTested: [ctx.url],
      };
    }

    const res = await adapters.pagespeed.getMobilePerformanceScore0to100(ctx.url);
    const raw = res.raw as { 
      lighthouseResult?: { 
        audits?: { 
          "experimental-interaction-to-next-paint"?: { numericValue?: number };
          "total-blocking-time"?: { numericValue?: number };
        } 
      } 
    } | undefined;
    
    // Try INP first, fall back to TBT as proxy
    const inpMs = raw?.lighthouseResult?.audits?.["experimental-interaction-to-next-paint"]?.numericValue;
    const tbtMs = raw?.lighthouseResult?.audits?.["total-blocking-time"]?.numericValue;
    
    if (inpMs !== undefined) {
      // INP thresholds: Good <= 200ms, Needs Improvement <= 500ms, Poor > 500ms
      const status = inpMs <= 200 ? "pass" : inpMs <= 500 ? "warn" : "fail";
      return {
        checkId: "inp-score",
        status,
        evidence: [`INP: ${inpMs.toFixed(0)}ms (Good: ≤200ms, Poor: >500ms)`],
        urlsTested: [ctx.url],
      };
    }

    if (tbtMs !== undefined) {
      // TBT thresholds: Good <= 200ms, Needs Improvement <= 600ms, Poor > 600ms
      const status = tbtMs <= 200 ? "pass" : tbtMs <= 600 ? "warn" : "fail";
      return {
        checkId: "inp-score",
        status,
        evidence: [`Total Blocking Time (INP proxy): ${tbtMs.toFixed(0)}ms (Good: ≤200ms, Poor: >600ms)`],
        urlsTested: [ctx.url],
      };
    }

    const score = res.score0to100;
    return {
      checkId: "inp-score",
      status: score >= 90 ? "pass" : score >= 50 ? "warn" : "fail",
      evidence: [`Performance score: ${score}/100 (INP/TBT metrics not available)`],
      urlsTested: [ctx.url],
    };
  },
};
