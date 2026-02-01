import { describe, expect, it } from "vitest";
import { cachingHeadersCheck, __test__ } from "./caching-headers";

const { analyzeCachingHints } = __test__;

describe("analyzeCachingHints", () => {
  it("detects service worker", () => {
    const html = '<script>navigator.serviceWorker.register("/sw.js")</script>';
    const { hasCacheHints } = analyzeCachingHints(html);
    expect(hasCacheHints).toBe(true);
  });

  it("detects preload hints", () => {
    const html = '<link rel="preload" href="critical.css" as="style">';
    const { hasCacheHints, evidence } = analyzeCachingHints(html);
    expect(hasCacheHints).toBe(true);
    expect(evidence.some(e => e.includes("preload"))).toBe(true);
  });

  it("detects versioned assets", () => {
    const html = '<script src="app.abc12345.js"></script>';
    const { hasCacheHints, evidence } = analyzeCachingHints(html);
    expect(hasCacheHints).toBe(true);
    expect(evidence.some(e => e.includes("Versioned"))).toBe(true);
  });

  it("returns false when no hints found", () => {
    const html = "<html><body>Hello</body></html>";
    const { hasCacheHints } = analyzeCachingHints(html);
    expect(hasCacheHints).toBe(false);
  });
});

describe("cachingHeadersCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await cachingHeadersCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when caching hints found", async () => {
    const result = await cachingHeadersCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<html><script>navigator.serviceWorker.register("/sw.js")</script></html>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("warns when no caching hints found", async () => {
    const result = await cachingHeadersCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "<html><body>No caching</body></html>",
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
  });
});
