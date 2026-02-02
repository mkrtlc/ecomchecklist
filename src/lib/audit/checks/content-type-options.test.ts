import { describe, expect, it } from "vitest";
import { contentTypeOptionsCheck } from "./content-type-options";

describe("contentTypeOptionsCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await contentTypeOptionsCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when modern framework detected", async () => {
    const result = await contentTypeOptionsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><head><meta name="generator" content="Next.js"></head></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("Modern framework");
  });

  it("passes when Cloudflare detected", async () => {
    const result = await contentTypeOptionsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><script src="https://cdnjs.cloudflare.com/ajax/libs/lib.js"></script></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("warns on unknown platform", async () => {
    const result = await contentTypeOptionsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><body>Plain HTML site</body></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.some((e) => e.includes("nosniff"))).toBe(true);
  });
});
