import type { AuditCheck } from "./types";

function analyzeCanonical(html: string, pageUrl: string): { hasCanonical: boolean; canonicalUrl?: string; issues: string[] } {
  const issues: string[] = [];

  // Look for canonical link
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ||
                        html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);

  if (!canonicalMatch) {
    return { hasCanonical: false, issues: ["No canonical URL tag found"] };
  }

  const canonicalUrl = canonicalMatch[1];

  // Validate canonical URL
  if (!canonicalUrl || canonicalUrl.trim() === "") {
    issues.push("Canonical tag has empty href");
    return { hasCanonical: false, issues };
  }

  // Check if canonical is an absolute URL
  if (!canonicalUrl.startsWith("http://") && !canonicalUrl.startsWith("https://")) {
    issues.push("Canonical URL should be absolute (include https://)");
  }

  // Check if canonical points to a different domain (could be intentional but worth noting)
  try {
    const canonicalDomain = new URL(canonicalUrl).hostname;
    const pageDomain = new URL(pageUrl).hostname;
    if (canonicalDomain !== pageDomain) {
      issues.push(`Canonical points to different domain: ${canonicalDomain}`);
    }
  } catch {
    // URL parsing failed
  }

  return {
    hasCanonical: true,
    canonicalUrl,
    issues,
  };
}

export const canonicalUrlsCheck: AuditCheck = {
  definition: {
    id: "canonical-urls",
    title: "Canonical URL Tags",
    category: "seo",
    severity: "high",
    whyImportant:
      "Canonical tags prevent duplicate content issues by telling search engines which URL is the 'main' version. Without them, your pages may compete against themselves in search results.",
    howToFix:
      "Add a canonical link tag to every page pointing to the preferred URL. Use absolute URLs. Ensure the canonical URL is the same as (or redirects to) the actual page URL.",
    references: [
      {
        title: "Google: Canonical URLs",
        url: "https://developers.google.com/search/docs/advanced/crawling/consolidate-duplicate-urls",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "canonical-urls",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const { hasCanonical, canonicalUrl, issues } = analyzeCanonical(html, finalUrl ?? ctx.url);

    if (!hasCanonical) {
      return {
        checkId: "canonical-urls",
        status: "fail",
        evidence: issues,
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    const evidence = [`Canonical URL: ${canonicalUrl}`];
    if (issues.length > 0) {
      evidence.push(...issues);
    }

    return {
      checkId: "canonical-urls",
      status: issues.length === 0 ? "pass" : "warn",
      evidence,
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { analyzeCanonical };
