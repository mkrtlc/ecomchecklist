import type { AuditCheck } from "./types";

interface OGAnalysis {
  hasTitle: boolean;
  hasDescription: boolean;
  hasImage: boolean;
  hasUrl: boolean;
  hasType: boolean;
  issues: string[];
}

function analyzeOGTags(html: string): OGAnalysis {
  const issues: string[] = [];

  const getOGContent = (property: string): string | null => {
    const regex = new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']*)["']`, "i");
    const altRegex = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:${property}["']`, "i");
    const match = html.match(regex) || html.match(altRegex);
    return match ? match[1] : null;
  };

  const ogTitle = getOGContent("title");
  const ogDescription = getOGContent("description");
  const ogImage = getOGContent("image");
  const ogUrl = getOGContent("url");
  const ogType = getOGContent("type");

  const hasTitle = !!ogTitle && ogTitle.trim().length > 0;
  const hasDescription = !!ogDescription && ogDescription.trim().length > 0;
  const hasImage = !!ogImage && ogImage.trim().length > 0;
  const hasUrl = !!ogUrl && ogUrl.trim().length > 0;
  const hasType = !!ogType && ogType.trim().length > 0;

  if (!hasTitle) issues.push("Missing og:title");
  if (!hasDescription) issues.push("Missing og:description");
  if (!hasImage) issues.push("Missing og:image (critical for social sharing)");
  if (!hasUrl) issues.push("Missing og:url");

  // Check for Twitter cards too
  const hasTwitterCard = /<meta[^>]*name=["']twitter:card["']/i.test(html);
  if (!hasTwitterCard) {
    issues.push("Consider adding Twitter Card meta tags");
  }

  return { hasTitle, hasDescription, hasImage, hasUrl, hasType, issues };
}

export const ogTagsCheck: AuditCheck = {
  definition: {
    id: "og-tags",
    title: "Open Graph Tags",
    category: "seo",
    severity: "medium",
    whyImportant:
      "Open Graph tags control how your pages appear when shared on social media. Good OG tags with compelling images and descriptions increase click-through from social shares.",
    howToFix:
      "Add og:title, og:description, og:image, og:url, and og:type meta tags. Use high-quality images (1200x630px recommended). Also add Twitter Card meta tags for Twitter/X.",
    references: [
      {
        title: "Open Graph Protocol",
        url: "https://ogp.me/",
      },
      {
        title: "Facebook Sharing Debugger",
        url: "https://developers.facebook.com/tools/debug/",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "og-tags",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const analysis = analyzeOGTags(html);

    const essentialCount = [analysis.hasTitle, analysis.hasDescription, analysis.hasImage].filter(Boolean).length;

    if (essentialCount === 3) {
      const evidence = ["✓ og:title, og:description, og:image present"];
      if (analysis.hasUrl) evidence.push("✓ og:url present");
      if (analysis.issues.length > 0) {
        evidence.push(...analysis.issues.filter(i => !i.includes("Missing")));
      }
      return {
        checkId: "og-tags",
        status: "pass",
        evidence,
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    if (essentialCount === 0) {
      return {
        checkId: "og-tags",
        status: "fail",
        evidence: ["No Open Graph tags found"],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    return {
      checkId: "og-tags",
      status: "warn",
      evidence: analysis.issues,
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { analyzeOGTags };
