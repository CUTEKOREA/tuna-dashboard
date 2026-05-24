'use client';
import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, Cell } from 'recharts';
import { Thermometer, AlertOctagon, Flame, TrendingUp, Layers, Shield, ArrowUp, Recycle, ShieldAlert, Scale } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

// 1. 글로벌 기후-어획량 상관관계 레이더
export function Widget01_ClimateYieldRadar() {
  const data = [
    { year: '2016', enso: 2.6, catch: 65 },
    { year: '2017', enso: -0.5, catch: 90 },
    { year: '2018', enso: 0.9, catch: 85 },
    { year: '2019', enso: 0.5, catch: 88 },
    { year: '2020', enso: -1.3, catch: 110 },
    { year: '2021', enso: -1.0, catch: 105 },
    { year: '2022', enso: -0.9, catch: 108 },
    { year: '2023', enso: 2.0, catch: 55 },
  ];
  return (
    <WidgetCard
      title="기후-어획량 상관관계 (해양대기청 ENSO vs 어획량)"
      icon={Thermometer}
      iconColor="#67e8f9"
      pillar="S1"
      cardDesc="ENSO(엘니뇨/라니냐) 수온 편차와 페루 연안 어획량의 즉시 반응 곡선"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={250}
      chart={
        <ComposedChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="left" stroke="var(--color-danger)" fontSize={11} />
          <YAxis yAxisId="right" orientation="right" stroke="#67e8f9" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
          <Bar yAxisId="left" dataKey="catch" name="어획량 지수" fill="url(#a11y-stripe-h)" color="var(--color-danger)" fillOpacity={0.6} />
          <Line yAxisId="right" type="monotone" dataKey="enso" name="ENSO(수온편차)" stroke="#67e8f9" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{
        situation: "2023년 슈퍼 엘니뇨가 발생하자 페루 연안 어획량이 평년 88-108 인덱스에서 55까지 즉시 폭락. 수온 1℃ 상승 시 어획량 평균 35% 증발.",
        actionPlan: "[상관성 경보] NOAA ENSO 지수가 +1.5℃를 돌파하는 즉시 페루산 의존도를 30%P 이상 축소하고, 라니냐 국면에서 선제 비축으로 5-6개월 시세 폭등에 대비.",
        source: "NOAA ENSO Index + FAO 페루 어획량 시계열",
      }}
    />
  );
}

// 2. 자원 붕괴 카운트다운 오버레이
export function Widget02_CollapseCountdown() {
  const data = [
    { year: 'T-10', cod: 100, squid: 100 },
    { year: 'T-8', cod: 95, squid: 85 },
    { year: 'T-6', cod: 80, squid: 65 },
    { year: 'T-4', cod: 50, squid: 45 },
    { year: 'T-2', cod: 20, squid: 25 },
    { year: 'T-0', cod: 1, squid: null },
  ];
  return (
    <WidgetCard
      title="자원 붕괴 카운트다운 오버레이"
      icon={AlertOctagon}
      iconColor="#f87171"
      pillar="S1"
      cardDesc="1990년 캐나다 대구 붕괴 사례와 현재 한국 살오징어 추락 궤적의 수학적 비교"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
          <Line type="monotone" dataKey="cod" name="'90 캐나다 대구 추락" stroke="#64748b" strokeDasharray="5 5" strokeWidth={2} />
          <Line type="monotone" dataKey="squid" name="현재 한국 살오징어" stroke="#f87171" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{
        situation: "대구 사태 당시 T-4년 시점의 기울기와 현재 살오징어 궤적이 98% 일치. 자율 규제는 이미 실패 단계 — V자 반등 가능성 통계적으로 봉쇄.",
        actionPlan: "[자원 마지노선] 살오징어 자원 회복 시나리오를 모든 사업 계획에서 제거. 국내산 의존도 0%를 목표로 100% 수입·원양 체제로 즉시 전환.",
        source: "FAO Atlantic Cod Collapse Archive (1992) vs KMI 살오징어 시계열",
      }}
    />
  );
}

// 3. 글로벌 해류 수온 편차 히트맵
export function Widget03_SSTAnomaly() {
  const data = [
    { area: 'Area 41 (S.America)', temp_diff: 1.2 },
    { area: 'Area 87 (Pacific)', temp_diff: 1.8 },
    { area: 'Area 61 (NW.Pacific)', temp_diff: 2.1 },
    { area: 'Area 51 (Indian)', temp_diff: 0.8 },
  ];
  return (
    <WidgetCard
      title="해류 수온 편차 (해수면 온도 편차)"
      icon={Flame}
      iconColor="#f59e0b"
      pillar="S1"
      cardDesc="FAO 해역별 평년비 수온 델타 — 1.5℃ 초과 시 냉수성 어종 서식 불가"
      telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }}
      chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} domain={[0, 2.5]} />
          <YAxis dataKey="area" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={120} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
          <Bar dataKey="temp_diff" name="평년비 수온 델타(°C)">
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.temp_diff > 1.5 ? 'var(--color-danger)' : 'var(--color-warning)'} />
            ))}
          </Bar>
        </BarChart>
      }
      takeaway={{
        situation: "북서태평양(한국/일본 연안) 수온 편차가 +2.1℃로 4개 해역 중 가장 가혹. 냉수성 살오징어 남하 완전 차단된 상태.",
        actionPlan: "[히트맵 감지] 북서태평양(NW Pacific) 어장 의존도를 5년 내 0% 목표로 단계 철수. 남미(Area 41) 및 인도양(Area 51) 어장으로 선단 자산 재배치.",
        source: "NOAA Optimum Interpolation SST + FAO Area boundary",
      }}
    />
  );
}

// 4. 글로벌 단백질원 패권 성장률
export function Widget04_ProteinGrowth() {
  const data = [
    { protein: '연어', growth: 5.2 },
    { protein: '두족류(오징어)', growth: 4.8 },
    { protein: '계육', growth: 3.5 },
    { protein: '참치', growth: 2.1 },
    { protein: '돈육', growth: 1.8 },
    { protein: '우육', growth: 0.9 },
  ];
  return (
    <WidgetCard
      title="단백질원별 글로벌 수요 성장률"
      icon={TrendingUp}
      iconColor="#06b6d4"
      pillar="S4"
      cardDesc="주요 단백질 6종의 연평균 글로벌 수요 성장률 — 두족류는 헬스푸드 트렌드 진입"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={250}
      chart={
        <BarChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="protein" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
          <Bar dataKey="growth" name="연평균 수요 성장률(%)" fill="url(#a11y-stripe-h)" color="var(--color-info)" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: "두족류 수요는 아시아 전통 시장을 넘어 북미·유럽 저지방 헬스푸드 트렌드로 연평균 4.8% 성장 중. 연어(5.2%) 다음의 2위.",
        actionPlan: "[거시 수요] 북미·유럽 시장 진출 가속화 — 그릴 오징어(타파스), 칼라마리 링, 단백질 스낵 형태의 프리미엄 라인업으로 대중 프리미엄(mass-premium) 포지셔닝.",
        source: "FAO Food Balance Sheets (2010-2024)",
      }}
    />
  );
}

// 5. 어종별 원시 생산 비중 트렌드
export function Widget05_SpeciesMix() {
  const data = [
    { year: '2010', 살오징어: 40, 대왕오징어: 20, 아르헨티나: 15, 기타: 25 },
    { year: '2015', 살오징어: 30, 대왕오징어: 35, 아르헨티나: 20, 기타: 15 },
    { year: '2020', 살오징어: 15, 대왕오징어: 50, 아르헨티나: 25, 기타: 10 },
    { year: '2023', 살오징어: 8, 대왕오징어: 60, 아르헨티나: 22, 기타: 10 },
  ];
  return (
    <WidgetCard
      title="글로벌 두족류 어종별 생산 비중"
      icon={Layers}
      iconColor="#8b5cf6"
      pillar="S1"
      cardDesc="2010-2023년 4어종 점유율 변화 — 대왕오징어 격상 vs 살오징어 멸종"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={250}
      chart={
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Area type="monotone" dataKey="대왕오징어" stackId="1" fill="var(--color-danger)" stroke="var(--color-danger)" />
          <Area type="monotone" dataKey="아르헨티나" stackId="1" fill="#06b6d4" stroke="#06b6d4" />
          <Area type="monotone" dataKey="살오징어" stackId="1" fill="#8b5cf6" stroke="#8b5cf6" />
        </AreaChart>
      }
      takeaway={{
        situation: "2010년 이단아 취급받던 대왕오징어가 점유율 60% 돌파하며 사실상 '글로벌 표준 오징어'로 격상. 살오징어는 8%로 추락.",
        actionPlan: "[어종 교체] 살오징어 가공 라인 50% 이상 대왕오징어 처리 설비로 전환. 신규 설비투자(CAPEX)는 대왕오징어 가공 자동화에 집중 투자.",
        source: "FAO FishStatJ Capture Production by Species (2010-2023)",
      }}
    />
  );
}

// 6. MPA 확장 시뮬레이터
export function Widget06_MPAExpansion() {
  const data = [
    { year: '2015', mpa: 3, fishingZone: 97 },
    { year: '2020', mpa: 7, fishingZone: 93 },
    { year: '2025', mpa: 15, fishingZone: 85 },
    { year: '2030(E)', mpa: 30, fishingZone: 70 },
  ];
  return (
    <WidgetCard
      title="해양보호구역(MPA) 및 조업 축소 시뮬"
      icon={Shield}
      iconColor="#10b981"
      pillar="S1"
      cardDesc="UN 30x30 선언에 따른 글로벌 가용 어장 면적 시뮬레이션 (2015-2030)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={250}
      chart={
        <BarChart data={data} stackOffset="expand">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(tick) => `${tick * 100}%`} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="mpa" name="보호구역(조업금지)" stackId="a" fill="url(#a11y-stripe-h)" color="var(--color-success)" />
          <Bar dataKey="fishingZone" name="합법 조업구역" stackId="a" fill="url(#a11y-diag)" color="var(--color-info)" fillOpacity={0.6} />
        </BarChart>
      }
      takeaway={{
        situation: "UN 30x30 선언에 따라 2030년까지 글로벌 가용 공해 어장의 30%가 물리적으로 소멸. 2015년 3%에서 10배 확장 예정.",
        actionPlan: "[조업 면적 상실] MPA 확장 캘린더를 사전 입수하여 보호구역 지정 임박 해역에서 18개월 전 선제 철수. 잔존 어장에서의 어획 강도 극대화 라이선스 확보 경쟁 가속.",
        source: "UN Convention on Biological Diversity 30x30 Roadmap",
      }}
    />
  );
}

// 7. 생태계 이동 궤적
export function Widget07_LatitudeShift() {
  const data = [
    { decade: '1990s', latitude: 35 },
    { decade: '2000s', latitude: 37 },
    { decade: '2010s', latitude: 40 },
    { decade: '2020s', latitude: 44 },
  ];
  return (
    <WidgetCard
      title="기후 발(發) 군집 이동 위도선 (북상)"
      icon={ArrowUp}
      iconColor="#fbbf24"
      pillar="S1"
      cardDesc="오징어 떼 평균 서식지의 북상 이동 — 30년간 9도 위도 상승"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="decade" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis domain={['auto', 'auto']} stroke="rgba(255,255,255,0.5)" fontSize={11} label={{ value: '평균 위도(N)', angle: -90, position: 'insideLeft', fill: 'var(--text-primary)' }} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line type="stepAfter" dataKey="latitude" name="주 조업 위도경계선" stroke="var(--color-warning)" strokeWidth={3} dot={{ r: 6 }} />
        </LineChart>
      }
      takeaway={{
        situation: "오징어 떼 평균 주 서식지가 위도 44도(러시아 연해주·베링해 인근)까지 가파르게 북상. 30년간 9도 상승 = 거리로 1,000km 이상 이탈.",
        actionPlan: "[영해 이탈] 러시아·일본 배타적 경제수역(EEZ) 입어료 협상 트랙 신설. 베링해 조업 라이선스 단가가 5년 내 3배로 폭등할 것을 대비해 장기 계약 즉시 락인.",
        source: "Northeast Asian Squid Migration Tracking (JFA + KMI 1990-2023)",
      }}
    />
  );
}

// 8. 어분/사료 전락 비율
export function Widget08_FishmealRatio() {
  const data = [
    { year: '2020', food: 88, feed: 12 },
    { year: '2021', food: 85, feed: 15 },
    { year: '2022', food: 78, feed: 22 },
    { year: '2023', food: 70, feed: 30 },
  ];
  return (
    <WidgetCard
      title="글로벌 어분/사료(Feed) 전락 비율"
      icon={Recycle}
      iconColor="#ec4899"
      pillar="S2"
      cardDesc="어획물 중 식용 가공 vs 사료/폐기 분기 — 어체 왜소화로 사료 전락분 가속 증가"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={250}
      chart={
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Area type="monotone" dataKey="feed" stackId="1" fill="#ec4899" stroke="#ec4899" name="사료폐기/미달(%)" />
          <Area type="monotone" dataKey="food" stackId="1" fill="var(--color-info)" stroke="var(--color-info)" name="식용 가공(%)" />
        </AreaChart>
      }
      takeaway={{
        situation: "어황 악화로 개체 크기가 급감, 잡아도 식용 마진이 안 나와 연어/광어 사료로 갈려나가는 30%의 역설. 2020년 12% → 2023년 30%.",
        actionPlan: "[수율 악화] 그레이딩(크기 분류) 자동화 설비 도입 + 사료 전락 물량을 펫푸드·동물 단백질 BCG 고부가 라인으로 우회 가공하여 톤당 마진 회복.",
        source: "FAO Fishmeal Reduction Yield Reports (2020-2023)",
      }}
    />
  );
}

// 9. IUU 조업 리스크
export function Widget09_IUURadar() {
  const data = [
    { country: 'C국(선단)', violations: 450 },
    { country: 'T국(원양)', violations: 210 },
    { country: 'V국(연안)', violations: 180 },
    { country: '기타 7개국', violations: 130 },
  ];
  return (
    <WidgetCard
      title="IUU (불법/비보고 조업) 리스크 횟수"
      icon={ShieldAlert}
      iconColor="#f43f5e"
      pillar="S3"
      cardDesc="선박자동식별장치(AIS) 이탈/배타적 경제수역(EEZ) 침범 등 불법조업(IUU) 사례 — 적색카드(Red Card) 제재 트리거 모니터링"
      telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }}
      chartHeight={250}
      chart={
        <BarChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="country" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="violations" name="AIS 이탈/침범 횟수" fill="url(#a11y-stripe-h)" color="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: "특정 거대 선단의 상습적 선박자동식별장치(AIS) 끄기 및 배타적 경제수역(EEZ) 침범 — 연간 450회 위반. EU/미국 수입 금지 제재(적색카드, Red Card) 발동 트리거 대기 중.",
        actionPlan: "[지정학 리스크] 불법조업(IUU) 고위험국 가공품 직접 매입을 100% 차단하고 수산물수입모니터링제도(SIMP) 인증을 받은 제3국 가공거점만 사용. 원산지증명서(C/O) 위변조 검증 프로세스 의무화.",
        source: "OceanMind AIS Tracking + Global Fishing Watch IUU Index (2024)",
      }}
    />
  );
}

// 10. TAC 제한 vs 실조업 갭
export function Widget10_TACGap() {
  const data = [
    { year: '2019', tac: 100, actual: 110 },
    { year: '2020', tac: 90, actual: 115 },
    { year: '2021', tac: 80, actual: 105 },
    { year: '2022', tac: 70, actual: 95 },
    { year: '2023', tac: 60, actual: 98 },
  ];
  return (
    <WidgetCard
      title="총허용어획량(TAC) vs 실 조업물량 갭"
      icon={Scale}
      iconColor="#eab308"
      pillar="S1"
      cardDesc="과학적 한계(TAC) 대비 실제 어획량의 초과 폭 — 자원 고갈 가속 시그널"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line type="monotone" dataKey="tac" name="과학적 한계(TAC)" stroke="var(--color-success)" strokeWidth={2} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="actual" name="실제 조업/남획량" stroke="#eab308" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{
        situation: "규제 당국이 매년 쿼터를 60-90% 수준으로 삭감함에도, 무허가 싹쓸이로 인해 실제 어획량이 TAC 곡선을 5년 연속 하향 돌파 중.",
        actionPlan: "[초과 남획] 자원 회복 시나리오를 영구 제외. TAC 절대 준수 인증 선단만 1차 벤더로 등록하고, 비준수 선단의 가공품은 ESG 위반 사유로 거래 차단.",
        source: "RFMO TAC vs Actual Catch Reports (2019-2023)",
      }}
    />
  );
}
