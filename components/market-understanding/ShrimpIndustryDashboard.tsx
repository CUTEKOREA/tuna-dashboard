/**
 * 「시장 이해 > 새우」.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있다. 여기는 차트 배치와 히어로 수치만 정한다.
 */
'use client';

import React from 'react';
import Link from 'next/link';
import {
  TraderTable,
  CanneryCountryTable,
  BrandMarketTable,
} from './CompanyResearchTables';
import { getShrimpCompanyResearch } from '@/lib/data/valuechain-companies';

import { getShrimpIndustryData } from '@/lib/data/commodity-industry';
import { SHRIMP_ACCENT } from '@/lib/shrimp-chart-colors';
import {
  argentinaMeta,
  argentinaRoutes,
  PROCESSOR_TAB_MATCH,
} from '@/lib/data/shrimp-argentina';
import { seriesRoles } from '@/lib/data/shrimp-country-series';
import {
  SHRIMP_BRIEFING_POINTS,
  SHRIMP_NARRATIVES,
  SHRIMP_SOURCE_NOTES,
} from '@/lib/shrimp-industry-content';
import styles from './TunaIndustryDashboard.module.css';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
} from './CommodityIndustryDashboard';
import {
  ShrimpArgentinaCatchChart,
  ShrimpArgentinaKoreaChart,
  ShrimpArgentinaRouteChart,
  ShrimpSeriesUnitChart,
  ShrimpSeriesWindowsChart,
  ShrimpCountryChart,
  ShrimpEnvChart,
  ShrimpKoreaChart,
  ShrimpSpeciesChart,
  ShrimpTrendChart,
} from './CommodityCharts';

const DATA = getShrimpIndustryData();
const SYNC = { status: 'STATIC' as const, syncDate: `${DATA.요약.기준연도}년 확정` };

const SHRIMP_RESEARCH = getShrimpCompanyResearch();

const ARG_SYNC = { status: 'STATIC' as const, syncDate: '2026-08-12 조사' };

/**
 * 가공경로 표. 태국 공장 넷은 방콕사무소 「가공사 조사」 탭에 프로파일이 있다 —
 * 등기·캐파·인증·재무를 거기서 본다. 탭은 URL 주소가 없어 페이지까지만 링크하고
 * 어느 탭인지는 글로 밝힌다.
 */
function ArgentinaRouteTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>가공국</th>
            <th>공개 조회행</th>
            <th>확인된 해외제조업소</th>
            <th>이번 전략에서의 역할</th>
          </tr>
        </thead>
        <tbody>
          {argentinaRoutes.map((r) => (
            <tr key={r.국가}>
              <td>{r.국가}</td>
              <td>
                {r.건수.toLocaleString('ko-KR')}건
                {r.검증 === '미입증' && (
                  <span style={{ marginLeft: 6, opacity: 0.7 }}>- 이 자료에서 확인 없음</span>
                )}
              </td>
              <td>
                {r.공장.length === 0
                  ? '–'
                  : r.공장.map((f, i) => (
                      <span key={f}>
                        {i > 0 && ' · '}
                        {f}
                        {r.공장건수[i] !== undefined && ` ${r.공장건수[i]}건`}
                        {PROCESSOR_TAB_MATCH[f] && <sup title="방콕사무소 가공사 조사에 프로파일 있음">▪</sup>}
                      </span>
                    ))}
              </td>
              <td>{r.역할}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.factNote}>
        {argentinaMeta.recordCaveat} ▪ 표시한 공장은 방콕사무소 「가공사 조사」 탭에 등기·캐파·인증·재무
        프로파일이 있다 - <Link href="/bangkok-office">방콕사무소로 이동</Link>.
      </p>
    </div>
  );
}

const SERIES_SYNC = { status: 'STATIC' as const, syncDate: '관세청 2026년 1~6월' };
const REPORT_SYNC = { status: 'STATIC' as const, syncDate: '2026-08-23 보고서 · 2026-09-10 갱신' };

function ReportTable({
  headers,
  rows,
  note,
}: {
  headers: string[];
  rows: string[][];
  note: string;
}) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row[0]}-${i}`}>
              {row.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.factNote}>{note}</p>
    </div>
  );
}

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
        생산 톤은 FishStat 새우 필터 후 값이고, 수입 창구는 관세청 제품중량이다. 둘을 빼지 않는다.
        한–에콰도르 SECA 발효·양허는 미확인이다.
      </p>
    </div>
  );
}

export const SHRIMP_CHART_SLOTS: Record<string, ChartSlot[]> = {
  s01: [
    {
      title: '양식과 자연산 75년 (톤·%)',
      caption:
        '청록이 양식, 파랑이 자연산이다. 선은 양식 비중으로 2010년에 50%를 넘는다. 자연산 막대가 줄어든 것이 아니라 양식이 그 위에 쌓였다.',
      telemetry: SYNC,
      span: 'full', // 75년 추이 — 기존 전폭 예외(commodity-industry-render 테스트가 고정)
      render: () => <ShrimpTrendChart data={DATA} />,
    },
    {
      title: '생산 방식별 규모 (톤)',
      caption:
        '「양식」 한 낱말을 갈랐다. 주황이 담수 양식 - 강·논에서 기르는 민물새우다. 해산 새우 시장을 말할 때는 이 막대를 빼야 한다.',
      telemetry: SYNC,
      render: () => <ShrimpEnvChart data={DATA} />,
    },
  ],
  s02: [
    {
      title: '종별 생산량 (톤)',
      caption: '주황이 흰다리새우다. 1위 하나가 나머지 여덟을 합친 것보다 크다.',
      telemetry: SYNC,
      render: () => <ShrimpSpeciesChart data={DATA} />,
    },
  ],
  s03: [
    {
      title: '공급 기업 - 누가 잡고 누가 파는가',
      caption: SHRIMP_RESEARCH.공급.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <TraderTable rows={SHRIMP_RESEARCH.공급.rows} />,
    },
    {
      title: '국가별 가공 거점과 기업',
      caption: SHRIMP_RESEARCH.가공.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <CanneryCountryTable rows={SHRIMP_RESEARCH.가공.rows} />,
    },
    {
      title: '국가별 생산과 양식 비중 (톤·%)',
      caption:
        '막대 높이는 규모, 색 구성은 양식과 자연산의 비율, 선은 양식 비중이다. 선이 바닥에 붙은 나라와 천장에 붙은 나라는 사는 물건이 다르다.',
      telemetry: SYNC,
      render: () => <ShrimpCountryChart data={DATA} />,
      // 차트는 상위 12개국만 그린다. 몇 나라가 잘렸는지는 그래프만 봐서는 알 수 없다.
    },
  ],
  s05: [
    {
      title: '한국 HS 030617 공급국 (톤·$/kg)',
      caption:
        '막대가 수입량, 선이 평균 신고단가다. 주황이 아르헨티나 - 물량은 6위인데 단가는 가장 높은 축이다. 통관 신고 기준이라 위 생산 통계와 더할 수 없다.',
      telemetry: { status: 'STATIC' as const, syncDate: '2026년 1~5월 관세청' },
      render: () => <ShrimpArgentinaKoreaChart />,
    },
    {
      title: '아르헨티나 어획·양륙 (톤)',
      caption:
        '회색 막대는 출처가 다르다 - 2018~2024는 FAO 어획, 2025는 아르헨티나 정부 양륙 집계다. 두 계열을 한 선으로 잇지 않은 이유다.',
      telemetry: ARG_SYNC,
      render: () => <ShrimpArgentinaCatchChart />,
    },
    {
      title: '가공경로 3국 공개기록 (건)',
      caption:
        '식약처 화면에 나타난 조회행 빈도이지 수입량이 아니다. 회색인 베트남 0건은 「없다」가 아니라 「이 자료에서 확인되지 않았다」이다.',
      telemetry: ARG_SYNC,
      render: () => <ShrimpArgentinaRouteChart />,
    },
    {
      title: '가공경로와 공장',
      caption:
        '태국은 공장을 고를 수 있고, 인도네시아는 한 공장에 몰려 있으며, 베트남은 이번 원료·목적국 조합이 아직 입증되지 않았다.',
      telemetry: ARG_SYNC,
      span: 'full',
      render: () => <ArgentinaRouteTable />,
    },
  ],
  s04: [
    {
      title: '브랜드와 점유율 (성격 구분)',
      caption: SHRIMP_RESEARCH.브랜드.요지,
      telemetry: { status: 'STATIC' as const, syncDate: '2026-08-17 조사' },
      span: 'full',
      render: () => <BrandMarketTable rows={SHRIMP_RESEARCH.브랜드.rows} />,
    },
    {
      title: '한국 종별 생산량 (톤)',
      caption:
        '주황이 젓새우다. 세계에서 2.69%뿐인 종이 한국에서는 절반이다 - 새우젓이라는 소비 형태가 통계에 그대로 찍혔다.',
      telemetry: SYNC,
      render: () => <ShrimpKoreaChart data={DATA} />,
    },
  ],
  s06: [
    {
      title: '시리즈 6개국 역할',
      caption:
        '생산 순위와 수입 창구를 한 칸에 섞지 않았다. 같은 원산지라도 세번이 갈리면 창구가 다르다.',
      telemetry: { status: 'STATIC' as const, syncDate: 'FishStat 2024 · 관세청 2026년 1~6월' },
      span: 'full',
      render: () => <SeriesRolesTable />,
    },
    {
      title: '수입 창구 물량 (톤)',
      caption:
        '막대 둘은 세번이 다르다 - 파랑이 030617 원물(강조한 베트남은 주황), 청록이 160521 조제품이다. 베트남만 강조한 이유는 두 창구가 비슷한 무게이기 때문이다. 2026년 1~6월 제품중량이라 위 생산 통계·05단계 1~5월 표와 더할 수 없다.',
      telemetry: SERIES_SYNC,
      render: () => <ShrimpSeriesWindowsChart />,
    },
    {
      title: '수입 창구 단가 (달러/kg)',
      caption:
        'HS 030617 신고액÷중량만 그린다. 에콰도르 5.11이 가장 낮고 태국 12.12가 가장 높다. 조제품 단가와 섞지 않는다.',
      telemetry: SERIES_SYNC,
      render: () => <ShrimpSeriesUnitChart />,
    },
  ],
  s07: [
    {
      title: '조달선 상위 8국 (금액)',
      caption:
        '관세청 HSK 10자리 9세번, 2026년 1~5월 누계. 06단계 1~6월 6자리 창구와 달을 합치지 않는다.',
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <ReportTable
          headers={['국가', '금액', '물량', '단가', '점유']}
          rows={[
            ['베트남', '1억 3,150만 달러', '16,597톤', '7.92달러/kg', '43.4%'],
            ['중국', '7,180만 달러', '9,929톤', '7.23달러/kg', '23.7%'],
            ['페루', '2,690만 달러', '3,609톤', '7.45달러/kg', '8.9%'],
            ['태국', '2,350만 달러', '2,007톤', '11.69달러/kg', '7.8%'],
            ['말레이시아', '1,360만 달러', '1,458톤', '9.34달러/kg', '4.5%'],
            ['아르헨티나', '1,280만 달러', '1,018톤', '12.58달러/kg', '4.2%'],
            ['인도', '1,040만 달러', '1,551톤', '6.72달러/kg', '3.4%'],
            ['에콰도르', '390만 달러', '778톤', '5.07달러/kg', '1.3%'],
          ]}
          note="보고서 §04. 그 밖 19개국 851만 달러·1,417톤·6.01달러/kg·2.8%. 5개월 누계이며 연환산하지 않는다."
        />
      ),
    },
    {
      title: '수입 명의 상위 10곳 (건수)',
      caption: '식약처 공개포털 신고 건수다. 물량·금액이 아니다. 상위 10곳 합이 24.6%다.',
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <ReportTable
          headers={['상호', '건수', '비중']}
          rows={[
            ['다이아몬드새우', '1,481건', '6.7%'],
            ['지에스코퍼레이션', '535건', '2.4%'],
            ['산호상사', '508건', '2.3%'],
            ['해우씨푸드', '465건', '2.1%'],
            ['아쿠아링크', '463건', '2.1%'],
            ['지앤원인터네셔널', '430건', '1.9%'],
            ['오션스글로벌부산', '408건', '1.8%'],
            ['우원홀딩스', '401건', '1.8%'],
            ['씨웰스', '388건', '1.7%'],
            ['에이티오', '386건', '1.7%'],
            ['그 밖 614곳', '16,711건', '75.4%'],
          ]}
          note="보고서 §06. 2023-09~2026-08-21, 22,176건·624곳."
        />
      ),
    },
  ],
  s08: [
    {
      title: '국내 생산과 위판',
      caption: '통계청 생산(생물중량)과 수협 계통판매는 분모가 다르다. 비율 58.8%는 보고서 대조값이다.',
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <ReportTable
          headers={['항목', '값', '기준']}
          rows={[
            ['국내 생산', '34,588톤', '2024 통계청'],
            ['해면양식 (흰다리)', '7,839톤 (22.7%)', '2024'],
            ['젓새우류', '17,176톤 (49.7%)', '2024'],
            ['2025 생산', '33,640톤', '2025 통계청'],
            ['계통판매', '19,775톤 · 5,961원/kg', '2025'],
            ['위판 밖', '13,865톤', '2025 보고서 대조'],
            ['겉보기 자급률', '24.8% (젓새우 제외 14.2%)', '2024'],
          ]}
          note="보고서 §05·§07. FAO 34,351톤·Comtrade 104,977톤과 축이 다르다."
        />
      ),
    },
  ],
  s09: [
    {
      title: '가공 생산량 상위 5곳',
      caption: '식품안전나라 생산량 기준이다. 매출 순위가 아니다. 1위 몫 8.6%, 상위 10곳 31.3%.',
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <ReportTable
          headers={['법인', '2023', '2024', '2025']}
          rows={[
            ['우일수산(주)', '1,241톤', '1,048톤', '1,685톤'],
            ['(주)그린푸드', '1,120톤', '941톤', '773톤'],
            ['유원식품(주)', '581톤', '541톤', '623톤'],
            ['보령식품영어조합법인', '547톤', '478톤', '525톤'],
            ['굴다리영어조합법인', '179톤', '208톤', '478톤'],
          ]}
          note="보고서 §10·부록 A-2. 원물 가공 추림 19,580톤·1,090곳(2025)."
        />
      ),
    },
  ],
  s10: [
    {
      title: '수입 상위 감사보고서 매출',
      caption: '법인 전체 매출이다. 새우 매출이 아니다. 사업보고서 재무는 12곳 모두 자료 없음.',
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <ReportTable
          headers={['법인', '2023', '2024', '2025', '영업이익률']}
          rows={[
            ['사세', '2,963억', '3,095억', '3,275억', '7.5%'],
            ['다이아몬드새우', '1,195억', '1,472억', '1,898억', '2.5%'],
            ['우일수산', '1,684억', '1,617억', '1,844억', '7.7%'],
            ['아이씨인터네셔날', '707억', '866억', '1,070억', '4.4%'],
            ['산호상사', '444억', '534억', '577억', '7.3%'],
          ]}
          note="보고서 §12. DART 감사보고서. 가공 명부에 있는 곳은 우일수산 1곳."
        />
      ),
    },
  ],
  s11: [
    {
      title: 'CIF에서 도매까지',
      caption: '0306179091 5개월 가중단가와 KAMIS 도매는 시점이 다르다. 1.35배 안의 단계별 몫은 없다.',
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <ReportTable
          headers={['단계', '값', '시점']}
          rows={[
            ['CIF 0306179091', '6.456달러/kg', '2026년 1~5월'],
            ['CIF 원화 (1,385원)', '8,942원/kg', '동일'],
            ['KAMIS 도매', '12,050원/kg', '2026-09-01 서울'],
            ['KAMIS 소매', '5,479원/kg', '2026-09-01 평균 계열'],
            ['새우젓 소매', '16,185원/kg', '2026-09-01 평균 계열'],
            ['배수', '1.35배 (+34.8%)', 'CIF 누계 vs 도매'],
          ]}
          note="보고서 §13 + 9/1 스윕. 소매/도매 배수는 마진이 아니다."
        />
      ),
    },
  ],
  s12: [
    {
      title: '세번 상위 5행',
      caption: '종 이름 세번은 흰다리 0306179091 하나(10.9%). 최대 칸은 기타 새우살이다.',
      telemetry: REPORT_SYNC,
      span: 'full',
      render: () => (
        <ReportTable
          headers={['세번', '금액', '점유', '단가']}
          rows={[
            ['0306171090 냉동 기타', '1억 6,959만 달러', '56.0%', '8.19달러/kg'],
            ['1605211000 빵가루·반죽', '4,168만 달러', '13.8%', '6.22달러/kg'],
            ['1605219000 조제 기타', '3,399만 달러', '11.2%', '11.53달러/kg'],
            ['0306179091 흰다리새우', '3,307만 달러', '10.9%', '6.46달러/kg'],
            ['0306179099 냉동 기타', '1,951만 달러', '6.4%', '9.66달러/kg'],
          ]}
          note="보고서 §14. 2026년 1~5월. 명칭 일치 1건. 06단계 1~6월 표와 합치지 않는다."
        />
      ),
    },
  ],
  s13: [
    {
      title: '2026년 9월 조달 창',
      caption: '아카이브 1차 출처를 우선한다. 거부·통보 건수는 분모가 없어 불합격률이 아니다.',
      telemetry: { status: 'STATIC' as const, syncDate: '2026-09-10' },
      span: 'full',
      render: () => (
        <ReportTable
          headers={['신호', '값', '등급']}
          rows={[
            ['에콰도르 BCE 1~6월', 'USD 4,698.1M (+10.4%)', 'A'],
            ['아르헨 양륙 1/1~9/8', '174,868.939 t', 'A'],
            ['국가수역 최종 출항', '2026-09-09 23:59', 'B'],
            ['FDA 16-35 개정', '09/04/2026 DWPE', 'A'],
            ['대중국 공장', '8곳 복권 · 6곳 정지', 'B'],
            ['인도 반덤핑 20차', '7.01 / 4.04 / 5.53%', 'B'],
            ['베트남 새우 1~8월', 'USD 3.3 billion (+12.3%)', 'B'],
          ]}
          note="C절 아카이브 + 채택 Grok D-4·D-5·D-6·D-7(일정만)·D-8. D-1·D-2·D-3 미채택."
        />
      ),
    },
  ],
};

const SPEC: CommoditySpec = {
  // 2026-09-10 사용자 지시: 단계를 탭으로 넘기지 않고 한 페이지에 전부 출력한다(기업 해부와 동일).
  continuous: true,
  key: 'shrimp',
  title: '새우',
  subtitle:
    '새우 산업 해부 · 양식이 이긴 유일한 주요 수산 품목 - 조달선·가공 명부·값 사슬·검역 창까지',
  accent: SHRIMP_ACCENT,
  primaryKpi: {
    label: '세계 새우 생산량',
    value: DATA.요약.세계생산,
    unit: '(톤)',
    accent: SHRIMP_ACCENT,
  },
  secondaryKpis: [
    { label: '양식 비중', value: DATA.요약.양식비중, unit: '(%)', decimals: 1 },
    { label: '흰다리새우 비중', value: DATA.요약.최대종비중, unit: '(%)', decimals: 2 },
    { label: '한국 양식 비중', value: DATA.요약.한국양식비중 ?? 0, unit: '(%)', decimals: 1 },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '지금',
      title: '국가수역 시즌 종료(B)',
      body: '국가수역 최종 출항 2026-09-09 23:59 · 양륙 174,868.939 t (1/1~9/8)',
    },
    {
      eyebrow: '검역',
      title: 'FDA 16-35',
      body: '인도 생·자숙 새우 DWPE · 개정 2026-09-04',
    },
    {
      eyebrow: '수출',
      title: '에콰도르 1~6월',
      body: 'Camarón USD 4,698.1M (+10.4%)',
    },
    {
      eyebrow: '도매',
      title: 'KAMIS 흰다리',
      body: '12,050원/kg (서울, 2026-09-01)',
    },
  ],
  briefing: SHRIMP_BRIEFING_POINTS,
  narratives: SHRIMP_NARRATIVES,
  chartSlots: SHRIMP_CHART_SLOTS,
  sourceNotes: SHRIMP_SOURCE_NOTES,
  sourceMeta: [
    `생산 집계 · ${DATA._meta.출처} · 기준 ${DATA._meta.기준연도}년`,
    `단위 ${DATA._meta.단위}`,
    `갱신 ${DATA._meta.생성일}`,
  ].join(' · '),
};

export interface ShrimpIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function ShrimpIndustryDashboard({
  heroOnly = false,
}: ShrimpIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
