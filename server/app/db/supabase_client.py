"""
Supabase client initialization and database operations
"""

from supabase import create_client, Client
from app.utils.config import settings
import logging

logger = logging.getLogger(__name__)

_supabase_client: Client = None


def get_supabase_client() -> Client:
    """Get or create Supabase client singleton"""
    global _supabase_client
    
    if _supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
        logger.info("✅ Supabase client initialized")
    
    return _supabase_client


async def create_submission(submission_data: dict) -> dict:
    """Create a new submission record"""
    client = get_supabase_client()
    result = client.table("submissions").insert(submission_data).execute()
    return result.data[0] if result.data else None


async def update_submission(submission_id: str, update_data: dict) -> dict:
    """Update submission record"""
    client = get_supabase_client()
    result = client.table("submissions").update(update_data).eq("id", submission_id).execute()
    return result.data[0] if result.data else None


async def get_submission(submission_id: str) -> dict:
    """Get submission by ID"""
    client = get_supabase_client()
    result = client.table("submissions").select("*").eq("id", submission_id).execute()
    return result.data[0] if result.data else None


async def get_latest_verified_submission(project_id: str) -> dict:
    """Get the latest verified submission for a project"""
    client = get_supabase_client()
    result = (
        client.table("submissions")
        .select("*")
        .eq("project_id", project_id)
        .eq("status", "verified")
        .order("timestamp", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


async def create_temporal_history(history_data: dict) -> dict:
    """Create temporal history record"""
    client = get_supabase_client()
    result = client.table("temporal_history").insert(history_data).execute()
    return result.data[0] if result.data else None


async def register_model(model_data: dict) -> dict:
    """Register a model in the model registry"""
    client = get_supabase_client()
    result = client.table("model_registry").insert(model_data).execute()
    return result.data[0] if result.data else None


async def get_model_version(model_name: str) -> dict:
    """Get latest model version"""
    client = get_supabase_client()
    result = (
        client.table("model_registry")
        .select("*")
        .eq("model_name", model_name)
        .order("deployment_date", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None
