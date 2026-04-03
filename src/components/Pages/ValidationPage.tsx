import { useState } from 'react';
import { FileText, Calendar, CheckCircle, XCircle, Clock, Eye, ArrowLeft, Shield, ArrowRight, Stamp, User, Building2, Zap } from 'lucide-react';
import { useDocumentActions } from '../../hooks/useDocumentActions';
import { Upload } from 'lucide-react';
import { Project, ACVA } from '../../types';
import { ComparisonResultModal } from '../Common/ComparisonResultModal';
import { grokService, GrokComparisonResult } from '../../lib/grokService';

interface ValidationPageProps {
  projects: Project[];
  acvas: ACVA[];
  onSanctionProject: (projectId: string) => void;
}

export default function ValidationPage({ projects, acvas, onSanctionProject }: ValidationPageProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter projects that are under_validation (assigned to ACVA, awaiting admin sanction)
  const validationProjects = projects.filter(p => {
    const s = (p.status || '').toLowerCase();
    return s === 'under_validation';
  });

  // Also show sanctioned projects (recently sanctioned) for reference
  const sanctionedProjects = projects.filter(p => {
    const s = (p.status || '').toLowerCase();
    return s === 'sanctioned' || s === 'under_verification';
  });

  const getProjectName = (p: any) => p.name || p.metadata?.ownership || p.id;
  const getAcvaName = (acvaId: string) => {
    const acva = acvas.find(a => a.id === acvaId);
    return acva ? acva.agencyName : acvaId || 'Unassigned';
  };

  if (selectedProject) {
    return (
      <ValidationDetailPage
        project={selectedProject}
        acvas={acvas}
        onBack={() => setSelectedProject(null)}
        onSanction={onSanctionProject}
      />
    );
  }

  return (
    <div className="p-6 readable-surface">
      <div className="mb-6">
        <h1 className="text-gradient-heading text-3xl font-extrabold hero-readable-text mb-2">Validation Management</h1>
        <p className="text-gray-700 dark:text-gray-300 font-medium">Review reports from Project Proponents and ACVAs, then sanction projects for verification</p>
      </div>

      {/* Projects Under Validation */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Pending Validation Review ({validationProjects.length})</h2>
        </div>

        {validationProjects.length === 0 ? (
          <div className="bg-white/85 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No projects awaiting validation</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Assign ACVAs to projects from the Projects page to begin the validation process</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/85 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Assigned ACVA</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Proponent Report</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">ACVA Report</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {validationProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{getProjectName(project)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">{project.id?.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {(project as any).location || (project as any).state_name || project.country || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-nee-500 dark:text-nee-400" />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{getAcvaName(project.assigned_acva || '')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        <FileText className="w-3 h-3" /> PDD Submitted
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        <CheckCircle className="w-3 h-3" /> Report Ready
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                        <Clock className="w-3 h-3" /> Awaiting Review
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-nee-500 to-nee-600 hover:from-nee-600 hover:to-nee-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                      >
                        <Eye className="w-4 h-4" />
                        Review & Compare
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sanctioned / Moved to verification */}
      {sanctionedProjects.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Sanctioned & Moved to Verification ({sanctionedProjects.length})</h2>
          </div>
          <div className="overflow-x-auto bg-white/85 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Assigned ACVA</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sanctionedProjects.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{getProjectName(p)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{getAcvaName(p.assigned_acva || '')}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        <CheckCircle className="w-3 h-3" />
                        {p.status === 'under_verification' ? 'Under Verification' : 'Sanctioned'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Detail Page: side-by-side document comparison with sanction button ──

interface ValidationDetailPageProps {
  project: Project;
  acvas: ACVA[];
  onBack: () => void;
  onSanction: (projectId: string) => void;
}

function ValidationDetailPage({ project, acvas, onBack, onSanction }: ValidationDetailPageProps) {
  const [sanctioned, setSanctioned] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<GrokComparisonResult | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const { uploadingDoc, handleViewDocument, handleUploadToIPFS } = useDocumentActions();

  const getProjectName = (p: any) => p.name || p.metadata?.ownership || p.id;
  const acva = acvas.find(a => a.id === project.assigned_acva);
  const acvaName = acva ? acva.agencyName : project.assigned_acva || 'Unknown';

  // Simulated document data
  const pddDocName = `PDD_${getProjectName(project).replace(/\s+/g, '_')}.pdf`;
  const acvaReportName = `Validation_Report_${acvaName.replace(/\s+/g, '_')}.pdf`;

  const pddContent = `PROJECT DESIGN DOCUMENT (PDD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: ${getProjectName(project)}
Project ID: ${project.id}
Submitted by: Project Proponent (${(project as any).user_id || project.accountId || 'N/A'})
Location: ${(project as any).location || (project as any).state_name || project.country || 'India'}

1. PROJECT DESCRIPTION
   This project aims to establish and maintain carbon sequestration
   through sustainable land management practices in the designated area.

2. BASELINE SCENARIO
   Current land use shows minimal carbon absorption capacity.
   Without intervention, degradation would continue at current rates.

3. METHODOLOGY
   Methodology: ${project.metadata?.methodology || 'VM0007 - REDD+ Methodology'}
   Project Area: ${project.metadata?.area || 'N/A'} hectares

4. MONITORING PLAN
   - Quarterly satellite imagery analysis
   - Annual ground-truth biomass sampling
   - Continuous IoT sensor monitoring for soil carbon

5. ESTIMATED CARBON CREDITS
   Estimated annual sequestration: ${project.creditsIssued || 500} tCO2e
   Buffer pool contribution: ${project.bufferCredits || 50} tCO2e (10%)

6. DOCUMENTATION ATTACHED
   ${(project.metadata?.documentation || ['PDD.pdf', 'Baseline_Study.pdf']).map((d: string) => `• ${d}`).join('\n   ')}

Status: SUBMITTED FOR VALIDATION
Date: ${(project as any).created_at ? new Date((project as any).created_at).toLocaleDateString() : 'N/A'}`;

  const acvaReportContent = `VALIDATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Validation Agency: ${acvaName}
ACVA ID: ${project.assigned_acva || 'N/A'}
Project: ${getProjectName(project)} (${project.id})

1. EXECUTIVE SUMMARY
   The validation team from ${acvaName} has conducted a thorough
   desk review and site assessment of the above-referenced project.

2. VALIDATION FINDINGS

   2.1 Methodology Compliance: ✅ COMPLIANT
       The project correctly applies ${project.metadata?.methodology || 'VM0007'}
       methodology with appropriate baseline calculations.

   2.2 Additionality Assessment: ✅ CONFIRMED
       The project demonstrates clear additionality through
       financial barrier analysis and common practice analysis.

   2.3 Baseline Accuracy: ✅ VERIFIED
       Baseline emissions have been calculated using conservative
       assumptions and peer-reviewed data sources.

   2.4 Monitoring Plan: ✅ ADEQUATE
       The monitoring plan covers all required parameters with
       appropriate QA/QC procedures.

   2.5 Estimated Credits: ⚠️ ADJUSTED
       Original estimate: ${project.creditsIssued || 500} tCO2e/year
       Validated estimate: ${Math.round((project.creditsIssued || 500) * 0.92)} tCO2e/year
       Reason: Conservative adjustment to baseline calculations.

3. RISK ASSESSMENT
   Overall Risk: ${project.riskAssessment || 'Low'}
   Buffer Pool: ${project.bufferCredits || 50} credits (adequate)

4. CONCLUSION & RECOMMENDATION
   The validation team recommends this project for APPROVAL.
   All validation criteria have been met satisfactorily.

Signed: Lead Validator, ${acvaName}
Date: ${new Date().toLocaleDateString()}`;

  const handleSanction = () => {
    onSanction(project.id);
    setSanctioned(true);
  };

  const handleAIComparison = async () => {
    setComparisonLoading(true);
    setComparisonError(null);
    try {
      const result = await grokService.compareValidationDocuments(pddContent, acvaReportContent);
      setComparisonResult(result);
      setComparisonOpen(true);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to compare documents';
      setComparisonError(errorMsg);
      setComparisonOpen(true);
    } finally {
      setComparisonLoading(false);
    }
  };

  return (
    <div className="p-6 readable-surface">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center text-nee-600 dark:text-nee-400 hover:text-nee-700 dark:hover:text-nee-300 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Validation List
        </button>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Validation Review: {getProjectName(project)}</h1>
        <p className="text-gray-600 dark:text-gray-300">Compare the Project Proponent's PDD with the ACVA's Validation Report, then decide whether to sanction.</p>

        {/* Project Info Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-4 p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Project:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{getProjectName(project)}</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-nee-500" />
            <span className="text-gray-500 dark:text-gray-400">ACVA:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{acvaName}</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">Submitted:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{(project as any).created_at ? new Date((project as any).created_at).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Side-by-side document comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* -- LEFT: Project Proponent's PDD -- */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-blue-200/60 dark:border-blue-800/40 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 border-b border-blue-200/60 dark:border-blue-700/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Project Design Document (PDD)</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Submitted by Project Proponent</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="border-2 border-dashed border-blue-200 dark:border-blue-700 rounded-lg p-6 text-center bg-blue-50/30 dark:bg-blue-900/10">
              <FileText className="w-12 h-12 text-blue-400 dark:text-blue-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{pddDocName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF Document • Submitted with project application</p>
              <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => handleViewDocument(`PDD - ${getProjectName(project)}`, pddContent)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 dark:bg-blue-700 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
              >
                <Eye className="w-4 h-4" /> View PDD
              </button>
              <button
                onClick={() => handleUploadToIPFS(`PDD - ${getProjectName(project)}`, pddContent)}
                disabled={uploadingDoc === `PDD - ${getProjectName(project)}`}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg ${uploadingDoc === `PDD - ${getProjectName(project)}` ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'}`}
              >
                {uploadingDoc === `PDD - ${getProjectName(project)}` ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>...</>
                ) : (
                  <><Upload className="w-4 h-4" /> IPFS</>
                )}
              </button>
              </div>
            </div>

            {/* Document Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Document Summary</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600 dark:text-blue-400">Methodology</span>
                  <span className="font-medium text-blue-900 dark:text-blue-200">{project.metadata?.methodology || 'VM0007'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600 dark:text-blue-400">Project Area</span>
                  <span className="font-medium text-blue-900 dark:text-blue-200">{project.metadata?.area || 'N/A'} ha</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600 dark:text-blue-400">Claimed Credits</span>
                  <span className="font-medium text-blue-900 dark:text-blue-200">{project.creditsIssued || 500} tCO2e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600 dark:text-blue-400">Risk Level</span>
                  <span className="font-medium text-blue-900 dark:text-blue-200">{project.riskAssessment || 'Low'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* -- RIGHT: ACVA's Validation Report -- */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-green-200/60 dark:border-green-800/40 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-800/20 border-b border-green-200/60 dark:border-green-700/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Validation Report</h3>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Submitted by {acvaName}</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="border-2 border-dashed border-green-200 dark:border-green-700 rounded-lg p-6 text-center bg-green-50/30 dark:bg-green-900/10">
              <CheckCircle className="w-12 h-12 text-green-400 dark:text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{acvaReportName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF Document • ACVA validation assessment</p>
              <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => handleViewDocument(`Validation Report - ${acvaName}`, acvaReportContent)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 dark:bg-green-700 text-white text-sm font-semibold rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
              >
                <Eye className="w-4 h-4" /> View Report
              </button>
              <button
                onClick={() => handleUploadToIPFS(`Validation Report - ${acvaName}`, acvaReportContent)}
                disabled={uploadingDoc === `Validation Report - ${acvaName}`}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg ${uploadingDoc === `Validation Report - ${acvaName}` ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'}`}
              >
                {uploadingDoc === `Validation Report - ${acvaName}` ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>...</>
                ) : (
                  <><Upload className="w-4 h-4" /> IPFS</>
                )}
              </button>
              </div>
            </div>

            {/* ACVA Report Findings */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm">Validation Findings</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-green-600 dark:text-green-400">Methodology Compliance</span>
                  <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-300 font-medium"><CheckCircle className="w-3 h-3" /> Compliant</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 dark:text-green-400">Additionality</span>
                  <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-300 font-medium"><CheckCircle className="w-3 h-3" /> Confirmed</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 dark:text-green-400">Baseline Accuracy</span>
                  <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-300 font-medium"><CheckCircle className="w-3 h-3" /> Verified</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 dark:text-green-400">Validated Credits</span>
                  <span className="font-medium text-green-900 dark:text-green-200">{Math.round((project.creditsIssued || 500) * 0.92)} tCO2e</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 dark:text-green-400">Recommendation</span>
                  <span className="inline-flex items-center gap-1 font-bold text-green-700 dark:text-green-300">APPROVAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Comparison Button */}
      <div className="mb-8 flex justify-center">
        <button
          onClick={handleAIComparison}
          disabled={comparisonLoading}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white shadow-lg transition-all duration-200 ${
            comparisonLoading
              ? 'bg-indigo-400 cursor-wait'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.03]'
          }`}
        >
          {comparisonLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing Documents...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              🤖 AI Compare PDD vs Report
            </>
          )}
        </button>
      </div>

      {/* Sanction Decision Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Stamp className="w-5 h-5 text-nee-500" />
            Admin Decision
          </h3>
        </div>

        {!sanctioned ? (
          <div className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="text-gray-600 dark:text-gray-300">
                <p className="font-medium mb-2">After reviewing both documents, take your decision:</p>
                <ul className="text-sm space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span><strong>Sanction Project</strong> — Move to verification stage for credit issuance cycles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span><strong>Reject</strong> — Send back to proponent with feedback for re-submission</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={handleSanction}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-green-500/30 hover:shadow-xl transition-all duration-200 hover:scale-[1.03]"
                >
                  <Stamp className="w-4 h-4" />
                  Sanction Project
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center"
                 style={{ animation: 'fadeInUp 0.3s ease-out' }}>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">Project Sanctioned Successfully!</h3>
              <p className="text-green-700 dark:text-green-300 text-sm mb-1">
                <strong>{getProjectName(project)}</strong> has been approved and moved to the <strong>Verification</strong> stage.
              </p>
              <p className="text-green-600 dark:text-green-400 text-xs">
                The assigned ACVA ({acvaName}) can now proceed with verification cycles for credit issuance.
              </p>
              <button
                onClick={onBack}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Validation List
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

      {/* AI Comparison Result Modal */}
      <ComparisonResultModal
        isOpen={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        result={comparisonResult}
        isLoading={comparisonLoading}
        error={comparisonError}
        doc1Title="Project Design Document (PDD)"
        doc2Title="ACVA Validation Report"
      />
    </div>
  );
}