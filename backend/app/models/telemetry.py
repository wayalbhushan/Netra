from pydantic import BaseModel, Field
from typing import Optional, List

class TelemetryFrame(BaseModel):
    """
    Real-time telemetry payload pushed by the tourist client.
    """
    did: str = Field(..., description="W3C Decentralized Identifier of the tourist")
    latitude: float = Field(..., description="Latitude coordinates of the device")
    longitude: float = Field(..., description="Longitude coordinates of the device")
    speed: float = Field(..., description="Current speed in m/s")
    battery: float = Field(..., description="Battery level percentage (0 - 100)")
    rssi: float = Field(..., description="Network signal strength in dBm")
    timestamp: str = Field(..., description="ISO 8601 formatted timestamp")
    surrounding_tourist_count: int = Field(..., description="Number of other tourists in visual/radio range")

class SafetyUpdate(BaseModel):
    """
    Real-time safety evaluations pushed back to the tourist client.
    """
    did: str
    safety_score: float = Field(..., description="Computed safety index (0.0 to 1.0, lower is higher risk)")
    anomaly_detected: bool = Field(..., description="True if anomaly scoring exceeds threat threshold")
    anomaly_type: Optional[str] = Field(None, description="Specific threat category detected")
    geofence_alert: Optional[str] = Field(None, description="Detailed text alert if a geofenced zone is breached")
    timestamp: str

class SSIClaimVerificationRequest(BaseModel):
    """
    Request model for validating tourists credentials on-chain.
    """
    did: str = Field(..., description="Tourist W3C DID to resolve")
    credential_type: str = Field("TouristSafetyAccreditation", description="Claim schema type to verify")

class SSIClaimVerificationResponse(BaseModel):
    """
    Decentralized identity proof outputs.
    """
    verified: bool
    subject_name: str
    issuer: str
    blockchain_block: int
    zkp_proof_valid: bool
    message: str
