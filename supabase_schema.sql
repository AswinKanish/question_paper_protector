-- ===========================================================================
-- SecureExams Cloud - Supabase Database Schema
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ===========================================================================

-- 1. Table: questions (Encrypted Sharded Question Items)
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL,
  section_name TEXT NOT NULL,
  setter_id TEXT NOT NULL,
  setter_name TEXT NOT NULL,
  text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_id TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  marks NUMERIC NOT NULL DEFAULT 2.5,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cipher_payload TEXT NOT NULL,
  iv TEXT NOT NULL,
  auth_tag TEXT NOT NULL,
  key_id TEXT NOT NULL,
  sha256_hash TEXT NOT NULL
);

-- 2. Table: assembled_papers (Master Cryptographic Exam Papers)
CREATE TABLE IF NOT EXISTS public.assembled_papers (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  exam_title TEXT NOT NULL,
  assembled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_seed TEXT NOT NULL,
  status TEXT NOT NULL,
  questions JSONB NOT NULL,
  canonical_hash TEXT NOT NULL,
  current_computed_hash TEXT NOT NULL,
  merkle_root TEXT NOT NULL,
  signatures JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_signatures INT NOT NULL DEFAULT 2,
  time_lock_expiry TIMESTAMPTZ NOT NULL,
  is_tampered BOOLEAN NOT NULL DEFAULT FALSE,
  tamper_details TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table: audit_logs (Immutable Forensic Activity Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actorRole TEXT NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  severity TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  client_device TEXT NOT NULL,
  details TEXT NOT NULL,
  crypto_proof TEXT
);

-- 4. Indices for high performance querying
CREATE INDEX IF NOT EXISTS idx_questions_section ON public.questions(section_id);
CREATE INDEX IF NOT EXISTS idx_questions_setter ON public.questions(setter_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON public.audit_logs(category);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembled_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. Public Anon Access Policies (for testing with anon key)
-- You can tighten these policies based on your authentication model
CREATE POLICY "Allow anon read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow anon insert/update questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read assembled_papers" ON public.assembled_papers FOR SELECT USING (true);
CREATE POLICY "Allow anon insert/update assembled_papers" ON public.assembled_papers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow anon insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
