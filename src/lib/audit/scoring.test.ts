import { describe, expect, it } from "vitest";
import { computeAuditScore } from "./scoring";
import type { AuditCheckDefinition, AuditCheckResult } from "./types";

const defs: AuditCheckDefinition[] = [
  {
    id: "ssl",
    title: "SSL",
    category: "security",
    severity: "critical",
    whyImportant: "",
    howToFix: "",
  },
  {
    id: "lcp",
    title: "LCP",
    category: "performance",
    severity: "high",
    whyImportant: "",
    howToFix: "",
  },
  {
    id: "alt-tags",
    title: "Alt tags",
    category: "seo",
    severity: "medium",
    whyImportant: "",
    howToFix: "",
  },
  {
    id: "ab-tests",
    title: "A/B testing infra",
    category: "analytics",
    severity: "nice",
    whyImportant: "",
    howToFix: "",
  },
];

describe("computeAuditScore", () => {
  it("computes weighted overall score (pass=1, warn=0.5, fail=0)", () => {
    const results: AuditCheckResult[] = [
      { checkId: "ssl", status: "pass" }, // 3 * 1
      { checkId: "lcp", status: "warn" }, // 2 * 0.5
      { checkId: "alt-tags", status: "fail" }, // 1 * 0
      { checkId: "ab-tests", status: "pass" }, // 0.5 * 1
    ];

    const score = computeAuditScore({ definitions: defs, results });

    // possible = 3 + 2 + 1 + 0.5 = 6.5
    // earned = 3 + 1 + 0 + 0.5 = 4.5
    // 4.5/6.5 = 69.23 -> 69
    expect(score.overall.possible).toBeCloseTo(6.5);
    expect(score.overall.earned).toBeCloseTo(4.5);
    expect(score.overall.score0to100).toBe(69);
  });

  it("computes per-category subscores", () => {
    const results: AuditCheckResult[] = [
      { checkId: "ssl", status: "fail" },
      { checkId: "lcp", status: "pass" },
    ];

    const score = computeAuditScore({ definitions: defs, results });

    const security = score.byCategory.find((c) => c.category === "security");
    expect(security?.score0to100).toBe(0);

    const perf = score.byCategory.find((c) => c.category === "performance");
    expect(perf?.score0to100).toBe(100);
  });
});
