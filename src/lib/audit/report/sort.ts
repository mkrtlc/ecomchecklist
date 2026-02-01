import type { AuditResolvedCheck, Severity } from "../types";

const SEVERITY_PRIORITY: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  nice: 1,
};

const STATUS_PRIORITY: Record<AuditResolvedCheck["result"]["status"], number> = {
  fail: 3,
  warn: 2,
  pass: 1,
};

export function sortChecksByPriority(checks: AuditResolvedCheck[]): AuditResolvedCheck[] {
  return [...checks].sort((a, b) => {
    const s = STATUS_PRIORITY[b.result.status] - STATUS_PRIORITY[a.result.status];
    if (s !== 0) return s;

    const sev = SEVERITY_PRIORITY[b.definition.severity] - SEVERITY_PRIORITY[a.definition.severity];
    if (sev !== 0) return sev;

    return a.definition.title.localeCompare(b.definition.title);
  });
}
