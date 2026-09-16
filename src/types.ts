export type UserRole =
  | 'setter_quant'            // Section Setter: Quantitative Aptitude
  | 'setter_general'          // Section Setter: General Awareness & Polity
  | 'setter_reasoning'        // Section Setter: Analytical Reasoning & Ethics
  | 'controller'              // Chief Examination Controller
  | 'reviewing_officer'       // Co-signing Reviewing Officer (Quorum)
  | 'centre_superintendent'   // Exam Centre Superintendent (Release recipient)
  | 'security_auditor';       // Independent Vigilance & Security Auditor

export interface User {
  id: string;
  name: string;
  title: string;
  role: UserRole;
  department: string;
  email: string;
  assignedSectionId?: string; // Strictly limited to this section if setter
  badgeLevel: string;
  clearanceLevel: 'SECRET' | 'TOP_SECRET' | 'RESTRICTED_SECTION' | 'AUDIT_ONLY';
  phoneLast4: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionItem {
  id: string;
  sectionId: string;
  sectionName: string;
  setterId: string;
  setterName: string;
  text: string;
  options: QuestionOption[];
  correctOptionId: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  submittedAt: string;
  // Cryptographic zero-knowledge representation in cloud storage
  cipherPayload: string;
  iv: string;
  authTag: string;
  keyId: string;
  sha256Hash: string;
}

export interface SectionBlueprint {
  id: string;
  name: string;
  code: string;
  requiredQuestions: number;
  assignedSetterId: string;
  assignedSetterName: string;
  topicAreas: string[];
}

export interface ExamBlueprint {
  id: string;
  title: string;
  code: string;
  examDate: string;
  scheduledReleaseTime: string; // ISO string
  durationMinutes: number;
  totalMarks: number;
  sections: SectionBlueprint[];
}

export interface QuorumSignature {
  officerId: string;
  officerName: string;
  role: string;
  signedAt: string;
  digitalCertFingerprint: string;
  otpTokenRef: string;
  cryptographicSignature: string;
}

export type PaperStatus =
  | 'VAULT_COLLECTING'       // Questions being collected blindly
  | 'AUTOMATED_ASSEMBLED'    // Algorithmic assembly performed
  | 'PENDING_QUORUM'         // Awaiting dual-officer signature
  | 'APPROVED_LOCKED'        // Dual signatures received; time-lock armed
  | 'RELEASED_DECRYPTED';    // Released at examination time

export interface AssembledPaper {
  id: string;
  examId: string;
  examTitle: string;
  assembledAt: string;
  generatedSeed: string;
  status: PaperStatus;
  questions: QuestionItem[];
  canonicalHash: string;      // The cryptographic SHA-256 seal computed at assembly
  currentComputedHash: string;// Live computed hash to detect tampering
  merkleRoot: string;
  signatures: QuorumSignature[];
  requiredSignatures: number;
  timeLockExpiry: string;     // ISO timestamp when decryption becomes authorized
  isTampered: boolean;
  tamperDetails?: string;
  tamperLocation?: {
    questionIndex: number;
    originalText: string;
    alteredText: string;
  };
}

export type AuditCategory =
  | 'AUTH_2FA'
  | 'BLIND_QUESTION_SETTING'
  | 'VAULT_ENCRYPTION'
  | 'AUTOMATED_ASSEMBLY'
  | 'INTEGRITY_CHECK'
  | 'QUORUM_APPROVAL'
  | 'TIME_LOCK_RELEASE'
  | 'SECURITY_TAMPER_ALERT';

export type AuditSeverity = 'INFO' | 'NOTICE' | 'WARNING' | 'CRITICAL_ALERT';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  category: AuditCategory;
  action: string;
  severity: AuditSeverity;
  ipAddress: string;
  clientDevice: string;
  details: string;
  cryptoProof?: string;
}

export interface CentreDecryptionContext {
  centreCode: string;
  centreName: string;
  superintendentId: string;
  superintendentName: string;
  ipAddress: string;
  workstationId: string;
}
