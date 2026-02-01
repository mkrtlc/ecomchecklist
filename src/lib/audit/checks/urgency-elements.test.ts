import { describe, expect, it } from "vitest";
import { urgencyElementsCheck, __test__ } from "./urgency-elements";

const { detectUrgencyElements } = __test__;

describe("detectUrgencyElements", () => {
  it("detects low stock warning", () => {
    const html = '<span class="stock">Only 3 left in stock!</span>';
    const { found, hasUrgency } = detectUrgencyElements(html);
    expect(hasUrgency).toBe(true);
    expect(found).toContain("Low Stock Warning");
  });

  it("detects countdown timer", () => {
    const html = '<div class="countdown" data-expires="2024-12-31">Sale ends in countdown</div>';
    const { found } = detectUrgencyElements(html);
    expect(found).toContain("Countdown Timer");
  });

  it("detects viewer count", () => {
    const html = "<span>12 people are viewing this right now</span>";
    const { found } = detectUrgencyElements(html);
    expect(found).toContain("Live Viewer Count");
  });

  it("detects bestseller status", () => {
    const html = '<span class="badge">Bestseller</span>';
    const { found } = detectUrgencyElements(html);
    expect(found).toContain("Popularity Indicator");
  });

  it("returns empty for no urgency", () => {
    const html = "<html><body>Regular product page</body></html>";
    const { hasUrgency } = detectUrgencyElements(html);
    expect(hasUrgency).toBe(false);
  });
});

describe("urgencyElementsCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await urgencyElementsCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when urgency elements found", async () => {
    const result = await urgencyElementsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<div>Only 5 left in stock! Sale ends today!</div>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("warns when no urgency found", async () => {
    const result = await urgencyElementsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "<html><body>Standard product info</body></html>",
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
  });
});
