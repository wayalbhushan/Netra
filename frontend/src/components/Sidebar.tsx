import React from "react";
import { 
  Map as MapIcon, 
  AlertTriangle, 
  UserCheck, 
  Settings, 
  Shield, 
  Cpu, 
  Database, 
  Wifi, 
  Server 
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  metrics: {
    cpu_load: string;
    ram_use: string;
    peer_nodes: string;
    comms_health: string;
  };
}

export default function Sidebar({ activeTab, setActiveTab, metrics }: SidebarProps) {
  const menuItems = [
    { id: "overview", label: "TACTICAL OVERVIEW", icon: Shield },
    { id: "map", label: "SPATIAL TELEMETRY", icon: MapIcon },
    { id: "ssi", label: "SSI REGISTRY", icon: UserCheck },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2 bg-zinc-950">
          <Shield className="h-5 w-5 text-zinc-400" />
          <div>
            <div className="font-mono font-bold text-sm tracking-widest text-zinc-300">NETRA // CORE</div>
            <div className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase font-semibold">
              Tourist Safety Mon
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-2 space-y-1">
          <div className="px-3 py-2 text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider">
            Control Console
          </div>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left font-mono text-[11px] transition-colors ${
                  isActive 
                    ? "bg-zinc-800 text-zinc-100 border-l-2 border-zinc-400 font-bold" 
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Diagnostic Panel */}
        <div className="p-4 border-t border-zinc-800 mt-4 space-y-2.5">
          <div className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider mb-1">
            Hardware Telemetry
          </div>
          
          <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px]">
            <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-zinc-500" /> CPU LOAD</span>
            <span className="text-zinc-300 font-bold">{metrics.cpu_load}</span>
          </div>
          
          <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px]">
            <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-zinc-500" /> RAM USE</span>
            <span className="text-zinc-300 font-bold">{metrics.ram_use}</span>
          </div>
          
          <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px]">
            <span className="flex items-center gap-1.5"><Server className="h-3.5 w-3.5 text-zinc-500" /> PEER NODES</span>
            <span className="text-zinc-300 font-bold">{metrics.peer_nodes}</span>
          </div>
          
          <div className="flex items-center justify-between text-zinc-400 font-mono text-[10px]">
            <span className="flex items-center gap-1.5"><Wifi className="h-3.5 w-3.5 text-zinc-500" /> COMMS LNK</span>
            <span className="text-emerald-500 font-bold">{metrics.comms_health}</span>
          </div>
        </div>
      </div>

      {/* Operator Session Info */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs text-zinc-300">
            BW
          </div>
          <div className="truncate">
            <div className="font-mono font-bold text-[11px] text-zinc-300 truncate">Bhushan Wayal</div>
            <div className="text-[9px] font-mono text-emerald-500 tracking-wider font-semibold uppercase">
              SECURE OPERATOR
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
