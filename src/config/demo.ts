import { UserProfile } from '../types';

/**
 * Checks whether Demo Mode is permitted to run.
 *
 * STRICT SECURITY CONSTRAINTS:
 * 1. Strictly prevented from activating in production builds (import.meta.env.PROD).
 * 2. In local development (import.meta.env.DEV), controlled via explicit environment setting
 *    (VITE_ENABLE_DEMO_MODE) with default-enabled dev support for local presentations.
 */
export const isDemoModeAllowed = (): boolean => {
  // Prevent demo mode from ever activating in production builds
  if (import.meta.env.PROD) {
    return false;
  }

  // Explicit environment toggle in local development
  if (import.meta.env.VITE_ENABLE_DEMO_MODE !== undefined) {
    return import.meta.env.VITE_ENABLE_DEMO_MODE === 'true' || import.meta.env.VITE_ENABLE_DEMO_MODE === '1';
  }

  return Boolean(import.meta.env.DEV);
};

const STORAGE_KEY = 'neeledger_demo_persona';

export type DemoPersona = 'user' | 'admin';

/**
 * Gets the currently selected demo persona from session storage (if any).
 */
export const getStoredDemoPersona = (): DemoPersona | null => {
  if (!isDemoModeAllowed() || typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored === 'user' || stored === 'admin') {
    return stored;
  }
  return null;
};

/**
 * Sets or clears the active demo persona.
 */
export const setStoredDemoPersona = (persona: DemoPersona | null): void => {
  if (typeof window === 'undefined') return;
  if (persona) {
    sessionStorage.setItem(STORAGE_KEY, persona);
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
};

/**
 * Demo User Profile (Project Proponent / Developer)
 * Used strictly for local hackathon and presentation walkthroughs.
 */
export const DEMO_USER_PROFILE: UserProfile = {
  id: 'demo-user-proponent-001',
  email: 'proponent.demo@neeledger.org',
  name: 'Aarav Sharma (Demo Proponent)',
  role: 'Project Proponent',
  is_admin: false,
  is_disabled: false,
  kyc_status: 'Done',
  wallet_address: '0x71C...DemoProponent42',
  credits: 2450.0,
  member_since: '2025-01-15T10:00:00Z',
  additional_data: {
    company: 'Sundarbans Coastal Biosphere Ltd',
    kycDocument: 'sundarbans_kyc_verification.pdf',
    isDemo: true
  }
};

/**
 * Demo Admin Profile (MRV Auditor / Platform Administrator)
 * Grants local client view permissions for the Admin Panel without real Supabase admin credentials.
 */
export const DEMO_ADMIN_PROFILE: UserProfile = {
  id: 'demo-admin-auditor-001',
  email: 'auditor.admin@neeledger.org',
  name: 'NeeLedger Auditor (Demo Admin)',
  role: 'Project Developer',
  is_admin: true,
  is_disabled: false,
  kyc_status: 'Done',
  wallet_address: '0x99A...DemoAuditor01',
  credits: 50000.0,
  member_since: '2024-06-01T08:30:00Z',
  additional_data: {
    department: 'MRV Carbon Standards Audit Board',
    isDemo: true
  }
};
