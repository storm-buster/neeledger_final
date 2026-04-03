"""
Project management endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import logging

from app.db.supabase_client import get_supabase_client
from app.db.schemas import ProjectCreate, Project

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/projects", response_model=Project)
async def create_project(
    project: ProjectCreate,
    user: dict = Depends(lambda: {"user_id": "default_user"})
):
    """Create a new project"""
    try:
        client = get_supabase_client()
        result = client.table("projects").insert(project.dict()).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create project")
        
        return result.data[0]
        
    except Exception as e:
        logger.error(f"❌ Failed to create project: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects", response_model=List[Project])
async def list_projects(
    user: dict = Depends(lambda: {"user_id": "default_user"})
):
    """List all projects"""
    try:
        client = get_supabase_client()
        result = client.table("projects").select("*").execute()
        
        return result.data
        
    except Exception as e:
        logger.error(f"❌ Failed to list projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project_id}", response_model=Project)
async def get_project(
    project_id: str,
    user: dict = Depends(lambda: {"user_id": "default_user"})
):
    """Get project by ID"""
    try:
        client = get_supabase_client()
        result = client.table("projects").select("*").eq("id", project_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return result.data[0]
        
    except Exception as e:
        logger.error(f"❌ Failed to get project: {e}")
        raise HTTPException(status_code=500, detail=str(e))
