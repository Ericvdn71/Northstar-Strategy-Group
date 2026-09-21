import React from 'react';
import { TeamMember, RegionalTimeZoneConfig } from '../types';
import { TeamDirectoryView } from './TeamDirectoryView';

interface TeamDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  timeZones: RegionalTimeZoneConfig[];
  onAddMember: (member: TeamMember) => void;
  onUpdateMember: (member: TeamMember) => void;
  onDeleteMember: (memberId: string) => void;
  onAddTimeZone?: (timeZone: RegionalTimeZoneConfig) => void;
  onUpdateTimeZone?: (timeZone: RegionalTimeZoneConfig) => void;
  onDeleteTimeZone?: (timeZoneKey: string) => void;
  onResetToDefaults?: () => void;
  initialZoneKey?: string;
  onSelectMember?: (member: TeamMember) => void;
}

export const TeamDirectoryModal: React.FC<TeamDirectoryModalProps> = ({
  isOpen,
  onClose,
  teamMembers,
  timeZones,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onResetToDefaults,
  initialZoneKey = 'ALL',
  onSelectMember,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl text-white shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <TeamDirectoryView
          teamMembers={teamMembers}
          timeZones={timeZones}
          onAddMember={onAddMember}
          onUpdateMember={onUpdateMember}
          onDeleteMember={onDeleteMember}
          onResetToDefaults={onResetToDefaults}
          initialZoneKey={initialZoneKey}
          onSelectMember={onSelectMember}
          isModal={true}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
