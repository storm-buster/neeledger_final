import { useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Eye, ArrowLeft, Shield, ArrowRight, TrendingUp, Coins, User, Building2, X, Award } from 'lucide-react';
import { useDocumentActions } from '../../hooks/useDocumentActions';
import { Upload } from 'lucide-react';
import { Project, ACVA } from '../../types';

interface VerificationPageProps {
  projects: Project[];
  acvas: ACVA[];
  onAssignVerificationACVA: (projectId: string, acvaId: string) => void;
  onReleaseCredits: (projectId: string, credits: number) => void;
}

export default function VerificationPage({ projects, acvas, onAssignVerificationACVA, onReleaseCredits }: VerificationPageProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [assignModal, setAssignModal] = useState<{ open: boolean; project: Project | null }>({ open: false, project: null });
  const [selectedACVAId, setSelectedACVAId] = useState('');

  const getProjectName = (p: any) => p.name || p.metadata?.ownership || p.id;
  const getAcvaName = (acvaId: string) => {
    const acva = acvas.find(a => a.id === acvaId);
    return acva ? acva.agencyName : acvaId || 'Unassigned';
  };

  // Projects awaiting verification ACVA assignment (sanctioned, proponent report submitted)
  const awaitingAssignment = projects.filter(p => (p.status || '').toLowerCase() === 'under_verification');
  // Projects where verification ACVA is assigned and doing verification
  const inProgress = projects.filter(p => (p.status || '').toLowerCase() === 'verification_in_progress');
  // Projects where credits have been released
  const creditsReleased = projects.filter(p => (p.status || '').toLowerCase() === 'credits_released');

  const activeACVAs = acvas.filter(a => a.status === 'Active');

  const handleOpenAssign = (project: Project) => {
    setAssignModal({ open: true, project });
    setSelectedACVAId('');
  };

  const handleConfirmAssign = () => {
    if (assignModal.project && selectedACVAId) {
      onAssignVerificationACVA(assignModal.project.id, selectedACVAId);
      setAssignModal({ open: false, project: null });
      setSelectedACVAId('');
    }
  };

  if (selectedProject) {
    return (
      <VerificationDetailPage
        project={selectedProject}
        acvas={acvas}
        onBack={() => setSelectedProject(null)}
        onReleaseCredits={onReleaseCredits}
      />
    );
  }

  return (
    <div className="p-6 readable-surface">
      <div className="mb-6">
        <h1 className="text-gradient-heading text-3xl font-extrabold hero-readable-text mb-2">Verification Management</h1>
        <p className="text-gray-700 dark:text-gray-300 font-medium">Review verification reports, compare claims vs actuals, and release carbon credits</p>
      </div>

      {/* Step 1: Projects awaiting ACVA assignment for verification */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold">1</div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Awaiting Verification ACVA ({awaitingAssignment.length})</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Proponent has submitted claim report — assign an ACVA to verify</span>
        </div>

        {awaitingAssignment.length === 0 ? (
          <div className="bg-white/85 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-10 text-center">
            <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No projects awaiting verification ACVA assignment</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Projects appear here after being sanctioned from the Validation stage</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/85 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Project</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Validation ACVA</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Claimed Credits</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Proponent Report</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {awaitingAssignment.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{getProjectName(p)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{p.id?.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                        <Shield className="w-3.5 h-3.5 text-nee-500" />
                        {getAcvaName(p.assigned_acva || '')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-nee-700 dark:text-nee-300">
                        <TrendingUp className="w-4 h-4" />
                        {(p.claimed_credits || p.creditsIssued || 500).toLocaleString()} tCO2e
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        <FileText className="w-3 h-3" /> Submitted
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                        <Clock className="w-3 h-3" /> Needs Verification ACVA
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenAssign(p)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-nee-500 to-nee-600 hover:from-nee-600 hover:to-nee-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                      >
                        <Shield className="w-4 h-4" />
                        Assign Verification ACVA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Step 2: Verification in progress — ACVA report ready, admin to compare */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold">2</div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Reports Ready — Compare & Release Credits ({inProgress.length})</h2>
        </div>

        {inProgress.length === 0 ? (
          <div className="bg-white/85 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-10 text-center">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No verification reports pending review</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/85 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Project</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Verification ACVA</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Proponent Claim</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">ACVA Report</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {inProgress.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{getProjectName(p)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Shield className="w-3.5 h-3.5 text-indigo-500" />
                        {getAcvaName(p.verification_acva || '')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        <FileText className="w-3 h-3" /> {(p.claimed_credits || p.creditsIssued || 500).toLocaleString()} tCO2e
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        <CheckCircle className="w-3 h-3" /> Report Ready
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                        <Eye className="w-3 h-3" /> Awaiting Admin Review
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedProject(p)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                      >
                        <Eye className="w-4 h-4" />
                        Review & Release Credits
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Step 3: Credits released */}
      {creditsReleased.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">✓</div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Credits Released ({creditsReleased.length})</h2>
          </div>
          <div className="overflow-x-auto bg-white/85 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Project</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Claimed</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Released</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Verification ACVA</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {creditsReleased.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{getProjectName(p)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{(p.claimed_credits || 0).toLocaleString()} tCO2e</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-bold text-green-700 dark:text-green-300">
                        <Coins className="w-4 h-4" /> {(p.released_credits || 0).toLocaleString()} tCO2e
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{getAcvaName(p.verification_acva || '')}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        <Award className="w-3 h-3" /> Credits Released
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Verification ACVA Modal */}
      {assignModal.open && assignModal.project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setAssignModal({ open: false, project: null })}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: 'fadeInUp 0.25s ease-out' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-white dark:from-gray-800 dark:to-gray-750">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Assign Verification ACVA</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Select an ACVA to verify <span className="font-semibold text-indigo-600 dark:text-indigo-400">{getProjectName(assignModal.project)}</span>
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                  ⚠ Must be different from the validation ACVA ({getAcvaName(assignModal.project.assigned_acva || '')})
                </p>
              </div>
              <button onClick={() => setAssignModal({ open: false, project: null })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3 max-h-[350px] overflow-y-auto">
              {activeACVAs.filter(a => a.id !== assignModal.project!.assigned_acva).length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No other active ACVAs available</p>
                  <p className="text-sm mt-1">A different ACVA from the validation stage is required.</p>
                </div>
              ) : (
                activeACVAs.filter(a => a.id !== assignModal.project!.assigned_acva).map(acva => {
                  const isSelected = selectedACVAId === acva.id;
                  return (
                    <button key={acva.id} onClick={() => setSelectedACVAId(acva.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md ring-2 ring-indigo-200 dark:ring-indigo-800'
                        : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'} transition-colors`}>
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`font-semibold ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100'}`}>{acva.agencyName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{acva.country}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{acva.contactInfo.email}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <button onClick={() => setAssignModal({ open: false, project: null })} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleConfirmAssign} disabled={!selectedACVAId}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${selectedACVAId
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-[1.02]'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}>
                Assign for Verification <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}


// ── Detail Page: Compare proponent's claim report vs ACVA verification report ──

interface VerificationDetailPageProps {
  project: Project;
  acvas: ACVA[];
  onBack: () => void;
  onReleaseCredits: (projectId: string, credits: number) => void;
}

function VerificationDetailPage({ project, acvas, onBack, onReleaseCredits }: VerificationDetailPageProps) {
  const [creditsToRelease, setCreditsToRelease] = useState<number>(0);
  const [released, setReleased] = useState(false);
  const [viewerOpen, setViewerOpen] = useState<{ title: string; content: string } | null>(null);
  const { uploadingDoc, handleViewDocument, handleUploadToIPFS } = useDocumentActions();

  const getProjectName = (p: any) => p.name || p.metadata?.ownership || p.id;
  const validationAcva = acvas.find(a => a.id === project.assigned_acva);
  const verificationAcva = acvas.find(a => a.id === project.verification_acva);
  const validationAcvaName = validationAcva ? validationAcva.agencyName : 'N/A';
  const verificationAcvaName = verificationAcva ? verificationAcva.agencyName : 'N/A';

  const claimedCredits = project.claimed_credits || project.creditsIssued || 500;
  const acvaVerifiedCredits = Math.round(claimedCredits * 0.88); // ACVA typically verifies slightly lower
  const bufferDeduction = Math.round(acvaVerifiedCredits * 0.1);
  const recommendedRelease = acvaVerifiedCredits - bufferDeduction;

  // Initialize credits to release with recommended amount
  useState(() => {
    setCreditsToRelease(recommendedRelease);
  });

  const proponentReportContent = `VERIFICATION CLAIM REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: ${getProjectName(project)}
Project ID: ${project.id}
Submitted by: Project Proponent
Verification Period: ${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toLocaleDateString()} to ${new Date().toLocaleDateString()}

1. MONITORING RESULTS
   The project has been in operation for the verification period.
   Monitoring data has been collected as per the approved monitoring plan.

2. CARBON SEQUESTRATION DATA
   Total biomass increase measured: ${Math.round(claimedCredits * 1.2)} tonnes
   Net carbon sequestered: ${claimedCredits} tonnes CO2 equivalent
   Methodology applied: ${project.metadata?.methodology || 'VM0007'}

3. MONITORING PARAMETERS
   - Satellite imagery analysis: Completed (quarterly)
   - Ground-truth sampling: Completed (bi-annual)
   - Soil carbon measurements: Completed (annual)
   - Biodiversity assessment: Completed (annual)

4. CLAIMED CARBON CREDITS
   ┌──────────────────────────────────┐
   │ Total Credits Claimed: ${claimedCredits.toLocaleString()} tCO2e │
   └──────────────────────────────────┘

5. SUPPORTING DOCUMENTS
   • Satellite imagery time-series report
   • Ground sampling data sheets
   • Lab analysis results
   • Continuous monitoring sensor data

Declaration: The data presented is accurate and complete to the
best of our knowledge and has been prepared in accordance with
the approved monitoring methodology.

Signed: Project Proponent Representative
Date: ${new Date().toLocaleDateString()}`;

  const acvaVerificationContent = `VERIFICATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Verification Agency: ${verificationAcvaName}
ACVA ID: ${project.verification_acva}
Project: ${getProjectName(project)} (${project.id})
Verification Period: ${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toLocaleDateString()} to ${new Date().toLocaleDateString()}

1. EXECUTIVE SUMMARY
   ${verificationAcvaName} has conducted an independent field verification
   and desk review of the carbon credit claims submitted by the project proponent.

2. FIELD VERIFICATION FINDINGS

   2.1 Site Inspection: ✅ COMPLETED
       Field team visited project site on ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
       Physical observations aligned with monitoring reports.

   2.2 Data Verification: ✅ VERIFIED
       Monitoring data cross-checked with independent satellite imagery.
       Minor discrepancies found in Q2 biomass estimates.

   2.3 Methodology Adherence: ✅ COMPLIANT
       Project continues to follow ${project.metadata?.methodology || 'VM0007'} methodology.

   2.4 Leakage Assessment: ✅ NO SIGNIFICANT LEAKAGE
       No evidence of activity-shifting or market leakage detected.

3. CREDIT VERIFICATION

   Proponent's Claim:        ${claimedCredits.toLocaleString()} tCO2e
   ACVA Verified Amount:     ${acvaVerifiedCredits.toLocaleString()} tCO2e
   Adjustment:               -${(claimedCredits - acvaVerifiedCredits).toLocaleString()} tCO2e (${Math.round((1 - acvaVerifiedCredits / claimedCredits) * 100)}% reduction)
   
   Reason for Adjustment:
   - Q2 biomass overestimation corrected (-${Math.round((claimedCredits - acvaVerifiedCredits) * 0.6)})
   - Conservative recalculation of baseline (-${Math.round((claimedCredits - acvaVerifiedCredits) * 0.4)})

   Buffer Pool Deduction:    ${bufferDeduction.toLocaleString()} tCO2e (10% of verified)
   
   ┌─────────────────────────────────────────────┐
   │ RECOMMENDED CREDIT RELEASE: ${recommendedRelease.toLocaleString()} tCO2e  │
   └─────────────────────────────────────────────┘

4. RISK ASSESSMENT
   Non-permanence risk: ${project.riskAssessment || 'Low'}
   Buffer pool adequacy: Sufficient

5. CONCLUSION
   The verification team recommends releasing ${recommendedRelease.toLocaleString()} carbon credits
   to the project proponent's account after buffer pool deduction.

Signed: Lead Verifier, ${verificationAcvaName}
Date: ${new Date().toLocaleDateString()}`;

  const handleRelease = () => {
    if (creditsToRelease > 0) {
      onReleaseCredits(project.id, creditsToRelease);
      setReleased(true);
    }
  };

  return (
    <div className="p-6 readable-surface">
      <div className="mb-6">
        <button onClick={onBack} className="inline-flex items-center text-nee-600 dark:text-nee-400 hover:text-nee-700 dark:hover:text-nee-300 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Verifications
        </button>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Verification Review: {getProjectName(project)}</h1>
        <p className="text-gray-600 dark:text-gray-300">Compare the Proponent's credit claim with the ACVA's independent verification report</p>

        {/* Info Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-4 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-blue-500" />
            <span className="text-gray-500 dark:text-gray-400">Proponent Claim:</span>
            <span className="font-bold text-blue-700 dark:text-blue-300">{claimedCredits.toLocaleString()} tCO2e</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-green-500" />
            <span className="text-gray-500 dark:text-gray-400">ACVA Verified:</span>
            <span className="font-bold text-green-700 dark:text-green-300">{acvaVerifiedCredits.toLocaleString()} tCO2e</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2 text-sm">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-gray-500 dark:text-gray-400">Recommended:</span>
            <span className="font-bold text-amber-700 dark:text-amber-300">{recommendedRelease.toLocaleString()} tCO2e</span>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* LEFT: Proponent Claim */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-200/60 dark:border-blue-800/40 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 border-b border-blue-200/60 dark:border-blue-700/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-md"><User className="w-5 h-5 text-white" /></div>
              <div>
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Proponent's Verification Report</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Credit claim by Project Proponent</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="border-2 border-dashed border-blue-200 dark:border-blue-700 rounded-lg p-6 text-center bg-blue-50/30 dark:bg-blue-900/10">
              <FileText className="w-12 h-12 text-blue-400 dark:text-blue-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Verification_Claim_{getProjectName(project).replace(/\s+/g, '_')}.pdf</p>
              <div className="mt-4 flex justify-center gap-3">
              <button onClick={() => handleViewDocument(`Proponent Claim - ${getProjectName(project)}`, proponentReportContent)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-[1.02]">
                <Eye className="w-4 h-4" /> View
              </button>
              <button 
                onClick={() => handleUploadToIPFS(`Proponent Claim - ${getProjectName(project)}`, proponentReportContent)}
                disabled={uploadingDoc === `Proponent Claim - ${getProjectName(project)}`}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg ${uploadingDoc === `Proponent Claim - ${getProjectName(project)}` ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'}`}>
                {uploadingDoc === `Proponent Claim - ${getProjectName(project)}` ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> IPFS</>
                )}
              </button>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Claim Summary</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-blue-600 dark:text-blue-400">Credits Claimed</span><span className="font-bold text-blue-900 dark:text-blue-200">{claimedCredits.toLocaleString()} tCO2e</span></div>
                <div className="flex justify-between"><span className="text-blue-600 dark:text-blue-400">Methodology</span><span className="font-medium text-blue-900 dark:text-blue-200">{project.metadata?.methodology || 'VM0007'}</span></div>
                <div className="flex justify-between"><span className="text-blue-600 dark:text-blue-400">Monitoring Period</span><span className="font-medium text-blue-900 dark:text-blue-200">12 months</span></div>
                <div className="flex justify-between"><span className="text-blue-600 dark:text-blue-400">Data Sources</span><span className="font-medium text-blue-900 dark:text-blue-200">Satellite + Ground Sampling</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: ACVA Verification Report */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-green-200/60 dark:border-green-800/40 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-800/20 border-b border-green-200/60 dark:border-green-700/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-md"><Building2 className="w-5 h-5 text-white" /></div>
              <div>
                <h3 className="text-lg font-bold text-green-900 dark:text-green-100">ACVA Verification Report</h3>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Independent verification by {verificationAcvaName}</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="border-2 border-dashed border-green-200 dark:border-green-700 rounded-lg p-6 text-center bg-green-50/30 dark:bg-green-900/10">
              <CheckCircle className="w-12 h-12 text-green-400 dark:text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Verification_Report_{verificationAcvaName.replace(/\s+/g, '_')}.pdf</p>
              <div className="mt-4 flex justify-center gap-3">
              <button onClick={() => handleViewDocument(`ACVA Verification - ${verificationAcvaName}`, acvaVerificationContent)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg hover:scale-[1.02]">
                <Eye className="w-4 h-4" /> View 
              </button>
              <button 
                onClick={() => handleUploadToIPFS(`ACVA Verification - ${verificationAcvaName}`, acvaVerificationContent)}
                disabled={uploadingDoc === `ACVA Verification - ${verificationAcvaName}`}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg ${uploadingDoc === `ACVA Verification - ${verificationAcvaName}` ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'}`}>
                {uploadingDoc === `ACVA Verification - ${verificationAcvaName}` ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> IPFS</>
                )}
              </button>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm">Verification Findings</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between items-center"><span className="text-green-600 dark:text-green-400">Site Inspection</span><span className="inline-flex items-center gap-1 text-green-700 dark:text-green-300 font-medium"><CheckCircle className="w-3 h-3" /> Completed</span></div>
                <div className="flex justify-between items-center"><span className="text-green-600 dark:text-green-400">Data Verified</span><span className="inline-flex items-center gap-1 text-green-700 dark:text-green-300 font-medium"><CheckCircle className="w-3 h-3" /> Yes</span></div>
                <div className="flex justify-between"><span className="text-green-600 dark:text-green-400">Verified Credits</span><span className="font-bold text-green-900 dark:text-green-200">{acvaVerifiedCredits.toLocaleString()} tCO2e</span></div>
                <div className="flex justify-between"><span className="text-green-600 dark:text-green-400">Buffer Deduction (10%)</span><span className="font-medium text-amber-700 dark:text-amber-300">-{bufferDeduction.toLocaleString()} tCO2e</span></div>
                <div className="flex justify-between border-t border-green-200 dark:border-green-800 pt-1.5 mt-1"><span className="text-green-600 dark:text-green-400 font-semibold">Recommended Release</span><span className="font-bold text-green-900 dark:text-green-200">{recommendedRelease.toLocaleString()} tCO2e</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Comparison & Release Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            Credit Comparison & Release Decision
          </h3>
        </div>

        {!released ? (
          <div className="p-6">
            {/* Comparison Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-200/60 dark:border-blue-800/40">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Proponent Claimed</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{claimedCredits.toLocaleString()}</p>
                <p className="text-xs text-blue-500 dark:text-blue-400">tCO2e</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-200/60 dark:border-green-800/40">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">ACVA Verified</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{acvaVerifiedCredits.toLocaleString()}</p>
                <p className="text-xs text-green-500 dark:text-green-400">tCO2e (after adjustments)</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 text-center border border-amber-200/60 dark:border-amber-800/40">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Recommended Release</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{recommendedRelease.toLocaleString()}</p>
                <p className="text-xs text-amber-500 dark:text-amber-400">tCO2e (after 10% buffer)</p>
              </div>
            </div>

            {/* Admin Input */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Credits to Release to Proponent's Account
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={creditsToRelease}
                    onChange={e => setCreditsToRelease(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-48 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg font-bold focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
                  />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">tCO2e</span>
                  <button onClick={() => setCreditsToRelease(recommendedRelease)} className="text-xs px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg font-medium hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors">
                    Use Recommended
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  Adjust if needed. Proponent claimed {claimedCredits.toLocaleString()}, ACVA recommends {recommendedRelease.toLocaleString()}.
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button onClick={onBack}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button onClick={handleRelease} disabled={creditsToRelease <= 0}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${creditsToRelease > 0
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:scale-[1.03]'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}>
                  <Coins className="w-4 h-4" />
                  Release {creditsToRelease.toLocaleString()} Credits
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-green-500/30">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">Carbon Credits Released! 🎉</h3>
              <p className="text-green-700 dark:text-green-300 mb-1">
                <strong>{creditsToRelease.toLocaleString()} tCO2e</strong> carbon credits have been released to the proponent's account for project <strong>{getProjectName(project)}</strong>.
              </p>
              <div className="mt-4 inline-flex items-center gap-4 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-green-200 dark:border-green-800">
                <div className="text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Claimed</p>
                  <p className="font-semibold text-blue-700 dark:text-blue-300">{claimedCredits.toLocaleString()}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Verified</p>
                  <p className="font-semibold text-green-700 dark:text-green-300">{acvaVerifiedCredits.toLocaleString()}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Released</p>
                  <p className="font-bold text-green-800 dark:text-green-200">{creditsToRelease.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-green-600 dark:text-green-400 text-xs mt-4">Verified by {verificationAcvaName} • Logged on blockchain</p>
              <button onClick={onBack} className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Verifications
              </button>
            </div>
          </div>
        )}
      </div>



      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}