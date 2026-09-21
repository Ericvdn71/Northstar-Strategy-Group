import React, { useState } from 'react';
import { DutyOfCareIncidentRecord, IncidentSeverity, IncidentStatus, UserRole } from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Plus, 
  Clock, 
  MapPin, 
  PhoneCall, 
  UserCheck
} from 'lucide-react';
import { sanitizeText } from '../utils/validation';

interface RiskEscalationDashboardProps {
  incidents: DutyOfCareIncidentRecord[];
  onLogIncident: (incident: DutyOfCareIncidentRecord) => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus) => void;
  currentUserRole: UserRole;
  userEmail: string;
}

export const RiskEscalationDashboard: React.FC<RiskEscalationDashboardProps> = ({
  incidents,
  onLogIncident,
  onUpdateStatus,
  currentUserRole,
  userEmail,
}) => {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'MEDICAL_EMERGENCY' as const,
    severity: 'MEDIUM' as IncidentSeverity,
    country: 'Cambodia',
    location: 'Siem Reap / Tonle Sap',
    affectedPerson: '',
    incidentDescription: '',
    immediateActionTaken: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.incidentDescription.trim()) return;

    const isCritical = form.severity === 'CRITICAL';
    const newIncident: DutyOfCareIncidentRecord = {
      id: `inc-${Date.now()}`,
      incidentNumber: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: sanitizeText(form.title),
      category: form.category,
      severity: form.severity,
      status: isCritical ? 'ESCALATED_TO_DIRECTORS' : 'REPORTED',
      country: form.country,
      location: sanitizeText(form.location),
      affectedPerson: sanitizeText(form.affectedPerson || 'Field Personnel'),
      reportedBy: `${userEmail} (${currentUserRole})`,
      incidentDescription: sanitizeText(form.incidentDescription),
      immediateActionTaken: sanitizeText(form.immediateActionTaken),
      isEscalatedToRegionalDirector: isCritical,
      dutyOfCareProtocol: isCritical ? 'CRITICAL_P1_DIRECTOR_MOBILIZATION' : `TIER_${form.severity}_PROTOCOL`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
    };

    onLogIncident(newIncident);
    setIsLogModalOpen(false);
    setForm({
      title: '',
      category: 'MEDICAL_EMERGENCY',
      severity: 'MEDIUM',
      country: 'Cambodia',
      location: 'Siem Reap / Tonle Sap',
      affectedPerson: '',
      incidentDescription: '',
      immediateActionTaken: '',
    });
  };

  const getSeverityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-600 text-white animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            P1 CRITICAL EMERGENCY
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
            HIGH SEVERITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Risk Overview Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <h2 className="text-lg font-bold tracking-tight">
              Safeguarding & Duty-of-Care Risk Escalation Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live incident logging protocol operating 24/7 across field research sites in Cambodia and Vietnam. Automated escalation alerts Regional Directors for medical emergencies, safeguarding breaches, and natural disasters.
          </p>
        </div>

        <button
          id="btn-report-incident"
          onClick={() => setIsLogModalOpen(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Log Duty-of-Care Incident</span>
        </button>
      </div>

      {/* Incident Cards List */}
      <div className="space-y-4">
        {incidents.map((incident) => {
          const isCritical = incident.severity === 'CRITICAL' || incident.severity === 'HIGH';

          return (
            <div
              key={incident.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                isCritical ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-500">{incident.incidentNumber}</span>
                    {getSeverityBadge(incident.severity)}
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {incident.category.replace(/_/g, ' ')}
                    </span>
                    {incident.isEscalatedToRegionalDirector && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                        <PhoneCall className="w-3 h-3" />
                        Regional Director Escalated
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{incident.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Status:</span>
                  <select
                    value={incident.status}
                    onChange={(e) => onUpdateStatus(incident.id, e.target.value as IncidentStatus)}
                    className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800"
                  >
                    <option value="REPORTED">Reported</option>
                    <option value="INVESTIGATING">Investigating</option>
                    <option value="ACTION_TAKEN">Action Taken</option>
                    <option value="ESCALATED_TO_DIRECTORS">Escalated to Directors</option>
                    <option value="RESOLVED">Resolved & Closed</option>
                  </select>
                </div>
              </div>

              {/* Description & Action Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-1">Incident Details:</span>
                  <p className="text-slate-600 leading-relaxed">{incident.incidentDescription}</p>
                </div>
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                  <span className="font-bold text-emerald-900 block mb-1">Immediate Action Taken:</span>
                  <p className="text-emerald-800 leading-relaxed">{incident.immediateActionTaken}</p>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 gap-2">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{incident.location}, {incident.country}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-700">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Subject: {incident.affectedPerson}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{incident.createdAt}</span>
                  </span>
                </div>

                <div className="text-right font-mono text-[10px] text-slate-400">
                  Protocol: {incident.dutyOfCareProtocol}
                </div>
              </div>
            </div>
          );
        })}

        {incidents.length === 0 && (
          <div className="p-12 text-center border border-dashed border-slate-200 rounded-xl bg-white">
            <p className="text-slate-400 text-sm">No active incidents logged.</p>
          </div>
        )}
      </div>

      {/* LOG INCIDENT MODAL */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Log Safeguarding or Duty-of-Care Incident</h3>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-base">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Incident Headline</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Acute Medical Emergency during boat survey"
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Incident Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                  >
                    <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
                    <option value="SAFEGUARDING_HARASSMENT">Safeguarding / PSEA</option>
                    <option value="NATURAL_HAZARD">Natural Hazard / Severe Weather</option>
                    <option value="POLITICAL_VISA">Political / Visa / Legal Spot-check</option>
                    <option value="SECURITY">Field Security Concern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Severity Tier</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value as IncidentSeverity })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-bold text-rose-700"
                  >
                    <option value="LOW">Low (Minor adjustment)</option>
                    <option value="MEDIUM">Medium (Local clinic / transit issue)</option>
                    <option value="HIGH">High (Hospitalization / visa violation)</option>
                    <option value="CRITICAL">P1 CRITICAL (Immediate Director Mobilization)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Country & City Location</label>
                  <input
                    type="text"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Affected Individual(s)</label>
                  <input
                    type="text"
                    required
                    value={form.affectedPerson}
                    onChange={(e) => setForm({ ...form, affectedPerson: e.target.value })}
                    placeholder="e.g. Emily Thornton (Oxford Intern)"
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Incident Facts & Circumstances</label>
                <textarea
                  rows={3}
                  required
                  value={form.incidentDescription}
                  onChange={(e) => setForm({ ...form, incidentDescription: e.target.value })}
                  placeholder="Provide precise chronological details, location coordinates, symptoms, or legal interaction."
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Immediate Remedial Action Taken</label>
                <textarea
                  rows={2}
                  required
                  value={form.immediateActionTaken}
                  onChange={(e) => setForm({ ...form, immediateActionTaken: e.target.value })}
                  placeholder="e.g. Transported to Royal Angkor Hospital; insurance opened claim; coordinator notified."
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
                />
              </div>

              {form.severity === 'CRITICAL' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-medium text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Selecting P1 CRITICAL will automatically trigger director alerts and activate the Crisis Response Protocol.</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-sm"
                >
                  Log & Dispatch Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
