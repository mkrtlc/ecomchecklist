import type { AuditCheck } from "./types";

function detectMixedContent(html: string, baseUrl: string): string[] {
  const issues: string[] = [];
  const isHttpsSite = baseUrl.startsWith("https://");
  
  if (!isHttpsSite) return [];

  // Check for http:// references in common resource attributes
  const httpPatterns = [
    /src=["']http:\/\/[^"']+["']/gi,
    /href=["']http:\/\/[^"']+["']/gi,
    /url\(["']?http:\/\/[^)"']+["']?\)/gi,
  ];

  for (const pattern of httpPatterns) {
    const matches = html.match(pattern) || [];
    for (const match of matches) {
      // Exclude external links that are acceptable
      if (match.includes('href="http://') && !match.includes(".css") && !match.includes(".js")) {
        continue; // Regular links to external HTTP sites are okay
      }
      issues.push(match.slice(0, 100)); // Truncate long matches
    }
  }

  return issues.slice(0, 10); // Return first 10 issues
}

export const mixedContentCheck: AuditCheck = {
  definition: {
    id: "mixed-content",
    title: "No Mixed Content",
    category: "security",
    severity: "high",
    whyImportant:
      "Mixed content (loading HTTP resources on HTTPS pages) breaks the security chain and triggers browser warnings. This erodes customer trust and may block resources.",
    howToFix:
      "Update all resource URLs to use HTTPS or protocol-relative URLs. Check images, scripts, stylesheets, and fonts. Use Content-Security-Policy to enforce HTTPS.",
    references: [
      {
        title: "MDN: Mixed Content",
        url: "https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "mixed-content",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const issues = detectMixedContent(html, finalUrl ?? ctx.url);

    if (issues.length === 0) {
      return {
        checkId: "mixed-content",
        status: "pass",
        evidence: ["No mixed content detected"],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    return {
      checkId: "mixed-content",
      status: "fail",
      evidence: [`Found ${issues.length} mixed content issue(s)`, ...issues.slice(0, 3)],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { detectMixedContent };
