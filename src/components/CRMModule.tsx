import React, { useState } from 'react';
import { UniversityRecord, NGORecord, StudentPlacement, UserRole } from '../types';
import { 
  Building2, 
  GraduationCap, 
  Users2, 
  Plus, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  FileText, 
  Search,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { 
  validateEmail, 
  validatePhone, 
  validateNgoRegistration, 
  validateUniversityDomain, 
  sanitizeText 
} from '../utils/validation';

interface CRMModuleProps {
  universities: UniversityRecord[];
  ngos: NGORecord[];
  placements: StudentPlacement[];
  onAddNgo: (ngo: NGORecord) => void;
  onAddUniversity: (uni: UniversityRecord) => void;
  onAddPlacement: (placement: StudentPlacement) => void;
  currentUserRole: UserRole;
}

export const CRMModule: React.FC<CRMModuleProps> = ({
  universities,
  ngos,
  placements,
  onAddNgo,
  onAddUniversity,
  onAddPlacement,
  currentUserRole,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ngos' | 'universities' | 'placements'>('ngos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNgoModalOpen, setIsNgoModalOpen] = useState(false);
  const [isUniModalOpen, setIsUniModalOpen] = useState(false);
  const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);

  // Form states with regex feedback
  const [ngoForm, setNgoForm] = useState({
    name: '',
    legalName: '',
    country: 'Cambodia',
    city: 'Phnom Penh',
    registrationNumber: '',
    focusArea: '',
    contactPerson: '',
    contactEmail: '',
    phone: '',
    officeAddress: '',
  });

  const [uniForm, setUniForm] = useState({
    name: '',
    country: 'United Kingdom',
    city: '',
    domain: '',
    coordinatorName: '',
    coordinatorEmail: '',
    annualQuota: 10,
    partnershipTier: 'STRATEGIC_GLOBAL' as const,
  });

  const [placementForm, setPlacementForm] = useState({
    studentName: '',
    studentEmail: '',
    nationality: 'British',
    universityName: universities[0]?.name || '',
    ngoName: ngos[0]?.name || '',
    degreeProgram: 'MSc Sustainable Development',
    hostCountry: 'Cambodia',
    startDate: '2026-10-01',
    endDate: '2027-01-31',
    stipendUSD: 850,
    riskTier: 'MEDIUM' as const,
    emergencyName: '',
    emergencyPhone: '',
    emergencyRel: 'Parent',
  });

  // Dynamic regex validation state for active modals
  const ngoEmailVal = validateEmail(ngoForm.contactEmail);
  const ngoPhoneVal = validatePhone(ngoForm.phone);
  const ngoRegVal = validateNgoRegistration(ngoForm.registrationNumber, ngoForm.country);

  const uniDomainVal = validateUniversityDomain(uniForm.domain);
  const uniEmailVal = validateEmail(uniForm.coordinatorEmail);

  const handleSaveNgo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ngoEmailVal.isValid || !ngoPhoneVal.isValid || !ngoRegVal.isValid || !ngoForm.name.trim()) {
      return;
    }

    const newNgo: NGORecord = {
      id: `ngo-${Date.now()}`,
      name: sanitizeText(ngoForm.name),
      legalName: sanitizeText(ngoForm.legalName || ngoForm.name),
      country: ngoForm.country,
      city: sanitizeText(ngoForm.city),
      registrationNumber: ngoForm.registrationNumber.trim().toUpperCase(),
      focusArea: sanitizeText(ngoForm.focusArea),
      safeguardingRating: 'LEVEL_1_PENDING',
      vettedStatus: true,
      contactPerson: sanitizeText(ngoForm.contactPerson),
      contactEmail: ngoForm.contactEmail.trim().toLowerCase(),
      phone: ngoForm.phone.trim(),
      officeAddress: sanitizeText(ngoForm.officeAddress),
      counterTerrorismScreened: true,
      moiVerified: true,
    };

    onAddNgo(newNgo);
    setIsNgoModalOpen(false);
  };

  const handleSaveUni = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniDomainVal.isValid || !uniEmailVal.isValid || !uniForm.name.trim()) {
      return;
    }

    const newUni: UniversityRecord = {
      id: `uni-${Date.now()}`,
      name: sanitizeText(uniForm.name),
      country: uniForm.country,
      city: sanitizeText(uniForm.city),
      domain: uniForm.domain.trim().toLowerCase(),
      coordinatorName: sanitizeText(uniForm.coordinatorName),
      coordinatorEmail: uniForm.coordinatorEmail.trim().toLowerCase(),
      annualQuota: Number(uniForm.annualQuota),
      activeStudents: 0,
      gdprDpaSigned: true,
      partnershipTier: uniForm.partnershipTier,
    };

    onAddUniversity(newUni);
    setIsUniModalOpen(false);
  };

  const handleSavePlacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placementForm.studentName.trim()) return;

    const newPlacement: StudentPlacement = {
      id: `plc-${Date.now()}`,
      reference: `PLC-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentName: sanitizeText(placementForm.studentName),
      studentEmail: placementForm.studentEmail.trim().toLowerCase(),
      nationality: placementForm.nationality,
      universityName: placementForm.universityName,
      degreeProgram: placementForm.degreeProgram,
      ngoName: placementForm.ngoName,
      hostCountry: placementForm.hostCountry,
      startDate: placementForm.startDate,
      endDate: placementForm.endDate,
      status: 'SCC_PENDING',
      riskTier: placementForm.riskTier,
      stipendUSD: Number(placementForm.stipendUSD),
      sccExecuted: false,
      emergencyContact: {
        name: placementForm.emergencyName || 'Emergency Officer',
        phone: placementForm.emergencyPhone || '+44 7700 900000',
        relationship: placementForm.emergencyRel,
      },
    };

    onAddPlacement(newPlacement);
    setIsPlacementModalOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* CRM Header & Subtabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Relational CRM & Field Placements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-border partnerships connecting European/North American universities with Southeast Asian grassroots civil society in Cambodia and Vietnam.
          </p>
        </div>

        {/* Action Button */}
        <div>
          {activeSubTab === 'ngos' && (
            <button
              onClick={() => setIsNgoModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register NGO</span>
            </button>
          )}
          {activeSubTab === 'universities' && (
            <button
              onClick={() => setIsUniModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add University</span>
            </button>
          )}
          {activeSubTab === 'placements' && (
            <button
              onClick={() => setIsPlacementModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Student Match</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('ngos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'ngos'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Regional NGOs ({ngos.length})
        </button>
        <button
          onClick={() => setActiveSubTab('universities')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'universities'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Universities ({universities.length})
        </button>
        <button
          onClick={() => setActiveSubTab('placements')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'placements'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Student Placements ({placements.length})
        </button>
      </div>

      {/* SUB-TAB 1: NGOS DIRECTORY */}
      {activeSubTab === 'ngos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ngos.map((ngo) => (
            <div key={ngo.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-emerald-500 transition-all space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    {ngo.name}
                    {ngo.vettedStatus && (
                      <ShieldCheck className="w-4 h-4 text-emerald-600" title="Vetted NGO" />
                    )}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Reg #{ngo.registrationNumber} ({ngo.country})
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  ngo.safeguardingRating === 'TIER_A_VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {ngo.safeguardingRating.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-900">Focus: </span>
                {ngo.focusArea}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <Users2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{ngo.contactPerson}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{ngo.contactEmail}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{ngo.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{ngo.city}, {ngo.country}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  MoI Verified & CFT Screened
                </span>
                <span className="font-mono text-slate-400">Database ID: {ngo.id.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 2: UNIVERSITIES DIRECTORY */}
      {activeSubTab === 'universities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {universities.map((uni) => (
            <div key={uni.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-500 transition-all space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    {uni.name}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Domain: {uni.domain} · {uni.country}
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {uni.partnershipTier.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500 block">Annual Student Quota</span>
                  <span className="text-sm font-bold text-slate-900">{uni.annualQuota} placements/yr</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current In-Field</span>
                  <span className="text-sm font-bold text-emerald-700">{uni.activeStudents} active</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <Users2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{uni.coordinatorName}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{uni.coordinatorEmail}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  GDPR Article 28 DPA Countersigned
                </span>
                <span className="text-slate-500">SE Asia Regional MoA Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: STUDENT PLACEMENTS */}
      {activeSubTab === 'placements' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Ref & Student</th>
                    <th className="py-3 px-4">University</th>
                    <th className="py-3 px-4">Host NGO & Country</th>
                    <th className="py-3 px-4">Dates & Stipend</th>
                    <th className="py-3 px-4">Risk Tier</th>
                    <th className="py-3 px-4">GDPR SCC Status</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {placements.map((plc) => (
                    <tr key={plc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{plc.studentName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{plc.reference} · {plc.nationality}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {plc.universityName}
                        <div className="text-[10px] text-slate-500">{plc.degreeProgram}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{plc.ngoName}</div>
                        <div className="text-[10px] text-slate-500">{plc.hostCountry}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px]">{plc.startDate} → {plc.endDate}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">${plc.stipendUSD}/mo</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          plc.riskTier === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                          plc.riskTier === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          Tier: {plc.riskTier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {plc.sccExecuted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Executed (Art. 46)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            SCC Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                          {plc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTER NGO WITH LIVE REGEX VALIDATION */}
      {isNgoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Register Regional NGO Partner</h3>
                <p className="text-[11px] text-slate-500">Inputs validated live against Python regex rules</p>
              </div>
              <button onClick={() => setIsNgoModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveNgo} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">NGO Operating Name</label>
                <input
                  type="text"
                  required
                  value={ngoForm.name}
                  onChange={(e) => setNgoForm({ ...ngoForm, name: e.target.value })}
                  placeholder="e.g. Tonle Sap Conservation Alliance"
                  className="w-full border rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Operating Country</label>
                  <select
                    value={ngoForm.country}
                    onChange={(e) => setNgoForm({ ...ngoForm, country: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs"
                  >
                    <option value="Cambodia">Cambodia</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="General">Other Jurisdiction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">City Location</label>
                  <input
                    type="text"
                    required
                    value={ngoForm.city}
                    onChange={(e) => setNgoForm({ ...ngoForm, city: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              {/* Registration Number with Live Regex Validation */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  National NGO Registration / Tax ID Number
                </label>
                <input
                  type="text"
                  required
                  value={ngoForm.registrationNumber}
                  onChange={(e) => setNgoForm({ ...ngoForm, registrationNumber: e.target.value })}
                  placeholder={
                    ngoForm.country === 'Cambodia' ? 'KH-MOI-2024-1234' :
                    ngoForm.country === 'Vietnam' ? 'VN-MOLISA-5678' :
                    ngoForm.country === 'United States' ? '12-3456789' : 'Registration ID'
                  }
                  className={`w-full border rounded-lg p-2 font-mono text-xs ${
                    ngoForm.registrationNumber && !ngoRegVal.isValid ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {ngoForm.registrationNumber && (
                  <div className={`text-[10px] mt-1 flex items-center gap-1 ${ngoRegVal.isValid ? 'text-emerald-600' : 'text-rose-600 font-medium'}`}>
                    {ngoRegVal.isValid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>{ngoRegVal.isValid ? 'Valid registration format' : ngoRegVal.message}</span>
                  </div>
                )}
              </div>

              {/* Email with Live RFC Regex Validation */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Official Contact Email</label>
                <input
                  type="email"
                  required
                  value={ngoForm.contactEmail}
                  onChange={(e) => setNgoForm({ ...ngoForm, contactEmail: e.target.value })}
                  placeholder="director@ngo-domain.org"
                  className={`w-full border rounded-lg p-2 text-xs ${
                    ngoForm.contactEmail && !ngoEmailVal.isValid ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {ngoForm.contactEmail && (
                  <div className={`text-[10px] mt-1 flex items-center gap-1 ${ngoEmailVal.isValid ? 'text-emerald-600' : 'text-rose-600 font-medium'}`}>
                    {ngoEmailVal.isValid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>{ngoEmailVal.isValid ? 'Valid RFC email address' : ngoEmailVal.message}</span>
                  </div>
                )}
              </div>

              {/* Phone with Live E.164 Regex Validation */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  International Phone (E.164 with Country Code)
                </label>
                <input
                  type="text"
                  required
                  value={ngoForm.phone}
                  onChange={(e) => setNgoForm({ ...ngoForm, phone: e.target.value })}
                  placeholder="+855 23 889 102"
                  className={`w-full border rounded-lg p-2 font-mono text-xs ${
                    ngoForm.phone && !ngoPhoneVal.isValid ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {ngoForm.phone && (
                  <div className={`text-[10px] mt-1 flex items-center gap-1 ${ngoPhoneVal.isValid ? 'text-emerald-600' : 'text-rose-600 font-medium'}`}>
                    {ngoPhoneVal.isValid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>{ngoPhoneVal.isValid ? 'Valid E.164 international format' : ngoPhoneVal.message}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Key Focus Area & Mission</label>
                <input
                  type="text"
                  required
                  value={ngoForm.focusArea}
                  onChange={(e) => setNgoForm({ ...ngoForm, focusArea: e.target.value })}
                  placeholder="e.g. Mangrove replanting & agroforestry"
                  className="w-full border rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNgoModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!ngoEmailVal.isValid || !ngoPhoneVal.isValid || !ngoRegVal.isValid}
                  className="bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg"
                >
                  Register NGO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD UNIVERSITY WITH DOMAIN REGEX */}
      {isUniModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add Partner University</h3>
                <p className="text-[11px] text-slate-500">Domain verified for accredited educational suffixes</p>
              </div>
              <button onClick={() => setIsUniModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveUni} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">University Name</label>
                <input
                  type="text"
                  required
                  value={uniForm.name}
                  onChange={(e) => setUniForm({ ...uniForm, name: e.target.value })}
                  placeholder="e.g. University of Edinburgh"
                  className="w-full border rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Institutional Domain Name</label>
                <input
                  type="text"
                  required
                  value={uniForm.domain}
                  onChange={(e) => setUniForm({ ...uniForm, domain: e.target.value })}
                  placeholder="ed.ac.uk or berkeley.edu"
                  className={`w-full border rounded-lg p-2 font-mono text-xs ${
                    uniForm.domain && !uniDomainVal.isValid ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {uniForm.domain && (
                  <div className={`text-[10px] mt-1 flex items-center gap-1 ${uniDomainVal.isValid ? 'text-emerald-600' : 'text-rose-600 font-medium'}`}>
                    {uniDomainVal.isValid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>{uniDomainVal.isValid ? 'Accredited academic domain' : uniDomainVal.message}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Coordinator Name</label>
                  <input
                    type="text"
                    required
                    value={uniForm.coordinatorName}
                    onChange={(e) => setUniForm({ ...uniForm, coordinatorName: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Coordinator Email</label>
                  <input
                    type="email"
                    required
                    value={uniForm.coordinatorEmail}
                    onChange={(e) => setUniForm({ ...uniForm, coordinatorEmail: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsUniModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uniDomainVal.isValid || !uniEmailVal.isValid}
                  className="bg-blue-600 disabled:opacity-50 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg"
                >
                  Save University
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: STUDENT PLACEMENT MATCH */}
      {isPlacementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Match Student with Vetted Regional NGO</h3>
                <p className="text-[11px] text-slate-500">Cross-border placement with GDPR compliance initiation</p>
              </div>
              <button onClick={() => setIsPlacementModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSavePlacement} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={placementForm.studentName}
                    onChange={(e) => setPlacementForm({ ...placementForm, studentName: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Student Email</label>
                  <input
                    type="email"
                    required
                    value={placementForm.studentEmail}
                    onChange={(e) => setPlacementForm({ ...placementForm, studentEmail: e.target.value })}
                    placeholder="jane.doe@ox.ac.uk"
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Sending University</label>
                  <select
                    value={placementForm.universityName}
                    onChange={(e) => setPlacementForm({ ...placementForm, universityName: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs"
                  >
                    {universities.map((u) => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Host Regional NGO</label>
                  <select
                    value={placementForm.ngoName}
                    onChange={(e) => setPlacementForm({ ...placementForm, ngoName: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs"
                  >
                    {ngos.map((n) => (
                      <option key={n.id} value={n.name}>{n.name} ({n.country})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Risk Tier</label>
                  <select
                    value={placementForm.riskTier}
                    onChange={(e) => setPlacementForm({ ...placementForm, riskTier: e.target.value as any })}
                    className="w-full border rounded-lg p-2 text-xs font-semibold"
                  >
                    <option value="LOW">Low Risk</option>
                    <option value="MEDIUM">Medium Risk</option>
                    <option value="HIGH">High Risk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Monthly Stipend (USD)</label>
                  <input
                    type="number"
                    value={placementForm.stipendUSD}
                    onChange={(e) => setPlacementForm({ ...placementForm, stipendUSD: Number(e.target.value) })}
                    className="w-full border rounded-lg p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Host Country</label>
                  <input
                    type="text"
                    value={placementForm.hostCountry}
                    onChange={(e) => setPlacementForm({ ...placementForm, hostCountry: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsPlacementModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg"
                >
                  Create Match & Trigger SCC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
