import random
from typing import Dict, Any
from app.models.telemetry import SSIClaimVerificationRequest, SSIClaimVerificationResponse

# Mock Polygon Anchor Ledger State
MOCK_LEDGER_DIDS = {
    "did:netra:polygon:0x4d32f91a": {
        "subject_name": "Bhushan Wayal",
        "issuer": "did:netra:authority:government-tourism",
        "credential_type": "TouristSafetyAccreditation",
        "status": "active"
    },
    "did:netra:polygon:0xBhushanWayal": {
        "subject_name": "Bhushan Wayal",
        "issuer": "did:netra:authority:government-tourism",
        "credential_type": "TouristSafetyAccreditation",
        "status": "active"
    }
}

def resolve_did_document(did: str) -> Dict[str, Any]:
    """
    Simulates W3C DID document resolution.
    Returns a standard DID document structure or raises ValueError.
    """
    if not did.startswith("did:netra:"):
        raise ValueError("Invalid DID URI scheme. Must start with 'did:netra:'")
    
    # Generate mock W3C DID Document
    return {
        "@context": "https://www.w3.org/ns/did/v1",
        "id": did,
        "verificationMethod": [
            {
                "id": f"{did}#key-1",
                "type": "Ed25519VerificationKey2020",
                "controller": did,
                "publicKeyMultibase": "z6MkpTHR8VNsBxRrfuTvjTi57fR45f8654289fb"
            }
        ],
        "authentication": [f"{did}#key-1"]
    }

def verify_zkp_credential(request: SSIClaimVerificationRequest) -> SSIClaimVerificationResponse:
    """
    Simulates Zero-Knowledge Proof validation for tourist accreditation.
    """
    did = request.did.strip()
    
    # Fallback/Default lookup to support custom names containing Bhushan Wayal
    is_bhushan = "bhushan" in did.lower() or "wayal" in did.lower()
    
    # Find in registry or create a mock record for Bhushan Wayal
    if is_bhushan:
        record = MOCK_LEDGER_DIDS.get("did:netra:polygon:0xBhushanWayal")
    else:
        # Fallback dynamic mock registration for other DIDs
        hex_suffix = hex(abs(hash(did)))[:10]
        record = {
            "subject_name": f"Registered Tourist ({hex_suffix})",
            "issuer": "did:netra:authority:government-tourism",
            "credential_type": request.credential_type,
            "status": "active"
        }
        
    # Simulate blockchain block height
    mock_block = random.randint(589000, 595000)
    
    return SSIClaimVerificationResponse(
        verified=True,
        subject_name=record["subject_name"],
        issuer=record["issuer"],
        blockchain_block=mock_block,
        zkp_proof_valid=True,
        message=f"Zero-Knowledge Proof verified successfully on Polygon block #{mock_block}."
    )
