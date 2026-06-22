"use client";
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from "recharts";

interface ChartDataPoint {
  time: string;
  safety_score: number;
}

interface SafetyChartsProps {
  data: ChartDataPoint[];
}

export default function SafetyCharts({ data }: SafetyChartsProps) {
  // Ensure we display some placeholder data if there are no points yet
  const chartData = data.length > 0 ? data : [
    { time: "00:00", safety_score: 1.0 },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 p-4 border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
        <span className="font-mono text-xs font-bold text-zinc-300">
          AI ANOMALY SCORING FEED
        </span>
        <span className="text-[9px] font-mono text-zinc-500 uppercase">
          Rolling Safety Index
        </span>
      </div>

      <div className="flex-1 w-full min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis 
              dataKey="time" 
              stroke="#52525b" 
              tick={{ fill: "#a1a1aa", fontSize: 8, fontFamily: "monospace" }} 
              tickLine={false}
            />
            <YAxis 
              domain={[0, 1]} 
              stroke="#52525b"
              tick={{ fill: "#a1a1aa", fontSize: 8, fontFamily: "monospace" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: "#18181b", 
                borderColor: "#3f3f46", 
                borderRadius: "2px",
                fontFamily: "monospace",
                fontSize: "10px"
              }}
              labelStyle={{ color: "#a1a1aa" }}
              itemStyle={{ color: "#f4f4f5" }}
            />
            
            {/* Anomaly Threshold Line */}
            <ReferenceLine 
              y={0.45} 
              stroke="#ef4444" 
              strokeDasharray="4 4"
              label={{ 
                value: "THRESHOLD", 
                fill: "#ef4444", 
                fontSize: 8, 
                position: "insideBottomRight",
                fontFamily: "monospace"
              }} 
            />

            <Line
              type="monotone"
              dataKey="safety_score"
              stroke="#10b981"
              strokeWidth={1.5}
              dot={{ stroke: "#10b981", strokeWidth: 1, r: 2, fill: "#09090b" }}
              activeDot={{ r: 4, strokeWidth: 1 }}
              name="Safety Score"
              isAnimationActive={false} // Disable animations for performance and low-latency look
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span>NORMAL ZONE (&gt; 0.45)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded bg-red-500"></span>
          <span>ANOMALY WARNING ZONE (&le; 0.45)</span>
        </div>
      </div>
    </div>
  );
}
