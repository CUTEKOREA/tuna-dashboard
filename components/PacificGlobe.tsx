'use client';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

const FLEET_DATA = [
  { name: 'S/SPR', lat: -2.60, lng: 178.70 },
  { name: 'S/EXP', lat: 1.45, lng: 173.00 },
  { name: 'S/JUP', lat: 1.45, lng: 173.00 },
  { name: 'S/CHA', lat: -2.55, lng: 178.78 },
  { name: 'S/PIO', lat: -2.77, lng: 179.23 },
  { name: 'S/HAR', lat: -2.77, lng: 178.92 },
  { name: 'KONA', lat: 0.45, lng: 174.08 },
  { name: 'MARI', lat: -2.12, lng: 177.88 },
  { name: 'N/SUN', lat: -2.10, lng: 178.57 },
  { name: 'N/STAR', lat: -2.47, lng: 178.08 }
];

const REEFER_ARCS = [
  { vessel: 'GENTA MARU', startLat: 22.6, startLng: 120.3, endLat: 13.7, endLng: 100.5, color: ['rgba(236,72,153,0.1)', '#ec4899'], from: 'Kaohsiung', to: 'Bangkok' },
  { vessel: 'SEI SHIN', startLat: 13.7, startLng: 100.5, endLat: -5.3, endLng: 170.1, color: ['rgba(59,130,246,0.1)', 'var(--color-info)'], from: 'Bangkok', to: 'Fishing Ground' },
  { vessel: 'P-505', startLat: -2.1, startLng: 160.8, endLat: -6.2, endLng: 172.5, color: ['rgba(234,179,8,0.1)', '#eab308'], from: 'S/EXP', to: 'MARI' }
];

export default function PacificGlobe() {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 550 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight || 550
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 550
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Focus the camera on the Pacific Ocean (where the fleet is)
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 0, lng: 160, altitude: 2.0 }, 1000);
    }
  }, []);

  const ringsData = FLEET_DATA.map(v => ({
    lat: v.lat,
    lng: v.lng,
    maxR: 2.5,
    propagationSpeed: 1,
    repeatPeriod: 1500,
    name: v.name
  }));

  const labelsData = FLEET_DATA.map(v => ({
    lat: v.lat,
    lng: v.lng,
    text: v.name,
    size: 1.0,
    color: 'rgba(255,255,255,0.8)'
  }));

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '550px', background: '#020617', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere={true}
          atmosphereColor="var(--color-info)"
          atmosphereAltitude={0.15}
          
          /* Arcs for Reefers */
          arcsData={REEFER_ARCS}
          arcStartLat={(d: any) => d.startLat}
          arcStartLng={(d: any) => d.startLng}
          arcEndLat={(d: any) => d.endLat}
          arcEndLng={(d: any) => d.endLng}
          arcColor={(d: any) => d.color}
          arcDashLength={0.4}
          arcDashGap={4}
          arcDashInitialGap={() => Math.random() * 5}
          arcDashAnimateTime={2500}
          arcStroke={1.5}
          arcLabel={(d: any) => `${d.vessel} (${d.from} → ${d.to})`}
          
          /* Rings for Fleet */
          ringsData={ringsData}
          ringColor={() => 'var(--color-danger)'}
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"

          /* Labels for Fleet */
          labelsData={labelsData}
          labelLat={(d: any) => d.lat}
          labelLng={(d: any) => d.lng}
          labelText={(d: any) => d.text}
          labelSize={(d: any) => d.size}
          labelColor={(d: any) => d.color}
          labelDotRadius={0.5}
          labelAltitude={0.01}
        />
      )}
      <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(0, 0, 0, 0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--w-slate-200)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-danger)', boxShadow: '0 0 8px var(--w-red-500)' }}></span>
          참치 선망선 (Seiners)
        </h4>
        <h4 style={{ margin: '0', fontSize: '13px', color: 'var(--w-slate-200)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-info)', boxShadow: '0 0 8px var(--w-blue-500)' }}></span>
          운반선 경로 (Reefers)
        </h4>
      </div>
    </div>
  );
}
