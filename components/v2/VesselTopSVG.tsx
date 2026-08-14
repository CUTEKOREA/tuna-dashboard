/**
 * VesselTopSVG — Deep Sea Command V2 선박 탑뷰 SVG (스펙 §6 폴백)
 *
 * Grok Imagine 이미지가 없거나 로드 실패 시 HeroZone vessel 배경 슬롯에 들어가는
 * 스타일라이즈드 선박 도면. Raktor 문법: 화물칸(해치)이 데이터 연동 발광체다.
 *
 * hatches[].intensity(0~1)가 해치별 발광 강도 — 하역량·적재량을 그대로 흘려넣는다.
 * 장식 발광 금지 원칙(UI_RULES V2 §5): intensity 0이면 발광 없음.
 */
'use client';

import React from 'react';

export type VesselKind = 'seiner' | 'longliner' | 'carrier';

export interface VesselHatch {
  id: string;
  /** 발광 강도 0~1 — 데이터 연동 (예: 해치 적재량 / 최대 적재량) */
  intensity: number;
  /** 발광 색 (기본 amber — Raktor 화물칸 톤) */
  color?: string;
}

export interface VesselTopSVGProps {
  kind: VesselKind;
  hatches?: VesselHatch[];
  /** 선체 회전 (deg) — 히어로 구도 조정용 */
  rotate?: number;
  className?: string;
}

/** 선종별 해치 슬롯 수 — hatches 미지정 시 무발광 슬롯만 그린다 */
const HATCH_SLOTS: Record<VesselKind, number> = { seiner: 6, longliner: 4, carrier: 8 };

export default function VesselTopSVG({ kind, hatches, rotate = 0, className }: VesselTopSVGProps) {
  const slots = HATCH_SLOTS[kind];
  const resolved: VesselHatch[] = Array.from({ length: slots }, (_, i) =>
    hatches?.[i] ?? { id: `slot-${i}`, intensity: 0 },
  );

  // 선체 좌표계: viewBox 0 0 900 320, 선수(bow)=우측
  const hatchW = kind === 'carrier' ? 62 : 54;
  const hatchGap = 14;
  const hatchStartX = kind === 'carrier' ? 190 : 250;
  const hatchY = 128;
  const hatchH = 64;

  return (
    <svg
      viewBox="0 0 900 320"
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      role="img"
      aria-label="선박 상면 도면"
    >
      <defs>
        <filter id="vsl-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="vsl-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16242f" />
          <stop offset="55%" stopColor="#0f1a23" />
          <stop offset="100%" stopColor="#0a141d" />
        </linearGradient>
        <radialGradient id="vsl-wake" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(148, 196, 220, 0.10)" />
          <stop offset="100%" stopColor="rgba(148, 196, 220, 0)" />
        </radialGradient>
      </defs>

      {/* 항적 (은은한 수면광) */}
      <ellipse cx="450" cy="160" rx="430" ry="120" fill="url(#vsl-wake)" />

      {/* 선체 — 선수 우측 */}
      <path
        d="M 90 160
           C 90 110, 150 92, 260 92
           L 700 92
           C 800 92, 862 128, 878 160
           C 862 192, 800 228, 700 228
           L 260 228
           C 150 228, 90 210, 90 160 Z"
        fill="url(#vsl-hull)"
        stroke="rgba(148, 196, 220, 0.22)"
        strokeWidth="2"
      />
      {/* 갑판 라인 */}
      <path
        d="M 120 160 C 120 122, 170 108, 265 108 L 695 108 C 780 108, 832 134, 848 160
           C 832 186, 780 212, 695 212 L 265 212 C 170 212, 120 198, 120 160 Z"
        fill="none"
        stroke="rgba(148, 196, 220, 0.10)"
        strokeWidth="1.5"
      />

      {/* 선교(브리지) — 선미측 */}
      <rect x="128" y="126" width="86" height="68" rx="10" fill="#1a2a37" stroke="rgba(148,196,220,0.25)" strokeWidth="1.5" />
      <rect x="146" y="140" width="50" height="10" rx="3" fill="rgba(148, 196, 220, 0.35)" />
      <rect x="146" y="156" width="50" height="10" rx="3" fill="rgba(148, 196, 220, 0.2)" />

      {/* 선종별 장비 */}
      {kind === 'seiner' && (
        // 선망: 선미 파워블록 + 그물 드럼
        <g>
          <circle cx="770" cy="160" r="26" fill="#14212c" stroke="rgba(148,196,220,0.3)" strokeWidth="2" />
          <circle cx="770" cy="160" r="12" fill="#1e3242" />
        </g>
      )}
      {kind === 'longliner' && (
        // 연승: 중앙 라인 홀러 + 선미 라인 가이드
        <g>
          <rect x="640" y="140" width="40" height="40" rx="8" fill="#14212c" stroke="rgba(148,196,220,0.3)" strokeWidth="2" />
          <line x1="680" y1="160" x2="860" y2="160" stroke="rgba(148,196,220,0.28)" strokeWidth="2" strokeDasharray="8 8" />
        </g>
      )}
      {kind === 'carrier' && (
        // 운반선: 크레인 마스트 2기
        <g>
          {[380, 610].map((x) => (
            <g key={x}>
              <circle cx={x} cy="104" r="7" fill="#1e3242" stroke="rgba(148,196,220,0.35)" strokeWidth="1.5" />
              <line x1={x} y1="104" x2={x + 46} y2="82" stroke="rgba(148,196,220,0.35)" strokeWidth="2.5" />
            </g>
          ))}
        </g>
      )}

      {/* 해치 열 — 데이터 발광 (Raktor 문법) */}
      {resolved.map((h, i) => {
        const x = hatchStartX + i * (hatchW + hatchGap);
        const color = h.color ?? '#f59e0b';
        const on = h.intensity > 0;
        return (
          <g key={h.id}>
            <rect
              x={x}
              y={hatchY}
              width={hatchW}
              height={hatchH}
              rx="7"
              fill={on ? color : '#101c26'}
              fillOpacity={on ? 0.25 + h.intensity * 0.55 : 1}
              stroke={on ? color : 'rgba(148, 196, 220, 0.18)'}
              strokeOpacity={on ? 0.4 + h.intensity * 0.6 : 1}
              strokeWidth="2"
              filter={on ? 'url(#vsl-glow)' : undefined}
            />
            {/* 해치 격자선 */}
            <line
              x1={x + hatchW / 2} y1={hatchY} x2={x + hatchW / 2} y2={hatchY + hatchH}
              stroke={on ? color : 'rgba(148,196,220,0.12)'}
              strokeOpacity={on ? 0.5 : 1}
              strokeWidth="1"
            />
          </g>
        );
      })}
    </svg>
  );
}
