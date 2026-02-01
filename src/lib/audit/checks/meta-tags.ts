import type { AuditCheck } from "./types";

interface MetaAnalysis {
  hasTitle: boolean;
  hasDescription: boolean;
  titleLength?: number;
  descriptionLength?: number;
  issues: string[];
}

function analyzeMetaTags(html: string): MetaAnalysis {
  const issues: string[] = [];

  // Check for title tag
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const hasTitle = !!titleMatch && titleMatch[1].trim().length > 0;
  const titleLength = titleMatch?.[1]?.trim().length;

  if (!hasTitle) {
    issues.push("Missing or empty <title> tag");
  } else if (titleLength && titleLength < 30) {
    issues.push(`Title too short (${titleLength} chars, recommend 50-60)`);
  } else if (titleLength && titleLength > 70) {
    issues.push(`Title too long (${titleLength} chars, may be truncated in search results)`);
  }

  // Check for meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const hasDescription = !!descMatch && descMatch[1].trim().length > 0;
  const descriptionLength = descMatch?.[1]?.trim().length;

  if (!hasDescription) {
    issues.push("Missing meta description");
  } else if (descriptionLength && descriptionLength < 70) {
    issues.push(`Meta description too short (${descriptionLength} chars, recommend 120-160)`);
  } else if (descriptionLength && descriptionLength > 170) {
    issues.push(`Meta description too long (${descriptionLength} chars, will be truncated)`);
  }

  return { hasTitle, hasDescription, titleLength, descriptionLength, issues };
}

export const metaTagsCheck: AuditCheck = {
  definition: {
    id: "meta-tags",
    title: "Meta Title & Description",
    category: "seo",
    severity: "high",
    whyImportant:
      "Title and meta description are critical for SEO and click-through rates from search results. They tell search engines and users what your page is about.",
    howToFix:
      "Add unique, descriptive titles (50-60 chars) and meta descriptions (120-160 chars) to every page. Include relevant keywords naturally. Make them compelling to improve CTR.",
    references: [
      {
        title: "Google: Meta Description",
        url: "https://developers.google.com/search/docs/advanced/appearance/snippet",
      },
      {
        title: "Moz: Title Tag",
        url: "https://moz.com/learn/seo/title-tag",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "meta-tags",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const { hasTitle, hasDescription, titleLength, descriptionLength, issues } = analyzeMetaTags(html);

    if (hasTitle && hasDescription && issues.length === 0) {
      return {
        checkId: "meta-tags",
        status: "pass",
        evidence: [
          `Title: ${titleLength} chars`,
          `Description: ${descriptionLength} chars`,
        ],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    if (!hasTitle || !hasDescription) {
      return {
        checkId: "meta-tags",
        status: "fail",
        evidence: issues,
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    return {
      checkId: "meta-tags",
      status: "warn",
      evidence: issues,
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { analyzeMetaTags };
