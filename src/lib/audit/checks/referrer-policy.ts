import type { AuditCheck } from "./types";

export const referrerPolicyCheck: AuditCheck = {
  definition: {
    id: "referrer-policy",
    title: "Referrer-Policy Header",
    category: "security",
    severity: "nice",
    whyImportant:
      "Referrer-Policy controls what referrer information is sent with requests. For e-commerce, it helps prevent leaking sensitive URL parameters (order IDs, tokens) to third parties.",
    howToFix:
      "Add Referrer-Policy: strict-origin-when-cross-origin (recommended) or no-referrer-when-downgrade. Can be set via HTTP header or <meta name=\"referrer\"> tag.",
    references: [
      {
        title: "MDN - Referrer-Policy",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "referrer-policy",
        status: "warn",
        evidence: ["No HTML fetch adapter - cannot check referrer policy"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      
      // Check for meta referrer tag
      const metaReferrerMatch = html.match(/<meta[^>]+name=["']referrer["'][^>]*content=["']([^"']+)["']/i);
      const hasMetaReferrer = metaReferrerMatch !== null;
      const metaPolicy = metaReferrerMatch?.[1];
      
      // Secure policies
      const securePolicies = [
        'no-referrer',
        'no-referrer-when-downgrade',
        'origin',
        'origin-when-cross-origin',
        'same-origin',
        'strict-origin',
        'strict-origin-when-cross-origin',
      ];
      
      const isSecurePolicy = metaPolicy ? securePolicies.includes(metaPolicy) : false;
      
      // Check for referrerpolicy attributes on links/scripts
      const hasReferrerPolicyAttr = html.includes('referrerpolicy=');

      return {
        checkId: "referrer-policy",
        status: hasMetaReferrer && isSecurePolicy ? "pass" : hasMetaReferrer || hasReferrerPolicyAttr ? "warn" : "warn",
        evidence: hasMetaReferrer
          ? [
              `Meta referrer policy: ${metaPolicy}`,
              isSecurePolicy ? "Policy is appropriately restrictive" : "Consider a more restrictive policy",
            ]
          : hasReferrerPolicyAttr
          ? [
              "Individual referrerpolicy attributes detected on elements",
              "Consider setting a global Referrer-Policy header or meta tag",
            ]
          : [
              "No Referrer-Policy detected",
              "Recommended: Add <meta name=\"referrer\" content=\"strict-origin-when-cross-origin\">",
              "Or set Referrer-Policy header at server level",
            ],
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "referrer-policy",
        status: "warn",
        evidence: ["Could not analyze referrer policy"],
        urlsTested: [ctx.url],
      };
    }
  },
};
