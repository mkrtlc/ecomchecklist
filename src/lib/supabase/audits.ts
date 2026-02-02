import { getServerClient } from './client';
import type { AuditInsert, AuditUpdate, AuditRow, AuditCheckInsert, AuditCheckRow, AuditStatus } from './types';

// Create a new audit
export async function createAudit(data: AuditInsert): Promise<AuditRow> {
  const supabase = getServerClient();

  const { data: audit, error } = await supabase
    .from('audits')
    .insert(data as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create audit: ${error.message}`);
  }

  return audit as unknown as AuditRow;
}

// Get audit by ID
export async function getAudit(id: string): Promise<AuditRow | null> {
  const supabase = getServerClient();

  const { data, error } = await supabase
    .from('audits')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get audit: ${error.message}`);
  }

  return data as unknown as AuditRow;
}

// Update audit
export async function updateAudit(id: string, data: AuditUpdate): Promise<AuditRow> {
  const supabase = getServerClient();

  const { data: audit, error } = await supabase
    .from('audits')
    .update(data as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update audit: ${error.message}`);
  }

  return audit as unknown as AuditRow;
}

// Update audit progress
export async function updateAuditProgress(
  id: string,
  progress: number,
  currentCheck?: string
): Promise<void> {
  const supabase = getServerClient();

  const updateData = {
    progress,
    current_check: currentCheck ?? null,
  };

  const { error } = await supabase
    .from('audits')
    .update(updateData as never)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update audit progress: ${error.message}`);
  }
}

// Mark audit as started
export async function startAudit(id: string): Promise<void> {
  const supabase = getServerClient();

  const updateData = {
    status: 'processing' as AuditStatus,
    started_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('audits')
    .update(updateData as never)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to start audit: ${error.message}`);
  }
}

// Mark audit as completed
export async function completeAudit(id: string, overallScore: number, platform?: string): Promise<void> {
  const supabase = getServerClient();

  const updateData = {
    status: 'completed' as AuditStatus,
    overall_score: overallScore,
    platform: platform ?? null,
    progress: 100,
    current_check: null,
    completed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('audits')
    .update(updateData as never)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to complete audit: ${error.message}`);
  }
}

// Mark audit as failed
export async function failAudit(id: string, errorMessage: string): Promise<void> {
  const supabase = getServerClient();

  const updateData = {
    status: 'failed' as AuditStatus,
    error_message: errorMessage,
    completed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('audits')
    .update(updateData as never)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to mark audit as failed: ${error.message}`);
  }
}

// Save a check result
export async function saveCheckResult(data: AuditCheckInsert): Promise<AuditCheckRow> {
  const supabase = getServerClient();

  const { data: check, error } = await supabase
    .from('audit_checks')
    .insert(data as never)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save check result: ${error.message}`);
  }

  return check as unknown as AuditCheckRow;
}

// Save multiple check results in batch
export async function saveCheckResults(results: AuditCheckInsert[]): Promise<void> {
  if (results.length === 0) return;

  const supabase = getServerClient();

  const { error } = await supabase
    .from('audit_checks')
    .insert(results as never[]);

  if (error) {
    throw new Error(`Failed to save check results: ${error.message}`);
  }
}

// Get all check results for an audit
export async function getAuditChecks(auditId: string): Promise<AuditCheckRow[]> {
  const supabase = getServerClient();

  const { data, error } = await supabase
    .from('audit_checks')
    .select()
    .eq('audit_id', auditId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get audit checks: ${error.message}`);
  }

  return (data ?? []) as unknown as AuditCheckRow[];
}

// Get audit with all check results
export async function getAuditWithChecks(id: string): Promise<{
  audit: AuditRow;
  checks: AuditCheckRow[];
} | null> {
  const audit = await getAudit(id);
  if (!audit) return null;

  const checks = await getAuditChecks(id);
  return { audit, checks };
}
