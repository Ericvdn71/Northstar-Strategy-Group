import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Edit2, 
  Trash2, 
  Globe, 
  MapPin, 
  RotateCcw, 
  Save, 
  X, 
  AlertTriangle,
  Users,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { RegionalTimeZoneConfig, TeamMember } from '../types';

interface TimeZonesViewProps {
  timeZones: RegionalTimeZoneConfig[];
  teamMembers: TeamMember[];
  onAddTimeZone: (timeZone: RegionalTimeZoneConfig) => void;
  onUpdateTimeZone: (timeZone: RegionalTimeZoneConfig) => void;
  onDeleteTimeZone: (timeZoneKey: string) => void;
  onResetToDefaults?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const TimeZonesView: React.FC<TimeZonesViewProps> = ({
  timeZones,
  teamMembers,
  onAddTimeZone,
  onUpdateTimeZone,
  onDeleteTimeZone,
  onResetToDefaults,
  isModal = false,
  onClose,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form states
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<RegionalTimeZoneConfig | null>(null);
  const [deleteZoneTarget, setDeleteZoneTarget] = useState<RegionalTimeZoneConfig | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [zoneKey, setZoneKey] = useState('');
  const [zoneName, setZoneName] = useState('');
  const [zoneShortCode, setZoneShortCode] = useState('');
  const [zoneUtcOffset, setZoneUtcOffset] = useState<number>(0);
  const [zoneCoverage, setZoneCoverage] = useState('');
  const [zoneLocations, setZoneLocations] = useState('');
  const [zoneFormError, setZoneFormError] = useState('');

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format 24h military time
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

  // Open create zone
  const handleOpenCreateZone = () => {
    setEditingZone(null);
    setZoneKey(`TZ_${Date.now()}`);
    setZoneName('');
    setZoneShortCode('');
    setZoneUtcOffset(0);
    setZoneCoverage('');
    setZoneLocations('');
    setZoneFormError('');
    setZoneModalOpen(true);
  };

  // Open edit zone
  const handleOpenEditZone = (tz: RegionalTimeZoneConfig) => {
    setEditingZone(tz);
    setZoneKey(tz.key);
    setZoneName(tz.name);
    setZoneShortCode(tz.shortCode);
    setZoneUtcOffset(tz.utcOffset);
    setZoneCoverage(tz.coverageCountries);
    setZoneLocations(tz.primaryLocations);
    setZoneFormError('');
    setZoneModalOpen(true);
  };

  // Save zone
  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim() || !zoneShortCode.trim()) {
      setZoneFormError('Please enter both a display name and a short code for the time zone.');
      return;
    }

    const offsetDisplay = zoneUtcOffset >= 0 ? `UTC+${zoneUtcOffset}` : `UTC${zoneUtcOffset}`;

    if (editingZone) {
      const updated: RegionalTimeZoneConfig = {
        ...editingZone,
        name: zoneName.trim(),
        shortCode: zoneShortCode.trim().toUpperCase(),
        utcOffset: zoneUtcOffset,
        offsetDisplay: offsetDisplay,
        coverageCountries: zoneCoverage.trim() || 'Global coverage',
        primaryLocations: zoneLocations.trim() || 'International Hubs',
      };
      onUpdateTimeZone(updated);
    } else {
      const generatedKey = zoneShortCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_');
      const uniqueKey = timeZones.some(z => z.key === generatedKey) 
        ? `${generatedKey}_${Date.now()}` 
        : generatedKey;

      const newZone: RegionalTimeZoneConfig = {
        key: uniqueKey,
        name: zoneName.trim(),
        shortCode: zoneShortCode.trim().toUpperCase(),
        utcOffset: zoneUtcOffset,
        offsetDisplay: offsetDisplay,
        coverageCountries: zoneCoverage.trim() || 'Global coverage',
        primaryLocations: zoneLocations.trim() || 'International Hubs',
      };
      onAddTimeZone(newZone);
    }

    setZoneModalOpen(false);
  };

  return (
    <div className={`flex flex-col bg-slate-900 text-white ${isModal ? 'h-full max-h-[88vh]' : 'min-h-[calc(100vh-120px)]'}`}>
      
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-sky-950/50">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Regional Time Zones Manager
              </h2>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800/80">
                {timeZones.length} Configured Zones
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Synchronize digital 24-hour clocks on the top bar, monitor duty-of-care work hours (08:00–18:00), and manage regional hubs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateZone}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Time Zone</span>
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

      {/* Main Grid */}
      <div className="p-5 overflow-y-auto flex-1 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeZones.map((tz) => {
            const assignedCount = teamMembers.filter(m => m.timeZone === tz.key).length;
            const liveTime = getZoneTime(tz.utcOffset);
            const inWork = isBusinessHours(tz.utcOffset);

            return (
              <div
                key={tz.key}
                className="bg-slate-850 border border-slate-750 hover:border-sky-500/50 rounded-xl p-4 flex flex-col justify-between transition-all duration-150 shadow-sm group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          {inWork && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          )}
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${inWork ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        </span>
                        <h4 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
                          {tz.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-xs">
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {tz.shortCode}
                        </span>
                        <span className="font-mono text-emerald-400 font-bold text-xs">
                          {tz.offsetDisplay}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({tz.utcOffset >= 0 ? `+${tz.utcOffset}` : tz.utcOffset} hrs UTC)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditZone(tz)}
                        title="Edit time zone details"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-950 text-slate-400 hover:text-sky-300 border border-slate-700 hover:border-sky-600 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteZoneTarget(tz)}
                        title="Delete time zone"
                        disabled={timeZones.length <= 1}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          timeZones.length <= 1
                            ? 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-600'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Live Clock Display */}
                  <div className="bg-slate-900/90 rounded-lg p-3 my-3 border border-slate-800 text-center">
                    <div className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider mb-0.5">
                      Live Regional Clock
                    </div>
                    <div className="font-mono text-xl font-bold text-emerald-400 tracking-wider">
                      {liveTime}
                    </div>
                    <div className={`text-[10px] mt-1 font-semibold ${inWork ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {inWork ? '● Active Business Hours (08:00 – 18:00)' : '○ Overnight / Off-Duty'}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Primary Hubs:</span>
                      <p className="text-slate-300 text-xs flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{tz.primaryLocations}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Coverage:</span>
                      <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{tz.coverageCountries}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assigned Team */}
                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span>Assigned Specialists:</span>
                  </span>
                  <span className="font-semibold text-emerald-400">
                    {assignedCount} {assignedCount === 1 ? 'person' : 'people'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span>Operational time zones are continuously synchronized with UTC.</span>
          {onResetToDefaults && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1 underline text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Time Zones to Defaults
            </button>
          )}
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Manager
          </button>
        )}
      </div>

      {/* SUB-MODAL: Add / Edit Time Zone Form */}
      {zoneModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg text-white shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600/30 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingZone ? `Edit Time Zone: ${editingZone.name}` : 'Configure New Regional Time Zone'}
                </h3>
              </div>
              <button
                onClick={() => setZoneModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="p-5 space-y-4 text-xs">
              {zoneFormError && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-700/80 text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{zoneFormError}</span>
                </div>
              )}

              {/* Time Zone Display Name */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Time Zone Display Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Japan Standard Time, Central European Time"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Short Code & UTC Offset */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Short Code (e.g. JST, CET, AEST) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JST"
                    value={zoneShortCode}
                    onChange={(e) => setZoneShortCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white uppercase placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    UTC Offset Hours (-12 to +14) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="-12"
                    max="14"
                    required
                    placeholder="e.g. 9 or -4"
                    value={zoneUtcOffset}
                    onChange={(e) => setZoneUtcOffset(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Resulting display: UTC{zoneUtcOffset >= 0 ? `+${zoneUtcOffset}` : zoneUtcOffset}
                  </span>
                </div>
              </div>

              {/* Primary Locations / Hubs */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Primary Hubs / Cities
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tokyo, Osaka, Seoul"
                  value={zoneLocations}
                  onChange={(e) => setZoneLocations(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Coverage Countries */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Coverage Countries
                </label>
                <input
                  type="text"
                  placeholder="e.g. Japan, South Korea"
                  value={zoneCoverage}
                  onChange={(e) => setZoneCoverage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setZoneModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingZone ? 'Update Zone' : 'Add Time Zone'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION: Delete Time Zone */}
      {deleteZoneTarget && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-800 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Delete Time Zone?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-2">
              Are you sure you want to delete the time zone <strong className="text-white">{deleteZoneTarget.name}</strong> ({deleteZoneTarget.shortCode})?
            </p>
            <p className="text-[11px] text-amber-400 mb-4 bg-amber-950/60 p-2 rounded border border-amber-800/80">
              Any team members currently assigned to this time zone will automatically be reassigned to the default active time zone.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteZoneTarget(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteTimeZone(deleteZoneTarget.key);
                  setDeleteZoneTarget(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md"
              >
                Confirm Delete
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
              <h3 className="font-bold text-base text-white">Reset Time Zones to Defaults?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This will restore the 3 default operational time zones: Indochina Time (ICT, UTC+7), British/European Summer Time (GMT+1, UTC+1), and Eastern Daylight Time (EDT, UTC-4).
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
