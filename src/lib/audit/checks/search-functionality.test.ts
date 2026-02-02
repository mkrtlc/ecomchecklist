import { describe, expect, it } from "vitest";
import { searchFunctionalityCheck, __test__ } from "./search-functionality";

const { detectSearch } = __test__;

describe("detectSearch", () => {
  it("detects search input", () => {
    const html = '<input type="search" placeholder="Search products">';
    expect(detectSearch(html).hasSearch).toBe(true);
  });

  it("detects search form action", () => {
    const html = '<form action="/search"><input name="q"></form>';
    expect(detectSearch(html).hasSearch).toBe(true);
  });

  it("returns false when no search", () => {
    const html = "<html><body>No search</body></html>";
    expect(detectSearch(html).hasSearch).toBe(false);
  });
});

describe("searchFunctionalityCheck", () => {
  it("warns when adapter missing", async () => {
    const result = await searchFunctionalityCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when search found", async () => {
    const result = await searchFunctionalityCheck.run(
      { url: "https://example.com" },
      { html: { fetchHtml: async () => ({ html: '<form action="/search"><input type="search"></form>', finalUrl: "https://example.com" }) } }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when search not found", async () => {
    const result = await searchFunctionalityCheck.run(
      { url: "https://example.com" },
      { html: { fetchHtml: async () => ({ html: "<html><body>Home</body></html>", finalUrl: "https://example.com" }) } }
    );
    expect(result.status).toBe("fail");
  });
});
