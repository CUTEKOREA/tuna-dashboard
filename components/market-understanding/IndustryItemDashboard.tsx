/**
 * 공통 품목 라우트 `/industry/[key]` — 전용 페이지가 없는 품목(농축산 36·갈치·주꾸미·연어)을 하나로 그린다.
 *
 * 품목별 컴포넌트를 만들지 않는다. 손 작성은 0이다.
 *  - 서술·표: 원문(`docs/evidence/industry-<key>-2026-10/보고서.html`)에서 추출한 JSON
 *    (`build_report_tables.py`·`build_report_prose.py`·`build_report_figures.py`).
 *  - 단계: 1절=1단계(부록 제외). 제목은 원문 h2 부제 그대로, 질문은 없다.
 *  - 히어로: 원문 표지 cover-facts 타일 그대로(`hub_v1.json`).
 *  - 예외: 돼지고기는 옛 /pork 위젯 11개를 단계 끝 「근거」로 싣는다(`PorkLegacySlots`).
 *
 * 품목이 39개라 JSON 을 정적 import 하면 번들이 수 MB 붙는다. 화면이 열릴 때 그 품목 것만 받는다.
 */
'use client';

import React, { useEffect, useState } from 'react';

import { proseBriefing, proseStages } from '@/lib/company-prose-stages';
import { registerReportIntake as registerFigures } from '@/lib/data/company-report-figures';
import { proseForStage, registerReportIntake as registerProse } from '@/lib/data/company-report-prose';
import { registerReportIntake as registerTables } from '@/lib/data/company-report-tables';
import type { IndustryItem } from '@/lib/data/industry-registry';
import type { HeroKpi } from '../v2/HeroZone';
import CommodityIndustryDashboard, { type CommoditySpec } from './CommodityIndustryDashboard';
import { dropEmptyLabel, industryInlineReport, ReportTableView } from './IndustryReportFlow';
import { PORK_CHART_SLOTS } from './PorkLegacySlots';
import MarketRegimeBand from './MarketRegimeBand';
import styles from './TunaIndustryDashboard.module.css';

const MARKET_REGIME_KEYS = new Set(['corn', 'garlic']);

function withMarketRegimeBand(spec: CommoditySpec, commodityKey: string): CommoditySpec {
  if (!MARKET_REGIME_KEYS.has(commodityKey)) return spec;
  const AfterHero = () => <MarketRegimeBand commodityKey={commodityKey} />;
  return {
    ...spec,
    insets: { ...spec.insets, AfterHero },
  };
}

export const INDUSTRY_ITEM_ACCENT = '#0e7490';

/** 옛 전용 화면의 손 작성 위젯을 원문 단계 끝 「근거」로 옮긴 품목(돼지고기 ← 옛 /pork). */
const LEGACY_CHART_SLOTS: Record<string, CommoditySpec['chartSlots']> = { pork: PORK_CHART_SLOTS };

export interface IndustryReportData {
  tables: unknown;
  prose: unknown;
  figures: unknown;
}

/** 히어로: 표지 앞 네 타일은 수치, 뒤 타일은 띠. 글자는 원문 그대로다. */
export function industryHero(item: IndustryItem): Pick<CommoditySpec, 'primaryKpi' | 'secondaryKpis' | 'stripItems'> {
  const kpis: HeroKpi[] = item.facts.slice(0, 4).map((f, i) => ({
    label: f.k,
    value: 0,
    text: f.v,
    unit: f.n,
    ...(i === 0 ? { accent: INDUSTRY_ITEM_ACCENT } : {}),
  }));
  return {
    primaryKpi: kpis[0],
    secondaryKpis: kpis.slice(1),
    stripItems: item.facts.slice(4).map((f) => ({ eyebrow: f.k, title: f.v, body: f.n })),
  };
}

/** 받은 JSON 을 등록하고 페이지 스펙을 만든다. 테스트도 이 함수를 그대로 부른다. */
export function buildIndustryItemSpec(item: IndustryItem, data: IndustryReportData): CommoditySpec {
  registerTables(item.key, data.tables);
  registerProse(item.key, data.prose);
  registerFigures(item.key, data.figures);

  const telemetry = { status: 'STATIC' as const, syncDate: `보고서 ${item.edition}` };
  const narratives = proseStages(item.key).map((stage) => {
    const head = proseForStage(item.key, stage.key)[0];
    return industryInlineReport(item.key, {
      ...stage,
      title: head?.subtitle ?? stage.title,
      question: '',
      paragraphs: stage.paragraphs.map(dropEmptyLabel),
      flow: stage.flow?.map((f) => (f.kind === 'head' ? { ...f, text: dropEmptyLabel(f.text) } : f)),
    }, {
      telemetry,
      source: item.title,
      renderTable: (table) => <ReportTableView table={table} />,
    });
  });

  return {
    continuous: true,
    key: item.key,
    reportHref: item.report,
    title: item.name,
    subtitle: `${item.title} · ${item.edition}`,
    accent: INDUSTRY_ITEM_ACCENT,
    ...industryHero(item),
    briefing: proseBriefing(item.key, { firstBlock: true }),
    narratives,
    chartSlots: LEGACY_CHART_SLOTS[item.key] ?? {},
    sourceNotes: [],
    sourceMeta: `본문·표 · ${item.title} ${item.edition}${LEGACY_CHART_SLOTS[item.key] ? ' · 옛 화면 근거 위젯' : ''}`,
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}

export default function IndustryItemDashboard({ item }: { item: IndustryItem }) {
  const [state, setState] = useState<{ key: string; spec?: CommoditySpec; error?: string } | null>(null);

  useEffect(() => {
    let alive = true;
    const base = `/data/companies/${item.key}`;
    Promise.all([
      fetchJson(`${base}_tables_v1.json`),
      fetchJson(`${base}_prose_v1.json`),
      fetchJson(`${base}_figures_v1.json`),
    ])
      .then(([tables, prose, figures]) => {
        if (alive) {
          const spec = buildIndustryItemSpec(item, { tables, prose, figures });
          setState({ key: item.key, spec: withMarketRegimeBand(spec, item.key) });
        }
      })
      .catch((e: unknown) => {
        if (alive) setState({ key: item.key, error: String(e) });
      });
    return () => {
      alive = false;
    };
  }, [item]);

  if (state?.key === item.key && state.spec) return <CommodityIndustryDashboard spec={state.spec} />;
  if (state?.key === item.key && state.error) {
    return (
      <p role="alert" className={styles.reportLink}>
        보고서 자료를 불러오지 못했다 ({state.error}). <a href={item.report} target="_blank" rel="noopener noreferrer">보고서 원문 보기</a>
      </p>
    );
  }
  return <p className={styles.reportLink} aria-busy="true">{item.name} 보고서를 불러오는 중…</p>;
}
