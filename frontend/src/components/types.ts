export interface TelemetryFrame {
  did: string;
  latitude: number;
  longitude: number;
  speed: number;
  battery: number;
  rssi: number;
  timestamp: string;
  surrounding_tourist_count: number;
  safety_score: number;
  anomaly_detected: boolean;
  anomaly_type: string | null;
  geofence_alert: string | null;
}

export interface LogEvent {
  id: string;
  timestamp: string;
  message: string;
  type: "log" | "alert" | "success";
}
