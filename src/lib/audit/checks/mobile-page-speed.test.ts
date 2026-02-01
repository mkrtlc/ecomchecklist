import { describe, expect, it } from "vitest";
import { mobilePageSpeedCheck } from "./mobile-page-speed";

describe("mobilePageSpeedCheck", () => {
  it("warns when adapter is missing", async () => {
    const result = await mobilePageSpeedCheck.run({ url: "https://example.com" }, {});
    expect(result.status).toBe("warn");
  });

  it("passes when score >= 90", async () => {
    const result = await mobilePageSpeedCheck.run(
      { url: "https://example.com" },
      {
        pagespeed: {
          getMobilePerformanceScore0to100: async () => ({ score0to100: 95 }),
        },
      }
    );
    expect(result.status).toBe("pass");
  });

  it("fails when score < 50", async () => {
    const result = await mobilePageSpeedCheck.run(
      { url: "https://example.com" },
      {
        pagespeed: {
          getMobilePerformanceScore0to100: async () => ({ score0to100: 12 }),
        },
      }
    );
    expect(result.status).toBe("fail");
  });
});
