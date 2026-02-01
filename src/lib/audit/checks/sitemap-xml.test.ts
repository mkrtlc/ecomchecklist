import { describe, expect, it } from "vitest";
import { sitemapXmlCheck, __test__ } from "./sitemap-xml";

const { analyzeSitemap } = __test__;

describe("analyzeSitemap", () => {
  it("validates proper sitemap", () => {
    const content = `<?xml version="1.0"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc><lastmod>2024-01-01</lastmod></url>
  <url><loc>https://example.com/products</loc></url>
</urlset>`;
    const result = analyzeSitemap(content);
    expect(result.isValid).toBe(true);
    expect(result.urlCount).toBe(2);
  });

  it("detects invalid content", () => {
    const content = "<html><body>Not a sitemap</body></html>";
    const result = analyzeSitemap(content);
    expect(result.isValid).toBe(false);
  });

  it("detects empty sitemap", () => {
    const content = '<?xml version="1.0"?><urlset></urlset>';
    const result = analyzeSitemap(content);
    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.includes("no URLs"))).toBe(true);
  });

  it("detects sitemap index", () => {
    const content = `<?xml version="1.0"?>
<sitemapindex>
  <sitemap><loc>https://example.com/sitemap-products.xml</loc></sitemap>
</sitemapindex>`;
    const result = analyzeSitemap(content);
    expect(result.isValid).toBe(true);
    expect(result.issues.some(i => i.includes("index"))).toBe(true);
  });
});

describe("sitemapXmlCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await sitemapXmlCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when valid sitemap found", async () => {
    const result = await sitemapXmlCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<?xml version="1.0"?>
<urlset><url><loc>https://example.com/</loc></url></urlset>`,
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when HTML error page returned", async () => {
    const result = await sitemapXmlCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "<!DOCTYPE html><html><body>404</body></html>",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
