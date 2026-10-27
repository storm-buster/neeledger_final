export interface Project {
  id: string;
  accountId: string;
  creditsIssued: number;
  startDate: string;
  riskAssessment: 'Low' | 'Medium' | 'High';
  bufferCredits: number;
  country: string;
  status: 'Active' | 'Pending' | 'Completed' | 'under_validation' | 'sanctioned' | 'under_verification' | 'verification_in_progress' | 'credits_released';
  timeline: ProjectTimeline[];
  metadata: ProjectMetadata;
  assigned_acva?: string;
  verification_acva?: string;
  claimed_credits?: number;
  released_credits?: number;
}

export interface ProjectTimeline {
  date: string;
  event: string;
  creditsIssued?: number;
  acvaId?: string;
  status: 'Completed' | 'Pending';
}

export interface ProjectMetadata {
  area: number;
  methodology: string;
  documentation: string[];
  ownership: string;
  coordinates: { lat: number; lng: number };
  // Optional, UI-friendly fields
  summary?: string;
  location?: string;
}

// System authorization role (Admin Panel vs User Panel access)
export type AuthorizationRole = 'admin' | 'user';

// Business account types
export type BusinessAccountType = 'Project Developer' | 'Project Proponent' | 'Trader';

// Database profile representation from public.users
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: BusinessAccountType;
  is_admin: boolean;
  is_disabled?: boolean;
  wallet_address?: string;
  credits?: number;
  kyc_status?: string;
  kyc_document?: string;
  member_since?: string;
  additional_data?: Record<string, any>;
}

export interface Account {
  id: string;
  companyName: string;
  projects: string[];
  kycDocument: string;
  accountType: 'Project Proponent' | 'Trader';
  email: string;
  registrationDate: string;
  kycStatus: 'Done' | 'Pending' | 'In Process';
}

export interface ACVA {
  id: string;
  agencyName: string;
  country: string;
  projectsAssigned: string[];
  status: 'Active' | 'Pending' | 'Suspended';
  accreditationDocs: string[];
  contactInfo: {
    email: string;
    phone: string;
  };
}

export interface Validation {
  projectId: string;
  accountId: string;
  startDate: string;
  pddDocument: string;
  validationReport?: string;
  acvaId: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submissionDate: string;
}

export interface Verification {
  projectId: string;
  accountId: string;
  cyclesDone: number;
  currentCycle: number;
  acvaId: string;
  pddDocument: string;
  verificationReport?: string;
  approvedDocument?: string;
  creditsRecommended: number;
  bufferCreditsDeducted: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  verificationDate: string;
}

export interface XAIResult {
  claimed: number;
  predicted: number;
  confidence: number;
  featureImportance: {
    [key: string]: number; // Allow dynamic feature names
  };
  geminiInsights?: {
    analysis: string;
    recommendations: string[];
    riskFactors: string[];
  };
  modelCombination?: {
    combined: boolean;
    xaiWeight: number;
    geminiWeight: number;
  };
}

export interface XAIResponse {
  treeCount: number;
  canopyCover: number;
  co2Tonnes: number;
  uncertainty: number;
  liveness: {
    movementScore: number;
    lipSyncScore: number;
    livenessScore: number; // 0-1
    authenticity: 'Pass' | 'Fail';
  };
  decisionCategory: 'Auto Pre-approve' | 'ACVA Manual Review' | 'Field Audit';
}

export interface DashboardStats {
  totalProjects: number;
  totalCarbonRemoved: number;
  totalCreditsIssued: number;
  totalBufferCredits: number;
}

export interface Notification {
  id: string;
  type: 'kyc' | 'validation' | 'verification' | 'credits';
  title: string;
  message: string;
  count?: number;
  timestamp: string;
  read?: boolean;
}
