import type { AuditCheck } from "./types";

export const httpsRedirectCheck: AuditCheck = {
  definition: {
    id: "https-redirect",
    title: "HTTPS Redirect",
    category: "security",
    severity: "critical",
    whyImportant:
      "HTTP to HTTPS redirects ensure all traffic is encrypted. Without proper redirects, customers may access insecure versions of your site, exposing sensitive data.",
    howToFix:
      "Configure server-side 301 redirects from HTTP to HTTPS. Most hosting platforms and CDNs have one-click HTTPS enforcement. Verify both www and non-www versions redirect properly.",
    references: [
      {
        title: "OWASP HTTPS Guide",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "https-redirect",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    // Convert URL to HTTP version
    const httpUrl = ctx.url.replace(/^https:\/\//, "http://");
    
    try {
      const { finalUrl } = await adapters.html.fetchHtml(httpUrl);
      
      const redirectedToHttps = finalUrl?.startsWith("https://") ?? false;

      return {
        checkId: "https-redirect",
        status: redirectedToHttps ? "pass" : "fail",
        evidence: [
          redirectedToHttps
            ? `HTTP correctly redirects to HTTPS: ${finalUrl}`
            : `HTTP does not redirect to HTTPS (final URL: ${finalUrl ?? httpUrl})`,
        ],
        urlsTested: [httpUrl],
      };
    } catch {
      return {
        checkId: "https-redirect",
        status: "warn",
        evidence: ["Could not test HTTP redirect (connection failed)"],
        urlsTested: [httpUrl],
      };
    }
  },
};
