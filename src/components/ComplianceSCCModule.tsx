import React, { useState } from 'react';
import { SCCAgreementRecord, UserRole } from '../types';
import { 
  ShieldCheck, 
  FileCheck2, 
  Lock, 
  Key, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  Hash, 
  History,
  Copy,
  Check
} from 'lucide-react';
import { generateContractHash } from '../utils/validation';

interface ComplianceSCCModuleProps {
  agreements: SCCAgreementRecord[];
  onExecuteSCC: (agreementId: string, signatureHash: string) => void;
  currentUserRole: UserRole;
}

export const ComplianceSCCModule: React.FC<ComplianceSCCModuleProps> = ({
  agreements,
  onExecuteSCC,
  currentUserRole,
}) => {
  const [selectedAgreementId, setSelectedAgreementId] = useState<string>(agreements[0]?.id || '');
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const selectedAgreement = agreements.find((a) => a.id === selectedAgreementId) || agreements[0];

  const canExecute = currentUserRole === 'INTERNAL_CONSULTANT';

  const handleExecute = async () => {
    if (!selectedAgreement || !canExecute) return;
    setIsExecuting(true);

    const dataPayload = `${selectedAgreement.reference}|${selectedAgreement.dataExporterName}|${selectedAgreement.dataImporterName}|${selectedAgreement.module}|${new Date().toISOString()}`;
    const hash = await generateContractHash(dataPayload);

    setTimeout(() => {
      onExecuteSCC(selectedAgreement.id, hash);
      setIsExecuting(false);
    }, 600);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Cross-Border GDPR Standard Contractual Clauses (SCC) Automation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Automated execution and cryptographically verifiable audit trail for international personal data transfers from EU/UK partner universities to Southeast Asian non-adequate third countries (GDPR Art. 46(2)(c)).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Agreement Reference:</span>
          <select
            value={selectedAgreementId}
            onChange={(e) => setSelectedAgreementId(e.target.value)}
            className="bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900 rounded-lg px-3 py-1.5"
          >
            {agreements.map((a) => (
              <option key={a.id} value={a.id}>
                {a.reference} ({a.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedAgreement && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Contract Panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {selectedAgreement.reference}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2">
                  Commission Implementing Decision (EU) 2021/914 Standard Clauses
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  selectedAgreement.status === 'EXECUTED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedAgreement.status}
                </span>
              </div>
            </div>

            {/* Transfer Scenario Graphic */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 items-center text-center gap-4">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Data Exporter (EU/UK)</span>
                <span className="font-bold text-xs text-slate-900 block truncate">{selectedAgreement.dataExporterName}</span>
                <span className="text-[11px] text-slate-500 font-medium">{selectedAgreement.dataExporterCountry}</span>
              </div>

              <div className="flex flex-col items-center justify-center text-slate-400">
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mb-1">
                  {selectedAgreement.module.replace(/_/g, ' ')}
                </span>
                <ArrowRight className="w-5 h-5 text-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-400">Encrypted Transit</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Data Importer (Recipient)</span>
                <span className="font-bold text-xs text-slate-900 block truncate">{selectedAgreement.dataImporterName}</span>
                <span className="text-[11px] text-slate-500 font-medium">{selectedAgreement.dataImporterCountry}</span>
              </div>
            </div>

            {/* Scope and Data Categories */}
            <div className="space-y-3 text-xs">
              <span className="font-bold text-slate-900 block">Transfer Scope & Operational Purpose</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                {selectedAgreement.transferScenario}
              </p>

              <div>
                <span className="font-bold text-slate-700 block mb-1.5">Protected Data Categories Transferred:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgreement.categoriesOfData.map((cat, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Technical & Organizational Measures (TOMs) */}
            <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>Enforced Technical & Organizational Measures (TOMs)</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">Transit Security:</span>
                  <span className="font-semibold text-white">{selectedAgreement.technicalMeasures.encryptionInTransit}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Storage Encryption:</span>
                  <span className="font-semibold text-white">{selectedAgreement.technicalMeasures.encryptionAtRest}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Access Controls:</span>
                  <span className="font-semibold text-white">{selectedAgreement.technicalMeasures.accessControl}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Purge Retention Limit:</span>
                  <span className="font-semibold text-white">{selectedAgreement.technicalMeasures.dataRetentionDays} days post-placement</span>
                </div>
              </div>
            </div>

            {/* Transfer Impact Assessment (TIA) certification */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Transfer Impact Assessment (Schrems II & EDPB 01/2020)</span>
              </div>
              <p className="text-blue-800 leading-relaxed text-[11px]">
                {selectedAgreement.tiaSummary}
              </p>
            </div>

            {/* Execution Trigger Button */}
            <div className="pt-2 flex items-center justify-between">
              {selectedAgreement.status === 'EXECUTED' ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Fully Executed on {selectedAgreement.executedAt?.slice(0, 10)}</span>
                </div>
              ) : (
                <div>
                  {!canExecute && (
                    <span className="text-xs text-amber-700 font-medium block mb-2">
                      ⚠️ Role Restriction: Only Northstar Internal Consultants have signing authority to execute cross-border SCC contracts.
                    </span>
                  )}
                  <button
                    id="btn-execute-scc"
                    disabled={!canExecute || isExecuting}
                    onClick={handleExecute}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isExecuting ? 'Generating Cryptographic Signature...' : '1-Click Automated SCC Execution'}</span>
                  </button>
                </div>
              )}

              <span className="text-[11px] text-slate-400 font-mono">
                Valid Until: {selectedAgreement.validUntil}
              </span>
            </div>
          </div>

          {/* Verification Hash & Audit Panel */}
          <div className="space-y-4">
            {/* Cryptographic Digital Signature Hash */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Hash className="w-4 h-4 text-emerald-600" />
                <span>SHA-256 Verification Signature</span>
              </div>

              {selectedAgreement.digitalSignatureHash ? (
                <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] break-all border border-slate-800">
                  {selectedAgreement.digitalSignatureHash}
                  <button
                    onClick={() => copyToClipboard(selectedAgreement.digitalSignatureHash!)}
                    className="mt-2 flex items-center gap-1 text-[10px] text-slate-300 hover:text-white bg-slate-800 px-2 py-1 rounded"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? 'Copied to Clipboard' : 'Copy Hash'}</span>
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-400">
                  Awaiting automated execution to generate cryptographic tamper-proof hash.
                </div>
              )}
            </div>

            {/* Compliance Audit Log */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <History className="w-4 h-4 text-slate-500" />
                <span>GDPR Compliance Audit Trail</span>
              </div>

              <div className="space-y-2.5">
                {selectedAgreement.complianceAuditLogs.length === 0 ? (
                  <div className="text-slate-400 text-center py-4">No audit events recorded yet.</div>
                ) : (
                  selectedAgreement.complianceAuditLogs.map((log, index) => (
                    <div key={index} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                        <span>{log.event}</span>
                        <span className="font-mono text-slate-400">{log.timestamp.slice(0, 10)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{log.legalBasis}</div>
                      <div className="text-[9px] font-mono text-slate-400 truncate">Hash: {log.hash}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
