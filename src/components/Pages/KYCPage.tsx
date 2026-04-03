import { useState, useEffect } from 'react';
import { FileText, Filter, CheckCircle, XCircle, Clock, Building, Mail, Calendar, Eye, Upload } from 'lucide-react';
import { useDocumentActions } from '../../hooks/useDocumentActions';

// status helpers moved to module scope so they can be used by detail modal as well
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Done':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'Pending':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'In Process':
      return <Clock className="w-5 h-5 text-blue-500" />;
    default:
      return <XCircle className="w-5 h-5 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Done':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'In Process':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
import { Account } from '../../types';

interface KYCPageProps {
  accounts: Account[];
}

export default function KYCPage({ accounts }: KYCPageProps) {
  const [filter, setFilter] = useState<'all' | 'Done' | 'Pending' | 'In Process'>('all');

  useEffect(() => {
    // Mark the page so the footer can render a compact variant
    try {
      document.body.classList.add('compact-footer');
    } catch (e) {
      // ignore for SSR/non-browser
    }
    return () => {
      try { document.body.classList.remove('compact-footer'); } catch (e) {}
    };
  }, []);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const filteredAccounts = filter === 'all' 
    ? accounts 
    : accounts.filter(account => account.kycStatus === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'In Process':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Process':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = (accountId: string) => {
    console.log('Approving account:', accountId);
    // Here you would update the account status via API
  };

  const handleReject = (accountId: string) => {
    console.log('Rejecting account:', accountId);
    // Here you would update the account status via API
  };

  if (selectedAccount) {
    return (
      <KYCDetailModal 
        account={selectedAccount} 
        onClose={() => setSelectedAccount(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    );
  }

  return (
    <div className="p-6 readable-surface space-y-6 pb-28">
      <div className="mb-4">
        <h1 className="text-gradient-heading text-3xl font-extrabold hero-readable-text mb-2">Account KYC Management</h1>
        <p className="text-gray-700 dark:text-gray-300 font-medium">Review and manage Know Your Customer documentation</p>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <div className="flex items-center flex-wrap gap-3">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</span>
          {['all', 'Done', 'Pending', 'In Process'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === status
                  ? 'bg-nee-600 dark:bg-nee-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* KYC Table */}
      <div className="bg-white/85 dark:bg-gray-800/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 dark:bg-gray-900/70 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs tracking-wide uppercase font-semibold text-gray-700 dark:text-gray-200">Account ID</th>
                <th className="px-6 py-4 text-left text-xs tracking-wide uppercase font-semibold text-gray-700 dark:text-gray-200">Company</th>
                <th className="px-6 py-4 text-left text-xs tracking-wide uppercase font-semibold text-gray-700 dark:text-gray-200">Projects</th>
                <th className="px-6 py-4 text-left text-xs tracking-wide uppercase font-semibold text-gray-700 dark:text-gray-200">Type</th>
                <th className="px-6 py-4 text-left text-xs tracking-wide uppercase font-semibold text-gray-700 dark:text-gray-200">KYC Status</th>
                <th className="px-6 py-4 text-left text-xs tracking-wide uppercase font-semibold text-gray-700 dark:text-gray-200">Registered</th>
                <th className="px-6 py-4 text-left text-xs tracking-wide uppercase font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{account.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="font-medium text-gray-800 dark:text-gray-100">{account.companyName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 shadow-sm">
                      {account.projects.length} projects
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${
                      account.accountType === 'Project Proponent' 
                        ? 'bg-nee-100 dark:bg-nee-900/30 text-nee-800 dark:text-nee-300' 
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                    }`}>
                      {account.accountType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(account.kycStatus)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${getStatusColor(account.kycStatus)}`}>
                        {account.kycStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="meta-text">{new Date(account.registrationDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedAccount(account)}
            className="inline-flex items-center px-3 py-1.5 bg-nee-600 dark:bg-nee-700 text-white text-sm font-medium rounded-lg hover:bg-nee-700 dark:hover:bg-nee-600 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Review KYC
                    </button>
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

function KYCDetailModal({ 
  account, 
  onClose, 
  onApprove, 
  onReject 
}: { 
  account: Account; 
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const { uploadingDoc, handleViewDocument, handleUploadToIPFS } = useDocumentActions();
  const docName = `KYC Document - ${account.companyName}`;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">KYC Review: {account.companyName}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Account Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Account ID</label>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{account.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Company Name</label>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{account.companyName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <p className="font-medium text-gray-800 dark:text-gray-100">{account.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Account Type</label>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{account.accountType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Registration Date</label>
                    <p className="font-medium meta-text">{new Date(account.registrationDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Associated Projects</label>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{account.projects.length} projects</p>
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Document */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">KYC Documentation</h3>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">KYC Document</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{account.kycDocument}</p>
                  <div className="mt-4 flex justify-center gap-3">
                    <button onClick={() => handleViewDocument(docName, account.kycDocument)} className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                      <Eye className="w-4 h-4 mr-2" /> View
                    </button>
                    <button onClick={() => handleUploadToIPFS(docName, account.kycDocument)} disabled={uploadingDoc === docName} className={`inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${uploadingDoc === docName ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                      {uploadingDoc === docName ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Uploading...</>
                      ) : (
                        <><Upload className="w-4 h-4 mr-2" /> IPFS</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Current Status</h3>
                <div className="flex items-center mb-4">
                  {getStatusIcon(account.kycStatus)}
                  <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(account.kycStatus)}`}>
                    {account.kycStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {account.kycStatus === 'Pending' && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => onReject(account.id)}
                  className="inline-flex items-center px-6 py-2 bg-red-600 dark:bg-red-700 text-white font-medium rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => onApprove(account.id)}
                  className="inline-flex items-center px-6 py-2 bg-green-600 dark:bg-green-700 text-white font-medium rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}