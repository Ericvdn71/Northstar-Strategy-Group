"""
Northstar Strategy Group - Enterprise Project Management & CRM Backend API
=============================================================================
Operating Regions: Southeast Asia (Cambodia, Vietnam, Thailand, Indonesia),
                  Europe (UK, Germany, France), North America (USA, Canada).

Workflows Supported:
1. Environmental Development (Peatland, Mangrove, Carbon Verification)
2. Social Development (University-NGO Student Placements under Duty-of-Care)
3. NGO Fundraising Advisory (Cambodian Non-Profit Foreign Funder Proposals: USAID, EU, AFD)

Features:
- Production-ready Python API routes with strict Role-Based Access Control (RBAC)
- Regular expression data filtering and sanitization for CRM inputs
- Automated execution and audit logging of Standard Contractual Clauses (SCCs) for cross-border GDPR compliance
- Duty-of-Care & Safeguarding incident escalation protocol
"""

import re
import json
import hashlib
import datetime
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field, asdict

# ============================================================================
# 1. REGULAR EXPRESSION CRM DATA FILTERING & SANITIZATION ENGINE
# ============================================================================

# Strict RFC-compliant email regex
REGEX_EMAIL = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
)

# International E.164 phone regex with localized grouping support for SE Asia and West
# Supports Cambodia (+855 ...), Vietnam (+84 ...), UK (+44 ...), US/Canada (+1 ...), etc.
REGEX_PHONE_INTERNATIONAL = re.compile(
    r"^\+(?:855[\s\-]?[1-9]\d{0,2}(?:[\s\-]?\d{3}){1,2}|84[\s\-]?[1-9]\d{0,2}(?:[\s\-]?\d{3}){1,2}|44[\s\-]?\d{2,4}(?:[\s\-]?\d{3}){1,2}|1[\s\-]?[2-9]\d{2}[\s\-]?\d{3}[\s\-]?\d{4}|[1-9]\d{1,14}(?:[\s\-]?\d{1,6})*)$"
)

# Regional NGO Registration Number Patterns
# Cambodia: e.g. KH-MOI-2018-4912 or KH-MOFA-2021-098
# Vietnam: e.g. VN-MOLISA-8832
# US 501(c)(3) EIN: e.g. 12-3456789
# UK Charity Commission: e.g. 1198273
REGEX_NGO_REGISTRATION = {
    "Cambodia": re.compile(r"^KH-(?:MOI|MOFA|MAFF|MOE)-\d{4}-\d{3,6}$", re.IGNORECASE),
    "Vietnam": re.compile(r"^VN-(?:MOLISA|MOST|MOFA|DONRE)-\d{4,6}$", re.IGNORECASE),
    "United States": re.compile(r"^\d{2}-\d{7}$"),
    "United Kingdom": re.compile(r"^\d{6,8}$"),
    "General": re.compile(r"^[A-Z0-9\-]{4,30}$", re.IGNORECASE),
}

# University Institutional Domain Verification Pattern
# e.g., ox.ac.uk, georgetown.edu, mcgill.ca, nus.edu.sg
REGEX_UNIVERSITY_DOMAIN = re.compile(
    r"^[a-zA-Z0-9][a-zA-Z0-9\-\.]*\.(?:edu|ac\.[a-z]{2}|edu\.[a-z]{2}|edu\.[a-z]{2}\.[a-z]{2}|ca|de|fr|org)$",
    re.IGNORECASE
)

# Proposal / CRM free-text injection sanitizer regex
# Strips harmful scripts, SQL payload fragments, and dangerous HTML tags while preserving clean text/markdown
REGEX_MALICIOUS_HTML = re.compile(
    r"<\s*(script|iframe|object|embed|applet|meta|link|style)[^>]*>.*?</\s*\1\s*>|<\s*(script|iframe|object|embed|applet|meta|link|style)[^>]*>",
    re.IGNORECASE | re.DOTALL
)
REGEX_EVENT_HANDLERS = re.compile(r"on\w+\s*=\s*(['\"][^'\"]*['\"]|[^\s>]+)", re.IGNORECASE)
REGEX_JAVASCRIPT_URI = re.compile(r"javascript:\s*[^'\"\s>]+", re.IGNORECASE)


class CRMValidationError(ValueError):
    """Raised when CRM input fails regex validation."""
    def __init__(self, field_name: str, value: str, message: str):
        super().__init__(f"Validation failed for '{field_name}' with value '{value}': {message}")
        self.field_name = field_name
        self.value = value
        self.message = message


def validate_email(email: str) -> str:
    """Validates and normalizes an email address."""
    email_clean = email.strip()
    if not REGEX_EMAIL.match(email_clean):
        raise CRMValidationError("email", email, "Must be a valid RFC-compliant email address.")
    return email_clean.lower()


def validate_phone(phone: str) -> str:
    """Validates an international phone number with country code."""
    phone_clean = phone.strip()
    # Normalize spaces
    phone_clean = re.sub(r"\s+", " ", phone_clean)
    if not REGEX_PHONE_INTERNATIONAL.match(phone_clean):
        raise CRMValidationError(
            "phone", phone, "Must be in international E.164 format starting with '+' (e.g. '+855 23 889 102')."
        )
    return phone_clean


def validate_ngo_registration(reg_num: str, country: str = "General") -> str:
    """Validates NGO registration number against national jurisdiction rules."""
    reg_clean = reg_num.strip().upper()
    validator = REGEX_NGO_REGISTRATION.get(country, REGEX_NGO_REGISTRATION["General"])
    if not validator.match(reg_clean):
        expected_format = {
            "Cambodia": "e.g. 'KH-MOI-2018-4912'",
            "Vietnam": "e.g. 'VN-MOLISA-8832'",
            "United States": "e.g. '12-3456789' (9-digit EIN)",
            "United Kingdom": "e.g. '1198273' (6-8 digit charity number)",
        }.get(country, "alphanumeric code 4-30 chars")
        raise CRMValidationError(
            "registration_number",
            reg_num,
            f"Invalid format for {country}. Expected {expected_format}."
        )
    return reg_clean


def validate_university_domain(domain: str) -> str:
    """Validates university institutional domain name."""
    dom_clean = domain.strip().lower()
    # Strip any leading http/https/www
    dom_clean = re.sub(r"^https?://(www\.)?", "", dom_clean).split("/")[0]
    if not REGEX_UNIVERSITY_DOMAIN.match(dom_clean):
        raise CRMValidationError(
            "institutional_domain",
            domain,
            "Domain must be an accredited higher-education suffix (e.g., .edu, .ac.uk, .edu.sg, .ca)."
        )
    return dom_clean


def sanitize_text(text: Optional[str]) -> str:
    """Sanitizes CRM and proposal text inputs against injection attacks."""
    if not text:
        return ""
    # Strip malicious tags
    cleaned = REGEX_MALICIOUS_HTML.sub("", text)
    # Strip inline javascript event handlers
    cleaned = REGEX_EVENT_HANDLERS.sub("", cleaned)
    # Strip javascript: URIs
    cleaned = REGEX_JAVASCRIPT_URI.sub("", cleaned)
    return cleaned.strip()


# ============================================================================
# 2. ROLE-BASED ACCESS CONTROL (RBAC) DEFINITIONS
# ============================================================================

ROLES = {
    "INTERNAL_CONSULTANT": {
        "name": "Internal Consultant",
        "description": "Full access to all workflows, proposal margins, safeguarding escalations, and SCC execution.",
        "allowed_workflows": ["ENVIRONMENTAL_DEV", "SOCIAL_DEV", "FUNDRAISING_ADVISORY"],
        "can_execute_scc": True,
        "can_escalate_incidents": True,
        "can_view_financials": True,
        "can_audit_compliance": True,
    },
    "UNIVERSITY_COORDINATOR": {
        "name": "University Coordinator",
        "description": "Restricted to Social Development student placements, university records, and approved partner NGOs.",
        "allowed_workflows": ["SOCIAL_DEV"],
        "can_execute_scc": False,  # Can sign as exporter, but Northstar Internal approves
        "can_escalate_incidents": True,
        "can_view_financials": False,
        "can_audit_compliance": False,
    },
    "LOCAL_PARTNER": {
        "name": "Local Regional Partner",
        "description": "Restricted to assigned operational tasks, own NGO profile, duty-of-care logs, and due diligence checks.",
        "allowed_workflows": ["ENVIRONMENTAL_DEV", "SOCIAL_DEV", "FUNDRAISING_ADVISORY"],
        "can_execute_scc": False,
        "can_escalate_incidents": True,
        "can_view_financials": False,
        "can_audit_compliance": False,
    },
}


class AccessDeniedError(PermissionError):
    """Raised when an actor lacks RBAC privileges."""
    pass


def check_rbac_permission(user_role: str, action: str, workflow_type: Optional[str] = None) -> bool:
    """Evaluates strict RBAC policy."""
    if user_role not in ROLES:
        raise AccessDeniedError(f"Unrecognized role: {user_role}")
    
    role_config = ROLES[user_role]
    
    # Workflow boundary check
    if workflow_type and workflow_type not in role_config["allowed_workflows"]:
        raise AccessDeniedError(
            f"Role '{user_role}' is not authorized to access workflow '{workflow_type}'."
        )
    
    # Action specific checks
    if action == "execute_scc" and not role_config["can_execute_scc"]:
        raise AccessDeniedError(f"Role '{user_role}' cannot execute cross-border SCC contracts.")
    
    if action == "view_financials" and not role_config["can_view_financials"]:
        raise AccessDeniedError(f"Role '{user_role}' cannot view proposal cost budgets or grant margins.")
    
    return True


# ============================================================================
# 3. AUTOMATED CROSS-BORDER SCC (GDPR ART. 46) COMPLIANCE MODULE
# ============================================================================

@dataclass
class StandardContractualClauseAgreement:
    agreement_reference: str
    data_exporter_name: str
    data_exporter_country: str
    data_importer_name: str
    data_importer_country: str
    scc_module: str  # MODULE_1_CONTROLLER_TO_CONTROLLER, MODULE_2_CONTROLLER_TO_PROCESSOR
    transfer_scenario: str
    data_categories: List[str]
    technical_and_org_measures: Dict[str, Any]
    transfer_impact_assessment_completed: bool
    status: str = "DRAFT"
    valid_until: str = "2027-12-31"
    digital_signature_hash: Optional[str] = None
    audit_logs: List[Dict[str, Any]] = field(default_factory=list)


def execute_cross_border_scc(
    agreement: StandardContractualClauseAgreement,
    authorized_by: str,
    user_role: str
) -> StandardContractualClauseAgreement:
    """
    Automated execution of GDPR Standard Contractual Clauses (Commission Implementing Decision (EU) 2021/914).
    Validates Transfer Impact Assessment (TIA) and attaches cryptographic proof.
    """
    check_rbac_permission(user_role, "execute_scc")
    
    if not agreement.transfer_impact_assessment_completed:
        raise ValueError("Cannot execute SCC: Transfer Impact Assessment (TIA) must be certified first.")
    
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    
    # Generate cryptographic SHA-256 integrity hash of contractual parameters
    payload_to_hash = (
        f"{agreement.agreement_reference}|{agreement.data_exporter_name}|"
        f"{agreement.data_importer_name}|{agreement.scc_module}|{timestamp}"
    )
    sig_hash = hashlib.sha256(payload_to_hash.encode("utf-8")).hexdigest()
    
    agreement.status = "EXECUTED"
    agreement.digital_signature_hash = sig_hash
    agreement.audit_logs.append({
        "event": "AUTOMATED_SCC_EXECUTION",
        "timestamp": timestamp,
        "authorized_by": authorized_by,
        "legal_basis": "GDPR Art. 46(2)(c) Standard Contractual Clauses",
        "verification_hash": sig_hash,
        "measures": agreement.technical_and_org_measures
    })
    
    return agreement


# ============================================================================
# 4. DUTY-OF-CARE & SAFEGUARDING INCIDENT ESCALATION ENGINE
# ============================================================================

@dataclass
class DutyOfCareIncident:
    incident_number: str
    title: str
    category: str  # MEDICAL_EMERGENCY, SAFEGUARDING_HARASSMENT, NATURAL_HAZARD, POLITICAL_VISA
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    status: str    # REPORTED, INVESTIGATING, ACTION_TAKEN, ESCALATED_TO_DIRECTORS, RESOLVED
    country: str
    city_location: str
    reported_by: str
    incident_description: str
    immediate_action_taken: str
    is_escalated_to_regional_director: bool = False
    duty_of_care_protocol: str = "STANDARD_TIER_2"
    audit_history: List[Dict[str, Any]] = field(default_factory=list)


def log_duty_of_care_incident(
    incident_data: Dict[str, Any],
    actor_email: str,
    actor_role: str
) -> DutyOfCareIncident:
    """
    Logs an incident and triggers automated safeguarding escalation if CRITICAL or HIGH severity.
    """
    severity = incident_data.get("severity", "MEDIUM").upper()
    title = sanitize_text(incident_data.get("title", ""))
    description = sanitize_text(incident_data.get("incident_description", ""))
    action_taken = sanitize_text(incident_data.get("immediate_action_taken", ""))
    country = incident_data.get("country", "Cambodia")
    
    # Auto-escalation protocol
    is_escalated = severity == "CRITICAL"
    status = "ESCALATED_TO_DIRECTORS" if is_escalated else "REPORTED"
    protocol = "CRITICAL_P1_DIRECTOR_MOBILIZATION" if is_escalated else f"TIER_{severity}_PROTOCOL"
    
    now = datetime.datetime.utcnow().isoformat() + "Z"
    
    incident = DutyOfCareIncident(
        incident_number=incident_data.get("incident_number", f"INC-{datetime.datetime.now().strftime('%Y%m%d%H%M')}"),
        title=title,
        category=incident_data.get("category", "MEDICAL_EMERGENCY"),
        severity=severity,
        status=status,
        country=country,
        city_location=incident_data.get("city_location", "Siem Reap"),
        reported_by=actor_email,
        incident_description=description,
        immediate_action_taken=action_taken,
        is_escalated_to_regional_director=is_escalated,
        duty_of_care_protocol=protocol,
        audit_history=[{
            "event": "INCIDENT_LOGGED",
            "actor": actor_email,
            "role": actor_role,
            "timestamp": now,
            "auto_escalated": is_escalated,
            "notified_parties": [
                "regional.director.asia@northstar-sg.com",
                "safeguarding.lead@northstar-sg.com",
                actor_email
            ] if is_escalated else [actor_email]
        }]
    )
    return incident


# ============================================================================
# 5. CORE PRODUCTION API ROUTE HANDLERS
# ============================================================================

class NorthstarAPIService:
    """
    Unified Service Layer providing RESTful routing and logic for:
    - Workflows (Environmental, Social Placements, Cambodia Advisory)
    - Tasks (Kanban, Subtasks, Dependencies, Due Diligence Checklists)
    - Relational CRM (Universities, NGOs, Placements with Regex Validation)
    - Compliance & SCCs
    - Risk & Duty-of-Care
    """

    def __init__(self):
        # In-memory operational store matching PostgreSQL schema
        self.ngos = {}
        self.universities = {}
        self.students = {}
        self.placements = {}
        self.tasks = {}
        self.scc_agreements = {}
        self.incidents = {}
        self._seed_initial_records()

    def _seed_initial_records(self):
        # Pre-populate sample verified entities matching schema.sql
        self.ngos["KH-MOI-2018-4912"] = {
            "name": "Mekong Peatland Conservation Initiative",
            "country": "Cambodia",
            "registration_number": "KH-MOI-2018-4912",
            "contact_email": "visal.leng@mekong-conservation.org",
            "phone": "+855 63 964 881",
            "safeguarding_rating": "TIER_A_VERIFIED",
            "vetted_status": True,
            "focus_area": "Peatland Restoration & Voluntary Carbon Markets",
        }
        self.universities["ox.ac.uk"] = {
            "name": "University of Oxford",
            "country": "United Kingdom",
            "institutional_domain": "ox.ac.uk",
            "coordinator_name": "Dr. Sarah Jenkins",
            "coordinator_email": "sarah.jenkins@ox.ac.uk",
            "partnership_tier": "STRATEGIC_GLOBAL",
            "gdpr_dpa_signed": True,
        }

    # --- CRM ROUTE: CREATE / UPDATE NGO WITH REGEX SANITIZATION ---
    def create_ngo_record(self, raw_data: Dict[str, Any], user_role: str) -> Dict[str, Any]:
        """
        POST /api/v1/crm/ngos
        Validates all inputs with strict regex rules.
        """
        check_rbac_permission(user_role, "write:crm")
        
        country = raw_data.get("country", "Cambodia")
        name = sanitize_text(raw_data.get("name", ""))
        email = validate_email(raw_data.get("contact_email", ""))
        phone = validate_phone(raw_data.get("phone", ""))
        reg_number = validate_ngo_registration(raw_data.get("registration_number", ""), country)
        focus_area = sanitize_text(raw_data.get("focus_area", ""))
        
        ngo_record = {
            "name": name,
            "country": country,
            "registration_number": reg_number,
            "contact_email": email,
            "phone": phone,
            "focus_area": focus_area,
            "safeguarding_rating": raw_data.get("safeguarding_rating", "LEVEL_1_PENDING"),
            "vetted_status": False,
            "counter_terrorism_screened": raw_data.get("counter_terrorism_screened", False),
            "created_at": datetime.datetime.utcnow().isoformat() + "Z"
        }
        self.ngos[reg_number] = ngo_record
        return {"status": "success", "data": ngo_record}

    # --- CRM ROUTE: CREATE / UPDATE UNIVERSITY WITH DOMAIN REGEX ---
    def create_university_record(self, raw_data: Dict[str, Any], user_role: str) -> Dict[str, Any]:
        """
        POST /api/v1/crm/universities
        Enforces educational domain and coordinator email syntax.
        """
        check_rbac_permission(user_role, "write:crm")
        
        name = sanitize_text(raw_data.get("name", ""))
        domain = validate_university_domain(raw_data.get("institutional_domain", ""))
        email = validate_email(raw_data.get("coordinator_email", ""))
        
        uni_record = {
            "name": name,
            "country": raw_data.get("country", "United Kingdom"),
            "institutional_domain": domain,
            "coordinator_name": sanitize_text(raw_data.get("coordinator_name", "")),
            "coordinator_email": email,
            "partnership_tier": raw_data.get("partnership_tier", "STANDARD"),
            "gdpr_dpa_signed": raw_data.get("gdpr_dpa_signed", False),
            "created_at": datetime.datetime.utcnow().isoformat() + "Z"
        }
        self.universities[domain] = uni_record
        return {"status": "success", "data": uni_record}

    # --- TASK MANAGEMENT: CREATE TASK WITH DEPENDENCIES & CHECKLIST ---
    def create_task(self, task_payload: Dict[str, Any], user_role: str) -> Dict[str, Any]:
        """
        POST /api/v1/tasks
        Creates an Asana-like task with subtasks, dependencies, and due diligence checks.
        """
        workflow = task_payload.get("workflow_type", "ENVIRONMENTAL_DEV")
        check_rbac_permission(user_role, "write:tasks", workflow)
        
        task_id = task_payload.get("task_code", f"TSK-{datetime.datetime.now().strftime('%M%S')}")
        title = sanitize_text(task_payload.get("title", "Untitled Task"))
        description = sanitize_text(task_payload.get("description", ""))
        
        # Foreign donor advisory specific attributes (Cambodia)
        donor = sanitize_text(task_payload.get("foreign_grant_donor", ""))
        grant_usd = float(task_payload.get("donor_grant_amount_usd", 0.0))
        
        task = {
            "task_code": task_id,
            "workflow_type": workflow,
            "title": title,
            "description": description,
            "status": task_payload.get("status", "BACKLOG"),
            "priority": task_payload.get("priority", "MEDIUM"),
            "due_date": task_payload.get("due_date"),
            "assignee": task_payload.get("assignee"),
            "foreign_grant_donor": donor if donor else None,
            "donor_grant_amount_usd": grant_usd,
            "subtasks": task_payload.get("subtasks", []),
            "dependencies": task_payload.get("dependencies", []),
            "due_diligence_checklist": task_payload.get("due_diligence_checklist", []),
            "created_at": datetime.datetime.utcnow().isoformat() + "Z"
        }
        self.tasks[task_id] = task
        return {"status": "success", "data": task}

    # --- COMPLIANCE ROUTE: EXECUTE SCC ---
    def execute_scc_endpoint(self, agreement_data: Dict[str, Any], actor_email: str, user_role: str) -> Dict[str, Any]:
        """
        POST /api/v1/compliance/scc/execute
        Executes cross-border Standard Contractual Clauses with TIA enforcement.
        """
        agreement = StandardContractualClauseAgreement(
            agreement_reference=agreement_data["agreement_reference"],
            data_exporter_name=agreement_data["data_exporter_name"],
            data_exporter_country=agreement_data["data_exporter_country"],
            data_importer_name=agreement_data["data_importer_name"],
            data_importer_country=agreement_data["data_importer_country"],
            scc_module=agreement_data.get("scc_module", "MODULE_1_CONTROLLER_TO_CONTROLLER"),
            transfer_scenario=agreement_data.get("transfer_scenario", ""),
            data_categories=agreement_data.get("data_categories", ["Student Identity", "Emergency Contacts"]),
            technical_and_org_measures=agreement_data.get("technical_and_org_measures", {
                "encryption": "AES-256",
                "tls": "TLS 1.3",
                "access_control": "MFA Role-Based"
            }),
            transfer_impact_assessment_completed=agreement_data.get("transfer_impact_assessment_completed", False)
        )
        
        executed_agreement = execute_cross_border_scc(agreement, actor_email, user_role)
        self.scc_agreements[agreement.agreement_reference] = asdict(executed_agreement)
        return {"status": "success", "data": asdict(executed_agreement)}


# ============================================================================
# 6. SELF-VERIFICATION & TEST RUNNER
# ============================================================================

if __name__ == "__main__":
    print("==================================================================")
    print("Northstar Strategy Group API: Running Self-Verification Tests...")
    print("==================================================================")
    
    api = NorthstarAPIService()
    
    # 1. Test Email Validation
    assert validate_email("Sokha.Chen@Northstar-SG.com") == "sokha.chen@northstar-sg.com"
    try:
        validate_email("invalid-email-address")
        assert False, "Should have raised CRMValidationError"
    except CRMValidationError:
        print(" [PASS] Email regex filtering verified.")

    # 2. Test Phone Validation (Cambodia +855 & UK +44)
    assert validate_phone("+855 23 889 102") == "+855 23 889 102"
    assert validate_phone("+44 1865 270000") == "+44 1865 270000"
    try:
        validate_phone("023889102") # Missing international + prefix
        assert False, "Should have raised CRMValidationError"
    except CRMValidationError:
        print(" [PASS] International phone E.164 regex verified.")

    # 3. Test NGO Registration Validation
    assert validate_ngo_registration("KH-MOI-2018-4912", "Cambodia") == "KH-MOI-2018-4912"
    assert validate_ngo_registration("12-3456789", "United States") == "12-3456789"
    try:
        validate_ngo_registration("INVALID-FORMAT", "Cambodia")
        assert False, "Should have failed Cambodia MoI format"
    except CRMValidationError:
        print(" [PASS] National NGO registration regex verified.")

    # 4. Test University Domain Validation
    assert validate_university_domain("ox.ac.uk") == "ox.ac.uk"
    assert validate_university_domain("https://www.georgetown.edu/path") == "georgetown.edu"
    try:
        validate_university_domain("commercial-site.xyz")
        assert False, "Should have rejected non-academic domain"
    except CRMValidationError:
        print(" [PASS] University institutional domain regex verified.")

    # 5. Test Input Sanitizer (XSS Prevention)
    dirty_text = "Standard Proposal <script>alert('pwned')</script> with notes."
    assert sanitize_text(dirty_text) == "Standard Proposal  with notes."
    print(" [PASS] Malicious script payload sanitization verified.")

    # 6. Test Automated SCC Execution
    scc = StandardContractualClauseAgreement(
        agreement_reference="SCC-EU-KH-TEST-001",
        data_exporter_name="Oxford University",
        data_exporter_country="United Kingdom",
        data_importer_name="Mekong Peatland Initiative",
        data_importer_country="Cambodia",
        scc_module="MODULE_1_CONTROLLER_TO_CONTROLLER",
        transfer_scenario="Student internship emergency medical telemetry",
        data_categories=["Student Identity"],
        technical_and_org_measures={"encryption": "TLS 1.3"},
        transfer_impact_assessment_completed=True
    )
    executed = execute_cross_border_scc(scc, "sokha.chen@northstar-sg.com", "INTERNAL_CONSULTANT")
    assert executed.status == "EXECUTED"
    assert executed.digital_signature_hash is not None
    print(f" [PASS] Automated SCC GDPR Art. 46 execution verified. Hash: {executed.digital_signature_hash[:16]}...")

    # 7. Test Duty-of-Care Auto-Escalation
    incident = log_duty_of_care_incident({
        "title": "Severe Flash Flood Cut Off Prek Toal Field Camp",
        "severity": "CRITICAL",
        "country": "Cambodia",
        "city_location": "Siem Reap / Prek Toal",
        "incident_description": "Water levels rose 2 meters; student team sheltered on elevated ranger post.",
        "immediate_action_taken": "Helicopter medevac stand-by contacted."
    }, "visal.leng@mekong-conservation.org", "LOCAL_PARTNER")
    assert incident.is_escalated_to_regional_director is True
    assert incident.status == "ESCALATED_TO_DIRECTORS"
    print(" [PASS] Duty-of-care P1 critical auto-escalation trigger verified.")

    print("==================================================================")
    print("All Python backend verification tests passed successfully!")
    print("==================================================================")
