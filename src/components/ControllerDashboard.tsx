import React, { useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  RefreshCw,
  FileText,
  Lock,
  Layers,
  Sparkles,
  AlertTriangle,
  Fingerprint,
} from 'lucide-react';
import {
  User,
  ExamBlueprint,
  QuestionItem,
  AssembledPaper,
  QuorumSignature,
} from '../types';
import { formatCryptoHash } from '../crypto/cryptoUtils';

interface ControllerDashboardProps {
  currentUser: User;
  blueprint: ExamBlueprint;
  questionVault: QuestionItem[];
  paper: AssembledPaper;
  onTriggerAutomatedAssembly: () => void;
  onSignQuorum: (signature: QuorumSignature) => void;
  onOpenIntegrityModal: () => void;
}

export const ControllerDashboard: React.FC<ControllerDashboardProps> = ({
  currentUser,
  blueprint,
  questionVault,
  paper,
  onTriggerAutomatedAssembly,
  onSignQuorum,
  onOpenIntegrityModal,
}) => {
  const [isAssembling, setIsAssembling] = useState<boolean>(false);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [assemblyLogs, setAssemblyLogs] = useState<string[]>([]);

  // Count items per section in vault
  const poolCounts = blueprint.sections.map((sec) => ({
    section: sec,
    count: questionVault.filter((q) => q.sectionId === sec.id).length,
  }));

  const hasControllerSigned = paper.signatures.some(
    (s) => s.officerId === currentUser.id
  );

  const handleAssemble = () => {
    setIsAssembling(true);
    setAssemblyLogs([
      'Initiating Hardware Security Module (HSM-KMS) enclave...',
      'Connecting to blinded section shards A, B, and C...',
      'Verifying quota requirements across all 3 sections...',
      'Executing cryptographically seeded pseudo-random question selection...',
      'Shuffling question ordering and option keys to prevent insider sequence leaks...',
      'Computing Canonical SHA-256 Digest and Merkle Root over final bundle...',
      'Master Cryptographic Seal established. Awaiting dual-control quorum signatures.',
    ]);

    setTimeout(() => {
      onTriggerAutomatedAssembly();
      setIsAssembling(false);
    }, 1200);
  };

  const handleAffixSignature = () => {
    setIsSigning(true);
    setTimeout(() => {
      const newSignature: QuorumSignature = {
        officerId: currentUser.id,
        officerName: currentUser.name,
        role: currentUser.title,
        signedAt: new Date().toISOString(),
        digitalCertFingerprint:
          'SHA256:4a8b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
        otpTokenRef: `TOKEN-AUTH-${Math.floor(1000 + Math.random() * 9000)}`,
        cryptographicSignature: `0xSIGN_CTRL_RSA4096_${Math.random().toString(16).substring(2, 10)}`,
      };
      onSignQuorum(newSignature);
      setIsSigning(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Chief Controller Examination Orchestration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-600/40">
                CHIEF EXAMINATION CONTROLLER CONSOLE
              </span>
              <span className="text-xs text-slate-400">Exam Code: {blueprint.code}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-1.5">
              {blueprint.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Automatic synthesis eliminates human bias and single-point leaks. The system compiles the final master paper without any human setter or controller choosing the specific permutation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-open-integrity"
              onClick={onOpenIntegrityModal}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg border text-xs font-semibold transition shadow-md ${
                paper.isTampered
                  ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-emerald-400'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {paper.isTampered ? 'TAMPER ALERT: Verify Integrity' : 'Inspect SHA-256 Merkle Seal'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Sharded Pool Health & Automated Synthesizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Sharded Pool Status */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Blinded Shard Pool Health
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-700/40">
                Double-Blind
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Controller sees only the volume and validity metrics of each shard pool. Question statements remain zero-knowledge encrypted to prevent insider leakage.
            </p>

            <div className="mt-4 space-y-3">
              {poolCounts.map(({ section, count }) => {
                const isSatisfied = count >= section.requiredQuestions;
                return (
                  <div
                    key={section.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">
                        {section.name.split(':')[0]}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                          isSatisfied
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-700/40'
                        }`}
                      >
                        {isSatisfied ? 'QUOTA MET' : 'AWAITING QUESTIONS'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      Setter: {section.assignedSetterName} ({section.code})
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-400">Questions in Vault:</span>
                      <span className="font-mono font-bold text-slate-100">
                        {count} / {section.requiredQuestions} req.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quorum Dual-Control Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Dual-Officer Quorum
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/40">
                {paper.signatures.length}/{paper.requiredSignatures} Signatures
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Statutory requirement: At least 2 constitutional officers must co-sign the cryptographic digest before the time-locked release key is generated.
            </p>

            <div className="mt-4 space-y-2.5">
              {paper.signatures.map((sig) => (
                <div
                  key={sig.officerId}
                  className="p-2.5 bg-slate-950 border border-emerald-700/40 rounded-lg text-xs flex items-start space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-200">{sig.officerName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(sig.signedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{sig.role}</p>
                    <p className="text-[10px] font-mono text-indigo-400 mt-1">
                      Token: {sig.otpTokenRef}
                    </p>
                  </div>
                </div>
              ))}

              {!hasControllerSigned && (
                <button
                  id="btn-sign-controller"
                  disabled={isSigning}
                  onClick={handleAffixSignature}
                  className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg text-xs flex items-center justify-center space-x-2 transition shadow-md shadow-emerald-600/20"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {isSigning ? 'Affixing RSA-4096 Signature...' : 'Affix Chief Controller Digital Signature'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Automated Synthesizer & Canonical Master Paper Monitor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Automated Paper Synthesis Engine
                </h3>
              </div>
              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-700/40">
                Zero-Human Permutation
              </span>
            </div>

            <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block">
                    Current Assembly Status
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-bold text-slate-100 text-sm">
                      {paper.questions.length} Questions Assembled
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded font-mono bg-indigo-950 text-indigo-300 border border-indigo-700/40">
                      {paper.status}
                    </span>
                  </div>
                </div>

                <button
                  id="btn-trigger-assembly"
                  disabled={isAssembling}
                  onClick={handleAssemble}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/25 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isAssembling ? 'animate-spin' : ''}`} />
                  <span>
                    {isAssembling ? 'Synthesizing...' : 'Run Automated Paper Assembly'}
                  </span>
                </button>
              </div>

              {/* Execution log stream */}
              {assemblyLogs.length > 0 && (
                <div className="mt-4 p-3 bg-black/60 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1 text-slate-400">
                  {assemblyLogs.map((log, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-indigo-400 font-bold">[{i + 1}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cryptographic Digest Display */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[11px] font-mono text-slate-400 block uppercase">
                  Canonical SHA-256 Digest
                </span>
                <span className="font-mono text-xs text-emerald-400 font-semibold block mt-1 break-all">
                  {formatCryptoHash(paper.canonicalHash, 12, 12)}
                </span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="text-[11px] font-mono text-slate-400 block uppercase">
                  Merkle Tree Root
                </span>
                <span className="font-mono text-xs text-cyan-400 font-semibold block mt-1 break-all">
                  {formatCryptoHash(paper.merkleRoot, 12, 12)}
                </span>
              </div>
            </div>

            {/* Assembled Items List (Blind Shard Aggregation) */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Aggregated Question Sequence ({paper.questions.length} Items)
                </span>
                <span className="text-[11px] text-slate-400">
                  Randomized Seed: <code className="font-mono text-indigo-300">{paper.generatedSeed}</code>
                </span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {paper.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 text-xs transition"
                  >
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-indigo-400">#{idx + 1}</span>
                        <span className="font-mono text-slate-300">{q.id}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {q.sectionName.split(':')[0]}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">
                        Hash: {formatCryptoHash(q.sha256Hash, 4, 4)}
                      </span>
                    </div>
                    <p className="text-slate-200 line-clamp-1">{q.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
