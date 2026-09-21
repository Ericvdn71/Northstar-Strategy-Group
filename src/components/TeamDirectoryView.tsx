import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Shield, 
  Clock, 
  Save, 
  X, 
  AlertTriangle, 
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import { TeamMember, RegionalTimeZoneConfig, UserRole, WorkflowType } from '../types';

interface TeamDirectoryViewProps {
  teamMembers: TeamMember[];
  timeZones: RegionalTimeZoneConfig[];
  onAddMember: (member: TeamMember) => void;
  onUpdateMember: (member: TeamMember) => void;
  onDeleteMember: (memberId: string) => void;
  onResetToDefaults?: () => void;
  onSelectMember?: (member: TeamMember) => void;
  initialZoneKey?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const TeamDirectoryView: React.FC<TeamDirectoryViewProps> = ({
  teamMembers,
  timeZones,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onResetToDefaults,
  onSelectMember,
  initialZoneKey = 'ALL',
  isModal = false,
  onClose,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>(initialZoneKey);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('ALL');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Sub-modal states
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteMemberTarget, setDeleteMemberTarget] = useState<TeamMember | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form states
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRoleTitle, setMemberRoleTitle] = useState('');
  const [memberUserRole, setMemberUserRole] = useState<UserRole>('INTERNAL_CONSULTANT');
  const [memberTimeZone, setMemberTimeZone] = useState('');
  const [memberCity, setMemberCity] = useState('');
  const [memberCountry, setMemberCountry] = useState('');
  const [memberWorkflow, setMemberWorkflow] = useState<WorkflowType>('ENVIRONMENTAL_DEV');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberBio, setMemberBio] = useState('');
  const [memberFormError, setMemberFormError] = useState('');

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute 24h military time
  const getZoneTime = (offsetHours: number) => {
    const utc = currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
    const targetDate = new Date(utc + 3600000 * offsetHours);
    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');
    const seconds = String(targetDate.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const isBusinessHours = (offsetHours: number) => {
    const utc = currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
    const targetDate = new Date(utc + 3600000 * offsetHours);
    const hour = targetDate.getHours();
    return hour >= 8 && hour < 18;
  };

  // Open create member modal
  const handleOpenCreateMember = () => {
    setEditingMember(null);
    setMemberName('');
    setMemberEmail('');
    setMemberRoleTitle('');
    setMemberUserRole('INTERNAL_CONSULTANT');
    setMemberTimeZone(timeZones[0]?.key || 'INDOCHINA');
    setMemberCity('');
    setMemberCountry('');
    setMemberWorkflow('ENVIRONMENTAL_DEV');
    setMemberPhone('');
    setMemberBio('');
    setMemberFormError('');
    setMemberModalOpen(true);
  };

  // Open edit member modal
  const handleOpenEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setMemberName(member.name);
    setMemberEmail(member.email);
    setMemberRoleTitle(member.roleTitle);
    setMemberUserRole(member.userRole);
    setMemberTimeZone(member.timeZone);
    setMemberCity(member.city);
    setMemberCountry(member.country);
    setMemberWorkflow(member.workflowSpecialty);
    setMemberPhone(member.phone);
    setMemberBio(member.bio);
    setMemberFormError('');
    setMemberModalOpen(true);
  };

  // Save member (create or update)
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim() || !memberRoleTitle.trim()) {
      setMemberFormError('Please enter member name, corporate email, and primary role title.');
      return;
    }

    const assignedTzConfig = timeZones.find(tz => tz.key === memberTimeZone) || timeZones[0];
    const tzLabel = assignedTzConfig ? `${assignedTzConfig.name} (${assignedTzConfig.offsetDisplay})` : memberTimeZone;
    const utcOffset = assignedTzConfig ? assignedTzConfig.offsetDisplay : '+0';

    if (editingMember) {
      const updated: TeamMember = {
        ...editingMember,
        name: memberName.trim(),
        email: memberEmail.trim(),
        roleTitle: memberRoleTitle.trim(),
        userRole: memberUserRole,
        timeZone: memberTimeZone,
        timeZoneLabel: tzLabel,
        utcOffset: utcOffset,
        city: memberCity.trim() || 'Global Office',
        country: memberCountry.trim() || 'International',
        workflowSpecialty: memberWorkflow,
        phone: memberPhone.trim(),
        bio: memberBio.trim(),
      };
      onUpdateMember(updated);
    } else {
      const newMember: TeamMember = {
        id: `tm_${Date.now()}`,
        name: memberName.trim(),
        email: memberEmail.trim(),
        roleTitle: memberRoleTitle.trim(),
        userRole: memberUserRole,
        timeZone: memberTimeZone,
        timeZoneLabel: tzLabel,
        utcOffset: utcOffset,
        city: memberCity.trim() || 'Global Office',
        country: memberCountry.trim() || 'International',
        workflowSpecialty: memberWorkflow,
        phone: memberPhone.trim(),
        bio: memberBio.trim(),
      };
      onAddMember(newMember);
    }

    setMemberModalOpen(false);
  };

  // Filter team members
  const filteredMembers = teamMembers.filter((member) => {
    const matchesZone = selectedZone === 'ALL' || member.timeZone === selectedZone;
    const matchesRole = selectedRole === 'ALL' || member.userRole === selectedRole;
    const matchesWorkflow = selectedWorkflow === 'ALL' || member.workflowSpecialty === selectedWorkflow;
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesZone && matchesRole && matchesWorkflow && matchesSearch;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'INTERNAL_CONSULTANT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
            Internal Consultant
          </span>
        );
      case 'UNIVERSITY_COORDINATOR':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-700/60">
            University Coordinator
          </span>
        );
      case 'LOCAL_PARTNER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-950 text-teal-300 border border-teal-700/60">
            Local Regional Partner
          </span>
        );
    }
  };

  const getWorkflowBadge = (wf: WorkflowType) => {
    switch (wf) {
      case 'ENVIRONMENTAL_DEV':
        return <span className="text-[10px] text-emerald-400 font-medium">🌱 Environmental Dev</span>;
      case 'SOCIAL_DEV':
        return <span className="text-[10px] text-sky-400 font-medium">🎓 Social Dev & Placements</span>;
      case 'FUNDRAISING_ADVISORY':
        return <span className="text-[10px] text-amber-400 font-medium">💰 Bilateral Fundraising</span>;
    }
  };

  return (
    <div className={`flex flex-col bg-slate-900 text-white ${isModal ? 'h-full max-h-[88vh]' : 'min-h-[calc(100vh-120px)]'}`}>
      
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-950/50">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Team Directory
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                {teamMembers.length} Active Specialists
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage operational personnel, customize role scopes, review technical specialties, and track active local hours.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateMember}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Specialist</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors ml-1"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium">Zone Filter:</span>
          <button
            onClick={() => setSelectedZone('ALL')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              selectedZone === 'ALL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Zones ({teamMembers.length})
          </button>
          {timeZones.map((tz) => {
            const count = teamMembers.filter(m => m.timeZone === tz.key).length;
            return (
              <button
                key={tz.key}
                onClick={() => setSelectedZone(tz.key)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedZone === tz.key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tz.shortCode} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-sm ml-auto">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, role, city, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Main Members Grid */}
      <div className="p-5 overflow-y-auto flex-1 space-y-4">
        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No team members match your criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting a different time zone filter or clearing your search query.</p>
            <button
              onClick={() => { setSelectedZone('ALL'); setSearchQuery(''); }}
              className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => {
              const tzConfig = timeZones.find(z => z.key === member.timeZone);
              const localTime = tzConfig ? getZoneTime(tzConfig.utcOffset) : '--:--:--';
              const inBusiness = tzConfig ? isBusinessHours(tzConfig.utcOffset) : false;

              return (
                <div
                  key={member.id}
                  className="bg-slate-850 border border-slate-750 hover:border-emerald-500/50 rounded-xl p-4 transition-all duration-150 flex flex-col justify-between shadow-sm group"
                >
                  <div>
                    {/* Top Row: Avatar, Name & Actions */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold flex items-center justify-center text-sm shadow-md">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                            {member.name}
                          </h4>
                          <p className="text-xs text-slate-300 font-medium">
                            {member.roleTitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditMember(member)}
                          title="Edit member profile"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 text-slate-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteMemberTarget(member)}
                          title="Remove from directory"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Roles & Specialty Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {getRoleBadge(member.userRole)}
                      {getWorkflowBadge(member.workflowSpecialty)}
                    </div>

                    {/* Time Zone & Local Clock Row */}
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 mb-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1 font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full ${inBusiness ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                          <span>{member.timeZoneLabel}</span>
                        </span>
                        <div className="flex items-center gap-1 font-mono font-semibold text-emerald-300 text-xs">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          <span>{localTime}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{member.city}, {member.country}</span>
                        </span>
                        <span className={inBusiness ? 'text-emerald-400' : 'text-slate-500'}>
                          {inBusiness ? 'Working Hours' : 'Off-Duty'}
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    {member.bio && (
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3 line-clamp-2" title={member.bio}>
                        "{member.bio}"
                      </p>
                    )}
                  </div>

                  {/* Footer Contacts */}
                  <div className="pt-2.5 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 transition-colors truncate max-w-[160px]"
                      title={member.email}
                    >
                      <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </a>

                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
                        title={member.phone}
                      >
                        <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{member.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span>{filteredMembers.length} of {teamMembers.length} team members displayed.</span>
          {onResetToDefaults && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1 underline text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Team to Defaults
            </button>
          )}
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Directory
          </button>
        )}
      </div>

      {/* SUB-MODAL: Add / Edit Team Member */}
      {memberModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl text-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  {editingMember ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingMember ? `Customize Profile: ${editingMember.name}` : 'Add New Team Specialist'}
                </h3>
              </div>
              <button
                onClick={() => setMemberModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {memberFormError && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-700/80 text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{memberFormError}</span>
                </div>
              )}

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sokha Chen"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@northstar-sg.com"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Role Title & System Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Role Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Environmental Consultant"
                    value={memberRoleTitle}
                    onChange={(e) => setMemberRoleTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    System RBAC Role
                  </label>
                  <select
                    value={memberUserRole}
                    onChange={(e) => setMemberUserRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="INTERNAL_CONSULTANT">Internal Consultant (Full Access)</option>
                    <option value="UNIVERSITY_COORDINATOR">University Coordinator (Placement Scope)</option>
                    <option value="LOCAL_PARTNER">Local Regional Partner (Task Progress Scope)</option>
                  </select>
                </div>
              </div>

              {/* Regional Time Zone & Workflow Specialty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Assigned Regional Time Zone <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={memberTimeZone}
                    onChange={(e) => setMemberTimeZone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    {timeZones.map((tz) => (
                      <option key={tz.key} value={tz.key}>
                        {tz.name} ({tz.shortCode}, {tz.offsetDisplay})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Workflow Specialty
                  </label>
                  <select
                    value={memberWorkflow}
                    onChange={(e) => setMemberWorkflow(e.target.value as WorkflowType)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="ENVIRONMENTAL_DEV">🌱 Environmental & Conservation Dev</option>
                    <option value="SOCIAL_DEV">🎓 Social Dev & Academic Internships</option>
                    <option value="FUNDRAISING_ADVISORY">💰 Bilateral Fundraising & NGO Grants</option>
                  </select>
                </div>
              </div>

              {/* Location & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">City / Base</label>
                  <input
                    type="text"
                    placeholder="e.g. Phnom Penh"
                    value={memberCity}
                    onChange={(e) => setMemberCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. Cambodia"
                    value={memberCountry}
                    onChange={(e) => setMemberCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone (International)</label>
                  <input
                    type="text"
                    placeholder="+855 23 889 102"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Bio & Responsibilities */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Professional Bio & Technical Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe regional field experience, due diligence focus, and technical responsibilities..."
                  value={memberBio}
                  onChange={(e) => setMemberBio(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMemberModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingMember ? 'Save Changes' : 'Create Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION: Delete Member */}
      {deleteMemberTarget && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-800 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Remove Team Member?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Are you sure you want to remove <strong className="text-white">{deleteMemberTarget.name}</strong> ({deleteMemberTarget.roleTitle}) from the operational team directory?
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteMemberTarget(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteMember(deleteMemberTarget.id);
                  setDeleteMemberTarget(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION: Reset Defaults */}
      {showResetConfirm && onResetToDefaults && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-amber-700 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <RotateCcw className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Reset Team to Defaults?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This will restore the original 8 core specialists (Ye Khaung Htet, Nathan Sims, Anna Anufrikova, Finn Chapman, Harvey Young, Eric Vadan, Benicio Franqui, Sovanthep Sous).
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetToDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
