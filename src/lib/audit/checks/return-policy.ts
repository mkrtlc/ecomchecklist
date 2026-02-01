import type { AuditCheck } from "./types";

function detectReturnPolicy(html: string): { found: string[]; hasReturnInfo: boolean } {
  const found: string[] = [];

  const returnPatterns = [
    { pattern: /\d+[-–]?\s*day\s*return/i, name: "Return Period" },
    { pattern: /free\s*returns?/i, name: "Free Returns" },
    { pattern: /easy\s*returns?/i, name: "Easy Returns" },
    { pattern: /money\s*back\s*guarant/i, name: "Money-Back Guarantee" },
    { pattern: /satisfaction\s*guarant/i, name: "Satisfaction Guarantee" },
    { pattern: /return\s*policy|returns?\s*&?\s*exchanges?/i, name: "Return Policy" },
    { pattern: /refund\s*policy/i, name: "Refund Policy" },
    { pattern: /no\s*hassle\s*return/i, name: "No Hassle Returns" },
    { pattern: /full\s*refund/i, name: "Full Refund" },
    { pattern: /exchange\s*policy/i, name: "Exchange Policy" },
  ];

  // Specific return windows
  const windowPatterns = [
    { pattern: /30[-–]?\s*day/i, name: "30-Day Return" },
    { pattern: /60[-–]?\s*day/i, name: "60-Day Return" },
    { pattern: /90[-–]?\s*day/i, name: "90-Day Return" },
    { pattern: /365[-–]?\s*day|1\s*year/i, name: "365-Day Return" },
  ];

  for (const item of [...returnPatterns, ...windowPatterns]) {
    if (item.pattern.test(html)) {
      found.push(item.name);
    }
  }

  return { found: [...new Set(found)], hasReturnInfo: found.length > 0 };
}

export const returnPolicyCheck: AuditCheck = {
  definition: {
    id: "return-policy",
    title: "Return Policy Visibility",
    category: "conversion",
    severity: "high",
    whyImportant:
      "Clear return policies reduce purchase anxiety. 67% of shoppers check return policies before buying. Generous, visible policies increase conversion and repeat purchases.",
    howToFix:
      "Display return policy highlights on product pages (e.g., '30-Day Free Returns'). Link to full policy from footer. Consider free returns for higher conversion rates.",
    references: [
      {
        title: "Baymard: Return Policy",
        url: "https://baymard.com/blog/return-policy-best-practices",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "return-policy",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const { found, hasReturnInfo } = detectReturnPolicy(html);

    if (hasReturnInfo) {
      return {
        checkId: "return-policy",
        status: "pass",
        evidence: [`Found return info: ${found.join(", ")}`],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    return {
      checkId: "return-policy",
      status: "fail",
      evidence: ["No return policy information detected on page"],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectReturnPolicy };
