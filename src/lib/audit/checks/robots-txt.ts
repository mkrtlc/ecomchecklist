import type { AuditCheck } from "./types";

function analyzeRobotsTxt(content: string): { isValid: boolean; hasRules: boolean; issues: string[] } {
  const issues: string[] = [];
  const lines = content.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));

  if (lines.length === 0) {
    return { isValid: false, hasRules: false, issues: ["robots.txt is empty or contains only comments"] };
  }

  let hasUserAgent = false;
  let hasDisallow = false;
  let hasSitemap = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith("user-agent:")) hasUserAgent = true;
    if (lower.startsWith("disallow:") || lower.startsWith("allow:")) hasDisallow = true;
    if (lower.startsWith("sitemap:")) hasSitemap = true;
  }

  if (!hasUserAgent) {
    issues.push("No User-agent directive found");
  }

  if (!hasSitemap) {
    issues.push("Consider adding Sitemap directive");
  }

  // Check for overly restrictive rules
  if (content.includes("Disallow: /") && !content.includes("Disallow: / ")) {
    const disallowAll = lines.some(l => l.toLowerCase().trim() === "disallow: /");
    if (disallowAll) {
      issues.push("Warning: Disallow: / blocks all crawling");
    }
  }

  return {
    isValid: hasUserAgent,
    hasRules: hasUserAgent && (hasDisallow || hasSitemap),
    issues,
  };
}

export const robotsTxtCheck: AuditCheck = {
  definition: {
    id: "robots-txt",
    title: "robots.txt File",
    category: "seo",
    severity: "medium",
    whyImportant:
      "robots.txt tells search engines which pages to crawl. A missing or misconfigured robots.txt can lead to important pages not being indexed, or private pages being exposed.",
    howToFix:
      "Create a robots.txt file at your domain root. Include User-agent, Disallow/Allow rules, and a Sitemap directive. Test with Google Search Console's robots.txt Tester.",
    references: [
      {
        title: "Google: robots.txt",
        url: "https://developers.google.com/search/docs/advanced/robots/intro",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "robots-txt",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    // Construct robots.txt URL
    let robotsUrl: string;
    try {
      const urlObj = new URL(ctx.url);
      robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
    } catch {
      robotsUrl = ctx.url.replace(/\/[^/]*$/, "/robots.txt");
    }

    try {
      const { html: content } = await adapters.html.fetchHtml(robotsUrl);

      // Check if we got an HTML error page instead of robots.txt
      if (content.toLowerCase().includes("<!doctype") || content.toLowerCase().includes("<html")) {
        return {
          checkId: "robots-txt",
          status: "fail",
          evidence: ["robots.txt not found (received HTML error page)"],
          urlsTested: [robotsUrl],
        };
      }

      const { isValid, hasRules, issues } = analyzeRobotsTxt(content);

      const evidence: string[] = [];
      if (hasRules) {
        evidence.push("robots.txt exists with valid rules");
      } else if (isValid) {
        evidence.push("robots.txt exists but may need more rules");
      }
      evidence.push(...issues);

      return {
        checkId: "robots-txt",
        status: isValid ? (issues.length > 1 ? "warn" : "pass") : "fail",
        evidence,
        urlsTested: [robotsUrl],
      };
    } catch {
      return {
        checkId: "robots-txt",
        status: "fail",
        evidence: ["Could not fetch robots.txt"],
        urlsTested: [robotsUrl],
      };
    }
  },
};

export const __test__ = { analyzeRobotsTxt };
