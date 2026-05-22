'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Radar, TrendingUp } from 'lucide-react';
import WidgetCard from './WidgetCard';
import routeData from '../data/squid_arbitrage_routes.json';
import { WORLD_MAP_PATH } from '../data/WORLD_MAP_PATH';

function latLngToXY(lat: number, lng: number, width: number, height: number) {
  const x = ((lng + 180) / 360) * width;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = height / 2 - (mercN / Math.PI) * (height / 2) * 0.8;
  return { x, y };
}

interface Route {
  id: number;
  source: string;
  sourceCode: string;
  sourceLat: number;
  sourceLng: number;
  dest: string;
  destCode: string;
  destLat: number;
  destLng: number;
  rawPrice: number;
  sellingPrice: number;
  logistics: number;
  margin: number;
  product: string;
  status: string;
  color: string;
}

export default function SquidArbitrageRadar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hoveredRouteId, setHoveredRouteId] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setContainerWidth(Math.floor(w));
    };
    measure();
    const t = setTimeout(measure, 200);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(t); ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  const isMobile = containerWidth < 800;
  const mapWidth = isMobile ? containerWidth : Math.floor(containerWidth * 0.65) - 20;
  const w = mapWidth || 600;
  const h = Math.min(w * 0.55, 450);

  const sortedRoutes = [...(routeData as Route[])].sort((a, b) => b.margin - a.margin);

  const body = (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', width: '100%' }} ref={containerRef}>
      <div style={{ flex: isMobile ? 'none' : '0 0 65%', position: 'relative', overflow: 'hidden', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
        {containerWidth > 0 && (
          <svg
            width={w}
            height={h}
            viewBox={`0 0 ${w} ${h}`}
            style={{ background: 'radial-gradient(circle at center, rgba(3, 40, 60, 1) 0%, rgba(0, 15, 30, 1) 100%)' }}
          >
            <circle cx={w / 2} cy={h / 2} r={w * 0.2} fill="none" stroke="rgba(56, 189, 248, 0.1)" strokeWidth={1} />
            <circle cx={w / 2} cy={h / 2} r={w * 0.35} fill="none" stroke="rgba(56, 189, 248, 0.1)" strokeWidth={1} />
            <circle cx={w / 2} cy={h / 2} r={w * 0.5} fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth={1} strokeDasharray="4 4" />
            <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="rgba(56, 189, 248, 0.15)" />
            <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="rgba(56, 189, 248, 0.15)" />

            <g style={{ transformOrigin: 'center center', animation: 'spin 8s linear infinite' }}>
              <path d={`M ${w / 2} ${h / 2} L ${w / 2} ${0} A ${w / 2} ${w / 2} 0 0 1 ${w} ${h / 2} Z`} fill="url(#radarGradient)" opacity={0.4} />
            </g>

            <defs>
              <linearGradient id="radarGradient" x1="0%" y1="50%" x2="100%" y2="50%" gradientTransform="rotate(-45)">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0.8)" />
              </linearGradient>
            </defs>

            <g transform={`scale(${w / 1000}, ${h / 500})`} opacity={0.6} fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth={1} strokeDasharray="3 3">
              <path d={WORLD_MAP_PATH} />
            </g>

            {sortedRoutes.map(route => {
              const s = latLngToXY(route.sourceLat, route.sourceLng, w, h);
              const d = latLngToXY(route.destLat, route.destLng, w, h);
              const isHovered = hoveredRouteId === route.id;

              const cx = (s.x + d.x) / 2;
              const cy = Math.min(s.y, d.y) - Math.abs(s.x - d.x) * 0.2;

              const pathData = `M ${s.x} ${s.y} Q ${cx} ${cy} ${d.x} ${d.y}`;

              return (
                <g key={route.id}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={route.color}
                    strokeWidth={isHovered ? 3 : 1}
                    opacity={isHovered ? 0.7 : 0.2}
                    style={{ transition: 'all 0.3s' }}
                  />
                  <path
                    d={pathData}
                    fill="none"
                    stroke={route.color}
                    strokeWidth={isHovered ? 4 : 2}
                    strokeDasharray="4 8"
                    opacity={isHovered ? 1 : 0.6}
                    filter={isHovered ? 'drop-shadow(0px 0px 4px ' + route.color + ')' : ''}
                  >
                    <animate attributeName="stroke-dashoffset" from="120" to="0" dur="2s" repeatCount="indefinite" />
                  </path>
                  <circle cx={s.x} cy={s.y} r={isHovered ? 5 : 3} fill="var(--text-primary)" stroke={route.color} strokeWidth={2} />
                  <circle cx={d.x} cy={d.y} r={isHovered ? 6 : 4} fill={route.color} />
                  {isHovered && (
                    <g>
                      <text x={s.x} y={s.y - 10} fill="var(--text-primary)" fontSize="10" textAnchor="middle" fontWeight="bold" filter="drop-shadow(0 0 2px #000)">
                        {route.sourceCode}
                      </text>
                      <text x={d.x} y={d.y - 12} fill="var(--text-primary)" fontSize="11" textAnchor="middle" fontWeight="bold" filter="drop-shadow(0 0 2px #000)">
                        {route.destCode}
                      </text>
                      <rect x={cx - 18} y={cy - 8} width="36" height="14" rx="4" fill={route.color} opacity="0.9" />
                      <text x={cx} y={cy + 3} fill="#0d0d0d" fontSize="9" textAnchor="middle" fontWeight="bold">
                        +${route.margin}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span style={{
            background: 'rgba(56, 189, 248, 0.2)',
            color: '#38bdf8',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 700,
            fontFamily: 'monospace',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8', animation: 'pulse 1.5s infinite' }} />
            LIVE SQUID ARBITRAGE
          </span>
        </div>
      </div>

      <div style={{ flex: isMobile ? 'none' : '0 0 calc(35% - 20px)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
            <span>발견된 차익거래 라우트</span>
            <span style={{ color: '#38bdf8' }}>{sortedRoutes.length}건</span>
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: isMobile ? 'none' : `${h - 50}px` }}>
          {sortedRoutes.map((route, i) => (
            <div
              key={route.id}
              onMouseEnter={() => setHoveredRouteId(route.id)}
              onMouseLeave={() => setHoveredRouteId(null)}
              style={{
                background: hoveredRouteId === route.id ? 'rgba(255,255,255,0.1)' : 'rgba(0, 15, 30, 0.5)',
                border: `1px solid ${hoveredRouteId === route.id ? route.color : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {hoveredRouteId === route.id && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: route.color }} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{i + 1}</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{route.source} ➔ {route.dest}</strong>
                </div>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                }}>
                  <TrendingUp size={12} /> +${route.margin}
                </span>
              </div>

              <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: route.color, fontWeight: 600 }}>
                품목: {route.product}
              </p>

              <div style={{
                display: hoveredRouteId === route.id ? 'grid' : 'none',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px',
                background: 'rgba(0,0,0,0.3)',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: '#cbd5e1',
              }}>
                <span>원물 수입:</span> <span style={{ textAlign: 'right' }}>${route.rawPrice}</span>
                <span>운송 및 관세:</span> <span style={{ textAlign: 'right' }}>${route.logistics}</span>
                <span>최종 가공 판매:</span> <span style={{ textAlign: 'right', color: 'var(--text-primary)' }}>${route.sellingPrice}</span>
                <span style={{ borderTop: '1px solid #475569', paddingTop: '4px', marginTop: '2px', fontWeight: 600 }}>총 마진/톤:</span>
                <span style={{ borderTop: '1px solid #475569', paddingTop: '4px', marginTop: '2px', textAlign: 'right', color: '#34d399', fontWeight: 600 }}>${route.margin}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );

  return (
    <WidgetCard
      title="오징어 글로벌 마진 레이더 (Squid Arbitrage Radar)"
      icon={Radar}
      iconColor="#38bdf8"
      pillar="S4"
      cardDesc="원물 수입가 vs 가공품 수출가 Spread 차액을 B2B 트레이딩 봇처럼 시각화 — 수익률 극대화 경로를 자동 탐지"
      telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }}
      customBody={body}
      takeaway={{
        situation: "차익 마진(Spread) 레이더를 통해, 인도네시아·페루 등 생산기지에서 가공 원료로 매입한 뒤, 1차 가공(할복·탈피)을 거쳐 일본·중국 등 주요 소비국으로 재수출할 때 발생하는 톤당 $200~$410 수준의 '차익거래 밴드'가 실시간 포착됩니다. 특히 인도네시아-일본(Sashimi Grade) 라우트는 운송비를 제하고도 톤당 $410의 초과 Bottom-line(순이익) 구간을 보여 단순 원물 무역 대비 높은 Bottom-line(순이익) 구조를 입증합니다.",
        actionPlan: "페루 파이타(Paita) 항구나 인도네시아 수라바야 현지에 1차 전처리(할복/세척) 조인트벤처를 즉시 셋업하십시오. 해외에서 반제품 상태로 가공하여 일본 등에 직납(FOB)하는 3각 무역 모델을 통해 불필요한 국내 반입 관세 및 물류비를 아끼고 중간 마진을 100% 자사화할 수 있습니다.",
        source: "FAO FishStatJ & 관세청 수입·수출 단가 비교",
      }}
    />
  );
}
