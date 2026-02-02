import { describe, expect, it } from "vitest";
import { gzipCompressionCheck } from "./gzip-compression";

describe("gzipCompressionCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await gzipCompressionCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when HTML size is reasonable", async () => {
    const result = await gzipCompressionCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head></head><body>Small page content</body></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("KB");
  });

  it("warns when HTML size is very large", async () => {
    const largeHtml = "<html>" + "x".repeat(600000) + "</html>";
    const result = await gzipCompressionCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: largeHtml,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.[1]).toContain("compression");
  });

  it("notes when CDN is detected", async () => {
    const result = await gzipCompressionCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><script src="https://cdn.cloudflare.com/script.js"></script></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.some((e) => e.includes("CDN"))).toBe(true);
  });
});
