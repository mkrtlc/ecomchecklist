import type { AuditCheck } from "./types";

export const xFrameOptionsCheck: AuditCheck = {
  definition: {
    id: "x-frame-options",
    title: "Clickjacking Protection",
    category: "security",
    severity: "high",
    whyImportant:
      "X-Frame-Options and frame-ancestors CSP prevent clickjacking attacks where attackers embed your site in hidden iframes to steal clicks/credentials. Critical for checkout and login pages.",
    howToFix:
      "Add X-Frame-Options: DENY or SAMEORIGIN header. Better: use Content-Security-Policy: frame-ancestors 'self'. Both prevent your pages from being embedded in malicious iframes.",
    references: [
      {
        title: "OWASP - Clickjacking Defense",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "x-frame-options",
        status: "warn",
        evidence: ["No HTML fetch adapter - cannot check headers directly"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      
      // Check for CSP frame-ancestors meta tag
      const hasFrameAncestors = html.includes('frame-ancestors');
      
      // Check for X-Frame-Options meta tag (less common but possible)
      const hasXFrameOptionsMeta = html.toLowerCase().includes('x-frame-options');
      
      // Look for common secure platforms that set this by default
      const knownSecurePlatforms = [
        'shopify', 'bigcommerce', 'wix', 'squarespace',
        'salesforce', 'magento', 'woocommerce',
      ];
      
      const hasKnownPlatform = knownSecurePlatforms.some(p => 
        html.toLowerCase().includes(p)
      );

      const hasProtection = hasFrameAncestors || hasXFrameOptionsMeta || hasKnownPlatform;

      return {
        checkId: "x-frame-options",
        status: hasProtection ? "pass" : "warn",
        evidence: hasProtection
          ? [
              hasFrameAncestors ? "CSP frame-ancestors detected in page" : "",
              hasKnownPlatform ? "Platform typically includes clickjacking protection" : "",
              "Verify X-Frame-Options or CSP frame-ancestors header in browser dev tools",
            ].filter(Boolean)
          : [
              "Could not detect clickjacking protection",
              "Recommended: Add X-Frame-Options: DENY header",
              "Or use CSP: frame-ancestors 'self'",
            ],
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "x-frame-options",
        status: "warn",
        evidence: ["Could not check clickjacking protection"],
        urlsTested: [ctx.url],
      };
    }
  },
};
