'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, Rectangle, TileLayer, Tooltip } from 'react-leaflet';
import {
  catchBreaks,
  formatPosition,
  rampColor,
  type GroundCell,
} from '../lib/unloading-history/fishing-grounds';

export default function UnloadingFishingGroundsMap({ cells }: { cells: GroundCell[] }) {
  const breaks = catchBreaks(cells);
  return (
    <MapContainer
      center={[-2, 170]}
      zoom={3}
      minZoom={2}
      maxZoom={7}
      scrollWheelZoom={false}
      worldCopyJump={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
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
