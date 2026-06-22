import React, { useState, useEffect } from "react";
import { Radio, RefreshCw } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  onReconnect: () => void;
}

export default function Header({ isConnected, onReconnect }: HeaderProps) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTimeStr(new Date().toISOString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between select-none">
      <div>
        <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-200 flex items-center gap-2">
          NETRA // SYSTEM ACTIVE
          <span className={`inline-block h-2 w-2 rounded-full ${
            isConnected ? "bg-emerald-500 animate-ping" : "bg-red-500"
          }`} />
        </h2>
        <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">
          {isConnected ? "AWAITING LIVE TELEMETRY STREAM..." : "CONNECTION INTERRUPTED - OFFLINE"}
        </p>
      </div>

      <div className="flex items-center gap-6 font-mono text-[10px]">
        {/* UTC Time */}
        <div className="text-right hidden sm:block">
          <span className="text-zinc-500 mr-2">SYSTEM UTC TIME:</span>
          <span className="text-zinc-300 font-bold">{timeStr || "LOADING..."}</span>
        </div>

        {/* WebSocket Connection Status */}
        <div className="flex items-center gap-3">
          {!isConnected && (
            <button
              onClick={onReconnect}
              className="px-2 py-1 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-300 rounded flex items-center gap-1 transition-colors"
              title="Reconnect Websocket"
            >
              <RefreshCw className="h-3.5 w-3.5" /> RECONNECT
            </button>
          )}
          <div className={`px-2.5 py-1 border rounded flex items-center gap-1.5 font-bold ${
            isConnected 
              ? "border-emerald-800/40 bg-emerald-950/20 text-emerald-500" 
              : "border-red-950/40 bg-red-950/20 text-red-500"
          }`}>
            <Radio className={`h-3.5 w-3.5 ${isConnected ? "animate-pulse" : ""}`} />
            <span>{isConnected ? "WS LNK CON" : "WS LNK ERR"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
