from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="NETRA API",
    description="Decentralized Tourist Safety Ecosystem Backend",
    version="1.0.0"
)

# Configure CORS for local development access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
async def health_check():
    """
    Service health check endpoint for monitoring status.
    """
    return {
        "status": "active",
        "system": "NETRA Command Backend",
        "services": {
            "web3_sim": "initialized",
            "anomaly_detector": "ready"
        }
    }
