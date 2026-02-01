import type { AuditCheck } from "./types";

interface ImageAnalysis {
  totalImages: number;
  imagesWithAlt: number;
  imagesWithDimensions: number;
  lazyLoadedImages: number;
  potentiallySmallImages: number;
}

function analyzeProductImages(html: string): ImageAnalysis | null {
  const imgRegex = /<img[^>]*>/gi;
  const images = html.match(imgRegex) || [];
  
  if (images.length === 0) return null;

  let imagesWithAlt = 0;
  let imagesWithDimensions = 0;
  let lazyLoadedImages = 0;
  let potentiallySmallImages = 0;

  for (const img of images) {
    const lower = img.toLowerCase();
    
    // Check for alt attribute
    if (/alt\s*=\s*["'][^"']+["']/.test(lower)) {
      imagesWithAlt++;
    }
    
    // Check for dimensions
    if (/width\s*=/.test(lower) && /height\s*=/.test(lower)) {
      imagesWithDimensions++;
    }
    
    // Check for lazy loading
    if (/loading\s*=\s*["']lazy["']/.test(lower) || /data-src/.test(lower)) {
      lazyLoadedImages++;
    }
    
    // Heuristic: small dimension indicators
    const widthMatch = lower.match(/width\s*=\s*["']?(\d+)/);
    if (widthMatch && parseInt(widthMatch[1]) < 200) {
      potentiallySmallImages++;
    }
  }

  return {
    totalImages: images.length,
    imagesWithAlt,
    imagesWithDimensions,
    lazyLoadedImages,
    potentiallySmallImages,
  };
}

export const productImageQualityCheck: AuditCheck = {
  definition: {
    id: "product-image-quality",
    title: "Product Image Quality",
    category: "ux",
    severity: "high",
    whyImportant:
      "High-quality product images increase conversion rates by up to 30%. Images should have proper alt text for accessibility/SEO, appropriate dimensions, and lazy loading for performance.",
    howToFix:
      "Use high-resolution images (800px+ width), add descriptive alt text, implement lazy loading, and ensure images have explicit width/height to prevent layout shifts.",
    references: [
      {
        title: "Web.dev: Image optimization",
        url: "https://web.dev/fast/#optimize-your-images",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "product-image-quality",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const productUrl = ctx.productUrl ?? ctx.url;
    const { html, finalUrl } = await adapters.html.fetchHtml(productUrl);

    const analysis = analyzeProductImages(html);
    
    if (!analysis || analysis.totalImages === 0) {
      return {
        checkId: "product-image-quality",
        status: "warn",
        evidence: ["No images found on page"],
        urlsTested: [finalUrl ?? productUrl],
      };
    }

    const altRatio = analysis.imagesWithAlt / analysis.totalImages;
    const dimensionRatio = analysis.imagesWithDimensions / analysis.totalImages;
    
    const evidence: string[] = [
      `Found ${analysis.totalImages} images`,
      `${analysis.imagesWithAlt} have alt text (${Math.round(altRatio * 100)}%)`,
      `${analysis.imagesWithDimensions} have explicit dimensions (${Math.round(dimensionRatio * 100)}%)`,
      `${analysis.lazyLoadedImages} use lazy loading`,
    ];

    // Scoring: 
    // - >80% alt text AND >50% dimensions = pass
    // - >50% alt text OR >30% dimensions = warn
    // - else fail
    let status: "pass" | "warn" | "fail";
    if (altRatio >= 0.8 && dimensionRatio >= 0.5) {
      status = "pass";
    } else if (altRatio >= 0.5 || dimensionRatio >= 0.3) {
      status = "warn";
    } else {
      status = "fail";
    }

    return {
      checkId: "product-image-quality",
      status,
      evidence,
      urlsTested: [finalUrl ?? productUrl],
    };
  },
};

export const __test__ = { analyzeProductImages };
