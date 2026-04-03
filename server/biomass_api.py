"""
FastAPI server for XGBoost biomass prediction with SHAP explanations.
Integrates with blueledger XAI page for carbon monitoring report verification.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import xgboost as xgb
import pickle
import json
from pathlib import Path
import shap
from sklearn.preprocessing import LabelEncoder
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
from contextlib import asynccontextmanager

# Global model artifacts
booster = None
species_encoder = None
training_medians = None
explainer = None

MODELS_DIR = Path(__file__).parent / "models"

class BiomassInput(BaseModel):
    """Input schema for biomass prediction"""
    B2: float  # Blue band
    B3: float  # Green band
    B4: float  # Red band
    B8: float  # NIR band
    species: str  # Species name

class BiomassOutput(BaseModel):
    """Output schema for biomass prediction"""
    predicted_biomass: float
    confidence: float
    ndvi: float
    evi: float
    savi: float
    feature_importance: Dict[str, float]

def load_artifacts():
    """Load model artifacts from disk"""
    global booster, species_encoder, training_medians, explainer
    
    try:
        # Load XGBoost booster
        booster_path = MODELS_DIR / "xgb_biomass_booster.json"
        booster = xgb.Booster()
        booster.load_model(str(booster_path))
        print(f"✓ Loaded booster from {booster_path}")
        
        # Load species encoder (optional - handle pickle compatibility issues)
        encoder_path = MODELS_DIR / "species_encoder.pkl"
        try:
            with open(encoder_path, 'rb') as f:
                species_encoder = pickle.load(f)
            print(f"✓ Loaded species encoder from {encoder_path}")
        except Exception as e:
            print(f"⚠ Could not load species encoder (will use default encoding): {e}")
            # Create a simple fallback encoder
            from sklearn.preprocessing import LabelEncoder
            species_encoder = LabelEncoder()
            species_encoder.classes_ = np.array(['Mangrove', 'Seagrass', 'Coral', 'Other'])
            print("✓ Created fallback species encoder")
        
        # Load training medians (optional)
        medians_path = MODELS_DIR / "training_medians.pkl"
        try:
            with open(medians_path, 'rb') as f:
                training_medians = pickle.load(f)
            print(f"✓ Loaded training medians from {medians_path}")
        except Exception as e:
            print(f"⚠ Could not load training medians (will use defaults): {e}")
            # Create default medians
            training_medians = {
                'B2': 0.05, 'B3': 0.06, 'B4': 0.04, 'B8': 0.3,
                'NDVI': 0.5, 'EVI': 0.4, 'SAVI': 0.45, 'NDWI': 0.2,
                'species_encoded': 0
            }
            print("✓ Created default training medians")
        
        # Create SHAP explainer
        explainer = shap.TreeExplainer(booster)
        print("✓ Created SHAP explainer")
        
    except Exception as e:
        print(f"✗ Error loading artifacts: {e}")
        raise

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Apply feature engineering to match model's expected features"""
    df = df.copy()
    
    # Calculate indices (lowercase to match model)
    if 'B8' in df.columns and 'B4' in df.columns:
        df['ndvi'] = (df['B8'] - df['B4']) / (df['B8'] + df['B4'] + 1e-8)
    
    if 'B3' in df.columns and 'B8' in df.columns:
        df['gndvi'] = (df['B8'] - df['B3']) / (df['B8'] + df['B3'] + 1e-8)
        df['ndwi'] = (df['B3'] - df['B8']) / (df['B3'] + df['B8'] + 1e-8)
    
    if 'B8' in df.columns and 'B11' in df.columns:
        df['ndbi'] = (df['B11'] - df['B8']) / (df['B11'] + df['B8'] + 1e-8)
    
    # Add missing Sentinel-2 bands with default values
    for band in ['B1', 'B5', 'B6', 'B7', 'B8A', 'B9', 'B11', 'B12']:
        if band not in df.columns:
            df[band] = 0.05  # Default reflectance value
    
    # Add SAR features with default values
    if 'VV' not in df.columns:
        df['VV'] = -15.0
    if 'VH' not in df.columns:
        df['VH'] = -22.0
    if 'vv_vh_ratio' not in df.columns:
        df['vv_vh_ratio'] = df['VV'] / (df['VH'] + 1e-8)
    if 'vv_vh_diff' not in df.columns:
        df['vv_vh_diff'] = df['VV'] - df['VH']
    
    # Add geographic features with default values
    if 'longitude' not in df.columns:
        df['longitude'] = 0.0
    if 'latitude' not in df.columns:
        df['latitude'] = 0.0
    
    # Add biomass features with default values (these will be predicted)
    for col in ['agb', 'bgb', 'cagb', 'cbgb', 'soil_carbon_stock', 'total_carbon_stock']:
        if col not in df.columns:
            df[col] = 0.0
    
    return df

def encode_species(df: pd.DataFrame) -> pd.DataFrame:
    """Encode species column robustly (model expects 'species_enc')"""
    df = df.copy()
    
    if 'species' not in df.columns:
        df['species_enc'] = 0
        return df
    
    # If already numeric, assume encoded
    if pd.api.types.is_numeric_dtype(df['species']):
        df['species_enc'] = df['species'].astype(int)
    else:
        # String species - use encoder
        try:
            df['species_enc'] = species_encoder.transform(df['species'])
        except:
            # Unknown species - use default
            df['species_enc'] = 0
    
    return df

def fill_missing(df: pd.DataFrame) -> pd.DataFrame:
    """Fill NaN/inf with training medians"""
    df = df.copy()
    
    # Replace inf with NaN
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    
    # Fill with medians
    for col in df.columns:
        if col in training_medians:
            df[col].fillna(training_medians[col], inplace=True)
    
    return df

def predict_biomass(df: pd.DataFrame) -> tuple:
    """Predict biomass and calculate confidence"""
    # Feature engineering
    df = engineer_features(df)
    
    # Encode species
    df = encode_species(df)
    
    # Fill missing values
    df = fill_missing(df)
    
    # Model expects these features in this order
    expected_features = [
        'longitude', 'latitude', 'agb', 'bgb', 'cagb', 'cbgb', 
        'soil_carbon_stock', 'total_carbon_stock', 'B1', 'B2', 'B3', 'B4', 
        'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12', 'VV', 'VH', 
        'ndvi', 'gndvi', 'ndbi', 'ndwi', 'vv_vh_ratio', 'vv_vh_diff', 'species_enc'
    ]
    
    # Ensure all expected features exist
    for col in expected_features:
        if col not in df.columns:
            df[col] = 0.0
    
    # Select only the expected features in the correct order
    df_model = df[expected_features]
    
    # Create DMatrix
    dmatrix = xgb.DMatrix(df_model)
    
    # Predict (log scale)
    log_pred = booster.predict(dmatrix)
    
    # Clip to 1st-99th percentile
    p1, p99 = np.percentile(log_pred, [1, 99])
    log_pred_clipped = np.clip(log_pred, p1, p99)
    
    # Convert to real scale
    predicted_biomass = np.expm1(log_pred_clipped)
    
    # Calculate SHAP values for confidence
    X = df_model.values
    shap_values = explainer.shap_values(X)
    
    # Calculate feature importance
    mean_shap = np.abs(shap_values).mean(axis=0)
    feature_importance = {
        expected_features[i]: float(mean_shap[i])
        for i in range(len(expected_features))
    }
    
    # Normalize to percentages
    total = sum(feature_importance.values())
    feature_importance = {
        k: (v / total * 100) for k, v in feature_importance.items()
    }
    
    # Calculate confidence based on prediction variance
    confidence = min(95.0, 70.0 + (1.0 / (1.0 + np.std(shap_values))) * 25.0)
    
    return predicted_biomass[0], confidence, df, feature_importance

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model artifacts on startup"""
    load_artifacts()
    yield
    # Cleanup on shutdown (if needed)

app = FastAPI(title="Biomass Prediction API for NeeLedger", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "Biomass Prediction API for NeeLedger",
        "version": "1.0.0"
    }

@app.post("/predict-biomass", response_model=BiomassOutput)
async def predict_biomass_endpoint(input_data: BiomassInput):
    """
    Predict biomass from satellite data.
    
    Example:
    {
        "B2": 0.05,
        "B3": 0.06,
        "B4": 0.04,
        "B8": 0.3,
        "species": "Mangrove"
    }
    """
    try:
        print(f"Received input: {input_data}")
        
        # Convert to DataFrame
        df = pd.DataFrame([input_data.model_dump()])
        print(f"DataFrame created: {df}")
        
        # Predict
        biomass, confidence, result_df, feature_importance = predict_biomass(df)
        print(f"Prediction: biomass={biomass}, confidence={confidence}")
        
        return BiomassOutput(
            predicted_biomass=float(biomass),
            confidence=float(confidence),
            ndvi=float(result_df['ndvi'].iloc[0]),
            evi=float(result_df.get('evi', [0.0]).iloc[0] if 'evi' in result_df.columns else 0.0),
            savi=float(result_df.get('savi', [0.0]).iloc[0] if 'savi' in result_df.columns else 0.0),
            feature_importance=feature_importance
        )
        
    except Exception as e:
        import traceback
        print(f"Error in predict_biomass_endpoint: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
