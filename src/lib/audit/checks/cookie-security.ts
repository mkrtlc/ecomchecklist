import type { AuditCheck } from "./types";

function analyzeCookieSecurity(html: string): { issues: string[]; hasSecureIndicators: boolean } {
  const issues: string[] = [];
  const lower = html.toLowerCase();

  // Check for JavaScript that sets insecure cookies
  const insecureCookiePatterns = [
    /document\.cookie\s*=\s*["'][^"']*(?!secure)[^"']*["']/gi,
  ];

  for (const pattern of insecureCookiePatterns) {
    if (pattern.test(html)) {
      issues.push("JavaScript sets cookies without Secure flag");
    }
  }

  // Check for secure cookie indicators in meta/script
  const secureIndicators = [
    "secure;",
    "httponly",
    "samesite=strict",
    "samesite=lax",
    "__secure-",
    "__host-",
  ];

  let hasSecureIndicators = false;
  for (const indicator of secureIndicators) {
    if (lower.includes(indicator)) {
      hasSecureIndicators = true;
      break;
    }
  }

  return { issues, hasSecureIndicators };
}

export const cookieSecurityCheck: AuditCheck = {
  definition: {
    id: "cookie-security",
    title: "Cookie Security Flags",
    category: "security",
    severity: "high",
    whyImportant:
      "Secure cookie flags (Secure, HttpOnly, SameSite) protect session data from theft and CSRF attacks. E-commerce sites handle sensitive session and cart data that must be protected.",
    howToFix:
      "Set Secure flag on all cookies (HTTPS only). Set HttpOnly to prevent JavaScript access to session cookies. Use SameSite=Strict or Lax to prevent CSRF.",
    references: [
      {
        title: "OWASP: Secure Cookie Attribute",
        url: "https://owasp.org/www-community/controls/SecureCookieAttribute",
      },
      {
        title: "MDN: Set-Cookie",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "cookie-security",
        status: "warn",
        evidence: ["No HTML fetch adapter configured - full cookie analysis requires HTTP headers"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const { issues, hasSecureIndicators } = analyzeCookieSecurity(html);

    if (issues.length > 0) {
      return {
        checkId: "cookie-security",
        status: "fail",
        evidence: issues,
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    // Without header access, we can only do partial analysis
    return {
      checkId: "cookie-security",
      status: hasSecureIndicators ? "pass" : "warn",
      evidence: [
        hasSecureIndicators
          ? "Secure cookie indicators found in page"
          : "Could not verify cookie security flags (requires HTTP header inspection)",
      ],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { analyzeCookieSecurity };
