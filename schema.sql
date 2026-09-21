-- ============================================================================
-- NORTHSTAR STRATEGY GROUP - ENTERPRISE PM & CRM DATABASE SCHEMA
-- PostgreSQL 14+ Relational Schema with Strict RBAC, Automated SCC Compliance,
-- Task Dependencies, Relational CRM, and Duty-of-Care Safeguarding Escalations.
-- Operational Regions: Southeast Asia (KH, VN, TH, ID), Europe (UK, DE, FR), North America (US, CA)
-- ============================================================================

-- Drop tables in reverse dependency order if recreating
DROP TABLE IF EXISTS incident_audit_logs CASCADE;
DROP TABLE IF EXISTS duty_of_care_incidents CASCADE;
DROP TABLE IF EXISTS scc_compliance_logs CASCADE;
DROP TABLE IF EXISTS scc_agreements CASCADE;
DROP TABLE IF EXISTS checklist_items CASCADE;
DROP TABLE IF EXISTS due_diligence_checklists CASCADE;
DROP TABLE IF EXISTS task_dependencies CASCADE;
DROP TABLE IF EXISTS subtasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS student_placements CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS ngos CASCADE;
DROP TABLE IF EXISTS universities CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP TYPE IF EXISTS workflow_type_enum CASCADE;
DROP TYPE IF EXISTS task_status_enum CASCADE;
DROP TYPE IF EXISTS task_priority_enum CASCADE;
DROP TYPE IF EXISTS placement_status_enum CASCADE;
DROP TYPE IF EXISTS scc_clause_module_enum CASCADE;
DROP TYPE IF EXISTS scc_status_enum CASCADE;
DROP TYPE IF EXISTS incident_severity_enum CASCADE;
DROP TYPE IF EXISTS incident_status_enum CASCADE;
DROP TYPE IF EXISTS dependency_type_enum CASCADE;

-- Enable UUID extension for robust distributed identification
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUMS & DOMAINS
-- ============================================================================

CREATE TYPE user_role_enum AS ENUM (
    'INTERNAL_CONSULTANT',        -- Full access to all projects, advisory margins, risk dashboards, and approvals
    'UNIVERSITY_COORDINATOR',     -- Restricted to Social Development placements, their university students, and partner NGOs
    'LOCAL_PARTNER'               -- Restricted to assigned tasks, own NGO profile, duty-of-care logs, and due diligence checks
);

CREATE TYPE workflow_type_enum AS ENUM (
    'ENVIRONMENTAL_DEV',          -- Mangrove conservation, carbon credit verification, renewable agroforestry
    'SOCIAL_DEV',                 -- University student matching with vetted regional NGOs
    'FUNDRAISING_ADVISORY'        -- Foreign donor grant structuring in Cambodia (USAID, EU, AFD, bilateral)
);

CREATE TYPE task_status_enum AS ENUM (
    'BACKLOG',
    'DUE_DILIGENCE',
    'IN_PROGRESS',
    'COMPLIANCE_REVIEW',
    'COMPLETED'
);

CREATE TYPE task_priority_enum AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);

CREATE TYPE placement_status_enum AS ENUM (
    'PROPOSED',
    'VETTING',
    'SCC_PENDING',
    'APPROVED',
    'ACTIVE',
    'COMPLETED',
    'TERMINATED'
);

CREATE TYPE scc_clause_module_enum AS ENUM (
    'MODULE_1_CONTROLLER_TO_CONTROLLER',
    'MODULE_2_CONTROLLER_TO_PROCESSOR',
    'MODULE_3_PROCESSOR_TO_PROCESSOR',
    'MODULE_4_PROCESSOR_TO_CONTROLLER'
);

CREATE TYPE scc_status_enum AS ENUM (
    'DRAFT',
    'EXECUTED',
    'UNDER_AUDIT',
    'RENEWAL_REQUIRED',
    'EXPIRED'
);

CREATE TYPE incident_severity_enum AS ENUM (
    'LOW',                        -- Minor illness, flight delay, minor logistical adjustment
    'MEDIUM',                     -- Hospital clinic visit, localized transit strike, minor policy query
    'HIGH',                       -- Urgent medical repatriation, harassment report, visa compliance breach
    'CRITICAL'                    -- P1 immediate emergency: natural hazard, severe safeguarding violation, detention
);

CREATE TYPE incident_status_enum AS ENUM (
    'REPORTED',
    'INVESTIGATING',
    'ACTION_TAKEN',
    'ESCALATED_TO_DIRECTORS',
    'RESOLVED',
    'CLOSED'
);

CREATE TYPE dependency_type_enum AS ENUM (
    'FINISH_TO_START',           -- Successor task cannot start until predecessor finishes
    'START_TO_START',            -- Successor task cannot start until predecessor starts
    'FINISH_TO_FINISH'           -- Successor task cannot finish until predecessor finishes
);

-- ============================================================================
-- 2. ACCESS CONTROL & ORGANIZATIONAL CORE
-- ============================================================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_key user_role_enum NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_key user_role_enum NOT NULL REFERENCES roles(role_key) ON UPDATE CASCADE,
    organization_name VARCHAR(200) NOT NULL,
    regional_hub VARCHAR(50) NOT NULL, -- e.g. 'Phnom Penh', 'London', 'Washington DC', 'Hanoi'
    time_zone VARCHAR(50) NOT NULL DEFAULT 'INDOCHINA', -- 'INDOCHINA' (UTC+7), 'GMT_PLUS_1' (UTC+1), 'GMT_MINUS_4' (UTC-4)
    phone_international VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code workflow_type_enum NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    lead_consultant_id UUID REFERENCES users(id) ON DELETE SET NULL,
    primary_region VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. RELATIONAL CRM: UNIVERSITIES, NGOS, STUDENTS & PLACEMENTS
-- ============================================================================

CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    institutional_domain VARCHAR(150) NOT NULL, -- e.g. 'ox.ac.uk', 'georgetown.edu', 'mcgill.ca'
    coordinator_name VARCHAR(150) NOT NULL,
    coordinator_email VARCHAR(255) NOT NULL,
    coordinator_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    partnership_tier VARCHAR(50) NOT NULL DEFAULT 'STANDARD', -- 'STRATEGIC_GLOBAL', 'STANDARD', 'PROBATION'
    annual_student_quota INT NOT NULL DEFAULT 10,
    current_active_students INT NOT NULL DEFAULT 0,
    gdpr_dpa_signed BOOLEAN NOT NULL DEFAULT FALSE,
    scc_master_agreement_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_uni_email CHECK (coordinator_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT check_uni_domain CHECK (institutional_domain ~* '^[A-Za-z0-9.-]+\.(edu|ac\.[a-z]{2}|edu\.[a-z]{2}|ca|de|fr|org)$')
);

CREATE TABLE ngos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL, -- e.g. 'Cambodia', 'Vietnam', 'Indonesia', 'Thailand'
    city VARCHAR(100) NOT NULL,
    registration_number VARCHAR(100) NOT NULL, -- e.g. MoI Cambodia registration
    focus_area VARCHAR(150) NOT NULL, -- e.g. 'Peatland Restoration', 'Child Protection & Education', 'Clean Water'
    safeguarding_rating VARCHAR(20) NOT NULL DEFAULT 'LEVEL_1_PENDING', -- 'TIER_A_VERIFIED', 'TIER_B_CONDITIONAL', 'LEVEL_1_PENDING'
    vetted_status BOOLEAN NOT NULL DEFAULT FALSE,
    contact_person VARCHAR(150) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    phone_international VARCHAR(50) NOT NULL,
    office_address TEXT NOT NULL,
    counter_terrorism_screened BOOLEAN NOT NULL DEFAULT FALSE,
    moi_verified BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    local_partner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_ngo_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
    full_name VARCHAR(150) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    passport_country VARCHAR(100) NOT NULL,
    degree_program VARCHAR(150) NOT NULL,
    emergency_contact_name VARCHAR(150) NOT NULL,
    emergency_contact_phone VARCHAR(50) NOT NULL,
    emergency_contact_relationship VARCHAR(50) NOT NULL,
    gdpr_consent_signed BOOLEAN NOT NULL DEFAULT FALSE,
    gdpr_consent_timestamp TIMESTAMPTZ,
    medical_declaration_filed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_student_email CHECK (student_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE student_placements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placement_reference VARCHAR(50) NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    ngo_id UUID NOT NULL REFERENCES ngos(id) ON DELETE RESTRICT,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    placement_status placement_status_enum NOT NULL DEFAULT 'PROPOSED',
    supervisor_name VARCHAR(150) NOT NULL,
    supervisor_email VARCHAR(255) NOT NULL,
    host_country VARCHAR(100) NOT NULL,
    risk_tier VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    stipend_monthly_usd NUMERIC(10, 2) DEFAULT 0.00,
    scc_agreement_id UUID,
    duty_of_care_briefing_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_placement_dates CHECK (end_date >= start_date)
);

-- ============================================================================
-- 4. TASK MANAGEMENT: TASKS, SUBTASKS, DEPENDENCIES & CHECKLISTS
-- ============================================================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_code VARCHAR(50) NOT NULL UNIQUE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status_enum NOT NULL DEFAULT 'BACKLOG',
    priority task_priority_enum NOT NULL DEFAULT 'MEDIUM',
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ngo_id UUID REFERENCES ngos(id) ON DELETE SET NULL,
    university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
    due_date DATE,
    estimated_hours NUMERIC(6, 2) DEFAULT 0.0,
    actual_hours NUMERIC(6, 2) DEFAULT 0.0,
    foreign_grant_donor VARCHAR(150), -- Specific to Cambodian NGO Fundraising Advisory (e.g. 'USAID / Harvest III', 'AFD French Development')
    donor_grant_amount_usd NUMERIC(12, 2) DEFAULT 0.00,
    kanban_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type dependency_type_enum NOT NULL DEFAULT 'FINISH_TO_START',
    notes VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_not_self_dependent CHECK (task_id != depends_on_task_id),
    CONSTRAINT unique_task_pair UNIQUE (task_id, depends_on_task_id)
);

CREATE TABLE due_diligence_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    ngo_id UUID REFERENCES ngos(id) ON DELETE CASCADE,
    checklist_title VARCHAR(255) NOT NULL,
    checklist_type VARCHAR(100) NOT NULL, -- 'SAFEGUARDING_AUDIT', 'CAMBODIA_MOI_KYC', 'FINANCIAL_INTEGRITY', 'CROSS_BORDER_GDPR'
    is_fully_compliant BOOLEAN NOT NULL DEFAULT FALSE,
    total_items INT NOT NULL DEFAULT 0,
    completed_items INT NOT NULL DEFAULT 0,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID NOT NULL REFERENCES due_diligence_checklists(id) ON DELETE CASCADE,
    item_key VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verification_notes TEXT,
    evidence_document_url VARCHAR(500),
    order_index INT NOT NULL DEFAULT 0
);

-- ============================================================================
-- 5. COMPLIANCE & AUTOMATED STANDARD CONTRACTUAL CLAUSES (SCCS)
-- ============================================================================

CREATE TABLE scc_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agreement_reference VARCHAR(50) NOT NULL UNIQUE,
    data_exporter_name VARCHAR(200) NOT NULL, -- e.g. Oxford University / Northstar Strategy Europe Ltd
    data_exporter_country VARCHAR(100) NOT NULL, -- EU / UK Jurisdiction (e.g. 'United Kingdom', 'Germany')
    data_importer_name VARCHAR(200) NOT NULL, -- e.g. Phnom Penh Regional NGO / Northstar Asia
    data_importer_country VARCHAR(100) NOT NULL, -- Non-adequate 3rd country (e.g. 'Cambodia', 'Vietnam')
    scc_module scc_clause_module_enum NOT NULL DEFAULT 'MODULE_1_CONTROLLER_TO_CONTROLLER',
    status scc_status_enum NOT NULL DEFAULT 'DRAFT',
    transfer_scenario TEXT NOT NULL,
    categories_of_data JSONB NOT NULL DEFAULT '["Student Identity", "Academic Profile", "Emergency Contacts", "Medical Disclosures"]'::jsonb,
    technical_and_organizational_measures JSONB NOT NULL,
    transfer_impact_assessment_completed BOOLEAN NOT NULL DEFAULT FALSE,
    tia_summary TEXT,
    auto_executed_at TIMESTAMPTZ,
    valid_until DATE NOT NULL,
    digital_signature_hash VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scc_compliance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agreement_id UUID NOT NULL REFERENCES scc_agreements(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'DATA_TRANSFER_INITIATED', 'SCC_EXECUTED', 'TIA_SUBMITTED', 'AUDIT_VERIFIED'
    data_subject_count INT NOT NULL DEFAULT 1,
    origin_country VARCHAR(50) NOT NULL,
    destination_country VARCHAR(50) NOT NULL,
    legal_basis VARCHAR(100) NOT NULL DEFAULT 'GDPR Art. 46(2)(c) Standard Contractual Clauses',
    cryptographic_hash VARCHAR(128) NOT NULL,
    audit_notes TEXT,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. RISK ESCALATION DASHBOARD: SAFEGUARDING & DUTY-OF-CARE
-- ============================================================================

CREATE TABLE duty_of_care_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'MEDICAL_EMERGENCY', 'SAFEGUARDING_HARASSMENT', 'NATURAL_HAZARD', 'POLITICAL_VISA', 'SECURITY'
    severity incident_severity_enum NOT NULL DEFAULT 'MEDIUM',
    status incident_status_enum NOT NULL DEFAULT 'REPORTED',
    country VARCHAR(100) NOT NULL,
    city_location VARCHAR(150) NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    ngo_id UUID REFERENCES ngos(id) ON DELETE SET NULL,
    placement_id UUID REFERENCES student_placements(id) ON DELETE SET NULL,
    reported_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    incident_description TEXT NOT NULL,
    immediate_action_taken TEXT NOT NULL,
    is_escalated_to_regional_director BOOLEAN NOT NULL DEFAULT FALSE,
    duty_of_care_protocol_triggered VARCHAR(100) NOT NULL DEFAULT 'STANDARD_TIER_2',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incident_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES duty_of_care_incidents(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    previous_status incident_status_enum,
    new_status incident_status_enum NOT NULL,
    action_notes TEXT NOT NULL,
    notified_parties JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX idx_users_role ON users(role_key);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tasks_workflow_status ON tasks(workflow_id, status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_ngo ON tasks(ngo_id);
CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX idx_task_dep_task ON task_dependencies(task_id);
CREATE INDEX idx_task_dep_depends ON task_dependencies(depends_on_task_id);
CREATE INDEX idx_placements_student ON student_placements(student_id);
CREATE INDEX idx_placements_ngo ON student_placements(ngo_id);
CREATE INDEX idx_placements_status ON student_placements(placement_status);
CREATE INDEX idx_incidents_severity_status ON duty_of_care_incidents(severity, status);
CREATE INDEX idx_incidents_country ON duty_of_care_incidents(country);
CREATE INDEX idx_scc_agreement_ref ON scc_agreements(agreement_reference);
CREATE INDEX idx_scc_logs_agreement ON scc_compliance_logs(agreement_id);

-- ============================================================================
-- 8. AUTOMATION TRIGGERS & PROCEDURES
-- ============================================================================

-- Automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tasks
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_ngos
BEFORE UPDATE ON ngos
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_placements
BEFORE UPDATE ON student_placements
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_incidents
BEFORE UPDATE ON duty_of_care_incidents
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Trigger: Automatically escalate P1 Critical incidents to Regional Directors
CREATE OR REPLACE FUNCTION trigger_auto_escalate_critical_incidents()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity = 'CRITICAL' AND NEW.is_escalated_to_regional_director = FALSE THEN
    NEW.is_escalated_to_regional_director := TRUE;
    NEW.status := 'ESCALATED_TO_DIRECTORS';
    NEW.duty_of_care_protocol_triggered := 'CRITICAL_P1_DIRECTOR_MOBILIZATION';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_escalate_critical_incident
BEFORE INSERT OR UPDATE OF severity ON duty_of_care_incidents
FOR EACH ROW EXECUTE PROCEDURE trigger_auto_escalate_critical_incidents();

-- ============================================================================
-- 9. INITIAL COMPREHENSIVE SEED DATA
-- ============================================================================

-- Roles
INSERT INTO roles (role_key, name, description, permissions) VALUES
('INTERNAL_CONSULTANT', 'Internal Consultant', 'Senior consultants at Northstar Strategy Group with global cross-workflow oversight, financial proposal modeling, risk governance, and SCC execution authority.', '["read:all", "write:all", "execute:scc", "escalate:incidents", "manage:finances", "audit:due_diligence"]'::jsonb),
('UNIVERSITY_COORDINATOR', 'University Coordinator', 'Institutional placement coordinators managing candidate shortlists, university GDPR declarations, and placement oversight.', '["read:placements", "read:universities", "read:approved_ngos", "write:student_profiles", "read:duty_of_care"]'::jsonb),
('LOCAL_PARTNER', 'Local Regional Partner', 'NGO field directors and regional implementation partners managing local project tasks, due diligence proof, and safeguarding check-ins.', '["read:assigned_tasks", "write:task_progress", "read:own_ngo", "write:due_diligence_items", "create:incident_report"]'::jsonb);

-- Initial Core Users & Team Members (Operating Across Indochina, GMT+1, and GMT-4 Time Zones)
INSERT INTO users (id, email, full_name, password_hash, role_key, organization_name, regional_hub, time_zone, phone_international) VALUES
('00000000-0000-0000-0000-000000000001', 'sokha.chen@northstar-sg.com', 'Sokha Chen', '$2b$12$eXAMpLeHaSh123456789012345678901234567890123456789012', 'INTERNAL_CONSULTANT', 'Northstar Strategy Group', 'Phnom Penh Hub', 'INDOCHINA', '+855 23 889 102'),
('00000000-0000-0000-0000-000000000002', 'claire.dupuis@northstar-sg.com', 'Claire Dupuis', '$2b$12$eXAMpLeHaSh123456789012345678901234567890123456789012', 'INTERNAL_CONSULTANT', 'Northstar Strategy Group', 'London Hub', 'GMT_PLUS_1', '+33 1 42 68 55 00'),
('00000000-0000-0000-0000-000000000003', 'sarah.jenkins@ox.ac.uk', 'Dr. Sarah Jenkins', '$2b$12$eXAMpLeHaSh123456789012345678901234567890123456789012', 'UNIVERSITY_COORDINATOR', 'University of Oxford', 'Oxford Hub', 'GMT_PLUS_1', '+44 1865 270000'),
('00000000-0000-0000-0000-000000000004', 'visal.leng@mekong-conservation.org', 'Visal Leng', '$2b$12$eXAMpLeHaSh123456789012345678901234567890123456789012', 'LOCAL_PARTNER', 'Mekong Peatland Conservation Initiative', 'Siem Reap Hub', 'INDOCHINA', '+855 63 964 881'),
-- Team Members
('00000000-0000-0000-0000-000000000011', 'ye.htet@northstar-sg.com', 'Ye Khaung Htet', '$2b$12$eXAMpLeHaSh123456789012345678901234567890123456789012', 'INTERNAL_CONSULTANT', 'Northstar Strategy Group', 'Mekong Operations', 'INDOCHINA', '+855 23 991 001'),
('00000000-0000-0000-0000-000000000012', 'nathan.sims@northstar-sg.com', 'Nathan Sims', '$2b$12$eXAMpLeHaSh123456789012345678901234567890123456789012', 'INTERNAL_CONSULTANT', 'Northstar Strategy Group', 'UK Operations', 'GMT_PLUS_1', '+44 20 7946 0912'),
('00000000-0000-0000-0000-000000000013', 'anna.anufrikova@northstar-sg.com', 'Anna Anufrikova', '$2b$12$eXAMpLeHaSh123456789012345678901234567890123456789012', 'INTERNAL_CONSULTANT', 'Northstar Strategy Group', 'Europe Operations', 'GMT_PLUS_1', '+44 20 7946 0844'),
('00000000-0000-0000-0000-000000000014', 'finn.chapman@northstar-sg.com', 'Finn Chapman', '$2b$12$eXAMpLeHaSh123456789012345678901234567890123456789012', 'INTERNAL_CONSULTANT', 'Northstar Strategy Group', 'London Operations', 'GMT_PLUS_1', '+44 20 7946 0521'),
('00000000-0000-0000-0000-000000000015', 'harvey.young@northstar-sg.com', 'Harvey Young', '$2b$12$eXAMpLeHaSh123456789012345678901234567890123456789012', 'INTERNAL_CONSULTANT', 'Northstar Strategy Group', 'Americas Operations', 'GMT_MINUS_4', '+1 202 555 0177'),
('00000000-0000-0000-0000-000000000016', 'eric.vadan@northstar-sg.com', 'Eric Vadan', '$2b$12$eXAMpLeHaSh123456789012345678901234567890123456789012', 'INTERNAL_CONSULTANT', 'Northstar Strategy Group', 'Southeast Asia Operations', 'INDOCHINA', '+855 23 991 002'),
('00000000-0000-0000-0000-000000000017', 'benicio.franqui@northstar-sg.com', 'Benicio Franqui', '$2b$12$eXAMpLeHaSh123456789012345678901234567890123456789012', 'INTERNAL_CONSULTANT', 'Northstar Strategy Group', 'North America Operations', 'GMT_MINUS_4', '+1 202 555 0188'),
('00000000-0000-0000-0000-000000000018', 'sovanthep.sous@northstar-sg.com', 'Sovanthep Sous', '$2b$12$eXAMpLeHaSh123456789012345678901234567890123456789012', 'INTERNAL_CONSULTANT', 'Northstar Strategy Group', 'Cambodia Operations', 'INDOCHINA', '+855 23 991 003');

-- Workflows
INSERT INTO workflows (id, code, title, description, lead_consultant_id, primary_region) VALUES
('11111111-1111-1111-1111-111111111111', 'ENVIRONMENTAL_DEV', 'Environmental Development & Carbon Ecosystems', 'Mangrove regeneration, peatland conservation, and voluntary carbon market verification across the lower Mekong Basin.', '00000000-0000-0000-0000-000000000001', 'Lower Mekong & Southeast Asia'),
('22222222-2222-2222-2222-222222222222', 'SOCIAL_DEV', 'Social Development: University-NGO Placements', 'Cross-border matching of graduate students from European & North American universities with vetted Southeast Asian grassroots NGOs under strict duty-of-care.', '00000000-0000-0000-0000-000000000002', 'Global (Europe/North America -> SE Asia)'),
('33333333-3333-3333-3333-333333333333', 'FUNDRAISING_ADVISORY', 'NGO Fundraising Advisory & Donor Structuring', 'Structuring multi-million dollar proposal architectures for foreign funders (USAID, EU Horizon, AFD, GIZ) targeting local Cambodian civil society.', '00000000-0000-0000-0000-000000000001', 'Cambodia (Phnom Penh / Battambang)');

-- Universities
INSERT INTO universities (id, name, country, city, institutional_domain, coordinator_name, coordinator_email, coordinator_user_id, partnership_tier, annual_student_quota, current_active_students, gdpr_dpa_signed) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'University of Oxford', 'United Kingdom', 'Oxford', 'ox.ac.uk', 'Dr. Sarah Jenkins', 'sarah.jenkins@ox.ac.uk', '00000000-0000-0000-0000-000000000003', 'STRATEGIC_GLOBAL', 15, 4, TRUE),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Georgetown University', 'United States', 'Washington DC', 'georgetown.edu', 'Prof. Marcus Alvarez', 'm.alvarez@georgetown.edu', NULL, 'STRATEGIC_GLOBAL', 12, 3, TRUE),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'McGill University', 'Canada', 'Montreal', 'mcgill.ca', 'Helene Bergeron', 'h.bergeron@mcgill.ca', NULL, 'STANDARD', 8, 2, TRUE),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'National University of Singapore', 'Singapore', 'Singapore', 'nus.edu.sg', 'Dr. Tan Wei Ming', 'tanwm@nus.edu.sg', NULL, 'STANDARD', 10, 3, TRUE);

-- Regional NGOs
INSERT INTO ngos (id, name, legal_name, country, city, registration_number, focus_area, safeguarding_rating, vetted_status, contact_person, contact_email, phone_international, office_address, counter_terrorism_screened, moi_verified, local_partner_user_id) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Mekong Peatland Conservation Initiative', 'Mekong Basin Ecological Foundation', 'Cambodia', 'Siem Reap', 'KH-MOI-2018-4912', 'Peatland Restoration & Community Carbon Credits', 'TIER_A_VERIFIED', TRUE, 'Visal Leng', 'visal.leng@mekong-conservation.org', '+855 63 964 881', 'Street 7, Wat Bo Village, Siem Reap, Cambodia', TRUE, TRUE, '00000000-0000-0000-0000-000000000004'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Child Rights & Education Cambodia (CREC)', 'CREC Association for Youth Development', 'Cambodia', 'Phnom Penh', 'KH-MOI-2015-1108', 'Child Safeguarding & Rural Literacy', 'TIER_A_VERIFIED', TRUE, 'Channary Ouk', 'channary.ouk@crec-cambodia.org', '+855 23 721 990', 'No. 44, St 360, BKK3, Phnom Penh, Cambodia', TRUE, TRUE, NULL),
('12121212-1212-1212-1212-121212121212', 'Vietnam Mangrove Coalition', 'Vietnam Coastal Biodiversity Society', 'Vietnam', 'Can Tho', 'VN-MOLISA-8832', 'Mangrove Biosphere Restoration & Blue Carbon', 'TIER_A_VERIFIED', TRUE, 'Nguyen Van Tuan', 'tuan.nguyen@vn-mangrove.org', '+84 292 383 1245', 'Khu Vuc 2, Ninh Kieu, Can Tho, Vietnam', TRUE, TRUE, NULL),
('34343434-3434-3434-3434-343434343434', 'Battambang Agro-Ecology Alliance', 'BAEA Farmers Collective', 'Cambodia', 'Battambang', 'KH-MOI-2021-7721', 'Regenerative Agriculture & Water Governance', 'TIER_B_CONDITIONAL', TRUE, 'Samnang Keo', 'samnang@baea-cambodia.org', '+855 53 952 301', 'Romchek 4, Battambang City, Cambodia', TRUE, TRUE, NULL);

-- Students
INSERT INTO students (id, university_id, full_name, student_email, nationality, passport_country, degree_program, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, gdpr_consent_signed, gdpr_consent_timestamp, medical_declaration_filed) VALUES
('55555555-5555-5555-5555-555555555551', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Emily Thornton', 'emily.thornton@st-antonys.ox.ac.uk', 'British', 'United Kingdom', 'MSc Global Development Economics', 'Robert Thornton', '+44 7700 900142', 'Father', TRUE, CURRENT_TIMESTAMP, TRUE),
('55555555-5555-5555-5555-555555555552', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Lucas Vanderberg', 'lvanderberg@georgetown.edu', 'American', 'United States', 'MA International Development & Diplomacy', 'Karen Vanderberg', '+1 202 555 0199', 'Mother', TRUE, CURRENT_TIMESTAMP, TRUE),
('55555555-5555-5555-5555-555555555553', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Chloe Tremblay', 'chloe.tremblay@mail.mcgill.ca', 'Canadian', 'Canada', 'Master of Public Policy (Environmental Policy)', 'Jean Tremblay', '+1 514 555 0144', 'Father', TRUE, CURRENT_TIMESTAMP, TRUE);

-- SCC Agreements (Cross-Border GDPR Compliance)
INSERT INTO scc_agreements (id, agreement_reference, data_exporter_name, data_exporter_country, data_importer_name, data_importer_country, scc_module, status, transfer_scenario, technical_and_organizational_measures, transfer_impact_assessment_completed, tia_summary, auto_executed_at, valid_until, digital_signature_hash) VALUES
('66666666-6666-6666-6666-666666666661', 'SCC-EU-KH-2026-004', 'University of Oxford', 'United Kingdom (GDPR / DPA 2018)', 'Mekong Peatland Conservation Initiative', 'Cambodia (Non-Adequate 3rd Country)', 'MODULE_1_CONTROLLER_TO_CONTROLLER', 'EXECUTED', 'Transfer of student identity, emergency contacts, medical safety logs, and field placement telemetry to regional NGO host.', '{"encryption_in_transit": "TLS 1.3", "encryption_at_rest": "AES-256", "access_control": "MFA + Role-Based Isolation", "data_retention_days": 180}'::jsonb, TRUE, 'Transfer Impact Assessment concluded low risk: Cambodia lacks broad commercial surveillance over non-profit field researchers; contractual safeguards and encrypted data channels enforced.', CURRENT_TIMESTAMP, '2027-12-31', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

-- Student Placements
INSERT INTO student_placements (id, placement_reference, student_id, ngo_id, workflow_id, start_date, end_date, placement_status, supervisor_name, supervisor_email, host_country, risk_tier, stipend_monthly_usd, scc_agreement_id, duty_of_care_briefing_completed) VALUES
('77777777-7777-7777-7777-777777777771', 'PLC-2026-OX-001', '55555555-5555-5555-5555-555555555551', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', '2026-06-01', '2026-09-30', 'ACTIVE', 'Visal Leng', 'visal.leng@mekong-conservation.org', 'Cambodia', 'MEDIUM', 850.00, '66666666-6666-6666-6666-666666666661', TRUE),
('77777777-7777-7777-7777-777777777772', 'PLC-2026-GT-002', '55555555-5555-5555-5555-555555555552', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', '2026-07-01', '2026-10-31', 'APPROVED', 'Channary Ouk', 'channary.ouk@crec-cambodia.org', 'Cambodia', 'LOW', 800.00, NULL, TRUE);

-- Tasks
INSERT INTO tasks (id, task_code, workflow_id, title, description, status, priority, assignee_id, creator_id, ngo_id, due_date, estimated_hours, actual_hours, foreign_grant_donor, donor_grant_amount_usd, kanban_order) VALUES
-- Environmental Development
('88888888-8888-8888-8888-888888888881', 'ENV-101', '11111111-1111-1111-1111-111111111111', 'Tonle Sap Peatland Carbon Stratification Survey', 'Deploy core soil sampling team across 4,200 hectares of inundated peat forest in Prek Toal sanctuary.', 'IN_PROGRESS', 'HIGH', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-10-15', 120.0, 48.5, NULL, 0.00, 1),
('88888888-8888-8888-8888-888888888882', 'ENV-102', '11111111-1111-1111-1111-111111111111', 'Verra VCS Methodology Compliance Audit', 'Complete third-party validator compliance check for VM0007 REDD+ carbon methodology and community FPIC documentation.', 'DUE_DILIGENCE', 'URGENT', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-09-30', 80.0, 22.0, NULL, 0.00, 2),

-- Social Development (Placements)
('88888888-8888-8888-8888-888888888883', 'SOC-201', '22222222-2222-2222-2222-222222222222', 'Oxford-Mekong Placement Visa & Duty-of-Care Briefing', 'Finalize Emily Thornton visa sponsorship via MoFA and deliver Cambodia tropical health & safeguarding orientation.', 'COMPLETED', 'MEDIUM', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-05-25', 24.0, 24.0, NULL, 0.00, 0),
('88888888-8888-8888-8888-888888888884', 'SOC-202', '22222222-2222-2222-2222-222222222222', 'Automated Cross-Border SCC Execution for Georgetown-CREC Cohort', 'Trigger Standard Contractual Clauses (Module 1 C2C) for Lucas Vanderberg placement transfer into Phnom Penh office.', 'COMPLIANCE_REVIEW', 'HIGH', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2026-09-20', 16.0, 14.0, NULL, 0.00, 1),

-- NGO Fundraising Advisory (Cambodia foreign donors)
('88888888-8888-8888-8888-888888888885', 'FND-301', '33333333-3333-3333-3333-333333333333', 'USAID Harvest III Sub-Award Proposal Architecture', 'Drafting cost proposal and MEL framework for USAID Cambodia agricultural resilience grant RFP-72044226.', 'IN_PROGRESS', 'URGENT', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '34343434-3434-3434-3434-343434343434', '2026-10-01', 140.0, 65.0, 'USAID / Harvest III Cambodia', 1850000.00, 1),
('88888888-8888-8888-8888-888888888886', 'FND-302', '33333333-3333-3333-3333-333333333333', 'AFD French Development Agency Biodiversity Concept Note', 'Structuring €1.2M co-funding consortium with CREC and French botanical research institutes.', 'BACKLOG', 'MEDIUM', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '2026-11-15', 90.0, 5.0, 'Agence Française de Développement (AFD)', 1320000.00, 0);

-- Task Subtasks
INSERT INTO subtasks (id, task_id, title, is_completed, due_date, order_index) VALUES
('99999999-9999-9999-9999-999999999991', '88888888-8888-8888-8888-888888888881', 'Coordinate field rangers and boat logistics with Siem Reap Forestry Admin', TRUE, '2026-09-10', 0),
('99999999-9999-9999-9999-999999999992', '88888888-8888-8888-8888-888888888881', 'Calibrate core organic dry mass lab spectrometers', TRUE, '2026-09-12', 1),
('99999999-9999-9999-9999-999999999993', '88888888-8888-8888-8888-888888888881', 'Perform Free, Prior, and Informed Consent (FPIC) village council session', FALSE, '2026-09-22', 2),
('99999999-9999-9999-9999-999999999994', '88888888-8888-8888-8888-888888888885', 'Complete USAID Standard Provisions & Mandatory Flow-Down Clauses review', TRUE, '2026-09-08', 0),
('99999999-9999-9999-9999-999999999995', '88888888-8888-8888-8888-888888888885', 'Finalize Indirect Cost Rate (NICRA) allocation worksheet', FALSE, '2026-09-18', 1);

-- Task Dependencies
INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type, notes) VALUES
('88888888-8888-8888-8888-888888888882', '88888888-8888-8888-8888-888888888881', 'FINISH_TO_START', 'VCS Verra methodology verification requires completed peat core survey data sets.');

-- Due Diligence Checklists
INSERT INTO due_diligence_checklists (id, task_id, ngo_id, checklist_title, checklist_type, is_fully_compliant, total_items, completed_items, verified_by, verified_at) VALUES
('aaaaaaaa-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888882', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Mekong Conservation Safeguarding & Compliance Audit', 'SAFEGUARDING_AUDIT', TRUE, 4, 4, '00000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP);

INSERT INTO checklist_items (checklist_id, item_key, title, category, is_mandatory, is_completed, verified_at, verification_notes) VALUES
('aaaaaaaa-1111-1111-1111-111111111111', 'MOI_REGISTRATION', 'Ministry of Interior (MoI) Annual Reporting & Legal Registration Active', 'Legal Standing', TRUE, TRUE, CURRENT_TIMESTAMP, 'MoI certificate #KH-MOI-2018-4912 valid through 2027'),
('aaaaaaaa-1111-1111-1111-111111111111', 'CHILD_PROTECTION_POLICY', 'Formal Child Protection & Prevention of Sexual Exploitation (PSEA) Policy', 'Safeguarding', TRUE, TRUE, CURRENT_TIMESTAMP, 'Staff trained annually; whistleblower hotline in Khmer and English verified'),
('aaaaaaaa-1111-1111-1111-111111111111', 'CFT_AML_SCREENING', 'UN / OFAC / EU Counter-Terrorism Financing Sanctions Screening', 'Financial Integrity', TRUE, TRUE, CURRENT_TIMESTAMP, 'Zero matches across board members and key officers'),
('aaaaaaaa-1111-1111-1111-111111111111', 'FIELD_DUTY_OF_CARE', 'Emergency Medevac & Remote Field Evacuation Insurance Protocol', 'Duty of Care', TRUE, TRUE, CURRENT_TIMESTAMP, 'Direct link to SOS International clinic Phnom Penh');

-- Duty of Care / Safeguarding Incidents
INSERT INTO duty_of_care_incidents (id, incident_number, title, category, severity, status, country, city_location, student_id, ngo_id, placement_id, reported_by_id, assigned_manager_id, incident_description, immediate_action_taken, is_escalated_to_regional_director, duty_of_care_protocol_triggered) VALUES
('bbbbbbbb-2222-2222-2222-222222222221', 'INC-2026-081', 'Suspected Dengue Fever & High Fever During Tonle Sap Fieldwork', 'MEDICAL_EMERGENCY', 'HIGH', 'ACTION_TAKEN', 'Cambodia', 'Siem Reap', '55555555-5555-5555-5555-555555555551', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '77777777-7777-7777-7777-777777777771', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Student Emily Thornton developed acute 39.5C fever and fatigue during boat transit to floating village peat research site.', 'Transported via speedboat to Royal Angkor International Hospital Siem Reap. IV hydration commenced; dengue antigen panel negative, bacterial gastroenteritis diagnosed. Oxford emergency contact briefed.', TRUE, 'MEDICAL_TIER_2_HOSPITALIZATION');

INSERT INTO incident_audit_logs (incident_id, actor_id, previous_status, new_status, action_notes, notified_parties) VALUES
('bbbbbbbb-2222-2222-2222-222222222221', '00000000-0000-0000-0000-000000000004', 'REPORTED', 'ACTION_TAKEN', 'Field supervisor accompanied student to emergency triage; university insurance carrier opened claim #UK-MED-88192.', '["sokha.chen@northstar-sg.com", "sarah.jenkins@ox.ac.uk", "dutyofcare@northstar-sg.com"]'::jsonb);

-- SCC Compliance Logs
INSERT INTO scc_compliance_logs (agreement_id, actor_id, event_type, data_subject_count, origin_country, destination_country, legal_basis, cryptographic_hash, audit_notes) VALUES
('66666666-6666-6666-6666-666666666661', '00000000-0000-0000-0000-000000000002', 'SCC_EXECUTED', 1, 'United Kingdom', 'Cambodia', 'GDPR Art. 46(2)(c) Standard Contractual Clauses', '8f4e2c6b3a1d9e5f7a2b4c6e8d0f1a3b5c7e9f2a4d6b8c0e2f4a6b8d0e2f4a6b', 'Automated execution triggered on university coordinator confirmation; Transfer Impact Assessment archived.');
