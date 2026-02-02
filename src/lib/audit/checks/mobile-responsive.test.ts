import { describe, expect, it } from "vitest";
import { mobileResponsiveCheck, __test__ } from "./mobile-responsive";

const { analyzeMobileResponsive } = __test__;

describe("analyzeMobileResponsive", () => {
  it("detects viewport meta", () => {
    const html = '<meta name="viewport" content="width=device-width, initial-scale=1">';
    const res = analyzeMobileResponsive(html);
    expect(res.hasViewportMeta).toBe(true);
  });

  it("detects responsive indicators", () => {
    const html = '<style>@media (max-width: 768px) { .x { display:none; } }</style>';
    const res = analyzeMobileResponsive(html);
    expect(res.hasResponsiveIndicators).toBe(true);
  });

  it("flags missing viewport meta", () => {
    const html = "<html><head></head></html>";
    const res = analyzeMobileResponsive(html);
    expect(res.hasViewportMeta).toBe(false);
    expect(res.issues.some((i) => i.includes("viewport"))).toBe(true);
  });
});

describe("mobileResponsiveCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await mobileResponsiveCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when viewport and responsive indicators found", async () => {
    const result = await mobileResponsiveCheck.run(
      { url: "https://example.com" },
      { html: { fetchHtml: async () => ({ html: '<meta name="viewport" content="width=device-width"><style>@media (max-width: 768px){}</style>', finalUrl: "https://example.com" }) } }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when missing viewport meta", async () => {
    const result = await mobileResponsiveCheck.run(
      { url: "https://example.com" },
      { html: { fetchHtml: async () => ({ html: "<html><head></head></html>", finalUrl: "https://example.com" }) } }
    );
    expect(result.status).toBe("fail");
  });
});
