"""
Carbon Calculation Engine
Deterministic carbon calculation from biomass estimates
"""

from typing import Dict, Optional
import logging
from app.utils.config import settings

logger = logging.getLogger(__name__)


class CarbonEngine:
    """Carbon calculation engine"""
    
    def __init__(self):
        self.carbon_fraction = settings.CARBON_FRACTION
        self.co2_equivalent = settings.CO2_EQUIVALENT
        self.risk_buffer = settings.RISK_BUFFER_PERCENT
    
    def calculate_carbon(
        self,
        biomass: float,
        area_hectares: float = 1.0,
        apply_buffer: bool = True
    ) -> Dict:
        """
        Calculate carbon and CO2 equivalent from biomass
        
        Args:
            biomass: Biomass in tonnes/ha
            area_hectares: Area in hectares
            apply_buffer: Whether to apply risk buffer
            
        Returns:
            Dictionary with carbon estimate, CO2 equivalent, and metadata
        """
        try:
            # Total biomass
            total_biomass = biomass * area_hectares
            
            # Calculate carbon (biomass * carbon fraction)
            carbon_estimate = total_biomass * self.carbon_fraction
            
            # Apply risk buffer if requested
            if apply_buffer:
                carbon_estimate_buffered = carbon_estimate * (1 - self.risk_buffer)
            else:
                carbon_estimate_buffered = carbon_estimate
            
            # Calculate CO2 equivalent (carbon * CO2 conversion factor)
            co2_equivalent = carbon_estimate_buffered * self.co2_equivalent
            
            result = {
                "biomass_tonnes": float(total_biomass),
                "carbon_tonnes": float(carbon_estimate),
                "carbon_tonnes_buffered": float(carbon_estimate_buffered),
                "co2_equivalent_tonnes": float(co2_equivalent),
                "area_hectares": float(area_hectares),
                "carbon_fraction": self.carbon_fraction,
                "co2_conversion_factor": self.co2_equivalent,
                "risk_buffer_percent": self.risk_buffer if apply_buffer else 0.0,
                "calculation_method": "IPCC Tier 1"
            }
            
            logger.info(
                f"Carbon calculation: {carbon_estimate:.2f} tonnes C, "
                f"{co2_equivalent:.2f} tonnes CO2eq"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error in carbon calculation: {e}")
            raise


# Singleton instance
_carbon_engine: Optional[CarbonEngine] = None


def get_carbon_engine() -> CarbonEngine:
    """Get singleton carbon engine instance"""
    global _carbon_engine
    if _carbon_engine is None:
        _carbon_engine = CarbonEngine()
    return _carbon_engine
