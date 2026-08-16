/**
 * 「시장 이해」 품목 페이지 공용 골격.
 *
 * 참치·오징어 두 페이지가 단계 렌더링 코드를 각자 들고 있었다. 오징어 파일에
 * “세 번째 품목이 생기면 그때 StageSection 을 빼내라”고 적어 뒀고, 고등어·골뱅이·새우가
 * 생겼으므로 여기로 뺐다. 참치·오징어는 선별 위젯·측정 게이트 같은 자기 사정이 있어
 * 그대로 뒀다 — 돌아가는 코드를 옮기는 것이 목적이 아니다.
 *
 * 이 셋의 공통 골격은 다음과 같다.
 *   히어로 → 30초 브리핑 → 단계 탭 → (서술 + 근거표 + 차트) → 출처와 한계
 *
 * 품목마다 다른 것은 `CommoditySpec` 하나로 받는다.
 */
'use client';

import React, { useMemo, useState } from 'react';
import { BookOpen, Waves } from 'lucide-react';

import { TelemetryBadge } from '../TelemetryBadge';
import TermTooltip from '../TermTooltip';
import HeroZone, { type HeroKpi } from '../v2/HeroZone';
import { HeroNowStrip, type HeroNowItem } from '../v2/HeroNowStrip';
import PillTabs, { type PillTab } from '../v2/PillTabs';
import styles from './TunaIndustryDashboard.module.css';

export type SourceGrade = 'A' | 'B' | 'C';

/** 본문에서 인용하는 검증된 수치 한 줄. */
export interface FactRow {
  label: string;
  /** 단위를 포함해 문자열로 고정한다(포맷 흔들림 방지) */
  value: string;
  asOf: string;
  source: string;
  grade: SourceGrade;
  note?: string;
}

export interface TermDef {
  term: string;
  description: string;
}

export interface StageNarrative {
  key: string;
  /** 사슬 단계는 '01'~, 횡단축은 'A'~ */
  numeral: string;
  title: string;
  question: string;
  lede: string;
  paragraphs: string[];
  facts: FactRow[];
  terms: TermDef[];
}

export interface ChartSlot {
  /** 서술이 「」로 지목하는 이름이다. 바꾸면 참조가 끊긴다(테스트가 잡는다) */
  title: string;
  caption: string;
  telemetry: { status: 'STATIC' | 'SYNCED' | 'LIVE'; syncDate: string };
  render: () => React.ReactNode;
}

export interface CommoditySpec {
  /** DOM id·testid 접두사 겸 data-commodity 값 */
  key: string;
  title: string;
  subtitle: string;
  /** 시그니처 그라디언트의 시작색 */
  accent: string;
  primaryKpi: HeroKpi;
  secondaryKpis: HeroKpi[];
  stripItems: HeroNowItem[];
  briefing: string[];
  narratives: StageNarrative[];
  chartSlots: Record<string, ChartSlot[]>;
  sourceNotes: string[];
  sourceMeta: string;
}

/** `**강조**` 만 해석한다. 마크다운 파서를 끌어올 이유가 없다. */
function renderEmphasis(text: string): React.ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((chunk, index) =>
    index % 2 === 1 ? (
      <strong key={index}>{chunk}</strong>
    ) : (
      <React.Fragment key={index}>{chunk}</React.Fragment>
    ),
  );
}

function FactTable({ rows }: { rows: FactRow[] }) {
  if (rows.length === 0) return null;
  return (
    <>
      <div className={styles.factWrap}>
        <table className={styles.factTable}>
          <caption className={styles.factCaption}>
            본문에 인용한 수치와 출처. 등급 A는 기관 1차문서·공식 통계 원문 확인, B는 기관 2차 인용, C는 업계 매체다.
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

      {/* 좁은 화면용 — 같은 데이터를 목록으로 낸다.
          표를 CSS 로 접으면 일부 브라우저에서 표 의미가 깨지므로 마크업을 따로 둔다. */}
      <ul className={styles.factList}>
        {rows.map((row, index) => (
          <li key={`m-${row.label}-${index}`}>
            <div className={styles.factHead}>
              <span className={styles.factLabel}>{row.label}</span>
              <span className={styles.grade} data-grade={row.grade}>
                신뢰 {row.grade}
              </span>
            </div>
            <p className={styles.factListValue}>{row.value}</p>
            <p className={styles.factMeta}>
              {row.asOf} · {row.source}
            </p>
            {row.note ? <p className={styles.factListNote}>{row.note}</p> : null}
          </li>
        ))}
      </ul>
    </>
  );
}

function StageSection({
  prefix,
  narrative,
  charts,
}: {
  prefix: string;
  narrative: StageNarrative;
  charts: ChartSlot[];
}) {
  return (
    <section className={styles.stage} aria-labelledby={`${prefix}-stage-${narrative.key}`}>
      <header className={styles.stageHeader}>
        <span className={styles.stageNumeral}>{narrative.numeral}</span>
        <div>
          <h2 id={`${prefix}-stage-${narrative.key}`} className={styles.stageTitle}>
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

      {charts.map((slot) => (
        <figure key={slot.title} className={styles.catchFigure}>
          <figcaption className={styles.catchCaption}>
            <strong>{slot.title}</strong>
            <span>{slot.caption}</span>
            <TelemetryBadge status={slot.telemetry.status} syncDate={slot.telemetry.syncDate} />
          </figcaption>
          {slot.render()}
        </figure>
      ))}
    </section>
  );
}

export interface CommodityIndustryDashboardProps {
  spec: CommoditySpec;
  heroOnly?: boolean;
}

export default function CommodityIndustryDashboard({
  spec,
  heroOnly = false,
}: CommodityIndustryDashboardProps) {
  const [activeKey, setActiveKey] = useState<string>(spec.narratives[0]?.key ?? '');

  const tabs: PillTab[] = useMemo(
    () =>
      spec.narratives.map((narrative) => ({
        key: narrative.key,
        label: `${narrative.numeral} ${narrative.title}`,
      })),
    [spec.narratives],
  );

  const active =
    spec.narratives.find((narrative) => narrative.key === activeKey) ?? spec.narratives[0];

  const hero = (
    <HeroZone
      variant="kpi"
      title={spec.title}
      subtitle={spec.subtitle}
      primaryKpi={spec.primaryKpi}
      secondaryKpis={spec.secondaryKpis}
      minHeight={360}
      strip={<HeroNowStrip items={spec.stripItems} />}
    />
  );

  if (heroOnly) return hero;

  return (
    <div
      className={styles.page}
      data-testid={`${spec.key}-industry-dashboard`}
      data-commodity={spec.key}
    >
      {hero}

      <section className={styles.briefing} aria-labelledby={`${spec.key}-briefing-heading`}>
        <h2 id={`${spec.key}-briefing-heading`} className={styles.briefingHeading}>
          <BookOpen size={16} aria-hidden="true" />
          30초 브리핑
        </h2>
        <p className={styles.briefingIntro}>
          아래로 내려가지 않아도 되는 사람을 위한 요약이다. 각 항목은 사슬의 한 단계에서 나온다.
        </p>
        <ol className={styles.briefingList}>
          {spec.briefing.map((point) => (
            <li key={point}>
              <span>{renderEmphasis(point)}</span>
            </li>
          ))}
        </ol>
      </section>

      <nav className={styles.tabNav} aria-label="밸류체인 단계 이동">
        <PillTabs
          tabs={tabs}
          activeKey={active?.key ?? ''}
          onChange={setActiveKey}
          accentFrom={spec.accent}
          ariaLabel="밸류체인 단계"
          tabIdPrefix={`${spec.key}-industry-tab`}
          panelIdPrefix={`${spec.key}-industry-panel`}
        />
      </nav>

      {active ? (
        <StageSection
          prefix={spec.key}
          narrative={active}
          charts={spec.chartSlots[active.key] ?? []}
        />
      ) : (
        <p className={styles.missing}>이 단계의 서술이 아직 준비되지 않았습니다.</p>
      )}

      <section className={styles.sources} aria-labelledby={`${spec.key}-sources-heading`}>
        <h2 id={`${spec.key}-sources-heading`} className={styles.sourcesHeading}>
          <Waves size={16} aria-hidden="true" />
          출처와 한계
        </h2>
        <ul className={styles.sourceList}>
          {spec.sourceNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className={styles.sourceMeta}>{spec.sourceMeta}</p>
      </section>
    </div>
  );
}
