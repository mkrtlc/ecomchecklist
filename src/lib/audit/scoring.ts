import type { AuditCheckDefinition, AuditCheckResult, AuditCategoryId, CheckStatus, Severity } from "./types";

export const DEFAULT_SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 3,
  high: 2,
  medium: 1,
  nice: 0.5,
};

export const DEFAULT_STATUS_MULTIPLIERS: Record<CheckStatus, number> = {
  pass: 1,
  warn: 0.5,
  fail: 0,
};

export interface ScoreBreakdown {
  possible: number;
  earned: number;
  score0to100: number;
}

export interface CategoryScore extends ScoreBreakdown {
  category: AuditCategoryId;
}

export interface AuditScore {
  overall: ScoreBreakdown;
  byCategory: CategoryScore[];
}

export interface ComputeScoreInput {
  definitions: AuditCheckDefinition[];
  results: AuditCheckResult[];
  severityWeights?: Partial<Record<Severity, number>>;
  statusMultipliers?: Partial<Record<CheckStatus, number>>;
}

function safeScore0to100(earned: number, possible: number): number {
  if (possible <= 0) return 0;
  const raw = (earned / possible) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function computeAuditScore(input: ComputeScoreInput): AuditScore {
  const severityWeights = { ...DEFAULT_SEVERITY_WEIGHTS, ...(input.severityWeights ?? {}) };
  const statusMultipliers = { ...DEFAULT_STATUS_MULTIPLIERS, ...(input.statusMultipliers ?? {}) };

  const defById = new Map(input.definitions.map((d) => [d.id, d] as const));

  const byCategory = new Map<AuditCategoryId, { possible: number; earned: number }>();
  let possibleOverall = 0;
  let earnedOverall = 0;

  for (const r of input.results) {
    const def = defById.get(r.checkId);
    if (!def) continue;

    const weight = severityWeights[def.severity] ?? 0;
    const mult = statusMultipliers[r.status] ?? 0;

    const possible = weight;
    const earned = weight * mult;

    possibleOverall += possible;
    earnedOverall += earned;

    const current = byCategory.get(def.category) ?? { possible: 0, earned: 0 };
    current.possible += possible;
    current.earned += earned;
    byCategory.set(def.category, current);
  }

  const categoryScores: CategoryScore[] = [...byCategory.entries()]
    .map(([category, v]) => ({
      category,
      possible: v.possible,
      earned: v.earned,
      score0to100: safeScore0to100(v.earned, v.possible),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  const overall: ScoreBreakdown = {
    possible: possibleOverall,
    earned: earnedOverall,
    score0to100: safeScore0to100(earnedOverall, possibleOverall),
  };

  return { overall, byCategory: categoryScores };
}
