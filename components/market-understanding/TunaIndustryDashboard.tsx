/**
 * 「시장 이해 > 참치」 — 참치 산업 해부
 *
 * 「실시간 운영」이 지금 얼마인지를 감시한다면, 이 페이지는 **왜 이런 구조인지**를 설명한다.
 * 그래서 본체가 차트가 아니라 서술이고, 차트는 서술의 근거로 붙는다.
 *
 * 구성
 *  - 히어로: 산업의 크기 세 숫자
 *  - 30초 브리핑: 스크롤하지 않을 사람을 위한 출구
 *  - 분기도: 어법에서 갈린 두 경로가 소비까지 이어지는 그림
 *  - 사슬 7단계 + 횡단 3축: 각 단계는 서술 → 검증 수치 → 차트 순
 *  - 출처와 한계: 무엇을 확인했고 무엇을 확인 못 했는지
 *
 * 모든 수치의 근거는 `docs/2026-08-16_tuna_valuechain_sources.md`.
 */
'use client';

import React, { useMemo, useState } from 'react';
import { BookOpen, Fish } from 'lucide-react';

import {
  getChainStages,
  getCrossStages,
  getTunaCatchData,
  getTunaIndustryWidgetsMeta,
  type IndustryStage,
} from '@/lib/data/tuna-industry';
import {
  BRIEFING_POINTS,
  getNarrative,
  SOURCE_NOTES,
  type FactRow,
  type StageNarrative,
} from '@/lib/tuna-industry-content';
import { TelemetryBadge } from '../TelemetryBadge';
import TermTooltip from '../TermTooltip';
import WidgetCard from '../WidgetCard';
import HeroZone from '../v2/HeroZone';
import PillTabs, { type PillTab } from '../v2/PillTabs';
import {
  AreaRankChart,
  CountryRankChart,
  KoreaSpeciesChart,
  KoreaTrendChart,
  RfmoShareChart,
  SpeciesShareChart,
  SpeciesTimelineChart,
} from './TunaCatchCharts';
import TunaIndustryChart from './TunaIndustryChart';
import ValueChainSpine from './ValueChainSpine';
import styles from './TunaIndustryDashboard.module.css';

const CATCH = getTunaCatchData();
const CHAIN_STAGES = getChainStages();
const CROSS_STAGES = getCrossStages();
const ALL_STAGES: IndustryStage[] = [...CHAIN_STAGES, ...CROSS_STAGES];
const WIDGETS_META = getTunaIndustryWidgetsMeta();

/** 이 단계에 FishStat 전용 차트를 몇 개 얹을지 — 단계별 편집 결정이다. */
const CATCH_CHART_SLOTS: Record<string, { title: string; caption: string; render: () => React.ReactNode }[]> = {
  s01: [
    {
      title: '관할 기구별 어획량 (톤)',
      caption:
        'FAO 주요어업해역을 관할 RFMO로 묶어 집계했다. 남방참다랑어를 어종 단위로 관리하는 CCSBT는 해역이 겹치므로 별도 항목이 없다.',
      render: () => <RfmoShareChart data={CATCH} />,
    },
    {
      title: '해역별 어획량 상위 8곳 (톤)',
      caption: '색은 관할 기구를 나타낸다. 서·중부태평양 한 곳이 전체의 46.55%다.',
      render: () => <AreaRankChart data={CATCH} />,
    },
  ],
  s02: [
    {
      title: '어종별 어획량 (톤)',
      caption: '가다랑어 한 종이 전체의 57.98%다. 참다랑어 3종을 합쳐도 1.38%에 그친다.',
      render: () => <SpeciesShareChart data={CATCH} />,
    },
    {
      title: '어종별 어획량 20년 추이 (톤)',
      caption: '총량은 늘었지만 어종 구성비는 거의 변하지 않았다. 어법 구조가 고정돼 있다는 뜻이다.',
      render: () => <SpeciesTimelineChart data={CATCH} />,
    },
    {
      title: '국가별 어획량 상위 12 (톤)',
      caption: '붉은 막대가 대한민국이다. 주요 상업어종 7종 기준 5위다.',
      render: () => <CountryRankChart data={CATCH} />,
    },
  ],
  x03: [
    {
      title: '한국 어획량과 세계 점유율 20년',
      caption: '막대는 어획량(톤), 선은 세계 점유율(%)이다. 물량이 늘어도 점유율은 5%대에서 움직인다.',
      render: () => <KoreaTrendChart data={CATCH} />,
    },
    {
      title: '한국 어종별 어획량 (톤)',
      caption:
        '가다랑어가 71%다. 통조림 원료 공급이 한국 원양의 본체라는 사실이 이 한 장에 들어 있다.',
      render: () => <KoreaSpeciesChart data={CATCH} />,
    },
  ],
};

/**
 * 서술 본문의 `**강조**` 구간만 굵게 만든다.
 * 마크다운 전체를 파싱하지 않는다 — 이 페이지가 쓰는 표기는 강조 하나뿐이고,
 * 파서를 들이면 콘텐츠에 HTML 을 흘려 넣을 수 있는 통로가 생긴다.
 */
function renderEmphasis(text: string): React.ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((chunk, index) =>
    index % 2 === 1 ? <strong key={index}>{chunk}</strong> : <React.Fragment key={index}>{chunk}</React.Fragment>,
  );
}

function FactTable({ rows }: { rows: FactRow[] }) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>
          본문에 인용한 수치와 출처. 등급 A는 기관 1차문서 원문 확인, B는 기관 2차 인용, C는 업계 매체다.
        </caption>
        <thead>
          <tr>
            <th scope="col">항목</th>
            <th scope="col">값</th>
            <th scope="col">기준</th>
            <th scope="col">출처</th>
            <th scope="col">등급</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.label}-${index}`}>
              <th scope="row">
                {row.label}
                {row.note ? <span className={styles.factNote}>{row.note}</span> : null}
              </th>
              <td className={styles.factValue}>{row.value}</td>
              <td>{row.asOf}</td>
              <td>{row.source}</td>
              <td>
                <span className={styles.grade} data-grade={row.grade}>
                  {row.grade}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StageSection({ stage, narrative }: { stage: IndustryStage; narrative: StageNarrative }) {
  const catchCharts = CATCH_CHART_SLOTS[stage.key] ?? [];

  return (
    <section className={styles.stage} aria-labelledby={`stage-${stage.key}`}>
      <header className={styles.stageHeader}>
        <span className={styles.stageNumeral}>{narrative.numeral}</span>
        <div>
          <h2 id={`stage-${stage.key}`} className={styles.stageTitle}>
            {narrative.title}
          </h2>
          <p className={styles.stageQuestion}>{narrative.question}</p>
        </div>
      </header>

      <p className={styles.lede}>{renderEmphasis(narrative.lede)}</p>

      <div className={styles.prose}>
        {narrative.paragraphs.map((paragraph, index) => (
          <p key={index}>{renderEmphasis(paragraph)}</p>
        ))}
      </div>

      {narrative.terms.length > 0 && (
        <div className={styles.termRow}>
          <span className={styles.termRowLabel}>용어</span>
          {narrative.terms.map((term) => (
            <span key={term.term} className={styles.termChip}>
              <TermTooltip term={term.term} description={term.description} />
            </span>
          ))}
        </div>
      )}

      <FactTable rows={narrative.facts} />

      {catchCharts.map((slot) => (
        <figure key={slot.title} className={styles.catchFigure}>
          <figcaption className={styles.catchCaption}>
            <strong>{slot.title}</strong>
            <span>{slot.caption}</span>
            <TelemetryBadge status="STATIC" syncDate={`${CATCH._meta.기준연도}년 확정`} />
          </figcaption>
          {slot.render()}
        </figure>
      ))}

      {stage.widgets.length > 0 && (
        <div className={styles.widgetGrid}>
          {stage.widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              title={widget.title}
              pillar={stage.pillar}
              cardDesc={widget.methodology ?? widget.source ?? undefined}
              unit={widget.unit ?? undefined}
              telemetry={{
                status: widget.telemetry,
                syncDate: widget.syncDate ?? undefined,
                source: widget.source ?? undefined,
              }}
              chart={<TunaIndustryChart widget={widget} />}
              chartHeight={280}
              takeaway={
                widget.situation && widget.takeaway
                  ? {
                      situation: widget.situation,
                      actionPlan: widget.takeaway,
                      source: widget.source ?? '출처 미표기',
                    }
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

export interface TunaIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function TunaIndustryDashboard({ heroOnly = false }: TunaIndustryDashboardProps) {
  const [activeKey, setActiveKey] = useState<string>(CHAIN_STAGES[0]?.key ?? 's01');

  const tabs: PillTab[] = useMemo(
    () =>
      ALL_STAGES.map((stage) => {
        const narrative = getNarrative(stage.key);
        return {
          key: stage.key,
          label: `${narrative?.numeral ?? ''} ${stage.label}`.trim(),
        };
      }),
    [],
  );

  const activeStage = ALL_STAGES.find((stage) => stage.key === activeKey) ?? ALL_STAGES[0];
  const activeNarrative = getNarrative(activeStage.key);

  const hero = (
    <HeroZone
      variant="kpi"
      title="참치 산업 해부"
      subtitle="바다에서 식탁까지 — 밸류체인 7단계와 그것을 관통하는 3개 축"
      primaryKpi={{
        label: '세계 주요 상업 참치 어획량',
        value: CATCH.요약.세계어획량,
        unit: '(톤)',
        accent: '#0e7490',
      }}
      secondaryKpis={[
        {
          label: '서·중부태평양 비중',
          value: CATCH.요약.최대해역비중 ?? 0,
          unit: '(%)',
          decimals: 2,
        },
        {
          label: '한국 어획량',
          value: CATCH.요약.한국어획량 ?? 0,
          unit: '(톤)',
        },
        {
          label: '주요 상업어종',
          value: CATCH.요약.어종수,
          unit: '(종)',
        },
      ]}
    />
  );

  if (heroOnly) return hero;

  return (
    <div className={styles.page} data-testid="tuna-industry-dashboard">
      {hero}

      <section className={styles.briefing} aria-labelledby="briefing-heading">
        <h2 id="briefing-heading" className={styles.briefingHeading}>
          <BookOpen size={16} aria-hidden="true" />
          30초 브리핑
        </h2>
        <p className={styles.briefingIntro}>
          아래로 내려가지 않아도 되는 사람을 위한 요약이다. 각 항목은 사슬의 한 단계에서 나온다.
        </p>
        <ol className={styles.briefingList}>
          {BRIEFING_POINTS.map((point) => (
            <li key={point.headline}>
              <strong>{point.headline}</strong>
              <span>{point.detail}</span>
            </li>
          ))}
        </ol>
      </section>

      <ValueChainSpine activeKey={activeKey} onSelect={setActiveKey} />

      <nav className={styles.tabNav} aria-label="밸류체인 단계 이동">
        <PillTabs
          tabs={tabs}
          activeKey={activeKey}
          onChange={setActiveKey}
          accentFrom="#0e7490"
          ariaLabel="밸류체인 단계"
          tabIdPrefix="tuna-industry-tab"
          panelIdPrefix="tuna-industry-panel"
        />
      </nav>

      {activeNarrative ? (
        <StageSection stage={activeStage} narrative={activeNarrative} />
      ) : (
        <p className={styles.missing}>이 단계의 서술이 아직 준비되지 않았습니다.</p>
      )}

      <section className={styles.sources} aria-labelledby="sources-heading">
        <h2 id="sources-heading" className={styles.sourcesHeading}>
          <Fish size={16} aria-hidden="true" />
          출처와 한계
        </h2>
        <ul className={styles.sourceList}>
          {SOURCE_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className={styles.sourceMeta}>
          어획 집계 · {CATCH._meta.출처} · 기준 {CATCH._meta.기준연도}년 · 갱신 {CATCH._meta.생성일}
          {' · '}
          위젯 {WIDGETS_META.선별} ({WIDGETS_META.원본})
        </p>
      </section>
    </div>
  );
}
