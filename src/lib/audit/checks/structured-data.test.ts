import { describe, expect, it } from "vitest";
import { structuredDataCheck, __test__ } from "./structured-data";

const { analyzeStructuredData } = __test__;

describe("analyzeStructuredData", () => {
  it("detects Product schema in JSON-LD", () => {
    const html = `<script type="application/ld+json">{"@type": "Product", "name": "Shoe"}</script>`;
    const result = analyzeStructuredData(html);
    expect(result.hasProductSchema).toBe(true);
    expect(result.types).toContain("Product");
  });

  it("detects Organization schema", () => {
    const html = `<script type="application/ld+json">{"@type": "Organization", "name": "ShoeStore"}</script>`;
    const result = analyzeStructuredData(html);
    expect(result.hasOrganizationSchema).toBe(true);
  });

  it("detects multiple schemas in @graph", () => {
    const html = `<script type="application/ld+json">{"@graph": [{"@type": "Product"}, {"@type": "BreadcrumbList"}]}</script>`;
    const result = analyzeStructuredData(html);
    expect(result.hasProductSchema).toBe(true);
    expect(result.hasBreadcrumbSchema).toBe(true);
  });

  it("detects microdata schema", () => {
    const html = '<div itemtype="https://schema.org/Product" itemscope></div>';
    const result = analyzeStructuredData(html);
    expect(result.hasProductSchema).toBe(true);
  });

  it("returns empty for no schema", () => {
    const html = "<html><body>No schema</body></html>";
    const result = analyzeStructuredData(html);
    expect(result.types.length).toBe(0);
  });
});

describe("structuredDataCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await structuredDataCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when Product schema found", async () => {
    const result = await structuredDataCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<script type="application/ld+json">{"@type": "Product", "name": "Running Shoes"}</script>`,
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when no schema found", async () => {
    const result = await structuredDataCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "<html><body>No schema here</body></html>",
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
