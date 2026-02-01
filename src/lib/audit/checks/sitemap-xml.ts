import type { AuditCheck } from "./types";

function analyzeSitemap(content: string): { isValid: boolean; urlCount?: number; issues: string[] } {
  const issues: string[] = [];

  // Check if it's XML
  if (!content.includes("<?xml") && !content.includes("<urlset") && !content.includes("<sitemapindex")) {
    return { isValid: false, issues: ["Not a valid XML sitemap"] };
  }

  // Count URLs
  const urlMatches = content.match(/<loc>/gi) || [];
  const urlCount = urlMatches.length;

  if (urlCount === 0) {
    issues.push("Sitemap contains no URLs");
    return { isValid: false, urlCount: 0, issues };
  }

  // Check for sitemap index
  const isSitemapIndex = content.includes("<sitemapindex");
  if (isSitemapIndex) {
    issues.push(`Sitemap index found with ${urlCount} child sitemaps`);
  }

  // Check for lastmod (good practice)
  const hasLastmod = /<lastmod>/i.test(content);
  if (!hasLastmod) {
    issues.push("Consider adding <lastmod> dates for better crawl efficiency");
  }

  return {
    isValid: true,
    urlCount,
    issues,
  };
}

export const sitemapXmlCheck: AuditCheck = {
  definition: {
    id: "sitemap-xml",
    title: "XML Sitemap",
    category: "seo",
    severity: "medium",
    whyImportant:
      "XML sitemaps help search engines discover and crawl all important pages. For e-commerce sites with many products, sitemaps are essential for complete indexing.",
    howToFix:
      "Generate an XML sitemap with all important pages (products, categories, info pages). Submit it to Google Search Console. Keep it updated as you add/remove pages.",
    references: [
      {
        title: "Google: Sitemaps",
        url: "https://developers.google.com/search/docs/advanced/sitemaps/overview",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "sitemap-xml",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    // Construct sitemap URL
    let sitemapUrl: string;
    try {
      const urlObj = new URL(ctx.url);
      sitemapUrl = `${urlObj.protocol}//${urlObj.host}/sitemap.xml`;
    } catch {
      sitemapUrl = ctx.url.replace(/\/[^/]*$/, "/sitemap.xml");
    }

    try {
      const { html: content } = await adapters.html.fetchHtml(sitemapUrl);

      // Check if we got an HTML error page instead of sitemap
      if (content.toLowerCase().includes("<!doctype") && !content.includes("<urlset")) {
        return {
          checkId: "sitemap-xml",
          status: "fail",
          evidence: ["sitemap.xml not found (received HTML error page)"],
          urlsTested: [sitemapUrl],
        };
      }

      const { isValid, urlCount, issues } = analyzeSitemap(content);

      const evidence: string[] = [];
      if (isValid && urlCount) {
        evidence.push(`Sitemap found with ${urlCount} URLs`);
      }
      evidence.push(...issues);

      return {
        checkId: "sitemap-xml",
        status: isValid ? "pass" : "fail",
        evidence,
        urlsTested: [sitemapUrl],
      };
    } catch {
      return {
        checkId: "sitemap-xml",
        status: "fail",
        evidence: ["Could not fetch sitemap.xml"],
        urlsTested: [sitemapUrl],
      };
    }
  },
};

export const __test__ = { analyzeSitemap };
