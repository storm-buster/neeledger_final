import { httpClient } from './client';
import { grokService } from '../lib/grokService';
import type { GrokComparisonResult } from '../lib/grokService';
import { isDemoModeAllowed, getStoredDemoPersona } from '../config/demo';

export interface BiomassPredictionInput {
  B2: number;
  B3: number;
  B4: number;
  B8: number;
  species: string;
}

export interface BiomassPredictionOutput {
  predicted_biomass: number;
  confidence: number;
  ndvi: number;
  evi: number;
  savi: number;
  feature_importance: Record<string, number>;
}

export interface XAIMockInput {
  codePhrase?: string;
  fileName?: string;
}

export interface XAIMockOutput {
  treeCount: number;
  canopyCover: number;
  co2Tonnes: number;
  uncertainty: number;
  liveness: {
    movementScore: number;
    lipSyncScore: number;
    livenessScore: number;
    authenticity: string;
  };
  decisionCategory: string;
}

export type { GrokComparisonResult };

export const aiApi = {
  /**
   * Compares two documents using the Grok/Groq backend proxy (/api/grok-compare)
   */
  compareDocuments: async (
    doc1Title: string,
    doc1Content: string,
    doc2Title: string,
    doc2Content: string
  ): Promise<GrokComparisonResult> => {
    try {
      return await grokService.comparePDFs(doc1Title, doc1Content, doc2Title, doc2Content);
    } catch (error) {
      if (isDemoModeAllowed() && getStoredDemoPersona()) {
        console.warn('[aiApi] AI comparison proxy offline. Using simulated report comparison for demo presentation.');
        return {
          summary: "Demonstration Audit: PDD methodology VM0007 aligns with field monitoring data with verified additionality and conservative baseline assumptions.",
          keyDifferences: [
            "Proponent claimed 1,250 tCO2e vs ACVA recommended release of 1,100 tCO2e",
            "10% buffer deduction (125 tCO2e) applied to community permanence reserve",
            "Minor canopy density variation in Q2 corrected by Sentinel-2 NDVI calibration"
          ],
          concerns: [
            "Tidal channel sedimentation requires continuous quarterly monitoring"
          ],
          recommendations: [
            "Approve credit issuance for Cycle 1",
            "Schedule mid-term ground truth sampling for Q4 2026"
          ],
          overallAssessment: "APPROVE",
          confidence: 0.92
        };
      }
      throw error;
    }
  },

  /**
   * Quick validation comparison for validation stage
   */
  compareValidationDocuments: async (
    pddContent: string,
    acvaReportContent: string
  ): Promise<GrokComparisonResult> => {
    return aiApi.compareDocuments('Project Design Document (PDD)', pddContent, 'ACVA Validation Report', acvaReportContent);
  },

  /**
   * Verification stage comparison
   */
  compareVerificationDocuments: async (
    proponentClaimContent: string,
    acvaVerificationContent: string
  ): Promise<GrokComparisonResult> => {
    return aiApi.compareDocuments('Proponent Credit Claim', proponentClaimContent, 'ACVA Verification Report', acvaVerificationContent);
  },

  /**
   * Biomass prediction via FastAPI microservice (/predict-biomass)
   * NOTE: In local development, defaults to http://localhost:8001 unless configured via proxy.
   */
  predictBiomass: async (input: BiomassInputPayload): Promise<BiomassPredictionOutput> => {
    try {
      const endpoint = import.meta.env.PROD
        ? '/api/predict-biomass'
        : (import.meta.env.VITE_BIOMASS_API_URL || 'http://localhost:8001/predict-biomass');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error(`Biomass API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (isDemoModeAllowed() && getStoredDemoPersona()) {
        console.warn('[aiApi] FastAPI microservice offline. Returning simulated biomass prediction for demo presentation.');
        return {
          predicted_biomass: 148.6,
          confidence: 94.2,
          ndvi: 0.78,
          evi: 0.52,
          savi: 0.46,
          feature_importance: {
            ndvi: 36.4,
            evi: 24.1,
            B8: 19.2,
            species_enc: 11.5,
            savi: 8.8
          }
        };
      }
      throw error;
    }
  },

  /**
   * Mock XAI liveness and carbon metric simulation (/api/xai)
   */
  evaluateXAIMock: async (payload: XAIMockInput): Promise<XAIMockOutput> => {
    try {
      return await httpClient.post<XAIMockOutput>('/api/xai', payload);
    } catch (error) {
      if (isDemoModeAllowed() && getStoredDemoPersona()) {
        console.warn('[aiApi] Backend proxy offline. Returning simulated XAI metrics for demo presentation.');
        return {
          treeCount: 1420,
          canopyCover: 78.4,
          co2Tonnes: 320.5,
          uncertainty: 3.2,
          liveness: {
            movementScore: 92,
            lipSyncScore: 89,
            livenessScore: 91,
            authenticity: 'Genuine'
          },
          decisionCategory: 'APPROVED'
        };
      }
      throw error;
    }
  }
};

type BiomassInputPayload = BiomassPredictionInput;
