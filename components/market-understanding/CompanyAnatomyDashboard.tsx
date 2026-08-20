/**
 * 「시장 이해 > 기업 해부」.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있다. 여기는 회사 선택과 차트 배치만 정한다.
 *
 * 실린 회사는 Frinsa·Thai Union 둘이다. 진입은 갤러리(타로카드)가 맡고,
 * 회사가 늘면 `COMPANY_CARDS` 와 `SPECS` 에 한 짝씩 추가한다.
 */
'use client';

import React, { useState } from 'react';

import {
  FRINSA_BRIEFING,
  FRINSA_NARRATIVES,
  FRINSA_SOURCE_NOTES,
} from '@/lib/company-frinsa-content';
import {
  frinsaBrands,
  frinsaCerts,
  frinsaMeta,
  frinsaProfile,
  frinsaTariff,
  latestFinancial,
  tunaPurchasedMt,
} from '@/lib/data/company-frinsa';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
} from './CommodityIndustryDashboard';
import {
  FrinsaBaiChart,
  FrinsaCogenChart,
  FrinsaFinancialChart,
  FrinsaGaliciaChart,
  FrinsaKoreaExportChart,
  FrinsaPriceLadderChart,
  FrinsaRegionalChart,
  FrinsaSourcingChart,
  FrinsaSustainabilityChart,
} from './FrinsaCharts';
import {
  THAIUNION_BRIEFING,
  THAIUNION_NARRATIVES,
  THAIUNION_SOURCE_NOTES,
} from '@/lib/company-thaiunion-content';
import {
  latestKoreaExport,
  latestTuFinancial,
  thaiUnionBalance,
  thaiUnionBrands,
  thaiUnionFactories,
  thaiUnionHistory,
  thaiUnionKoreaImport,
  thaiUnionMeta,
  thaiUnionProfile,
  thaiUnionRedLobster,
  thaiUnionRetailPrices,
  thaiUnionSeachange,
  thaiUnionShareholders,
  thaiUnionUsTariff,
  totalBrandSku,
  tunaCapacityMt,
} from '@/lib/data/company-thaiunion';
import {
  TuBrandShareChart,
  TuCapacityChart,
  TuConVsSepChart,
  TuFinancialChart,
  TuGhgChart,
  TuJwLadderChart,
  TuKoreaExportChart,
  TuMfdsChart,
  TuMscTrendChart,
  TuRegionChart,
  TuSegmentChart,
  TuTc25Chart,
} from './ThaiUnionCharts';
import CompanyGallery, { type CompanyCard } from './CompanyGallery';
import galleryStyles from './CompanyGallery.module.css';
import styles from './TunaIndustryDashboard.module.css';

const ACCENT = '#c2410c';
/** 정적 조사 아카이브라 갱신일이 곧 조사일이다. LIVE 로 표기하지 않는다(L-09). */
const SYNC = { status: 'STATIC' as const, syncDate: '2026-08-20 조사 아카이브' };
const FIN = latestFinancial();

/** 회사 개요 표. 도형으로 그릴 것이 없는 항목이라 표로 둔다. */
function ProfileTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>항목</th>
            <th>내용</th>
          </tr>
        </thead>
        <tbody>
          {frinsaProfile.map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** EU 수입관세. 세율이 용도별로 갈리는 것이 요지라 표로 둔다. */
function TariffTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>품목</th>
            <th>세번</th>
            <th>기본세율</th>
            <th>조건</th>
          </tr>
        </thead>
        <tbody>
          {frinsaTariff.map((r) => (
            <tr key={r.코드}>
              <td>{r.품목}</td>
              <td>{r.코드}</td>
              <td>{r.mfn}</td>
              <td>{r.조건}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 브랜드 포트폴리오. 포지션·채널이 요지라 표로 둔다. */
function BrandTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>브랜드</th>
            <th>시장</th>
            <th>포지션</th>
            <th>채널</th>
          </tr>
        </thead>
        <tbody>
          {frinsaBrands.map((r) => (
            <tr key={r.브랜드}>
              <td>{r.브랜드}</td>
              <td>{r.시장}</td>
              <td>{r.포지션}</td>
              <td>{r.채널}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 인증 현황. 원본 인증서로 확정된 것만 싣고, 만료는 만료라고 적는다. */
function CertTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>인증</th>
            <th>번호</th>
            <th>상태</th>
            <th>유효</th>
          </tr>
        </thead>
        <tbody>
          {frinsaCerts.map((r) => (
            <tr key={r.인증}>
              <td>{r.인증}</td>
              <td>{r.번호}</td>
              <td>{r.상태}</td>
              <td>{r.유효}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CHART_SLOTS: Record<string, ChartSlot[]> = {
  c01: [
    {
      title: '회사 개요',
      caption: '법인 정체성·지배구조 — 등기·EINF 로 확정된 항목만 싣는다.',
      telemetry: SYNC,
      render: () => <ProfileTable />,
      span: 'full',
      sourceLine: '스페인 상업등기 (CIF A15010564) · 회사 EINF · 조사 아카이브 §1',
    },
  ],
  c02: [
    {
      title: 'FY2024 국가별 세전이익 (M€)',
      caption: '상위 6개국. 노란 막대가 싱가포르 구매본부다 — 판매법인이 아닌데 그룹 2위권이다.',
      telemetry: SYNC,
      render: () => <FrinsaBaiChart />,
      span: 'full',
      sourceLine: '회사 EINF «국가별 세전이익» — 국가 합계와 산술 일치 검증',
    },
  ],
  c03: [
    {
      title: '가격 사다리 (€/kg)',
      caption: '자사몰·전문점·대형마트 진열가를 kg 단가로 환산했다. 노란 막대가 100 €/kg 초과 층이다.',
      telemetry: SYNC,
      render: () => <FrinsaPriceLadderChart />,
      span: 'full',
      sourceLine: '자사몰 WooCommerce API 실측 (제품 69종, 2026-08-20) · Alcampo·Carrefour·DIA 진열가',
    },
    {
      title: '브랜드 포트폴리오',
      caption: '스페인 5 + 포르투갈 계열 + PL. 브랜드마다 배정 채널이 다르다.',
      telemetry: SYNC,
      render: () => <BrandTable />,
      span: 'full',
      sourceLine: '자사몰·apoveira.pt·Alimarket·Merca2 교차 (조사 아카이브 §5·§14)',
    },
  ],
  c04: [
    {
      title: '열병합 발전량 (MWh)',
      caption: '2023년부터 사실상 정지(−99.8%). 0 이 아니라 254·117 MWh 다.',
      telemetry: SYNC,
      render: () => <FrinsaCogenChart />,
      sourceLine: '회사 EINF 에너지 표 (2022~2024)',
    },
  ],
  c05: [
    {
      title: '참치 원어 구매량 (톤)',
      caption: '법인별 구매량. 「그룹 합계」는 두 법인의 합이라 이중계상을 피해 뺐다.',
      telemetry: SYNC,
      render: () => <FrinsaSourcingChart />,
      sourceLine: '회사 EINF — SAP 구매등록 (2024)',
    },
    {
      title: '2025년 참치 구매 출처 (%)',
      caption: '어업 기준. MSC 인증이 68%다.',
      telemetry: SYNC,
      render: () => <FrinsaSustainabilityChart axis="어업 출처" />,
      sourceLine: 'Frinsa Marine Sustainability Policy 2026 (2025년 실적, 자사 공시 — 원문 전 항목 대조 일치)',
    },
    {
      title: '2025년 공급사 참여 (%)',
      caption: '공급사 기준. 노란 막대가 「어디에도 해당 없음」으로, 앞 차트와 같은 것을 재지 않는다.',
      telemetry: SYNC,
      render: () => <FrinsaSustainabilityChart axis="공급사 출처" />,
      sourceLine: 'Frinsa Marine Sustainability Policy 2026 (2025년 실적, 자사 공시)',
    },
    {
      title: '인증 현황',
      caption: '원본 인증서로 확정된 것만 싣는다. IFS Broker 는 만료본까지만 확인됐다.',
      telemetry: SYNC,
      render: () => <CertTable />,
      sourceLine: '인증서 원본 4종 (NSF·Bureau Veritas) · MSC 등록부 · EII 명부 CSV · ISSF 준수보고서',
    },
  ],
  c06: [
    {
      title: '매출과 순이익률 (M€·%)',
      caption: '2019~2024 그룹 연결. 단위가 달라 축을 나눴다. 2025년은 미공표라 없다.',
      telemetry: SYNC,
      render: () => <FrinsaFinancialChart />,
      sourceLine: '갈리시아 언론 교차 (O Barbanza 2024-08 · Costa Oeste · economiadigital 2025-07)',
    },
    {
      title: 'FY2024 지역별 매출 (M€)',
      caption: '이베리아 밖(노란 막대)이 57.6%다. 합 740.4 가 보도치 741 과 정합한다.',
      telemetry: SYNC,
      render: () => <FrinsaRegionalChart />,
      sourceLine: '조사 아카이브 §3 — 지역분해 3표 검증 (합계·보도치 산술 정합)',
    },
  ],
  c07: [
    {
      title: '갈리시아 3강 매출 (M€)',
      caption: '2025년 Frinsa 는 미공표라 막대가 없다 — 0 이 아니다.',
      telemetry: SYNC,
      render: () => <FrinsaGaliciaChart />,
      span: 'full',
      sourceLine: '각 사 공시·언론 (economiadigital 2025-07 / 2026-05 · Europa Azul)',
    },
  ],
  c08: [
    {
      title: '한국 → 스페인 냉동참치 수출 (톤·백만$)',
      caption: 'UN Comtrade 스페인 신고 기준. 2025년은 미완연도다. 물량과 금액이 함께 튀었다가 함께 내려왔다.',
      telemetry: SYNC,
      render: () => <FrinsaKoreaExportChart />,
      sourceLine: 'UN Comtrade (스페인 신고·총계행) — 2025년은 미완연도',
    },
    {
      title: 'EU 수입관세 (%)',
      caption: '가공도가 세율을 정한다. 캔가공용 냉동 통마리만 end-use 면세다.',
      telemetry: SYNC,
      render: () => <TariffTable />,
      sourceLine: 'EU TARIC 원문 (2026-08-19 기준) · EUR-Lex CELEX:32023R2720',
    },
  ],
};

const SPEC: CommoditySpec = {
  key: 'company-anatomy',
  title: '기업 해부 — Frinsa del Noroeste',
  subtitle: '스페인 갈리시아 캔참치 가공사. 선단 0척으로 한 해 참치 원어 135,289톤(회사 EINF SAP 집계)을 사들인다.',
  accent: ACCENT,
  primaryKpi: {
    label: `${FIN.연도}년 그룹 매출`,
    value: FIN.매출,
    unit: '(M€)',
    accent: ACCENT,
  },
  secondaryKpis: [
    { label: `${FIN.연도}년 순이익`, value: FIN.순이익, unit: '(M€)', decimals: 1 },
    { label: '연간 참치 구매', value: tunaPurchasedMt(), unit: '(톤)' },
    { label: '보유 선단', value: 0, unit: '(척)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '규모',
      title: `${FIN.연도}년 매출`,
      body: `${FIN.매출.toLocaleString('ko-KR')} (M€)`,
    },
    { eyebrow: '조달', title: '참치 원어 구매', body: `${tunaPurchasedMt().toLocaleString('ko-KR')} (톤)` },
    { eyebrow: '창구', title: '싱가포르 구매본부 BAI', body: '5.0 (M€)' },
    { eyebrow: '관세', title: '캔가공용 냉동 통마리', body: '0 (%)' },
  ],
  briefing: FRINSA_BRIEFING,
  narratives: FRINSA_NARRATIVES,
  chartSlots: CHART_SLOTS,
  sourceNotes: FRINSA_SOURCE_NOTES,
  sourceMeta: [
    `${frinsaMeta.회사} · ${frinsaMeta.국가} · ${frinsaMeta.업종}`,
    `출처 ${frinsaMeta.출처}`,
    `갱신 ${frinsaMeta.갱신방법}`,
  ].join(' · '),
};

const TU_ACCENT = '#1e40af';
const TU_FIN = latestTuFinancial();
const TU_KE = latestKoreaExport();

/** Thai Union 회사 개요 표. */
function TuProfileTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>항목</th>
            <th>내용</th>
          </tr>
        </thead>
        <tbody>
          {thaiUnionProfile.map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 참치조제품 대한 수입 — 관세가 지도를 그린다는 것이 요지라 표로 둔다. */
function TuKoreaImportTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>원산지</th>
            <th>2024 수입액</th>
            <th>비중</th>
            <th>관세</th>
          </tr>
        </thead>
        <tbody>
          {thaiUnionKoreaImport.map((r) => (
            <tr key={r.원산지}>
              <td>{r.원산지}</td>
              <td>{`$${r.usd.toLocaleString('ko-KR')}`}</td>
              <td>{`${r.비중}%`}</td>
              <td>{r.관세}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 미국 실효 관세 — 품목별 부담이 요지라 표로 둔다. */
function TuUsTariffTable() {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            <th>품목</th>
            <th>실효 부담</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {thaiUnionUsTariff.map((r) => (
            <tr key={r.품목}>
              <td>{r.품목}</td>
              <td>{r.부담}</td>
              <td>{r.비고}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 2열 단순 표 공용 렌더러 — Thai Union 확장 표 7종이 공유한다. */
function TuRows({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>{head.map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TU_CHART_SLOTS: Record<string, ChartSlot[]> = {
  c01: [
    {
      title: '회사 개요',
      caption: '설립·상장·지배구조 등 조사보고서 01장 요약.',
      telemetry: SYNC,
      render: () => <TuProfileTable />,
      sourceLine: '사내 조사보고서 (2026-08) · 56-1 One Report FY2025',
    },
    {
      title: '주주 구성 (%)',
      caption: '2대 주주가 자기주식 13.47%다. 미쓰비시UFJ모건스탠리(5.36%)는 지분 확대를 시도한 미쓰비시상사와 별개 주체다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['순위', '주주', '지분 (%)']}
          rows={thaiUnionShareholders.map((r) => [r.순위, r.주주, r.지분.toFixed(2)])} />
      ),
      sourceLine: '사내 조사보고서 (2026-08) · One Report p.75',
    },
    {
      title: '연혁 — 두 번의 도약',
      caption: '1997년 미국, 2010년 유럽. 브랜드를 사 모은 궤적과 Red Lobster·미쓰비시까지.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['연도', '사건']}
          rows={thaiUnionHistory.map((r) => [r.연도, r.사건])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) · One Report pp.6-8',
    },
  ],
  c02: [
    {
      title: '카테고리별 매출과 마진 (십억 밧·%)',
      caption: 'FY2025 연결. 유일하게 성장한 PetCare 가 마진도 가장 높다.',
      telemetry: SYNC,
      render: () => <TuSegmentChart />,
      sourceLine: '사내 조사보고서 (2026-08) · One Report MD&A',
    },
    {
      title: '자사 브랜드 매출 비중 (%)',
      caption: '노란 막대가 PetCare — 98.8%가 고객 브랜드·PL 이다. 한 회사 안의 두 모델.',
      telemetry: SYNC,
      render: () => <TuBrandShareChart />,
      sourceLine: '사내 조사보고서 (2026-08) · One Report p.33·37',
    },
    {
      title: '카테고리별 지역 구성 (%)',
      caption: '노란 구간이 미국·북미. Frozen 51.2%·PetCare 58.9% — 관세 직격 구간의 크기다.',
      telemetry: SYNC,
      render: () => <TuRegionChart />,
      sourceLine: '사내 조사보고서 (2026-08) · One Report pp.33-37',
    },
  ],
  c03: [
    {
      title: '브랜드 포트폴리오 — 실측 SKU',
      caption: '공식몰 API·사이트맵 전수(2026-08-20). 라인업이 서로 겹치지 않는다 — 산 것은 상표가 아니라 시장별 소비 문법이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['브랜드', '국가', '인수', 'SKU', '라인업 축']}
          rows={thaiUnionBrands.map((r) => [r.브랜드, r.국가, r.인수, r.sku ?? '—', r.축])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 04장 (2026-08) · WP REST·Shopify GraphQL·사이트맵·OFF 실측',
    },
    {
      title: 'John West 형태 사다리 (£/kg)',
      caption: '같은 참치가 형태만으로 2.6배 — 노란 막대가 £18 초과 층. Frinsa 의 부위 사다리와 대구를 이룬다.',
      telemetry: SYNC,
      render: () => <TuJwLadderChart />,
      sourceLine: 'Morrisons 실측 46건 (사내 조사보고서 인용) · 2026-08-20',
    },
    {
      title: '소매 실판매가 표본',
      caption: '4개국 376건 실측 중 대표 6건. 차단된 소매(Tesco·Carrefour)는 미수집으로 남겼다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['브랜드', '제품', '가격', '단가', '소매처']}
          rows={thaiUnionRetailPrices.map((r) => [r.브랜드, r.제품, r.가격, r.단가, r.소매처])} />
      ),
      sourceLine: 'Morrisons·Open Prices·Safeway·Walmart (사내 조사보고서 인용)',
    },
  ],
  c04: [
    {
      title: '그룹 생산능력 (톤/년)',
      caption: '노란 막대가 참치 57만 톤. PetCare 는 공시 내 모순(221k vs 195k)이 있어 서술값이다.',
      telemetry: SYNC,
      render: () => <TuCapacityChart />,
      sourceLine: '사내 조사보고서 (2026-08) · One Report p.46',
    },
    {
      title: '가공 거점',
      caption: '공장 보유 26개 법인의 대표 소재지. 사뭇사콘은 캔·라벨까지 수직계열화돼 있다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['지역', '거점 · 법인', '품목']}
          rows={thaiUnionFactories.map((r) => [r.지역, r.거점, r.품목])} />
      ),
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) · One Report pp.53-79 (BOI 등록 포함)',
    },
    {
      title: '참치 조달 어장 구성 추이 (%)',
      caption: 'MSC 인증이 2년 만에 31→71.4%. FIP 물량이 인증으로 «졸업»하며 옮겨 갔다.',
      telemetry: SYNC,
      render: () => <TuMscTrendChart />,
      sourceLine: '사내 조사보고서 (2026-08) · SeaChange 2024 Table 1',
    },
    {
      title: 'TC25 6대 약속 이행률 (%)',
      caption: '목표는 전부 2025년 100%. 노란 막대가 미달 구간 — 공급자 감사가 87.6%로 가장 남았다.',
      telemetry: SYNC,
      render: () => <TuTc25Chart />,
      sourceLine: '사내 조사보고서 (2026-08) · SeaChange 2024 (Key Traceability 독립검증)',
    },
  ],
  c05: [
    {
      title: 'GHG Scope 별 배출 (천 tCO2e)',
      caption: '2023년에 Scope 3 가 없는 것은 미보고라서다 — 0 이 아니다. 이 공백이 «6배 폭증» 오독을 만든다.',
      telemetry: SYNC,
      render: () => <TuGhgChart />,
      sourceLine: '사내 조사보고서 (2026-08) · One Report p.131 (검증 LRQA)',
    },
    {
      title: 'SeaChange 2030 대시보드 (%)',
      caption: '2030년 100% 목표 대비 FY2024 실적. 참치는 다 왔고 새우사료·대두·닭고기·GDST 는 초입이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['목표', '실적 (%)', '판정']}
          rows={thaiUnionSeachange.map((r) => [r.목표, r.실적.toFixed(1), r.상태])} />
      ),
      sourceLine: '사내 조사보고서 (2026-08) · SeaChange 2024 pp.12-14',
    },
  ],
  c06: [
    {
      title: '매출과 마진 (십억 밧·%)',
      caption: '2023년 매출은 원본 표에 없어 비어 있다 — 0 이 아니다. GPM 은 3년 연속 개선.',
      telemetry: SYNC,
      render: () => <TuFinancialChart />,
      sourceLine: '사내 조사보고서 (2026-08) · 감사 재무제표 OCR',
    },
    {
      title: '연결 vs 개별 — 순이익 역전 (십억 밧)',
      caption: '갈색(개별)이 남색(연결)보다 긴 줄이 이 회사의 함정이다. 모회사 배당수익 125.1억 밧.',
      telemetry: SYNC,
      render: () => <TuConVsSepChart />,
      sourceLine: '사내 조사보고서 (2026-08) · 감사 재무제표 p.357 (OCR)',
    },
    {
      title: '재무상태 (백만 밧)',
      caption: '부채는 늘고 자본은 줄었다 — 자기주식 취득 43.1억 밧이 자본 감소의 주범이다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['항목', '2025', '2024']}
          rows={thaiUnionBalance.map((r) => [r.항목,
            r.y2025.toLocaleString('ko-KR'), r.y2024.toLocaleString('ko-KR')])} />
      ),
      sourceLine: '사내 조사보고서 (2026-08) · MD&A',
    },
    {
      title: 'Red Lobster — 4겹',
      caption: '손상 → 지위 전환 → 잔여 지분 → 소송. 2023년에 끝난 일이 아니다.',
      telemetry: SYNC,
      render: () => (
        <TuRows head={['층', '시점', '내용']}
          rows={thaiUnionRedLobster.map((r) => [r.층, r.시점, r.내용])} />
      ),
      sourceLine: '사내 조사보고서 (2026-08) · One Report pp.6·181-182',
    },
  ],
  c07: [
    {
      title: '한국 → 태국 냉동참치 수출 (톤·백만$)',
      caption: '한국 냉동참치 수출의 54.1%(중량)가 태국행이다. 2025년 감소는 관세 관망의 흔적.',
      telemetry: SYNC,
      render: () => <TuKoreaExportChart />,
      sourceLine: 'UN Comtrade 한국 신고 (사내 조사보고서 인용)',
    },
    {
      title: '참치조제품 대한 수입 (2024)',
      caption: '베트남 74.3% vs 태국 12.8% — 관세(0% vs 20%)가 그린 지도다.',
      telemetry: SYNC,
      render: () => <TuKoreaImportTable />,
      sourceLine: 'Comtrade + 관세청 FTA포털 (사내 조사보고서 인용)',
    },
    {
      title: '식약처 수입신고 구성 (건)',
      caption: '한국에 들어오는 실체는 참치(노랑)가 아니라 새우다. 등록 제조업소 14개소 · 173건.',
      telemetry: SYNC,
      render: () => <TuMfdsChart />,
      sourceLine: '식약처 수입식품 DB 실측 (사내 조사보고서 인용) · 2024-01~2026-08',
    },
    {
      title: '미국 실효 관세 (%)',
      caption: '미국이 그룹 매출의 38%다. 회사는 대미 물량의 가나·세이셸 전환을 공시했다.',
      telemetry: SYNC,
      render: () => <TuUsTariffTable />,
      sourceLine: 'One Report pp.97-98 (사내 조사보고서 인용) · 2025-08-01 확정',
    },
  ],
};

const TU_SPEC: CommoditySpec = {
  key: 'company-anatomy-thaiunion',
  title: '기업 해부 — Thai Union Group',
  subtitle: '세계 최대 참치 가공사. 한국 냉동참치 수출의 절반이 이 회사의 앞마당으로 간다.',
  accent: TU_ACCENT,
  primaryKpi: {
    label: `${TU_FIN.연도}년 연결 매출`,
    value: TU_FIN.매출 ?? 0,
    unit: '(백만 밧)',
    accent: TU_ACCENT,
  },
  secondaryKpis: [
    { label: `${TU_FIN.연도}년 매출총이익률`, value: TU_FIN.gpm, unit: '(%)', decimals: 1 },
    { label: '참치 캐파', value: tunaCapacityMt(), unit: '(톤/년)' },
    { label: '브랜드 실측 SKU', value: totalBrandSku(), unit: '(개)' },
  ],
  stripItems: [
    {
      now: true,
      eyebrow: '규모',
      title: `${TU_FIN.연도}년 연결 매출`,
      body: `${(TU_FIN.매출 ?? 0).toLocaleString('ko-KR')} (백만 밧)`,
    },
    { eyebrow: '한국 접점', title: `한국→태국 수출 (${TU_KE.연도})`, body: `${Math.round(TU_KE.톤).toLocaleString('ko-KR')} (톤)` },
    { eyebrow: '관세', title: '수침 캔참치 대미 부담', body: '31.5 (%)' },
  ],
  briefing: THAIUNION_BRIEFING,
  narratives: THAIUNION_NARRATIVES,
  chartSlots: TU_CHART_SLOTS,
  sourceNotes: THAIUNION_SOURCE_NOTES,
  sourceMeta: [
    `${thaiUnionMeta.회사} · ${thaiUnionMeta.국가} · ${thaiUnionMeta.업종}`,
    `출처 ${thaiUnionMeta.출처}`,
    `갱신 ${thaiUnionMeta.갱신방법}`,
  ].join(' · '),
};

/** 선택 갤러리 카드 목록. 회사가 늘면 여기에 한 장씩 추가한다. */
const COMPANY_CARDS: CompanyCard[] = [
  {
    key: 'frinsa',
    numeral: 'Ⅰ',
    name: 'Frinsa del Noroeste',
    country: '스페인 · 갈리시아',
    tagline: '이름을 팔지 않는 회사. 선단 0척으로 한 해 참치 원어 13만 톤을 사들인다.',
    // 스페인 국기(로히괄다) 연상 — 빨강·노랑·빨강 가로 밴드에 새틴 광
    flagCss: [
      'radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.14), transparent 55%)',
      'linear-gradient(180deg, #9d1017 0%, #9d1017 24%, #e0b400 24%, #e0b400 76%, #9d1017 76%, #9d1017 100%)',
    ].join(', '),
    backInk: '#4a2f00',
    stats: [
      { label: `${FIN.연도}년 매출`, value: `${FIN.매출.toLocaleString('ko-KR')} M€` },
      { label: '참치 원어 구매', value: `${tunaPurchasedMt().toLocaleString('ko-KR')} 톤` },
      { label: '보유 선단', value: '0 척' },
    ],
  },
  {
    key: 'thaiunion',
    numeral: 'Ⅱ',
    name: 'Thai Union Group',
    country: '태국 · 사뭇사콘',
    tagline: 'John West 도 Chicken of the Sea 도 이 회사 것이다. 한국 참치 수출의 절반이 이곳으로 간다.',
    // 태국 국기(트라이롱) 연상 — 빨강·하양·남색(2배폭)·하양·빨강 가로 밴드
    flagCss: [
      'radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.14), transparent 55%)',
      'linear-gradient(180deg, #a51931 0%, #a51931 16.6%, #f4f5f0 16.6%, #f4f5f0 33.3%, #2d2a4a 33.3%, #2d2a4a 66.6%, #f4f5f0 66.6%, #f4f5f0 83.3%, #a51931 83.3%, #a51931 100%)',
    ].join(', '),
    backInk: '#f4f5f0',
    stats: [
      { label: `${TU_FIN.연도}년 연결 매출`, value: `${((TU_FIN.매출 ?? 0) / 1000).toFixed(0)}십억 밧` },
      { label: '참치 캐파', value: `${tunaCapacityMt().toLocaleString('ko-KR')} 톤/년` },
      { label: '보유 선단', value: '0 척' },
    ],
  },
];

export interface CompanyAnatomyDashboardProps {
  heroOnly?: boolean;
}

export default function CompanyAnatomyDashboard({
  heroOnly = false,
}: CompanyAnatomyDashboardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (heroOnly) return <CommodityIndustryDashboard spec={SPEC} heroOnly />;

  if (selected === null) {
    return <CompanyGallery companies={COMPANY_CARDS} onSelect={setSelected} />;
  }

  const spec = selected === 'thaiunion' ? TU_SPEC : SPEC;

  return (
    <div className={galleryStyles.wrap}>
      <button
        type="button"
        className={galleryStyles.backBtn}
        onClick={() => setSelected(null)}
      >
        ← 회사 선택
      </button>
      <CommodityIndustryDashboard spec={spec} />
    </div>
  );
}
