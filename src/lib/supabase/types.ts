// Database types for Supabase tables

export type AuditStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Database {
  public: {
    Tables: {
      audits: {
        Row: {
          id: string;
          url: string;
          email: string | null;
          status: AuditStatus;
          overall_score: number | null;
          platform: string | null;
          progress: number;
          current_check: string | null;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          screenshot_url: string | null;
        };
        Insert: {
          id?: string;
          url: string;
          email?: string | null;
          status?: AuditStatus;
          overall_score?: number | null;
          platform?: string | null;
          progress?: number;
          current_check?: string | null;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          screenshot_url?: string | null;
        };
        Update: {
          id?: string;
          url?: string;
          email?: string | null;
          status?: AuditStatus;
          overall_score?: number | null;
          platform?: string | null;
          progress?: number;
          current_check?: string | null;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          screenshot_url?: string | null;
        };
      };
      audit_checks: {
        Row: {
          id: string;
          audit_id: string;
          check_id: string;
          status: 'pass' | 'warn' | 'fail';
          evidence: unknown | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          audit_id: string;
          check_id: string;
          status: 'pass' | 'warn' | 'fail';
          evidence?: unknown | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          audit_id?: string;
          check_id?: string;
          status?: 'pass' | 'warn' | 'fail';
          evidence?: unknown | null;
          created_at?: string;
        };
      };
    };
  };
}

export type AuditRow = Database['public']['Tables']['audits']['Row'];
export type AuditInsert = Database['public']['Tables']['audits']['Insert'];
export type AuditUpdate = Database['public']['Tables']['audits']['Update'];

export type AuditCheckRow = Database['public']['Tables']['audit_checks']['Row'];
export type AuditCheckInsert = Database['public']['Tables']['audit_checks']['Insert'];
