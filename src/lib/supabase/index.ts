// Supabase client and audit functions
// This module provides database operations for audits
// Currently uses in-memory storage - replace with real Supabase when ready

export interface Audit {
  id: string;
  url: string;
  email: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  current_check: string | null;
  overall_score: number | null;
  platform: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface CreateAuditInput {
  url: string;
  email: string | null;
  status: 'pending';
  progress: number;
}

// In-memory store (replace with Supabase client in production)
const audits = new Map<string, Audit>();

function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function createAudit(input: CreateAuditInput): Promise<Audit> {
  const id = generateId();
  const audit: Audit = {
    id,
    url: input.url,
    email: input.email,
    status: input.status,
    progress: input.progress,
    current_check: null,
    overall_score: null,
    platform: null,
    error_message: null,
    started_at: null,
    completed_at: null,
    created_at: new Date().toISOString(),
  };

  audits.set(id, audit);
  return audit;
}

export async function getAudit(id: string): Promise<Audit | null> {
  return audits.get(id) || null;
}

export async function updateAudit(id: string, updates: Partial<Audit>): Promise<Audit | null> {
  const audit = audits.get(id);
  if (!audit) return null;

  const updated = { ...audit, ...updates };
  audits.set(id, updated);
  return updated;
}
