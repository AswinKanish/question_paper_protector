import React, { useState } from 'react';
import {
  Clock,
  Lock,
  Unlock,
  Printer,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  FileText,
  Building,
  CheckCircle2,
  Eye,
  Key,
  Flame,
} from 'lucide-react';
import { User, AssembledPaper } from '../types';
import { formatCryptoHash } from '../crypto/cryptoUtils';

interface SuperintendentReleaseStationProps {
  currentUser: User;
  paper: AssembledPaper;
  timeRemainingSeconds: number;
  isTimeLockExpired: boolean;
  onFastForwardTime: () => void;
  onResetTime: () => void;
  onDecryptPaper: () => void;
  isDecrypted: boolean;
}

export const SuperintendentReleaseStation: React.FC<SuperintendentReleaseStationProps> = ({
  currentUser,
  paper,
  timeRemainingSeconds,
  isTimeLockExpired,
  onFastForwardTime,
  onResetTime,
  onDecryptPaper,
  isDecrypted,
}) => {
  const [isProcessingDecrypt, setIsProcessingDecrypt] = useState<boolean>(false);
  const [centreCode] = useState<string>('CENTRE-#104-DELHI');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const formatCountdown = (secs: number) => {
    if (secs <= 0) return '00:00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isQuorumMet = paper.signatures.length >= paper.requiredSignatures;
  const canDecrypt = isTimeLockExpired && isQuorumMet && !paper.isTampered;

  const handleDecrypt = () => {
    setIsProcessingDecrypt(true);
    setTimeout(() => {
      setIsProcessingDecrypt(false);
      onDecryptPaper();
    }, 900);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-600/40">
                EXAMINATION CENTRE RELEASE STATION
              </span>
              <span className="text-xs text-slate-400">Jurisdiction: {centreCode}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-1.5">
              Time-Locked Cryptographic Decryption & Dispatch Terminal
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              <strong className="text-slate-200">Zero Early-Release Invariant:</strong> The examination paper ciphertext is guarded by a cryptographic time-lock. Cloud KMS will not disburse the release key until the scheduled examination start time, preventing prior leakage.
            </p>
          </div>

          {/* Demonstration Quick Toggles for Time */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block w-full text-[11px] uppercase tracking-wider">
              Time-Lock Testing Controls:
            </span>
            <button
              id="btn-fast-forward-time"
              onClick={onFastForwardTime}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                isTimeLockExpired
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              Simulate 10:00 AM (Release Time)
            </button>
            <button
              id="btn-reset-time"
              onClick={onResetTime}
              className="px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              Reset to Pre-Exam (Locked)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Countdown Terminal & Decrypted Paper Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Cryptographic Time-Lock Status */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-slate-950 border border-slate-800">
              {isDecrypted ? (
                <Unlock className="w-8 h-8 text-emerald-400" />
              ) : isTimeLockExpired ? (
                <Key className="w-8 h-8 text-cyan-400 animate-bounce" />
              ) : (
                <Lock className="w-8 h-8 text-amber-400" />
              )}
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 block">
                Time Remaining Until Exam Start
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-100 tracking-wider mt-1">
                {formatCountdown(timeRemainingSeconds)}
              </div>
            </div>

            {/* Invariant Checklist */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-left text-xs space-y-2.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                Automated Release Prerequisites:
              </span>

              {/* 1. Time Check */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">1. Scheduled Exam Hour Reached:</span>
                <span className={`font-mono font-bold ${isTimeLockExpired ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isTimeLockExpired ? 'VERIFIED' : 'WAITING'}
                </span>
              </div>

              {/* 2. Quorum Check */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">2. Dual-Officer Quorum Co-Signed:</span>
                <span className={`font-mono font-bold ${isQuorumMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isQuorumMet ? '2/2 SIGNED' : `${paper.signatures.length}/2 PENDING`}
                </span>
              </div>

              {/* 3. Tamper Check */}
              <div className="flex items-center justify-between">
                <span className="text-slate-300">3. SHA-256 Paper Integrity Seal:</span>
                <span className={`font-mono font-bold ${!paper.isTampered ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {!paper.isTampered ? 'INTACT' : 'TAMPER DETECTED!'}
                </span>
              </div>
            </div>

            {/* Decrypt Action Button */}
            {!isDecrypted ? (
              <button
                id="btn-decrypt-release"
                disabled={!canDecrypt || isProcessingDecrypt}
                onClick={handleDecrypt}
                className={`w-full py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg ${
                  canDecrypt
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                {isProcessingDecrypt ? (
                  <>
                    <Key className="w-4 h-4 animate-spin text-white" />
                    <span>Authorizing KMS Key & Applying Watermark...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>
                      {canDecrypt
                        ? 'Decrypt & Authorize Question Paper'
                        : 'Locked until Exam Time & Quorum'}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-lg text-xs text-emerald-200 flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">
                  Paper Decrypted with Secure Dynamic Watermark
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right 7 Cols: Question Paper Container / Watermarked Preview */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Examination Paper Enclave Viewer
                </h3>
              </div>

              {isDecrypted && (
                <button
                  id="btn-print-paper"
                  onClick={handlePrint}
                  className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded border border-slate-700 text-xs font-semibold transition"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Print with Dynamic Watermark</span>
                </button>
              )}
            </div>

            {!isDecrypted ? (
              /* ENCRYPTED / SEALED STATE */
              <div className="my-8 p-6 bg-slate-950 border border-dashed border-slate-800 rounded-xl text-center space-y-3">
                <Lock className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">
                  Question Paper Payload Sealed in Encrypted Cloud Vault
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Plaintext questions are not present in browser memory. Even if this workstation is seized or inspected prior to the scheduled exam hour, the paper cannot be retrieved without the Cloud KMS broadcast.
                </p>
                <div className="pt-2 font-mono text-[11px] text-slate-500">
                  Container Digest: {formatCryptoHash(paper.canonicalHash, 10, 10)}
                </div>
              </div>
            ) : (
              /* DECRYPTED & WATERMARKED STATE */
              <div className="mt-4 space-y-4 max-h-[480px] overflow-y-auto pr-2 relative security-watermark-overlay">
                
                {/* Official Exam Header */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-center space-y-1">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                    GOVERNMENT OF INDIA • NATIONAL EXAMINATION COMMISSION
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 uppercase">
                    {paper.examTitle}
                  </h4>
                  <div className="flex justify-center items-center space-x-3 text-[11px] text-slate-400 pt-1 font-mono">
                    <span>Duration: 120 Mins</span>
                    <span>•</span>
                    <span>Max Marks: 200</span>
                    <span>•</span>
                    <span>Total Questions: {paper.questions.length}</span>
                  </div>
                  {/* Dynamic Watermark details */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-amber-300/80 font-mono flex items-center justify-center space-x-2">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>
                      WATERMARK: {centreCode} | SUPDT: {currentUser.name} | TIME: {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Question List */}
                <div className="space-y-4">
                  {paper.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2.5 relative"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-bold text-slate-200">
                          Question {idx + 1} ({q.marks} Marks)
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {q.sectionName.split(':')[0]}
                        </span>
                      </div>

                      <p className="text-slate-100 leading-relaxed font-sans">{q.text}</p>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={opt.id}
                            className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-start space-x-2 text-[11px]"
                          >
                            <span className="font-bold text-slate-400">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{opt.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Micro security watermark footprint */}
                      <div className="text-[9px] font-mono text-slate-600 text-right select-none pt-1">
                        SEC-{q.id} • HASH-{formatCryptoHash(q.sha256Hash, 4, 4)} • CNTR-104
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Building className="w-3.5 h-3.5" />
              <span>Location: Delhi Metro Central Hall #104</span>
            </span>
            <span className="font-mono">Sync Clock: Stratum-1 NTP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
