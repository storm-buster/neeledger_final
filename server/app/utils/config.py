"""
Configuration settings for the application
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # Storage Configuration
    STORAGE_BUCKET: str = "project-submissions"
    
    # ML Model Configuration
    MODELS_DIR: str = os.getenv("MODELS_DIR", "./models")
    MANGROVE_MODEL_PATH: str = os.getenv("MANGROVE_MODEL_PATH", "./models/mangrove_verification.pkl")
    BIOMASS_MODEL_PATH: str = os.getenv("BIOMASS_MODEL_PATH", "./models/xgb_biomass_booster.json")
    TEMPORAL_MODEL_PATH: str = os.getenv("TEMPORAL_MODEL_PATH", "./models/temporal_change.pkl")
    
    # ML Thresholds
    MANGROVE_THRESHOLD: float = 0.7  # Minimum probability for mangrove verification
    TEMPORAL_GROWTH_THRESHOLD: float = 0.1  # Minimum growth score to consider positive
    
    # Carbon Calculation Constants
    CARBON_FRACTION: float = 0.47  # Fraction of biomass that is carbon
    CO2_EQUIVALENT: float = 3.67  # CO2 equivalent multiplier
    RISK_BUFFER_PERCENT: float = 0.15  # 15% risk buffer
    
    # Background Task Configuration
    USE_CELERY: bool = os.getenv("USE_CELERY", "false").lower() == "true"
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
    
    # Blockchain / Smart Contracts Configuration
    BLOCKCHAIN_ENABLED: bool = os.getenv("BLOCKCHAIN_ENABLED", "false").lower() == "true"
    BLOCKCHAIN_RPC_URL: str = os.getenv("BLOCKCHAIN_RPC_URL", "")
    # CarbonRegistry contract (anchor submission hashes)
    CARBON_REGISTRY_ADDRESS: str = os.getenv("CARBON_REGISTRY_ADDRESS", "")
    # Optional: OracleConsumer, CarbonCreditToken (for oracle + minting)
    ORACLE_CONSUMER_ADDRESS: str = os.getenv("ORACLE_CONSUMER_ADDRESS", "")
    CARBON_CREDIT_TOKEN_ADDRESS: str = os.getenv("CARBON_CREDIT_TOKEN_ADDRESS", "")
    # Wallet key for backend/oracle signer (keep secret)
    PRIVATE_KEY: str = os.getenv("PRIVATE_KEY", "")
    # Legacy alias
    CONTRACT_ADDRESS: str = os.getenv("CONTRACT_ADDRESS", "")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://neeledger.app",
    ]
    
    # Security
    RATE_LIMIT_ENABLED: bool = True
    MAX_UPLOAD_SIZE_MB: int = 100
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
