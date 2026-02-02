import type { AuditCheck } from "./types";

function detectSizeGuide(html: string): { hasSizeGuide: boolean; evidence: string[] } {
  const evidence: string[] = [];
  const lower = html.toLowerCase();

  const patterns = [
    /size\s*guide/i,
    /size\s*chart/i,
    /fit\s*guide/i,
    /measurements/i,
  ];

  const hasSizeGuide = patterns.some((p) => p.test(lower));
  if (hasSizeGuide) evidence.push("Size guide/chart detected");

  return { hasSizeGuide, evidence };
}

export const sizeGuideCheck: AuditCheck = {
  definition: {
    id: "size-guide",
    title: "Size Guide Available",
    category: "ux",
    severity: "medium",
    whyImportant:
      "Size uncertainty drives returns and reduces conversion, especially in apparel. A clear size guide helps customers choose correctly and buy with confidence.",
    howToFix:
      "Add a size chart/guide on product pages. Include measurements and conversion tables. Provide fit notes and model sizing where possible.",
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return { checkId: "size-guide", status: "warn", evidence: ["No HTML fetch adapter configured"], urlsTested: [ctx.url] };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const res = detectSizeGuide(html);

    return {
      checkId: "size-guide",
      status: res.hasSizeGuide ? "pass" : "warn",
      evidence: res.hasSizeGuide ? res.evidence : ["No size guide detected (recommended for apparel/footwear)"],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectSizeGuide };
