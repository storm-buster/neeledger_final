import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiAnalysisResult {
  analysis: string;
  confidence: number;
  recommendations: string[];
  riskFactors: string[];
  carbonEstimate: number;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async analyzeMonitoringReport(pdfText: string, satelliteData: any): Promise<GeminiAnalysisResult> {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
    You are an expert carbon verification analyst. Analyze this monitoring report data and satellite imagery to provide a comprehensive assessment.

    Report Data:
    ${pdfText}

    Satellite Analysis:
    - NDVI: ${satelliteData.ndvi}
    - EVI: ${satelliteData.evi}
    - SAVI: ${satelliteData.savi}
    - Spectral Bands: B2=${satelliteData.B2}, B3=${satelliteData.B3}, B4=${satelliteData.B4}, B8=${satelliteData.B8}
    - Species: ${satelliteData.species}

    Provide analysis in the following JSON format:
    {
      "analysis": "Detailed analysis of the carbon removal claim",
      "confidence": 0.95,
      "recommendations": ["List of recommendations"],
      "riskFactors": ["List of potential risk factors"],
      "carbonEstimate": 1200
    }

    Focus on:
    1. Accuracy of carbon removal claims
    2. Satellite data consistency
    3. Methodology quality
    4. Risk assessment
    5. Confidence level (0-1)
    6. Your own carbon estimate based on the data
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Could not parse Gemini response');
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  async combineAnalysis(xaiResult: any, geminiResult: GeminiAnalysisResult): Promise<any> {
    // Weighted combination of both models
    const xaiWeight = 0.6; // Give more weight to trained XAI model
    const geminiWeight = 0.4;

    const combinedConfidence = (xaiResult.confidence * xaiWeight) + (geminiResult.confidence * 100 * geminiWeight);
    
    // Average the predictions
    const combinedCarbonEstimate = Math.round(
      (xaiResult.predicted * xaiWeight) + (geminiResult.carbonEstimate * geminiWeight)
    );

    // Enhanced feature importance combining both analyses
    const enhancedFeatureImportance = {
      ...xaiResult.featureImportance,
      'AI Analysis': Math.round(geminiWeight * 100),
      'Risk Assessment': Math.round(geminiResult.riskFactors.length * 10),
    };

    return {
      claimed: xaiResult.claimed,
      predicted: combinedCarbonEstimate,
      confidence: Math.round(combinedConfidence),
      featureImportance: enhancedFeatureImportance,
      geminiInsights: {
        analysis: geminiResult.analysis,
        recommendations: geminiResult.recommendations,
        riskFactors: geminiResult.riskFactors
      },
      modelCombination: {
        xaiWeight: Math.round(xaiWeight * 100),
        geminiWeight: Math.round(geminiWeight * 100),
        combined: true
      }
    };
  }
}

export const geminiService = new GeminiService();
