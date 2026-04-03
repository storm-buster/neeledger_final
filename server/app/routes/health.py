"""
Health check endpoints
"""

from fastapi import APIRouter, Depends
from app.services.ml_pipeline import MLPipelineOrchestrator
from app import main

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "Blue Carbon MRV Backend"
    }


@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with ML model status"""
    ml_pipeline: MLPipelineOrchestrator = main.app.state.ml_pipeline
    
    return {
        "status": "healthy",
        "ml_pipeline": {
            "initialized": ml_pipeline.initialized if ml_pipeline else False,
            "mangrove_model": ml_pipeline.mangrove_model.initialized if ml_pipeline and ml_pipeline.mangrove_model else False,
            "biomass_model": ml_pipeline.biomass_model.initialized if ml_pipeline and ml_pipeline.biomass_model else False,
            "temporal_model": ml_pipeline.temporal_model.initialized if ml_pipeline and ml_pipeline.temporal_model else False,
        }
    }
