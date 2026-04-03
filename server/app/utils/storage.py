"""
Storage utilities for Supabase Storage
"""

import os
import tempfile
from pathlib import Path
from typing import Optional
import logging
from supabase import create_client
from app.utils.config import settings

logger = logging.getLogger(__name__)


async def upload_to_supabase(
    file_path: str,
    bucket: str,
    file_name: str,
    content_type: str = "image/jpeg"
) -> str:
    """
    Upload file to Supabase Storage
    
    Returns:
        Public URL of uploaded file
    """
    try:
        from app.db.supabase_client import get_supabase_client
        client = get_supabase_client()
        
        # Read file
        with open(file_path, 'rb') as f:
            file_data = f.read()
        
        # Upload to storage
        response = client.storage.from_(bucket).upload(
            file_name,
            file_data,
            file_options={"content-type": content_type}
        )
        
        # Get public URL
        url = client.storage.from_(bucket).get_public_url(file_name)
        
        logger.info(f"✅ Uploaded {file_name} to {bucket}")
        return url
        
    except Exception as e:
        logger.error(f"❌ Failed to upload to Supabase: {e}")
        raise


async def download_from_supabase(url: str, local_path: Optional[str] = None) -> str:
    """
    Download file from Supabase Storage URL
    
    Returns:
        Local file path
    """
    try:
        if local_path is None:
            # Create temp file
            temp_dir = tempfile.gettempdir()
            file_name = Path(url).name
            local_path = os.path.join(temp_dir, f"supabase_{file_name}")
        
        # Download file
        import requests
        response = requests.get(url)
        response.raise_for_status()
        
        # Save to local path
        with open(local_path, 'wb') as f:
            f.write(response.content)
        
        logger.info(f"✅ Downloaded {url} to {local_path}")
        return local_path
        
    except Exception as e:
        logger.error(f"❌ Failed to download from Supabase: {e}")
        raise


async def get_image_path(image_url: str) -> str:
    """
    Get local path for image (downloads if needed)
    
    Returns:
        Local file path
    """
    # Check if it's a Supabase URL
    if "supabase.co" in image_url or image_url.startswith("http"):
        return await download_from_supabase(image_url)
    else:
        # Assume it's already a local path
        return image_url
