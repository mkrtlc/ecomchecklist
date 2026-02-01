import { describe, expect, it } from "vitest";
import { clsScoreCheck } from "./cls-score";

describe("clsScoreCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await clsScoreCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when CLS <= 0.1", async () => {
    const result = await clsScoreCheck.run(
      { url: "https://example.com" },
      {
        pagespeed: {
          getMobilePerformanceScore0to100: async () => ({
            score0to100: 95,
            raw: {
              lighthouseResult: {
                audits: {
                  "cumulative-layout-shift": { numericValue: 0.05 },
                },
              },
            },
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("0.050");
  });

  it("warns when CLS between 0.1 and 0.25", async () => {
    const result = await clsScoreCheck.run(
      { url: "https://example.com" },
      {
        pagespeed: {
          getMobilePerformanceScore0to100: async () => ({
            score0to100: 70,
            raw: {
              lighthouseResult: {
                audits: {
                  "cumulative-layout-shift": { numericValue: 0.15 },
                },
              },
            },
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
  });

  it("fails when CLS > 0.25", async () => {
    const result = await clsScoreCheck.run(
      { url: "https://example.com" },
      {
        pagespeed: {
          getMobilePerformanceScore0to100: async () => ({
            score0to100: 40,
            raw: {
              lighthouseResult: {
                audits: {
                  "cumulative-layout-shift": { numericValue: 0.4 },
                },
              },
            },
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
