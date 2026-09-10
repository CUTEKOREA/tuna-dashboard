/**
 * 「시장 이해 > 골뱅이」.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있다. 여기는 차트 배치와 히어로 수치만 정한다.
 *
 * ⚠ 히어로의 주 수치를 「세계 골뱅이 생산량」이라 부르지 않는다. 네 개 과(科)를 더한 값이고,
 *   아카이브 원본이 그 이름으로 부르는 것을 금지했다. 라벨은 「다섯 과(科) 합계」로 둔다.
 */
'use client';

import React from 'react';
import {
  TraderTable,
  CanneryCountryTable,
  BrandMarketTable,
} from './CompanyResearchTables';
import { getWhelkCompanyResearch } from '@/lib/data/valuechain-companies';
import { WHELK_COMPANY_RESEARCH as rawWhelkResearch } from '@/lib/data/whelk-company-research';

import { getWhelkIndustryData } from '@/lib/data/commodity-industry';
import { seriesRoles } from '@/lib/data/whelk-country-series';
import { WHELK_ACCENT } from '@/lib/whelk-chart-colors';
import {
  WHELK_BRIEFING_POINTS,
  WHELK_NARRATIVES,
  WHELK_SOURCE_NOTES,
} from '@/lib/whelk-industry-content';
import styles from './TunaIndustryDashboard.module.css';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
} from './CommodityIndustryDashboard';
import {
  WhelkBuccinumChart,
  WhelkGroupChart,
  WhelkImportChart,
  WhelkKoreaSeriesChart,
  WhelkSeriesUnitChart,
  WhelkSeriesWindowsChart,
} from './CommodityCharts';

const DATA = getWhelkIndustryData();
const FAO_SYNC = { status: 'STATIC' as const, syncDate: `${DATA.요약.기준연도}년 확정` };
const KCS_SYNC = {
  status: 'STATIC' as const,
  syncDate: `${DATA.한국수입._meta.기준연도}년 확정`,
};
const KOSIS_SYNC = { status: 'STATIC' as const, syncDate: '2025년(연간 계열)' };
const REPORT_SYNC = { status: 'STATIC' as const, syncDate: '보고서 2026-08-25' };
const MMO_SYNC = { status: 'STATIC' as const, syncDate: 'MMO 2026년 7월 잠정' };

const WHELK_RESEARCH = getWhelkCompanyResearch();

type RosterBlock = {
  요지: string;
  rows: Array<{ 회사: string; 위치: string; 규모: string; 내용: string; 성격: string; 출처: string }>;
};
type ProductBlock = {
  요지: string;
  rows: Array<{ 제품: string; 제조: string; 생산량: string; 종: string; 출처: string }>;
};
const RESEARCH_EXT = rawWhelkResearch as typeof rawWhelkResearch & {
  국내가공: RosterBlock;
  수입명의: RosterBlock;
  제품: ProductBlock;
  위판조합: RosterBlock;
  급식낙찰: RosterBlock;
};

function PlainFactsTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>{caption}</caption>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.join('|')}>
              {r.map((c, i) => (
                <td key={`${r[0]}-${i}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
            <tr key={r.회사}>
              <td>
                {r.회사}
                <span className={styles.factNote}>{r.내용}</span>
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

function ProductTable({ rows }: { rows: ProductBlock['rows'] }) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>
          2025년 품목제조보고×생산실적 표 23. 제품명 기준 참골뱅이 0 kg. 합산하지 않는다.
        </caption>
        <thead>
          <tr>
            <th>제품</th>
            <th>제조</th>
            <th>생산량</th>
            <th>종</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.제조}-${r.제품}`}>
              <td>{r.제품}</td>
              <td>{r.제조}</td>
              <td>{r.생산량}</td>
              <td>
                {r.종}
                <span className={styles.factNote}>{r.출처}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SERIES_SYNC = { status: 'STATIC' as const, syncDate: '관세청 2026년 1~7월' };

/** 시리즈 6개국 역할. 차트 없이 표로 그린다 — 서버 렌더에서 수치가 그대로 나와야 한다. */
function SeriesRolesTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>국가</th>
            <th>역할</th>
            <th>한국 창구</th>
            <th>근거</th>
          </tr>
        </thead>
        <tbody>
          {seriesRoles.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td>{r.role}</td>
              <td>{r.korea}</td>
              <td>{r.scope}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.factNote}>
        생산 톤은 FishStat 참골뱅이·피뿔고둥 그룹이고, 수입 창구는 관세청 제품중량이다. 둘을 빼지
        않는다. 1605.59는 골뱅이 전용이 아니다.
      </p>
    </div>
  );
}

export const WHELK_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s01: [
    {
      title: '과(科)별 생산량 (톤)',
      caption:
        '호박색이 양식, 나머지가 어획이다. 장미색 막대가 참골뱅이류 - 한국이 통조림으로 먹는 그 종이고, 양식이 0이라 막대 전체가 자연산이다.',
      telemetry: FAO_SYNC,
      render: () => <WhelkGroupChart data={DATA} />,
    },
  ],
  s02: [
    {
      title: '공급 기업 - 누가 잡고 누가 파는가',
      caption: WHELK_RESEARCH.공급.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <TraderTable rows={WHELK_RESEARCH.공급.rows} />,
    },
    {
      title: '참골뱅이 어획 상위국 (톤)',
      caption: '열 나라를 다 세워도 한국은 나오지 않는다. 어획량이 0이기 때문이다.',
      telemetry: FAO_SYNC,
      render: () => <WhelkBuccinumChart data={DATA} />,
    },
    {
      title: '2024 어획 상위 8국',
      caption:
        'FAO Capture v2026.1.0 표 3. 활어중량. 종을 적는 나라와 적지 않는 나라가 갈린다. 참골뱅이속만 세면 한국은 0 t다.',
      telemetry: FAO_SYNC,
      span: 'full',
      render: () => (
        <PlainFactsTable
          caption="보고서 §03 표 3. 활어중량. FAO와 관세청 제품중량을 더하지 않는다."
          headers={['순위', '국가', '어획량', '종 구성']}
          rows={[
            ['1', '영국', '16,511.020 t', 'B. undatum 100%'],
            ['2', '멕시코', '14,969.655 t', '분류없음 100%'],
            ['3', '한국', '9,669.783 t', '분류없음 100%'],
            ['4', '프랑스', '7,698.745 t', 'B. undatum 100%'],
            ['5', '튀르키예', '6,961.600 t', 'R. venosa 100%'],
            ['6', '러시아', '6,233.000 t', '분류없음 66.5% · R. venosa 33.5%'],
            ['7', '캐나다', '5,410.208 t', 'B. undatum 100%'],
            ['8', '아일랜드', '4,590.375 t', 'B. undatum 100%'],
          ]}
        />
      ),
    },
  ],
  s03: [
    {
      title: '국내 생산 통계 - 코드가 바뀐 자리 (톤)',
      caption:
        '두 선이 2009년과 2010년 사이에서 끊긴다. 통계 코드가 바뀐 자리라 잇지 않았다. 점선인 소라는 다른 종이므로 합산 대상이 아니다.',
      telemetry: KOSIS_SYNC,
      span: 'full',
      render: () => <WhelkKoreaSeriesChart data={DATA} />,
    },
  ],
  s04: [
    {
      title: '국가별 가공 거점과 기업',
      caption: WHELK_RESEARCH.가공.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <CanneryCountryTable rows={WHELK_RESEARCH.가공.rows} />,
    },
    {
      title: '브랜드와 점유율 (성격 구분)',
      caption: WHELK_RESEARCH.브랜드.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <BrandMarketTable rows={WHELK_RESEARCH.브랜드.rows} />,
    },
    {
      title: '한국 수입 상대국별 규모와 단가 (백만 달러·달러/톤)',
      caption:
        '막대는 수입액, 선은 톤당 단가다. 단가가 3~5배 벌어지는 것은 같은 코드 안에 다른 종이 들어 있다는 신호다.',
      telemetry: KCS_SYNC,
      render: () => <WhelkImportChart data={DATA} />,
    },
    {
      title: '세 갈래 수입액 (USD)',
      caption:
        '관세청 표 8. 조제 1605.59 / 냉동 0307.92 / 활·신선 0307.91. 2026년은 1~7월 누계. 연환산하지 않는다.',
      telemetry: KCS_SYNC,
      span: 'full',
      render: () => (
        <PlainFactsTable
          caption="보고서 §05 표 8. 세 갈래를 더해 골뱅이 수입이라 부르지 않는다."
          headers={['연도', '1605.59', '0307.92', '0307.91']}
          rows={[
            ['2020', '103,945,209', '14,973,155', '868,875'],
            ['2021', '90,513,149', '34,522,599', '761,341'],
            ['2022', '80,492,358', '53,637,372', '749,953'],
            ['2023', '68,983,613', '63,991,504', '1,991,546'],
            ['2024', '58,504,760', '55,642,703', '1,705,049'],
            ['2025', '52,359,695', '86,488,498', '1,546,951'],
            ['2026 (1~7월)', '17,880,012', '56,639,814', '864,786'],
          ]}
        />
      ),
    },
  ],
  s05: [
    {
      title: '시리즈 6개국 역할',
      caption:
        '생산 순위와 수입 창구를 한 칸에 섞지 않았다. 어획 2위 프랑스가 이 세번에 없는 것이 이 표의 요지다.',
      telemetry: { status: 'STATIC' as const, syncDate: 'FishStat 2024 · 관세청 2026년 1~7월' },
      span: 'full',
      render: () => <SeriesRolesTable />,
    },
    {
      title: '수입 창구 물량 (톤)',
      caption:
        '막대는 HS 1605.59 2026년 1~7월 제품중량이다. 장미색이 영국 - 이미 들어와 있는 본진이다. 프랑스 0은 어획이 없다는 뜻이 아니라 이 세번 추출에 이름이 없다는 뜻이다. 일곱 달이라 위 생산 통계·04단계 2024년 표와 더할 수 없다.',
      telemetry: SERIES_SYNC,
      span: 'full',
      render: () => <WhelkSeriesWindowsChart />,
    },
    {
      title: '수입 창구 단가 (달러/톤)',
      caption:
        '물량이 있는 네 나라만 그린다. 캐나다 16,553이 가장 높고 중국 7,189이 가장 낮다. 프랑스 단가를 0으로 만들지 않는다. 2024년 캐나다 5,340은 소량이라 쓰지 않는다.',
      telemetry: SERIES_SYNC,
      render: () => <WhelkSeriesUnitChart />,
    },
    {
      title: '1605.59 세 바구니 (USD)',
      caption:
        '관세청 HSK8 표 10. 북해축 16055910 / 소라 16055920 / 흑해·서아프리카축 16055990. 세 바구니가 같은 해에 같은 방향으로 움직인 적이 없다. HS6 분모로 점유율을 내지 않는다.',
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <PlainFactsTable
          caption="보고서 §06 표 10. 2026년은 1~7월 누계."
          headers={['연도', '16055910', '16055920', '16055990']}
          rows={[
            ['2020', '67,616,279', '4,257,303', '32,071,627'],
            ['2021', '60,277,049', '5,988,267', '24,247,833'],
            ['2022', '49,589,319', '6,428,128', '24,474,911'],
            ['2023', '36,891,883', '4,179,633', '27,912,097'],
            ['2024', '40,064,937', '713,700', '17,726,123'],
            ['2025', '43,195,935', '119', '9,163,641'],
            ['2026 (1~7월)', '13,866,833', '17,727', '3,995,452'],
          ]}
        />
      ),
    },
  ],
  s06: [
    {
      title: '국내 가공 상위 업체',
      caption: RESEARCH_EXT.국내가공.요지,
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="식약처 생산실적 2025 주원료·수산물가공품. 2020년 튐은 추세선에 넣지 않는다."
          rows={RESEARCH_EXT.국내가공.rows}
          sizeLabel="생산량 (성격)"
        />
      ),
    },
    {
      title: '수입 신고 명의 상위',
      caption: RESEARCH_EXT.수입명의.요지,
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="식약처 수입식품 신고 2024-08~2026-08. 건수는 물량이 아니다."
          rows={RESEARCH_EXT.수입명의.rows}
          sizeLabel="건수 (성격)"
        />
      ),
    },
    {
      title: '2025 주력 제품',
      caption: RESEARCH_EXT.제품.요지,
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => <ProductTable rows={RESEARCH_EXT.제품.rows} />,
    },
  ],
  s07: [
    {
      title: '산지 위판 상위 조합',
      caption: RESEARCH_EXT.위판조합.요지,
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="2025 산지위판 원장. 43개 이름·76개 어종코드. 계통판매와 한 선으로 잇지 않는다."
          rows={RESEARCH_EXT.위판조합.rows}
          sizeLabel="물량·단가"
        />
      ),
    },
    {
      title: '급식 낙찰 명부',
      caption: RESEARCH_EXT.급식낙찰.요지,
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="나라장터 2025-07~2026-05. 낙찰금액은 부식 전체다. 예정단가와 섞지 않는다."
          rows={RESEARCH_EXT.급식낙찰.rows}
          sizeLabel="낙찰금액"
        />
      ),
    },
  ],
  s08: [
    {
      title: '2025 생산 상위 20곳',
      caption: RESEARCH_EXT.국내가공.요지,
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <RosterTable
          caption="식약처 표 21. 열은 2024·2025 생산량(kg), 전년비(%), 2025 점유율(%)이다. 2020년 튐은 추세선에 넣지 않는다."
          rows={RESEARCH_EXT.국내가공.rows}
          sizeLabel="생산량 (성격)"
        />
      ),
    },
  ],
  x01: [
    {
      title: '세번·원산지 누적 (부록 B)',
      caption:
        '관세청 표 25·26. 2020~2026.07 누적. 세 세번 모두 골뱅이 밖의 것을 담는다. HS6 분모로 점유율을 내지 않는다.',
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <PlainFactsTable
          caption="보고서 부록 B. 조제 kg과 냉동 kg을 더하지 않는다."
          headers={['세번', '금액 (USD)', '구성']}
          rows={[
            ['16055910 골뱅이', '311,502,235 (65.9%)', '영국 76% · 아일랜드 20% · 중국 1%'],
            ['16055990 기타', '139,591,684 (29.5%)', '튀르키예 31% · 중국 20% · 세네갈 16%'],
            ['16055920 소라', '21,584,877 (4.6%)', '튀르키예 34% · 멕시코 32% · 불가리아 20%'],
            ['03079290 기타', '266,934,861 (73.0%)', '러시아 45% · 베트남 15% · 영국 9%'],
            ['03079210 조개관자', '83,852,021 (22.9%)', '중국 63% · 일본 22%'],
            ['03079140 재첩', '3,160,627 (37.2%)', '중국 100%'],
          ]}
        />
      ),
    },
  ],
};

const UK_IMPORT = DATA.한국수입.rows.find((row) => row.국가 === '영국');
const IMPORT_TOTAL = DATA.한국수입.rows.reduce((sum, row) => sum + row.수입액, 0);

const SPEC: CommoditySpec = {
  // 2026-09-10 사용자 지시: 단계를 탭으로 넘기지 않고 한 페이지에 전부 출력한다(기업 해부와 동일).
  continuous: true,
  key: 'whelk',
  title: '골뱅이',
  subtitle:
    '골뱅이 산업 해부 · 한 이름에 다섯 속과 한 빈칸 - 종·원물·국내·교역·수입 창구·명의·위판과 이름 자체의 문제',
  accent: WHELK_ACCENT,
  primaryKpi: {
    label: '다섯 과(科) 합계 생산량',
    value: DATA.요약.세계생산합계,
    unit: '(톤)',
    accent: WHELK_ACCENT,
  },
  secondaryKpis: [
    { label: '피뿔고둥류 비중', value: DATA.요약.최대그룹비중, unit: '(%)', decimals: 2 },
    { label: '참골뱅이류 비중', value: DATA.요약.참골뱅이비중, unit: '(%)', decimals: 2 },
    { label: '한국 참골뱅이 어획', value: DATA.요약.한국참골뱅이어획, unit: '(톤)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '기준',
      title: '다섯 과 합계',
      body: `${DATA.요약.세계생산합계.toLocaleString('ko-KR')} (톤)`,
    },
    {
      eyebrow: '종',
      title: '참골뱅이 몫',
      body: `${DATA.요약.참골뱅이비중} (%)`,
    },
    {
      eyebrow: '수입',
      title: '영국 비중',
      body: `${(((UK_IMPORT?.수입액 ?? 0) / (IMPORT_TOTAL || 1)) * 100).toFixed(1)} (%)`,
    },
    {
      now: true,
      eyebrow: '지금',
      title: '고둥류 2026.07',
      body: '1,120.32 t',
    },
    {
      now: true,
      eyebrow: '지금',
      title: '영국 양륙 2026.07 잠정',
      body: '1,196.46 t',
    },
    {
      now: true,
      eyebrow: '지금',
      title: '영국산 조제 7월',
      body: '106,820 kg',
    },
  ],
  briefing: WHELK_BRIEFING_POINTS,
  narratives: WHELK_NARRATIVES,
  chartSlots: WHELK_CHART_SLOTS,
  sourceNotes: WHELK_SOURCE_NOTES,
  sourceMeta: [
    `생산 집계 · ${DATA._meta.출처} · 기준 ${DATA._meta.기준연도}년`,
    `통관 집계 · ${DATA.한국수입._meta.출처}`,
    `국내 생산 · ${DATA.한국생산._meta.출처}`,
    `갱신 ${DATA._meta.생성일}`,
    `영국 양륙 · ${MMO_SYNC.syncDate}`,
    '보고서 제3판 2026-08-25 · KOSIS 2026-07 · 관세청 2026-07',
  ].join(' · '),
};

export interface WhelkIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function WhelkIndustryDashboard({
  heroOnly = false,
}: WhelkIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
