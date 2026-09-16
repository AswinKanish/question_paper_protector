import React from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  UserCheck,
  FileCheck2,
  Lock,
  LogOut,
  Info,
  ChevronDown,
  Database,
} from 'lucide-react';
import { User, AssembledPaper, UserRole } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (role: UserRole) => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  onOpenInfoModal: () => void;
  onOpenIntegrityModal: () => void;
  onOpenSupabaseModal: () => void;
  paper: AssembledPaper;
  timeRemainingSeconds: number;
  isTimeLockExpired: boolean;
  usersList: User[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  onOpenLoginModal,
  onLogout,
  onOpenInfoModal,
  onOpenIntegrityModal,
  onOpenSupabaseModal,
  paper,
  timeRemainingSeconds,
  isTimeLockExpired,
  usersList,
}) => {
  const formatTime = (secs: number) => {
    if (secs <= 0) return '00:00:00 (TIME REACHED)';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const quorumCount = paper.signatures.length;
  const isQuorumReached = quorumCount >= paper.requiredSignatures;

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner: Government & Security Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Security Seal */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-100 tracking-tight text-base sm:text-lg">
                  SecureExams Cloud
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 font-semibold tracking-wider">
                  Gov-ZeroLeak KMS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                National Question Paper Vault & Cryptographic Controlled-Release Engine
              </p>
            </div>
          </div>

          {/* Real-time System Security Indicators */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Integrity Status */}
            <button
              id="nav-btn-integrity-status"
              onClick={onOpenIntegrityModal}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md border font-mono transition-all ${
                paper.isTampered
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse hover:bg-rose-900'
                  : 'bg-slate-900 border-slate-700 text-emerald-400 hover:border-emerald-500/60 hover:bg-slate-850'
              }`}
              title="Click to inspect SHA-256 Merkle integrity or simulate attack"
            >
              {paper.isTampered ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="font-semibold">
                {paper.isTampered ? 'TAMPER DETECTED' : 'SHA-256 SEAL: INTACT'}
              </span>
            </button>

            {/* Quorum Progress */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md border font-mono ${
                isQuorumReached
                  ? 'bg-emerald-950/50 border-emerald-600/40 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-600/40 text-amber-300'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Quorum: {quorumCount}/{paper.requiredSignatures} Signed</span>
            </div>

            {/* Time-lock Clock */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md border font-mono ${
                isTimeLockExpired
                  ? 'bg-blue-950/60 border-blue-500/50 text-blue-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Release: {formatTime(timeRemainingSeconds)}</span>
            </div>

            {/* Supabase Status Indicator & Setup Guide */}
            <button
              id="nav-btn-supabase-status"
              onClick={onOpenSupabaseModal}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md border font-mono transition-all ${
                isSupabaseConfigured
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80'
                  : 'bg-slate-900 border-amber-600/50 text-amber-300 hover:bg-slate-850'
              }`}
              title="Click to check Supabase configuration and database instructions"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="font-medium">
                {isSupabaseConfigured ? 'Supabase: Connected' : 'Supabase: Setup'}
              </span>
            </button>

            {/* Threat Model Explanation Modal Trigger */}
            <button
              id="nav-btn-architecture"
              onClick={onOpenInfoModal}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="View Security Architecture and Anti-Leak Specifications"
            >
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-medium">Security Specs</span>
            </button>
          </div>
        </div>

        {/* User Identity & Compartmentalized Role Switcher Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          
          {/* Current Active Authenticated Persona */}
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-200">
                {currentUser.name.charAt(0)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-100">{currentUser.name}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  2FA: ACTIVE
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-700/50 uppercase font-semibold">
                  {currentUser.clearanceLevel.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentUser.title} • {currentUser.department}
              </p>
            </div>
          </div>

          {/* Quick Persona Switcher for Evaluation */}
          <div className="flex items-center space-x-2">
            <label htmlFor="role-selector" className="text-slate-400 text-xs hidden lg:inline">
              Switch Role View:
            </label>
            <div className="relative">
              <select
                id="role-selector"
                value={currentUser.role}
                onChange={(e) => onSwitchUser(e.target.value as UserRole)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1.5 pr-7 focus:outline-none focus:border-indigo-500 appearance-none font-medium cursor-pointer"
              >
                {usersList.map((u) => (
                  <option key={u.role} value={u.role}>
                    {u.name} ({u.title.split('(')[0]})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Explicit 2FA Login Flow Modal Button */}
            <button
              id="btn-re-auth"
              onClick={onOpenLoginModal}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Test complete Password + OTP login flow"
            >
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>2FA Login</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
