/**
 * NewInsights B 3개 위젯 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 183줄 → After 130줄 (-29%)
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart } from 'recharts';
import { FlaskConical, Landmark, Factory } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const coinBrothData = [
  { year: '2022', 액상_시장: 520, 분말_코인: 80, 마진율_분말: 35 },
  { year: '2023', 액상_시장: 580, 분말_코인: 120, 마진율_분말: 38 },
  { year: '2024', 액상_시장: 630, 분말_코인: 180, 마진율_분말: 40 },
  { year: '2025', 액상_시장: 700, 분말_코인: 260, 마진율_분말: 42 },
  { year: '2026E', 액상_시장: 750, 분말_코인: 380, 마진율_분말: 45 },
];

const pillarTwoData = [
  { company: 'Thai Union', before: 7.2, after: 13.5 },
  { company: 'Dongwon', before: 8.1, after: 12.8 },
  { company: 'Bolton', before: 6.5, after: 14.2 },
  { company: 'FCF Fishery', before: 5.8, after: 11.5 },
];

// Source: ILO Global Wage Report 2024 + VASEP Annual Report 2024 + 관세청 KCS VKFTA HSK 1604.14.20.00
const vietnamData = [
  { metric: '월 임금($)', Vietnam: 342, Thailand: 431 },
  { metric: '리드타임(일)', Vietnam: 6.35, Thailand: 7.13 },
  { metric: '인증 수(개)', Vietnam: 10, Thailand: 8 },
  { metric: 'VKFTA 관세(%)', Vietnam: 0, Thailand: 8 },
];

export function InsightTunaExtract() {
  return (
    <WidgetCard
      title="가다랑어(Skipjack) 액젓 분말화 (2026)"
      icon={FlaskConical}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="국내 참치액 시장 700~1,000억원(추정, 출처별 편차). 코인 육수 시장 +20% YoY 성장 중. 분말화로 냉동→건화물 전환 시 물류비 획기적 절감 (2026년 기준)"
      telemetry={{ status: 'STATIC', syncDate: '2026년 기준' }}
      termTooltip={{ term: '코인 육수', description: '가다랑어(Skipjack) 추출액은 액젓이 아니라 \'코인 육수\' 시장(국내 700~1,000억원 추정)을 지배할 B2B 분말 소재입니다. 분무건조 기술로 물류비 50% 절감.' }}
      kpiPanel={[
        { label: '코인 육수 시장 성장률', value: '+20% YoY', sub: '가다랑어 분말 소재 수요 폭발', trendColor: '#10b981' },
      ]}
      chartHeight={280}
      chart={
        <ComposedChart data={coinBrothData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="#94a3b8" />
          <YAxis yAxisId="left" stroke="#94a3b8" unit="억" />
          <YAxis yAxisId="right" orientation="right" stroke="#10b981" unit="%" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Bar yAxisId="left" dataKey="액상_시장" name="액상 시장(억원)" fill="url(#a11y-stripe-h)" color="#64748b" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="분말_코인" name="분말/코인 시장(억원)" fill="url(#a11y-diag)" color="#10b981" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="마진율_분말" name="분말 B2B 마진율(%)" stroke="#fbbf24" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{
        situation: '한국 참치액 시장(700~1,000억원, 출처별 편차)은 과포화된 액상 경쟁에서 벗어나 \'코인 육수\' 분말 시장(+20% YoY)으로 급속 확장 중. 가다랑어 추출액의 분무건조 설비를 결합하면 냉동 컨테이너를 건화물로 전환하여 통관/물류비를 50% 이상 절감할 수 있음.',
        actionPlan: '참치액의 미래는 액상이 아닌 \'분말\'에 있음. 베트남 현지 가다랑어(Skipjack) 전용 분무건조 파일럿을 즉시 가동하고, CJ/대상 등 코인 육수 제조사에 B2B 핵심 원료 납품 계약을 선제 체결. TN 지수 1.5% 이상 고농축 스펙으로 차별화하여 프리미엄 시장 장악.',
        source: 'KMI 식품산업통계정보 (2026) · 자체 추정치 (700~1,000억원 범위, 식약처/aT 단일화 대기)',
      }}
    />
  );
}

export function InsightPillarTwo() {
  return (
    <WidgetCard
      title="OECD Pillar Two 세금 쇼크 (황다랑어 밸류체인)"
      icon={Landmark}
      iconColor="#fbbf24"
      pillar="S4"
      cardDesc="조세 피난처와 이전가격 조작에 의존하던 다국적 수산기업의 실효세율이 OECD Pillar Two(2026 시행)로 2배 폭등"
      telemetry={{ status: 'STATIC', syncDate: '2026년 기준' }}
      termTooltip={{ term: 'Pillar Two', description: '2026년 글로벌 최저한세 15% 적용. 조세 피난처를 경유하는 다국적 황다랑어/눈다랑어 유통 기업의 실효세율이 7%→14%로 급등.' }}
      kpiPanel={[
        { label: '평균 관세 영향', value: '7% → 14%', sub: '▲ ROE 근본적 훼손 (2026)', trendColor: '#fbbf24' },
      ]}
      chartHeight={280}
      chart={
        <BarChart data={pillarTwoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="company" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" unit="%" domain={[0, 18]} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="before" name="기존 실효세율(%)" fill="url(#a11y-stripe-h)" color="#64748b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="after" name="Pillar Two 적용 후(%) (2026E)" fill="url(#a11y-diag)" color="#fbbf24" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: '2026년 OECD Pillar Two 도입으로 조세 피난처 유령법인을 활용하던 다국적 수산기업(Thai Union, Bolton 등)의 실효 법인세율이 7%에서 14%로 거의 2배 폭등. 고단가 황다랑어(Yellowfin)의 이전가격(Transfer Pricing) 조작 구조 붕괴.',
        actionPlan: 'Pillar Two는 글로벌 수산업계의 \'디지털세\'. 포트폴리오 내 유령법인 구조 의존 기업의 밸류에이션을 즉시 15~20% 디스카운트. 세무 구조 리스크가 낮고 유럽 내 실질 가공 거점을 보유한 스페인(Frinsa 등) 지역 벤더를 대체 파트너로 재선별.',
        source: 'KIEP 국제조세 동향 (2025) · EU 집행위 발표자료',
      }}
    />
  );
}

export function InsightVietnamOEM() {
  return (
    <WidgetCard
      title="베트남 OEM 역전 — 황다랑어 가공 생태계 장악"
      icon={Factory}
      iconColor="#06b6d4"
      pillar="S2"
      cardDesc="2026년 베트남 임금 $342(태국 대비 -20%), VKFTA 무관세. MMPA 규제로 원물 부족 → 한국 원양 선단에 절대적 교섭력 집중"
      telemetry={{ status: 'STATIC', syncDate: '2026년 기준' }}
      termTooltip={{ term: 'MMPA·VKFTA', description: '미국 MMPA 규제와 원물 부족 이중고 속에서 베트남 가공업체의 약세가 오히려 원양 선단 보유 기업에게 최적의 지분 투자 윈도우를 제공.' }}
      chartHeight={280}
      chart={
        <BarChart data={vietnamData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis dataKey="metric" type="category" stroke="#94a3b8" width={100} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="Vietnam" name="🇻🇳 베트남 (2026)" fill="url(#a11y-stripe-h)" color="#06b6d4" radius={[0, 4, 4, 0]} />
          <Bar dataKey="Thailand" name="🇹🇭 태국 (2026)" fill="url(#a11y-diag)" color="#64748b" radius={[0, 4, 4, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: '미국 MMPA(2026 시행)로 베트남 어업 수입 금지 및 황다랑어(Yellowfin) 어획 제한으로 현지 가공 공장의 원물 가뭄 극심. 이 규제 이중고가 역설적으로 안정적 원양 선단을 보유한 기업에게 베트남 OEM 공장을 장악할 교섭력(Leverage) 제공.',
        actionPlan: '베트남의 원물 부족 위기는 한국 조업사에게 최상의 \'지분 인수 스위트 스팟\'. Tan Phat Foods 등 국제 인증(BRC/IFS)을 보유한 현지 최상위 벤더의 소수 지분(15~25%)을 원물(황다랑어) 장기 공급권과 스왑(Swap)하여 선제 확보.',
        source: 'ILO Global Wage Report (2025) · 관세청 KCS VKFTA',
      }}
    />
  );
}
