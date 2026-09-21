import React, { useState } from 'react';
import { X, FileText, Download, Copy, Check, BookOpen, ExternalLink } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    // Triggers download of USER_GUIDE.txt
    const element = document.createElement('a');
    element.setAttribute('href', '/USER_GUIDE.txt');
    element.setAttribute('download', 'USER_GUIDE.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    fetch('/USER_GUIDE.txt')
      .then((res) => res.text())
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        // Fallback
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl text-white shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  First-Time User Operations Manual (USER_GUIDE.txt)
                </h2>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/80">
                  v2.4.0 Text Manual
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete operational guide for first-time operators, university coordinators, and regional partners
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .txt</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Text viewer body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 text-slate-300 font-mono text-xs leading-relaxed selection:bg-emerald-600 selection:text-white">
          <pre className="whitespace-pre-wrap font-mono text-slate-300 text-xs">
{`================================================================================
NORTHSTAR STRATEGY GROUP - ENTERPRISE OPERATIONS MANUAL & USER GUIDE
Sustainable Development Project Management & Relational CRM Platform
================================================================================
Document Version : 2.4.0
Target Audience  : First-Time Operators, Project Leads, Field Directors, 
                   University Coordinators, and Regional NGO Partners
Operational Hubs : Southeast Asia (Lower Mekong), Europe (UK/EU), North America
================================================================================

TABLE OF CONTENTS
-----------------
1.  SYSTEM OVERVIEW & MISSION
2.  GLOBAL TIME ZONES & 24/7 OPERATING PROTOCOL
3.  CORE TEAM MEMBERS & REGIONAL ASSIGNMENTS
4.  THE THREE STRATEGIC WORKFLOWS
5.  ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSION PROFILES
6.  WORKFLOWS & KANBAN TASK EXECUTION
    - 6.1 Five Pipeline Execution Stages
    - 6.2 Mandatory Due Diligence Screening Checklists
    - 6.3 Task Dependencies (Finish-to-Start Blockers)
    - 6.4 Creating & Updating Tasks
7.  RELATIONAL CRM (UNIVERSITIES & SOUTHEAST ASIAN NGOS)
    - 7.1 NGO Vetting & National Registration Verification (MoI / MOLISA)
    - 7.2 Partner University Onboarding & Academic Domains
    - 7.3 Student Placement Matching & Health Declarations
8.  SAFEGUARDING & 24/7 DUTY-OF-CARE ESCALATION PROTOCOL
    - 8.1 Incident Severity Levels & Triage
    - 8.2 Automated P1 Critical Escalation to Regional Directors
9.  CROSS-BORDER DATA COMPLIANCE & AUTOMATED SCC EXECUTION
    - 9.1 EU Commission Decision 2021/914 Transfer Modules
    - 9.2 Transfer Impact Assessments (TIA) & Technical Measures (TOMs)
    - 9.3 Cryptographic SHA-256 Signatures & Immutable Audit Trails
10. CODE DELIVERABLES (PostgreSQL 14+ Schema & Python 3.11 Regex Engine)
11. FIRST-TIME USER QUICK-START CHECKLIST (STEP-BY-STEP)
12. FREQUENTLY ASKED QUESTIONS & TROUBLESHOOTING

================================================================================
1. SYSTEM OVERVIEW & MISSION
================================================================================
Northstar Strategy Group is a global advisory and project delivery partnership 
bridging European/North American academic institutions, international donors, 
and vetted grassroots NGOs across Southeast Asia (Cambodia, Vietnam, Thailand, 
Indonesia).

Key Capabilities:
* Multi-Time Zone Synchronization across Southeast Asia, Europe, and the Americas.
* Strict Role-Based Access Control (Internal Consultant, University Coordinator, Local Partner).
* 5-Stage Kanban boards with mandatory due diligence screening items and task dependencies.
* Relational directories linking accredited universities, vetted NGOs, and graduate placements.
* Automated 24/7 Duty-of-Care emergency incident tracking with instant Regional Director alerts.
* 1-Click Automated Standard Contractual Clauses (SCC) execution compliant with GDPR Art. 46.

================================================================================
2. GLOBAL TIME ZONES & 24/7 OPERATING PROTOCOL
================================================================================
Northstar operates across three primary time zones to maintain continuous 
support for field researchers, university departments, and foreign grantors:

[1] INDOCHINA TIME (ICT / UTC+7)
    - Coverage: Cambodia, Vietnam, Thailand, Laos
    - Primary Locations: Phnom Penh (Executive HQ), Siem Reap, Can Tho, Hanoi, Bangkok
    - Core Operating Hours: 08:00 - 17:30 ICT
    - Functions: Field research coordination, peatland/mangrove field stations, 
      Ministry of Interior (MoI) liaison, local NGO capacity building.

[2] GMT+1 (UK / WESTERN EUROPE)
    - Coverage: United Kingdom (BST), France, Germany, Switzerland (CET)
    - Primary Locations: London (Corporate Secretariat), Oxford, Paris, Geneva
    - Core Operating Hours: 09:00 - 18:00 GMT+1
    - Functions: Academic institutional agreements (Oxford), European Commission 
      & AFD donor proposal architecture, GDPR legal compliance & SCC sign-offs.

[3] GMT-4 (NORTH AMERICA / US EAST COAST)
    - Coverage: United States (EDT), Eastern Canada (EDT)
    - Primary Locations: Washington DC, New York, Montreal
    - Core Operating Hours: 09:00 - 17:30 GMT-4
    - Functions: North American university relations (Georgetown, McGill), 
      USAID & Feed the Future donor proposals, SAM.gov / UEI certifications.

================================================================================
3. CORE TEAM MEMBERS & REGIONAL ASSIGNMENTS
================================================================================
1. Ye Khaung Htet   - Environmental & Peatland Field Lead (Indochina Time, UTC+7)
2. Nathan Sims       - Senior ESG Strategy & Proposal Architect (GMT+1, Europe)
3. Anna Anufrikova   - Cross-Border Legal & SCC Compliance Specialist (GMT+1, Europe)
4. Finn Chapman      - Duty-of-Care & Safeguarding Operations Lead (GMT+1, UK)
5. Harvey Young      - University Partnerships & Foreign Donors Director (GMT-4, US)
6. Eric Vadan        - Carbon Methodology & Verra VCS Auditor (Indochina Time, UTC+7)
7. Benicio Franqui   - International Student Placements Coordinator (GMT-4, Americas)
8. Sovanthep Sous    - Cambodia NGO Advisory & MoI Liaison (Indochina Time, UTC+7)

================================================================================
11. FIRST-TIME USER QUICK-START CHECKLIST
================================================================================
Step 1: Check Current Regional Times in the top live navigation bar.
Step 2: Inspect the Core Team Directory via the 'Team & Time Zones' button.
Step 3: Review the Kanban board in 'Workflows & Tasks'.
Step 4: Explore the 'Relational CRM' directory of vetted NGOs and universities.
Step 5: Test Duty-of-Care Incident logging and witness automated P1 escalation.
Step 6: Trigger an automated cryptographic SCC agreement under 'SCC Compliance'.
`}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            File path in workspace: <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded">/USER_GUIDE.txt</code>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
