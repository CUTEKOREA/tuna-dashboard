'use client';
import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ScatterChart, Scatter, ZAxis } from 'recharts';
import { CandlestickChart, Activity, ShieldCheck, Cpu, Snowflake, Users, Banknote, Anchor, Bot, PlaneTakeoff } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

// 5. 명란 D2C vs B2B 수익 맵
const roeData = [
  { category: '벌크 통어란 (0303.91, 관세율 10%)', margin: 8, retailVol: 100 },
  { category: '가공 파명란 (B-Grade)', margin: 15, retailVol: 40 },
  { category: '초프리미엄 저염/무색소 조제 명란 (D2C)', margin: 55, retailVol: 10 },
];

export function WidgetRoeMarginSpread() {
  return (
    <WidgetCard
      title="조제 명란 마진 스프레드 맵 (D2C vs 벌크)"
      icon={CandlestickChart}
      iconColor="#cbd5e1"
      pillar="S2"
      cardDesc="저관세 0303.91 수입 어란을 조제 명란(1604)으로 국내에서 전환했을 때의 부가가치 폭발점 계산"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      termTooltip={{ term: 'Roe D2C vs B2B Margin Spread', description: '저관세 0303.91 수입 어란을 조제 명란(1604)으로 국내에서 전환했을 때의 부가가치 폭발점 계산' }}
      chartHeight={260}
      chart={
        <ComposedChart layout="vertical" data={roeData} margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`${v}%`} />
          <YAxis dataKey="category" type="category" stroke="#cbd5e1" fontSize={10} width={150} tick={{fill: '#e2e8f0'}} />
          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
          <Bar dataKey="margin" name="최종 영업 이익률 (Margin %)" fill="var(--color-success)" barSize={20} radius={[0, 4, 4, 0]} />
        </ComposedChart>
      }
      takeaway={{
        source: '식품산업통계정보(FIS) 명란젓 동향',
        situation: "명태 전체 포트폴리오 중 매입원가 상승을 소비자에게 가장 쉽게 전가할 수 있는 아이템은 최고급 밥도둑 반찬인 '명란'입니다. 단순히 벌크로 납품하는 것(Bottom-line(순이익)률 8%) 대비 고부가가치 선물세트나 저염 명란 브랜드(Bottom-line(순이익)률 55%)로 탈바꿈할 때 수익이 수직 상승합니다.",
        actionPlan: '원물 단가의 상승을 멍하니 맞고 있지 마십시오. 어란(Roe)의 B2B 식당 도매상 직납 물량을 전면 축소하고, 부산/속초 지역에 위치한 당사 스마트 팩토리의 조제 명란 라인 풀-가동을 지시하여 소비자 직거래(D2C) 브랜드에 전력을 투구해야 합니다.',
      }}
    />
  );
}

// 6. 전가 저항선
const transferData = [
  { priceInc: 0, saleVol: 100, prod: '벌크 동태 (대체재 多)' },
  { priceInc: 10, saleVol: 95, prod: '벌크 동태 (대체재 多)' },
  { priceInc: 25, saleVol: 60, prod: '벌크 동태 (대체재 多)' }, // 급락
  { priceInc: 0, saleVol: 100, prod: '순살 필레 버거 (대체 불가)' },
  { priceInc: 10, saleVol: 98, prod: '순살 필레 버거 (대체 불가)' },
  { priceInc: 25, saleVol: 90, prod: '순살 필레 버거 (대체 불가)' },
];

export function WidgetPriceTransferResistance() {
  return (
    <WidgetCard
      title="수입원가 소비자가 전가 저항선 지수"
      icon={Activity}
      iconColor="#cbd5e1"
      pillar="S4"
      cardDesc="원가 급등분을 납품 단가에 가산(전가)할 때 발생하는 소비자 구매량(수요) 감소의 마지노선"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      termTooltip={{ term: 'Price Transfer Resistance', description: '원가 급등분을 납품 단가에 가산(전가)할 때 발생하는 소비자 구매량(수요) 감소의 마지노선' }}
      chartHeight={260}
      chart={
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="priceInc" type="number" name="판매가 인상률" tickFormatter={(v)=>`+${v}%`} stroke="#94a3b8" />
          <YAxis dataKey="saleVol" type="number" name="판매량 유지율" tickFormatter={(v)=>`${v}%`} stroke="#94a3b8" domain={[40, 110]} />
          <ZAxis dataKey="prod" type="category" name="제품군" />
          <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
          <Scatter name="전가 수요 감소 트렌드" data={transferData} fill="#fca5a5" line={{ stroke: '#fca5a5', strokeWidth: 2 }} />
        </ScatterChart>
      }
      takeaway={{
        source: '내부 ERP 판매 이력 및 소비자 탄력성 시뮬레이터',
        situation: '단순 통마리/동태 제품군은 시장 판매가를 20%만 올려도 수요가 반토막(60%대)나며 소비자들이 오징어나 돼지고기로 발길을 돌립니다. 반면 프랜차이즈 피쉬버거 전용 필레나 영유아용 순살 안심 패키지는 가격을 25% 올려도 이탈률이 10% 미만에 불과한 매입원가 방어력을 자랑합니다.',
        actionPlan: "회사 영업부서의 핵심 지표를 '벌크 동태 밀어내기 톤수'에서 '가공 레디투쿡(RTC) 제품군 마진 수성률'로 완전히 뜯어고쳐야 합니다. 가격 탄력성이 낮은(저항선이 강한) 고부가가치 필레(Fillet) 품목 중심으로 냉동 창고 포트폴리오를 조정.",
      }}
    />
  );
}

// 7. MSC 프리미엄 스프레드
const mscData = [
  { year: '2023', mscPrice: 2200, normalPrice: 2100 },
  { year: '2024', mscPrice: 2450, normalPrice: 2200 },
  { year: '2025', mscPrice: 2800, normalPrice: 2350 },
  { year: '2026', mscPrice: 3200, normalPrice: 2400 },
];

export function WidgetMSCPremiumSpread() {
  return (
    <WidgetCard
      title="MSC 인증 프리미엄 가격 탈동조화"
      icon={ShieldCheck}
      iconColor="#cbd5e1"
      pillar="S5"
      cardDesc="글로벌 ESG 의무화 트렌드에 따른 MSC(해양관리협의회) 인증 명태의 가격 프리미엄 벌어짐 현상"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      termTooltip={{ term: 'MSC Premium Spread', description: '글로벌 ESG 의무화 트렌드에 따른 MSC(해양관리협의회) 인증 명태의 가격 프리미엄 벌어짐 현상' }}
      chartHeight={260}
      chart={
        <AreaChart data={mscData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} domain={[1500, 3500]} tickFormatter={(v)=>`$${v}`} />
          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area type="monotone" dataKey="mscPrice" name="MSC 인증 프리미엄 단가" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
          <Area type="monotone" dataKey="normalPrice" name="일반 비인증 단가" stroke="#475569" fill="#475569" fillOpacity={0.1} />
        </AreaChart>
      }
      takeaway={{
        source: 'UN FAO 글로벌 에코라벨 지표 추이',
        situation: "맥도날드, 이케아 등 대형 글로벌 급식/외식업계가 '100% MSC 지속가능 수산물 사용'을 의무화하면서, MSC 라벨이 붙은 미국 알래스카/러시아산 명태와 비인증 어획물 간의 시장 가격 프리미엄(Gap)이 해가 갈수록 기하급수적으로 이격(Decoupling)되고 있습니다.",
        actionPlan: '원물이 부족해질수록 시장은 MSC 인증 물량을 승자독식(Winner Takes All)합니다. 구매팀은 비인증 덤핑 물량의 유혹에 빠져서는 안 됩니다. 약간의 프리미엄(웃돈)을 주더라도 MSC 에코라벨이 부여된 쿼터만 집중 매입하여 글로벌 B2B 진입 장벽을 선점해야 합니다.',
      }}
    />
  );
}

// 8. 공장 로봇 도입 BEP
const bepData = [
  { year: '2023', manualCost: 1500, robotCost: 2800 },
  { year: '2024', manualCost: 1650, robotCost: 2700 },
  { year: '2025', manualCost: 1900, robotCost: 2600 },
  { year: '2026', manualCost: 2200, robotCost: 2100 }, // BEP Crossover
  { year: '2027', manualCost: 2600, robotCost: 1800 },
];

export function WidgetFactoryAutomation() {
  return (
    <WidgetCard
      title="스마트 팩토리 자동화 손익분기 역전 지표"
      icon={Cpu}
      iconColor="#cbd5e1"
      pillar="S2"
      cardDesc="최저임금 인상 및 숙련공 노령화에 따른 수작업 비용과 로봇 기반 절단/해동 자동화 설비 도입의 손익분기점"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      termTooltip={{ term: 'Automation BEP Crossover', description: '최저임금 인상 및 숙련공 노령화에 따른 수작업 비용과 로봇 기반 절단/해동 자동화 설비 도입의 손익분기점' }}
      chartHeight={260}
      chart={
        <ComposedChart data={bepData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#cbd5e1" fontSize={12} domain={[1000, 3000]} tickFormatter={(v)=>`₩${v}`} />
          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area type="monotone" dataKey="manualCost" name="기존 수작업 1톤당 임가공비" fill="#f43f5e" fillOpacity={0.2} stroke="#f43f5e" strokeWidth={2} />
          <Line type="monotone" dataKey="robotCost" name="자동화 로봇 1톤당 공정비 (상각 포함)" stroke="var(--color-success)" strokeWidth={3} dot={{r: 5}} />
        </ComposedChart>
      }
      takeaway={{
        source: '보스턴컨설팅그룹 수산가공 리포트 & 당사 CAPEX 시뮬레이션',
        situation: '중국 다롄과 칭다오 등 주요 기지의 임건비가 폭증하고 젊은 숙련공이 어류 가공을 기피함에 따라 수작업 임가공비가 우상향하고 있습니다. 반면, AI 비전 기반 뼈 제거(Pin-bone removal) 및 자동 필레팅 머신 도입 단가는 규모의 경제로 하락 중입니다.',
        actionPlan: "도표가 보여주듯 2026년을 기점으로 비싼 렌탈료를 감안하더라도 로봇 공정의 비용 효율이 인간을 완벽히 압도(Crossover)합니다. 더 이상 값싼 노동력을 찾아 베트남, 인도네시아로 SCM을 옮겨 다니는 메뚜기 전략을 중단하고 부산/속초 허브에 AI 가공 라인 투자를 결단하여 품질을 균일화해야 합니다.",
      }}
    />
  );
}

// [NEW] 21. 최상급 냉동 보관료(Reefer) 공간 부족 프리미엄 (Tab 3)
const dataReeferCapacity = [
  { month: 'Q1', capacityPct: 82, reeferCost: 45 },
  { month: 'Q2', capacityPct: 89, reeferCost: 55 },
  { month: 'Q3', capacityPct: 95, reeferCost: 85 },
  { month: 'Q4', capacityPct: 98, reeferCost: 120 }
];

export const WidgetReeferCapacity = () => {
  return (
    <WidgetCard
      title="[Cost] 콜드체인(Reefer) 가동률 및 보관료 폭주"
      icon={Snowflake}
      iconColor="#06b6d4"
      pillar="S3"
      cardDesc="냉동 화물(Reefer) 창고 가동률 상승에 따른 보관 단가 페널티 급등 추이"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={260}
      chart={
        <ComposedChart data={dataReeferCapacity} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
          <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`${v}%`} domain={[60, 100]} />
          <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={11} tickFormatter={(v)=>`$${v}`} />
          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
          <Bar yAxisId="left" dataKey="capacityPct" name="냉동창고 가동률(%)" fill="var(--color-info)" radius={[4, 4, 0, 0]} barSize={30} />
          <Line yAxisId="right" type="monotone" dataKey="reeferCost" name="플러그/보관 인상료($)" stroke="#06b6d4" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{
        source: '다롄·부산 수산물 냉동 창고 비용 리포트',
        situation: "동남아 우회 물류 병목으로 냉동 화물(Reefer)이 주요 항만에 적체되면서 창고 가동률이 95% 초과(Full Capacity) 시 보관 단가가 페널티 급으로 치솟습니다.",
        actionPlan: "창고에 원물을 장기 보관하는 것 자체가 매초 '악성 비용'이 되는 구간입니다. JIT(Just-in-Time) 가공을 원칙으로 하거나, 비수기에 선제적으로 자사 콜드체인 창고 슬롯을 장기 매입해 두어야 추가 마진 증발을 막을 수 있습니다.",
      }}
    />
  );
}

// [NEW] 22. 원양 선원 노령화 및 구인난 임금 타격 게이지 (Tab 3)
const dataCrewShortage = [
  { year: '2020', avgAge: 48, wageIndex: 100 },
  { year: '2022', avgAge: 51, wageIndex: 115 },
  { year: '2024', avgAge: 54, wageIndex: 140 },
  { year: '2026(E)', avgAge: 56, wageIndex: 175 }
];

export const WidgetCrewShortage = () => {
  return (
    <WidgetCard
      title="[Cost] 선단 선원 노령화 및 인건비 타격"
      icon={Users}
      iconColor="var(--color-warning)"
      pillar="S1"
      cardDesc="원양 선원 평균 연령 초고령화와 외인 선원 임금 지수 폭등 추이"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={260}
      chart={
        <ComposedChart data={dataCrewShortage} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
          <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} domain={[40, 60]} tickFormatter={(v)=>`${v}세`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-warning)" fontSize={11} domain={[80, 200]} />
          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
          <Bar yAxisId="left" dataKey="avgAge" name="항해사/선원 평균 연령" fill="#1e293b" stroke="#cbd5e1" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="stepAfter" dataKey="wageIndex" name="외인 선원 임금 지수(2020=100)" stroke="var(--color-warning)" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{
        source: '글로벌 선원(Seafarer) 수급 동향 평가서',
        situation: "북태평양 혹한기 명태 조업을 기피하는 현상으로 원양 선원 평균 연령이 56세로 초고령화되었으며, 구인난으로 인한 외인 선원 프리미엄 임금이 매해 두 자릿수로 폭등 중입니다.",
        actionPlan: "물고기가 있어도 '배트맨'이 없어 조업을 포기하는 사태가 벌어집니다. 동남아 외인 선원 직소싱 전담 부서를 내재화하거나, 조업 선단의 크레인/그물 자동화 설비 업그레이드를 통해 인력 소요를 강제로 반감시켜야 합니다.",
      }}
    />
  );
}

// [NEW] 23. 한-동남아-러 3각 환율 헷징 타겟 (Tab 3)
const dataFXHedging = [
  { month: 'USD 1330', fxLoss: 5, action: 'Buy' },
  { month: 'USD 1350', fxLoss: 12, action: 'Hold' },
  { month: 'USD 1380', fxLoss: 25, action: 'Stop' },
  { month: 'USD 1410', fxLoss: 45, action: 'Hedge' }
];

export const WidgetFXHedging = () => {
  return (
    <WidgetCard
      title="[Cost] 강달러 환차손 임계점 방어 시뮬레이션"
      icon={Banknote}
      iconColor="var(--color-success)"
      pillar="S2"
      cardDesc="달러 매입 기반 수입업의 원/달러 환율별 영업이익 환차손 시뮬레이션"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={260}
      chart={
        <BarChart data={dataFXHedging} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} barSize={40}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="var(--color-danger)" fontSize={11} domain={[0, 60]} tickFormatter={(v)=>`-${v}%`} />
          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
          <Bar dataKey="fxLoss" name="영업이익 환차손 증발률(%)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      takeaway={{
        source: '재무팀 선물환(Forward) 헷징 시뮬레이션',
        situation: "명태 매입은 100% 달러 베이스인 반면 국내 매출은 원화 베이스이므로, 달러 당 1,380원을 초과하면 가공 마진이 환차손으로 인해 빈 껍데기가 됩니다.",
        actionPlan: "원/달러 환율이 임계점(1,350원)을 돌파하면 매입 물량을 기계적으로 홀드(Hold)하는 룰-베이스 펌핑을 시작해야 합니다. 수산 비즈니스는 곧 외환 헷징 사업이라 봐도 무방하며, 전용 재무팀의 선도 헷지가 조업량 배가보다 이윤이 높습니다.",
      }}
    />
  );
}

// 6. WidgetAITimePredict
const dataAiTime = [
  { month: 'Q1', downtimeConv: 15, downtimeAi: 3 },
  { month: 'Q2', downtimeConv: 18, downtimeAi: 4 },
  { month: 'Q3', downtimeConv: 22, downtimeAi: 2 },
  { month: 'Q4', downtimeConv: 12, downtimeAi: 1 }
];

export const WidgetAITimePredict = () => (
  <WidgetCard
    title="[Cost] 선박 AI 예지보전 도입 운휴 회피율"
    icon={Cpu}
    iconColor="#06b6d4"
    pillar="S2"
    cardDesc="AI 진동 센서 예지보전 도입 전후 선박 운휴(Downtime) 일수 비교"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <BarChart data={dataAiTime} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`${v}일`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar dataKey="downtimeConv" name="기존 유지보수 운휴일수" fill="var(--color-danger)" radius={[4,4,0,0]} barSize={25} />
        <Bar dataKey="downtimeAi" name="AI 예지보전 시 운휴일수" fill="#06b6d4" radius={[4,4,0,0]} barSize={25} />
      </BarChart>
    }
    takeaway={{
      source: '엔진 제조사(Wärtsilä) AI 도입 실증 선박 예방정비율 리포트',
      situation: '해상에서 엔진 결함으로 표류(Downtime)하는 1일 기회비용은 $50,000 이상입니다. 사후 대처는 재앙을 부릅니다.',
      actionPlan: '노후 선박일수록 AI 진동 센서(예지보전) 부착을 강제하여, 고장 전 입항 스케줄을 선제적으로 조정해 표류 비용을 80% 이상 절감.',
    }}
  />
);

// 7. WidgetPortTurnaround
const dataTurnaround = [
  { month: '4월', targetDays: 5, actualDays: 6, bottleneckHours: 24 },
  { month: '5월', targetDays: 5, actualDays: 5.5, bottleneckHours: 12 },
  { month: '6월', targetDays: 5, actualDays: 9, bottleneckHours: 96 },
  { month: '7월', targetDays: 5, actualDays: 12, bottleneckHours: 168 }
];

export const WidgetPortTurnaround = () => (
  <WidgetCard
    title="[Cost] 만재흘수 조업-하역 턴어라운드 진단기"
    icon={Activity}
    iconColor="#eab308"
    pillar="S3"
    cardDesc="만선 이후 하역 항구 턴어라운드 시간과 체선 병목 지연의 피크 시즌 진단"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataTurnaround} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={11} tickFormatter={(v)=>`${v}일`} />
        <YAxis yAxisId="right" orientation="right" stroke="#eab308" fontSize={11} tickFormatter={(v)=>`${v}h`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar yAxisId="left" dataKey="actualDays" name="실제 턴어라운드 (Days)" fill="var(--color-info)" radius={[4,4,0,0]} barSize={20} />
        <Line yAxisId="right" type="monotone" dataKey="bottleneckHours" name="병목 체선 지연 (Hours)" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: 'NotebookLM 보관 항만 대리점 입출항 리드타임 분해 데이터',
      situation: '만선(만재흘수) 이후 하역 항구의 선석 승인이 지연되면서 피크 시즌 턴어라운드(Turn-around) 타임이 2배로 폭증합니다.',
      actionPlan: '항만 체선율이 높은 6~7월에는 선단장 재량 하에 90% 적재 후 조기 입항하도록 지시하여 하역 대기 시간을 스킵하는 것이 유리합니다.',
    }}
  />
);

// 8. WidgetVesselCapex
const dataCapex = [
  { shipAge: '20년 이하', capexRisk: 10, scrapValue: 800 },
  { shipAge: '20~25년', capexRisk: 35, scrapValue: 600 },
  { shipAge: '25~30년', capexRisk: 80, scrapValue: 400 },
  { shipAge: '30년 이상', capexRisk: 95, scrapValue: 250 }
];

export const WidgetVesselCapex = () => (
  <WidgetCard
    title="[Cost] 선박 폐선 및 대체 CAPEX 투하 압박도"
    icon={Anchor}
    iconColor="var(--color-danger)"
    pillar="S1"
    cardDesc="선령 구간별 대체 CAPEX 강제 압박률과 고철 잔존가치 역학"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataCapex} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="shipAge" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis yAxisId="left" stroke="var(--color-danger)" fontSize={11} domain={[0, 100]} tickFormatter={(v)=>`${v}%`} />
        <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`$${v}k`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Area yAxisId="left" type="monotone" dataKey="capexRisk" name="대체 CAPEX 강제 압박률 (%)" fill="var(--color-danger)" stroke="var(--color-danger)" fillOpacity={0.3} strokeWidth={2} />
        <Bar yAxisId="right" dataKey="scrapValue" name="예상 고철(Scrap) 잔존가치" fill="#64748b" radius={[4,4,0,0]} barSize={20} />
      </ComposedChart>
    }
    takeaway={{
      source: '한국선급(KR) 내구연한 수칙 및 해양수산부 스마트 선박 보조금 펀딩 현황',
      situation: '선령 25년을 초과한 노후 선단 비율이 높아지며 유지보수율(OPEX) 한계점을 돌파, 기습적 신조선 발주 타격이 예상됩니다.',
      actionPlan: 'Scrap(고철) 잔존가치가 급락하기 전 즉시 매각하고, 스마트 펀딩 매칭을 통해 수소/하이브리드 신조선 발주 계약을 체결.',
    }}
  />
);

// 9. WidgetRobotTCO
const dataRobot = [
  { year: '1년차', hCost: 50, rCost: 150 },
  { year: '3년차', hCost: 160, rCost: 180 },
  { year: '5년차(Cross)', hCost: 280, rCost: 210 },
  { year: '7년차', hCost: 410, rCost: 240 }
];

export const WidgetRobotTCO = () => (
  <WidgetCard
    title="[Cost] 공장 자동화(ROBOT) TCO 크로스오버"
    icon={Bot}
    iconColor="#8b5cf6"
    pillar="S2"
    cardDesc="인건비 누적 한계비용과 로봇 설비 TCO 크로스오버 시점 분석"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <LineChart data={dataRobot} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`$${v}k`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Line type="monotone" dataKey="hCost" name="인간 노무 누적 한계비용" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="rCost" name="로봇 설비(TCO) 누적액" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    }
    takeaway={{
      source: 'IFR 산업용 수산가공 로봇 보급률 및 Marel Filleting 머신 단가표',
      situation: '동남아 인건비 상승 및 숙련공 고령화로 5년 차에 인건비 총액이 로봇 자동화 총소유비용(TCO)을 역전합니다.',
      actionPlan: '단기적 장비 셋업 비용($150k)을 두려워 마십시오. BAADER/Marel 자동 절단기를 도입하면 위생 리스크 소거와 함께 인당 생산 효율이 300% 급증합니다.',
    }}
  />
);

// 10. WidgetAirVsOcean
const dataFreight = [
  { term: '해운(45일)', costDiff: 0, freshnessLoss: 30 },
  { term: 'Sea&Air(18일)', costDiff: 15, freshnessLoss: 10 },
  { term: '항공직송(3일)', costDiff: 45, freshnessLoss: 0 }
];

export const WidgetAirVsOcean = () => (
  <WidgetCard
    title="[Cost] 모달 쉬프트(Air vs Ocean) 선도 마진"
    icon={PlaneTakeoff}
    iconColor="var(--color-success)"
    pillar="S3"
    cardDesc="해운/항공/복합 운송별 추가 운임과 선도 가치 하락률 트레이드오프"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataFreight} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="term" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={11} tickFormatter={(v)=>`+$${v}`} />
        <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={11} domain={[0, 40]} tickFormatter={(v)=>`${v}%`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar yAxisId="left" dataKey="costDiff" name="추가 운임/kg (USD)" fill="var(--color-success)" radius={[4,4,0,0]} barSize={25} />
        <Line yAxisId="right" type="monotone" dataKey="freshnessLoss" name="선도(신선도) 가치 하락률 (%)" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: '프레이토스 발틱 해상운임(FBX) 및 항공운임지수(TAC) 스프레드 비교',
      situation: '초하이엔드 신선 명패(명란/생물)의 경우, 해운 운송 45일간 발생하는 선도 하락(30%) 패널티가 항공 추가 운임비보다 큽니다.',
      actionPlan: '최상위 등급 S-Class 원물은 반드시 해상-항공 복합(Sea&Air)을 태워 20일 내 뉴욕에 랜딩시켜 프리미엄 하이엔드 시장에 직판.',
    }}
  />
);
