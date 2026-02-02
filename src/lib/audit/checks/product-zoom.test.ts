import { describe, expect, it } from "vitest";
import { productZoomCheck, __test__ } from "./product-zoom";

const { detectProductZoom } = __test__;

describe("detectProductZoom", () => {
  it("detects zoom indicators", () => {
    expect(detectProductZoom('<div data-zoom="true">Zoom</div>').hasZoom).toBe(true);
  });

  it("returns false when none", () => {
    expect(detectProductZoom("<html></html>").hasZoom).toBe(false);
  });
});

describe("productZoomCheck", () => {
  it("warns when adapter missing", async () => {
    const result = await productZoomCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when zoom found", async () => {
    const result = await productZoomCheck.run(
      { url: "https://example.com/p" },
      { html: { fetchHtml: async () => ({ html: '<div class="product-zoom">zoom</div>', finalUrl: "https://example.com/p" }) } }
    );
    expect(result.status).toBe("pass");
  });
});
