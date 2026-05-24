/**
 * KFAS Research 4개 위젯 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 306줄 → After 215줄 (-30%)
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Ship, AlertTriangle, Recycle, TestTube } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const byproductData = [
  { part: '머리', protein: 18.2, lipid: 8.5, ash: 12.1, collagen: 14.8 },
  { part: 'Frame(중골)', protein: 22.1, lipid: 5.2, ash: 15.3, collagen: 18.2 },
  { part: '내장', protein: 14.5, lipid: 12.8, ash: 3.2, collagen: 5.1 },
  { part: '혈합육', protein: 26.4, lipid: 3.1, ash: 2.8, collagen: 2.3 },
  { part: '알(Roe)', protein: 30.5, lipid: 7.0, ash: 3.5, collagen: 1.2 },
  { part: '껍질', protein: 12.3, lipid: 2.1, ash: 8.9, collagen: 28.5 },
];

const longlineData = [
  { period: '1960s', vessels: 120, catch_kt: 60, bigeye_pct: 45, yellowfin_pct: 35 },
  { period: '1970s', vessels: 180, catch_kt: 80, bigeye_pct: 40, yellowfin_pct: 38 },
  { period: '1980s', vessels: 250, catch_kt: 65, bigeye_pct: 38, yellowfin_pct: 35 },
  { period: '1990s', vessels: 200, catch_kt: 50, bigeye_pct: 42, yellowfin_pct: 30 },
  { period: '2000s', vessels: 150, catch_kt: 40, bigeye_pct: 48, yellowfin_pct: 25 },
  { period: '2010s', vessels: 100, catch_kt: 20, bigeye_pct: 55, yellowfin_pct: 20 },
  { period: '2020s', vessels: 70, catch_kt: 9, bigeye_pct: 60, yellowfin_pct: 18 },
];

const ioRiskData = [
  { subject: '지속가능성', purseSeine: 2.1, longline: 1.5, gillnet: 2.8, fullMark: 3 },
  { subject: '생물다양성', purseSeine: 1.8, longline: 1.2, gillnet: 2.5, fullMark: 3 },
  { subject: '서식처 건전성', purseSeine: 1.5, longline: 1.0, gillnet: 2.9, fullMark: 3 },
  { subject: '사회·경제성', purseSeine: 1.3, longline: 1.1, gillnet: 1.8, fullMark: 3 },
  { subject: 'FAD 부수어획', purseSeine: 2.4, longline: 0.8, gillnet: 2.7, fullMark: 3 },
  { subject: '해양포유류 혼획', purseSeine: 1.6, longline: 1.9, gillnet: 2.6, fullMark: 3 },
];

const elderlyFoodData = [
  { product: '함박스테이크', hardness: 16.5, protein: 20.6, acceptance: 85 },
  { product: '완탕', hardness: 12.2, protein: 18.3, acceptance: 82 },
  { product: '토마토스프', hardness: 7.0, protein: 15.1, acceptance: 88 },
  { product: '어육패티(40:60)', hardness: 9.7, protein: 22.4, acceptance: 90 },
  { product: '어육패티(60:40)', hardness: 11.2, protein: 24.1, acceptance: 87 },
];

export function KfasByproductValueChain() {
  return (
    <WidgetCard
      title="참치 부산물 → 고부가 바이오 소재 전환 파이프라인"
      icon={Recycle}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="가다랑어·황다랑어 가공 부산물(총 생산량의 30~60%)의 부위별 화학·영양학적 프로파일링 및 효소 가수분해물의 기능성 평가 결과"
      telemetry={{ status: 'STATIC', syncDate: 'KFAS 2026' }}
      kpiPanel={[
        { label: '부산물 비중', value: '30~60%', sub: '총 어류 생산량 대비', trendColor: '#10b981' },
        { label: '한국 다랑어 어획량', value: '290천톤', sub: 'MOF 2024 기준', trendColor: '#f59e0b' },
      ]}
      chartHeight={280}
      chart={
        <BarChart data={byproductData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="part" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} interval={0} height={50} />
          <YAxis stroke="#94a3b8" unit="%" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="protein" name="조단백(g/100g)" fill="url(#a11y-stripe-h)" color="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="lipid" name="조지방" fill="url(#a11y-diag)" color="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="collagen" name="콜라겐" fill="url(#a11y-dots)" color="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: '한국 다랑어류 어획량 290천톤(MOF, 2024) 중 가공 부산물은 30~60%에 달함(Klomklao & Benjakul, 2016). 가다랑어 부산물 6개 부위의 화학·영양학적 프로파일 완성, 황다랑어 알(Roe) Alcalase 가수분해물의 ACE 억제활성 82%·DPPH 78% 확인. 통조림 부산물 위생안전성도 MFDS 기준치 이하 검증.',
        actionPlan: '부산물 폐기 비용(톤당 $50~80)을 바이오 소재 매출로 전환. ① 콜라겐 추출(껍질 28.5%): 화장품·건강기능식품 원료($15~25/kg) ② 어유(Roe DHA/EPA): 고급 오메가-3 원료($30~50/kg) ③ ACE 억제 펩타이드: 기능성 식품 소재($80~120/kg). 연 부산물 87~174천톤의 10% 고부가 전환 시 연매출 $50M+.',
        source: 'KFAS 한수지 Vol.59(1), 2026 / Vol.58(1), 2025',
      }}
    />
  );
}

export function KfasLonglineEvolution() {
  return (
    <WidgetCard
      title="한국 원양 다랑어 연승어업 60년 구조 변동"
      icon={Ship}
      iconColor="#3b82f6"
      pillar="S1"
      cardDesc="1957년 인도양 시험조업 이후 3대양으로 확대된 한국 연승어업의 선단 규모, 어획량, 어종 구성의 장기 변화 추적"
      telemetry={{ status: 'STATIC', syncDate: 'KFAS 2025' }}
      kpiPanel={[
        { label: '선단 규모 축소율', value: '-72%', sub: '1980s 250척 → 2020s 70척', trendColor: '#ef4444' },
        { label: 'MSC 인증 필요성', value: '필수', sub: '미끼 자원 포함 지속가능성', trendColor: '#3b82f6' },
      ]}
      chartHeight={280}
      chart={
        <ComposedChart data={longlineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="period" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} />
          <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" unit="%" tick={{ fill: '#f59e0b', fontSize: 12, fontWeight: 500 }} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
          <Legend />
          <Bar yAxisId="left" dataKey="vessels" name="조업 척수" fill="url(#a11y-stripe-h)" color="#3b82f6" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
          <Line yAxisId="left" type="monotone" dataKey="catch_kt" name="어획량(천톤)" stroke="#ef4444" strokeWidth={3} />
          <Line yAxisId="right" type="monotone" dataKey="bigeye_pct" name="눈다랑어 비중(%)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
        </ComposedChart>
      }
      takeaway={{
        situation: '한국 원양 다랑어 연승어업은 1957년 시험조업 이후 1980년대 250척·65천톤 정점을 기록했으나, WCPFC 규제 강화와 경제성 악화로 2020년대 70척·9천톤으로 급감. 어종 구성은 눈다랑어(고단가) 비중이 45%→60%로 고급화, 인도네시아산 풀가라지(미끼) 자원의 지속가능성이 MSC 인증 신규 병목.',
        actionPlan: '① 연승어업의 \'소수정예 고단가\' 전환을 전략적 자산으로 재평가(척당 생산성 127t→129t 유지). ② MSC 미끼자원 인증 준비 선제 착수 — 인도네시아 풀가라지 MSY 대비 어획률(52.8%) 검증이 핵심. ③ 태평양 조업 거점의 남위 이동(기후변화 적응)에 대비한 VDS 입어 포트폴리오 재편.',
        source: 'KFAS 한수지 Vol.58(4), 2025 / Vol.58(6), 2025',
      }}
    />
  );
}

export function KfasIndianOceanRisk() {
  return (
    <WidgetCard
      title="인도양 다랑어어업 생태계 위험도 레이더"
      icon={AlertTriangle}
      iconColor="#f97316"
      pillar="S5"
      cardDesc="IOTC 관할 서부인도양 해역 — 어업별(선망/연승/자망) 생태계기반 위험도 평가(EBFA) 결과. 자망(Gillnet)이 전 지표에서 최고 위험."
      telemetry={{ status: 'STATIC', syncDate: 'KFAS 2023-2025' }}
      kpiPanel={[
        { label: '자망 FAD 위험도', value: 'HIGH', sub: '서식처 훼손 + 부수어획', trendColor: '#ef4444' },
        { label: 'IO 수익 비중', value: '80%', sub: '인도양 전체 다랑어어업 중', trendColor: '#10b981' },
      ]}
      chartHeight={280}
      chart={
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={ioRiskData}>
          <PolarGrid stroke="rgba(255,255,255,0.15)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} />
          <PolarRadiusAxis angle={30} domain={[0, 3]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
          <Legend />
          <Radar name="선망(Purse Seine)" dataKey="purseSeine" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
          <Radar name="연승(Longline)" dataKey="longline" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
          <Radar name="자망(Gillnet)" dataKey="gillnet" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
        </RadarChart>
      }
      takeaway={{
        situation: '인도양 다랑어 어업은 약 $20억 수익을 창출하며 그 중 80%가 서부인도양(WIO)에서 발생. EBFA 분석 결과, 자망(Gillnet) 어업이 전 6개 관리목표에서 최고 위험(Risk Score 2.5~2.9/3.0) 기록. 특히 FAD 사용 자망에서 부수어획 및 서식처 건전성 위험 극단적 고위험, 눈다랑어는 \'과도어획\' 상태 진입 중.',
        actionPlan: '인도양 소싱 시 자망 어획 원물 회피, 연승 어획물 비중 확대. ① 연승 어획물은 전 지표에서 Low Risk(1.0~1.9)로 ESG 컴플라이언스 최적 ② IOTC TAC 강화(2027 예상) 시 자망 퇴출로 공급 15~20% 감소 가능 → 선제 장기계약 ③ t-RFMO 5개 기구의 해양포유류 보존관리조치(CMM) 준수 여부를 소싱 체크리스트에 반영.',
        source: 'KFAS 한수지 Vol.56(4), 2023 / Vol.58(6), 2025',
      }}
    />
  );
}

export function KfasElderlyFunctionalFood() {
  return (
    <WidgetCard
      title="눈다랑어 고령친화식품 & 기능성 신시장"
      icon={TestTube}
      iconColor="#8b5cf6"
      pillar="S4"
      cardDesc="눈다랑어 기반 연화식 제품(함박/완탕/스프) 및 참치-황새치 어육패티의 품질특성 검증 — 한국 고령화 시대의 신성장 동력"
      telemetry={{ status: 'STATIC', syncDate: 'KFAS 2023-2025' }}
      kpiPanel={[
        { label: '고령친화식품 시장(KR)', value: '₩5조', sub: '2025E · CAGR 15%+', trendColor: '#8b5cf6' },
        { label: '최적 배합비', value: '40:60', sub: '참치적색육:황새치백색육', trendColor: '#10b981' },
      ]}
      chartHeight={280}
      chart={
        <ComposedChart data={elderlyFoodData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="product" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} interval={0} height={60} />
          <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#10b981" unit="%" tick={{ fill: '#10b981', fontSize: 12, fontWeight: 500 }} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
          <Legend />
          <Bar yAxisId="left" dataKey="protein" name="조단백(%)" fill="url(#a11y-stripe-h)" color="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="hardness" name="경도(N)" fill="url(#a11y-diag)" color="#f59e0b" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
          <Line yAxisId="right" type="monotone" dataKey="acceptance" name="관능 수용도(%)" stroke="#10b981" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{
        situation: '한국 65세+ 인구가 전체 20%를 돌파하며 고령친화식품 시장이 급성장 중. 눈다랑어 레토르트 연화식 3종(함박/완탕/스프)의 경도·단백질·관능평가 완료, 참치 적색육:황새치 백색육 40:60 배합 패티가 단백질 22.4%·관능수용도 90%로 최적 조건 확인. 수산물 기반 고령친화식품은 현재 거의 전무한 블루오션.',
        actionPlan: '① 눈다랑어 연화식 3종을 \'실버 프리미엄\' 라인으로 상품화 검토(학교급식 + 요양시설 B2B 우선). ② 참치-황새치 40:60 어육패티를 HMR 채널로 출시 — 기존 육류 패티 대비 단백질 동등·지방 50% 저감을 USP로 활용. ③ 대서양참다랑어 양식 사료에 아마인유(Linseed Oil) 15% 대체가 성장률 무영향으로 검증되어(KFAS 2023) 사료비 절감 카드로 활용 가능.',
        source: 'KFAS 한수지 Vol.57(5), 2024 / Vol.56(5), 2023 / Vol.58(3), 2025',
      }}
    />
  );
}
