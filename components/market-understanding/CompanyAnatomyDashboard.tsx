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
  frinsaMeta,
  frinsaProfile,
  frinsaTariff,
  latestFinancial,
  tunaPurchasedMt,
} from '@/lib/data/company-frinsa';
import { SeriesStats } from './CockpitExtra';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
} from './CommodityIndustryDashboard';
import {
  FrinsaFinancialChart,
  FrinsaGaliciaChart,
  FrinsaKoreaExportChart,
  FrinsaPriceLadderChart,
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
  thaiUnionKoreaImport,
  thaiUnionMeta,
  thaiUnionProfile,
  thaiUnionUsTariff,
  tunaCapacityMt,
} from '@/lib/data/company-thaiunion';
import {
  TuBrandShareChart,
  TuCapacityChart,
  TuConVsSepChart,
  TuFinancialChart,
  TuKoreaExportChart,
  TuMscTrendChart,
  TuSegmentChart,
  TuTc25Chart,
} from './ThaiUnionCharts';
import CompanyGallery, { type CompanyCard } from './CompanyGallery';
import galleryStyles from './CompanyGallery.module.css';
import styles from './TunaIndustryDashboard.module.css';

const ACCENT = '#c2410c';
/** 사내 조사보고서라 갱신일이 곧 조사일이다. LIVE 로 표기하지 않는다(L-09). */
const SYNC = { status: 'STATIC' as const, syncDate: '2026-08 사내 조사' };
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

const CHART_SLOTS: Record<string, ChartSlot[]> = {
  c01: [
    {
      title: '회사 개요',
      caption: '설립·소재·지배구조·공장 등 조사보고서 01장 요약.',
      telemetry: SYNC,
      render: () => <ProfileTable />,
      sourceLine: '사내 조사보고서 (2026-08)',
    },
  ],
  c02: [
    {
      title: '가격 사다리 (€/kg)',
      caption: '자사몰·전문점·대형마트 진열가를 kg 단가로 환산했다. 노란 막대가 100 €/kg 초과 층이다.',
      telemetry: SYNC,
      render: () => <FrinsaPriceLadderChart />,
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) · 자사몰 및 Alcampo·Carrefour·DIA 진열가',
    },
  ],
  c03: [
    {
      title: '참치 원어 구매량 (톤)',
      caption: '법인별 구매량. 「그룹 합계」는 두 법인의 합이라 이중계상을 피해 뺐다.',
      telemetry: SYNC,
      render: () => <FrinsaSourcingChart />,
      sourceLine: '사내 조사보고서 (2026-08) · 2024년 기준',
    },
    {
      title: '2025년 참치 구매 출처 (%)',
      caption: '어업 기준. MSC 인증이 68%다.',
      telemetry: SYNC,
      render: () => <FrinsaSustainabilityChart axis="어업 출처" />,
      sourceLine: '사내 조사보고서 (2026-08) · 어업 인증 기준',
    },
    {
      title: '2025년 공급사 참여 (%)',
      caption: '공급사 기준. 노란 막대가 「어디에도 해당 없음」으로, 앞 차트와 같은 것을 재지 않는다.',
      telemetry: SYNC,
      render: () => <FrinsaSustainabilityChart axis="공급사 출처" />,
      sourceLine: '사내 조사보고서 (2026-08) · ISSF 참여 기준',
    },
  ],
  c04: [
    {
      title: '매출과 순이익률 (M€·%)',
      caption: '2019~2024 그룹 연결. 단위가 달라 축을 나눴다. 2025년은 미공표라 없다.',
      telemetry: SYNC,
      render: () => <FrinsaFinancialChart />,
      sourceLine: '사내 조사보고서 (2026-08) · 그룹 연결 유로 기준',
    },
    {
      title: '갈리시아 3강 매출 (M€)',
      caption: '2025년 Frinsa 는 미공표라 막대가 없다 — 0 이 아니다.',
      telemetry: SYNC,
      render: () => <FrinsaGaliciaChart />,
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) · 각 사 공시 매출',
    },
  ],
  c05: [
    {
      title: '한국 → 스페인 냉동참치 수출 (톤·백만$)',
      caption: '관세청 통관 기준. 물량과 금액이 함께 튀었다가 함께 내려왔다.',
      telemetry: SYNC,
      render: () => <FrinsaKoreaExportChart />,
      cockpitExtra: () => (
        <SeriesStats
          rows={[
            { 라벨: '2023년', 값: 1977 },
            { 라벨: '2024년', 값: 5509 },
            { 라벨: '2025년', 값: 1954 },
          ]}
          labelKey="라벨"
          valueKey="값"
          unit="톤"
        />
      ),
      sourceLine: '관세청 통관 (사내 조사보고서 인용)',
    },
    {
      title: 'EU 수입관세 (%)',
      caption: '가공도가 세율을 정한다. 캔가공용 냉동 통마리만 end-use 면세다.',
      telemetry: SYNC,
      render: () => <TariffTable />,
      sourceLine: 'EU TARIC (사내 조사보고서 인용) · 2026년 기준',
    },
  ],
};

const SPEC: CommoditySpec = {
  key: 'company-anatomy',
  title: '기업 해부 — Frinsa del Noroeste',
  subtitle: '스페인 갈리시아 캔참치 가공사. 선단 0척으로 한 해 참치 원어 135,289톤을 사들인다.',
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

const TU_CHART_SLOTS: Record<string, ChartSlot[]> = {
  c01: [
    {
      title: '회사 개요',
      caption: '설립·상장·지배구조 등 조사보고서 01장 요약.',
      telemetry: SYNC,
      render: () => <TuProfileTable />,
      sourceLine: '사내 조사보고서 (2026-08) · 56-1 One Report FY2025',
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
  ],
  c03: [
    {
      title: '그룹 생산능력 (톤/년)',
      caption: '노란 막대가 참치 57만 톤. PetCare 는 공시 내 모순(221k vs 195k)이 있어 서술값이다.',
      telemetry: SYNC,
      render: () => <TuCapacityChart />,
      sourceLine: '사내 조사보고서 (2026-08) · One Report p.46',
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
      span: 'full',
      sourceLine: '사내 조사보고서 (2026-08) · SeaChange 2024 (Key Traceability 독립검증)',
    },
  ],
  c04: [
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
  ],
  c05: [
    {
      title: '한국 → 태국 냉동참치 수출 (톤·백만$)',
      caption: '한국 냉동참치 수출의 54.1%(중량)가 태국행이다. 2025년 감소는 관세 관망의 흔적.',
      telemetry: SYNC,
      render: () => <TuKoreaExportChart />,
      cockpitExtra: () => (
        <SeriesStats
          rows={[
            { 라벨: '2024년', 값: 107151 },
            { 라벨: '2025년', 값: 86514 },
          ]}
          labelKey="라벨"
          valueKey="값"
          unit="톤"
        />
      ),
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
    { label: '보유 선단', value: 0, unit: '(척)' },
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

  // 조종석 히어로 스트립 등 요약 전용 호출은 갤러리를 거치지 않는다
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
