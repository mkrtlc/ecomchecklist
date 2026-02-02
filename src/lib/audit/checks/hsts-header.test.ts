import { describe, expect, it } from "vitest";
import { hstsHeaderCheck } from "./hsts-header";

describe("hstsHeaderCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await hstsHeaderCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("fails when site is not HTTPS", async () => {
    const result = await hstsHeaderCheck.run(
      { url: "http://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><body>HTTP site</body></html>`,
            finalUrl: "http://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
    expect(result.evidence?.[0]).toContain("not served over HTTPS");
  });

  it("passes when known HSTS provider detected", async () => {
    const result = await hstsHeaderCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><script src="https://cdn.shopify.com/s/files/script.js"></script></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.some((e) => e.includes("HSTS support"))).toBe(true);
  });

  it("warns on HTTPS site without known provider", async () => {
    const result = await hstsHeaderCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><body>Generic site</body></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.some((e) => e.includes("Add Strict-Transport-Security"))).toBe(true);
  });
});
