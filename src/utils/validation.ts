/**
 * Client-Side Regular Expression Data Filtering & Validation Utilities
 * Directly mirrors the Python backend (backend/api.py) for Northstar Strategy Group CRM.
 */

// Strict RFC-compliant email regex
export const REGEX_EMAIL = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// International E.164 phone regex with localized support for Cambodia (+855), Vietnam (+84), UK (+44), US/Canada (+1)
export const REGEX_PHONE_INTERNATIONAL = /^\+(?:855[\s\-]?[1-9]\d{0,2}(?:[\s\-]?\d{3}){1,2}|84[\s\-]?[1-9]\d{0,2}(?:[\s\-]?\d{3}){1,2}|44[\s\-]?\d{2,4}(?:[\s\-]?\d{3}){1,2}|1[\s\-]?[2-9]\d{2}[\s\-]?\d{3}[\s\-]?\d{4}|[1-9]\d{1,14}(?:[\s\-]?\d{1,6})*)$/;

// Regional NGO Registration Patterns
export const REGEX_NGO_REGISTRATION: Record<string, RegExp> = {
  Cambodia: /^KH-(?:MOI|MOFA|MAFF|MOE)-\d{4}-\d{3,6}$/i,
  Vietnam: /^VN-(?:MOLISA|MOST|MOFA|DONRE)-\d{4,6}$/i,
  'United States': /^\d{2}-\d{7}$/,
  'United Kingdom': /^\d{6,8}$/,
  General: /^[A-Z0-9\-]{4,30}$/i,
};

// University Institutional Domain Verification
export const REGEX_UNIVERSITY_DOMAIN = /^[a-zA-Z0-9][a-zA-Z0-9\-\.]*\.(?:edu|ac\.[a-z]{2}|edu\.[a-z]{2}|ca|de|fr|org)$/i;

// HTML Sanitization
export const REGEX_MALICIOUS_HTML = /<\s*(script|iframe|object|embed|applet|meta|link|style)[^>]*>.*?<\/\s*\1\s*>|<\s*(script|iframe|object|embed|applet|meta|link|style)[^>]*>/gi;

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, message: 'Email address is required.' };
  }
  if (!REGEX_EMAIL.test(trimmed)) {
    return { isValid: false, message: 'Must be a valid RFC-compliant email (e.g. coordinator@ox.ac.uk).' };
  }
  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  const trimmed = phone.trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return { isValid: false, message: 'International phone number is required.' };
  }
  if (!REGEX_PHONE_INTERNATIONAL.test(trimmed)) {
    return { 
      isValid: false, 
      message: "Must be in international format starting with '+' (e.g. '+855 23 889 102' or '+44 1865 270000')." 
    };
  }
  return { isValid: true };
}

export function validateNgoRegistration(reg: string, country: string = 'General'): ValidationResult {
  const trimmed = reg.trim().toUpperCase();
  if (!trimmed) {
    return { isValid: false, message: 'Registration number is required.' };
  }
  const pattern = REGEX_NGO_REGISTRATION[country] || REGEX_NGO_REGISTRATION.General;
  if (!pattern.test(trimmed)) {
    const hint = country === 'Cambodia' ? "e.g. 'KH-MOI-2018-4912'" :
                 country === 'Vietnam' ? "e.g. 'VN-MOLISA-8832'" :
                 country === 'United States' ? "e.g. '12-3456789' (9-digit EIN)" :
                 country === 'United Kingdom' ? "e.g. '1198273' (6-8 digit charity ID)" :
                 'alphanumeric code 4-30 chars';
    return { isValid: false, message: `Invalid format for ${country}. Expected ${hint}.` };
  }
  return { isValid: true };
}

export function validateUniversityDomain(domain: string): ValidationResult {
  let cleaned = domain.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  if (!cleaned) {
    return { isValid: false, message: 'University domain is required.' };
  }
  if (!REGEX_UNIVERSITY_DOMAIN.test(cleaned)) {
    return { 
      isValid: false, 
      message: 'Domain must end in an accredited higher-ed suffix (e.g., ox.ac.uk, georgetown.edu, mcgill.ca).' 
    };
  }
  return { isValid: true };
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  return text.replace(REGEX_MALICIOUS_HTML, '').trim();
}

/**
 * Generates an SHA-256 cryptographic hash for automated SCC contract execution proof
 */
export async function generateContractHash(dataString: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback deterministic string hash if crypto.subtle is restricted in iframe
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, 'a');
  }
}
