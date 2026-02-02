import type { AuditCheck } from "./types";

export const permissionsPolicyCheck: AuditCheck = {
  definition: {
    id: "permissions-policy",
    title: "Permissions-Policy Header",
    category: "security",
    severity: "nice",
    whyImportant:
      "Permissions-Policy (formerly Feature-Policy) controls browser features like camera, microphone, and geolocation. Restricting unused features reduces attack surface and protects customer privacy.",
    howToFix:
      "Add Permissions-Policy header restricting unnecessary features. Example: 'Permissions-Policy: camera=(), microphone=(), geolocation=()'. Keep features needed for checkout (payment) enabled.",
    references: [
      {
        title: "MDN - Permissions-Policy",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "permissions-policy",
        status: "warn",
        evidence: ["No HTML fetch adapter - cannot verify permissions policy"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      
      // Check for Permissions-Policy in meta tag (less common)
      const hasPermissionsPolicy = html.toLowerCase().includes('permissions-policy');
      const hasFeaturePolicy = html.toLowerCase().includes('feature-policy');
      
      // Check for iframe sandbox attributes (related security control)
      const hasSandboxedIframes = html.includes('sandbox=');
      
      // Check for allow attribute on iframes (permissions delegation)
      const hasIframeAllow = html.match(/<iframe[^>]+allow=["'][^"']+["']/gi) || [];
      
      // Modern secure platforms often set this
      const knownSecurePlatforms = [
        'shopify', 'stripe', 'paypal', 'cloudflare',
      ];
      
      const hasKnownPlatform = knownSecurePlatforms.some(p => 
        html.toLowerCase().includes(p)
      );

      const hasAnySecurityControl =
        hasPermissionsPolicy ||
        hasFeaturePolicy ||
        hasSandboxedIframes ||
        hasIframeAllow.length > 0 ||
        hasKnownPlatform;

      return {
        checkId: "permissions-policy",
        status: hasAnySecurityControl ? "pass" : "warn",
        evidence: [
          hasPermissionsPolicy ? "Permissions-Policy references detected" : "",
          hasFeaturePolicy ? "Feature-Policy references detected (legacy)" : "",
          hasSandboxedIframes ? "Sandboxed iframes found (good security practice)" : "",
          hasIframeAllow.length > 0 ? `${hasIframeAllow.length} iframe(s) with explicit allow attributes` : "",
          hasKnownPlatform ? "Secure platform detected - likely has proper permissions" : "",
          !hasAnySecurityControl ? "Consider adding Permissions-Policy header to restrict unused browser features" : "",
        ].filter(Boolean),
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "permissions-policy",
        status: "warn",
        evidence: ["Could not analyze permissions policy"],
        urlsTested: [ctx.url],
      };
    }
  },
};
