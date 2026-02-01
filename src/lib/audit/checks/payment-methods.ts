import type { AuditCheck } from "./types";

function detectPaymentMethods(html: string): { methods: string[]; hasMultipleMethods: boolean } {
  const methods: string[] = [];
  const lower = html.toLowerCase();

  const paymentPatterns = [
    { pattern: /visa/i, name: "Visa" },
    { pattern: /mastercard|master\s*card/i, name: "Mastercard" },
    { pattern: /amex|american\s*express/i, name: "Amex" },
    { pattern: /discover/i, name: "Discover" },
    { pattern: /paypal/i, name: "PayPal" },
    { pattern: /apple\s*pay/i, name: "Apple Pay" },
    { pattern: /google\s*pay/i, name: "Google Pay" },
    { pattern: /shop\s*pay/i, name: "Shop Pay" },
    { pattern: /afterpay/i, name: "Afterpay" },
    { pattern: /klarna/i, name: "Klarna" },
    { pattern: /affirm/i, name: "Affirm" },
    { pattern: /zip\s*pay|quadpay/i, name: "Buy Now Pay Later" },
    { pattern: /amazon\s*pay/i, name: "Amazon Pay" },
    { pattern: /stripe/i, name: "Stripe" },
    { pattern: /venmo/i, name: "Venmo" },
    { pattern: /cryptocurrency|bitcoin|crypto/i, name: "Cryptocurrency" },
  ];

  for (const item of paymentPatterns) {
    if (item.pattern.test(html)) {
      methods.push(item.name);
    }
  }

  // Check for generic payment icons
  if (/payment.?method|we\s*accept|accepted\s*payment/i.test(lower)) {
    if (methods.length === 0) {
      methods.push("Payment Section Detected");
    }
  }

  return { methods: [...new Set(methods)], hasMultipleMethods: methods.length >= 2 };
}

export const paymentMethodsCheck: AuditCheck = {
  definition: {
    id: "payment-methods",
    title: "Multiple Payment Options",
    category: "conversion",
    severity: "high",
    whyImportant:
      "Limited payment options cause abandonment. Offering multiple methods (cards, PayPal, Apple Pay, BNPL) increases conversions and average order value.",
    howToFix:
      "Accept major credit cards (Visa, Mastercard, Amex). Add digital wallets (PayPal, Apple Pay, Google Pay). Consider BNPL options (Afterpay, Klarna) for higher AOV. Display payment icons in footer and checkout.",
    references: [
      {
        title: "Baymard: Payment Methods",
        url: "https://baymard.com/blog/payment-method-selection",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "payment-methods",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const { methods, hasMultipleMethods } = detectPaymentMethods(html);

    if (hasMultipleMethods) {
      return {
        checkId: "payment-methods",
        status: "pass",
        evidence: [`Found payment methods: ${methods.join(", ")}`],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    if (methods.length === 1) {
      return {
        checkId: "payment-methods",
        status: "warn",
        evidence: [`Only found: ${methods[0]}. Consider adding more payment options.`],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    return {
      checkId: "payment-methods",
      status: "fail",
      evidence: ["No payment method indicators detected on page"],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectPaymentMethods };
