import type { AuditCheck } from "./types";

function analyzeCSP(html: string): { hasCSP: boolean; evidence: string[] } {
  const evidence: string[] = [];
  
  // Check for CSP meta tag
  const cspMetaMatch = html.match(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i);
  
  if (cspMetaMatch) {
    evidence.push("CSP meta tag found");
    return { hasCSP: true, evidence };
  }

  // Note: Full CSP detection requires checking HTTP headers
  // We can only detect meta tag CSP from HTML
  return { hasCSP: false, evidence: ["No CSP meta tag detected (header-based CSP requires HTTP header check)"] };
}

export const cspHeadersCheck: AuditCheck = {
  definition: {
    id: "csp-headers",
    title: "Content Security Policy",
    category: "security",
    severity: "medium",
    whyImportant:
      "Content Security Policy (CSP) prevents XSS attacks and data injection by controlling which resources can load. It's a critical defense layer for e-commerce sites handling customer data.",
    howToFix:
      "Implement CSP via HTTP headers or meta tags. Start with report-only mode to identify issues. Gradually tighten policies. Use nonces or hashes for inline scripts.",
    references: [
      {
        title: "MDN: Content Security Policy",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP",
      },
      {
        title: "CSP Evaluator",
        url: "https://csp-evaluator.withgoogle.com/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "csp-headers",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const { hasCSP, evidence } = analyzeCSP(html);

    // Without header access, we can only check for meta tag CSP
    // This is a partial check - full CSP validation needs header inspection
    return {
      checkId: "csp-headers",
      status: hasCSP ? "pass" : "warn",
      evidence,
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { analyzeCSP };
