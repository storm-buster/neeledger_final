"""
Biomass Regression Model Service
Estimates biomass from satellite imagery features
"""

import numpy as np
import pandas as pd
import xgboost as xgb
from pathlib import Path
from typing import Dict, Optional
import logging
from app.utils.config import settings
import pickle
from sklearn.preprocessing import LabelEncoder

logger = logging.getLogger(__name__)


class BiomassRegressionModel:
    """Biomass regression model wrapper"""
    
    def __init__(self):
        self.booster = None
        self.species_encoder = None
        self.training_medians = None
        self.model_version = "v2.1.0"
        self.initialized = False
    
    async def initialize(self):
        """Load model from disk"""
        try:
            models_dir = Path(settings.MODELS_DIR)
            booster_path = models_dir / "xgb_biomass_booster.json"
            
            if booster_path.exists():
                try:
                    self.booster = xgb.Booster()
                    self.booster.load_model(str(booster_path))
                    logger.info(f"✅ Loaded biomass model from {booster_path}")
                except Exception as e:
                    logger.error(f"❌ Failed to load XGBoost model: {e}")
                    logger.warning("Will use mock predictions instead")
                    self.booster = None
            else:
                logger.warning(f"Biomass model not found at {booster_path}, using mock predictions")
                self.booster = None
            
            # Load species encoder (handle pickle compatibility)
            encoder_path = models_dir / "species_encoder.pkl"
            if encoder_path.exists():
                try:
                    with open(encoder_path, 'rb') as f:
                        try:
                            self.species_encoder = pickle.load(f)
                        except (TypeError, ValueError, UnicodeDecodeError):
                            # Try with latin1 encoding for Python 2/3 compatibility
                            f.seek(0)
                            self.species_encoder = pickle.load(f, encoding='latin1')
                        except Exception:
                            # Try with bytes encoding for Python 3.11+
                            f.seek(0)
                            self.species_encoder = pickle.load(f, encoding='bytes')
                    logger.info(f"✅ Loaded species encoder from {encoder_path}")
                except Exception as e:
                    logger.warning(f"⚠ Could not load species encoder (will use default encoding): {e}")
                    # Create a simple fallback encoder
                    self.species_encoder = LabelEncoder()
                    self.species_encoder.classes_ = np.array(['Mangrove', 'Seagrass', 'Coral', 'Other'])
                    logger.info("✅ Created fallback species encoder")
            else:
                # Create default encoder
                self.species_encoder = LabelEncoder()
                self.species_encoder.classes_ = np.array(['Mangrove', 'Seagrass', 'Coral', 'Other'])
                logger.info("✅ Created default species encoder")
            
            # Load training medians
            medians_path = models_dir / "training_medians.pkl"
            if medians_path.exists():
                try:
                    with open(medians_path, 'rb') as f:
                        try:
                            self.training_medians = pickle.load(f)
                        except (TypeError, ValueError, UnicodeDecodeError):
                            # Try with latin1 encoding
                            f.seek(0)
                            self.training_medians = pickle.load(f, encoding='latin1')
                        except Exception:
                            # Try with bytes encoding
                            f.seek(0)
                            self.training_medians = pickle.load(f, encoding='bytes')
                    logger.info(f"✅ Loaded training medians from {medians_path}")
                except Exception as e:
                    logger.warning(f"⚠ Could not load training medians (will use defaults): {e}")
                    self.training_medians = {
                        'B2': 0.05, 'B3': 0.06, 'B4': 0.04, 'B8': 0.3,
                        'NDVI': 0.5, 'EVI': 0.4, 'SAVI': 0.45, 'NDWI': 0.2,
                        'species_encoded': 0
                    }
            else:
                self.training_medians = {
                    'B2': 0.05, 'B3': 0.06, 'B4': 0.04, 'B8': 0.3,
                    'NDVI': 0.5, 'EVI': 0.4, 'SAVI': 0.45, 'NDWI': 0.2,
                    'species_encoded': 0
                }
                logger.info("✅ Created default training medians")
            
            self.initialized = True
        except Exception as e:
            logger.error(f"❌ Failed to load biomass model: {e}")
            self.booster = None
            self.initialized = True
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer features for biomass prediction"""
        # Calculate vegetation indices
        df['NDVI'] = (df['B8'] - df['B4']) / (df['B8'] + df['B4'] + 1e-10)
        df['EVI'] = 2.5 * (df['B8'] - df['B4']) / (df['B8'] + 6 * df['B4'] - 7.5 * df['B2'] + 1)
        df['SAVI'] = ((df['B8'] - df['B4']) / (df['B8'] + df['B4'] + 0.5)) * 1.5
        df['NDWI'] = (df['B3'] - df['B8']) / (df['B3'] + df['B8'] + 1e-10)
        
        # Encode species
        if 'species' in df.columns and self.species_encoder:
            df['species_encoded'] = self.species_encoder.transform(df['species'])
        else:
            df['species_encoded'] = 0
        
        # Fill missing values with training medians
        if self.training_medians:
            for col in df.columns:
                if col in self.training_medians and df[col].isna().any():
                    df[col].fillna(self.training_medians[col], inplace=True)
        
        return df
    
    async def predict(
        self,
        B2: float,
        B3: float,
        B4: float,
        B8: float,
        species: str = "Mangrove"
    ) -> Dict:
        """
        Predict biomass from satellite band values
        
        Args:
            B2: Blue band reflectance
            B3: Green band reflectance
            B4: Red band reflectance
            B8: NIR band reflectance
            species: Species name
            
        Returns:
            Dictionary with biomass estimate, bounds, confidence, and features
        """
        try:
            # Create input dataframe
            input_data = pd.DataFrame({
                'B2': [B2],
                'B3': [B3],
                'B4': [B4],
                'B8': [B8],
                'species': [species]
            })
            
            # Engineer features
            features_df = self.engineer_features(input_data.copy())
            
            if self.booster is None:
                # Mock prediction
                ndvi = features_df['NDVI'].iloc[0]
                biomass = 10.0 + ndvi * 20.0 + np.random.normal(0, 2.0)
                biomass = max(0.0, biomass)
                lower_bound = biomass * 0.8
                upper_bound = biomass * 1.2
                confidence_interval = 0.15
            else:
                # Prepare features for XGBoost
                feature_cols = ['B2', 'B3', 'B4', 'B8', 'NDVI', 'EVI', 'SAVI', 'NDWI', 'species_encoded']
                X = features_df[feature_cols].values
                
                # Predict
                dmatrix = xgb.DMatrix(X)
                biomass = float(self.booster.predict(dmatrix)[0])
                
                # Calculate confidence bounds (using quantile regression or prediction intervals)
                # For now, use a simple percentage-based approach
                std_dev = biomass * 0.1  # 10% standard deviation
                lower_bound = max(0.0, biomass - 1.96 * std_dev)  # 95% CI
                upper_bound = biomass + 1.96 * std_dev
                confidence_interval = 0.1
            
            result = {
                "biomass": float(biomass),
                "lower_bound": float(lower_bound),
                "upper_bound": float(upper_bound),
                "model_version": self.model_version,
                "confidence_interval": float(confidence_interval),
                "features": {
                    "ndvi": float(features_df['NDVI'].iloc[0]),
                    "evi": float(features_df['EVI'].iloc[0]),
                    "savi": float(features_df['SAVI'].iloc[0]),
                    "ndwi": float(features_df['NDWI'].iloc[0]),
                }
            }
            
            logger.info(f"Biomass prediction: {biomass:.2f} tonnes/ha (CI: {lower_bound:.2f}-{upper_bound:.2f})")
            return result
            
        except Exception as e:
            logger.error(f"Error in biomass prediction: {e}")
            raise


# Singleton instance
_biomass_model: Optional[BiomassRegressionModel] = None


async def get_biomass_model() -> BiomassRegressionModel:
    """Get singleton biomass model instance"""
    global _biomass_model
    if _biomass_model is None:
        _biomass_model = BiomassRegressionModel()
        await _biomass_model.initialize()
    return _biomass_model
