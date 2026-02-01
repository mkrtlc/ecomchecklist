import type { AuditCheck } from "./types";

function analyzeImageFormats(html: string): { modernFormats: number; legacyFormats: number; issues: string[] } {
  const issues: string[] = [];
  let modernFormats = 0;
  let legacyFormats = 0;

  // Count image sources
  const srcMatches = html.match(/src=["'][^"']+\.(jpg|jpeg|png|gif|webp|avif)["']/gi) || [];
  const srcsetMatches = html.match(/srcset=["'][^"']+["']/gi) || [];

  for (const match of srcMatches) {
    const lower = match.toLowerCase();
    if (lower.includes(".webp") || lower.includes(".avif")) {
      modernFormats++;
    } else if (lower.includes(".jpg") || lower.includes(".jpeg") || lower.includes(".png") || lower.includes(".gif")) {
      legacyFormats++;
    }
  }

  // Check for picture element with modern formats (best practice)
  const hasPictureElement = /<picture[\s>]/i.test(html);
  const hasSourceWebp = /type=["']image\/webp["']/i.test(html);
  const hasSourceAvif = /type=["']image\/avif["']/i.test(html);

  if (hasPictureElement && (hasSourceWebp || hasSourceAvif)) {
    modernFormats += 5; // Bonus for proper implementation
  }

  if (legacyFormats > 0 && modernFormats === 0) {
    issues.push(`Found ${legacyFormats} legacy format images (JPG/PNG/GIF) with no WebP/AVIF`);
  }

  // Check srcset for modern format usage
  for (const srcset of srcsetMatches) {
    if (srcset.toLowerCase().includes(".webp") || srcset.toLowerCase().includes(".avif")) {
      modernFormats++;
    }
  }

  return { modernFormats, legacyFormats, issues };
}

export const imageOptimizationCheck: AuditCheck = {
  definition: {
    id: "image-optimization",
    title: "Modern Image Formats (WebP/AVIF)",
    category: "performance",
    severity: "high",
    whyImportant:
      "WebP and AVIF images are 25-50% smaller than JPEG/PNG with similar quality. Faster image loading improves page speed, reduces data costs, and improves conversion rates.",
    howToFix:
      "Convert images to WebP/AVIF with fallbacks using <picture> element. Use image CDNs like Cloudinary or imgix for automatic format negotiation. Compress images appropriately for web.",
    references: [
      {
        title: "Web.dev: Use WebP",
        url: "https://web.dev/serve-images-webp/",
      },
      {
        title: "Web.dev: Use AVIF",
        url: "https://web.dev/uses-avif-images/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "image-optimization",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const { modernFormats, legacyFormats, issues } = analyzeImageFormats(html);

    if (modernFormats > 0 && legacyFormats === 0) {
      return {
        checkId: "image-optimization",
        status: "pass",
        evidence: ["Using modern image formats (WebP/AVIF)"],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    if (modernFormats > 0) {
      return {
        checkId: "image-optimization",
        status: "pass",
        evidence: [`Found ${modernFormats} modern format images, ${legacyFormats} legacy format images`],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    if (legacyFormats === 0) {
      return {
        checkId: "image-optimization",
        status: "warn",
        evidence: ["No images detected on page"],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    return {
      checkId: "image-optimization",
      status: "fail",
      evidence: issues.length > 0 ? issues : [`Only legacy image formats found (${legacyFormats} images)`],
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { analyzeImageFormats };
