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
      situation: `<div>
<p>"IQF(Individually Quick Frozen, 개별 급속 냉동)"란 명태 필렛 한 조각씩 -40℃ 급속 냉동해 한 조각씩 떼어 쓸 수 있는 가공 방식. 전통 "블록 냉동" 대비 편의성·품질 모두 우위.</p>
<p>마진 격차: <strong>블록 원물 납품 15% vs IQF 필렛 35%</strong> — 2.3배 격차. 같은 원물도 가공 방식 변경만으로 마진 doubling.</p>
<p>의미: 블록은 B2B 가공사 대상 commodity, IQF는 B2C 밀키트·즉석조리 대상 differentiated product. 한국 1인 가구 +50% 트렌드에서 IQF 수요 폭증.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 블록 vs IQF는 단순 가공 선택이 아닌 <strong>"commodity 사업 → branded product 사업 paradigm shift"</strong>.</p>
<p><strong>3단계</strong>: ① 블록 라인 70% → 40% 축소 ② IQF 하이엔드 라인 capex $5~10M, 회수 18개월 ③ CJ Hetbahn·마켓컬리·쿠팡과 5년 exclusive 공급 계약으로 default ingredient 락업.</p>
</div>`,
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
      situation: `<div>
<p>"전가 저항성(Pass-through Resistance)"이란 원물 가격 변동이 소비자가에 얼마나 반영되는지의 한계. 명란 시장은 특이하게도 <strong>매우 강한 비대칭 저항성</strong>을 보입니다.</p>
<p>실측: <strong>원물(명란) 경매가 -40% 폭락에도 멘타이코(명란젓) 소비자가 요지부동</strong>. 상승 시에는 100% 전가, 하락 시에는 0% 전가. 즉 일방향 sticky pricing.</p>
<p>의미: 원물 폭락 시점이 <strong>B2C 벤더의 "역사적 마진 스프레드 창출 윈도우"</strong>. 매입원가 -40% + 판가 유지 = 마진 +30~40%p 폭증.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 원물 폭락은 위기가 아닌 <strong>"3~6개월 한정 골든 윈도우"</strong>.</p>
<p><strong>3단계</strong>: ① 원물 창고 개방 + 공격적 B2C 가공 가속 ② D2C 채널 마케팅 예산 +50% 일시 증액 — 골든 윈도우 동안 시장 점유 락업 ③ 동일 사이클을 systematic하게 capture하는 "Roe arbitrage trading book" 운영.</p>
</div>`,
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
      situation: `<div>
<p>"재고 사이클(Inventory Cycle)"이란 미국·일본 등 주요 수입국의 명태 재고가 분기별로 oscillate하는 패턴. 매우 예측 가능한 cyclic indicator.</p>
<p>실측 패턴: <strong>최대 수입국 재고 피크 170k tons 통과 후 정확히 3개월 뒤 가격 반등(Price Rebound) 발생</strong>. 5년간 동일 패턴 검증.</p>
<p>의미: 재고 사이클은 가격 변동의 leading indicator. 미국 NMFS·일본 농수성 재고 통계를 매월 monitoring하면 사실상 3개월 앞서 매도/매수 timing 결정 가능.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 재고 사이클은 단순 macro 정보가 아닌 <strong>"3-month forward trading signal"</strong>.</p>
<p><strong>3단계</strong>: ① 재고 폭발 시즌 매수 포지션 hold (덤핑하지 말 것) ② 재고 소진 Q3에 spot 직방출로 단가 +20~30% 회수 ③ NMFS·농수성 재고 통계 자동 monitoring + ML 모델로 매도 timing 자동 발동.</p>
</div>`,
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
      situation: `<div>
<p>"연육(Surimi)"이란 명태 살을 갈아 만든 가공 원료. 게맛살·어묵·핫도그 등의 핵심 ingredient. 글로벌 연육의 60%+가 명태 기반.</p>
<p>임계점: <strong>AL/SA급 연육 단가 톤당 $5,500 돌파</strong> 시 B2B 벤더(CJ·동원·사조)가 동남아산 잡어(실꼬리돔·정어리)로 즉각 블렌딩 시작. 품질 희석은 vendor switching 신호.</p>
<p>의미: 명태 SA등급 단일 고집은 임계점 이후 계약 이탈(churn) 가속. <strong>유연한 블렌딩 제안이 vendor lock-in의 핵심</strong>.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 연육 비즈니스는 단일 등급 commodity가 아닌 <strong>"customizable blending platform"</strong>.</p>
<p><strong>3단계</strong>: ① 명태 단가 $5,500 임계점 모니터링 — 돌파 시 자동 블렌딩 옵션 제안 ② 고객사별 맞춤형 블렌드 ratio 시뮬레이션 sheet 제공 ③ "Blended Surimi as a Service" platform 진화 — 고객사가 원하는 단백질·텍스처·가격 sweet spot을 우리가 정의하는 ingredient 컨설팅 서비스로 확장.</p>
</div>`,
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
      situation: `<div>
<p>"갱신 파이프라인(Renewal Pipeline)"이란 빅바이어 장기 공급 계약의 만료 일정을 시각화한 trading desk dashboard. 갱신 타이밍이 곧 가격 협상력의 결정 변수.</p>
<p>패턴: <strong>맥도날드·서브웨이·대형 급식업체 등 빅바이어의 갱신 협상은 D-30일부터 단가 압력 최고조</strong>. 그 시점 빅바이어는 multiple vendor 대안 적극 활용. 우리가 가격 sticky 못하면 5년 계약 잃음.</p>
<p>의미: 갱신 D-30 윈도우는 <strong>"vendor의 협상력이 가장 약한 시점"</strong>. 미리 어가 상승 데이터 + 대안 vendor 시장가 자료를 무장해야 함.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 갱신 협상은 reactive cost defense가 아닌 <strong>"D-90 사전 무장 + 데이터 기반 정량 협상"</strong>이 본질.</p>
<p><strong>3단계</strong>: ① D-90 시점 vendor 분석 자료 준비 — 어가 상승·환율·운임 지표 정량화 ② D-30 시점 "유류세 연동 단가 자동 조정 clause" 강제 제안 ③ 빅바이어 multi-year contract에 ESG·MSC 인증·climate clause를 lock-in 조건으로 끼워넣어 switching cost 강제 ↑.</p>
</div>`,
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
      situation: `<div>
<p>"도매시장 경락 아비트리지(Wholesale Auction Arbitrage)"란 위판장·도매시장별 가격 격차를 활용해 매도 channel을 dynamic하게 선택하는 trading 전략.</p>
<p>실측 패턴: 단일 위판장 덤핑 시 전체 시세 -10~15% 폭락. 반면 <strong>요일·지역별 가격 격차 활용 시 최소 +15% 아비트리지 획득</strong> 가능. 핵심: 서울 가락시장 목요일 가격이 항상 +12~18% 상승 sticky.</p>
<p>의미: 도매 채널은 단순 매도 outlet이 아닌 <strong>"5축 (가락·노량진·부산·인천·울산) dynamic routing platform"</strong>. 같은 원물도 어디서 어느 요일에 매도하느냐로 마진 차이 큼.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 도매시장 매도는 reactive logistics가 아닌 <strong>"systematic arbitrage trading"</strong>.</p>
<p><strong>3단계</strong>: ① 가락·노량진·부산·인천·울산 5대 시장 daily 가격 API 모니터링 ② 목요일 가락시장 spike 자동 활용 — 타 지역 물량을 수도권 밴(van) 라우팅으로 중도매 마진 200~400bp 회수 ③ "Wholesale arbitrage SaaS" 자체 platform화 — mid-tier 수산사에 라이센싱.</p>
</div>`,
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
      situation: `<div>
<p>"기후 유닛 클로즈(Climate Unit Clause)"란 계약서에 명시되는 조항으로, 환경·기후 비용(어가 폭등·유가·운임) 상승 시 판가에 자동 전가하는 mechanism.</p>
<p>현실: <strong>고정가 장기계약은 더 이상 안정성이 아닌 도박</strong>. 흉어 사이클·유가 폭등·운임 충격 시 납품할수록 적자가 나는 데스 스파이럴 진입. 2023~2024 다수 한국 vendor가 이로 마진 -10~15%p 직격.</p>
<p>의미: 기후·매크로 변동성이 새 평시 standard. <strong>"고정가 계약 = 우리가 외생 충격 100% 떠안음" 구조 폐기</strong>가 핵심.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 계약 형태는 단순 commercial term이 아닌 <strong>"본업 P&amp;L의 외생 충격 흡수 mechanism"</strong>. clause 1줄이 마진 +10~15%p 차이.</p>
<p><strong>3단계</strong>: ① 2026년 체결 모든 빅바이어 계약에 "Climate Unit Clause(어가·유가·환율 상승 시 판가 100% 자동 반영)" 강제 ② NPFMC TAC 결정·NOAA ENSO Index·OPEC 유가 결정의 자동 가격 trigger 명문화 ③ 빅바이어가 거부 시 multi-vendor switching cost 데이터로 협상 — 우리만의 차별화(MSC·VDS·Compliance)로 갱신 lock-in.</p>
</div>`,
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
      situation: `<div>
<p>"델리(RTE, Ready-To-Eat)"란 대형마트의 즉석 조리·포장 코너. 최근 한국 가구 구조 변화로 RTE가 매대 매출의 35~50% 차지.</p>
<p>명절 특수 패턴: <strong>휴일·명절(설·추석·연말) 동안 냉동 블록 원물 매출은 -30~50% 감소</strong>, 반면 <strong>RTE 델리 코너 매출 +80% 폭발</strong>. 가족 모임·홈파티에서 즉석 조리 가능한 SKU 선호.</p>
<p>의미: 명절 시즌의 마진은 SKU 변환만으로 +200~400bp 차이. 블록 그대로 매대에 두는 vendor와 RTE 변환한 vendor의 시즌 매출 갭이 결정적.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 명절 D-3 시점은 단순 매대 적재가 아닌 <strong>"SKU dynamic transformation window"</strong>.</p>
<p><strong>3단계</strong>: ① 명절 D-3부터 대형마트(이마트·롯데마트·홈플러스)와 협의 — 원물 100%를 RTE 밀키트/조리포장으로 스위칭 ② "명절 한정 limited edition" 프리미엄 SKU launch — ASP +30~50% ③ 자체 brand("K-Pollock Holiday Premium") D2C 채널 launch — 명절 시즌 마진 도매 마진 200~400bp 직접 회수.</p>
</div>`,
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
      situation: `<div>
<p>"교차탄력성(Cross-Price Elasticity)"이란 대체재 가격 변동이 본 상품 수요에 미치는 영향. 명태의 가장 큰 substitution risk는 <strong>틸라피아(중국·동남아 양식)와 양식 광어</strong>.</p>
<p>임계점: <strong>명태 단가 톤당 $4,500 돌파 시 B2B 바이어가 원재료를 틸라피아/광어로 60% 이상 무자비하게 스위칭</strong>. 한 번 스위칭하면 재진입 24~36개월 소요.</p>
<p>의미: $4,500은 사실상 명태 가격의 <strong>"absolute ceiling"</strong>. 이 선을 넘으면 단기 마진 +5% 얻고 장기 시장 -60% 잃음. 가격 정책의 가장 중요한 visible line.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: $4,500 Crossover Point는 단순 가격 변수가 아닌 <strong>"vendor 시장 점유의 absolute boundary"</strong>.</p>
<p><strong>3단계</strong>: ① $4,500 임계점 자동 alert — 돌파 임박 시 빅바이어용 특별 할인 프로모션 락 자동 발동 ② 가격 인상은 $4,300까지만, 그 이상은 차별화 SKU(MSC·인증)로 우회 ③ 틸라피아·광어 대비 우리 명태만의 가치 정량화 (단백질 함량·식감·brand history) 마케팅으로 switching cost 강제 증가.</p>
</div>`,
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
      situation: `<div>
<p>"D2C(Direct-to-Consumer) 이커머스"란 자사몰·직배송 채널로 중간 유통 없이 소비자에게 직접 판매. B2B 대비 마진 잠재력은 높지만 초기 cost 부담 큼.</p>
<p>초기 비용 함정: <strong>D2C 첫 진입 시 플랫폼 수수료(쿠팡·네이버페이) + 마케팅비 합산 45%가 매출에서 빠짐</strong>. B2B 대비 단기 이윤 더 박살. 첫 12~18개월 P&amp;L은 적자 가능.</p>
<p>임계점: <strong>구독형 로열티 멤버십 고객이 30%+ 도달 시 마진 45%의 골든 ROI 단계</strong>. 이후 광고비·플랫폼 의존도 감소 + lifetime value 폭증.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: D2C는 단기 P&amp;L이 아닌 <strong>"3년 후 마진 45% 도달의 옵션 자산"</strong>. 초기 출혈 감수하는 capital allocation 결단이 본질.</p>
<p><strong>3단계</strong>: ① 초기 12~18개월 출혈 감수 launch — capex $5~10M 별도 budget ② "Loyalty subscription" 가속 — 30% 로열 고객 목표 달성까지 마케팅비 +50% 일시 증액 ③ 도달 후 자체 brand "K-Pollock Premium" 글로벌 확장 — 일본·LA 한인 마트 + Amazon FBA. JP Morgan E-commerce Tech Desk와 partnership.</p>
</div>`,
    }}
  />
);
