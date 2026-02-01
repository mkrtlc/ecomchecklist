import type { AuditCheck } from "./types";

function estimateCheckoutStepsFromHtml(html: string): number | null {
  const lower = html.toLowerCase();

  // Common patterns: "Step 1 of 3", "step 2/4", etc.
  const ofMatch = lower.match(/step\s*\d+\s*(?:of|\/)?\s*(\d{1,2})/);
  if (ofMatch?.[1]) return Number(ofMatch[1]);

  // Breadcrumb-like: shipping > payment > review
  const keywords = ["shipping", "delivery", "payment", "billing", "review", "confirm", "information"];
  let count = 0;
  for (const k of keywords) {
    if (lower.includes(`>${k}<`) || lower.includes(k)) count++;
  }

  if (count < 2) return null;
  return Math.min(6, count);
}

export const checkoutStepsCountCheck: AuditCheck = {
  definition: {
    id: "checkout-steps-count",
    title: "Checkout Steps Count",
    category: "conversion",
    severity: "high",
    whyImportant:
      "Long, complex checkout flows increase friction and cart abandonment. Most high-performing stores keep checkout steps minimal.",
    howToFix:
      "Reduce checkout fields, combine steps where possible, enable auto-fill, and remove unnecessary upsells/forms until after purchase.",
    references: [
      {
        title: "Baymard: Checkout usability",
        url: "https://baymard.com/checkout-usability",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "checkout-steps-count",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const checkoutUrl = ctx.url.endsWith("/") ? `${ctx.url}checkout` : `${ctx.url}/checkout`;
    const { html, finalUrl } = await adapters.html.fetchHtml(checkoutUrl);

    const steps = estimateCheckoutStepsFromHtml(html);
    if (!steps) {
      return {
        checkId: "checkout-steps-count",
        status: "warn",
        evidence: ["Could not reliably detect checkout steps"],
        urlsTested: [finalUrl ?? checkoutUrl],
      };
    }

    const status = steps <= 3 ? "pass" : steps === 4 ? "warn" : "fail";

    return {
      checkId: "checkout-steps-count",
      status,
      evidence: [`Detected ~${steps} checkout steps`],
      urlsTested: [finalUrl ?? checkoutUrl],
    };
  },
};

export const __test__ = { estimateCheckoutStepsFromHtml };
