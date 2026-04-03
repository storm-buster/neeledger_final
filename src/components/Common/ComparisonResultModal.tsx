import { X, AlertCircle, CheckCircle, AlertTriangle, Zap, Download } from 'lucide-react';
import { GrokComparisonResult } from '../../lib/grokService';
import jsPDF from 'jspdf';

interface ComparisonResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GrokComparisonResult | null;
  isLoading?: boolean;
  error?: string | null;
  doc1Title?: string;
  doc2Title?: string;
}

export function ComparisonResultModal({
  isOpen,
  onClose,
  result,
  isLoading = false,
  error = null,
  doc1Title = 'Document 1',
  doc2Title = 'Document 2'
}: ComparisonResultModalProps) {
  if (!isOpen) return null;

  const generatePDF = () => {
    if (!result) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setTextColor(color[0], color[1], color[2]);
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, margin, y);
        y += fontSize * 0.5;
      });
      y += 3;
    };

    // Title
    pdf.setFillColor(79, 70, 229);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Document Comparison Report', margin, 25);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, 35);
    y = 55;

    // Overall Assessment
    const assessmentColors: Record<string, [number, number, number]> = {
      'APPROVE': [34, 197, 94],
      'REVIEW': [234, 179, 8],
      'REJECT': [239, 68, 68]
    };
    const assessmentColor = assessmentColors[result.overallAssessment] || [128, 128, 128];
    
    pdf.setFillColor(assessmentColor[0], assessmentColor[1], assessmentColor[2]);
    pdf.roundedRect(margin, y - 5, maxWidth, 25, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const assessmentText = result.overallAssessment === 'APPROVE' ? 'RECOMMENDED FOR APPROVAL' :
                          result.overallAssessment === 'REVIEW' ? 'REQUIRES FURTHER REVIEW' :
                          'RECOMMENDED FOR REJECTION';
    pdf.text(assessmentText, margin + 5, y + 8);
    pdf.setFontSize(11);
    pdf.text(`Confidence: ${Math.round(result.confidence * 100)}%`, margin + 5, y + 16);
    y += 35;

    // Documents Compared
    addText('Documents Compared:', 12, true, [55, 65, 81]);
    addText(`• ${doc1Title}`, 10, false, [75, 85, 99]);
    addText(`• ${doc2Title}`, 10, false, [75, 85, 99]);
    y += 5;

    // Summary
    addText('Summary', 14, true, [30, 64, 175]);
    addText(result.summary, 10, false, [55, 65, 81]);
    y += 5;

    // Key Differences
    if (result.keyDifferences.length > 0) {
      addText('Key Differences', 14, true, [30, 64, 175]);
      result.keyDifferences.forEach((diff, idx) => {
        addText(`${idx + 1}. ${diff}`, 10, false, [55, 65, 81]);
      });
      y += 5;
    }

    // Concerns
    if (result.concerns.length > 0) {
      addText('Concerns & Red Flags', 14, true, [180, 83, 9]);
      result.concerns.forEach((concern, idx) => {
        addText(`⚠ ${concern}`, 10, false, [146, 64, 14]);
      });
      y += 5;
    }

    // Recommendations
    if (result.recommendations.length > 0) {
      addText('Recommendations', 14, true, [22, 163, 74]);
      result.recommendations.forEach((rec, idx) => {
        addText(`✓ ${rec}`, 10, false, [21, 128, 61]);
      });
    }

    // Footer
    const pageCount = pdf.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`NeeLedger AI Comparison Report | Page ${i} of ${pageCount}`, margin, 290);
    }

    // Save PDF
    const fileName = `comparison_report_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
  };

  const getAssessmentColor = (assessment: string) => {
    switch (assessment) {
      case 'APPROVE':
        return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
      case 'REVIEW':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
      case 'REJECT':
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600';
    }
  };

  const getAssessmentIcon = (assessment: string) => {
    switch (assessment) {
      case 'APPROVE':
        return <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />;
      case 'REVIEW':
        return <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
      case 'REJECT':
        return <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />;
      default:
        return <Zap className="w-6 h-6 text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'fadeInUp 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-white dark:from-gray-800 dark:to-gray-750 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Document Comparison</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Powered by Grok AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">Analyzing documents with Grok AI...</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This may take a moment</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300">Comparison Failed</h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                    Make sure your Grok API key is configured and valid in the .env file.
                  </p>
                </div>
              </div>
            </div>
          ) : result ? (
            <>
              {/* Overall Assessment */}
              <div className={`rounded-lg border-2 p-4 ${getAssessmentColor(result.overallAssessment)}`}>
                <div className="flex items-center gap-3 mb-2">
                  {getAssessmentIcon(result.overallAssessment)}
                  <h3 className="text-lg font-bold">
                    {result.overallAssessment === 'APPROVE' && 'Recommended for Approval'}
                    {result.overallAssessment === 'REVIEW' && 'Requires Further Review'}
                    {result.overallAssessment === 'REJECT' && 'Recommended for Rejection'}
                  </h3>
                </div>
                <div className="flex items-center gap-2 ml-9">
                  <span className="text-sm font-semibold">Confidence: </span>
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        result.confidence >= 0.8 ? 'bg-green-500' :
                        result.confidence >= 0.6 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{Math.round(result.confidence * 100)}%</span>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Summary</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{result.summary}</p>
              </div>

              {/* Key Differences */}
              {result.keyDifferences.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <span className="text-lg">📊</span> Key Differences
                  </h3>
                  <ul className="space-y-2">
                    {result.keyDifferences.map((diff, idx) => (
                      <li key={idx} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold flex-shrink-0 text-sm">{idx + 1}.</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{diff}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Concerns */}
              {result.concerns.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <span className="text-lg">⚠️</span> Concerns & Red Flags
                  </h3>
                  <div className="space-y-2">
                    {result.concerns.map((concern, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-amber-800 dark:text-amber-200">{concern}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <span className="text-lg">✨</span> Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-green-800 dark:text-green-200">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Document Reference */}
              <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-2">Compared Documents:</p>
                <div className="flex gap-4">
                  <span>📄 {doc1Title}</span>
                  <span>vs</span>
                  <span>📄 {doc2Title}</span>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 sticky bottom-0">
          {result && !isLoading && !error && (
            <button
              onClick={generatePDF}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF Report
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(16px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
