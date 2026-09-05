/**
 * 「시장 이해」 품목 페이지 공용 골격.
 *
 * 참치·오징어 두 페이지가 단계 렌더링 코드를 각자 들고 있었다. 오징어 파일에
 * “세 번째 품목이 생기면 그때 StageSection 을 빼내라”고 적어 뒀고, 고등어·골뱅이·새우가
 * 생겼으므로 여기로 뺐다. 참치·오징어는 선별 위젯·측정 게이트 같은 자기 사정이 있어
 * 그대로 뒀다 — 돌아가는 코드를 옮기는 것이 목적이 아니다.
 *
 * 이 셋의 공통 골격은 다음과 같다.
 *   히어로 → 30초 브리핑 → 사슬 스테퍼 → (서술 + 근거 레일) → 출처와 한계
 *
 * 품목마다 다른 것은 `CommoditySpec` 하나로 받는다.
 */
'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import { ArrowRight, BookOpen, Waves } from 'lucide-react';

import { TelemetryBadge } from '../TelemetryBadge';
import TermTooltip from '../TermTooltip';
import HeroZone, { type HeroKpi } from '../v2/HeroZone';
import { HeroNowStrip, type HeroNowItem } from '../v2/HeroNowStrip';
import PillTabs, { type PillTab } from '../v2/PillTabs';
import { useStageKey } from './useStageKey';
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
  /**
   * 원문 순서. 있으면 `paragraphs` 대신 이것을 낸다 —
   * 서술과 표·그림이 **보고서에 있던 그 자리 그대로** 섞인다.
   * 표를 절 끝에 몰아 두면 그 표를 설명하는 문장과 멀어져 둘 다 안 읽힌다.
   * 순서는 추출기가 문자 오프셋(`ord`)으로 재구성한다.
   */
  flow?: FlowItem[];
}

/** 원문 순서의 한 조각. 글이거나, 그 자리에 있던 표·그림이다. */
export type FlowItem =
  | { kind: 'text'; ord: number; text: string }
  | { kind: 'head'; ord: number; text: string }
  | { kind: 'slot'; ord: number; slot: ChartSlot };

export interface ChartSlot {
  /** 서술이 「」로 지목하는 이름이다. 바꾸면 참조가 끊긴다(테스트가 잡는다) */
  title: string;
  caption: string;
  telemetry: { status: 'STATIC' | 'SYNCED' | 'LIVE'; syncDate?: string };
  render: () => React.ReactNode;
  /**
   * 배치. 표와 수십 년 시계열은 `full`(1열 1개).
   * 없으면 그래프 기본값 — 1열에 2개.
   */
  span?: 'full' | 'half';
  /**
   * 차트 아래 붙는 출처 한 줄. 큐레이션 위젯처럼 도형마다 출처가 다른 자료에 쓴다.
   * 페이지 하단 공통 출처로 뭉뚱그리면 어느 숫자가 어디서 왔는지 사라진다.
   */
  sourceLine?: string;
}

/**
 * 브리핑 한 줄. `stage` 는 이 줄이 나온 단계다 —
 * 요약을 읽다가 근거가 궁금해지면 그 단계로 바로 갈 수 있어야 한다.
 */
/**
 * 끼워 넣는 구역이 받는 것. 노드가 아니라 **컴포넌트 타입**으로 받는 이유가 있다 —
 * 렌더 중에 `spec.insets(...)` 처럼 함수를 부르면 그 안에서 ref 를 읽게 되고
 * (`go` 가 제목 ref 로 스크롤한다) React 규칙 위반이다. JSX 로 그리면 정상 경로다.
 */
export interface InsetProps {
  activeKey: string;
  go: (key: string) => void;
}

export interface BriefingPoint {
  stage: string;
  text: string;
  /**
   * 굵게 앞세우는 한 줄. 참치처럼 «결론 + 부연» 두 층으로 쓰는 품목이 있다.
   * 없으면 `text` 한 줄만 나온다 — 기존 품목의 화면은 그대로다.
   */
  headline?: string;
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
  briefing: BriefingPoint[];
  narratives: StageNarrative[];
  /**
   * 단계를 하나씩 넘기지 않고 **문서 순서 그대로 이어서** 렌더한다.
   * 기업 해부 카드용이다 — 거기서 「단계」는 밸류체인이 아니라 조사보고서의 절이고,
   * 절을 한 번에 하나씩 보여 주면 13번 눌러야 한 편을 읽는다. 탭은 이동 수단으로 남는다.
   * 품목 대시보드(참치·오징어)는 이 값을 주지 않으므로 종전대로 페이저다.
   */
  continuous?: boolean;
  chartSlots: Record<string, ChartSlot[]>;
  sourceNotes: string[];
  sourceMeta: string;
  /**
   * 품목 고유 구역을 끼우는 자리. 참치는 탭 아래에 밸류체인 척추를, 단계 아래에
   * 약어 사전을 둔다.
   *
   * 자리마다 이름 붙은 prop 을 따로 만들지 않고 하나로 모은 이유는, 그렇게 하면
   * 품목이 늘 때마다 골격의 표면이 넓어지기 때문이다. 여기 들어오는 것은 골격이
   * 뜻을 모르는 덩어리이고, 골격은 위치만 안다.
   */
  insets?: {
    /** 탭 아래. 참치의 밸류체인 척추처럼 단계 상태가 필요한 내비가 여기 온다. */
    AfterTabs?: React.ComponentType<InsetProps>;
    /** 단계와 출처 사이. 참치의 약어 사전. */
    AfterStage?: React.ComponentType<InsetProps>;
  };
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

function ChartFigure({ slot }: { slot: ChartSlot }) {
  return (
    <figure className={styles.catchFigure} data-span={slot.span === 'full' ? 'full' : 'half'}>
      <figcaption className={styles.catchCaption}>
        <div className={styles.catchTitleRow}>
          <strong>{slot.title}</strong>
          <TelemetryBadge
            variant="caption"
            status={slot.telemetry.status}
            syncDate={slot.telemetry.syncDate}
          />
        </div>
        <span>{slot.caption}</span>
      </figcaption>
      <div className={styles.chartFrame}>{slot.render()}</div>
      {slot.sourceLine && (
        <figcaption className={styles.catchSourceLine}>{slot.sourceLine}</figcaption>
      )}
    </figure>
  );
}

function StageSection({
  prefix,
  narrative,
  charts,
  next,
  onGo,
  headingRef,
}: {
  prefix: string;
  narrative: StageNarrative;
  charts: ChartSlot[];
  next?: StageNarrative;
  onGo: (key: string) => void;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
}) {
  // 2026-08-17 사용자 지시: 차트는 전부 사실표 아래로 — 본문 위 근거 레일 폐지
  const rest = charts;

  return (
    <section className={styles.stage} aria-labelledby={`${prefix}-stage-${narrative.key}`}>
      <header className={styles.stageHeader}>
        <span className={styles.stageNumeral}>{narrative.numeral}</span>
        <div>
          <h2
            id={`${prefix}-stage-${narrative.key}`}
            className={styles.stageTitle}
            ref={headingRef}
            tabIndex={-1}
          >
            {narrative.title}
          </h2>
          <p className={styles.stageQuestion}>{narrative.question}</p>
        </div>
      </header>

      <p className={styles.lede}>{renderEmphasis(narrative.lede)}</p>

      {narrative.facts[0] && (
        <p className={styles.keyFact}>
          <span className={styles.keyFactValue}>{narrative.facts[0].value}</span>
          <span className={styles.keyFactLabel}>{narrative.facts[0].label}</span>
        </p>
      )}

      {narrative.flow ? (
        <div className={styles.prose}>
          {narrative.flow.map((item, index) => {
            if (item.kind === 'text') return <p key={index}>{renderEmphasis(item.text)}</p>;
            if (item.kind === 'head') return <h3 key={index} className={styles.flowHeading}>{item.text}</h3>;
            return (
              <div key={index} className={styles.flowSlot}>
                <ChartFigure slot={item.slot} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.prose}>
          {narrative.paragraphs.map((paragraph, index) => (
            <p key={index}>{renderEmphasis(paragraph)}</p>
          ))}
        </div>
      )}

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

      {rest.length > 0 && (
        <div className={styles.stageMore}>
          <h3 className={styles.stageMoreHeading}>근거</h3>
          <div className={rest.length >= 2 ? styles.catchGrid : styles.catchStack}>
            {rest.map((slot) => (
              <ChartFigure key={slot.title} slot={slot} />
            ))}
          </div>
        </div>
      )}

      {/* 단계 끝에서 다음으로 넘기는 손잡이. 이것이 없으면 01단계에서 읽기가 끝난다. */}
      {next && (
        <button type="button" className={styles.stageNext} onClick={() => onGo(next.key)}>
          <span className={styles.stageNextLabel}>다음</span>
          <span className={styles.stageNextTitle}>
            {next.numeral} {next.title}
          </span>
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      )}
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
  const stageKeys = useMemo(() => spec.narratives.map((entry) => entry.key), [spec.narratives]);
  const [activeKey, setStage] = useStageKey(stageKeys, spec.narratives[0]?.key ?? '');
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  /**
   * 단계를 바꿀 때 새 단계의 제목으로 데려간다.
   * 이게 없으면 앞 단계 차트 높이에 스크롤이 남아 질문과 리드를 건너뛰고 표부터 보게 된다.
   */
  const go = useCallback((key: string) => {
    setStage(key);
    requestAnimationFrame(() => {
      // 연속 모드에서는 절이 전부 떠 있으므로 그 절의 제목으로 스크롤한다.
      const heading = spec.continuous
        ? (document.getElementById(`${spec.key}-stage-${key}`) as HTMLElement | null)
        : headingRef.current;
      if (!heading) return;
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      heading.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      heading.focus({ preventScroll: true });
    });
  }, [setStage, spec.continuous, spec.key]);

  /**
   * 탭에는 단계 이름만 싣고 부제(「— …」)는 뺀다.
   *
   * 부제를 그대로 넣으면 새우는 라벨이 135자, 오징어는 132자가 되어 열 개가 한 줄에
   * 들어가지 않는다. 게다가 품목마다 부제를 단 단계 수가 달라(오징어는 10개 중 3개)
   * 탭 폭이 들쭉날쭉해진다. 부제는 바로 아래 단계 머리글이 전문으로 보여주므로
   * 여기서 빼도 잃는 정보가 없다.
   */
  const tabs: PillTab[] = useMemo(
    () =>
      spec.narratives.map((narrative) => ({
        key: narrative.key,
        label: `${narrative.numeral} ${narrative.title.split(' - ')[0]}`,
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
          {spec.continuous
            ? '아래로 내려가지 않아도 되는 사람을 위한 요약이다. 각 항목은 보고서의 한 절에서 나온다.'
            : '아래로 내려가지 않아도 되는 사람을 위한 요약이다. 각 항목은 사슬의 한 단계에서 나온다.'}
        </p>
        <ol className={styles.briefingList}>
          {spec.briefing.map((point) => {
            const stage = spec.narratives.find((entry) => entry.key === point.stage);
            return (
              <li key={point.text}>
                {point.headline && <strong>{point.headline}</strong>}
                <span>{renderEmphasis(point.text)}</span>
                {/* 요약을 읽다 근거가 궁금해지면 그 단계로 바로 간다 */}
                {stage && (
                  <button
                    type="button"
                    className={styles.briefingJump}
                    onClick={() => go(stage.key)}
                  >
                    {stage.numeral}{spec.continuous ? '절로' : '단계에서'} 보기
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <nav className={styles.tabNav} aria-label={spec.continuous ? '절 이동' : '밸류체인 단계 이동'}>
        <PillTabs
          tabs={tabs}
          activeKey={active?.key ?? ''}
          onChange={go}
          ariaLabel="밸류체인 단계"
          tabIdPrefix={`${spec.key}-industry-tab`}
          panelIdPrefix={`${spec.key}-industry-panel`}
          wrap
        />
      </nav>

      {spec.insets?.AfterTabs && <spec.insets.AfterTabs activeKey={activeKey} go={go} />}

      {spec.continuous ? (
        spec.narratives.map((narrative) => (
          <StageSection
            key={narrative.key}
            prefix={spec.key}
            narrative={narrative}
            charts={spec.chartSlots[narrative.key] ?? []}
            onGo={go}
          />
        ))
      ) : active ? (
        <StageSection
          prefix={spec.key}
          narrative={active}
          charts={spec.chartSlots[active.key] ?? []}
          next={spec.narratives[spec.narratives.indexOf(active) + 1]}
          onGo={go}
          headingRef={headingRef}
        />
      ) : (
        <p className={styles.missing}>이 단계의 서술이 아직 준비되지 않았습니다.</p>
      )}

      {spec.insets?.AfterStage && <spec.insets.AfterStage activeKey={activeKey} go={go} />}

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
