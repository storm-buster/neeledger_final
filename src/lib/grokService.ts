/**
 * Grok AI Service for PDF Document Comparison
 * Uses Groq/Grok model via backend proxy to analyze and compare two documents
 */

export interface GrokComparisonResult {
  summary: string;
  keyDifferences: string[];
  concerns: string[];
  recommendations: string[];
  overallAssessment: 'APPROVE' | 'REVIEW' | 'REJECT';
  confidence: number;
}

export class GrokService {
  // Use relative path for Vercel deployment, fallback to localhost for dev
  private getApiUrl(): string {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return ''; // Use relative path on production
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:4000';
  }

  /**
   * Compare two PDF documents using AI (via backend)
   */
  async comparePDFs(
    doc1Title: string,
    doc1Content: string,
    doc2Title: string,
    doc2Content: string
  ): Promise<GrokComparisonResult> {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/grok-compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doc1Title,
          doc1Content,
          doc2Title,
          doc2Content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }

      const result: GrokComparisonResult = await response.json();
      return result;
    } catch (error) {
      console.error('Error comparing PDFs:', error);
      throw error;
    }
  }

  /**
   * Quick validation comparison for validation stage
   */
  async compareValidationDocuments(
    pddContent: string,
    acvaReportContent: string
  ): Promise<GrokComparisonResult> {
    return this.comparePDFs(
      'Project Design Document (PDD)',
      pddContent,
      'ACVA Validation Report',
      acvaReportContent
    );
  }

  /**
   * Verification stage comparison
   */
  async compareVerificationDocuments(
    proponentClaimContent: string,
    acvaVerificationContent: string
  ): Promise<GrokComparisonResult> {
    return this.comparePDFs(
      'Proponent Claim Report',
      proponentClaimContent,
      'ACVA Verification Report',
      acvaVerificationContent
    );
  }
}

export const grokService = new GrokService();
