/**
 * 「시장 이해 > 문어」.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있다. 여기는 차트·표 배치와 히어로 수치만 정한다.
 *
 * ⚠ 히어로 주수치는 냉동 문어(0307521000) 수입 톤이다. 문어 전용 세번이 이것 하나라서다.
 *   세계 문어류 어획은 02단계에 두고, FAO 한국값(3종 합)은 그 옆에 놓지 않는다.
 * ⚠ 옛 `/octopus` 낙지 페이지와 그 API·JSON 은 쓰지 않는다. 라벨이 낙지와 섞여 있다.
 */
'use client';

import React from 'react';

import {
  getOctopusCompanyResearch,
  getOctopusIndustryData,
  type OctopusRosterRow,
} from '@/lib/data/octopus-industry';
import { OCTOPUS_ACCENT } from '@/lib/octopus-chart-colors';
import { proseBriefing, proseStages } from '@/lib/company-prose-stages';
import { dropEmptyLabel, industryInlineReport } from './IndustryReportFlow';
import {
  type ReportTable as IntakeReportTable,
} from '@/lib/data/company-report-tables';
import { OCTOPUS_NARRATIVES, OCTOPUS_SOURCE_NOTES } from '@/lib/octopus-industry-content';
import type { HeroKpi } from '../v2/HeroZone';
import styles from './TunaIndustryDashboard.module.css';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
  type StageNarrative,
} from './CommodityIndustryDashboard';
import MarketRegimeBand from './MarketRegimeBand';
import {
  OctopusAuctionChart,
  OctopusFrozenTradeChart,
  OctopusKoreaChart,
  OctopusPreparedTradeChart,
  OctopusWorldChart,
} from './OctopusCharts';
import {
  AuctionPriceChart,
  TradeBalanceChart,
  auctionCaption,
  tradeCaption,
} from './MofLiveCharts';
import { auctionMeta, tradeMeta } from '@/lib/data/mof-live';

const DATA = getOctopusIndustryData();
const RESEARCH = getOctopusCompanyResearch();

const FAO_SYNC = { status: 'STATIC' as const, syncDate: 'FishStat 2024년 확정' };
const KOSIS_SYNC = { status: 'STATIC' as const, syncDate: 'KOSIS 2025년(연간)' };
const FIPS_SYNC = { status: 'STATIC' as const, syncDate: '수협 계통판매 2026년 6월' };
const KCS_SYNC = { status: 'STATIC' as const, syncDate: '관세청 2025년 확정' };
const MFDS_SYNC = { status: 'STATIC' as const, syncDate: '식약처 2026-09-02 전수' };
const IMP_SYNC = { status: 'STATIC' as const, syncDate: '수입신고 2025-09~2026-09' };
const REPORT_SYNC = { status: 'STATIC' as const, syncDate: '보고서 2026년 10월판' };
/** 손 작성 위젯(원료 달력·s09 내부 검토)은 옛 OEM 제안계획 보고서 제2판 값이다. */
const OLD_REPORT_SYNC = { status: 'STATIC' as const, syncDate: '보고서 제2판 2026-09-03' };

const fmt = (value: number) => value.toLocaleString('ko-KR');

/**
 * 차트는 해부보고서 표가 아니라 화면용 집계를 그린다. 캡션 끝에 출처·기준을 붙여
 * 보고서 본문 수치와 다른 집계임을 밝힌다(2026-10-11 사용자 결정 7).
 */
const chartSource = (source: string, asOf: string) =>
  ` 출처 ${source} · 기준 ${asOf}. 보고서 표와 별도 집계다.`;

/**
 * 히어로 수치는 해부보고서 원문 값이다(표지 지표·01절 요약). 렌더 테스트가 원문 HTML
 * 텍스트에 그대로 있는지 대조한다(4,502톤·9.48달러·23,557원은 01절, 1,955건은 07절).
 */
export const OCTOPUS_HERO_KPIS: HeroKpi[] = [
  { label: '2025 냉동 문어 수입 (HSK 0307521000)', value: 4502, unit: '(톤)', accent: OCTOPUS_ACCENT },
  { label: '냉동 문어 수입 단가 2025', value: 9.48, unit: '(달러/kg)', decimals: 2 },
  { label: '위판 단가 2025', value: 23557, unit: '(원/kg)' },
  { label: '문어 원료 국내 제조 제품', value: 1955, unit: '(건)' },
];

function Table({ caption, head, rows }: { caption?: string; head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        {caption && <caption className={styles.factCaption}>{caption}</caption>}
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, index) => (
            <tr key={index}>
              {cells.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <span className={styles.factNote}>{children}</span>;
}

function RosterTable({
  caption,
  rows,
  placeLabel,
  sizeLabel,
}: {
  caption: string;
  rows: OctopusRosterRow[];
  placeLabel: string;
  sizeLabel: string;
}) {
  return (
    <Table
      caption={caption}
      head={['회사', placeLabel, sizeLabel]}
      rows={rows.map((r) => [
        <>
          {r.회사}
          <Note>{r.내용}</Note>
        </>,
        r.위치,
        <>
          {r.규모}
          <Note>
            {r.성격} · {r.출처}
          </Note>
        </>,
      ])}
    />
  );
}

/** 보고서 §04 어종 도판의 코드 줄. 문어 칸은 참문어·대문어 두 줄이다. */
const SPECIES_CODES = [
  ['참문어', 'Octopus vulgaris · OCC', '140412 문어류', '0307521000', '범위 내'],
  ['대문어', 'Enteroctopus dofleini · OQF', '140412 문어류(참문어와 합산)', '0307521000', '범위 내'],
  ['낙지', 'Octopus minor · OQI', '140409 낙지류', '0307522000', '대조·범위 밖'],
  ['주꾸미', 'Amphioctopus fangsiao · OFY', '140415 주꾸미', '0307523000', '대조·범위 밖'],
];

const auction2025 = DATA.위판.연도별.find((r) => r.연도 === '2025');

/** 발행본 표를 그대로 그린다. 숫자는 문자열 그대로이고 재계산하지 않는다. */
function ExtractedReportTable({ table }: { table: IntakeReportTable }) {
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
 * 최종 해부보고서 표를 설명 문장 옆의 원래 자리로 되돌린다.
 *
 * 한 단계에 절이 여럿 붙으므로 절별 오프셋 구간을 따로 둔다. 그렇지 않으면 뒤 절의
 * 표가 첫 절 문장 사이에 섞인다. 손으로 만든 인터랙티브 차트는 chartSlots에 남아
 * 각 단계 끝 「근거」에서 그대로 렌더된다.
 */
function inlineReport(n: StageNarrative): StageNarrative {
  return industryInlineReport('octopus', n, {
    telemetry: REPORT_SYNC,
    source: '한국 문어 산업 해부',
    renderTable: (table) => <ExtractedReportTable table={table} />,
  });
}

const REPORT_STAGES = new Map(proseStages('octopus').map((stage) => [stage.key, stage]));

/**
 * 해부보고서 원문에 대응 절이 없는 단계. s09(신라에스지 내부 검토)는 객관 시점의
 * 최종 보고서에서 빠졌으므로 기존 손 작성 서술을 그대로 두고, 단계 머리에 「보고서 밖 사내 분석」을
 * 단다(2026-10-11 사용자 결정 6).
 */
export const OCTOPUS_HANDWRITTEN_STAGES = new Set(['s09']);

/**
 * 단계 순서·제목·질문은 기존 화면 값을 쓰고(발주서 허용), 서술은 전부 원문에서 온다.
 */
export const OCTOPUS_REPORT_NARRATIVES: StageNarrative[] = OCTOPUS_NARRATIVES.map(
  (hand, index) => {
    if (OCTOPUS_HANDWRITTEN_STAGES.has(hand.key)) return { ...hand, badge: '보고서 밖 사내 분석' };
    const stage = REPORT_STAGES.get(hand.key);
    if (!stage) throw new Error(`문어 보고서에 ${hand.key} 단계 서술이 없다`);
    return inlineReport({
      ...stage,
      numeral: String(index + 1).padStart(2, '0'),
      title: hand.title,
      question: hand.question,
      paragraphs: stage.paragraphs.map(dropEmptyLabel),
      flow: stage.flow?.map((item) => item.kind === 'head' ? { ...item, text: dropEmptyLabel(item.text) } : item),
    });
  },
);

export const OCTOPUS_REPORT_BRIEFING = proseBriefing('octopus');

export const OCTOPUS_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s01: [
    {
      title: '문어라는 이름의 세 칸',
      caption:
        '문어 칸은 참문어·대문어 두 줄이고 세번은 0307521000 하나다. FAO는 네 종을 OCT 한 줄로 받고, 조제 1605550000은 종을 가르지 않는다.',
      telemetry: { status: 'STATIC' as const, syncDate: '범위 잠금 2026-09-02' },
      span: 'full',
      render: () => (
        <Table
          head={['종', '학명 · ASFIS', 'KOSIS 품종', '관세청 HSK10 냉동', '범위']}
          rows={SPECIES_CODES}
        />
      ),
      sourceLine: 'ASFIS 2026.1 · KOSIS DT_1EW0004 · 관세청 HSK10 · 보고서 제2판 §04',
    },
  ],
  s02: [
    {
      title: '세계 문어류 어획 2015~2024 (톤)',
      caption:
        '굵은 파랑 선이 세계 합계, 주황이 중국, 청록이 모로코다. 한국은 FAO 신고가 3종 합이라 그리지 않았다.' +
        chartSource('FAO FishStat 2026.1.0', '2024년 확정'),
      telemetry: FAO_SYNC,
      render: () => <OctopusWorldChart data={DATA} />,
    },
  ],
  s03: [
    {
      title: '국내 위판 일별 단가 (원/kg)',
      caption: auctionCaption('문어') + chartSource(auctionMeta.출처, String(auctionMeta.기간)),
      telemetry: { status: 'SYNCED' as const, syncDate: String(auctionMeta.기간) },
      render: () => <AuctionPriceChart keyword="문어" />,
      sourceLine: `출처: ${auctionMeta.출처} · 조회 ${auctionMeta.조회일} · scripts/sync_mof_auction.py`,
    },
    {
      title: '연근해 생산 2010~2025 (톤)',
      caption:
        '실선이 문어류(참문어+대문어), 점선이 낙지류와 주꾸미다. 품종이 달라 합계 선을 그리지 않는다.' +
        chartSource('KOSIS 어업생산동향 DT_1EW0004', '2025년 연간'),
      telemetry: KOSIS_SYNC,
      render: () => <OctopusKoreaChart data={DATA} />,
    },
    {
      title: '위판 물량과 단가 2010~2026 (톤·원/kg)',
      caption: `막대가 위판 물량, 선이 단가다. 2025년 ${fmt(auction2025?.물량 ?? 0)}톤·${fmt(auction2025?.단가 ?? 0)}원/kg. 마지막 막대는 2026년 1~6월 누계라 짧다.${chartSource('수협 계통판매', '2026년 6월')}`,
      telemetry: FIPS_SYNC,
      render: () => <OctopusAuctionChart data={DATA} />,
    },
  ],
  s04: [
    {
      title: '문어 월별 수출입과 무역수지 (백만 달러)',
      caption: tradeCaption('문어') + chartSource(tradeMeta.출처, String(tradeMeta.기간)),
      telemetry: { status: 'SYNCED' as const, syncDate: String(tradeMeta.기간) },
      render: () => <TradeBalanceChart keyword="문어" />,
      sourceLine: `출처: ${tradeMeta.출처} · 조회 ${tradeMeta.조회일} · scripts/sync_mof_trade.py`,
    },
    {
      title: '냉동 문어 수입 2019~2025 (톤)',
      caption:
        '문어 전용 세번 0307521000. 2025년 수입액은 보고서 4,270만 달러, 원장 4,268만 달러(반올림 차)다. 조제 문어류와 한 축에 두지 않는다.' +
        chartSource('관세청 HSK10 0307521000', '2025년 확정'),
      telemetry: KCS_SYNC,
      render: () => <OctopusFrozenTradeChart data={DATA} />,
    },
    {
      title: '조제 문어류 수입 2022~2025 (톤)',
      caption:
        '종 분리 없는 세번 1605550000. 2022년에 생겨 그 전 칸이 없다. 2024년은 원장 6,305,473 kg(6,305 t)으로 보고서 값과 같다. 냉동 문어와 한 축에 두지 않는다.' +
        chartSource('관세청 HSK10 1605550000', '2025년 확정'),
      telemetry: KCS_SYNC,
      render: () => <OctopusPreparedTradeChart data={DATA} />,
    },
  ],
  s06: [
    {
      title: '카테고리별 제품·제조사·생산량',
      caption: `범위 내 ${fmt(DATA.제품전수.합계.제품)}건, 제조사 ${fmt(DATA.제품전수.합계.제조사)}곳. 생산량은 식약처 원문 단위가 없다(관행상 kg). 0은 그 해 보고가 없다는 뜻이다.`,
      telemetry: MFDS_SYNC,
      span: 'full',
      render: () => (
        <Table
          head={['카테고리', '제품', '제조사', '문어 주원료', '2025 보고', '생산 2024', '생산 2025']}
          rows={[
            ...DATA.제품전수.카테고리.map((r) => [
              `${r.코드} ${r.카테고리}`,
              fmt(r.제품),
              fmt(r.제조사),
              fmt(r.주원료),
              fmt(r.보고2025),
              fmt(r.생산2024),
              fmt(r.생산2025),
            ]),
            [
              '합계',
              fmt(DATA.제품전수.합계.제품),
              fmt(DATA.제품전수.합계.제조사),
              fmt(DATA.제품전수.합계.주원료),
              fmt(DATA.제품전수.합계.보고2025),
              fmt(DATA.제품전수.합계.생산2024),
              fmt(DATA.제품전수.합계.생산2025),
            ],
          ]}
        />
      ),
    },
    {
      title: '2025 생산 상위 제품',
      caption: '제품 단위 생산실적 상위 6개. 원문 단위 미표기, 합산하지 않는다.',
      telemetry: MFDS_SYNC,
      span: 'full',
      render: () => (
        <Table
          head={['제품', '제조', '카테고리', '생산 2025']}
          rows={DATA.제품전수.상위제품2025.map((r) => [r.제품, r.제조, r.카테고리, fmt(r.생산2025)])}
        />
      ),
    },
    {
      title: '제품명 키워드별 등록·생산 추이',
      caption: '제품명 키워드로 묶었다. 생산량은 원문 단위가 없고 1위 업체 실적의 단위 오기 가능성이 섞여 있어 배수를 시장 성장률로 읽지 않는다.',
      telemetry: MFDS_SYNC,
      span: 'full',
      render: () => (
        <Table
          head={['형태', '제품 수', '허가 2023~26', '생산 2023', '생산 2025']}
          rows={DATA.키워드추이.rows.map((r) => [r.형태, fmt(r.제품), fmt(r.허가2023_26), fmt(r.생산2023), fmt(r.생산2025)])}
        />
      ),
      sourceLine: '식약처 C002+I0300 범위 내 1,955건 · 보고서 §06 표',
    },
  ],
  s07: [
    {
      title: '등록 제품 수 상위',
      caption: RESEARCH.등록상위.요지,
      telemetry: MFDS_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="등록 제품 수 순. 등록만 남은 라인은 수탁 후보이자 경쟁자다."
          rows={RESEARCH.등록상위.rows}
          placeLabel="소재지"
          sizeLabel="생산 (성격)"
        />
      ),
    },
  ],
  s08: [
    {
      title: '온라인 소매 표본 100 g 단가 (원)',
      caption:
        '표시가를 표시 중량으로 나눈 값이다. 100 g당 500원 미만과 30,000원 초과는 이상치로 뺐다. 위판·수입 단가와 나누지 않는다.',
      telemetry: { status: 'STATIC' as const, syncDate: '표본 2026-09-02' },
      span: 'full',
      render: () => (
        <Table
          head={['형태', '상품 수', '최저', '중앙값', '최고', '비고']}
          rows={DATA.소매표본.rows.map((r) => [r.형태, r.상품수, fmt(r.최저), fmt(r.중앙), fmt(r.최고), r.비고])}
        />
      ),
      sourceLine: '컬리 33 · 쿠팡 40 · SSG 138 = 211개. 보고서 §07 표',
    },
  ],
  s09: [
    {
      title: 'OEM 제품 후보 13개 (내부 검토)',
      caption: '우선순위 A는 즉시 제안, B는 2차, C는 보류다. 시장 규모·성장·경쟁 공백·원료 경제성 네 기준의 정성 판단이며 매출 추정은 없다.',
      telemetry: OLD_REPORT_SYNC,
      span: 'full',
      render: () => (
        <Table
          head={['우선', '제품', '시장 근거', '주 채널', '생산 방식']}
          rows={DATA.OEM후보.rows.map((r) => [r.우선, r.제품, r.근거, r.채널, r.방식])}
        />
      ),
      sourceLine: '보고서 §09 표 · 생산량은 식약처 원문 단위 미표기',
    },
    {
      title: '문어 제품 형태별 설비 적합성 (내부 검토)',
      caption: '신라에스지 부산공장 기준 판정이다. 문어 생산 실적이 아니며, 가능 판정도 시험 전 단계다.',
      telemetry: OLD_REPORT_SYNC,
      span: 'full',
      render: () => (
        <Table
          head={['제품 형태', '필요 공정', '근거', '판정']}
          rows={DATA.설비적합.rows.map((r) => [r.형태, r.공정, r.근거, r.판정])}
        />
      ),
      sourceLine: 'DART 사업보고서 제49기 · 국립수산물품질관리원 등록부 · 보고서 §08 표',
    },
    {
      title: '신라에스지 공시 요약 (내부 검토)',
      caption: RESEARCH.내부검토.요지,
      telemetry: OLD_REPORT_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="내부 검토. 가동률·매출은 회사 전체와 골뱅이·소시지 라인 값이며 문어 실적이 아니다."
          rows={RESEARCH.내부검토.rows}
          placeLabel="소재지"
          sizeLabel="규모 (성격)"
        />
      ),
    },
  ],
};

const SPEC: CommoditySpec = {
  // 2026-09-10 사용자 지시: 단계를 탭으로 넘기지 않고 한 페이지에 전부 출력한다.
  continuous: true,
  key: 'octopus',
  reportHref: '/reports/industry/octopus-2026-10.html',
  title: '문어',
  subtitle:
    '문어 산업 해부 · 문어라는 이름의 세 칸 - 종·세계·국내·교역·달력·가공·명의·매대와 내부 검토',
  accent: OCTOPUS_ACCENT,
  primaryKpi: OCTOPUS_HERO_KPIS[0],
  secondaryKpis: OCTOPUS_HERO_KPIS.slice(1),
  // 히어로 띠도 원문 01절·03~06절 값이다(옛 띠의 2026년 1~5월·7월·1~6월 값은 원문에 없다).
  stripItems: [
    { eyebrow: '기준', title: '문어 전용 세번', body: '0307521000 냉동 문어' },
    { eyebrow: '2026', title: '냉동 문어 1~8월', body: '3,123 t (+18.3%) · 10.47 USD/kg' },
    { eyebrow: '2026', title: '위판 단가 1~7월 평균', body: '24,360 원/kg' },
    { eyebrow: '조제', title: '2025 조제 문어 수입', body: '5,995 t · 중국 90.1%' },
    { eyebrow: '자원', title: '모리타니 2025 어획', body: '42,013 t · TAC 30,700 t의 137%' },
    { now: true, eyebrow: '지금', title: '연근해 문어류 2026년 1~8월', body: '5,041.0 t (+5.4%)' },
  ],
  briefing: OCTOPUS_REPORT_BRIEFING,
  narratives: OCTOPUS_REPORT_NARRATIVES,
  chartSlots: OCTOPUS_CHART_SLOTS,
  sourceNotes: OCTOPUS_SOURCE_NOTES,
  sourceMeta: [
    '본문·표 해부보고서 2026년 10월판 · 손 작성 단계·위젯 보고서 제2판 2026-09-03(자료 기준 2026-09-02)',
    'FAO FishStat 2026.1.0',
    'KOSIS 2026-07 잠정',
    '수협 계통판매 2026-06',
    '관세청 2026-07',
    '식약처 전수 2026-09-02',
    `갱신 ${String(DATA._meta.생성일 ?? '')}`,
  ].join(' · '),
  insets: {
    AfterHero: () => <MarketRegimeBand commodityKey="octopus" />,
  },
};

export interface OctopusIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function OctopusIndustryDashboard({ heroOnly = false }: OctopusIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
