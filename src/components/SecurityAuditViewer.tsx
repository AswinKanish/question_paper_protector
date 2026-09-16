import React, { useState } from 'react';
import {
  FileCode,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Activity,
} from 'lucide-react';
import { AuditLogEntry, AuditCategory, AuditSeverity } from '../types';

interface SecurityAuditViewerProps {
  logs: AuditLogEntry[];
  onExportLogs: () => void;
  onOpenIntegrityModal: () => void;
}

export const SecurityAuditViewer: React.FC<SecurityAuditViewerProps> = ({
  logs,
  onExportLogs,
  onOpenIntegrityModal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);

    const matchesCategory =
      selectedCategory === 'ALL' || log.category === selectedCategory;

    const matchesSeverity =
      selectedSeverity === 'ALL' || log.severity === selectedSeverity;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const criticalAlertsCount = logs.filter(
    (l) => l.severity === 'CRITICAL_ALERT'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                INDEPENDENT VIGILANCE & AUDIT CELL
              </span>
              <span className="text-xs text-slate-400">Security Cleared: READ_ONLY_AUDIT</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-1.5">
              Immutable Cryptographic Audit Trail & Activity Monitor
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              All interactions—including 2FA authentication, blinded item submissions, AES vault encryption, automated assembly, dual quorum co-signatures, and decryption requests—are permanently logged with client IP, timestamp, and cryptographic proofs.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-export-audit"
              onClick={onExportLogs}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit JSON</span>
            </button>
            <button
              id="btn-integrity-from-audit"
              onClick={onOpenIntegrityModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verify Hashes</span>
            </button>
          </div>
        </div>

        {/* Security Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Total Events</span>
            <span className="font-mono text-lg font-bold text-slate-100">{logs.length}</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">2FA Authentications</span>
            <span className="font-mono text-lg font-bold text-indigo-400">
              {logs.filter(l => l.category === 'AUTH_2FA').length}
            </span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Vault Encryptions</span>
            <span className="font-mono text-lg font-bold text-cyan-400">
              {logs.filter(l => l.category === 'BLIND_QUESTION_SETTING' || l.category === 'VAULT_ENCRYPTION').length}
            </span>
          </div>

          <div className={`p-3 rounded-lg border ${
            criticalAlertsCount > 0
              ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse'
              : 'bg-slate-950/80 border-slate-800'
          }`}>
            <span className="text-slate-400 block text-[11px]">Tamper Anomaly Incidents</span>
            <span className={`font-mono text-lg font-bold ${criticalAlertsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {criticalAlertsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search audit trail by actor, IP address, action or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="AUTH_2FA">2FA Authentication</option>
              <option value="BLIND_QUESTION_SETTING">Blinded Question Setting</option>
              <option value="AUTOMATED_ASSEMBLY">Automated Assembly</option>
              <option value="QUORUM_APPROVAL">Quorum Approval</option>
              <option value="TIME_LOCK_RELEASE">Time-Lock Release</option>
              <option value="SECURITY_TAMPER_ALERT">Tamper Alert Anomaly</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="NOTICE">NOTICE</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL_ALERT">CRITICAL_ALERT</option>
            </select>
          </div>
        </div>

        {/* Audit Log Stream Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800 mt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Time / ID</th>
                <th className="py-2.5 px-3">Actor & Role</th>
                <th className="py-2.5 px-3">Action & Category</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Network & Workstation</th>
                <th className="py-2.5 px-3">Audit Details & Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className={`hover:bg-slate-850/60 transition ${
                    log.severity === 'CRITICAL_ALERT'
                      ? 'bg-rose-950/30'
                      : ''
                  }`}
                >
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                    <span className="text-[10px] text-slate-500">{log.id}</span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <strong className="text-slate-200 block">{log.actorName}</strong>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {log.actorRole}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-100 block">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400">
                      {log.category}
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.severity === 'CRITICAL_ALERT'
                          ? 'bg-rose-950 text-rose-300 border border-rose-600/50'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                          : log.severity === 'NOTICE'
                          ? 'bg-blue-950 text-blue-300 border border-blue-600/50'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    <div>{log.ipAddress}</div>
                    <div className="text-[10px] text-slate-500">{log.clientDevice}</div>
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    <p className="text-xs leading-relaxed">{log.details}</p>
                    {log.cryptoProof && (
                      <span className="mt-1 font-mono text-[10px] text-indigo-300/80 block break-all">
                        Proof: {log.cryptoProof}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No audit records matching the specified filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
