'use client';

/**
 * 가격·마진 — 위젯 8개.
 *
 * P3-B 세션 소유 파일. 다른 섹션 파일과 공용 컴포넌트는 건드리지 않는다.
 *
 * RENDERERS 에 등록된 위젯만 전용 본문으로 그려지고, 나머지는 GenericWidgetBody 가
 * 담당한다. 등록: B_species_price_ladder · B_eu_market_prices · B_kmi_consumer_price ·
 * B_kcs_import_unit_price · B_stage_separated_prices · B_price_freshness_board.
 * 미등록: B_landed_cost_calc(빈 데이터 — SquidCard 빈 카드 안내가 처리) ·
 * B_globefish_market_brief(원문 발췌 — ExcerptList 가 적임).
 *
 * 철칙(G-008): 소비자가·1차판매가·수입단가는 서로 다른 거래단계다. 한 축에 겹쳐
 * 그리거나 평균·환산하지 않는다. EUR·USD 는 같은 값의 통화별 표시라 합산 금지.
 */

import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ReferenceLine,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import SquidSection from './SquidSection';
import type { SquidSource, SquidV5, SquidWidget } from './types';

const C = {
  violation: '#f43f5e',
  caution: '#f59e0b',
  ok: '#10b981',
  info: '#38bdf8',
  squid: '#8b5cf6',
  axis: '#64748b',
  text: '#cbd5e1',
  faint: '#94a3b8',
};

const fmt = (n: number) => n.toLocaleString('ko-KR');

// 학명은 한글 대응이 없을 때 원문 그대로 둔다 (L-01 예외)
const SPECIES_KO: Record<string, string> = {
  'Loligo vulgaris': '유럽 로리고',
  'Loligo spp.': '로리고류',
  'Loligo gahi': '포클랜드 로리고',
  'Illex argentinus': '아르헨티나 일렉스',
};
const spKo = (s: string | null | undefined) => (s ? SPECIES_KO[s] ?? s : '—');

const FORM_KO: Record<string, string> = {
  Whole: '원물',
  'Fresh - whole': '생물 원물',
  'Grade A': 'A등급 원물',
  'IQF, glazed': 'IQF(글레이즈)',
  'cut, no wings, tentacles': '절단(날개·다리 제거)',
  'Tubes, skin-on': '튜브(껍질)',
  'Tubes, skinless': '튜브(무껍질)',
};
const formKo = (s: string | null | undefined) => (s ? FORM_KO[s] ?? s : '—');

const ORIGIN_KO: Record<string, string> = {
  Croatia: '크로아티아',
  Italy: '이탈리아',
  France: '프랑스',
  Morocco: '모로코',
  Spain: '스페인',
  Mauritania: '모리타니아',
  'South Africa': '남아공',
  'Falkland Islands (Malvinas)': '포클랜드(말비나스)',
  Argentina: '아르헨티나',
  Yemen: '예멘',
  'Portugal/Italy': '포르투갈/이탈리아',
  'United States': '미국',
  India: '인도',
};
const originKo = (s: string | null | undefined) => (s ? ORIGIN_KO[s] ?? s : '—');

const REF_KO: Record<string, string> = {
  wholesale: '도매',
  'Spain wholesale': '스페인 도매',
  'for Chinese': '중국행',
  France: '프랑스',
  Spain: '스페인',
  Italy: '이탈리아',
  Mauritania: '모리타니아',
  'Portugal/Italy': '포르투갈/이탈리아',
  'United States': '미국',
  'Falkland Islands (Malvinas)': '포클랜드(말비나스)',
  Argentina: '아르헨티나',
};

// 가격 상승은 조달 측면에서 주의, 하락은 정상 신호로 색칠한다
const TREND_META: Record<string, { mark: string; color: string; word: string }> = {
  '+': { mark: '▲', color: C.caution, word: '상승' },
  '-': { mark: '▼', color: C.ok, word: '하락' },
  '=': { mark: '◆', color: C.axis, word: '보합' },
};

const WEIGHT_KO: Record<string, string> = {
  live_weight: '생중량',
  product_weight: '제품중량',
  net_weight: '순중량',
  'n/a': '—',
};

const STAGE_KO: Record<string, string> = {
  consumer: '소비자가',
  wholesale: '도매가',
  import_unit: '수입단가',
  export_unit: '수출단가',
  first_sale: '1차판매가',
  'n/a': '—',
};

const STATUS_KO: Record<string, string> = {
  정상: '정상',
  기준일정밀도부족: '기준일 정밀도 부족',
};

const tooltipStyle: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid rgba(139,92,246,0.35)',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: '0.7rem',
  lineHeight: 1.55,
  color: C.text,
  boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
  maxWidth: 280,
};

const captionStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: '0.66rem',
  color: C.faint,
  lineHeight: 1.6,
  wordBreak: 'keep-all',
};

/* ── B_species_price_ladder ─────────────────────────────────────────────── */

interface LadderRow {
  scientific_name: string;
  product_form: string;
  size_grade: string | null;
  price_eur_per_kg: number | null;
  price_usd_per_kg: number | null;
  trend: string | null;
  reference_area: string | null;
  incoterm: string | null;
  origin: string | null;
  rank: number;
}

const LADDER_LIMIT = 12;

const TrendArrow = (props: any) => {
  const { x, y, width, height, value } = props;
  const meta = typeof value === 'string' ? TREND_META[value] : undefined;
  if (!meta) return <g />;
  return (
    <text x={x + width + 5} y={y + height / 2 + 3.5} fill={meta.color} fontSize={9} fontWeight={700}>
      {meta.mark}
    </text>
  );
};

const LadderTooltip: React.FC<{ active?: boolean; payload?: any[] }> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const r = payload[0]?.payload as (LadderRow & { label: string }) | undefined;
  if (!r) return null;
  const t = r.trend ? TREND_META[r.trend] : undefined;
  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{r.label}</div>
      <div style={{ color: C.faint }}>{r.scientific_name} · {formKo(r.product_form)}</div>
      <div>EUR {r.price_eur_per_kg != null ? fmt(r.price_eur_per_kg) : '—'}/kg</div>
      <div>USD {r.price_usd_per_kg != null ? fmt(r.price_usd_per_kg) : '—'}/kg</div>
      <div>인코텀즈 {r.incoterm ?? '—'} · 원산지 {originKo(r.origin)}</div>
      {r.reference_area && (
        <div style={{ color: C.faint }}>참조시장 {REF_KO[r.reference_area] ?? r.reference_area}</div>
      )}
      <div style={{ color: t?.color ?? C.faint }}>{t ? `${t.mark} ${t.word}` : '추세 미표기'}</div>
    </div>
  );
};

const PriceLadder: React.FC<{ rows: LadderRow[] }> = ({ rows }) => {
  const top = useMemo(
    () =>
      [...rows]
        .filter((r) => typeof r.price_eur_per_kg === 'number')
        .sort((a, b) => (b.price_eur_per_kg ?? 0) - (a.price_eur_per_kg ?? 0))
        .slice(0, LADDER_LIMIT)
        .map((r, i) => ({
          ...r,
          label: `${i + 1}위 ${spKo(r.scientific_name)} ${r.size_grade ?? '(규격 없음)'}`,
        })),
    [rows],
  );
  if (!top.length) return null;
  const hidden = rows.length - top.length;

  return (
    <div style={{ minWidth: 0 }}>
      <SafeResponsiveContainer width="100%" height={420}>
        <BarChart data={top} layout="vertical" margin={{ top: 4, right: 34, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.16)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: C.axis, fontSize: 10 }}
            tickFormatter={(v: number) => fmt(v)}
            axisLine={{ stroke: 'rgba(100,116,139,0.3)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={176}
            tick={{ fill: C.text, fontSize: 10 }}
            axisLine={{ stroke: 'rgba(100,116,139,0.3)' }}
            tickLine={false}
          />
          <RechartsTooltip content={<LadderTooltip />} cursor={{ fill: 'rgba(139,92,246,0.07)' }} />
          <Bar dataKey="price_eur_per_kg" fill={C.squid} radius={[0, 4, 4, 0]} barSize={17}>
            <LabelList dataKey="trend" position="right" content={TrendArrow} />
          </Bar>
        </BarChart>
      </SafeResponsiveContainer>
      <div style={captionStyle}>
        {rows.length}건 중 상위 {top.length}건 표시 (EUR/kg 내림차순)
        {hidden > 0 && ` · 나머지 ${hidden}건 미표시`}
        {' · '}▲ 상승 ▼ 하락 ◆ 보합, 화살표 없으면 미표기
      </div>
    </div>
  );
};

/* ── B_eu_market_prices ─────────────────────────────────────────────────── */

interface EuRow {
  scientific_name: string;
  product_form: string;
  size_grade: string | null;
  price_eur_per_kg: number | null;
  price_usd_per_kg: number | null;
  trend: string | null;
  reference_area: string | null;
  incoterm: string | null;
  origin: string | null;
}

type EuSortKey = 'species' | 'form' | 'size' | 'incoterm' | 'origin' | 'eur' | 'usd';

const EU_COLS: { key: EuSortKey; label: string }[] = [
  { key: 'species', label: '종' },
  { key: 'form', label: '형태' },
  { key: 'size', label: '규격' },
  { key: 'incoterm', label: '인코텀즈' },
  { key: 'origin', label: '원산지' },
  { key: 'eur', label: 'EUR/kg' },
  { key: 'usd', label: 'USD/kg' },
];

const EuPriceTable: React.FC<{ rows: EuRow[] }> = ({ rows }) => {
  const [sort, setSort] = useState<{ key: EuSortKey; dir: 1 | -1 }>({ key: 'eur', dir: -1 });

  const sorted = useMemo(() => {
    const val = (r: EuRow): string | number => {
      switch (sort.key) {
        case 'species': return spKo(r.scientific_name);
        case 'form': return formKo(r.product_form);
        case 'size': return r.size_grade ?? '';
        case 'incoterm': return r.incoterm ?? '';
        case 'origin': return originKo(r.origin);
        case 'eur': return r.price_eur_per_kg ?? Number.NEGATIVE_INFINITY;
        case 'usd': return r.price_usd_per_kg ?? Number.NEGATIVE_INFINITY;
      }
    };
    return [...rows].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      const d = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'ko');
      return d * sort.dir;
    });
  }, [rows, sort]);

  const toggle = (key: EuSortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 1 ? -1 : 1 }
        : { key, dir: key === 'eur' || key === 'usd' ? -1 : 1 },
    );

  const th: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    background: '#0f172a',
    textAlign: 'left',
    padding: '5px 8px',
    color: C.faint,
    fontSize: '0.66rem',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  };
  const td: React.CSSProperties = {
    padding: '4px 8px',
    color: C.text,
    fontSize: '0.68rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          maxHeight: 420,
          overflowY: 'auto',
          overflowX: 'auto',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 8,
        }}
      >
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 620, fontSize: '0.68rem' }}>
          <thead>
            <tr>
              {EU_COLS.map((c) => (
                <th key={c.key} style={th} onClick={() => toggle(c.key)} title="눌러서 정렬">
                  {c.label}
                  {sort.key === c.key && (
                    <span style={{ color: C.squid }}> {sort.dir === -1 ? '▼' : '▲'}</span>
                  )}
                </th>
              ))}
              <th style={{ ...th, cursor: 'default' }}>추세</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const t = r.trend ? TREND_META[r.trend] : undefined;
              return (
                <tr key={i}>
                  <td style={td} title={r.scientific_name}>{spKo(r.scientific_name)}</td>
                  <td style={td}>{formKo(r.product_form)}</td>
                  <td style={td}>{r.size_grade ?? '—'}</td>
                  <td style={td}>{r.incoterm ?? '—'}</td>
                  <td style={td}>{originKo(r.origin)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    {r.price_eur_per_kg != null ? fmt(r.price_eur_per_kg) : '—'}
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    {r.price_usd_per_kg != null ? fmt(r.price_usd_per_kg) : '—'}
                  </td>
                  <td style={{ ...td, color: t?.color ?? C.axis }}>{t ? t.mark : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={captionStyle}>
        전체 {rows.length}행 · 열 제목을 누르면 정렬 · EUR·USD는 같은 가격의 통화별 표시라
        합산·평균하지 않는다 (G-008)
      </div>
    </div>
  );
};

/* ── B_kmi_consumer_price ───────────────────────────────────────────────── */

interface KmiObs { date: string; price_krw: number }
interface KmiComp { basis: string; price_krw: number; difference_pct: number }
interface KmiData {
  product?: { fish_name?: string; condition?: string; grade?: string; unit?: string };
  observations?: KmiObs[];
  comparisons?: KmiComp[];
}

const COMP_COLOR: Record<string, string> = {
  '5년 평균': C.axis,
  '전년 평균': C.info,
  '전월 평균': C.caution,
  '전주 가격': C.caution,
};
// 값이 가까운 전월 평균선은 라인 아래쪽으로 라벨을 내려 겹침을 피한다
const COMP_POS: Record<string, 'insideTopRight' | 'insideBottomRight'> = {
  '전월 평균': 'insideBottomRight',
};

const KmiTooltip: React.FC<{ active?: boolean; payload?: any[] }> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const r = payload[0]?.payload as (KmiObs & { label: string }) | undefined;
  if (!r) return null;
  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{r.date}</div>
      <div>{fmt(r.price_krw)} 원/마리</div>
    </div>
  );
};

const KmiConsumerPrice: React.FC<{ data: KmiData }> = ({ data }) => {
  const obs = data.observations ?? [];
  const comps = data.comparisons ?? [];
  const chartData = obs.map((o) => ({ ...o, label: o.date.slice(5).replace('-', '.') }));
  const values = [...obs.map((o) => o.price_krw), ...comps.map((c) => c.price_krw)];
  if (!values.length) return null;

  const lo = Math.floor((Math.min(...values) - 120) / 100) * 100;
  const hi = Math.ceil((Math.max(...values) + 120) / 100) * 100;
  const down = comps.filter((c) => c.difference_pct < 0);

  // 기준선 라벨 충돌 회피. 전월 5,227 과 전주 5,258 처럼 값이 붙어 있으면
  // 라벨이 겹쳐 둘 다 못 읽는다. 값이 축 범위의 4% 안으로 붙으면 아래로 한 칸씩 민다.
  const LABEL_GAP = (hi - lo) * 0.04;
  const labelDy = new Map<string, number>();
  let stack = 0;
  let prev: number | null = null;
  for (const c of [...comps].sort((a, b) => b.price_krw - a.price_krw)) {
    stack = prev !== null && prev - c.price_krw < LABEL_GAP ? stack + 1 : 0;
    labelDy.set(c.basis, stack * 11);
    prev = c.price_krw;
  }

  return (
    <div style={{ minWidth: 0 }}>
      <SafeResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 12, right: 8, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.16)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: C.axis, fontSize: 10 }}
            axisLine={{ stroke: 'rgba(100,116,139,0.3)' }}
            tickLine={false}
          />
          <YAxis
            domain={[lo, hi]}
            width={52}
            tick={{ fill: C.axis, fontSize: 10 }}
            tickFormatter={(v: number) => fmt(v)}
            axisLine={{ stroke: 'rgba(100,116,139,0.3)' }}
            tickLine={false}
          />
          <RechartsTooltip content={<KmiTooltip />} cursor={{ stroke: 'rgba(139,92,246,0.35)' }} />
          {comps.map((c) => (
            <ReferenceLine
              key={c.basis}
              y={c.price_krw}
              stroke={COMP_COLOR[c.basis] ?? C.axis}
              strokeDasharray="4 4"
              label={{
                value: `${c.basis} ${fmt(c.price_krw)} (${c.difference_pct > 0 ? '+' : ''}${c.difference_pct}%)`,
                position: COMP_POS[c.basis] ?? 'insideTopRight',
                fill: COMP_COLOR[c.basis] ?? C.faint,
                fontSize: 9.5,
                dy: labelDy.get(c.basis) ?? 0,
              }}
            />
          ))}
          <Line
            type="linear"
            dataKey="price_krw"
            stroke={C.squid}
            strokeWidth={2.5}
            dot={{ r: 4, fill: C.squid, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </SafeResponsiveContainer>
      <div style={captionStyle}>
        관측 {obs.length}일({chartData.map((o) => o.label).join(' · ')}) 기준 원/마리
        {down.length > 0 && (
          <span style={{ color: C.caution }}>
            {' · '}
            {down.map((c) => `${c.basis} 대비 ${c.difference_pct}%`).join(' · ')}
          </span>
        )}
        {' · '}소비자가 단계 지표라 수입단가(EUR·USD/kg)와 같은 축에 섞지 않는다
      </div>
    </div>
  );
};

/* ── B_kcs_import_unit_price ────────────────────────────────────────────── */

interface KcsRow { month: string; import_usd: number; import_kg: number; unit_price_usd_mt: number }

const KcsTooltip: React.FC<{ active?: boolean; payload?: any[] }> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const r = payload[0]?.payload as (KcsRow & { label: string }) | undefined;
  if (!r) return null;
  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{r.month}</div>
      <div>수입금액 {fmt(r.import_usd)} USD</div>
      <div>수입중량 {fmt(r.import_kg)} kg</div>
      <div>가중 단가 {fmt(r.unit_price_usd_mt)} USD/톤</div>
    </div>
  );
};

const KcsImportPrice: React.FC<{ rows: KcsRow[] }> = ({ rows }) => {
  // 막대 표시용 톤 환산은 단위 변환일 뿐이며 툴팁에는 원본 kg 을 유지한다
  const data = rows.map((r) => ({
    ...r,
    label: `${Number(r.month.slice(5))}월`,
    qty_mt: r.import_kg / 1000,
  }));
  if (!data.length) return null;
  const first = data[0].month;
  const last = data[data.length - 1].month;

  // 축 범위는 데이터에서 만든다. 오늘 값에 맞춘 상수를 박아 두면 다음 달 값이
  // 조용히 잘려 나가고, 잘렸다는 사실이 화면에 드러나지 않는다.
  const prices = data.map((r) => r.unit_price_usd_mt);
  const priceDomain: [number, number] = [
    Math.floor((Math.min(...prices) * 0.97) / 100) * 100,
    Math.ceil((Math.max(...prices) * 1.03) / 100) * 100,
  ];

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ position: 'relative' }}>
        <SafeResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 24, right: 8, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.16)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: C.axis, fontSize: 10 }}
              axisLine={{ stroke: 'rgba(100,116,139,0.3)' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="price"
              domain={priceDomain}
              width={50}
              tick={{ fill: C.axis, fontSize: 10 }}
              tickFormatter={(v: number) => fmt(v)}
              axisLine={{ stroke: 'rgba(100,116,139,0.3)' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="qty"
              orientation="right"
              domain={[0, 'auto']}
              width={40}
              tick={{ fill: C.axis, fontSize: 10 }}
              axisLine={{ stroke: 'rgba(100,116,139,0.3)' }}
              tickLine={false}
            />
            <RechartsTooltip content={<KcsTooltip />} cursor={{ fill: 'rgba(56,189,248,0.06)' }} />
            <Bar
              yAxisId="qty"
              dataKey="qty_mt"
              fill="rgba(56,189,248,0.25)"
              radius={[3, 3, 0, 0]}
              barSize={26}
            />
            <Line
              yAxisId="price"
              type="linear"
              dataKey="unit_price_usd_mt"
              stroke={C.squid}
              strokeWidth={2.5}
              dot={{ r: 4, fill: C.squid, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </SafeResponsiveContainer>
        <div
          style={{
            position: 'absolute',
            top: 2,
            right: 10,
            fontSize: '0.62rem',
            color: C.caution,
            pointerEvents: 'none',
          }}
        >
          {first}~{last} 관측분 · 이후 관측 없음
        </div>
      </div>
      <div style={captionStyle}>
        ▉ 물량(톤, 오른쪽 축) · ─ 가중 수입단가(USD/톤, 왼쪽 축) · 관측이 없는 구간은
        선을 잇거나 추세를 그리지 않는다
      </div>
    </div>
  );
};

/* ── B_stage_separated_prices ───────────────────────────────────────────── */

interface StageRow {
  market_stage: string;
  label: string;
  available: boolean;
  value: number | null;
  unit: string;
  currency: string;
  weight_basis: string;
  coverage_end: string;
  source_widget?: string;
}

const STAGE_COLOR: Record<string, string> = {
  consumer: C.squid,
  import_unit: C.info,
  wholesale: C.caution,
  first_sale: C.ok,
  export_unit: C.axis,
};

// 단계별 카드를 나란히만 둔다 — 통합 평균선·환산·스프레드는 G-008 위반이라 그리지 않는다
const StageBoard: React.FC<{ rows: StageRow[] }> = ({ rows }) => (
  <div style={{ minWidth: 0 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
      {rows.map((r, i) => {
        const color = STAGE_COLOR[r.market_stage] ?? C.axis;
        return (
          <div
            key={i}
            style={{
              border: `1px solid ${color}44`,
              background: `${color}0d`,
              borderRadius: 10,
              padding: '10px 12px',
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: '0.62rem', color, fontWeight: 800 }}>
              {STAGE_KO[r.market_stage] ?? r.market_stage}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 700, marginTop: 2 }}>
              {r.label}
            </div>
            {r.available && r.value != null ? (
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
                  {fmt(r.value)}
                </span>
                <span style={{ fontSize: '0.62rem', color: C.faint, marginLeft: 4 }}>{r.unit}</span>
              </div>
            ) : (
              <div
                style={{
                  marginTop: 8,
                  fontSize: '0.66rem',
                  color: C.faint,
                  lineHeight: 1.55,
                  wordBreak: 'keep-all',
                }}
              >
                {r.available ? `단일 대표값 없음 — ${r.unit} 혼재` : '관측값 없음'}
              </div>
            )}
            <div style={{ marginTop: 8, fontSize: '0.6rem', color: C.axis, lineHeight: 1.5 }}>
              기준 {r.coverage_end} · {WEIGHT_KO[r.weight_basis] ?? r.weight_basis} · {r.currency}
            </div>
          </div>
        );
      })}
    </div>
    <div style={captionStyle}>
      단계별 통화·중량 기준이 달라 환산·평균·스프레드를 계산하지 않는다 (G-008) · EU
      거래가격은 종·규격별 다중 행이라 대표값을 싣지 않음
    </div>
  </div>
);

/* ── B_price_freshness_board ────────────────────────────────────────────── */

interface FreshRow {
  indicator: string;
  source_widget: string;
  coverage_end: string;
  age_days: number | null;
  available: boolean;
  status: string;
}

const freshColor = (r: FreshRow): string => {
  // 경과일을 산출할 수 없으면 임의의 신호색을 칠하지 않는다
  if (!r.available || r.age_days == null) return C.axis;
  if (r.age_days <= 90) return C.ok;
  if (r.age_days <= 365) return C.caution;
  return C.violation;
};

const FreshnessBoard: React.FC<{ rows: FreshRow[] }> = ({ rows }) => (
  <div style={{ minWidth: 0 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
      {rows.map((r) => {
        const color = freshColor(r);
        return (
          <div
            key={r.indicator}
            style={{
              border: `1px solid ${color}55`,
              borderLeft: `4px solid ${color}`,
              background: `${color}12`,
              borderRadius: 10,
              padding: '10px 12px',
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0' }}>{r.indicator}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color, marginTop: 4 }}>
              {r.age_days != null ? `D+${r.age_days}` : 'D+ —'}
            </div>
            <div
              style={{
                fontSize: '0.62rem',
                color: C.faint,
                marginTop: 4,
                lineHeight: 1.5,
                wordBreak: 'keep-all',
              }}
            >
              기준 {r.coverage_end} · {STATUS_KO[r.status] ?? r.status}
              {r.available && r.age_days == null && ' (일자 미상세, 경과일 미계산)'}
              {!r.available && ' (지표 미가용)'}
            </div>
          </div>
        );
      })}
    </div>
    <div style={captionStyle}>
      <span style={{ color: C.ok }}>90일 이내 정상</span> ·{' '}
      <span style={{ color: C.caution }}>365일 이내 주의</span> ·{' '}
      <span style={{ color: C.violation }}>초과 경고</span> · 회색은 기준일 정밀도 부족으로
      경과일 미계산
    </div>
  </div>
);

/* ── 섹션 조립 ──────────────────────────────────────────────────────────── */

const RENDERERS: Record<
  string,
  (widget: SquidWidget, sources: SquidSource[]) => React.ReactNode
> = {
  B_species_price_ladder: (w) => <PriceLadder rows={w.data as LadderRow[]} />,
  B_eu_market_prices: (w) => <EuPriceTable rows={w.data as EuRow[]} />,
  B_kmi_consumer_price: (w) => <KmiConsumerPrice data={w.data as KmiData} />,
  B_kcs_import_unit_price: (w) => <KcsImportPrice rows={w.data as KcsRow[]} />,
  B_stage_separated_prices: (w) => <StageBoard rows={w.data as StageRow[]} />,
  B_price_freshness_board: (w) => <FreshnessBoard rows={w.data as FreshRow[]} />,
};

export const SectionB: React.FC<{ doc: SquidV5 }> = ({ doc }) => (
  <SquidSection
    section="B"
    doc={doc}
    render={(id, w, sources) => RENDERERS[id]?.(w, sources)}
  />
);

export default SectionB;
