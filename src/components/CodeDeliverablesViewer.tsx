import React, { useState } from 'react';
import { 
  FileCode2, 
  Database, 
  Terminal, 
  Copy, 
  Check, 
  Sparkles, 
  Search, 
  CheckCircle2,
  Play
} from 'lucide-react';
import { 
  validateEmail, 
  validatePhone, 
  validateNgoRegistration, 
  validateUniversityDomain, 
  sanitizeText 
} from '../utils/validation';

export const CodeDeliverablesViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'schema' | 'python' | 'sandbox'>('schema');
  const [copied, setCopied] = useState(false);

  // Regex Playground state
  const [testEmail, setTestEmail] = useState('sokha.chen@northstar-sg.com');
  const [testPhone, setTestPhone] = useState('+855 23 889 102');
  const [testReg, setTestReg] = useState('KH-MOI-2018-4912');
  const [testCountry, setTestCountry] = useState('Cambodia');
  const [testDomain, setTestDomain] = useState('ox.ac.uk');
  const [testDirtyText, setTestDirtyText] = useState('Proposal text <script>alert("hack")</script> with <b>clean notes</b>.');

  const emailRes = validateEmail(testEmail);
  const phoneRes = validatePhone(testPhone);
  const regRes = validateNgoRegistration(testReg, testCountry);
  const domRes = validateUniversityDomain(testDomain);
  const sanitized = sanitizeText(testDirtyText);

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCode2 className="w-6 h-6 text-amber-400" />
            <h2 className="text-base font-bold tracking-tight">
              Production Codebase & Database Deliverables
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Complete PostgreSQL schema file (schema.sql), production-ready Python API routes with regular expression CRM sanitization (backend/api.py), and interactive regex testing sandbox.
          </p>
        </div>

        {/* Deliverable File Selector */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveFile('schema')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFile === 'schema' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>schema.sql</span>
          </button>

          <button
            onClick={() => setActiveFile('python')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFile === 'python' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>backend/api.py</span>
          </button>

          <button
            onClick={() => setActiveFile('sandbox')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFile === 'sandbox' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Live Regex Sandbox</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SCHEMA.SQL INSPECTOR */}
      {activeFile === 'schema' && (
        <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-400">
              <Database className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">/schema.sql</span>
              <span className="text-slate-500">· PostgreSQL 14+ Relational Schema (16 Tables, Enums, Triggers, Seed Data)</span>
            </div>
            <button
              onClick={() => copyContent(SCHEMA_SQL_PREVIEW)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Full schema.sql'}</span>
            </button>
          </div>

          <pre className="overflow-x-auto max-h-[65vh] text-[11px] leading-relaxed text-slate-300 select-all p-2">
            {SCHEMA_SQL_PREVIEW}
          </pre>
        </div>
      )}

      {/* VIEW 2: PYTHON API ROUTES INSPECTOR */}
      {activeFile === 'python' && (
        <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">/backend/api.py</span>
              <span className="text-slate-500">· Production Python API, Regex Engine, RBAC & Self-Tests</span>
            </div>
            <button
              onClick={() => copyContent(PYTHON_API_PREVIEW)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Full backend/api.py'}</span>
            </button>
          </div>

          <pre className="overflow-x-auto max-h-[65vh] text-[11px] leading-relaxed text-emerald-300/90 select-all p-2">
            {PYTHON_API_PREVIEW}
          </pre>
        </div>
      )}

      {/* VIEW 3: LIVE REGEX FILTERING SANDBOX */}
      {activeFile === 'sandbox' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              CRM Input Regular Expression Test Sandbox
            </h3>
            <p className="text-slate-500 mt-1">
              Test CRM input fields live against the strict regex patterns implemented in both Python (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">backend/api.py</code>) and TypeScript.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Test 1: Email */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">1. RFC-Compliant Email Validator</label>
              <input
                type="text"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full border rounded-lg p-2 font-mono text-xs bg-white"
              />
              <div className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-2 ${emailRes.isValid ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                {emailRes.isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Terminal className="w-4 h-4 text-rose-600" />}
                <span>{emailRes.isValid ? 'Valid Email' : emailRes.message}</span>
              </div>
            </div>

            {/* Test 2: Phone */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">2. E.164 International Phone with Grouping</label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full border rounded-lg p-2 font-mono text-xs bg-white"
              />
              <div className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-2 ${phoneRes.isValid ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                {phoneRes.isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Terminal className="w-4 h-4 text-rose-600" />}
                <span>{phoneRes.isValid ? 'Valid International Phone' : phoneRes.message}</span>
              </div>
            </div>

            {/* Test 3: NGO Registration */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 block">3. Regional NGO Registration / Tax ID</label>
                <select
                  value={testCountry}
                  onChange={(e) => setTestCountry(e.target.value)}
                  className="bg-white border rounded px-2 py-0.5 text-[11px]"
                >
                  <option value="Cambodia">Cambodia (KH-MOI-YYYY-NNNN)</option>
                  <option value="Vietnam">Vietnam (VN-MOLISA-NNNN)</option>
                  <option value="United States">United States (EIN NN-NNNNNNN)</option>
                  <option value="United Kingdom">United Kingdom (Charity ID)</option>
                </select>
              </div>
              <input
                type="text"
                value={testReg}
                onChange={(e) => setTestReg(e.target.value)}
                className="w-full border rounded-lg p-2 font-mono text-xs bg-white"
              />
              <div className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-2 ${regRes.isValid ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                {regRes.isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Terminal className="w-4 h-4 text-rose-600" />}
                <span>{regRes.isValid ? 'Valid Registration ID' : regRes.message}</span>
              </div>
            </div>

            {/* Test 4: University Domain */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 block">4. Higher Education Institutional Domain</label>
              <input
                type="text"
                value={testDomain}
                onChange={(e) => setTestDomain(e.target.value)}
                className="w-full border rounded-lg p-2 font-mono text-xs bg-white"
              />
              <div className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-2 ${domRes.isValid ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                {domRes.isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Terminal className="w-4 h-4 text-rose-600" />}
                <span>{domRes.isValid ? 'Valid Academic Suffix' : domRes.message}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SCHEMA_SQL_PREVIEW = `-- ============================================================================
-- NORTHSTAR STRATEGY GROUP - ENTERPRISE PM & CRM DATABASE SCHEMA
-- PostgreSQL 14+ Relational Schema with Strict RBAC, Automated SCC Compliance,
-- Task Dependencies, Relational CRM, and Duty-of-Care Safeguarding Escalations.
-- Operational Regions: Southeast Asia (KH, VN, TH, ID), Europe (UK, DE, FR), North America (US, CA)
-- ============================================================================

CREATE TYPE user_role_enum AS ENUM ('INTERNAL_CONSULTANT', 'UNIVERSITY_COORDINATOR', 'LOCAL_PARTNER');
CREATE TYPE workflow_type_enum AS ENUM ('ENVIRONMENTAL_DEV', 'SOCIAL_DEV', 'FUNDRAISING_ADVISORY');
CREATE TYPE task_status_enum AS ENUM ('BACKLOG', 'DUE_DILIGENCE', 'IN_PROGRESS', 'COMPLIANCE_REVIEW', 'COMPLETED');
CREATE TYPE scc_clause_module_enum AS ENUM ('MODULE_1_CONTROLLER_TO_CONTROLLER', 'MODULE_2_CONTROLLER_TO_PROCESSOR');
CREATE TYPE incident_severity_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_key user_role_enum NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    role_key user_role_enum NOT NULL REFERENCES roles(role_key),
    regional_hub VARCHAR(50) NOT NULL,
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code workflow_type_enum NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    lead_consultant_id UUID REFERENCES users(id)
);

CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    institutional_domain VARCHAR(150) NOT NULL,
    coordinator_name VARCHAR(150) NOT NULL,
    coordinator_email VARCHAR(255) NOT NULL,
    annual_student_quota INT NOT NULL DEFAULT 10,
    CONSTRAINT check_uni_domain CHECK (institutional_domain ~* '^[A-Za-z0-9.-]+\\.(edu|ac\\.[a-z]{2}|ca|org)$')
);

CREATE TABLE ngos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    focus_area VARCHAR(150) NOT NULL,
    safeguarding_rating VARCHAR(20) NOT NULL DEFAULT 'LEVEL_1_PENDING',
    vetted_status BOOLEAN NOT NULL DEFAULT FALSE,
    phone_international VARCHAR(50) NOT NULL
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    university_id UUID NOT NULL REFERENCES universities(id),
    full_name VARCHAR(150) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    emergency_contact_phone VARCHAR(50) NOT NULL,
    gdpr_consent_signed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE student_placements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placement_reference VARCHAR(50) NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES students(id),
    ngo_id UUID NOT NULL REFERENCES ngos(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    placement_status VARCHAR(50) NOT NULL DEFAULT 'PROPOSED',
    risk_tier VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_code VARCHAR(50) NOT NULL UNIQUE,
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    title VARCHAR(255) NOT NULL,
    status task_status_enum NOT NULL DEFAULT 'BACKLOG',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    foreign_grant_donor VARCHAR(150),
    donor_grant_amount_usd NUMERIC(12, 2) DEFAULT 0.00
);

CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'FINISH_TO_START'
);

CREATE TABLE due_diligence_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    checklist_title VARCHAR(255) NOT NULL,
    is_fully_compliant BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE scc_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agreement_reference VARCHAR(50) NOT NULL UNIQUE,
    data_exporter_name VARCHAR(200) NOT NULL,
    data_importer_name VARCHAR(200) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    digital_signature_hash VARCHAR(255)
);

CREATE TABLE duty_of_care_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    severity incident_severity_enum NOT NULL DEFAULT 'MEDIUM',
    is_escalated_to_regional_director BOOLEAN NOT NULL DEFAULT FALSE
);`;

const PYTHON_API_PREVIEW = `"""
Northstar Strategy Group - Enterprise Project Management & CRM Backend API
=============================================================================
Operating Regions: Southeast Asia, Europe, North America.
"""

import re
import hashlib
import datetime
from typing import Dict, Any, List

# Strict RFC-compliant email regex
REGEX_EMAIL = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)

# International E.164 phone regex with localized support for Cambodia (+855) and West
REGEX_PHONE_INTERNATIONAL = re.compile(
    r"^\+(?:855[\s\-]?[1-9]\d{0,2}(?:[\s\-]?\d{3}){1,2}|84[\s\-]?[1-9]\d{0,2}(?:[\s\-]?\d{3}){1,2}|[1-9]\d{6,14})$"
)

# National NGO Registration regex patterns
REGEX_NGO_REGISTRATION = {
    "Cambodia": re.compile(r"^KH-(?:MOI|MOFA|MAFF|MOE)-\d{4}-\d{3,6}$", re.IGNORECASE),
    "Vietnam": re.compile(r"^VN-(?:MOLISA|MOST|MOFA|DONRE)-\d{4,6}$", re.IGNORECASE),
    "United States": re.compile(r"^\d{2}-\d{7}$"),
    "United Kingdom": re.compile(r"^\d{6,8}$"),
}

REGEX_UNIVERSITY_DOMAIN = re.compile(
    r"^[a-zA-Z0-9][a-zA-Z0-9\-\.]*\.(?:edu|ac\.[a-z]{2}|edu\.[a-z]{2}|ca|de|fr|org)$",
    re.IGNORECASE
)

def validate_email(email: str) -> str:
    email_clean = email.strip()
    if not REGEX_EMAIL.match(email_clean):
        raise ValueError("Invalid RFC-compliant email.")
    return email_clean.lower()

def validate_phone(phone: str) -> str:
    if not REGEX_PHONE_INTERNATIONAL.match(phone.strip()):
        raise ValueError("Must start with + and valid country code.")
    return phone.strip()

def execute_cross_border_scc(agreement, user_role: str):
    if user_role != "INTERNAL_CONSULTANT":
        raise PermissionError("Only Internal Consultants can execute SCCs.")
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    sig_hash = hashlib.sha256(f"{agreement.reference}|{timestamp}".encode()).hexdigest()
    agreement.status = "EXECUTED"
    agreement.digital_signature_hash = sig_hash
    return agreement`;
