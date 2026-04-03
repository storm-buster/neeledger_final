import React from 'react';
import Modal from '../Common/Modal';
import MapPage from './MapPage';
import { Project } from '../../types';
import { useDocumentActions } from '../../hooks/useDocumentActions';
import { Eye, Upload } from 'lucide-react';

interface ProjectDetailsModalProps {
  project: Project;
  open: boolean;
  onClose: () => void;
}

export default function ProjectDetailsModal({ project, open, onClose }: ProjectDetailsModalProps) {
  const { uploadingDoc, handleViewDocument, handleUploadToIPFS } = useDocumentActions();

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Project Details - ${project.id}`} size="xl">
      <div className="flex flex-col gap-6 readable-surface">
        <div className="w-full h-auto min-h-[24rem] bg-white/85 dark:bg-gray-800/70 rounded-xl shadow-sm border border-gray-200/60 p-2">
          {/* Embed MapPage with project region centered */}
          <MapPage />
        </div>
        <div className="w-full overflow-visible max-h-full">
          <h3 className="text-lg font-semibold mb-2 break-words">Project Metadata</h3>
          <div className="text-sm text-gray-700 space-y-1 break-words">
            <div><strong>Project ID:</strong> {project.id}</div>
            <div><strong>Account ID:</strong> {project.accountId}</div>
            <div><strong>Country:</strong> {project.country}</div>
            <div><strong>Time of Registration:</strong> {project.startDate || 'N/A'}</div>
            <div><strong>Number of Cycles:</strong> {project.timeline.length || 'N/A'}</div>
            {/* Add more metadata fields as needed */}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 break-words">Description</h3>
        <p className="text-sm text-gray-700 break-words">{project.metadata.summary || project.metadata.ownership || project.metadata.methodology || 'No description available.'}</p>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 break-words">Timeline</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 max-h-[20rem] overflow-auto break-words">
          {project.timeline && project.timeline.length > 0 ? (
            project.timeline.map((event, idx) => (
              <li key={idx} className="break-words">
                <strong>{event.date}:</strong> {event.event}
              </li>
            ))
          ) : (
            <li>No timeline data available.</li>
          )}
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2 break-words">Documents</h3>
        <div className="space-y-2 max-h-[24rem] overflow-auto break-words">
          {project.metadata.documentation && project.metadata.documentation.length > 0 ? (
            project.metadata.documentation.map((doc, idx) => {
              const docName = `${project.id} • ${doc}`;
              return (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 rounded break-words">
                  <span className="text-sm text-blue-600 underline break-words">{doc}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleViewDocument(docName, doc)} 
                      className="inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all hover:scale-[1.03] bg-white text-gray-700 border border-gray-300"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button 
                      onClick={() => handleUploadToIPFS(docName, doc)} 
                      disabled={uploadingDoc === docName}
                      className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${uploadingDoc === docName ? 'opacity-50 cursor-wait' : 'hover:scale-[1.03]'} bg-indigo-100 text-indigo-700 border border-indigo-200`}
                    >
                      {uploadingDoc === docName ? (
                        <><div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div> Uploading...</>
                      ) : (
                        <><Upload className="w-3 h-3" /> IPFS</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 break-words">No documents available.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
