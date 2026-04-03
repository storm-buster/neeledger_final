import React, { useState, useEffect } from 'react';
import { Eye, Layers, Target, AlertTriangle, CheckCircle, Info, ZoomIn, Download } from 'lucide-react';

interface GradCAMVisualizationProps {
  originalImage?: string;
  heatmapImage?: string;
  overlayImage?: string;
  ndviImage?: string;
  predictionMask?: string;
  alignmentScore?: number;
  analysisMetrics?: {
    vegetationFocus: number;
    waterFocus: number;
    otherFocus: number;
    spatialCoherence: number;
  };
  isLoading?: boolean;
  onGenerateReport?: () => void;
}

export default function GradCAMVisualization({
  originalImage,
  heatmapImage,
  overlayImage,
  ndviImage,
  predictionMask,
  alignmentScore = 0.78,
  analysisMetrics,
  isLoading = false,
  onGenerateReport
}: GradCAMVisualizationProps) {
  const [activeView, setActiveView] = useState<'original' | 'heatmap' | 'overlay' | 'ndvi' | 'prediction'>('overlay');
  const [showLightbox, setShowLightbox] = useState(false);
  const [opacity, setOpacity] = useState(0.6);

  // Use real Grad-CAM images from neeledger_demo (converted to PNG)
  const demoOriginal = '/satellite/gradcam_rgb.png';
  const demoHeatmap = '/satellite/gradcam_heatmap.png';
  const demoOverlay = '/satellite/gradcam_overlay.png';
  const demoNdvi = '/satellite/gradcam_ndvi.png';
  const demoPrediction = '/satellite/gradcam_prediction.png';

  const images = {
    original: originalImage || demoOriginal,
    heatmap: heatmapImage || demoHeatmap,
    overlay: overlayImage || demoOverlay,
    ndvi: ndviImage || demoNdvi,
    prediction: predictionMask || demoPrediction
  };

  const defaultMetrics = analysisMetrics || {
    vegetationFocus: 82.4,
    waterFocus: 8.2,
    otherFocus: 9.4,
    spatialCoherence: 0.87
  };

  const getAlignmentStatus = (score: number) => {
    if (score >= 0.7) return { status: 'Good', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle };
    if (score >= 0.5) return { status: 'Moderate', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: AlertTriangle };
    return { status: 'Poor', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: AlertTriangle };
  };

  const alignmentStatus = getAlignmentStatus(alignmentScore);
  const AlignmentIcon = alignmentStatus.icon;

  const viewTabs = [
    { id: 'original', label: 'Original', icon: Eye },
    { id: 'heatmap', label: 'Grad-CAM', icon: Layers },
    { id: 'overlay', label: 'Overlay', icon: Target },
    { id: 'ndvi', label: 'NDVI', icon: Layers },
    { id: 'prediction', label: 'Prediction', icon: Target },
  ];

  if (isLoading) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/70 rounded-xl shadow-md border border-gray-200/60 dark:border-gray-700/60 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-nee-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">Generating Grad-CAM Heatmap...</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Analyzing spatial attention patterns</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-gray-800/70 rounded-xl shadow-md border border-gray-200/60 dark:border-gray-700/60 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Grad-CAM Explainability</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Visual explanation of model spatial attention</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${alignmentStatus.bg}`}>
            <AlignmentIcon className={`w-4 h-4 ${alignmentStatus.color}`} />
            <span className={`text-sm font-semibold ${alignmentStatus.color}`}>
              Alignment: {(alignmentScore * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="px-6 py-3 border-b border-gray-200/60 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2 flex-wrap">
          {viewTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeView === tab.id
                    ? 'bg-nee-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Visualization */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Display */}
          <div className="lg:col-span-2">
            <div 
              className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer group"
              onClick={() => setShowLightbox(true)}
            >
              <img 
                src={images[activeView]} 
                alt={`${activeView} view`}
                className="w-full h-[350px] object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYyOTM3Ii8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R3JhZC1DQU0gVmlzdWFsaXphdGlvbjwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjU1JSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNmI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IZWF0bWFwIE92ZXJsYXk8L3RleHQ+PC9zdmc+';
                }}
              />
              
              {/* Overlay controls */}
              {activeView === 'overlay' && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-white text-xs font-medium">Opacity:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={opacity * 100}
                      onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                      className="flex-1 h-1.5 bg-gray-600 rounded-full appearance-none cursor-pointer"
                    />
                    <span className="text-white text-xs w-10">{Math.round(opacity * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Zoom hint */}
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5" /> Click to enlarge
                </span>
              </div>
            </div>

            {/* Color Legend */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Heatmap Color Scale
              </h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-4 rounded-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500"></div>
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                <span>Low attention (0.0)</span>
                <span>Medium (0.5)</span>
                <span>High attention (1.0)</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                <strong>Red/Yellow regions:</strong> Strong model focus — primary decision drivers<br/>
                <strong>Blue regions:</strong> Weak or negligible influence on prediction
              </p>
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-4">
            {/* Alignment Score */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">NDVI Alignment Score</h4>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-2xl font-bold ${alignmentStatus.color}`}>
                  {(alignmentScore * 100).toFixed(1)}%
                </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${alignmentStatus.bg} ${alignmentStatus.color}`}>
                  {alignmentStatus.status}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    alignmentScore >= 0.7 ? 'bg-green-500' : alignmentScore >= 0.5 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${alignmentScore * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                IoU between Grad-CAM hotspots and NDVI vegetation mask
              </p>
            </div>

            {/* Attention Distribution */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Attention Distribution</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Vegetation Regions</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{defaultMetrics.vegetationFocus}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${defaultMetrics.vegetationFocus}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Water Bodies</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{defaultMetrics.waterFocus}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${defaultMetrics.waterFocus}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Other Areas</span>
                    <span className="font-semibold text-gray-600 dark:text-gray-400">{defaultMetrics.otherFocus}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${defaultMetrics.otherFocus}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spatial Coherence */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Spatial Coherence</h4>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-nee-600 dark:text-nee-400">
                  {(defaultMetrics.spatialCoherence * 100).toFixed(0)}%
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Model activations are spatially consistent
                  </p>
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <div className={`rounded-lg border p-4 ${
              alignmentScore >= 0.7 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : alignmentScore >= 0.5
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
                <AlignmentIcon className={`w-4 h-4 ${alignmentStatus.color}`} />
                Interpretation
              </h4>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {alignmentScore >= 0.7 ? (
                  <>Model is correctly focusing on vegetation/mangrove regions. The Grad-CAM heatmap aligns well with NDVI ground truth, indicating reliable spatial reasoning.</>
                ) : alignmentScore >= 0.5 ? (
                  <>Model shows moderate alignment with vegetation regions. Some attention on non-vegetation areas detected. Recommend manual ACVA review before approval.</>
                ) : (
                  <>⚠️ Model attention poorly aligns with vegetation. High focus on water or random areas detected. This prediction may be unreliable. Field audit recommended.</>
                )}
              </p>
            </div>

            {/* Generate Report Button */}
            {onGenerateReport && (
              <button
                onClick={onGenerateReport}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-nee-600 hover:bg-nee-700 text-white font-medium rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download XAI Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setShowLightbox(false)}
        >
          <div className="relative max-w-5xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowLightbox(false)} 
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
            <img 
              src={images[activeView]} 
              alt={`${activeView} view - enlarged`}
              className="w-full rounded-xl shadow-2xl"
            />
            <p className="text-center text-white/90 text-sm font-medium mt-3">
              {activeView === 'original' && 'Original Satellite RGB Image'}
              {activeView === 'heatmap' && 'Grad-CAM Heatmap (Raw)'}
              {activeView === 'overlay' && 'Grad-CAM Overlay on Original'}
              {activeView === 'ndvi' && 'NDVI Vegetation Index (Ground Truth)'}
              {activeView === 'prediction' && 'Model Prediction Mask'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
