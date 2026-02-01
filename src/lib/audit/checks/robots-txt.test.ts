import { describe, expect, it } from "vitest";
import { robotsTxtCheck, __test__ } from "./robots-txt";

const { analyzeRobotsTxt } = __test__;

describe("analyzeRobotsTxt", () => {
  it("validates proper robots.txt", () => {
    const content = `
User-agent: *
Disallow: /admin
Allow: /

Sitemap: https://example.com/sitemap.xml
    `;
    const result = analyzeRobotsTxt(content);
    expect(result.isValid).toBe(true);
    expect(result.hasRules).toBe(true);
  });

  it("detects missing User-agent", () => {
    const content = "Disallow: /admin";
    const result = analyzeRobotsTxt(content);
    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.includes("User-agent"))).toBe(true);
  });

  it("warns about missing Sitemap", () => {
    const content = `
User-agent: *
Disallow: /private
    `;
    const result = analyzeRobotsTxt(content);
    expect(result.issues.some(i => i.includes("Sitemap"))).toBe(true);
  });

  it("warns about Disallow: /", () => {
    const content = `
User-agent: *
Disallow: /
    `;
    const result = analyzeRobotsTxt(content);
    expect(result.issues.some(i => i.includes("blocks all"))).toBe(true);
  });
});

describe("robotsTxtCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await robotsTxtCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when valid robots.txt found", async () => {
    const result = await robotsTxtCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "User-agent: *\nDisallow: /admin\nSitemap: https://example.com/sitemap.xml",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when HTML error page returned", async () => {
    const result = await robotsTxtCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "<!DOCTYPE html><html><body>404 Not Found</body></html>",
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
