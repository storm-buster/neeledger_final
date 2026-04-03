import React from 'react';
import { Verification } from '../../types';
import { FileText, CheckCircle } from 'lucide-react';

interface ApprovedVerificationsPageProps {
  verifications: Verification[];
  onReview: (verification: Verification) => void;
}

export default function ApprovedVerificationsPage({ verifications, onReview }: ApprovedVerificationsPageProps) {
  const approvedVerifications = verifications.filter(v => v.status === 'Approved');

  return (
    <div className="p-6 readable-surface">
      <div className="mb-6">
        <h1 className="text-gradient-heading text-3xl font-extrabold hero-readable-text mb-2">Approved Verifications</h1>
        <p className="text-gray-700 font-medium">List of all approved verifications with certificates</p>
      </div>

      <div className="overflow-x-auto bg-white/85 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Project ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Account ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cycle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ACVA</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Credits Recommended</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Approved Certificate</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedVerifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">No approved verifications found.</td>
                </tr>
              ) : (
                approvedVerifications.map((verification) => (
                  <tr key={`${verification.projectId}-${verification.currentCycle}`} className="border-b border-gray-200 hover:bg-gray-50/70">
                    <td className="px-6 py-4 font-medium text-gray-900">{verification.projectId}</td>
                    <td className="px-6 py-4 text-gray-700">{verification.accountId}</td>
                    <td className="px-6 py-4 text-gray-700">Cycle {verification.currentCycle}</td>
                    <td className="px-6 py-4 text-gray-700">{verification.acvaId}</td>
                    <td className="px-6 py-4 text-gray-700">{verification.creditsRecommended.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {verification.approvedDocument ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="truncate">{verification.approvedDocument}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onReview(verification)}
                        className="inline-flex items-center px-4 py-2 bg-nee-600 text-white text-sm font-medium rounded-lg hover:scale-[1.02] transition-transform shadow-sm"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
