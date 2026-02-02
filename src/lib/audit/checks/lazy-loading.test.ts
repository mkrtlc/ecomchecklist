import { describe, expect, it } from "vitest";
import { lazyLoadingCheck } from "./lazy-loading";

describe("lazyLoadingCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await lazyLoadingCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when lazy loading is implemented", async () => {
    const result = await lazyLoadingCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html>
              <img src="hero.jpg" loading="eager">
              <img src="product1.jpg" loading="lazy">
              <img src="product2.jpg" loading="lazy">
              <img src="product3.jpg" loading="lazy">
            </html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[1]).toContain("3");
  });

  it("passes when JS lazy loading is detected", async () => {
    const result = await lazyLoadingCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html>
              <img data-src="product1.jpg" class="lazyload">
              <img data-src="product2.jpg" class="lazyload">
              <script src="lazysizes.min.js"></script>
            </html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.some((e) => e.includes("JavaScript"))).toBe(true);
  });

  it("warns when many images without lazy loading", async () => {
    const result = await lazyLoadingCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html>
              <img src="img1.jpg">
              <img src="img2.jpg">
              <img src="img3.jpg">
              <img src="img4.jpg">
              <img src="img5.jpg">
            </html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.[3]).toContain("5");
  });

  it("passes with few images", async () => {
    const result = await lazyLoadingCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><img src="logo.png"><img src="hero.jpg"></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });
});
