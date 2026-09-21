import React, { useState, useEffect } from 'react';
import { UserRole, RegionalTimeZoneConfig, NavigationTab } from '../types';
import { MOCK_USERS } from '../data/initialData';
import { 
  Compass, 
  Layers, 
  Users, 
  AlertTriangle, 
  FileCode2, 
  ShieldCheck,
  UserCheck,
  Clock,
  FileText,
  HelpCircle,
  ExternalLink,
  Settings2,
  Plus,
  Globe
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  criticalIncidentCount: number;
  onOpenTeamModal: (initialZoneKey?: string) => void;
  onOpenTimeZonesModal: (initialZoneKey?: string) => void;
  onOpenGuideModal: () => void;
  timeZones: RegionalTimeZoneConfig[];
  teamMemberCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  criticalIncidentCount,
  onOpenTeamModal,
  onOpenTimeZonesModal,
  onOpenGuideModal,
  timeZones,
  teamMemberCount,
}) => {
  const currentUser = MOCK_USERS[currentRole];
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live 24h military clock string (HH:mm:ss) for a given UTC offset
  const formatZoneMilitaryTime = (offsetHours: number) => {
    const utc = currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
    const d = new Date(utc + 3600000 * offsetHours);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const isZoneActive = (offsetHours: number) => {
    const utc = currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
    const d = new Date(utc + 3600000 * offsetHours);
    const hour = d.getHours();
    return hour >= 8 && hour < 18;
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Brand Header & Persona Selector */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                Northstar Strategy Group
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Enterprise PM & CRM
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sustainability & Environmental Development · Relational CRM · Safeguarding Matrix
            </p>
          </div>
        </div>

        {/* Persona Selector */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">{currentUser.name}</div>
            <div className="text-[11px] text-slate-400">{currentUser.organization}</div>
          </div>

          <div className="relative">
            <select
              id="rbac-role-selector"
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              aria-label="Active Persona Role Selector"
              className="appearance-none bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-inner"
            >
              <option value="INTERNAL_CONSULTANT">Internal Consultant (Northstar Senior)</option>
              <option value="UNIVERSITY_COORDINATOR">University Coordinator (Oxford / External)</option>
              <option value="LOCAL_PARTNER">Local Regional Partner (Mekong NGO Field Lead)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Clocks & Actions Bar */}
      <div className="px-4 sm:px-6 py-2 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Live Clocks:
          </span>

          {timeZones.map((tz) => {
            const active = isZoneActive(tz.utcOffset);
            const militaryTime = formatZoneMilitaryTime(tz.utcOffset);
            return (
              <button
                key={tz.key}
                onClick={() => onOpenTimeZonesModal(tz.key)}
                title={`${tz.name} (${tz.shortCode}, ${tz.offsetDisplay}) — Live time: ${militaryTime}. Click to configure or view overlapping business hours.`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all border cursor-pointer ${
                  active
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/60'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className="font-semibold text-slate-300">{tz.shortCode}:</span>
                <span className="font-mono text-emerald-400">{militaryTime}</span>
                <span className="text-[10px] text-slate-500">({tz.offsetDisplay})</span>
              </button>
            );
          })}

          {timeZones.length === 0 && (
            <button
              onClick={() => onOpenTimeZonesModal()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-dashed border-slate-700 text-xs text-slate-400 hover:text-slate-200"
            >
              <Plus className="w-3 h-3" />
              Add Time Zone
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-nav-team-directory"
            onClick={() => onOpenTeamModal()}
            title="Open Team Directory to manage specialists, profiles, and roles"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium text-xs shadow-sm transition-all cursor-pointer border border-emerald-500/30"
          >
            <Users className="w-3.5 h-3.5 text-emerald-200" />
            <span>Team Directory</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold">
              {teamMemberCount}
            </span>
          </button>

          <button
            id="btn-nav-timezones-manager"
            onClick={() => onOpenTimeZonesModal()}
            title="Open Regional Time Zones Manager to configure clocks and coverage"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs transition-all cursor-pointer border border-slate-700"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Time Zones</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-300 text-[10px] font-bold">
              {timeZones.length}
            </span>
          </button>

          <button
            onClick={onOpenGuideModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs transition-all cursor-pointer border border-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">User Guide</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="px-4 sm:px-6 bg-slate-900 border-b border-slate-800 overflow-x-auto">
        <nav className="flex items-center gap-1 min-w-max py-2">
          <button
            id="nav-tab-tasks"
            onClick={() => onTabChange('tasks')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Workflows & Tasks</span>
          </button>

          <button
            id="nav-tab-crm"
            onClick={() => onTabChange('crm')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'crm'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Relational CRM</span>
          </button>

          <button
            id="nav-tab-risks"
            onClick={() => onTabChange('risks')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative cursor-pointer ${
              activeTab === 'risks'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Duty of Care</span>
            {criticalIncidentCount > 0 && (
              <span className="flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                {criticalIncidentCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-compliance"
            onClick={() => onTabChange('compliance')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'compliance'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>SCC Compliance</span>
          </button>

          {/* Dedicated Tab 1: Team Directory */}
          <button
            id="nav-tab-team"
            onClick={() => onTabChange('team')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'team'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Directory</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'team' ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-800 text-slate-400'
            }`}>
              {teamMemberCount}
            </span>
          </button>

          {/* Dedicated Tab 2: Regional Time Zones */}
          <button
            id="nav-tab-timezones"
            onClick={() => onTabChange('timezones')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'timezones'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Time Zones</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'timezones' ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-800 text-slate-400'
            }`}>
              {timeZones.length}
            </span>
          </button>

          <button
            id="nav-tab-deliverables"
            onClick={() => onTabChange('deliverables')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'deliverables'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span className="hidden sm:inline">Schema & API Code</span>
            <span className="sm:hidden">Deliverables</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
