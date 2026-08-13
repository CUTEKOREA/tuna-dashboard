'use client';

/**
 * 무역 흐름 — 위젯 8개.
 *
 * P3-C 세션 소유 파일. 다른 섹션 파일과 공용 컴포넌트는 건드리지 않는다.
 *
 * 차트 부착 현황:
 * - C_korea_import_monthly      : 월×국가 누적막대 (상위 6개국+기타), 수입액/중량 전환
 * - C_comtrade_coverage_matrix  : 원본 행수 히트맵 (구간 색상, density_pct 미사용)
 * - C_import_concentration      : top1/top3 비중(좌축) + HHI(우축) — 관측 연도 2024 단일
 * - C_hs_classification_map     : HS 코드×제품형태 대응 + 갑오징어 포함 배지
 * 나머지 4개(C_india_mpeda_exports, C_fta_import_trend, C_eu_processing_hub,
 * C_usda_korea_market)는 원문 발췌 카드라 GenericWidgetBody 그대로 둔다.
 */

import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import SquidSection from './SquidSection';
import type { SquidSource, SquidV5, SquidWidget } from './types';

const AXIS = '#64748b';
const BODY = '#cbd5e1';
const C_OK = '#10b981';
const C_WARN = '#f59e0b';
const C_BAD = '#f43f5e';
const C_INFO = '#38bdf8';
const C_SQUID = '#8b5cf6';

const TOOLTIP_STYLE: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.96)',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: 8,
  fontSize: '0.72rem',
};

const CAPTION_STYLE: React.CSSProperties = {
  margin: '8px 0 0',
  fontSize: '0.66rem',
  color: '#94a3b8',
  lineHeight: 1.6,
  wordBreak: 'keep-all',
};

const fmtInt = (v: number) => Math.round(v).toLocaleString('ko-KR');
const fmtHhi = (v: number) => v.toLocaleString('ko-KR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/* ------------------------------------------------------------------ */
/* C_korea_import_monthly — 월×국가 누적막대                            */
/* ------------------------------------------------------------------ */

interface MonthlyRow {
  month: string;
  country_code: string;
  country: string;
  import_usd: number;
  import_kg: number;
}

type Metric = 'import_usd' | 'import_kg';

const COUNTRY_COLORS: Record<string, string> = {
  중국: C_SQUID,
  페루: C_INFO,
  베트남: C_OK,
  칠레: C_WARN,
  에쿠아도르: C_BAD,
  아르헨티나: '#ec4899',
  기타: '#64748b',
};

const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '3px 10px',
  borderRadius: 6,
  fontSize: '0.68rem',
  fontWeight: 700,
  cursor: 'pointer',
  border: `1px solid ${active ? C_SQUID : 'rgba(148, 163, 184, 0.25)'}`,
  background: active ? 'rgba(139, 92, 246, 0.18)' : 'transparent',
  color: active ? '#c4b5fd' : '#94a3b8',
});

const ImportMonthlyChart: React.FC<{ data: MonthlyRow[] }> = ({ data }) => {
  const [metric, setMetric] = useState<Metric>('import_usd');

  const { rows, series, first, last } = useMemo(() => {
    const months = Array.from(new Set(data.map((r) => r.month))).sort();
    const totals = new Map<string, number>();
    for (const r of data) totals.set(r.country, (totals.get(r.country) ?? 0) + r.import_usd);
    const top6 = [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([c]) => c);
    const rows = months.map((m) => {
      const inMonth = data.filter((r) => r.month === m);
      const row: Record<string, number | string> = { month: m };
      for (const c of top6) {
        const hit = inMonth.find((r) => r.country === c);
        // 행이 없는 국가×월 조합은 0으로 채우지 않고 비워 둔다
        if (hit) row[c] = hit[metric];
      }
      const etc = inMonth.filter((r) => !top6.includes(r.country));
      if (etc.length) row['기타'] = etc.reduce((s, r) => s + r[metric], 0);
      return row;
    });
    return {
      rows,
      series: [...top6, '기타'],
      first: months[0] ?? '',
      last: months[months.length - 1] ?? '',
    };
  }, [data, metric]);

  const isUsd = metric === 'import_usd';

  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 6,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: '0.66rem', color: AXIS }}>
          단위: {isUsd ? '백만 달러' : '천 톤'} · 상위 6개국(수입액 합계 기준) + 기타
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(
            [
              ['import_usd', '수입액'],
              ['import_kg', '중량'],
            ] as [Metric, string][]
          ).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setMetric(k)} style={toggleBtnStyle(metric === k)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <SafeResponsiveContainer height={280}>
        <BarChart data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={(m: any) => `${Number(String(m).slice(5))}월`}
            tick={{ fill: AXIS, fontSize: 11 }}
            axisLine={{ stroke: AXIS }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v: any) => `${Number(v) / 1e6}`}
            tick={{ fill: AXIS, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: '#e2e8f0' }}
            labelFormatter={(m: any) => `${m} · 관측`}
            formatter={(v: any, name: any) => [
              `${fmtInt(Number(v))} ${isUsd ? '달러' : '킬로그램'}`,
              name as string,
            ]}
            cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.66rem' }} iconSize={8} />
          {series.map((c) => (
            <Bar key={c} dataKey={c} stackId="trade" fill={COUNTRY_COLORS[c] ?? C_INFO} />
          ))}
        </BarChart>
      </SafeResponsiveContainer>

      <p style={CAPTION_STYLE}>
        관측 구간 {first} ~ {last} (관세청) · 2025년 이전은 관측되지 않아 축에 없음 ·
        기록이 없는 국가×월 조합은 표시하지 않는다 (0 보간 없음)
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* C_comtrade_coverage_matrix — 원본 행수 히트맵                        */
/* ------------------------------------------------------------------ */

interface CoverageRow {
  reporter_code: string;
  reporter: string;
  year: string;
  row_count: number;
  density_pct: number;
}

const COVERAGE_BINS: { color: string; label: string; test: (n: number) => boolean }[] = [
  { color: C_BAD, label: '30행 미만', test: (n) => n < 30 },
  { color: C_WARN, label: '30~99행', test: (n) => n < 100 },
  { color: C_INFO, label: '100~499행', test: (n) => n < 500 },
  { color: C_OK, label: '500행 이상', test: () => true },
];

const coverageColor = (n: number) => COVERAGE_BINS.find((b) => b.test(n))?.color ?? AXIS;

const CoverageHeatmap: React.FC<{ data: CoverageRow[] }> = ({ data }) => {
  const years = Array.from(new Set(data.map((r) => r.year))).sort();
  const totals = new Map<string, number>();
  for (const r of data) totals.set(r.reporter, (totals.get(r.reporter) ?? 0) + r.row_count);
  // 행수 불균등이 한눈에 보이도록 reporter를 총 행수 내림차순으로 세운다
  const reporters = Array.from(totals.keys()).sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0));

  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `minmax(56px, auto) repeat(${years.length}, 1fr)`,
          gap: 4,
        }}
      >
        <div />
        {years.map((y) => (
          <div key={y} style={{ textAlign: 'center', fontSize: '0.7rem', color: AXIS, fontWeight: 700 }}>
            {y}
          </div>
        ))}
        {reporters.map((rep) => (
          <React.Fragment key={rep}>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.74rem', color: BODY, fontWeight: 700 }}>
              {rep}
            </div>
            {years.map((y) => {
              const hit = data.find((r) => r.reporter === rep && r.year === y);
              if (!hit) {
                return (
                  <div key={y} style={{ textAlign: 'center', fontSize: '0.7rem', color: AXIS, padding: '8px 0' }}>
                    —
                  </div>
                );
              }
              const color = coverageColor(hit.row_count);
              return (
                <div
                  key={y}
                  style={{
                    background: `${color}1f`,
                    border: `1px solid ${color}55`,
                    borderRadius: 6,
                    padding: '7px 2px',
                    textAlign: 'center',
                  }}
                >
                  <span
                    style={{
                      color,
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {fmtInt(hit.row_count)}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.58rem', color: AXIS }}>행</span>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
        {COVERAGE_BINS.map((b) => (
          <span key={b.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.62rem', color: '#94a3b8' }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: `${b.color}33`, border: `1px solid ${b.color}88` }} />
            {b.label}
          </span>
        ))}
      </div>

      <p style={CAPTION_STYLE}>
        셀 숫자·색은 보고국이 해당 연도에 제출한 원본 행 수 ·
        자료 밀도 비율은 최대값 대비 비율이라 한 나라만 100%로 보이고 나머지가 눌려 사용하지 않는다 ·
        이 행 수 불균등 때문에 측정 기준 005번이 총액·점유율·연평균성장률 산출을 차단한다
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* C_import_concentration — 집중도 (관측 연도 2020~2024)                */
/* ------------------------------------------------------------------ */

interface OriginShare {
  country_code: string;
  country: string;
  import_usd: number;
  import_kg: number;
  share_pct: number;
}

interface ConcentrationData {
  year: number;
  total_import_usd: number;
  top1_share_pct: number;
  top3_share_pct: number;
  hhi: number;
  origins: OriginShare[];
}

const hhiLabel = (h: number) => (h >= 2500 ? '고집중' : h >= 1500 ? '중간 집중' : '분산');

const chipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '3px 9px',
  borderRadius: 6,
  border: '1px solid rgba(148, 163, 184, 0.25)',
  background: 'rgba(15, 23, 42, 0.5)',
  fontSize: '0.68rem',
  fontWeight: 700,
  color: BODY,
};

const ConcentrationChart: React.FC<{ data: ConcentrationData[] }> = ({ data }) => {
  const years = [...data].sort((a, b) => a.year - b.year);
  if (!years.length) return null;
  const rows = years.map((d) => ({
    year: String(d.year),
    top1: d.top1_share_pct,
    top3: d.top3_share_pct,
    hhi: d.hhi,
  }));
  const latest = years[years.length - 1];
  const first = years[0];
  const topOrigins = [...(latest.origins ?? [])].sort((a, b) => b.share_pct - a.share_pct).slice(0, 4);

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        <span style={chipStyle}>{latest.year} 총수입액 {(latest.total_import_usd / 1e8).toFixed(2)}억 달러</span>
        <span style={{ ...chipStyle, color: C_WARN, borderColor: 'rgba(245, 158, 11, 0.4)' }}>
          시장집중도지수 {fmtHhi(latest.hhi)} · {hhiLabel(latest.hhi)}
        </span>
      </div>

      <SafeResponsiveContainer height={220}>
        <ComposedChart data={rows} margin={{ top: 22, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: AXIS, fontSize: 11 }} axisLine={{ stroke: AXIS }} tickLine={false} />
          <YAxis
            yAxisId="share"
            domain={[0, 100]}
            tickFormatter={(v: any) => `${v}%`}
            tick={{ fill: AXIS, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <YAxis
            yAxisId="hhi"
            orientation="right"
            domain={[0, 'auto']}
            tickFormatter={(v: any) => fmtInt(Number(v))}
            tick={{ fill: AXIS, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: '#e2e8f0' }}
            labelFormatter={(y: any) => `${y}년 · 관측`}
            formatter={(v: any, name: any) =>
              String(name).includes('HHI')
                ? [fmtHhi(Number(v)), name as string]
                : [`${Number(v).toFixed(1)}% · 한국 수입 내 비중`, name as string]
            }
            cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.66rem' }} iconSize={8} />
          <Bar yAxisId="share" dataKey="top1" name="상위 1개국 비중" fill={C_SQUID} barSize={38} radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="top1"
              position="top"
              formatter={(v: any) => `${Number(v).toFixed(1)}%`}
              fill={BODY}
              fontSize={10}
            />
          </Bar>
          <Bar yAxisId="share" dataKey="top3" name="상위 3개국 비중" fill={C_INFO} barSize={38} radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="top3"
              position="top"
              formatter={(v: any) => `${Number(v).toFixed(1)}%`}
              fill={BODY}
              fontSize={10}
            />
          </Bar>
          <Bar yAxisId="hhi" dataKey="hhi" name="시장집중도지수 (우측 축)" fill={C_WARN} barSize={38} radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="hhi"
              position="top"
              formatter={(v: any) => fmtHhi(Number(v))}
              fill={C_WARN}
              fontSize={10}
            />
          </Bar>
        </ComposedChart>
      </SafeResponsiveContainer>

      {topOrigins.length > 0 && (
        <p style={{ ...CAPTION_STYLE, color: BODY }}>
          {latest.year} 상위 원산지: {topOrigins.map((o) => `${o.country} ${o.share_pct.toFixed(2)}%`).join(' · ')}
        </p>
      )}
      <p style={CAPTION_STYLE}>
        관측 {first.year}~{latest.year} (관세청) · 상위 1개국 비중 {first.top1_share_pct.toFixed(1)}% →{' '}
        {latest.top1_share_pct.toFixed(1)}%, 시장집중도지수 {fmtHhi(first.hhi)} → {fmtHhi(latest.hhi)} ·
        비중은 한국 수입 안에서의 비중이며 글로벌 점유율이 아니다 · 대상 품목 HS 030742·030743·030749·160554
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* C_hs_classification_map — HS 코드×제품형태 대응                       */
/* ------------------------------------------------------------------ */

interface HsRow {
  hs6: string;
  stage: string;
  description: string;
}

const STAGE_KO: Record<string, string> = {
  '1_fresh_broad': '활·신선 (광의 분류)',
  '1_fresh': '활·신선·냉장',
  '1_frozen': '냉동',
  '2_other_processed': '기타 가공',
  '3_prepared': '조제·보존',
};

const HS_KO: Record<string, string> = {
  '030741': '갑오징어·오징어 활어·신선·냉장 (구분·광의 분류)',
  '030742': '갑오징어·오징어 활어·신선·냉장',
  '030743': '갑오징어·오징어 냉동',
  '030749': '갑오징어·오징어 기타 가공',
  '160554': '갑오징어·오징어 조제·보존',
};

const includesCuttlefish = (d: string) => /cuttlefish/i.test(d);

const HsClassificationMap: React.FC<{ data: HsRow[] }> = ({ data }) => {
  const cuttleCount = data.filter((r) => includesCuttlefish(r.description)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      {data.map((r) => {
        const cuttle = includesCuttlefish(r.description);
        return (
          <div
            key={r.hs6}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
              padding: '8px 10px',
              borderRadius: 8,
              background: 'rgba(15, 23, 42, 0.5)',
              border: `1px solid ${cuttle ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
            }}
          >
            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#e2e8f0', fontSize: '0.85rem' }}>
              {r.hs6}
            </span>
            <span
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                color: '#94a3b8',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: 4,
                padding: '2px 6px',
                whiteSpace: 'nowrap',
              }}
            >
              {STAGE_KO[r.stage] ?? r.stage}
            </span>
            <span style={{ fontSize: '0.72rem', color: BODY, flex: 1, minWidth: 140, wordBreak: 'keep-all' }}>
              {HS_KO[r.hs6] ?? r.description}
            </span>
            {cuttle && (
              <span
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  color: '#c4b5fd',
                  background: 'rgba(139, 92, 246, 0.18)',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  whiteSpace: 'nowrap',
                }}
              >
                갑오징어 포함
              </span>
            )}
          </div>
        );
      })}
      <p style={CAPTION_STYLE}>
        {cuttleCount}/{data.length}개 품목분류 코드가 갑오징어를 포함 — 페이지 전체 어종 범위 판단의 근거 ·
        갑오징어를 빼고 &lsquo;오징어만&rsquo;으로 재명명하는 합산은 금지 (측정 기준 002번)
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */

const RENDERERS: Record<string, (widget: SquidWidget, sources: SquidSource[]) => React.ReactNode> = {
  C_korea_import_monthly: (w) => <ImportMonthlyChart data={w.data as MonthlyRow[]} />,
  C_comtrade_coverage_matrix: (w) => <CoverageHeatmap data={w.data as CoverageRow[]} />,
  C_import_concentration: (w) => <ConcentrationChart data={w.data as unknown as ConcentrationData[]} />,
  C_hs_classification_map: (w) => <HsClassificationMap data={w.data as HsRow[]} />,
};

export const SectionC: React.FC<{ doc: SquidV5 }> = ({ doc }) => (
  <SquidSection
    section="C"
    doc={doc}
    render={(id, w, sources) => RENDERERS[id]?.(w, sources)}
  />
);

export default SectionC;
