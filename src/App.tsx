import React, { useState, useEffect } from 'react';
import { 
  Task, 
  WorkflowType, 
  UserRole, 
  TaskStatus, 
  TaskPriority,
  ProjectViewMode,
  WorkflowInfo,
  NGORecord, 
  UniversityRecord, 
  StudentPlacement, 
  DutyOfCareIncidentRecord, 
  IncidentStatus, 
  SCCAgreementRecord,
  TeamMember,
  RegionalTimeZoneConfig,
  NavigationTab
} from './types';
import { 
  INITIAL_TASKS, 
  INITIAL_NGOS, 
  INITIAL_UNIVERSITIES, 
  INITIAL_PLACEMENTS, 
  INITIAL_INCIDENTS, 
  INITIAL_SCC_AGREEMENTS,
  TEAM_MEMBERS,
  REGIONAL_TIME_ZONES,
  WORKFLOWS
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { WorkflowSelector } from './components/WorkflowSelector';
import { TaskBoard } from './components/TaskBoard';
import { TaskList } from './components/TaskList';
import { TaskTimeline } from './components/TaskTimeline';
import { ProjectDashboard } from './components/ProjectDashboard';
import { ProjectScopeModal } from './components/ProjectScopeModal';
import { TaskModal } from './components/TaskModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CRMModule } from './components/CRMModule';
import { RiskEscalationDashboard } from './components/RiskEscalationDashboard';
import { ComplianceSCCModule } from './components/ComplianceSCCModule';
import { CodeDeliverablesViewer } from './components/CodeDeliverablesViewer';
import { TeamDirectoryModal } from './components/TeamDirectoryModal';
import { TimeZonesModal } from './components/TimeZonesModal';
import { TeamDirectoryView } from './components/TeamDirectoryView';
import { TimeZonesView } from './components/TimeZonesView';
import { UserGuideModal } from './components/UserGuideModal';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  // Navigation & Role State
  const [activeTab, setActiveTab] = useState<NavigationTab>('tasks');
  const [currentRole, setCurrentRole] = useState<UserRole>('INTERNAL_CONSULTANT');
  const [userEmail, setUserEmail] = useState('sokha.chen@northstar-sg.com');

  // Workflow / Project filter
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | 'ALL'>('ALL');
  const [activeViewMode, setActiveViewMode] = useState<ProjectViewMode>('BOARD');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');
  const [milestoneOnly, setMilestoneOnly] = useState(false);

  // List View Column Toggles
  const [visibleColumns, setVisibleColumns] = useState({
    status: true,
    assignee: true,
    dueDate: true,
    priority: true,
    customField1: true,
    customField2: true,
    checklists: true,
  });

  const handleToggleColumn = (colKey: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [colKey]: !(prev as any)[colKey],
    }));
  };

  // Customizable Workflows / Projects State
  const [workflows, setWorkflows] = useState<WorkflowInfo[]>(() => {
    try {
      const saved = localStorage.getItem('ns_workflows_v2');
      return saved ? JSON.parse(saved) : WORKFLOWS;
    } catch {
      return WORKFLOWS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ns_workflows_v2', JSON.stringify(workflows));
    } catch (e) {
      console.error(e);
    }
  }, [workflows]);

  // Core Data Collections - Starts empty so user can add each project
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('ns_user_tasks_v1');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ns_user_tasks_v1', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  const [ngos, setNgos] = useState<NGORecord[]>(INITIAL_NGOS);
  const [universities, setUniversities] = useState<UniversityRecord[]>(INITIAL_UNIVERSITIES);
  const [placements, setPlacements] = useState<StudentPlacement[]>(INITIAL_PLACEMENTS);
  const [incidents, setIncidents] = useState<DutyOfCareIncidentRecord[]>(INITIAL_INCIDENTS);
  const [sccAgreements, setSccAgreements] = useState<SCCAgreementRecord[]>(INITIAL_SCC_AGREEMENTS);

  // Dynamic Team & Time Zones State with Local Persistence
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('ns_team_members');
      return saved ? JSON.parse(saved) : TEAM_MEMBERS;
    } catch {
      return TEAM_MEMBERS;
    }
  });

  const [timeZones, setTimeZones] = useState<RegionalTimeZoneConfig[]>(() => {
    try {
      const saved = localStorage.getItem('ns_time_zones');
      return saved ? JSON.parse(saved) : REGIONAL_TIME_ZONES;
    } catch {
      return REGIONAL_TIME_ZONES;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ns_team_members', JSON.stringify(teamMembers));
    } catch (e) {
      console.error(e);
    }
  }, [teamMembers]);

  useEffect(() => {
    try {
      localStorage.setItem('ns_time_zones', JSON.stringify(timeZones));
    } catch (e) {
      console.error(e);
    }
  }, [timeZones]);

  // Modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isTimeZonesModalOpen, setIsTimeZonesModalOpen] = useState(false);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [initialZoneKey, setInitialZoneKey] = useState<string>('ALL');
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Notification Banner
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'alert' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'alert' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Team and Time Zone Handlers
  const handleAddMember = (newMember: TeamMember) => {
    setTeamMembers((prev) => [newMember, ...prev]);
    showNotification(`Added ${newMember.name} (${newMember.roleTitle}) to operational team.`);
  };

  const handleUpdateMember = (updatedMember: TeamMember) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
    showNotification(`Updated profile for ${updatedMember.name}.`);
  };

  const handleDeleteMember = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (member) {
      showNotification(`Removed ${member.name} from team directory.`);
    }
  };

  const handleAddTimeZone = (newZone: RegionalTimeZoneConfig) => {
    setTimeZones((prev) => [...prev, newZone]);
    showNotification(`Configured operational time zone: ${newZone.name} (${newZone.offsetDisplay}).`);
  };

  const handleUpdateTimeZone = (updatedZone: RegionalTimeZoneConfig) => {
    setTimeZones((prev) => prev.map((z) => (z.key === updatedZone.key ? updatedZone : z)));
    setTeamMembers((prev) =>
      prev.map((m) =>
        m.timeZone === updatedZone.key
          ? {
              ...m,
              timeZoneLabel: `${updatedZone.name} (${updatedZone.offsetDisplay})`,
              utcOffset: updatedZone.offsetDisplay,
            }
          : m
      )
    );
    showNotification(`Updated time zone ${updatedZone.name}.`);
  };

  const handleDeleteTimeZone = (zoneKey: string) => {
    if (timeZones.length <= 1) {
      showNotification('At least one operational time zone must remain active.', 'alert');
      return;
    }
    const deletedTz = timeZones.find((z) => z.key === zoneKey);
    const remainingZones = timeZones.filter((z) => z.key !== zoneKey);
    const fallbackZone = remainingZones[0];

    setTimeZones(remainingZones);
    setTeamMembers((prev) =>
      prev.map((m) => {
        if (m.timeZone === zoneKey) {
          return {
            ...m,
            timeZone: fallbackZone.key,
            timeZoneLabel: `${fallbackZone.name} (${fallbackZone.offsetDisplay})`,
            utcOffset: fallbackZone.offsetDisplay,
          };
        }
        return m;
      })
    );
    showNotification(`Deleted time zone ${deletedTz?.name || zoneKey}. Reassigned members to ${fallbackZone.name}.`);
  };

  const handleResetTeamDefaults = () => {
    setTeamMembers(TEAM_MEMBERS);
    setTimeZones(REGIONAL_TIME_ZONES);
    try {
      localStorage.removeItem('ns_team_members');
      localStorage.removeItem('ns_time_zones');
    } catch (e) {
      console.error(e);
    }
    showNotification('Reset team members and time zones to default Northstar roster.');
  };

  // Customizable Scope Update Handler
  const handleUpdateProjectScope = (updatedProject: WorkflowInfo) => {
    setWorkflows((prev) => prev.map((w) => (w.code === updatedProject.code ? updatedProject : w)));
    showNotification(`Updated project scope and SOP configuration for ${updatedProject.title}.`);
  };

  // Role Switching Handler
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'INTERNAL_CONSULTANT') {
      setUserEmail('sokha.chen@northstar-sg.com');
      showNotification('Switched to Internal Consultant (Full Portfolio & Customization Authority)');
    } else if (role === 'UNIVERSITY_COORDINATOR') {
      setUserEmail('sarah.jenkins@ox.ac.uk');
      showNotification('Switched to University Coordinator (Social Impact Internship Programme scope)');
    } else {
      setUserEmail('vannak.keo@mekong-conservation.org');
      showNotification('Switched to Local Partner (Host NGO Field Execution scope)');
    }
  };

  // Task Handlers
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    const updated = tasks.find((t) => t.id === taskId);
    if (updated) {
      showNotification(`Task ${updated.taskCode} moved to ${newStatus.replace(/_/g, ' ')}`);
    }
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    showNotification(`Task ${updatedTask.taskCode} updated successfully.`);
  };

  const handleCreateTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    showNotification(`Created task ${newTask.taskCode}: ${newTask.title}`);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // CRM Handlers
  const handleAddNgo = (newNgo: NGORecord) => {
    setNgos((prev) => [newNgo, ...prev]);
    showNotification(`NGO partner ${newNgo.name} registered and screened.`);
  };

  const handleAddUniversity = (newUni: UniversityRecord) => {
    setUniversities((prev) => [newUni, ...prev]);
    showNotification(`Partner university ${newUni.name} registered.`);
  };

  const handleAddPlacement = (newPlacement: StudentPlacement) => {
    setPlacements((prev) => [newPlacement, ...prev]);
    showNotification(`Placement created for ${newPlacement.studentName}. SCC contract initiated.`);
  };

  // Risk Escalation Handlers
  const handleLogIncident = (newIncident: DutyOfCareIncidentRecord) => {
    setIncidents((prev) => [newIncident, ...prev]);
    if (newIncident.severity === 'CRITICAL' || newIncident.severity === 'HIGH') {
      showNotification(
        `🚨 EMERGENCY: Incident ${newIncident.incidentNumber} escalated to Regional Directors!`,
        'alert'
      );
    } else {
      showNotification(`Duty-of-care incident ${newIncident.incidentNumber} logged.`);
    }
  };

  const handleUpdateIncidentStatus = (incidentId: string, newStatus: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
    );
    showNotification(`Incident status updated to ${newStatus.replace(/_/g, ' ')}`);
  };

  // Automated SCC Execution Handler
  const handleExecuteSCC = (agreementId: string, signatureHash: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    setSccAgreements((prev) =>
      prev.map((agr) =>
        agr.id === agreementId
          ? {
              ...agr,
              status: 'EXECUTED',
              digitalSignatureHash: signatureHash,
              executedAt: timestamp,
              complianceAuditLogs: [
                {
                  timestamp,
                  event: 'Automated Standard Contractual Clauses (SCC) Execution & Encryption Verification',
                  actorRole: currentRole,
                  legalBasis: 'GDPR Art. 46(2)(c) & Commission Implementing Decision (EU) 2021/914',
                  hash: signatureHash,
                },
                ...agr.complianceAuditLogs,
              ],
            }
          : agr
      )
    );

    setPlacements((prev) =>
      prev.map((p) => ({
        ...p,
        sccExecuted: true,
        status: p.status === 'SCC_PENDING' ? 'PLACEMENT_APPROVED' : p.status,
      }))
    );

    showNotification(`SCC Agreement executed with cryptographic SHA-256 signature!`);
  };

  // RBAC & Workflow Filtering
  const filteredTasks = tasks.filter((t) => {
    // Workflow filter
    if (selectedWorkflow !== 'ALL' && t.workflowCode !== selectedWorkflow) {
      return false;
    }
    // Priority filter
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) {
      return false;
    }
    // Milestone filter
    if (milestoneOnly && !t.isMilestone) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = t.title.toLowerCase().includes(q);
      const matchesCode = t.taskCode.toLowerCase().includes(q);
      const matchesAssignee = t.assigneeName.toLowerCase().includes(q);
      const matchesScope = t.projectScopeCategory?.toLowerCase().includes(q);
      const matchesCustom = JSON.stringify(t.customFields || {}).toLowerCase().includes(q);
      if (!matchesTitle && !matchesCode && !matchesAssignee && !matchesScope && !matchesCustom) {
        return false;
      }
    }
    return true;
  });

  // Active Project Info
  const activeWorkflowInfo = workflows.find((w) => w.code === selectedWorkflow);

  // Calculate High-level Portfolio Metrics
  const taskStats = {
    total: filteredTasks.length,
    inProgress: filteredTasks.filter((t) => t.status === 'IN_PROGRESS').length,
    dueDiligence: filteredTasks.filter((t) => t.status === 'DUE_DILIGENCE').length,
    completed: filteredTasks.filter((t) => t.status === 'COMPLETED').length,
  };

  const criticalIncidentCount = incidents.filter(
    (i) => (i.severity === 'CRITICAL' || i.severity === 'HIGH') && i.status !== 'RESOLVED'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      {/* Top Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        criticalIncidentCount={criticalIncidentCount}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        onOpenTimeZonesModal={(zoneKey) => {
          if (zoneKey) setInitialZoneKey(zoneKey);
          setIsTimeZonesModalOpen(true);
        }}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        timeZones={timeZones}
        teamMemberCount={teamMembers.length}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold ${
              notification.type === 'alert'
                ? 'bg-rose-600 text-white shadow-rose-900/20'
                : 'bg-emerald-600 text-white shadow-emerald-900/20'
            }`}
          >
            {notification.type === 'alert' ? (
              <ShieldAlert className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Asana Project Selector, View Tabs & Filters Bar (shown on Tasks/PM tab) */}
      {activeTab === 'tasks' && (
        <WorkflowSelector
          selectedWorkflow={selectedWorkflow}
          onSelectWorkflow={setSelectedWorkflow}
          activeViewMode={activeViewMode}
          onSelectViewMode={setActiveViewMode}
          onOpenScopeModal={() => setIsScopeModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          milestoneOnly={milestoneOnly}
          onMilestoneOnlyChange={setMilestoneOnly}
          taskStats={taskStats}
          workflowInfo={activeWorkflowInfo}
          visibleColumns={visibleColumns}
          onToggleColumn={handleToggleColumn}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'tasks' && (
          <>
            {activeViewMode === 'BOARD' && (
              <TaskBoard
                tasks={filteredTasks}
                onTaskClick={handleTaskClick}
                onStatusChange={handleStatusChange}
                onOpenCreateModal={() => setIsCreateTaskModalOpen(true)}
                currentUserRole={currentRole}
              />
            )}

            {activeViewMode === 'LIST' && (
              <TaskList
                tasks={filteredTasks}
                onTaskClick={handleTaskClick}
                onStatusChange={handleStatusChange}
                onOpenCreateModal={() => setIsCreateTaskModalOpen(true)}
                currentUserRole={currentRole}
                selectedWorkflow={selectedWorkflow}
                workflowInfo={activeWorkflowInfo}
                visibleColumns={visibleColumns}
              />
            )}

            {activeViewMode === 'TIMELINE' && (
              <TaskTimeline
                tasks={filteredTasks}
                onTaskClick={handleTaskClick}
                selectedWorkflow={selectedWorkflow}
                currentUserRole={currentRole}
              />
            )}

            {activeViewMode === 'DASHBOARD' && (
              <ProjectDashboard
                tasks={filteredTasks}
                selectedWorkflow={selectedWorkflow}
                workflowInfo={activeWorkflowInfo}
                teamMembers={teamMembers}
                onTaskClick={handleTaskClick}
                onOpenScopeModal={() => setIsScopeModalOpen(true)}
              />
            )}
          </>
        )}

        {activeTab === 'crm' && (
          <CRMModule
            universities={universities}
            ngos={ngos}
            placements={placements}
            onAddNgo={handleAddNgo}
            onAddUniversity={handleAddUniversity}
            onAddPlacement={handleAddPlacement}
            currentUserRole={currentRole}
          />
        )}

        {activeTab === 'risks' && (
          <RiskEscalationDashboard
            incidents={incidents}
            onLogIncident={handleLogIncident}
            onUpdateStatus={handleUpdateIncidentStatus}
            currentUserRole={currentRole}
            userEmail={userEmail}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceSCCModule
            agreements={sccAgreements}
            onExecuteSCC={handleExecuteSCC}
            currentUserRole={currentRole}
          />
        )}

        {/* Dedicated Tab View 1: Team Directory */}
        {activeTab === 'team' && (
          <TeamDirectoryView
            teamMembers={teamMembers}
            timeZones={timeZones}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onResetToDefaults={handleResetTeamDefaults}
            initialZoneKey={initialZoneKey}
          />
        )}

        {/* Dedicated Tab View 2: Regional Time Zones */}
        {activeTab === 'timezones' && (
          <TimeZonesView
            timeZones={timeZones}
            teamMembers={teamMembers}
            onAddTimeZone={handleAddTimeZone}
            onUpdateTimeZone={handleUpdateTimeZone}
            onDeleteTimeZone={handleDeleteTimeZone}
            onResetToDefaults={handleResetTeamDefaults}
          />
        )}

        {activeTab === 'deliverables' && <CodeDeliverablesViewer />}
      </main>

      {/* Task Details & Due Diligence Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        allTasks={tasks}
        currentUserRole={currentRole}
        teamMembers={teamMembers}
        timeZones={timeZones}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onCreateTask={handleCreateTask}
        allTasks={tasks}
        currentUserRole={currentRole}
        defaultWorkflow={selectedWorkflow === 'ALL' ? 'WASH_DEVELOPMENT' : selectedWorkflow}
        teamMembers={teamMembers}
        timeZones={timeZones}
      />

      {/* Customizable Project Scope & SOP Modal */}
      {activeWorkflowInfo && (
        <ProjectScopeModal
          isOpen={isScopeModalOpen}
          onClose={() => setIsScopeModalOpen(false)}
          project={activeWorkflowInfo}
          onUpdateProjectScope={handleUpdateProjectScope}
          teamMembers={teamMembers}
        />
      )}

      {/* Dedicated Modal 1: Team Directory Modal */}
      <TeamDirectoryModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        teamMembers={teamMembers}
        timeZones={timeZones}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
        onResetToDefaults={handleResetTeamDefaults}
        initialZoneKey={initialZoneKey}
      />

      {/* Dedicated Modal 2: Regional Time Zones Modal */}
      <TimeZonesModal
        isOpen={isTimeZonesModalOpen}
        onClose={() => setIsTimeZonesModalOpen(false)}
        timeZones={timeZones}
        teamMembers={teamMembers}
        onAddTimeZone={handleAddTimeZone}
        onUpdateTimeZone={handleUpdateTimeZone}
        onDeleteTimeZone={handleDeleteTimeZone}
        onResetToDefaults={handleResetTeamDefaults}
      />

      {/* First-Time User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
