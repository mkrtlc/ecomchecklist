import type { AuditCheck } from "./types";

export const dnsPrefetchCheck: AuditCheck = {
  definition: {
    id: "dns-prefetch",
    title: "DNS Prefetch",
    category: "performance",
    severity: "minor",
    whyImportant:
      "DNS prefetch hints allow browsers to resolve domain names before resources are requested, reducing latency by 20-120ms per external domain. Critical for sites using third-party services.",
    howToFix:
      "Add <link rel=\"dns-prefetch\" href=\"//domain.com\"> in <head> for external domains. Prioritize payment gateways, CDNs, analytics, and font services. Don't over-prefetch (limit to 4-6 domains).",
    references: [
      {
        title: "MDN - dns-prefetch",
        url: "https://developer.mozilla.org/en-US/docs/Web/Performance/dns-prefetch",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "dns-prefetch",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      
      // Find dns-prefetch hints
      const prefetchHints = html.match(/<link[^>]+rel=["']dns-prefetch["'][^>]*>/gi) || [];
      const preconnectHints = html.match(/<link[^>]+rel=["']preconnect["'][^>]*>/gi) || [];
      
      // Find external domains used
      const externalDomains = new Set<string>();
      const domainPatches = html.match(/(?:src|href)=["'](https?:\/\/[^/"']+)/gi) || [];
      const currentHost = new URL(ctx.url).hostname;
      
      for (const match of domainPatches) {
        try {
          const url = match.replace(/(?:src|href)=["']/i, '');
          const domain = new URL(url).hostname;
          if (domain !== currentHost && !domain.includes(currentHost)) {
            externalDomains.add(domain);
          }
        } catch {
          // Invalid URL
        }
      }

      const prefetchedDomains = prefetchHints.length + preconnectHints.length;
      const externalCount = externalDomains.size;
      
      // Determine if prefetch hints are adequate
      const hasAdequatePrefetch = prefetchedDomains > 0 || externalCount <= 2;

      return {
        checkId: "dns-prefetch",
        status: hasAdequatePrefetch ? "pass" : "warn",
        evidence: [
          `Found ${prefetchHints.length} dns-prefetch hint(s)`,
          `Found ${preconnectHints.length} preconnect hint(s)`,
          `Detected ${externalCount} external domain(s)`,
          ...(externalCount > prefetchedDomains + 2 
            ? [`Consider adding dns-prefetch for: ${[...externalDomains].slice(0, 3).join(', ')}`]
            : []),
        ],
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "dns-prefetch",
        status: "warn",
        evidence: ["Could not analyze DNS prefetch hints"],
        urlsTested: [ctx.url],
      };
    }
  },
};
