import { useState } from 'react';
import { Shield, MapPin, Phone, Mail, FileText, Eye, CheckCircle, XCircle, Pause } from 'lucide-react';

// Move helpers to module scope so multiple components can use them
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Suspended':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Active':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'Pending':
      return <Shield className="w-4 h-4 text-yellow-500" />;
    case 'Suspended':
      return <Pause className="w-4 h-4 text-red-500" />;
    default:
      return <XCircle className="w-4 h-4 text-gray-400" />;
  }
};
import { useDocumentActions } from '../../hooks/useDocumentActions';
import { Upload } from 'lucide-react';
import { ACVA } from '../../types';

interface ACVAPageProps {
  acvas: ACVA[];
}

export default function ACVAPage({ acvas }: ACVAPageProps) {
  const [selectedACVA, setSelectedACVA] = useState<ACVA | null>(null);
  const { uploadingDoc, handleViewDocument, handleUploadToIPFS } = useDocumentActions();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Pending':
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case 'Suspended':
        return <Pause className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (selectedACVA) {
    return (
      <ACVADetailPage 
        acva={selectedACVA} 
        onBack={() => setSelectedACVA(null)}
      />
    );
  }

  return (
    <div className="p-6 readable-surface">
      <div className="mb-6">
        <h1 className="text-gradient-heading text-3xl font-extrabold hero-readable-text mb-2">ACVA Management</h1>
        <p className="text-gray-700 dark:text-gray-300 font-medium">Manage Accredited Carbon Validation Agencies</p>
      </div>

      <div className="overflow-x-auto bg-white/85 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">ACVA ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Agency Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Country/Region</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Projects Assigned</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {acvas.map((acva) => (
                <tr key={acva.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{acva.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-nee-500 dark:text-nee-400 mr-2" />
                      <span className="font-medium text-gray-800 dark:text-gray-100">{acva.agencyName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-2" />
                      {acva.country}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 shadow-sm">
                      {acva.projectsAssigned.length} projects
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(acva.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${getStatusColor(acva.status)}`}>
                        {acva.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        <span className="truncate">{acva.contactInfo.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        <span className="truncate">{acva.contactInfo.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDocument(`ACVA - ${acva.agencyName}`, formatACVADetails(acva))}
                      className="inline-flex items-center px-3 py-1.5 bg-nee-600 dark:bg-nee-700 text-white text-sm font-medium rounded-lg hover:scale-[1.02] transition-transform shadow-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </button>
                    <button
                      onClick={() => handleUploadToIPFS(`ACVA - ${acva.agencyName}`, formatACVADetails(acva))}
                      disabled={uploadingDoc === `ACVA - ${acva.agencyName}`}
                      className={`inline-flex items-center px-3 py-1.5 text-white text-sm font-medium rounded-lg transition-colors ${uploadingDoc === `ACVA - ${acva.agencyName}` ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      {uploadingDoc === `ACVA - ${acva.agencyName}` ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>...</>
                      ) : (
                        <><Upload className="w-4 h-4 mr-1" /> IPFS</>
                      )}
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function ACVADetailPage({ acva, onBack }: { acva: ACVA; onBack: () => void }) {
  const [acvaStatus, setACVAStatus] = useState(acva.status);
  const { uploadingDoc, handleViewDocument, handleUploadToIPFS } = useDocumentActions();

  const handleStatusChange = (newStatus: 'Active' | 'Suspended') => {
    setACVAStatus(newStatus);
    console.log(`ACVA ${acva.id} status changed to ${newStatus}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-nee-600 dark:text-nee-400 hover:text-nee-700 dark:hover:text-nee-300 mb-4"
        >
          ← Back to ACVA List
        </button>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">ACVA Details: {acva.agencyName}</h1>
        <p className="text-gray-600 dark:text-gray-300">Comprehensive ACVA profile and management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Agency Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">ACVA ID</p>
                <p className="font-medium text-gray-800 dark:text-gray-100">{acva.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Agency Name</p>
                <p className="font-medium text-gray-800 dark:text-gray-100">{acva.agencyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Country/Region</p>
                <p className="font-medium text-gray-800 dark:text-gray-100">{acva.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Projects Assigned</p>
                <p className="font-medium text-gray-800 dark:text-gray-100">{acva.projectsAssigned.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <span className="text-gray-800 dark:text-gray-100">{acva.contactInfo.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                <span className="text-gray-800 dark:text-gray-100">{acva.contactInfo.phone}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Accreditation Documents</h3>
            <div className="space-y-3">
              {acva.accreditationDocs.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                    <span className="text-gray-800 dark:text-gray-100">{doc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                  <button onClick={() => handleViewDocument(`Document - ${doc}`, doc)} className="text-nee-600 dark:text-nee-400 hover:text-nee-700 dark:hover:text-nee-300 text-sm font-medium flex items-center">
                    <Eye className="w-4 h-4 mr-1"/> View
                  </button>
                  <button onClick={() => handleUploadToIPFS(`Document - ${doc}`, doc)} disabled={uploadingDoc === `Document - ${doc}`} className={`text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center ${uploadingDoc === `Document - ${doc}` ? 'opacity-50' : 'hover:underline'}`}>
                    <Upload className="w-4 h-4 mr-1"/> IPFS
                  </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Assigned Projects</h3>
            <div className="space-y-2">
              {acva.projectsAssigned.map((projectId, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium text-gray-800 dark:text-gray-100">{projectId}</span>
                  <button onClick={() => { window.dispatchEvent(new CustomEvent('app:navigate', { detail: 'projects' })); alert(`Navigated to Projects - project id: ${projectId}`); }} className="text-nee-600 dark:text-nee-400 hover:text-nee-700 dark:hover:text-nee-300 text-sm font-medium">
                    View Project
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Management */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Status Management</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Status</p>
                <div className="flex items-center">
                  {getStatusIcon(acvaStatus)}
                  <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(acvaStatus)}`}>
                    {acvaStatus}
                  </span>
                </div>
              </div>
              
              {acvaStatus === 'Active' && (
                <button
                  onClick={() => handleStatusChange('Suspended')}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 dark:bg-red-700 text-white font-medium rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Suspend ACVA
                </button>
              )}
              
              {acvaStatus === 'Suspended' && (
                <button
                  onClick={() => handleStatusChange('Active')}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 dark:bg-green-700 text-white font-medium rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Activate ACVA
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Validations Completed</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Verifications Completed</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Average Response Time</span>
                <span className="font-medium text-gray-800 dark:text-gray-100">3.2 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="font-medium text-green-600 dark:text-green-400">96.8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// Helper to create an HTML-ish content block for the DocumentViewer
function formatACVADetails(acva: ACVA) {
  return `ACVA ID: ${acva.id}\nAgency: ${acva.agencyName}\nCountry: ${acva.country}\n\nContact:\n  Email: ${acva.contactInfo.email}\n  Phone: ${acva.contactInfo.phone}\n\nAccreditation Documents:\n${acva.accreditationDocs.map((d)=>' - '+d).join('\n')}\n\nProjects Assigned:\n${acva.projectsAssigned.join('\n')}`;
}