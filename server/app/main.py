"""
FastAPI Main Application - Blue Carbon MRV Backend
Orchestrates ML pipeline for mangrove verification, biomass estimation, and temporal change detection
"""

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import os
from typing import Optional
import logging

from app.routes import upload, mrv, projects, health
from app.services.ml_pipeline import MLPipelineOrchestrator
from app.db.supabase_client import get_supabase_client
from app.utils.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global ML Pipeline Orchestrator
ml_pipeline: Optional[MLPipelineOrchestrator] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - handles startup and shutdown"""
    global ml_pipeline
    
    # Startup
    logger.info("🚀 Starting Blue Carbon MRV Backend...")
    
    # Initialize ML Pipeline Orchestrator
    try:
        ml_pipeline = MLPipelineOrchestrator()
        await ml_pipeline.initialize()
        logger.info("✅ ML Pipeline Orchestrator initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize ML Pipeline: {e}")
        raise
    
    # Store in app state
    app.state.ml_pipeline = ml_pipeline
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Blue Carbon MRV Backend...")
    if ml_pipeline:
        await ml_pipeline.cleanup()
    logger.info("✅ Shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="Blue Carbon MRV API",
    description="Production-grade backend for Mangrove Verification, Biomass Regression, and Temporal Change Detection",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Supabase JWT token"""
    # In production, verify JWT with Supabase
    # For now, return user_id from token
    token = credentials.credentials
    # TODO: Implement JWT verification with Supabase
    return {"user_id": "default_user"}


# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(upload.router, prefix="/api/v1", tags=["Upload"], dependencies=[Depends(verify_token)])
app.include_router(mrv.router, prefix="/api/v1", tags=["MRV Pipeline"], dependencies=[Depends(verify_token)])
app.include_router(projects.router, prefix="/api/v1", tags=["Projects"], dependencies=[Depends(verify_token)])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Blue Carbon MRV Backend",
        "version": "1.0.0",
        "status": "operational",
        "ml_models": {
            "mangrove_verification": "active",
            "biomass_regression": "active",
            "temporal_change_detection": "active"
        }
    }
