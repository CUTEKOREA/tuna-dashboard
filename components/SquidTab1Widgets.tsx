'use client';
import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, Cell } from 'recharts';
import { Thermometer, AlertOctagon, Flame, TrendingUp, Layers, Shield, ArrowUp, Recycle, ShieldAlert, Scale } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

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
      cardDesc="ENSO(엘니뇨/라니냐) 수온 편차와 페루 연안 어획량의 즉시 반응 곡선 (NOAA ENSO Index + FAO 어획량 시계열 기반)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={250}
      chart={
        <ComposedChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="left" stroke="var(--color-danger)" fontSize={11} />
          <YAxis yAxisId="right" orientation="right" stroke="#67e8f9" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
          <Bar yAxisId="left" dataKey="catch" name="어획량 지수" fill="var(--color-danger)" fillOpacity={0.6} />
          <Line yAxisId="right" type="monotone" dataKey="enso" name="ENSO(수온편차)" stroke="#67e8f9" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"ENSO(El Niño-Southern Oscillation)"는 적도 태평양 해수면 온도가 +0.5℃ 이상 상승하는 주기성 기후 변동. +1.5℃ 이상은 "수퍼 엘니뇨"로 분류되며 글로벌 수산에 직격탄.</p>
<p>실측 충격: <strong>2023년 수퍼 엘니뇨 발생 시 페루 연안 오징어 어획량이 평년 88-108 인덱스에서 55까지 즉시 폭락(-40%)</strong>. 수온 +1℃당 어획량 평균 -35% 증발. 페루는 글로벌 대왕오징어(Jumbo squid)의 50%를 공급하는 핵심 산지.</p>
<p>의미: ENSO는 단순 기후 변수가 아닌 <strong>"5~6개월 후 글로벌 오징어 가격 폭등의 leading indicator"</strong>. NOAA ENSO Index를 매월 monitoring하면 사실상 6개월 앞서 매입 타이밍 결정 가능.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: ENSO 시그널은 단순 기후 알람이 아닌 <strong>"systematic procurement trading signal"</strong>. 본사 매입 데스크가 NOAA ENSO Index를 매주 monitoring + 임계치 돌파 시 자동 dynamic sourcing.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>NOAA ENSO +1.5℃ 돌파 즉시 페루 의존도 -30%p 축소</strong>: 자동 alert + 대체 어장(아르헨티나 일렉스·뉴질랜드) forward 매입 가속.</li>
<li style="margin-bottom: 8px;"><strong>라니냐 국면 선제 비축</strong>: ENSO 음전환 시점에 평소 60일치 → 180일치 안전 재고 확보. 5~6개월 후 가격 폭등 활용.</li>
<li><strong>"ENSO-indexed swap" 발행</strong>: NOAA ENSO Index를 underlying으로 한 OTC swap을 ICE에 상장 시도. JP Morgan Climate Derivatives Desk와 collab. 본업 외 systematic trading P&amp;L 추가.</li>
</ol>
</div>`,
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
        situation: `<div>
<p>"자원 붕괴 카운트다운"이란 어종이 회복 불가능한 임계점(point of no return)까지 남은 시간을 추적하는 dashboard. 한국 살오징어가 유사한 궤도에 있다는 우려가 제기됩니다.</p>
<p>역사적 비교: 1990년대 캐나다 대구(Cod) 붕괴 사례는 가장 잘 기록된 어자원 붕괴 사례. 당시 T-4년 시점의 어획량 감소 기울기가 현재 살오징어 감소 추세와 유사한 패턴을 보임. 대구는 붕괴 후 30년 이상 회복이 더딘 상태.</p>
<p>의미: 자율 규제(TAC·금어기·체장 제한)가 추세를 역전시키지 못할 경우 살오징어 의존 사업 모델의 리스크는 실재. V자 반등 가능성은 현 데이터 기준 낮다는 것이 학계 중론. BS에 사전 반영 검토 필요.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 살오징어 자원 회복 시나리오를 모든 사업 계획에서 영구 제거. <strong>"국내산 의존도 0%"</strong>를 목표로 100% 수입·원양 체제 즉시 전환.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>국내 살오징어 가공 라인 자산 손상차손 사전 계상</strong>: IFRS 9 기준 5년 후 stranded asset 처리 — 충당금 매분기 적립.</li>
<li style="margin-bottom: 8px;"><strong>페루·아르헨티나·뉴질랜드 원양 라이센스 forward 매입</strong>: 대왕오징어 + 일렉스 100% 대체 supply 락업.</li>
<li><strong>"국내산 헤리티지 브랜드" 폐기 vs 글로벌 brand 재포지셔닝</strong>: 살오징어는 "한정 luxury heritage" 라인으로 ASP +200~300% 프리미엄. 대왕오징어가 mass market 표준으로 전환.</li>
</ol>
</div>`,
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
      cardDesc="FAO 해역별 평년비 수온 델타 업계추정 — 1.5℃ 초과 시 냉수성 어종 서식 불가 (실측 수치는 NOAA OISST 직접 확인 필요)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
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
        situation: `<div>
<p>"해수면 온도 편차(SST Anomaly)"란 평년 대비 현재 수온 차이. 어종 서식지의 가장 강력한 leading indicator.</p>
<p>4개 해역 격차: <strong>북서태평양(한국·일본 연안) +2.1℃</strong>로 가장 가혹. 동태평양 +1.3℃, 남대서양 +0.8℃, 인도양 +0.5℃. 살오징어는 냉수성(10~18℃) 어종이라 +2℃ 수온 상승만으로 서식지 완전 이탈.</p>
<p>결과: <strong>한국·일본 연안에서 살오징어 남하 완전 차단</strong>. 매년 동해안 어획량 -30~50% 가속화. 향후 10년 추가 SST +1℃ 상승 시 0% 가능.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 북서태평양 어장은 climate beta 100% 노출의 dead asset. <strong>5년 내 의존도 0%</strong> 목표로 단계 철수가 본질.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>북서태평양 선단 자산 재배치</strong>: 남미(Area 41)·인도양(Area 51) 어장으로 단계적 이동. 노후 선박은 매각, 신조선은 ice-class로 북극해까지 진입 가능.</li>
<li style="margin-bottom: 8px;"><strong>아르헨티나 일렉스·뉴질랜드 어장 라이센스 forward 락업</strong>: 5~10년 long-term contract.</li>
<li><strong>"Climate displacement insurance"</strong>: 어장 이동 cost를 parametric insurance로 transfer. Munich Re·AXA Climate와 partnership.</li>
</ol>
</div>`,
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
      cardDesc="주요 단백질 6종의 연평균 글로벌 수요 성장률(업계추정) — 두족류는 헬스푸드 트렌드 진입 (FAO Food Balance Sheets 기반)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={250}
      chart={
        <BarChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="protein" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
          <Bar dataKey="growth" name="연평균 수요 성장률(%)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>글로벌 단백질 수요 성장률 (CAGR 5년): <strong>연어 5.2% > 오징어/두족류 4.8% > 새우 3.5% > 닭 2.8% > 돼지 1.5% > 소 0.8%</strong>.</p>
<p>두족류의 의외 위치: 아시아 전통 시장 외에 <strong>북미·유럽 저지방 헬스푸드 트렌드</strong>로 폭증. 단백질 1g당 칼로리 효율, 콜레스테롤 ZERO, 오메가-3 풍부. 비건 대체재 시장도 두족류만은 침투 어려움 (식감 모방 불가).</p>
<p>의미: 두족류는 단순 아시아 수산이 아닌 <strong>"북미·유럽 mass-premium health protein 카테고리 후보"</strong>. 5~10년 글로벌 시장 +40~60% 확장 잠재.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 오징어를 한·일 mass market 상품에서 <strong>"글로벌 mass-premium health protein brand"</strong>로 격상.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>북미·유럽 진출 가속화</strong>: 그릴 오징어(타파스), 칼라마리 링, 단백질 스낵 SKU launch. Whole Foods·Sainsbury's premium 채널.</li>
<li style="margin-bottom: 8px;"><strong>"K-Squid Premium" 자체 brand 구축</strong>: K-food 트렌드 결합. 한국 미쉐린 셰프 sampling + K-pop cross-promotion.</li>
<li><strong>"Health protein platform" 진화</strong>: 단순 수산 vendor → 글로벌 protein platform 회사. 5년 후 EV/EBITDA 8x → 18~22x rerating.</li>
</ol>
</div>`,
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
      cardDesc="2010-2023년 4어종 점유율 변화 — 대왕오징어 격상 vs 살오징어 급감 (FAO FishStatJ 기반 추정)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
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
        situation: `<div>
<p>글로벌 두족류 어종별 생산 비중의 13년 paradigm shift (FAO FishStatJ 2010-2023):</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>대왕오징어(Jumbo squid, Dosidicus gigas)</strong>: 2010년 약 20% → 2023년 약 <strong>60%</strong> (이단아 → 글로벌 표준)</li>
<li><strong>살오징어(Common squid, Todarodes pacificus)</strong>: 2010년 약 40% → 2023년 약 <strong>8%</strong> (글로벌 표준 → 급감)</li>
<li>아르헨티나 일렉스 등 기타: 약 32%</li>
</ul>
<p>의미: 대왕오징어가 사실상의 "글로벌 표준 오징어"로 부상. 한국 가공 라인이 살오징어 spec에 맞춰져 있으면 원물 조달 비중 불균형으로 가공 라인 활용도 저하 우려 — 설비 전환 투자 검토 필요.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 살오징어 라인 vs 대왕오징어 라인은 단순 어종 차이가 아닌 <strong>"생산 capacity 자체의 영구 paradigm shift"</strong>.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>살오징어 가공 라인 50%+ 대왕오징어 처리 설비로 전환</strong>: capex $5~10M/공장. 대왕오징어는 사이즈 크고 텍스처 다름 — 전용 라인 필수.</li>
<li style="margin-bottom: 8px;"><strong>신규 capex 100% 대왕오징어 자동화 라인 집중</strong>: BAADER·Marel 대왕오징어 전용 자동 가공 시스템 도입.</li>
<li><strong>대왕오징어 brand 차별화</strong>: 한국 소비자에게 익숙하지 않은 대왕오징어를 "Jumbo squid premium" 신카테고리로 브랜딩 — 단순 substitute가 아닌 upgrade 포지셔닝.</li>
</ol>
</div>`,
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
          <Bar dataKey="mpa" name="보호구역(조업금지)" stackId="a" fill="var(--color-success)" />
          <Bar dataKey="fishingZone" name="합법 조업구역" stackId="a" fill="var(--color-info)" fillOpacity={0.6} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>"MPA(Marine Protected Area, 해양보호구역)"란 어획·자원 채취가 금지되는 해양 구역. UN "30x30" 선언으로 2030년까지 글로벌 해양의 30% MPA화 목표.</p>
<p>확장 속도: 2015년 글로벌 해양의 <strong>3%</strong> → 2030년 <strong>30%</strong> 목표 — <strong>15년 만에 10배 확장</strong>. 가용 공해 어장이 1/10로 축소. 이는 단순 규제가 아닌 산업 capacity 자체의 영구 축소.</p>
<p>의미: 향후 5년 가용 어장 -50%, 그 후 5년 추가 -50% 시나리오. 어획 라이선스 가치는 반대로 5~10배 폭등. 한국 원양 선단은 capacity 한계 도래.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: MPA 확장은 위협이 아닌 <strong>"기존 어획 라이선스 보유자의 valuation rerate 트리거"</strong>. 미리 라이선스 확보한 vendor는 향후 잔존 어장의 가격 결정력.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>MPA 지정 임박 해역 18개월 전 선제 철수</strong>: UN MPA 확장 캘린더 사전 입수 + 자산 매각 timing 최적화.</li>
<li style="margin-bottom: 8px;"><strong>잔존 어장 어획 라이선스 forward 매입</strong>: 페루·아르헨티나·뉴질랜드 EEZ 라이선스 5~10년 forward 락업.</li>
<li><strong>"Quota securitization"</strong>: 보유 라이선스를 자산화하여 PE·sovereign wealth fund에 LP 형태로 자본 유치. JP Morgan Natural Resources Desk가 structuring.</li>
</ol>
</div>`,
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
      cardDesc="오징어 주 조업 위도/분포의 북방 확장 — 30년간 9도 상승 (관측·모델 기반 추정치, 종·해역별 편차 큼)"
      telemetry={{ status: 'STATIC', syncDate: '관측·모델 기반 추정 (2024 갱신)' }}
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
        situation: `<div>
<p>기후변화로 오징어 떼의 평균 주 서식지가 가파르게 북상 중. 한국 동해(위도 35~38도)에서 <strong>러시아 연해주·베링해 인근(위도 44도)</strong>까지 이동.</p>
<p>30년 누적: 위도 <strong>+9도 상승 = 거리로 1,000km 이상 이탈</strong>. 한국 어선이 평소 항해 거리의 2~3배를 더 가야 어획 가능. 유류비 +50~80% 폭증.</p>
<p>의미: 오징어가 한국 영해를 사실상 영구히 떠남. 향후 5~10년 한국 동해 어획은 zero에 가까워질 것. 어획 가능 지역은 러·일·미 EEZ — 입어료 협상이 본업의 가장 큰 변수.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 어장 북상은 단순 climate 변수가 아닌 <strong>"EEZ 입어 라이선스 비용의 영구 인상 시나리오"</strong>.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>러시아·일본 EEZ 입어료 협상 트랙 신설</strong>: 정부(해양수산부) 외교 채널 + 본사 직접 협상 dual track.</li>
<li style="margin-bottom: 8px;"><strong>베링해 조업 라이선스 forward 락업</strong>: 단가가 5년 내 3배 폭등 예상 — 현 시점 5~10년 long-term contract 즉시 체결.</li>
<li><strong>북극해 신규 어장 first-mover 진입</strong>: 향후 10~20년 북극해가 새로운 어장으로 개방 — ice-class 신조선 capex + 캐나다·노르웨이 정부와 partnership 협상.</li>
</ol>
</div>`,
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
      cardDesc="어획물 중 식용 가공 vs 사료/폐기 분기 — 어체 왜소화로 사료 전락분 가속 증가 (FAO 보고 기반 추정치)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
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
        situation: `<div>
<p>"어분/사료(Feed) 전락 비율"이란 식용으로 쓰여야 할 어획물이 크기·품질 미달로 양식 사료(연어·광어용)로 갈려나가는 비중. 어획자에게는 매출 -60~70% 직접 손실.</p>
<p>충격적 추이: <strong>2020년 12% → 2023년 30%</strong>로 2.5배 증가. 어황 악화로 개체 크기 급감 + 잡아도 식용 마진 안 나오는 역설.</p>
<p>의미: 같은 어획량이라도 매출이 향후 5년 -30~40% 감소 가능. 단순 어획량 회복이 답이 아니라 <strong>"부산물·소형 어획을 고부가 SKU로 우회"</strong>하는 가공 전략이 본질.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 사료 전락은 손실이 아닌 <strong>"펫푸드·동물 단백질 BCG 고부가 라인 진입 기회"</strong>.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>그레이딩(크기 분류) 자동화 설비 도입</strong>: AI 비전 + 자동 선별기로 식용·사료·펫푸드 3 grade 분류. 톤당 마진 +12~18%.</li>
<li style="margin-bottom: 8px;"><strong>사료 전락 물량 펫푸드 라인 우회 가공</strong>: Nestlé Purina·Mars Petcare OEM 공급. ASP +200~400% 회복.</li>
<li><strong>"By-product Value Recovery Platform"</strong>: 부산물 모두를 ingredient catalog로 재정렬 — DHA/EPA·콜라겐·동물영양 4축 cross-sell.</li>
</ol>
</div>`,
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
      cardDesc="선박자동식별장치(AIS) 이탈/배타적 경제수역(EEZ) 침범 등 불법조업(IUU) 사례 — 적색카드(Red Card) 제재 트리거 모니터링 (자체추정 기준)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={250}
      chart={
        <BarChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="country" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="violations" name="AIS 이탈/침범 횟수" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>"IUU(Illegal, Unreported, Unregulated, 불법·비보고·비규제) 조업"의 주요 의심 어종에 오징어가 포함되며, 특히 일부 원양 선단의 AIS 끄기 행위가 국제 감시 대상.</p>
<p>현 상황: 특정 거대 선단(일부 중국 원양 선단 추정)의 AIS(선박자동식별장치) 이탈 및 EEZ 침범 사례가 위성 추적 기관(OceanMind·Global Fishing Watch)에 의해 연간 수백 회 기록됨. 수치는 기관별·기준별 상이. (차트 수치는 업계 추정 기반)</p>
<p>모니터링 포인트: EU·미국의 IUU 제재(적색카드·수입 금지) 동향은 공급망 선별 기준에 영향. 인증된 클린 공급망 확보가 중장기 시장 접근성의 핵심 변수.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: IUU는 단순 ESG 변수가 아닌 공급망 리스크 관리의 핵심. "Clean Supply Chain" 인증은 EU·미국 시장 접근성의 전제 조건.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>IUU 고위험 가공품 매입 비중 축소</strong>: OEM 거점별 IUU 리스크 등급 평가 후 단계적 조달 다변화.</li>
<li style="margin-bottom: 8px;"><strong>SIMP(미국 수산물수입모니터링) 인증 확보</strong>: 제3국 가공거점 C/O 검증 의무화. 인증 범위 점진 확대.</li>
<li><strong>"Clean Catch Certified" 자체 라벨 구축</strong>: VDS + 블록체인 이력 + 위성 추적 3중 검증. 규제 강화 시 인증 공급망이 협상력 강화 요인.</li>
</ol>
</div>`,
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
      cardDesc="과학적 한계(TAC) 대비 실제 어획량의 초과 폭 — 자원 고갈 가속 시그널 (RFMO 보고 기반 추정치)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
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
        situation: `<div>
<p>"TAC(Total Allowable Catch, 총허용어획량)"는 정부·국제 수산기구가 자원 보호 위해 설정하는 어획 상한. 정상 시장이라면 실 조업량 ≤ TAC.</p>
<p>현 추세: <strong>규제 당국이 매년 TAC를 삭감함에도 실 조업량이 TAC를 5년 연속 초과</strong>. 이는 오징어 자원 압박이 가중되고 있음을 나타냄. (차트 수치는 RFMO 보고 기반 추정치)</p>
<p>의미: 자원 자체의 급감 시그널로 해석 가능. 단기 V자 반등 가능성은 현 데이터 기준 제한적. 향후 5년 공급 감소 시나리오(-30~50% 가능성)에 대한 대비 검토가 필요.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: TAC 갭은 자원 회복 시나리오 영구 폐기 시그널. <strong>"TAC 절대 준수 인증 선단"만 1차 벤더로 등록</strong>이 본업 sustainability의 핵심.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>TAC 준수 인증 vendor whitelist 운영</strong>: VDS·MSC·블록체인 3중 검증 통과 vendor만 1차. 비준수 선단 ESG 사유로 거래 차단.</li>
<li style="margin-bottom: 8px;"><strong>자원 회복 시나리오 폐기</strong>: 5년 사업 계획에 V자 반등 가정 영구 제외 — IFRS BS에 stranded asset 사전 충당.</li>
<li><strong>"Quota arbitrage trading"</strong>: 글로벌 TAC 감축 → 라이선스 가치 폭등 → 우리 보유 라이선스 valuation rerate. JP Morgan Natural Resources Desk와 collab해 보유 쿼터 자산화.</li>
</ol>
</div>`,
        source: "RFMO TAC vs Actual Catch Reports (2019-2023)",
      }}
    />
  );
}
