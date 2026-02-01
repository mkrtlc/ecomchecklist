import { describe, expect, it } from "vitest";
import { shippingInfoCheck, __test__ } from "./shipping-info";

const { detectShippingInfo } = __test__;

describe("detectShippingInfo", () => {
  it("detects free shipping", () => {
    const html = '<div class="shipping">Free Shipping on all orders</div>';
    const { found, hasShippingInfo } = detectShippingInfo(html);
    expect(hasShippingInfo).toBe(true);
    expect(found).toContain("Free Shipping");
  });

  it("detects shipping cost", () => {
    const html = "<span>Shipping: $5.99</span>";
    const { found } = detectShippingInfo(html);
    expect(found).toContain("Shipping Cost");
  });

  it("detects delivery timeframe", () => {
    const html = "<span>Delivers in 3-5 business days</span>";
    const { found } = detectShippingInfo(html);
    expect(found).toContain("Delivery Timeframe");
  });

  it("detects free shipping threshold", () => {
    const html = "<div>Free shipping on orders over $50</div>";
    const { found } = detectShippingInfo(html);
    expect(found).toContain("Free Shipping Threshold");
  });

  it("returns empty for no shipping info", () => {
    const html = "<html><body>Product description</body></html>";
    const { hasShippingInfo } = detectShippingInfo(html);
    expect(hasShippingInfo).toBe(false);
  });
});

describe("shippingInfoCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await shippingInfoCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when shipping info found", async () => {
    const result = await shippingInfoCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<div>Free Shipping on orders over $75 | Arrives in 2-4 days</div>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when no shipping info found", async () => {
    const result = await shippingInfoCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "<html><body>Product page without shipping</body></html>",
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
