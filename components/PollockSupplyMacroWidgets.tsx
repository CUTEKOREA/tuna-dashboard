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
      situation: '베링해와 러시아 해역 모두 2026년까지 구조적인 명태 자원 고갈 단계에 진입했으며, 동반 쿼터제 삭감이 공표되었습니다. 공급 물량 자체가 증발하면서 현물 시장에서의 스팟 가격은 TAC 축소율보다 훨씬 가파르게 폭등하고 있습니다.',
      actionPlan: '물리적 공급량(Volume) 확보를 위해 즉각적인 3~5년 장기 오프테이크(Off-take) 계약 방어가 필수적입니다. 단순히 스팟 시장에서 단가를 맞추려는 미시적 어프로치를 전면 중단하고, 러시아의 최상위 조업 쿼터 보유 선단과 자본 지분을 스왑(Swap)하는 전략적 M&A 파이프라인을 가동해야 합니다.',
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
      situation: '러시아산 명태 원물을 수입하여 중국 다롄 등에서 필레(Fillet) 가공 후 \'재냉동(Double-frozen)\' 형태로 들여오는 물량에 대한 원산지 표기 단속 및 고조정 관세 타격(리스크 > 90%)이 임계치에 도달했습니다. 중국 라인을 거친 물류는 언제든 압류나 세금 폭탄을 맞을 수 있습니다.',
      actionPlan: '매입원가 절감율이 높다고 하더라도 중국 우회 더블프로즌 라인을 일시 차단하십시오. 미국의 러 제재(Sanctions) 감시망 밖에 있으면서 관세 장벽이 느슨한 베트남(하이퐁) 및 인니 대체 가공 허브(Alt-Hub)로 필레 원물 가공 라인을 100% 리라우팅(Rerouting) 해야 합니다.',
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
      situation: '비율상 명태 원물(Fish) 단가보다도 인건비, 냉동 보관료(Reefer), MGO 유류비 등 3대 간접비 폭발이 손익을 파괴하고 있습니다. 2025년 이후 물류 동맥 경화로 선박 유류비-해상운임 복합 지수가 치솟으며 합작선사 비즈니스 마진이 마이너스 전환 임계점을 뚫었습니다.',
      actionPlan: '현지(러시아/미국) 수산업체와 단순 5:5 쿼터 배분 수익 셰어링 모델은 자본잠식의 리스크이 높습니다. 유류비 상승 분을 상대 파트너사에 온전히 부담(Hedge)시키고, 한국 측은 Fबोर्ड(FOB) 조건의 인수 금액만 고정시키는 \'운임 전가 파생 계약\'을 추가 삽입하여 변동성을 조기에 끊어내야 합니다.',
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
      situation: '베링해와 오호츠크해의 치명적 해수온 상승(SST)으로 냉수성 어종인 명태 떼가 본래 서식지를 떠나 러시아 캄차카 반도 북쪽 및 북극해 방향으로 매년 수십 킬로미터씩 이탈(Migration)하고 있습니다.',
      actionPlan: '물고기를 쫓아 배가 평소보다 수백 km를 더 항해하게 됨에 따라 왕복 유류비가 기하급수적으로 터지고 조업 리드타임이 지연됩니다. 과거의 평수기 표준 연비(Standard Fuel Consumption) 기준으로 용선 계약을 체결하지 마십시오. 유류비 상승 분은 선단이 아닌 현지 가공 공장 납품 판가에 \'기후변화 유틸리티 클로즈(Climate-FC Clause)\'로 자동 전가되도록 즉시 계약서를 수정해야 합니다.',
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
      situation: 'EU 및 미국이 러시아산 직수입 명태에 35% 전후의 초고율 관세를 매기기 시작하면 직수입 매입원가가 급격히 상승합니다.',
      actionPlan: '직수입 관세(+$470)보다 제3국 우회 물류비(+$200~350)를 감당하는 역행이 유리해집니다. 이 때 한국 가공 허브가 중국 대비 물류비 우위를 가지게 되어 위탁 가공(OEM) 물량이 한국으로 쏠릴 폭발적 기회가 열립니다.',
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
      situation: '공식 어획 쿼터(TAC)가 축소될수록, 규제망을 우회하는 속칭 \'섀도우(그림자)\' 선단의 불법 조업 물량이 암시장에 쏟아지며 블랙마켓 규모가 역성장하고 있습니다.',
      actionPlan: '일시적인 IUU 물량 덤핑으로 시중 평균 단가가 하락하더라도 이에 현혹되어선 안 됩니다. EU 규제 도입 시 이 물량들은 일순간 통관 압류되어 공급 사슬을 무너뜨리므로, 반드시 조업 위성망(VDS) 이력이 증명된 원물만 매입.',
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
      situation: '해수면 온도가 1.5℃ 이상 오르는 수퍼 엘니뇨 발생 시, 한해성 어종인 명태의 서식지가 급격히 파괴되며 어획량이 최대 22% 실종됩니다.',
      actionPlan: 'WMO ENSO 경보가 +1.5를 돌파하는 즉시 공격적인 원물 선도 매입 계약을 체결하고, 6개월 후행하는 가격 폭등에 대비하여 안전 재고를 최대로 비축.',
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
      situation: '미국 관세국경보호청(CBP)의 대러제재 및 강제노동방지법 실사 타격으로 중국/러시아 발 화물의 적발 및 영구 압류 확률이 80%를 상회합니다.',
      actionPlan: '안전마진을 고려하더라도 다롄 발 가공품 입항 비중을 즉각 30% 이하로 축소하고, 베트남 등 제3국 우회 라인으로 물류 체인을 리디렉션 .',
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
      situation: '배타적경제수역(EEZ)의 경계 통제가 군사 도발 수준으로 격상되며, 환동해 및 한일-러일 간 어선 나포/억류 빈도가 폭발적으로 증가하고 있습니다.',
      actionPlan: '영해 인접 조업 시 자동식별장치(AIS) 조작이 단 1건이라도 적발될 경우 즉각적인 본선 압수로 이어집니다. 선단장에게 VDS 컴플라이언스 원격 모니터링을 강제.',
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
      situation: '밀/대두 등 곡물 선물 지수 상승 시, 서민 자금의 대체재인 백색육(명태) 수요가 폭증하며 강한 레버리지 프리미엄 가격을 형성합니다.',
      actionPlan: '곡물 식량 안보 지수(FFPI)가 전년 대비 15% 이상 상승하면, 명태 재고를 방출하지 말고 강하게 묵혀 분기 말 스팟 스파이크에 전량 매도.',
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
      situation: '씨애틀과 다롄 등 수산물 거점 항만의 노동 파업으로 인해 리드타임이 +15일 이상 악화되며 초과 보관/체선료 폭탄이 터지고 있습니다.',
      actionPlan: '지연일이 10일을 초과하는 항만으로 향하는 화물은 로딩 마스트 전 즉각 부산(BUS)이나 베트남항으로 양하(Discharge) 목적지를 스위칭 .',
    }}
  />
);
