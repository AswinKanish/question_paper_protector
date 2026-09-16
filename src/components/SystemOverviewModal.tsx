import React from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  KeyRound,
  Layers,
  Cpu,
  Fingerprint,
  Clock,
  FileCheck2,
  AlertTriangle,
  Database,
  ArrowRight,
} from 'lucide-react';

interface SystemOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemOverviewModal: React.FC<SystemOverviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const securityPillars = [
    {
      icon: <KeyRound className="w-5 h-5 text-indigo-400" />,
      title: '1. Two-Factor Authentication (Password + OTP)',
      threat: 'Compromised passwords, phishing, unauthorized login',
      defense:
        'All personnel (Setters, Controllers, Reviewers, Centre Superintendents) must authenticate with alphanumeric passkeys plus dynamic 6-digit hardware/SMS OTP tokens.',
    },
    {
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      title: '2. Role Compartmentalization & Blinded Sharding',
      threat: 'Setter selling the full question paper to coaching mafias',
      defense:
        'Questions are divided among separate setters. Setter A only authors Quantitative items, Setter B only General Awareness, Setter C only Reasoning. No setter has access to other sections or the full paper.',
    },
    {
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      title: '3. AES-256-GCM Zero-Knowledge Cloud Storage',
      threat: 'Cloud DB leaks, compromised infrastructure, server dumps',
      defense:
        'Questions are encrypted before ingestion using AES-256-GCM with unique Initialization Vectors (IV) and authentication tags. Database administrators see only encrypted ciphertext envelopes.',
    },
    {
      icon: <Cpu className="w-5 h-5 text-blue-400" />,
      title: '4. Automated Paper Synthesis Engine',
      threat: 'Insider collusion, human curation bias, advance leaks',
      defense:
        'The final examination paper is compiled automatically by a deterministic KMS algorithm that samples required quotas from sharded pools and randomizes question sequences. No human selects the final paper.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: '5. SHA-256 Cryptographic Integrity & Merkle Tree',
      threat: 'Covert modification of answer keys or questions in storage',
      defense:
        'At assembly, a Master Canonical SHA-256 Hash and Merkle Root are sealed. Live verification runs continuously; even a 1-character alteration triggers instant tamper lockdown.',
    },
    {
      icon: <Fingerprint className="w-5 h-5 text-purple-400" />,
      title: '6. Multi-Officer Quorum Approval (M-of-N Dual Control)',
      threat: 'Rogue administrator authorizing unauthorized release',
      defense:
        'Release requires cryptographically verifiable co-signatures from at least two separate authorities (Chief Controller + Independent Reviewing Officer) with digital certificate fingerprints.',
    },
    {
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      title: '7. Synchronized Cryptographic Time-Lock Release',
      threat: 'Early dispatch or transport intercept before exam hour',
      defense:
        'The decryption key is locked in cloud KMS until the exact scheduled examination start time. Exam centres cannot decrypt early. Upon release, dynamic security watermarks prevent photo leaks.',
    },
    {
      icon: <FileCheck2 className="w-5 h-5 text-rose-400" />,
      title: '8. Immutable Forensic Audit Trail & Monitoring',
      threat: 'Untracked leaks, uncoordinated access, denial of actions',
      defense:
        'Every action (2FA logins, question authoring, paper assembly, co-signatures, decryption attempts, tamper alerts) is logged with timestamp, client IP, workstation ID, and cryptographic hashes.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
                Secure Cloud-Based Question Paper Management Architecture
              </h3>
              <p className="text-xs text-slate-400">
                End-to-End Threat Mitigation Framework for Government Examinations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <h4 className="text-sm font-bold text-slate-200 mb-1">
              Zero-Leakage Security Posture
            </h4>
            <p className="text-slate-400 leading-relaxed">
              In high-stakes competitive examinations, the threat landscape encompasses rogue setters, insider administrators, compromised storage, and premature network releases. SecureExams Cloud enforces Defense-in-Depth so that no single compromised credential, database, or officer can result in a paper leak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {securityPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {pillar.icon}
                  </div>
                  <h5 className="font-bold text-slate-200 text-xs">{pillar.title}</h5>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div>
                    <span className="text-rose-400 font-semibold font-mono">Target Threat: </span>
                    <span className="text-slate-400">{pillar.threat}</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-semibold font-mono">Security Defense: </span>
                    <span className="text-slate-300">{pillar.defense}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Standards: ISO/IEC 27001 • FIPS 140-3 • CERT-In Guidelines</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
