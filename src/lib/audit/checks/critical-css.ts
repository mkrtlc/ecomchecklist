import type { AuditCheck } from "./types";

export const criticalCssCheck: AuditCheck = {
  definition: {
    id: "critical-css",
    title: "Critical CSS Inlining",
    category: "performance",
    severity: "nice",
    whyImportant:
      "Inlining critical CSS eliminates render-blocking requests for above-fold content. This dramatically improves First Contentful Paint (FCP) and Largest Contentful Paint (LCP).",
    howToFix:
      "Extract and inline critical CSS in <style> tags in <head>. Load remaining CSS asynchronously with media=\"print\" onload hack or loadCSS. Tools like Critical or Penthouse can automate extraction.",
    references: [
      {
        title: "web.dev - Extract Critical CSS",
        url: "https://web.dev/extract-critical-css/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "critical-css",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      
      // Find inline styles in head
      const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
      const headContent = headMatch?.[1] || '';
      
      const inlineStyles = headContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
      let totalInlineCssSize = 0;
      
      for (const style of inlineStyles) {
        const content = style.replace(/<\/?style[^>]*>/gi, '');
        totalInlineCssSize += content.length;
      }
      
      // Check for async CSS loading patterns
      const hasAsyncCss = 
        html.includes('media="print" onload') ||
        html.includes("media='print' onload") ||
        html.includes('loadCSS') ||
        html.includes('rel="preload" as="style"');
      
      // Check for render-blocking CSS
      const cssLinks = html.match(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi) || [];
      const blockingCssCount = cssLinks.filter(link => 
        !link.includes('media="print"') && 
        !link.includes("media='print'") &&
        !link.includes('disabled')
      ).length;
      
      // Determine if critical CSS approach is used
      const hasCriticalCss = inlineStyles.length > 0 && totalInlineCssSize > 500;
      const hasOptimizedCssLoading = hasAsyncCss || blockingCssCount <= 1;

      return {
        checkId: "critical-css",
        status: hasCriticalCss || hasOptimizedCssLoading ? "pass" : "warn",
        evidence: [
          `Inline styles in head: ${inlineStyles.length} (${Math.round(totalInlineCssSize / 1024)}KB)`,
          `External CSS links: ${cssLinks.length} (blocking: ${blockingCssCount})`,
          hasAsyncCss ? "Async CSS loading pattern detected" : "",
          hasCriticalCss ? "Critical CSS inlining detected" : "",
          blockingCssCount > 2 ? "Consider reducing render-blocking CSS" : "",
          !hasCriticalCss && blockingCssCount > 0 ? "Consider extracting and inlining critical CSS" : "",
        ].filter(Boolean),
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "critical-css",
        status: "warn",
        evidence: ["Could not analyze critical CSS"],
        urlsTested: [ctx.url],
      };
    }
  },
};
