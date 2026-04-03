"""
Database schemas and models for Supabase
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime
from uuid import UUID


# ==================== PROJECT SCHEMAS ====================

class ProjectBase(BaseModel):
    """Base project schema"""
    name: str
    latitude: float
    longitude: float
    region: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    """Schema for creating a project"""
    pass


class Project(ProjectBase):
    """Full project schema"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ==================== SUBMISSION SCHEMAS ====================

class SubmissionBase(BaseModel):
    """Base submission schema"""
    project_id: UUID
    image_url: str
    timestamp: datetime
    metadata: Optional[Dict] = None


class SubmissionCreate(SubmissionBase):
    """Schema for creating a submission"""
    pass


class Submission(SubmissionBase):
    """Full submission schema with ML results"""
    id: UUID
    status: str  # uploaded, processing, verified, rejected, error
    mangrove_score: Optional[float] = None
    temporal_score: Optional[float] = None
    biomass_estimate: Optional[float] = None
    biomass_lower_bound: Optional[float] = None
    biomass_upper_bound: Optional[float] = None
    carbon_estimate: Optional[float] = None
    co2_equivalent: Optional[float] = None
    confidence_interval: Optional[float] = None
    model_version: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    processed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class SubmissionUpdate(BaseModel):
    """Schema for updating submission status and results"""
    status: Optional[str] = None
    mangrove_score: Optional[float] = None
    temporal_score: Optional[float] = None
    biomass_estimate: Optional[float] = None
    biomass_lower_bound: Optional[float] = None
    biomass_upper_bound: Optional[float] = None
    carbon_estimate: Optional[float] = None
    co2_equivalent: Optional[float] = None
    confidence_interval: Optional[float] = None
    model_version: Optional[str] = None
    error_message: Optional[str] = None
    processed_at: Optional[datetime] = None


# ==================== TEMPORAL HISTORY SCHEMAS ====================

class TemporalHistoryBase(BaseModel):
    """Base temporal history schema"""
    project_id: UUID
    previous_submission_id: UUID
    current_submission_id: UUID
    growth_detected: bool
    growth_score: float
    change_metrics: Optional[Dict] = None


class TemporalHistoryCreate(TemporalHistoryBase):
    """Schema for creating temporal history"""
    pass


class TemporalHistory(TemporalHistoryBase):
    """Full temporal history schema"""
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== MODEL REGISTRY SCHEMAS ====================

class ModelRegistryBase(BaseModel):
    """Base model registry schema"""
    model_name: str
    version: str
    hash: str
    deployment_date: datetime
    metadata: Optional[Dict] = None


class ModelRegistryCreate(ModelRegistryBase):
    """Schema for registering a model"""
    pass


class ModelRegistry(ModelRegistryBase):
    """Full model registry schema"""
    id: UUID
    
    class Config:
        from_attributes = True


# ==================== ML PREDICTION SCHEMAS ====================

class MangroveVerificationResult(BaseModel):
    """Mangrove verification model output"""
    probability: float = Field(..., ge=0.0, le=1.0)
    model_version: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    features: Optional[Dict] = None


class BiomassRegressionResult(BaseModel):
    """Biomass regression model output"""
    biomass: float = Field(..., ge=0.0)
    lower_bound: float = Field(..., ge=0.0)
    upper_bound: float = Field(..., ge=0.0)
    model_version: str
    confidence_interval: float
    features: Optional[Dict] = None
    ndvi: Optional[float] = None
    evi: Optional[float] = None
    savi: Optional[float] = None


class TemporalChangeResult(BaseModel):
    """Temporal change detection model output"""
    growth_detected: bool
    growth_score: float = Field(..., ge=-1.0, le=1.0)
    change_percentage: Optional[float] = None
    model_version: str
    comparison_metrics: Optional[Dict] = None


class MRVPipelineResult(BaseModel):
    """Complete MRV pipeline result"""
    submission_id: UUID
    mangrove_result: MangroveVerificationResult
    temporal_result: Optional[TemporalChangeResult] = None
    biomass_result: Optional[BiomassRegressionResult] = None
    carbon_estimate: Optional[float] = None
    co2_equivalent: Optional[float] = None
    status: str
    processing_time_seconds: float
