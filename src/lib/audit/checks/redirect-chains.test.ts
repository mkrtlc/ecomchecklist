import { describe, expect, it } from "vitest";
import { redirectChainsCheck } from "./redirect-chains";

describe("redirectChainsCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await redirectChainsCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when no redirect chains are found", async () => {
    const result = await redirectChainsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async (url: string) => ({
            html: `<html><a href="https://example.com/page1">Link</a></html>`,
            finalUrl: url,
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("warns when redirect chains are detected", async () => {
    let callCount = 0;
    const result = await redirectChainsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async (url: string) => {
            callCount++;
            if (callCount === 1) {
              return {
                html: `<html><a href="https://example.com/old-page">Link</a></html>`,
                finalUrl: "https://example.com/",
              };
            }
            return {
              html: `<html></html>`,
              finalUrl: "https://example.com/new-page",
            };
          },
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.[0]).toContain("redirect");
  });
});
