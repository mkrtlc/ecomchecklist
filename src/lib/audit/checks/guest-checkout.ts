import type { AuditCheck } from "./types";

function detectsGuestCheckoutOption(html: string): boolean | null {
  const lower = html.toLowerCase();

  // Positive signals: guest checkout options
  const guestSignals = [
    "guest checkout",
    "checkout as guest",
    "continue as guest",
    "skip login",
    "no account needed",
    "without creating an account",
    "without registering",
  ];

  for (const signal of guestSignals) {
    if (lower.includes(signal)) return true;
  }

  // Negative signals: forced account creation
  const forcedAccountSignals = [
    "create an account to continue",
    "sign up to checkout",
    "register to continue",
    "login required",
    "account required",
  ];

  for (const signal of forcedAccountSignals) {
    if (lower.includes(signal)) return false;
  }

  // Check for common checkout form without login wall
  const hasEmailField = lower.includes('type="email"') || lower.includes("name=\"email\"");
  const hasNoLoginWall = !lower.includes("login") && !lower.includes("sign in");
  
  if (hasEmailField && hasNoLoginWall) return true;

  return null; // Can't determine
}

export const guestCheckoutCheck: AuditCheck = {
  definition: {
    id: "guest-checkout",
    title: "Guest Checkout Available",
    category: "conversion",
    severity: "critical",
    whyImportant:
      "Forcing account creation at checkout is a top reason for cart abandonment. 24% of shoppers abandon carts when forced to create an account.",
    howToFix:
      "Enable guest checkout option. Collect email for order updates without requiring full registration. Offer optional account creation post-purchase.",
    references: [
      {
        title: "Baymard: Account Creation Abandonment",
        url: "https://baymard.com/blog/checkout-guest-accounts",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "guest-checkout",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const checkoutUrl = ctx.url.endsWith("/") ? `${ctx.url}checkout` : `${ctx.url}/checkout`;
    const { html, finalUrl } = await adapters.html.fetchHtml(checkoutUrl);

    const hasGuestCheckout = detectsGuestCheckoutOption(html);
    
    if (hasGuestCheckout === null) {
      return {
        checkId: "guest-checkout",
        status: "warn",
        evidence: ["Could not reliably detect guest checkout option"],
        urlsTested: [finalUrl ?? checkoutUrl],
      };
    }

    return {
      checkId: "guest-checkout",
      status: hasGuestCheckout ? "pass" : "fail",
      evidence: [hasGuestCheckout ? "Guest checkout option detected" : "No guest checkout option found - may require account"],
      urlsTested: [finalUrl ?? checkoutUrl],
    };
  },
};

export const __test__ = { detectsGuestCheckoutOption };
