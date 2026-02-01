import type { AuditCheck } from "./types";

function detectShippingInfo(html: string): { found: string[]; hasShippingInfo: boolean } {
  const found: string[] = [];

  // Free shipping mentions
  const freeShippingPatterns = [
    { pattern: /free\s*shipping/i, name: "Free Shipping" },
    { pattern: /free\s*delivery/i, name: "Free Delivery" },
    { pattern: /ships?\s*free/i, name: "Ships Free" },
  ];

  // Shipping cost/options
  const shippingCostPatterns = [
    { pattern: /shipping[:\s]*\$?\d+/i, name: "Shipping Cost" },
    { pattern: /delivery[:\s]*\$?\d+/i, name: "Delivery Cost" },
    { pattern: /flat\s*rate\s*shipping/i, name: "Flat Rate Shipping" },
    { pattern: /calculated\s*(at\s*checkout|shipping)/i, name: "Calculated Shipping" },
  ];

  // Delivery time
  const deliveryTimePatterns = [
    { pattern: /delivers?\s*in\s*\d+/i, name: "Delivery Time" },
    { pattern: /arrives?\s*(by|in|on)/i, name: "Arrival Date" },
    { pattern: /\d+[-–]\d+\s*(business\s*)?(days?|weeks?)/i, name: "Delivery Timeframe" },
    { pattern: /same\s*day|next\s*day|express/i, name: "Express Delivery" },
    { pattern: /standard\s*shipping/i, name: "Standard Shipping" },
  ];

  // Shipping threshold
  const thresholdPatterns = [
    { pattern: /free\s*(shipping|delivery)\s*(on|over|for)\s*(orders?\s*)?(over\s*)?\$?\d+/i, name: "Free Shipping Threshold" },
    { pattern: /spend\s*\$?\d+.*free\s*shipping/i, name: "Free Shipping Threshold" },
  ];

  for (const item of [...freeShippingPatterns, ...shippingCostPatterns, ...deliveryTimePatterns, ...thresholdPatterns]) {
    if (item.pattern.test(html)) {
      if (!found.includes(item.name)) {
        found.push(item.name);
      }
    }
  }

  return { found, hasShippingInfo: found.length > 0 };
}

export const shippingInfoCheck: AuditCheck = {
  definition: {
    id: "shipping-info",
    title: "Shipping Information Visibility",
    category: "conversion",
    severity: "high",
    whyImportant:
      "Unexpected shipping costs are the #1 reason for cart abandonment. Clear shipping information early in the journey builds trust and reduces checkout surprises.",
    howToFix:
      "Display shipping costs/options on product pages and in cart. Show free shipping thresholds prominently. Provide estimated delivery dates. Make returns policy easy to find.",
    references: [
      {
        title: "Baymard: Shipping Thresholds",
        url: "https://baymard.com/blog/free-shipping-threshold",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "shipping-info",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const { found, hasShippingInfo } = detectShippingInfo(html);

    if (hasShippingInfo) {
      return {
        checkId: "shipping-info",
        status: "pass",
        evidence: [`Found shipping info: ${found.join(", ")}`],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    return {
      checkId: "shipping-info",
      status: "fail",
      evidence: ["No shipping information displayed on page"],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectShippingInfo };
