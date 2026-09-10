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
import {
  OCTOPUS_BRIEFING_POINTS,
  OCTOPUS_NARRATIVES,
  OCTOPUS_SOURCE_NOTES,
} from '@/lib/octopus-industry-content';
import styles from './TunaIndustryDashboard.module.css';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
} from './CommodityIndustryDashboard';
import {
  OctopusAuctionChart,
  OctopusFrozenTradeChart,
  OctopusKoreaChart,
  OctopusPreparedTradeChart,
  OctopusWorldChart,
} from './OctopusCharts';

const DATA = getOctopusIndustryData();
const RESEARCH = getOctopusCompanyResearch();

const FAO_SYNC = { status: 'STATIC' as const, syncDate: 'FishStat 2024년 확정' };
const KOSIS_SYNC = { status: 'STATIC' as const, syncDate: 'KOSIS 2025년(연간)' };
const FIPS_SYNC = { status: 'STATIC' as const, syncDate: '수협 계통판매 2026년 6월' };
const KCS_SYNC = { status: 'STATIC' as const, syncDate: '관세청 2025년 확정' };
const MFDS_SYNC = { status: 'STATIC' as const, syncDate: '식약처 2026-09-02 전수' };
const IMP_SYNC = { status: 'STATIC' as const, syncDate: '수입신고 2025-09~2026-09' };
const REPORT_SYNC = { status: 'STATIC' as const, syncDate: '보고서 제2판 2026-09-03' };

const fmt = (value: number) => value.toLocaleString('ko-KR');

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

const trade2025 = DATA.수입.연도별.find((r) => r.연도 === '2025');
const auction2025 = DATA.위판.연도별.find((r) => r.연도 === '2025');

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
      sourceLine: 'ASFIS 2026.1 · KOSIS DT_1EW0004 · 관세청 HSK10 · 보고서 §04',
    },
  ],
  s02: [
    {
      title: '세계 문어류 어획 2015~2024 (톤)',
      caption:
        '굵은 자주 선이 세계 합계, 호박이 중국, 파랑이 모로코다. 한국은 FAO 신고가 3종 합이라 그리지 않았다.',
      telemetry: FAO_SYNC,
      span: 'full',
      render: () => <OctopusWorldChart data={DATA} />,
    },
    {
      title: '2024 생산 상위 10개국 (톤)',
      caption: '해역 행을 더해 집계한 FAO 값이다. 한국 줄은 문어류·낙지·주꾸미 3종 합이라 순위 비교에 쓰지 않는다.',
      telemetry: FAO_SYNC,
      span: 'full',
      render: () => (
        <Table
          head={['국가', '어획량 (톤)']}
          rows={DATA.세계어획.국가2024.map((r) => [
            <>
              {r.국가}
              {r.주석 && <Note>{r.주석}</Note>}
            </>,
            fmt(r.어획량),
          ])}
        />
      ),
    },
    {
      title: '2024 주요 수입 시장 비교',
      caption: 'HS6 문어류 바스켓이라 낙지·주꾸미가 들어 있다. 한국 단가가 낮은 이유가 여기에 있다. 공급국 비중은 표마다 기준 연도가 다르다.',
      telemetry: { status: 'STATIC' as const, syncDate: 'UN Comtrade 2024 총계행' },
      span: 'full',
      render: () => (
        <Table
          head={['시장', '수입액 (백만 달러)', '물량 (톤)', '단가 (달러/kg)', '공급국·특징']}
          rows={DATA.시장비교.rows.map((r) => [r.시장, r.수입액.toFixed(1), fmt(r.물량), r.단가.toFixed(2), r.특징])}
        />
      ),
      sourceLine: 'UN Comtrade 총계행(motCode 0 · partner2 World · customsCode C00) · FAO GLOBEFISH · EUMOFA · 보고서 §02 표',
    },
    {
      title: '한국 문어류 HS6 바스켓 수입 2021~2024',
      caption: '물량은 4년 내내 세계 1위, 금액은 2위다. 바스켓이라 문어 단독 순위가 아니다.',
      telemetry: { status: 'STATIC' as const, syncDate: 'UN Comtrade 한국 신고' },
      span: 'full',
      render: () => (
        <Table
          head={['연도', '수입액 (백만 달러)', '금액 순위', '물량 (톤)', '물량 순위', '단가 (달러/kg)']}
          rows={DATA.시장비교.한국연도별.map((r) => [r.연도, r.수입액.toFixed(1), r.금액순위, fmt(r.물량), r.물량순위, r.단가.toFixed(2)])}
        />
      ),
    },
  ],
  s03: [
    {
      title: '연근해 생산 2010~2025 (톤)',
      caption: '실선이 문어류(참문어+대문어), 점선이 낙지류와 주꾸미다. 품종이 달라 합계 선을 그리지 않는다.',
      telemetry: KOSIS_SYNC,
      render: () => <OctopusKoreaChart data={DATA} />,
    },
    {
      title: '위판 물량과 단가 2010~2026 (톤·원/kg)',
      caption: `막대가 위판 물량, 선이 단가다. 2025년 ${fmt(auction2025?.물량 ?? 0)}톤·${fmt(auction2025?.단가 ?? 0)}원/kg. 마지막 막대는 2026년 1~6월 누계라 짧다.`,
      telemetry: FIPS_SYNC,
      render: () => <OctopusAuctionChart data={DATA} />,
    },
  ],
  s04: [
    {
      title: '냉동 문어 수입 2019~2025 (톤)',
      caption:
        '문어 전용 세번 0307521000. 2025년 수입액은 보고서 4,270만 달러, 원장 4,268만 달러(반올림 차)다. 조제 문어류와 한 축에 두지 않는다.',
      telemetry: KCS_SYNC,
      span: 'full',
      render: () => <OctopusFrozenTradeChart data={DATA} />,
    },
    {
      title: '조제 문어류 수입 2022~2025 (톤)',
      caption:
        '종 분리 없는 세번 1605550000. 2022년에 생겨 그 전 칸이 없다. 2024년은 원장 6,305,473 kg(6,305 t)이고 보고서는 6,306 t로 적었다(차이 원인 미확인). 냉동 문어와 한 축에 두지 않는다.',
      telemetry: KCS_SYNC,
      span: 'full',
      render: () => <OctopusPreparedTradeChart data={DATA} />,
    },
    {
      title: '2025 원산지별 수입 (달러·톤·달러/kg)',
      caption: `냉동 문어 ${fmt(trade2025?.냉동문어_톤 ?? 0)}톤과 조제 문어류 ${fmt(trade2025?.조제문어류_톤 ?? 0)}톤을 세번별로 따로 적었다. 두 칸을 더하지 않는다.`,
      telemetry: KCS_SYNC,
      span: 'full',
      render: () => (
        <Table
          head={['세번', '원산지', '수입액 (달러)', '물량 (톤)', '단가 (달러/kg)']}
          rows={[
            ...DATA.수입.냉동원산지2025.map((r) => ['냉동 문어 0307521000', r.국가, fmt(r.수입액), fmt(r.수입량톤), r.단가.toFixed(2)]),
            ...DATA.수입.조제원산지2025.map((r) => ['조제 문어류 1605550000', r.국가, fmt(r.수입액), fmt(r.수입량톤), r.단가.toFixed(2)]),
          ]}
        />
      ),
      sourceLine: '관세청 nitemtrade HSK10 월별×국가 합산. 필리핀은 자숙 완제품, 모리타니는 생 원물이다.',
    },
  ],
  s05: [
    {
      title: '12개월 원료 달력',
      caption:
        '위판 물량·위판가·냉동 수입은 2023~2025 평균 지수(연평균 100)다. 모로코·모리타니 어기는 GLOBEFISH와 현지 언론이 인용한 정부 결정이다.',
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <Table
          head={['월', '국내 금어기', '위판 물량', '위판가', '모로코', '모리타니', '냉동 수입']}
          rows={DATA.원료달력.rows.map((r) => [r.월, r.금어기, r.위판물량, r.위판가, r.모로코, r.모리타니, r.냉동수입])}
        />
      ),
      sourceLine: '수협 계통판매 월별 · 관세청 0307521000 월별 중량 · 보고서 §04 표',
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
      title: '국내 가공 상위 15곳',
      caption: RESEARCH.국내가공.요지,
      telemetry: MFDS_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="식약처 생산실적 2025. 원문 단위 미표기. 수입 직접은 수입식품정보마루 신고 건수다."
          rows={RESEARCH.국내가공.rows}
          placeLabel="소재지"
          sizeLabel="생산 (성격)"
        />
      ),
    },
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
    {
      title: '수입 신고 명의 상위 10곳',
      caption: RESEARCH.수입명의.요지,
      telemetry: IMP_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="수입식품정보마루 처리일 2025-09-01~2026-09-02. 건수는 물량이 아니다."
          rows={RESEARCH.수입명의.rows}
          placeLabel="제조국 (건)"
          sizeLabel="건수 (성격)"
        />
      ),
    },
    {
      title: '해외 제조업소 상위 10곳',
      caption: RESEARCH.해외가공.요지,
      telemetry: IMP_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="해외제조업소별 신고 건수와 주 품목유형. 건수는 물량이 아니다."
          rows={RESEARCH.해외가공.rows}
          placeLabel="제조국"
          sizeLabel="건수 (성격)"
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
      telemetry: REPORT_SYNC,
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
      telemetry: REPORT_SYNC,
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
      telemetry: REPORT_SYNC,
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
  title: '문어',
  subtitle:
    '문어 산업 해부 · 문어라는 이름의 세 칸 - 종·세계·국내·교역·달력·가공·명의·매대와 내부 검토',
  accent: OCTOPUS_ACCENT,
  primaryKpi: {
    label: '2025 냉동 문어 수입 (HSK 0307521000)',
    value: trade2025?.냉동문어_톤 ?? 0,
    unit: '(톤)',
    accent: OCTOPUS_ACCENT,
  },
  secondaryKpis: [
    { label: '냉동 문어 수입 단가 2025', value: trade2025?.냉동문어_단가 ?? 0, unit: '(달러/kg)', decimals: 2 },
    { label: '위판 단가 2025', value: auction2025?.단가 ?? 0, unit: '(원/kg)' },
    { label: '국내 제조 문어 가공식품', value: DATA.제품전수.합계.제품, unit: '(제품)' },
  ],
  stripItems: [
    { eyebrow: '기준', title: '문어 전용 세번', body: '0307521000 냉동 문어' },
    { eyebrow: '2026', title: '냉동 문어 1~5월 누계', body: '1,888 t · 10.48 USD/kg' },
    { eyebrow: '2026', title: '냉동 문어 7월', body: '585 t' },
    { eyebrow: '2026', title: '위판 1~6월', body: '1,664 t · 27,153 원/kg' },
    { eyebrow: '휴어', title: '모리타니 입항 5월→7월', body: '285 t → 124 t' },
    { now: true, eyebrow: '지금', title: '연근해 문어류 2026.07 잠정', body: '1,569 t' },
  ],
  briefing: OCTOPUS_BRIEFING_POINTS,
  narratives: OCTOPUS_NARRATIVES,
  chartSlots: OCTOPUS_CHART_SLOTS,
  sourceNotes: OCTOPUS_SOURCE_NOTES,
  sourceMeta: [
    '보고서 제2판 2026-09-03 · 자료 기준 2026-09-02',
    'FAO FishStat 2026.1.0',
    'KOSIS 2026-07 잠정',
    '수협 계통판매 2026-06',
    '관세청 2026-07',
    '식약처 전수 2026-09-02',
    `갱신 ${String(DATA._meta.생성일 ?? '')}`,
  ].join(' · '),
};

export interface OctopusIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function OctopusIndustryDashboard({ heroOnly = false }: OctopusIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
