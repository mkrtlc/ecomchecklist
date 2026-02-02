// Audit-specific database operations
import { updateAudit } from './index';

export interface CheckResultInput {
  audit_id: string;
  check_id: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  evidence: {
    evidence?: string[];
    urlsTested?: string[];
  };
}

// In-memory store for check results (replace with Supabase in production)
const checkResults = new Map<string, CheckResultInput[]>();

export async function startAudit(auditId: string): Promise<void> {
  await updateAudit(auditId, {
    status: 'processing',
    started_at: new Date().toISOString(),
  });
}

export async function completeAudit(
  auditId: string,
  overallScore: number,
  platform?: string
): Promise<void> {
  await updateAudit(auditId, {
    status: 'completed',
    overall_score: overallScore,
    platform: platform || null,
    progress: 100,
    completed_at: new Date().toISOString(),
  });
}

export async function failAudit(auditId: string, errorMessage: string): Promise<void> {
  await updateAudit(auditId, {
    status: 'failed',
    error_message: errorMessage,
    completed_at: new Date().toISOString(),
  });
}

export async function updateAuditProgress(
  auditId: string,
  progress: number,
  currentCheck: string
): Promise<void> {
  await updateAudit(auditId, {
    progress,
    current_check: currentCheck,
  });
}

export async function saveCheckResults(results: CheckResultInput[]): Promise<void> {
  if (results.length === 0) return;

  const auditId = results[0].audit_id;
  const existing = checkResults.get(auditId) || [];
  checkResults.set(auditId, [...existing, ...results]);
}

export async function getCheckResults(auditId: string): Promise<CheckResultInput[]> {
  return checkResults.get(auditId) || [];
}
