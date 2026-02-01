import type { AuditCheck } from "./types";

function detectsAtcAboveFold(html: string): boolean | null {
  const lower = html.toLowerCase();

  // Look for Add to Cart button patterns
  const atcPatterns = [
    "add to cart",
    "add to bag",
    "add to basket",
    "buy now",
    "purchase",
    'data-action="add-to-cart"',
    'class="add-to-cart',
    'id="add-to-cart',
    "addtocart",
  ];

  let hasAtcButton = false;
  for (const pattern of atcPatterns) {
    if (lower.includes(pattern)) {
      hasAtcButton = true;
      break;
    }
  }

  if (!hasAtcButton) return null;

  // Heuristic: If ATC appears in first ~30% of HTML, likely above fold
  // This is a rough approximation without actual viewport rendering
  const firstThird = lower.slice(0, Math.floor(lower.length * 0.35));
  
  for (const pattern of atcPatterns) {
    if (firstThird.includes(pattern)) {
      return true;
    }
  }

  return false;
}

export const atcAboveFoldCheck: AuditCheck = {
  definition: {
    id: "atc-above-fold",
    title: "Add to Cart Above Fold",
    category: "conversion",
    severity: "high",
    whyImportant:
      "The Add to Cart button should be immediately visible without scrolling on product pages. Hidden CTAs significantly reduce conversion rates.",
    howToFix:
      "Ensure ATC button is visible in initial viewport on desktop and mobile. Consider sticky ATC for long product pages. Remove unnecessary content above the fold.",
    references: [
      {
        title: "NNGroup: Above the Fold",
        url: "https://www.nngroup.com/articles/page-fold-manifesto/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "atc-above-fold",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    // Use the provided URL (ideally a product page)
    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);

    const isAboveFold = detectsAtcAboveFold(html);
    
    if (isAboveFold === null) {
      return {
        checkId: "atc-above-fold",
        status: "warn",
        evidence: ["Could not detect Add to Cart button"],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    return {
      checkId: "atc-above-fold",
      status: isAboveFold ? "pass" : "fail",
      evidence: [isAboveFold ? "Add to Cart appears early in page (likely above fold)" : "Add to Cart may be below fold"],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectsAtcAboveFold };
