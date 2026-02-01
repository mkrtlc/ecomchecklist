import type { AuditCheck } from "./types";

interface StructuredDataAnalysis {
  hasProductSchema: boolean;
  hasOrganizationSchema: boolean;
  hasBreadcrumbSchema: boolean;
  hasReviewSchema: boolean;
  types: string[];
}

function analyzeStructuredData(html: string): StructuredDataAnalysis {
  const types: string[] = [];
  
  // Look for JSON-LD structured data
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  
  for (const match of jsonLdMatches) {
    const content = match.replace(/<\/?script[^>]*>/gi, "");
    try {
      const data = JSON.parse(content);
      const extractTypes = (obj: unknown): void => {
        if (typeof obj !== "object" || obj === null) return;
        if ("@type" in obj && typeof (obj as Record<string, unknown>)["@type"] === "string") {
          types.push((obj as Record<string, unknown>)["@type"] as string);
        }
        if ("@graph" in obj && Array.isArray((obj as Record<string, unknown>)["@graph"])) {
          for (const item of (obj as Record<string, unknown>)["@graph"] as unknown[]) {
            extractTypes(item);
          }
        }
      };
      extractTypes(data);
    } catch {
      // Invalid JSON, skip
    }
  }

  // Also check for microdata
  if (/itemtype=["']https?:\/\/schema\.org\/Product["']/i.test(html)) {
    types.push("Product");
  }
  if (/itemtype=["']https?:\/\/schema\.org\/Organization["']/i.test(html)) {
    types.push("Organization");
  }
  if (/itemtype=["']https?:\/\/schema\.org\/BreadcrumbList["']/i.test(html)) {
    types.push("BreadcrumbList");
  }

  const typesLower = types.map(t => t.toLowerCase());
  
  return {
    hasProductSchema: typesLower.includes("product"),
    hasOrganizationSchema: typesLower.includes("organization") || typesLower.includes("localbusiness"),
    hasBreadcrumbSchema: typesLower.includes("breadcrumblist"),
    hasReviewSchema: typesLower.includes("review") || typesLower.includes("aggregaterating"),
    types: [...new Set(types)],
  };
}

export const structuredDataCheck: AuditCheck = {
  definition: {
    id: "structured-data",
    title: "Structured Data (Schema.org)",
    category: "seo",
    severity: "high",
    whyImportant:
      "Structured data helps search engines understand your content and can enable rich snippets (stars, prices, availability) in search results, improving click-through rates.",
    howToFix:
      "Add JSON-LD structured data for Product, Organization, BreadcrumbList, and Review schemas. Use Google's Rich Results Test to validate. Keep data accurate and up-to-date.",
    references: [
      {
        title: "Google: Structured Data",
        url: "https://developers.google.com/search/docs/guides/intro-structured-data",
      },
      {
        title: "Schema.org Product",
        url: "https://schema.org/Product",
      },
    ],
  },

  async run(ctx, adapters) {
    if (!adapters.html) {
      return {
        checkId: "structured-data",
        status: "warn",
        evidence: ["No HTML fetch adapter configured"],
        urlsTested: [ctx.url],
      };
    }

    const { html, finalUrl } = await adapters.html.fetchHtml(ctx.url);
    const analysis = analyzeStructuredData(html);

    const evidence: string[] = [];
    
    if (analysis.types.length > 0) {
      evidence.push(`Found schema types: ${analysis.types.join(", ")}`);
    }

    // For e-commerce, Product schema is critical
    if (analysis.hasProductSchema) {
      evidence.push("✓ Product schema detected");
    }
    if (analysis.hasOrganizationSchema) {
      evidence.push("✓ Organization schema detected");
    }
    if (analysis.hasBreadcrumbSchema) {
      evidence.push("✓ Breadcrumb schema detected");
    }
    if (analysis.hasReviewSchema) {
      evidence.push("✓ Review/Rating schema detected");
    }

    if (analysis.types.length === 0) {
      return {
        checkId: "structured-data",
        status: "fail",
        evidence: ["No structured data (Schema.org) detected"],
        urlsTested: [finalUrl ?? ctx.url],
      };
    }

    // Pass if has at least one relevant schema
    const hasRelevantSchema = analysis.hasProductSchema || analysis.hasOrganizationSchema;
    
    return {
      checkId: "structured-data",
      status: hasRelevantSchema ? "pass" : "warn",
      evidence,
      urlsTested: [finalUrl ?? ctx.url],
    };
  },
};

export const __test__ = { analyzeStructuredData };
