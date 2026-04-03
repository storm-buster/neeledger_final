import { Project, Account, ACVA, Validation, Verification, DashboardStats, Notification } from '../types';

export const mockStats: DashboardStats = {
  totalProjects: 156,
  totalCarbonRemoved: 45230,
  totalCreditsIssued: 38750,
  totalBufferCredits: 6480
};

export const mockNotifications: Notification[] = [
  { id: '1', type: 'kyc', message: 'Pending KYCs', count: 12, timestamp: '2024-01-15T10:30:00Z' },
  { id: '2', type: 'validation', message: 'Pending Validations', count: 8, timestamp: '2024-01-15T09:15:00Z' },
  { id: '3', type: 'verification', message: 'Pending Verifications', count: 15, timestamp: '2024-01-15T08:45:00Z' },
  { id: '4', type: 'credits', message: 'Carbon credits issued', count: 2340, timestamp: '2024-01-15T07:20:00Z' }
];

export const mockProjects: Project[] = [
  {
    id: 'PRJ-003',
    accountId: 'ACC-001',
    creditsIssued: 1500,
    startDate: '2023-05-15',
    riskAssessment: 'Low',
    bufferCredits: 150,
    country: 'India',
    status: 'Active',
    timeline: [
      { date: '2023-05-15', event: 'Project Started', status: 'Completed' },
      { date: '2023-07-20', event: 'Validation Completed', creditsIssued: 0, acvaId: 'ACVA-001', status: 'Completed' },
      { date: '2023-11-15', event: 'First Verification', creditsIssued: 750, acvaId: 'ACVA-001', status: 'Completed' },
      { date: '2024-05-15', event: 'Second Verification', creditsIssued: 750, acvaId: 'ACVA-001', status: 'Completed' }
    ],
    metadata: {
      area: 400,
      methodology: 'VM0007',
      documentation: ['PDD.pdf', 'Monitoring_Report_1.pdf', 'Monitoring_Report_2.pdf'],
      ownership: 'Mumbai Coastal Restoration',
      coordinates: { lat: 19.0760, lng: 72.8777 }
    }
  },
  {
    id: 'PRJ-004',
    accountId: 'ACC-002',
    creditsIssued: 1200,
    startDate: '2023-08-10',
    riskAssessment: 'Medium',
    bufferCredits: 120,
    country: 'India',
    status: 'Active',
    timeline: [
      { date: '2023-08-10', event: 'Project Started', status: 'Completed' },
      { date: '2023-10-25', event: 'Validation Completed', creditsIssued: 0, acvaId: 'ACVA-002', status: 'Completed' },
      { date: '2024-02-10', event: 'First Verification', creditsIssued: 1200, acvaId: 'ACVA-002', status: 'Completed' }
    ],
    metadata: {
      area: 300,
      methodology: 'VM0015',
      documentation: ['PDD.pdf', 'Monitoring_Report_1.pdf'],
      ownership: 'Chennai Mangrove Project',
      coordinates: { lat: 13.0827, lng: 80.2707 }
    }
  },
  {
    id: 'PRJ-005',
    accountId: 'ACC-003',
    creditsIssued: 1800,
    startDate: '2023-03-20',
    riskAssessment: 'Low',
    bufferCredits: 180,
    country: 'India',
    status: 'Active',
    timeline: [
      { date: '2023-03-20', event: 'Project Started', status: 'Completed' },
      { date: '2023-05-15', event: 'Validation Completed', creditsIssued: 0, acvaId: 'ACVA-003', status: 'Completed' },
      { date: '2023-09-20', event: 'First Verification', creditsIssued: 900, acvaId: 'ACVA-003', status: 'Completed' },
      { date: '2024-03-20', event: 'Second Verification', creditsIssued: 900, acvaId: 'ACVA-003', status: 'Completed' }
    ],
    metadata: {
      area: 500,
      methodology: 'VM0007',
      documentation: ['PDD.pdf', 'Monitoring_Report_1.pdf', 'Monitoring_Report_2.pdf'],
      ownership: 'Kolkata Delta Conservation',
      coordinates: { lat: 22.5726, lng: 88.3639 }
    }
  }
];

export const mockAccounts: Account[] = [
  {
    id: 'ACC-001',
    companyName: 'Green Forest Initiative',
    projects: ['PRJ-001', 'PRJ-003'],
    kycDocument: 'kyc_green_forest.pdf',
    accountType: 'Project Proponent',
    email: 'contact@greenforest.com',
    registrationDate: '2023-05-20',
    kycStatus: 'Done'
  },
  {
    id: 'ACC-002',
    companyName: 'Tropical Conservation Corp',
    projects: ['PRJ-002'],
    kycDocument: 'kyc_tropical_conservation.pdf',
    accountType: 'Project Proponent',
    email: 'info@tropicalconservation.org',
    registrationDate: '2023-08-15',
    kycStatus: 'Done'
  },
  {
    id: 'ACC-003',
    companyName: 'Carbon Trade Solutions',
    projects: [],
    kycDocument: 'kyc_carbon_trade.pdf',
    accountType: 'Trader',
    email: 'admin@carbontradesolutions.com',
    registrationDate: '2024-01-10',
    kycStatus: 'Pending'
  }
];

export const mockACVAs: ACVA[] = [
  {
    id: 'ACVA-001',
    agencyName: 'Global Carbon Verification',
    country: 'United States',
    projectsAssigned: ['PRJ-001', 'PRJ-004'],
    status: 'Active',
    accreditationDocs: ['accreditation_gcv.pdf', 'iso_certificate.pdf'],
    contactInfo: {
      email: 'verification@globalcarbon.com',
      phone: '+1-555-0123'
    }
  },
  {
    id: 'ACVA-002',
    agencyName: 'EcoVerify International',
    country: 'Germany',
    projectsAssigned: ['PRJ-002', 'PRJ-005'],
    status: 'Active',
    accreditationDocs: ['accreditation_evi.pdf'],
    contactInfo: {
      email: 'contact@ecoverify.de',
      phone: '+49-30-12345678'
    }
  },
  {
    id: 'ACVA-003',
    agencyName: 'Indian Carbon Standards Authority',
    country: 'India',
    projectsAssigned: ['PRJ-003'],
    status: 'Active',
    accreditationDocs: ['icsa_accreditation.pdf', 'moefcc_approval.pdf', 'iso_14064.pdf'],
    contactInfo: {
      email: 'verification@icsa.gov.in',
      phone: '+91-11-2345-6789'
    }
  },
  {
    id: 'ACVA-004',
    agencyName: 'Asia Pacific Climate Validators',
    country: 'Singapore',
    projectsAssigned: [],
    status: 'Active',
    accreditationDocs: ['apcv_accreditation.pdf', 'verra_partnership.pdf'],
    contactInfo: {
      email: 'audits@apcvalidators.sg',
      phone: '+65-6234-5678'
    }
  },
  {
    id: 'ACVA-005',
    agencyName: 'Bureau Veritas Carbon Services',
    country: 'France',
    projectsAssigned: [],
    status: 'Pending',
    accreditationDocs: ['bv_accreditation_pending.pdf'],
    contactInfo: {
      email: 'carbon@bureauveritas.com',
      phone: '+33-1-4321-5678'
    }
  }
];

export const mockValidations: Validation[] = [
  {
    projectId: 'PRJ-003',
    accountId: 'ACC-001',
    startDate: '2024-01-15',
    pddDocument: 'pdd_prj003.pdf',
    validationReport: 'validation_report_prj003.pdf',
    acvaId: 'ACVA-001',
    status: 'Pending',
    submissionDate: '2024-01-20'
  },
  {
    projectId: 'PRJ-004',
    accountId: 'ACC-004',
    startDate: '2024-02-01',
    pddDocument: 'pdd_prj004.pdf',
    acvaId: 'ACVA-002',
    status: 'Pending',
    submissionDate: '2024-02-05'
  }
];

export const mockVerifications: Verification[] = [
  {
    projectId: 'PRJ-001',
    accountId: 'ACC-001',
    cyclesDone: 2,
    currentCycle: 3,
    acvaId: 'ACVA-001',
    pddDocument: 'pdd_prj001.pdf',
    verificationReport: 'verification_report_prj001_cycle3.pdf',
    creditsRecommended: 650,
    bufferCreditsDeducted: 65,
    status: 'Pending',
    verificationDate: '2024-12-15'
  },
  {
    projectId: 'PRJ-002',
    accountId: 'ACC-002',
    cyclesDone: 1,
    currentCycle: 2,
    acvaId: 'ACVA-002',
    pddDocument: 'pdd_prj002.pdf',
    creditsRecommended: 720,
    bufferCreditsDeducted: 72,
    status: 'Pending',
    verificationDate: '2024-09-10'
  }
];
