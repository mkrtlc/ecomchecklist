export interface IndustryBenchmark {
  industryLabel: string;
  industryAvgScore0to100: number;
}

/**
 * Phase-0 baseline benchmark.
 *
 * For now this is configurable via env vars so we can iterate without code changes.
 * Later: make this depend on store vertical, traffic source, or region.
 */
export function getIndustryBenchmark(): IndustryBenchmark {
  const avgRaw = Number(process.env.NEXT_PUBLIC_INDUSTRY_AVG_SCORE ?? "72");
  const avg = Number.isFinite(avgRaw) ? avgRaw : 72;

  return {
    industryLabel: process.env.NEXT_PUBLIC_INDUSTRY_LABEL ?? "E-commerce",
    industryAvgScore0to100: Math.max(0, Math.min(100, Math.round(avg))),
  };
}

export function compareToBenchmark(input: {
  yourScore0to100: number;
  benchmark: IndustryBenchmark;
}): { delta: number; label: string } {
  const delta = Math.round(input.yourScore0to100 - input.benchmark.industryAvgScore0to100);
  const label = delta === 0 ? "On par" : delta > 0 ? `+${delta} vs avg` : `${delta} vs avg`;
  return { delta, label };
}

export function isCompetitorComparisonEnabled(): boolean {
  return process.env.NEXT_PUBLIC_COMPETITOR_COMPARISON === "1";
}
