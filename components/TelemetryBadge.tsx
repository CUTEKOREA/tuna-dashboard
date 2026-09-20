'use client';

import React from 'react';
import styles from './TelemetryBadge.module.css';
import { freshnessOf, toneOf } from '@/lib/sync-freshness';

const STATUS_KO: Record<'LIVE' | 'SYNCED' | 'STATIC', string> = {
  LIVE: '실시간',
  SYNCED: '동기화',
  STATIC: '정적',
};

export interface TelemetryBadgeProps {
  status: 'LIVE' | 'SYNCED' | 'STATIC' | 'live' | 'synced' | 'static' | undefined;
  syncDate?: string;
  label?: string;
  /**
   * chip: 운영 카드용 알약. caption: 차트 제목 옆 작은 기준일.
   * 캡션에서는 영문 STATIC 상자를 쓰지 않는다 — 날짜가 본문이고 상태는 필요할 때만 한글이다.
   */
  variant?: 'chip' | 'caption';
}

export const TelemetryBadge: React.FC<TelemetryBadgeProps> = ({
  status,
  syncDate,
  label,
  variant = 'chip',
}) => {
  if (!status) return null;

  // Normalize to uppercase for strict standard compliance
  const normalizedStatus = status.toUpperCase() as 'LIVE' | 'SYNCED' | 'STATIC';
  const isLive = normalizedStatus === 'LIVE';
  const isSynced = normalizedStatus === 'SYNCED';

  /* 기준일의 «나이». 문자열은 그대로 두고 읽기만 한다 — 형식이 네 가지로
     섞여 있고 58개는 아예 날짜가 아니다(lib/sync-freshness.ts).
     오래됐거나(18개월 초과) 못 읽는 값만 색을 받는다. */
  const fresh = freshnessOf(normalizedStatus, syncDate);
  const tone = toneOf(fresh.tier);
  const unknownDate = fresh.tier === 'unknown' && !!syncDate;
  const dateTitle = unknownDate
    ? `기준일 미상 — 이 값은 날짜가 아니라 출처 표기다: ${syncDate}`
    : fresh.ageText
      ? `기준일 ${syncDate} · ${fresh.ageText}`
      : undefined;

  if (variant === 'caption') {
    const showStatus = isLive || isSynced || !syncDate;
    return (
      <span
        data-telemetry-status={normalizedStatus}
        data-telemetry-tone={tone}
        data-telemetry-variant="caption"
        className={styles.caption}
        title={dateTitle}
      >
        {showStatus ? (
          <span className={styles.captionStatus}>{label ?? STATUS_KO[normalizedStatus]}</span>
        ) : null}
        {syncDate ? <span className={styles.captionDate}>{syncDate}</span> : null}
        {fresh.ageText ? <span className={styles.age}>{fresh.ageText}</span> : null}
      </span>
    );
  }

  // 색은 전부 CSS 모듈로 — [data-v3='light'] 스코프가 라이트 대비값으로 재정의한다
  // (V2.5까지의 인라인 다크 pill이 라이트 배경에서 흐릿하던 문제, 2026-08-15 사용자 지적).
  return (
    <div
      data-telemetry-status={normalizedStatus}
      data-telemetry-tone={tone}
      className={styles.badge}
      title={dateTitle}
    >
      {(isLive || isSynced) && (
        <div className={styles.dotWrap}>
          {isLive && <div className={styles.pulse} />}
          <div className={styles.dot} />
        </div>
      )}
      <span className={styles.label}>
        {label ?? normalizedStatus}
      </span>
      {!isLive && syncDate && (
        <span className={styles.date}>
          {syncDate}
        </span>
      )}
      {/* 나이는 날짜 «옆»에 붙는다. 원문 문자열을 고치지 않고도 «얼마나 묵었나»가 보인다.
          못 읽는 값은 숨기지 않고 미상이라고 적는다 — 숨기면 영영 안 채워진다. */}
      {!isLive && fresh.ageText && (
        <span className={styles.age}>{fresh.ageText}</span>
      )}
      {unknownDate && <span className={styles.age}>기준일 미상</span>}
    </div>
  );
};

export default TelemetryBadge;
