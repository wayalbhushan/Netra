"use client";
import React, { useEffect, useRef } from "react";
import { LogEvent } from "./types";

interface IncidentLogsProps {
  logs: LogEvent[];
}

export default function IncidentLogs({ logs }: IncidentLogsProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of terminal feed on log updates
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 border border-zinc-800 font-mono text-[10px]">
      {/* Console Header */}
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between select-none">
        <span className="font-bold text-zinc-300">TELEMETRY CONSOLE FEED</span>
        <span className="text-[8px] text-zinc-500 uppercase tracking-widest animate-pulse">
          Live Connection
        </span>
      </div>

      {/* Terminal logs list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1 bg-black/45 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {logs.length === 0 ? (
          <div className="text-zinc-600 text-center py-8">
            [ AWAITING INCOMING WS STREAM PAYLOADS... ]
          </div>
        ) : (
          logs.map((log) => {
            let colorClass = "text-zinc-400";
            let typeLabel = "[INFO]";

            if (log.type === "alert") {
              colorClass = "text-red-500 font-bold bg-red-950/20 px-1 border border-red-900/20";
              typeLabel = "[WARN]";
            } else if (log.type === "success") {
              colorClass = "text-emerald-500 font-semibold";
              typeLabel = "[AUTH]";
            }

            return (
              <div 
                key={log.id} 
                className={`py-0.5 border-b border-zinc-900/40 last:border-b-0 leading-relaxed break-all ${colorClass}`}
              >
                <span className="text-zinc-600 mr-2">[{log.timestamp}]</span>
                <span className="mr-1.5 font-bold">{typeLabel}</span>
                <span>{log.message}</span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
