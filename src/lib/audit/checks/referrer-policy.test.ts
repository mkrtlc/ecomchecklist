import { describe, expect, it } from "vitest";
import { referrerPolicyCheck } from "./referrer-policy";

describe("referrerPolicyCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await referrerPolicyCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes with secure referrer policy meta tag", async () => {
    const result = await referrerPolicyCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <meta name="referrer" content="strict-origin-when-cross-origin">
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("strict-origin-when-cross-origin");
  });

  it("passes with no-referrer policy", async () => {
    const result = await referrerPolicyCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head>
              <meta name="referrer" content="no-referrer">
            </head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("warns when no referrer policy found", async () => {
    const result = await referrerPolicyCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><body>No policy</body></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.some((e) => e.includes("Recommended"))).toBe(true);
  });

  it("notes when individual referrerpolicy attributes found", async () => {
    const result = await referrerPolicyCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html>
              <a href="https://other.com" referrerpolicy="no-referrer">Link</a>
            </html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.some((e) => e.includes("Individual"))).toBe(true);
  });
});
