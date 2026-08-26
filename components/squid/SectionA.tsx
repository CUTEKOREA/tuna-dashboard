'use client';

/**
 * 조달 가능성 — 위젯 10개.
 *
 * P3-A 세션 소유 파일. 다른 섹션 파일과 공용 컴포넌트는 건드리지 않는다.
 *
 * 차트를 붙이는 방법: 아래 RENDERERS 에 위젯 id 를 키로 본문을 반환하는 함수를 추가한다.
 * 등록하지 않은 위젯은 GenericWidgetBody(표) 로 그려지므로 화면이 비는 구간이 없다.
 */

import React from 'react';
import {
  BarChart,
  Bar,
  Cell,
  LabelList,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import SquidSection from './SquidSection';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import type { SquidSource, SquidV5, SquidWidget } from './types';
import { koreanUiText, squidUnitLabel } from './localization';

const AXIS = '#64748b';
const BODY = '#cbd5e1';
const SQUID = '#8b5cf6';

const TOOLTIP_STYLE: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: '0.7rem',
  color: BODY,
  minWidth: 0,
};

const fmtT = (n: number) =>
  n >= 100 ? Math.round(n).toLocaleString('ko-KR') : n.toLocaleString('ko-KR', { maximumFractionDigits: 3 });
const fmtMan = (v: number) => (v >= 10000 ? `${Math.round(v / 10000)}만` : String(v));
const fmtPct = (p: number) => (p < 0.1 ? String(p) : p.toFixed(1));

// ─── A_sourcing_signal_board ─────────────────────────────────────────────────

const SIGNAL_COLOR: Record<string, string> = {
  조업중: '#10b981',
  어기중: '#38bdf8',
  '중단·제한': '#f59e0b',
  어기외: '#64748b',
  데이터공백: '#8b5cf6',
};

const SourcingSignalBoard: React.FC<{ data: any[] }> = ({ data }) => {
  if (!Array.isArray(data) || !data.length) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10, minWidth: 0 }}>
      {data.map((o) => {
        const color = SIGNAL_COLOR[o.status] ?? AXIS;
        const derived = o.state_evidence?.evidence_type === 'schedule_derived';
        const blank = o.status === '데이터공백';
        return (
          <div
            key={o.origin}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              border: `1px solid ${color}55`,
              background: blank
                ? `repeating-linear-gradient(45deg, ${color}14, ${color}14 6px, transparent 6px, transparent 12px)`
                : `${color}14`,
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}88`, flexShrink: 0 }} />
              <strong style={{ color: 'var(--w-slate-200)', fontSize: '0.85rem' }}>{koreanUiText(o.origin)}</strong>
            </div>
            <div style={{ color, fontWeight: 800, fontSize: '1.15rem', marginTop: 6, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
              {o.status}
              {derived && (
                <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--w-slate-400)', border: '1px dashed var(--w-slate-400)', borderRadius: 4, padding: '1px 5px' }}>
                  일정 파생
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--w-slate-400)', marginTop: 5, lineHeight: 1.55, wordBreak: 'keep-all' }}>
              {o.as_of ?? '기준일 없음'} · {koreanUiText(o.reason)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── A_chile_jibia_quota ─────────────────────────────────────────────────────

const SEG_KO: Record<string, string> = {
  ARTESANAL: '소형어업',
  INDUSTRIAL: '산업어업',
  'ARTESANAL-INDUSTRIAL': '소형·산업 공동',
};

const quotaColor = (pct: number) => (pct >= 90 ? '#f43f5e' : pct >= 75 ? '#f59e0b' : '#38bdf8');

const SegTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE}>
      <div style={{ fontWeight: 700, color: 'var(--w-slate-200)', marginBottom: 4 }}>
        {d.name}
      </div>
      <div>배분 {fmtT(d.allocation)}톤</div>
      <div>포획 {fmtT(d.capture)}톤</div>
      <div>잔여 {fmtT(d.balance)}톤</div>
      <div>소진율 {fmtPct(d.pct)}%</div>
    </div>
  );
};

const QuotaGauge: React.FC<{ data: Record<string, any> }> = ({ data }) => {
  if (!data || typeof data !== 'object' || typeof data.consumption_pct !== 'number') return null;
  const pct = data.consumption_pct;
  const fill = Math.min(pct, 100);
  const color = quotaColor(pct);
  const breakdown: any[] = Array.isArray(data.breakdown) ? data.breakdown : [];
  const segData = breakdown.map((b) => ({
    name: SEG_KO[b.segment] ?? b.segment,
    segment: b.segment,
    capture: b.capture_tonnes,
    balance: b.balance_tonnes,
    allocation: b.allocation_tonnes,
    pct: b.consumption_pct,
  }));

  return (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'stretch' }}>
        <div style={{ flex: '1 1 180px', minWidth: 0, position: 'relative' }}>
          <SafeResponsiveContainer width="100%" height={118}>
            <PieChart>
              <Pie data={[{ value: 1 }]} dataKey="value" cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={56} outerRadius={78} stroke="none">
                <Cell fill="rgba(var(--w-slate-500-rgb), 0.2)" />
              </Pie>
              <Pie data={[{ value: fill }, { value: 100 - fill }]} dataKey="value" cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={56} outerRadius={78} stroke="none">
                <Cell fill={color} />
                <Cell fill="transparent" />
              </Pie>
            </PieChart>
          </SafeResponsiveContainer>
          <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color, lineHeight: 1 }}>{fmtPct(pct)}%</div>
            <div style={{ fontSize: '0.62rem', color: AXIS, marginTop: 2 }}>쿼터 소진율</div>
          </div>
        </div>
        <div style={{ flex: '1 1 160px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: '6px 10px', borderRadius: 10, background: 'rgba(var(--w-emerald-500-rgb), 0.06)', border: '1px solid rgba(var(--w-emerald-500-rgb), 0.25)' }}>
          <div style={{ fontSize: '0.66rem', color: 'var(--w-slate-400)' }}>잔여 쿼터 - 조달 가능량</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--w-emerald-500)', lineHeight: 1.1 }}>
            {fmtT(data.quota_minus_recorded_capture_tonnes)} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>톤</span>
          </div>
          <div style={{ fontSize: '0.66rem', color: 'var(--w-slate-400)', lineHeight: 1.5, wordBreak: 'keep-all' }}>
            법정 쿼터 {fmtT(data.legal_quota_tonnes)}톤 · 누적 포획 {fmtT(data.recorded_capture_tonnes)}톤 ({data.as_of} 기준)
          </div>
        </div>
      </div>

      {segData.length > 0 && (
        <>
          <div style={{ minWidth: 0 }}>
            <SafeResponsiveContainer width="100%" height={130}>
              <BarChart data={segData} layout="vertical" margin={{ top: 4, right: 14, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--w-slate-500-rgb), 0.15)" horizontal={false} />
                <XAxis type="number" tick={{ fill: AXIS, fontSize: 10 }} tickFormatter={fmtMan} axisLine={{ stroke: AXIS }} tickLine={false} />
                <YAxis type="category" dataKey="name" width={96} tick={{ fill: BODY, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<SegTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="capture" stackId="a" fill={SQUID} name="포획" />
                <Bar dataKey="balance" stackId="a" fill="rgba(var(--w-slate-400-rgb), 0.18)" name="잔여" radius={[0, 3, 3, 0]} />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {breakdown.map((b) => (
              <div key={b.segment} style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', fontSize: '0.66rem', color: 'var(--w-slate-400)', lineHeight: 1.5 }}>
                <span style={{ color: BODY, fontWeight: 600 }}>
                  <span title={b.segment}>{SEG_KO[b.segment] ?? koreanUiText(b.segment)}</span>
                </span>
                <span>배분 {fmtT(b.allocation_tonnes)}톤</span>
                <span>포획 {fmtT(b.capture_tonnes)}톤</span>
                <span>잔여 {fmtT(b.balance_tonnes)}톤</span>
                <span style={{ color: quotaColor(b.consumption_pct), fontWeight: 700 }}>소진 {fmtPct(b.consumption_pct)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── A_species_production_split ──────────────────────────────────────────────

const SPECIES_META: Record<string, { ko: string; color: string }> = {
  'Todarodes pacificus': { ko: '살오징어', color: SQUID },
  'Illex argentinus': { ko: '아르헨티나 일렉스', color: '#38bdf8' },
  'Dosidicus gigas': { ko: '대왕오징어', color: '#f59e0b' },
  'Doryteuthis gahi': { ko: '포클랜드 로리고', color: '#10b981' },
};

const ProdTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE}>
      <div style={{ fontWeight: 700, color: 'var(--w-slate-200)', marginBottom: 4 }}>{label}년</div>
      {payload.map((p: any) => {
        const m = SPECIES_META[p.dataKey];
        return (
          <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.stroke, flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap' }}>{m?.ko ?? p.dataKey}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {p.value == null ? '-' : `${fmtT(p.value)}톤`}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const ProductionSplitChart: React.FC<{ data: any[]; unit?: string }> = ({ data, unit }) => {
  const wide = React.useMemo(() => {
    if (!Array.isArray(data)) return [] as Record<string, any>[];
    const map = new Map<number, Record<string, any>>();
    for (const r of data) {
      if (!map.has(r.year)) map.set(r.year, { year: r.year });
      map.get(r.year)![r.scientific_name] = r.tonnes_live_weight ?? null;
    }
    return Array.from(map.values()).sort((a, b) => a.year - b.year);
  }, [data]);
  if (!wide.length) return null;
  const keys = Object.keys(SPECIES_META);

  return (
    <div style={{ minWidth: 0 }}>
      <SafeResponsiveContainer width="100%" height={280}>
        <LineChart data={wide} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--w-slate-500-rgb), 0.15)" />
          <XAxis
            dataKey="year"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickCount={10}
            tick={{ fill: AXIS, fontSize: 10 }}
            tickFormatter={(v) => String(v)}
            axisLine={{ stroke: AXIS }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: AXIS, fontSize: 10 }}
            tickFormatter={(v) => fmtMan(v)}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip content={<ProdTooltip />} />
          {keys.map((k) => (
            <Line key={k} dataKey={k} stroke={SPECIES_META[k].color} strokeWidth={1.8} dot={false} activeDot={{ r: 3 }} />
          ))}
        </LineChart>
      </SafeResponsiveContainer>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 8 }}>
        {keys.map((k) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', color: BODY, minWidth: 0 }}>
            <span style={{ width: 12, height: 3, background: SPECIES_META[k].color, borderRadius: 2, flexShrink: 0 }} />
            <span title={k}>{SPECIES_META[k].ko}</span>
          </span>
        ))}
      </div>
      <div style={{ marginTop: 6, fontSize: '0.62rem', color: AXIS }}>단위: {squidUnitLabel(unit ?? '톤(활중량)')} · 결측 연도는 선을 잇지 않음</div>
    </div>
  );
};

// ─── A_sprfmo_cmm18_effort ───────────────────────────────────────────────────

const MEMBER_KO: Record<string, string> = { China: '중국', Korea: '한국', 'Chinese Taipei': '대만' };

const EffortTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={TOOLTIP_STYLE}>
      <div style={{ fontWeight: 700, color: 'var(--w-slate-200)', marginBottom: 4 }}>{d.ko}</div>
      <div>척수 상한 {d.vessel_limit.toLocaleString('ko-KR')} 척</div>
      <div>총 톤수 {d.gross_tonnage_gt.toLocaleString('ko-KR')} 총톤</div>
    </div>
  );
};

const EffortLimitChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!Array.isArray(data) || !data.length) return null;
  const members = data.filter((r) => r.member !== 'Total').map((r) => ({ ...r, ko: MEMBER_KO[r.member] ?? r.member }));
  const total = data.find((r) => r.member === 'Total');
  if (!members.length) return null;

  return (
    <div style={{ minWidth: 0 }}>
      <SafeResponsiveContainer width="100%" height={190}>
        <BarChart data={members} margin={{ top: 20, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--w-slate-500-rgb), 0.15)" vertical={false} />
          <XAxis dataKey="ko" tick={{ fill: BODY, fontSize: 11 }} axisLine={{ stroke: AXIS }} tickLine={false} />
          <YAxis tick={{ fill: AXIS, fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip content={<EffortTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="vessel_limit" fill="var(--w-sky-400)" radius={[4, 4, 0, 0]} maxBarSize={56} name="척수 상한">
            <LabelList dataKey="vessel_limit" position="top" style={{ fill: BODY, fontSize: 11, fontWeight: 700 }} formatter={(v: unknown) => `${v}척`} />
          </Bar>
        </BarChart>
      </SafeResponsiveContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
        {members.map((m) => (
          <div key={m.member} style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px', fontSize: '0.66rem', color: 'var(--w-slate-400)' }}>
            <span style={{ color: BODY, fontWeight: 600 }}>{m.ko}</span>
            <span>총 톤수 {m.gross_tonnage_gt.toLocaleString('ko-KR')} 총톤</span>
          </div>
        ))}
        {total && (
          <div style={{ marginTop: 2, padding: '7px 10px', borderRadius: 8, background: 'rgba(var(--w-sky-400-rgb), 0.07)', border: '1px solid rgba(var(--w-sky-400-rgb), 0.25)', fontSize: '0.72rem', color: 'var(--w-slate-200)', fontWeight: 700 }}>
            전체 합계 {total.vessel_limit.toLocaleString('ko-KR')}척 · {total.gross_tonnage_gt.toLocaleString('ko-KR')} 총톤
          </div>
        )}
        <div style={{ fontSize: '0.62rem', color: AXIS, lineHeight: 1.5, wordBreak: 'keep-all' }}>
          어획량 쿼터가 아닌 회원별 선박 척수·총톤수 상한입니다. 남태평양지역수산관리기구의 조업노력량 규제입니다.
        </div>
      </div>
    </div>
  );
};

// ─── A_peru_pota_timeline ────────────────────────────────────────────────────

const SEM_META: Record<string, { label: string; color: string }> = {
  legal_limit: { label: '법정 상한', color: '#38bdf8' },
  consumption: { label: '누적 하역', color: '#f59e0b' },
  closure_notice: { label: '중단 공지', color: '#f43f5e' },
};

const PeruTimeline: React.FC<{ data: any[] }> = ({ data }) => {
  if (!Array.isArray(data) || !data.length) return null;
  const events = [...data].sort((a, b) => String(a.date).localeCompare(String(b.date)));

  return (
    <div style={{ position: 'relative', paddingLeft: 22, minWidth: 0 }}>
      <div style={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 2, background: 'rgba(var(--w-slate-500-rgb), 0.3)' }} />
      {events.map((e) => {
        const sem = SEM_META[e.quota_semantics] ?? { label: e.quota_semantics, color: AXIS };
        return (
          <div key={`${e.date}-${e.event}`} style={{ position: 'relative', paddingBottom: 18 }}>
            <span
              style={{
                position: 'absolute', left: -22, top: 3, width: 12, height: 12, borderRadius: '50%',
                background: sem.color, border: '2px solid #0f172a', boxShadow: `0 0 8px ${sem.color}66`,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 8px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: AXIS }}>{e.date}</span>
              <strong style={{ fontSize: '0.82rem', color: 'var(--w-slate-200)' }}>{koreanUiText(e.event)}</strong>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: sem.color, border: `1px solid ${sem.color}66`, borderRadius: 4, padding: '1px 6px', background: `${sem.color}12` }}>
                {sem.label}
              </span>
            </div>

            {typeof e.tonnes === 'number' && (
              <div style={{ marginTop: 5, fontSize: '1.15rem', fontWeight: 800, color: sem.color, lineHeight: 1.2 }}>
                {fmtT(e.tonnes)} <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>톤</span>
                {typeof e.progress_pct === 'number' && (
                  <span style={{ marginLeft: 8, fontSize: '0.72rem', fontWeight: 700 }}>총허용어획한도 대비 {e.progress_pct}%</span>
                )}
              </div>
            )}
            {e.quota_semantics === 'closure_notice' && (
              <div style={{ marginTop: 5, fontSize: '0.75rem', color: '#f43f5e', fontWeight: 700 }}>조업 중단 - 톤수 미기재</div>
            )}

            {typeof e.progress_pct === 'number' && (
              <div style={{ marginTop: 6, height: 6, borderRadius: 3, background: 'rgba(var(--w-slate-500-rgb), 0.2)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(e.progress_pct, 100)}%`, height: '100%', borderRadius: 3, background: sem.color }} />
              </div>
            )}

            {Array.isArray(e.closures) && e.closures.length > 0 && (
              <div style={{ marginTop: 7, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {e.closures.map((c: any) => (
                  <div key={c.vessel_capacity} style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 8px', fontSize: '0.68rem', padding: '5px 8px', borderRadius: 6, background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', minWidth: 0 }}>
                    <span style={{ color: BODY, fontWeight: 600 }}>선창 {c.vessel_capacity}</span>
                    <span style={{ color: '#f43f5e', fontWeight: 700 }}>{c.effective_date} 발효</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── A_korea_tac ─────────────────────────────────────────────────────────────

const KoreaTacTable: React.FC<{ data: any[] }> = ({ data }) => {
  if (!Array.isArray(data) || !data.length) return null;
  return (
    <div style={{ minWidth: 0 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
        <thead>
          <tr>
            {['어종', '적용 업종', '적용 단계'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '5px 8px', color: AXIS, fontSize: '0.68rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => {
            const hl = r.species === '살오징어';
            return (
              <tr key={i} style={hl ? { background: 'rgba(var(--w-violet-500-rgb), 0.08)' } : undefined}>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: hl ? '#a78bfa' : BODY, fontWeight: hl ? 700 : 400, whiteSpace: 'nowrap' }}>
                  {r.species}
                </td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: BODY, wordBreak: 'keep-all' }}>
                  {r.applicable_fishery}
                </td>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', color: BODY, whiteSpace: 'nowrap' }}>
                  {r.application_stage}단계
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ margin: '8px 0 0', fontSize: '0.64rem', color: AXIS, lineHeight: 1.5, wordBreak: 'keep-all' }}>
        배정 톤수가 아닌 총허용어획량 적용 대상 업종·단계입니다. 살오징어는 서남해구외끌이중형저인망에 2단계 적용.
      </p>
    </div>
  );
};

// ─── 등록 ────────────────────────────────────────────────────────────────────

const RENDERERS: Record<string, (widget: SquidWidget, sources: SquidSource[]) => React.ReactNode> = {
  A_sourcing_signal_board: (w) => <SourcingSignalBoard data={w.data as any[]} />,
  A_chile_jibia_quota: (w) => <QuotaGauge data={w.data as Record<string, any>} />,
  A_species_production_split: (w) => <ProductionSplitChart data={w.data as any[]} unit={w.unit} />,
  A_sprfmo_cmm18_effort: (w) => <EffortLimitChart data={w.data as any[]} />,
  A_peru_pota_timeline: (w) => <PeruTimeline data={w.data as any[]} />,
  A_korea_tac: (w) => <KoreaTacTable data={w.data as any[]} />,
};

export const SectionA: React.FC<{ doc: SquidV5 }> = ({ doc }) => (
  <SquidSection
    section="A"
    doc={doc}
    render={(id, w, sources) => RENDERERS[id]?.(w, sources)}
  />
);

export default SectionA;
