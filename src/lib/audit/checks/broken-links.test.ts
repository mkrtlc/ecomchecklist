import { describe, expect, it } from "vitest";
import { brokenLinksCheck } from "./broken-links";

describe("brokenLinksCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await brokenLinksCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when all links are valid", async () => {
    const result = await brokenLinksCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><a href="https://example.com/page1">Link 1</a><a href="/page2">Link 2</a></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when broken links are detected", async () => {
    let callCount = 0;
    const result = await brokenLinksCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async (url: string) => {
            callCount++;
            if (callCount === 1) {
              return {
                html: `<html><a href="https://example.com/broken">Broken</a></html>`,
                finalUrl: "https://example.com/",
              };
            }
            throw new Error("404 Not Found");
          },
        },
      }
    );
    expect(result.status).toBe("fail");
    expect(result.evidence?.[0]).toContain("broken link");
  });

  it("ignores mailto and tel links", async () => {
    const result = await brokenLinksCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><a href="mailto:test@example.com">Email</a><a href="tel:+1234567890">Call</a></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });
});
