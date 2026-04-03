"""
MRV Pipeline endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import logging

from app.db.supabase_client import get_submission
from app.services.ml_pipeline import MLPipelineOrchestrator
from app import main

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/mrv/submission/{submission_id}")
async def get_submission_status(
    submission_id: str,
    user: dict = Depends(lambda: {"user_id": "default_user"})
):
    """Get submission status and results"""
    try:
        submission = await get_submission(submission_id)
        if not submission:
            raise HTTPException(status_code=404, detail="Submission not found")
        
        return submission
        
    except Exception as e:
        logger.error(f"❌ Failed to get submission: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mrv/process/{submission_id}")
async def trigger_processing(
    submission_id: str,
    user: dict = Depends(lambda: {"user_id": "default_user"})
):
    """Manually trigger MRV pipeline for a submission"""
    try:
        ml_pipeline: MLPipelineOrchestrator = main.app.state.ml_pipeline
        
        if not ml_pipeline:
            raise HTTPException(status_code=503, detail="ML Pipeline not initialized")
        
        # Run pipeline
        result = await ml_pipeline.run_pipeline(submission_id)
        
        return {
            "submission_id": submission_id,
            "status": result["status"],
            "message": "Processing completed"
        }
        
    except Exception as e:
        logger.error(f"❌ Processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
