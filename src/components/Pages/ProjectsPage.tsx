import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, X, CheckCircle, ArrowRight } from 'lucide-react';
import { Project, ACVA } from '../../types';

interface ProjectsPageProps {
  projects: (Project | any)[];
  onSelectProject?: (project: Project | any) => void;
  acvas?: ACVA[];
  onAssignACVA?: (projectId: string, acvaId: string) => void;
}

export default function ProjectsPage({ projects, onSelectProject, acvas = [], onAssignACVA }: ProjectsPageProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [assignModal, setAssignModal] = useState<{ open: boolean; project: any | null }>({ open: false, project: null });
  const [selectedACVAId, setSelectedACVAId] = useState<string>('');

  // Helper to get display values from either old mock format or new Supabase format
  const getProjectName = (p: any) => p.name || p.metadata?.ownership || p.id;
  const getAccountId = (p: any) => p.user_id || p.accountId || '-';
  const getLocation = (p: any) => p.location || p.state_name || p.country || '-';
  const getCreatedAt = (p: any) => {
    const date = p.created_at || p.startDate;
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const isUnverified = (p: any) => {
    const s = (p.status || '').toLowerCase();
    return s === 'pending' || s === 'unverified' || s === 'uploaded' || s === '';
  };

  const getStatusBadge = (p: any) => {
    const s = (p.status || 'pending').toLowerCase();
    if (s === 'active' || s === 'approved' || s === 'verified') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"><CheckCircle className="w-3 h-3" /> Verified</span>;
    }
    if (s === 'under_validation') {
      const assignedAcva = acvas.find(a => a.id === p.assigned_acva);
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" title={assignedAcva ? `Assigned to ${assignedAcva.agencyName}` : ''}>
          <Shield className="w-3 h-3" /> Under Validation
        </span>
      );
    }
    if (s === 'sanctioned' || s === 'under_verification') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
          <CheckCircle className="w-3 h-3" /> {s === 'under_verification' ? 'Under Verification' : 'Sanctioned'}
        </span>
      );
    }
    if (s === 'verification_in_progress') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
          <Shield className="w-3 h-3" /> Verification In Progress
        </span>
      );
    }
    if (s === 'credits_released') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
          <CheckCircle className="w-3 h-3" /> Credits Released
        </span>
      );
    }
    if (s === 'completed') {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">Completed</span>;
    }
    // pending / unverified / uploaded
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Unverified</span>;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects || [];
    return projects.filter((p) =>
      getProjectName(p).toLowerCase().includes(q) ||
      getAccountId(p).toLowerCase().includes(q) ||
      getLocation(p).toLowerCase().includes(q)
    );
  }, [projects, query]);

  const handleViewDetails = (project: Project) => {
    if (onSelectProject) onSelectProject(project);
    navigate(`/projects/${project.id}`);
  };

  // Only show Active ACVAs in the assignment modal
  const activeACVAs = acvas.filter(a => a.status === 'Active');

  const handleOpenAssign = (project: any) => {
    setAssignModal({ open: true, project });
    setSelectedACVAId('');
  };

  const handleConfirmAssign = () => {
    if (assignModal.project && selectedACVAId && onAssignACVA) {
      onAssignACVA(assignModal.project.id, selectedACVAId);
      setAssignModal({ open: false, project: null });
      setSelectedACVAId('');
    }
  };

  return (
    <div className="min-h-screen readable-surface">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-gradient-heading text-3xl font-extrabold mb-6 hero-readable-text">Projects</h1>

        <div className="mb-4 flex items-center space-x-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-nee-500 dark:text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by id, account, owner or country"
              className="pl-10 pr-4 py-2 rounded-lg border border-nee-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 text-sm shadow-sm w-full focus:ring-2 focus:ring-nee-500 dark:focus:ring-nee-400"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing <span className="font-medium text-nee-700 dark:text-nee-400">{filtered.length}</span> of {projects.length}
          </div>
        </div>

        <div className="overflow-x-auto bg-white/85 dark:bg-gray-800/70 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-nee-200 dark:border-gray-700 text-left text-sm font-semibold text-nee-900 dark:text-gray-100">Project Name</th>
                <th className="px-6 py-3 border-b border-nee-200 dark:border-gray-700 text-left text-xs tracking-wide uppercase font-semibold text-nee-900 dark:text-gray-100">User ID</th>
                <th className="px-6 py-3 border-b border-nee-200 dark:border-gray-700 text-left text-xs tracking-wide uppercase font-semibold text-nee-900 dark:text-gray-100">Location</th>
                <th className="px-6 py-3 border-b border-nee-200 dark:border-gray-700 text-left text-xs tracking-wide uppercase font-semibold text-nee-900 dark:text-gray-100">Created</th>
                <th className="px-6 py-3 border-b border-nee-200 dark:border-gray-700 text-left text-xs tracking-wide uppercase font-semibold text-nee-900 dark:text-gray-100">Status</th>
                <th className="px-6 py-3 border-b border-nee-200 dark:border-gray-700 text-center text-xs tracking-wide uppercase font-semibold text-nee-900 dark:text-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-nee-50/60 dark:hover:bg-gray-700/60 cursor-pointer transition-colors">
                  <td className="px-6 py-4 border-b border-nee-200 dark:border-gray-700 text-sm text-nee-900 dark:text-gray-100">{getProjectName(p)}</td>
                  <td className="px-6 py-4 border-b border-nee-200 dark:border-gray-700 text-sm font-medium text-nee-900 dark:text-gray-100">{getAccountId(p)}</td>
                  <td className="px-6 py-4 border-b border-nee-200 dark:border-gray-700 text-sm text-nee-900 dark:text-gray-100">{getLocation(p)}</td>
                  <td className="px-6 py-4 border-b border-nee-200 dark:border-gray-700 text-sm text-nee-900 dark:text-gray-100">{getCreatedAt(p)}</td>
                  <td className="px-6 py-4 border-b border-nee-200 dark:border-gray-700 text-sm">
                    {getStatusBadge(p)}
                  </td>
                  <td className="px-6 py-4 border-b border-nee-200 dark:border-gray-700 text-center text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewDetails(p); }}
                        className="text-nee-600 dark:text-nee-400 hover:text-nee-700 dark:hover:text-nee-300 font-semibold underline decoration-2 decoration-transparent hover:decoration-nee-500 dark:hover:decoration-nee-400 transition-colors"
                      >
                        Details
                      </button>
                      {isUnverified(p) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenAssign(p); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-nee-500 to-nee-600 hover:from-nee-600 hover:to-nee-700 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03]"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Assign ACVA
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign ACVA Modal */}
      {assignModal.open && assignModal.project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setAssignModal({ open: false, project: null })}>
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg mx-4 overflow-hidden animate-in"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeInUp 0.25s ease-out' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-nee-50 to-white dark:from-gray-800 dark:to-gray-750">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Assign ACVA</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Assign a verification agency to <span className="font-semibold text-nee-600 dark:text-nee-400">{getProjectName(assignModal.project)}</span>
                </p>
              </div>
              <button onClick={() => setAssignModal({ open: false, project: null })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* ACVA Options */}
            <div className="px-6 py-4 space-y-3 max-h-[350px] overflow-y-auto">
              {activeACVAs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No active ACVAs available</p>
                  <p className="text-sm mt-1">Add ACVAs on the ACVA Management page first.</p>
                </div>
              ) : (
                activeACVAs.map((acva) => {
                  const isSelected = selectedACVAId === acva.id;
                  return (
                    <button
                      key={acva.id}
                      onClick={() => setSelectedACVAId(acva.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-nee-500 bg-nee-50 dark:bg-nee-900/20 shadow-md ring-2 ring-nee-200 dark:ring-nee-800'
                          : 'border-gray-200 dark:border-gray-600 hover:border-nee-300 dark:hover:border-nee-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-nee-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                          } transition-colors`}>
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`font-semibold ${isSelected ? 'text-nee-700 dark:text-nee-300' : 'text-gray-900 dark:text-gray-100'}`}>
                              {acva.agencyName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{acva.country}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                              <span>{acva.contactInfo.email}</span>
                              <span>•</span>
                              <span>{acva.projectsAssigned.length} projects assigned</span>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-nee-500 flex items-center justify-center flex-shrink-0 mt-1">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <button
                onClick={() => setAssignModal({ open: false, project: null })}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={!selectedACVAId}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  selectedACVAId
                    ? 'bg-gradient-to-r from-nee-500 to-nee-600 text-white shadow-lg shadow-nee-500/30 hover:shadow-xl hover:scale-[1.02]'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
              >
                Assign & Send for Validation
                <ArrowRight className="w-4 h-4" />
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
