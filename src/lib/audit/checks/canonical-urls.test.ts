import { describe, expect, it } from "vitest";
import { canonicalUrlsCheck, __test__ } from "./canonical-urls";

const { analyzeCanonical } = __test__;

describe("analyzeCanonical", () => {
  it("detects valid canonical URL", () => {
    const html = '<link rel="canonical" href="https://example.com/product/shoes">';
    const result = analyzeCanonical(html, "https://example.com/product/shoes");
    expect(result.hasCanonical).toBe(true);
    expect(result.canonicalUrl).toBe("https://example.com/product/shoes");
    expect(result.issues.length).toBe(0);
  });

  it("detects missing canonical", () => {
    const html = "<html><head><title>Test</title></head></html>";
    const result = analyzeCanonical(html, "https://example.com");
    expect(result.hasCanonical).toBe(false);
    expect(result.issues).toContain("No canonical URL tag found");
  });

  it("warns about relative canonical URL", () => {
    const html = '<link rel="canonical" href="/product/shoes">';
    const result = analyzeCanonical(html, "https://example.com/product/shoes");
    expect(result.hasCanonical).toBe(true);
    expect(result.issues.some(i => i.includes("absolute"))).toBe(true);
  });

  it("notes cross-domain canonical", () => {
    const html = '<link rel="canonical" href="https://other-domain.com/page">';
    const result = analyzeCanonical(html, "https://example.com/page");
    expect(result.issues.some(i => i.includes("different domain"))).toBe(true);
  });
});

describe("canonicalUrlsCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await canonicalUrlsCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when valid canonical found", async () => {
    const result = await canonicalUrlsCheck.run(
      { url: "https://example.com/product" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<html><head><link rel="canonical" href="https://example.com/product"></head></html>',
            finalUrl: "https://example.com/product",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when no canonical found", async () => {
    const result = await canonicalUrlsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "<html><head><title>Test</title></head></html>",
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
