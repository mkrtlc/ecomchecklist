import { describe, expect, it } from "vitest";
import { paymentMethodsCheck, __test__ } from "./payment-methods";

const { detectPaymentMethods } = __test__;

describe("detectPaymentMethods", () => {
  it("detects multiple card brands", () => {
    const html = '<div class="payment-icons"><img alt="Visa"><img alt="Mastercard"><img alt="Amex"></div>';
    const { methods, hasMultipleMethods } = detectPaymentMethods(html);
    expect(hasMultipleMethods).toBe(true);
    expect(methods).toContain("Visa");
    expect(methods).toContain("Mastercard");
  });

  it("detects digital wallets", () => {
    const html = "<span>We accept PayPal, Apple Pay, and Google Pay</span>";
    const { methods } = detectPaymentMethods(html);
    expect(methods).toContain("PayPal");
    expect(methods).toContain("Apple Pay");
    expect(methods).toContain("Google Pay");
  });

  it("detects BNPL options", () => {
    const html = '<div>Pay in 4 with Afterpay or Klarna</div>';
    const { methods } = detectPaymentMethods(html);
    expect(methods).toContain("Afterpay");
    expect(methods).toContain("Klarna");
  });

  it("returns empty for no payment methods", () => {
    const html = "<html><body>Regular content</body></html>";
    const { methods } = detectPaymentMethods(html);
    expect(methods.length).toBe(0);
  });
});

describe("paymentMethodsCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await paymentMethodsCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when multiple methods found", async () => {
    const result = await paymentMethodsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<footer>We accept Visa, Mastercard, PayPal, and Apple Pay</footer>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("warns when only one method found", async () => {
    const result = await paymentMethodsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<div>Pay with PayPal</div>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
  });

  it("fails when no methods found", async () => {
    const result = await paymentMethodsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "<html><body>No payment info</body></html>",
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
