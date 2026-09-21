import React, { useState } from 'react';
import { WorkflowType, ProjectViewMode, TaskPriority, WorkflowInfo } from '../types';
import { WORKFLOWS } from '../data/initialData';
import { 
  LayoutGrid, 
  List, 
  Calendar, 
  BarChart3, 
  BookOpen, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Sparkles, 
  User, 
  MapPin,
  Check,
  ChevronDown
} from 'lucide-react';

interface WorkflowSelectorProps {
  selectedWorkflow: WorkflowType | 'ALL';
  onSelectWorkflow: (wf: WorkflowType | 'ALL') => void;
  activeViewMode: ProjectViewMode;
  onSelectViewMode: (mode: ProjectViewMode) => void;
  onOpenScopeModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  priorityFilter: TaskPriority | 'ALL';
  onPriorityFilterChange: (p: TaskPriority | 'ALL') => void;
  milestoneOnly: boolean;
  onMilestoneOnlyChange: (val: boolean) => void;
  taskStats: {
    total: number;
    inProgress: number;
    dueDiligence: number;
    completed: number;
  };
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
  onToggleColumn: (colKey: string) => void;
}

export const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({
  selectedWorkflow,
  onSelectWorkflow,
  activeViewMode,
  onSelectViewMode,
  onOpenScopeModal,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  milestoneOnly,
  onMilestoneOnlyChange,
  taskStats,
  workflowInfo,
  visibleColumns,
  onToggleColumn,
}) => {
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 pt-3 pb-2 space-y-3">
      {/* Top Project Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            id="wf-filter-all"
            onClick={() => onSelectWorkflow('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedWorkflow === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All 4 Projects
          </button>

          {WORKFLOWS.map((wf) => {
            const isSelected = selectedWorkflow === wf.code;
            return (
              <button
                key={wf.id}
                id={`wf-filter-${wf.code.toLowerCase()}`}
                onClick={() => onSelectWorkflow(wf.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{wf.title}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                    isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {wf.region}
                </span>
              </button>
            );
          })}
        </div>

        {/* Project Scope & SOP Modal Opener */}
        {workflowInfo && (
          <button
            id="btn-open-scope-dossier"
            onClick={onOpenScopeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer border border-slate-200 shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Customize Project Scope & SOP</span>
          </button>
        )}
      </div>

      {/* Project Meta Bar if a single project is selected */}
      {workflowInfo && (
        <div className="flex flex-wrap items-center justify-between gap-2 py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-slate-800 font-semibold">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Lead: {workflowInfo.leadConsultant}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Region: {workflowInfo.region}</span>
            </div>
            <div className="hidden md:inline-block text-slate-500 max-w-lg truncate italic">
              "{workflowInfo.shortDesc}"
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
            <span>Tasks: <strong>{taskStats.total}</strong></span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">{taskStats.inProgress} in execution</span>
          </div>
        </div>
      )}

      {/* Asana Views Bar (Board, List, Timeline, Dashboard) + Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
        {/* View Mode Buttons */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
          <button
            id="view-mode-board"
            onClick={() => onSelectViewMode('BOARD')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeViewMode === 'BOARD'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>

          <button
            id="view-mode-list"
            onClick={() => onSelectViewMode('LIST')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeViewMode === 'LIST'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>

          <button
            id="view-mode-timeline"
            onClick={() => onSelectViewMode('TIMELINE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeViewMode === 'TIMELINE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>

          <button
            id="view-mode-dashboard"
            onClick={() => onSelectViewMode('DASHBOARD')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeViewMode === 'DASHBOARD'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks, codes, fields..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 transition"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value as TaskPriority | 'ALL')}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent only</option>
            <option value="HIGH">High only</option>
            <option value="MEDIUM">Medium only</option>
            <option value="LOW">Low only</option>
          </select>

          {/* Milestones Only Toggle */}
          <button
            onClick={() => onMilestoneOnlyChange(!milestoneOnly)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
              milestoneOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className={`w-3 h-3 ${milestoneOnly ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>Milestones</span>
          </button>

          {/* Custom Fields Column Visibility Toggle (for List View) */}
          {activeViewMode === 'LIST' && (
            <div className="relative">
              <button
                onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                <span>Columns</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showColumnsMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-30 space-y-1 text-xs">
                  <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1">
                    Display Columns
                  </div>
                  {[
                    { key: 'status', label: 'Status' },
                    { key: 'assignee', label: 'Assignee' },
                    { key: 'dueDate', label: 'Due Date' },
                    { key: 'priority', label: 'Priority' },
                    { key: 'customField1', label: workflowInfo?.customFieldLabels?.field1 || 'Custom Field 1' },
                    { key: 'customField2', label: workflowInfo?.customFieldLabels?.field2 || 'Custom Field 2' },
                  ].map((col) => {
                    const isVisible = (visibleColumns as any)[col.key];
                    return (
                      <button
                        key={col.key}
                        onClick={() => onToggleColumn(col.key)}
                        className="w-full flex items-center justify-between px-2 py-1 rounded-md text-left hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        <span className="truncate">{col.label}</span>
                        {isVisible && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
