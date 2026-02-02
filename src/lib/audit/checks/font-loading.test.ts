import { describe, expect, it } from "vitest";
import { fontLoadingCheck } from "./font-loading";

describe("fontLoadingCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await fontLoadingCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when font preload is present", async () => {
    const result = await fontLoadingCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("preload");
  });

  it("passes when Google Fonts has display parameter", async () => {
    const result = await fontLoadingCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.some((e) => e.includes("display parameter"))).toBe(true);
  });

  it("warns when Google Fonts missing display parameter", async () => {
    const result = await fontLoadingCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <link href="https://fonts.googleapis.com/css2?family=Roboto" rel="stylesheet">
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.some((e) => e.includes("missing display"))).toBe(true);
  });

  it("passes when font-display CSS is used", async () => {
    const result = await fontLoadingCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head><style>
              @font-face {
                font-family: 'CustomFont';
                src: url('/fonts/custom.woff2') format('woff2');
                font-display: swap;
              }
            </style></head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.some((e) => e.includes("font-display"))).toBe(true);
  });
});
