import { describe, expect, it } from "vitest";
import { dnsPrefetchCheck } from "./dns-prefetch";

describe("dnsPrefetchCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await dnsPrefetchCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when dns-prefetch hints are present", async () => {
    const result = await dnsPrefetchCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <link rel="dns-prefetch" href="//fonts.googleapis.com">
              <link rel="dns-prefetch" href="//cdn.example.com">
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("2 dns-prefetch");
  });

  it("passes when preconnect hints are used", async () => {
    const result = await dnsPrefetchCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <link rel="preconnect" href="https://fonts.gstatic.com">
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[1]).toContain("1 preconnect");
  });

  it("warns when many external domains without prefetch", async () => {
    const result = await dnsPrefetchCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html>
              <script src="https://analytics.google.com/ga.js"></script>
              <script src="https://cdn.jsdelivr.net/lib.js"></script>
              <script src="https://api.stripe.com/v3/"></script>
              <img src="https://images.unsplash.com/photo.jpg">
            </html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.some((e) => e.includes("Consider adding"))).toBe(true);
  });
});
