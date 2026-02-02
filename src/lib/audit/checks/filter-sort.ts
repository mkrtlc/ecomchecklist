import type { AuditCheck } from "./types";

function detectFilterSort(html: string): { hasFilters: boolean; hasSort: boolean; evidence: string[] } {
  const evidence: string[] = [];
  const lower = html.toLowerCase();

  const filterSignals = [
    "filter",
    "refine",
    "price",
    "size",
    "color",
    "brand",
    "availability",
    "in stock",
  ];

  const sortSignals = ["sort", "best selling", "newest", "price low", "price high", "featured", "relevance"];

  const hasFilters =
    /filter/i.test(html) &&
    (filterSignals.some((s) => lower.includes(s)) || /aria-label=["'][^"']*filter/i.test(lower) || /data-filter/i.test(lower));

  const hasSort =
    /sort/i.test(html) &&
    (sortSignals.some((s) => lower.includes(s)) || /aria-label=["'][^"']*sort/i.test(lower) || /data-sort/i.test(lower));

  if (hasFilters) evidence.push("Filter UI detected");
  if (hasSort) evidence.push("Sort UI detected");

  return { hasFilters, hasSort, evidence };
}

export const filterSortCheck: AuditCheck = {
  definition: {
    id: "filter-sort",
    title: "Category Filters & Sorting",
    category: "ux",
    severity: "medium",
    whyImportant:
      "Filters and sorting help shoppers narrow large catalogs and find what they want faster. Without them, users bounce or abandon browsing.",
    howToFix:
      "Add filters for key attributes (price, size, color, brand) and sorting options (best-selling, newest, price). Make filter controls mobile-friendly and keep selections persistent.",
    references: [{ title: "Baymard: Product Lists", url: "https://baymard.com/blog/ecommerce-product-lists" }],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return { checkId: "filter-sort", status: "warn", evidence: ["No HTML fetch adapter configured"], urlsTested: [ctx.url] };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const res = detectFilterSort(html);

    if (res.hasFilters && res.hasSort) {
      return { checkId: "filter-sort", status: "pass", evidence: res.evidence, urlsTested: [finalUrl ?? ctx.url] };
    }

    if (!res.hasFilters && !res.hasSort) {
      return {
        checkId: "filter-sort",
        status: "warn",
        evidence: ["No filter/sort UI detected (may be a non-collection page)"],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    return {
      checkId: "filter-sort",
      status: "warn",
      evidence: [
        ...(res.evidence.length ? res.evidence : []),
        !res.hasFilters ? "Missing filters" : "",
        !res.hasSort ? "Missing sorting" : "",
      ].filter(Boolean),
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectFilterSort };
