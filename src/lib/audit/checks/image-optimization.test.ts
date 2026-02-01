import { describe, expect, it } from "vitest";
import { imageOptimizationCheck, __test__ } from "./image-optimization";

const { analyzeImageFormats } = __test__;

describe("analyzeImageFormats", () => {
  it("detects WebP images", () => {
    const html = '<img src="product.webp">';
    const { modernFormats, legacyFormats } = analyzeImageFormats(html);
    expect(modernFormats).toBeGreaterThan(0);
    expect(legacyFormats).toBe(0);
  });

  it("detects legacy JPEG images", () => {
    const html = '<img src="product.jpg">';
    const { modernFormats, legacyFormats, issues } = analyzeImageFormats(html);
    expect(legacyFormats).toBeGreaterThan(0);
    expect(modernFormats).toBe(0);
    expect(issues.length).toBeGreaterThan(0);
  });

  it("gives bonus for picture element with WebP source", () => {
    const html = '<picture><source type="image/webp" srcset="img.webp"><img src="img.jpg"></picture>';
    const { modernFormats } = analyzeImageFormats(html);
    expect(modernFormats).toBeGreaterThan(1); // Bonus applied
  });
});

describe("imageOptimizationCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await imageOptimizationCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when using WebP images", async () => {
    const result = await imageOptimizationCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<html><img src="product1.webp"><img src="product2.webp"></html>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when only legacy formats used", async () => {
    const result = await imageOptimizationCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<html><img src="product1.jpg"><img src="product2.png"></html>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });

  it("passes when mix of formats but modern present", async () => {
    const result = await imageOptimizationCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<html><img src="hero.webp"><img src="old.jpg"></html>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });
});
