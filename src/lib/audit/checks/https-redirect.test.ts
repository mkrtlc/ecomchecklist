import { describe, expect, it } from "vitest";
import { httpsRedirectCheck } from "./https-redirect";

describe("httpsRedirectCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await httpsRedirectCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when HTTP redirects to HTTPS", async () => {
    const result = await httpsRedirectCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({ html: "<html></html>", finalUrl: "https://example.com/" }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("correctly redirects");
  });

  it("fails when HTTP does not redirect to HTTPS", async () => {
    const result = await httpsRedirectCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({ html: "<html></html>", finalUrl: "http://example.com/" }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
