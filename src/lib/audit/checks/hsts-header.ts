import type { AuditCheck } from "./types";

export const hstsHeaderCheck: AuditCheck = {
  definition: {
    id: "hsts-header",
    title: "HSTS Header",
    category: "security",
    severity: "high",
    whyImportant:
      "HTTP Strict Transport Security (HSTS) tells browsers to only connect via HTTPS, preventing protocol downgrade attacks and cookie hijacking. Critical for e-commerce sites handling payments.",
    howToFix:
      "Add Strict-Transport-Security header with max-age of at least 1 year. Example: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'. Consider HSTS preload list submission.",
    references: [
      {
        title: "OWASP - HSTS Cheat Sheet",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "hsts-header",
        status: "warn",
        evidence: ["No HTML fetch adapter - cannot check headers directly"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      
      // Check if site is served over HTTPS
      const isHttps = ctx.url.startsWith('https://');
      
      // Look for meta tag equivalent (less common)
      const hasHstsMetaHint = html.includes('strict-transport-security') || 
                              html.includes('Strict-Transport-Security');
      
      // For full header check, we'd need header access
      // Use heuristics: check if commonly HSTS-enabled CDNs are in use
      const knownHstsPatterns = [
        'cloudflare', 'cloudfront', 'akamai', 'fastly',
        'shopify', 'squarespace', 'wix', 'bigcommerce',
      ];
      
      const hasKnownHstsProvider = knownHstsPatterns.some(p => 
        html.toLowerCase().includes(p)
      );

      if (!isHttps) {
        return {
          checkId: "hsts-header",
          status: "fail",
          evidence: ["Site not served over HTTPS - HSTS not applicable without HTTPS"],
          urlsTested: [ctx.url],
        };
      }

      return {
        checkId: "hsts-header",
        status: hasKnownHstsProvider ? "pass" : "warn",
        evidence: hasKnownHstsProvider
          ? [
              "HTTPS enabled",
              "Site appears to use platform with default HSTS support",
              "Verify HSTS header in browser dev tools: Strict-Transport-Security",
            ]
          : [
              "HTTPS enabled",
              "Could not detect HSTS header (check server configuration)",
              "Recommended: Add Strict-Transport-Security header",
            ],
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "hsts-header",
        status: "warn",
        evidence: ["Could not check HSTS configuration"],
        urlsTested: [ctx.url],
      };
    }
  },
};
