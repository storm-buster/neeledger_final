import { useState } from 'react';
import { formatDocumentAsHtml } from '../lib/documentHelpers';
import { generatePdfBlobFromHtml } from '../lib/pdfHelpers';
import { isDemoModeAllowed, getStoredDemoPersona } from '../config/demo';

// Global cache for IPFS CIDs to prevent duplicate uploads
const ipfsCache: Record<string, string> = {};

export function useDocumentActions() {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const handleViewDocument = (docName: string, content: string, url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!content) return;
    const htmlContent = formatDocumentAsHtml(docName, content);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer');
  };

  const handleUploadToIPFS = async (docName: string, content?: string, url?: string) => {
    if (!content && !url) return;

    // Check cache first (using content hash or docName as unique key)
    const cacheKey = content ? `content-${docName}-${content.length}` : `url-${url}`;
    if (ipfsCache[cacheKey]) {
      window.open(`https://gateway.pinata.cloud/ipfs/${ipfsCache[cacheKey]}`, '_blank', 'noopener,noreferrer');
      return;
    }

    // In local demo mode, simulate the pinning action without requiring a live Pinata JWT
    if (isDemoModeAllowed() && getStoredDemoPersona()) {
      try {
        setUploadingDoc(docName);
        await new Promise(r => setTimeout(r, 900));
        const demoCid = `QmDemo${Math.random().toString(36).substring(2, 8).toUpperCase()}SundarbansMRV`;
        ipfsCache[cacheKey] = demoCid;
        alert(`[Demo Mode Simulation]\n\nDocument: "${docName}"\nStatus: Pinning simulated successfully!\nSimulated IPFS CID: ${demoCid}\n\n(Live IPFS mutations are bypassed in demo mode).`);
      } finally {
        setUploadingDoc(null);
      }
      return;
    }

    try {
      setUploadingDoc(docName);
      let cid = '';

      if (url) {
        const { uploadFileToPinata } = await import('../lib/pinata');
        const response = await fetch(url);
        const blob = await response.blob();

        let type = blob.type;
        let ext = '';
        if (url.toLowerCase().endsWith('.pdf') || type === 'application/pdf') {
          type = 'application/pdf';
          ext = '.pdf';
        }

        const file = new File([blob], `${docName}${ext}`, { type });
        cid = await uploadFileToPinata(file);
      } else if (content) {
        const htmlContent = formatDocumentAsHtml(docName, content);

        // Convert HTML to PDF Blob for Pinata
        const pdfBlob = await generatePdfBlobFromHtml(htmlContent);
        const pdfFile = new File([pdfBlob], `${docName.replace(/\s+/g, '_')}.pdf`, { type: 'application/pdf' });

        const { uploadFileToPinata } = await import('../lib/pinata');
        cid = await uploadFileToPinata(pdfFile);
      }

      if (cid) {
        ipfsCache[cacheKey] = cid;
        window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, '_blank', 'noopener,noreferrer');
      } else {
        alert('Pinata JWT not configured. Please add VITE_PINATA_JWT to your .env file.');
      }
    } catch (error) {
      console.error('Failed to upload to IPFS:', error);
      alert('Failed to upload to IPFS. Check console for details.');
    } finally {
      setUploadingDoc(null);
    }
  };

  return { uploadingDoc, handleViewDocument, handleUploadToIPFS };
}
