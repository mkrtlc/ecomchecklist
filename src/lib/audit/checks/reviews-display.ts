import type { AuditCheck } from "./types";

function detectReviews(html: string): { hasReviews: boolean; hasRatings: boolean; evidence: string[] } {
  const evidence: string[] = [];
  const lower = html.toLowerCase();

  // Check for star ratings
  const starPatterns = [
    /(\d+(\.\d+)?)\s*(out\s*of\s*5|\/\s*5|\s*stars?)/i,
    /rating[:\s]*(\d+(\.\d+)?)/i,
    /class=["'][^"']*star[^"']*["']/i,
    /★|☆|⭐/,
    /data-rating|star-rating|product-rating/i,
  ];

  let hasRatings = false;
  for (const pattern of starPatterns) {
    if (pattern.test(html)) {
      hasRatings = true;
      break;
    }
  }

  // Check for review content
  const reviewPatterns = [
    /customer\s*reviews?/i,
    /product\s*reviews?/i,
    /(\d+)\s*reviews?/i,
    /write\s*a\s*review/i,
    /verified\s*(purchase|buyer)/i,
    /helpful\s*\(\d+\)/i,
    /review-text|review-content|customer-review/i,
  ];

  let hasReviews = false;
  for (const pattern of reviewPatterns) {
    if (pattern.test(html)) {
      hasReviews = true;
      break;
    }
  }

  // Check for review platforms
  const platforms = ["trustpilot", "yotpo", "judge.me", "stamped.io", "loox", "okendo"];
  for (const platform of platforms) {
    if (lower.includes(platform)) {
      evidence.push(`${platform} integration detected`);
      hasReviews = true;
    }
  }

  if (hasRatings) evidence.push("Star ratings displayed");
  if (hasReviews) evidence.push("Customer reviews section found");

  return { hasReviews, hasRatings, evidence };
}

export const reviewsDisplayCheck: AuditCheck = {
  definition: {
    id: "reviews-display",
    title: "Customer Reviews Display",
    category: "conversion",
    severity: "high",
    whyImportant:
      "93% of consumers read reviews before buying. Displaying reviews and ratings builds trust and provides social proof, significantly impacting conversion rates.",
    howToFix:
      "Display product reviews and ratings prominently on product pages. Use a review platform (Yotpo, Judge.me, etc.). Show aggregate ratings and individual review text. Enable verified buyer badges.",
    references: [
      {
        title: "Spiegel Research: How Reviews Impact Sales",
        url: "https://spiegel.medill.northwestern.edu/how-online-reviews-influence-sales/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "reviews-display",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const { hasReviews, hasRatings, evidence } = detectReviews(html);

    if (hasReviews || hasRatings) {
      return {
        checkId: "reviews-display",
        status: "pass",
        evidence: evidence.length > 0 ? evidence : ["Review/rating elements detected"],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    return {
      checkId: "reviews-display",
      status: "fail",
      evidence: ["No customer reviews or ratings detected on page"],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectReviews };
