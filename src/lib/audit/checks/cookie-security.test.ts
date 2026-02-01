import { describe, expect, it } from "vitest";
import { cookieSecurityCheck, __test__ } from "./cookie-security";

const { analyzeCookieSecurity } = __test__;

describe("analyzeCookieSecurity", () => {
  it("detects secure cookie indicators", () => {
    const html = '<script>document.cookie = "session=abc; Secure; HttpOnly";</script>';
    const { hasSecureIndicators } = analyzeCookieSecurity(html);
    expect(hasSecureIndicators).toBe(true);
  });

  it("detects SameSite indicators", () => {
    const html = "SameSite=Strict";
    const { hasSecureIndicators } = analyzeCookieSecurity(html);
    expect(hasSecureIndicators).toBe(true);
  });
});

describe("cookieSecurityCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await cookieSecurityCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when secure indicators found", async () => {
    const result = await cookieSecurityCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: '<script>// Cookie config: Secure; HttpOnly; SameSite=Strict</script>',
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("warns when no indicators found", async () => {
    const result = await cookieSecurityCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: "<html><body>Hello</body></html>",
            finalUrl: "https://example.com",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
  });
});
