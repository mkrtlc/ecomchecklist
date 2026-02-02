import { describe, expect, it } from "vitest";
import { criticalCssCheck } from "./critical-css";

describe("criticalCssCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await criticalCssCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when critical CSS is inlined", async () => {
    const criticalCss = "body{margin:0}" + "a".repeat(600); // > 500 bytes
    const result = await criticalCssCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <style>${criticalCss}</style>
              <link rel="stylesheet" href="/main.css" media="print" onload="this.media='all'">
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.some((e) => e.includes("inlining detected"))).toBe(true);
  });

  it("passes when async CSS loading is used", async () => {
    const result = await criticalCssCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <link rel="preload" as="style" href="/main.css">
              <link rel="stylesheet" href="/main.css" media="print" onload="this.media='all'">
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.some((e) => e.includes("Async CSS"))).toBe(true);
  });

  it("warns when multiple blocking CSS found", async () => {
    const result = await criticalCssCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <link rel="stylesheet" href="/reset.css">
              <link rel="stylesheet" href="/main.css">
              <link rel="stylesheet" href="/vendor.css">
              <link rel="stylesheet" href="/theme.css">
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.some((e) => e.includes("reducing render-blocking"))).toBe(true);
  });

  it("passes with minimal CSS", async () => {
    const result = await criticalCssCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <link rel="stylesheet" href="/styles.css">
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[1]).toContain("blocking: 1");
  });
});
