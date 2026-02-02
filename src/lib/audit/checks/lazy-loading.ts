import type { AuditCheck } from "./types";

export const lazyLoadingCheck: AuditCheck = {
  definition: {
    id: "lazy-loading",
    title: "Image Lazy Loading",
    category: "performance",
    severity: "nice",
    whyImportant:
      "Lazy loading defers off-screen images until needed, reducing initial page weight and improving LCP. For product listing pages with many images, this can save megabytes of initial bandwidth.",
    howToFix:
      "Add loading=\"lazy\" to images below the fold. Keep above-fold images eager (loading=\"eager\") for LCP. Modern frameworks like Next.js handle this automatically with their Image components.",
    references: [
      {
        title: "web.dev - Lazy Loading Images",
        url: "https://web.dev/lazy-loading-images/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "lazy-loading",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    try {
      const { html } = await adapters.html.fetchHtml(ctx.url);
      
      // Find all images
      const imgTags = html.match(/<img[^>]+>/gi) || [];
      
      let lazyCount = 0;
      let eagerCount = 0;
      let noLoadingAttr = 0;
      
      for (const img of imgTags) {
        if (img.includes('loading="lazy"') || img.includes("loading='lazy'")) {
          lazyCount++;
        } else if (img.includes('loading="eager"') || img.includes("loading='eager'")) {
          eagerCount++;
        } else {
          noLoadingAttr++;
        }
      }

      // Check for JS-based lazy loading patterns
      const hasJsLazyLoad = 
        html.includes('data-src') || 
        html.includes('data-lazy') ||
        html.includes('lazyload') ||
        html.includes('lazysizes');

      const totalImages = imgTags.length;
      const hasProperLazyLoading = lazyCount > 0 || hasJsLazyLoad || totalImages <= 3;

      return {
        checkId: "lazy-loading",
        status: hasProperLazyLoading ? "pass" : "warn",
        evidence: [
          `Total images: ${totalImages}`,
          `Native lazy loading: ${lazyCount}`,
          `Eager loading: ${eagerCount}`,
          `No loading attribute: ${noLoadingAttr}`,
          hasJsLazyLoad ? "JavaScript lazy loading library detected" : "",
        ].filter(Boolean),
        urlsTested: [ctx.url],
      };
    } catch {
      return {
        checkId: "lazy-loading",
        status: "warn",
        evidence: ["Could not analyze lazy loading"],
        urlsTested: [ctx.url],
      };
    }
  },
};
