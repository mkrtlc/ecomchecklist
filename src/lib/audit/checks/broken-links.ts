import type { AuditCheck } from "./types";

export const brokenLinksCheck: AuditCheck = {
  definition: {
    id: "broken-links",
    title: "Broken Links",
    category: "technical",
    severity: "high",
    whyImportant:
      "Broken links frustrate users and harm SEO. Search engines penalize sites with many 404 errors, and broken product links directly cause lost sales.",
    howToFix:
      "Regularly audit all internal and external links. Use tools like Screaming Frog or broken-link-checker. Set up 301 redirects for moved pages and remove dead external links.",
    references: [
      {
        title: "Google Search Central - Crawl Errors",
        url: "https://developers.google.com/search/docs/crawling-indexing/http-network-errors",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "broken-links",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      
      // Extract all links from the HTML
      const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
      const links: string[] = [];
      
      for (const match of linkMatches) {
        const hrefMatch = match.match(/href=["']([^"']+)["']/i);
        if (hrefMatch?.[1]) {
          const href = hrefMatch[1];
          // Skip anchors, javascript, mailto, tel
          if (!href.startsWith('#') && !href.startsWith('javascript:') && 
              !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            links.push(href);
          }
        }
      }

      const uniqueLinks = [...new Set(links)].slice(0, 20); // Sample first 20 unique links
      const brokenLinks: string[] = [];
      const checkedLinks: string[] = [];

      for (const link of uniqueLinks) {
        try {
          // Resolve relative URLs
          const absoluteUrl = link.startsWith('http') ? link : new URL(link, ctx.url).href;
          const { finalUrl } = await adapters.html.fetchHtml(absoluteUrl);
          checkedLinks.push(absoluteUrl);
          
          // Check if it returned a 404-like response (heuristic)
          if (!finalUrl) {
            brokenLinks.push(absoluteUrl);
          }
        } catch {
          brokenLinks.push(link);
        }
      }

      const hasBrokenLinks = brokenLinks.length > 0;

      return {
        checkId: "broken-links",
        status: hasBrokenLinks ? "fail" : "pass",
        evidence: hasBrokenLinks
          ? [`Found ${brokenLinks.length} potentially broken link(s)`, ...brokenLinks.slice(0, 5)]
          : [`Checked ${checkedLinks.length} links, no broken links detected`],
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "broken-links",
        status: "warn",
        evidence: ["Could not analyze page for broken links"],
        urlsTested: [ctx.url],
      };
    }
  },
};
