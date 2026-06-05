'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Play, Pause } from 'lucide-react';
import WidgetCard from './WidgetCard';
import areaMapData from '../data/squid_area_map.json';
import { WORLD_MAP_PATH } from '../data/WORLD_MAP_PATH';

function latLngToXY(lat: number, lng: number, width: number, height: number) {
  const x = ((lng + 180) / 360) * width;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = height / 2 - (mercN / Math.PI) * (height / 2) * 0.8;
  return { x, y };
}

interface AreaData {
  area: string;
  label: string;
  labelEn: string;
  lat: number;
  lng: number;
  catch: number;
}

const DECADES = ['1950', '1960', '1970', '1980', '1990', '2000', '2010', '2020'];
const typedData = areaMapData as Record<string, AreaData[]>;

export default function SquidAreaMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedDecade, setSelectedDecade] = useState('2020');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredArea, setHoveredArea] = useState<AreaData | null>(null);

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

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSelectedDecade((prev) => {
        const idx = DECADES.indexOf(prev);
        if (idx >= DECADES.length - 1) {
          setIsPlaying(false);
          return DECADES[DECADES.length - 1];
        }
        return DECADES[idx + 1];
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const mapWidth = containerWidth || 600;
  const mapHeight = Math.min(mapWidth * 0.5, 400);
  const isMobile = mapWidth < 500;

  const currentData = typedData[selectedDecade] || [];

  const globalMax = useMemo(() => {
    let max = 0;
    for (const dec of DECADES) {
      for (const a of typedData[dec] || []) {
        if (a.catch > max) max = a.catch;
      }
    }
    return max;
  }, []);

  const decadeTotal = currentData.reduce((s, a) => s + a.catch, 0);

  const body = (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setIsPlaying(!isPlaying); if (!isPlaying) setSelectedDecade('1950'); }}
          style={{
            background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            border: `1px solid ${isPlaying ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
            borderRadius: '8px', padding: '6px 12px', color: 'var(--text-primary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem',
          }}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isPlaying ? '정지' : '재생'}
        </button>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
          {DECADES.map((dec) => (
            <button
              key={dec}
              onClick={() => { setSelectedDecade(dec); setIsPlaying(false); }}
              style={{
                padding: isMobile ? '4px 8px' : '6px 14px',
                borderRadius: '6px',
                border: selectedDecade === dec ? '1px solid rgba(16, 185, 129, 0.8)' : '1px solid rgba(255,255,255,0.1)',
                background: selectedDecade === dec ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.03)',
                color: selectedDecade === dec ? '#6ee7b7' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: isMobile ? '0.75rem' : '0.85rem',
                fontWeight: selectedDecade === dec ? 700 : 400,
                transition: 'all 0.2s',
              }}
            >
              {dec}s
            </button>
          ))}
        </div>

        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
          총 {(decadeTotal / 1000000).toFixed(1)}M 톤
        </span>
      </div>

      <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
        {containerWidth > 0 && (
          <svg
            width={mapWidth}
            height={mapHeight}
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            style={{ background: 'rgba(0, 20, 40, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            {[...Array(7)].map((_: any, i: number) => {
              const y = (mapHeight / 6) * i;
              return <line key={`h-${i}`} x1={0} y1={y} x2={mapWidth} y2={y} stroke="rgba(255,255,255,0.04)" />;
            })}
            {[...Array(13)].map((_: any, i: number) => {
              const x = (mapWidth / 12) * i;
              return <line key={`v-${i}`} x1={x} y1={0} x2={x} y2={mapHeight} stroke="rgba(255,255,255,0.04)" />;
            })}

            <g transform={`scale(${mapWidth / 1000}, ${mapHeight / 500})`}>
              <path d={WORLD_MAP_PATH} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} strokeDasharray="2 2" />
            </g>

            <line x1={0} y1={mapHeight * 0.47} x2={mapWidth} y2={mapHeight * 0.47} stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="4 4" />
            <text x={8} y={mapHeight * 0.47 - 4} fill="rgba(16, 185, 129, 0.25)" fontSize={9}>적도</text>

            {currentData.map((area) => {
              const pos = latLngToXY(area.lat, area.lng, mapWidth, mapHeight);
              const maxR = isMobile ? 35 : 50;
              const minR = 4;
              const r = Math.max(minR, Math.sqrt(area.catch / globalMax) * maxR);
              const isHovered = hoveredArea?.area === area.area;
              const opacity = area.catch > 0 ? 0.6 : 0;

              let color = 'var(--color-success)';
              if (area.area.includes('Pacific') && (area.area.includes('Northwest'))) color = '#8b5cf6';
              else if (area.area.includes('Pacific') && area.area.includes('Southeast')) color = 'var(--color-danger)';
              else if (area.area.includes('Atlantic') && area.area.includes('Southwest')) color = 'var(--color-info)';
              else if (area.area.includes('Indian')) color = 'var(--color-warning)';
              else if (area.area.includes('Mediterranean')) color = '#ec4899';

              if (area.catch === 0) return null;

              return (
                <g key={area.area}
                  onMouseEnter={() => setHoveredArea(area)}
                  onMouseLeave={() => setHoveredArea(null)}
                  onTouchStart={() => setHoveredArea(area)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={pos.x} cy={pos.y} r={r + 4} fill="none" stroke={color} strokeWidth={1} opacity={isHovered ? 0.8 : 0.3}>
                    <animate attributeName="r" from={r} to={r + 12} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from={0.4} to={0} dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={pos.x} cy={pos.y} r={isHovered ? r * 1.15 : r} fill={color} opacity={isHovered ? 0.9 : opacity}
                    stroke={isHovered ? 'var(--text-primary)' : color} strokeWidth={isHovered ? 2 : 1}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  {(r > 12 || isHovered) && (
                    <text
                      x={pos.x} y={pos.y + (isMobile ? 1 : 2)}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="var(--text-primary)" fontSize={isMobile ? 8 : 10} fontWeight={600}
                      style={{ pointerEvents: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                    >
                      {area.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {hoveredArea && (() => {
          const pos = latLngToXY(hoveredArea.lat, hoveredArea.lng, mapWidth, mapHeight);
          const isRightEdge = pos.x > mapWidth - 220;
          return (
            <div style={{
              position: 'absolute',
              top: `${Math.max(12, pos.y - 60)}px`,
              left: isRightEdge ? `${pos.x - 210}px` : `${pos.x + 30}px`,
              background: 'rgba(0, 15, 30, 0.95)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '10px', padding: '14px',
              color: 'var(--text-primary)', fontSize: '0.9rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              minWidth: '180px', zIndex: 10,
              pointerEvents: 'none',
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#6ee7b7', borderBottom: '1px dashed rgba(255,255,255,0.15)', paddingBottom: '6px' }}>
                {hoveredArea.label} ({hoveredArea.labelEn})
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                {selectedDecade}s 조업량
              </p>
              <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>
                {hoveredArea.catch.toLocaleString()} 톤
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                전체의 {decadeTotal > 0 ? ((hoveredArea.catch / decadeTotal) * 100).toFixed(1) : 0}%
              </p>
            </div>
          );
        })()}
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '1rem', justifyContent: 'center' }}>
        {[
          { color: '#8b5cf6', label: '북서태평양 (전통 조업)' },
          { color: 'var(--color-danger)', label: '남동태평양 (훔볼트)' },
          { color: 'var(--color-info)', label: '남서대서양 (아르헨티나)' },
          { color: 'var(--color-warning)', label: '인도양' },
          { color: 'var(--color-success)', label: '기타 해역' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, opacity: 0.7 }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="해역별 어획량 팽창 지도"
      icon={MapPin}
      iconColor="#6ee7b7"
      pillar="S1"
      cardDesc="북서태평양 자원 고갈 → 남미 앞바다(남동태평양·남서대서양)로 전 세계 선단이 집중되는 '풍선 효과'를 공간적으로 시각화"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      customBody={body}
      takeaway={{
        situation: `<div>
<p>"오징어 생산 코어 전이"란 글로벌 어획 지도의 70년 구조 전환. 단순 흉어가 아닌 장기 어장 이동 흐름.</p>
<p>FAO 통계 기준: <strong>과거 북서태평양(한국·일본 앞바다) 중심 → 남미 해역(페루·아르헨티나) 대규모 전이</strong>. FAO Area 6 → Area 41·87로 풍선 효과 관측. 한국 연안 어획량은 수십 년간 감소 추세 지속.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 한국 연안 어획 경제성은 사실상 소멸 수준. <strong>"남미 원양 직접 확보 + 식량 주권 선제 확보"</strong>가 본질.</p>
<p><strong>3단계</strong>: ① 단기 수입 의존 탈피 — 남미 원양 선단 직접 확보 capex ② 페루·아르헨 메이저 조업사와 5~10년 Off-take 계약 ③ 한국 정부(해수부)와 협력으로 식량 안보 산업 자금 활용.</p>
</div>`,
        source: "FAO FishStatJ Squid Catch by FAO Area (1950-2020)",
      }}
    />
  );
}
