"""
Image upload endpoints
"""

from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Depends
from typing import Optional
import uuid
from datetime import datetime
import logging

from app.db.supabase_client import create_submission
from app.services.ml_pipeline import MLPipelineOrchestrator
from app.utils.storage import upload_to_supabase
from app.utils.config import settings
from app import main

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/upload")
async def upload_image(
    project_id: str,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    user: dict = Depends(lambda: {"user_id": "default_user"})
):
    """
    Upload image for MRV processing
    
    Flow:
    1. Validate file
    2. Upload to Supabase Storage
    3. Create submission record
    4. Trigger background ML pipeline
    """
    try:
        # Validate file
        if file.size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE_MB}MB"
            )
        
        # Generate unique file name
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        file_name = f"{uuid.uuid4()}.{file_extension}"
        
        # Save file temporarily
        import tempfile
        import os
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, file_name)
        
        with open(temp_path, 'wb') as f:
            content = await file.read()
            f.write(content)
        
        # Upload to Supabase Storage
        image_url = await upload_to_supabase(
            temp_path,
            settings.STORAGE_BUCKET,
            file_name,
            content_type=file.content_type or "image/jpeg"
        )
        
        # Create submission record
        submission_data = {
            "project_id": project_id,
            "image_url": image_url,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "uploaded",
            "metadata": {
                "original_filename": file.filename,
                "file_size": file.size,
                "content_type": file.content_type
            }
        }
        
        submission = await create_submission(submission_data)
        submission_id = submission["id"]
        
        # Trigger background ML pipeline
        ml_pipeline: MLPipelineOrchestrator = main.app.state.ml_pipeline
        if settings.USE_CELERY:
            # Use Celery for production
            from app.tasks.mrv_tasks import run_mrv_pipeline_task
            run_mrv_pipeline_task.delay(str(submission_id))
        else:
            # Use FastAPI BackgroundTasks for small scale
            background_tasks.add_task(
                ml_pipeline.run_pipeline,
                str(submission_id)
            )
        
        logger.info(f"✅ Image uploaded: {submission_id}, pipeline triggered")
        
        return {
            "submission_id": submission_id,
            "image_url": image_url,
            "status": "uploaded",
            "message": "Image uploaded successfully. Processing started."
        }
        
    except Exception as e:
        logger.error(f"❌ Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
