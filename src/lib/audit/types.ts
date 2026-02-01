export type CheckStatus = "pass" | "warn" | "fail";

export type Severity = "critical" | "high" | "medium" | "nice";

export type AuditCategoryId =
  | "performance"
  | "security"
  | "conversion"
  | "seo"
  | "accessibility"
  | "ux"
  | "content"
  | "analytics"
  | "other";

export interface CheckReference {
  title: string;
  url: string;
}

export interface AuditCheckDefinition {
  /** Stable ID, used for score calculation + report rendering. */
  id: string;
  title: string;
  category: AuditCategoryId;
  severity: Severity;
  /**
   * Short explanation of why the check matters.
   * Rendered in the PDF report.
   */
  whyImportant: string;
  /**
   * Actionable remediation guidance.
   * Rendered in the PDF report.
   */
  howToFix: string;
  references?: CheckReference[];
}

export interface AuditCheckResult {
  checkId: string;
  status: CheckStatus;
  /** Human-readable evidence/notes (e.g., "LCP 3.1s", "No Product schema detected"). */
  evidence?: string[];
  /** Which URLs were tested for this specific check. */
  urlsTested?: string[];
}

export interface AuditRun {
  url: string;
  auditedAt: string; // ISO timestamp
  checks: AuditCheckResult[];
  /**
   * Optional per-run metadata.
   * Useful later for adapters like Lighthouse, PageSpeed, etc.
   */
  meta?: Record<string, unknown>;
}

export interface AuditResolvedCheck {
  definition: AuditCheckDefinition;
  result: AuditCheckResult;
}

export type CheckStatusLabel = "Passed" | "Warning" | "Failed";

export function getStatusLabel(status: CheckStatus): CheckStatusLabel {
  switch (status) {
    case "pass":
      return "Passed";
    case "warn":
      return "Warning";
    case "fail":
      return "Failed";
  }
}
