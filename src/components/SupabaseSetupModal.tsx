import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  ExternalLink,
  Code,
  Shield,
  Terminal,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const sqlSchema = `-- Run this in your Supabase Project -> SQL Editor
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

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  severity TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  client_device TEXT NOT NULL,
  details TEXT NOT NULL,
  crypto_proof TEXT
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assembled_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow anon insert/update questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read assembled_papers" ON public.assembled_papers FOR SELECT USING (true);
CREATE POLICY "Allow anon insert/update assembled_papers" ON public.assembled_papers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow anon insert audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${
              isSupabaseConfigured
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                : 'bg-amber-950/80 border border-amber-500/40 text-amber-400'
            }`}>
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Supabase Cloud Database Connection
              </h3>
              <p className="text-xs text-slate-400">
                Persistent PostgreSQL Storage for Examination Questions & Audit Logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Status Alert */}
          {isSupabaseConfigured ? (
            <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-lg flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-emerald-300 block text-xs">
                  Connected to Supabase PostgreSQL Database!
                </strong>
                <p className="text-emerald-200/80 text-[11px] mt-0.5">
                  Questions, assembled papers, quorum co-signatures, and immutable audit logs are synchronizing automatically to your Supabase tables.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-950/70 border border-amber-500/50 rounded-lg flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-amber-300 block text-xs">
                  Running on In-Memory State (Supabase Not Connected Yet)
                </strong>
                <p className="text-amber-200/80 text-[11px] mt-0.5">
                  The app is currently functioning in interactive demo mode. Follow the 3 steps below to connect your real Supabase project.
                </p>
              </div>
            </div>
          )}

          {/* 3 Step Setup Guide */}
          <div className="space-y-3 pt-1">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              Setup Instructions (3 Quick Steps):
            </h4>

            {/* Step 1 */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
              <span className="font-bold text-indigo-400 text-xs block">
                Step 1: Get your Supabase Project API Keys
              </span>
              <p className="text-slate-400 text-[11px]">
                In your Supabase project dashboard (supabase.com), go to <strong>Project Settings → API</strong> and copy your <strong>Project URL</strong> and <strong>anon public key</strong>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5">
              <span className="font-bold text-indigo-400 text-xs block">
                Step 2: Add Environment Variables in Settings
              </span>
              <p className="text-slate-400 text-[11px]">
                In AI Studio, open <strong>Settings / Environment Variables</strong> or your local <code className="text-slate-200">.env</code> file and configure:
              </p>
              <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <div>VITE_SUPABASE_URL="https://your-project.supabase.co"</div>
                <div>VITE_SUPABASE_ANON_KEY="your-anon-public-key"</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-400 text-xs">
                  Step 3: Run SQL Schema in Supabase SQL Editor
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy SQL Script</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Open your Supabase dashboard, click <strong>SQL Editor → New Query</strong>, paste the schema below, and click <strong>RUN</strong>:
              </p>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 font-mono text-[10px] text-slate-300 max-h-36 overflow-y-auto leading-relaxed">
                <pre>{sqlSchema}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Schema file also saved at: <code>/supabase_schema.sql</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
