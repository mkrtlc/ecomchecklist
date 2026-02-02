import type { AuditCheck } from "./types";

function detectProductZoom(html: string): { hasZoom: boolean; evidence: string[] } {
  const evidence: string[] = [];
  const lower = html.toLowerCase();

  const zoomSignals = [
    /zoom/i,
    /magnif/i,
    /lightbox/i,
    /gallery/i,
    /data-zoom|zoom-image|product-zoom/i,
    /pinch/i,
  ];

  const hasZoom = zoomSignals.some((p) => p.test(lower));

  if (hasZoom) evidence.push("Product zoom/gallery indicators found");

  return { hasZoom, evidence };
}

export const productZoomCheck: AuditCheck = {
  definition: {
    id: "product-zoom",
    title: "Product Image Zoom",
    category: "ux",
    severity: "nice",
    whyImportant:
      "Zoomable product images help shoppers inspect details, reducing uncertainty and returns. It's especially important for fashion, jewelry, and high-consideration products.",
    howToFix:
      "Enable image zoom on product detail pages. Support pinch-to-zoom on mobile. Provide multiple angles and a full-screen gallery.",
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return { checkId: "product-zoom", status: "warn", evidence: ["No HTML fetch adapter configured"], urlsTested: [ctx.url] };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const res = detectProductZoom(html);

    return {
      checkId: "product-zoom",
      status: res.hasZoom ? "pass" : "warn",
      evidence: res.hasZoom ? res.evidence : ["No product zoom/gallery indicators detected"],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectProductZoom };
