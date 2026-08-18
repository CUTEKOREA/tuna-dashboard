'use client';

import type { ReactNode } from 'react';

import { inlineStars } from '../cosmo/Ui';

/**
 * 파노피 화면 프리미티브. 트레이딩 터미널 밀도로 짠 얇은 껍데기다.
 *
 * 코스모 `Ui.tsx` 를 그대로 쓰지 않는 이유는 색이 아니라 밀도다 — 코스모 카드는
 * 한 장에 차트 하나를 크게 두는 리포트 톤이고, 여기는 한 화면에 지표를 최대한
 * 올리는 운영 화면이다. 색 토큰은 코스모 것을 공유한다.
 */

/* ── 격자 ─────────────────────────────────────────────────────────────── */

export type Span = 3 | 4 | 6 | 8 | 12;

export function Grid({ children }: { children: ReactNode }) {
  return <div className="pf-grid">{children}</div>;
}

export function Sec({ children }: { children: ReactNode }) {
  return <div className="pf-sec"><span>{children}</span></div>;
}

/* ── 패널 ─────────────────────────────────────────────────────────────── */

export function Panel({
  title, unit, note, src, span = 12, children,
}: {
  title?: string;
  /** 단위·기준을 제목 오른쪽에 붙인다. «단위: 톤» 처럼 본문에 묻지 않게. */
  unit?: string;
  note?: ReactNode;
  /** 출처는 선택이 아니다 — 이 화면은 원자료가 다섯 갈래라 출처 없이는 못 읽는다. */
  src?: ReactNode;
  span?: Span;
  children: ReactNode;
}) {
  return (
    <section className={`pf-panel pf-col-${span}`}>
      {(title || unit) && (
        <div className="pf-head">
          {title && <h3 className="pf-title">{title}</h3>}
          {unit && <span className="pf-unit">{unit}</span>}
        </div>
      )}
      {children}
      {note && <div className="pf-note">{typeof note === 'string' ? inlineStars(note) : note}</div>}
      {src && <div className="pf-src">출처 — {src}</div>}
    </section>
  );
}

/* ── 입도·단위 전환 pill ──────────────────────────────────────────────── */

/** 차트 위 입도(주간·월간…)·단위(실량·비중) 전환. 탭이 아니라 토글 그룹이다. */
export function Pills<K extends string>({
  options, value, onChange, label,
}: {
  options: readonly { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
  /** 접근성 이름 — 그룹이 무엇을 전환하는지 */
  label: string;
}) {
  return (
    <div className="pf-pills" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          className={`pf-pill${o.key === value ? ' on' : ''}`}
          aria-pressed={o.key === value}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ── stat strip ───────────────────────────────────────────────────────── */

export type StatTone = 'up' | 'down' | 'flat';

export function Stats({ children }: { children: ReactNode }) {
  return <div className="pf-stats">{children}</div>;
}

export function Stat({
  k, v, unit, d, tone,
}: {
  k: string;
  v: string;
  unit?: string;
  d?: ReactNode;
  tone?: StatTone;
}) {
  return (
    <div className="pf-stat">
      <span className="pf-stat-k">{k}</span>
      <span className={`pf-stat-v ${tone && tone !== 'flat' ? tone : ''}`}>
        {v}{unit && <small>{unit}</small>}
      </span>
      {d && <span className="pf-stat-d">{d}</span>}
    </div>
  );
}

/* ── 상태 바 ──────────────────────────────────────────────────────────── */

export function Signals({ children }: { children: ReactNode }) {
  return <div className="pf-signals">{children}</div>;
}

/** 상태는 색만으로 알리지 않는다. 점 + 정상값 + 경보값 + 조치를 함께 둔다. */
export function Signal({
  k, normal, warn, action,
}: {
  k: string; normal: string; warn: string; action: string;
}) {
  return (
    <div className="pf-signal">
      <span className="pf-signal-k">{k}</span>
      <span className="pf-signal-row"><i className="pf-dot ok" aria-hidden />정상 {normal}</span>
      <span className="pf-signal-warn">경보 {warn}</span>
      <span className="pf-signal-act">{action}</span>
    </div>
  );
}

/* ── 표 ───────────────────────────────────────────────────────────────── */

export function Table({
  head, children,
}: {
  head: string[];
  children: ReactNode;
}) {
  return (
    <div className="pf-table-wrap">
      <table className="pf-table">
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
