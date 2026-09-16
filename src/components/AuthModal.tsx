import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { generateRandomOTP } from '../crypto/cryptoUtils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUserId: string;
  onSuccessfulLogin: (user: User, otpToken: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUserId,
  onSuccessfulLogin,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUserId);
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState<string>('GovSecurePass#2026');
  const [generatedOTP, setGeneratedOTP] = useState<string>('');
  const [inputOTP, setInputOTP] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  const targetUser = users.find(u => u.id === selectedUserId) || users[0];

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId(currentUserId);
      setStep(1);
      setPassword('GovSecurePass#2026');
      setInputOTP('');
      setErrorMsg('');
      setNotificationBanner(null);
    }
  }, [isOpen, currentUserId]);

  // Countdown timer for OTP validity
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 8 characters with alphanumeric credentials.');
      return;
    }
    setErrorMsg('');
    // Generate new OTP
    const newOTP = generateRandomOTP();
    setGeneratedOTP(newOTP);
    setOtpTimer(60);
    setStep(2);
    setNotificationBanner(
      `Secure SMS to +91-XXXXX-${targetUser.phoneLast4}: "Your National Examination Portal OTP is ${newOTP}. Valid for 60 seconds. Do NOT disclose to anyone."`
    );
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputOTP !== generatedOTP) {
      setErrorMsg('Invalid OTP code. Please re-enter the 6-digit code received on your registered device.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onSuccessfulLogin(targetUser, `OTP-VAL-${inputOTP}-${Date.now()}`);
      onClose();
    }, 600);
  };

  const handleResendOTP = () => {
    const newOTP = generateRandomOTP();
    setGeneratedOTP(newOTP);
    setInputOTP('');
    setOtpTimer(60);
    setErrorMsg('');
    setNotificationBanner(
      `Resent Secure SMS to +91-XXXXX-${targetUser.phoneLast4}: "New OTP code: ${newOTP}. Valid for 60s."`
    );
  };

  const handleAutoFill = () => {
    setInputOTP(generatedOTP);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Two-Factor Authentication (2FA)
              </h3>
              <p className="text-[11px] text-slate-400">Mandatory Gov-KMS Security Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Simulated Device SMS Notification Banner */}
        {notificationBanner && (
          <div className="px-5 py-2.5 bg-emerald-950/80 border-b border-emerald-700/50 text-emerald-200 text-xs flex items-start space-x-2">
            <Smartphone className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold block text-emerald-300 text-[11px] uppercase tracking-wider">
                Simulated Secure Device Broadcast:
              </span>
              <p className="font-mono text-[11px] mt-0.5">{notificationBanner}</p>
            </div>
          </div>
        )}

        <div className="p-6">
          {step === 1 ? (
            /* STEP 1: PASSWORD AUTHENTICATION */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Examination Officer Account
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.title} ({u.role.toUpperCase()})
                    </option>
                  ))}
                </select>
                <div className="mt-2 p-2.5 rounded bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                  <div className="flex justify-between mb-1">
                    <span>Clearance Level:</span>
                    <span className="font-mono font-bold text-indigo-400">{targetUser.clearanceLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Department:</span>
                    <span className="text-slate-300">{targetUser.department}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Step 1: Security Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 pl-9 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="Enter government security passkey"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Default test passphrase prefilled: <span className="font-mono text-slate-400">GovSecurePass#2026</span>
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/50 p-2.5 rounded border border-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/20"
                >
                  <Lock className="w-4 h-4" />
                  <span>Verify Credentials & Dispatch OTP</span>
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: OTP VERIFICATION */
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 mb-2">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-200">
                  Step 2: Enter 6-Digit Security OTP
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Sent to hardware token registered to <span className="text-slate-300 font-medium">{targetUser.name}</span> (+91-XXXXX-{targetUser.phoneLast4})
                </p>
              </div>

              <div>
                <div className="flex justify-center my-3">
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={inputOTP}
                    onChange={(e) => setInputOTP(e.target.value.replace(/\D/g, ''))}
                    placeholder="______"
                    className="w-44 text-center tracking-[0.4em] font-mono text-xl py-2.5 bg-slate-950 border-2 border-indigo-500 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                  <span>
                    Valid for: <strong className="font-mono text-cyan-400">{otpTimer}s</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2"
                  >
                    Quick Auto-Fill ({generatedOTP})
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center space-x-2 text-xs text-rose-400 bg-rose-950/50 p-2.5 rounded border border-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isVerifying || inputOTP.length !== 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/20"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Cryptographic Handshake...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete 2FA Authentication</span>
                    </>
                  )}
                </button>

                <div className="flex justify-between items-center text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    ← Change Account
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
