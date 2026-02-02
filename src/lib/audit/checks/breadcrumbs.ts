import type { AuditCheck } from "./types";

function detectBreadcrumbs(html: string): { hasBreadcrumbs: boolean; evidence: string[] } {
  const evidence: string[] = [];
  const lower = html.toLowerCase();

  const hasNavBreadcrumb = /<nav[^>]*aria-label=["']breadcrumb["']/i.test(html);
  const hasBreadcrumbClass = /breadcrumb/i.test(lower);
  const hasSchemaBreadcrumb = /BreadcrumbList/i.test(html);
  const hasSeparator = /\s(>|\/|»|→)\s/.test(html);

  const hasBreadcrumbs = hasNavBreadcrumb || hasSchemaBreadcrumb || (hasBreadcrumbClass && hasSeparator);

  if (hasNavBreadcrumb) evidence.push("Breadcrumb nav detected");
  if (hasSchemaBreadcrumb) evidence.push("Breadcrumb schema detected");
  if (hasBreadcrumbClass) evidence.push("Breadcrumb class detected");

  return { hasBreadcrumbs, evidence };
}

export const breadcrumbsCheck: AuditCheck = {
  definition: {
    id: "breadcrumbs",
    title: "Breadcrumb Navigation",
    category: "ux",
    severity: "medium",
    whyImportant:
      "Breadcrumbs help users understand where they are in your site hierarchy and navigate back to categories. They improve browsing experience and internal linking.",
    howToFix:
      "Add breadcrumb navigation on product and category pages. Use structured data (BreadcrumbList) for SEO. Ensure breadcrumbs reflect actual hierarchy and are clickable.",
    references: [{ title: "Google: Breadcrumbs", url: "https://developers.google.com/search/docs/appearance/structured-data/breadcrumb" }],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return { checkId: "breadcrumbs", status: "warn", evidence: ["No HTML fetch adapter configured"], urlsTested: [ctx.url] };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const res = detectBreadcrumbs(html);

    return {
      checkId: "breadcrumbs",
      status: res.hasBreadcrumbs ? "pass" : "warn",
      evidence: res.hasBreadcrumbs ? res.evidence : ["No breadcrumbs detected (recommended for UX/SEO)"],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectBreadcrumbs };
