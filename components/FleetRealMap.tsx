'use client';

import React, { useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { FleetDailyDetailPayload } from '@/lib/contracts/fleet-daily-api';
import { buildFleetRoster, formatFleetDailyNote } from '@/lib/fleet-daily-presentation';
import { parseFleetPosition, toPacificLng } from '@/lib/fleet-map-coords';

type FleetKind = 'pacific' | 'carrier' | 'atlantic';

const FLEET_STYLE: Record<FleetKind, { color: string; label: string; square: boolean }> = {
  pacific: { color: '#509ee3', label: '태평양 선망선', square: false },
  carrier: { color: '#689735', label: '운반선', square: true },
  atlantic: { color: '#f2a86f', label: '대서양 선망선', square: false },
};

const STATUS_VIEW: Record<string, { text: string; icon: string }> = {
  reported: { text: '보고 위치', icon: '📍' },
};

interface FleetRow {
  name: string;
  displayName: string;
  position: string | null;
  location: string | null;
  status: string;
  catchMt?: number | null;
  loadedMt: number | null;
  capacityMt?: number | null;
  note?: string;
}

interface MappedShip extends FleetRow {
  kind: FleetKind;
  lat: number;
  lng: number;
}

/**
 * 보고 좌표를 마커 좌표로 옮긴다. 같은 항구에 여러 척이 묶이면
 * 결정적(무작위 아님) 오프셋으로 살짝 벌려 마커가 완전히 겹치지 않게 한다.
 */
function mapFleet(rows: FleetRow[], kind: FleetKind, isPacific: boolean): MappedShip[] {
  const seen: Record<string, number> = {};
  const ships: MappedShip[] = [];
  for (const row of rows) {
    if (!row.position || !row.location) continue;
    const position = parseFleetPosition(row.position);
    if (!position) continue;
    const lat = position[0];
    const lng = isPacific ? toPacificLng(position[1]) : position[1];
    const key = `${lat.toFixed(2)}-${lng.toFixed(2)}`;
    const stacked = seen[key] ?? 0;
    seen[key] = stacked + 1;
    ships.push({ ...row, kind, lat: lat + stacked * 0.45, lng: lng + stacked * 0.55 });
  }
  return ships;
}

/** 터치 목표 44px를 유지하기 위해 아이콘 전체는 44px, 눈에 보이는 점은 24px로 둔다. */
function shipIcon(kind: FleetKind, status: string): L.DivIcon {
  const { color, square } = FLEET_STYLE[kind];
  const icon = STATUS_VIEW[status]?.icon ?? '⚓';
  return L.divIcon({
    className: 'fleet-real-marker',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;">
      <span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;font-size:12px;line-height:1;border-radius:${square ? '5px' : '50%'};background:${color};border:2px solid #ffffff;box-shadow:0 2px 6px rgba(15,23,42,0.45);">${icon}</span>
    </span>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    tooltipAnchor: [0, -14],
  });
}

function FleetMapPanel({
  title,
  caption,
  ships,
  legend,
}: {
  title: string;
  caption: string;
  ships: MappedShip[];
  legend: FleetKind[];
}) {
  const bounds = useMemo(
    () => L.latLngBounds(ships.map((ship) => [ship.lat, ship.lng] as [number, number])).pad(0.35),
    [ships],
  );

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
      <h4 style={{ margin: 0, paddingLeft: '4px', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
        🌊 {title} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>{caption}</span>
      </h4>
      <div
        style={{
          position: 'relative',
          height: '380px',
          width: '100%',
          borderRadius: 'var(--card-radius)',
          border: '1px solid var(--panel-border)',
          overflow: 'hidden',
        }}
      >
        <MapContainer
          bounds={bounds}
          boundsOptions={{ maxZoom: 4 }}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', zIndex: 1, background: '#dbeafe' }}
        >
          <MapSizeGuard bounds={bounds} />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
            attribution="지도 타일 &copy; Esri — GEBCO · NOAA · National Geographic · Garmin 등 출처 포함"
            maxZoom={13}
          />
          {ships.map((ship) => {
            const status = STATUS_VIEW[ship.status] ?? STATUS_VIEW.reported;
            return (
              <Marker
                key={ship.name}
                position={[ship.lat, ship.lng]}
                icon={shipIcon(ship.kind, ship.status)}
                title={`${ship.name} · ${status.text}`}
                alt={`${ship.name} 선박 위치`}
                riseOnHover
              >
                <Tooltip direction="top" opacity={1}>
                  <div style={{ minWidth: '150px', maxWidth: '240px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: FLEET_STYLE[ship.kind].color }}>
                      {ship.displayName} <span style={{ fontWeight: 400, color: '#94a3b8' }}>({FLEET_STYLE[ship.kind].label})</span>
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#e2e8f0' }}>위치 {ship.location ?? '미보고'}</div>
                    <div style={{ fontSize: '11px', color: '#e2e8f0' }}>
                      상태 {status.text} {status.icon}
                    </div>
                    <div style={{ fontSize: '11px', color: '#e2e8f0' }}>
                      적재량 {ship.loadedMt?.toLocaleString() ?? '미보고'} / {ship.capacityMt?.toLocaleString() ?? '미보고'} (MT)
                    </div>
                    {ship.catchMt !== undefined ? (
                      <div style={{ fontSize: '11px', color: '#e2e8f0' }}>일간 어획 {ship.catchMt?.toLocaleString() ?? '미보고'} (MT)</div>
                    ) : null}
                    {ship.note ? (
                      <div style={{ marginTop: '4px', fontSize: '10px', lineHeight: 1.4, color: '#fcd34d', wordBreak: 'keep-all' }}>
                        {formatFleetDailyNote(ship.note)}
                      </div>
                    ) : null}
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>

        <div
          style={{
            position: 'absolute',
            left: '12px',
            bottom: '12px',
            zIndex: 500,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '10px 12px',
            borderRadius: '10px',
            border: '1px solid rgba(15,23,42,0.12)',
            background: 'rgba(255,255,255,0.94)',
            boxShadow: '0 6px 18px rgba(15,23,42,0.14)',
            fontSize: '11px',
            color: '#0f172a',
          }}
        >
          <strong style={{ fontSize: '11px', color: '#475569' }}>범례</strong>
          {legend.map((kind) => (
            <span key={kind} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: FLEET_STYLE[kind].square ? '3px' : '50%',
                  background: FLEET_STYLE[kind].color,
                  border: '1px solid rgba(15,23,42,0.25)',
                }}
              />
              {FLEET_STYLE[kind].label}
            </span>
          ))}
          <span style={{ borderTop: '1px solid rgba(15,23,42,0.1)', paddingTop: '6px' }}>📍 보고 위치</span>
        </div>
      </div>
    </section>
  );
}


/* 숨김 탭(display:none)에서 초기화된 leaflet은 크기 0으로 계산돼 타일·fitBounds가 깨진다 —
 * 컨테이너 크기 변화를 감지해 invalidateSize + fitBounds를 다시 실행한다. */
function MapSizeGuard({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  React.useEffect(() => {
    const container = map.getContainer();
    const refresh = () => {
      map.invalidateSize();
      map.fitBounds(bounds, { maxZoom: 4 });
    };
    const observer = new ResizeObserver(() => {
      if (container.clientWidth > 0) refresh();
    });
    observer.observe(container);
    const t = window.setTimeout(refresh, 300);
    return () => { observer.disconnect(); window.clearTimeout(t); };
  }, [map, bounds]);
  return null;
}

export default function FleetRealMap({ detail }: { detail: FleetDailyDetailPayload }) {
  const roster = useMemo(() => buildFleetRoster(detail), [detail]);
  const pacificShips = useMemo(
    () => [
      ...mapFleet(roster.pacific, 'pacific', true),
      ...mapFleet(roster.carrierPhysical, 'carrier', true),
    ],
    [roster],
  );
  const atlanticShips = useMemo(() => mapFleet(roster.atlantic, 'atlantic', false), [roster]);

  return (
    <>
      {/* divIcon 기본 흰 배경 제거 — 마커 모양은 html 안에서 직접 그린다 */}
      <style>{`.fleet-real-marker { width: 44px !important; min-width: 44px !important; max-width: 44px !important; height: 44px !important; background: transparent; border: 0; }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', width: '100%' }}>
        <FleetMapPanel
          title="태평양 수역"
          caption="(국적·합작선 및 운반선)"
          ships={pacificShips}
          legend={['pacific', 'carrier']}
        />
        <FleetMapPanel title="대서양 수역" caption="(대서양 합작선)" ships={atlanticShips} legend={['atlantic']} />
      </div>
    </>
  );
}
