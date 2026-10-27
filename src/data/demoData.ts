import { Project, Account, ACVA, DashboardStats } from '../types';

export const demoStats: DashboardStats = {
  totalProjects: 14,
  totalCarbonRemoved: 36240,
  totalCreditsIssued: 28990,
  totalBufferCredits: 4850
};

/**
 * Realistic projects for the Demo User (Project Proponent) Panel.
 * Demonstrates various lifecycle stages, satellite vegetation monitoring, and credit history.
 */
export const demoUserProjects: Project[] = [
  {
    id: 'PRJ-DEMO-001',
    accountId: 'demo-user-proponent-001',
    creditsIssued: 1250,
    startDate: '2025-02-10',
    riskAssessment: 'Low',
    bufferCredits: 125,
    country: 'India',
    status: 'credits_released',
    claimed_credits: 1250,
    released_credits: 1100,
    assigned_acva: 'ACVA-DEMO-001',
    verification_acva: 'ACVA-DEMO-002',
    timeline: [
      { date: '2025-02-10', event: 'Project Registered & PDD Submitted', status: 'Completed' },
      { date: '2025-04-15', event: 'Validation Completed by Global Carbon Verification', acvaId: 'ACVA-DEMO-001', status: 'Completed' },
      { date: '2025-06-01', event: 'Sanctioned by NeeLedger Admin Board', status: 'Completed' },
      { date: '2025-11-20', event: 'Field Verification by EcoVerify International', acvaId: 'ACVA-DEMO-002', status: 'Completed' },
      { date: '2026-01-10', event: '1,100 tCO2e Carbon Credits Released on Ledger', creditsIssued: 1100, status: 'Completed' }
    ],
    metadata: {
      area: 520,
      methodology: 'VM0007 - REDD+ Blue Carbon',
      documentation: ['PDD_Sundarbans_v2.pdf', 'Monitoring_Report_Q3_2025.pdf', 'Verification_Report_EcoVerify.pdf'],
      ownership: 'Sundarbans Coastal Mangrove Restoration',
      coordinates: { lat: 21.9497, lng: 89.1833 },
      summary: 'Restoration and community conservation of 520 hectares of high-density Avicennia marina and Rhizophora mucronata mangroves.',
      location: 'Sundarbans Biosphere, West Bengal'
    }
  },
  {
    id: 'PRJ-DEMO-002',
    accountId: 'demo-user-proponent-001',
    creditsIssued: 980,
    startDate: '2025-05-18',
    riskAssessment: 'Low',
    bufferCredits: 98,
    country: 'India',
    status: 'verification_in_progress',
    claimed_credits: 980,
    released_credits: 0,
    assigned_acva: 'ACVA-DEMO-003',
    verification_acva: 'ACVA-DEMO-001',
    timeline: [
      { date: '2025-05-18', event: 'Project Registered', status: 'Completed' },
      { date: '2025-08-22', event: 'Validation Approved by Indian Carbon Standards Authority', acvaId: 'ACVA-DEMO-003', status: 'Completed' },
      { date: '2025-10-05', event: 'Project Sanctioned', status: 'Completed' },
      { date: '2026-02-14', event: 'Field Verification In Progress by Global Carbon Verification', acvaId: 'ACVA-DEMO-001', status: 'Pending' }
    ],
    metadata: {
      area: 380,
      methodology: 'VM0015 - Avoided Coastal Degradation',
      documentation: ['PDD_Mumbai_Wetlands.pdf', 'Sentinel2_NDVI_Analysis.pdf'],
      ownership: 'Mumbai Marine Wetland Ecosystem Conservation',
      coordinates: { lat: 19.0760, lng: 72.8777 },
      summary: 'Urban coastal wetland protection preventing industrial sediment runoff and fostering carbon soil accumulation.',
      location: 'Thane Creek Flamingo Sanctuary Buffer, Maharashtra'
    }
  },
  {
    id: 'PRJ-DEMO-003',
    accountId: 'demo-user-proponent-001',
    creditsIssued: 2100,
    startDate: '2025-09-01',
    riskAssessment: 'Medium',
    bufferCredits: 210,
    country: 'India',
    status: 'under_validation',
    claimed_credits: 2100,
    released_credits: 0,
    assigned_acva: 'ACVA-DEMO-004',
    timeline: [
      { date: '2025-09-01', event: 'Project Registered & Satellite Imagery Mapped', status: 'Completed' },
      { date: '2025-11-12', event: 'Assigned to Asia Pacific Climate Validators for Desk Review', acvaId: 'ACVA-DEMO-004', status: 'Pending' }
    ],
    metadata: {
      area: 840,
      methodology: 'VM0033 - Tidal Wetland and Seagrass Restoration',
      documentation: ['PDD_Andaman_Seagrass.pdf', 'Sonar_Bathymetry_Map.pdf'],
      ownership: 'Andaman Seagrass Meadow Blue Carbon Initiative',
      coordinates: { lat: 11.7401, lng: 92.6586 },
      summary: 'Sub-tidal seagrass habitat preservation sequestering marine carbon into coastal seabed reservoirs.',
      location: 'Havelock Coastal Shelf, Andaman & Nicobar'
    }
  },
  {
    id: 'PRJ-DEMO-004',
    accountId: 'demo-user-proponent-001',
    creditsIssued: 750,
    startDate: '2025-11-05',
    riskAssessment: 'Low',
    bufferCredits: 75,
    country: 'India',
    status: 'sanctioned',
    claimed_credits: 750,
    released_credits: 0,
    assigned_acva: 'ACVA-DEMO-002',
    timeline: [
      { date: '2025-11-05', event: 'Project Registered', status: 'Completed' },
      { date: '2026-01-20', event: 'Validation Desk Review Passed', acvaId: 'ACVA-DEMO-002', status: 'Completed' },
      { date: '2026-02-01', event: 'Admin Sanction Issued — Verification Cycle Unlocked', status: 'Completed' }
    ],
    metadata: {
      area: 290,
      methodology: 'VM0007 - REDD+ Blue Carbon',
      documentation: ['PDD_Pichavaram.pdf', 'Baseline_Soil_Carbon_Audit.pdf'],
      ownership: 'Pichavaram Estuarine Forest Reforestation',
      coordinates: { lat: 11.4294, lng: 79.7820 },
      summary: 'Community-led reforestation of depleted tidal channels with native Rhizophora seedlings.',
      location: 'Cuddalore Coastal District, Tamil Nadu'
    }
  }
];

/**
 * Realistic projects for the Demo Admin Panel.
 * Contains projects across different validation and verification queues for interactive evaluation.
 */
export const demoAdminProjects: Project[] = [
  ...demoUserProjects,
  {
    id: 'PRJ-DEMO-005',
    accountId: 'demo-acc-002',
    creditsIssued: 1600,
    startDate: '2026-01-15',
    riskAssessment: 'Low',
    bufferCredits: 160,
    country: 'India',
    status: 'under_validation',
    claimed_credits: 1600,
    released_credits: 0,
    assigned_acva: 'ACVA-DEMO-001',
    timeline: [
      { date: '2026-01-15', event: 'Project Submitted by Coastal Carbon Corp', status: 'Completed' },
      { date: '2026-02-01', event: 'Under Validation Review by Global Carbon Verification', acvaId: 'ACVA-DEMO-001', status: 'Pending' }
    ],
    metadata: {
      area: 610,
      methodology: 'VM0007 - REDD+ Blue Carbon',
      documentation: ['PDD_Mahanadi_Delta.pdf'],
      ownership: 'Mahanadi Mangrove Delta Conservation',
      coordinates: { lat: 20.2961, lng: 86.6789 },
      summary: 'Estuarine delta conservation focused on cyclone buffer creation and soil carbon enhancement.',
      location: 'Kendrapara Delta, Odisha'
    }
  },
  {
    id: 'PRJ-DEMO-006',
    accountId: 'demo-acc-004',
    creditsIssued: 1350,
    startDate: '2025-07-10',
    riskAssessment: 'Low',
    bufferCredits: 135,
    country: 'India',
    status: 'under_verification',
    claimed_credits: 1350,
    released_credits: 0,
    assigned_acva: 'ACVA-DEMO-003',
    timeline: [
      { date: '2025-07-10', event: 'Project Registered', status: 'Completed' },
      { date: '2025-10-14', event: 'Validation Approved by ICSA', acvaId: 'ACVA-DEMO-003', status: 'Completed' },
      { date: '2026-01-18', event: 'Sanctioned — Ready for Verification ACVA Assignment', status: 'Completed' }
    ],
    metadata: {
      area: 470,
      methodology: 'VM0007 - REDD+',
      documentation: ['PDD_Godavari.pdf', 'Validation_Report_ICSA.pdf'],
      ownership: 'Godavari Estuary Biosphere Protection',
      coordinates: { lat: 16.9891, lng: 82.2475 },
      summary: 'Mangrove preservation across the Godavari estuary with satellite monitoring and local fishing community stewardship.',
      location: 'Coringa Wildlife Sanctuary Buffer, Andhra Pradesh'
    }
  }
];

export const demoAccounts: Account[] = [
  {
    id: 'demo-acc-001',
    companyName: 'Sundarbans Coastal Biosphere Ltd',
    projects: ['PRJ-DEMO-001', 'PRJ-DEMO-004'],
    kycDocument: 'sundarbans_kyc_verification.pdf',
    accountType: 'Project Proponent',
    email: 'contact@sundarbanscarbon.org',
    registrationDate: '2024-03-12',
    kycStatus: 'Done'
  },
  {
    id: 'demo-acc-002',
    companyName: 'Coastal Carbon Corp India',
    projects: ['PRJ-DEMO-002', 'PRJ-DEMO-005'],
    kycDocument: 'coastal_carbon_kyc_dossier.pdf',
    accountType: 'Project Proponent',
    email: 'compliance@coastalcarbon.in',
    registrationDate: '2025-01-10',
    kycStatus: 'Pending'
  },
  {
    id: 'demo-acc-003',
    companyName: 'Apex Oceanic Verifiers & Traders',
    projects: [],
    kycDocument: 'apex_trader_kyc.pdf',
    accountType: 'Trader',
    email: 'trading@apexoceanic.com',
    registrationDate: '2025-02-18',
    kycStatus: 'In Process'
  },
  {
    id: 'demo-acc-004',
    companyName: 'Bengaluru Agro Carbon Initiative',
    projects: ['PRJ-DEMO-006'],
    kycDocument: 'agro_carbon_cert.pdf',
    accountType: 'Project Proponent',
    email: 'info@agrocarbon.org',
    registrationDate: '2025-03-01',
    kycStatus: 'Pending'
  }
];

export const demoACVAs: ACVA[] = [
  {
    id: 'ACVA-DEMO-001',
    agencyName: 'Global Carbon Verification Inc.',
    country: 'United States',
    projectsAssigned: ['PRJ-DEMO-001', 'PRJ-DEMO-005'],
    status: 'Active',
    accreditationDocs: ['accreditation_gcv_iso14065.pdf', 'verra_acva_license.pdf'],
    contactInfo: {
      email: 'audits@globalcarbonverification.com',
      phone: '+1 (415) 555-0192'
    }
  },
  {
    id: 'ACVA-DEMO-002',
    agencyName: 'EcoVerify International GmbH',
    country: 'Germany',
    projectsAssigned: ['PRJ-DEMO-001', 'PRJ-DEMO-004'],
    status: 'Active',
    accreditationDocs: ['ecoverify_accreditation.pdf', 'iso_14064_compliance.pdf'],
    contactInfo: {
      email: 'mrv-desk@ecoverify.de',
      phone: '+49 30 8923 4511'
    }
  },
  {
    id: 'ACVA-DEMO-003',
    agencyName: 'Indian Carbon Standards Authority (ICSA)',
    country: 'India',
    projectsAssigned: ['PRJ-DEMO-002', 'PRJ-DEMO-006'],
    status: 'Active',
    accreditationDocs: ['icsa_moefcc_authorization.pdf', 'national_carbon_registry_cert.pdf'],
    contactInfo: {
      email: 'secretariat@icsa.gov.in',
      phone: '+91 (11) 2436-1290'
    }
  },
  {
    id: 'ACVA-DEMO-004',
    agencyName: 'Asia Pacific Climate Validators (APCV)',
    country: 'Singapore',
    projectsAssigned: ['PRJ-DEMO-003'],
    status: 'Active',
    accreditationDocs: ['apcv_singapore_carbon_exchange.pdf'],
    contactInfo: {
      email: 'validations@apcvalidators.sg',
      phone: '+65 6789 2341'
    }
  }
];
