import React from 'react';
import { Task, TaskStatus, UserRole } from '../types';
import { 
  Clock, 
  CheckSquare, 
  Link2, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Coins, 
  Plus, 
  Trees, 
  GraduationCap,
  Sparkles 
} from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onOpenCreateModal: () => void;
  currentUserRole: UserRole;
}

const COLUMNS: { status: TaskStatus; label: string; headerColor: string; pillColor: string }[] = [
  { status: 'BACKLOG', label: 'Backlog', headerColor: 'border-slate-300', pillColor: 'bg-slate-100 text-slate-700' },
  { status: 'DUE_DILIGENCE', label: 'Due Diligence & Screening', headerColor: 'border-blue-400', pillColor: 'bg-blue-50 text-blue-700' },
  { status: 'IN_PROGRESS', label: 'In Execution', headerColor: 'border-emerald-400', pillColor: 'bg-emerald-50 text-emerald-700' },
  { status: 'COMPLIANCE_REVIEW', label: 'Compliance & SCC Review', headerColor: 'border-purple-400', pillColor: 'bg-purple-50 text-purple-700' },
  { status: 'COMPLETED', label: 'Completed', headerColor: 'border-slate-400', pillColor: 'bg-slate-100 text-slate-600' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onOpenCreateModal,
  currentUserRole,
}) => {
  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Urgent</span>;
      case 'HIGH':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">High</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">Med</span>;
      default:
        return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Low</span>;
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['BACKLOG', 'DUE_DILIGENCE', 'IN_PROGRESS', 'COMPLIANCE_REVIEW', 'COMPLETED'];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    const order: TaskStatus[] = ['BACKLOG', 'DUE_DILIGENCE', 'IN_PROGRESS', 'COMPLIANCE_REVIEW', 'COMPLETED'];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  return (
    <div className="flex-1 overflow-x-auto p-4 sm:p-6 bg-slate-100 min-h-[calc(100vh-220px)] space-y-4">
      {/* Board Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          Showing <span className="font-bold text-slate-800">{tasks.length}</span> active tasks across operational stages
        </div>

        <button
          id="btn-create-task-kanban"
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Asana Task</span>
        </button>
      </div>

      {tasks.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-800">Workspace is empty and ready</h4>
            <p className="text-[11px] text-slate-500">
              No example projects are loaded. Select one of the 4 project groups above and click <strong>New Asana Task</strong> to begin adding your real deliverables.
            </p>
          </div>
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Task</span>
          </button>
        </div>
      )}

      {/* Columns Grid */}
      <div className="flex gap-4 min-w-[1250px] items-start pb-6">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.status);

          return (
            <div
              key={col.status}
              className="flex-1 bg-slate-200/70 rounded-xl p-3 border border-slate-250 flex flex-col max-h-[85vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-300">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full border-2 ${col.headerColor}`} />
                  <h3 className="font-bold text-xs text-slate-800 tracking-tight">{col.label}</h3>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.pillColor}`}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Tasks List inside column */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {columnTasks.length === 0 ? (
                  <button
                    type="button"
                    onClick={onOpenCreateModal}
                    className="w-full border border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 text-center text-xs text-slate-400 hover:text-emerald-700 hover:bg-emerald-50/40 transition cursor-pointer flex flex-col items-center justify-center gap-1.5 group"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium">Add task to {col.label}</span>
                  </button>
                ) : (
                  columnTasks.map((task) => {
                    const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
                    const nextStatus = getNextStatus(task.status);
                    const prevStatus = getPrevStatus(task.status);
                    const hasDependencies = Boolean(task.dependsOnTaskId);
                    const hasChecklists = (task.dueDiligenceChecklist?.length || 0) > 0;
                    const completedChecklists = task.dueDiligenceChecklist?.filter((c) => c.isCompleted).length || 0;

                    return (
                      <div
                        key={task.id}
                        id={`task-card-${task.taskCode}`}
                        className="bg-white rounded-xl border border-slate-200 hover:border-emerald-500/80 hover:shadow-md transition-all p-3 cursor-pointer space-y-2 group relative"
                        onClick={() => onTaskClick(task)}
                      >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                              {task.taskCode}
                            </span>
                            {task.isMilestone && (
                              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Milestone
                              </span>
                            )}
                          </div>
                          {getPriorityBadge(task.priority)}
                        </div>

                        {/* Project Scope Category Badge if present */}
                        {task.projectScopeCategory && (
                          <div className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 rounded px-1.5 py-0.5 inline-block truncate max-w-full">
                            {task.projectScopeCategory}
                          </div>
                        )}

                        {/* Task Title */}
                        <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-700 leading-snug">
                          {task.title}
                        </h4>

                        {/* Custom Fields Highlights for Scope of Work */}
                        {task.customFields && (
                          <div className="space-y-1">
                            {task.customFields.waterInfrastructureType && (
                              <div className="text-[10px] text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 truncate flex items-center gap-1">
                                <span className="font-semibold shrink-0">WASH:</span>
                                <span className="truncate">{task.customFields.waterInfrastructureType}</span>
                              </div>
                            )}
                            {task.customFields.donorAgency && (
                              <div className="text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 truncate flex items-center justify-between">
                                <span className="truncate">{task.customFields.donorAgency}</span>
                                {task.customFields.grantAmountUSD && currentUserRole === 'INTERNAL_CONSULTANT' && (
                                  <span className="font-bold shrink-0 ml-1 text-amber-700">
                                    ${(task.customFields.grantAmountUSD / 1000).toLocaleString()}k
                                  </span>
                                )}
                              </div>
                            )}
                            {task.customFields.researchMethodology && (
                              <div className="text-[10px] text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 truncate flex items-center gap-1">
                                <span className="font-semibold shrink-0">Method:</span>
                                <span className="truncate">{task.customFields.researchMethodology}</span>
                              </div>
                            )}
                            {task.customFields.sendingUniversity && (
                              <div className="text-[10px] text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 truncate flex items-center gap-1">
                                <span className="font-semibold shrink-0">Uni:</span>
                                <span className="truncate">{task.customFields.sendingUniversity}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Foreign Donor Info for Cambodian Advisory Proposals (Fallback) */}
                        {!task.customFields?.donorAgency && task.foreignGrantDonor && (
                          <div className="flex items-center gap-1 text-[10px] bg-amber-50/80 border border-amber-200/80 rounded px-2 py-0.5 text-amber-900">
                            <Coins className="w-3 h-3 text-amber-700 shrink-0" />
                            <span className="truncate">{task.foreignGrantDonor}</span>
                            {task.donorGrantAmountUSD && currentUserRole === 'INTERNAL_CONSULTANT' && (
                              <span className="font-bold shrink-0 ml-auto">
                                ${(task.donorGrantAmountUSD / 1000).toFixed(0)}k
                              </span>
                            )}
                          </div>
                        )}

                        {/* Dependency Warning */}
                        {hasDependencies && (
                          <div className="flex items-center gap-1 text-[9px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 truncate">
                            <Link2 className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">Depends on: {task.dependsOnTaskId}</span>
                          </div>
                        )}

                        {/* Subtasks and Due Diligence Badges */}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            {task.subtasks.length > 0 && (
                              <span className="flex items-center gap-1" title="Subtasks completed">
                                <CheckSquare className="w-3 h-3 text-slate-400" />
                                {completedSubtasks}/{task.subtasks.length}
                              </span>
                            )}
                            {hasChecklists && (
                              <span className="flex items-center gap-1 text-blue-700 font-medium" title="Due Diligence Checklists">
                                <ShieldCheck className="w-3 h-3 text-blue-500" />
                                {completedChecklists}/{task.dueDiligenceChecklist?.length}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{task.dueDate}</span>
                          </div>
                        </div>

                        {/* Assignee & Fast Mover controls */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-700">
                              {task.assigneeName.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <span className="text-[10px] text-slate-600 truncate max-w-[110px]">
                              {task.assigneeName}
                            </span>
                          </div>

                          {/* Fast move arrow buttons */}
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {prevStatus && (
                              <button
                                title={`Move back to ${prevStatus}`}
                                onClick={() => onStatusChange(task.id, prevStatus)}
                                className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                            )}
                            {nextStatus && (
                              <button
                                title={`Progress to ${nextStatus}`}
                                onClick={() => onStatusChange(task.id, nextStatus)}
                                className="p-0.5 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 cursor-pointer"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
