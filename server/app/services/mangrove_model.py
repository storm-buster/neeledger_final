"""
Mangrove Verification Model Service
Spatial validation model to verify mangrove presence in images
"""

import numpy as np
import cv2
from PIL import Image
import pickle
from pathlib import Path
from typing import Dict, Optional
import logging
from app.utils.config import settings

logger = logging.getLogger(__name__)


class MangroveVerificationModel:
    """Mangrove verification model wrapper"""
    
    def __init__(self):
        self.model = None
        self.model_version = "v1.0.3"
        self.threshold = settings.MANGROVE_THRESHOLD
        self.initialized = False
    
    async def initialize(self):
        """Load model from disk"""
        try:
            model_path = Path(settings.MANGROVE_MODEL_PATH)
            
            if not model_path.exists():
                logger.warning(f"Model file not found at {model_path}, using mock model")
                self.model = None  # Will use mock predictions
            else:
                try:
                    with open(model_path, 'rb') as f:
                        try:
                            self.model = pickle.load(f)
                        except (TypeError, ValueError, UnicodeDecodeError):
                            # Try with latin1 encoding for compatibility
                            f.seek(0)
                            self.model = pickle.load(f, encoding='latin1')
                        except Exception:
                            # Try with bytes encoding for Python 3.11+
                            f.seek(0)
                            self.model = pickle.load(f, encoding='bytes')
                    logger.info(f"✅ Loaded mangrove verification model from {model_path}")
                except Exception as e:
                    logger.error(f"❌ Failed to load mangrove model: {e}")
                    logger.warning("Will use mock predictions instead")
                    self.model = None
            
            self.initialized = True
        except Exception as e:
            logger.error(f"❌ Failed to load mangrove model: {e}")
            self.model = None  # Fallback to mock
            self.initialized = True
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Preprocess image for model input"""
        try:
            # Load image
            img = cv2.imread(image_path)
            if img is None:
                # Try PIL if OpenCV fails
                img = np.array(Image.open(image_path))
                if len(img.shape) == 3 and img.shape[2] == 4:
                    img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
            
            # Resize to model input size (adjust based on your model)
            img_resized = cv2.resize(img, (224, 224))
            
            # Normalize
            img_normalized = img_resized.astype(np.float32) / 255.0
            
            # Extract features (NDVI, NDWI, etc.)
            if len(img_normalized.shape) == 3:
                # Convert to grayscale for feature extraction
                gray = cv2.cvtColor((img_normalized * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
            else:
                gray = (img_normalized * 255).astype(np.uint8)
            
            # Calculate vegetation indices (mock - replace with actual satellite bands)
            # In production, use actual multispectral bands
            ndvi = self._calculate_ndvi_mock(img_normalized)
            ndwi = self._calculate_ndwi_mock(img_normalized)
            
            # Combine features
            features = np.array([ndvi, ndwi])
            
            return features
        except Exception as e:
            logger.error(f"Error preprocessing image: {e}")
            raise
    
    def _calculate_ndvi_mock(self, img: np.ndarray) -> float:
        """Mock NDVI calculation (replace with actual multispectral data)"""
        # In production, use actual NIR and Red bands
        # NDVI = (NIR - Red) / (NIR + Red)
        return 0.6  # Mock value
    
    def _calculate_ndwi_mock(self, img: np.ndarray) -> float:
        """Mock NDWI calculation (replace with actual multispectral data)"""
        # In production, use actual Green and NIR bands
        # NDWI = (Green - NIR) / (Green + NIR)
        return 0.3  # Mock value
    
    async def predict(self, image_path: str) -> Dict:
        """
        Predict mangrove presence probability
        
        Args:
            image_path: Path to image file
            
        Returns:
            Dictionary with probability, model_version, confidence, and features
        """
        try:
            # Preprocess image
            features = self.preprocess_image(image_path)
            
            if self.model is None:
                # Mock prediction for development
                probability = 0.85 + np.random.normal(0, 0.1)
                probability = np.clip(probability, 0.0, 1.0)
                confidence = 0.9
            else:
                # Real model prediction
                features_reshaped = features.reshape(1, -1)
                probability = self.model.predict_proba(features_reshaped)[0][1]
                confidence = 0.95 if probability > self.threshold else 0.7
            
            result = {
                "probability": float(probability),
                "model_version": self.model_version,
                "confidence": float(confidence),
                "features": {
                    "ndvi": float(features[0]) if len(features) > 0 else None,
                    "ndwi": float(features[1]) if len(features) > 1 else None,
                }
            }
            
            logger.info(f"Mangrove verification: probability={probability:.3f}, threshold={self.threshold}")
            return result
            
        except Exception as e:
            logger.error(f"Error in mangrove prediction: {e}")
            raise


# Singleton instance
_mangrove_model: Optional[MangroveVerificationModel] = None


async def get_mangrove_model() -> MangroveVerificationModel:
    """Get singleton mangrove model instance"""
    global _mangrove_model
    if _mangrove_model is None:
        _mangrove_model = MangroveVerificationModel()
        await _mangrove_model.initialize()
    return _mangrove_model
