'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo } from 'react';
import type { LatLngBoundsExpression } from 'leaflet';
import { MapContainer, Rectangle, TileLayer, Tooltip, useMap } from 'react-leaflet';
import {
  catchBreaks,
  formatPosition,
  rampColor,
  type GroundCell,
} from '../lib/unloading-history/fishing-grounds';

function FitToCells({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    const refit = () => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [16, 16], maxZoom: 6 });
    };
    const observer = new ResizeObserver(() => {
      if (map.getContainer().clientWidth > 0) refit();
    });
    observer.observe(map.getContainer());
    const t = window.setTimeout(refit, 300);
    return () => { observer.disconnect(); window.clearTimeout(t); };
  }, [map, bounds]);
  return null;
}

export default function UnloadingFishingGroundsMap({ cells }: { cells: GroundCell[] }) {
  const breaks = catchBreaks(cells);
  const bounds = useMemo<LatLngBoundsExpression>(() => [
    [Math.min(...cells.map((c) => c[0])) - 1, Math.min(...cells.map((c) => c[1])) - 1],
    [Math.max(...cells.map((c) => c[0])) + 1, Math.max(...cells.map((c) => c[1])) + 1],
  ], [cells]);
  return (
    <MapContainer
      bounds={bounds}
      minZoom={2}
      maxZoom={7}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', background: '#dbeafe' }}
    >
      <FitToCells bounds={bounds} />
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
        attribution="지도 타일 &copy; Esri - GEBCO · NOAA · National Geographic · Garmin 등 출처 포함"
        maxZoom={13}
      />
      {cells.map(([lat, lon, sets, catchMt]) => (
        <Rectangle
          key={`${lat}:${lon}`}
          bounds={[[lat - 0.5, lon - 0.5], [lat + 0.5, lon + 0.5]]}
          pathOptions={{ weight: 0.5, color: '#0f172a', opacity: 0.35, fillColor: rampColor(catchMt, breaks), fillOpacity: 0.72 }}
        >
          <Tooltip sticky>
            {formatPosition(lat, lon)}
            <br />
            투망 {sets}회 · {catchMt.toLocaleString('ko-KR')} MT
          </Tooltip>
        </Rectangle>
      ))}
    </MapContainer>
  );
}
