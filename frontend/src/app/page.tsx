"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Activity,
  Map as MapIcon,
  Terminal as TerminalIcon,
  UserCheck,
  AlertTriangle,
  Cpu,
  Layers,
  Wifi,
  Globe,
  Database,
  Radio,
  FileText
} from "lucide-react";

export default function Home() {
  const [currentTime, setCurrentTime] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Keep a running log to simulate WebSocket telemetry streams
  useEffect(() => {
    setCurrentTime(new Date().toISOString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);

    const initialLogs = [
      "SYSTEM: NETRA core v1.0.0 initializing...",
      "NETRA // WS: Handshake initiated at ws://localhost:8000/telemetry",
      "SSI: Resolving W3C DID document did:netra:polygon:0x4d32f91a...",
      "SSI: Zero-Knowledge Proof validation succeeded for user Bhushan Wayal",
      "AI: anomaly detection model loaded (isolation_forest.pkl)",
      "SYS: CORS policies applied for local dashboard client",
      "NETRA // WS: Connection established. Awaiting stream packages...",
    ];
    setLogs(initialLogs);

    // Simulate logs incoming
    const logInterval = setInterval(() => {
      const mockEvents = [
        "AI // DETECT: Scanning telemetry payload coordinates [18.5204° N, 73.8567° E]...",
        "SSI // AUTH: Verification request for claim ID: 'TouristSafetyAccreditation'",
        "NETRA // WS: Telemetry frame rx - RSSI: -42dBm, Latency: 12ms",
        "SYS // HEALTH: DB pool status: ACTIVE | CPU Load: 1.4% | Memory: 420MB",
        "AI // SCORE: Anomaly factor verified at 0.12 (Normal - Safe)",
        "SSI // DID: Anchor state verified on Polygon Mainnet block #589201"
      ];
      const randomEvent = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
      setLogs((prev) => [...prev.slice(-15), `[${timestamp}] ${randomEvent}`]);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(logInterval);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-mono text-xs select-none">
      
      {/* 1. SIDE NAVIGATION PANEL - Rigid and Utilitarian */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col justify-between select-none">
        <div>
          {/* Brand/System Title */}
          <div className="p-4 border-b border-zinc-800 flex items-center gap-2 bg-zinc-950">
            <Shield className="h-5 w-5 text-zinc-400 animate-pulse" />
            <div>
              <div className="font-bold text-sm tracking-widest text-zinc-300">NETRA // CORE</div>
              <div className="text-[9px] text-zinc-500 font-semibold tracking-wider uppercase">DECENTRALIZED TOURIST SAFETY</div>
            </div>
          </div>

          {/* System Control Options */}
          <div className="p-2 space-y-1">
            <div className="px-3 py-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              Control Interface
            </div>
            
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors ${
                activeTab === "overview" ? "bg-zinc-800 text-zinc-100 border-l-2 border-zinc-400" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>SYSTEM OVERVIEW</span>
            </button>

            <button
              onClick={() => setActiveTab("map")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors ${
                activeTab === "map" ? "bg-zinc-800 text-zinc-100 border-l-2 border-zinc-400" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <MapIcon className="h-4 w-4" />
              <span>SPATIAL TELEMETRY</span>
            </button>

            <button
              onClick={() => setActiveTab("ssi")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors ${
                activeTab === "ssi" ? "bg-zinc-800 text-zinc-100 border-l-2 border-zinc-400" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>SSI REGISTRY</span>
            </button>

            <button
              onClick={() => setActiveTab("terminal")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors ${
                activeTab === "terminal" ? "bg-zinc-800 text-zinc-100 border-l-2 border-zinc-400" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <TerminalIcon className="h-4 w-4" />
              <span>OPERATOR SHELL</span>
            </button>
          </div>

          {/* System Hardware Status Monitors */}
          <div className="p-4 border-t border-zinc-800 mt-4 space-y-2">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Hardware Telemetry</div>
            
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5"><Cpu className="h-3 w-3" /> CPU LOAD</span>
              <span className="text-zinc-300">1.4%</span>
            </div>
            
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5"><Database className="h-3 w-3" /> RAM USE</span>
              <span className="text-zinc-300">420MB</span>
            </div>
            
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5"><Wifi className="h-3 w-3" /> COMMS</span>
              <span className="text-emerald-500">99.8%</span>
            </div>
          </div>
        </div>

        {/* Operator Profile and Session Security */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-300">
              BW
            </div>
            <div className="truncate">
              <div className="font-semibold text-zinc-300 truncate">Bhushan Wayal</div>
              <div className="text-[9px] text-emerald-500 tracking-wider font-bold">SECURE SESSION</div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN TELEMETRY CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        
        {/* Dynamic Dark Mode Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black tracking-widest text-zinc-200 flex items-center gap-2">
              NETRA // SYSTEM ACTIVE
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            </h2>
            <p className="text-[10px] text-zinc-500 tracking-widest uppercase">
              AWAITING LIVE TELEMETRY STREAM...
            </p>
          </div>
          
          {/* Live System Time / Stats */}
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <span className="text-[9px] text-zinc-500 block">SYSTEM UTC TIME</span>
              <span className="text-zinc-300 text-xs font-semibold">{currentTime || "Loading..."}</span>
            </div>
            <div className="px-3 py-1.5 border border-emerald-800/50 bg-emerald-950/20 rounded flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span className="text-emerald-500 text-[10px] font-bold tracking-wider">WS LNK CON</span>
            </div>
          </div>
        </header>

        {/* Real-time telemetry grid */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* System Telemetry Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-zinc-800 bg-zinc-900/40 p-3 rounded">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Packet Latency</div>
              <div className="text-lg font-bold text-zinc-200">12ms</div>
              <div className="text-[9px] text-emerald-500 font-semibold mt-1">STATUS: OPERATIONAL</div>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/40 p-3 rounded">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Blockchain Peer Nodes</div>
              <div className="text-lg font-bold text-zinc-200">24/24 Online</div>
              <div className="text-[9px] text-emerald-500 font-semibold mt-1">SSI SIMULATION RUNNING</div>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/40 p-3 rounded">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Active SSI credentials</div>
              <div className="text-lg font-bold text-zinc-200">1,402 Verified</div>
              <div className="text-[9px] text-zinc-500 mt-1">DID SCHEMA: W3C SPEC</div>
            </div>
            {/* THREAT WARNING WIDGET - Uses alert colors (Red/Amber) strictly reserved for alerts */}
            <div className="border border-red-900/50 bg-red-950/20 p-3 rounded">
              <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-red-500" /> Anomalies Flagged
              </div>
              <div className="text-lg font-bold text-red-500">03 ACTIVE</div>
              <div className="text-[9px] text-red-400 font-semibold mt-1 animate-pulse">ACTION LEVEL: ELEVATED</div>
            </div>
          </div>

          {/* Interactive Grid Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1 & 2: Main Telemetry Display (Maps, Analytics) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Map Telemetry Pane */}
              <div className="border border-zinc-800 bg-zinc-900/50 rounded overflow-hidden">
                <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapIcon className="h-4 w-4 text-zinc-400" />
                    <span className="font-bold text-zinc-300">SPATIAL TELEMETRY MATRIX</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono uppercase">GRID COORDS // L.M.A.P.</span>
                </div>
                
                {/* Visual Tactical Grid Overlay Simulating Leaflet Map Placeholder */}
                <div className="h-96 relative bg-zinc-950 overflow-hidden flex items-center justify-center border-b border-zinc-900">
                  {/* Grid Lines Overlay */}
                  <div 
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, #3f3f46 1px, transparent 1px),
                        linear-gradient(to bottom, #3f3f46 1px, transparent 1px)
                      `,
                      backgroundSize: '40px 40px'
                    }}
                  />
                  
                  {/* Outer Map Radar HUD */}
                  <div className="absolute top-4 left-4 text-[10px] text-emerald-500/80 bg-zinc-900/90 border border-zinc-800 p-2 rounded backdrop-blur space-y-1">
                    <div>LAT: 18.5204° N</div>
                    <div>LON: 73.8567° E</div>
                    <div>ALT: 560M</div>
                    <div>SYS_GRID: ID-8942A</div>
                  </div>

                  {/* Red/Amber Threat Alerts Overlay on Map */}
                  <div className="absolute bottom-4 left-4 text-[10px] text-red-400 bg-zinc-900/90 border border-red-900/60 p-2 rounded backdrop-blur">
                    <div className="font-bold flex items-center gap-1 text-red-500">
                      <AlertTriangle className="h-3 w-3 animate-ping" /> ANOMALY DETECTED
                    </div>
                    <div>COORDS: [18.5300° N, 73.8400° E]</div>
                    <div>SEVERITY: HIGH (DENSE POPULATION ZONE)</div>
                  </div>

                  {/* Tactical Target Indicator */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
                    <div className="h-24 w-24 border border-emerald-500/40 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
                      <div className="h-16 w-16 border border-emerald-500/20 border-dashed rounded-full" />
                    </div>
                    {/* Crosshairs */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-emerald-500/40 -translate-x-1/2" />
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-emerald-500/40 -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 bg-red-500 rounded-full animate-ping" />
                  </div>

                  {/* Telemetry Target Info */}
                  <div className="absolute top-4 right-4 text-[10px] text-zinc-400 bg-zinc-900/90 border border-zinc-800 p-2 rounded backdrop-blur max-w-[200px]">
                    <div className="text-zinc-300 font-bold border-b border-zinc-800 pb-1 mb-1">TARGET DETECTED</div>
                    <div>ID: did:netra:user_59</div>
                    <div>NAME: Bhushan Wayal</div>
                    <div>VERIFICATION: VERIFIED (SSI)</div>
                    <div>SIGNAL: STRONG</div>
                  </div>

                  <span className="text-[11px] text-zinc-500 font-semibold tracking-widest z-10 select-none">
                    [ MAP TELEMETRY CONTAINER // LEAFLET READY ]
                  </span>
                </div>
                
                <div className="p-3 bg-zinc-900/30 flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
                    <Globe className="h-3.5 w-3.5" /> GPS SATELLITES: GLONASS/GPS FIXED (12 HASH_REF)
                  </span>
                  <span className="text-zinc-500 text-[10px]">VECTOR_RADAR: ONLINE</span>
                </div>
              </div>

              {/* AI Anomaly Metrics Pane */}
              <div className="border border-zinc-800 bg-zinc-900/50 rounded overflow-hidden">
                <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-zinc-400" />
                    <span className="font-bold text-zinc-300">AI PREDICTIVE ANOMALY MODEL</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono">ISOLATION_FOREST_SCORING</span>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950">
                  <div className="border border-zinc-800 p-3 rounded bg-zinc-900/40">
                    <div className="text-zinc-400 font-bold text-[10px] tracking-wide mb-2 uppercase">Safety Index Distribution</div>
                    {/* Simplified High-fidelity CSS Chart Grid */}
                    <div className="space-y-2 mt-1">
                      <div>
                        <div className="flex justify-between text-zinc-500 text-[9px] mb-0.5">
                          <span>GEOMETRY SPATIAL RISK</span>
                          <span className="text-zinc-300">0.08 (LOW)</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-sm overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '8%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-zinc-500 text-[9px] mb-0.5">
                          <span>CROWD ANOMALY FACTOR</span>
                          <span className="text-zinc-300">0.15 (LOW)</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-sm overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '15%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-zinc-500 text-[9px] mb-0.5">
                          <span>OPERATIONAL HEALTH SCORE</span>
                          <span className="text-zinc-300">0.82 (OPTIMAL)</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-sm overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '82%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-zinc-800 p-3 rounded bg-zinc-900/40 flex flex-col justify-between">
                    <div>
                      <div className="text-zinc-400 font-bold text-[10px] tracking-wide mb-2 uppercase">Model Metadata</div>
                      <div className="grid grid-cols-2 gap-2 text-zinc-500 text-[10px]">
                        <div>Model Type:</div>
                        <div className="text-zinc-300 font-bold">Unsupervised Forest</div>
                        <div>Features Vector:</div>
                        <div className="text-zinc-300 font-bold">6-Dim Telemetry</div>
                        <div>Decision Boundary:</div>
                        <div className="text-zinc-300 font-bold">Threshold 0.45</div>
                        <div>ZKP Verified:</div>
                        <div className="text-emerald-500 font-bold">YES (Polygon)</div>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-zinc-800 pt-2 flex justify-between items-center text-[10px]">
                      <span className="text-zinc-500">LAST SYNC INDEX:</span>
                      <span className="text-zinc-300 font-mono">1.043-F</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: SSI Verification & Logs */}
            <div className="space-y-6">
              
              {/* W3C DID Verification Panel */}
              <div className="border border-zinc-800 bg-zinc-900/50 rounded overflow-hidden">
                <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-zinc-400" />
                    <span className="font-bold text-zinc-300">W3C SSI VERIFICATION</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono">SECURE_BLOCKCHAIN</span>
                </div>

                <div className="p-4 space-y-3 bg-zinc-950">
                  <div className="border border-zinc-800 p-2.5 rounded bg-zinc-900/40">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Active Wallet Connect</div>
                    <div className="flex items-center justify-between">
                      <code className="text-zinc-300 text-[10px]">0x992B...27E6f91</code>
                      <span className="text-emerald-500 text-[9px] font-bold">POLYGON LINKED</span>
                    </div>
                  </div>

                  <div className="border border-zinc-800 p-2.5 rounded bg-zinc-900/40 space-y-2">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider border-b border-zinc-800/80 pb-1 mb-1">Decentralized ID Info</div>
                    
                    <div className="flex justify-between">
                      <span className="text-zinc-500">DID String:</span>
                      <span className="text-zinc-300 text-[10px] font-semibold truncate max-w-[140px]" title="did:netra:polygon:0xBhushanWayal2026">
                        did:netra:polygon:0xBhushanWayal
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-500">Subject Name:</span>
                      <span className="text-zinc-300 font-semibold">Bhushan Wayal</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-500">Credentials:</span>
                      <span className="text-emerald-400 font-semibold">1 Validated VC</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-500">ZKP Shielding:</span>
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <Shield className="h-3 w-3 text-emerald-500" /> ACTIVE
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 border border-zinc-800 bg-zinc-900/40 rounded">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Identity Trust Rating</div>
                    <div className="flex items-center gap-2">
                      <div className="text-base font-black text-emerald-500">99.8%</div>
                      <div className="text-[9px] text-zinc-500 leading-tight">Zero identity anomalies flagged on ledger.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time system logs console */}
              <div className="border border-zinc-800 bg-zinc-900/50 rounded overflow-hidden">
                <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TerminalIcon className="h-4 w-4 text-zinc-400" />
                    <span className="font-bold text-zinc-300">TELEMETRY SHELL FEED</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono uppercase">Live // ws</span>
                </div>

                <div className="p-4 bg-zinc-950 font-mono text-[9.5px] text-zinc-400 h-64 overflow-y-auto space-y-1">
                  {logs.map((log, index) => {
                    const isSystem = log.includes("SYSTEM") || log.includes("SYS");
                    const isError = log.includes("ERROR") || log.includes("ALERT") || log.includes("ANOMALY");
                    const isAuth = log.includes("SSI") || log.includes("AUTH");

                    let colorClass = "text-zinc-400";
                    if (isSystem) colorClass = "text-zinc-500";
                    if (isError) colorClass = "text-red-400 font-bold";
                    if (isAuth) colorClass = "text-emerald-400";

                    return (
                      <div key={index} className={`truncate border-b border-zinc-900/20 pb-0.5 ${colorClass}`}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
