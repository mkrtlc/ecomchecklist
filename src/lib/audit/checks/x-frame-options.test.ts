import { describe, expect, it } from "vitest";
import { xFrameOptionsCheck } from "./x-frame-options";

describe("xFrameOptionsCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await xFrameOptionsCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when frame-ancestors CSP detected", async () => {
    const result = await xFrameOptionsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <meta http-equiv="Content-Security-Policy" content="frame-ancestors 'self'">
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("frame-ancestors");
  });

  it("passes when known secure platform detected", async () => {
    const result = await xFrameOptionsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><script src="https://cdn.shopify.com/script.js"></script></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.some((e) => e.includes("Platform"))).toBe(true);
  });

  it("warns when no protection detected", async () => {
    const result = await xFrameOptionsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><body>Basic page</body></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.some((e) => e.includes("X-Frame-Options"))).toBe(true);
  });
});
