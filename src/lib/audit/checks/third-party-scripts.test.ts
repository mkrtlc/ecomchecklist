import { describe, expect, it } from "vitest";
import { thirdPartyScriptsCheck } from "./third-party-scripts";

describe("thirdPartyScriptsCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await thirdPartyScriptsCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when third-party scripts use async/defer", async () => {
    const result = await thirdPartyScriptsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html>
              <script src="https://analytics.google.com/ga.js" async></script>
              <script src="https://cdn.example.net/lib.js" defer></script>
            </html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[1]).toContain("Async: 1");
    expect(result.evidence?.[1]).toContain("Defer: 1");
  });

  it("warns when blocking third-party scripts found", async () => {
    const result = await thirdPartyScriptsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html>
              <script src="https://third-party1.com/script.js"></script>
              <script src="https://third-party2.com/script.js"></script>
              <script src="https://third-party3.com/script.js"></script>
              <script src="https://third-party4.com/script.js"></script>
            </html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.some((e) => e.includes("blocking"))).toBe(true);
  });

  it("warns when heavy services detected", async () => {
    const result = await thirdPartyScriptsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html>
              <script src="https://connect.facebook.net/sdk.js" async></script>
              <script src="https://widget.intercom.io/widget.js" async></script>
            </html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.some((e) => e.includes("Heavy services"))).toBe(true);
  });

  it("passes with no third-party scripts", async () => {
    const result = await thirdPartyScriptsCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html>
              <script src="/js/app.js"></script>
              <script>console.log('inline');</script>
            </html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("0");
  });
});
