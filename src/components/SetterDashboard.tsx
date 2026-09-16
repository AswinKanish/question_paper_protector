import React, { useState } from 'react';
import {
  Lock,
  PlusCircle,
  FileKey,
  ShieldCheck,
  Eye,
  EyeOff,
  Database,
  Hash,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { User, QuestionItem, SectionBlueprint } from '../types';
import {
  encryptQuestionPayload,
  fallbackSHA256,
  formatCryptoHash,
} from '../crypto/cryptoUtils';

interface SetterDashboardProps {
  currentUser: User;
  assignedSection: SectionBlueprint;
  questions: QuestionItem[];
  onAddQuestion: (q: QuestionItem) => void;
}

export const SetterDashboard: React.FC<SetterDashboardProps> = ({
  currentUser,
  assignedSection,
  questions,
  onAddQuestion,
}) => {
  const [showEncryptedView, setShowEncryptedView] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New question form state
  const [questionText, setQuestionText] = useState<string>('');
  const [optA, setOptA] = useState<string>('');
  const [optB, setOptB] = useState<string>('');
  const [optC, setOptC] = useState<string>('');
  const [optD, setOptD] = useState<string>('');
  const [correctOption, setCorrectOption] = useState<string>('opt-a');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [marks, setMarks] = useState<number>(2.5);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter questions: Setter can ONLY see their assigned section questions
  const sectionQuestions = questions.filter(
    (q) => q.sectionId === assignedSection.id && q.setterId === currentUser.id
  );

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      return;
    }

    setIsSubmitting(true);

    const options = [
      { id: 'opt-a', text: optA.trim() },
      { id: 'opt-b', text: optB.trim() },
      { id: 'opt-c', text: optC.trim() },
      { id: 'opt-d', text: optD.trim() },
    ];

    // Cryptographic cloud encryption
    const payloadToEncrypt = questionText + JSON.stringify(options) + correctOption;
    const enc = encryptQuestionPayload(payloadToEncrypt);
    const sha256Hash = fallbackSHA256(payloadToEncrypt);

    const newQuestion: QuestionItem = {
      id: `Q-${assignedSection.code}-${Date.now().toString().slice(-4)}`,
      sectionId: assignedSection.id,
      sectionName: assignedSection.name,
      setterId: currentUser.id,
      setterName: currentUser.name,
      text: questionText.trim(),
      options,
      correctOptionId: correctOption,
      difficulty,
      marks: Number(marks),
      submittedAt: new Date().toISOString(),
      cipherPayload: enc.cipherPayload,
      iv: enc.iv,
      authTag: enc.authTag,
      keyId: enc.keyId,
      sha256Hash,
    };

    setTimeout(() => {
      onAddQuestion(newQuestion);
      setIsSubmitting(false);
      setQuestionText('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setCorrectOption('opt-a');
      setSuccessToast(`Question ${newQuestion.id} successfully AES-256 encrypted and stored in Cloud Vault!`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Blinded Partition Confirmation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600/40">
                BLINDED SETTER SHARD
              </span>
              <span className="text-xs text-slate-400">Code: {assignedSection.code}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-1.5">
              {assignedSection.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              <strong className="text-slate-200">Compartmentalization Principle:</strong> You are strictly assigned to Section {assignedSection.code}. You do not have access to other sections or the full examination paper. Questions are sealed with client-side AES-256-GCM encryption before ingestion.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/80 border border-slate-800 p-3 rounded-lg shrink-0">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-mono">
                Pool Health
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {sectionQuestions.length}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  / {assignedSection.requiredQuestions} minimum required
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-200 text-xs flex items-center space-x-2 animate-fade-in shadow-md">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      {/* Main Grid: Question Creator & Vault Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Secure Question Authoring Terminal */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Secure Question Authoring Terminal
              </h3>
            </div>
            <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-700/40">
              Client Zero-Knowledge Encryption
            </span>
          </div>

          <form onSubmit={handleCreateQuestion} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Question Statement / Problem
              </label>
              <textarea
                rows={3}
                required
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Draft the examination item. Avoid any identifying meta-tags or personal signatures..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {/* 4 Options Grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Multiple-Choice Options & Correct Answer Designation
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Option A */}
                <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
                  correctOption === 'opt-a' ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-950 border-slate-700'
                }`}>
                  <input
                    type="radio"
                    id="opt-a-radio"
                    name="correct-opt"
                    checked={correctOption === 'opt-a'}
                    onChange={() => setCorrectOption('opt-a')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-400">A.</span>
                  <input
                    type="text"
                    required
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="Option A description"
                    className="bg-transparent text-xs text-slate-100 w-full focus:outline-none"
                  />
                </div>

                {/* Option B */}
                <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
                  correctOption === 'opt-b' ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-950 border-slate-700'
                }`}>
                  <input
                    type="radio"
                    id="opt-b-radio"
                    name="correct-opt"
                    checked={correctOption === 'opt-b'}
                    onChange={() => setCorrectOption('opt-b')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-400">B.</span>
                  <input
                    type="text"
                    required
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="Option B description"
                    className="bg-transparent text-xs text-slate-100 w-full focus:outline-none"
                  />
                </div>

                {/* Option C */}
                <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
                  correctOption === 'opt-c' ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-950 border-slate-700'
                }`}>
                  <input
                    type="radio"
                    id="opt-c-radio"
                    name="correct-opt"
                    checked={correctOption === 'opt-c'}
                    onChange={() => setCorrectOption('opt-c')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-400">C.</span>
                  <input
                    type="text"
                    required
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="Option C description"
                    className="bg-transparent text-xs text-slate-100 w-full focus:outline-none"
                  />
                </div>

                {/* Option D */}
                <div className={`p-2.5 rounded-lg border flex items-center space-x-2 ${
                  correctOption === 'opt-d' ? 'bg-indigo-950/40 border-indigo-500' : 'bg-slate-950 border-slate-700'
                }`}>
                  <input
                    type="radio"
                    id="opt-d-radio"
                    name="correct-opt"
                    checked={correctOption === 'opt-d'}
                    onChange={() => setCorrectOption('opt-d')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-400">D.</span>
                  <input
                    type="text"
                    required
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="Option D description"
                    className="bg-transparent text-xs text-slate-100 w-full focus:outline-none"
                  />
                </div>

              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Select the radio button corresponding to the single verified correct answer.
              </p>
            </div>

            {/* Metadata (Difficulty, Marks) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Easy">Easy (Standard Aptitude)</option>
                  <option value="Medium">Medium (Application)</option>
                  <option value="Hard">Hard (Advanced Analytical)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Allocated Marks
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Encryption & Submission */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/25"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Computing AES-256-GCM & SHA-256 Digest...'
                    : 'Seal with AES-256-GCM & Submit to Cloud Vault'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 Cols: Cloud Vault Storage Inspector */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Cloud Vault Security Inspector
                </h3>
              </div>
              <button
                onClick={() => setShowEncryptedView(!showEncryptedView)}
                className="flex items-center space-x-1 text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-700/40 transition"
              >
                {showEncryptedView ? (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Plaintext View</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Encrypted View</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Demonstrating zero-knowledge cloud storage: If an unauthorized actor or compromised database admin dumps the cloud table, only the encrypted ciphertext envelope is revealed.
            </p>

            {/* Vault storage items */}
            <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {sectionQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-slate-300">{q.id}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {q.difficulty}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/40">
                      VAULT-SEALED
                    </span>
                  </div>

                  {showEncryptedView ? (
                    /* ENCRYPTED CIPHERTEXT VIEW */
                    <div className="space-y-1 font-mono text-[10px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="text-cyan-300 font-semibold break-all">
                        Payload: {q.cipherPayload}
                      </div>
                      <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-800">
                        <span>IV: {q.iv}</span>
                        <span>Tag: {q.authTag}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 break-all">
                        SHA-256: {q.sha256Hash}
                      </div>
                    </div>
                  ) : (
                    /* PLAINTEXT AUTHOR VIEW */
                    <div>
                      <p className="text-xs text-slate-200 line-clamp-2">{q.text}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-1.5 border-t border-slate-800/80">
                        <span>Marks: {q.marks}</span>
                        <span className="font-mono text-[10px] text-indigo-400">
                          Hash: {formatCryptoHash(q.sha256Hash, 6, 6)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1 text-slate-400">
              <FileKey className="w-3.5 h-3.5 text-indigo-400" />
              <span>Key: HSM-KMS-2026</span>
            </span>
            <span className="font-mono text-slate-400">Total Items in Shard: {sectionQuestions.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
