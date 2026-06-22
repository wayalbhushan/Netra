"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import { TelemetryFrame } from "./types"; // We will create types.ts next

// Custom Map Panner component to zoom/pan to active tourist target updates
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

interface LiveMapProps {
  tourists: TelemetryFrame[];
}

export default function LiveMap({ tourists }: LiveMapProps) {
  const defaultCenter: [number, number] = [18.5204, 73.8567]; // Pune Core coordinates

  // Safe boundaries geofence zone
  const restrictedForestArea: [number, number][] = [
    [18.5300, 73.8400],
    [18.5400, 73.8400],
    [18.5400, 73.8500],
    [18.5300, 73.8500]
  ];

  // Custom marker generator utilizing pure CSS circular markers (avoiding broken image path links)
  const createTargetIcon = (did: string, anomaly: boolean) => {
    const colorClass = anomaly ? "bg-red-500 border-red-200" : "bg-emerald-500 border-emerald-200";
    const pingClass = anomaly ? "animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" : "";
    const shortDid = did.split(":").pop()?.slice(0, 6) || "TRST";
    
    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute -top-6 bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-[8px] px-1 py-0.5 rounded font-bold shadow whitespace-nowrap">
            ${shortDid}
          </span>
          <span class="relative flex h-4.5 w-4.5">
            <span class="${pingClass}"></span>
            <span class="relative inline-flex rounded-full h-4.5 w-4.5 border border-zinc-800 ${colorClass}"></span>
          </span>
        </div>
      `,
      className: "custom-target-icon",
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  // Resolve zoom panning targets
  const getPanCenter = (): [number, number] => {
    if (tourists.length > 0) {
      return [tourists[0].latitude, tourists[0].longitude];
    }
    return defaultCenter;
  };

  return (
    <div className="h-full w-full relative bg-zinc-950 flex flex-col">
      {/* HUD Info strip overlay */}
      <div className="absolute top-3 left-3 z-500 text-[9px] text-emerald-500/80 bg-zinc-900/90 border border-zinc-800 p-2 rounded backdrop-blur space-y-0.5 font-mono shadow-md">
        <div>LAT_REF: {getPanCenter()[0].toFixed(4)}° N</div>
        <div>LON_REF: {getPanCenter()[1].toFixed(4)}° E</div>
        <div>ZOOM_LEVEL: 14 // FIXED</div>
        <div>COMMS_GRID: ID-8942A</div>
      </div>

      {/* Map MapContainer */}
      <div className="flex-1 h-full w-full">
        <MapContainer
          center={defaultCenter}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
          zoomControl={false} // Disable to keep interface clean and utilitarian
        >
          {/* Slick dark tiles layer */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          <MapController center={getPanCenter()} />

          {/* Draw Geofenced Area */}
          <Polygon
            positions={restrictedForestArea}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: "3, 6"
            }}
          >
            <Popup>
              <div className="font-mono text-[10px] text-zinc-900 leading-tight">
                <span className="font-bold text-red-600">RESTRICTED ZONE BREACH</span>
                <br />
                Coordinates: [18.5300, 73.8400] to [18.5400, 73.8500]
              </div>
            </Popup>
          </Polygon>

          {/* Plot Active Tourists */}
          {tourists.map((tourist) => (
            <Marker
              key={tourist.did}
              position={[tourist.latitude, tourist.longitude]}
              icon={createTargetIcon(tourist.did, tourist.anomaly_detected)}
            >
              <Popup>
                <div className="font-mono text-[10px] text-zinc-900 space-y-1">
                  <div className="font-bold border-b pb-0.5">SUBJECT TARGET</div>
                  <div>DID: <span className="font-bold">{tourist.did.split(":").pop()?.slice(0, 10)}...</span></div>
                  <div>SPEED: <span className="font-bold">{tourist.speed.toFixed(2)} m/s</span></div>
                  <div>BATTERY: <span className="font-bold">{tourist.battery}%</span></div>
                  <div>SIGNAL: <span className="font-bold">{tourist.rssi} dBm</span></div>
                  <div>STATUS: <span className={tourist.anomaly_detected ? "font-bold text-red-600" : "font-bold text-emerald-600"}>
                    {tourist.anomaly_detected ? `ALERT: ${tourist.anomaly_type || "UNKNOWN RISK"}` : "NORMAL / SECURE"}
                  </span></div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Footer Details strip */}
      <div className="px-3 py-1.5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
        <span>GEOFENCE_BOUNDS: ACTIVE (4 VERTICES)</span>
        <span>RADAR_SWEEP: ACTIVE</span>
      </div>
    </div>
  );
}
