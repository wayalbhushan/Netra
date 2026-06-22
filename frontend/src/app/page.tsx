"use client";
import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SafetyCharts from "../components/SafetyCharts";
import IncidentLogs from "../components/IncidentLogs";
import IdentityPanel from "../components/IdentityPanel";
import { TelemetryFrame, LogEvent } from "../components/types";

// Import Leaflet Map dynamically to prevent Server-Side Rendering (SSR) compile errors
const LiveMap = dynamic(() => import("../components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-zinc-950 border border-zinc-800 font-mono text-[10px] text-zinc-500">
      [ INITIALIZING SPATIAL TELEMETRY MODULE... ]
    </div>
  ),
});

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isConnected, setIsConnected] = useState(false);
  const [tourists, setTourists] = useState<Record<string, TelemetryFrame>>({});
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [safetyHistory, setSafetyHistory] = useState<{ time: string; safety_score: number }[]>([]);
  const [metrics, setMetrics] = useState({
    cpu_load: "1.4%",
    ram_use: "420MB",
    peer_nodes: "24/24 Online",
    comms_health: "99.8%",
  });
  
  // SSI verification states
  const [verification, setVerification] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const targetDid = "did:netra:polygon:0xBhushanWayal";

  // References for WebSocket re-connection
  const wsRef = useRef<WebSocket | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and fetch metrics
  useEffect(() => {
    // Poll hardware metrics from the API
    const fetchMetrics = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/system/metrics");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        // Fallback to offline mock diagnostics if server not reachable
        setMetrics({
          cpu_load: `${(1.2 + Math.random() * 2).toFixed(1)}%`,
          ram_use: `${380 + Math.floor(Math.random() * 50)}MB`,
          peer_nodes: "24/24 Online",
          comms_health: "99.8%",
        });
      }
    };

    fetchMetrics();
    const metricsInterval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(metricsInterval);
  }, []);

  // WebSocket Connection Management
  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Connect to dashboard operator broadcast stream
    const ws = new WebSocket("ws://localhost:8000/ws/dashboard/stream");
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Clear offline simulator when live connection established
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      setLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          timestamp: new Date().toISOString().split("T")[1].slice(0, 8),
          message: "SYSTEM // WS: Connection established. Live stream active.",
          type: "success"
        }
      ]);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        if (payload.type === "log_event") {
          const isAlert = payload.message.includes("ALERT") || payload.message.includes("BREACH") || payload.message.includes("ERROR");
          const isAuth = payload.message.includes("SSI") || payload.message.includes("AUTH");
          const logType = isAlert ? "alert" : isAuth ? "success" : "log";
          
          setLogs((prev) => [
            ...prev.slice(-49),
            {
              id: Math.random().toString(),
              timestamp: payload.timestamp.split("T")[1].slice(0, 8),
              message: payload.message,
              type: logType
            }
          ]);
        } 
        
        else if (payload.type === "telemetry_feed") {
          const frame: TelemetryFrame = payload;
          setTourists((prev) => ({
            ...prev,
            [frame.did]: frame
          }));

          // Add safety score metric point
          const timeLabel = new Date().toISOString().split("T")[1].slice(3, 8); // e.g. "45:32"
          setSafetyHistory((prev) => [
            ...prev.slice(-14),
            { time: timeLabel, safety_score: frame.safety_score }
          ]);
        }
      } catch (err) {
        console.error("Error parsing WebSocket payload", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          timestamp: new Date().toISOString().split("T")[1].slice(0, 8),
          message: "SYSTEM // WS: Connection offline. Engaging local test simulator...",
          type: "alert"
        }
      ]);
      startOfflineSimulation();
    };

    ws.onerror = () => {
      setIsConnected(false);
    };
  };

  // High-fidelity Offline Simulation (Activated when FastAPI backend is offline)
  const startOfflineSimulation = () => {
    if (simIntervalRef.current) return;

    let simLat = 18.5204;
    let simLon = 73.8567;
    let ticks = 0;

    // Prefill safety history
    const initialHistory = Array.from({ length: 8 }, (_, i) => {
      const minAgo = new Date(Date.now() - (8 - i) * 60000);
      return {
        time: minAgo.toISOString().split("T")[1].slice(3, 8),
        safety_score: 0.85 + Math.random() * 0.1
      };
    });
    setSafetyHistory(initialHistory);

    // Dynamic mock events
    const simInterval = setInterval(() => {
      ticks += 1;
      // Random walk simulation
      simLat += (Math.random() - 0.5) * 0.0015;
      simLon += (Math.random() - 0.5) * 0.0015;

      const speed = 1.0 + Math.random() * 2;
      const battery = Math.max(0, 95 - Math.floor(ticks / 5));
      const rssi = -50 - Math.floor(Math.random() * 30);
      const surrounding_tourist_count = Math.max(0, 5 - Math.floor(ticks / 10));

      // Check geofence
      const distance = ((simLat - 18.5204)**2 + (simLon - 73.8567)**2)**0.5;
      const geofenceBreach = distance > 0.01;
      
      let anomalyDetected = geofenceBreach;
      let anomalyType = geofenceBreach ? "GEOFENCE BREACH WARNING" : null;
      let safetyScore = 0.88 - (distance * 10);

      // Low battery check
      if (battery < 15) {
        anomalyDetected = true;
        anomalyType = "CRITICAL BATTERY LEVEL";
        safetyScore = 0.22;
      }

      safetyScore = Math.max(0.05, Math.min(1.0, safetyScore));

      const mockFrame: TelemetryFrame = {
        did: targetDid,
        latitude: simLat,
        longitude: simLon,
        speed,
        battery,
        rssi,
        timestamp: new Date().toISOString(),
        surrounding_tourist_count,
        safety_score: safetyScore,
        anomaly_detected: anomalyDetected,
        anomaly_type: anomalyType,
        geofence_alert: geofenceBreach ? "GEOFENCE BREACH: Tourist moved outside the core tourist security perimeter." : null
      };

      setTourists({ [targetDid]: mockFrame });

      // Append score
      const timeLabel = new Date().toISOString().split("T")[1].slice(3, 8);
      setSafetyHistory((prev) => [
        ...prev.slice(-14),
        { time: timeLabel, safety_score: safetyScore }
      ]);

      // Add log
      const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
      let logMsg = `AI // SCORE: did:netra:...0xBhushanWayal anomaly factor: ${(1 - safetyScore).toFixed(2)}`;
      let logType: "log" | "alert" | "success" = "log";

      if (anomalyDetected) {
        logMsg = `ALERT // DETECTED: ${anomalyType} for DID ...0xBhushanWayal`;
        logType = "alert";
      }

      setLogs((prev) => [
        ...prev.slice(-49),
        {
          id: Math.random().toString(),
          timestamp,
          message: logMsg,
          type: logType
        }
      ]);
    }, 4000);

    simIntervalRef.current = simInterval;
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  // ZKP Verification REST Call handler
  const handleVerifyZkp = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch("http://localhost:8000/api/ssi/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          did: targetDid,
          credential_type: "TouristSafetyAccreditation"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setVerification(data);
        
        setLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            timestamp: new Date().toISOString().split("T")[1].slice(0, 8),
            message: `SSI // DID: Anchor state verified on Polygon Mainnet block #${data.blockchain_block}`,
            type: "success"
          }
        ]);
      }
    } catch (err) {
      // Offline fallback verification simulation
      setTimeout(() => {
        setVerification({
          verified: true,
          subject_name: "Bhushan Wayal",
          issuer: "did:netra:authority:government-tourism",
          blockchain_block: 589201,
          zkp_proof_valid: true,
          message: "Zero-Knowledge Proof verified successfully on Polygon block #589201 (Offline Simulation Mode)."
        });
        setLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            timestamp: new Date().toISOString().split("T")[1].slice(0, 8),
            message: "SSI // DID: Anchor state verified on Polygon Mainnet block #589201 (Offline Sim)",
            type: "success"
          }
        ]);
      }, 1000);
    } finally {
      setTimeout(() => setIsVerifying(false), 1000);
    }
  };

  const activeTouristsList = Object.values(tourists);
  const activeThreatsCount = activeTouristsList.filter(t => t.anomaly_detected).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans select-none">
      {/* 1. Sidebar Component */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        metrics={metrics} 
      />

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Component */}
        <Header 
          isConnected={isConnected} 
          onReconnect={connectWebSocket} 
        />

        {/* Tab Switching Contents */}
        <main className="flex-1 p-5 overflow-y-auto space-y-5 bg-zinc-950">
          
          {/* Top Info metrics strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-zinc-800 bg-zinc-900/30 p-3 rounded-none font-mono">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Telemetry Latency</div>
              <div className="text-base font-bold text-zinc-200">{isConnected ? "12ms" : "N/A (SIM)"}</div>
              <div className={`text-[8px] font-bold mt-1 ${isConnected ? "text-emerald-500" : "text-amber-500"}`}>
                STATUS: {isConnected ? "OPERATIONAL" : "OFFLINE_SIMULATION"}
              </div>
            </div>
            
            <div className="border border-zinc-800 bg-zinc-900/30 p-3 rounded-none font-mono">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Active Monitors</div>
              <div className="text-base font-bold text-zinc-200">{activeTouristsList.length} Connected</div>
              <div className="text-[8px] text-zinc-500 mt-1">DIDs REGISTERED ON LEDGER</div>
            </div>
            
            <div className="border border-zinc-800 bg-zinc-900/30 p-3 rounded-none font-mono">
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">ZKP Credentials</div>
              <div className="text-base font-bold text-zinc-200">
                {verification ? "1 Verified (ZKP)" : "0 Active"}
              </div>
              <div className="text-[8px] text-zinc-500 mt-1">SCHEMA: W3C TRUST REGISTRY</div>
            </div>
            
            <div className={`border p-3 rounded-none font-mono ${
              activeThreatsCount > 0 
                ? "border-red-900/40 bg-red-950/20 text-red-500 animate-pulse" 
                : "border-zinc-800 bg-zinc-900/30 text-zinc-400"
            }`}>
              <div className="text-[9px] font-bold uppercase tracking-wider mb-1">Anomalies Detected</div>
              <div className="text-base font-bold">{activeThreatsCount} ACTIVE</div>
              <div className="text-[8px] font-bold mt-1 uppercase">
                {activeThreatsCount > 0 ? "ACTION LEVEL: ELEVATED" : "SECURITY CLEARANCE: SAFE"}
              </div>
            </div>
          </div>

          {/* Grid Layouts */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Column 1 & 2: Map */}
              <div className="lg:col-span-2 space-y-5 flex flex-col h-[520px]">
                <div className="flex-1 border border-zinc-800 bg-zinc-900/40 overflow-hidden min-h-[350px]">
                  <LiveMap tourists={activeTouristsList} />
                </div>
              </div>

              {/* Column 3: Panels */}
              <div className="space-y-5 flex flex-col h-[520px]">
                <div className="h-[250px]">
                  <IdentityPanel 
                    verification={verification}
                    did={targetDid}
                    onVerify={handleVerifyZkp}
                    isLoading={isVerifying}
                  />
                </div>
                <div className="flex-1">
                  <SafetyCharts data={safetyHistory} />
                </div>
              </div>

              {/* Full Width logs console */}
              <div className="lg:col-span-3 h-[240px]">
                <IncidentLogs logs={logs} />
              </div>
            </div>
          )}

          {activeTab === "map" && (
            <div className="flex flex-col gap-5 h-[780px]">
              <div className="flex-1 border border-zinc-800 bg-zinc-900/40 overflow-hidden">
                <LiveMap tourists={activeTouristsList} />
              </div>
              <div className="h-[220px]">
                <IncidentLogs logs={logs} />
              </div>
            </div>
          )}

          {activeTab === "ssi" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-[600px]">
              <div className="md:col-span-1">
                <IdentityPanel 
                  verification={verification}
                  did={targetDid}
                  onVerify={handleVerifyZkp}
                  isLoading={isVerifying}
                />
              </div>
              <div className="md:col-span-2 border border-zinc-800 bg-zinc-900/30 p-5 space-y-4 font-mono text-zinc-300">
                <h3 className="text-xs font-bold text-zinc-200 border-b border-zinc-800 pb-2">
                  VERIFICATION REGISTRY LOGS
                </h3>
                <div className="h-[480px]">
                  <IncidentLogs logs={logs.filter(l => l.message.includes("SSI") || l.message.includes("AUTH"))} />
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
