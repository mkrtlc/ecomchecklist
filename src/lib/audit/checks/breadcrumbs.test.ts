import { describe, expect, it } from "vitest";
import { breadcrumbsCheck, __test__ } from "./breadcrumbs";

const { detectBreadcrumbs } = __test__;

describe("detectBreadcrumbs", () => {
  it("detects breadcrumb nav", () => {
    const html = '<nav aria-label="breadcrumb"><ol><li>Home</li></ol></nav>';
    expect(detectBreadcrumbs(html).hasBreadcrumbs).toBe(true);
  });

  it("detects breadcrumb schema", () => {
    const html = '<script type="application/ld+json">{"@type":"BreadcrumbList"}</script>';
    expect(detectBreadcrumbs(html).hasBreadcrumbs).toBe(true);
  });

  it("returns false for none", () => {
    const html = "<html><body>No breadcrumbs</body></html>";
    expect(detectBreadcrumbs(html).hasBreadcrumbs).toBe(false);
  });
});

describe("breadcrumbsCheck", () => {
  it("warns when adapter missing", async () => {
    const result = await breadcrumbsCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when breadcrumbs present", async () => {
    const result = await breadcrumbsCheck.run(
      { url: "https://example.com/product" },
      { html: { fetchHtml: async () => ({ html: '<nav aria-label="breadcrumb">Home > Shoes</nav>', finalUrl: "https://example.com/product" }) } }
    );
    expect(result.status).toBe("pass");
  });
});
