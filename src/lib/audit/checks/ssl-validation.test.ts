import { describe, expect, it } from "vitest";
import { sslValidationCheck } from "./ssl-validation";

describe("sslValidationCheck", () => {
  it("warns when adapter missing", async () => {
    const r = await sslValidationCheck.run({ url: "https://example.com" }, {});
    expect(r.status).toBe("warn");
  });

  it("passes when cert valid", async () => {
    const r = await sslValidationCheck.run(
      { url: "https://example.com" },
      {
        ssl: {
          getCertificateInfo: async () => ({ valid: true, issuer: "Let's Encrypt" }),
        },
      }
    );
    expect(r.status).toBe("pass");
  });

  it("fails when cert invalid", async () => {
    const r = await sslValidationCheck.run(
      { url: "https://example.com" },
      {
        ssl: {
          getCertificateInfo: async () => ({ valid: false }),
        },
      }
    );
    expect(r.status).toBe("fail");
  });
});
