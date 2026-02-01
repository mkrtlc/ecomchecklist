import type { AuditCheck } from "./types";

function hostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

export const sslValidationCheck: AuditCheck = {
  definition: {
    id: "ssl-validation",
    title: "SSL Validation",
    category: "security",
    severity: "critical",
    whyImportant:
      "SSL protects customer data during browsing and checkout. Invalid/expired certificates break trust and can block purchases.",
    howToFix:
      "Install a valid SSL certificate (e.g., via your host/CDN), ensure it covers all domains (www/non-www), enable automatic renewals, and force HTTPS redirects.",
    references: [
      { title: "Mozilla SSL Configuration Generator", url: "https://ssl-config.mozilla.org/" },
    ],
  },

  async run(ctx, adapters) {
    const hostname = hostnameFromUrl(ctx.url);

    if (!adapters.ssl) {
      return {
        checkId: "ssl-validation",
        status: "warn",
        evidence: ["No SSL adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const info = await adapters.ssl.getCertificateInfo(hostname);

    const status = info.valid ? "pass" : "fail";
    const evidence: string[] = [info.valid ? "Certificate is valid" : "Certificate is invalid"];
    if (info.expiresAt) evidence.push(`Expires at: ${info.expiresAt}`);
    if (info.issuer) evidence.push(`Issuer: ${info.issuer}`);

    return {
      checkId: "ssl-validation",
      status,
      evidence,
      urlsTested: [ctx.url],
    };
  },
};
