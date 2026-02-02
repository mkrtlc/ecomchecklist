import type { AuditCheck } from "./types";

export const resourceHintsCheck: AuditCheck = {
  definition: {
    id: "resource-hints",
    title: "Resource Hints (preconnect/preload)",
    category: "performance",
    severity: "nice",
    whyImportant:
      "Resource hints (preconnect, preload, prefetch) tell browsers to prepare resources early. Preloading critical assets like fonts and hero images significantly improves LCP.",
    howToFix:
      "Add <link rel=\"preload\"> for critical above-fold resources (hero images, fonts, key CSS). Use <link rel=\"preconnect\"> for third-party origins. Don't over-preload (limit to 3-6 resources).",
    references: [
      {
        title: "web.dev - Resource Hints",
        url: "https://web.dev/preconnect-and-dns-prefetch/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "resource-hints",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      
      // Find resource hints
      const preloads = html.match(/<link[^>]+rel=["']preload["'][^>]*>/gi) || [];
      const preconnects = html.match(/<link[^>]+rel=["']preconnect["'][^>]*>/gi) || [];
      const prefetches = html.match(/<link[^>]+rel=["']prefetch["'][^>]*>/gi) || [];
      const modulePreloads = html.match(/<link[^>]+rel=["']modulepreload["'][^>]*>/gi) || [];
      
      // Analyze what's being preloaded
      const preloadTypes: Record<string, number> = {
        font: 0,
        image: 0,
        script: 0,
        style: 0,
        other: 0,
      };
      
      for (const preload of preloads) {
        const asMatch = preload.match(/as=["'](\w+)["']/i);
        const asType = asMatch?.[1] || 'other';
        preloadTypes[asType] = (preloadTypes[asType] || 0) + 1;
      }

      const totalHints = preloads.length + preconnects.length + prefetches.length + modulePreloads.length;
      const hasResourceHints = totalHints > 0;
      
      // Check if over-preloading (too many can hurt performance)
      const isOverPreloading = preloads.length > 10;

      return {
        checkId: "resource-hints",
        status: hasResourceHints && !isOverPreloading ? "pass" : "warn",
        evidence: [
          `Preload hints: ${preloads.length}`,
          `Preconnect hints: ${preconnects.length}`,
          `Prefetch hints: ${prefetches.length}`,
          `Module preloads: ${modulePreloads.length}`,
          preloadTypes.font > 0 ? `Font preloads: ${preloadTypes.font}` : "",
          preloadTypes.image > 0 ? `Image preloads: ${preloadTypes.image}` : "",
          isOverPreloading ? "Warning: Too many preloads may hurt performance" : "",
          !hasResourceHints ? "Consider preloading critical fonts and hero images" : "",
        ].filter(Boolean),
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "resource-hints",
        status: "warn",
        evidence: ["Could not analyze resource hints"],
        urlsTested: [ctx.url],
      };
    }
  },
};
