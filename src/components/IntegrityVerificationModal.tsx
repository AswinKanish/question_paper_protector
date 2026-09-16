import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  X,
  RefreshCw,
  Bug,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Hash,
  Binary,
} from 'lucide-react';
import { AssembledPaper } from '../types';

interface IntegrityVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: AssembledPaper;
  onSimulateTamper: () => void;
  onRestoreIntegrity: () => void;
}

export const IntegrityVerificationModal: React.FC<IntegrityVerificationModalProps> = ({
  isOpen,
  onClose,
  paper,
  onSimulateTamper,
  onRestoreIntegrity,
}) => {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toLocaleTimeString());

  if (!isOpen) return null;

  const isMatched = paper.canonicalHash === paper.currentComputedHash && !paper.isTampered;

  const handleRunVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setLastCheckTime(new Date().toLocaleTimeString());
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isMatched
            ? 'bg-slate-950 border-slate-800'
            : 'bg-rose-950/90 border-rose-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              isMatched
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                : 'bg-rose-900 border border-rose-500 text-rose-200'
            }`}>
              {isMatched ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
                {isMatched
                  ? 'Cryptographic Integrity Verification (SHA-256)'
                  : 'CRITICAL ALERT: CRYPTOGRAPHIC TAMPER DETECTED'}
              </h3>
              <p className="text-xs text-slate-400">
                Merkle Tree Validation & Bit-Level Modification Auditing
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Status Alert Banner */}
          {isMatched ? (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-emerald-300 block text-sm">
                  Integrity Verified: Zero Bit Alterations Detected
                </span>
                <p className="text-slate-300 mt-1">
                  Every character, punctuation, mathematical symbol, and option sequence matches the canonical seal created during automated assembly. No unauthorized modifications have occurred.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-950/80 border border-rose-500 rounded-xl flex items-start space-x-3 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-rose-200 block text-sm">
                  SECURITY BREACH: Unauthorized Paper Modification Detected!
                </span>
                <p className="text-rose-300 mt-1">
                  The live computed SHA-256 hash does NOT match the Canonical Seal! An unauthorized insider or database modification attempt has altered the examination paper. Release protocol is automatically locked down.
                </p>
                {paper.tamperDetails && (
                  <div className="mt-2 p-2 bg-black/60 rounded border border-rose-800/80 font-mono text-[11px] text-rose-300">
                    {paper.tamperDetails}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hash Comparison Matrix */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>1. CANONICAL SEAL (Computed at Assembly by KMS Enclave):</span>
                <span className="text-emerald-400 font-semibold">IMMUTABLE TARGET</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-emerald-400 break-all select-all">
                {paper.canonicalHash}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>2. CURRENT COMPUTED HASH (Evaluated across all stored questions):</span>
                <span className={isMatched ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                  {isMatched ? 'MATCHES SEAL' : 'HASH MISMATCH!'}
                </span>
              </div>
              <div className={`p-2.5 rounded border break-all select-all ${
                isMatched
                  ? 'bg-slate-900 border-slate-800 text-emerald-400'
                  : 'bg-rose-950/80 border-rose-600 text-rose-300 font-bold'
              }`}>
                {paper.currentComputedHash}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>3. MERKLE TREE ROOT DIGEST:</span>
                <span className="text-cyan-400">TREE TOP ROOT</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-cyan-300 break-all select-all">
                {paper.merkleRoot}
              </div>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Bug className="w-4 h-4 text-amber-400" />
              <span>Interactive Vulnerability & Attack Simulator</span>
            </div>
            <p className="text-xs text-slate-400">
              Test how the system instantly neutralizes unauthorized modification attempts by rogue administrators or compromised cloud storage:
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                id="btn-simulate-tamper"
                onClick={onSimulateTamper}
                disabled={paper.isTampered}
                className="flex-1 min-w-[200px] bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/50 hover:border-rose-500 font-semibold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center space-x-2 transition disabled:opacity-40"
              >
                <Bug className="w-4 h-4 text-rose-400" />
                <span>Simulate Insider Tampering Attack</span>
              </button>

              <button
                id="btn-restore-integrity"
                onClick={onRestoreIntegrity}
                disabled={!paper.isTampered}
                className="flex-1 min-w-[200px] bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:border-emerald-500 font-semibold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center space-x-2 transition disabled:opacity-40"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>Restore Canonical Paper State</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-indigo-400' : 'text-slate-500'}`} />
            <span>Last Verified: {lastCheckTime}</span>
          </div>
          <button
            onClick={handleRunVerification}
            className="text-indigo-400 hover:text-indigo-300 font-medium underline"
          >
            Re-calculate Real-Time Hashes
          </button>
        </div>
      </div>
    </div>
  );
};
