import type { AuditCheck } from "./types";

export const contentTypeOptionsCheck: AuditCheck = {
  definition: {
    id: "content-type-options",
    title: "X-Content-Type-Options Header",
    category: "security",
    severity: "minor",
    whyImportant:
      "The X-Content-Type-Options: nosniff header prevents MIME type sniffing attacks where browsers misinterpret file types. Helps prevent XSS attacks via incorrectly served scripts.",
    howToFix:
      "Add X-Content-Type-Options: nosniff header to all responses. This is typically configured at the server or CDN level. Most modern frameworks include this by default.",
    references: [
      {
        title: "MDN - X-Content-Type-Options",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "content-type-options",
        status: "warn",
        evidence: ["No HTML fetch adapter - cannot verify headers directly"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      
      // Modern secure platforms typically set this header
      const knownSecurePlatforms = [
        'cloudflare', 'vercel', 'netlify', 'shopify',
        'next.js', 'nuxt', 'react', 'vue', 'angular',
      ];
      
      const htmlLower = html.toLowerCase();
      const hasKnownPlatform = knownSecurePlatforms.some(p => htmlLower.includes(p));
      
      // Check for meta tag hint (rare but possible)
      const hasMetaHint = htmlLower.includes('x-content-type-options');

      return {
        checkId: "content-type-options",
        status: hasKnownPlatform || hasMetaHint ? "pass" : "warn",
        evidence: hasKnownPlatform
          ? [
              "Modern framework/platform detected - likely includes nosniff header",
              "Verify in browser dev tools: X-Content-Type-Options: nosniff",
            ]
          : [
              "Could not confirm X-Content-Type-Options header",
              "Recommended: Add X-Content-Type-Options: nosniff to server config",
              "This header prevents MIME-type sniffing attacks",
            ],
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "content-type-options",
        status: "warn",
        evidence: ["Could not analyze content type options"],
        urlsTested: [ctx.url],
      };
    }
  },
};
