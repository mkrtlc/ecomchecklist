import { describe, expect, it } from "vitest";
import { productImageQualityCheck, __test__ } from "./product-image-quality";

describe("analyzeProductImages", () => {
  it("counts images with alt text", () => {
    const html = `<img src="a.jpg" alt="Product"><img src="b.jpg"><img src="c.jpg" alt="Another">`;
    const result = __test__.analyzeProductImages(html);
    expect(result?.totalImages).toBe(3);
    expect(result?.imagesWithAlt).toBe(2);
  });

  it("detects dimensions", () => {
    const html = `<img src="a.jpg" width="800" height="600"><img src="b.jpg">`;
    const result = __test__.analyzeProductImages(html);
    expect(result?.imagesWithDimensions).toBe(1);
  });

  it("detects lazy loading", () => {
    const html = `<img src="a.jpg" loading="lazy"><img data-src="b.jpg">`;
    const result = __test__.analyzeProductImages(html);
    expect(result?.lazyLoadedImages).toBe(2);
  });

  it("returns null when no images", () => {
    expect(__test__.analyzeProductImages("<html><body>No images</body></html>")).toBeNull();
  });
});

describe("productImageQualityCheck", () => {
  it("warns when adapter missing", async () => {
    const r = await productImageQualityCheck.run({ url: "https://example.com" }, {});
    expect(r.status).toBe("warn");
  });

  it("passes with good images", async () => {
    const html = `
      <img src="1.jpg" alt="Product 1" width="800" height="600">
      <img src="2.jpg" alt="Product 2" width="800" height="600">
      <img src="3.jpg" alt="Product 3" width="800" height="600">
    `;
    const r = await productImageQualityCheck.run(
      { url: "https://example.com" },
      { html: { fetchHtml: async () => ({ html, finalUrl: "https://example.com/product" }) } }
    );
    expect(r.status).toBe("pass");
  });

  it("fails with poor images", async () => {
    const html = `<img src="1.jpg"><img src="2.jpg"><img src="3.jpg">`;
    const r = await productImageQualityCheck.run(
      { url: "https://example.com" },
      { html: { fetchHtml: async () => ({ html }) } }
    );
    expect(r.status).toBe("fail");
  });
});
