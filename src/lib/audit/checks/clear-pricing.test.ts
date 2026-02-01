import { describe, expect, it } from "vitest";
import { clearPricingCheck, __test__ } from "./clear-pricing";

const { detectPricing } = __test__;

describe("detectPricing", () => {
  it("detects USD pricing", () => {
    const html = '<span class="price">$99.99</span>';
    const { hasPrice, hasCurrency } = detectPricing(html);
    expect(hasPrice).toBe(true);
    expect(hasCurrency).toBe(true);
  });

  it("detects EUR pricing", () => {
    const html = '<span class="price">€49,95</span>';
    const { hasPrice, hasCurrency } = detectPricing(html);
    expect(hasPrice).toBe(true);
    expect(hasCurrency).toBe(true);
  });

  it("detects comparison pricing", () => {
    const html = '<span class="was-price">Was $129</span><span class="now-price">Now $99</span>';
    const { hasComparison } = detectPricing(html);
    expect(hasComparison).toBe(true);
  });

  it("detects price class", () => {
    const html = '<span class="product-price">99</span>';
    const { hasPrice } = detectPricing(html);
    expect(hasPrice).toBe(true);
  });

  it("returns issues for no price", () => {
    const html = "<html><body>Product description</body></html>";
    const { hasPrice, issues } = detectPricing(html);
    expect(hasPrice).toBe(false);
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe("clearPricingCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await clearPricingCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when clear pricing found", async () => {
    const result = await clearPricingCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<div class="product"><span class="price">$149.99</span></div>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when no pricing found", async () => {
    const result = await clearPricingCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "<html><body>Product info without price</body></html>",
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
