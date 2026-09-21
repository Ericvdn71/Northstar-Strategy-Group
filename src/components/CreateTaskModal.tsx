import React, { useState } from 'react';
import { Task, TaskPriority, WorkflowType, UserRole, TaskStatus, TeamMember, RegionalTimeZoneConfig } from '../types';
import { X, Plus, ShieldCheck, Link2, Coins, Droplets, BookOpen, GraduationCap, Users, Sparkles, Sliders } from 'lucide-react';
import { sanitizeText } from '../utils/validation';
import { TEAM_MEMBERS } from '../data/initialData';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (newTask: Task) => void;
  allTasks: Task[];
  currentUserRole: UserRole;
  defaultWorkflow?: WorkflowType;
  teamMembers?: TeamMember[];
  timeZones?: RegionalTimeZoneConfig[];
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  allTasks,
  currentUserRole,
  defaultWorkflow = 'WASH_DEVELOPMENT',
  teamMembers = TEAM_MEMBERS,
  timeZones,
}) => {
  if (!isOpen) return null;

  const activeMembers = teamMembers.length > 0 ? teamMembers : TEAM_MEMBERS;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workflowCode, setWorkflowCode] = useState<WorkflowType>(defaultWorkflow);
  const [status, setStatus] = useState<TaskStatus>('BACKLOG');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('2026-11-15');
  const [assigneeName, setAssigneeName] = useState(activeMembers[0]?.name || 'Unassigned');
  const [isMilestone, setIsMilestone] = useState(false);
  const [projectScopeCategory, setProjectScopeCategory] = useState('');
  const [dependsOnTaskId, setDependsOnTaskId] = useState('');

  // Custom Fields state
  const [waterInfrastructureType, setWaterInfrastructureType] = useState('Solar-Powered Deep Well Piped System');
  const [meIndicatorTarget, setMeIndicatorTarget] = useState('1,500 rural community members');
  const [qualityTestingParameter, setQualityTestingParameter] = useState('WHO turbidity, E. coli & arsenic parameters');

  const [donorAgency, setDonorAgency] = useState('USAID / Feed the Future');
  const [grantAmountUSD, setGrantAmountUSD] = useState<number>(350000);
  const [coFinancingPercent, setCoFinancingPercent] = useState<number>(15);

  const [researchMethodology, setResearchMethodology] = useState('Mixed-methods Field Survey & Focus Groups');
  const [communitySampleSize, setCommunitySampleSize] = useState<number>(450);
  const [policyDeliverable, setPolicyDeliverable] = useState('Provincial Baseline Evaluation Dossier');

  const [sendingUniversity, setSendingUniversity] = useState('University of Oxford');
  const [hostNgoPartner, setHostNgoPartner] = useState('Mekong Community Development Network');
  const [placementDurationWeeks, setPlacementDurationWeeks] = useState<number>(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let prefix = 'WSH';
    if (workflowCode === 'FUNDRAISING_INITIATIVES') prefix = 'FND';
    else if (workflowCode === 'HUMANITARIAN_RESEARCH') prefix = 'RES';
    else if (workflowCode === 'SOCIAL_IMPACT_INTERNSHIP') prefix = 'INT';

    const randomCode = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;
    const depTarget = allTasks.find((t) => t.id === dependsOnTaskId);

    // Build customFields object
    const customFields: any = {};
    if (workflowCode === 'WASH_DEVELOPMENT') {
      customFields.waterInfrastructureType = waterInfrastructureType;
      customFields.meIndicatorTarget = meIndicatorTarget;
      customFields.qualityTestingParameter = qualityTestingParameter;
    } else if (workflowCode === 'FUNDRAISING_INITIATIVES') {
      customFields.donorAgency = donorAgency;
      customFields.grantAmountUSD = grantAmountUSD;
      customFields.coFinancingPercent = coFinancingPercent;
    } else if (workflowCode === 'HUMANITARIAN_RESEARCH') {
      customFields.researchMethodology = researchMethodology;
      customFields.communitySampleSize = communitySampleSize;
      customFields.policyDeliverable = policyDeliverable;
    } else if (workflowCode === 'SOCIAL_IMPACT_INTERNSHIP') {
      customFields.sendingUniversity = sendingUniversity;
      customFields.hostNgoPartner = hostNgoPartner;
      customFields.placementDurationWeeks = placementDurationWeeks;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      taskCode: randomCode,
      workflowCode,
      title: sanitizeText(title),
      description: sanitizeText(description || 'Scope executed according to Northstar Standard Operating Procedures.'),
      status,
      priority,
      startDate,
      dueDate,
      isMilestone,
      projectScopeCategory: projectScopeCategory || undefined,
      assigneeName: sanitizeText(assigneeName),
      assigneeRole: currentUserRole,
      createdAt: new Date().toISOString().slice(0, 10),
      dependsOnTaskId: dependsOnTaskId || undefined,
      dependsOnTaskTitle: depTarget ? depTarget.title : undefined,
      customFields,
      foreignGrantDonor: workflowCode === 'FUNDRAISING_INITIATIVES' ? donorAgency : undefined,
      donorGrantAmountUSD: workflowCode === 'FUNDRAISING_INITIATIVES' && grantAmountUSD > 0 ? grantAmountUSD : undefined,
      universityName: workflowCode === 'SOCIAL_IMPACT_INTERNSHIP' ? sendingUniversity : undefined,
      ngoName: workflowCode === 'SOCIAL_IMPACT_INTERNSHIP' ? hostNgoPartner : undefined,
      subtasks: [
        { id: `st-1`, title: 'Draft technical specifications & protocol', isCompleted: false, dueDate },
        { id: `st-2`, title: 'Internal Northstar stakeholder review', isCompleted: false },
      ],
      dueDiligenceChecklist: [
        {
          id: `dd-1`,
          title: 'Partner good standing check & legal vetting',
          category: 'Legal Standing',
          isMandatory: true,
          isCompleted: false,
        },
        {
          id: `dd-2`,
          title: 'Safeguarding, PSEA & Code of Conduct clearance',
          category: 'Safeguarding',
          isMandatory: true,
          isCompleted: false,
        },
      ],
    };

    onCreateTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Asana Project Task
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Custom Fields Enabled
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">Create New Project Task</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Conduct water filtration baseline audit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Operational Scope & Description</label>
            <textarea
              rows={2}
              placeholder="Describe deliverables, methodology and compliance standards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Project Workflow Selector */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Target Project</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setWorkflowCode('WASH_DEVELOPMENT')}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                  workflowCode === 'WASH_DEVELOPMENT'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Droplets className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">WASH Development</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkflowCode('FUNDRAISING_INITIATIVES')}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                  workflowCode === 'FUNDRAISING_INITIATIVES'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">Fundraising Initiatives</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkflowCode('HUMANITARIAN_RESEARCH')}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                  workflowCode === 'HUMANITARIAN_RESEARCH'
                    ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="truncate">Humanitarian Research</span>
              </button>

              <button
                type="button"
                onClick={() => setWorkflowCode('SOCIAL_IMPACT_INTERNSHIP')}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                  workflowCode === 'SOCIAL_IMPACT_INTERNSHIP'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">Social Impact Internship</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Execution Stage</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full border rounded-lg p-2 text-xs bg-white"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="DUE_DILIGENCE">Due Diligence</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLIANCE_REVIEW">Compliance Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full border rounded-lg p-2 text-xs bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Assigned Consultant</label>
              <select
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs bg-white font-medium"
              >
                {activeMembers.map((tm) => {
                  const tz = timeZones?.find((t) => t.key === tm.timeZone);
                  const tzInfo = tz ? `${tz.name} (${tz.offsetDisplay})` : tm.timeZone;
                  return (
                    <option key={tm.id} value={tm.name}>
                      {tm.name} — {tzInfo}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Project Scope Category</label>
              <input
                type="text"
                placeholder="e.g. Infrastructure, Proposal"
                value={projectScopeCategory}
                onChange={(e) => setProjectScopeCategory(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs bg-white"
              />
            </div>
          </div>

          {/* Milestone and Dependency */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isMilestone}
                onChange={(e) => setIsMilestone(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Mark as Key Project Milestone
              </span>
            </label>

            <div className="flex-1 max-w-xs">
              <select
                value={dependsOnTaskId}
                onChange={(e) => setDependsOnTaskId(e.target.value)}
                className="w-full border rounded-lg px-2 py-1 text-[11px] bg-white text-slate-700"
              >
                <option value="">No Predecessor Dependency</option>
                {allTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.taskCode}] {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tailored Custom Fields for active project */}
          <div className="bg-purple-50/40 p-3 rounded-xl border border-purple-200 space-y-2">
            <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs">
              <Sliders className="w-3.5 h-3.5 text-purple-700" />
              <span>Tailored Project Custom Fields (Asana Scope)</span>
            </div>

            {workflowCode === 'WASH_DEVELOPMENT' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Water Infrastructure Type</label>
                  <input
                    type="text"
                    value={waterInfrastructureType}
                    onChange={(e) => setWaterInfrastructureType(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-lg p-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">M&E Indicator Target</label>
                  <input
                    type="text"
                    value={meIndicatorTarget}
                    onChange={(e) => setMeIndicatorTarget(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-lg p-1.5 text-xs"
                  />
                </div>
              </div>
            )}

            {workflowCode === 'FUNDRAISING_INITIATIVES' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Target Funder / Donor Agency</label>
                  <input
                    type="text"
                    value={donorAgency}
                    onChange={(e) => setDonorAgency(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-lg p-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Grant Value (USD)</label>
                  <input
                    type="number"
                    value={grantAmountUSD}
                    onChange={(e) => setGrantAmountUSD(Number(e.target.value))}
                    className="w-full bg-white border border-purple-200 rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {workflowCode === 'HUMANITARIAN_RESEARCH' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Research Methodology</label>
                  <input
                    type="text"
                    value={researchMethodology}
                    onChange={(e) => setResearchMethodology(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-lg p-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Community Sample Size</label>
                  <input
                    type="number"
                    value={communitySampleSize}
                    onChange={(e) => setCommunitySampleSize(Number(e.target.value))}
                    className="w-full bg-white border border-purple-200 rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {workflowCode === 'SOCIAL_IMPACT_INTERNSHIP' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Sending University</label>
                  <input
                    type="text"
                    value={sendingUniversity}
                    onChange={(e) => setSendingUniversity(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-lg p-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Host NGO Partner</label>
                  <input
                    type="text"
                    value={hostNgoPartner}
                    onChange={(e) => setHostNgoPartner(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-lg p-1.5 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm transition cursor-pointer"
            >
              Create Asana Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
