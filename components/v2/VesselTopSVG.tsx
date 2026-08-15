/**
 * VesselTopSVG — Deep Sea Command V2 선박 탑뷰 SVG (스펙 §6 폴백)
 *
 * Grok Imagine 이미지가 없거나 로드 실패 시 HeroZone vessel 배경 슬롯에 들어가는
 * 스타일라이즈드 선박 도면. Raktor 문법: 화물칸(해치)이 데이터 연동 발광체다.
 *
 * hatches[].intensity(0~1)가 해치별 발광 강도 — 하역량·적재량을 그대로 흘려넣는다.
 * 장식 발광 금지 원칙(UI_RULES V2 §5): intensity 0이면 발광 없음.
 *
 * 비례·배치는 신라 실선단 조사(2026-08-15, Grok [Grok]) §7 클래스 실루엣 기준:
 * - 선망(SUPER급): 80×15.5m ≈ 5.2:1. 선미 네트데크+스키프, 우현 파워블록,
 *   전폭 선교 블록 지붕 헬리패드, 중앙 마스트·붐, 전방 작업갑판 브라인 웰(작은 뚜껑).
 * - 운반선(SEIN급): ~125×18m ≈ 6.5:1. 선교 후방 ¾, 중심선 일렬 창구 4그룹, 크레인 우현.
 * - 연승: 48×8m 연필형. 선교 후방, 긴 선수 갑판, 선미 양승 드럼·라디오부이 랙.
 *   파워블록·스키프·헬기 없음.
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

/** 선종별 선체·해치 기하 — viewBox 0 0 900 320, 선수(bow)=우측, 중심선 y=160 */
const GEOM: Record<
  VesselKind,
  {
    sternX: number;
    bowX: number;
    /** 반폭(px) — 실선 길이:폭 비례를 유지 */
    halfBeam: number;
    /** 선수 테이퍼 길이 — 클수록 뾰족 */
    bowLen: number;
    hatch: { w: number; h: number; y: number; x: (i: number) => number };
  }
> = {
  // 80×15.5m ≈ 5.2:1 — 브라인 웰 작은 뚜껑 6개, 중심선 일렬
  seiner: {
    sternX: 70, bowX: 870, halfBeam: 78, bowLen: 120,
    hatch: { w: 40, h: 40, y: 140, x: (i) => 480 + i * 54 },
  },
  // 48×8m ≈ 6:1 연필형 — 어창 뚜껑 4개, 긴 선수 갑판. 760/126 = 6.03:1
  longliner: {
    sternX: 90, bowX: 850, halfBeam: 63, bowLen: 130,
    hatch: { w: 44, h: 44, y: 138, x: (i) => 330 + i * 60 },
  },
  // LOA 115~137m 리퍼 계열 (폭은 공개 수치 없음 — 전형 리퍼 세장비 6.5:1로 스타일라이즈).
  // 해치 8칸은 호출부 데이터 계약이고, 시각만 4그룹으로 묶어 실적부(#1~#4 그룹, 12~15칸)를 축약 표현.
  carrier: {
    sternX: 55, bowX: 875, halfBeam: 63, bowLen: 90,
    hatch: { w: 50, h: 76, y: 122, x: (i) => 298 + Math.floor(i / 2) * 130 + (i % 2) * 58 },
  },
};

function hullPath(sternX: number, bowX: number, hb: number, bowLen: number, inset = 0): string {
  const top = 160 - hb + inset;
  const bot = 160 + hb - inset;
  const sx = sternX + inset;
  const bx = bowX - inset * 1.6;
  const shoulder = bx - bowLen;
  return [
    `M ${sx} 160`,
    `C ${sx} ${top + (hb - inset) * 0.35}, ${sx + 40} ${top}, ${sx + 120} ${top}`,
    `L ${shoulder} ${top}`,
    `C ${shoulder + bowLen * 0.55} ${top}, ${bx - bowLen * 0.18} ${160 - (hb - inset) * 0.35}, ${bx} 160`,
    `C ${bx - bowLen * 0.18} ${160 + (hb - inset) * 0.35}, ${shoulder + bowLen * 0.55} ${bot}, ${shoulder} ${bot}`,
    `L ${sx + 120} ${bot}`,
    `C ${sx + 40} ${bot}, ${sx} ${bot - (hb - inset) * 0.35}, ${sx} 160 Z`,
  ].join(' ');
}

const LINE = 'rgba(148, 196, 220, 0.28)';
const LINE_DIM = 'rgba(148, 196, 220, 0.12)';
const BLOCK = '#14212c';

export default function VesselTopSVG({ kind, hatches, rotate = 0, className }: VesselTopSVGProps) {
  const slots = HATCH_SLOTS[kind];
  const g = GEOM[kind];
  const resolved: VesselHatch[] = Array.from({ length: slots }, (_, i) =>
    hatches?.[i] ?? { id: `slot-${i}`, intensity: 0 },
  );

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
      <path d={hullPath(g.sternX, g.bowX, g.halfBeam, g.bowLen)} fill="url(#vsl-hull)" stroke="rgba(148, 196, 220, 0.22)" strokeWidth="2" />
      {/* 갑판 라인 */}
      <path d={hullPath(g.sternX, g.bowX, g.halfBeam, g.bowLen, 13)} fill="none" stroke={LINE_DIM} strokeWidth="1.5" />

      {kind === 'seiner' && (
        <g>
          {/* 선미 스키프 — 선미 램프 위 */}
          <rect x="52" y="142" width="46" height="36" rx="10" fill={BLOCK} stroke={LINE} strokeWidth="1.5" />
          {/* 네트데크 — 그물 더미 (크로스해치) */}
          <rect x="108" y="118" width="88" height="84" rx="10" fill="#101c26" stroke={LINE_DIM} strokeWidth="1.5" />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={118 + i * 26} y1="126" x2={144 + i * 26} y2="194" stroke={LINE_DIM} strokeWidth="1.5" />
          ))}
          {/* 파워블록 — 우현(하단) 후방 대빗 */}
          <line x1="206" y1="196" x2="238" y2="226" stroke={LINE} strokeWidth="2.5" />
          <circle cx="240" cy="228" r="13" fill={BLOCK} stroke={LINE} strokeWidth="2" />
          {/* 전폭 선교 블록 + 지붕 헬리패드 (SUPER급 식별점) */}
          <rect x="252" y="94" width="104" height="132" rx="10" fill="#1a2a37" stroke="rgba(148,196,220,0.25)" strokeWidth="1.5" />
          <rect x="270" y="112" width="68" height="96" rx="8" fill="none" stroke={LINE} strokeWidth="1.5" />
          <circle cx="304" cy="160" r="34" fill="none" stroke={LINE} strokeWidth="1.5" />
          <text x="304" y="169" textAnchor="middle" fontSize="26" fontFamily="inherit" fill={LINE}>H</text>
          {/* 중앙 마스트(크로우스네스트) + 붐 */}
          <circle cx="420" cy="160" r="8" fill="#1e3242" stroke="rgba(148,196,220,0.35)" strokeWidth="1.5" />
          <line x1="420" y1="160" x2="466" y2="126" stroke="rgba(148,196,220,0.35)" strokeWidth="2.5" />
        </g>
      )}
      {kind === 'longliner' && (
        <g>
          {/* 선미 양승 드럼 + 라디오부이 랙 — 파워블록·스키프·헬기 없음 */}
          <circle cx="132" cy="160" r="16" fill={BLOCK} stroke={LINE} strokeWidth="2" />
          <circle cx="132" cy="160" r="7" fill="#1e3242" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={166 + i * 16} cy="196" r="5" fill="none" stroke={LINE_DIM} strokeWidth="1.5" />
          ))}
          {/* 선교 — 후방 */}
          <rect x="192" y="126" width="72" height="68" rx="9" fill="#1a2a37" stroke="rgba(148,196,220,0.25)" strokeWidth="1.5" />
          <rect x="206" y="140" width="44" height="9" rx="3" fill="rgba(148, 196, 220, 0.35)" />
          <rect x="206" y="155" width="44" height="9" rx="3" fill="rgba(148, 196, 220, 0.2)" />
          {/* 연승줄 — 선미 뒤로 전개 */}
          <line x1="88" y1="160" x2="12" y2="160" stroke={LINE} strokeWidth="2" strokeDasharray="8 8" />
        </g>
      )}
      {kind === 'carrier' && (
        <g>
          {/* 선교 — 선체 후방 ¾ 지점 */}
          <rect x="140" y="102" width="96" height="116" rx="9" fill="#1a2a37" stroke="rgba(148,196,220,0.25)" strokeWidth="1.5" />
          <rect x="158" y="118" width="60" height="10" rx="3" fill="rgba(148, 196, 220, 0.35)" />
          <rect x="158" y="134" width="60" height="10" rx="3" fill="rgba(148, 196, 220, 0.2)" />
          {/* 크레인 2기 — 창구 그룹 사이, 우현측 */}
          {[422, 682].map((x) => (
            <g key={x}>
              <circle cx={x} cy="205" r="7" fill="#1e3242" stroke="rgba(148,196,220,0.35)" strokeWidth="1.5" />
              <line x1={x} y1="205" x2={x + 42} y2="220" stroke="rgba(148,196,220,0.35)" strokeWidth="2.5" />
            </g>
          ))}
        </g>
      )}

      {/* 해치 열 — 데이터 발광 (Raktor 문법) */}
      {resolved.map((h, i) => {
        const x = g.hatch.x(i);
        const color = h.color ?? '#f59e0b';
        const on = h.intensity > 0;
        return (
          <g key={h.id}>
            <rect
              x={x}
              y={g.hatch.y}
              width={g.hatch.w}
              height={g.hatch.h}
              rx="7"
              fill={on ? color : '#101c26'}
              fillOpacity={on ? 0.25 + h.intensity * 0.55 : 1}
              stroke={on ? color : 'rgba(148, 196, 220, 0.18)'}
              strokeOpacity={on ? 0.4 + h.intensity * 0.6 : 1}
              strokeWidth="2"
              filter={on ? 'url(#vsl-glow)' : undefined}
            />
            {kind === 'carrier' ? (
              /* 운반선 창구 격자선 */
              <line
                x1={x + g.hatch.w / 2} y1={g.hatch.y} x2={x + g.hatch.w / 2} y2={g.hatch.y + g.hatch.h}
                stroke={on ? color : LINE_DIM}
                strokeOpacity={on ? 0.5 : 1}
                strokeWidth="1"
              />
            ) : (
              /* 선망 브라인 웰 · 연승 어창 — 원형 뚜껑 */
              <circle
                cx={x + g.hatch.w / 2} cy={g.hatch.y + g.hatch.h / 2} r={g.hatch.w * 0.3}
                fill="none"
                stroke={on ? color : LINE_DIM}
                strokeOpacity={on ? 0.5 : 1}
                strokeWidth="1"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
