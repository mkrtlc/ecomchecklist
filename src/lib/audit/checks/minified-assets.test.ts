import { describe, expect, it } from "vitest";
import { minifiedAssetsCheck } from "./minified-assets";

describe("minifiedAssetsCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await minifiedAssetsCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when assets are minified", async () => {
    const result = await minifiedAssetsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html>
              <link href="/styles/main.min.css" rel="stylesheet">
              <script src="/js/app.bundle.js"></script>
            </html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.some((e) => e.includes("minified"))).toBe(true);
  });

  it("warns when debug/dev assets are found", async () => {
    const result = await minifiedAssetsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html>
              <script src="/js/app.dev.js"></script>
              <link href="/styles/debug.css" rel="stylesheet">
            </html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.[0]).toContain("unminified");
  });

  it("handles pages with no external assets", async () => {
    const result = await minifiedAssetsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><body>No external assets</body></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });
});
