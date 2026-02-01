import type { AuditCheck } from "./types";

function detectUrgencyElements(html: string): { found: string[]; hasUrgency: boolean } {
  const found: string[] = [];

  // Stock/inventory urgency
  const stockPatterns = [
    { pattern: /only\s*\d+\s*(left|remaining|in\s*stock)/i, name: "Low Stock Warning" },
    { pattern: /limited\s*(stock|quantity|availability)/i, name: "Limited Stock" },
    { pattern: /selling\s*fast|almost\s*gone|hurry/i, name: "Selling Fast" },
    { pattern: /last\s*(one|few|chance)/i, name: "Last Items" },
    { pattern: /in\s*stock|available\s*now/i, name: "Stock Status" },
  ];

  // Time-based urgency
  const timePatterns = [
    { pattern: /ends?\s*(today|tonight|soon|in\s*\d+)/i, name: "Time-Limited Offer" },
    { pattern: /countdown|timer|expires?/i, name: "Countdown Timer" },
    { pattern: /flash\s*sale|limited\s*time/i, name: "Flash Sale" },
    { pattern: /order\s*(within|in|by)\s*\d+\s*(hour|minute|h|m)/i, name: "Order Deadline" },
    { pattern: /today\s*only|24.?hour/i, name: "Today Only" },
  ];

  // Social proof urgency
  const socialPatterns = [
    { pattern: /\d+\s*people\s*(are\s*)?(viewing|watching|bought|looking)/i, name: "Live Viewer Count" },
    { pattern: /\d+\s*sold\s*(today|this\s*week|recently)/i, name: "Recent Sales" },
    { pattern: /popular|bestseller|trending/i, name: "Popularity Indicator" },
  ];

  for (const item of [...stockPatterns, ...timePatterns, ...socialPatterns]) {
    if (item.pattern.test(html)) {
      found.push(item.name);
    }
  }

  return { found: [...new Set(found)], hasUrgency: found.length > 0 };
}

export const urgencyElementsCheck: AuditCheck = {
  definition: {
    id: "urgency-elements",
    title: "Urgency & Scarcity Elements",
    category: "conversion",
    severity: "medium",
    whyImportant:
      "Urgency and scarcity elements (stock levels, countdown timers, limited offers) create FOMO and encourage faster purchase decisions. They can significantly boost conversion rates when used authentically.",
    howToFix:
      "Display real-time stock levels on product pages. Use countdown timers for genuine promotions. Show social proof like 'X people viewing' or 'Y sold today'. Ensure all urgency claims are truthful.",
    references: [
      {
        title: "CXL: Urgency and Scarcity",
        url: "https://cxl.com/blog/urgency-scarcity/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "urgency-elements",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const { found, hasUrgency } = detectUrgencyElements(html);

    if (hasUrgency) {
      return {
        checkId: "urgency-elements",
        status: "pass",
        evidence: [`Found urgency elements: ${found.join(", ")}`],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    // Urgency elements are recommended but not critical
    return {
      checkId: "urgency-elements",
      status: "warn",
      evidence: ["No urgency or scarcity elements detected (consider adding stock levels, limited offers)"],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectUrgencyElements };
