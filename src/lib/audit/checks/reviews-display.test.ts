import { describe, expect, it } from "vitest";
import { reviewsDisplayCheck, __test__ } from "./reviews-display";

const { detectReviews } = __test__;

describe("detectReviews", () => {
  it("detects star ratings", () => {
    const html = '<span class="star-rating">4.5 out of 5 stars</span>';
    const { hasRatings } = detectReviews(html);
    expect(hasRatings).toBe(true);
  });

  it("detects review count", () => {
    const html = '<a href="#reviews">125 Customer Reviews</a>';
    const { hasReviews } = detectReviews(html);
    expect(hasReviews).toBe(true);
  });

  it("detects review platforms", () => {
    const html = '<script src="https://cdn.yotpo.com/widget.js"></script>';
    const { hasReviews, evidence } = detectReviews(html);
    expect(hasReviews).toBe(true);
    expect(evidence.some(e => e.includes("yotpo"))).toBe(true);
  });

  it("detects star symbols", () => {
    const html = "<span>★★★★☆</span>";
    const { hasRatings } = detectReviews(html);
    expect(hasRatings).toBe(true);
  });

  it("returns false for no reviews", () => {
    const html = "<html><body>Product description only</body></html>";
    const { hasReviews, hasRatings } = detectReviews(html);
    expect(hasReviews).toBe(false);
    expect(hasRatings).toBe(false);
  });
});

describe("reviewsDisplayCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await reviewsDisplayCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when reviews found", async () => {
    const result = await reviewsDisplayCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<div class="reviews"><span>4.8 out of 5</span><span>250 Customer Reviews</span></div>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when no reviews found", async () => {
    const result = await reviewsDisplayCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "<html><body>Plain product page</body></html>",
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
