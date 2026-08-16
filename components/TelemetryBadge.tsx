'use client';

import React from 'react';
import styles from './TelemetryBadge.module.css';

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

  if (variant === 'caption') {
    const showStatus = isLive || isSynced || !syncDate;
    return (
      <span
        data-telemetry-status={normalizedStatus}
        data-telemetry-tone={isLive ? 'accent' : 'neutral'}
        data-telemetry-variant="caption"
        className={styles.caption}
      >
        {showStatus ? (
          <span className={styles.captionStatus}>{label ?? STATUS_KO[normalizedStatus]}</span>
        ) : null}
        {syncDate ? <span className={styles.captionDate}>{syncDate}</span> : null}
      </span>
    );
  }

  // 색은 전부 CSS 모듈로 — [data-v3='light'] 스코프가 라이트 대비값으로 재정의한다
  // (V2.5까지의 인라인 다크 pill이 라이트 배경에서 흐릿하던 문제, 2026-08-15 사용자 지적).
  return (
    <div
      data-telemetry-status={normalizedStatus}
      data-telemetry-tone={isLive ? 'accent' : 'neutral'}
      className={styles.badge}
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
    </div>
  );
};

export default TelemetryBadge;
