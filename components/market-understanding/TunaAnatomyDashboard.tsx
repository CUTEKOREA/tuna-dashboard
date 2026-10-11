/**
 * 「시장 이해 > 참치 해부」 — 해부보고서 「한국 참치 산업 해부」 2026년 10월판 본문 17절을 15단계로 옮긴 페이지.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있고 여기는 이 품목만의 것 — 차트 배치와
 * 히어로 수치 — 만 정한다. 서술·표는 공용 보고서 인테이크(`proseStages('tuna')`·
 * `tablesForStage('tuna', …)`)가 원문에서 그대로 읽고, 단계 제목·질문만 기존 손 작성 값을 쓴다.
 *
 * 기존 「참치」(세계 밸류체인 7단계)와는 다른 렌즈다. 그 페이지는 세계를, 이 페이지는 한국을 본다.
 */
'use client';

import React from 'react';

import { getTunaAnatomyData } from '@/lib/data/commodity-industry';
import {
  getTunaAnatomyRoster,
  type TunaAnatomyRosterBlock,
} from '@/lib/data/tuna-anatomy-roster';
import { TUNA_ANATOMY_ACCENT } from '@/lib/tuna-anatomy-chart-colors';
import {
  TUNA_ANATOMY_NARRATIVES,
  TUNA_ANATOMY_SOURCE_NOTES,
} from '@/lib/tuna-anatomy-content';
import { proseBriefing, proseStages } from '@/lib/company-prose-stages';
import { proseForStage } from '@/lib/data/company-report-prose';
import {
  type ReportTable as IntakeReportTable,
  tablesForStage,
} from '@/lib/data/company-report-tables';
import type { HeroKpi } from '../v2/HeroZone';
import styles from './TunaIndustryDashboard.module.css';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
  type FlowItem,
  type StageNarrative,
} from './CommodityIndustryDashboard';
import {
  TunaAnatomyBangkokChart,
  TunaAnatomyCanSplitChart,
  TunaAnatomyExportChainChart,
  TunaAnatomyFcfChart,
  TunaAnatomyFleetAgeChart,
  TunaAnatomyImportChainChart,
  TunaAnatomyProductionChart,
  TunaAnatomyUnitPriceChart,
  TunaAnatomyWorldChart,
} from './CommodityCharts';

type RosterBlock = TunaAnatomyRosterBlock;

const ROSTER = getTunaAnatomyRoster();

function RosterTable({
  caption,
  rows,
  sizeLabel,
}: {
  caption: string;
  rows: RosterBlock['rows'];
  sizeLabel: string;
}) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>{caption}</caption>
        <thead>
          <tr>
            <th>회사</th>
            <th>위치</th>
            <th>{sizeLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.회사}-${r.위치}`}>
              <td>
                {r.회사}
                {r.내용 ? <span className={styles.factNote}>{r.내용}</span> : null}
              </td>
              <td>{r.위치}</td>
              <td>
                {r.규모}
                <span className={styles.factNote}>
                  {r.성격} · {r.출처}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DATA = getTunaAnatomyData();

const FAO_SYNC = { status: 'STATIC' as const, syncDate: `${DATA.세계어획._meta.기준연도}년 확정` };
const OFIS_SYNC = { status: 'STATIC' as const, syncDate: '2026년 6월 월보' };
const FLEET_SYNC = { status: 'STATIC' as const, syncDate: '2024년 말 명부' };
const KCS_SYNC = { status: 'STATIC' as const, syncDate: '2026년 7월 누계' };
const DART_SYNC = { status: 'STATIC' as const, syncDate: '2026년 2분기 보도 · 2025년 반기보고서' };
const MFDS_2024_SYNC = { status: 'STATIC' as const, syncDate: '2024년분' };
const PRICE_SYNC = { status: 'STATIC' as const, syncDate: '2026년 8월 (방콕 계약가) · 2026년 6월 (월보)' };
const ROSTER_SYNC = { status: 'STATIC' as const, syncDate: '2026-09-10 명부' };
const REPORT_SYNC = { status: 'STATIC' as const, syncDate: '보고서 2026년 10월판' };

/**
 * 남긴 차트·명부는 해부보고서 표가 아니라 화면용 집계(2026-08 초판 집계·09-10 명부)를 그린다.
 * 캡션 끝에 출처·기준을 붙여 보고서 본문 수치와 다른 집계임을 밝힌다(2026-10-11 사용자 결정 7).
 */
const chartSource = (source: unknown, asOf: string) =>
  ` 출처 ${String(source)} · 기준 ${asOf}. 보고서 표와 별도 집계다.`;

/**
 * 히어로 수치는 해부보고서 원문 값이다(01절 요점 1·4, 09절 첫 문단). 옛 히어로도 같은 네 값이었지만
 * 화면용 집계 JSON(2026-08 초판)에서 읽었다. 이제 원문 리터럴로 고정하고 렌더 테스트가 원문 HTML
 * 텍스트에 그대로 있는지 대조한다.
 */
export const TUNA_ANATOMY_HERO_KPIS: HeroKpi[] = [
  { label: '2024 한국 참치 어획 (FAO 7종)', value: 332602, unit: '(톤, 세계 5위)', accent: TUNA_ANATOMY_ACCENT },
  { label: '2024 세계 점유', value: 5.63, unit: '(%)', decimals: 2 },
  { label: '2024 냉동 참치 수출', value: 199711, unit: '(톤)' },
  { label: '2024 국내 캔·조리 생산', value: 80374, unit: '(톤)' },
];

/**
 * 원문 표와 주제가 겹쳐 내린 옛 위젯(2026-10-11 사용자 결정 7). 같은 표가 옛판(2026-08 초판 집계)과
 * 원문판(10월판) 두 벌로 보이지 않게 한다. 집계 JSON·명부 JSON 은 그대로 두고 화면에서만 뺀다.
 */
export const TUNA_ANATOMY_DROPPED_WIDGETS = [
  '2024년 세계 참치 어획 상위 12개국 (톤)', // 03절 「누가 잡나」 표와 같은 12개국·같은 값
  '선망 회사별 생산 2024·2025 (톤)', // 04절 「선사별 어획」 참치선망 표
  '원양선사 명부 (법인명·수치 성격)', // 04절 「선사별 어획」 선망·연승 표
  'PNA 수역 선망 환적 월별 2024~2025 (톤)', // 06절 PNA 수역 선망 환적 표(같은 달·같은 값)
  '냉동 참치 수출 상대국 2024·2025 (톤)', // 06절 「운반선이 가는 곳」 수출 상대국 표
  '해외 캐너리·조업 법인 명부 (법인명·수치 성격)', // 08절 법인·나라·한국 측 지분 표
  '참치 캔 브랜드별 생산 2022~2025 (톤)', // 09절 「브랜드와 공장은 다르다」 표
  '국내 캔 공장 명부 (법인명·수치 성격)', // 09절 「브랜드와 공장은 다르다」 표
  '수입 명의 명부 (건수≠물량)', // 17절 표 17-2 수입신고 상위 10개 업소
  '공시 10사 매출·영업이익 2024 (억원)', // 12절 회사별 매출·영업이익 표
];

/** 발행본 표를 그대로 그린다. 숫자는 문자열 그대로이고 재계산하지 않는다. */
function ReportTable({ table }: { table: IntakeReportTable }) {
  return (
    <div className={styles.dataTableWrap} tabIndex={0} role="region" aria-label="표 (가로 스크롤)">
      <table className={styles.dataTable}>
        <thead>
          <tr>
            {table.head.map((h, i) => (
              <th key={i} style={table.num[i] ? { textAlign: 'right' } : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} style={table.num[j] ? { textAlign: 'right' } : undefined}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 최종 해부보고서 표를 설명 문장 옆의 원래 자리로 되돌린다(명태·오징어와 같다).
 *
 * 07(07·16절)·11(11·17절) 단계는 절이 둘이라 절별 오프셋 구간을 따로 둔다. 그렇지 않으면
 * 뒤 절의 표가 첫 절 문장 사이에 섞인다. 남긴 차트·명부는 chartSlots 에 남아 각 단계 끝
 * 「근거」에서 그대로 렌더된다.
 */
function inlineReport(n: StageNarrative): StageNarrative {
  if (!n.flow) return n;

  const sectionIndex = new Map(
    proseForStage('tuna', n.key).map((section, index) => [section.sid, index]),
  );
  const extras: FlowItem[] = tablesForStage('tuna', n.key).map((table) => ({
    kind: 'slot',
    ord: (sectionIndex.get(table.sid) ?? 0) * 1_000_000 + table.ord,
    slot: {
      title: table.title,
      caption: table.note ?? table.caption ?? '',
      telemetry: REPORT_SYNC,
      render: () => <ReportTable table={table} />,
      span: 'full',
      sourceLine: `한국 참치 산업 해부 ${table.section}`,
    },
  }));
  const merged = [...n.flow, ...extras].sort((a, b) => a.ord - b.ord);
  const deduped = merged.filter((item, index) => {
    if (item.kind !== 'head') return true;
    const next = merged[index + 1];
    return !(next?.kind === 'slot' && next.slot.title === item.text);
  });
  if (deduped[0]?.kind === 'head' && deduped[0].text === n.question) deduped.shift();
  return { ...n, flow: deduped };
}

const REPORT_STAGES = new Map(proseStages('tuna').map((stage) => [stage.key, stage]));

/** 절 번호(kicker)가 비면 공용 proseStages 가 「: 부제」 머리를 만든다. 명태와 같게 걷는다. */
const dropEmptyLabel = (text: string) => text.replace(/^(\*\*)?: /, '$1');

/**
 * 원문에 대응 절이 없는 손 작성 단계. 참치는 15단계 모두 원문 01~15절과 주제가 같아 비어 있다
 * (2026-10-11 사용자 결정 6 — 대상이 생기면 여기에 넣고 「보고서 밖 사내 분석」을 단다).
 */
export const TUNA_ANATOMY_HANDWRITTEN_STAGES = new Set<string>();

/**
 * 단계 순서·번호·제목·질문은 기존 화면 값을 쓰고(발주서 허용), 서술은 전부 원문에서 온다.
 */
export const TUNA_ANATOMY_REPORT_NARRATIVES: StageNarrative[] = TUNA_ANATOMY_NARRATIVES.map((hand) => {
  if (TUNA_ANATOMY_HANDWRITTEN_STAGES.has(hand.key)) return { ...hand, badge: '보고서 밖 사내 분석' };
  const stage = REPORT_STAGES.get(hand.key);
  if (!stage) throw new Error(`참치 보고서에 ${hand.key} 단계 서술이 없다`);
  return inlineReport({
    ...stage,
    numeral: hand.numeral,
    title: hand.title,
    question: hand.question,
    paragraphs: stage.paragraphs.map(dropEmptyLabel),
    flow: stage.flow?.map((item) => item.kind === 'head' ? { ...item, text: dropEmptyLabel(item.text) } : item),
  });
});

export const TUNA_ANATOMY_REPORT_BRIEFING = proseBriefing('tuna');

/**
 * 자료의 한계. 손 작성 시절 첫 줄(「보고서 2026-08-23」)은 10월판 원문으로 바뀐 지금 사실이 아니라
 * 빼고, 무엇이 원문이고 무엇이 화면 집계인지를 맨 앞에 밝힌다.
 */
export const TUNA_ANATOMY_REPORT_SOURCE_NOTES: string[] = [
  '본문과 표는 해부보고서 「한국 참치 산업 해부」 2026년 10월판(2026-10-11 정정본) 본문 01~17절에서 그대로 옮겼다. 각 단계 끝 「근거」의 차트·명부는 화면용 집계(2026-08 초판 집계·2026-09-10 명부)라 캡션에 출처와 기준을 따로 적었다.',
  ...TUNA_ANATOMY_SOURCE_NOTES.slice(1),
];

const FAO_SOURCE = DATA.세계어획._meta.출처;
const KCS_SOURCE = DATA.교역._meta.출처;

/**
 * 원문 표에 없는 차트·명부만 남긴다(시계열 전 연도·선령 구간·월별 단가 등). 원문 표와 같은 값을
 * 그리던 위젯은 `TUNA_ANATOMY_DROPPED_WIDGETS` 로 내렸다.
 */
export const TUNA_ANATOMY_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s02: [
    {
      title: '한국 참치 어획 1970~2024와 세계 점유 (톤·%)',
      caption:
        '막대가 한국 어획, 선이 세계 점유다. 1990년 선망이 자리 잡으며 20만 톤대로 올라섰고 2019년 370,208톤이 정점이다. 점유는 2010년 7.03%에서 2024년 5.63%로 내려왔다.' +
        chartSource(FAO_SOURCE, `${DATA.세계어획._meta.기준연도}년 확정, 1970~2024 매년`),
      telemetry: FAO_SYNC,
      span: 'full',
      render: () => <TunaAnatomyWorldChart data={DATA} />,
    },
  ],
  s04: [
    {
      title: '선망·연승 생산 2019~2025 (톤)',
      caption:
        '2025년 막대는 원양어업 생산동향 12월호 누계(예비치)다. 선망이 2019년 335,465톤에서 2025년 211,367톤으로 내려오는 동안 연승은 4만 톤 안팎이다.' +
        chartSource(DATA.한국생산._meta.출처, '원양어업통계조사 2019~2024 · 월보 2025년 12월호'),
      telemetry: OFIS_SYNC,
      render: () => <TunaAnatomyProductionChart data={DATA} />,
    },
    {
      title: '선단 선령 분포 (척)',
      caption:
        '2026년 기준 선령. 선망 27척은 고르게 퍼져 있지만 연승 105척은 31~40년 구간에 몰려 있다. 2020년 이후 새로 지은 배는 없다.' +
        chartSource(DATA.선단._meta.출처, '2024년 말 명부, 선령 구간 집계'),
      telemetry: FLEET_SYNC,
      render: () => <TunaAnatomyFleetAgeChart data={DATA} />,
    },
  ],
  s06: [
    {
      title: '냉동 참치·필레·캔 수출 2019~2026 (톤)',
      caption:
        '냉동 통마리(남청)가 척추다. 2024년 199,711톤에서 2025년 135,754톤으로 32% 줄었다. 2026년은 1~7월 누계라 막대가 짧다.' +
        chartSource(KCS_SOURCE, '2026년 7월 누계'),
      telemetry: KCS_SYNC,
      render: () => <TunaAnatomyExportChainChart data={DATA} />,
    },
  ],
  s07: [
    {
      title: '신라교역 FCF 매출과 비중 2019~2025 (억원·%)',
      caption:
        '옅은 막대가 연결 매출, 짙은 막대가 FCF(고객 A) 매출, 선이 비중이다. 2024년 46.3%가 가장 높고 2025년은 39.8%다.' +
        chartSource(DATA.재무._meta.출처, '2025년 사업보고서'),
      telemetry: DART_SYNC,
      render: () => <TunaAnatomyFcfChart data={DATA} />,
    },
  ],
  s09: [
    {
      title: '국내 횟감 공장 명부 (법인명·수치 성격)',
      caption: ROSTER.국내횟감.요지 + chartSource('식약처 생산실적 I0300', '2024년분'),
      telemetry: MFDS_2024_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="식약처 I0300 2024년. 횟감·로인 제품 무게이며 어획 생물중량과 빼지 않는다."
          rows={ROSTER.국내횟감.rows}
          sizeLabel="생산 (성격)"
        />
      ),
    },
    {
      title: '브랜드·제품 명부 (법인명·수치 성격)',
      caption: ROSTER.브랜드제품.요지 + chartSource('자사 공시 인용·보도·관세청', '2026-09-10 명부'),
      telemetry: ROSTER_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="닐슨 점유는 자사 공시 인용(B). 출고가 인상은 보도(C). 세번 캔과 자숙 로인은 합치지 않는다."
          rows={ROSTER.브랜드제품.rows}
          sizeLabel="값 (성격)"
        />
      ),
    },
  ],
  s10: [
    {
      title: '참치 수입 사슬별 2019~2026 (톤)',
      caption:
        '세 사슬을 합치지 않는다. 냉동 통마리는 2025년 10,083톤으로 두 배가 됐고, 캔·조제품은 2019년 1,366톤에서 2024년 6,831톤이 됐다. 2026년은 1~7월 누계.' +
        chartSource(KCS_SOURCE, '2019~2026년 7월 매년'),
      telemetry: KCS_SYNC,
      render: () => <TunaAnatomyImportChainChart data={DATA} />,
    },
    {
      title: '캔·조제품 세번 분해 2022~2025 (톤)',
      caption:
        '1604.14를 10자리로 가르면 밀폐용기 캔보다 밀폐용기에 들지 않은 조제품(-9000)이 더 크다. 2024년 4,352톤 가운데 베트남산이 4,111톤 - 자숙 로인이다.' +
        chartSource('관세청 수출입무역통계 HSK 10자리', '2025년 연간 스냅샷'),
      telemetry: { status: 'STATIC' as const, syncDate: '2025년 연간 (10자리 스냅샷)' },
      render: () => <TunaAnatomyCanSplitChart data={DATA} />,
    },
  ],
  s13: [
    {
      title: '방콕 가다랑어 월별 2024~2026 (달러/톤)',
      caption:
        'Thai Union IR 표의 해당 월 계약가다. 원료는 약 1개월 뒤 방콕에 닿으므로 도착 시점 가격이 아니다. 2024년 8월 1,250달러가 저점, 2026년 8월 2,100달러가 조회일 기준 마지막 달이다.' +
        chartSource('타이유니온 투자자 정보 방콕 양륙 가다랑어 월별 가격', '2026년 8월까지 매월'),
      telemetry: PRICE_SYNC,
      render: () => <TunaAnatomyBangkokChart data={DATA} />,
    },
    {
      title: '한국 선단 어종별 생산단가 2025~2026 (원/kg)',
      caption:
        '월보의 단가는 선사가 보고한 생산금액을 생산량으로 나눈 값이다. 가다랑어는 1,910~1,965원에 평평하고 눈다랑어는 5,356원에서 7,069원까지 움직인다.' +
        chartSource('원양어업 생산동향 월보 어종별 생산단가', '2026년 6월까지 매월'),
      telemetry: PRICE_SYNC,
      render: () => <TunaAnatomyUnitPriceChart data={DATA} />,
    },
  ],
};

const SPEC: CommoditySpec = {
  // 2026-09-10 사용자 지시: 단계를 탭으로 넘기지 않고 한 페이지에 전부 출력한다(기업 해부와 동일).
  continuous: true,
  key: 'tuna-anatomy',
  title: '참치 해부',
  subtitle:
    '한국 참치 산업 해부 · 잡아서 남에게 파는 생선 - 원양 선단·환적·판매 상대·해외 가공·국내 캔·수입·명부·값·제도 15단계',
  accent: TUNA_ANATOMY_ACCENT,
  primaryKpi: TUNA_ANATOMY_HERO_KPIS[0],
  secondaryKpis: TUNA_ANATOMY_HERO_KPIS.slice(1),
  stripItems: [
    // 히어로 띠도 원문 값이다(01절 요점 2·8, 13절 「캔 원료에서 캔까지」 표).
    { now: true, eyebrow: '방콕 가다랑어', title: '2026년 8월', body: '2,100 (달러/톤) · 방콕 도착 약 한 달 뒤' },
    { eyebrow: '원양 다랑어류', title: '2026년 1~8월 누계', body: '144,435.4 (톤) · 전년 같은 기간보다 12.8% 적다' },
    { eyebrow: '국내 출고가', title: '2026년 8월', body: '사조 참치 캔 출고가 10% 인상(8월 3일 보도) · 동원 인상 검토(7월 보도)' },
    { eyebrow: '선망 점유', title: '2024 회사별', body: '동원산업 50.0% · 신라교역 26.7% · 사조산업 16.9%' },
  ],
  briefing: TUNA_ANATOMY_REPORT_BRIEFING,
  narratives: TUNA_ANATOMY_REPORT_NARRATIVES,
  chartSlots: TUNA_ANATOMY_CHART_SLOTS,
  sourceNotes: TUNA_ANATOMY_REPORT_SOURCE_NOTES,
  sourceMeta: [
    '본문·표 해부보고서 2026년 10월판',
    `차트 · 어획 ${DATA.세계어획._meta.출처}`,
    `생산·선단 · ${DATA.한국생산._meta.출처}`,
    `통관 · ${DATA.교역._meta.출처}`,
    `값 · ${DATA.가격._meta.출처}`,
    `재무 · ${DATA.재무._meta.출처}`,
    `집계 ${DATA._meta.생성일} · 방콕 IR·명부 보강 2026-09-10`,
  ].join(' · '),
};

export interface TunaAnatomyDashboardProps {
  heroOnly?: boolean;
}

export default function TunaAnatomyDashboard({ heroOnly = false }: TunaAnatomyDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
