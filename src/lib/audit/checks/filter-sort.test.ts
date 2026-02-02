import { describe, expect, it } from "vitest";
import { filterSortCheck, __test__ } from "./filter-sort";

const { detectFilterSort } = __test__;

describe("detectFilterSort", () => {
  it("detects filters", () => {
    const html = '<button aria-label="Filter">Filter</button><div>Size Color</div>';
    const res = detectFilterSort(html);
    expect(res.hasFilters).toBe(true);
  });

  it("detects sorting", () => {
    const html = '<select aria-label="Sort"><option>Price low</option></select>';
    const res = detectFilterSort(html);
    expect(res.hasSort).toBe(true);
  });

  it("returns false when no signals", () => {
    const html = "<html><body>Home</body></html>";
    const res = detectFilterSort(html);
    expect(res.hasFilters).toBe(false);
    expect(res.hasSort).toBe(false);
  });
});

describe("filterSortCheck", () => {
  it("warns when adapter missing", async () => {
    const result = await filterSortCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when both present", async () => {
    const result = await filterSortCheck.run(
      { url: "https://example.com/collections/shoes" },
      { html: { fetchHtml: async () => ({ html: '<button>Filter</button><select><option>Best selling</option></select>', finalUrl: "https://example.com/collections/shoes" }) } }
    );
    expect(result.status).toBe("pass");
  });
});
