/**
 * HeroZone — Deep Sea Command V2 히어로 존 (스펙 §3)
 *
 * 페이지당 1개. 3유형을 variant로 분기:
 *  - 'vessel' (Raktor): 선박 이미지 배경 + 발광 오버레이 슬롯 + 하단 카드 스트립
 *  - 'map'    (Vexto) : 지도 캔버스 슬롯 + 부유 UI + 우측 경고→권고 패널
 *  - 'kpi'    (Twisty): 초대형 KPI + 보조 KPI 행
 *
 * 배경(이미지·지도)은 슬롯으로 받는다 — Grok 이미지 ↔ SVG 폴백 교체 가능(스펙 §6).
 * 사용자 노출 문자열은 호출부 책임으로 100% 한글(L-01).
 */
'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import CountUp from 'react-countup';

// ─── 공통 ──────────────────────────────────────────────────────────────────

export type HeroVariant = 'vessel' | 'map' | 'kpi';

export interface HeroKpi {
  label: string;            // 한글 라벨
  value: number;
  unit: string;             // W-02: 단위 의무 — '(MT)' '(원/kg)' 등
  decimals?: number;
  accent?: string;          // 발광 색 (기본 cyan)
}

export interface HeroWarning {
  title: string;            // 예: '용량 경보'
  lines: string[];          // 현황 줄들 (SIT 재사용)
  recommend?: string;       // 권고 줄 (기존 위젯 TAK 재사용 — 스펙 §3)
}

export interface HeroZoneProps {
  variant: HeroVariant;
  /** 에디토리얼 페이지 타이틀 — 히어로 위에 직접 (Vexto 문법) */
  title: string;
  subtitle?: string;
  /** vessel: 선박 이미지/오버레이 노드, map: 지도 노드 */
  background?: React.ReactNode;
  /** 히어로 위 부유 콘텐츠 (마커·오버레이·카드) */
  children?: React.ReactNode;
  /** kpi 유형의 주인공 수치 (vessel·map도 좌하단 표시 가능) */
  primaryKpi?: HeroKpi;
  secondaryKpis?: HeroKpi[];
  /** map 유형 우측 경고→권고 패널 */
  warning?: HeroWarning;
  /** 하단 카드 스트립 (vessel: 선박 카드들) */
  strip?: React.ReactNode;
  minHeight?: number | string;
  className?: string;
}

// ─── KPI 숫자 (카운트업 + 단위 병기) ────────────────────────────────────────

function KpiNumber({ kpi, primary }: { kpi: HeroKpi; primary?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        {kpi.label}
      </span>
      <span
        style={{
          fontSize: primary ? 'var(--dsc-kpi-size)' : '1.6rem',
          fontWeight: 'var(--dsc-kpi-weight)' as React.CSSProperties['fontWeight'],
          color: '#f8fafc',
          lineHeight: 1.05,
          fontVariantNumeric: 'tabular-nums',
          textShadow: primary ? `0 0 32px ${kpi.accent ?? '#22d3ee'}40` : undefined,
        }}
      >
        {reduce ? (
          kpi.value.toLocaleString(undefined, { maximumFractionDigits: kpi.decimals ?? 0 })
        ) : (
          <CountUp end={kpi.value} separator="," decimals={kpi.decimals ?? 0} duration={1.4} />
        )}
        <span
          style={{
            fontSize: 'var(--dsc-kpi-unit-size)',
            fontWeight: 500,
            color: 'var(--text-muted)',
            marginLeft: 8,
          }}
        >
          {kpi.unit}
        </span>
      </span>
    </div>
  );
}

// ─── 경고→권고 패널 (Vexto) ────────────────────────────────────────────────

function WarningPanel({ warning }: { warning: HeroWarning }) {
  return (
    <div
      style={{
        background: 'var(--dsc-warn-bg)',
        border: '1px solid var(--dsc-warn-border)',
        borderRadius: 14,
        padding: '14px 16px',
        backdropFilter: 'var(--dsc-surface-blur)',
        WebkitBackdropFilter: 'var(--dsc-surface-blur)',
        maxWidth: 340,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fda4af' }}>⚠ {warning.title}</span>
      {warning.lines.map((line, i) => (
        <p key={i} style={{ margin: 0, fontSize: '0.78rem', color: '#fecdd3', lineHeight: 1.5 }}>
          {line}
        </p>
      ))}
      {warning.recommend && (
        <p
          style={{
            margin: 0,
            paddingTop: 8,
            borderTop: '1px solid rgba(244, 63, 94, 0.18)',
            fontSize: '0.78rem',
            color: '#f8fafc',
            lineHeight: 1.5,
          }}
        >
          💡 {warning.recommend}
        </p>
      )}
    </div>
  );
}

// ─── HeroZone 본체 ─────────────────────────────────────────────────────────

export default function HeroZone({
  variant,
  title,
  subtitle,
  background,
  children,
  primaryKpi,
  secondaryKpis,
  warning,
  strip,
  minHeight,
  className,
}: HeroZoneProps) {
  const reduce = useReducedMotion();
  const resolvedMinHeight =
    minHeight ?? (variant === 'kpi' ? 280 : 460);

  return (
    <section
      className={className}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        minHeight: resolvedMinHeight,
        background: variant === 'kpi'
          ? 'linear-gradient(160deg, var(--dsc-bg) 0%, var(--dsc-bg-deep) 100%)'
          : 'var(--dsc-bg-deep)',
        border: '1px solid var(--dsc-surface-border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 배경층: 선박 이미지 / 지도 캔버스 */}
      {background && (
        <div style={{ position: 'absolute', inset: 0 }} aria-hidden>
          {background}
          {/* 가독성 스크림 — 타이틀·KPI가 얹히는 영역 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(6,13,20,0.72) 0%, rgba(6,13,20,0.12) 34%, rgba(6,13,20,0.55) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* 상단: 에디토리얼 타이틀 (Twisty 웨이트 200 대비) */}
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ position: 'relative', padding: '28px 32px 0', zIndex: 2 }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--dsc-title-size)',
            fontWeight: 'var(--dsc-title-weight)' as React.CSSProperties['fontWeight'],
            color: '#f8fafc',
            letterSpacing: '-0.02em',
            lineHeight: 1.08,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </motion.header>

      {/* 중앙: 부유 콘텐츠 + 우측 경고 패널 */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '16px 32px',
          gap: 16,
          zIndex: 2,
        }}
      >
        <div style={{ flex: 1 }}>{children}</div>
        {warning && <WarningPanel warning={warning} />}
      </div>

      {/* 하단: 주인공 KPI + 보조 KPI 행 */}
      {(primaryKpi || secondaryKpis?.length) && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 40,
            flexWrap: 'wrap',
            padding: '0 32px 26px',
            zIndex: 2,
          }}
        >
          {primaryKpi && <KpiNumber kpi={primaryKpi} primary />}
          {secondaryKpis?.map((k) => <KpiNumber key={k.label} kpi={k} />)}
        </motion.div>
      )}

      {/* 하단 카드 스트립 (Raktor 임무 스트립) */}
      {strip && (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            padding: '0 32px 24px',
            zIndex: 2,
          }}
        >
          {strip}
        </div>
      )}
    </section>
  );
}
