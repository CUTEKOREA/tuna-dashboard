'use client';
import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, AlertTriangle, Ship, Thermometer, ShieldAlert, Crosshair, Globe } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

// 1. TAC 갭 트래커 Data
const tacData = [
  { year: '2022', usaTac: 140, rusTac: 190, priceSpot: 1500 },
  { year: '2023', usaTac: 130, rusTac: 188, priceSpot: 1550 },
  { year: '2024', usaTac: 125, rusTac: 180, priceSpot: 1650 },
  { year: '2025', usaTac: 120, rusTac: 175, priceSpot: 1850 },
  { year: '2026', usaTac: 110, rusTac: 165, priceSpot: 2100 }, 
];

export const WidgetTACGapTracker = () => (
  <WidgetCard
    title="조업 쿼터 지정학 갭 트래커"
    icon={Globe}
    iconColor="#cbd5e1"
    pillar="S1"
    termTooltip={{ term: "지정학적 어획 할당량 격차(Geopolitical TAC Gap)", description: "미국 베링해와 러시아 배타적 경제수역(EEZ)의 자원 고갈에 따른 어획 할당량(TAC)의 우하향 곡선 및 스팟 가격 반응선" }}
    cardDesc="북태평양어업관리협의회(NPFMC)·러 수산청 어획 할당량(TAC) 연차별 삭감 추이와 현물 시세 반응"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={tacData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
        <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}만t`} />
        <YAxis yAxisId="right" orientation="right" stroke="var(--color-warning)" fontSize={12} tickFormatter={(v) => `$${v}`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Bar yAxisId="left" dataKey="rusTac" name="러시아 TAC (만 톤)" fill="var(--color-info)" opacity={0.7} stackId="a" />
        <Bar yAxisId="left" dataKey="usaTac" name="미국 베링해 TAC (만 톤)" fill="#64748b" opacity={0.7} stackId="a" />
        <Line yAxisId="right" type="stepAfter" dataKey="priceSpot" name="스팟 시세 지표 ($/톤)" stroke="var(--color-warning)" strokeWidth={3} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: '북태평양어업관리협의회(NPFMC) 및 러시아 연방 수산청',
      situation: `<div>
<p>명태 어획 95%+가 <strong>베링해(미국 알래스카) + 러시아 해역(오호츠크해·캄차카)</strong>에서 발생. 2 어장 동시 붕괴 시 글로벌 명태 공급 사실상 zero.</p>
<p>현재: <strong>2026년까지 양 어장 구조적 자원 고갈 단계</strong> 진입. NPFMC·러 연방 수산청 동반 TAC 삭감 공표.</p>
<p>핵심: 공급 -20% 감축이지만 <strong>스팟 가격 +40~60% 폭등</strong> (TAC 축소율의 2~3배). 명태 산업은 단순 cost 사업이 아닌 <strong>"쿼터 보유 vendor만 살아남는 토너먼트"</strong>로 전환.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 스팟 매입은 죽음의 길. <strong>"쿼터 equity ownership"</strong>이 유일한 생존 전략.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>3~5년 장기 Off-take 계약 즉시 락업</strong>: 알래스카 American Seafoods·Trident Seafoods, 러시아 Russian Fishery Company와 fixed price + take-or-pay 계약.</li>
<li style="margin-bottom: 8px;"><strong>러시아 최상위 쿼터 보유 선단 M&amp;A 파이프라인</strong>: minority equity 5~10% 인수로 dedicated supply 락업. 러시아 제재 우회 위해 SPV 구조화.</li>
<li><strong>"Quota securitization"</strong>: 알래스카·러시아 쿼터를 securitized note로 발행, JP Morgan Natural Resources Desk가 structuring. 본업 외 quota trading 수익.</li>
</ol>
</div>`,
    }}
  />
);

// 2. 더블프로즌 관세 세탁 경고등
const originWashData = [
  { region: '중국 다롄', volume: 85, tariffRisk: 92, status: '위험' },
  { region: '베트남 하이퐁', volume: 45, tariffRisk: 15, status: '안전' },
  { region: '인도네시아', volume: 30, tariffRisk: 12, status: '안전' },
  { region: '태국', volume: 55, tariffRisk: 28, status: '보통' },
];

export const WidgetOriginWashAlert = () => (
  <WidgetCard
    title="더블프로즌 원산지 세탁 관세 폭탄"
    icon={AlertTriangle}
    iconColor="#cbd5e1"
    pillar="S3"
    termTooltip={{ term: "러시아산 원물 추적성(Russian-Origin Traceability)", description: "러시아산 원물이 중국에서 재가공되어 수입될 때 겪는 경제제재 원산지 단속 리스크의 지수화" }}
    cardDesc="가공 허브별 더블프로즌 관세 단속 리스크 지수 vs 유통 물량 비중 매핑"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="tariffRisk" type="number" name="관세/세관 단속 리스크" stroke="#94a3b8" tickFormatter={(v)=>v+'%'} domain={[0, 100]} />
        <YAxis dataKey="volume" type="number" name="유통 물량 비중" stroke="#94a3b8" tickFormatter={(v)=>v+'%'} domain={[0, 100]} />
        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Scatter name="가공 허브별 리스크 맵핑" data={originWashData} fill="var(--color-danger)" shape="circle" />
      </ScatterChart>
    }
    takeaway={{
      source: '한국 관세청 더블프로즌 적발 통계 종합',
      situation: `<div>
<p>"더블프로즌(Double-frozen)"이란 원물을 1차 냉동 → 운송 → 가공 → 재냉동하는 가공 방식. 명태 산업에서 표준이었으나 현재 규제 압박 임계점.</p>
<p>전통 루트: 러시아산 명태 원물 → 중국 다롄 가공 → 더블프로즌 한국 수입. 한국 식품가 한 단가의 60%가 이 루트.</p>
<p><strong>규제 위기</strong>: 미국 OFAC 러시아 제재 강화 + 한국 관세청 원산지 표기 단속. <strong>중국 우회 더블프로즌 적발 리스크 90%+</strong>. 적발 시 화물 압류 + 소급 관세 + vendor blacklist.</p>
<p>의미: 중국 우회 라인은 단기 매입원가 -10% 우위이지만, 향후 12~24개월 내 자유 낙하 시점 도달. preemptive rerouting이 생존 전제.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 더블프로즌 중국 우회는 단기 cost 우위 vs 장기 채널 추방 trade-off. <strong>장기 채널 보존이 본질</strong>.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>중국 우회 더블프로즌 라인 즉시 차단</strong>: 매입원가 -10% 우위 포기. 향후 적발 시 손실(매입원가 -10% × 1년 vs 적발 cost +30% × 5년)을 BS 시뮬레이션해 판단.</li>
<li style="margin-bottom: 8px;"><strong>베트남 하이퐁 + 인도네시아 대체 가공 허브로 100% rerouting</strong>: AKFTA 무관세 + 미 제재 청정. 가공 capex $5~10M으로 12개월 내 capacity 확보.</li>
<li><strong>"한국 직가공 hub 격상"</strong>: 부산·속초 자체 가공 비중 30% → 50% 확대. 자체 가공이 원산지 표기 정확성 100% 보장 + 마진 +5%p 추가.</li>
</ol>
</div>`,
    }}
  />
);

// 3. 합작선사 간접원가 (Bunker) 지수
const bunkerData = [
  { month: '25.01', mgoPrice: 700, freightRate: 110, profitMargin: 12 },
  { month: '25.05', mgoPrice: 730, freightRate: 150, profitMargin: 8 },
  { month: '25.09', mgoPrice: 850, freightRate: 200, profitMargin: 2 },
  { month: '26.01', mgoPrice: 910, freightRate: 210, profitMargin: -1 }, // 적자전환
];

export const WidgetBunkerArbitrage = () => (
  <WidgetCard
    title="합작선사 유류비-해상운임 타격"
    icon={Ship}
    iconColor="#cbd5e1"
    pillar="S3"
    termTooltip={{ term: "유류비-물류 아비트라지(Bunker-Logistics Arbitrage)", description: "선용 MGO(유류비)와 글로벌 해상 컨테이너 스페이스 운임 폭등이 갉아먹는 간접 원가의 마진 타격선" }}
    cardDesc="선박 MGO 유가와 합작선사 마진 간 역상관 타격선 추적"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={bunkerData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
        <YAxis yAxisId="left" stroke="var(--color-danger)" fontSize={12} domain={[600, 1000]} tickFormatter={(v)=>(v===1000)?'Max':v} />
        <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={12} domain={[-5, 20]} tickFormatter={(v)=>v+'%'} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }} />
        <Area yAxisId="left" type="monotone" dataKey="mgoPrice" name="선박 MGO 유가 ($)" fill="url(#colorMgo)" stroke="var(--color-danger)" />
        <Line yAxisId="right" type="monotone" dataKey="profitMargin" name="합작 사업 순이익률 (%)" stroke="var(--color-success)" strokeWidth={3} />
        <defs>
          <linearGradient id="colorMgo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
          </linearGradient>
        </defs>
      </ComposedChart>
    }
    takeaway={{
      source: '글로벌 벙커 가격 지수(Global Bunker Price Index) & 러시아 어선 운용 재무제표',
      situation: `<div>
<p>한국 원양 명태 사업은 대부분 <strong>러시아·미국 현지 선사와의 합작(JV) 형태</strong>. 한국이 자본·기술 공급, 현지가 쿼터·어선 제공하는 5:5 분담 모델.</p>
<p>현재 위기: <strong>명태 원물 단가보다 간접비(인건비 + Reefer 보관료 + MGO 유류비) 폭발이 더 큰 손익 파괴 요인</strong>. 2025년 이후 물류 동맥 경화로 합작선사 마진 마이너스 임계점 진입.</p>
<p>구체 cost 구조: 명태 원물 톤당 $1,500 vs 간접비 $1,800+ (선원 +30% / Reefer +45% / MGO +65% YoY). 즉 fish cost보다 carry cost가 커진 역전 현상.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 5:5 단순 수익 셰어링은 자본잠식 직행. <strong>"운임·간접비 100% 상대 파트너 전가"</strong> 구조로 contract 재설계 필수.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>FOB 조건 인수 + 운임 전가 파생 계약</strong>: 한국 측 cost를 FOB 인수가만 고정. 유류비·운임은 100% 현지 파트너 부담.</li>
<li style="margin-bottom: 8px;"><strong>JV contract amendment 즉시</strong>: 기존 5:5 → "FOB 7:3 + 간접비 0:10" 구조로 재협상. 거부 시 JV 청산 + 직매입 전환.</li>
<li><strong>"FX·운임·MGO Triple hedge derivative" 패키지</strong>: JP Morgan Commodity Desk와 OTC swap 결합 — 환율·운임·유류비 3개 변수 동시 hedge. 합작선사 운영 변동성 ±10% 박스 락업.</li>
</ol>
</div>`,
    }}
  />
);

// 4. 기후변화 어장 북상 지표
const migrationData = [
  { year: '2015', tempIncrease: 0.2, distanceKm: 0, fuelCostIdx: 100 },
  { year: '2019', tempIncrease: 0.8, distanceKm: 25, fuelCostIdx: 105 },
  { year: '2023', tempIncrease: 1.5, distanceKm: 65, fuelCostIdx: 125 },
  { year: '2026', tempIncrease: 2.1, distanceKm: 110, fuelCostIdx: 160 },
  { year: '2030', tempIncrease: 3.0, distanceKm: 180, fuelCostIdx: 210 }, 
];

export const WidgetBeringSeaMigration = () => (
  <WidgetCard
    title="기후변화 어장 북상 및 선단 연비 타격 지표"
    icon={Thermometer}
    iconColor="#cbd5e1"
    pillar="S1"
    termTooltip={{ term: "베링해 어장 북상 및 연료 충격(Bering Sea Migration & Fuel Shock)", description: "수온 상승(해수면 온도, Sea Surface Temperature)으로 인한 명태 어장의 극지방 북상 거리와 이에 비례하는 하역 왕복 연비(FC) 상승 지수" }}
    cardDesc="베링해 해수면 온도(SST) 상승에 따른 어장 북상 거리와 선단 연비 지수 시계열"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={migrationData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
        <YAxis yAxisId="left" stroke="var(--color-info)" fontSize={12} domain={[0, 250]} tickFormatter={(v)=>`${v}km`} />
        <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={12} domain={[80, 250]} tickFormatter={(v)=>`지수 ${v}`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Area yAxisId="left" type="monotone" dataKey="distanceKm" name="어장 북상 이동 거리 (km)" fill="var(--color-info)" fillOpacity={0.3} stroke="var(--color-info)" strokeWidth={2} />
        <Line yAxisId="right" type="monotone" dataKey="tempIncrease" name="해수온도 상승 (℃)" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="5 5" />
        <Line yAxisId="right" type="monotone" dataKey="fuelCostIdx" name="선박 유류비/조업 시간 폭등 지수" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 5 }} />
      </ComposedChart>
    }
    takeaway={{
      source: 'NOAA 베링해 표층수온 관측소 및 C.P.(선단 원가) 리포트',
      situation: `<div>
<p>명태는 <strong>한대성 어종</strong>으로 0~5℃ 수온에서 서식. 기후변화로 베링해·오호츠크해 SST(해수면 온도)가 +1~2℃ 상승하면서 명태 떼가 본래 서식지를 떠나고 있습니다.</p>
<p>이동 trend: 러시아 <strong>캄차카 반도 북쪽 및 북극해 방향으로 매년 수십 km씩 이탈(Migration)</strong>. 향후 10~20년 누적 시 어장이 수백 km 북상.</p>
<p>의미: 어선이 평소보다 수백 km 더 항해 = 왕복 유류비 +30~50% + 조업 리드타임 +5~10일. 평수기 표준 연비 기준 용선 계약은 손실 직행. 향후 5년 명태 어획의 cost ceiling이 영구히 상승.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 어장 북상은 climate beta 100% 노출 cost 변수. <strong>"Climate-FC Clause(기후변화 유틸리티 조항)"</strong>로 비용 자동 전가가 본질적 헷지.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>Climate-FC Clause 계약 수정</strong>: 유류비 상승분을 현지 가공 공장 납품 판가에 자동 전가. SST +1℃당 톤당 $X 인상 공식 명문화.</li>
<li style="margin-bottom: 8px;"><strong>극지 친화 어선 capex</strong>: 신조선은 극지방 운항 가능한 ice-class 선박으로 전환. 캄차카 북부 + 북극해 신규 어장 first-mover.</li>
<li><strong>"Climate displacement insurance" 발행</strong>: 어장 이동에 따른 추가 cost를 parametric insurance로 transfer. AXA Climate·Munich Re와 partnership. 보험료가 직접 cost보다 저렴.</li>
</ol>
</div>`,
    }}
  />
);

// [NEW] 6. 미국-러시아 관세 보복 파급력 시뮬레이션 (Tab 1)
const dataTariffWargame = [
  { region: '유럽(직항)', base: 1200, tariff: 480, detour: 0 },
  { region: '미국(직항)', base: 1350, tariff: 472.5, detour: 0 },
  { region: '중국(우회)', base: 1250, tariff: 0, detour: 350 },
  { region: '한국(가공)', base: 1300, tariff: 0, detour: 200 }
];

export const WidgetTariffWarImpact = () => (
  <WidgetCard
    title="[거시 경제] 미·러 무역 상호 관세 파급 맵"
    icon={ShieldAlert}
    iconColor="var(--color-danger)"
    pillar="S3"
    cardDesc="미·러·EU 직수입 관세 vs 제3국 우회 물류비 비용 구조 시뮬레이션"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <BarChart data={dataTariffWargame} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} barSize={30}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="region" stroke="#94a3b8" fontSize={12} />
        <YAxis tickFormatter={(v)=>`$${v}`} stroke="#94a3b8" fontSize={11} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar dataKey="base" name="기본 원가 ($)" stackId="a" fill="var(--color-info)" radius={[0, 0, 4, 4]} />
        <Bar dataKey="tariff" name="관세 할증 ($)" stackId="a" fill="var(--color-danger)" />
        <Bar dataKey="detour" name="우회 물류비 ($)" stackId="a" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
      </BarChart>
    }
    takeaway={{
      source: '글로벌 수산물 관세 분쟁 시뮬레이터 (자체 추정)',
      situation: `<div>
<p>"미·러 상호 관세"란 러시아-우크라이나 전쟁 확장으로 EU·미국이 러시아 수산물에 부과하는 보복 관세. 명태 산업의 가장 큰 정치 리스크.</p>
<p>현 상황: <strong>EU·미국이 러시아 직수입 명태에 35% 전후 초고율 관세</strong>. 직수입 매입원가 톤당 $1,500 → $2,025 (+$525).</p>
<p>의미: <strong>직수입 관세(+$470)보다 제3국 우회 물류비(+$200~350) 감당이 유리해지는 역행 발생</strong>. 동시에 중국 가공 허브가 미·러 양 진영의 제재 압박을 받으면서 한국 가공 허브로 OEM 물량이 쏠리는 폭발적 기회.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 미·러 관세는 위협이 아닌 <strong>"한국 가공 허브의 일생 한 번 격상 기회"</strong>. 중국이 못 받는 OEM 물량을 한국이 흡수.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>제3국 우회 물류 라인 즉시 구축</strong>: 러시아 원물 → 베트남/카자흐스탄 → 한국 가공 → EU/미국 수출. 우회 물류비 +$300/톤이지만 관세 -$470 절감 = 순 +$170/톤.</li>
<li style="margin-bottom: 8px;"><strong>한국 가공 허브 capacity 즉시 확대</strong>: 부산·속초 가공 라인 +50% capex 가동. 글로벌 OEM 위탁 물량 흡수 준비.</li>
<li><strong>"미·러 관세 arbitrage trading book"</strong>: 관세 변동을 매주 monitoring + dynamic supply chain routing. JP Morgan Cross-Border Trade Desk와 collab해 시나리오 시뮬레이션. 본업 외 trading P&amp;L +5~8%p.</li>
</ol>
</div>`,
    }}
  />
);

// [NEW] 7. 북태평양 IUU 선단 섀도우 인덱스 (Tab 1)
const dataIUUIndex = [
  { year: '2019', officialTAC: 320, shadow: 40 },
  { year: '2021', officialTAC: 310, shadow: 65 },
  { year: '2023', officialTAC: 300, shadow: 85 },
  { year: '2025(E)', officialTAC: 280, shadow: 110 }
];

export const WidgetIUUShadowIndex = () => (
  <WidgetCard
    title="[거시 경제] 일명 '섀도우 플릿'의 불법조업(IUU) 덤핑 타격"
    icon={Crosshair}
    iconColor="#8b5cf6"
    pillar="S1"
    cardDesc="공식 TAC 대비 IUU 불법 조업 추정량 역추적 시계열"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataIUUIndex} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 350]} tickFormatter={(v)=>`${v}만톤`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Line type="monotone" dataKey="officialTAC" name="공식 TAC (만 톤)" stroke="var(--color-info)" strokeWidth={3} dot={{ r: 4 }} />
        <Area type="monotone" dataKey="shadow" name="불법 덤핑 추정량 (만 톤)" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
      </ComposedChart>
    }
    takeaway={{
      source: 'IUU(불법/비보고/비규제) 어업 방지 태스크포스 활동 보고서 재구성',
      situation: `<div>
<p>"섀도우 플릿(Shadow Fleet)"이란 공식 등록·규제망을 우회하는 불법 어선. TAC 축소 시점에 역으로 IUU(불법·비보고·비규제) 물량이 암시장에 쏟아지는 역설적 현상.</p>
<p>2026 현실: 베링해·러시아 TAC -15~22% 축소 발표 후 <strong>섀도우 플릿 IUU 물량이 +35~50% 증가</strong>. 블랙마켓 가격은 정상가의 -40~50% 덤핑. 일부 한국 mid-tier vendor 이 유혹에 흔들림.</p>
<p>위험: EU IUU 규제(2026 강화) 발효 시 IUU 물량은 <strong>일순간 통관 압류 + vendor blacklist</strong>. 단기 cost 절감 → 장기 채널 추방.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: IUU 덤핑은 trap. 단기 -40% cost 우위 vs 장기 채널 영구 추방. <strong>VDS(Vessel Day Scheme) 위성 추적 이력 증명 원물만 매입</strong> 원칙.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>모든 vendor에 VDS 이력 100% 요구</strong>: 적발 시 즉시 거래 종료. 매입원가 +5~10% 부담하더라도 IUU 절대 회피.</li>
<li style="margin-bottom: 8px;"><strong>"Clean Supply Chain Premium" 마케팅</strong>: VDS 100% 증명 vendor 지위로 EU·미국 modern trade 채널에 +12~18% 프리미엄 ASP.</li>
<li><strong>"Anti-IUU intelligence platform"</strong>: Spire Global·ICEYE 위성 데이터로 글로벌 어선 활동 monitoring. 자체 ML 모델로 IUU 의심 vendor 자동 blacklist. 동시에 이 platform을 SaaS로 mid-tier 수산사 50곳에 라이센싱.</li>
</ol>
</div>`,
    }}
  />
);

// 7. WidgetElNinoImpact
const dataElNino = [
  { year: '2015', enso: 2.6, catchDiff: -15 },
  { year: '2016', enso: -0.5, catchDiff: 5 },
  { year: '2019', enso: 0.9, catchDiff: -8 },
  { year: '2021', enso: -1.0, catchDiff: 12 },
  { year: '2024(E)', enso: 1.8, catchDiff: -22 }
];

export const WidgetElNinoImpact = () => (
  <WidgetCard
    title="[거시 경제] 엘니뇨 기후 지수와 흉어기 상관망"
    icon={Thermometer}
    iconColor="#f97316"
    pillar="S1"
    cardDesc="세계기상기구(WMO) 엘니뇨 남방진동(ENSO) 강도와 명태 어획량 증감률 상관 분석"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataElNino} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
        <YAxis yAxisId="left" stroke="#f97316" fontSize={11} domain={[-2, 3]} tickFormatter={(v)=>`${v}℃`} />
        <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={11} domain={[-30, 20]} tickFormatter={(v)=>`${v}%`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Line yAxisId="left" type="monotone" dataKey="enso" name="엘니뇨 강도 (SST 편차)" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
        <Bar yAxisId="right" dataKey="catchDiff" name="어획량 증감 추이 (%)" fill="var(--color-danger)" radius={[4,4,0,0]} barSize={20} />
      </ComposedChart>
    }
    takeaway={{
      source: 'WMO(세계기상기구) 폭염 지수 및 한국 수산자원관리공단 어황 예측 모델',
      situation: `<div>
<p>"엘니뇨(El Niño)"는 적도 태평양 해수면 온도가 평균보다 +0.5℃ 이상 상승하는 자연 현상. +1.5℃ 이상이면 "수퍼 엘니뇨"로 분류.</p>
<p>명태 영향: 한대성 어종인 명태는 수온에 매우 민감. <strong>수퍼 엘니뇨 발생 시 어획량 최대 -22% 실종</strong>. 2015~2016, 2023~2024 사이클에서 검증된 패턴.</p>
<p>의미: ENSO 시그널은 6개월 후행하는 어획·가격 폭등의 leading indicator. WMO ENSO Index를 매월 monitoring하면 사실상 6개월 앞서 매입 의사결정 가능.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: ENSO 모니터링은 단순 기후 정보가 아닌 <strong>"6개월 forward-looking trading signal"</strong>. 본사 risk desk가 매주 WMO ENSO Index 추적 + 임계치 돌파 시 자동 매입 가속.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>WMO ENSO +1.5 돌파 즉시 원물 선도 매입</strong>: 임계치 자동 alert + 6개월 forward 매입 계약 자동 가속.</li>
<li style="margin-bottom: 8px;"><strong>안전 재고 최대 비축</strong>: ENSO 경보 시점에 평소 60일치 → 180일치 재고 확보. cold storage capa 사전 락업.</li>
<li><strong>"ENSO-indexed swap" 발행</strong>: NOAA ENSO Index를 underlying으로 한 OTC swap을 ICE에 상장. 어획 손실을 paper hedge로 회수. JP Morgan Commodity Quant Desk와 collab.</li>
</ol>
</div>`,
    }}
  />
);

// 8. WidgetCBPDetentionRisk
const dataCbp = [
  { region: '다롄 등', riskCases: 145, freezeProb: 80 },
  { region: '베트남', riskCases: 42, freezeProb: 15 },
  { region: '인니', riskCases: 18, freezeProb: 5 },
  { region: '러 직항', riskCases: 350, freezeProb: 95 }
];

export const WidgetCBPDetentionRisk = () => (
  <WidgetCard
    title="[거시 경제] 주요 원산지 제재 통관 억류 리스크 지수"
    icon={ShieldAlert}
    iconColor="var(--color-danger)"
    pillar="S3"
    cardDesc="원산지별 미국 관세국경보호청(CBP) 통관 보류(WRO) 적발 건수 및 자산 동결 확률"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataCbp} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={11} />
        <YAxis dataKey="region" type="category" stroke="#94a3b8" fontSize={11} width={80} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar dataKey="riskCases" name="세관 보류(WRO) 적발 건수" fill="var(--color-danger)" barSize={15} radius={[0,4,4,0]} />
        <Line dataKey="freezeProb" name="조사 시 자산 동결 확률(%)" stroke="#f87171" strokeWidth={2} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: 'NotebookLM 추출 미국 CBP 일일 통관 보류(WRO) 적발 사례집',
      situation: `<div>
<p>"통관 억류 리스크"란 미국 항구에서 우리 화물이 압류되거나 영구 차단되는 확률. 미국 시장 진입의 가장 큰 hidden cost.</p>
<p>현재: <strong>미국 관세국경보호청(CBP)의 대러제재 + 강제노동방지법(UFLPA) 실사 강화로 중국/러시아 발 화물 적발·영구 압류 확률 80%+</strong>. 한 번 압류되면 vendor blacklist 18~36개월.</p>
<p>의미: 중국 다롄 가공 비중이 높은 vendor는 향후 12~18개월 미국 시장에서 사실상 사라짐. 단기 cost 우위를 노렸던 vendor 다수가 채널 추방.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 통관 억류 리스크는 단순 ESG 컴플라이언스가 아닌 <strong>"미국 시장 영구 추방 risk"</strong>. 안전마진 고려해도 다롄 비중 즉시 축소.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>다롄 발 가공품 입항 비중 30% 이하 축소</strong>: 즉시 발주 중단 + 베트남 하이퐁/인도네시아로 100% rerouting.</li>
<li style="margin-bottom: 8px;"><strong>"CBP-compliant supply chain" 인증 자체 발행</strong>: 우리 가공·물류의 모든 단계를 블록체인 이력 추적. CBP audit 100% 통과 인증.</li>
<li><strong>"Compliance-as-a-Service"</strong>: 우리 CBP-compliant 시스템을 mid-tier 수산사에 SaaS 라이센싱 — 연 $300~700K/고객.</li>
</ol>
</div>`,
    }}
  />
);

// 9. WidgetEEZConflict
const dataEEZ = [
  { year: '2020', conflicts: 15 },
  { year: '2021', conflicts: 22 },
  { year: '2022', conflicts: 45 },
  { year: '2023', conflicts: 68 },
  { year: '2024(E)', conflicts: 94 }
];

export const WidgetEEZConflict = () => (
  <WidgetCard
    title="[Macro] 권역별 EEZ 조업 분쟁 나포 빈도 계기판"
    icon={AlertTriangle}
    iconColor="#eab308"
    pillar="S1"
    cardDesc="환동해 EEZ 나포·분쟁 발생 건수 연도별 추이"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <AreaChart data={dataEEZ} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 120]} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Area type="monotone" dataKey="conflicts" name="연안국 나포 및 분쟁 발생 건수" stroke="#eab308" fill="#eab308" fillOpacity={0.3} strokeWidth={2} />
      </AreaChart>
    }
    takeaway={{
      source: '국제해양법재판소(ITLOS) 및 한·러·일 연안국 해경 나포 통계',
      situation: `<div>
<p>"EEZ(Exclusive Economic Zone, 배타적경제수역)"란 연안국이 200해리까지 어업·자원 권리를 가진 해역. 평소 외교적으로 조정되지만 지정학 긴장 시 군사 도발화.</p>
<p>현재: <strong>환동해(한·일·러) EEZ 경계 통제가 군사 도발 수준으로 격상</strong>. 한·일, 한·러, 일·러 간 어선 나포/억류 빈도 폭발적 증가. 2025년 한국 어선 12척 러시아 억류 (vs 평년 2~3척).</p>
<p>의미: 한국 명태 원양 선단은 러시아 EEZ 의존도 60%+. 정치 긴장 시 선단 활동 자체가 위협받음. 단 1척 나포로 척당 $5~20M 손실 + 외교 분쟁.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: EEZ 분쟁 리스크는 단순 정치 변수가 아닌 <strong>"한국 명태 원양의 존속 자체 위협"</strong>. VDS·AIS compliance가 생존 요건.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>VDS·AIS 100% compliance 강제</strong>: 선단장에게 원격 monitoring 의무화. AIS 조작 1건 적발 시 즉시 본선 압수 → 회사 reputation 파괴.</li>
<li style="margin-bottom: 8px;"><strong>러시아 EEZ 의존도 분산</strong>: 현재 60% → 40% 이하로. 알래스카·노르웨이·캐나다 어장 비중 확대.</li>
<li><strong>"Geopolitical insurance" 발행</strong>: 어선 나포·억류에 대한 정치적 risk 보험. AXA·Allianz Marine과 partnership으로 척당 연 $50~150K 프리미엄.</li>
</ol>
</div>`,
    }}
  />
);

// 10. WidgetFoodSecurityPremium
const dataFoodPremium = [
  { month: 'Q1', cropIndex: 120, pollockPrice: 1350 },
  { month: 'Q2', cropIndex: 125, pollockPrice: 1400 },
  { month: 'Q3', cropIndex: 145, pollockPrice: 1650 },
  { month: 'Q4', cropIndex: 130, pollockPrice: 1550 }
];

export const WidgetFoodSecurityPremium = () => (
  <WidgetCard
    title="[Macro] 위기 시 식량안보 프리미엄 스프레드"
    icon={TrendingUp}
    iconColor="var(--color-success)"
    pillar="S4"
    cardDesc="FAO FFPI 곡물 지수와 명태 B2B 경매 단가 레버리지 상관"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataFoodPremium} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
        <YAxis yAxisId="left" stroke="var(--color-success)" fontSize={11} domain={[100, 160]} tickFormatter={(v)=>v.toString()} />
        <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={11} domain={[1200, 1800]} tickFormatter={(v)=>`$${v}`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Line yAxisId="left" type="monotone" dataKey="cropIndex" name="글로벌 곡물 가격 지수 (FFPI)" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} />
        <Line yAxisId="right" type="monotone" dataKey="pollockPrice" name="명태 B2B 경매 단가 (USD/MT)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: 'FAO 식량가격지수(FFPI) 및 시카고상품거래소(CBOT) 데이터',
      situation: `<div>
<p>"식량안보 프리미엄(Food Security Premium)"이란 곡물 가격 폭등 시 대체 단백질(백색육·명태) 수요가 급증하며 형성되는 가격 레버리지.</p>
<p>발동 트리거: <strong>밀·대두 등 곡물 선물 지수 상승 시 명태 수요 +30~50% 폭증</strong>. 서민 가구가 비싸진 곡물에서 가격 효율이 좋은 단백질(명태·계란·닭)로 이동.</p>
<p>의미: 명태는 단순 수산물이 아닌 <strong>"곡물 가격 폭등 시 자동으로 가격이 따라 오르는 protein hedge"</strong>. FAO FFPI(식량가격지수) 전년 대비 +15%+ 상승 시 명태 단가 +20~30% 폭등 패턴 반복.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 명태는 macro food security 헷지 자산. FFPI 트리거 발동 시 재고 방출 금지 + 분기 말 spike 활용.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>FFPI 전년 대비 +15% 돌파 시 자동 alert</strong>: 본사 risk desk가 FAO FFPI 매월 monitoring. 임계치 돌파 시 재고 hold 강제 발동.</li>
<li style="margin-bottom: 8px;"><strong>"분기 말 spike 전량 매도"</strong>: 곡물 폭등 사이클에서 명태 단가는 1~2분기 후 정점 도달. 그 시점에 안전 재고 전량 spot 매도로 마진 +25~40% 추가 회수.</li>
<li><strong>"Cross-commodity hedge swap" 발행</strong>: FFPI vs 명태 가격 spread를 underlying으로 한 OTC swap. JP Morgan Macro Commodity Desk와 collab. 본업 외 systematic trading P&amp;L.</li>
</ol>
</div>`,
    }}
  />
);

// 11. WidgetPortCongestion
const dataPort = [
  { port: '다롄(DLC)', waitDays: 14, backlog: 3500 },
  { port: '로테르담', waitDays: 8, backlog: 1200 },
  { port: '씨애틀(SEA)', waitDays: 22, backlog: 4800 },
  { port: '부산(BUS)', waitDays: 4, backlog: 600 }
];

export const WidgetPortCongestion = () => (
  <WidgetCard
    title="[Macro] 주요 거점 항만 파업 및 체화(Congestion) 달력"
    icon={Ship}
    iconColor="#ec4899"
    pillar="S3"
    cardDesc="거점 항만 체선 대기일 및 컨테이너 적체(Backlog) 비교"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataPort} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="port" stroke="#94a3b8" fontSize={12} />
        <YAxis yAxisId="left" stroke="#ec4899" fontSize={11} domain={[0, 30]} tickFormatter={(v)=>`${v}일`} />
        <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} domain={[0, 6000]} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar yAxisId="left" dataKey="waitDays" name="외항 체선 대기일(Days)" fill="#ec4899" radius={[4,4,0,0]} barSize={20} />
        <Line yAxisId="right" type="monotone" dataKey="backlog" name="컨테이너 적체(Backlog TEU)" stroke="#f472b6" strokeWidth={2} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: '국제운수노련(ITF) 파업 동향 및 저널오브커머스(JOC) 글로벌 항만 체화 지수',
      situation: `<div>
<p>"항만 체화(Port Congestion)"란 항구의 처리 capacity가 부족해 선박이 대기·체류하는 현상. 노동 파업·통관 적체로 발생.</p>
<p>현재: <strong>씨애틀(미국)·다롄(중국) 등 수산물 거점 항만 노동 파업</strong>으로 리드타임 +15일 이상 악화. 초과 보관료·체선료 폭탄 (척당 일 $20~50K).</p>
<p>의미: 단순 logistics 지연이 아닌 <strong>화물 도착이 1.5개월 지연되며 콜드체인 손실 + 시장 가격 변동 노출</strong>. 마진 -3~7%p 직접 잠식.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 항만 체화는 단순 logistics가 아닌 <strong>"dynamic port routing optimization signal"</strong>. 실시간 모니터링 + 자동 rerouting이 본질.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>지연일 10일 초과 항만 자동 회피</strong>: 로딩 마스트 전 즉시 부산(BUS) 또는 베트남항으로 양하 목적지 스위칭.</li>
<li style="margin-bottom: 8px;"><strong>"Port congestion intelligence 자동화"</strong>: 글로벌 30대 항만 daily monitoring + AI 예측 모델. 본사 logistics desk가 dynamic routing 자동 발동.</li>
<li><strong>다항만 동시 contract 락업</strong>: 부산·인천·뉴욕·시애틀·로테르담 5대 항만에 contingent berth 확보. JP Morgan Logistics Tech Desk와 partnership으로 항만 booking optimization platform 구축.</li>
</ol>
</div>`,
    }}
  />
);
