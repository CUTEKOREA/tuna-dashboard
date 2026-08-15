'use client';

/**
 * 근거·거버넌스 — 위젯 5개.
 *
 * P3-E 세션 소유 파일. 다른 섹션 파일과 공용 컴포넌트는 건드리지 않는다.
 *
 * 이 섹션은 이 대시보드의 차별점이다 — 자기 데이터의 한계를 화면에 표시한다.
 * 화려할 필요 없이 읽히기만 하면 된다. 4개 위젯은 전용 본문으로 그리고,
 * E_corrections_log(행 0건)는 SquidCard 의 빈 카드 안내가 대신한다.
 */

import React, { useMemo, useState } from 'react';
import SquidSection from './SquidSection';
import type { SquidSource, SquidV5, SquidWidget } from './types';

const C = {
  violation: '#f43f5e',
  caution: '#f59e0b',
  ok: '#10b981',
  info: '#38bdf8',
  axis: '#64748b',
  body: '#cbd5e1',
  dim: '#94a3b8',
};

/* ---------------------------------------------------------------- 공용 조각 */

const Badge: React.FC<{ label: string; color: string; title?: string }> = ({ label, color, title }) => (
  <span
    title={title}
    style={{
      display: 'inline-block',
      padding: '1px 7px',
      borderRadius: 999,
      border: `1px solid ${color}55`,
      background: `${color}1a`,
      color,
      fontSize: '0.62rem',
      fontWeight: 700,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </span>
);

const FilterChip: React.FC<{ active: boolean; label: string; color: string; onClick: () => void }> = ({
  active, label, color, onClick,
}) => (
  <button
    onClick={onClick}
    style={{
      padding: '2px 10px',
      borderRadius: 999,
      fontSize: '0.66rem',
      fontWeight: 700,
      cursor: 'pointer',
      border: `1px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
      background: active ? `${color}22` : 'transparent',
      color: active ? color : C.dim,
    }}
  >
    {label}
  </button>
);

const TH: React.CSSProperties = {
  textAlign: 'left',
  padding: '5px 8px',
  color: C.axis,
  fontSize: '0.64rem',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  whiteSpace: 'nowrap',
};

const TD: React.CSSProperties = {
  padding: '5px 8px',
  color: C.body,
  fontSize: '0.7rem',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
  verticalAlign: 'top',
};

/** 데이터 원문 주기의 한글 표시 (원문은 title 에 보존). */
const FREQ_KO: Record<string, string> = {
  annual: '연간',
  monthly: '월간',
  weekly: '주간',
  quarterly: '분기별',
  seasonal: '어기별',
  event: '이벤트성',
  on_revision: '개정 시',
  weekly_in_season: '어기 내 주간',
  annual_event: '연간 이벤트',
  event_weekly: '이벤트·주간',
  weekly_monthly: '주간·월간',
  monthly_annual: '월간·연간',
  event_monthly: '이벤트·월간',
};

const freqKo = (f: string) => FREQ_KO[f] ?? f;

/* ------------------------------------------------------ E_source_registry */

interface RegistryRow {
  source_id: string;
  publisher: string;
  series?: string;
  priority: string;
  grade: string;
  frequency: string;
  landing_url: string;
  latest_verified?: string;
  note?: string;
}

const GRADE_COLOR: Record<string, string> = { A: C.ok, B: C.info, C: C.caution };
const PRIO_COLOR: Record<string, string> = { P0: '#e2e8f0', P1: C.dim, P2: C.axis };

const SourceRegistry: React.FC<{ rows: RegistryRow[] }> = ({ rows }) => {
  const [grade, setGrade] = useState<'전체' | 'A' | 'B' | 'C'>('전체');
  const [prio, setPrio] = useState<'전체' | 'P0' | 'P1' | 'P2'>('전체');

  const shown = useMemo(
    () => rows.filter((r) => (grade === '전체' || r.grade === grade) && (prio === '전체' || r.priority === prio)),
    [rows, grade, prio],
  );

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: '0.64rem', color: C.axis }}>등급</span>
        {(['전체', 'A', 'B', 'C'] as const).map((g) => (
          <FilterChip key={g} active={grade === g} label={g} color={g === '전체' ? C.info : GRADE_COLOR[g]} onClick={() => setGrade(g)} />
        ))}
        <span style={{ fontSize: '0.64rem', color: C.axis, marginLeft: 8 }}>우선순위</span>
        {(['전체', 'P0', 'P1', 'P2'] as const).map((p) => (
          <FilterChip key={p} active={prio === p} label={p} color={p === '전체' ? C.info : '#e2e8f0'} onClick={() => setPrio(p)} />
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.64rem', color: C.axis }}>
          {shown.length} / {rows.length}건
        </span>
      </div>

      <p style={{ margin: '0 0 8px', fontSize: '0.64rem', color: C.caution, wordBreak: 'keep-all' }}>
        C등급은 위험 탐색용 — 단독으로 법규나 시장규모를 확정할 수 없다 (게이트 G-010).
      </p>

      <div style={{ minWidth: 0, maxHeight: 460, overflowY: 'auto', overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 760 }}>
          <thead>
            <tr>
              {['출처 ID', '발행처', '계열', '등급', '우선순위', '주기', '최신 확인', '랜딩 링크', '비고'].map((h) => (
                <th key={h} style={{ ...TH, position: 'sticky', top: 0, background: '#0f172a', zIndex: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const gradeColor = GRADE_COLOR[r.grade] ?? C.axis;
              const isC = r.grade === 'C';
              return (
                <tr key={r.source_id} style={isC ? { background: 'rgba(var(--w-amber-500-rgb), 0.05)' } : undefined}>
                  <td style={{ ...TD, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.64rem' }}>{r.source_id}</td>
                  <td style={{ ...TD, whiteSpace: 'nowrap' }}>{r.publisher}</td>
                  <td style={{ ...TD, whiteSpace: 'nowrap' }}>{r.series ?? '—'}</td>
                  <td style={TD}>
                    <Badge label={r.grade} color={gradeColor} title={isC ? '위험 탐색용 — 단독 확정 불가' : undefined} />
                  </td>
                  <td style={TD}>
                    <Badge label={r.priority} color={PRIO_COLOR[r.priority] ?? C.axis} />
                  </td>
                  <td style={{ ...TD, whiteSpace: 'nowrap' }} title={r.frequency}>{freqKo(r.frequency)}</td>
                  <td style={{ ...TD, whiteSpace: 'nowrap' }}>{r.latest_verified ?? '—'}</td>
                  <td style={{ ...TD, whiteSpace: 'nowrap' }}>
                    <a
                      href={r.landing_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: C.info, textDecoration: 'none', fontSize: '0.66rem' }}
                    >
                      원문 ↗
                    </a>
                  </td>
                  <td style={{ ...TD, minWidth: 200, whiteSpace: 'normal', wordBreak: 'keep-all', color: r.note ? C.body : C.axis }}>
                    {r.note || '—'}
                  </td>
                </tr>
              );
            })}
            {!shown.length && (
              <tr>
                <td colSpan={9} style={{ ...TD, color: C.axis, textAlign: 'center' }}>조건에 맞는 출처가 없다</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------------------------------------------------- E_gate_status_board */

interface GateRow {
  gate_id: string;
  subject: string;
  allowed_use: string;
  blocked_use: string;
  evidence_path?: string;
  explicit_widget_count: number;
}

const GateBoard: React.FC<{ rows: GateRow[] }> = ({ rows }) => (
  <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
    {rows.map((g) => (
      <div
        key={g.gate_id}
        style={{
          minWidth: 0,
          padding: '8px 10px',
          borderRadius: 8,
          border: '1px solid rgba(244,63,94,0.22)',
          background: 'rgba(244,63,94,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Badge label={g.gate_id} color={C.dim} />
          <strong style={{ color: 'var(--w-slate-200)', fontSize: '0.78rem' }}>{g.subject}</strong>
          <span
            title="이 게이트를 명시적으로 단 위젯 수"
            style={{ marginLeft: 'auto', fontSize: '0.62rem', color: g.explicit_widget_count > 0 ? C.dim : C.axis }}
          >
            명시 부착 {g.explicit_widget_count}개 위젯
          </span>
        </div>

        <div
          style={{
            marginTop: 6,
            padding: '5px 8px',
            borderRadius: 6,
            background: 'rgba(244,63,94,0.12)',
            borderLeft: `3px solid ${C.violation}`,
            color: C.violation,
            fontSize: '0.78rem',
            fontWeight: 800,
            lineHeight: 1.5,
            wordBreak: 'keep-all',
          }}
        >
          ✕ 금지: {g.blocked_use}
        </div>
        <div style={{ marginTop: 4, color: C.dim, fontSize: '0.68rem', lineHeight: 1.5, wordBreak: 'keep-all' }}>
          <span style={{ color: C.ok, fontWeight: 700 }}>○ 허용:</span> {g.allowed_use}
        </div>
        {g.evidence_path && (
          <div style={{ marginTop: 3, color: C.axis, fontSize: '0.6rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            근거: {g.evidence_path}
          </div>
        )}
      </div>
    ))}
  </div>
);

/* ------------------------------------------------- E_monitoring_calendar */

interface CalendarRow {
  source_id: string;
  series: string;
  frequency: string;
  latest_verified: string;
  next_check: string;
  status: string;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: '정상', color: C.ok },
  active_gap: { label: '부분 공백', color: C.caution },
  pipeline_gap: { label: '파이프라인 공백', color: C.caution },
  coverage_gap: { label: '커버리지 공백', color: C.caution },
  manual_export_gap: { label: '수동 내보내기 공백', color: C.caution },
  scheduled: { label: '일정 예정', color: C.info },
};

const GAP_DESC: { status: string; desc: string }[] = [
  { status: 'active_gap', desc: '갱신은 이뤄지나 일부 자료의 검증이 대기 중' },
  { status: 'pipeline_gap', desc: '자료를 정기 수집하는 파이프라인에 공백' },
  { status: 'coverage_gap', desc: '레거시 데이터만 있어 커버리지에 공백' },
  { status: 'manual_export_gap', desc: '공식 사이트 UI에서 수동 내보내기 대기 중' },
];

const MonitoringCalendar: React.FC<{ rows: CalendarRow[] }> = ({ rows }) => {
  const sorted = useMemo(() => [...rows].sort((a, b) => a.next_check.localeCompare(b.next_check)), [rows]);

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ minWidth: 0, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 640 }}>
          <thead>
            <tr>
              {['다음 점검', '상태', '출처 ID', '계열', '주기', '최신 확인'].map((h) => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const meta = STATUS_META[r.status] ?? { label: r.status, color: C.axis };
              return (
                <tr key={`${r.source_id}-${r.next_check}`}>
                  <td style={{ ...TD, whiteSpace: 'nowrap', fontWeight: 700, color: 'var(--w-slate-200)' }}>{r.next_check}</td>
                  <td style={{ ...TD, whiteSpace: 'nowrap' }} title={r.status}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, boxShadow: `0 0 6px ${meta.color}88` }} />
                      <span style={{ color: meta.color, fontWeight: 700, fontSize: '0.66rem' }}>{meta.label}</span>
                    </span>
                  </td>
                  <td style={{ ...TD, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.64rem' }}>{r.source_id}</td>
                  <td style={TD}>{r.series}</td>
                  <td style={{ ...TD, whiteSpace: 'nowrap' }} title={r.frequency}>{freqKo(r.frequency)}</td>
                  <td style={{ ...TD, whiteSpace: 'nowrap' }}>{r.latest_verified}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 4 }}>
        {GAP_DESC.map(({ status, desc }) => (
          <div key={status} style={{ fontSize: '0.62rem', color: C.dim, wordBreak: 'keep-all' }}>
            <span style={{ color: C.caution, fontWeight: 700 }}>{STATUS_META[status].label}</span> — {desc}
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------- E_freshness_heatmap */

interface FreshRow {
  source_id: string;
  series: string;
  latest_verified: string;
  age_days: number | null;
  band: string;
}

/** 90일 이내 정상 · 365일 이내 주의 · 초과 위반. 값이 없으면 색을 입히지 않는다. */
const ageColor = (age: number | null): string | null => {
  if (age === null || age === undefined) return null;
  if (age <= 90) return C.ok;
  if (age <= 365) return C.caution;
  return C.violation;
};

const FreshnessHeatmap: React.FC<{ rows: FreshRow[] }> = ({ rows }) => {
  // 기준일 해석불가(age 없음)를 맨 위로 — 문제가 먼저 보여야 한다. 그다음 경과일 내림차순.
  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const aNull = a.age_days === null || a.age_days === undefined;
        const bNull = b.age_days === null || b.age_days === undefined;
        if (aNull !== bNull) return aNull ? -1 : 1;
        return (b.age_days ?? 0) - (a.age_days ?? 0);
      }),
    [rows],
  );

  const counts = useMemo(() => {
    let ok = 0, caution = 0, violation = 0, unknown = 0;
    for (const r of rows) {
      const c = ageColor(r.age_days);
      if (c === C.ok) ok += 1;
      else if (c === C.caution) caution += 1;
      else if (c === C.violation) violation += 1;
      else unknown += 1;
    }
    return { ok, caution, violation, unknown };
  }, [rows]);

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10, fontSize: '0.62rem', color: C.dim }}>
        <span><span style={{ color: C.ok }}>■</span> 90일 이내 {counts.ok}건</span>
        <span><span style={{ color: C.caution }}>■</span> 365일 이내 {counts.caution}건</span>
        <span><span style={{ color: C.violation }}>■</span> 365일 초과 {counts.violation}건</span>
        <span><span style={{ color: C.axis }}>■</span> 기준일 해석불가 {counts.unknown}건</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {sorted.map((r) => {
          const color = ageColor(r.age_days);
          const unknown = color === null;
          const barPct = unknown ? 0 : Math.max(2, Math.min(100, ((r.age_days as number) / 365) * 100));
          return (
            <div
              key={r.source_id}
              style={{
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                padding: '6px 8px',
                borderRadius: 6,
                border: `1px solid ${unknown ? 'rgba(var(--w-slate-500-rgb), 0.4)' : `${color}33`}`,
                borderStyle: unknown ? 'dashed' : 'solid',
                background: unknown ? 'transparent' : `${color}0d`,
              }}
            >
              <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--w-slate-200)', wordBreak: 'keep-all' }}>{r.series}</div>
                <div style={{ fontSize: '0.6rem', color: C.axis, fontFamily: 'monospace' }}>{r.source_id}</div>
              </div>
              <div style={{ flex: '0 1 140px', fontSize: '0.64rem', color: C.dim, whiteSpace: 'nowrap' }}>
                기준: {r.latest_verified}
              </div>
              <div style={{ flex: '1 1 160px', minWidth: 120, display: 'flex', alignItems: 'center', gap: 8 }}>
                {unknown ? (
                  <Badge label={r.band || '기준일 해석불가'} color={C.axis} title="경과일을 계산할 기준 날짜를 원문에서 확정하지 못함" />
                ) : (
                  <>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', minWidth: 0 }}>
                      <div style={{ width: `${barPct}%`, height: '100%', borderRadius: 4, background: color as string }} />
                    </div>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, color: color as string, whiteSpace: 'nowrap' }}>
                      {r.age_days}일 경과
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- 본체 */

const RENDERERS: Record<
  string,
  (widget: SquidWidget, sources: SquidSource[]) => React.ReactNode
> = {
  E_source_registry: (w) => <SourceRegistry rows={w.data as RegistryRow[]} />,
  E_gate_status_board: (w) => <GateBoard rows={w.data as GateRow[]} />,
  E_monitoring_calendar: (w) => <MonitoringCalendar rows={w.data as CalendarRow[]} />,
  E_freshness_heatmap: (w) => <FreshnessHeatmap rows={w.data as FreshRow[]} />,
  // E_corrections_log 는 행 0건 — 등록하지 않아 SquidCard 의 빈 카드 안내가 그려진다.
};

export const SectionE: React.FC<{ doc: SquidV5 }> = ({ doc }) => (
  <SquidSection
    section="E"
    doc={doc}
    defaultCollapsed
    render={(id, w, sources) => RENDERERS[id]?.(w, sources)}
  />
);

export default SectionE;
