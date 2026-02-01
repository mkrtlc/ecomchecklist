import { describe, expect, it } from "vitest";
import { cspHeadersCheck, __test__ } from "./csp-headers";

const { analyzeCSP } = __test__;

describe("analyzeCSP", () => {
  it("detects CSP meta tag", () => {
    const html = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'">';
    const { hasCSP } = analyzeCSP(html);
    expect(hasCSP).toBe(true);
  });

  it("returns false when no CSP", () => {
    const html = "<html><head><title>Test</title></head></html>";
    const { hasCSP } = analyzeCSP(html);
    expect(hasCSP).toBe(false);
  });
});

describe("cspHeadersCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await cspHeadersCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when CSP meta tag present", async () => {
    const result = await cspHeadersCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<html><head><meta http-equiv="Content-Security-Policy" content="default-src \'self\'"></head></html>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("warns when no CSP detected", async () => {
    const result = await cspHeadersCheck.run(
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
    expect(result.status).toBe("warn");
  });
});
