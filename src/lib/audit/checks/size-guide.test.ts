import { describe, expect, it } from "vitest";
import { sizeGuideCheck, __test__ } from "./size-guide";

const { detectSizeGuide } = __test__;

describe("detectSizeGuide", () => {
  it("detects size guide", () => {
    expect(detectSizeGuide('<a href="#">Size Guide</a>').hasSizeGuide).toBe(true);
  });
});

describe("sizeGuideCheck", () => {
  it("warns when adapter missing", async () => {
    const result = await sizeGuideCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when size guide present", async () => {
    const result = await sizeGuideCheck.run(
      { url: "https://example.com/p" },
      { html: { fetchHtml: async () => ({ html: '<div>Size Chart</div>', finalUrl: "https://example.com/p" }) } }
    );
    expect(result.status).toBe("pass");
  });
});
