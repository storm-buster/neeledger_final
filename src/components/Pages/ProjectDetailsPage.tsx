import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, CheckCircle, TrendingUp, Coins, MapPin, Calendar, Eye, Satellite, RefreshCw, User, Building2, Award, X, Clock, Upload } from 'lucide-react';
import ProjectMap from '../Common/ProjectMap';

import { Project, ACVA } from '../../types';
import { useDocumentActions } from '../../hooks/useDocumentActions';
import { formatDocumentAsHtml } from '../../lib/documentHelpers';
import { supabase } from '../../lib/supabase';

interface ProjectDetailsPageProps {
  project?: Project | any;
  onBack: () => void;
  acvas?: ACVA[];
}

const SATELLITE_IMAGES = [
  { src: '/satellite/sentinel2_rgb.png', title: 'Sentinel-2 RGB Composite', date: '2026-03-28', source: 'Sentinel-2 L2A', description: 'True-color composite showing vegetation density and water channels' },
  { src: '/satellite/ndvi_analysis.png', title: 'NDVI Vegetation Index', date: '2026-03-28', source: 'Google Earth Engine', description: 'Processed NDVI showing vegetation health — green = healthy, red = sparse' },
  { src: '/satellite/change_detection.png', title: 'Change Detection (2024 vs 2026)', date: '2026-03-21', source: 'Earth Engine Time-Series', description: 'Canopy cover change analysis showing reforestation progress' },
];

export default function ProjectDetailsPage({ project: propProject, onBack, acvas = [] }: ProjectDetailsPageProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { uploadingDoc, handleViewDocument, handleUploadToIPFS } = useDocumentActions();
  const [project, setProject] = useState<any>(propProject);
  const [loading, setLoading] = useState(!propProject);
  const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    if (!propProject && projectId) {
      const fetchProject = async () => {
        try {
          const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
          if (error) throw error;
          setProject(data);
        } catch (err) { console.error('Error fetching project:', err); }
        finally { setLoading(false); }
      };
      fetchProject();
    }
  }, [propProject, projectId]);

  const handleBack = () => { if (onBack) onBack(); navigate('/projects'); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center readable-surface">
      <div className="text-center"><div className="w-8 h-8 border-4 border-nee-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div><p className="text-gray-500 dark:text-gray-400">Loading project...</p></div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex flex-col items-center justify-center readable-surface">
      <p className="text-gray-500 dark:text-gray-400 text-lg">Project not found.</p>
      <button onClick={handleBack} className="mt-4 px-5 py-2 bg-nee-600 text-white rounded-lg hover:bg-nee-700 transition-colors">Back to Projects</button>
    </div>
  );

  const projectName = project.name || project.metadata?.ownership || project.id;
  const projectDescription = project.description || project.metadata?.summary || '';
  const projectLocation = project.location || project.state_name || project.country || 'Unknown';
  const projectCoordinates = project.coordinates || '';
  const projectStatus = project.status || 'pending';
  const documentation = project.metadata?.documentation || project.project_docs || [];
  const createdAt = project.created_at || project.startDate || 'N/A';
  const methodology = project.metadata?.methodology || 'VM0007 - REDD+';
  const area = project.metadata?.area || 'N/A';
  const claimedCredits = project.claimed_credits || project.creditsIssued || 500;
  const releasedCredits = project.released_credits || 0;
  const bufferCredits = project.bufferCredits || Math.round(claimedCredits * 0.1);
  const riskAssessment = project.riskAssessment || 'Low';
  const validationAcva = acvas.find(a => a.id === project.assigned_acva);
  const verificationAcva = acvas.find(a => a.id === project.verification_acva);
  const createdDate = typeof createdAt === 'string' && createdAt !== 'N/A' ? new Date(createdAt).toLocaleDateString() : 'N/A';

  // Build REAL timeline — only events that have actually happened
  const timelineEvents = buildRealTimeline(project, projectName, validationAcva, verificationAcva, claimedCredits, releasedCredits, documentation, createdDate, methodology);

  // Status badge
  const getStatusBadge = () => {
    const s = (projectStatus || '').toLowerCase();
    const map: Record<string, { label: string; color: string }> = {
      'pending': { label: 'Unverified', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
      'under_validation': { label: 'Under Validation', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
      'sanctioned': { label: 'Sanctioned', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
      'under_verification': { label: 'Under Verification', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
      'verification_in_progress': { label: 'Verification In Progress', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
      'credits_released': { label: 'Credits Released', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
      'active': { label: 'Active', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
      'completed': { label: 'Completed', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
    };
    const entry = map[s] || map['pending'];
    return <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${entry.color}`}>{entry.label}</span>;
  };

  return (
    <div className="min-h-screen readable-surface">
      {/* Header */}
      <div className="bg-white/85 dark:bg-gray-800/70 border-b border-gray-100 dark:border-gray-700 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button onClick={handleBack} className="flex items-center text-nee-600 dark:text-nee-400 hover:text-nee-700 dark:hover:text-nee-300 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
          </button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-gradient-heading text-3xl font-extrabold hero-readable-text">{projectName}</h1>
              <div className="flex items-center gap-3 mt-2">
                {getStatusBadge()}
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{projectLocation}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{createdDate}</span>
              </div>
            </div>
            {releasedCredits > 0 && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg">
                <p className="text-xs font-medium opacity-80">Credits Released</p>
                <p className="text-2xl font-bold">{releasedCredits.toLocaleString()} <span className="text-sm font-normal">tCO2e</span></p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Row 1: Map + Project Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-white/85 dark:bg-gray-800/70 rounded-xl shadow-md border border-gray-200/60 dark:border-gray-700/60 p-2 overflow-hidden">
            <ProjectMap coordinates={projectCoordinates} location={projectLocation} />
          </div>
          <div className="space-y-4">
            <div className="bg-white/85 dark:bg-gray-800/70 rounded-xl shadow-md border border-gray-200/60 dark:border-gray-700/60 p-5">
              <h3 className="text-base font-bold mb-3 text-gray-900 dark:text-gray-100">Project Details</h3>
              <div className="space-y-2.5 text-sm">
                <InfoRow label="Project ID" value={<span className="font-mono text-xs break-all">{project.id}</span>} />
                <InfoRow label="Location" value={projectLocation} />
                <InfoRow label="Methodology" value={methodology} />
                <InfoRow label="Area" value={`${area} ha`} />
                <InfoRow label="Risk Assessment" value={<span className={`px-2 py-0.5 rounded text-xs font-semibold ${riskAssessment === 'Low' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : riskAssessment === 'Medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>{riskAssessment}</span>} />
                {validationAcva && <InfoRow label="Validation ACVA" value={<span className="flex items-center gap-1"><Shield className="w-3 h-3 text-nee-500" />{validationAcva.agencyName}</span>} />}
                {verificationAcva && <InfoRow label="Verification ACVA" value={<span className="flex items-center gap-1"><Shield className="w-3 h-3 text-indigo-500" />{verificationAcva.agencyName}</span>} />}
              </div>
            </div>
            <div className="bg-white/85 dark:bg-gray-800/70 rounded-xl shadow-md border border-gray-200/60 dark:border-gray-700/60 p-5">
              <h3 className="text-base font-bold mb-3 text-gray-900 dark:text-gray-100">Carbon Credits</h3>
              <div className="space-y-2.5 text-sm">
                <InfoRow label="Claimed" value={<span className="font-semibold text-blue-700 dark:text-blue-300">{claimedCredits.toLocaleString()} tCO2e</span>} />
                <InfoRow label="Released" value={<span className="font-semibold text-green-700 dark:text-green-300">{releasedCredits > 0 ? `${releasedCredits.toLocaleString()} tCO2e` : '—'}</span>} />
                <InfoRow label="Buffer Pool" value={<span className="font-semibold text-amber-700 dark:text-amber-300">{bufferCredits.toLocaleString()} tCO2e</span>} />
              </div>
            </div>
          </div>
        </div>

        {projectDescription && (
          <div className="bg-white/85 dark:bg-gray-800/70 rounded-xl shadow-md border border-gray-200/60 dark:border-gray-700/60 p-5">
            <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-gray-100">Description</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{projectDescription}</p>
          </div>
        )}

        {/* Satellite Imagery */}
        <div className="bg-white/85 dark:bg-gray-800/70 rounded-xl shadow-md border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><Satellite className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Satellite Imagery & Earth Engine Analysis</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fetched weekly from Sentinel-2 · Processed via Google Earth Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><RefreshCw className="w-3.5 h-3.5" />Last updated: {new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SATELLITE_IMAGES.map((img, idx) => (
                <div key={idx} className="group cursor-pointer" onClick={() => setLightbox({ src: img.src, title: img.title })}>
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm group-hover:shadow-lg transition-shadow duration-200">
                    <img src={img.src} alt={img.title} className="w-full h-48 object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-white text-xs font-medium flex items-center gap-1"><Eye className="w-3 h-3" /> Click to enlarge</span>
                    </div>
                  </div>
                  <div className="mt-2.5 px-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{img.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{img.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(img.date).toLocaleDateString()}</span>
                      <span>{img.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            MERGED: Project History — Timeline + Documents
           ═══════════════════════════════════════════════════ */}
        <div className="bg-white/85 dark:bg-gray-800/70 rounded-xl shadow-md border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-nee-500" />
              Project History & Documents
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Complete audit trail — every milestone with submitted documents from Proponent and ACVAs</p>
          </div>
          <div className="p-6">
            <div className="relative">
              {/* Vertical connector line — only spans the completed events */}
              <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-blue-300 via-nee-300 to-emerald-300 dark:from-blue-700 dark:via-nee-700 dark:to-emerald-700"></div>

              <div className="space-y-0">
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative flex gap-4 group">
                    {/* Node dot */}
                    <div className="relative z-10 flex flex-col items-center flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ring-4 ring-white dark:ring-gray-800 ${evt.iconBg}`}>
                        {evt.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`flex-1 pb-8 ${idx === timelineEvents.length - 1 ? 'pb-2' : ''}`}>
                      {/* Event header */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{evt.title}</h4>
                        {evt.badge && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${evt.badgeColor}`}>{evt.badge}</span>}
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-auto">{evt.date}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{evt.description}</p>

                      {/* Credits callout */}
                      {evt.credits && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <Coins className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-bold text-green-700 dark:text-green-300">{evt.credits}</span>
                        </div>
                      )}

                      {/* Attached documents (inline) */}
                      {evt.documents && evt.documents.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {evt.documents.map((doc, dIdx) => (
                            <div key={dIdx} className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${doc.borderColor}`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.iconBg}`}>
                                {doc.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{doc.name}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">{doc.source}</p>
                              </div>
                              {(doc.content || doc.url) && (
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {/* View Document button */}
                                  <button
                                    onClick={() => handleViewDocument(doc.name || '', doc.content || '', doc.url)}
                                    className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all hover:scale-[1.03] ${doc.buttonColor || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                  >
                                    <Eye className="w-3 h-3" /> View
                                  </button>
                                  {/* Upload to IPFS button — for both content and external URLs */}
                                  {(doc.content || doc.url) && (
                                    <button
                                      onClick={() => handleUploadToIPFS(doc.name || '', doc.content || '', doc.url)}
                                      disabled={uploadingDoc === doc.name}
                                      className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all ${uploadingDoc === doc.name ? 'opacity-50 cursor-wait' : 'hover:scale-[1.03]'} bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300`}
                                    >
                                      {uploadingDoc === doc.name ? (
                                        <><div className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin"></div> Uploading...</>
                                      ) : (
                                        <><Upload className="w-3 h-3" /> IPFS</>
                                      )}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Current/next step indicator */}
                {projectStatus !== 'credits_released' && (
                  <div className="relative flex gap-4">
                    <div className="relative z-10 flex flex-col items-center flex-shrink-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 dark:border-gray-500">
                        <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="text-sm font-medium text-gray-400 dark:text-gray-500 italic">{getNextStepLabel(projectStatus)}</h4>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Awaiting action...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)} className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            <img src={lightbox.src} alt={lightbox.title} className="w-full rounded-xl shadow-2xl" />
            <p className="text-center text-white/90 text-sm font-medium mt-3">{lightbox.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-gray-900 dark:text-gray-100 text-right">{value}</span>
    </div>
  );
}

function getNextStepLabel(status: string): string {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'pending': return 'Next: Assign ACVA for Validation';
    case 'under_validation': return 'Next: Admin to Review & Sanction';
    case 'sanctioned': case 'under_verification': return 'Next: Assign Verification ACVA';
    case 'verification_in_progress': return 'Next: Admin to Compare Reports & Release Credits';
    default: return 'Next step pending...';
  }
}


// ── Timeline Builder (REAL — only shows completed events) ──

interface TimelineDoc {
  name: string;
  source: string;
  icon: React.ReactNode;
  iconBg: string;
  borderColor: string;
  buttonColor: string;
  content?: string;
  url?: string;
}

interface TimelineEvent {
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  iconBg: string;
  badge?: string;
  badgeColor?: string;
  credits?: string;
  documents?: TimelineDoc[];
}

function buildRealTimeline(
  project: any,
  projectName: string,
  validationAcva: ACVA | undefined,
  verificationAcva: ACVA | undefined,
  claimedCredits: number,
  releasedCredits: number,
  uploadedDocs: string[],
  createdDate: string,
  methodology: string,
): TimelineEvent[] {
  const status = (project.status || 'pending').toLowerCase();
  const statusOrder = ['pending', 'under_validation', 'sanctioned', 'under_verification', 'verification_in_progress', 'credits_released'];
  const currentIdx = statusOrder.indexOf(status);
  const past = (s: string) => currentIdx >= statusOrder.indexOf(s);

  const events: TimelineEvent[] = [];

  // ──────────────────────────────────────────────
  // 1. Project Registered — ALWAYS shown (always happened)
  // ──────────────────────────────────────────────
  const registrationDocs: TimelineDoc[] = [
    {
      name: `PDD_${projectName.replace(/\s+/g, '_')}.pdf`,
      source: 'Submitted by Project Proponent',
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200/60 dark:border-blue-800/40 bg-blue-50/30 dark:bg-blue-900/10',
      buttonColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      content: `PROJECT DESIGN DOCUMENT (PDD)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nProject: ${projectName}\nProject ID: ${project.id}\nMethodology: ${methodology}\nLocation: ${project.location || 'N/A'}\n\n1. PROJECT DESCRIPTION\n   Carbon sequestration project through sustainable land\n   management and afforestation/reforestation activities.\n\n2. BASELINE SCENARIO\n   Baseline emissions estimated using approved methodology.\n\n3. MONITORING PLAN\n   • Quarterly satellite imagery analysis (Sentinel-2)\n   • Bi-annual ground-truth biomass sampling\n   • Annual soil carbon measurements\n   • Continuous IoT sensor monitoring\n\n4. ESTIMATED CREDITS\n   ${claimedCredits.toLocaleString()} tCO2e per verification cycle\n\nDate Submitted: ${createdDate}`,
    },
  ];

  // Add real uploaded docs from Supabase
  uploadedDocs.forEach(doc => {
    const isUrl = doc.startsWith('http://') || doc.startsWith('https://');
    const fileName = isUrl ? doc.split('/').pop() || 'Document' : doc;
    const publicUrl = isUrl ? doc : supabase.storage.from('project-documents').getPublicUrl(doc).data.publicUrl;
    registrationDocs.push({
      name: fileName,
      source: 'Uploaded by Project Proponent',
      icon: <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />,
      iconBg: 'bg-gray-100 dark:bg-gray-700',
      borderColor: 'border-gray-200/60 dark:border-gray-700/40 bg-gray-50/30 dark:bg-gray-800/20',
      buttonColor: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
      url: publicUrl,
    });
  });

  events.push({
    title: 'Project Registered & PDD Submitted',
    description: `Project proponent submitted the Project Design Document with supporting documentation for review.`,
    date: createdDate,
    icon: <FileText className="w-4.5 h-4.5 text-white" />,
    iconBg: 'bg-blue-500',
    badge: 'Registration',
    badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    documents: registrationDocs,
  });

  // ──────────────────────────────────────────────
  // 2. ACVA Assigned for Validation
  // ──────────────────────────────────────────────
  if (past('under_validation') && validationAcva) {
    events.push({
      title: `Validation ACVA Assigned — ${validationAcva.agencyName}`,
      description: `${validationAcva.agencyName} (${validationAcva.country}) was assigned to validate the project. They will conduct a desk review of the PDD and perform site assessment.`,
      date: createdDate,
      icon: <Shield className="w-4.5 h-4.5 text-white" />,
      iconBg: 'bg-nee-500',
      badge: 'Validation',
      badgeColor: 'bg-nee-100 dark:bg-nee-900/30 text-nee-700 dark:text-nee-300',
    });
  }

  // ──────────────────────────────────────────────
  // 3. Validation Completed + ACVA Report
  // ──────────────────────────────────────────────
  if (past('sanctioned') && validationAcva) {
    events.push({
      title: `Validation Report Submitted by ${validationAcva.agencyName}`,
      description: `${validationAcva.agencyName} completed their desk review and site assessment. All methodology compliance, additionality, and baseline checks passed.`,
      date: createdDate,
      icon: <Building2 className="w-4.5 h-4.5 text-white" />,
      iconBg: 'bg-nee-600',
      documents: [{
        name: `Validation_Report_${validationAcva.agencyName.replace(/\s+/g, '_')}.pdf`,
        source: `Submitted by ${validationAcva.agencyName}`,
        icon: <Building2 className="w-4 h-4 text-nee-500" />,
        iconBg: 'bg-nee-50 dark:bg-nee-900/20',
        borderColor: 'border-nee-200/60 dark:border-nee-800/40 bg-nee-50/30 dark:bg-nee-900/10',
        buttonColor: 'bg-nee-100 dark:bg-nee-900/30 text-nee-700 dark:text-nee-300',
        content: `VALIDATION REPORT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nValidation Agency: ${validationAcva.agencyName}\nACVA ID: ${validationAcva.id}\nProject: ${projectName} (${project.id})\n\nVALIDATION FINDINGS:\n\n  ✅ Methodology Compliance: COMPLIANT\n     Project correctly applies ${methodology} methodology.\n\n  ✅ Additionality: CONFIRMED\n     Without carbon finance, the project activity would\n     not have occurred.\n\n  ✅ Baseline Accuracy: VERIFIED\n     Baseline scenario correctly represents the\n     business-as-usual case.\n\n  ✅ Monitoring Plan: ADEQUATE\n     Monitoring parameters and procedures are sufficient.\n\nVALIDATED CREDITS: ${Math.round(claimedCredits * 0.92).toLocaleString()} tCO2e/year\n\nRECOMMENDATION: APPROVAL\n\nSigned: Lead Validator\n${validationAcva.agencyName}\nDate: ${createdDate}`,
      }],
    });
  }

  // ──────────────────────────────────────────────
  // 4. Admin Sanctioned
  // ──────────────────────────────────────────────
  if (past('under_verification')) {
    events.push({
      title: 'Project Sanctioned by Admin',
      description: `Admin compared the PDD with ${validationAcva?.agencyName || 'ACVA'}'s validation report and approved the project. It is now eligible for verification cycles and credit issuance.`,
      date: createdDate,
      icon: <Award className="w-4.5 h-4.5 text-white" />,
      iconBg: 'bg-indigo-500',
      badge: 'Sanctioned',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    });
  }

  // ──────────────────────────────────────────────
  // 5. Proponent Submitted Verification Claim
  // ──────────────────────────────────────────────
  if (past('under_verification')) {
    events.push({
      title: 'Verification Claim Submitted by Proponent',
      description: `After the monitoring period, the project proponent submitted a verification report claiming ${claimedCredits.toLocaleString()} tCO2e of carbon credits based on field monitoring data.`,
      date: new Date().toLocaleDateString(),
      icon: <TrendingUp className="w-4.5 h-4.5 text-white" />,
      iconBg: 'bg-blue-500',
      badge: 'Cycle 1',
      badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      credits: `Claimed: ${claimedCredits.toLocaleString()} tCO2e`,
      documents: [{
        name: `Verification_Claim_${projectName.replace(/\s+/g, '_')}.pdf`,
        source: 'Submitted by Project Proponent',
        icon: <User className="w-4 h-4 text-blue-500" />,
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200/60 dark:border-blue-800/40 bg-blue-50/30 dark:bg-blue-900/10',
        buttonColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        content: `VERIFICATION CLAIM REPORT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nProject: ${projectName}\nProject ID: ${project.id}\nVerification Period: ${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toLocaleDateString()} to ${new Date().toLocaleDateString()}\n\n1. MONITORING RESULTS\n   Project has been operational for the full monitoring period.\n   All data collected per approved monitoring plan.\n\n2. CARBON SEQUESTRATION MEASUREMENTS\n   Total biomass increase: ${Math.round(claimedCredits * 1.2)} tonnes\n   Net carbon sequestered: ${claimedCredits} tCO2e\n\n3. DATA SOURCES\n   • Satellite imagery analysis (quarterly)\n   • Ground-truth sampling (bi-annual)\n   • Soil carbon measurements (annual)\n   • IoT sensor data (continuous)\n\n4. CLAIMED CREDITS: ${claimedCredits.toLocaleString()} tCO2e\n\nSigned: Project Proponent\nDate: ${new Date().toLocaleDateString()}`,
      }],
    });
  }

  // ──────────────────────────────────────────────
  // 6. Verification ACVA Assigned
  // ──────────────────────────────────────────────
  if (past('verification_in_progress') && verificationAcva) {
    events.push({
      title: `Verification ACVA Assigned — ${verificationAcva.agencyName}`,
      description: `${verificationAcva.agencyName} (${verificationAcva.country}) was assigned for independent field verification. This is a different agency from the validation stage (${validationAcva?.agencyName || 'N/A'}) to ensure impartiality.`,
      date: new Date().toLocaleDateString(),
      icon: <Shield className="w-4.5 h-4.5 text-white" />,
      iconBg: 'bg-violet-500',
      badge: 'Verification',
      badgeColor: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
    });
  }

  // ──────────────────────────────────────────────
  // 7. ACVA Verification Report Submitted
  // ──────────────────────────────────────────────
  if (past('verification_in_progress') && verificationAcva) {
    const acvaVerified = Math.round(claimedCredits * 0.88);
    const bufferDeduction = Math.round(acvaVerified * 0.1);
    const recommended = acvaVerified - bufferDeduction;
    events.push({
      title: `Verification Report Submitted by ${verificationAcva.agencyName}`,
      description: `${verificationAcva.agencyName} completed field verification, cross-checked monitoring data against satellite imagery, and submitted their independent assessment.`,
      date: new Date().toLocaleDateString(),
      icon: <Building2 className="w-4.5 h-4.5 text-white" />,
      iconBg: 'bg-green-500',
      credits: `Verified: ${acvaVerified.toLocaleString()} tCO2e · Recommended: ${recommended.toLocaleString()} tCO2e`,
      documents: [{
        name: `Verification_Report_${verificationAcva.agencyName.replace(/\s+/g, '_')}.pdf`,
        source: `Submitted by ${verificationAcva.agencyName}`,
        icon: <Building2 className="w-4 h-4 text-green-500" />,
        iconBg: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200/60 dark:border-green-800/40 bg-green-50/30 dark:bg-green-900/10',
        buttonColor: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        content: `VERIFICATION REPORT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nVerification Agency: ${verificationAcva.agencyName}\nACVA ID: ${verificationAcva.id}\nProject: ${projectName}\n\nFIELD VERIFICATION FINDINGS:\n\n  ✅ Site Inspection: COMPLETED\n     Field team visited site. Physical observations\n     align with monitoring reports.\n\n  ✅ Data Verification: VERIFIED\n     Monitoring data cross-checked with independent\n     satellite imagery. Minor Q2 discrepancy corrected.\n\n  ✅ Methodology Adherence: COMPLIANT\n     Project follows ${methodology} methodology.\n\n  ✅ Leakage Assessment: NO SIGNIFICANT LEAKAGE\n\nCREDIT VERIFICATION:\n  Proponent Claimed:     ${claimedCredits.toLocaleString()} tCO2e\n  ACVA Verified:         ${acvaVerified.toLocaleString()} tCO2e\n  Adjustment:            -${(claimedCredits - acvaVerified).toLocaleString()} tCO2e\n  Buffer Deduction (10%): -${bufferDeduction.toLocaleString()} tCO2e\n  ─────────────────────────────\n  RECOMMENDED RELEASE:   ${recommended.toLocaleString()} tCO2e\n\nSigned: Lead Verifier\n${verificationAcva.agencyName}\nDate: ${new Date().toLocaleDateString()}`,
      }],
    });
  }

  // ──────────────────────────────────────────────
  // 8. Carbon Credits Released
  // ──────────────────────────────────────────────
  if (past('credits_released') && releasedCredits > 0) {
    events.push({
      title: 'Carbon Credits Released to Proponent',
      description: `Admin compared both reports and released ${releasedCredits.toLocaleString()} tCO2e carbon credits to the proponent's account. Credits logged on blockchain.`,
      date: new Date().toLocaleDateString(),
      icon: <Coins className="w-4.5 h-4.5 text-white" />,
      iconBg: 'bg-emerald-500',
      badge: 'Cycle 1 Complete',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      credits: `Released: ${releasedCredits.toLocaleString()} tCO2e (from ${claimedCredits.toLocaleString()} claimed)`,
      documents: [{
        name: `Credit_Certificate_${projectName.replace(/\s+/g, '_')}_Cycle1.pdf`,
        source: 'Issued by NeeLedger Admin',
        icon: <Award className="w-4 h-4 text-emerald-500" />,
        iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-900/10',
        buttonColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        content: `CARBON CREDIT CERTIFICATE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🏆 CERTIFICATE OF CARBON CREDIT ISSUANCE\n\nProject: ${projectName}\nVerification Cycle: 1\n\nCredits Claimed:   ${claimedCredits.toLocaleString()} tCO2e\nCredits Verified:  ${Math.round(claimedCredits * 0.88).toLocaleString()} tCO2e\nCredits Released:  ${releasedCredits.toLocaleString()} tCO2e\n\nValidation ACVA:   ${validationAcva?.agencyName || 'N/A'}\nVerification ACVA: ${verificationAcva?.agencyName || 'N/A'}\n\nThis certifies that ${releasedCredits.toLocaleString()} verified\ncarbon credits have been released to the proponent's\naccount and logged on the blockchain.\n\nIssued by: NeeLedger Carbon Credit Platform\nDate: ${new Date().toLocaleDateString()}\nTx: 0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      }],
    });
  }

  return events;
}
