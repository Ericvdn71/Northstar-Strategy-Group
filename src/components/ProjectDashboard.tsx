import React from 'react';
import { Task, WorkflowType, WorkflowInfo, TeamMember } from '../types';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  Coins, 
  GraduationCap, 
  Droplets,
  BookOpen,
  FileText
} from 'lucide-react';

interface ProjectDashboardProps {
  tasks: Task[];
  selectedWorkflow: WorkflowType | 'ALL';
  workflowInfo?: WorkflowInfo;
  teamMembers: TeamMember[];
  onTaskClick: (task: Task) => void;
  onOpenScopeModal: () => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  tasks,
  selectedWorkflow,
  workflowInfo,
  teamMembers,
  onTaskClick,
  onOpenScopeModal,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const dueDiligenceTasks = tasks.filter((t) => t.status === 'DUE_DILIGENCE').length;
  const complianceTasks = tasks.filter((t) => t.status === 'COMPLIANCE_REVIEW').length;
  const backlogTasks = tasks.filter((t) => t.status === 'BACKLOG').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Workload by assignee
  const assigneeCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    assigneeCounts[t.assigneeName] = (assigneeCounts[t.assigneeName] || 0) + 1;
  });

  // Priority counts
  const urgentCount = tasks.filter((t) => t.priority === 'URGENT').length;
  const highCount = tasks.filter((t) => t.priority === 'HIGH').length;

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 space-y-5 overflow-y-auto min-h-[calc(100vh-220px)] text-xs">
      {/* Top Banner with Scope Quick View */}
      {workflowInfo && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Active Project Management Suite
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Scope Aligned
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{workflowInfo.title}</h2>
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {workflowInfo.scopeOfWork}
            </p>
          </div>

          <button
            onClick={onOpenScopeModal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-xs transition cursor-pointer text-xs"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>View Full Project Scope & SOP</span>
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{completionRate}%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400 mt-1.5">{completedTasks} of {totalTasks} deliverables completed</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Active Execution</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{inProgressTasks}</div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">In active operational sprint</div>
          <div className="text-[10px] text-slate-400 mt-1.5">Across assigned regional consultants</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Critical Due Diligence</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{dueDiligenceTasks + complianceTasks}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Screening & SCC verification</div>
          <div className="text-[10px] text-slate-400 mt-1.5">Zero unvetted partner actions</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium">Urgent Priority Items</span>
            <Sparkles className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{urgentCount}</div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">{highCount} additional high-priority</div>
          <div className="text-[10px] text-slate-400 mt-1.5">Immediate leadership attention</div>
        </div>
      </div>

      {/* Two Column Section: Status Distribution & Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-slate-700" />
              <span>Tasks by Operational Stage</span>
            </h3>
            <span className="text-[11px] text-slate-400">{totalTasks} total</span>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Completed', count: completedTasks, color: 'bg-emerald-500', text: 'text-emerald-700' },
              { label: 'In Execution', count: inProgressTasks, color: 'bg-blue-500', text: 'text-blue-700' },
              { label: 'Compliance & SCC Review', count: complianceTasks, color: 'bg-purple-500', text: 'text-purple-700' },
              { label: 'Due Diligence & Screening', count: dueDiligenceTasks, color: 'bg-amber-500', text: 'text-amber-700' },
              { label: 'Backlog', count: backlogTasks, color: 'bg-slate-400', text: 'text-slate-600' },
            ].map((st) => {
              const pct = totalTasks > 0 ? Math.round((st.count / totalTasks) * 100) : 0;
              return (
                <div key={st.label} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-700">{st.label}</span>
                    <span className={`font-bold ${st.text}`}>{st.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${st.color} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workload Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-700" />
              <span>Workload Allocation by Consultant</span>
            </h3>
            <span className="text-[11px] text-slate-400">{Object.keys(assigneeCounts).length} team members</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {Object.keys(assigneeCounts).length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs italic">
                No assigned tasks yet. Tasks will show consultant workload here.
              </div>
            ) : (
              Object.entries(assigneeCounts).map(([name, count]) => {
                const taskCount = Number(count);
                const pct = totalTasks > 0 ? Math.round((taskCount / totalTasks) * 100) : 0;
                return (
                <div key={name} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center">
                      {name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">{name}</div>
                      <div className="text-[10px] text-slate-500">{count} assigned tasks ({pct}% of project)</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {count} tasks
                  </span>
                </div>
              );
            }))}
          </div>
        </div>
      </div>

      {/* Project Scope Pillars Breakdown */}
      {workflowInfo?.corePillars && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Project Scope Deliverables & Focus Areas</span>
            </h3>
            <span className="text-[10px] text-slate-400">Aligned with Northstar Client Commitments</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {workflowInfo.corePillars.map((pillar, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                  {idx + 1}
                </div>
                <div className="font-bold text-xs text-slate-900 pt-1">{pillar}</div>
                <div className="text-[10px] text-slate-500">Active SOP adherence & regular milestone tracking</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
