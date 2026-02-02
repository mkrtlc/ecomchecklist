import type { AuditCheck } from "./types";

export const thirdPartyScriptsCheck: AuditCheck = {
  definition: {
    id: "third-party-scripts",
    title: "Third-Party Scripts Impact",
    category: "performance",
    severity: "major",
    whyImportant:
      "Third-party scripts (analytics, ads, chat widgets) can significantly impact page load performance. Unoptimized third-party code is a leading cause of poor Core Web Vitals scores.",
    howToFix:
      "Audit third-party scripts for necessity. Load non-critical scripts with async/defer. Consider self-hosting critical third-party code. Use facades for heavy widgets like chat or video embeds.",
    references: [
      {
        title: "web.dev - Third-Party JavaScript",
        url: "https://web.dev/optimizing-content-efficiency-loading-third-party-javascript/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "third-party-scripts",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      const currentHost = new URL(ctx.url).hostname;
      
      // Find all script tags
      const scriptTags = html.match(/<script[^>]*>/gi) || [];
      
      let thirdPartyCount = 0;
      let asyncCount = 0;
      let deferCount = 0;
      let blockingCount = 0;
      const thirdPartyDomains = new Set<string>();
      
      // Known heavy third-party patterns
      const heavyThirdParties = [
        'facebook', 'fb.com', 'twitter', 'linkedin', 'instagram',
        'hotjar', 'crazyegg', 'fullstory', 'mouseflow',
        'intercom', 'drift', 'zendesk', 'crisp', 'tawk',
        'youtube', 'vimeo', 'wistia',
      ];
      
      const detectedHeavy: string[] = [];

      for (const script of scriptTags) {
        const srcMatch = script.match(/src=["']([^"']+)["']/i);
        if (srcMatch) {
          try {
            const srcUrl = new URL(srcMatch[1], ctx.url);
            const domain = srcUrl.hostname;
            
            if (domain !== currentHost && !domain.includes(currentHost)) {
              thirdPartyCount++;
              thirdPartyDomains.add(domain.replace(/^www\./, ''));
              
              // Check if blocking
              const isAsync = script.includes(' async');
              const isDefer = script.includes(' defer');
              
              if (isAsync) asyncCount++;
              else if (isDefer) deferCount++;
              else blockingCount++;
              
              // Check for heavy services
              for (const heavy of heavyThirdParties) {
                if (domain.includes(heavy) || srcMatch[1].includes(heavy)) {
                  detectedHeavy.push(heavy);
                  break;
                }
              }
            }
          } catch {
            // Invalid URL
          }
        }
      }

      const issues: string[] = [];
      
      if (blockingCount > 2) {
        issues.push(`${blockingCount} blocking third-party scripts (add async/defer)`);
      }
      
      if (detectedHeavy.length > 0) {
        issues.push(`Heavy services detected: ${[...new Set(detectedHeavy)].join(', ')}`);
      }

      const status = issues.length > 0 ? (blockingCount > 5 ? "fail" : "warn") : "pass";

      return {
        checkId: "third-party-scripts",
        status,
        evidence: [
          `Third-party scripts: ${thirdPartyCount}`,
          `Async: ${asyncCount}, Defer: ${deferCount}, Blocking: ${blockingCount}`,
          `Unique domains: ${thirdPartyDomains.size}`,
          ...issues,
        ],
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "third-party-scripts",
        status: "warn",
        evidence: ["Could not analyze third-party scripts"],
        urlsTested: [ctx.url],
      };
    }
  },
};
