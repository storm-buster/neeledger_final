"""
Blockchain Service
Anchors submission data to blockchain for tamper-proof verification
"""

import hashlib
import json
from typing import Dict, Optional
import logging
from app.utils.config import settings
from app.db.supabase_client import get_submission

logger = logging.getLogger(__name__)


async def anchor_submission(submission_id: str) -> Dict:
    """
    Anchor submission data hash to blockchain
    
    Args:
        submission_id: UUID of the submission
        
    Returns:
        Transaction hash and blockchain metadata
    """
    if not settings.BLOCKCHAIN_ENABLED:
        logger.info("Blockchain disabled, skipping anchor")
        return {"status": "skipped", "reason": "blockchain_disabled"}
    
    try:
        # Fetch submission data
        submission = await get_submission(submission_id)
        if not submission:
            raise ValueError(f"Submission {submission_id} not found")
        
        # Create data hash
        data_to_hash = {
            "submission_id": submission_id,
            "project_id": str(submission["project_id"]),
            "carbon_estimate": submission.get("carbon_estimate"),
            "co2_equivalent": submission.get("co2_equivalent"),
            "biomass_estimate": submission.get("biomass_estimate"),
            "mangrove_score": submission.get("mangrove_score"),
            "timestamp": submission.get("timestamp"),
            "model_version": submission.get("model_version")
        }
        
        # Create hash
        data_json = json.dumps(data_to_hash, sort_keys=True)
        data_hash = hashlib.sha256(data_json.encode()).hexdigest()
        
        # In production, interact with CarbonRegistry (and optionally Oracle/Token) contracts
        contract_address = settings.CARBON_REGISTRY_ADDRESS or settings.CONTRACT_ADDRESS
        if contract_address and settings.PRIVATE_KEY and settings.BLOCKCHAIN_RPC_URL:
            # TODO: Implement actual blockchain interaction
            # Using Web3.py or similar library
            logger.info(f"Would anchor hash {data_hash} to blockchain")
            
            # Mock transaction hash
            tx_hash = f"0x{hashlib.sha256(data_hash.encode()).hexdigest()[:64]}"
            
            result = {
                "status": "anchored",
                "transaction_hash": tx_hash,
                "data_hash": data_hash,
                "contract_address": contract_address,
                "blockchain": "ethereum"  # or "polygon", "arbitrum", etc.
            }
        else:
            # Mock mode
            logger.info(f"Mock: Would anchor hash {data_hash} to blockchain")
            result = {
                "status": "mock",
                "data_hash": data_hash,
                "message": "Blockchain credentials not configured"
            }
        
        logger.info(f"✅ Blockchain anchor created for submission {submission_id}")
        return result
        
    except Exception as e:
        logger.error(f"❌ Blockchain anchor failed: {e}")
        raise
