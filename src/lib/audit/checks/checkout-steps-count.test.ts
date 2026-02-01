import { describe, expect, it } from "vitest";
import { checkoutStepsCountCheck, __test__ } from "./checkout-steps-count";

describe("estimateCheckoutStepsFromHtml", () => {
  it("parses 'Step 1 of 3'", () => {
    expect(__test__.estimateCheckoutStepsFromHtml("<div>Step 1 of 3</div>")).toBe(3);
  });

  it("returns null when no reliable signals", () => {
    expect(__test__.estimateCheckoutStepsFromHtml("<html><body>Hello</body></html>")).toBeNull();
  });
});

describe("checkoutStepsCountCheck", () => {
  it("warns when adapter missing", async () => {
    const r = await checkoutStepsCountCheck.run({ url: "https://example.com" }, {});
    expect(r.status).toBe("warn");
  });

  it("passes when <= 3 steps", async () => {
    const r = await checkoutStepsCountCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({ html: "<div>Step 1 of 3</div>", finalUrl: "https://example.com/checkout" }),
        },
      }
    );
    expect(r.status).toBe("pass");
  });

  it("fails when > 4 steps", async () => {
    const r = await checkoutStepsCountCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({ html: "<div>Step 1 of 6</div>" }),
        },
      }
    );
    expect(r.status).toBe("fail");
  });
});
