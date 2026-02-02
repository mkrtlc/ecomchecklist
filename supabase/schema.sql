-- E-Commerce Audit Database Schema
-- Run this in Supabase SQL Editor to set up the tables

-- Audit runs table
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  email TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  platform VARCHAR(50),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_check VARCHAR(100),
  error_message TEXT,
  screenshot_url TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: Add screenshot_url column if it doesn't exist (for existing databases)
-- ALTER TABLE audits ADD COLUMN IF NOT EXISTS screenshot_url TEXT;

-- Individual check results
CREATE TABLE IF NOT EXISTS audit_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  check_id VARCHAR(100) NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('pass', 'warn', 'fail')),
  evidence JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_checks_audit_id ON audit_checks(audit_id);

-- Enable Row Level Security
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations with service role key
-- For production, you may want more restrictive policies

-- Allow service role full access to audits
CREATE POLICY "Service role can manage audits" ON audits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow service role full access to audit_checks
CREATE POLICY "Service role can manage audit_checks" ON audit_checks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Allow anonymous read access to completed audits (for sharing)
-- Uncomment if you want public audit results
-- CREATE POLICY "Public can read completed audits" ON audits
--   FOR SELECT
--   USING (status = 'completed');
