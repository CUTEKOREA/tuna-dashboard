/**
 * 「시장 이해 > 오징어」 — 밸류체인 7단계 + 횡단 3축.
 *
 * 참치 페이지와 같은 골격이고 CSS 도 같은 모듈을 쓴다. 다른 것은 셋이다.
 *  · 원본 위젯이 차트뿐 아니라 표·원문 발췌라서 `SquidWidgetView` 가 세 형태를 다룬다
 *  · 위젯마다 측정 게이트(`basis`)를 함께 싣는다 — 이 수치를 무엇과 비교하면 안 되는지
 *  · 시그니처 색이 두족류(purple → pink)다
 *
 * 두 대시보드가 단계 렌더링 코드를 각자 들고 있다. 지금은 둘뿐이라 공용화하지 않았다.
 * 세 번째 품목이 생기면 그때 `StageSection` 을 빼내는 편이 낫다.
 */
'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import { ArrowRight, BookOpen, Waves } from 'lucide-react';

import {
  getSquidCatchData,
  getSquidChainStages,
  getSquidCrossStages,
  getSquidFleetData,
  getSquidOceanFleet,
  getSquidTradeData,
  getSquidWidgetsMeta,
  type SquidStage,
} from '@/lib/data/squid-industry';
import {
  SQUID_ALL_NARRATIVES,
  SQUID_BRIEFING_POINTS,
  SQUID_SOURCE_NOTES,
  type SquidFactRow,
  type SquidStageNarrative,
} from '@/lib/squid-industry-content';
import { TelemetryBadge } from '../TelemetryBadge';
import TermTooltip from '../TermTooltip';
import HeroZone from '../v2/HeroZone';
import { HeroNowStrip } from '../v2/HeroNowStrip';
import PillTabs, { type PillTab } from '../v2/PillTabs';
import { useStageKey } from './useStageKey';
import {
  AreaRankChart,
  BasketChart,
  CollapseChart,
  CoastalGearChart,
  CompanyFleetChart,
  OceanJiggerChart,
  CountryCompareChart,
  DistantGearChart,
  NationFleetChart,
  VesselAgeChart,
  CountryRankChart,
  ImportFormChart,
  ImportOriginChart,
  ImportTrendChart,
  KoreaSpeciesChart,
  KoreaTrendChart,
  SpeciesMixChart,
  SpeciesTimelineChart,
  StagePriceChart,
  SquidYearbookPriceChart,
  SquidMonthlyCatchChart,
} from './SquidCharts';
import SquidWidgetView from './SquidWidgetView';
import {
  TraderTable,
  CanneryCountryTable,
  BrandMarketTable,
} from './CompanyResearchTables';
import { getSquidCompanyResearch, getKofaSeries } from '@/lib/data/valuechain-companies';
import styles from './TunaIndustryDashboard.module.css';

const CATCH = getSquidCatchData();
const TRADE = getSquidTradeData();
const FLEET = getSquidFleetData();
const OCEAN_FLEET = getSquidOceanFleet();
const CHAIN_STAGES = getSquidChainStages();
const CROSS_STAGES = getSquidCrossStages();
const ALL_STAGES: SquidStage[] = [...CHAIN_STAGES, ...CROSS_STAGES];
const WIDGETS_META = getSquidWidgetsMeta();

const CATCH_SYNC = { status: 'STATIC' as const, syncDate: `${CATCH.요약.기준연도}년 확정` };
const TRADE_SYNC = { status: 'STATIC' as const, syncDate: `${TRADE.요약.기준연도}년 확정` };
const FLEET_SYNC = { status: 'STATIC' as const, syncDate: '2024년 말 기준' };
const FLYING_SQUID_VS_PEAK_PCT = Number(
  ((CATCH.요약.살오징어세계최신 / CATCH.요약.살오징어세계정점) * 100).toFixed(1),
);

interface ChartSlot {
  title: string;
  caption: string;
  telemetry: { status: 'STATIC' | 'SYNCED' | 'LIVE'; syncDate: string };
  render: () => React.ReactNode;
  /** 표·장시계열은 full(1열 1개). 없으면 그래프 기본 — 1열 2개. */
  span?: 'full' | 'half';
}

/**
 * 단계마다 이 페이지가 직접 그리는 차트. 선별 위젯과 달리 집계 JSON 을 원본으로 쓴다.
 * 제목은 서술이 「」로 지목하는 이름이므로 함부로 바꾸면 참조가 끊긴다(테스트가 잡는다).
 */
const SQUID_RESEARCH = getSquidCompanyResearch();
const KOFA_SERIES = getKofaSeries();
const SQUID_MONTHLY = KOFA_SERIES.월별생산2024.find((row) => row.어종 === '오징어류');

export const SQUID_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s01: [
    {
      title: '어종별 어획량 구성 (톤)',
      caption:
        '같은 갈래는 비슷한 색이다. 오징어는 보라·남색, 갑오징어는 장미, 두족류 미분류는 회색, 그 밖의 종은 호박이다. 이 셋을 더하지 않는다.',
      telemetry: CATCH_SYNC,
      render: () => <SpeciesMixChart data={CATCH} />,
    },
    {
      title: '무엇을 오징어라 부르는가 (톤)',
      caption:
        '어획 통계의 「오징어」에는 갑오징어와 미분류가 섞여 있다. 이 셋을 자동으로 더하지 않는 것이 이 품목 자료의 첫 규칙이다.',
      telemetry: CATCH_SYNC,
      render: () => <BasketChart data={CATCH} />,
    },
  ],
  s02: [
    {
      title: '공급 기업 — 누가 잡고 누가 파는가',
      caption: SQUID_RESEARCH.공급.요지,
      telemetry: { status: 'SYNCED' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <TraderTable rows={SQUID_RESEARCH.공급.rows} />,
    },
    {
      title: '해역별 어획량 (톤)',
      caption: '다섯 해역이 세계의 89.5%를 낸다. 그중 셋이 남미 앞바다다.',
      telemetry: CATCH_SYNC,
      render: () => <AreaRankChart data={CATCH} />,
    },
  ],
  s03: [
    {
      title: '연근해 업종별 선박 수와 척당 배분량 (척·톤)',
      caption:
        '막대는 선박 수, 선은 척당 배분량이다. 가장 작은 근해자망 18.6톤과 대형트롤 368.1톤이 20배 벌어진다 — 이 배들을 더해 「오징어 어선」이라 부를 수 없다.',
      telemetry: { status: 'STATIC' as const, syncDate: '2025/26 어기' },
      render: () => <CoastalGearChart data={FLEET} />,
    },
    {
      title: '원양 업종별 선박 수와 선령 (척)',
      caption:
        '분홍이 선령 31년 이상이다. 한국 원양어선 198척 중 157척이 31년을 넘었고, 오징어채낚기는 20척 중 18척이다.',
      telemetry: FLEET_SYNC,
      render: () => <DistantGearChart data={FLEET} />,
    },
    {
      title: '선사별 채낚기 선단 (척·톤)',
      caption:
        '막대는 보유 척수, 선은 선단 합계 톤수다. 열 개 회사가 스무 척을 나눠 갖는데 여섯 척을 가진 곳과 한 척뿐인 곳이 섞여 있다 — 「오징어 선사」를 한 덩어리로 부르면 이 차이가 사라진다.',
      telemetry: FLEET_SYNC,
      render: () => <CompanyFleetChart data={FLEET} />,
    },
    {
      title: '남태평양 공해 채낚기 선단 (척·톤)',
      caption:
        '막대는 척수, 선은 척당 평균 톤수다. 페루 1,013척은 평균 25톤짜리 소형선이고 중국 609척은 평균 948톤이다 — 같은 「채낚기」라도 배가 40배 다르다. 장미색이 한국(30척·평균 917톤)이다. ⚠ 이 등록부는 소유사를 공개하지 않아 선사 단위로는 갈 수 없다.',
      telemetry: { status: 'STATIC' as const, syncDate: '2026년 8월 등록부' },
      render: () => <OceanJiggerChart data={OCEAN_FLEET} />,
    },
    {
      title: '어획 상위 12개국 (톤)',
      caption: '1위 중국은 자국 연안이 아니라 원양에서 대부분을 잡는다. 장미색이 한국이다.',
      telemetry: CATCH_SYNC,
      render: () => <CountryRankChart data={CATCH} />,
    },
  ],
  s05: [
    {
      title: '국가별 가공 거점과 기업',
      caption: SQUID_RESEARCH.가공.요지,
      telemetry: { status: 'SYNCED' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <CanneryCountryTable rows={SQUID_RESEARCH.가공.rows} />,
    },
    {
      title: '한국 수입의 형태 구성 (톤)',
      caption:
        '한국이 사 오는 것의 4분의 3이 원물이다. 완제품 비중이 그 다음이고, 건조·염장은 물량으로는 작다 — 단가는 그 반대다.',
      telemetry: TRADE_SYNC,
      render: () => <ImportFormChart data={TRADE} />,
    },
  ],
  s06: [
    {
      title: '한국 수입량과 수입단가 (톤·달러/톤)',
      caption: '막대는 수입량, 선은 톤당 단가다. 적게 사면서 비싸게 사는 흐름이 보인다.',
      telemetry: TRADE_SYNC,
      span: 'full',
      render: () => <ImportTrendChart data={TRADE} />,
    },
    {
      title: '수입 상대국별 규모와 단가 (백만 달러·달러/톤)',
      caption:
        '1위 중국은 가공·재수출국이라 그 물량 안에 남미산 원물이 섞여 있다. 상대국을 원산지로 읽으면 틀린다.',
      telemetry: TRADE_SYNC,
      render: () => <ImportOriginChart data={TRADE} />,
    },
  ],
  s07: [
    {
      title: '한국 원양 오징어 어가 — 수역별 연평균 (원/kg)',
      caption:
        '원양산업 통계연보 어가표의 연평균 열(2015~2024). 남서대서양 어가가 2015년 1,555원에서 2024년 6,637원으로 4.3배 뛰었다 — 국내 연근해 흉어와 세계 공급 수축이 원양 원료가에 그대로 얹힌 궤적이다. 결측 연도(조업 없음)는 선이 끊긴다.',
      telemetry: { status: 'STATIC' as const, syncDate: '연보 2015~2024' },
      render: () => <SquidYearbookPriceChart rows={KOFA_SERIES.어가.오징어원kg} />,
    },
    {
      title: '브랜드와 점유율 (성격 구분)',
      caption: SQUID_RESEARCH.브랜드.요지,
      telemetry: { status: 'SYNCED' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <BrandMarketTable rows={SQUID_RESEARCH.브랜드.rows} />,
    },
    {
      title: '품목 단계별 수입액과 단가 (달러/톤)',
      caption:
        '건조·염장이 원물의 일곱 배로 보이는 것은 가공 부가가치가 아니라 수분을 뺀 농축 때문이다. 무엇이 그 1톤에 담겼는지를 먼저 봐야 한다.',
      telemetry: TRADE_SYNC,
      render: () => <StagePriceChart data={TRADE} />,
    },
  ],
  x01: [
    {
      title: '살오징어 어획량 — 세계와 한국 (톤)',
      caption:
        '세계는 1968년, 한국은 1996년이 정점이다. 두 선이 함께 내려앉는 동안 오징어 전체 어획량은 유지됐다.',
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => <CollapseChart data={CATCH} />,
    },
    {
      title: '주요 어종 어획량 추이 (톤)',
      caption: '2024년 규모 상위 5종의 자리바꿈이다. 살오징어 붕괴는 위 「살오징어 어획량 — 세계와 한국 (톤)」에 따로 있다.',
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => <SpeciesTimelineChart data={CATCH} />,
    },
  ],
  x03: [
    {
      title: '한국 원양 오징어류 월별 생산 — 2024년 (톤)',
      caption:
        '연보 월별 실적 전사(계 63,156톤, 검산 일치). 상반기(1~5월)에 물량이 두껍다 — 남서대서양 어기가 상반기에 걸리는 구조라, 국내 재고·가격 판단은 이 리듬 위에서 읽어야 한다.',
      telemetry: { status: 'STATIC' as const, syncDate: '연보 2024' },
      render: () => (SQUID_MONTHLY ? <SquidMonthlyCatchChart months={SQUID_MONTHLY.월별} /> : null),
    },
    {
      title: '오징어채낚기 선박별 선령 (년)',
      caption:
        '분홍이 31년 이상이다. 20척 평균 선령 36.5년, 최고 51년이다. 2020년 건조 2척을 빼면 대부분 1970~80년대 배다.',
      telemetry: FLEET_SYNC,
      span: 'full',
      render: () => <VesselAgeChart data={FLEET} />,
    },
    {
      title: '한·일·대만 채낚기 선단 (척·톤)',
      caption:
        '막대는 척수, 선은 평균 톤수다. 한국은 큰 배로 원양에, 일본은 작은 배로 근해에 나간다. 대만은 톤수가 공개되지 않는다.',
      telemetry: { status: 'STATIC' as const, syncDate: '2024~2026년' },
      render: () => <NationFleetChart data={FLEET} />,
    },
    {
      title: '한국 어획량과 세계 점유율 (톤·%)',
      caption: '막대는 어획량, 선은 세계에서 차지하는 몫이다.',
      telemetry: CATCH_SYNC,
      span: 'full',
      render: () => <KoreaTrendChart data={CATCH} />,
    },
    {
      title: '주요국 오징어 수출입 (백만 달러)',
      caption:
        '한국은 사는 쪽이다. 아르헨티나·칠레·페루는 파는 쪽이고, 스페인은 사서 되판다. 페루는 2025년 보고가 없어 2024년 값이다.',
      telemetry: TRADE_SYNC,
      render: () => <CountryCompareChart data={TRADE} />,
    },
    {
      title: '한국 어종별 어획량 (톤)',
      caption:
        '보라는 살오징어다. 연근해 자원이 한국 오징어 어획에서 차지하는 몫이 이만큼으로 줄었다.',
      telemetry: CATCH_SYNC,
      render: () => <KoreaSpeciesChart data={CATCH} />,
    },
  ],
};

function renderEmphasis(text: string): React.ReactNode[] {
  return text.split(/\*\*(.+?)\*\*/g).map((chunk, index) =>
    index % 2 === 1 ? (
      <strong key={index}>{chunk}</strong>
    ) : (
      <React.Fragment key={index}>{chunk}</React.Fragment>
    ),
  );
}

function FactTable({ rows }: { rows: SquidFactRow[] }) {
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
  stage,
  narrative,
  next,
  onGo,
  headingRef,
}: {
  stage: SquidStage;
  narrative: SquidStageNarrative;
  next?: SquidStage;
  onGo: (key: string) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const charts = SQUID_CHART_SLOTS[stage.key] ?? [];
  // 2026-08-17 사용자 지시: 차트는 전부 사실표 아래로 — 본문 위 근거 레일 폐지
  const rest = charts;

  return (
    <section className={styles.stage} aria-labelledby={`squid-stage-${stage.key}`}>
      <header className={styles.stageHeader}>
        <span className={styles.stageNumeral}>{narrative.numeral}</span>
        <div>
          <h2
            id={`squid-stage-${stage.key}`}
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

      {(rest.length > 0 || stage.widgets.length > 0) && (
        <div className={styles.stageMore}>
          <h3 className={styles.stageMoreHeading}>근거</h3>
          <div
            className={
              rest.length + stage.widgets.length >= 2 ? styles.catchGrid : styles.catchStack
            }
          >
            {rest.map((slot) => (
              <figure
                key={slot.title}
                className={styles.catchFigure}
                data-span={slot.span === 'full' ? 'full' : 'half'}
              >
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
              </figure>
            ))}
            {stage.widgets.map((widget) => (
              <figure key={widget.id} className={styles.catchFigure} data-span="half">
                <figcaption className={styles.catchCaption}>
                  <div className={styles.catchTitleRow}>
                    <strong>{widget.title}</strong>
                    <TelemetryBadge
                      variant="caption"
                      status="STATIC"
                      syncDate={widget.dataYear ? `${widget.dataYear}년 자료` : undefined}
                    />
                  </div>
                  <span>{widget.thesis ?? widget.cardDesc ?? ''}</span>
                </figcaption>
                <div className={styles.chartFrame}>
                  <SquidWidgetView widget={widget} />
                </div>
                <figcaption className={styles.catchSourceLine}>
                  출처: {widget.source ?? '출처 미표기'}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {next && (
        <button type="button" className={styles.stageNext} onClick={() => onGo(next.key)}>
          <span className={styles.stageNextLabel}>다음</span>
          <span className={styles.stageNextTitle}>
            {getNarrative(next.key)?.numeral ?? ''} {getNarrative(next.key)?.title ?? next.title}
          </span>
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      )}
    </section>
  );
}

function getNarrative(key: string): SquidStageNarrative | undefined {
  return SQUID_ALL_NARRATIVES.find((entry) => entry.key === key);
}

export interface SquidIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function SquidIndustryDashboard({ heroOnly = false }: SquidIndustryDashboardProps) {
  const stageKeys = useMemo(() => ALL_STAGES.map((stage) => stage.key), []);
  const [activeKey, setStage] = useStageKey(stageKeys, CHAIN_STAGES[0]?.key ?? 's01');
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const go = useCallback((key: string) => {
    setStage(key);
    requestAnimationFrame(() => {
      const heading = headingRef.current;
      if (!heading) return;
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      heading.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      heading.focus({ preventScroll: true });
    });
  }, [setStage]);

  const tabs: PillTab[] = useMemo(
    () =>
      ALL_STAGES.map((stage) => {
        const narrative = getNarrative(stage.key);
        return {
          key: stage.key,
          // 탭에는 단계 이름만 싣고 부제(「— …」)는 뺀다. 열 개가 한 줄에 안 들어가고,
          // 부제를 단 단계 수가 품목마다 달라 탭 폭이 들쭉날쭉해진다. 부제는 바로 아래
          // 단계 머리글이 전문으로 보여주므로 여기서 빼도 잃는 정보가 없다.
          label: `${narrative?.numeral ?? ''} ${(narrative?.title ?? stage.title).split(' — ')[0]}`.trim(),
        };
      }),
    [],
  );

  const activeStage = ALL_STAGES.find((stage) => stage.key === activeKey) ?? ALL_STAGES[0];
  const activeNarrative = getNarrative(activeStage.key);
  const nextStage = ALL_STAGES[ALL_STAGES.indexOf(activeStage) + 1];

  const hero = (
    <HeroZone
      variant="kpi"
      title="오징어"
      subtitle="오징어 산업 해부 · 한 해살이 자원이 만드는 시장 — 밸류체인 7단계와 그것을 관통하는 3개 축"
      primaryKpi={{
        label: '세계 오징어·갑오징어 어획량',
        value: CATCH.요약.세계어획량,
        unit: '(톤)',
        accent: '#7c3aed',
      }}
      secondaryKpis={[
        {
          label: '살오징어 정점 대비',
          value: FLYING_SQUID_VS_PEAK_PCT,
          unit: '(%)',
          decimals: 1,
        },
        {
          label: '한국 어획량',
          value: CATCH.요약.한국어획량,
          unit: '(톤)',
        },
        {
          label: '한국 수입량',
          value: TRADE.요약.수입량,
          unit: '(톤)',
        },
      ]}
      minHeight={360}
      strip={(
        <HeroNowStrip
          items={[
            {
              now: true,
              eyebrow: '기준',
              title: '세계 어획량',
              body: `${CATCH.요약.세계어획량.toLocaleString('ko-KR')} (톤)`,
            },
            {
              eyebrow: '살오징어',
              title: '정점 대비',
              body: `${FLYING_SQUID_VS_PEAK_PCT.toLocaleString('ko-KR', { maximumFractionDigits: 1 })} (%)`,
            },
            {
              eyebrow: '한국',
              title: '국내 어획량',
              body: `${CATCH.요약.한국어획량.toLocaleString('ko-KR')} (톤)`,
            },
          ]}
        />
      )}
    />
  );

  if (heroOnly) return hero;

  return (
    <div className={styles.page} data-testid="squid-industry-dashboard" data-commodity="squid">
      {hero}

      <section className={styles.briefing} aria-labelledby="squid-briefing-heading">
        <h2 id="squid-briefing-heading" className={styles.briefingHeading}>
          <BookOpen size={16} aria-hidden="true" />
          30초 브리핑
        </h2>
        <p className={styles.briefingIntro}>
          아래로 내려가지 않아도 되는 사람을 위한 요약이다. 각 항목은 사슬의 한 단계에서 나온다.
        </p>
        <ol className={styles.briefingList}>
          {SQUID_BRIEFING_POINTS.map((point) => (
            <li key={point}>
              <span>{renderEmphasis(point)}</span>
            </li>
          ))}
        </ol>
      </section>

      <nav className={styles.tabNav} aria-label="밸류체인 단계 이동">
        <PillTabs
          tabs={tabs}
          activeKey={activeKey}
          onChange={go}
          ariaLabel="밸류체인 단계"
          tabIdPrefix="squid-industry-tab"
          panelIdPrefix="squid-industry-panel"
          wrap
        />
      </nav>

      {activeNarrative ? (
        <StageSection
          stage={activeStage}
          narrative={activeNarrative}
          next={nextStage}
          onGo={go}
          headingRef={headingRef}
        />
      ) : (
        <p className={styles.missing}>이 단계의 서술이 아직 준비되지 않았습니다.</p>
      )}

      <section className={styles.sources} aria-labelledby="squid-sources-heading">
        <h2 id="squid-sources-heading" className={styles.sourcesHeading}>
          <Waves size={16} aria-hidden="true" />
          출처와 한계
        </h2>
        <ul className={styles.sourceList}>
          {SQUID_SOURCE_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className={styles.sourceMeta}>
          어획 집계 · {CATCH._meta.출처} · 기준 {CATCH._meta.기준연도}년 · 갱신 {CATCH._meta.생성일}
          {' · '}
          통관 집계 · {TRADE._meta.출처}
          {' · '}
          위젯 {String(WIDGETS_META.선별)}개 ({String(WIDGETS_META.원본)})
        </p>
      </section>
    </div>
  );
}
