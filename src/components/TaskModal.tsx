import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, WorkflowType, UserRole, TeamMember, RegionalTimeZoneConfig } from '../types';
import { 
  X, 
  CheckSquare, 
  Square, 
  Plus, 
  Link2, 
  ShieldCheck, 
  Calendar, 
  User, 
  Coins, 
  AlertCircle,
  Clock,
  Globe,
  Sliders,
  Sparkles
} from 'lucide-react';
import { TEAM_MEMBERS } from '../data/initialData';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (updatedTask: Task) => void;
  allTasks: Task[];
  currentUserRole: UserRole;
  teamMembers?: TeamMember[];
  timeZones?: RegionalTimeZoneConfig[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSaveTask,
  allTasks,
  currentUserRole,
  teamMembers = TEAM_MEMBERS,
  timeZones,
}) => {
  if (!isOpen || !task) return null;

  const activeMembers = teamMembers.length > 0 ? teamMembers : TEAM_MEMBERS;
  const [formData, setFormData] = useState<Task>({ ...task });
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');

  const handleToggleSubtask = (subtaskId: string) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
      ),
    }));
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      isCompleted: false,
    };
    setFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, newSub],
    }));
    setNewSubtaskTitle('');
  };

  const handleToggleChecklist = (checkId: string) => {
    setFormData((prev) => ({
      ...prev,
      dueDiligenceChecklist: (prev.dueDiligenceChecklist || []).map((item) =>
        item.id === checkId ? { ...item, isCompleted: !item.isCompleted } : item
      ),
    }));
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    const newItem = {
      id: `dd-${Date.now()}`,
      title: newChecklistTitle.trim(),
      category: 'Safeguarding' as const,
      isMandatory: true,
      isCompleted: false,
      verificationNotes: `Added by ${currentUserRole}`,
    };
    setFormData((prev) => ({
      ...prev,
      dueDiligenceChecklist: [...(prev.dueDiligenceChecklist || []), newItem],
    }));
    setNewChecklistTitle('');
  };

  const handleSave = () => {
    onSaveTask(formData);
    onClose();
  };

  const potentialPredecessors = allTasks.filter((t) => t.id !== task.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="task-details-modal"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              {formData.taskCode}
            </span>
            <span className="text-xs text-slate-500 font-medium">Asana Task Management</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Task Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full text-base font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Detailed Description & Operational Scope</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs text-slate-800 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Meta Grid (Status, Priority, Workflow, Due Date, Assignee) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Workflow Stream</label>
              <select
                value={formData.workflowCode}
                onChange={(e) => setFormData({ ...formData, workflowCode: e.target.value as WorkflowType })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-medium"
              >
                <option value="WASH_DEVELOPMENT">WASH Development</option>
                <option value="FUNDRAISING_INITIATIVES">Fundraising Initiatives</option>
                <option value="HUMANITARIAN_RESEARCH">Humanitarian Research Data</option>
                <option value="SOCIAL_IMPACT_INTERNSHIP">Social Impact Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Execution Stage</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-medium"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="DUE_DILIGENCE">Due Diligence</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLIANCE_REVIEW">Compliance Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-medium"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Assigned Lead (Time Zone)</label>
              <select
                value={formData.assigneeName}
                onChange={(e) => setFormData({ ...formData, assigneeName: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-medium text-slate-800"
              >
                {activeMembers.map((tm) => {
                  const tz = timeZones?.find(t => t.key === tm.timeZone);
                  const tzInfo = tz ? `${tz.name} (${tz.offsetDisplay})` : tm.timeZoneLabel || tm.utcOffset || tm.timeZone;
                  return (
                    <option key={tm.id} value={tm.name}>
                      {tm.name} — {tzInfo}
                    </option>
                  );
                })}
                {!activeMembers.some(t => t.name === formData.assigneeName) && (
                  <option value={formData.assigneeName}>{formData.assigneeName} (Other)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Project Scope Category</label>
              <input
                type="text"
                value={formData.projectScopeCategory || ''}
                placeholder="e.g. Infrastructure, Proposal, etc."
                onChange={(e) => setFormData({ ...formData, projectScopeCategory: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isMilestone || false}
                  onChange={(e) => setFormData({ ...formData, isMilestone: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Mark as Key Project Milestone
                </span>
              </label>
            </div>
          </div>

          {/* Task Dependency Section */}
          <div className="space-y-2 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-indigo-600" />
                Task Dependencies (Finish-to-Start)
              </span>
              <span className="text-[11px] text-slate-500">Blockers & prerequisite sequencing</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={formData.dependsOnTaskId || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const target = allTasks.find((t) => t.id === val);
                  setFormData({
                    ...formData,
                    dependsOnTaskId: val || undefined,
                    dependsOnTaskTitle: target ? target.title : undefined,
                  });
                }}
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
              >
                <option value="">No Predecessor Dependency (Standalone)</option>
                {potentialPredecessors.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.taskCode}] {p.title} ({p.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtasks Management */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                Granular Subtasks ({formData.subtasks.filter((s) => s.isCompleted).length}/{formData.subtasks.length})
              </span>
            </div>

            <div className="space-y-1.5">
              {formData.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => handleToggleSubtask(sub.id)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors border border-slate-200/80"
                >
                  {sub.isCompleted ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className={`text-xs flex-1 ${sub.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                    {sub.title}
                  </span>
                  {sub.dueDate && (
                    <span className="text-[10px] text-slate-400 font-mono">{sub.dueDate}</span>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add another granular subtask..."
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>
          </div>

          {/* Automated Due Diligence Checklist Section */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800">Automated Due Diligence Checklist</span>
              </div>
              <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">
                Mandatory Risk Screening
              </span>
            </div>

            <div className="space-y-2">
              {(formData.dueDiligenceChecklist || []).map((check) => (
                <div
                  key={check.id}
                  onClick={() => handleToggleChecklist(check.id)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    check.isCompleted
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50/50 border-amber-200 text-slate-800'
                  }`}
                >
                  {check.isCompleted ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${check.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {check.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border">
                        {check.category}
                      </span>
                    </div>
                    {check.verificationNotes && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{check.verificationNotes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddChecklist} className="flex gap-2">
              <input
                type="text"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Add custom due diligence criteria..."
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </form>
          </div>

          {/* Tailored Asana Custom Fields by Project */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-slate-800 font-bold border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>Project Scope Custom Fields</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-2 py-0.5 rounded border">
                Asana Tailored
              </span>
            </div>

            {formData.workflowCode === 'WASH_DEVELOPMENT' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Water Infrastructure Type</label>
                  <input
                    type="text"
                    value={formData.customFields?.waterInfrastructureType || ''}
                    placeholder="e.g. Solar Piped Grid, RO System"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customFields: { ...formData.customFields, waterInfrastructureType: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">M&E Indicator Target</label>
                  <input
                    type="text"
                    value={formData.customFields?.meIndicatorTarget || ''}
                    placeholder="e.g. 1,200 beneficiaries"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customFields: { ...formData.customFields, meIndicatorTarget: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Testing Parameter</label>
                  <input
                    type="text"
                    value={formData.customFields?.qualityTestingParameter || ''}
                    placeholder="e.g. WHO turbidity, arsenic"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customFields: { ...formData.customFields, qualityTestingParameter: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            )}

            {formData.workflowCode === 'FUNDRAISING_INITIATIVES' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Target Donor Agency</label>
                  <input
                    type="text"
                    value={formData.customFields?.donorAgency || formData.foreignGrantDonor || ''}
                    placeholder="e.g. USAID, AFD, EU Horizon"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        foreignGrantDonor: e.target.value,
                        customFields: { ...formData.customFields, donorAgency: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Grant Request (USD)</label>
                  <input
                    type="number"
                    value={formData.customFields?.grantAmountUSD || formData.donorGrantAmountUSD || 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        donorGrantAmountUSD: val,
                        customFields: { ...formData.customFields, grantAmountUSD: val },
                      });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Co-Financing %</label>
                  <input
                    type="number"
                    value={formData.customFields?.coFinancingPercent || 0}
                    placeholder="e.g. 15"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customFields: { ...formData.customFields, coFinancingPercent: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            )}

            {formData.workflowCode === 'HUMANITARIAN_RESEARCH' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Research Methodology</label>
                  <input
                    type="text"
                    value={formData.customFields?.researchMethodology || ''}
                    placeholder="e.g. PAR Survey, Qualitative FGD"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customFields: { ...formData.customFields, researchMethodology: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Community Sample Size</label>
                  <input
                    type="number"
                    value={formData.customFields?.communitySampleSize || 0}
                    placeholder="e.g. 450"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customFields: { ...formData.customFields, communitySampleSize: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Policy White Paper Deliverable</label>
                  <input
                    type="text"
                    value={formData.customFields?.policyDeliverable || ''}
                    placeholder="e.g. Baseline Evaluation Brief"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customFields: { ...formData.customFields, policyDeliverable: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            )}

            {formData.workflowCode === 'SOCIAL_IMPACT_INTERNSHIP' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Sending University</label>
                  <input
                    type="text"
                    value={formData.customFields?.sendingUniversity || formData.universityName || ''}
                    placeholder="e.g. Oxford, Georgetown"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        universityName: e.target.value,
                        customFields: { ...formData.customFields, sendingUniversity: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Host NGO Partner</label>
                  <input
                    type="text"
                    value={formData.customFields?.hostNgoPartner || formData.ngoName || ''}
                    placeholder="e.g. Cambodia Wildlife Alliance"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ngoName: e.target.value,
                        customFields: { ...formData.customFields, hostNgoPartner: e.target.value },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Placement Duration (Weeks)</label>
                  <input
                    type="number"
                    value={formData.customFields?.placementDurationWeeks || 8}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customFields: { ...formData.customFields, placementDurationWeeks: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
