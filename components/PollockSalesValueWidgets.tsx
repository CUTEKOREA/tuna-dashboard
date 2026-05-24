'use client';
import React from 'react';
import { ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ScatterChart, Scatter, Cell } from 'recharts';
import { TrendingUp, Crosshair, PackageSearch, Shuffle, ClipboardSignature, Search, ShieldAlert, CalendarClock, Replace, Store } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

// 31. WidgetBlockVsIQF
const dataIQF = [
  { group: '블록(도매)', margin: 15, cost: 2.5 },
  { group: '필렛(B2C)', margin: 22, cost: 3.8 },
  { group: 'IQF(가공)', margin: 35, cost: 4.5 },
  { group: '초신선(S급)', margin: 60, cost: 6.0 }
];

export const WidgetBlockVsIQF = () => (
  <WidgetCard
    title="[Sales] 블록 vs IQF 패스 마진 스프레드"
    icon={TrendingUp}
    iconColor="var(--color-info)"
    pillar="S4"
    cardDesc="냉동 블록·필렛·IQF·초신선 등급별 판매 단가와 영업이익률 비교"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataIQF} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="group" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={11} tickFormatter={(v)=>`$${v}k`} />
        <YAxis yAxisId="right" orientation="right" stroke="#eab308" fontSize={11} tickFormatter={(v)=>`${v}%`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar yAxisId="left" dataKey="cost" name="판매 단가 (USD)" fill="var(--color-info)" radius={[4,4,0,0]} barSize={25} />
        <Line yAxisId="right" type="monotone" dataKey="margin" name="영업이익률 (%)" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: 'Urner Barry B2B 수산물 도매가 지수 리포트',
      situation: '단순 냉동 블록 형태의 원물 납품 마진은 15%에 그치나, IQF(개별 급속 냉동) 필렛은 Bottom-line(순이익)률이 35%로 폭증합니다.',
      actionPlan: '가격 경쟁력이 없는 범용 블록 생산 라인을 점진적으로 축소하고, B2C 밀키트용 IQF 하이엔드 라인 설비에 전량 캐파를 집중.',
    }}
  />
);

// 32. WidgetRoeMarginSpread
const dataRoe = [
  { quarter: '25.1Q', auction: 15, retail: 30 },
  { quarter: '25.2Q', auction: 14, retail: 31 },
  { quarter: '25.3Q', auction: 12, retail: 29 },
  { quarter: '25.4Q', auction: 10, retail: 28 },
  { quarter: '26.1Q', auction: 8, retail: 28 }
];

export const WidgetRoeMarginSpread = () => (
  <WidgetCard
    title="[Sales] 명란 경매가 및 소매 방어력 투시도"
    icon={Crosshair}
    iconColor="#f43f5e"
    pillar="S4"
    cardDesc="도요스 경매 산지 단가 폭락에도 소매가가 유지되는 전가 저항성 추적"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <LineChart data={dataRoe} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`$${v}/kg`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Line type="stepAfter" dataKey="auction" name="도요스 경매 산지 단가" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="retail" name="백화점 B2C 소매 단가" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    }
    takeaway={{
      source: '도쿄 도요스 시장 일별 경매 단가 및 후쿠오카 유통가 시계열',
      situation: "원물(명란) 경매가가 -40% 폭락해도 멘타이코(명란젓) 최종 소비자가는 요지부동인 '전가 저항성'이 확인되었습니다.",
      actionPlan: '가격이 폭락한 원원물 창고를 개방하여 공격적으로 B2C 가공을 늘리십시오. 산지 폭락이 B2C 벤더의 역사적 마진 스프레드를 창출합니다.',
    }}
  />
);

// 33. WidgetInventoryCycle
const dataInv = [
  { month: 'J', usInv: 120, jpInv: 80, price: 3.0 },
  { month: 'F', usInv: 150, jpInv: 90, price: 2.8 },
  { month: 'M', usInv: 170, jpInv: 130, price: 2.5 },
  { month: 'A', usInv: 110, jpInv: 150, price: 2.6 },
  { month: 'M', usInv: 80, jpInv: 160, price: 3.2 },
  { month: 'J', usInv: 60, jpInv: 100, price: 3.5 }
];

export const WidgetInventoryCycle = () => (
  <WidgetCard
    title="[Sales] 미-일 내수 시장 재고 사이클 투시도"
    icon={PackageSearch}
    iconColor="#8b5cf6"
    pillar="S4"
    cardDesc="미국(NFI)·일본 재고 사이클 피크 후 가격 반등 시점 추적"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataInv} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={11} tickFormatter={(v)=>`${v}k t`} />
        <YAxis yAxisId="right" orientation="right" stroke="var(--color-warning)" fontSize={11} tickFormatter={(v)=>`$${v}`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar yAxisId="left" stackId="a" dataKey="usInv" name="미국(NFI) 재고" fill="#8b5cf6" />
        <Bar yAxisId="left" stackId="a" dataKey="jpInv" name="일본 대일 재고" fill="#c084fc" />
        <Line yAxisId="right" type="monotone" dataKey="price" name="국제 B2B 공시가" stroke="var(--color-warning)" strokeWidth={3} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: '미국수산물협회(NFI) 재고율 및 일본 수산청 연례 적재량',
      situation: '최대 수입국의 재고 사이클이 피크(170k tons) 통과 후 3개월 뒤 가격 반등(Price Rebound)이 발생합니다.',
      actionPlan: '수입국 재고 폭발 시즌에 공매도 성격의 매수 포지션을 쥐지 말고 홀딩하다, 재고가 소진되는 Q3에 직방출하여 단가를 방어.',
    }}
  />
);

// 34. WidgetSurimiBlendElasticity
const surimiBlendData = [
  { month: 'Q1', pollockSurimi: 4200, itoyoriBlend: 10,  marline: 15 },
  { month: 'Q2', pollockSurimi: 4800, itoyoriBlend: 15,  marline: 25 },
  { month: 'Q3', pollockSurimi: 5500, itoyoriBlend: 35,  marline: 40 },
  { month: 'Q4', pollockSurimi: 6200, itoyoriBlend: 60,  marline: 75 }
];

export const WidgetSurimiBlendElasticity = () => (
  <WidgetCard
    title="[Sales] 연육(Surimi) 공급 충격 대체 탄력성"
    icon={Shuffle}
    iconColor="#eab308"
    pillar="S4"
    cardDesc="명태 SA급 연육 단가 상승 시 동남아산 잡어 블렌딩 비율 증가 추적"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={surimiBlendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={11} tickFormatter={(v)=>`$${v}`} />
        <YAxis yAxisId="right" orientation="right" stroke="#eab308" fontSize={11} tickFormatter={(v)=>`${v}%`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar yAxisId="left" dataKey="pollockSurimi" name="명태 SA급 연육가 (톤)" fill="#8b5cf6" radius={[4,4,0,0]} barSize={25} />
        <Line yAxisId="right" type="monotone" dataKey="itoyoriBlend" name="실꼬리돔 믹스 비율 (%)" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: '일본 연육생산자협회(SNPA) 최고등급 AL/SA 급 거래 단가',
      situation: '러시아산 덤핑이 소멸하고 AL/SA급 연육 단가가 톤당 $5,500을 돌파하면 B2B 벤더들이 즉각 동남아산 잡어(실꼬리돔) 비율을 늘려 품질을 희석시킵니다.',
      actionPlan: '명태 연육가가 임계점을 넘으면 SA등급 단일 고집을 버리고, 고객사에 맞춤형 블렌딩(Blend) 비율을 제안해 계약 이탈(Churn)을 막으십시오.',
    }}
  />
);

// 35. WidgetB2BContractPipeline
const dataPipeline = [
  { item: '버거 체인', dDay: 90, scale: 50 },
  { item: '급식(상반기)', dDay: 15, scale: 80 },
  { item: '할인마트', dDay: 150, scale: 30 },
  { item: '호텔 뷔페', dDay: 5, scale: 10 }
];

export const WidgetB2BContractPipeline = () => (
  <WidgetCard
    title="[Sales] 패스트푸드 B2B 갱신 파이프라인"
    icon={ClipboardSignature}
    iconColor="#0ea5e9"
    pillar="S4"
    cardDesc="대형 프랜차이즈 및 마트 B2B 계약 갱신 D-Day와 규모 매핑"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="dDay" name="계약 갱신 임박 D-Day" stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`D-${v}`} reversed />
        <YAxis dataKey="scale" name="계약 규모 (톤)" stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`${v}k t`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} cursor={{ strokeDasharray: '3 3' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Scatter name="대형 플랜차이즈 및 마트" data={dataPipeline} fill="#0ea5e9">
          {dataPipeline.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.dDay < 30 ? 'var(--color-danger)' : '#0ea5e9'} />
          ))}
        </Scatter>
      </ScatterChart>
    }
    takeaway={{
      source: '글로벌 빅4 수산 납품 프랜차이즈 구매 계약(10-K) 사이클',
      situation: '맥도날드, 대형 급식업체 등 빅바이어의 장기 공급 갱신 협상은 종료 D-30일부터 단가 협상 압력이 최고조에 달합니다.',
      actionPlan: 'D-30에 접어든(붉은색) 파이프라인에 집중하여, 어가 상승 데이터를 근거로 유류세 연동 단가 방어 협상을 관철.',
    }}
  />
);

// 36. WidgetWholesaleArbitrage
const dataArb = [
  { day: '월', garak: 120, suwon: 135, busan: 100 },
  { day: '화', garak: 125, suwon: 115, busan: 105 },
  { day: '수', garak: 110, suwon: 140, busan: 110 },
  { day: '목', garak: 150, suwon: 120, busan: 115 },
  { day: '금', garak: 145, suwon: 110, busan: 130 }
];

export const WidgetWholesaleArbitrage = () => (
  <WidgetCard
    title="[Sales] 도매시장 일별 경락 아비트리지"
    icon={Search}
    iconColor="#14b8a6"
    pillar="S4"
    cardDesc="가락·수원·부산 도매시장 요일별 경락가 차이를 활용한 아비트리지 기회"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <LineChart data={dataArb} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`${v}원`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Line type="monotone" dataKey="garak" name="가락시장 경락가" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="suwon" name="수원시장 경락가" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="busan" name="부산국제 경락가" stroke="var(--color-info)" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    }
    takeaway={{
      source: '한국농수산식품공사(aT) 가락/수원 도매시장 API 분석망',
      situation: '단일 위판장에서만 덤핑하면 시장 전체 시세가 폭락하지만, 요일별로 부족한 시장으로 물류를 분산하면 최소 15% 아비트리지가 획득됩니다.',
      actionPlan: 'API 추이 상 목요일 가락시장 가격이 항상 튑니다. 타 지역 물량을 서울로 밴(Van) 스나이핑하여 중도매 마진을 차단.',
    }}
  />
);

// 37. WidgetClimateClause
const dataClause = [
  { year: '2022', none: 80, fuel: 15, climate: 5 },
  { year: '2024', none: 50, fuel: 35, climate: 15 },
  { year: '2026', none: 20, fuel: 40, climate: 40 }
];

export const WidgetClimateClause = () => (
  <WidgetCard
    title="[Sales] B2B '기후변화 유닛 클로즈' 전가 비중"
    icon={ShieldAlert}
    iconColor="#f97316"
    pillar="S4"
    cardDesc="B2B 계약서 내 고정가·유류비 연동·기후 연동 조항 비중 변화 추이"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <BarChart data={dataClause} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`${v}%`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar stackId="a" dataKey="none" name="고정 단가 (전가 불가)" fill="#64748b" />
        <Bar stackId="a" dataKey="fuel" name="유류비 인덱스 연동 조항" fill="var(--color-info)" />
        <Bar stackId="a" dataKey="climate" name="기후/어획 폭락 연동 조항" fill="#f97316" />
      </BarChart>
    }
    takeaway={{
      source: '자사 B2B 영업팀 우수 계약서 Pricing Escalation 조항 연구',
      situation: '이제 고정가 장기계약은 도박입니다. 흉어로 쿼터가 터지거나 유가가 오르면 납품할수록 적자가 나는 데쓰 스파이럴에 빠집니다.',
      actionPlan: "2026년 체결되는 모든 빅바이어 계약서엔 '기후 유닛 클로즈(환경 비용 증가 시 판매가 100% 반영)'를 강제해야 합니다.",
    }}
  />
);

// 38. WidgetHolidayPremium
const dataHoliday = [
  { week: 'D-3', normal: 10,  deli: 20 },
  { week: 'D-2', normal: 12,  deli: 35 },
  { week: 'D-1 (피크)', normal: 15, deli: 80 },
  { week: 'D-Day', normal: 10, deli: 30 }
];

export const WidgetHolidayPremium = () => (
  <WidgetCard
    title="[Sales] 명절 연휴 D-Day 델리 전진배치 매출"
    icon={CalendarClock}
    iconColor="#ec4899"
    pillar="S4"
    cardDesc="명절 특수 기간 일반 수산 매대 vs 델리(RTE) 매대 매출 상승률 비교"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <LineChart data={dataHoliday} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`+${v}%`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Line type="monotone" dataKey="normal" name="일반 수산 매대 매출 상승률" stroke="#64748b" strokeWidth={3} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="deli" name="델리(RTE) 매대 매출 상승률" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    }
    takeaway={{
      source: '닐슨(Nielsen) 스캐너(IRI) 미주 연휴 POS 해산물 매출 추적',
      situation: '휴일 특수에 냉동 평대에 적재된 블록형 원물은 전혀 안 팔리지만, 즉석 조리가 가능한 델리(RTE) 코너의 매출은 80% 폭발합니다.',
      actionPlan: '명절 D-3 시점부터 대형마트와 협의해 원물을 델리 코너(밀키트/조리포장)로 100% 스위칭하여 프리미엄 차익을 쓸어 담아야 합니다.',
    }}
  />
);

// 39. WidgetSpeciesSwap
const dataSwap = [
  { item: '비수기', pollockPrice: 3.0, altDemand: 10 },
  { item: '앙등기', pollockPrice: 3.5, altDemand: 25 },
  { item: '폭등기', pollockPrice: 4.5, altDemand: 60 },
  { item: '전환기', pollockPrice: 5.5, altDemand: 85 }
];

export const WidgetSpeciesSwap = () => (
  <WidgetCard
    title="[Sales] 대체재(틸라피아) 가격 교차탄력성"
    icon={Replace}
    iconColor="#d946ef"
    pillar="S4"
    cardDesc="명태 B2B 단가 상승 시 틸라피아 대체 발주량 교차탄력성 시뮬레이션"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataSwap} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="item" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis yAxisId="left" stroke="#cbd5e1" fontSize={11} tickFormatter={(v)=>`$${v}`} />
        <YAxis yAxisId="right" orientation="right" stroke="#d946ef" fontSize={11} tickFormatter={(v)=>`${v}%`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar yAxisId="left" dataKey="pollockPrice" name="명태 B2B 단가" fill="#64748b" radius={[4,4,0,0]} barSize={25} />
        <Line yAxisId="right" type="monotone" dataKey="altDemand" name="틸라피아 대체 발주량(%)" stroke="#d946ef" strokeWidth={3} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: 'FAO FishStatJ 이기종 어종 수요 교차탄력성수리 모델',
      situation: '명태 단가가 톤당 $4.5k를 넘어서는 폭등 시점에 접어들면 바이어들이 원재료를 틸라피아/광어로 60% 이상 무자비하게 스위칭합니다.',
      actionPlan: '가격 인상(Mark-up) 정책을 밀고 나가되, Crossover Point ($4.5k)를 건드리지 않도록 빅바이어용 특별 할인 프로모션 락을 걸어야 합니다.',
    }}
  />
);

// 40. WidgetD2CRoi
const dataD2c = [
  { p: 'B2B 도매', rev: 100, cpCfee: 0, margin: 15 },
  { p: '초기 D2C', rev: 150, cpCfee: 45, margin: 10 },
  { p: '로열 D2C', rev: 180, cpCfee: 10, margin: 45 }
];

export const WidgetD2CRoi = () => (
  <WidgetCard
    title="[Sales] D2C 이커머스 전향 플랫폼 취소율 극복 ROI"
    icon={Store}
    iconColor="#84cc16"
    pillar="S4"
    cardDesc="B2B 도매 → D2C 이커머스 전환 시 초기 출혈과 로열 단계 마진 회복 ROI"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={260}
    chart={
      <ComposedChart data={dataD2c} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="p" stroke="#94a3b8" fontSize={11} interval={0} />
        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v)=>`${v}%`} />
        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: 'var(--text-primary)' }} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
        <Bar stackId="a" dataKey="margin" name="최종 순익분(Margin)" fill="#84cc16" barSize={35} />
        <Bar stackId="a" dataKey="cpCfee" name="이커머스/광고비 출혈" fill="var(--color-danger)" barSize={35} />
        <Line type="monotone" dataKey="rev" name="소매 총 매출액" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} />
      </ComposedChart>
    }
    takeaway={{
      source: '쿠팡/아마존 프레시 B2C 밀키트 CPC CVP율 통계',
      situation: 'D2C(자사몰/직배송) 이커머스 첫 진입 시 플랫폼 수수료와 마케팅비(45%)가 몽땅 빨려나가 B2B보다 이윤이 박살납니다.',
      actionPlan: "초기 출혈을 감수하고 런칭하되, 구독형 로열티 멤버십 고객이 30%를 넘는 '로열 D2C' 단계가 되면 마진 45%의 황금알 거루가 완성됩니다.",
    }}
  />
);
