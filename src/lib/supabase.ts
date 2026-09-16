/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { QuestionItem, AssembledPaper, AuditLogEntry, QuorumSignature } from '../types';

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('your-supabase-project')
);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

// ---------------------------------------------------------------------------
// Supabase Data Sync Layer
// ---------------------------------------------------------------------------

/**
 * Fetch all questions from the Supabase `questions` table.
 */
export async function fetchQuestionsFromSupabase(): Promise<QuestionItem[] | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('questions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch questions error:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        sectionId: row.section_id,
        sectionName: row.section_name,
        setterId: row.setter_id,
        setterName: row.setter_name,
        text: row.text,
        options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
        correctOptionId: row.correct_option_id,
        difficulty: row.difficulty,
        marks: Number(row.marks),
        submittedAt: row.submitted_at,
        cipherPayload: row.cipher_payload,
        iv: row.iv,
        authTag: row.auth_tag,
        keyId: row.key_id,
        sha256Hash: row.sha256_hash,
      }));
    }
  } catch (err) {
    console.warn('Failed to connect to Supabase questions table:', err);
  }
  return null;
}

/**
 * Save a newly created question into the Supabase `questions` table.
 */
export async function saveQuestionToSupabase(question: QuestionItem): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from('questions').upsert({
      id: question.id,
      section_id: question.sectionId,
      section_name: question.sectionName,
      setter_id: question.setterId,
      setter_name: question.setterName,
      text: question.text,
      options: question.options,
      correct_option_id: question.correctOptionId,
      difficulty: question.difficulty,
      marks: question.marks,
      submitted_at: question.submittedAt,
      cipher_payload: question.cipherPayload,
      iv: question.iv,
      auth_tag: question.authTag,
      key_id: question.keyId,
      sha256_hash: question.sha256Hash,
    });

    if (error) {
      console.warn('Error saving question to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to insert question to Supabase:', err);
    return false;
  }
}

/**
 * Save / Update assembled paper state in Supabase `assembled_papers` table.
 */
export async function savePaperToSupabase(paper: AssembledPaper): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from('assembled_papers').upsert({
      id: paper.id,
      exam_id: paper.examId,
      exam_title: paper.examTitle,
      assembled_at: paper.assembledAt,
      generated_seed: paper.generatedSeed,
      status: paper.status,
      questions: paper.questions,
      canonical_hash: paper.canonicalHash,
      current_computed_hash: paper.currentComputedHash,
      merkle_root: paper.merkleRoot,
      signatures: paper.signatures,
      required_signatures: paper.requiredSignatures,
      time_lock_expiry: paper.timeLockExpiry,
      is_tampered: paper.isTampered,
      tamper_details: paper.tamperDetails || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Error saving paper to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to sync paper to Supabase:', err);
    return false;
  }
}

/**
 * Fetch assembled paper state from Supabase.
 */
export async function fetchPaperFromSupabase(): Promise<AssembledPaper | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('assembled_papers')
      .select('*')
      .order('assembled_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching paper from Supabase:', error.message);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        examId: data.exam_id,
        examTitle: data.exam_title,
        assembledAt: data.assembled_at,
        generatedSeed: data.generated_seed,
        status: data.status,
        questions: typeof data.questions === 'string' ? JSON.parse(data.questions) : data.questions,
        canonicalHash: data.canonical_hash,
        currentComputedHash: data.current_computed_hash,
        merkleRoot: data.merkle_root,
        signatures: typeof data.signatures === 'string' ? JSON.parse(data.signatures) : data.signatures,
        requiredSignatures: data.required_signatures,
        timeLockExpiry: data.time_lock_expiry,
        isTampered: data.is_tampered,
        tamperDetails: data.tamper_details,
      };
    }
  } catch (err) {
    console.warn('Failed to fetch paper from Supabase:', err);
  }
  return null;
}

/**
 * Log activity event into Supabase `audit_logs` table.
 */
export async function logAuditToSupabase(log: AuditLogEntry): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from('audit_logs').insert({
      id: log.id,
      timestamp: log.timestamp,
      actor_id: log.actorId,
      actor_name: log.actorName,
      actor_role: log.actorRole,
      category: log.category,
      action: log.action,
      severity: log.severity,
      ip_address: log.ipAddress,
      client_device: log.clientDevice,
      details: log.details,
      crypto_proof: log.cryptoProof || null,
    });

    if (error) {
      console.warn('Error saving audit log to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to record audit log to Supabase:', err);
    return false;
  }
}

/**
 * Fetch latest audit logs from Supabase.
 */
export async function fetchAuditLogsFromSupabase(): Promise<AuditLogEntry[] | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      console.warn('Error fetching audit logs from Supabase:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        timestamp: row.timestamp,
        actorId: row.actor_id,
        actorName: row.actor_name,
        actorRole: row.actor_role,
        category: row.category,
        action: row.action,
        severity: row.severity,
        ipAddress: row.ip_address,
        clientDevice: row.client_device,
        details: row.details,
        cryptoProof: row.crypto_proof,
      }));
    }
  } catch (err) {
    console.warn('Failed to fetch audit logs from Supabase:', err);
  }
  return null;
}
