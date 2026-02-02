import { describe, expect, it } from "vitest";
import { notFoundHandlingCheck, __test__ } from "./404-handling";

const { analyze404Page } = __test__;

describe("analyze404Page", () => {
  it("detects 404 messaging and helpful links", () => {
    const html = '<h1>404 - Page not found</h1><a href="/">Home</a><form><input type="search"></form>';
    const res = analyze404Page(html);
    expect(res.looksLike404).toBe(true);
    expect(res.hasHelpfulLinks).toBe(true);
  });

  it("flags missing messaging", () => {
    const html = "<html><body>Nothing here</body></html>";
    const res = analyze404Page(html);
    expect(res.looksLike404).toBe(false);
  });
});

describe("notFoundHandlingCheck", () => {
  it("warns when adapter missing", async () => {
    const result = await notFoundHandlingCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when custom 404 detected", async () => {
    const result = await notFoundHandlingCheck.run(
      { url: "https://example.com" },
      { html: { fetchHtml: async () => ({ html: '<h1>404 page not found</h1><a href="/">Home</a>', finalUrl: "https://example.com/__ecomchecklist_404_test__" }) } }
    );
    expect(result.status).toBe("pass");
  });
});
