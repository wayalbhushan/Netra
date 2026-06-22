# NETRA Command Dashboard

NETRA is a decentralized, high-impact tourist safety ecosystem. It utilizes real-time AI anomaly detection, geofencing telemetry, and simulated Self-Sovereign Identity (SSI) blockchain verification to track, report, and mitigate safety concerns globally.

## System Architecture

NETRA is structured as a monorepo consisting of:
- **/backend**: Powered by FastAPI, featuring WebSockets for real-time telemetry streaming, mock Polygon/Ethereum Web3 integration for Decentralized Identifiers (DIDs), and AI anomaly scoring.
- **/frontend**: Built with Next.js, TypeScript, Tailwind CSS, Recharts (for telemetry and metrics), and Leaflet (for spatial telemetry and anomaly maps).

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Backend setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend setup
```bash
cd frontend
npm install
npm run dev
```
