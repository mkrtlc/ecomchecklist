import { describe, expect, it } from "vitest";
import { resourceHintsCheck } from "./resource-hints";

describe("resourceHintsCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await resourceHintsCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when preload hints present", async () => {
    const result = await resourceHintsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
              <link rel="preload" href="/hero.webp" as="image">
              <link rel="preconnect" href="https://fonts.gstatic.com">
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("2");
    expect(result.evidence?.[1]).toContain("1");
  });

  it("passes with modulepreload for modern apps", async () => {
    const result = await resourceHintsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <link rel="modulepreload" href="/js/app.js">
              <link rel="modulepreload" href="/js/vendor.js">
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[3]).toContain("2");
  });

  it("warns when no resource hints found", async () => {
    const result = await resourceHintsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><body>No hints</body></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.some((e) => e.includes("Consider preloading"))).toBe(true);
  });

  it("warns when over-preloading", async () => {
    const preloads = Array(15).fill('<link rel="preload" href="/resource.js" as="script">').join('\n');
    const result = await resourceHintsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>${preloads}</head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.some((e) => e.includes("Too many"))).toBe(true);
  });
});
