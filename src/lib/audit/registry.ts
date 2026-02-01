import type { AuditCheckDefinition, AuditResolvedCheck, AuditRun } from "./types";

export interface AuditRegistry {
  definitions: AuditCheckDefinition[];
}

export function createRegistry(definitions: AuditCheckDefinition[]): AuditRegistry {
  const ids = new Set<string>();
  for (const def of definitions) {
    if (!def.id) throw new Error("AuditCheckDefinition.id is required");
    if (ids.has(def.id)) throw new Error(`Duplicate check id: ${def.id}`);
    ids.add(def.id);
  }

  return { definitions };
}

export function resolveAuditRun(run: AuditRun, registry: AuditRegistry): AuditResolvedCheck[] {
  const defById = new Map(registry.definitions.map((d) => [d.id, d] as const));

  return run.checks
    .map((result) => {
      const def = defById.get(result.checkId);
      if (!def) return null;
      return { definition: def, result };
    })
    .filter((x): x is AuditResolvedCheck => Boolean(x));
}
