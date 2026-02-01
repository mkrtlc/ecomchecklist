import type { AuditCheck } from "./types";

function detectTrustBadges(html: string): { found: string[]; hasBadges: boolean } {
  const found: string[] = [];
  const lower = html.toLowerCase();

  // Security/Payment badges
  const securityBadges = [
    { pattern: /ssl|secure\s*checkout|256.?bit|encrypted/i, name: "SSL/Secure Checkout" },
    { pattern: /mcafee|norton|trustwave|comodo|digicert/i, name: "Security Certificate" },
    { pattern: /verified\s*by\s*visa|mastercard\s*securecode|3d\s*secure/i, name: "Payment Security" },
  ];

  // Trust/Guarantee badges
  const trustBadges = [
    { pattern: /money.?back\s*guarant|satisfaction\s*guarant|100%\s*guarant/i, name: "Money-Back Guarantee" },
    { pattern: /free\s*returns?|easy\s*returns?|no.?hassle\s*returns?/i, name: "Returns Policy" },
    { pattern: /trusted\s*shop|verified\s*seller|authorized\s*(dealer|retailer)/i, name: "Verified Seller" },
    { pattern: /better\s*business\s*bureau|bbb\s*accredited/i, name: "BBB Accredited" },
    { pattern: /trustpilot|google\s*reviews?|shopper\s*approved/i, name: "Review Platform" },
  ];

  // Payment method badges
  const paymentBadges = [
    { pattern: /visa|mastercard|amex|american\s*express|discover|paypal|apple\s*pay|google\s*pay|shop\s*pay/i, name: "Payment Methods" },
  ];

  for (const badge of [...securityBadges, ...trustBadges, ...paymentBadges]) {
    if (badge.pattern.test(html)) {
      found.push(badge.name);
    }
  }

  // Check for common trust badge image patterns
  if (/trust.?badge|secure.?badge|payment.?icon|trust.?seal/i.test(lower)) {
    found.push("Trust Badge Images");
  }

  return { found: [...new Set(found)], hasBadges: found.length > 0 };
}

export const trustBadgesCheck: AuditCheck = {
  definition: {
    id: "trust-badges",
    title: "Trust Badges & Security Seals",
    category: "conversion",
    severity: "high",
    whyImportant:
      "Trust badges and security seals reduce purchase anxiety. Studies show trust badges can increase conversions by 42%. They're especially important for first-time visitors.",
    howToFix:
      "Display SSL/security badges, payment method icons, money-back guarantees, and review platform badges (Trustpilot, Google). Place them near checkout/cart buttons and in the footer.",
    references: [
      {
        title: "Baymard: Trust Seals",
        url: "https://baymard.com/blog/trust-seal-comparison",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "trust-badges",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const { found, hasBadges } = detectTrustBadges(html);

    if (hasBadges) {
      return {
        checkId: "trust-badges",
        status: "pass",
        evidence: [`Found trust indicators: ${found.join(", ")}`],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    return {
      checkId: "trust-badges",
      status: "fail",
      evidence: ["No trust badges or security seals detected"],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectTrustBadges };
