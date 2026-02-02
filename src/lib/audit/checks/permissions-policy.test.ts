import { describe, expect, it } from "vitest";
import { permissionsPolicyCheck } from "./permissions-policy";

describe("permissionsPolicyCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await permissionsPolicyCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when secure platform detected", async () => {
    const result = await permissionsPolicyCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><script src="https://js.stripe.com/v3/"></script></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.some((e) => e.includes("Secure platform"))).toBe(true);
  });

  it("passes when sandboxed iframes found", async () => {
    const result = await permissionsPolicyCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html>
              <iframe src="https://widget.com" sandbox="allow-scripts allow-same-origin"></iframe>
            </html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.some((e) => e.includes("Sandboxed"))).toBe(true);
  });

  it("notes iframes with allow attributes", async () => {
    const result = await permissionsPolicyCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html>
              <iframe src="https://payment.com" allow="payment 'self'"></iframe>
            </html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.some((e) => e.includes("allow attributes"))).toBe(true);
  });

  it("warns when no permissions controls detected", async () => {
    const result = await permissionsPolicyCheck.run(
      { url: "https://example.com" },
      {
        html: {
          fetchHtml: async () => ({
            html: `<html><body>Basic page</body></html>`,
            finalUrl: "https://example.com/",
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
    expect(result.evidence?.some((e) => e.includes("Consider adding"))).toBe(true);
  });
});
