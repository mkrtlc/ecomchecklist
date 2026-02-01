import { describe, expect, it } from "vitest";
import { lcpScoreCheck } from "./lcp-score";

describe("lcpScoreCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await lcpScoreCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when LCP <= 2.5s", async () => {
    const result = await lcpScoreCheck.run(
      { url: "https://example.com" },
      {
        pagespeed: {
          getMobilePerformanceScore0to100: async () => ({
            score0to100: 95,
            raw: {
              lighthouseResult: {
                audits: {
                  "largest-contentful-paint": { numericValue: 2000 }, // 2s
                },
              },
            },
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("2.00s");
  });

  it("warns when LCP between 2.5s and 4s", async () => {
    const result = await lcpScoreCheck.run(
      { url: "https://example.com" },
      {
        pagespeed: {
          getMobilePerformanceScore0to100: async () => ({
            score0to100: 70,
            raw: {
              lighthouseResult: {
                audits: {
                  "largest-contentful-paint": { numericValue: 3500 }, // 3.5s
                },
              },
            },
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
  });

  it("fails when LCP > 4s", async () => {
    const result = await lcpScoreCheck.run(
      { url: "https://example.com" },
      {
        pagespeed: {
          getMobilePerformanceScore0to100: async () => ({
            score0to100: 40,
            raw: {
              lighthouseResult: {
                audits: {
                  "largest-contentful-paint": { numericValue: 5000 }, // 5s
                },
              },
            },
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });

  it("falls back to overall score when LCP not available", async () => {
    const result = await lcpScoreCheck.run(
      { url: "https://example.com" },
      {
        pagespeed: {
          getMobilePerformanceScore0to100: async () => ({
            score0to100: 95,
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("Performance score");
  });
});
