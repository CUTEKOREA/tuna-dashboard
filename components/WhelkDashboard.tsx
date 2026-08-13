'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
  Globe, TrendingUp, AlertTriangle, Factory, DollarSign, Scale, RefreshCcw,
  Target, Leaf, Shield, Dna, ShieldAlert, Building2, Activity, Ship, Navigation, Snowflake, Anchor,
  Fish, Thermometer, ShoppingBag, Recycle, Package, FlaskConical, ChartPie
} from 'lucide-react';
import TermTooltip from './TermTooltip';
import WidgetCard, { type Pillar } from './WidgetCard';
import { TelemetryBadge } from './TelemetryBadge';
import { ChartPatternDefs } from './ChartPatterns';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import WhelkFTAQuarterly from './WhelkFTAQuarterly';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'rgba(20, 28, 52, 0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', color: '#f8fafc', fontSize: '0.88rem' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>{label}</p>
        {payload.map((e: any, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
            <span style={{ color: e.color }}>■ {e.name}</span>
            <strong style={{ fontWeight: 600 }}>{typeof e.value === 'number' ? e.value.toLocaleString() : e.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- COMPONENTS ---
// --- DATA ---
const IMPORT_COLORS = ['var(--color-info)', 'var(--color-success)', 'var(--color-danger)', 'var(--color-warning)', '#8b5cf6'];

// 5-Pillar 네비게이터 메타 (골뱅이 시그니처 그라디언트 — 영국 북해 + 흑해 amber/stone 조합)
const SECTIONS = [
  { id: 'S1', num: '❶', label: '원료 수급', title: '❶ 원료 수급', desc: '글로벌 어획 헤게모니, 북해 어획량 변동, B. undatum 자원 동향', color: '#fbbf24' },
  { id: 'S2', num: '❷', label: '가공·생산', title: '❷ 가공 및 생산', desc: '살수율(20-25%), 한·영 가공 마진 구조, 가공 효율성', color: '#f59e0b' },
  { id: 'S3', num: '❸', label: '물류·통관', title: '❸ 물류 및 통관', desc: 'FTA 무관세 우위, 콜드체인, IUU/MCRS 규제 리스크', color: '#d97706' },
  { id: 'S4', num: '❹', label: '판매·수요', title: '❹ 판매 및 수요', desc: '한국 통조림 시장, 가격 갭, FX/이중 타격 헤지, 채널 다변화', color: '#b45309' },
  { id: 'S5', num: '❺', label: 'ESG·지속가능성', title: '❺ ESG 및 지속가능성', desc: '양식 불가 자원 + 영국 IFCA/MCRS 규제 + EU PPWR 포장 컴플라이언스', color: '#92400e' },
];

// 패턴 I: 이 파일에 보존된 WidgetCard 37개 + WhelkFTAQuarterly 1개 = 38.
// 폐기 위젯은 롤백을 위해 소스에 남기되 런타임 카운트에서 제외한다.
const INLINE_WIDGET_COUNT = 38;
const RETIRED_HS6_WIDGET_COUNT = 2;
const RETIRED_HS6_WIDGETS_ENABLED = false;
const HYPOTHESIS_WIDGET_COUNT = 10;

export function WhelkRetiredHs6WidgetGate({ children }: { children?: React.ReactNode }) {
  return RETIRED_HS6_WIDGETS_ENABLED ? <>{children}</> : null;
}

export function WhelkHypothesisSection({ count, children }: { count: number; children: React.ReactNode }) {
  return (
    <details
      data-whelk-hypothesis-section="true"
      data-whelk-hypothesis-count={count}
      style={{
        gridColumn: '1 / -1',
        order: 99,
        border: '1px solid rgba(245, 158, 11, 0.28)',
        borderRadius: '12px',
        background: 'rgba(120, 53, 15, 0.12)',
        overflow: 'hidden',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          padding: '14px 16px',
          color: '#fbbf24',
          fontWeight: 700,
          lineHeight: 1.5,
        }}
      >
        가설·시나리오 (실측 데이터 없음) · {count}개
      </summary>
      <div
        data-mobile-stack
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '1rem',
          padding: '0 16px 16px',
        }}
      >
        {children}
      </div>
    </details>
  );
}

export function WhelkHypothesisCard({ reason, children }: { reason: string; children: React.ReactNode }) {
  return (
    <div data-whelk-hypothesis-card="true" style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ borderRadius: '999px', background: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.42)', color: '#fbbf24', padding: '4px 9px', fontSize: '0.72rem', fontWeight: 800 }}>
          실측 데이터 없음 — 가설
        </span>
        <span style={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.45 }}>
          공백 사유: {reason}
        </span>
      </div>
      {children}
    </div>
  );
}

type WhelkV2Basis = {
  coverage_start: string;
  coverage_end: string;
  published_at?: string;
  source_ids: string[];
};

export type WhelkV2Basket = {
  hsk8: string;
  label: string;
  label_source?: string;
  observed_hsk10?: string[];
  import_usd_2024_jan_may?: number;
  import_usd_2026_jan_may?: number;
  change_pct?: number;
  share_of_hs6_2024_jan_may_pct?: number;
  share_of_hs6_2026_jan_may_pct?: number;
  charted?: boolean;
  top_origins_2026?: string[];
  excluded_reason?: string;
  import_kg_2024_jan_may?: number;
  import_kg_2026_jan_may?: number;
  floor_kg_2024_jan_may?: number;
  floor_kg_2026_jan_may?: number;
  below_floor_count_2026?: number;
};

export type WhelkV2Hypothesis = {
  id: string;
  statement: string;
  supporting_observations: string[];
  why_unproven: string[];
  falsification_test: string;
  claim_grade: string;
};

export type WhelkV2Hsk10Breakdown = {
  hsk10: string;
  item_name: string;
  import_usd: number;
  import_kg: number;
  share_pct: number;
  excluded_from_whelk_scope: boolean;
};

export type WhelkV2SpeciesComposition = {
  alpha3: string;
  scientific_name: string;
  tonnes: number;
  share_pct: number;
};

export type WhelkV2CaptureCountryRow = {
  rank: number;
  country_code: string;
  country: string;
  tonnes_live_weight: number;
  species_composition: WhelkV2SpeciesComposition[];
  dominant_species_scientific_name: string;
  is_species_resolved: boolean;
};

export type WhelkV2CountryRankingRow = {
  rank: number;
  country_code: string;
  country: string;
  tonnes_live_weight: number;
};

export type WhelkV2Widget = {
  section: Pillar;
  title: string;
  chartType: string;
  data: any[];
  methodology: string;
  basis: WhelkV2Basis;
  unit?: string;
  world_total_tonnes?: number;
  buccinum_only_ranking?: WhelkV2CountryRankingRow[];
  total_aquaculture_tonnes?: number;
  baskets?: WhelkV2Basket[];
  layout?: string;
  period_totals?: Record<string, number>;
  interpretation_context?: Record<string, any>;
  window_sensitivity?: Record<string, any>;
  hsk8_monthly?: Record<string, any[]>;
  uk_monthly_2024?: Array<{
    month: string;
    import_usd: number;
    import_kg: number;
    unit_price_usd_per_kg: number;
  }>;
  hsk8_breakdown?: Array<{ hsk8: string; label: string; import_usd: number; import_kg: number }>;
  hsk10_breakdown?: WhelkV2Hsk10Breakdown[];
  scale_context?: Record<string, any>;
  hypothesis?: WhelkV2Hypothesis;
  series_basis?: Record<string, string>;
};

export type WhelkV2CoverageGap = {
  series: string;
  missing: string[];
  available: string[];
  impact: string;
};

export type WhelkV2Dataset = {
  meta: {
    built_at: string;
    telemetry: string;
    coverage_gaps?: WhelkV2CoverageGap[];
  };
  widgets: Record<string, WhelkV2Widget>;
};

const V2_TOOLTIP_STYLE = {
  background: 'rgba(20, 28, 52, 0.96)',
  border: '1px solid rgba(251, 191, 36, 0.24)',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '12px',
};

const V2_INFO_PANEL: React.CSSProperties = {
  background: 'rgba(251, 191, 36, 0.06)',
  border: '1px solid rgba(251, 191, 36, 0.18)',
  borderRadius: '10px',
  padding: '12px 14px',
};

function formatNumber(value: unknown, maximumFractionDigits = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '자료 없음';
  return number.toLocaleString('ko-KR', { maximumFractionDigits });
}

function formatPercent(value: unknown, maximumFractionDigits = 1) {
  return `${formatNumber(value, maximumFractionDigits)}%`;
}

function formatUsdPerKg(value: unknown) {
  return `$${formatNumber(value, 2)}/kg`;
}

function formatWidgetUnit(unit?: string) {
  if (!unit) return undefined;
  return `(${unit.replaceAll('USD', '미국 달러').replaceAll('kg', '킬로그램')})`;
}

function formatMonth(month: unknown) {
  return String(month).replace('-', '.');
}

function formatPeriodTick(period: unknown) {
  const value = String(period);
  const partialYear = value.match(/^(\d{4})-(\d{2})~(\d{2})$/);
  if (!partialYear) return value;
  return `${partialYear[1].slice(2)}년${Number(partialYear[2])}~${Number(partialYear[3])}월`;
}

function formatKoreanMonthRange(start: string, end: string) {
  const [startYear, startMonth] = start.split('-');
  const [endYear, endMonth] = end.split('-');
  if (startYear === endYear && startMonth && endMonth) {
    return `${startYear}년 ${Number(startMonth)}~${Number(endMonth)}월`;
  }
  return `${formatMonth(start)}~${formatMonth(end)}`;
}

function formatKcsCoverage(start: string, end: string) {
  const [endYear, endMonth] = end.split('-');
  if (!endMonth) return end;
  if (/^\d{4}$/.test(start)) return `${start} / ${endYear}.${endMonth === '12' ? '01~12' : `01~${endMonth}`}`;
  const [startYear, startMonth] = start.split('-');
  if (startYear === endYear && startMonth) return `${startYear}.${startMonth}~${endMonth}`;
  return `${formatMonth(start)}~${formatMonth(end)}`;
}

function hasSource(widget: WhelkV2Widget, token: string) {
  return widget.basis.source_ids.some((sourceId) => sourceId.includes(token));
}

export function getWhelkWidgetSyncDate(widget: WhelkV2Widget) {
  const { coverage_start: coverageStart, coverage_end: coverageEnd, published_at: publishedAt } = widget.basis;
  const isFao = hasSource(widget, 'FAO');
  const isKcs = hasSource(widget, 'KCS');
  const isKmi = hasSource(widget, 'KMI');

  if (isKmi) {
    const [year, month] = coverageEnd.split('-').map(Number);
    if (Number.isFinite(year) && Number.isFinite(month)) return `KMI ${year} Q${Math.ceil(month / 3)}`;
    return `KMI ${coverageEnd}`;
  }

  if (isFao && isKcs) {
    const latestCaptureYear = widget.data.reduce((latest, row) => {
      if (row.uk_capture_tonnes_live_weight == null) return latest;
      const year = Number(row.period);
      return Number.isFinite(year) ? Math.max(latest, year) : latest;
    }, 0);
    const kcsCoverage = formatKcsCoverage(coverageEnd.slice(0, 4) + '-01', coverageEnd);
    return `FAO FishStat ${latestCaptureYear || coverageEnd.slice(0, 4)} / 관세청 ${kcsCoverage}`;
  }

  if (isFao) return `FAO FishStat ${coverageEnd.slice(0, 4)}`;
  if (isKcs) return `관세청 ${formatKcsCoverage(coverageStart, coverageEnd)}`;
  if (publishedAt) return `공표 ${formatMonth(publishedAt.slice(0, 7))}`;
  return `자료 ${formatMonth(coverageEnd)}`;
}

function widgetTelemetry(widget: WhelkV2Widget) {
  return { status: 'SYNCED' as const, syncDate: getWhelkWidgetSyncDate(widget) };
}

function sourceLabel(widget: WhelkV2Widget) {
  const labels: string[] = [];
  if (hasSource(widget, 'FAO')) labels.push('유엔 식량농업기구 어업 통계');
  if (hasSource(widget, 'KCS')) labels.push('관세청 수출입무역통계');
  if (hasSource(widget, 'KMI')) labels.push('한국해양수산개발원 수입동향');
  if (hasSource(widget, 'DFO')) labels.push('캐나다 수산해양부');
  return labels.join(' · ') || '골뱅이 데이터 빌더 원천자료';
}

function getMaximumRow(rows: any[], key: string) {
  return rows.reduce<any | undefined>((maximum, row) => {
    const value = Number(row[key]);
    if (!Number.isFinite(value)) return maximum;
    return !maximum || value > Number(maximum[key]) ? row : maximum;
  }, undefined);
}

// 대시보드 빌더 아카이브의 관측 공백을 시점 비교 위젯 본문에 고정 노출한다.
// 두 시점만 보고 "전환"을 말하려면 그 사이를 보지 못했다는 사실이 같은 화면에 있어야 한다.
export function WhelkCoverageGapNote({ dataset }: { dataset: WhelkV2Dataset }) {
  const gap = dataset.meta.coverage_gaps?.[0];
  if (!gap) return null;
  return (
    <div data-whelk-coverage-gap="true" style={{ ...V2_INFO_PANEL, marginTop: '12px', borderColor: 'rgba(148, 163, 184, 0.3)', background: 'rgba(148, 163, 184, 0.08)' }}>
      <strong style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>대시보드 아카이브 공백 — {gap.missing.join('·')}년 원자료 미반영</strong>
      <p style={{ margin: '6px 0 0', color: '#cbd5e1', fontSize: '0.72rem', lineHeight: 1.5 }}>
        현재 빌더 아카이브 보유 구간은 {gap.available.join(' · ')}이며 대상은 {gap.series}입니다. {gap.impact}
      </p>
    </div>
  );
}

// HSK8 바구니 하나를 감싸는 소차트 틀. 두 바구니를 나란히 놓아야 합산 분모 착시가 재발하지 않는다.
function WhelkBasketPanel({ basket, subtitle, children }: { basket: WhelkV2Basket; subtitle?: string; children: React.ReactNode }) {
  return (
    <div data-whelk-basket={basket.hsk8} style={{ border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.5)', padding: '10px 12px 6px', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
        <strong style={{ color: '#fbbf24', fontSize: '0.82rem' }}>{basket.label}</strong>
        {basket.top_origins_2026?.length ? (
          <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>주요 원산지 {basket.top_origins_2026.join('·')}</span>
        ) : null}
      </div>
      {subtitle ? (
        <div style={{ color: '#cbd5e1', fontSize: '0.72rem', lineHeight: 1.45, marginBottom: '8px' }}>{subtitle}</div>
      ) : null}
      {children}
    </div>
  );
}

function shipmentNote(row: any) {
  const months = (row.shipment_months_2026 || []).map(formatMonth).join('·');
  if (!Number(row.shipment_count_2026)) return '2026년 1~5월 해당 관측 창 통관 실적 없음';
  return `선적 ${formatNumber(row.shipment_count_2026)}건(${months}) — 안정 파이프라인 아님`;
}

// 표본이 희박한 원산지(선적 몇 건 / 통관 0건)를 점유율 숫자와 같은 카드에서 못 박는다.
function WhelkThinEvidenceNotes({ rows }: { rows: any[] }) {
  if (!rows.length) return null;
  return (
    <div data-whelk-thin-evidence="true" style={{ ...V2_INFO_PANEL, marginTop: '12px', borderColor: 'rgba(239, 68, 68, 0.26)', background: 'rgba(239, 68, 68, 0.06)' }}>
      <strong style={{ color: '#fca5a5', fontSize: '0.8rem' }}>표본 희박 원산지 주석</strong>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '7px' }}>
        {rows.map((row) => (
          <div key={`${row.hsk8}-${row.origin}`} style={{ color: '#cbd5e1', fontSize: '0.72rem', lineHeight: 1.45 }}>
            <strong style={{ color: '#f8fafc' }}>{row.origin}</strong> · {shipmentNote(row)}
          </div>
        ))}
      </div>
    </div>
  );
}

function speciesLabel(scientificName: string) {
  if (scientificName === 'Rapana spp') return '라파나류';
  if (scientificName === 'Gastropoda') return '복족류';
  if (scientificName === 'Buccinum spp') return '부키눔류';
  return '기타 복족류';
}

function hasSpeciesResolution(row: unknown): row is WhelkV2CaptureCountryRow {
  if (!row || typeof row !== 'object') return false;
  const candidate = row as Partial<WhelkV2CaptureCountryRow>;
  return (
    Array.isArray(candidate.species_composition) &&
    candidate.species_composition.length > 0 &&
    typeof candidate.dominant_species_scientific_name === 'string' &&
    typeof candidate.is_species_resolved === 'boolean'
  );
}

function dominantSpecies(row?: WhelkV2CaptureCountryRow) {
  return row?.species_composition?.find(
    (species) => species.scientific_name === row.dominant_species_scientific_name,
  );
}

function speciesScientificLabel(
  species: WhelkV2SpeciesComposition,
  country: WhelkV2CaptureCountryRow,
) {
  const isUnresolvedDominant =
    !country.is_species_resolved &&
    species.scientific_name === country.dominant_species_scientific_name;
  return `${species.scientific_name}${isUnresolvedDominant ? ' NEI' : ''}`;
}

function buccinumTonnes(row?: WhelkV2CaptureCountryRow) {
  return (row?.species_composition ?? [])
    .filter((species) => species.scientific_name.split(maxSplitWhitespace)[0] === 'Buccinum')
    .reduce((total, species) => total + Number(species.tonnes || 0), 0);
}

const maxSplitWhitespace = /\s+/;

export function WhelkV2Widgets({ dataset, activePart }: { dataset: WhelkV2Dataset; activePart: Pillar }) {
  const widgets = dataset.widgets;
  const portfolio = widgets.S3_origin_portfolio_shift;
  const monthly = widgets.S3_prepared_import_monthly;
  const cifLadder = widgets.S3_origin_cif_ladder;
  const globalCapture = widgets.S1_global_capture_top_countries;
  const koreaTimeline = widgets.S1_korea_capture_timeline;
  const ukLink = widgets.S1_uk_capture_import_link;
  const aquaculture = widgets.S1_aquaculture_species_split;
  const hsGuide = widgets.S3_hs_classification_guide;
  const speciesNotice = widgets.S1_species_scope_notice;
  const frozenMix = widgets.S3_frozen_origin_mix;

  if (!portfolio || !monthly || !cifLadder || !globalCapture || !koreaTimeline || !ukLink || !aquaculture || !hsGuide || !speciesNotice || !frozenMix) {
    return (
      <div className="ds-card" style={{ gridColumn: '1 / -1', padding: '1rem', color: '#fbbf24' }}>
        신규 골뱅이 데이터 계약을 불러오지 못했습니다.
      </div>
    );
  }

  if (activePart === 'S1') {
    const globalCaptureRows = globalCapture.data as WhelkV2CaptureCountryRow[];
    const buccinumRanking = globalCapture.buccinum_only_ranking ?? [];
    const korea = globalCaptureRows.find((row) => row.country_code === '410');
    const uk = globalCaptureRows.find((row) => row.country_code === '826');
    const turkiye = globalCaptureRows.find((row) => row.country_code === '792');
    const leader = globalCaptureRows[0];
    const speciesResolutionReady =
      Boolean(korea && uk && turkiye) &&
      globalCaptureRows.length > 0 &&
      globalCaptureRows.every(hasSpeciesResolution) &&
      buccinumRanking.length > 0;
    const koreaDominant = dominantSpecies(korea);
    const ukDominant = dominantSpecies(uk);
    const turkiyeDominant = dominantSpecies(turkiye);
    const koreaEntirelyUnresolved =
      korea?.is_species_resolved === false && Number(koreaDominant?.share_pct) === 100;
    const koreaBuccinumTonnes = buccinumTonnes(korea);
    const koreaBuccinumRank = buccinumRanking.find((row) => row.country_code === '410');
    const record = koreaTimeline.data.find((row) => row.is_record) || getMaximumRow(koreaTimeline.data, 'tonnes_live_weight');
    const latestKorea = koreaTimeline.data[koreaTimeline.data.length - 1];
    const captureRows = ukLink.data.filter((row) => row.uk_capture_tonnes_live_weight != null);
    const importRows = ukLink.data.filter((row) => row.korea_import_usd != null);
    const ukPeak = getMaximumRow(captureRows, 'uk_capture_tonnes_live_weight');
    const latestUk = captureRows[captureRows.length - 1];
    const latestUkImport = importRows[importRows.length - 1];
    const aquacultureData = aquaculture.data.map((row) => ({ ...row, species_label: speciesLabel(row.scientific_name) }));
    const aquacultureBySpecies = new Map(aquaculture.data.map((row) => [row.scientific_name, row]));
    const rapana = aquacultureBySpecies.get('Rapana spp');
    const buccinum = aquacultureBySpecies.get('Buccinum spp');

    return (
      <>
        <WidgetCard
          id="S1_global_capture_top_countries"
          title={globalCapture.title}
          icon={Globe}
          iconColor="#fbbf24"
          pillar={globalCapture.section}
          cardDesc={speciesResolutionReady
            ? `유엔 식량농업기구 ${globalCapture.basis.coverage_end}년 ${globalCaptureRows.length}개 상위국 집계 — 한국 ${formatNumber(korea?.rank)}위(지배 종군 ${speciesScientificLabel(koreaDominant!, korea!)}, ${formatPercent(koreaDominant?.share_pct, 3)}), 세계 합계 ${formatNumber(globalCapture.world_total_tonnes)}톤`
            : `유엔 식량농업기구 ${globalCapture.basis.coverage_end}년 국가별 어획 집계 — 종 구성 자료를 불러오지 못했습니다`}
          unit={formatWidgetUnit(globalCapture.unit)}
          telemetry={widgetTelemetry(globalCapture)}
          chartHeight={360}
          chart={speciesResolutionReady ? (
            <BarChart data={globalCaptureRows} layout="vertical" margin={{ left: 20, right: 24 }}>
              <ChartPatternDefs />
              <defs>
                <pattern id="whelkSpeciesUnresolved" patternUnits="userSpaceOnUse" width="8" height="8">
                  <rect width="8" height="8" fill="#ef4444" fillOpacity="0.72" />
                  <path d="M-2 2L2-2M0 8L8 0M6 10L10 6" stroke="#fecaca" strokeWidth="1.5" />
                </pattern>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => formatNumber(value)} />
              <YAxis dataKey="country" type="category" tick={{ fill: '#f8fafc', fontSize: 11 }} width={70} />
              <RechartsTooltip contentStyle={V2_TOOLTIP_STYLE} formatter={(value: any) => [`${formatNumber(value)}톤`, '어획량']} />
              <Bar dataKey="tonnes_live_weight" name="어획량" radius={[0, 4, 4, 0]}>
                {globalCaptureRows.map((row) => (
                  <Cell
                    key={row.country_code}
                    fill={!row.is_species_resolved ? 'url(#whelkSpeciesUnresolved)' : row.country_code === '410' ? '#ef4444' : '#fbbf24'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : undefined}
          customBody={speciesResolutionReady ? (
            <div data-whelk-species-resolution-notice="true" style={{ ...V2_INFO_PANEL, marginTop: '12px', borderColor: 'rgba(239, 68, 68, 0.34)', background: 'rgba(127, 29, 29, 0.1)' }}>
              <strong style={{ color: '#fca5a5', fontSize: '0.84rem' }}>종 해상도 고지 — 이 순위표의 국가는 같은 종 기준이 아닙니다</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '8px', color: '#e2e8f0', fontSize: '0.76rem', lineHeight: 1.55 }}>
                <div>
                  {koreaEntirelyUnresolved ? '한국 수치는 전량 종 미상' : '한국 수치의 지배 종군은 종 미상'}(<i>{speciesScientificLabel(koreaDominant!, korea!)}</i>)이며 {formatNumber(koreaDominant?.tonnes, 3)}톤·{formatPercent(koreaDominant?.share_pct, 3)}입니다. 영국은 <i>{speciesScientificLabel(ukDominant!, uk!)}</i> {formatPercent(ukDominant?.share_pct, 3)}로 종이 확정됐습니다.
                </div>
                <div>
                  튀르키예는 <i>{speciesScientificLabel(turkiyeDominant!, turkiye!)}</i> {formatPercent(turkiyeDominant?.share_pct, 3)}로 영국·한국과 다른 종입니다.
                </div>
                <div style={{ color: '#fbbf24', fontWeight: 700 }}>
                  Buccinum 속만 보면 한국은 {koreaBuccinumRank ? `${formatNumber(koreaBuccinumRank.rank)}위` : '순위 밖'}({formatNumber(koreaBuccinumTonnes, 3)}톤)입니다.
                </div>
              </div>

              <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '7px', marginTop: '12px' }}>
                {globalCaptureRows.map((row) => (
                  <div
                    key={row.country_code}
                    data-species-resolved={String(row.is_species_resolved)}
                    style={{ borderLeft: `3px solid ${row.is_species_resolved ? '#10b981' : '#ef4444'}`, borderRadius: '6px', background: 'rgba(15, 23, 42, 0.58)', padding: '8px 10px', minWidth: 0 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'baseline' }}>
                      <strong style={{ color: '#f8fafc', fontSize: '0.76rem' }}>{formatNumber(row.rank)}위 {row.country}</strong>
                      <span style={{ color: row.is_species_resolved ? '#6ee7b7' : '#fca5a5', fontSize: '0.68rem', fontWeight: 700 }}>
                        {row.is_species_resolved ? '✓ 종 확인' : '⚠ 종 미상'}
                      </span>
                    </div>
                    {row.species_composition.map((species) => (
                      <div key={`${species.alpha3}-${species.scientific_name}`} style={{ color: '#cbd5e1', fontSize: '0.68rem', lineHeight: 1.45, marginTop: '3px' }}>
                        <i>{speciesScientificLabel(species, row)}</i> · {formatNumber(species.tonnes, 3)}톤 · {formatPercent(species.share_pct, 3)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '12px', borderTop: '1px solid rgba(251, 191, 36, 0.18)', paddingTop: '9px' }}>
                <strong style={{ color: '#fbbf24', fontSize: '0.76rem' }}>Buccinum 속 단독 상위 {formatNumber(buccinumRanking.length)}개국</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '7px' }}>
                  {buccinumRanking.map((row) => (
                    <span key={row.country_code} style={{ border: '1px solid rgba(251, 191, 36, 0.22)', borderRadius: '999px', padding: '4px 7px', color: '#e2e8f0', fontSize: '0.68rem' }}>
                      {formatNumber(row.rank)}위 {row.country} {formatNumber(row.tonnes_live_weight, 3)}톤
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div data-whelk-species-resolution-notice="missing" style={{ ...V2_INFO_PANEL, marginTop: '12px', borderColor: 'rgba(239, 68, 68, 0.34)', background: 'rgba(127, 29, 29, 0.1)', color: '#fca5a5', fontSize: '0.8rem', fontWeight: 700 }}>
              종 구성 자료를 불러오지 못했습니다. 종 해상도 확인 전에는 국가 순위를 표시하지 않습니다.
            </div>
          )}
          takeaway={{
            situation: speciesResolutionReady
              ? <span>{globalCapture.basis.coverage_end}년 {leader.country}이 {formatNumber(leader.tonnes_live_weight, 3)}톤으로 {formatNumber(leader.rank)}위이며, 한국은 {formatNumber(korea?.tonnes_live_weight, 3)}톤으로 세계 {formatNumber(korea?.rank)}위입니다. 다만 한국은 <i>{speciesScientificLabel(koreaDominant!, korea!)}</i>, 영국은 <i>{speciesScientificLabel(ukDominant!, uk!)}</i>가 지배해 같은 종 기준 순위가 아닙니다. 전체 집계는 {formatNumber(globalCapture.world_total_tonnes, 3)}톤입니다.</span>
              : <span>국가별 종 구성 자료가 누락돼 종 해상도 확인 전에는 어획 순위를 표시하지 않습니다.</span>,
            actionPlan: <span>한국의 어획 순위를 조달 근거로 쓸 때는 종 미상 집계와 Buccinum 속 단독 순위를 분리하고, 산지별 학명·품질·수출 계약을 확인한 뒤 평가해야 합니다.</span>,
            source: sourceLabel(globalCapture),
          }}
        />

        <WidgetCard
          id="S1_korea_capture_timeline"
          title={koreaTimeline.title}
          icon={TrendingUp}
          iconColor="#f59e0b"
          pillar={koreaTimeline.section}
          cardDesc={`유엔 식량농업기구 한국 관측 ${koreaTimeline.data[0]?.year}~${latestKorea?.year}년 합산 — 최고점 ${record?.year}년 ${formatNumber(record?.tonnes_live_weight)}톤`}
          unit={formatWidgetUnit(koreaTimeline.unit)}
          telemetry={widgetTelemetry(koreaTimeline)}
          chartHeight={320}
          chart={
            <AreaChart data={koreaTimeline.data} margin={{ top: 12, right: 20, left: 4, bottom: 8 }}>
              <defs>
                <linearGradient id="whelkV2KoreaCapture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.72} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 10 }} minTickGap={28} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => formatNumber(value)} />
              <RechartsTooltip contentStyle={V2_TOOLTIP_STYLE} formatter={(value: any) => [`${formatNumber(value)}톤`, '한국 어획량']} labelFormatter={(year) => `${year}년`} />
              <Area type="monotone" dataKey="tonnes_live_weight" name="한국 어획량" stroke="#fbbf24" strokeWidth={2.5} fill="url(#whelkV2KoreaCapture)" />
            </AreaChart>
          }
          kpiPanel={[
            { label: '역대 최고', value: `${record?.year}년`, sub: `${formatNumber(record?.tonnes_live_weight)}톤`, trendColor: '#fbbf24' },
            { label: '최신 확정', value: `${latestKorea?.year}년`, sub: `${formatNumber(latestKorea?.tonnes_live_weight)}톤` },
          ]}
          takeaway={{
            situation: <span>한국 어획은 {record?.year}년 {formatNumber(record?.tonnes_live_weight)}톤으로 관측기간 최고점을 기록한 뒤 {latestKorea?.year}년 {formatNumber(latestKorea?.tonnes_live_weight)}톤을 나타냈습니다. 종전 최고점 표기는 이 확정계열과 맞지 않습니다.</span>,
            actionPlan: <span>국내 어획의 가공 전환 가능성을 검토할 때 최근 한 해만 보지 말고 최고점 이후 변동폭과 산지별 계약 물량을 함께 반영해야 합니다.</span>,
            source: sourceLabel(koreaTimeline),
          }}
        />

        <WidgetCard
          id="S1_uk_capture_import_link"
          title={ukLink.title}
          icon={Ship}
          iconColor="#d97706"
          pillar={ukLink.section}
          cardDesc={`영국 어획 확정계열과 한국의 영국산 조제 연체동물 수입액을 별도 축으로 병기 — 어획 최고 ${ukPeak?.period}년 ${formatNumber(ukPeak?.uk_capture_tonnes_live_weight)}톤`}
          unit={formatWidgetUnit(ukLink.unit)}
          telemetry={widgetTelemetry(ukLink)}
          chartHeight={320}
          chart={
            <ComposedChart data={ukLink.data} margin={{ top: 12, right: 18, left: 4, bottom: 8 }}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="period" tickFormatter={formatPeriodTick} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis yAxisId="capture" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => formatNumber(value)} />
              <YAxis yAxisId="imports" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => `$${formatNumber(Number(value) / 1_000_000, 1)}백만`} />
              <RechartsTooltip contentStyle={V2_TOOLTIP_STYLE} formatter={(value: any, name: any) => name === '영국 어획량' ? [`${formatNumber(value)}톤`, name] : [`$${formatNumber(value)}`, name]} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar yAxisId="capture" dataKey="uk_capture_tonnes_live_weight" name="영국 어획량" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              <Line yAxisId="imports" type="monotone" dataKey="korea_import_usd" name="한국 수입액" stroke="#ef4444" strokeWidth={2.5} connectNulls={false} />
            </ComposedChart>
          }
          takeaway={{
            situation: <span>영국 어획은 {ukPeak?.period}년 {formatNumber(ukPeak?.uk_capture_tonnes_live_weight)}톤으로 정점을 기록했고 최신 확정치인 {latestUk?.period}년에는 {formatNumber(latestUk?.uk_capture_tonnes_live_weight)}톤입니다. 한국의 최신 영국산 수입액은 {latestUkImport?.period_basis} 기준 ${formatNumber(latestUkImport?.korea_import_usd)}입니다.</span>,
            actionPlan: <span>어획과 수입액은 단위와 관측기간이 다르므로 상관관계로 단정하지 말고, 영국 공급 여력과 한국의 구매 집중도를 나란히 감시하는 조기경보 지표로 사용해야 합니다.</span>,
            source: sourceLabel(ukLink),
          }}
        />

        <WidgetCard
          id="S1_aquaculture_species_split"
          title={aquaculture.title}
          icon={ShieldAlert}
          iconColor="#ef4444"
          pillar={aquaculture.section}
          cardDesc={`유엔 식량농업기구 ${aquaculture.basis.coverage_end}년 종별 양식 집계 — 라파나류 ${formatNumber(rapana?.tonnes_live_weight)}톤, 부키눔류 관측 ${formatNumber(buccinum?.tonnes_live_weight)}톤`}
          unit={formatWidgetUnit(aquaculture.unit)}
          telemetry={widgetTelemetry(aquaculture)}
          chartHeight={300}
          chart={
            <BarChart data={aquacultureData} margin={{ top: 16, right: 20, left: 8, bottom: 8 }}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="species_label" tick={{ fill: '#f8fafc', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => formatNumber(value)} />
              <RechartsTooltip contentStyle={V2_TOOLTIP_STYLE} formatter={(value: any) => [`${formatNumber(value, 3)}톤`, '양식 생산량']} />
              <Bar dataKey="tonnes_live_weight" name="양식 생산량" radius={[4, 4, 0, 0]}>
                {aquacultureData.map((row) => <Cell key={row.scientific_name} fill={row.scientific_name === 'Rapana spp' ? '#fbbf24' : '#64748b'} />)}
              </Bar>
            </BarChart>
          }
          takeaway={{
            situation: <span><TermTooltip term="라파나류" description="피뿔고둥 계열을 포함하는 종군으로 중국 양식 생산의 대부분을 차지합니다." /> 양식은 {formatNumber(rapana?.tonnes_live_weight)}톤으로 전체 {formatPercent(rapana?.share_pct, 3)}를 차지하지만, <TermTooltip term="부키눔류" description="북해산 물레고둥 계열을 포함하는 종군입니다." />는 보관된 양식 자료에서 관측량이 {formatNumber(buccinum?.tonnes_live_weight)}톤입니다.</span>,
            actionPlan: <span>“골뱅이 양식 불가”를 전체 복족류에 적용하지 말고, 북해산 종과 중국산 라파나류를 분리해 원가·품질·조달 안정성을 평가해야 합니다.</span>,
            source: sourceLabel(aquaculture),
          }}
        />

        <WidgetCard
          id="S1_species_scope_notice"
          title={speciesNotice.title}
          icon={Dna}
          iconColor="#b45309"
          pillar={speciesNotice.section}
          cardDesc={`유엔 식량농업기구 종 코드 ${formatNumber(speciesNotice.data.length)}종의 ${speciesNotice.basis.coverage_start}~${speciesNotice.basis.coverage_end}년 어획 합산 범위를 공개`}
          unit={formatWidgetUnit(speciesNotice.unit)}
          telemetry={widgetTelemetry(speciesNotice)}
          customBody={
            <div style={V2_INFO_PANEL}>
              <div style={{ marginBottom: '10px', color: '#f8fafc', fontWeight: 700 }}>합산 대상 종 코드 {formatNumber(speciesNotice.data.length)}개</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {speciesNotice.data.map((row) => (
                  <span key={row.alpha3_code} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '6px', padding: '5px 7px' }}>
                    <TermTooltip term={row.alpha3_code} description={<>유엔 식량농업기구 종 코드입니다. 학명은 <i>{row.scientific_name}</i>입니다.</>} />
                  </span>
                ))}
              </div>
            </div>
          }
          takeaway={{
            situation: <span>이 대시보드의 어획량은 종 코드 {formatNumber(speciesNotice.data.length)}개를 합산한 복족류 범위이며, 북해산 물레고둥 단일 종 통계가 아닙니다. 관측 범위는 {speciesNotice.basis.coverage_start}~{speciesNotice.basis.coverage_end}년입니다.</span>,
            actionPlan: <span>국가별 어획량을 특정 상품 규격의 공급 가능량으로 곧바로 해석하지 말고, 구매 검토 단계에서 학명·가공형태·원산지 일치 여부를 다시 확인해야 합니다.</span>,
            source: sourceLabel(speciesNotice),
          }}
        />
      </>
    );
  }

  if (activePart === 'S3') {
    // G-006: HS6 하나가 원산지 구성이 겹치지 않는 두 바구니의 합이라, 분모를 합치면
    // 한 바구니의 붕괴가 다른 바구니 원산지의 '점유율 상승'으로 나타난다. 그래서 화면에서도
    // 바구니를 합치지 않는다 — 바구니 소속은 데이터의 hsk8 필드로만 판정한다.
    const portfolioBaskets = portfolio.baskets ?? [];
    const chartedBaskets = portfolioBaskets.filter((basket) => basket.charted);
    const excludedBaskets = portfolioBaskets.filter((basket) => !basket.charted);
    const portfolioRow = (origin: string, hsk8?: string) =>
      portfolio.data.find((row) => row.origin === origin && !row.combined && (!hsk8 || row.hsk8 === hsk8));
    const combinedRow = portfolio.data.find((row) => row.combined);
    const northBasketId: string | undefined = combinedRow?.hsk8 ?? portfolioRow('영국')?.hsk8;
    const northBasket = chartedBaskets.find((basket) => basket.hsk8 === northBasketId);
    const otherBasket = chartedBaskets.find((basket) => basket.hsk8 !== northBasketId);
    const basketRows = (hsk8?: string) =>
      portfolio.data.filter(
        (row) =>
          row.hsk8 === hsk8 &&
          !row.combined &&
          (Number(row.share_within_basket_2024_pct) > 0 || Number(row.share_within_basket_2026_pct) > 0),
      );
    const basketLeader2026 = (hsk8?: string) =>
      basketRows(hsk8).reduce<any | undefined>(
        (top, row) => (!top || Number(row.share_within_basket_2026_pct) > Number(top.share_within_basket_2026_pct) ? row : top),
        undefined,
      );
    const canada = portfolioRow('캐나다', northBasketId);
    const portfolioInterpretation = portfolio.interpretation_context;
    const northShareExcludingCanada = portfolioInterpretation?.combined_share_excluding_qualification_origin_2026_pct;
    const canadaObservedMonthCount = portfolioInterpretation?.qualification_observed_month_count;
    const otherLeader = basketLeader2026(otherBasket?.hsk8);
    const thinEvidenceRows = portfolio.data.filter((row) => row.thin_evidence && !row.combined);
    const windowSensitivity = portfolio.window_sensitivity;

    const cifBaskets = cifLadder.baskets ?? [];
    const cifRanked = (hsk8: string) =>
      cifLadder.data
        .filter((row) => row.hsk8 === hsk8 && row.rank != null)
        .sort((left, right) => Number(left.rank) - Number(right.rank));
    const belowFloorOrigins = cifLadder.data.filter((row) => row.below_volume_floor);
    const rankedOrigins = cifLadder.data.filter((row) => row.rank != null);
    const cifRow = (origin: string, hsk8?: string) =>
      cifLadder.data.find((row) => row.origin === origin && (!hsk8 || row.hsk8 === hsk8));
    const ukCif = cifRow('영국', northBasketId);
    const canadaCif = cifRow('캐나다', northBasketId);
    const chinaNorthCif = cifRow('중국', northBasketId);
    const chinaOtherCif = cifRow('중국', otherBasket?.hsk8);
    const monthlyPeak = getMaximumRow(monthly.data, 'import_usd');
    const latestMonth = monthly.data[monthly.data.length - 1];
    const monthlyTotal = monthly.data.reduce((sum, row) => sum + Number(row.import_usd || 0), 0);
    const preparedCode = hsGuide.data.find((row) => row.is_prepared_proxy);
    const comparisonPeriod = formatKoreanMonthRange('2024-01', '2024-05');
    const currentPeriod = formatKoreanMonthRange(monthly.basis.coverage_start, monthly.basis.coverage_end);
    const frozenPeriod = formatKoreanMonthRange(frozenMix.basis.coverage_start, frozenMix.basis.coverage_end);
    const scallopLine = frozenMix.hsk10_breakdown?.find((row) => row.excluded_from_whelk_scope);
    const hsCodeLength = String(hsGuide.data[0]?.hs6 || '').length;
    const hskCodeLength = String(preparedCode?.hsk10_observed?.[0] || '').length;

    return (
      <>
        <WidgetCard
          id="S3_origin_portfolio_shift"
          title={portfolio.title}
          icon={ChartPie}
          iconColor="#fbbf24"
          pillar={portfolio.section}
          termTooltip={{ term: 'HSK8', description: '국제 공통 6자리 분류 아래에 관세청이 두는 한국 고유 세분류 8자리 코드입니다.' }}
          cardDesc={`같은 1~5월 창을 바구니별로 분해 — ${northBasket?.label} 안의 영국·아일랜드 합산 ${formatPercent(combinedRow?.share_within_basket_2024_pct)}→${formatPercent(combinedRow?.share_within_basket_2026_pct)} 하락은 캐나다 ${formatNumber(canadaObservedMonthCount)}개월 관측을 포함할 때만 성립합니다. 캐나다를 제외하면 ${formatPercent(northShareExcludingCanada)}이며, 두 바구니를 합친 분모로는 원산지 점유율을 서술하지 않습니다(G-006)`}
          unit={formatWidgetUnit(portfolio.unit)}
          telemetry={widgetTelemetry(portfolio)}
          customBody={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                {chartedBaskets.map((basket) => (
                  <WhelkBasketPanel
                    key={basket.hsk8}
                    basket={basket}
                    subtitle={`기간 총액 $${formatNumber(basket.import_usd_2024_jan_may)} → $${formatNumber(basket.import_usd_2026_jan_may)} (${formatPercent(basket.change_pct)}) · 점유율 분모는 이 바구니 총액`}
                  >
                    <SafeResponsiveContainer width="100%" height={230}>
                      <BarChart data={basketRows(basket.hsk8)} margin={{ top: 8, right: 10, left: 0, bottom: 8 }}>
                        <ChartPatternDefs />
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="origin" interval={0} tick={{ fill: '#f8fafc', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => `${value}%`} />
                        <RechartsTooltip contentStyle={V2_TOOLTIP_STYLE} formatter={(value: any, name: any) => [`${formatNumber(value, 1)}%`, name]} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="share_within_basket_2024_pct" name={`${comparisonPeriod} 바구니 내 점유율`} fill="#92400e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="share_within_basket_2026_pct" name={`${currentPeriod} 바구니 내 점유율`} fill="#fbbf24" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </SafeResponsiveContainer>
                  </WhelkBasketPanel>
                ))}
              </div>

              {excludedBaskets.length ? (
                <div style={{ color: '#94a3b8', fontSize: '0.72rem', lineHeight: 1.45 }}>
                  차트 제외 바구니: {excludedBaskets.map((basket) => `${basket.label} — ${basket.excluded_reason}`).join(' · ')}
                </div>
              ) : null}

              <WhelkThinEvidenceNotes rows={thinEvidenceRows} />

              {windowSensitivity ? (
                <div data-whelk-window-bias="true" style={{ ...V2_INFO_PANEL, borderColor: 'rgba(56, 189, 248, 0.26)', background: 'rgba(56, 189, 248, 0.06)' }}>
                  <strong style={{ color: '#7dd3fc', fontSize: '0.8rem' }}>관측 창 편향 — 같은 2024년도 창에 따라 결론이 갈립니다</strong>
                  <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', marginTop: '8px' }}>
                    {chartedBaskets.map((basket) => (
                      <div key={basket.hsk8} style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '6px', padding: '8px 10px', minWidth: 0 }}>
                        <div style={{ color: '#f8fafc', fontSize: '0.76rem', fontWeight: 700 }}>{basket.label}</div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.7rem', marginTop: '4px', lineHeight: 1.5 }}>
                          1~5월 창 {formatPercent(windowSensitivity.jan_may?.[`${basket.hsk8}_share_of_hs6_2024_pct`])} · 연간 창 {formatPercent(windowSensitivity.full_year?.[`${basket.hsk8}_share_of_hs6_2024_pct`])}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ margin: '8px 0 0', color: '#cbd5e1', fontSize: '0.72rem', lineHeight: 1.5 }}>{windowSensitivity.note}</p>
                </div>
              ) : null}

              <WhelkCoverageGapNote dataset={dataset} />
            </div>
          }
          takeaway={{
            situation: <span>같은 1~5월 창에서 {northBasket?.label} 바구니 안의 영국·아일랜드 합산은 {formatPercent(combinedRow?.share_within_basket_2024_pct)}에서 {formatPercent(combinedRow?.share_within_basket_2026_pct)}로 {formatNumber(Math.abs(Number(combinedRow?.share_delta_pp)), 1)}%포인트 <strong>낮게 관측</strong>됐고, 같은 창에서 캐나다 비중은 {formatPercent(canada?.share_within_basket_2024_pct)}→{formatPercent(canada?.share_within_basket_2026_pct)}로 관측됐습니다. 다른 바구니 {otherBasket?.label}은 {formatPercent(otherBasket?.change_pct)} 줄어 {otherLeader?.origin} 비중이 {formatPercent(otherLeader?.share_within_basket_2026_pct)}까지 올라간 별개의 구성 차이입니다. 두 바구니를 합친 분모를 쓰면 이 축소가 북해산 원산지의 점유율 상승으로 나타나므로 합산 서술을 쓰지 않았습니다.</span>,
            actionPlan: <span>{northBasket?.label}의 두 관측 시점에서 영국·아일랜드 합산 비중은 낮아졌지만, 캐나다 실적이 {formatNumber(canada?.shipment_count_2026)}건 선적에 그쳐 공급선 정착이나 지속 추세로 판단하기 이릅니다. 캐나다 물량의 반복 여부를 다음 분기 통관으로 먼저 확인하고, 흑해산 축소는 같은 바구니 문제가 아니므로 냉동 축(0307.92) 잔존 여부와 함께 판단해야 합니다.</span>,
            source: sourceLabel(portfolio),
          }}
        />

        <WidgetCard
          id="S3_prepared_import_monthly"
          title={monthly.title}
          icon={Activity}
          iconColor="#d97706"
          pillar={monthly.section}
          cardDesc={`관세청 ${formatMonth(monthly.data[0]?.month)}~${formatMonth(latestMonth?.month)} 월별 원계열 — 누적 수입액 $${formatNumber(monthlyTotal)}. 바구니 ${formatNumber(Object.keys(monthly.hsk8_monthly ?? {}).length)}개를 합친 규모 계열이며 원산지 점유율 분모로 쓰지 않습니다(G-006)`}
          unit={formatWidgetUnit(monthly.unit)}
          telemetry={widgetTelemetry(monthly)}
          chartHeight={320}
          chart={
            <ComposedChart data={monthly.data} margin={{ top: 12, right: 18, left: 4, bottom: 8 }}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fill: '#f8fafc', fontSize: 10 }} />
              <YAxis yAxisId="value" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => `$${formatNumber(Number(value) / 1_000_000, 1)}백만`} />
              <YAxis yAxisId="price" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => `$${formatNumber(value, 1)}`} />
              <RechartsTooltip contentStyle={V2_TOOLTIP_STYLE} labelFormatter={formatMonth} formatter={(value: any, name: any) => name === '수입액' ? [`$${formatNumber(value)}`, name] : [formatUsdPerKg(value), name]} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar yAxisId="value" dataKey="import_usd" name="수입액" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              <Line yAxisId="price" type="monotone" dataKey="unit_price_usd_per_kg" name="시사단가" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
            </ComposedChart>
          }
          takeaway={{
            situation: <span>{formatMonth(monthlyPeak?.month)} 수입액이 ${formatNumber(monthlyPeak?.import_usd)}로 기간 중 가장 컸고, 최신 {formatMonth(latestMonth?.month)} 시사단가는 {formatUsdPerKg(latestMonth?.unit_price_usd_per_kg)}입니다. 연환산 없이 월별 원계열만 표시합니다.</span>,
            actionPlan: <span>수입액 급증 월과 단가 상승 월을 분리해 발주·재고 계획에 반영하고, 짧은 누적기간을 연간 수요 증가로 확대 해석하지 않아야 합니다.</span>,
            source: sourceLabel(monthly),
          }}
        />

        <WidgetCard
          id="S3_origin_cif_ladder"
          title={cifLadder.title}
          icon={Scale}
          iconColor="#f59e0b"
          pillar={cifLadder.section}
          termTooltip={{ term: 'CIF', description: '운임과 보험료를 포함한 수입 도착가 기준 단가입니다.' }}
          cardDesc={`바구니별 수입액÷중량 가중 단가 — 같은 중국도 ${northBasket?.label} ${formatUsdPerKg(chinaNorthCif?.unit_price_2026_jan_may_usd_per_kg)}, ${otherBasket?.label} ${formatUsdPerKg(chinaOtherCif?.unit_price_2026_jan_may_usd_per_kg)}로 갈려 바구니를 섞은 단일 단가를 만들지 않습니다(G-006). 순위는 바구니 내부 물량 하한 통과분만`}
          unit={formatWidgetUnit(cifLadder.unit)}
          telemetry={widgetTelemetry(cifLadder)}
          customBody={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                {cifBaskets.map((basket) => (
                  <WhelkBasketPanel
                    key={basket.hsk8}
                    basket={basket}
                    subtitle={`순위 하한 ${formatNumber(basket.floor_kg_2026_jan_may ?? 0)}킬로그램(기간 물량 ${formatNumber(basket.import_kg_2026_jan_may)}킬로그램의 1%) · 하한 미달 ${formatNumber(basket.below_floor_count_2026)}개 제외`}
                  >
                    <SafeResponsiveContainer width="100%" height={230}>
                      <BarChart data={cifRanked(basket.hsk8)} layout="vertical" margin={{ top: 8, right: 12, left: 16, bottom: 8 }}>
                        <ChartPatternDefs />
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => `$${value}`} />
                        <YAxis type="category" dataKey="origin" tick={{ fill: '#f8fafc', fontSize: 11 }} width={64} />
                        <RechartsTooltip contentStyle={V2_TOOLTIP_STYLE} formatter={(value: any, name: any) => [formatUsdPerKg(value), name]} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="unit_price_2024_jan_may_usd_per_kg" name={`${comparisonPeriod} 단가`} fill="#92400e" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="unit_price_2026_jan_may_usd_per_kg" name={`${currentPeriod} 단가`} fill="#fbbf24" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </SafeResponsiveContainer>
                  </WhelkBasketPanel>
                ))}
              </div>

              <div style={{ ...V2_INFO_PANEL, borderColor: 'rgba(239, 68, 68, 0.24)', background: 'rgba(239, 68, 68, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline', marginBottom: '10px' }}>
                  <strong style={{ color: '#fca5a5', fontSize: '0.84rem' }}>순위 제외 표본 미달 원산지</strong>
                  <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{formatNumber(belowFloorOrigins.length)}개 행 보존</span>
                </div>
                <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                  {belowFloorOrigins.map((row) => (
                    <div key={`${row.hsk8}-${row.origin}`} data-volume-floor-entry="true" style={{ borderLeft: '3px solid rgba(239, 68, 68, 0.65)', background: 'rgba(15, 23, 42, 0.52)', borderRadius: '6px', padding: '8px 10px', minWidth: 0 }}>
                      <div style={{ color: '#f8fafc', fontSize: '0.78rem', fontWeight: 700 }}>{row.origin}</div>
                      <div style={{ color: '#fca5a5', fontSize: '0.68rem', marginTop: '3px' }}>{row.hsk8} · 표본 미달 · 순위 제외</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '3px', lineHeight: 1.4 }}>{formatNumber(row.import_kg_2026_jan_may)}킬로그램 · 바구니 내 비중 {formatPercent(row.volume_share_pct, 3)} · {formatUsdPerKg(row.unit_price_2026_jan_may_usd_per_kg)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <WhelkCoverageGapNote dataset={dataset} />
            </div>
          }
          takeaway={{
            situation: <span>{northBasket?.label} 바구니에서 캐나다는 {formatUsdPerKg(canadaCif?.unit_price_2026_jan_may_usd_per_kg)}, 영국은 {formatUsdPerKg(ukCif?.unit_price_2026_jan_may_usd_per_kg)}이며 영국 단가는 {comparisonPeriod} 대비 {formatPercent(ukCif?.unit_price_gap_vs_2024_jan_may_pct)} 높아졌습니다. 같은 중국이라도 {northBasket?.label}은 {formatUsdPerKg(chinaNorthCif?.unit_price_2026_jan_may_usd_per_kg)}, {otherBasket?.label}은 {formatUsdPerKg(chinaOtherCif?.unit_price_2026_jan_may_usd_per_kg)}로 갈립니다. 순위 대상은 {formatNumber(rankedOrigins.length)}개, 표본 미달 {formatNumber(belowFloorOrigins.length)}개는 순위에서 분리했습니다.</span>,
            actionPlan: <span>대체재 단가를 비교할 때는 같은 바구니 안에서만 맞대야 하며, 바구니가 다른 저단가 물량을 북해산 대체재로 환산하면 원가 판단이 어긋납니다. 표본 미달 단가는 탐색 신호로만 보존해 공급선 평가를 왜곡하지 않아야 합니다.</span>,
            source: sourceLabel(cifLadder),
          }}
        />

        {frozenMix ? (
          <WidgetCard
            id="S3_frozen_origin_mix"
            title={frozenMix.title}
            icon={Snowflake}
            iconColor="#7dd3fc"
            pillar={frozenMix.section}
            termTooltip={{ term: 'HS 0307.92', description: '냉동 상태의 기타 연체동물을 담는 국제 공통 6자리 분류입니다. 바다고둥의 광의 대리지표로 씁니다.' }}
            cardDesc={`관세청 ${frozenPeriod} 냉동 HS 0307.92 전체 $${formatNumber(frozenMix.scale_context?.frozen_030792_import_usd)}는 조제·보존의 ${formatNumber(frozenMix.scale_context?.frozen_to_prepared_ratio, 2)}배지만, 조개관자 ${formatPercent(frozenMix.scale_context?.scallop_share_pct)}를 제외하면 ${formatNumber(frozenMix.scale_context?.frozen_excluding_scallop_to_prepared_ratio, 2)}배입니다. 2024·2025 냉동 원자료 미반영으로 횡단면만 표시`}
            unit={formatWidgetUnit(frozenMix.unit)}
            telemetry={widgetTelemetry(frozenMix)}
            chartHeight={320}
            chart={
              <ComposedChart data={frozenMix.data} margin={{ top: 12, right: 18, left: 4, bottom: 40 }}>
                <ChartPatternDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="origin" interval={0} angle={-30} textAnchor="end" height={56} tick={{ fill: '#f8fafc', fontSize: 10 }} />
                <YAxis yAxisId="value" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => `$${formatNumber(Number(value) / 1_000_000, 1)}백만`} />
                <YAxis yAxisId="price" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(value) => `$${formatNumber(value, 0)}`} />
                <RechartsTooltip contentStyle={V2_TOOLTIP_STYLE} formatter={(value: any, name: any) => name === '수입액' ? [`$${formatNumber(value)}`, name] : [formatUsdPerKg(value), name]} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar yAxisId="value" dataKey="import_usd_2026_jan_may" name="수입액" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Line yAxisId="price" type="monotone" dataKey="unit_price_usd_per_kg" name="수입단가" stroke="#fbbf24" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
              </ComposedChart>
            }
            customBody={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
                <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                  <div style={{ ...V2_INFO_PANEL, borderColor: 'rgba(56, 189, 248, 0.24)' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>냉동 (0307.92)</div>
                    <div style={{ color: '#f8fafc', fontSize: '0.92rem', fontWeight: 800, marginTop: '3px' }}>${formatNumber(frozenMix.scale_context?.frozen_030792_import_usd)}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '3px' }}>{formatNumber(frozenMix.scale_context?.frozen_030792_import_kg)}킬로그램</div>
                  </div>
                  <div style={{ ...V2_INFO_PANEL }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>조제·보존 (1605.59)</div>
                    <div style={{ color: '#f8fafc', fontSize: '0.92rem', fontWeight: 800, marginTop: '3px' }}>${formatNumber(frozenMix.scale_context?.prepared_160559_import_usd)}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '3px' }}>광의 코드 전체는 조제의 {formatNumber(frozenMix.scale_context?.frozen_to_prepared_ratio, 2)}배</div>
                    <div style={{ color: '#fbbf24', fontSize: '0.68rem', marginTop: '3px' }}>조개관자 제외 시 조제의 {formatNumber(frozenMix.scale_context?.frozen_excluding_scallop_to_prepared_ratio, 2)}배</div>
                  </div>
                  <div style={{ ...V2_INFO_PANEL }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>활·신선·냉장 (0307.91)</div>
                    <div style={{ color: '#f8fafc', fontSize: '0.92rem', fontWeight: 800, marginTop: '3px' }}>${formatNumber(frozenMix.scale_context?.live_fresh_030791_import_usd)}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '3px' }}>세 형태 중 최소</div>
                  </div>
                </div>

                <div data-whelk-hsk10-breakdown="true" style={{ ...V2_INFO_PANEL }}>
                  <strong style={{ color: '#7dd3fc', fontSize: '0.8rem' }}>HSK10 세번 분해 — 0307.92 안에도 골뱅이가 아닌 품목이 섞여 있습니다</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '7px' }}>
                    {(frozenMix.hsk10_breakdown ?? []).map((row) => (
                      <div key={row.hsk10} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', color: '#cbd5e1', fontSize: '0.72rem' }}>
                        <span>{row.hsk10} · {row.item_name}{row.excluded_from_whelk_scope ? ' · 골뱅이 범위 제외' : ''}</span>
                        <strong style={{ color: row.excluded_from_whelk_scope ? '#fca5a5' : '#f8fafc' }}>${formatNumber(row.import_usd)} · {formatPercent(row.share_pct)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {frozenMix.hypothesis ? (
                  <div data-whelk-hypothesis-block="true" style={{ ...V2_INFO_PANEL, borderColor: 'rgba(148, 163, 184, 0.32)', background: 'rgba(30, 41, 59, 0.55)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ borderRadius: '999px', background: 'rgba(148, 163, 184, 0.18)', border: '1px solid rgba(148, 163, 184, 0.42)', color: '#e2e8f0', padding: '3px 9px', fontSize: '0.7rem', fontWeight: 800 }}>
                        🔬 미검증 가설
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>근거 등급 {frozenMix.hypothesis.claim_grade}</span>
                    </div>
                    <p style={{ margin: '8px 0 0', color: '#f8fafc', fontSize: '0.78rem', lineHeight: 1.5 }}>{frozenMix.hypothesis.statement}</p>
                    <div style={{ color: '#cbd5e1', fontSize: '0.72rem', marginTop: '8px', lineHeight: 1.5 }}>
                      <div style={{ color: '#94a3b8', fontWeight: 700, marginBottom: '3px' }}>관측된 정황</div>
                      {frozenMix.hypothesis.supporting_observations.map((line) => (<div key={line}>· {line}</div>))}
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.72rem', marginTop: '8px', lineHeight: 1.5 }}>
                      <div style={{ color: '#fca5a5', fontWeight: 700, marginBottom: '3px' }}>확정할 수 없는 이유</div>
                      {frozenMix.hypothesis.why_unproven.map((line) => (<div key={line}>· {line}</div>))}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '8px', lineHeight: 1.5 }}>
                      아카이브 반영 후 검증 방법: {frozenMix.hypothesis.falsification_test}
                    </div>
                  </div>
                ) : null}

                <div style={{ ...V2_INFO_PANEL, borderColor: 'rgba(148, 163, 184, 0.3)', background: 'rgba(148, 163, 184, 0.08)' }}>
                  <strong style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>기준선 공백 고지</strong>
                  <p style={{ margin: '6px 0 0', color: '#cbd5e1', fontSize: '0.72rem', lineHeight: 1.5 }}>현재 대시보드 아카이브 기준: {frozenMix.scale_context?.baseline_gap_note}</p>
                </div>

                <WhelkCoverageGapNote dataset={dataset} />
              </div>
            }
            takeaway={{
              situation: <span>{frozenPeriod} 냉동 HS 0307.92 전체는 ${formatNumber(frozenMix.scale_context?.frozen_030792_import_usd)}로 조제·보존의 {formatNumber(frozenMix.scale_context?.frozen_to_prepared_ratio, 2)}배지만, 이 중 {scallopLine?.hsk10} {scallopLine?.item_name} ${formatNumber(scallopLine?.import_usd)}({formatPercent(scallopLine?.share_pct)})는 골뱅이가 아닙니다. 이를 제외한 ${formatNumber(frozenMix.scale_context?.frozen_excluding_scallop_import_usd)}는 조제·보존의 {formatNumber(frozenMix.scale_context?.frozen_excluding_scallop_to_prepared_ratio, 2)}배입니다. 튀르키예의 조제·냉동 병존은 형태 전환 가능성을 시사할 뿐 확정된 사실이 아닙니다.</span>,
              actionPlan: <span>조달 규모를 비교할 때는 HS 0307.92 전체 배수 대신 HSK10 품명 분해와 조개관자 제외 배수를 함께 사용해야 합니다. 튀르키예 형태 전환은 냉동 과거 실적을 대시보드 아카이브에 반영하기 전까지 가설로 두고, 벤더 실사에서 조제·냉동 어느 형태로 계약 가능한지 먼저 확인해야 합니다.</span>,
              source: sourceLabel(frozenMix),
            }}
          />
        ) : null}

        <WidgetCard
          id="S3_hs_classification_guide"
          title={hsGuide.title}
          icon={Package}
          iconColor="#b45309"
          pillar={hsGuide.section}
          termTooltip={{ term: 'HS', description: '국제 거래 품목을 공통 기준으로 분류하는 통일상품명 및 부호체계입니다.' }}
          cardDesc={`관세청 분류표와 실제 관측 ${formatNumber(hsGuide.data.length)}개 ${formatNumber(hsCodeLength)}자리 코드 연결 — 조제·보존 대리지표 ${preparedCode?.hs6}의 ${formatNumber(hskCodeLength)}자리 세부코드 ${formatNumber(preparedCode?.hsk10_observed?.length)}개`}
          telemetry={widgetTelemetry(hsGuide)}
          customBody={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {hsGuide.data.map((row) => (
                <div key={row.hs6} style={{ ...V2_INFO_PANEL, display: 'grid', gridTemplateColumns: '84px minmax(0, 1fr)', gap: '10px', alignItems: 'start', borderColor: row.is_prepared_proxy ? 'rgba(251, 191, 36, 0.35)' : 'rgba(255,255,255,0.08)' }}>
                  <div>
                    <div style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: 800 }}>{row.hs6}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.64rem', marginTop: '3px' }}>{row.scope}</div>
                  </div>
                  <div>
                    <div style={{ color: '#f8fafc', fontSize: '0.78rem', lineHeight: 1.45 }}>{row.stage}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginTop: '5px', lineHeight: 1.45 }}>관측 {formatNumber(String(row.hsk10_observed[0] || '').length)}자리: {row.hsk10_observed.join(' · ')}</div>
                  </div>
                </div>
              ))}
              <div data-whelk-hsk8-guide="true" style={{ ...V2_INFO_PANEL, marginTop: '4px', borderColor: 'rgba(56, 189, 248, 0.28)', background: 'rgba(56, 189, 248, 0.06)' }}>
                <strong style={{ color: '#7dd3fc', fontSize: '0.82rem' }}>관측 HSK8 바구니</strong>
                <p style={{ margin: '5px 0 9px', color: '#cbd5e1', fontSize: '0.7rem', lineHeight: 1.45 }}>
                  HS 1605.59 합계는 규모 확인에만 쓰고, 원산지 점유율·단가는 아래 바구니 안에서만 비교합니다(G-006).
                </p>
                <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                  {(portfolio.baskets ?? []).map((basket) => (
                    <div key={basket.hsk8} style={{ borderLeft: `3px solid ${basket.charted ? '#38bdf8' : '#64748b'}`, background: 'rgba(15, 23, 42, 0.52)', borderRadius: '6px', padding: '8px 10px', minWidth: 0 }}>
                      <div style={{ color: '#f8fafc', fontSize: '0.78rem', fontWeight: 800 }}>{basket.hsk8}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.66rem', marginTop: '3px' }}>{basket.charted ? '바구니별 비교 대상' : '표본 미달 · 차트 제외'}</div>
                      <div style={{ color: '#cbd5e1', fontSize: '0.66rem', marginTop: '5px', lineHeight: 1.4 }}>
                        관측 10자리: {basket.observed_hsk10?.join(' · ') || '자료 없음'}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.66rem', marginTop: '5px', lineHeight: 1.4 }}>
                        2026년 1~5월 ${formatNumber(basket.import_usd_2026_jan_may)} · 주요 원산지 {basket.top_origins_2026?.join('·') || '자료 없음'}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ margin: '9px 0 0', color: '#94a3b8', fontSize: '0.68rem', lineHeight: 1.45 }}>
                  밀폐용기 말단코드(…10) 수입액은 2024년 1~5월 0달러, 2026년 1~5월 113달러로 사실상 미사용입니다.
                </p>
              </div>
            </div>
          }
          takeaway={{
            situation: <span>관측된 {formatNumber(hsCodeLength)}자리 분류는 {formatNumber(hsGuide.data.length)}개이며, 조제·보존 대리지표 {preparedCode?.hs6} 아래에 {formatNumber(hskCodeLength)}자리 세부코드 {formatNumber(preparedCode?.hsk10_observed?.length)}개가 확인됩니다. 이 분류는 기타 조제·보존 연체동물을 포괄합니다.</span>,
            actionPlan: <span>{preparedCode?.hs6} 통계를 골뱅이 단독 실적으로 단정하지 말고, 세부코드·품명·원산지를 함께 확인한 뒤 조달 판단에 사용해야 합니다.</span>,
            source: sourceLabel(hsGuide),
          }}
        />
      </>
    );
  }

  return null;
}

export default function WhelkDashboard() {
  const [data, setData] = useState<any>(null);
  const [activePart, setActivePart] = useState<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>('S1');

  useEffect(() => {
    fetch('/api/whelk/live')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error('Error fetching whelk data:', err));
  }, []);

  if (!data) {
    return (
      <div style={{ padding: '2rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <RefreshCcw className="animate-spin" size={24} color="var(--color-info)" />
        <span>골뱅이 인텔리전스 로딩 중...</span>
      </div>
    );
  }

  const {
    canadaCaptureData = [],
    importMarketShare = [],
    yieldArbitrageData = [],
    waterfallData = [],
    brandPositioningData = [],
    channelDemandData = [],
    fxCorrelationData = [],
    ukRegulatoryRadar = [],
    cadmiumData = [],
    importSurgeData = [],
    byproductData = [],
    solidContentData = [],
    climateRiskData = [],
    widgets = [],
    usCannedMarketData = [],
    nutritionBenchmarkData = [],
    mcrsScenarioData = [],
    sgValueUpData = [],
    euPackagingRiskData = [],
    pfasRiskData = [],
    postUkScorecardData = [],
    blackSeaSupplyData = [],
    fxAlertThresholds = [],
    halalCollagenData = [],
    feedstockYoyData = [],
    originCifGapData = []
  } = data;
  const v2Data = data.v2 as WhelkV2Dataset | undefined;
  const ukMonthly2024Rows = v2Data?.widgets.S3_origin_portfolio_shift?.uk_monthly_2024 ?? [];
  const ukMonthly2024Data = ukMonthly2024Rows.map((row) => ({
    ...row,
    monthLabel: `${Number(row.month.split('-')[1])}월`,
    importUsdMillion: row.import_usd / 1_000_000,
    volumeTonnes: row.import_kg / 1_000,
  }));
  const ukMonthly2024Peak = getMaximumRow(ukMonthly2024Rows, 'import_usd');
  const ukMonthly2024TotalUsd = ukMonthly2024Rows.reduce((sum, row) => sum + row.import_usd, 0);
  const ukMonthly2024TotalKg = ukMonthly2024Rows.reduce((sum, row) => sum + row.import_kg, 0);

  // KFAS 연구 위젯 필터링
  const kfasWidgets = widgets.filter((w: any) => w.id?.startsWith('w5'));

  // 패턴 B(L-12): 라우트 _metadata의 정직 신호(isLive·status)를 직접 소비.
  // `data ? 'SYNCED' : 'STATIC'` 식 truthiness 격상 금지 — 라우트가 STATIC을 선언하면 STATIC.
  const metaStatus: 'LIVE' | 'SYNCED' | 'STATIC' =
    data?._metadata?.isLive === true ? 'LIVE'
    : data?._metadata?.status === 'SYNCED' ? 'SYNCED'
    : 'STATIC';
  const metaSyncDate = data?._metadata?.syncDate;

  return (
    <div style={{ padding:'0 1.5rem 3rem', color:'#f8fafc', minHeight:'100vh', fontFamily:"'Inter',sans-serif" }}>
      {/* HEADER */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', 
              background: 'var(--color-info)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Anchor size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                골뱅이 전략 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>골뱅이 전략 커맨드 센터 — {INLINE_WIDGET_COUNT - RETIRED_HS6_WIDGET_COUNT + kfasWidgets.length - HYPOTHESIS_WIDGET_COUNT}개 위젯 · 가설 {HYPOTHESIS_WIDGET_COUNT}개 별도 · 5-Pillar 프레임워크</p>
            </div>
          </div>
          <div className="ds-card" style={{fontSize: '0.88rem', padding: '8px 16px', 
            background: '#11182f', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'}}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }} />
            <span>5개 출처 <span style={{ color: '#94a3b8' }}>STATIC</span></span>
            <span style={{ margin: '0 8px', color: '#4d4d4d' }}>|</span>
            <span style={{ color: 'var(--text-primary)' }}>KCS · IFCA · MMO · EFSA · aT FIS</span>
          </div>
        </div>
      </header>

      {/* 4 KPIs */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="ds-card" style={{background: 'rgba(20, 28, 52, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 28, 52, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', wordBreak: 'keep-all', maxWidth: '75%', lineHeight: '1.2' }}>영국산 수입 의존도</span>
            <TelemetryBadge status="synced" syncDate="KCS 2024 연간" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>52.1%</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-info)', fontWeight: 600 }}>
            <span style={{ background: '#3b82f620', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>HS160559</span> <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>2024년 연간 수입액 $30.46M/$58.5M</span>
          </div>
        </div>

        <div className="ds-card" style={{background: 'rgba(20, 28, 52, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 28, 52, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', wordBreak: 'keep-all', maxWidth: '75%', lineHeight: '1.2' }}>영국산 평균 입고단가</span>
            <TelemetryBadge status="synced" syncDate="2024.2H" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>$12.8/kg</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-success)', fontWeight: 600 }}>
            <span style={{ background: '#10b98120', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>부산항 도착</span> <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>최신물류비 반영</span>
          </div>
        </div>

        <div className="ds-card" style={{background: 'rgba(20, 28, 52, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 28, 52, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', wordBreak: 'keep-all', maxWidth: '75%', lineHeight: '1.2' }}>캐나다 어획 감소율</span>
            <TelemetryBadge status="synced" syncDate="2023.12" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>-74%</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-danger)', fontWeight: 600 }}>
            <span style={{ background: '#ef444420', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>▼ 10Y 추세</span> <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>생태계 변화</span>
          </div>
        </div>

        <div className="ds-card" style={{background: 'rgba(20, 28, 52, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 28, 52, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', wordBreak: 'keep-all', maxWidth: '75%', lineHeight: '1.2' }}>영국산 원물 수율</span>
            <TelemetryBadge status="static" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>20-25%</div>
          <div style={{ fontSize: '0.88rem', color: 'var(--color-warning)', fontWeight: 600 }}>
            <span style={{ background: '#f59e0b20', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>수율 1위</span> <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>튀르키예 대비 2배</span>
          </div>
        </div>

        <div className="ds-card" style={{background: 'rgba(20, 28, 52, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '8px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', transition: 'background 0.2s ease, box-shadow 0.2s ease', cursor: 'default', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', position: 'relative', overflow: 'hidden'}}
             onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.5) 0px 8px 24px'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 28, 52, 0.6)'; e.currentTarget.style.boxShadow = 'rgba(0,0,0,0.3) 0px 8px 8px'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', wordBreak: 'keep-all', maxWidth: '75%', lineHeight: '1.2' }}>KFAS 학술 검증</span>
            <TelemetryBadge status="static" syncDate="2024" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a78bfa' }}>{kfasWidgets.length}건</div>
          <div style={{ fontSize: '0.88rem', color: '#8b5cf6', fontWeight: 600 }}>
            <span style={{ background: '#8b5cf620', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>학술 검증</span> <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>국립수산과학원</span>
          </div>
        </div>
      </div>

      {/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(20, 28, 52, 0.5), rgba(20, 28, 52, 0.2))',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '16px',
        padding: '6px',
        marginBottom: '2rem',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(140,170,255,0.10)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '4px 0 8px',
          borderBottom: '1px solid rgba(140,170,255,0.10)',
          marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(148,163,184,0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요
          </span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {SECTIONS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActivePart(s.id as any)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(140,170,255,0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = `${s.color}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
                style={{
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  padding: '12px 8px 14px',
                  background: isActive ? `${s.color}12` : 'transparent',
                  border: `1.5px solid ${isActive ? s.color : 'transparent'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? `0 0 20px ${s.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
                  overflow: 'hidden',
                }}
              >
                {isActive && (
                  <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px',
                    background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                    borderRadius: '3px 3px 0 0' }} />
                )}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? s.color : 'rgba(140,170,255,0.12)',
                  color: isActive ? '#0a0f1f' : 'rgba(148,163,184,0.6)',
                  fontSize: '0.75rem', fontWeight: 800,
                  transition: 'all 0.25s',
                  boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none',
                }}>{idx + 1}</div>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? s.color : 'var(--text-secondary)',
                  transition: 'all 0.25s',
                  whiteSpace: 'nowrap',
                }}>{s.label}</span>
                {isActive && (
                  <span style={{
                    fontSize: '0.6rem', color: 'rgba(148,163,184,0.7)',
                    textAlign: 'center', lineHeight: 1.3, marginTop: '2px', padding: '0 4px',
                  }}>
                    {s.desc.slice(0, 24)}…
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT GRID */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', width: '100%' }}>
      {activePart === 'S1' && (<>
        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Fish size={20} color="var(--color-info)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>❶ 원료 수급</h2>
  </div>
  {v2Data && <WhelkV2Widgets dataset={v2Data} activePart="S1" />}
  <>
            <WidgetCard title="캐나다 vs 영국 어획량 장기 시계열" icon={TrendingUp} iconColor="var(--color-info)" pillar="S1"
              cardDesc="해수온 상승의 캐나다 어획 영향 + 영국산 수요 이동 예측"
              telemetry={{ status: 'STATIC', syncDate: '2024년 1H 기준' }} chartHeight={300}
              chart={
                <LineChart data={canadaCaptureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="canada" name="캐나다 어획(톤)" stroke="var(--color-danger)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="uk" name="영국 어획(톤)" stroke="var(--color-info)" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              }
              takeaway={{
                situation: <span>[DFO Canada] 바닷물 온도가 높아지면서 캐나다 해역의 골뱅이가 사라지고 있으며, 이로 인해 전 세계 바이어들이 유일한 대안인 영국으로 몰려 경쟁이 치열해지고 있습니다.</span>,
                actionPlan: <span>캐나다 해역 어획량이 수온 상승 등 해양 생태계 변화로 인해 과거 10년간 74%나 급감하며 사실상 산업 붕괴(Collapse) 수준에 도달했습니다. 이는 글로벌 수급 밸런스를 붕괴시키며, 유일한 고품질 대체재인 영국산 원물에 대한 전 세계 바이어들의 패닉 바잉(Panic Buying)과 가격 폭등을 촉발할 가능성이 농후합니다. 경영진은 이를 구조적 위기로 인식하고, 즉각적인 <TermTooltip term="장기 공급계약(LTC)" description="Long-Term Contract. 시장 가격 변동성에 대비하여 원물 공급자에게 고정 가격 혹은 최소 보장 물량을 담보받는 장기 선도 계약." /> 체결 및 선급금 지급을 통해서라도 영국 해역 내 확고한 물량 락인을 최우선으로 확보해야 합니다.</span>,
                source: 'DFO Canada / UK MMO (2024 1H)',
              }} />
            
            <WidgetCard title="영국 MCRS 상향 시나리오별 공급쇼크 시뮬레이션" icon={AlertTriangle} iconColor="var(--color-danger)" pillar="S1"
              cardDesc="영국 IFCA 최소보존규격 50/55/60mm 시나리오별 어획량 영향"
              telemetry={{ status: 'STATIC', syncDate: '2026 시뮬레이션' }} chartHeight={300}
              chart={
                <AreaChart data={mcrsScenarioData}>
                  <defs>
                    <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis domain={[5000, 15000]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="baseline" name="현행 유지" stroke="var(--color-info)" fill="url(#colorBaseline)" />
                  <Line type="monotone" dataKey="mcrs50" name="MCRS 50mm" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="mcrs55" name="MCRS 55mm" stroke="var(--color-danger)" strokeWidth={2} />
                  <Line type="monotone" dataKey="mcrs60" name="MCRS 60mm" stroke="#dc2626" strokeWidth={2} strokeDasharray="8 4" />
                </AreaChart>
              }
              takeaway={{
                situation: <span>[IFCA 시뮬레이션] 영국이 골뱅이 최소 크기 기준을 현행 45mm에서 55mm로 올리면, 어획 가능 물량이 최대 30% 이상 급감하여 글로벌 수급에 충격파를 일으킬 수 있습니다.</span>,
                actionPlan: <span>MCRS 55mm 시나리오(가장 유력)에서 영국산 어획량이 2027년까지 현행 대비 26% 감소(14,091톤→9,800톤)할 것으로 예측됩니다. 이는 한국 수입 물량의 약 1,100톤 부족을 의미하며, 톤당 단가 15~20% 상승 압력이 불가피합니다. 조달 전략 파트는 MCRS 55mm 확정 시점(2026H2 예상) 이전에 현행 규격(45mm) 원물의 대량 선매입을 실행하고, 동시에 아이슬란드·아일랜드 대체 물량 확보를 병행해야 합니다.</span>,
                source: 'IFCA MCRS 시뮬레이션 (2026)',
              }} />

            <WidgetCard title="포스트 영국(Post-UK) 시대 대비 신규 어장 스코어카드" icon={Navigation} iconColor="var(--color-info)" pillar="S1"
              cardDesc="대체 어장 4축 평가 — 어획 추세·FTA 혜택·물류 효율"
              telemetry={{ status: 'STATIC', syncDate: '2026 분석' }} chartHeight={300}
              chart={
                <BarChart data={postUkScorecardData} layout="vertical" margin={{ left: 30 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="country" type="category" tick={{ fill: '#f8fafc', fontSize: 11 }} width={70} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="catchTrend" name="어획 추세" fill="var(--color-info)" stackId="a" />
                  <Bar dataKey="ftaStatus" name="FTA 혜택" fill="var(--color-success)" stackId="b" />
                  <Bar dataKey="logisticsCost" name="물류 효율" fill="var(--color-warning)" stackId="c" />
                </BarChart>
              }
              takeaway={{
                situation: <span>[FAOSTAT/ICES] 영국 다음으로 유력한 골뱅이 공급처는 아일랜드(종합 82점)와 아이슬란드(78점)이며, 캐나다(38점)는 사실상 탈락입니다.</span>,
                actionPlan: <span>포스트 영국(Post-UK) 전략의 핵심은 아일랜드(종합 82점)입니다. 동일 B. undatum 종이며 EU FTA 관세 0% 혜택, 영국과 인접한 물류 인프라를 보유합니다. 차선책인 아이슬란드(78점)는 저수온(7.2°C)으로 장기 자원 안정성이 최고이나, 현재 FTA 미체결로 관세 부담이 존재합니다. 조달팀은 아일랜드 벤더 2~3곳과의 시범 거래를 26Q3에 착수하고, 아이슬란드와의 HS030781 관세 협상 가능성을 외교 채널로 탐색해야 합니다.</span>,
                source: 'FAOSTAT + ICES (2026 분석)',
              }} />

          </>
      </>)}
      {activePart === 'S2' && (<>
        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Factory size={20} color="var(--color-info)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>❷ 가공 및 생산</h2>
  </div>
  <>
            <WhelkRetiredHs6WidgetGate>
            <WidgetCard title="국내 수입산 골뱅이 국가별 점유율" icon={ChartPie} iconColor="var(--color-info)" pillar="S3"
              cardDesc="KCS HS160559 2024년 연간 수입금액($M) 기준 국가별 점유율(총 $58.5M, 기타 포함) — 영국·아일랜드 합산 65% 단일 해역 리스크"
              telemetry={{ status: metaStatus, syncDate: metaSyncDate || 'KCS 2026-05-15' }} chartHeight={300}
              chart={
                <PieChart>
                  <Pie data={importMarketShare} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {importMarketShare.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={IMPORT_COLORS[index % IMPORT_COLORS.length]} />))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              }
              takeaway={{
                situation: <span>[KCS] 2024년 연간 수입금액 기준 영국(52.1%)·아일랜드(12.9%) 두 나라에 65%를 의존하고 있어, 해당 지역에 문제가 생기면 공급망 전체가 마비될 위험이 큽니다.</span>,
                actionPlan: <span>영국산 원물 수입액이 $30.4M(2024년 연간 수입액 $58.5M의 52.1%)으로 1위를 수성 중이며, 지리적으로 연접한 아일랜드 물량($7.6M)까지 합산 시 북해 해역에 대한 <TermTooltip term="HS160559" description="조제하거나 보존처리한 연체동물(골뱅이 포함)의 무역 품목 분류 코드." /> 의존도가 65%에 육박하는 등 단일 해역 리스크가 한계치를 초과했습니다. 저단가인 튀르키예 및 중국산(R. venosa)은 B2B 시장의 원가 방어를 위한 블렌딩 용도로만 제한적으로 활용 가능합니다. 거시적 공급 충격에 대비하여 노르웨이, 아이슬란드 등 신규 북대서양 어장 개척 및 프리미엄 라인업 다변화 검증 테스트가 시급합니다.</span>,
                source: 'KCS 관세청 (2026-05-15)',
              }} />
            </WhelkRetiredHs6WidgetGate>

            <WidgetCard title="영국산 HSK8 월별 수입 실측 (2024)" icon={Snowflake} iconColor="var(--color-info)" pillar="S3"
              cardDesc="관세청 HSK8 16055910 안의 영국산 2024년 월별 상세행 — 수입액·중량 관측값만 표시하며 소비·운임 원인을 추정하지 않음"
              telemetry={{ status: ukMonthly2024Rows.length ? 'SYNCED' : 'STATIC', syncDate: ukMonthly2024Rows.length ? '관세청 2024.01~12' : '아카이브 미반영' }} chartHeight={300}
              chart={
                <ComposedChart data={ukMonthly2024Data}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="monthLabel" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={0} textAnchor="middle" height={48} />
                  <YAxis yAxisId="value" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => `$${formatNumber(value, 1)}백만`} />
                  <YAxis yAxisId="weight" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => `${formatNumber(value)}톤`} />
                  <RechartsTooltip contentStyle={V2_TOOLTIP_STYLE} formatter={(value: any, name: any) => name === '수입액' ? [`$${formatNumber(Number(value) * 1_000_000)}`, name] : [`${formatNumber(value, 1)}톤`, name]} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="value" dataKey="importUsdMillion" name="수입액" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="weight" type="monotone" dataKey="volumeTonnes" name="중량" stroke="var(--color-danger)" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[KCS] HSK8 16055910 영국산 2024년 월별 실적 합계는 ${formatNumber(ukMonthly2024TotalUsd)}·{formatNumber(ukMonthly2024TotalKg / 1_000, 1)}톤이며, 수입액 최고 월은 {formatMonth(ukMonthly2024Peak?.month)} ${formatNumber(ukMonthly2024Peak?.import_usd)}입니다. 이는 통관 분포이며 국내 소비나 운임의 원인을 입증하지 않습니다.</span>,
                actionPlan: <span>월별 집중도는 발주 검토의 관측 근거로만 사용하고, 조기 발주·냉동창고 확보 여부는 같은 기간 실제 판매·재고·냉동 운임 자료를 별도로 대조한 뒤 결정해야 합니다.</span>,
                source: 'KCS 관세청 HSK8 16055910 영국산 상세행 (2024)',
              }} />
          </>

            <WhelkHypothesisSection count={1}>
              <WhelkHypothesisCard reason="내부 기획안, 외부 검증 자료 없음">
            <WidgetCard title="SG 2026 밸류업 × 골뱅이 HMR 신제품 로드맵" icon={Package} iconColor="var(--color-success)" pillar="S2"
              cardDesc="실측 데이터 없음 — 내부 기획안이며 외부 검증 자료를 보유하지 않음"
              telemetry={{ status: 'STATIC', syncDate: 'SG 내부기획 2026 Q2' }} chartHeight={300}
              chart={
                <BarChart data={sgValueUpData} layout="vertical" margin={{ left: 50 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '개발 진행률(%)', position: 'bottom', fill: '#94a3b8', offset: -5 }} />
                  <YAxis dataKey="sku" type="category" tick={{ fill: '#f8fafc', fontSize: 10 }} width={130} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="status" name="진행률(%)" radius={[0, 4, 4, 0]}>
                    {sgValueUpData.map((entry: any, index: number) => (<Cell key={`sg-${index}`} fill={entry.status >= 70 ? 'var(--color-success)' : entry.status >= 50 ? 'var(--color-warning)' : 'var(--color-info)'} />))}
                  </Bar>
                </BarChart>
              }
              takeaway={{
                situation: <span>[SG 밸류업] 2026 운영방안에 따라 골뱅이 HMR 라인 6종을 개발 중이며, 혼술 에디션과 에어프라이어 키트가 26Q3 출시 목표로 가장 빠르게 진행 중입니다.</span>,
                actionPlan: <span>SG 2026 밸류업 전략의 핵심은 '혼술 에디션 150g'(85% 완성)과 '에어프라이어 키트 200g'(70% 완성)의 26Q3 성수기 적시 출시입니다. 두 제품 합산 연간 매출 목표 37억 원이며, 이를 위해 편의점(CU/GS25) 입점 MOU를 6월까지 확정해야 합니다. 후속 제품인 '프리미엄 고형량65%+'는 경쟁사 대비 투명성 마케팅 차별화를 위해 포장 전면에 고형량 비율을 대형 표기하는 전략이 핵심입니다. 마케팅팀은 인플루언서 홈술 콘텐츠 마케팅을 Q3 출시 4주 전부터 선제 집행해야 합니다.</span>,
                source: 'SG 2026 밸류업 운영방안',
              }} />
              </WhelkHypothesisCard>
            </WhelkHypothesisSection>

            <WidgetCard title="조제·보존 골뱅이 수입 규모 (HS 1605.59 합계)" icon={Factory} iconColor="var(--color-info)" pillar="S2"
              cardDesc="KCS HS 1605.59 두 HSK8 바구니 합산 규모 — 물량·금액·시사단가만 표시하며 원산지 점유율 분모로 사용 금지"
              telemetry={{ status: metaStatus, syncDate: metaSyncDate || 'KCS 2024 연간' }} chartHeight={300}
              chart={
                <ComposedChart data={feedstockYoyData}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} height={50} />
                  <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '물량(톤)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 12]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '$/kg', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="volumeT" name="투입물량(톤)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="unitPrice" name="시사단가($/kg)" stroke="var(--color-danger)" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[KCS] 기타 조제·보존 연체동물의 광의 대리지표인 HS 1605.59 합계는 2024년 6,215톤/$58.50M으로 전년(8,251톤/$68.98M) 대비 물량 -24.7%·금액 -15.2%였고, 시사단가는 $8.36→$9.41/kg였습니다. 이 합계는 서로 다른 HSK8 바구니를 포함합니다.</span>,
                actionPlan: <span>이 수치는 조제·보존 수입의 전체 규모 맥락에만 사용합니다. 공장 가동률이나 발주량을 판단하려면 HSK8 바구니별 품목·원산지와 실제 생산 투입 자료를 먼저 대조해야 합니다.</span>,
                source: 'KCS 관세청 HS160559 통관 (2023·2024)',
              }} />

            <WhelkRetiredHs6WidgetGate>
            <WidgetCard title="원산지별 CIF 단가 격차 — 대체재 탄력성" icon={Package} iconColor="var(--color-warning)" pillar="S4"
              cardDesc="KCS HS160559 원산지별 CIF($/kg) — 북해 vs 저단가 대체재"
              telemetry={{ status: metaStatus, syncDate: metaSyncDate || 'KCS 2024 연간' }} chartHeight={300}
              chart={
                <BarChart data={originCifGapData} layout="vertical" margin={{ left: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#f8fafc', fontSize: 11 }} width={60} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(140,170,255,0.10)' }} />
                  <Bar dataKey="value" name="CIF 단가($/kg)" radius={[0, 4, 4, 0]}>
                    {originCifGapData.map((entry: any, index: number) => (<Cell key={`cif-${index}`} fill={entry.value >= 12 ? 'var(--color-danger)' : entry.value <= 7 ? 'var(--color-success)' : 'var(--color-info)'} />))}
                  </Bar>
                </BarChart>
              }
              takeaway={{
                situation: <span>[KCS] 2024년 원산지별 CIF 단가는 영국 $12.75/kg·아일랜드 $12.27 vs 중국 $6.37·세네갈 $4.73로 북해산이 저단가 대체재의 약 2배입니다.</span>,
                actionPlan: <span>조달팀은 B2B 원가 방어 라인에 한해 세네갈·중국산을 20~30% 블렌딩해 CIF를 낮추되, 수율을 반영한 총사용원가(TCU) 검증을 통과한 물량만 채택하는 'Yield-Adjusted 구매' 기준을 적용해야 합니다.</span>,
                source: 'KCS 관세청 HS160559 통관 (2024)',
              }} />
            </WhelkRetiredHs6WidgetGate>
      </>)}
      {activePart === 'S3' && (<>
        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Ship size={20} color="var(--color-info)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>❸ 물류 및 통관</h2>
  </div>
  {v2Data && <WhelkV2Widgets dataset={v2Data} activePart="S3" />}
  <>
            <WhelkHypothesisSection count={2}>
              <WhelkHypothesisCard reason="원산지별 살수율 수치 출처 미보유">
            <WidgetCard title="국가별 원물 수율 기반 총사용원가 비교" icon={Scale} iconColor="var(--color-info)" pillar="S3"
              cardDesc="실측 데이터 없음 — 원산지별 살수율 수치 출처를 보유하지 않음"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <ComposedChart data={yieldArbitrageData} layout="vertical" margin={{ left: 40 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis dataKey="origin" type="category" tick={{ fill: '#f8fafc', fontSize: 11 }} width={100} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="price" name="단가($/kg)" fill="#64748b" barSize={15} />
                  <Scatter dataKey="yieldMax" name="살수율(%)" fill="var(--color-success)" />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[KCS+Seafish] 튀르키예나 중국산 원물이 표면상 영국산보다 싸 보이지만, 버려지는 내장이나 껍질 등을 빼고 순수 살코기 양만 보면 오히려 영국산이 더 저렴합니다.</span>,
                actionPlan: <span>단순 통관 단가 기준으로는 중국/튀르키예산(R. venosa)이 영국산(B. undatum)의 절반 수준으로 저렴해 보입니다. 그러나 가공 공정 데이터를 연동하여 <TermTooltip term="TCU" description="Total Cost of Usage. 껍질, 내장, 수분 감량 등을 제한 후 실제로 제품에 쓰이는 순 살코기(Meat Yield)를 얻기 위한 환산 단위 원가." />(총사용원가)를 산출하면, 튀르키예산은 극심한 부산물 감량 탓에 실질 원가가 $91.0/kg까지 치솟아 오히려 영국산($54.2/kg)보다 68%나 비싼 'Low-Yield Trap(저수율 함정)'에 빠지게 됩니다. 조달팀은 벤더와의 단가 협상 시 맹목적인 단가 인하 방어가 아닌 'Yield-Adjusted(수율 조정)' 재무 모델을 전면 도입해 구매 타당성을 평가해야 합니다.</span>,
                source: 'KCS + Seafish UK',
              }} />
              </WhelkHypothesisCard>

              <WhelkHypothesisCard reason="부위별 카드뮴 수치 원자료 미보유">
            <WidgetCard title="카드뮴 생체축적 및 식품안전 규제 진단" icon={FlaskConical} iconColor="var(--color-danger)" pillar="S3"
              cardDesc="실측 데이터 없음 — 부위별 카드뮴 수치 원자료를 보유하지 않음"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <ComposedChart data={cadmiumData} margin={{ top: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="part" tick={{ fill: '#f8fafc', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis domain={[0, 7]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'mg/kg', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="cd" name="카드뮴 농도(mg/kg)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#f8fafc', fontSize: 11 }}>
                    {cadmiumData.map((entry: any, index: number) => (<Cell key={`cd-${index}`} fill={index === 1 ? 'var(--color-danger)' : index === 2 ? 'var(--color-warning)' : 'var(--color-success)'} />))}
                  </Bar>
                  <Line type="monotone" dataKey="limit" name="식약처 기준선(2.0)" stroke="#f8fafc" strokeWidth={2} strokeDasharray="8 4" dot={false} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[식약처/EFSA] 골뱅이 내장에는 카드뮴이 식약처 기준치를 초과하여 쌓이므로, 가공 시 내장을 완벽하게 제거하지 않으면 통관에 실패할 수 있습니다.</span>,
                actionPlan: <span>골뱅이의 간췌장(내장) 부위에는 카드뮴이 근육 대비 20~100배 농축(5.5mg/kg)되어 식약처 기준(2.0mg/kg)을 크게 초과합니다. 해외 가공 공장에서 <TermTooltip term="내장 제거 완전성" description="Evisceration Rate. 가공 과정에서 간췌장(내장)이 완전히 제거된 비율. 미달 시 중금속 기준 초과로 수입 통관 부적합 판정의 직접적 원인." /> 이 미달될 경우, 한 번의 식약처 부적합 판정으로 수억 원대 물량이 전량 폐기·반송됩니다. QC팀은 분기별 원산지 공장 방문 검수와 제3자 검사기관(SGS, Intertek) 인증을 의무화하고, 내장 제거율을 핵심 KPI로 관리해야 합니다.</span>,
                source: '식약처 / EFSA',
              }} />
              </WhelkHypothesisCard>
            </WhelkHypothesisSection>

            <WidgetCard title="영국산 수입 통관 원가 폭포수 구조" icon={DollarSign} iconColor="var(--color-info)" pillar="S3"
              cardDesc="FOB → CIF → 관세 → 내륙 통관 단계별 — 한-영 FTA 무관세 방어"
              telemetry={{ status: metaStatus, syncDate: metaSyncDate || 'KCS 2026-05-15' }} chartHeight={300}
              chart={
                <BarChart data={waterfallData} margin={{ top: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={0} textAnchor="middle" height={60} />
                  <YAxis domain={[11.5, 14]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="비용($/kg)" fill="var(--color-info)" label={{ position: 'top', fill: '#f8fafc', fontSize: 10 }}>
                    {waterfallData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                  </Bar>
                </BarChart>
              }
              takeaway={{
                situation: <span>[KCS] 영국 수입산 원물은 관세가 0%로 면제되는 한-영 FTA 혜택 덕분에, 다른 부가 비용이 붙더라도 매우 뛰어난 가격 방어력을 보입니다.</span>,
                actionPlan: <span>영국산 원물의 평균 수입단가 $12.75/kg 이면에 있는 가장 강력한 방어기제는 <TermTooltip term="한-영 FTA" description="영국의 브렉시트(Brexit) 이후 한국과 영국 간 체결된 자유무역협정. 수산물(골뱅이) 무관세 혜택의 핵심." />(수입 관세 0%) 혜택입니다. 무관세 특권으로 해운 운임($0.42)과 내륙 통관/보관료($0.15)를 합산해도 총 입고단가를 $13.32/kg 선에서 억제하는 총수명주기비용(LCC) 효율이 발생합니다. 경쟁국(관세 부과 시) 대비 10~20%의 원가 우위 해자로 작용하므로, 무역 파트는 영국 현지 패커들의 원산지 증명 갱신 및 행정적 컴플라이언스 이탈을 상시 모니터링해야 합니다.</span>,
                source: 'KCS 관세청 수입 통관 통계',
              }} />

            {v2Data?.widgets.S3_fta_import_quarterly && (
              <WhelkFTAQuarterly widget={v2Data.widgets.S3_fta_import_quarterly} />
            )}
          </>
      </>)}
      {activePart === 'S4' && (<>
        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <TrendingUp size={20} color="var(--color-info)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>❹ 판매 및 수요</h2>
  </div>
            <WhelkHypothesisSection count={4}>
              <WhelkHypothesisCard reason="브랜드 점유율 1차 출처 미보유">
            <WidgetCard title="B2C 통조림 브랜드 경쟁력 & 가성비 매핑" icon={Target} iconColor="var(--color-info)" pillar="S4"
              cardDesc="실측 데이터 없음 — 브랜드 점유율 1차 출처를 보유하지 않음"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="x" type="number" name="고형량" domain={[80, 160]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '고형량(g) →', position: 'bottom', fill: '#94a3b8', offset: -5 }} />
                  <YAxis dataKey="y" type="number" name="가격" domain={[3000, 5500]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '100g당 가격(₩) →', angle: -90, position: 'left', fill: '#94a3b8' }} />
                  <ZAxis dataKey="z" type="number" range={[200, 1500]} name="점유율(%)" />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <Scatter name="브랜드" data={brandPositioningData} fill="var(--color-info)">
                    {brandPositioningData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-danger)' : index === 3 ? 'var(--color-warning)' : 'var(--color-info)'} />))}
                  </Scatter>
                </ScatterChart>
              }
              takeaway={{
                situation: <span>[aT FIS] 유동 골뱅이가 1위를 지키고 있으나, 타 브랜드들이 고형량(살코기 비율)을 늘리거나 가격을 낮추는 방식으로 가성비 경쟁을 치열하게 전개 중입니다.</span>,
                actionPlan: <span>경쟁사 '동표골뱅이'는 <TermTooltip term="고형량" description="Solid weight. 통조림 내 액상액(조미액)을 제외한 순수 고기 무게." />(147g)과 저렴한 100g당 단가(₩3,600)를 무기로 매니아층 및 B2B 시장의 바닥을 무섭게 잠식하고 있습니다. 1위 브랜드인 유동(130g, ₩4,200)은 강력한 브랜드 헤리티지로 프리미엄 B2C 시장을 철통 수성 중이나, 합리적 소비 트렌드 확산에 따라 가성비 이탈 현상이 관측됩니다. 장기적 성장을 위해서는 프리미엄 라인의 고형량 투명성 강화 캠페인과 더불어, 중저가 원물 믹스를 통한 실속형 '세컨드 브랜드' 출시로 하방 압력을 분산해야 합니다.</span>,
                source: 'aT FIS 식품산업통계 (2024)',
              }} />
              </WhelkHypothesisCard>

              <WhelkHypothesisCard reason="채널 매출 통계 미보유">
            <WidgetCard title="B2C 및 B2B 채널별 매출 분포" icon={Building2} iconColor="var(--color-info)" pillar="S4"
              cardDesc="실측 데이터 없음 — 채널별 매출 통계를 보유하지 않음"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <PieChart>
                  <Pie data={channelDemandData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="size" paddingAngle={2} labelLine={false} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {channelDemandData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              }
              takeaway={{
                situation: <span>[aT FIS] 대형마트 판매는 둔화되는 반면, 쿠팡 등 이커머스와 B2B 식자재 유통 채널의 성장이 폭발적입니다.</span>,
                actionPlan: <span>과거 시장을 지배하던 대형마트 및 SSM의 점유율(62.3%) 독과점 체제가 빠르게 허물어지며 유통 구조의 파편화가 진행 중입니다. 쿠팡을 위시한 e커머스(11.8%)의 묶음 배송과 1인 가구 홈술족을 겨냥한 편의점(6.4%) 매출이 폭발적으로 성장하고 있습니다. 무엇보다 외식 물가 상승으로 인한 호프/주점용 프랜차이즈 납품 시장, 즉 B2B 식자재(19.5%) 채널이 강력한 '현금창출원(Cash Cow)'로 부상했습니다. 기존 300~400g 캔 규격의 틀을 깨고 <TermTooltip term="SKU 다변화" description="Stock Keeping Unit. 150g 소포장(CVS용), 1kg 대용량 벌크 파우치(B2B용) 등 포장 규격의 세분화 전략." />(150g 파우치, 1kg 벌크 등)를 통한 전방위 채널 침투 전략을 수립해야 합니다.</span>,
                source: 'aT FIS 식품산업통계',
              }} />
              </WhelkHypothesisCard>
              <WhelkHypothesisCard reason="트렌드 서술, 수치 근거 없음">
            <WidgetCard title="미국 캔 르네상스 — 골뱅이 수출 신시장 기회" icon={ShoppingBag} iconColor="var(--color-success)" pillar="S4"
              cardDesc="실측 데이터 없음 — 트렌드 서술을 뒷받침할 수치 근거가 없음"
              telemetry={{ status: 'STATIC', syncDate: 'KMI 2026.05' }} chartHeight={300}
              chart={
                <ComposedChart data={usCannedMarketData}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '$B', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '%', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="marketSize" name="미국 캔 시장($B)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="growth" name="성장률(%)" stroke="var(--color-success)" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="whelkPotential" name="골뱅이 침투 예상($M)" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 5 }} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[KMI 카드뉴스] 미국에서 통조림이 다시 '힙'해지고 있습니다. Z세대의 '틴 캔 르네상스'가 SNS에서 바이럴되며, 고급 수산 통조림 시장이 연 10% 이상 성장 중입니다.</span>,
                actionPlan: <span>미국 프리미엄 캔 시장이 $15.5B(2026E)에 달하며, 특히 K-Food 한류 영향권 내 아시안 마켓과 H-Mart 채널이 연간 15%씩 성장 중입니다. 골뱅이 캔은 '한국식 해산물 안주'라는 포지셔닝이 가능하며, 미국 내 소주 열풍과 시너지가 큽니다. 해외사업부는 H-Mart, 쿠팡 글로벌 입점을 26Q4까지 완료하고, 영문 패키지 리디자인(프리미엄 크래프트 캔 콘셉트)을 즉시 착수해야 합니다. 초기 목표 매출 $1.2M(2026E).</span>,
                source: 'KMI 카드뉴스 (2026.05)',
              }} />
              </WhelkHypothesisCard>

              <WhelkHypothesisCard reason="KFDA 원자료 아카이브 미보유">
            <WidgetCard title="헬시플레저 시대 — 골뱅이 영양 경쟁력 벤치마크" icon={Activity} iconColor="var(--color-success)" pillar="S4"
              cardDesc="실측 데이터 없음 — 식품의약품안전처 원자료 아카이브를 보유하지 않음"
              telemetry={{ status: 'STATIC', syncDate: 'KFDA 2024 기준' }} chartHeight={300}
              chart={
                <BarChart data={nutritionBenchmarkData} margin={{ top: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="item" tick={{ fill: '#f8fafc', fontSize: 10 }} angle={0} textAnchor="middle" height={55} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="protein" name="단백질(g)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fat" name="지방(g)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="iron" name="철분(mg)" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
                </BarChart>
              }
              takeaway={{
                situation: <span>[KMI 헬시플레저] 골뱅이는 100g당 82kcal, 단백질 18.2g, 지방 0.8g으로 닭가슴살보다 낮은 칼로리에 3배 이상의 철분을 보유한 '숨은 슈퍼푸드'입니다.</span>,
                actionPlan: <span>골뱅이(자숙)의 영양 프로필은 헬시플레저 트렌드의 핵심 지표에서 경쟁 식품을 압도합니다. 칼로리 82kcal(닭가슴살 109kcal 대비 -25%), 지방 0.8g(소등심 15.0g 대비 -95%), 철분 3.2mg(닭가슴살 0.7mg 대비 4.5배)을 보유합니다. 마케팅팀은 '다이어트 안주의 혁명'이라는 포지셔닝으로 피트니스 인플루언서 협업 캠페인을 전개하고, 제품 패키지에 '82kcal 슈퍼프로틴' 배지를 전면 부착해야 합니다. 특히 여성 1인 가구 타겟의 '단백질 간식' 카테고리 진입이 가장 높은 ROI를 보일 것입니다.</span>,
                source: 'KFDA 2024 식품성분표',
              }} />
              </WhelkHypothesisCard>
            </WhelkHypothesisSection>
      </>)}
      {activePart === 'S5' && (<>
        {/* Pillar 5: ESG & 지속가능성 */}
        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <Leaf size={20} color="var(--color-success)" />
    <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>❺ ESG 및 지속가능성</h2>
  </div>
  <>
            <WidgetCard title="흑해산 R. venosa 공급 안정성 트렌드" icon={Ship} iconColor="var(--color-info)" pillar="S3"
              cardDesc="튀르키예·불가리아·루마니아 흑해산 R. venosa 어획 추이"
              telemetry={{ status: 'STATIC', syncDate: 'FAO FishStat 2022' }} chartHeight={300}
              chart={
                <BarChart data={blackSeaSupplyData} margin={{ top: 10 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '톤', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="turkey" name="튀르키예" fill="var(--color-info)" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="bulgaria" name="불가리아" fill="var(--color-warning)" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="romania" name="루마니아" fill="var(--color-success)" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              }
              takeaway={{
                situation: <span>[FAOSTAT] 흑해산 R. venosa(뿔고둥)는 튀르키예가 연간 4,000~4,500톤을 안정적으로 생산하며, 영국산 B. undatum의 유일한 대규모 대체 공급원입니다.</span>,
                actionPlan: <span>흑해산 R. venosa는 총사용원가(TCU) 기준으로 영국산 대비 15~20% 저렴하며, 맛과 식감이 유사하여 통조림 가공 적합성이 높습니다. 다만 불가리아(-31%)와 루마니아(-32%)의 어획량이 꾸준히 감소 중이므로, 사실상 튀르키예 단일 의존 구조입니다. 조달팀은 튀르키예 이스탄불 소재 대형 벤더(3곳)와 장기 공급계약(2~3년)을 체결하여 물량을 선제 확보하고, 한-튀르키예 FTA 발효 시 관세 인하 효과를 극대화할 전략을 준비해야 합니다.</span>,
                source: 'FAO FishStat Capture 2022 (흑해 R. venosa 어획)',
              }} />

            <WidgetCard title="환율 1,500원 비상 경보 시스템" icon={AlertTriangle} iconColor="#dc2626" pillar="S3"
              cardDesc="USD/KRW 구간별 자동 경보 + 단계별 대응 매뉴얼"
              telemetry={{ status: 'STATIC', syncDate: '2026-05-30 (환율 임계값 정의)' }}
              customBody={
                <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {fxAlertThresholds.map((t: any, i: number) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.color}40`, borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: t.color }}>{t.level}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>₩{t.min}~{t.max}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5 }}>대응: <strong style={{ color: t.color }}>{t.action}</strong></div>
                      <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${((t.max - 1200) / 500) * 100}%`, background: t.color, borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              }
              takeaway={{
                situation: <span>[한국은행] USD/KRW 환율이 2026년 5월 기준 1,480원대에 진입하며 '위험 구간(1,450~1,550)' 임계점에 접근했습니다. 골뱅이 원물의 100% 달러 결제 구조상 수입 원가에 직격탄입니다.</span>,
                actionPlan: <span>골뱅이 수입은 전량 USD 결제이므로, 환율 100원 상승 시 톤당 원화 매입가가 약 130만 원(+10%) 증가합니다. 현재 1,480원대는 '위험 구간' 진입 직전이며, 1,500원 돌파 시 즉시 긴급 선물환 계약(3~6개월물)을 체결해야 합니다. 재무팀은 현재 헤지 비율을 50%까지 즉시 상향하고, 1,550원 돌파 시에는 신규 발주 일시 중단 및 기존 재고 활용 전략으로 전환하는 비상 프로토콜을 가동해야 합니다.</span>,
                source: '한국은행 실시간 환율',
              }} />
            <WidgetCard title="환율 및 수입 단가 복합 변동성" icon={DollarSign} iconColor="var(--color-info)" pillar="S3"
              cardDesc="분기별 USD 단가 vs USD/KRW 환율 — 이중 타격(Double Whammy) 분석"
              telemetry={{ status: metaStatus, syncDate: metaSyncDate || 'KCS/한국은행 2026-05-15' }} chartHeight={300}
              chart={
                <ComposedChart data={fxCorrelationData}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="quarter" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis yAxisId="left" domain={[11, 13.5]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '$/kg', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[1200, 1450]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'USD/KRW', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="avgUnitPrice" name="평균수입단가($/kg)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="usdkrw" name="USD/KRW 환율" stroke="var(--color-danger)" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[KCS+BOK] 수입 단가(달러) 자체는 안정적이어도 환율이 오르면 실제 기업이 지불해야 하는 원화 결제액이 크게 늘어나 수익성이 악화됩니다.</span>,
                actionPlan: <span>2023년 1분기부터 2024년 4분기 시계열 분석 결과, 거시 경제의 최악의 시나리오인 'Double Whammy(이중 타격)' 현상이 확인됩니다. 영국산 원물 USD 단가가 $11.82에서 $12.75(+7.9%)로 인상된 것에 더해, 동기간 USD/KRW 환율마저 1,264원에서 1,400원(+10.8%)으로 수직 상승했습니다. 이로 인해 국내 수입사가 체감하는 원화 환산 매입 원가는 무려 20% 가까이 폭등했습니다. 재무 라인은 즉각 비상 경영 체제로 돌입하여 능동적인 <TermTooltip term="FX Forward 헤지" description="환변동 위험을 방어하기 위해 미래 특정 시점의 환율을 현재 시점에 사전 고정시키는 선도 계약." /> 및 통화 분산 스왑을 가동, 판관비 및 이익률 훼손을 방어하는 최후의 보루 역할을 수행해야 합니다.</span>,
                source: 'KCS / 한국은행',
              }} />

            <WidgetCard title="영국 현지 어획 규제 리스크 진단" icon={Shield} iconColor="var(--color-info)" pillar="S3"
              cardDesc="MCRS·쿼터제·IFCA 규제 — 영국 자원 보호주의 정책 위협 측정"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <RadarChart data={ukRegulatoryRadar} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="rgba(255,255,255,0.15)" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="리스크 수준" dataKey="value" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.25} strokeWidth={2} />
                  <RechartsTooltip content={<CustomTooltip />} />
                </RadarChart>
              }
              takeaway={{
                situation: <span>[IFCA/MMO] 영국 정부가 골뱅이 크기 규제(MCRS)를 강화하고 어획량을 통제하면서, 영국산 물량 조달에 차질이 빚어질 위험이 커지고 있습니다.</span>,
                actionPlan: <span>영국의 해양 규제 당국(<TermTooltip term="IFCA" description="영국 Inshore Fisheries and Conservation Authority. 해안 환경보존 및 어업 규제를 단속하는 핵심 부처." />)의 자국 수산자원 보호주의 정책이 골뱅이 공급망의 최대 뇌관으로 부상했습니다. 특히 <TermTooltip term="MCRS(최소보존규격)" description="Minimum Conservation Reference Size. 포획 허용 조개껍질 최소 크기. 상향 시 소형 어획 불가." />를 45mm에서 55mm로 기습 상향하려는 움직임은 단기 어획량을 20~30% 소멸시킬 수 있는 치명적 규제(리스크 점수, Risk Score 85)입니다. 또한 웨일스 지방을 기점으로 확산 조짐이 보이는 <TermTooltip term="ACL 쿼터제" description="Annual Catch Limit. 지역 단위 총 할당량 제한으로 수입사의 독과점 물량 확보를 막는 보호무역 장치." />는 해외 자본의 독점적 물량 싹쓸이를 원천 차단합니다. 해외 전략 파트는 현지 로비망 가동 및 현지 가공 공장 지분 투자를 통해 이러한 '규제 장벽'을 내부자 자격으로 우회하는 전략적 판단이 필요합니다.</span>,
                source: 'UK IFCA / MMO',
              }} />
          </>

        {/* Pillar 5 continued: 구조적 위협 & 기회 — 동일 Pillar 내 하위 블록 */}
  <>
            <WidgetCard title="1인 가구 혼술 트렌드 및 채널 수입량 변동" icon={ShoppingBag} iconColor="var(--color-success)" pillar="S4"
              cardDesc="냉동 자숙 골뱅이육 수입 +105% — 혼술 이코노미 구조적 전환"
              telemetry={{ status: metaStatus, syncDate: metaSyncDate || 'KCS 월별 통관 2026-05-15' }} chartHeight={300}
              chart={
                <ComposedChart data={importSurgeData}>
                  <ChartPatternDefs />
                  <defs>
                    <linearGradient id="colorSurge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '톤', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '$M', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="volume" name="수입량(톤)" stroke="var(--color-success)" fill="url(#colorSurge)" />
                  <Line yAxisId="right" type="monotone" dataKey="value" name="수입액($M)" stroke="var(--color-warning)" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[KCS/FishFocus] 1인 가구의 '혼술' 트렌드가 유행을 넘어 구조적 소비로 굳어지며, 냉동 조미 골뱅이의 수입량이 2배 넘게 급증했습니다.</span>,
                actionPlan: <span>2025년 2월 기준 냉동 자숙 골뱅이육 수입이 170톤(전년 동기 대비 +105%), 1~2월 누적 수입액 USD 4.95M(+84%)을 기록하며 역대 최고치를 경신했습니다. 이는 <TermTooltip term="혼술 이코노미" description="1인 가구와 홈술(집에서 마시는 술) 문화가 만든 소비 경제. 편의점 안주, 소포장 HMR 등 새로운 수요 창출의 원동력." /> 가 일시적 유행이 아닌 비가역적(Irreversible) 소비 구조 전환임을 입증합니다. 마케팅팀은 150g 소포장 '혼술 에디션'과 에어프라이어용 '마늘버터 골뱅이 키트' 등 채널 맞춤형 SKU를 Q3 성수기 전 선제 출시해야 합니다.</span>,
                source: 'KCS / FishFocus UK',
              }} />

            <WidgetCard title="원물 부산물(패각/내장) 업사이클링 순환 가치" icon={Recycle} iconColor="var(--color-success)" pillar="S5"
              cardDesc="가공 후 78% 폐기물 → 해양 콜라겐·바이오 세라믹 재자원화"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <BarChart data={byproductData} layout="vertical" margin={{ left: 30 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '중량 비율(%)', position: 'bottom', fill: '#94a3b8', offset: -5 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#f8fafc', fontSize: 11 }} width={90} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="ratio" name="중량 비율(%)" radius={[0, 4, 4, 0]}>
                    {byproductData.map((entry: any, index: number) => (<Cell key={`bp-${index}`} fill={entry.color} />))}
                  </Bar>
                </BarChart>
              }
              takeaway={{
                situation: <span>[MDPI] 원물을 가공할 때 버려지는 78%의 껍데기와 내장에서 고부가가치의 '해양 콜라겐'을 추출할 수 있어 새로운 수익 창출이 가능합니다.</span>,
                actionPlan: <span>골뱅이 원물의 78%는 껍질·내장·체액으로 폐기되지만, 이 부산물에서 <TermTooltip term="해양 콜라겐 펩타이드" description="Marine Collagen Peptide. 수산 부산물에서 효소 분해로 추출하는 저분자 단백질. 광우병 위험 없이 피부·관절 건강에 효과적이며, 할랄/코셔 인증이 용이." /> 를 추출할 수 있습니다. 아태 지역 해양 콜라겐 시장 규모는 $980M이며, 소·돼지 대비 종교적 제약이 없어 할랄/코셔 시장 진출이 용이합니다. 또한 껍질(CaCO₃)은 칼슘 보충제와 바이오 세라믹 원료로 활용 가능합니다. R&D 부서는 국내 바이오 스타트업과의 공동 연구 MOU를 통해 부산물 수익화 파이프라인을 구축해야 합니다.</span>,
                source: 'MDPI / ResearchGate',
              }} />

            <WidgetCard title="B2C 통조림 규격별 고형량(살코기) 투명성 비율" icon={Package} iconColor="var(--color-warning)" pillar="S4"
              cardDesc="300g 캔의 실제 살코기 40~50% — 투명성 마케팅 차별화"
              telemetry={{ status: 'STATIC', syncDate: '2024년 기준' }} chartHeight={300}
              chart={
                <BarChart data={solidContentData} margin={{ top: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="brand" tick={{ fill: '#f8fafc', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis domain={[0, 320]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'g', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="solid" name="고형량(살)" stackId="a" fill="var(--color-success)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="liquid" name="조미액" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              }
              takeaway={{
                situation: <span>[aT FIS] 일반적인 300g 캔 제품의 절반 이상이 국물(조미액)이며, 실제 골뱅이 살코기는 40~50% 수준에 불과합니다.</span>,
                actionPlan: <span>300g 골뱅이 통조림에서 실제 <TermTooltip term="고형량" description="Solid weight. 통조림 내 액상액(조미액)을 제외한 순수 고기 무게. 소비자가 실제 먹게 되는 골뱅이 살의 양." /> 은 120~150g(40~50%)에 불과하며, 나머지는 간장 기반 조미액입니다. '헬시 플레저' 트렌드와 고물가 시대의 합리적 소비 심리가 맞물리면, 고형량 비율이 낮은 브랜드는 소비자 신뢰를 급격히 잃을 수 있습니다. 선제적으로 '고형량 65%+' 프리미엄 라인을 출시하고, 패키지 전면에 고형량 비율을 대형 표기하는 '투명성 마케팅'이 차별화 전략의 핵심입니다.</span>,
                source: 'aT FIS 식품산업통계',
              }} />

            <WidgetCard title="해수온 상승에 따른 조업지 이탈 기후 리스크" icon={Thermometer} iconColor="var(--color-danger)" pillar="S1"
              cardDesc="북대서양 해수면 온도(SST) + 영국·캐나다 어획량 — 포스트 영국(Post-UK) 대비"
              telemetry={{ status: 'STATIC', syncDate: '2026 기후 시뮬레이션' }} chartHeight={300}
              chart={
                <ComposedChart data={climateRiskData}>
                  <ChartPatternDefs />
                  <defs>
                    <linearGradient id="colorUkCatch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCaCatch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={0} textAnchor="middle" height={60} />
                  <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '어획량(톤)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[9, 15]} tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'SST(°C)', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="ukCatch" name="영국 어획(톤)" stroke="var(--color-info)" fill="url(#colorUkCatch)" />
                  <Area yAxisId="left" type="monotone" dataKey="canadaCatch" name="캐나다 어획(톤)" stroke="var(--color-danger)" fill="url(#colorCaCatch)" />
                  <Line yAxisId="right" type="monotone" dataKey="sst" name="북대서양 수온(°C)" stroke="var(--color-warning)" strokeWidth={3} dot={{ r: 5, fill: 'var(--color-warning)' }} />
                </ComposedChart>
              }
              takeaway={{
                situation: <span>[IPCC/FAOSTAT] 바닷물 온도가 높아지면 찬물에 사는 골뱅이가 서식지를 떠나버립니다. 캐나다에서는 이미 수온 상승으로 어획량이 크게 줄어들었습니다.</span>,
                actionPlan: <span>골뱅이 공급망의 진짜 적은 경쟁사가 아니라 '기후변화'입니다. 냉수성 저서생물인 B. undatum은 <TermTooltip term="SST" description="Sea Surface Temperature. 해수면 온도. 북대서양 수온이 15°C를 넘으면 골뱅이의 서식지 이탈과 산란율 급감이 시작됨." /> 15°C를 넘으면 서식지를 이탈하며, 이미 캐나다에서 이 시나리오가 현실화되어 어획량이 -74% 붕괴했습니다. IPCC 예측에 따르면 현재 한국 수입의 52%를 차지하는 영국 북해도 수온이 2035년까지 1.5~2°C 상승할 전망이며, 이는 10년 내 영국산 물량이 연간 10~15%씩 자연 감소할 수 있음을 의미합니다. 전략기획실은 '포스트-영국(Post-UK)' 시대를 대비하여 아이슬란드·노르웨이 등 고위도 신규 어장 개척과 흑해(튀르키예) R. venosa의 총사용원가(TCU) 기반 경제성 재평가를 즉각 병행해야 합니다.</span>,
                source: 'IPCC / FAOSTAT',
              }} />
          </>

            <WhelkHypothesisSection count={3}>
              <WhelkHypothesisCard reason="EU 포장 규제 수치 원자료 미보유">
            {/* W23: EU 포장규제 리스크 */}
            <WidgetCard title="EU PPWR 포장규제 컴플라이언스 리스크" icon={Recycle} iconColor="var(--color-warning)" pillar="S5"
              cardDesc="실측 데이터 없음 — EU 포장 규제 수치 원자료를 보유하지 않음"
              telemetry={{ status: 'STATIC', syncDate: 'KMI 2026.03' }}
              customBody={
                <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {euPackagingRiskData.map((d: any, i: number) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: d.value >= 70 ? 'var(--color-danger)' : d.value >= 50 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                        {d.value}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.3 }}>{d.axis}</div>
                      <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', marginTop: '6px' }}>
                        <div style={{ height: '100%', width: `${d.value}%`, background: d.value >= 70 ? 'var(--color-danger)' : d.value >= 50 ? 'var(--color-warning)' : 'var(--color-success)', borderRadius: '2px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              }
              takeaway={{
                situation: <span>[KMI 카드뉴스] EU가 2025년부터 시행하는 PPWR(포장폐기물규정)은 재활용 비율 의무화(80점)와 EPR 비용 부담 증가(70점)가 골뱅이 캔 수출에 직접적 비용 상승 요인입니다.</span>,
                actionPlan: <span>EU PPWR의 핵심 리스크는 2030년까지 식품 포장재 재활용 비율 70% 의무화입니다. 현재 골뱅이 캔(주석도강판)의 재활용률은 이미 85%로 양호하나, 내부 코팅재(BPA 프리 전환)와 라벨 접착제의 재활용 적합성 인증이 추가로 필요합니다. 또한 EPR(생산자 책임 확대) 비용이 캔당 €0.02~0.05 증가 예상됩니다. 품질관리팀은 EU 수출용 포장재의 PPWR 적합성 사전 인증을 26Q4까지 완료하고, 의도하지 않은 비스페놀 A(BPA-NI) 코팅으로의 전환 계획을 수립해야 합니다.</span>,
                source: 'KMI / EU PPWR',
              }} />
              </WhelkHypothesisCard>

              <WhelkHypothesisCard reason="골뱅이 PFAS 수치 원자료 미보유">
            {/* W24: PFAS 식품안전 매트릭스 */}
            <WidgetCard title="PFAS(과불화화합물) 차세대 식품안전 리스크" icon={FlaskConical} iconColor="var(--color-warning)" pillar="S5"
              cardDesc="실측 데이터 없음 — 골뱅이 PFAS 수치 원자료를 보유하지 않음"
              telemetry={{ status: 'STATIC', syncDate: 'KFAS 2024' }} chartHeight={280}
              chart={
                <BarChart data={pfasRiskData} layout="vertical" margin={{ left: 40 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'ng/g', position: 'bottom', fill: '#94a3b8', offset: -5 }} />
                  <YAxis dataKey="species" type="category" tick={{ fill: '#f8fafc', fontSize: 10 }} width={100} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="pfos" name="PFOS(ng/g)" fill="var(--color-danger)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="pfoa" name="PFOA(ng/g)" fill="var(--color-warning)" radius={[0, 4, 4, 0]} />
                </BarChart>
              }
              takeaway={{
                situation: <span>[KFAS 군산연안 연구] 골뱅이(복족류)의 PFOS 수치(0.42 ng/g)는 EU 기준(1.0 ng/g) 이하로 '주의' 수준이나, 담치·굴 등 이매패류는 이미 기준을 초과하여 규제 강화 시 연쇄 영향이 우려됩니다.</span>,
                actionPlan: <span>PFAS는 '영원한 화학물질(Forever Chemicals)'로 불리며, EU가 2025년부터 수산물 PFOS/PFOA 모니터링을 의무화했습니다. 골뱅이는 현재 안전 범위이나, PFAS는 해양 환경에서 생물농축되므로 향후 규제 기준 강화(0.5 ng/g으로 하향) 시 '주의→초과'로 격상될 위험이 있습니다. 품질관리팀은 분기별 PFAS 모니터링 프로토콜을 신설하고, 원산지별(영국/튀르키예/아일랜드) PFAS 농도 프로파일을 확보하여 선제적 리스크 맵을 구축해야 합니다.</span>,
                source: 'KFAS 군산연안 연구',
              }} />
              </WhelkHypothesisCard>

              <WhelkHypothesisCard reason="시장 규모·성장률 원자료 미보유">
            {/* W28: 할랄 해양콜라겐 시장 */}
            <WidgetCard title="할랄 인증 해양콜라겐 — 글로벌 시장 기회" icon={Globe} iconColor="var(--color-success)" pillar="S5"
              cardDesc="실측 데이터 없음 — 시장 규모와 성장률 원자료를 보유하지 않음"
              telemetry={{ status: 'STATIC', syncDate: 'KMI 2026.04' }} chartHeight={280}
              chart={
                <BarChart data={halalCollagenData} margin={{ top: 20 }}>
                  <ChartPatternDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="region" tick={{ fill: '#f8fafc', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: '$M', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="marketSize" name="시장 규모($M)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="halalShare" name="할랄 비중(%)" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              }
              takeaway={{
                situation: <span>[KMI 할랄인증] 동남아시아의 할랄 인증 의무화(BPJPH)로 수산물 부산물 기반 해양 콜라겐의 수출 기회가 급부상하고 있습니다. 중동/북아프리카의 할랄 비중은 95%입니다.</span>,
                actionPlan: <span>골뱅이 부산물에서 추출하는 해양 콜라겐 펩타이드는 소·돼지 원료 대비 '할랄/코셔 프리미엄'을 갖습니다. 중동·북아프리카($420M, 할랄 95%), 동남아($310M, 할랄 72%) 시장은 연 10~12% 성장 중이며, 인도네시아의 BPJPH 할랄 의무화는 한국산 수산물 부산물 콜라겐의 진입 기회입니다. R&D 부서는 할랄 인증(JAKIM/BPJPH) 취득을 위한 가공 공정 분리를 검토하고, 코스메슈티컬(기능성 화장품) 및 건강기능식품 채널을 타겟으로 2027년 출시를 목표로 해야 합니다.</span>,
                source: 'KMI 할랄인증',
              }} />
              </WhelkHypothesisCard>
            </WhelkHypothesisSection>
      </>)}

        {/* KFAS 학술 연구 인텔리전스 위젯 (동적 렌더링, 모든 pillar 공통 표시) */}
        {kfasWidgets.length > 0 && (
          <>
            <div style={{ gridColumn: '1 / -1', marginTop: '2rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Dna size={20} color="#8b5cf6" />
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#f8fafc' }}>KFAS 학술 연구 인텔리전스</h2>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(139,92,246,0.15)', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>
                국립수산과학원 검증 · {kfasWidgets.length}개 위젯
              </span>
            </div>
            {kfasWidgets.map((widget: any) => (
              <WidgetCard key={widget.id}
                title={widget.title?.replace(/^🔬\s*/, '')}
                icon={Dna} iconColor="#8b5cf6"
                pillar={(widget.pillar || 'S5') as any}
                cardDesc={widget.subtitle || '국립수산과학원 검증 학술 연구'}
                telemetry={{ status: 'STATIC', syncDate: 'KFAS 2024' }}
                chartHeight={300}
                chart={
                  widget.data && widget.data.length > 0 ? (
                    <BarChart data={widget.data} margin={{ top: 10 }}>
                      <ChartPatternDefs />
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey={widget.xKey} tick={{ fill: '#f8fafc', fontSize: 10 }} interval={0} angle={0} textAnchor="middle" height={55} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                      {widget.bars?.map((bar: any, bi: number) => (
                        <Bar key={bi} dataKey={bar.key} name={bar.name?.slice(0, 15)} fill={bar.color} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  ) : undefined
                }
                takeaway={{
                  situation: <span>{widget.sit?.slice(0, 300)}{widget.sit?.length > 300 ? '…' : ''}</span>,
                  actionPlan: <span>{widget.strat?.slice(0, 300)}{widget.strat?.length > 300 ? '…' : ''}</span>,
                  source: widget.source || 'KFAS 한국수산과학회지',
                }}
              />
            ))}
          </>
        )}

      </div>
    </div>
  );
}
