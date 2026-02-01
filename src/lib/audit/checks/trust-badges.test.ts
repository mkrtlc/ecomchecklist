import { describe, expect, it } from "vitest";
import { trustBadgesCheck, __test__ } from "./trust-badges";

const { detectTrustBadges } = __test__;

describe("detectTrustBadges", () => {
  it("detects SSL/security indicators", () => {
    const html = '<div class="secure-checkout">SSL Encrypted Checkout</div>';
    const { found, hasBadges } = detectTrustBadges(html);
    expect(hasBadges).toBe(true);
    expect(found).toContain("SSL/Secure Checkout");
  });

  it("detects money-back guarantee", () => {
    const html = '<span>30-Day Money-Back Guarantee</span>';
    const { found } = detectTrustBadges(html);
    expect(found).toContain("Money-Back Guarantee");
  });

  it("detects payment methods", () => {
    const html = '<img alt="Visa Mastercard PayPal">';
    const { found } = detectTrustBadges(html);
    expect(found).toContain("Payment Methods");
  });

  it("detects review platforms", () => {
    const html = '<a href="trustpilot.com">See our Trustpilot reviews</a>';
    const { found } = detectTrustBadges(html);
    expect(found).toContain("Review Platform");
  });

  it("returns empty for no badges", () => {
    const html = "<html><body>Plain page</body></html>";
    const { hasBadges } = detectTrustBadges(html);
    expect(hasBadges).toBe(false);
  });
});

describe("trustBadgesCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await trustBadgesCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when trust badges found", async () => {
    const result = await trustBadgesCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<div>Secure Checkout | 30-Day Money-Back Guarantee | Visa Mastercard</div>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when no badges found", async () => {
    const result = await trustBadgesCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "<html><body>Basic product page</body></html>",
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
