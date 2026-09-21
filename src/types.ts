export type UserRole = 'INTERNAL_CONSULTANT' | 'UNIVERSITY_COORDINATOR' | 'LOCAL_PARTNER';

export type WorkflowType = 
  | 'WASH_DEVELOPMENT'
  | 'FUNDRAISING_INITIATIVES'
  | 'HUMANITARIAN_RESEARCH'
  | 'SOCIAL_IMPACT_INTERNSHIP'
  | 'ENVIRONMENTAL_DEV'
  | 'SOCIAL_DEV'
  | 'FUNDRAISING_ADVISORY';

export type ProjectViewMode = 'board' | 'list' | 'timeline' | 'dashboard';

export type TaskStatus = 'BACKLOG' | 'DUE_DILIGENCE' | 'IN_PROGRESS' | 'COMPLIANCE_REVIEW' | 'COMPLETED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'REPORTED' | 'INVESTIGATING' | 'ACTION_TAKEN' | 'ESCALATED_TO_DIRECTORS' | 'RESOLVED';

export type PlacementStatus = 'PROPOSED' | 'VETTING' | 'SCC_PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';

export type SCCModuleType = 
  | 'MODULE_1_CONTROLLER_TO_CONTROLLER'
  | 'MODULE_2_CONTROLLER_TO_PROCESSOR'
  | 'MODULE_3_PROCESSOR_TO_PROCESSOR'
  | 'MODULE_4_PROCESSOR_TO_CONTROLLER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  regionalHub: string;
  phone: string;
  avatarUrl?: string;
}

export type SupportedTimeZone = string;

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  userRole: UserRole;
  timeZone: SupportedTimeZone;
  timeZoneLabel: string;
  utcOffset: string;
  city: string;
  country: string;
  workflowSpecialty: WorkflowType;
  phone: string;
  bio: string;
}

export interface RegionalTimeZoneConfig {
  key: string;
  name: string;
  shortCode: string;
  utcOffset: number; // e.g. +7, +1, -4, +9, -5
  offsetDisplay: string;
  coverageCountries: string;
  primaryLocations: string;
}

export interface WorkflowInfo {
  id: string;
  code: WorkflowType;
  title: string;
  shortDesc: string;
  scopeOfWork: string;
  region: string;
  leadConsultant: string;
  badgeColor: string;
  corePillars: string[];
  customFieldLabels?: {
    field1: string;
    field2: string;
    field3: string;
  };
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
}

export interface DueDiligenceItem {
  id: string;
  title: string;
  category: 'Legal Standing' | 'Safeguarding' | 'Financial Integrity' | 'Duty of Care' | 'GDPR Compliance' | 'WASH Quality Assurance' | 'Methodological Integrity';
  isMandatory: boolean;
  isCompleted: boolean;
  verifiedAt?: string;
  verificationNotes?: string;
}

export interface TaskCustomFields {
  // WASH Development fields
  waterInfrastructureType?: string;
  meIndicatorTarget?: string;
  washRiskLevel?: string;
  waterQualityIndex?: string;

  // Fundraising Initiatives fields
  donorAgency?: string;
  grantAmountUSD?: number;
  proposalPhase?: string;
  capacityDomain?: string;

  // Humanitarian Research Data Programme fields
  researchMethodology?: string;
  communitySampleSize?: number;
  trainingSessionsCount?: number;
  policyDeliverable?: string;

  // Social Impact Internship Programme fields
  sendingUniversity?: string;
  hostNgoPartner?: string;
  internDegreeProgram?: string;
  cohortSize?: number;

  [key: string]: any;
}

export interface Task {
  id: string;
  taskCode: string;
  workflowCode: WorkflowType;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate: string;
  assigneeName: string;
  assigneeRole: UserRole;
  projectScopeCategory?: string;
  customFields?: TaskCustomFields;
  isMilestone?: boolean;
  estimatedHours?: number;
  ngoId?: string;
  ngoName?: string;
  universityId?: string;
  universityName?: string;
  foreignGrantDonor?: string;      // Specific to NGO Fundraising Advisory
  donorGrantAmountUSD?: number;   // Specific to NGO Fundraising Advisory
  subtasks: Subtask[];
  dependsOnTaskId?: string;       // Task Dependency (Finish-to-Start)
  dependsOnTaskTitle?: string;
  dueDiligenceChecklist?: DueDiligenceItem[];
  createdAt: string;
}

export interface UniversityRecord {
  id: string;
  name: string;
  country: string;
  city: string;
  domain: string;                 // Validated via regex \.(edu|ac\.[a-z]{2}|ca|...)
  coordinatorName: string;
  coordinatorEmail: string;       // Validated via RFC regex
  annualQuota: number;
  activeStudents: number;
  gdprDpaSigned: boolean;
  partnershipTier: 'STRATEGIC_GLOBAL' | 'STANDARD' | 'PROBATION';
}

export interface NGORecord {
  id: string;
  name: string;
  legalName: string;
  country: string;
  city: string;
  registrationNumber: string;     // Validated via national regex (e.g., KH-MOI-2018-4912)
  focusArea: string;
  safeguardingRating: 'TIER_A_VERIFIED' | 'TIER_B_CONDITIONAL' | 'LEVEL_1_PENDING';
  vettedStatus: boolean;
  contactPerson: string;
  contactEmail: string;           // Validated via RFC regex
  phone: string;                  // Validated via E.164 regex
  officeAddress: string;
  counterTerrorismScreened: boolean;
  moiVerified: boolean;
  notes?: string;
}

export interface StudentPlacement {
  id: string;
  reference: string;
  studentName: string;
  studentEmail: string;
  nationality: string;
  universityName: string;
  degreeProgram: string;
  ngoName: string;
  hostCountry: string;
  startDate: string;
  endDate: string;
  status: PlacementStatus;
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
  stipendUSD: number;
  sccAgreementId?: string;
  sccExecuted: boolean;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface DutyOfCareIncidentRecord {
  id: string;
  incidentNumber: string;
  title: string;
  category: 'MEDICAL_EMERGENCY' | 'SAFEGUARDING_HARASSMENT' | 'NATURAL_HAZARD' | 'POLITICAL_VISA' | 'SECURITY';
  severity: IncidentSeverity;
  status: IncidentStatus;
  country: string;
  location: string;
  affectedPerson: string;
  reportedBy: string;
  incidentDescription: string;
  immediateActionTaken: string;
  isEscalatedToRegionalDirector: boolean;
  dutyOfCareProtocol: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface SCCAgreementRecord {
  id: string;
  reference: string;
  dataExporterName: string;
  dataExporterCountry: string;
  dataImporterName: string;
  dataImporterCountry: string;
  module: SCCModuleType;
  status: 'DRAFT' | 'EXECUTED' | 'UNDER_AUDIT' | 'RENEWAL_REQUIRED';
  transferScenario: string;
  categoriesOfData: string[];
  technicalMeasures: {
    encryptionInTransit: string;
    encryptionAtRest: string;
    accessControl: string;
    dataRetentionDays: number;
  };
  transferImpactAssessmentCompleted: boolean;
  tiaSummary: string;
  validUntil: string;
  digitalSignatureHash?: string;
  executedAt?: string;
  complianceAuditLogs: Array<{
    timestamp: string;
    event: string;
    legalBasis: string;
    hash: string;
  }>;
}

export type NavigationTab = 'tasks' | 'crm' | 'risks' | 'compliance' | 'team' | 'timezones' | 'deliverables';
