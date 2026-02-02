import type { AuditCheck } from "./types";

function analyzeMobileResponsive(html: string): { hasViewportMeta: boolean; hasResponsiveIndicators: boolean; issues: string[] } {
  const issues: string[] = [];

  const hasViewportMeta = /<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i.test(html);
  if (!hasViewportMeta) {
    issues.push("Missing viewport meta tag (width=device-width)");
  }

  // Rough responsive indicators
  const hasResponsiveIndicators =
    /@media\s*\(max-width|max-width:\s*\d+px/i.test(html) ||
    /responsive|mobile\s*menu|hamburger|drawer/i.test(html) ||
    /bootstrap|tailwind|foundation/i.test(html);

  if (!hasResponsiveIndicators) {
    issues.push("No obvious responsive CSS/JS indicators found (heuristic)");
  }

  return { hasViewportMeta, hasResponsiveIndicators, issues };
}

export const mobileResponsiveCheck: AuditCheck = {
  definition: {
    id: "mobile-responsive",
    title: "Mobile Responsive Design",
    category: "ux",
    severity: "critical",
    whyImportant:
      "Most e-commerce traffic is mobile. Non-responsive pages are hard to navigate, reduce trust, and cause conversion drop-offs. Google also prioritizes mobile-friendly pages.",
    howToFix:
      "Add a proper viewport meta tag and use responsive layouts (flex/grid). Test on common mobile breakpoints. Ensure text is readable and buttons are tap-friendly.",
    references: [
      { title: "Google: Mobile-Friendly Test", url: "https://search.google.com/test/mobile-friendly" },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "mobile-responsive",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const analysis = analyzeMobileResponsive(html);

    if (analysis.hasViewportMeta && analysis.hasResponsiveIndicators) {
      return {
        checkId: "mobile-responsive",
        status: "pass",
        evidence: ["Viewport meta tag present and responsive indicators detected"],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    if (!analysis.hasViewportMeta) {
      return {
        checkId: "mobile-responsive",
        status: "fail",
        evidence: analysis.issues,
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    return {
      checkId: "mobile-responsive",
      status: "warn",
      evidence: analysis.issues,
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { analyzeMobileResponsive };
