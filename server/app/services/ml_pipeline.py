"""
ML Pipeline Orchestrator
Orchestrates the complete MRV pipeline: Mangrove → Temporal → Biomass → Carbon
"""

import asyncio
import time
from typing import Dict, Optional
import logging
from pathlib import Path
import tempfile
import requests
from PIL import Image

from app.services.mangrove_model import get_mangrove_model
from app.services.biomass_model import get_biomass_model
from app.services.temporal_model import get_temporal_model
from app.services.carbon_engine import get_carbon_engine
from app.db.supabase_client import (
    get_submission,
    update_submission,
    get_latest_verified_submission,
    create_temporal_history
)
from app.utils.config import settings
from app.utils.storage import download_from_supabase, get_image_path

logger = logging.getLogger(__name__)


class MLPipelineOrchestrator:
    """Orchestrates the complete ML pipeline"""
    
    def __init__(self):
        self.mangrove_model = None
        self.biomass_model = None
        self.temporal_model = None
        self.carbon_engine = None
        self.initialized = False
    
    async def initialize(self):
        """Initialize all ML models"""
        logger.info("Initializing ML Pipeline Orchestrator...")
        
        try:
            # Initialize all models in parallel
            self.mangrove_model = await get_mangrove_model()
            self.biomass_model = await get_biomass_model()
            self.temporal_model = await get_temporal_model()
            self.carbon_engine = get_carbon_engine()
            
            self.initialized = True
            logger.info("✅ ML Pipeline Orchestrator initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize ML Pipeline: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup resources"""
        logger.info("Cleaning up ML Pipeline Orchestrator...")
        # Add any cleanup logic here
    
    async def run_pipeline(self, submission_id: str) -> Dict:
        """
        Run the complete MRV pipeline for a submission
        
        Pipeline flow:
        1. Fetch submission and image
        2. Mangrove Verification (if fails → reject)
        3. Temporal Change Detection (if previous submission exists)
        4. Biomass Regression
        5. Carbon Calculation
        6. Update database
        7. Trigger blockchain anchor (if enabled)
        
        Args:
            submission_id: UUID of the submission
            
        Returns:
            Complete pipeline result
        """
        start_time = time.time()
        
        try:
            # Fetch submission
            submission = await get_submission(submission_id)
            if not submission:
                raise ValueError(f"Submission {submission_id} not found")
            
            # Update status to processing
            await update_submission(submission_id, {"status": "processing"})
            
            # Download image from Supabase Storage
            image_url = submission["image_url"]
            image_path = await get_image_path(image_url)
            
            logger.info(f"Processing submission {submission_id}")
            
            # ========== STEP 1: MANGROVE VERIFICATION ==========
            logger.info("Step 1: Running Mangrove Verification...")
            mangrove_result = await self.mangrove_model.predict(image_path)
            
            # Check threshold
            if mangrove_result["probability"] < settings.MANGROVE_THRESHOLD:
                # Reject submission
                await update_submission(
                    submission_id,
                    {
                        "status": "rejected",
                        "mangrove_score": mangrove_result["probability"],
                        "model_version": mangrove_result["model_version"],
                        "error_message": f"Mangrove verification failed: probability {mangrove_result['probability']:.3f} < threshold {settings.MANGROVE_THRESHOLD}"
                    }
                )
                logger.warning(f"Submission {submission_id} rejected: mangrove verification failed")
                return {
                    "submission_id": submission_id,
                    "status": "rejected",
                    "mangrove_result": mangrove_result,
                    "reason": "mangrove_verification_failed"
                }
            
            logger.info(f"✅ Mangrove verification passed: {mangrove_result['probability']:.3f}")
            
            # ========== STEP 2: TEMPORAL CHANGE DETECTION ==========
            temporal_result = None
            project_id = submission["project_id"]
            
            # Check if there's a previous verified submission
            previous_submission = await get_latest_verified_submission(project_id)
            
            if previous_submission and previous_submission["id"] != submission_id:
                logger.info("Step 2: Running Temporal Change Detection...")
                
                # Download previous image
                prev_image_url = previous_submission["image_url"]
                prev_image_path = await get_image_path(prev_image_url)
                
                # Run temporal comparison
                temporal_result = await self.temporal_model.compare(
                    prev_image_path,
                    image_path
                )
                
                # Create temporal history record
                await create_temporal_history({
                    "project_id": project_id,
                    "previous_submission_id": previous_submission["id"],
                    "current_submission_id": submission_id,
                    "growth_detected": temporal_result["growth_detected"],
                    "growth_score": temporal_result["growth_score"],
                    "change_metrics": temporal_result["comparison_metrics"]
                })
                
                logger.info(f"✅ Temporal change detected: growth={temporal_result['growth_detected']}, score={temporal_result['growth_score']:.3f}")
            else:
                logger.info("Step 2: Skipping temporal change detection (no previous submission)")
            
            # ========== STEP 3: BIOMASS REGRESSION ==========
            logger.info("Step 3: Running Biomass Regression...")
            
            # Extract satellite band values from image
            # In production, these would come from actual satellite data
            # For now, using mock values extracted from image
            bands = await self._extract_satellite_bands(image_path)
            
            biomass_result = await self.biomass_model.predict(
                B2=bands["B2"],
                B3=bands["B3"],
                B4=bands["B4"],
                B8=bands["B8"],
                species="Mangrove"
            )
            
            logger.info(f"✅ Biomass estimate: {biomass_result['biomass']:.2f} tonnes/ha")
            
            # ========== STEP 4: CARBON CALCULATION ==========
            logger.info("Step 4: Calculating Carbon...")
            
            # Get area from project metadata (default to 1 hectare if not available)
            area_hectares = submission.get("metadata", {}).get("area_hectares", 1.0)
            
            carbon_result = self.carbon_engine.calculate_carbon(
                biomass=biomass_result["biomass"],
                area_hectares=area_hectares,
                apply_buffer=True
            )
            
            logger.info(f"✅ Carbon estimate: {carbon_result['carbon_tonnes_buffered']:.2f} tonnes C")
            
            # ========== STEP 5: UPDATE DATABASE ==========
            logger.info("Step 5: Updating database...")
            
            update_data = {
                "status": "verified",
                "mangrove_score": mangrove_result["probability"],
                "temporal_score": temporal_result["growth_score"] if temporal_result else None,
                "biomass_estimate": biomass_result["biomass"],
                "biomass_lower_bound": biomass_result["lower_bound"],
                "biomass_upper_bound": biomass_result["upper_bound"],
                "carbon_estimate": carbon_result["carbon_tonnes_buffered"],
                "co2_equivalent": carbon_result["co2_equivalent_tonnes"],
                "confidence_interval": biomass_result["confidence_interval"],
                "model_version": f"mangrove:{mangrove_result['model_version']},biomass:{biomass_result['model_version']},temporal:{temporal_result['model_version'] if temporal_result else 'N/A'}",
                "processed_at": time.strftime("%Y-%m-%dT%H:%M:%S")
            }
            
            await update_submission(submission_id, update_data)
            
            # ========== STEP 6: BLOCKCHAIN ANCHOR (if enabled) ==========
            if settings.BLOCKCHAIN_ENABLED:
                logger.info("Step 6: Triggering blockchain anchor...")
                try:
                    from app.services.blockchain_service import anchor_submission
                    await anchor_submission(submission_id)
                    logger.info("✅ Blockchain anchor created")
                except Exception as e:
                    logger.error(f"❌ Blockchain anchor failed: {e}")
                    # Don't fail the pipeline if blockchain fails
            
            processing_time = time.time() - start_time
            
            result = {
                "submission_id": submission_id,
                "status": "verified",
                "mangrove_result": mangrove_result,
                "temporal_result": temporal_result,
                "biomass_result": biomass_result,
                "carbon_result": carbon_result,
                "processing_time_seconds": processing_time
            }
            
            logger.info(f"✅ Pipeline completed successfully in {processing_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"❌ Pipeline failed for submission {submission_id}: {e}")
            
            # Update submission with error
            await update_submission(
                submission_id,
                {
                    "status": "error",
                    "error_message": str(e)
                }
            )
            
            raise
    
    async def _extract_satellite_bands(self, image_path: str) -> Dict:
        """
        Extract satellite band values from image
        In production, this would use actual multispectral satellite data
        For now, using mock extraction from RGB image
        """
        import cv2
        import numpy as np
        
        img = cv2.imread(image_path)
        if img is None:
            img = cv2.cvtColor(np.array(Image.open(image_path)), cv2.COLOR_RGBA2RGB)
        
        # Convert to normalized reflectance (mock)
        img_normalized = img.astype(np.float32) / 255.0
        
        # Extract average band values
        # In production, use actual satellite bands
        B2 = np.mean(img_normalized[:, :, 0]) * 0.1  # Blue band (mock)
        B3 = np.mean(img_normalized[:, :, 1]) * 0.12  # Green band (mock)
        B4 = np.mean(img_normalized[:, :, 2]) * 0.15  # Red band (mock)
        B8 = np.mean(img_normalized) * 0.3  # NIR band (mock)
        
        return {
            "B2": float(B2),
            "B3": float(B3),
            "B4": float(B4),
            "B8": float(B8)
        }
