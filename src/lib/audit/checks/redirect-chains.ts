import type { AuditCheck } from "./types";

export const redirectChainsCheck: AuditCheck = {
  definition: {
    id: "redirect-chains",
    title: "Redirect Chains",
    category: "technical",
    severity: "minor",
    whyImportant:
      "Redirect chains (A→B→C instead of A→C) slow down page loads and waste crawl budget. Each redirect adds latency and can dilute link equity for SEO.",
    howToFix:
      "Audit redirects using crawl tools. Update all internal links to point directly to final destinations. Consolidate multiple redirects into single 301 redirects.",
    references: [
      {
        title: "Google - Redirect Guidelines",
        url: "https://developers.google.com/search/docs/crawling-indexing/301-redirects",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "redirect-chains",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
      
      // Extract internal links to check for redirect patterns
      const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
      const internalLinks: string[] = [];
      const baseHost = new URL(ctx.url).hostname;
      
      for (const match of linkMatches) {
        const hrefMatch = match.match(/href=["']([^"']+)["']/i);
        if (hrefMatch?.[1]) {
          const href = hrefMatch[1];
          try {
            const linkUrl = new URL(href, ctx.url);
            if (linkUrl.hostname === baseHost && linkUrl.href !== ctx.url) {
              internalLinks.push(linkUrl.href);
            }
          } catch {
            // Invalid URL, skip
          }
        }
      }

      const uniqueLinks = [...new Set(internalLinks)].slice(0, 10);
      const redirectChains: string[] = [];
      
      for (const link of uniqueLinks) {
        try {
          const { finalUrl: linkFinalUrl } = await adapters.html.fetchHtml(link);
          // If the final URL is significantly different, it might be a redirect
          if (linkFinalUrl && linkFinalUrl !== link && 
              new URL(linkFinalUrl).pathname !== new URL(link).pathname) {
            redirectChains.push(`${link} → ${linkFinalUrl}`);
          }
        } catch {
          // Link failed, handled by broken-links check
        }
      }

      const hasChains = redirectChains.length > 0;

      return {
        checkId: "redirect-chains",
        status: hasChains ? "warn" : "pass",
        evidence: hasChains
          ? [`Found ${redirectChains.length} redirect(s) in internal links`, ...redirectChains.slice(0, 3)]
          : ["No redirect chains detected in sampled internal links"],
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "redirect-chains",
        status: "warn",
        evidence: ["Could not analyze page for redirect chains"],
        urlsTested: [ctx.url],
      };
    }
  },
};
