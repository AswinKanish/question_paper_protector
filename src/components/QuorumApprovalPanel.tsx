import React, { useState } from 'react';
import {
  FileCheck2,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle,
  KeyRound,
  FileSignature,
} from 'lucide-react';
import { User, AssembledPaper, QuorumSignature } from '../types';
import { formatCryptoHash } from '../crypto/cryptoUtils';

interface QuorumApprovalPanelProps {
  currentUser: User;
  paper: AssembledPaper;
  onAffixSignature: (sig: QuorumSignature) => void;
  onOpenIntegrityModal: () => void;
}

export const QuorumApprovalPanel: React.FC<QuorumApprovalPanelProps> = ({
  currentUser,
  paper,
  onAffixSignature,
  onOpenIntegrityModal,
}) => {
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [otpToken, setOtpToken] = useState<string>('994102');
  const [signatureSuccess, setSignatureSuccess] = useState<string | null>(null);

  const hasCurrentUserSigned = paper.signatures.some(
    (s) => s.officerId === currentUser.id
  );

  const isQuorumReached = paper.signatures.length >= paper.requiredSignatures;

  const handleSign = () => {
    setIsSigning(true);
    setTimeout(() => {
      const newSignature: QuorumSignature = {
        officerId: currentUser.id,
        officerName: currentUser.name,
        role: currentUser.title,
        signedAt: new Date().toISOString(),
        digitalCertFingerprint: `SHA256:7f9b2c${Math.random().toString(16).substring(2, 10)}8e1f0a...`,
        otpTokenRef: `TOKEN-CO-SIGN-${otpToken}`,
        cryptographicSignature: `0xECDSA_P384_SIG_${Math.random().toString(16).substring(2, 12)}`,
      };
      onAffixSignature(newSignature);
      setIsSigning(false);
      setSignatureSuccess('Digital Co-Signature verified and affixed to Master Manifest!');
      setTimeout(() => setSignatureSuccess(null), 4000);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Top Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-600/40">
                MULTI-OFFICER QUORUM PROTOCOL (M-OF-N DUAL CONTROL)
              </span>
              <span className="text-xs text-slate-400">Statutory Requirement: 2 Co-Signers</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-1.5">
              Examination Paper Cryptographic Co-Signing & Authorization
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              To eliminate rogue officer compromise or administrative corruption, the final examination paper cannot be armed or released by any individual officer. Approval requires cryptographically verifiable co-signatures from at least two separate authorities.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/80 border border-slate-800 p-3 rounded-lg shrink-0">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-mono">
                Quorum Status
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {paper.signatures.length}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  / {paper.requiredSignatures} Signatures
                </span>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isQuorumReached
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                : 'bg-amber-950/60 border border-amber-500/40 text-amber-400'
            }`}>
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {signatureSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-200 text-xs flex items-center space-x-2 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{signatureSuccess}</span>
        </div>
      )}

      {/* Grid: Signature Manifest & Officer Authorization Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Active Signature Manifest */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <FileSignature className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Cryptographic Quorum Manifest
              </h3>
            </div>
            <button
              onClick={onOpenIntegrityModal}
              className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 underline"
            >
              Verify SHA-256 Digest
            </button>
          </div>

          <div className="space-y-3">
            {/* Slot 1: Chief Controller */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Designated Signatory 1 (Chief Controller)
                  </span>
                  <strong className="text-sm text-slate-200 block mt-0.5">
                    Rajeshwari Verma, IAS
                  </strong>
                  <p className="text-xs text-slate-400">Chief Controller of Examinations</p>
                </div>
                {paper.signatures.find(s => s.role.includes('Controller')) ? (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/40 text-emerald-300 text-xs font-mono font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SIGNED & VERIFIED</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-600/40 text-amber-300 text-xs font-mono">
                    AWAITING SIGNATURE
                  </span>
                )}
              </div>

              {paper.signatures.find(s => s.role.includes('Controller')) && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 font-mono text-[10px] text-slate-400 space-y-0.5">
                  <div>Cert Fingerprint: SHA256:4a8b...9a9b</div>
                  <div className="text-slate-500">
                    Timestamp: {new Date(paper.signatures.find(s => s.role.includes('Controller'))!.signedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Slot 2: Reviewing Officer */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Designated Signatory 2 (Joint Reviewing Officer)
                  </span>
                  <strong className="text-sm text-slate-200 block mt-0.5">
                    Col. S. Sundaram (Retd.)
                  </strong>
                  <p className="text-xs text-slate-400">Independent Scrutiny & Verification Directorate</p>
                </div>
                {paper.signatures.find(s => s.role.includes('Reviewing')) ? (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/40 text-emerald-300 text-xs font-mono font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SIGNED & VERIFIED</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-600/40 text-amber-300 text-xs font-mono">
                    AWAITING SIGNATURE
                  </span>
                )}
              </div>

              {paper.signatures.find(s => s.role.includes('Reviewing')) && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 font-mono text-[10px] text-slate-400 space-y-0.5">
                  <div>Cert Fingerprint: SHA256:7f9b...0a</div>
                  <div className="text-slate-500">
                    Timestamp: {new Date(paper.signatures.find(s => s.role.includes('Reviewing'))!.signedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-start space-x-2">
            <Lock className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Security Invariant:</strong> Until 2/2 signatures are committed, the KMS enclave will reject all time-lock release requests from exam centres, even if the scheduled exam time has arrived.
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Active Signing Station */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Signatory Action Terminal
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Active: {currentUser.role}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[11px]">Logged in Authority:</span>
                <span className="font-bold text-slate-100 block mt-0.5">{currentUser.name}</span>
                <span className="text-slate-400 text-[11px] block">{currentUser.title}</span>
              </div>

              {hasCurrentUserSigned ? (
                <div className="p-4 bg-emerald-950/40 border border-emerald-700/50 rounded-lg text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-300">
                    Your Signature is Already Affixed
                  </h4>
                  <p className="text-xs text-slate-400">
                    Your cryptographic certificate has been registered into the Paper Manifest. No further action is required from your terminal.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    By signing, you attest that you have audited the canonical hash{' '}
                    <code className="font-mono text-indigo-300">
                      {formatCryptoHash(paper.canonicalHash, 6, 6)}
                    </code>{' '}
                    and authorize the paper for time-locked cloud encryption.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Secondary Authorization OTP Token
                    </label>
                    <input
                      type="text"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                      placeholder="Enter 6-digit signature authorization token"
                    />
                  </div>

                  <button
                    id="btn-affix-co-signature"
                    disabled={isSigning || !otpToken}
                    onClick={handleSign}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-purple-600/25"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {isSigning
                        ? 'Affixing Cryptographic Signature...'
                        : `Affix Signature as ${currentUser.name.split(' ')[0]}`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Hardware Token: Active</span>
            <span className="font-mono">FIPS 140-3 Level 4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
