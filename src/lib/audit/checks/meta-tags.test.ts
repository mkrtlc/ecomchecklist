import { describe, expect, it } from "vitest";
import { metaTagsCheck, __test__ } from "./meta-tags";

const { analyzeMetaTags } = __test__;

describe("analyzeMetaTags", () => {
  it("detects valid title and description", () => {
    const html = `
      <html><head>
        <title>Best Running Shoes for Marathon Training | ShoeStore</title>
        <meta name="description" content="Find the best running shoes for marathon training. Expert reviews, top brands, and free shipping on orders over $50.">
      </head></html>`;
    const result = analyzeMetaTags(html);
    expect(result.hasTitle).toBe(true);
    expect(result.hasDescription).toBe(true);
    expect(result.issues.length).toBe(0);
  });

  it("detects missing title", () => {
    const html = '<html><head><meta name="description" content="Test"></head></html>';
    const result = analyzeMetaTags(html);
    expect(result.hasTitle).toBe(false);
    expect(result.issues).toContain("Missing or empty <title> tag");
  });

  it("detects missing description", () => {
    const html = "<html><head><title>Test Page</title></head></html>";
    const result = analyzeMetaTags(html);
    expect(result.hasDescription).toBe(false);
    expect(result.issues.some(i => i.includes("Missing meta description"))).toBe(true);
  });

  it("warns about short title", () => {
    const html = '<html><head><title>Short</title><meta name="description" content="This is a proper meta description for the page."></head></html>';
    const result = analyzeMetaTags(html);
    expect(result.issues.some(i => i.includes("Title too short"))).toBe(true);
  });
});

describe("metaTagsCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await metaTagsCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when valid meta tags present", async () => {
    const result = await metaTagsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <title>Best Running Shoes for Marathon Training | Store</title>
              <meta name="description" content="Find the best running shoes for marathon training. Expert reviews and free shipping.">
            </head></html>`,
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when missing title", async () => {
    const result = await metaTagsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<html><head><meta name="description" content="Test"></head></html>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
