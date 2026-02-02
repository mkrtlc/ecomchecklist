import type { AuditCheck } from "./types";

function analyze404Page(html: string): { looksLike404: boolean; hasHelpfulLinks: boolean; issues: string[] } {
  const issues: string[] = [];
  const lower = html.toLowerCase();

  const looksLike404 =
    lower.includes("404") ||
    lower.includes("page not found") ||
    lower.includes("not found") ||
    lower.includes("doesn't exist") ||
    lower.includes("does not exist");

  const hasHelpfulLinks =
    lower.includes("home") ||
    lower.includes("search") ||
    lower.includes("collections") ||
    lower.includes("products") ||
    /href=["']\//i.test(html);

  if (!looksLike404) {
    issues.push("Could not confirm custom 404 messaging");
  }
  if (!hasHelpfulLinks) {
    issues.push("404 page should include helpful links (home, search, popular categories)");
  }

  return { looksLike404, hasHelpfulLinks, issues };
}

export const notFoundHandlingCheck: AuditCheck = {
  definition: {
    id: "404-handling",
    title: "Custom 404 Page",
    category: "ux",
    severity: "medium",
    whyImportant:
      "A helpful 404 page prevents users from bouncing when they hit broken links. It can redirect them to search, categories, or bestsellers to recover the session.",
    howToFix:
      "Create a custom 404 page with friendly copy, a search bar, and links to popular categories/products. Ensure it matches your site design.",
    references: [{ title: "NNGroup: 404 Pages", url: "https://www.nngroup.com/articles/404-error-pages/" }],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return { checkId: "404-handling", status: "warn", evidence: ["No HTML fetch adapter configured"], urlsTested: [ctx.url] };
    }

    // Try a random URL that should 404
    const testUrl = (ctx.url.endsWith("/") ? ctx.url.slice(0, -1) : ctx.url) + "/__ecomchecklist_404_test__";

    const { html, finalUrl } = await adapters.html.fetchHtml(testUrl);
    const analysis = analyze404Page(html);

    if (analysis.looksLike404 && analysis.hasHelpfulLinks) {
      return {
        checkId: "404-handling",
        status: "pass",
        evidence: ["Custom 404 page content detected with helpful navigation"],
        urlsTested: [finalUrl ?? testUrl],
      };
    }

    return {
      checkId: "404-handling",
      status: analysis.looksLike404 ? "warn" : "fail",
      evidence: analysis.issues,
      urlsTested: [finalUrl ?? testUrl],
    };
  },
};

export const __test__ = { analyze404Page };
