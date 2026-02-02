import type { AuditCheck } from "./types";

export const fontLoadingCheck: AuditCheck = {
  definition: {
    id: "font-loading",
    title: "Web Font Optimization",
    category: "performance",
    severity: "nice",
    whyImportant:
      "Unoptimized web fonts cause FOIT (Flash of Invisible Text) or FOUT (Flash of Unstyled Text), hurting both UX and CLS scores. Proper font-display settings ensure text remains visible during font loading.",
    howToFix:
      "Use font-display: swap or optional in @font-face rules. Preload critical fonts with <link rel=\"preload\" as=\"font\">. Consider subsetting fonts and using woff2 format for smaller file sizes.",
    references: [
      {
        title: "web.dev - Font Best Practices",
        url: "https://web.dev/font-best-practices/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "font-loading",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      
      // Check for font preloads
      const fontPreloads = html.match(/<link[^>]+rel=["']preload["'][^>]+as=["']font["'][^>]*>/gi) || [];
      
      // Check for Google Fonts with display parameter
      const googleFonts = html.match(/fonts\.googleapis\.com[^"'\s]*/gi) || [];
      const hasDisplayParam = googleFonts.some(f => f.includes('display='));
      
      // Check for font-display in inline styles
      const fontDisplayInline = html.match(/font-display:\s*(swap|optional|fallback|block|auto)/gi) || [];
      
      // Check for woff2 font format
      const hasWoff2 = html.includes('.woff2') || html.includes('woff2');
      
      // Check for self-hosted fonts
      const selfHostedFonts = html.match(/url\([^)]*\.(woff2?|ttf|otf|eot)/gi) || [];

      const issues: string[] = [];
      const positives: string[] = [];

      if (fontPreloads.length > 0) {
        positives.push(`${fontPreloads.length} font preload(s) found`);
      }

      if (googleFonts.length > 0) {
        if (hasDisplayParam) {
          positives.push("Google Fonts using display parameter");
        } else {
          issues.push("Google Fonts missing display parameter (add &display=swap)");
        }
      }

      if (fontDisplayInline.length > 0) {
        positives.push(`font-display CSS property detected (${fontDisplayInline.length})`);
      }

      if (hasWoff2) {
        positives.push("Modern woff2 font format in use");
      }

      if (selfHostedFonts.length > 0 && fontDisplayInline.length === 0 && fontPreloads.length === 0) {
        issues.push("Self-hosted fonts may need font-display and preload optimization");
      }

      const hasOptimization = positives.length > 0;

      return {
        checkId: "font-loading",
        status: issues.length > 0 ? "warn" : hasOptimization ? "pass" : "pass",
        evidence: [...positives, ...issues].length > 0 
          ? [...positives, ...issues]
          : ["No web fonts detected or fonts appear optimized"],
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "font-loading",
        status: "warn",
        evidence: ["Could not analyze font loading"],
        urlsTested: [ctx.url],
      };
    }
  },
};
