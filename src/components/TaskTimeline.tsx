import React, { useState, useMemo } from 'react';
import { Task, WorkflowType, UserRole } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Link2, Clock, Info } from 'lucide-react';

interface TaskTimelineProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  selectedWorkflow: WorkflowType | 'ALL';
  currentUserRole: UserRole;
}

export const TaskTimeline: React.FC<TaskTimelineProps> = ({
  tasks,
  onTaskClick,
  selectedWorkflow,
  currentUserRole,
}) => {
  // Timeline viewport dates (default: August to December 2026)
  const [viewMonthOffset, setViewMonthOffset] = useState(0);

  // Define months for the timeline window
  const months = useMemo(() => {
    // Reference base year: 2026
    const baseMonths = [
      { year: 2026, month: 4, name: 'May 2026', days: 31 },
      { year: 2026, month: 5, name: 'Jun 2026', days: 30 },
      { year: 2026, month: 6, name: 'Jul 2026', days: 31 },
      { year: 2026, month: 7, name: 'Aug 2026', days: 31 },
      { year: 2026, month: 8, name: 'Sep 2026', days: 30 },
      { year: 2026, month: 9, name: 'Oct 2026', days: 31 },
      { year: 2026, month: 10, name: 'Nov 2026', days: 30 },
      { year: 2026, month: 11, name: 'Dec 2026', days: 31 },
    ];
    return baseMonths;
  }, []);

  // Calculate timeline start and end dates in ms
  const timelineStart = useMemo(() => new Date(2026, 4, 1).getTime(), []);
  const timelineEnd = useMemo(() => new Date(2026, 11, 31).getTime(), []);
  const totalDurationMs = timelineEnd - timelineStart;

  // Convert a date string (YYYY-MM-DD) to a percentage position along the timeline
  const getPercentPosition = (dateStr?: string, defaultDateMs?: number) => {
    if (!dateStr) {
      if (!defaultDateMs) return 10;
      return Math.max(0, Math.min(100, ((defaultDateMs - timelineStart) / totalDurationMs) * 100));
    }
    const targetMs = new Date(dateStr).getTime();
    return Math.max(0, Math.min(100, ((targetMs - timelineStart) / totalDurationMs) * 100));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500 hover:bg-rose-600 border-rose-600 text-white';
      case 'HIGH':
        return 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white';
      case 'MEDIUM':
        return 'bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white';
      default:
        return 'bg-slate-500 hover:bg-slate-600 border-slate-600 text-white';
    }
  };

  // Sort tasks by due date
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  }, [tasks]);

  return (
    <div className="flex-1 bg-white p-4 sm:p-6 space-y-4 overflow-x-auto min-h-[calc(100vh-220px)] text-xs">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Project Gantt & Milestone Timeline</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Visualize task schedules, critical path milestones, and inter-task dependencies across 2026
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rotate-45 bg-amber-500 rounded-xs" />
            <span>Milestone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-xs bg-rose-500" />
            <span>Urgent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-xs bg-emerald-600" />
            <span>In Execution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Dependency</span>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Container */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs min-w-[1100px] bg-white">
        {/* Months Scale Header */}
        <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 select-none">
          {months.map((m, idx) => (
            <div
              key={idx}
              className="py-2.5 px-3 text-center border-r border-slate-200 last:border-r-0 font-bold text-[11px] text-slate-700"
            >
              {m.name}
            </div>
          ))}
        </div>

        {/* Timeline Grid Rows */}
        <div className="relative divide-y divide-slate-100 min-h-[450px]">
          {/* Vertical month guide lines */}
          <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
            {months.map((_, idx) => (
              <div key={idx} className="border-r border-slate-100 last:border-r-0 h-full" />
            ))}
          </div>

          {/* Task Rows */}
          {sortedTasks.length === 0 ? (
            <div className="py-24 text-center space-y-2 relative z-10">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-slate-700 font-bold text-xs">No scheduled tasks in this group</div>
              <p className="text-slate-400 text-[11px] max-w-sm mx-auto">
                Tasks created with a start date and due date will automatically plot on this Gantt schedule.
              </p>
            </div>
          ) : (
            sortedTasks.map((task) => {
            const startPct = getPercentPosition(task.startDate, new Date(task.dueDate).getTime() - 14 * 86400000);
            const endPct = getPercentPosition(task.dueDate);
            const widthPct = Math.max(3.5, endPct - startPct);
            const isMilestone = task.isMilestone;
            const hasDep = Boolean(task.dependsOnTaskId);

            return (
              <div
                key={task.id}
                className="relative py-3 hover:bg-slate-50/70 transition flex items-center group cursor-pointer"
                onClick={() => onTaskClick(task)}
              >
                {/* Left Label fixed overlay on hover or standard */}
                <div className="w-64 shrink-0 px-3 truncate z-10 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400 font-semibold">{task.taskCode}</span>
                  <span className="font-medium text-xs text-slate-800 truncate group-hover:text-emerald-700">
                    {task.title}
                  </span>
                </div>

                {/* Timeline Bar Track */}
                <div className="flex-1 relative h-7 flex items-center">
                  {isMilestone ? (
                    // Milestone Diamond Marker
                    <div
                      style={{ left: `${endPct}%` }}
                      className="absolute -translate-x-1/2 z-20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <div className="w-5 h-5 rotate-45 bg-amber-500 border-2 border-white shadow-md rounded-xs flex items-center justify-center hover:scale-110 transition">
                        <Sparkles className="w-2.5 h-2.5 text-white -rotate-45" />
                      </div>
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap hidden group-hover:inline-block">
                        {task.dueDate} (Milestone)
                      </span>
                    </div>
                  ) : (
                    // Regular Task Bar
                    <div
                      style={{
                        left: `${startPct}%`,
                        width: `${widthPct}%`,
                      }}
                      className={`absolute h-6 rounded-md shadow-xs border px-2 flex items-center justify-between text-[10px] font-semibold transition-all hover:shadow-md cursor-pointer ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      <div className="flex items-center gap-1 truncate">
                        {hasDep && <Link2 className="w-3 h-3 text-white/80 shrink-0" />}
                        <span className="truncate">{task.title}</span>
                      </div>
                      <span className="text-[9px] opacity-90 pl-1 shrink-0">
                        {task.dueDate.slice(5)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
};
