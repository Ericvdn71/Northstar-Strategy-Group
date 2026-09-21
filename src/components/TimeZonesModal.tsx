import React from 'react';
import { RegionalTimeZoneConfig, TeamMember } from '../types';
import { TimeZonesView } from './TimeZonesView';

interface TimeZonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeZones: RegionalTimeZoneConfig[];
  teamMembers: TeamMember[];
  onAddTimeZone: (timeZone: RegionalTimeZoneConfig) => void;
  onUpdateTimeZone: (timeZone: RegionalTimeZoneConfig) => void;
  onDeleteTimeZone: (timeZoneKey: string) => void;
  onResetToDefaults?: () => void;
}

export const TimeZonesModal: React.FC<TimeZonesModalProps> = ({
  isOpen,
  onClose,
  timeZones,
  teamMembers,
  onAddTimeZone,
  onUpdateTimeZone,
  onDeleteTimeZone,
  onResetToDefaults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl text-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <TimeZonesView
          timeZones={timeZones}
          teamMembers={teamMembers}
          onAddTimeZone={onAddTimeZone}
          onUpdateTimeZone={onUpdateTimeZone}
          onDeleteTimeZone={onDeleteTimeZone}
          onResetToDefaults={onResetToDefaults}
          isModal={true}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
