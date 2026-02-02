import type { AuditCheck } from "./types";

export const minifiedAssetsCheck: AuditCheck = {
  definition: {
    id: "minified-assets",
    title: "Minified Assets",
    category: "performance",
    severity: "nice",
    whyImportant:
      "Minifying CSS and JavaScript removes whitespace and comments, reducing file sizes by 10-30%. Unminified assets increase load times and bandwidth costs.",
    howToFix:
      "Use build tools like Webpack, Vite, or esbuild to minify assets. Most frameworks do this automatically in production builds. Verify .min.js and .min.css versions are served.",
    references: [
      {
        title: "web.dev - Minify CSS",
        url: "https://web.dev/minify-css/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "minified-assets",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      
      // Check for minified asset patterns
      const jsFiles = html.match(/src=["']([^"']*\.js[^"']*)["']/gi) || [];
      const cssFiles = html.match(/href=["']([^"']*\.css[^"']*)["']/gi) || [];
      
      const minifiedPatterns = ['.min.', '-min.', '.bundle.', '.prod.', '_min'];
      const unminifiedHints = ['.dev.', '-dev.', '.debug.', '-debug.'];
      
      let minifiedCount = 0;
      let unminifiedCount = 0;
      const unminifiedAssets: string[] = [];
      
      for (const file of [...jsFiles, ...cssFiles]) {
        const src = file.match(/(?:src|href)=["']([^"']+)["']/i)?.[1] || "";
        
        if (minifiedPatterns.some(p => src.includes(p))) {
          minifiedCount++;
        } else if (unminifiedHints.some(p => src.includes(p))) {
          unminifiedCount++;
          unminifiedAssets.push(src.split('/').pop() || src);
        } else if (src.endsWith('.js') || src.endsWith('.css')) {
          // Ambiguous - could be minified without .min in name
          minifiedCount++;
        }
      }

      // Check inline scripts/styles for minification hints
      const inlineScripts = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
      const hasLargeUnminifiedInline = inlineScripts.some(script => {
        const content = script.replace(/<\/?script[^>]*>/gi, '');
        // Check for excessive whitespace/newlines (hint of unminified)
        const lines = content.split('\n').filter(l => l.trim());
        return lines.length > 50 && content.includes('  '); // Multiple spaces
      });

      const issues: string[] = [];
      if (unminifiedCount > 0) {
        issues.push(`Found ${unminifiedCount} potentially unminified asset(s): ${unminifiedAssets.slice(0, 3).join(', ')}`);
      }
      if (hasLargeUnminifiedInline) {
        issues.push("Large inline scripts may not be minified");
      }

      return {
        checkId: "minified-assets",
        status: issues.length > 0 ? "warn" : "pass",
        evidence: issues.length > 0
          ? issues
          : [`Found ${minifiedCount} properly named asset(s)`, "Assets appear to be minified"],
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "minified-assets",
        status: "warn",
        evidence: ["Could not analyze assets"],
        urlsTested: [ctx.url],
      };
    }
  },
};
