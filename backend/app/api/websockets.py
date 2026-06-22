import json
from typing import Dict, Set, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError
from datetime import datetime

from app.models.telemetry import TelemetryFrame, SafetyUpdate
from app.services.anomaly import anomaly_detector_service

router = APIRouter(prefix="/ws", tags=["WebSockets"])

# Mock Geofence Coordinates: Pune city core zone
PUNE_SAFE_CENTER_LAT = 18.5204
PUNE_SAFE_CENTER_LON = 73.8567
MAX_SAFE_RADIUS_DEGREES = 0.01  # Approximately 1.1 km

def check_geofence_breach(lat: float, lon: float) -> Optional[str]:
    """
    Computes Euclidean distance from safe center to coordinate.
    If outside maximum radius, returns a geofence warning message.
    """
    distance = ((lat - PUNE_SAFE_CENTER_LAT)**2 + (lon - PUNE_SAFE_CENTER_LON)**2)**0.5
    if distance > MAX_SAFE_RADIUS_DEGREES:
        return f"GEOFENCE BREACH: Tourist moved outside the core tourist security perimeter (Current Distance: {distance*111:.2f} km from center)."
    return None

class ConnectionManager:
    def __init__(self):
        # Maps DID to tourist client WebSocket connection
        self.tourist_connections: Dict[str, WebSocket] = {}
        # Set of active dashboard operator connections
        self.operator_connections: Set[WebSocket] = {}

    async def connect_tourist(self, did: str, websocket: WebSocket):
        await websocket.accept()
        self.tourist_connections[did] = websocket
        print(f"NETRA // WS: Tourist connected: {did}")
        await self.broadcast_log_to_operators(f"SSI // AUTH: Secure session active for DID: {did}")

    def disconnect_tourist(self, did: str):
        if did in self.tourist_connections:
            del self.tourist_connections[did]
            print(f"NETRA // WS: Tourist disconnected: {did}")

    async def connect_operator(self, websocket: WebSocket):
        await websocket.accept()
        self.operator_connections.add(websocket)
        print("NETRA // WS: Dashboard operator connected.")

    def disconnect_operator(self, websocket: WebSocket):
        if websocket in self.operator_connections:
            self.operator_connections.remove(websocket)
            print("NETRA // WS: Dashboard operator disconnected.")

    async def send_safety_update(self, did: str, update: SafetyUpdate):
        """
        Pushes safety update / geofence alert directly back to the tourist client.
        """
        websocket = self.tourist_connections.get(did)
        if websocket:
            await websocket.send_text(update.json())

    async def broadcast_to_operators(self, payload: dict):
        """
        Sends active telemetry data/score feeds to all listening operators.
        """
        disconnected = []
        for connection in self.operator_connections:
            try:
                await connection.send_text(json.dumps(payload))
            except Exception:
                disconnected.append(connection)
                
        for connection in disconnected:
            self.disconnect_operator(connection)

    async def broadcast_log_to_operators(self, log_message: str):
        """
        Convenience function to send text logs to operator terminal logs feed.
        """
        payload = {
            "type": "log_event",
            "message": log_message,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_operators(payload)


manager = ConnectionManager()

@router.websocket("/telemetry/{did}")
async def websocket_telemetry_endpoint(websocket: WebSocket, did: str):
    """
    Bi-directional telemetry websocket for tourist clients.
    """
    await manager.connect_tourist(did, websocket)
    try:
        while True:
            # Receive telemetry payload from tourist
            data = await websocket.receive_text()
            try:
                payload_json = json.loads(data)
                # Ensure fields conform to model schema
                frame = TelemetryFrame(**payload_json)
                
                # 1. Run AI anomaly scoring
                safety_score, anomaly_detected, anomaly_type = anomaly_detector_service.score_telemetry(frame)
                
                # 2. Evaluate geofence boundaries
                geofence_alert = check_geofence_breach(frame.latitude, frame.longitude)
                if geofence_alert:
                    anomaly_detected = True
                    # Elevate anomaly type if geofence breached
                    anomaly_type = anomaly_type or "GEOFENCE BREACH WARNING"
                
                # 3. Create Safety Update
                update = SafetyUpdate(
                    did=frame.did,
                    safety_score=safety_score,
                    anomaly_detected=anomaly_detected,
                    anomaly_type=anomaly_type,
                    geofence_alert=geofence_alert,
                    timestamp=datetime.utcnow().isoformat()
                )
                
                # 4. Push safety/geofence alerts directly back to the tourist (Bi-directional)
                await manager.send_safety_update(did, update)
                
                # 5. Broadcast telemetry data and evaluation metrics to Dashboard Operators
                broadcast_payload = {
                    "type": "telemetry_feed",
                    "did": frame.did,
                    "latitude": frame.latitude,
                    "longitude": frame.longitude,
                    "speed": frame.speed,
                    "battery": frame.battery,
                    "rssi": frame.rssi,
                    "timestamp": frame.timestamp,
                    "surrounding_tourist_count": frame.surrounding_tourist_count,
                    "safety_score": safety_score,
                    "anomaly_detected": anomaly_detected,
                    "anomaly_type": anomaly_type,
                    "geofence_alert": geofence_alert
                }
                await manager.broadcast_to_operators(broadcast_payload)
                
                # Optionally send structural text log to console
                log_text = f"AI // SCORE: {frame.did[:15]}... Anomaly factor: {1 - safety_score:.2f}"
                if anomaly_detected:
                    log_text = f"ALERT // DETECTED: {anomaly_type} for DID {frame.did[:15]}..."
                await manager.broadcast_log_to_operators(log_text)
                
            except (json.JSONDecodeError, ValidationError) as err:
                # Log frame format validation failures to operators and warn tourist
                error_msg = f"SYS // ERROR: Malformed telemetry stream payload from {did[:15]} - {str(err)}"
                await manager.broadcast_log_to_operators(error_msg)
                await websocket.send_text(json.dumps({"error": "Malformed payload"}))
                
    except WebSocketDisconnect:
        manager.disconnect_tourist(did)
        await manager.broadcast_log_to_operators(f"SYSTEM // WS: Connection closed for tourist {did[:15]}")


@router.websocket("/dashboard/stream")
async def websocket_dashboard_endpoint(websocket: WebSocket):
    """
    Uni-directional broadcast websocket for dashboard operator dashboard feeds.
    """
    await manager.connect_operator(websocket)
    try:
        while True:
            # Maintain connection, operators only listen to broadcast payload feeds
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_operator(websocket)
