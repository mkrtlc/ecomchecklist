import { describe, expect, it } from "vitest";
import { ogTagsCheck, __test__ } from "./og-tags";

const { analyzeOGTags } = __test__;

describe("analyzeOGTags", () => {
  it("detects complete OG tags", () => {
    const html = `
      <meta property="og:title" content="Running Shoes - Best Selection">
      <meta property="og:description" content="Shop our best running shoes">
      <meta property="og:image" content="https://example.com/shoes.jpg">
      <meta property="og:url" content="https://example.com/shoes">
      <meta name="twitter:card" content="summary_large_image">
    `;
    const result = analyzeOGTags(html);
    expect(result.hasTitle).toBe(true);
    expect(result.hasDescription).toBe(true);
    expect(result.hasImage).toBe(true);
    expect(result.hasUrl).toBe(true);
  });

  it("detects missing og:image", () => {
    const html = `
      <meta property="og:title" content="Test">
      <meta property="og:description" content="Test description">
    `;
    const result = analyzeOGTags(html);
    expect(result.hasImage).toBe(false);
    expect(result.issues.some(i => i.includes("og:image"))).toBe(true);
  });

  it("suggests Twitter cards", () => {
    const html = '<meta property="og:title" content="Test">';
    const result = analyzeOGTags(html);
    expect(result.issues.some(i => i.includes("Twitter"))).toBe(true);
  });
});

describe("ogTagsCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await ogTagsCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when essential OG tags present", async () => {
    const result = await ogTagsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `
              <meta property="og:title" content="Test">
              <meta property="og:description" content="Description">
              <meta property="og:image" content="https://example.com/img.jpg">
            `,
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when no OG tags found", async () => {
    const result = await ogTagsCheck.run(
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

  it("warns when some OG tags missing", async () => {
    const result = await ogTagsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<meta property="og:title" content="Test">',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
  });
});
