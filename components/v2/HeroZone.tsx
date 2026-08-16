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
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import CountUp from 'react-countup';

// ─── 공통 ──────────────────────────────────────────────────────────────────

export type HeroVariant = 'vessel' | 'map' | 'kpi';

export interface HeroKpi {
  label: string;            // 한글 라벨
  value: number;
  unit: string;             // W-02: 단위 의무 — '(MT)' '(원/kg)' 등
  decimals?: number;
  accent?: string;          // 발광 색 (기본 cyan)
  live?: boolean;           // 실제 LIVE 값일 때만 tick 모션 허용
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
  const canAnimateLiveUpdate = Boolean(kpi.live && !reduce);
  const decimals = kpi.decimals ?? 0;
  const formattedValue = kpi.value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const glow = kpi.accent ?? 'var(--accent-primary)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--dsc-ink-muted)', fontWeight: 400 }}>
        {kpi.label}
      </span>
      <span
        data-live-kpi={kpi.live ? 'true' : undefined}
        aria-live={kpi.live ? 'polite' : undefined}
        aria-atomic={kpi.live ? 'true' : undefined}
        style={{
          fontSize: primary ? 'var(--dsc-kpi-size)' : '1.6rem',
          fontWeight: 'var(--dsc-kpi-weight)' as React.CSSProperties['fontWeight'],
          color: 'var(--dsc-ink)',
          lineHeight: 1.05,
          whiteSpace: 'nowrap', // 숫자·단위 한 줄 유지 — 긴 소수 KPI가 (MT)만 떨어뜨리는 줄바꿈 방지
        }}
      >
        <span style={{ display: 'inline-grid', overflow: 'hidden', verticalAlign: 'baseline' }}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={`${kpi.label}-${kpi.value}-${decimals}`}
              data-kpi-number="true"
              data-kpi-value={kpi.value}
              initial={canAnimateLiveUpdate ? { opacity: 0, y: 6 } : false}
              animate={canAnimateLiveUpdate ? {
                opacity: 1,
                y: 0,
                textShadow: [
                  '0 0 0 transparent',
                  `0 0 10px ${glow}`,
                  '0 0 0 transparent',
                ],
              } : { opacity: 1, y: 0, textShadow: '0 0 0 transparent' }}
              exit={canAnimateLiveUpdate ? { opacity: 0, y: -6 } : undefined}
              transition={canAnimateLiveUpdate ? {
                opacity: { duration: 0.08 },
                y: { duration: 0.08 },
                textShadow: { duration: 0.24, times: [0, 0.4, 1] },
              } : { duration: 0 }}
              style={{
                display: 'inline-block',
                gridArea: '1 / 1',
                fontFamily: 'var(--dsc-font-mono)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {reduce || kpi.live ? (
                formattedValue
              ) : (
                <CountUp end={kpi.value} separator="," decimals={decimals} duration={1.4} />
              )}
            </motion.span>
          </AnimatePresence>
        </span>
        <span
          data-kpi-unit="true"
          style={{
            fontSize: 'var(--dsc-kpi-unit-size)',
            fontWeight: 400,
            color: 'var(--dsc-ink-muted)',
            marginLeft: 8,
            fontVariantNumeric: 'tabular-nums',
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
        borderRadius: 12,
        padding: '14px 16px',
        backdropFilter: 'var(--dsc-surface-blur)',
        WebkitBackdropFilter: 'var(--dsc-surface-blur)',
        maxWidth: 340,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dsc-warn-ink, #fda4af)' }}>⚠ {warning.title}</span>
      {warning.lines.map((line, i) => (
        <p key={i} style={{ margin: 0, fontSize: '0.78rem', color: 'var(--dsc-warn-ink, #fecdd3)', lineHeight: 1.5 }}>
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
            color: 'var(--dsc-ink, #f8fafc)',
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
        background: 'var(--dsc-bg-deep)',
        border: '1px solid var(--dsc-surface-border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 배경층: 선박 이미지 / 지도 캔버스 */}
      {background && (
        <div style={{ position: 'absolute', inset: 0 }} aria-hidden>
          {background}
          {/* 가독성 스크림 — 타이틀·KPI가 얹히는 영역. 토큰 경유라 라이트에서는 흰 페이드가 된다. */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(var(--dsc-scrim-rgb, 5, 5, 6), 0.72) 0%, rgba(var(--dsc-scrim-rgb, 5, 5, 6), 0.12) 34%, rgba(var(--dsc-scrim-rgb, 5, 5, 6), 0.55) 100%)',
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
            // 코스모 계열(.cosmo-root)의 자체 폰트 상속으로 페이지마다 타이틀 서체가 갈리던 문제 — 명시 통일 (2026-08-15)
            fontFamily: 'var(--font-pretendard), var(--font-geist-sans), "Apple SD Gothic Neo", sans-serif',
            fontSize: 'var(--dsc-title-size)',
            fontWeight: 'var(--dsc-title-weight)' as React.CSSProperties['fontWeight'],
            color: 'var(--dsc-ink)',
            letterSpacing: '-0.02em',
            lineHeight: 1.08,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--dsc-ink-muted)' }}>
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
