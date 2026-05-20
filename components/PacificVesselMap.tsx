'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Rectangle, Circle, GeoJSON, Polyline } from 'react-leaflet';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in Next.js (Webpack)
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for bunkering ports (MGO)
const BunkeringIcon = L.divIcon({
  html: '<div style="font-size: 20px; background: #1f2937; border: 2px solid #22c55e; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(34,197,94,0.5);">⛽</div>',
  className: 'custom-bunkering-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  tooltipAnchor: [16, 0]
});

// FAD Icon with CSS Sonar Pings
const FadIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="position: absolute; top:0; left:0; width: 100%; height: 100%; border-radius: 50%; animation: sonar-ping 2s infinite ease-out;"></div>
      <div style="position: absolute; top:0; left:0; width: 100%; height: 100%; border-radius: 50%; animation: sonar-ping 2s infinite ease-out 1s;"></div>
      <div style="position: absolute; top:0; left:0; font-size: 12px; background: rgba(0, 0, 0, 0.2); border: 2px solid #3b82f6; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px #3b82f6; z-index: 10;">📡</div>
    </div>
  `,
  className: 'custom-fad-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  tooltipAnchor: [12, -5]
});

// Calculate Nautical Miles
function getDistanceNM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
  return Math.round(12742 * Math.asin(Math.sqrt(a)) * 0.539957);
}

const BASE_PACIFIC_VESSELS = [
  { name: 'S/EXP', lat: 1.45, lng: 173.00, locationText: 'TARAWA', dailyCatch: '-', load: '-', notice: '4/25 17:30 TARAWA 입항, BAO LUCKY 및 SHIN IZU 편 약 890톤 전재, 발전기 수리 및 EU 검사, 선급검사, 어창온도 모니터링 설비 설치 후 5/1 출항 예정' },
  { name: 'S/PIO', lat: -3.35, lng: 178.40, locationText: 'S0321 E17824 (KI)', dailyCatch: '35', load: '45', notice: '-' },
  { name: 'S/CHA', lat: -3.18, lng: 178.38, locationText: 'S0311 E17823 (KI)', dailyCatch: '15', load: '15', notice: '-' },
  { name: 'S/HAR', lat: 0.96, lng: 177.91, locationText: 'N0058 E17755 (KI)', dailyCatch: '-', load: '620', notice: '-' },
  { name: 'S/JUP', lat: 1.45, lng: 173.00, locationText: 'TARAWA', dailyCatch: '-', load: '-', notice: '4/26 08:20 TARAWA 입항, SHIN IZU 편 약 730톤 전재 및 EU 검사, 선급검사, 어창온도 모니터링 설비 설치 후 4/30 출항 예정' },
  { name: 'S/SPR', lat: 1.56, lng: 177.26, locationText: 'N0134 E17716 (KI)', dailyCatch: '60', load: '1,005', notice: '5/1 09:00 TARAWA 입항, SHIN IZU 편 약 1,005톤 전재 후 5/4 출항 예정' },
  { name: 'MOAMARI', lat: 0.95, lng: 177.90, locationText: 'N0057 E17754 (KI)', dailyCatch: '-', load: '160', notice: '-' },
  { name: 'MOAKONA', lat: 0.38, lng: 178.05, locationText: 'N0023 E17803 (KI)', dailyCatch: '-', load: '-', notice: '-' },
  { name: 'NAOERO SUN', lat: -2.71, lng: 179.41, locationText: 'S0243 E17925 (KI)', dailyCatch: '-', load: '502', notice: '-' },
  { name: 'NAOERO STAR', lat: -3.43, lng: -177.80, locationText: 'S0326 W17748 (H)', dailyCatch: '215', load: '555', notice: '-' },
];

const PACIFIC_VESSELS = BASE_PACIFIC_VESSELS.map((v, i) => {
  const seedRandom = (seed: number) => { let x = Math.sin(seed) * 10000; return x - Math.floor(x); };
  const totalLoad = parseInt(v.load.split('(')[0].replace(/,/g, '')) || 0;
  const holds: { id: string, capacity: number, filled: number, species: string }[] = [];
  let remaining = totalLoad;
  for (let h = 1; h <= 5; h++) {
    for (const side of ['P', 'S']) {
      const cap = Math.floor(100 + seedRandom(i * 100 + h) * 50);
      const fill = remaining > cap ? cap : remaining;
      remaining -= fill > 0 ? fill : 0;
      const rand = seedRandom(i * 50 + h);
      const species = fill > 0 ? (rand > 0.7 ? 'YFT' : 'SKJ') : 'EMPTY';
      holds.push({ id: `${h}${side}`, capacity: cap, filled: fill, species });
    }
  }
  return { ...v, holds };
});

interface PacificVesselMapProps {
  defaultEezActive?: boolean;
}

export default function PacificVesselMap({ defaultEezActive = false }: PacificVesselMapProps) {
  const router = useRouter();
  const [ensoMode, setEnsoMode] = useState<'Neutral' | 'El Nino' | 'La Nina'>('Neutral');
  const [typhoonActive, setTyphoonActive] = useState(false);
  const [typhoonData, setTyphoonData] = useState<any>(null);
  const [typhoonCentroids, setTyphoonCentroids] = useState<[number, number][]>([]);
  const [bunkeringActive, setBunkeringActive] = useState(false);
  const [fadActive, setFadActive] = useState(false);
  const [voyageActive, setVoyageActive] = useState(false);
  const [forwardSalesActive, setForwardSalesActive] = useState(false);
  const [eezActive, setEezActive] = useState(defaultEezActive);
  const [liveMgoPrice, setLiveMgoPrice] = useState<number | null>(null);
  const [selectedVesselName, setSelectedVesselName] = useState('S/SPR');

  const BUNKERING_PORTS = [
    { name: 'Majuro (RMI)', lat: 7.10, lng: 171.37, priceOffset: -40, recommended: true },
    { name: 'Tarawa (Kiribati)', lat: 1.43, lng: 173.00, priceOffset: 0, recommended: false },
    { name: 'Pohnpei (FSM)', lat: 6.96, lng: 158.21, priceOffset: +5, recommended: false },
  ];

  const FAD_NODES = [
    { id: 'FAD-Alpha', lat: 1.25, lng: 165.10, biomass: 1250, depth: '75m', temp: '29.5°C' },
    { id: 'FAD-Beta', lat: -2.40, lng: 170.80, biomass: 3400, depth: '60m', temp: '29.8°C' }, 
    { id: 'FAD-Gamma', lat: -4.10, lng: 178.50, biomass: 800, depth: '110m', temp: '28.5°C' },
    { id: 'FAD-Delta', lat: 3.50, lng: -175.20, biomass: 2100, depth: '85m', temp: '29.1°C' },
    { id: 'FAD-Echo', lat: -1.80, lng: 155.30, biomass: 450, depth: '150m', temp: '27.9°C' },
  ];

  const PNA_EEZ_DATA = [
    { country: '키리바시 (Kiribati)', lat: 1.8, lng: 173.0, radius: 1000000, color: '#3b82f6', area: '355만 km²' },
    { country: '파푸아뉴기니 (PNG)', lat: -5.0, lng: 148.0, radius: 1000000, color: '#10b981', area: '312만 km²' },
    { country: '마이크로네시아 (FSM)', lat: 7.0, lng: 150.0, radius: 950000, color: '#8b5cf6', area: '299만 km²' },
    { country: '마샬군도 (Marshall)', lat: 9.0, lng: 168.0, radius: 820000, color: '#f59e0b', area: '213만 km²' },
    { country: '솔로몬제도 (Solomon)', lat: -9.0, lng: 160.0, radius: 710000, color: '#ef4444', area: '160만 km²' },
    { country: '투발루 (Tuvalu)', lat: -8.0, lng: 178.0, radius: 530000, color: '#06b6d4', area: '90만 km²' },
    { country: '팔라우 (Palau)', lat: 7.5, lng: 134.5, radius: 440000, color: '#ec4899', area: '62만 km²' },
    { country: '나우루 (Nauru)', lat: -0.5, lng: 166.9, radius: 310000, color: '#f97316', area: '32만 km²' }
  ];

  useEffect(() => {
    if (bunkeringActive && liveMgoPrice === null) {
      fetch('/api/mgo')
        .then(res => res.ok ? res.json() : { price: 815 })
        .then(data => setLiveMgoPrice(data.price))
        .catch(() => setLiveMgoPrice(815));
    }
  }, [bunkeringActive, liveMgoPrice]);

  useEffect(() => {
    if (typhoonActive && !typhoonData) {
      fetch('/api/typhoon')
        .then(res => res.json())
        .then(data => {
          if (data && data.features) {
            setTyphoonData(data);
            const centroids = data.features
              .filter((f: any) => f.properties?.Class?.includes('Centroid') || f.geometry?.type === 'Point')
              .map((f: any) => [f.geometry.coordinates[1], f.geometry.coordinates[0]] as [number, number]);
            setTyphoonCentroids(centroids);
          }
        })
        .catch(err => console.error("Failed to fetch typhoon data:", err));
    }
  }, [typhoonActive, typhoonData]);

  const dangerRadiusDeg = 8; // Roughly 800km

  return (
    <>
      <style>{`
        .brighter-map-tiles { filter: brightness(1.05) contrast(1.05); }
        @keyframes flow-wave {
          0% { fill-opacity: 0.15; stroke-opacity: 0; }
          50% { fill-opacity: 0.35; stroke-opacity: 0.2; }
          100% { fill-opacity: 0.15; stroke-opacity: 0; }
        }
        .enso-wave-1 { animation: flow-wave 4s infinite ease-in-out; filter: blur(40px); }
        .enso-wave-2 { animation: flow-wave 6s infinite ease-in-out 1s; filter: blur(60px); }
        .enso-wave-3 { animation: flow-wave 8s infinite ease-in-out 2s; filter: blur(50px); }
        .enso-core   { animation: flow-wave 5s infinite ease-in-out; filter: blur(30px); }
        
        @keyframes defcon-pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.4; }
        }
        @keyframes storm-spin {
          100% { transform: rotate(360deg); }
        }
        .typhoon-core { animation: defcon-pulse 1s infinite; }
        
        @keyframes sonar-ping {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.8); }
          100% { box-shadow: 0 0 0 30px rgba(59, 130, 246, 0); }
        }
        .fad-heatmap-blur {
          filter: blur(25px);
          animation: defcon-pulse 3s infinite ease-in-out;
        }
        .custom-fad-icon {
          background: transparent !important;
          border: none !important;
        }
        .eez-number-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-tooltip {
          background: rgba(13, 17, 23, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          border-radius: 8px !important;
          color: #f8fafc !important;
          font-family: var(--font-sans), system-ui, sans-serif !important;
          font-size: 12px !important;
          padding: 10px 14px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6) !important;
          white-space: normal !important;
          min-width: 180px !important;
          z-index: 2000 !important;
        }
        .leaflet-tooltip-top::before { border-top-color: rgba(13, 17, 23, 0.95) !important; }
        .leaflet-tooltip-bottom::before { border-bottom-color: rgba(13, 17, 23, 0.95) !important; }
        .leaflet-tooltip-left::before { border-left-color: rgba(13, 17, 23, 0.95) !important; }
        .leaflet-tooltip-right::before { border-right-color: rgba(13, 17, 23, 0.95) !important; }
      `}</style>
      <div style={{ position: 'relative', height: '600px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: typhoonActive ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', boxShadow: typhoonActive ? '0 0 30px rgba(239, 68, 68, 0.5)' : 'none', transition: 'all 0.3s' }}>
        {typhoonActive && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'rgba(239, 68, 68, 0.1)', zIndex: 500, animation: 'defcon-pulse 2s infinite' }}></div>
        )}
        <MapContainer 
          center={[-1.0, 170.0]} 
          zoom={4} 
          scrollWheelZoom={false} 
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          className="brighter-map-tiles"
        />

        {/* Live Typhoon GeoJSON (GDACS) */}
        {typhoonActive && typhoonData && (
          <GeoJSON 
            key={typhoonData.features.length}
            data={typhoonData}
            style={(feature: any) => {
              if (feature?.properties?.Class?.includes('Poly')) {
                return { color: 'var(--color-danger)', weight: 1, fillOpacity: 0.15, dashArray: '4, 4' };
              }
              if (feature?.properties?.Class?.includes('Track') || feature?.geometry?.type === 'LineString') {
                return { color: '#f87171', weight: 2, dashArray: '5, 5' };
              }
              return { opacity: 0, fillOpacity: 0, weight: 0 };
            }}
            pointToLayer={(feature, latlng) => {
              if (feature.properties.Class?.includes('Centroid') || (feature.properties.eventtype === 'TC' && feature.geometry.type === 'Point')) {
                return L.circle(latlng, { radius: 300000, color: 'var(--color-danger)', fillColor: '#991b1b', fillOpacity: 0.6, className: 'typhoon-core' });
              }
              return L.circleMarker(latlng, { radius: 0, opacity: 0, fillOpacity: 0 });
            }}
            onEachFeature={(feature, layer) => {
              if (feature.properties?.name && (feature.properties.Class?.includes('Centroid') || feature.geometry.type === 'Point')) {
                layer.bindTooltip(`🚨 ${feature.properties.name}`, { permanent: false, direction: 'top' });
              }
            }}
          />
        )}

        {/* ENSO (El Nino / La Nina) Overlays (Sea Surface Temp Heatmaps) */}
        {ensoMode === 'El Nino' && (
          <>
            {/* Core Warm Pool (Deep Red / Purple) at Central/East Pacific */}
            <Circle center={[0, -110]} radius={2800000} className="enso-wave-1" pathOptions={{ stroke: false, fillColor: '#991b1b', fillOpacity: 0.5 }} />
            <Circle center={[0, -130]} radius={3500000} className="enso-wave-2" pathOptions={{ stroke: false, fillColor: 'var(--color-danger)', fillOpacity: 0.4 }} />
            <Circle center={[-5, -160]} radius={3000000} className="enso-wave-3" pathOptions={{ stroke: false, fillColor: '#f97316', fillOpacity: 0.35 }} />
            <Circle center={[5, -140]} radius={1500000} className="enso-core" pathOptions={{ stroke: false, fillColor: '#dc2626', fillOpacity: 0.6 }} />
            
            {/* Extended warming */}
            <Circle center={[0, 170]} radius={2000000} className="enso-wave-1" pathOptions={{ stroke: false, fillColor: 'var(--color-warning)', fillOpacity: 0.3 }} />
          </>
        )}

        {ensoMode === 'La Nina' && (
          <>
            {/* Cold Pool (Deep Blue) at Central/East Pacific */}
            <Circle center={[0, -130]} radius={4000000} className="enso-wave-1" pathOptions={{ stroke: false, fillColor: '#1e3a8a', fillOpacity: 0.5 }} />
            <Circle center={[0, -100]} radius={3000000} className="enso-wave-2" pathOptions={{ stroke: false, fillColor: 'var(--color-info)', fillOpacity: 0.4 }} />
            <Circle center={[-5, -150]} radius={2000000} className="enso-core" pathOptions={{ stroke: false, fillColor: '#1d4ed8', fillOpacity: 0.6 }} />
            
            {/* Shifted Warm Pool (Red) far West Pacific / Indonesia */}
            <Circle center={[-2, 135]} radius={2500000} className="enso-wave-2" pathOptions={{ stroke: false, fillColor: 'var(--color-danger)', fillOpacity: 0.4 }} />
            <Circle center={[5, 145]} radius={1500000} className="enso-wave-3" pathOptions={{ stroke: false, fillColor: '#f97316', fillOpacity: 0.35 }} />
            <Circle center={[0, 130]} radius={1800000} className="enso-core" pathOptions={{ stroke: false, fillColor: '#b91c1c', fillOpacity: 0.6 }} />
          </>
        )}

        {/* PNA EEZ Overlays — numbered markers, hover-only tooltip */}
        {eezActive && PNA_EEZ_DATA.map((eez, idx) => (
          <React.Fragment key={`eez-${idx}`}>
            <Circle 
              center={[eez.lat, eez.lng]} 
              radius={eez.radius} 
              pathOptions={{ 
                color: eez.color, 
                weight: 2, 
                fillColor: eez.color, 
                fillOpacity: 0.12,
                dashArray: '5, 5'
              }}
            >
              <Tooltip direction="top" opacity={0.95}>
                <div style={{ fontWeight: 'bold', color: eez.color, fontSize: '13px' }}>{eez.country}</div>
                <div style={{ color: '#cbd5e1', fontSize: '11px', marginTop: '2px' }}>면적: {eez.area}</div>
              </Tooltip>
            </Circle>
            {/* Numbered center marker */}
            <Marker
              position={[eez.lat, eez.lng]}
              icon={L.divIcon({
                html: `<div style="width:22px;height:22px;border-radius:50%;background:${eez.color};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;color:#fff;box-shadow:0 0 8px ${eez.color}80;border:2px solid rgba(255,255,255,0.4);">${idx + 1}</div>`,
                className: 'eez-number-marker',
                iconSize: [22, 22],
                iconAnchor: [11, 11],
              })}
            >
              <Tooltip direction="right" opacity={0.95}>
                <div style={{ fontWeight: 'bold', color: eez.color, fontSize: '13px' }}>{eez.country}</div>
                <div style={{ color: '#cbd5e1', fontSize: '11px', marginTop: '2px' }}>면적: {eez.area}</div>
              </Tooltip>
            </Marker>
          </React.Fragment>
        ))}

        {/* FAD Network Overlays */}
        {fadActive && FAD_NODES.map(fad => (
          <React.Fragment key={`fad-${fad.id}`}>
            {/* Heatmap blur for biomass */}
            {fad.biomass > 1000 && (
              <Circle 
                center={[fad.lat, fad.lng]} 
                radius={Math.min(fad.biomass * 100, 400000)} // max radius 400km
                pathOptions={{ 
                  stroke: false, 
                  fillColor: fad.biomass >= 3000 ? 'var(--color-danger)' : '#eab308', 
                  fillOpacity: fad.biomass >= 3000 ? 0.35 : 0.25 
                }}
                className="fad-heatmap-blur"
              />
            )}
            <Marker position={[fad.lat, fad.lng]} icon={FadIcon}>
              <Tooltip direction="top" opacity={1}>
                <div style={{ fontWeight: 'bold', color: '#60a5fa' }}>{fad.id}</div>
                <div style={{ color: '#94a3b8', fontSize: '11px' }}>어군량 (Biomass): <span style={{ color: fad.biomass >= 3000 ? 'var(--color-danger)' : '#f8fafc', fontWeight: 'bold' }}>{fad.biomass.toLocaleString()}톤</span></div>
                <div style={{ color: '#94a3b8', fontSize: '11px' }}>수심: {fad.depth} | 수온: {fad.temp}</div>
              </Tooltip>
            </Marker>
          </React.Fragment>
        ))}

        {PACIFIC_VESSELS.map((vessel, idx) => {
          const isDanger = typhoonActive && typhoonCentroids.some(center => Math.hypot(vessel.lat - center[0], vessel.lng - center[1]) < dangerRadiusDeg);
          const isBunkeringTarget = bunkeringActive && vessel.name === selectedVesselName;
          const isVoyageTarget = voyageActive && vessel.name === selectedVesselName;
          
          return (
            <Marker 
              key={idx} 
              position={[vessel.lat, vessel.lng]}
              eventHandlers={{
                click: () => setSelectedVesselName(vessel.name)
              }}
            >
              <Tooltip direction="top" offset={[-15, 0]} opacity={isBunkeringTarget || isVoyageTarget ? 1 : 0.9} permanent={isDanger || isBunkeringTarget || isVoyageTarget}>
                <div style={{ minWidth: '160px', maxWidth: '260px' }}>
                  <div style={{ color: isDanger ? 'var(--color-danger)' : isBunkeringTarget ? '#22c55e' : isVoyageTarget ? '#a855f7' : '#f8fafc', fontSize: '13px', fontWeight: 'bold' }}>
                    {isDanger ? '⚠️ DEFCON: EVACUATE' : isBunkeringTarget ? `🎯 ${vessel.name} (Bunker Target)` : isVoyageTarget ? `⚖️ ${vessel.name} (AI Target)` : vessel.name}
                  </div>
                  {!isBunkeringTarget && !isVoyageTarget && <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>{isDanger ? vessel.name : vessel.locationText}</div>}
                  {!isDanger && !isBunkeringTarget && !isVoyageTarget && <div style={{ color: 'var(--color-warning)', fontSize: '11px', marginTop: '4px' }}>어획량: {vessel.dailyCatch !== '-' ? `${vessel.dailyCatch}톤` : '-'} / 선적량: {vessel.load !== '-' ? `${vessel.load}톤` : '-'}</div>}
                  {(vessel as any).notice && (vessel as any).notice !== '-' && <div style={{ color: '#60a5fa', fontSize: '11px', marginTop: '4px', maxWidth: '240px', whiteSpace: 'normal', lineHeight: '1.4', wordBreak: 'keep-all' }}>{(vessel as any).notice}</div>}
                  {isBunkeringTarget && <div style={{ color: '#22c55e', fontSize: '11px', marginTop: '4px' }}>연료 잔량: 12% (Bunkering Req)</div>}
                  {isVoyageTarget && <div style={{ color: '#a855f7', fontSize: '11px', marginTop: '4px' }}>Voyage Optimizer Target</div>}
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* AI Bunkering Routing overlay */}
        {bunkeringActive && liveMgoPrice !== null && (() => {
          const targetVessel = PACIFIC_VESSELS.find(v => v.name === selectedVesselName) || PACIFIC_VESSELS[5];
          return (
          <>
            {BUNKERING_PORTS.map((port, idx) => {
              const portPrice = liveMgoPrice + port.priceOffset;
              return (
              <Marker key={`port-${idx}`} position={[port.lat, port.lng]} icon={BunkeringIcon}>
                <Tooltip direction="right" permanent opacity={1}>
                  <div style={{ fontWeight: 'bold', color: port.recommended ? '#22c55e' : '#f8fafc' }}>{port.name}</div>
                  <div style={{ color: port.recommended ? '#22c55e' : '#94a3b8', fontSize: '11px' }}>MGO: ${portPrice}/ton</div>
                </Tooltip>
              </Marker>
            )})}
            
            {/* Route to Bangkok (Voyage Target) */}
            {voyageActive && (
              <Polyline 
                positions={[[targetVessel.lat, targetVessel.lng], [13.72, 100.56]]} 
                color="#a855f7" 
                weight={3} 
                dashArray="10, 10" 
                opacity={1} 
                className="ai-route-anim"
              />
            )}
            
            {/* Route to Tarawa (Sub-optimal) */}
            <Polyline 
              positions={[[targetVessel.lat, targetVessel.lng], [1.43, 173.00]]} 
              color="var(--color-danger)" 
              weight={2} 
              dashArray="5, 10" 
              opacity={0.6} 
            />
            
            {/* AI Optimal Route to Majuro */}
            <Polyline 
              positions={[[targetVessel.lat, targetVessel.lng], [7.10, 171.37]]} 
              color="#22c55e" 
              weight={3} 
              dashArray="10, 10" 
              opacity={1} 
              className="ai-route-anim"
            />
            <style>{`
              .ai-route-anim {
                stroke-dashoffset: 40;
                animation: dash-flow 1.5s linear infinite;
              }
              @keyframes dash-flow {
                to { stroke-dashoffset: 0; }
              }
              @keyframes typing-effect {
                from { width: 0; }
                to { width: 100%; }
              }
            `}</style>
          </>
          );
        })()}
        {/* Easter egg clicking on South Korea */}
        <Rectangle 
          bounds={[ [33.0, 125.0], [38.5, 130.0] ]} 
          pathOptions={{ color: 'transparent', fillColor: 'transparent' }} 
          eventHandlers={{ click: () => router.push('/management') }}
        />
      </MapContainer>

      {/* SST Heatmap Legend */}
      {ensoMode !== 'Neutral' && (
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 1000, backgroundColor: 'rgba(13, 17, 23, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
            수온 이상 (Warm/Cold Pool)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#cbd5e1' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626', boxShadow: '0 0 10px #dc2626' }}></div>
            수온 +2°C 이상 (28~31°C)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#cbd5e1' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-warning)', boxShadow: '0 0 10px #f59e0b' }}></div>
            수온 +1°C (26~28°C)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#cbd5e1' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-info)', boxShadow: '0 0 10px #3b82f6' }}></div>
            수온 -1°C 이하 (&lt;24°C)
          </div>
        </div>
      )}

      {/* EEZ Legend Panel (left side) */}
      {eezActive && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, backgroundColor: 'rgba(13, 17, 23, 0.92)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '14px 16px', minWidth: '200px', maxWidth: '230px', backdropFilter: 'blur(8px)', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#34d399', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🌊 PNA EEZ 수역 범례
          </div>
          {PNA_EEZ_DATA.map((eez, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '11px', color: '#e2e8f0' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: eez.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#fff', flexShrink: 0, boxShadow: `0 0 6px ${eez.color}60`, border: '1.5px solid rgba(255,255,255,0.3)' }}>
                {idx + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: eez.color, fontSize: '11px', lineHeight: 1.3 }}>{eez.country.split(' (')[0]}</div>
                <div style={{ color: '#94a3b8', fontSize: '10px' }}>{eez.area}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '10px', color: '#64748b', lineHeight: 1.4 }}>
            마커에 마우스를 올리면 상세 정보
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000, backgroundColor: 'rgba(13, 17, 23, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px', display: 'flex', gap: '4px' }}>
        <button onClick={() => setEnsoMode('Neutral')} style={{ padding: '4px 10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: ensoMode === 'Neutral' ? '#374151' : 'transparent', color: ensoMode === 'Neutral' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>기본</button>
        <button onClick={() => setEnsoMode('El Nino')} style={{ padding: '4px 10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: ensoMode === 'El Nino' ? 'var(--color-danger)' : 'transparent', color: ensoMode === 'El Nino' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>엘니뇨(El Niño)</button>
        <button onClick={() => setEnsoMode('La Nina')} style={{ padding: '4px 10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: ensoMode === 'La Nina' ? 'var(--color-info)' : 'transparent', color: ensoMode === 'La Nina' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>라니냐(La Niña)</button>
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }}></div>
        
        <button 
          onClick={() => {
            setEezActive(!eezActive);
          }} 
          style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid #10b981', borderRadius: '4px', cursor: 'pointer', background: eezActive ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: '#10b981', fontWeight: 'bold', boxShadow: eezActive ? '0 0 10px rgba(16,185,129,0.4) inset' : 'none', transition: 'all 0.3s' }}
        >
          {eezActive ? '🌊 PNA EEZ (ON)' : '🌊 PNA EEZ 수역'}
        </button>

        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }}></div>
        
        <button 
          onClick={() => {
            setTyphoonActive(!typhoonActive);
            setBunkeringActive(false);
            setFadActive(false);
          }} 
          style={{ padding: '4px 10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: typhoonActive ? 'var(--color-danger)' : 'transparent', color: typhoonActive ? 'var(--text-primary)' : 'var(--color-danger)', fontWeight: 'bold' }}
        >
          {typhoonActive ? '🚨 경보 해제' : '🌪️ 태풍 시뮬레이션'}
        </button>
        
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }}></div>
        
        <button 
          onClick={() => {
            setFadActive(!fadActive);
            setBunkeringActive(false);
            setTyphoonActive(false);
            setVoyageActive(false);
          }} 
          style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid #3b82f6', borderRadius: '4px', cursor: 'pointer', background: fadActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: 'var(--color-info)', fontWeight: 'bold', boxShadow: fadActive ? '0 0 10px rgba(59,130,246,0.4) inset' : 'none', transition: 'all 0.3s' }}
        >
          {fadActive ? '📡 소나 탐지 종료' : '📡 FAD 소나 탐지'}
        </button>
        
        <button 
          onClick={() => {
            setVoyageActive(!voyageActive);
            setBunkeringActive(false);
            setTyphoonActive(false);
            setFadActive(false);
          }} 
          style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid #a855f7', borderRadius: '4px', cursor: 'pointer', background: voyageActive ? 'rgba(168, 85, 247, 0.2)' : 'transparent', color: '#a855f7', fontWeight: 'bold', boxShadow: voyageActive ? '0 0 10px rgba(168, 85, 247, 0.4) inset' : 'none', transition: 'all 0.3s' }}
        >
          {voyageActive ? '⚖️ AI 분석 종료' : '⚖️ AI 회항 분석'}
        </button>

        <button 
          onClick={() => {
            setBunkeringActive(!bunkeringActive);
            setTyphoonActive(false);
            setFadActive(false);
            setVoyageActive(false);
            setForwardSalesActive(false);
          }} 
          style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid #22c55e', borderRadius: '4px', cursor: 'pointer', background: bunkeringActive ? 'rgba(34, 197, 94, 0.2)' : 'transparent', color: '#22c55e', fontWeight: 'bold', boxShadow: bunkeringActive ? '0 0 10px rgba(34,197,94,0.4) inset' : 'none', transition: 'all 0.3s' }}
        >
          {bunkeringActive ? '🤖 AI Bunkering 종료' : '⚡ AI 급유 라우팅'}
        </button>

        <button 
          onClick={() => {
            setForwardSalesActive(!forwardSalesActive);
            setBunkeringActive(false);
            setTyphoonActive(false);
            setFadActive(false);
            setVoyageActive(false);
          }} 
          style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid #f59e0b', borderRadius: '4px', cursor: 'pointer', background: forwardSalesActive ? 'rgba(245, 158, 11, 0.2)' : 'transparent', color: 'var(--color-warning)', fontWeight: 'bold', boxShadow: forwardSalesActive ? '0 0 10px rgba(245,158,11,0.4) inset' : 'none', transition: 'all 0.3s', marginLeft: '4px' }}
        >
          {forwardSalesActive ? '💰 선도 거래 종료' : '💰 어창 모니터링'}
        </button>
      </div>

      {/* Semi-transparent Overlay Table / AI Analysis */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, backgroundColor: 'rgba(13, 17, 23, 0.85)', border: typhoonActive ? '1px solid rgba(239, 68, 68, 0.5)' : bunkeringActive ? '1px solid rgba(34, 197, 94, 0.5)' : fadActive ? '1px solid rgba(59, 130, 246, 0.5)' : forwardSalesActive ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '12px', width: '340px', maxHeight: '500px', overflowY: 'auto', color: 'var(--text-main)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)', transition: 'border 0.3s' }}>
        
        {bunkeringActive ? (() => {
          const targetVessel = PACIFIC_VESSELS.find(v => v.name === selectedVesselName) || PACIFIC_VESSELS[5];
          const distTarawa = getDistanceNM(targetVessel.lat, targetVessel.lng, 1.43, 173.00);
          const distMajuro = getDistanceNM(targetVessel.lat, targetVessel.lng, 7.10, 171.37);
          const steamingDiff = Math.abs(Math.round(((distMajuro - distTarawa) / 288) * 10) / 10);
          
          return (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', borderBottom: '1px solid rgba(34,197,94,0.3)', paddingBottom: '6px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', animation: 'defcon-pulse 1s infinite' }}></span>
              AI Bunkering Analysis
            </h4>
            
            {liveMgoPrice === null ? (
              <div style={{ color: '#a3a3a3', fontSize: '12px' }}>Fetching Live MGO Rates...</div>
            ) : (
            <div key={selectedVesselName} style={{ fontSize: '12px', lineHeight: '1.6', fontFamily: 'monospace', color: '#a3a3a3' }}>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 0.5s steps(30, end)' }}>
                {'>'} Target: <span style={{ color: 'var(--text-primary)' }}>{selectedVesselName}</span> (Req: 300 tons)
              </div>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 0.5s steps(30, end) 0.5s backwards' }}>
                {'>'} Scanning regional MGO prices...
              </div>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 1s steps(40, end) 1s backwards', display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span>Tarawa ({distTarawa} NM)</span> <span style={{ color: 'var(--color-danger)' }}>${liveMgoPrice}/ton</span>
              </div>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 1s steps(40, end) 1.5s backwards', display: 'flex', justifyContent: 'space-between' }}>
                <span>Majuro ({distMajuro} NM)</span> <span style={{ color: '#22c55e', fontWeight: 'bold' }}>${liveMgoPrice - 40}/ton</span>
              </div>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 1s steps(40, end) 2.5s backwards', marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                {'>'} Steaming diff: <span style={{ color: 'var(--color-danger)' }}>{steamingDiff} days</span>
              </div>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 1s steps(40, end) 3.2s backwards' }}>
                {'>'} Fuel price diff: <span style={{ color: '#22c55e' }}>-$40/ton</span>
              </div>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 1s steps(40, end) 4s backwards', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '13px', marginTop: '8px' }}>
                {'>'} Net Gain: <span style={{ color: '#22c55e' }}>+${(40 * 300).toLocaleString()} (est)</span>
              </div>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 0.5s steps(20, end) 5s backwards', marginTop: '8px', background: 'rgba(34,197,94,0.1)', padding: '4px', borderRadius: '4px', color: '#22c55e', textAlign: 'center' }}>
                ✓ RE-ROUTING TO MAJURO
              </div>
            </div>
            )}
          </div>
          );
        })() : fadActive ? (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', borderBottom: '1px solid rgba(59,130,246,0.3)', paddingBottom: '6px', color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--color-info)', borderRadius: '50%', animation: 'sonar-ping 1.5s infinite' }}></span>
              FAD Biomass Scan
            </h4>
            
            <div style={{ fontSize: '12px', lineHeight: '1.6', fontFamily: 'monospace', color: '#a3a3a3' }}>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 0.5s steps(30, end)' }}>
                {'>'} Scanning acoustic signatures...
              </div>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 0.5s steps(30, end) 0.5s backwards', marginBottom: '8px' }}>
                {'>'} 5 Nodes Responding, 1 Hotspot!
              </div>
              
              <div style={{ animation: 'typing-effect 1s steps(40, end) 1s backwards' }}>
                <table style={{ width: '100%', fontSize: '11px', marginTop: '8px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: '#586069', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ textAlign: 'left', paddingBottom: '4px' }}>Node ID</th>
                      <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Tons (Est)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...FAD_NODES].sort((a,b) => b.biomass - a.biomass).map((fad, i) => (
                      <tr key={i} style={{ borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '4px 0', color: fad.biomass >= 3000 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                          {fad.biomass >= 3000 && '🎯 '} {fad.id}
                        </td>
                        <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 'bold', color: fad.biomass >= 3000 ? 'var(--color-danger)' : fad.biomass >= 1000 ? '#eab308' : '#22c55e' }}>
                          {fad.biomass.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 0.5s steps(20, end) 2s backwards', marginTop: '12px', background: 'rgba(239,68,68,0.1)', padding: '6px', borderRadius: '4px', color: 'var(--color-danger)', textAlign: 'center', fontWeight: 'bold', border: '1px solid rgba(239,68,68,0.3)' }}>
                🚨 MASSIVE BIOMASS DETECTED<br/>
                DIRECTING FLEET TO FAD-Beta
              </div>
            </div>
          </div>
        ) : voyageActive ? (() => {
          const targetVessel = PACIFIC_VESSELS.find(v => v.name === selectedVesselName) || PACIFIC_VESSELS[5];
          const currentLoad = parseInt(targetVessel.load.split('(')[0]) || 0;
          const expectedDailyCatch = parseInt(targetVessel.dailyCatch) || 30;
          
          const MGO_PRICE = liveMgoPrice || 815;
          const SKJ_PRICE = 1500;
          const VDS_COST_PER_DAY = 12000;
          const FISHING_FUEL_PER_DAY = 5;
          const STEAMING_FUEL_PER_DAY = 15;
          const SPEED_KNOTS = 12;
          
          const distBangkok = getDistanceNM(targetVessel.lat, targetVessel.lng, 13.72, 100.56);
          const steamingDays = Math.round((distBangkok / (SPEED_KNOTS * 24)) * 10) / 10;
          
          const extraDays = 5;
          
          // Option A (Return Now)
          const optAVoyageFuelCost = steamingDays * STEAMING_FUEL_PER_DAY * MGO_PRICE;
          const optARevenue = currentLoad * SKJ_PRICE;
          const optAProfit = optARevenue - optAVoyageFuelCost;
          
          // Option B (Fish Extra Days)
          const newLoad = currentLoad + (extraDays * expectedDailyCatch);
          const fishingFuelCost = extraDays * FISHING_FUEL_PER_DAY * MGO_PRICE;
          const vdsTotalCost = extraDays * VDS_COST_PER_DAY;
          const optBTotalCost = fishingFuelCost + vdsTotalCost + optAVoyageFuelCost;
          const optBRevenue = newLoad * SKJ_PRICE;
          const optBProfit = optBRevenue - optBTotalCost;
          
          const diffProfit = optBProfit - optAProfit;
          const isBetterToFish = diffProfit > 0;

          return (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', borderBottom: '1px solid rgba(168,85,247,0.3)', paddingBottom: '6px', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#a855f7', borderRadius: '50%', animation: 'defcon-pulse 1s infinite' }}></span>
                Voyage vs Catch Simulator
              </h4>

              <div style={{ fontSize: '11px', lineHeight: '1.5', fontFamily: 'monospace', color: '#a3a3a3' }}>
                <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 0.5s steps(30, end)' }}>
                  {'>'} Target: <span style={{ color: 'var(--text-primary)' }}>{selectedVesselName}</span>
                </div>
                <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 0.5s steps(30, end) 0.5s backwards' }}>
                  {'>'} Current Load: <span style={{ color: 'var(--text-primary)' }}>{currentLoad}</span> t | Dist: <span style={{ color: 'var(--text-primary)' }}>{distBangkok}</span> NM
                </div>
                
                <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 1s steps(40, end) 1s backwards', marginTop: '8px', borderLeft: '2px solid #ef4444', paddingLeft: '6px' }}>
                  <div style={{ color: 'var(--text-primary)' }}>Opt A: Return Now</div>
                  <div>Rev: <span style={{ color: '#22c55e' }}>+${(optARevenue/1000).toFixed(1)}k</span> (Total Load)</div>
                  <div>Est Net: <span style={{ color: 'var(--color-danger)' }}>${(optAProfit/1000).toFixed(1)}k</span></div>
                </div>

                <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 1s steps(40, end) 2s backwards', marginTop: '8px', borderLeft: '2px solid #3b82f6', paddingLeft: '6px' }}>
                  <div style={{ color: 'var(--text-primary)' }}>Opt B: Fish +{extraDays} Days</div>
                  <div>Cost Add: <span style={{ color: '#f97316' }}>-${((fishingFuelCost + vdsTotalCost)/1000).toFixed(1)}k</span> (VDS+Fuel)</div>
                  <div>Est Net: <span style={{ color: 'var(--color-info)' }}>${(optBProfit/1000).toFixed(1)}k</span></div>
                </div>

                <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', animation: 'typing-effect 0.5s steps(20, end) 3.5s backwards', marginTop: '12px', background: isBetterToFish ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '6px', borderRadius: '4px', color: isBetterToFish ? '#22c55e' : 'var(--color-danger)', textAlign: 'center', fontWeight: 'bold', border: `1px solid ${isBetterToFish ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                  {isBetterToFish ? (
                    <>✔️ CONTINUE FISHING<br/>(+${(diffProfit/1000).toFixed(1)}k Margin)</>
                  ) : (
                    <>🚨 RETURN IMMEDIATELY<br/>(MGO/VDS Warning)</>
                  )}
                </div>
              </div>
            </div>
          );
        })() : forwardSalesActive ? (() => {
          const targetVessel = PACIFIC_VESSELS.find(v => v.name === selectedVesselName) || PACIFIC_VESSELS[5];
          const totalSKJ = targetVessel.holds?.filter((h: any) => h.species === 'SKJ').reduce((acc: number, h: any) => acc + h.filled, 0) || 0;
          const totalYFT = targetVessel.holds?.filter((h: any) => h.species === 'YFT').reduce((acc: number, h: any) => acc + h.filled, 0) || 0;
          return (
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', borderBottom: '1px solid rgba(245,158,11,0.3)', paddingBottom: '6px', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--color-warning)', borderRadius: '50%', animation: 'sonar-ping 1s infinite' }}></span>
                Forward Sales Radar
              </h4>
              <div style={{ fontSize: '12px', lineHeight: '1.6', fontFamily: 'monospace', color: '#a3a3a3' }}>
                <div style={{ marginBottom: '12px' }}>
                  {'>'} Target Vessel: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{targetVessel.name}</span><br />
                  {'>'} Current Position: <span style={{ color: 'var(--text-primary)' }}>{targetVessel.locationText}</span>
                </div>
                
                {/* Ship Cross Section (2x5 Grid) */}
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '40px 40px 10px 10px', padding: '16px 20px', width: '280px', margin: '0 auto', boxSizing: 'border-box' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {targetVessel.holds?.map((hold: any, i: number) => {
                      const isSKJ = hold.species === 'SKJ';
                      const isYFT = hold.species === 'YFT';
                      const color = isSKJ ? 'var(--color-danger)' : isYFT ? 'var(--color-warning)' : '#4b5563';
                      const bgFill = isSKJ ? 'rgba(239, 68, 68, 0.2)' : isYFT ? 'rgba(250, 204, 21, 0.2)' : 'rgba(75, 85, 99, 0.1)';
                      return (
                        <div key={i} style={{ 
                          border: `1px solid ${color}`, 
                          background: bgFill, 
                          borderRadius: '4px',
                          padding: '6px 4px',
                          textAlign: 'center',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(hold.filled / hold.capacity) * 100}%`, background: color, opacity: 0.3, zIndex: 0 }}></div>
                          <div style={{ position: 'relative', zIndex: 1, fontSize: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Hold {hold.id}</div>
                          <div style={{ position: 'relative', zIndex: 1, fontSize: '11px', color: color }}>
                            {hold.filled > 0 ? `${hold.filled}t (${hold.species})` : 'EMPTY'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sales Details */}
                <div style={{ marginTop: '16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Total Premium SKJ:</span>
                    <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>{totalSKJ} t</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Total Premium YFT:</span>
                    <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>{totalYFT} t</span>
                  </div>
                  <button style={{ width: '100%', background: 'var(--color-warning)', color: '#000', border: 'none', padding: '6px 0', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Generate Sales Sheet
                  </button>
                </div>

              </div>
            </div>
          );
        })() : (
          <>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px', color: typhoonActive ? 'var(--color-danger)' : 'inherit', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>{typhoonActive ? '🚨 DEFCON 선단 현황' : 'BB. 태평양 선망 : 4/29'}</span>
              {!typhoonActive && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>(일간: 325톤 / 월간 누계: 6,051톤 / 연간 누계: 25,789.5톤)</span>}
            </h4>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th style={{ textAlign: 'left', paddingBottom: '6px' }}>선박</th>
                  <th style={{ textAlign: 'right', paddingBottom: '6px' }}>어획량</th>
                  <th style={{ textAlign: 'right', paddingBottom: '6px' }}>선적량</th>
                </tr>
              </thead>
              <tbody>
                {PACIFIC_VESSELS.map((v, i) => {
                  const isDanger = typhoonActive && typhoonCentroids.some(center => Math.hypot(v.lat - center[0], v.lng - center[1]) < dangerRadiusDeg);
                  return (
                    <tr key={i} style={{ borderBottom: i < PACIFIC_VESSELS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'transparent' }}>
                      <td style={{ padding: '6px 4px', fontWeight: 'bold', color: isDanger ? 'var(--color-danger)' : 'inherit' }}>{v.name} {isDanger && '⚠️'}</td>
                      <td style={{ textAlign: 'right', padding: '6px 4px', color: isDanger ? '#fca5a5' : 'var(--accent-secondary)' }}>{v.dailyCatch !== '-' ? `${v.dailyCatch}톤` : '-'}</td>
                      <td style={{ textAlign: 'right', padding: '6px 4px', color: isDanger ? '#fca5a5' : 'var(--accent-danger)' }}>{v.load !== '-' ? `${v.load}톤` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
    </>
  );
}
