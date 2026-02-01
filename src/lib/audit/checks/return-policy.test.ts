import { describe, expect, it } from "vitest";
import { returnPolicyCheck, __test__ } from "./return-policy";

const { detectReturnPolicy } = __test__;

describe("detectReturnPolicy", () => {
  it("detects return period", () => {
    const html = "<span>30-day return policy</span>";
    const { found, hasReturnInfo } = detectReturnPolicy(html);
    expect(hasReturnInfo).toBe(true);
    expect(found).toContain("30-Day Return");
  });

  it("detects free returns", () => {
    const html = '<div class="returns">Free Returns on all orders</div>';
    const { found } = detectReturnPolicy(html);
    expect(found).toContain("Free Returns");
  });

  it("detects money-back guarantee", () => {
    const html = "<span>100% Money Back Guarantee</span>";
    const { found } = detectReturnPolicy(html);
    expect(found).toContain("Money-Back Guarantee");
  });

  it("detects return policy link", () => {
    const html = '<a href="/returns">Returns & Exchanges</a>';
    const { found } = detectReturnPolicy(html);
    expect(found).toContain("Return Policy");
  });

  it("returns empty for no return info", () => {
    const html = "<html><body>Product page</body></html>";
    const { hasReturnInfo } = detectReturnPolicy(html);
    expect(hasReturnInfo).toBe(false);
  });
});

describe("returnPolicyCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await returnPolicyCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when return policy found", async () => {
    const result = await returnPolicyCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<div>30-Day Free Returns | Easy Exchanges</div>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when no return info found", async () => {
    const result = await returnPolicyCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "<html><body>Just product info</body></html>",
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
