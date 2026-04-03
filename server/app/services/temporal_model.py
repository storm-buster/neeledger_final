"""
Temporal Change Detection Model Service
Detects growth and changes between time-series images
"""

import numpy as np
import cv2
from PIL import Image
from pathlib import Path
from typing import Dict, Optional, Tuple
import logging
from app.utils.config import settings

logger = logging.getLogger(__name__)


class TemporalChangeDetectionModel:
    """Temporal change detection model wrapper"""
    
    def __init__(self):
        self.model = None
        self.model_version = "v1.2.0"
        self.growth_threshold = settings.TEMPORAL_GROWTH_THRESHOLD
        self.initialized = False
    
    async def initialize(self):
        """Load model from disk"""
        try:
            model_path = Path(settings.TEMPORAL_MODEL_PATH)
            
            if not model_path.exists():
                logger.warning(f"Temporal model not found at {model_path}, using image comparison")
                self.model = None
            else:
                # Load model (could be a CNN, Siamese network, etc.)
                # For now, using image comparison
                self.model = None
                logger.info(f"✅ Temporal change detection ready (using image comparison)")
            
            self.initialized = True
        except Exception as e:
            logger.error(f"❌ Failed to load temporal model: {e}")
            self.model = None
            self.initialized = True
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Preprocess image for comparison"""
        try:
            img = cv2.imread(image_path)
            if img is None:
                img = np.array(Image.open(image_path))
                if len(img.shape) == 3 and img.shape[2] == 4:
                    img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
            
            # Resize to standard size
            img_resized = cv2.resize(img, (512, 512))
            
            # Convert to grayscale for comparison
            if len(img_resized.shape) == 3:
                gray = cv2.cvtColor(img_resized, cv2.COLOR_RGB2GRAY)
            else:
                gray = img_resized
            
            return gray
        except Exception as e:
            logger.error(f"Error preprocessing image: {e}")
            raise
    
    def calculate_vegetation_metrics(self, image: np.ndarray) -> Dict:
        """Calculate vegetation metrics from image"""
        # Calculate basic statistics
        mean_intensity = np.mean(image)
        std_intensity = np.std(image)
        
        # Threshold for vegetation (adjust based on your data)
        vegetation_mask = image > mean_intensity * 0.7
        
        # Calculate vegetation percentage
        vegetation_percentage = np.sum(vegetation_mask) / vegetation_mask.size
        
        # Calculate texture features (simplified)
        # In production, use more sophisticated feature extraction
        edges = cv2.Canny(image, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        return {
            "mean_intensity": float(mean_intensity),
            "std_intensity": float(std_intensity),
            "vegetation_percentage": float(vegetation_percentage),
            "edge_density": float(edge_density)
        }
    
    async def compare(
        self,
        previous_image_path: str,
        current_image_path: str
    ) -> Dict:
        """
        Compare two images and detect growth/changes
        
        Args:
            previous_image_path: Path to previous image
            current_image_path: Path to current image
            
        Returns:
            Dictionary with growth_detected, growth_score, change_percentage, and metrics
        """
        try:
            # Preprocess both images
            prev_img = self.preprocess_image(previous_image_path)
            curr_img = self.preprocess_image(current_image_path)
            
            # Calculate metrics for both images
            prev_metrics = self.calculate_vegetation_metrics(prev_img)
            curr_metrics = self.calculate_vegetation_metrics(curr_img)
            
            # Calculate change metrics
            vegetation_change = curr_metrics["vegetation_percentage"] - prev_metrics["vegetation_percentage"]
            intensity_change = curr_metrics["mean_intensity"] - prev_metrics["mean_intensity"]
            
            # Calculate structural similarity (SSIM)
            try:
                from skimage.metrics import structural_similarity as ssim
                similarity = ssim(prev_img, curr_img)
            except ImportError:
                # Fallback to simple correlation if skimage not available
                import numpy as np
                prev_flat = prev_img.flatten().astype(np.float32)
                curr_flat = curr_img.flatten().astype(np.float32)
                correlation = np.corrcoef(prev_flat, curr_flat)[0, 1]
                similarity = max(0.0, min(1.0, correlation))
            
            # Calculate growth score (normalized between -1 and 1)
            # Positive = growth, Negative = degradation
            growth_score = (
                vegetation_change * 0.5 +
                (intensity_change / 255.0) * 0.3 +
                (1 - similarity) * 0.2
            )
            
            # Normalize to [-1, 1]
            growth_score = np.clip(growth_score, -1.0, 1.0)
            
            # Determine if growth is detected
            growth_detected = growth_score > self.growth_threshold
            
            # Calculate change percentage
            change_percentage = abs(vegetation_change) * 100
            
            result = {
                "growth_detected": bool(growth_detected),
                "growth_score": float(growth_score),
                "change_percentage": float(change_percentage),
                "model_version": self.model_version,
                "comparison_metrics": {
                    "similarity": float(similarity),
                    "vegetation_change": float(vegetation_change),
                    "intensity_change": float(intensity_change),
                    "previous_metrics": prev_metrics,
                    "current_metrics": curr_metrics
                }
            }
            
            logger.info(f"Temporal comparison: growth_detected={growth_detected}, score={growth_score:.3f}")
            return result
            
        except Exception as e:
            logger.error(f"Error in temporal comparison: {e}")
            raise


# Singleton instance
_temporal_model: Optional[TemporalChangeDetectionModel] = None


async def get_temporal_model() -> TemporalChangeDetectionModel:
    """Get singleton temporal model instance"""
    global _temporal_model
    if _temporal_model is None:
        _temporal_model = TemporalChangeDetectionModel()
        await _temporal_model.initialize()
    return _temporal_model
