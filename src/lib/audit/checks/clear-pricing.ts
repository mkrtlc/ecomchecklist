import type { AuditCheck } from "./types";

function detectPricing(html: string): { hasPrice: boolean; hasCurrency: boolean; hasComparison: boolean; issues: string[] } {
  const issues: string[] = [];

  // Look for price patterns
  const pricePatterns = [
    /\$\s*\d+(?:\.\d{2})?/,                    // $99.99
    /€\s*\d+(?:[.,]\d{2})?/,                   // €99,99
    /£\s*\d+(?:\.\d{2})?/,                     // £99.99
    /USD|EUR|GBP|CAD|AUD/i,                    // Currency codes
    /price[:\s]*\d+/i,                         // price: 99
    /class=["'][^"']*price[^"']*["']/i,        // price class
    /data-price|itemprop=["']price["']/i,      // data attributes
  ];

  let hasPrice = false;
  let hasCurrency = false;

  for (const pattern of pricePatterns) {
    if (pattern.test(html)) {
      hasPrice = true;
      break;
    }
  }

  // Check for currency symbols
  if (/[$€£¥₹]/.test(html)) {
    hasCurrency = true;
  }

  // Check for comparison/discount pricing
  const comparisonPatterns = [
    /was\s*\$?\d+|original\s*price/i,
    /sale\s*price|now\s*\$?\d+/i,
    /save\s*\$?\d+|discount/i,
    /compare\s*at|regular\s*price/i,
    /(line-through|strikethrough|was-price)/i,
  ];

  let hasComparison = false;
  for (const pattern of comparisonPatterns) {
    if (pattern.test(html)) {
      hasComparison = true;
      break;
    }
  }

  if (!hasPrice) {
    issues.push("No clear price display detected");
  }

  if (hasPrice && !hasCurrency) {
    issues.push("Price may be missing currency symbol");
  }

  return { hasPrice, hasCurrency, hasComparison, issues };
}

export const clearPricingCheck: AuditCheck = {
  definition: {
    id: "clear-pricing",
    title: "Clear Price Display",
    category: "conversion",
    severity: "critical",
    whyImportant:
      "Hidden or unclear pricing is a top reason for cart abandonment. Customers need to see the price immediately and clearly to make purchase decisions.",
    howToFix:
      "Display prices prominently with currency symbols. Show original vs. sale prices when discounting. Include tax/shipping disclaimers where applicable. Use proper price formatting for your locale.",
    references: [
      {
        title: "Baymard: Price Presentation",
        url: "https://baymard.com/blog/price-presentation",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "clear-pricing",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const { hasPrice, hasCurrency, hasComparison, issues } = detectPricing(html);

    if (hasPrice && hasCurrency) {
      const evidence = ["Clear pricing with currency symbol detected"];
      if (hasComparison) {
        evidence.push("Comparison/discount pricing found");
      }
      return {
        checkId: "clear-pricing",
        status: "pass",
        evidence,
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    if (hasPrice) {
      return {
        checkId: "clear-pricing",
        status: "warn",
        evidence: issues.length > 0 ? issues : ["Price found but currency may be unclear"],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    return {
      checkId: "clear-pricing",
      status: "fail",
      evidence: issues.length > 0 ? issues : ["No price display detected"],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectPricing };
