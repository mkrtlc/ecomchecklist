import { describe, expect, it } from "vitest";
import { inpScoreCheck } from "./inp-score";

describe("inpScoreCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await inpScoreCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when INP <= 200ms", async () => {
    const result = await inpScoreCheck.run(
      { url: "https://example.com" },
      {
        pagespeed: {
          getMobilePerformanceScore0to100: async () => ({
            score0to100: 95,
            raw: {
              lighthouseResult: {
                audits: {
                  "experimental-interaction-to-next-paint": { numericValue: 150 },
                },
              },
            },
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("INP");
  });

  it("warns when INP between 200ms and 500ms", async () => {
    const result = await inpScoreCheck.run(
      { url: "https://example.com" },
      {
        pagespeed: {
          getMobilePerformanceScore0to100: async () => ({
            score0to100: 70,
            raw: {
              lighthouseResult: {
                audits: {
                  "experimental-interaction-to-next-paint": { numericValue: 350 },
                },
              },
            },
          }),
        },
      }
    );
    expect(result.status).toBe("warn");
  });

  it("fails when INP > 500ms", async () => {
    const result = await inpScoreCheck.run(
      { url: "https://example.com" },
      {
        pagespeed: {
          getMobilePerformanceScore0to100: async () => ({
            score0to100: 40,
            raw: {
              lighthouseResult: {
                audits: {
                  "experimental-interaction-to-next-paint": { numericValue: 700 },
                },
              },
            },
          }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });

  it("uses TBT as fallback when INP not available", async () => {
    const result = await inpScoreCheck.run(
      { url: "https://example.com" },
      {
        pagespeed: {
          getMobilePerformanceScore0to100: async () => ({
            score0to100: 80,
            raw: {
              lighthouseResult: {
                audits: {
                  "total-blocking-time": { numericValue: 150 },
                },
              },
            },
          }),
        },
      }
    );
    expect(result.status).toBe("pass");
    expect(result.evidence?.[0]).toContain("Total Blocking Time");
  });
});
