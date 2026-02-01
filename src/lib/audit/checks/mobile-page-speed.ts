import type { AuditCheck } from "./types";

export const mobilePageSpeedCheck: AuditCheck = {
  definition: {
    id: "mobile-page-speed",
    title: "Mobile Page Speed",
    category: "performance",
    severity: "critical",
    whyImportant:
      "Mobile speed strongly impacts conversion rate and SEO. Slow pages increase bounce and reduce add-to-cart and checkout completion.",
    howToFix:
      "Run a Lighthouse/PageSpeed audit and prioritize: optimize hero images (WebP/AVIF), reduce JS bundle size, eliminate render-blocking resources, enable caching/compression, and improve LCP/CLS.",
    references: [
      {
        title: "Google PageSpeed Insights",
        url: "https://pagespeed.web.dev/",
      },
      {
        title: "Web Vitals",
        url: "https://web.dev/vitals/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.pagespeed) {
      return {
        checkId: "mobile-page-speed",
        status: "warn",
        evidence: ["No PageSpeed/Lighthouse adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const res = await adapters.pagespeed.getMobilePerformanceScore0to100(ctx.url);
    const score = res.score0to100;

    const status = score >= 90 ? "pass" : score >= 50 ? "warn" : "fail";

    return {
      checkId: "mobile-page-speed",
      status,
      evidence: [`Mobile performance score: ${score}/100`],
      urlsTested: [ctx.url],
    };
  },
};
