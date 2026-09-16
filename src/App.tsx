import React, { useState, useEffect } from 'react';
import {
  Shield,
  Layers,
  Cpu,
  FileCheck2,
  Clock,
  Terminal,
  Lock,
  Eye,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';

import {
  User,
  UserRole,
  QuestionItem,
  AssembledPaper,
  AuditLogEntry,
  QuorumSignature,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_EXAM_BLUEPRINT,
  INITIAL_QUESTION_VAULT,
  INITIAL_AUDIT_LOGS,
  createInitialAssembledPaper,
} from './data/mockData';
import {
  fallbackSHA256,
  serializePaperForHash,
  computeMerkleRoot,
} from './crypto/cryptoUtils';

import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { SetterDashboard } from './components/SetterDashboard';
import { ControllerDashboard } from './components/ControllerDashboard';
import { QuorumApprovalPanel } from './components/QuorumApprovalPanel';
import { IntegrityVerificationModal } from './components/IntegrityVerificationModal';
import { SuperintendentReleaseStation } from './components/SuperintendentReleaseStation';
import { SecurityAuditViewer } from './components/SecurityAuditViewer';
import { SystemOverviewModal } from './components/SystemOverviewModal';

export default function App() {
  // Authentication & Users State
  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default to Setter A
  const [activeTab, setActiveTab] = useState<string>('auto'); // 'auto' mirrors currentUser role

  // Core Security Domain State
  const [blueprint] = useState(INITIAL_EXAM_BLUEPRINT);
  const [questionVault, setQuestionVault] = useState<QuestionItem[]>(INITIAL_QUESTION_VAULT);
  const [paper, setPaper] = useState<AssembledPaper>(createInitialAssembledPaper());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Time-lock & Release State
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(3600); // 1 hour default
  const [isDecrypted, setIsDecrypted] = useState<boolean>(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isIntegrityModalOpen, setIsIntegrityModalOpen] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);

  // Clock countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isTimeLockExpired = timeRemainingSeconds <= 0;

  // Helper to append immutable audit trail log
  const logSecurityEvent = (
    category: AuditLogEntry['category'],
    action: string,
    severity: AuditLogEntry['severity'],
    details: string,
    cryptoProof?: string
  ) => {
    const newLog: AuditLogEntry = {
      id: `LOG-${(auditLogs.length + 1).toString().padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      category,
      action,
      severity,
      ipAddress: '10.14.88.' + (10 + Math.floor(Math.random() * 80)),
      clientDevice: `Secured Terminal (${currentUser.badgeLevel})`,
      details,
      cryptoProof,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Switch User Profile (Fast Switch or via 2FA Modal)
  const handleSwitchUser = (role: UserRole) => {
    const target = users.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      setActiveTab('auto');
      logSecurityEvent(
        'AUTH_2FA',
        'Role Context Switched',
        'INFO',
        `Switched session perspective to ${target.name} (${target.title}). Clearance: ${target.clearanceLevel}`
      );
    }
  };

  // Successful 2FA Login
  const handleSuccessful2FALogin = (user: User, otpToken: string) => {
    setCurrentUser(user);
    setActiveTab('auto');
    logSecurityEvent(
      'AUTH_2FA',
      '2FA Hardware Login Completed',
      'INFO',
      `Officer ${user.name} logged in via password + verified OTP challenge.`,
      otpToken
    );
  };

  // Add Question by Setter
  const handleAddQuestion = (newQuestion: QuestionItem) => {
    setQuestionVault((prev) => [...prev, newQuestion]);
    logSecurityEvent(
      'BLIND_QUESTION_SETTING',
      'Encrypted Shard Question Stored',
      'INFO',
      `Question ${newQuestion.id} sealed with AES-256-GCM. Stored in Section ${newQuestion.sectionId} cloud vault.`,
      `Digest: ${newQuestion.sha256Hash.substring(0, 16)}...`
    );
  };

  // Trigger Automated Paper Assembly
  const handleTriggerAutomatedAssembly = () => {
    // Select required quota blindly from each section
    const sec1Items = questionVault.filter((q) => q.sectionId === 'SEC-QUANT');
    const sec2Items = questionVault.filter((q) => q.sectionId === 'SEC-GENERAL');
    const sec3Items = questionVault.filter((q) => q.sectionId === 'SEC-REASONING');

    const sample = (arr: QuestionItem[], n: number) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    };

    const selected = [
      ...sample(sec1Items, 3),
      ...sample(sec2Items, 3),
      ...sample(sec3Items, 3),
    ];

    // Cryptographic shuffle
    const randomized = [...selected].sort(() => 0.5 - Math.random());

    const serialized = serializePaperForHash(randomized);
    const canonicalHash = fallbackSHA256(serialized);
    const questionHashes = randomized.map((q) => q.sha256Hash);
    const merkleRoot = computeMerkleRoot(questionHashes);
    const seed = `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}${Math.random().toString(16).substring(2, 6).toUpperCase()}`;

    const newPaper: AssembledPaper = {
      id: `PAPER-2026-AUTOGEN-${Date.now().toString().slice(-4)}`,
      examId: blueprint.id,
      examTitle: blueprint.title,
      assembledAt: new Date().toISOString(),
      generatedSeed: seed,
      status: 'PENDING_QUORUM',
      questions: randomized,
      canonicalHash,
      currentComputedHash: canonicalHash,
      merkleRoot,
      signatures: [
        {
          officerId: 'USR-CTRL-01',
          officerName: 'Rajeshwari Verma, IAS',
          role: 'Chief Controller of Examinations',
          signedAt: new Date().toISOString(),
          digitalCertFingerprint:
            'SHA256:4a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
          otpTokenRef: `TOKEN-ASM-${Math.floor(1000 + Math.random() * 9000)}`,
          cryptographicSignature: `0xSIGN_CTRL_RSA4096_${Math.random().toString(16).substring(2, 8)}`,
        },
      ],
      requiredSignatures: 2,
      timeLockExpiry: new Date(Date.now() + timeRemainingSeconds * 1000).toISOString(),
      isTampered: false,
    };

    setPaper(newPaper);
    setIsDecrypted(false);

    logSecurityEvent(
      'AUTOMATED_ASSEMBLY',
      'Automated Paper Assembly Executed',
      'NOTICE',
      `Compiled 9 items blindly from 3 setter shards using seed ${seed}. Canonical SHA-256 seal computed.`,
      `SHA256: ${canonicalHash}`
    );
  };

  // Affix Quorum Signature
  const handleAffixSignature = (signature: QuorumSignature) => {
    const updatedSignatures = [...paper.signatures, signature];
    const isQuorumReached = updatedSignatures.length >= paper.requiredSignatures;

    setPaper((prev) => ({
      ...prev,
      signatures: updatedSignatures,
      status: isQuorumReached ? 'APPROVED_LOCKED' : 'PENDING_QUORUM',
    }));

    logSecurityEvent(
      'QUORUM_APPROVAL',
      `Quorum Signature ${updatedSignatures.length}/${paper.requiredSignatures} Affixed`,
      'NOTICE',
      `Officer ${signature.officerName} (${signature.role}) affixed digital certificate. Status: ${
        isQuorumReached ? 'APPROVED & TIME-LOCKED' : 'PENDING FINAL SIGNATURE'
      }`,
      signature.cryptographicSignature
    );
  };

  // Simulate Tamper Attack (Alters question text slightly)
  const handleSimulateTamper = () => {
    if (paper.questions.length === 0) return;

    const modifiedQuestions = [...paper.questions];
    const originalText = modifiedQuestions[0].text;
    // Alter statement slightly
    const alteredText = originalText + ' [UNAUTHORIZED REVISED CLAUSE #99]';
    modifiedQuestions[0] = {
      ...modifiedQuestions[0],
      text: alteredText,
    };

    const newSerialized = serializePaperForHash(modifiedQuestions);
    const newComputedHash = fallbackSHA256(newSerialized);

    setPaper((prev) => ({
      ...prev,
      questions: modifiedQuestions,
      currentComputedHash: newComputedHash,
      isTampered: true,
      tamperDetails: `Bit deviation detected at Question #1 (${modifiedQuestions[0].id}). Character string modified without KMS authorization.`,
    }));

    logSecurityEvent(
      'SECURITY_TAMPER_ALERT',
      'CRITICAL: SHA-256 Integrity Seal Breach Detected!',
      'CRITICAL_ALERT',
      `Tamper detection engine found hash mismatch! Canonical: ${paper.canonicalHash.substring(
        0,
        12
      )}... vs Live: ${newComputedHash.substring(0, 12)}... Release locked down.`,
      `Mismatch: ${newComputedHash}`
    );
  };

  // Restore Canonical Integrity
  const handleRestoreIntegrity = () => {
    const originalSerialized = serializePaperForHash(paper.questions);
    const restoredQuestions = paper.questions.map((q, idx) => {
      if (idx === 0 && q.text.includes('[UNAUTHORIZED REVISED CLAUSE #99]')) {
        return {
          ...q,
          text: q.text.replace(' [UNAUTHORIZED REVISED CLAUSE #99]', ''),
        };
      }
      return q;
    });

    const serializedClean = serializePaperForHash(restoredQuestions);
    const computedHash = fallbackSHA256(serializedClean);

    setPaper((prev) => ({
      ...prev,
      questions: restoredQuestions,
      currentComputedHash: prev.canonicalHash,
      isTampered: false,
      tamperDetails: undefined,
    }));

    logSecurityEvent(
      'INTEGRITY_CHECK',
      'Canonical Paper State Restored',
      'INFO',
      'Cryptographic verification re-established. Live hash matches canonical seal 100%.'
    );
  };

  // Fast forward time to exam time (Simulate 10:00 AM)
  const handleFastForwardTime = () => {
    setTimeRemainingSeconds(0);
    logSecurityEvent(
      'TIME_LOCK_RELEASE',
      'Exam Release Window Activated',
      'NOTICE',
      'Stratum-1 synchronized time reached scheduled start time. Decryption key eligible for disbursement.'
    );
  };

  // Reset time to pre-exam
  const handleResetTime = () => {
    setTimeRemainingSeconds(3600);
    setIsDecrypted(false);
    logSecurityEvent(
      'TIME_LOCK_RELEASE',
      'Clock Reset to Pre-Exam Window',
      'INFO',
      'Exam paper returned to time-locked ciphertext container.'
    );
  };

  // Decrypt Paper at Centre
  const handleDecryptPaper = () => {
    setIsDecrypted(true);
    setPaper((prev) => ({
      ...prev,
      status: 'RELEASED_DECRYPTED',
    }));

    logSecurityEvent(
      'TIME_LOCK_RELEASE',
      'Centre #104 Decrypted Question Paper',
      'NOTICE',
      'Superintendent K. Murali authenticated KMS broadcast. Dynamic security watermarks applied to all rendered pages.',
      `Decryption Session: 0xKEY_RELEASE_${Date.now()}`
    );
  };

  // Export Audit Trail as JSON file
  const handleExportAuditLogs = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `SecureExams_Forensic_Audit_Trail_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logSecurityEvent(
      'INTEGRITY_CHECK',
      'Forensic Audit Report Exported',
      'INFO',
      'Independent security auditor downloaded full cryptographic activity trail.'
    );
  };

  // Determine which view to display
  // 'auto' reflects the active user's natural role
  const resolvedRole =
    activeTab === 'auto' ? currentUser.role : (activeTab as UserRole);

  const getAssignedSection = () => {
    if (resolvedRole === 'setter_quant') return blueprint.sections[0];
    if (resolvedRole === 'setter_general') return blueprint.sections[1];
    return blueprint.sections[2]; // setter_reasoning
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation & Status Bar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onOpenLoginModal={() => setIsAuthModalOpen(true)}
        onLogout={() => setIsAuthModalOpen(true)}
        onOpenInfoModal={() => setIsInfoModalOpen(true)}
        onOpenIntegrityModal={() => setIsIntegrityModalOpen(true)}
        paper={paper}
        timeRemainingSeconds={timeRemainingSeconds}
        isTimeLockExpired={isTimeLockExpired}
        usersList={users}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Role Perspective Quick Tabs */}
        <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-inner text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold px-2 py-1 uppercase tracking-wider text-[11px]">
              Active Role Terminal:
            </span>

            {/* Setters */}
            <button
              onClick={() => {
                handleSwitchUser('setter_quant');
                setActiveTab('setter_quant');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                currentUser.role === 'setter_quant'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Setter A (Quant)</span>
            </button>

            <button
              onClick={() => {
                handleSwitchUser('setter_general');
                setActiveTab('setter_general');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                currentUser.role === 'setter_general'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Setter B (Polity)</span>
            </button>

            <button
              onClick={() => {
                handleSwitchUser('setter_reasoning');
                setActiveTab('setter_reasoning');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                currentUser.role === 'setter_reasoning'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Setter C (Ethics)</span>
            </button>

            {/* Controller */}
            <button
              onClick={() => {
                handleSwitchUser('controller');
                setActiveTab('controller');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                currentUser.role === 'controller'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Chief Controller</span>
            </button>

            {/* Quorum Reviewer */}
            <button
              onClick={() => {
                handleSwitchUser('reviewing_officer');
                setActiveTab('reviewing_officer');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                currentUser.role === 'reviewing_officer'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Reviewing Officer (Quorum)</span>
            </button>

            {/* Superintendent */}
            <button
              onClick={() => {
                handleSwitchUser('centre_superintendent');
                setActiveTab('centre_superintendent');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                currentUser.role === 'centre_superintendent'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Centre Superintendent</span>
            </button>

            {/* Security Auditor */}
            <button
              onClick={() => {
                handleSwitchUser('security_auditor');
                setActiveTab('security_auditor');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center space-x-1.5 ${
                currentUser.role === 'security_auditor'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Security Auditor (Logs)</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px] px-2">
            <span>Clearance: </span>
            <span className="text-emerald-400 font-bold uppercase">{currentUser.clearanceLevel}</span>
          </div>
        </div>

        {/* Dynamic Component Rendering based on Active Role */}
        {(resolvedRole === 'setter_quant' ||
          resolvedRole === 'setter_general' ||
          resolvedRole === 'setter_reasoning') && (
          <SetterDashboard
            currentUser={currentUser}
            assignedSection={getAssignedSection()}
            questions={questionVault}
            onAddQuestion={handleAddQuestion}
          />
        )}

        {resolvedRole === 'controller' && (
          <ControllerDashboard
            currentUser={currentUser}
            blueprint={blueprint}
            questionVault={questionVault}
            paper={paper}
            onTriggerAutomatedAssembly={handleTriggerAutomatedAssembly}
            onSignQuorum={handleAffixSignature}
            onOpenIntegrityModal={() => setIsIntegrityModalOpen(true)}
          />
        )}

        {resolvedRole === 'reviewing_officer' && (
          <QuorumApprovalPanel
            currentUser={currentUser}
            paper={paper}
            onAffixSignature={handleAffixSignature}
            onOpenIntegrityModal={() => setIsIntegrityModalOpen(true)}
          />
        )}

        {resolvedRole === 'centre_superintendent' && (
          <SuperintendentReleaseStation
            currentUser={currentUser}
            paper={paper}
            timeRemainingSeconds={timeRemainingSeconds}
            isTimeLockExpired={isTimeLockExpired}
            onFastForwardTime={handleFastForwardTime}
            onResetTime={handleResetTime}
            onDecryptPaper={handleDecryptPaper}
            isDecrypted={isDecrypted}
          />
        )}

        {resolvedRole === 'security_auditor' && (
          <SecurityAuditViewer
            logs={auditLogs}
            onExportLogs={handleExportAuditLogs}
            onOpenIntegrityModal={() => setIsIntegrityModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>SecureExams Cloud • National Examination Paper Cryptographic Security Engine</span>
          </div>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>Algorithm: AES-256-GCM / SHA-256</span>
            <span>•</span>
            <span>2FA Protocol: RFC 6238 TOTP</span>
            <span>•</span>
            <span>Dual-Control: M-of-N Quorum</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={users}
        currentUserId={currentUser.id}
        onSuccessfulLogin={handleSuccessful2FALogin}
      />

      <IntegrityVerificationModal
        isOpen={isIntegrityModalOpen}
        onClose={() => setIsIntegrityModalOpen(false)}
        paper={paper}
        onSimulateTamper={handleSimulateTamper}
        onRestoreIntegrity={handleRestoreIntegrity}
      />

      <SystemOverviewModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
