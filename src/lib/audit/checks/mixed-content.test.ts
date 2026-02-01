import { describe, expect, it } from "vitest";
import { mixedContentCheck, __test__ } from "./mixed-content";

const { detectMixedContent } = __test__;

describe("detectMixedContent", () => {
  it("detects http:// in src attributes", () => {
    const html = '<img src="http://example.com/image.jpg">';
    const issues = detectMixedContent(html, "https://mysite.com");
    expect(issues.length).toBeGreaterThan(0);
  });

  it("ignores content on HTTP sites", () => {
    const html = '<img src="http://example.com/image.jpg">';
    const issues = detectMixedContent(html, "http://mysite.com");
    expect(issues.length).toBe(0);
  });

  it("returns empty for clean HTTPS content", () => {
    const html = '<img src="https://example.com/image.jpg">';
    const issues = detectMixedContent(html, "https://mysite.com");
    expect(issues.length).toBe(0);
  });
});

describe("mixedContentCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await mixedContentCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when no mixed content", async () => {
    const result = await mixedContentCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<html><img src="https://cdn.example.com/img.jpg"></html>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when mixed content detected", async () => {
    const result = await mixedContentCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<html><script src="http://insecure.com/app.js"></script></html>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
