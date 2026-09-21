import React, { useState } from 'react';
import { WorkflowInfo, TeamMember } from '../types';
import { X, BookOpen, Layers, User, MapPin, Edit3, Check, Sparkles, Sliders, Shield } from 'lucide-react';

interface ProjectScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WorkflowInfo;
  onUpdateProjectScope?: (updatedProject: WorkflowInfo) => void;
  teamMembers: TeamMember[];
}

export const ProjectScopeModal: React.FC<ProjectScopeModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProjectScope,
  teamMembers,
}) => {
  if (!isOpen) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [scopeOfWork, setScopeOfWork] = useState(project.scopeOfWork);
  const [shortDesc, setShortDesc] = useState(project.shortDesc);
  const [pillars, setPillars] = useState<string[]>(project.corePillars || []);
  const [newPillar, setNewPillar] = useState('');
  const [field1, setField1] = useState(project.customFieldLabels?.field1 || 'Custom Field 1');
  const [field2, setField2] = useState(project.customFieldLabels?.field2 || 'Custom Field 2');
  const [field3, setField3] = useState(project.customFieldLabels?.field3 || 'Custom Field 3');

  const projectMembers = teamMembers.filter((m) => m.workflowSpecialty === project.code);

  const handleSave = () => {
    if (onUpdateProjectScope) {
      onUpdateProjectScope({
        ...project,
        scopeOfWork,
        shortDesc,
        corePillars: pillars,
        customFieldLabels: {
          field1,
          field2,
          field3,
        },
      });
    }
    setIsEditing(false);
  };

  const handleAddPillar = () => {
    if (newPillar.trim() && !pillars.includes(newPillar.trim())) {
      setPillars([...pillars, newPillar.trim()]);
      setNewPillar('');
    }
  };

  const handleRemovePillar = (index: number) => {
    setPillars(pillars.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto text-xs">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-sm">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Project Scope & SOP Specification
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Asana Tailored
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">{project.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                id="btn-edit-scope"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Customize Scope</span>
              </button>
            ) : (
              <button
                id="btn-save-scope"
                onClick={handleSave}
                className="flex items-center gap-1 text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-lg font-semibold shadow-sm transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Scope</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Meta Info Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Lead Consultant</div>
              <div className="font-semibold text-slate-900 text-xs">{project.leadConsultant}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Operational Geographic Scope</div>
              <div className="font-semibold text-slate-900 text-xs">{project.region}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Governance Standard</div>
              <div className="font-semibold text-slate-900 text-xs">Northstar Standard Protocol</div>
            </div>
          </div>
        </div>

        {/* Verbatim Scope of Work */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Project Scope of Work & Mandate</span>
            </h3>
            {isEditing && <span className="text-[10px] text-slate-400">Editing scope definition</span>}
          </div>

          {!isEditing ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 leading-relaxed text-xs">
              <p className="font-medium text-slate-800 mb-2">{project.shortDesc}</p>
              <p className="text-slate-600 italic">"{project.scopeOfWork}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Executive Summary / Short Scope</label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Detailed Operational Scope of Work</label>
                <textarea
                  rows={4}
                  value={scopeOfWork}
                  onChange={(e) => setScopeOfWork(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Core Pillars / Focus Areas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Core Operational Pillars & Deliverables</span>
            </h3>
            <span className="text-[10px] text-slate-400">{pillars.length} pillars defined</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-[11px]">{pillar}</span>
                </div>
                {isEditing && (
                  <button
                    onClick={() => handleRemovePillar(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add new operational pillar..."
                value={newPillar}
                onChange={(e) => setNewPillar(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPillar()}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddPillar}
                className="px-3 py-1.5 bg-slate-900 text-white font-medium rounded-lg text-xs hover:bg-slate-800 cursor-pointer"
              >
                Add Pillar
              </button>
            </div>
          )}
        </div>

        {/* Asana Custom Fields Configuration */}
        <div className="space-y-2 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Project Custom Fields (Asana View Columns)</span>
            </h3>
            <span className="text-[10px] text-slate-400">Tailored to project scope</span>
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-purple-50/50 border border-purple-200 rounded-lg p-2.5">
                <div className="text-[10px] text-purple-700 font-bold uppercase">Field 1</div>
                <div className="font-semibold text-slate-900 mt-0.5 text-xs">{project.customFieldLabels?.field1 || 'Field 1'}</div>
              </div>
              <div className="bg-purple-50/50 border border-purple-200 rounded-lg p-2.5">
                <div className="text-[10px] text-purple-700 font-bold uppercase">Field 2</div>
                <div className="font-semibold text-slate-900 mt-0.5 text-xs">{project.customFieldLabels?.field2 || 'Field 2'}</div>
              </div>
              <div className="bg-purple-50/50 border border-purple-200 rounded-lg p-2.5">
                <div className="text-[10px] text-purple-700 font-bold uppercase">Field 3</div>
                <div className="font-semibold text-slate-900 mt-0.5 text-xs">{project.customFieldLabels?.field3 || 'Field 3'}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Custom Field 1 Label</label>
                <input
                  type="text"
                  value={field1}
                  onChange={(e) => setField1(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Custom Field 2 Label</label>
                <input
                  type="text"
                  value={field2}
                  onChange={(e) => setField2(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Custom Field 3 Label</label>
                <input
                  type="text"
                  value={field3}
                  onChange={(e) => setField3(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Assigned Project Team Members */}
        {projectMembers.length > 0 && (
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <h4 className="font-bold text-slate-800 text-xs">Assigned Operational Team Members</h4>
            <div className="flex flex-wrap gap-2">
              {projectMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                    {member.name.slice(0, 1)}
                  </div>
                  <div>
                    <span className="font-medium text-slate-800">{member.name}</span>
                    <span className="text-[10px] text-slate-500 ml-1">({member.city})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close button */}
        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
          >
            Close Scope Overview
          </button>
        </div>
      </div>
    </div>
  );
};
