import React, { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, WorkflowType, UserRole, WorkflowInfo } from '../types';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Sparkles, 
  ArrowUpDown, 
  Layers, 
  CheckSquare, 
  ShieldCheck, 
  Link2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onOpenCreateModal: () => void;
  currentUserRole: UserRole;
  selectedWorkflow: WorkflowType | 'ALL';
  workflowInfo?: WorkflowInfo;
  visibleColumns: {
    status: boolean;
    assignee: boolean;
    dueDate: boolean;
    priority: boolean;
    customField1: boolean;
    customField2: boolean;
    checklists: boolean;
  };
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  onOpenCreateModal,
  currentUserRole,
  selectedWorkflow,
  workflowInfo,
  visibleColumns,
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<'dueDate' | 'priority' | 'title' | 'assignee'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const statusOrder: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'BACKLOG', label: 'Backlog', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { status: 'DUE_DILIGENCE', label: 'Due Diligence & Screening', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { status: 'IN_PROGRESS', label: 'In Execution', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { status: 'COMPLIANCE_REVIEW', label: 'Compliance & SCC Review', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { status: 'COMPLETED', label: 'Completed', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  ];

  const handleSort = (field: 'dueDate' | 'priority' | 'title' | 'assignee') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const priorityWeight = (p: TaskPriority) => {
    switch (p) {
      case 'URGENT': return 4;
      case 'HIGH': return 3;
      case 'MEDIUM': return 2;
      case 'LOW': return 1;
    }
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'dueDate') {
        comparison = (a.dueDate || '').localeCompare(b.dueDate || '');
      } else if (sortField === 'priority') {
        comparison = priorityWeight(b.priority) - priorityWeight(a.priority);
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'assignee') {
        comparison = a.assigneeName.localeCompare(b.assigneeName);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, sortField, sortOrder]);

  const getCustomFieldValues = (task: Task) => {
    if (task.workflowCode === 'WASH_DEVELOPMENT') {
      return {
        field1: task.customFields?.waterInfrastructureType || 'N/A',
        field2: task.customFields?.meIndicatorTarget || 'N/A',
      };
    } else if (task.workflowCode === 'FUNDRAISING_INITIATIVES') {
      return {
        field1: task.foreignGrantDonor || task.customFields?.donorAgency || 'Bilateral Donor',
        field2: task.donorGrantAmountUSD ? `$${(task.donorGrantAmountUSD / 1000).toLocaleString()}k` : task.customFields?.grantAmountUSD ? `$${(task.customFields.grantAmountUSD / 1000).toLocaleString()}k` : 'N/A',
      };
    } else if (task.workflowCode === 'HUMANITARIAN_RESEARCH') {
      return {
        field1: task.customFields?.researchMethodology || 'PAR Field Survey',
        field2: task.customFields?.communitySampleSize ? `${task.customFields.communitySampleSize} households` : task.customFields?.policyDeliverable || 'N/A',
      };
    } else if (task.workflowCode === 'SOCIAL_IMPACT_INTERNSHIP') {
      return {
        field1: task.universityName || task.customFields?.sendingUniversity || 'Partner University',
        field2: task.ngoName || task.customFields?.hostNgoPartner || 'Host NGO',
      };
    }
    return { field1: 'Standard', field2: 'Standard' };
  };

  const getCustomFieldHeaders = () => {
    if (workflowInfo?.customFieldLabels) {
      return {
        field1: workflowInfo.customFieldLabels.field1,
        field2: workflowInfo.customFieldLabels.field2,
      };
    }
    return {
      field1: 'Domain / Funder / Partner',
      field2: 'Target / Scope Metric',
    };
  };

  const headers = getCustomFieldHeaders();

  const getPriorityPill = (p: TaskPriority) => {
    switch (p) {
      case 'URGENT':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">Urgent</span>;
      case 'HIGH':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">High</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Med</span>;
      default:
        return <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">Low</span>;
    }
  };

  return (
    <div className="flex-1 bg-white p-4 sm:p-6 space-y-4 overflow-x-auto min-h-[calc(100vh-220px)] text-xs">
      {/* List Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="font-bold text-slate-800 text-sm">List View</span>
          <span>•</span>
          <span>Showing <strong className="text-slate-800">{tasks.length}</strong> tasks structured by Asana operational stages</span>
        </div>

        <button
          id="btn-create-task-list"
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Main Table Structure */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs min-w-[950px]">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 py-2.5 px-4 font-semibold text-slate-600 text-[11px] items-center select-none">
          <div className="col-span-4 flex items-center gap-2 cursor-pointer hover:text-slate-900" onClick={() => handleSort('title')}>
            <span>Task Title & Code</span>
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
          </div>
          {visibleColumns.status && <div className="col-span-2">Status</div>}
          {visibleColumns.assignee && (
            <div className="col-span-1.5 flex items-center gap-1 cursor-pointer hover:text-slate-900" onClick={() => handleSort('assignee')}>
              <span>Assignee</span>
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
            </div>
          )}
          {visibleColumns.dueDate && (
            <div className="col-span-1.5 flex items-center gap-1 cursor-pointer hover:text-slate-900" onClick={() => handleSort('dueDate')}>
              <span>Due Date</span>
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
            </div>
          )}
          {visibleColumns.priority && (
            <div className="col-span-1 flex items-center gap-1 cursor-pointer hover:text-slate-900" onClick={() => handleSort('priority')}>
              <span>Priority</span>
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
            </div>
          )}
          {visibleColumns.customField1 && <div className="col-span-1 truncate">{headers.field1}</div>}
          {visibleColumns.customField2 && <div className="col-span-1 truncate">{headers.field2}</div>}
        </div>

        {/* Grouped Sections by Status */}
        {statusOrder.map((section) => {
          const sectionTasks = sortedTasks.filter((t) => t.status === section.status);
          const isCollapsed = collapsedSections[section.status];

          return (
            <div key={section.status} className="border-b border-slate-200 last:border-b-0">
              {/* Section Header Row */}
              <div
                onClick={() => toggleSection(section.status)}
                className="flex items-center justify-between bg-slate-100/70 hover:bg-slate-150 px-4 py-2 cursor-pointer transition select-none"
              >
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="font-bold text-xs text-slate-800">{section.label}</span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full ml-1">
                    {sectionTasks.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCreateModal();
                  }}
                  className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add task</span>
                </button>
              </div>

              {/* Tasks List within Section */}
              {!isCollapsed && (
                <div className="divide-y divide-slate-100">
                  {sectionTasks.length === 0 ? (
                    <div className="py-3 px-8 text-slate-400 text-[11px] flex items-center justify-between">
                      <span className="italic">No tasks in {section.label}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCreateModal();
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add task to this stage</span>
                      </button>
                    </div>
                  ) : (
                    sectionTasks.map((task) => {
                      const custom = getCustomFieldValues(task);
                      const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
                      const hasSubtasks = task.subtasks.length > 0;
                      const hasDependencies = Boolean(task.dependsOnTaskId);

                      return (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          className="grid grid-cols-12 py-2.5 px-4 items-center hover:bg-emerald-50/40 transition cursor-pointer group"
                        >
                          {/* Title & Code */}
                          <div className="col-span-4 flex items-center gap-2.5 pr-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(task.id, task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED');
                              }}
                              className="text-slate-400 hover:text-emerald-600 transition shrink-0 cursor-pointer"
                            >
                              {task.status === 'COMPLETED' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Circle className="w-4 h-4 hover:stroke-emerald-600" />
                              )}
                            </button>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[10px] text-slate-400 font-semibold">{task.taskCode}</span>
                                {task.isMilestone && (
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 rounded flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5" /> Milestone
                                  </span>
                                )}
                                {hasDependencies && (
                                  <span className="text-[9px] text-blue-600 bg-blue-50 px-1 rounded flex items-center gap-0.5" title={`Blocked by ${task.dependsOnTaskTitle || 'another task'}`}>
                                    <Link2 className="w-2.5 h-2.5" /> Dep
                                  </span>
                                )}
                              </div>
                              <div className={`font-medium text-xs truncate ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-emerald-700'}`}>
                                {task.title}
                              </div>
                            </div>
                          </div>

                          {/* Status */}
                          {visibleColumns.status && (
                            <div className="col-span-2 pr-2" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={task.status}
                                onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                                className="text-[11px] font-semibold px-2 py-1 rounded-md border border-slate-200 bg-white hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                              >
                                <option value="BACKLOG">Backlog</option>
                                <option value="DUE_DILIGENCE">Due Diligence</option>
                                <option value="IN_PROGRESS">In Execution</option>
                                <option value="COMPLIANCE_REVIEW">Compliance Review</option>
                                <option value="COMPLETED">Completed</option>
                              </select>
                            </div>
                          )}

                          {/* Assignee */}
                          {visibleColumns.assignee && (
                            <div className="col-span-1.5 flex items-center gap-1.5 pr-2 truncate">
                              <div className="w-5 h-5 rounded-full bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                {task.assigneeName.slice(0, 1)}
                              </div>
                              <span className="text-slate-700 truncate font-medium">{task.assigneeName}</span>
                            </div>
                          )}

                          {/* Due Date */}
                          {visibleColumns.dueDate && (
                            <div className="col-span-1.5 flex items-center gap-1 text-slate-600 font-medium">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{task.dueDate}</span>
                            </div>
                          )}

                          {/* Priority */}
                          {visibleColumns.priority && (
                            <div className="col-span-1">
                              {getPriorityPill(task.priority)}
                            </div>
                          )}

                          {/* Custom Field 1 */}
                          {visibleColumns.customField1 && (
                            <div className="col-span-1 text-slate-600 truncate pr-2" title={custom.field1}>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-700 truncate inline-block max-w-full">
                                {custom.field1}
                              </span>
                            </div>
                          )}

                          {/* Custom Field 2 */}
                          {visibleColumns.customField2 && (
                            <div className="col-span-1 text-slate-600 truncate" title={custom.field2}>
                              <span className="text-[10px] font-semibold text-slate-800 truncate">
                                {custom.field2}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
