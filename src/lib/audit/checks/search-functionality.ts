import type { AuditCheck } from "./types";

function detectSearch(html: string): { hasSearch: boolean; evidence: string[] } {
  const evidence: string[] = [];
  const lower = html.toLowerCase();

  const hasSearchInput =
    /type=["']search["']/i.test(html) ||
    /name=["']q["']/i.test(html) ||
    /placeholder=["'][^"']*search[^"']*["']/i.test(html) ||
    /aria-label=["'][^"']*search[^"']*["']/i.test(html);

  const hasSearchAction = lower.includes("/search") || lower.includes("search?q=") || /action=["'][^"']*search/i.test(html);

  const hasSearchIcon = /icon-search|search-icon|svg[^>]*search/i.test(lower);

  const hasSearch = hasSearchInput || hasSearchAction || hasSearchIcon;

  if (hasSearchInput) evidence.push("Search input detected");
  if (hasSearchAction) evidence.push("Search form/action detected");
  if (hasSearchIcon) evidence.push("Search icon detected");

  return { hasSearch, evidence };
}

export const searchFunctionalityCheck: AuditCheck = {
  definition: {
    id: "search-functionality",
    title: "Site Search Available",
    category: "ux",
    severity: "high",
    whyImportant:
      "On-store search helps visitors find products quickly, especially on large catalogs. Poor discoverability increases bounce and reduces conversion.",
    howToFix:
      "Add a prominent search bar in header. Support autocomplete and typo tolerance. Ensure search results pages are fast and relevant, with filters and sorting.",
    references: [{ title: "Baymard: E-commerce Search", url: "https://baymard.com/blog/ecommerce-search" }],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return { checkId: "search-functionality", status: "warn", evidence: ["No HTML fetch adapter configured"], urlsTested: [ctx.url] };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const res = detectSearch(html);

    return {
      checkId: "search-functionality",
      status: res.hasSearch ? "pass" : "fail",
      evidence: res.hasSearch ? res.evidence : ["No site search detected (header search recommended)"] ,
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectSearch };
