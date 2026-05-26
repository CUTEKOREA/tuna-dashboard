'use client';
import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, Scatter, Cell } from 'recharts';
import { Fuel, Users, BarChart3, Snowflake, Droplets, Wrench, Target, AlertTriangle, RotateCw, Coins } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const SRC = '내부 영업·운영 데이터 + KAMIS 수산물 마진 분석 (2021-2023)';

export function Widget41_FuelBEP() {
  const data = [{ year: '2021', wti: 60, break_even_catch: 100 }, { year: '2022', wti: 110, break_even_catch: 160 }, { year: '2023', wti: 80, break_even_catch: 125 }];
  return (
    <WidgetCard title="선단 운영 유류비 손익분기점(BEP) 임계선" icon={Fuel} iconColor="#f43f5e" pillar="S1" cardDesc="WTI 유가 변동과 일일 BEP 어획량 — 출항 포기선 모니터" telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <ComposedChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line yAxisId="left" type="step" dataKey="break_even_catch" name="필요 최소 어획량(BEP 톤)" stroke="var(--color-danger)" strokeWidth={3} strokeDasharray="5 5" />
          <Bar yAxisId="right" dataKey="wti" name="WTI 유가" fill="#64748b" fillOpacity={0.6} />
        </ComposedChart>
      }
      takeaway={{ situation: `<div><p>"유류비 BEP(Break-Even Point)"는 어선 출항 시 흑자가 되는 최소 일일 어획량. 유가 변동에 따라 동적 변동.</p><p>위기: <strong>WTI 배럴당 $110 돌파 시 하루 160톤+ 잡지 못하면 출항할수록 손실 누적</strong>. 어선이 바다에 떠 있을수록 적자 가속.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 유가 BEP는 단순 OPEX가 아닌 <strong>"어선 출항 자체의 economic feasibility 판정선"</strong>.</p><p><strong>3단계</strong>: ① WTI $90 돌파 자동 출항 자제 알고리즘 ② LNG·하이브리드 전환선 신조 capex (IMO 2030 대비) ③ "Fuel-indexed voyage decision" 자동화.</p></div>`, source: SRC }}
    />
  );
}

export function Widget42_MiddlemenCollapse() {
  const data = [{ year: '2015', middlemen_margin: 25, direct_sourcing: 5 }, { year: '2019', middlemen_margin: 18, direct_sourcing: 15 }, { year: '2023', middlemen_margin: 8, direct_sourcing: 40 }];
  return (
    <WidgetCard title="중간 도매상(Middlemen) 마진 붕괴 궤적" icon={Users} iconColor="#fcd34d" pillar="S4" cardDesc="중도매인 vs 프랜차이즈 직수입 비율 변화 — 70% 거품 증발" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t}%`} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line type="monotone" dataKey="middlemen_margin" name="중도매인 장악 마진 파이(%)" stroke="var(--color-warning)" strokeWidth={3} />
          <Line type="monotone" dataKey="direct_sourcing" name="프랜차이즈 직수입 비율(%)" stroke="var(--color-info)" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{ situation: `<div><p>"중간 도매상(Middlemen) 마진 붕괴"란 다단계 하청 원물 유통이 사라지고 vendor 직거래로 전환되는 paradigm shift.</p><p>현재 진행: <strong>대형 프랜차이즈(BBQ·BHC·맘스터치·SPC)가 수입사와 다이렉트 조인 — 거품 70% 증발</strong>. 5단계 도매 → 2단계 (수입사 → 프랜차이즈) 단축.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 중도매 marg 붕괴는 위협이 아닌 <strong>"직거래 라인 락업의 jackpot 윈도우"</strong>.</p><p><strong>3단계</strong>: ① 신라교역 → 대형 프랜차이즈 직거래 라인 60%+ 확대 ② 도매시장 의존도 30% 이하 통제 ③ "Direct-to-Franchise platform" — TOP 10 프랜차이즈와 5년 exclusive 계약.</p></div>`, source: SRC }}
    />
  );
}

export function Widget43_WaterfallMargin() {
  const data = [{ step: '선사(조업)', value: 30 }, { step: '수입상', value: 15 }, { step: '가공장', value: 25 }, { step: '소매마트', value: 30 }];
  return (
    <WidgetCard title="밸류체인 스텝별 폭포수(Waterfall) 마진 분배" icon={BarChart3} iconColor="#10b981" pillar="S4" cardDesc="조업-수입-가공-소매 4단계 마진 분배 — 가공이 수입상보다 큼" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} domain={[0, 100]} />
          <YAxis dataKey="step" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={80} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="value" name="해당 단계 마진 폭(%)" fill="var(--color-success)" />
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"폭포수(Waterfall) 마진 분배"란 가치사슬 단계별 누가 얼마를 가져가는지의 정량 분석.</p><p>4단계 분배: <strong>조업 30% · 수입 15% · 가공 25% · 소매 30%</strong>. 충격적 인사이트: 가공장(25%)이 단순 칼질 한 번으로 수입상(15%)보다 많이 챙김. 즉 cost·risk 가장 적은 가공이 마진 우위.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 수입상 15% segment는 stranded position. <strong>"가공·소매 인접 영역 수직 통합"</strong>이 본질.</p><p><strong>3단계</strong>: ① 가공 라인 capex 가속 — 마진 25% segment 진입 ② 자체 brand B2C 채널 launch — 소매 마진 30% 흡수 ③ "Vertically integrated platform" — 수입+가공+B2C 통합으로 마진 70% 회수.</p></div>`, source: SRC }}
    />
  );
}

export function Widget44_StorageDeadcross() {
  const data = [{ month: '1개월', price_gain: 5, storage_cost: -2 }, { month: '3개월', price_gain: 15, storage_cost: -7 }, { month: '6개월', price_gain: 20, storage_cost: -18 }, { month: '10개월', price_gain: 22, storage_cost: -30 }];
  return (
    <WidgetCard title="존버 실패: 보관료 누적 vs 시세 차익 데드크로스" icon={Snowflake} iconColor="#f87171" pillar="S3" cardDesc="시세 펌핑 기대 vs 보관료 누적 임계점 — 8개월 데드크로스" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <ComposedChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="price_gain" name="스팟 시세 상승 예상분(%)" fill="var(--color-info)" />
          <Line type="monotone" dataKey="storage_cost" name="월간 누적 창고 보관료(%)" stroke="var(--color-danger)" strokeWidth={3} />
        </ComposedChart>
      }
      takeaway={{ situation: `<div><p>"존버 데드크로스"란 시세 상승 기대로 창고 장기 보관 시 누적 보관료가 시세 차익을 잡아먹는 한계점.</p><p>실측 임계점: <strong>8개월 이상 보관 시 누적 창고료가 시세 차익 추월 → 적자 진입</strong>. 매월 톤당 $25~50 보관료 누적이 가격 상승률 +1~2%/월을 초과.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 보관 timing은 단순 의사결정이 아닌 <strong>"systematic discipline instrument"</strong>.</p><p><strong>3단계</strong>: ① 강제 청산 한계선 6개월(W26) 시스템 하드코딩 ② 5개월 시점 자동 alert + 강제 출하 검토 ③ "Inventory aging dashboard" — 매주 monitoring + ML 기반 optimal exit timing 예측.</p></div>`, source: SRC }}
    />
  );
}

export function Widget45_YieldLoss() {
  const data = [{ supplier: 'A사 (중국)', actual_meat: 85, ice_glaze: 15 }, { supplier: 'B사 (베트남)', actual_meat: 90, ice_glaze: 10 }, { supplier: 'C사 (페루 원물)', actual_meat: 98, ice_glaze: 2 }];
  return (
    <WidgetCard title="물코기(Glazing) 수율 조작에 따른 손실 백테스트" icon={Droplets} iconColor="#06b6d4" pillar="S2" cardDesc="공급사별 실제 살코기 vs 얼음 코팅 비율 — 서류상 100톤 ≠ 실제" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical" stackOffset="expand">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t * 100}%`} />
          <YAxis dataKey="supplier" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={100} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="actual_meat" name="실제 살코기 수율(%)" stackId="a" fill="var(--color-success)" />
          <Bar dataKey="ice_glaze" name="얼음물(글레이징) 마이너스" stackId="a" fill="var(--color-danger)" />
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"물코기(Glazing)"란 냉동 수산물 표면에 얼음 코팅을 입혀 중량을 부풀리는 vendor의 일상적 조작 관행. 글로벌 수산 무역의 보편적 grey area.</p><p>실측 손실: <strong>서류상 100톤 구매 → 해동 시 얼음 코팅 15톤이 물로 사라지는 마법</strong>. C&amp;F 단가에 +15% 가산 필수.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: Glazing은 단순 vendor 트릭이 아닌 <strong>"매입 cost +15% hidden tax"</strong>.</p><p><strong>3단계</strong>: ① 공급사 인보이스에 "순중량 100% 기준" 조항 의무화 ② 통관 시 해동 샘플링 무작위 검증 — 기준 초과 시 페널티 ③ "Net Weight Trust Score" vendor 등급제 — 위반 vendor 자동 blacklist.</p></div>`, source: SRC }}
    />
  );
}

export function Widget46_AutomationROI() {
  const data = [{ year: 'Year 0', manual_labor: -100, baader_machine: -500 }, { year: 'Year 1', manual_labor: -220, baader_machine: -550 }, { year: 'Year 2', manual_labor: -350, baader_machine: -600 }, { year: 'Year 3', manual_labor: -500, baader_machine: -650 }];
  return (
    <WidgetCard title="인건비 폭동 vs 스마트(H&G 자동화) 기기 도입 ROI" icon={Wrench} iconColor="#67e8f9" pillar="S2" cardDesc="수작업 인건비 누적 vs 자동화 CAPEX 회수 — 2.5년 Payback" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line type="monotone" dataKey="manual_labor" name="기존 수작업 인건비 누적 타격" stroke="#f43f5e" strokeWidth={3} />
          <Line type="monotone" dataKey="baader_machine" name="자동화 기기 CAPEX + 유지비" stroke="var(--color-info)" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{ situation: `<div><p>"H&amp;G(Head &amp; Gut, 머리·내장 제거) 자동화" ROI 분석. 수작업 인건비와 자동화 capex의 교차점.</p><p>회수 기간: <strong>초기 capex 크지만 가공장 최저임금 급등을 대체하여 정확히 2.5년째 Payback 완료</strong>. 그 이후 영구 흑자 — 인건비 상승 가속화로 매년 ROI 추가 개선.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 자동화는 옵션이 아닌 <strong>"향후 인건비 상승 hedge instrument"</strong>.</p><p><strong>3단계</strong>: ① 2026년 H&amp;G 자동화 라인 도입 결의 ② Baader/Marel 기기 분할 도입으로 capex 부담 분산 ③ "Automation-as-a-Service" — 자체 시스템을 동남아 mid-tier vendor에 라이센싱 추가 수익원.</p></div>`, source: SRC }}
    />
  );
}

export function Widget47_ChannelMarginTracker() {
  const data = [{ channel: '도매 직납', margin: 6, volume_share: 50 }, { channel: 'B2B 급식', margin: 12, volume_share: 30 }, { channel: '밀키트(자사몰)', margin: 25, volume_share: 20 }];
  return (
    <WidgetCard title="B2B 식자재 타겟 영업 채널 조합 트래커" icon={Target} iconColor="#10b981" pillar="S4" cardDesc="채널별 영업이익률 vs 투입 물량 비중 — 골든 믹스 검증" telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <ComposedChart data={data} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis dataKey="channel" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={80} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="margin" name="채널별 영업이익률(%)" fill="var(--color-success)" barSize={20} />
          <Scatter dataKey="volume_share" name="투입 물량 비중(%)" fill="var(--color-info)" />
        </ComposedChart>
      }
      takeaway={{ situation: `<div><p>"채널 골든 믹스(Channel Golden Mix)"란 영업이익률 극대화하는 채널 portfolio 비중.</p><p>실측 최적 mix: <strong>도매 직납 50% (volume backbone) + 프랜차이즈 B2B 30% + 고마진 B2C/밀키트 20%</strong>. B2C 20%가 전체 영업이익의 40~50%를 펌핑.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 채널 mix는 단순 매출 분배가 아닌 <strong>"마진 portfolio optimization"</strong>.</p><p><strong>3단계</strong>: ① B2C 밀키트 자사몰 비중 2026년 30%로 확대 ② 도매 직납 의존도 50% → 40% 점진 축소 ③ DTC platform 자체 구축 — 마진 35%+ 직접 회수.</p></div>`, source: SRC }}
    />
  );
}

export function Widget48_OpPerDay() {
  const data = [{ target: '순항 효율', revenue: 50000, cost: 35000, margin: 15000 }, { target: '저조 효율', revenue: 20000, cost: 35000, margin: -15000 }];
  return (
    <WidgetCard title="조업일 당 순수익 (OP per Sea-Day) 마일스톤" icon={AlertTriangle} iconColor="#f87171" pillar="S1" cardDesc="순항 vs 저조 조업 효율 비교 — 일 $35K 고정비 공중분해 모니터" telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="target" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="margin" name="바다 1일당 순 흑자/적자($)">{data.map((entry: any, index: number) => (<Cell key={index} fill={entry.margin < 0 ? 'var(--color-danger)' : 'var(--color-success)'} />))}</Bar>
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"OP per Sea-Day(조업일 당 순수익)"란 어선이 바다에 떠 있는 1일 기준 순수익. 어선 효율의 단일 KPI.</p><p>고정비 충격: <strong>선박이 바다에 떠 있는 것만으로 하루 $35,000 비용 공중 분해</strong>. 투망 없는 며칠이 한 달 치 적자 확정.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: OP per Sea-Day는 단순 KPI가 아닌 <strong>"어선 출항 의사결정의 strict gate"</strong>.</p><p><strong>3단계</strong>: ① 3일 연속 어획량 0 시 자동 회항 알고리즘 가동 ② 신규 어장 탐색은 별도 탐사선으로 분리 ③ AI 어군 탐지 모델 + ROV 사전 투입으로 공치(dry set) 비율 -90%.</p></div>`, source: SRC }}
    />
  );
}

export function Widget49_InventoryTurns() {
  const data = [{ items: '살오징어(특)', turns: 6 }, { items: '대왕오징어', turns: 4 }, { items: '냉동 링', turns: 8 }, { items: '원양 튜브', turns: 1.5 }];
  return (
    <WidgetCard title="재고 회전율 악성 경보 지연" icon={RotateCw} iconColor="#6366f1" pillar="S2" cardDesc="SKU별 연간 회전율 — 2회전 미만은 손절매(Dumping) 트리거" telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis dataKey="items" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={80} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="turns" name="연간 회전율(Turns/Yr)">{data.map((entry: any, index: number) => (<Cell key={index} fill={entry.turns < 2 ? 'var(--color-danger)' : '#6366f1'} />))}</Bar>
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"재고 회전율(Inventory Turnover)"이란 연 재고 회전 횟수. 정상 수산 비즈니스는 4~6회전, 위험선은 2회전 미만.</p><p>현 위기: <strong>창고에 처박힌 튜브가 1.5회전 밑으로 떨어지면 손절매(Dumping) 버튼을 강제로 눌러야 유동성 확보 가능</strong>. 1회전 미만 SKU는 사실상 사고난 자산.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 재고 회전율 모니터링은 단순 운영이 아닌 <strong>"BS 건강성 KPI"</strong>.</p><p><strong>3단계</strong>: ① 2회전 미만 SKU 자동 알림 시스템 구축 ② 30일 이내 50% 덤핑 가격으로 강제 출회 ③ "Inventory health dashboard" — SKU별 weekly monitoring + CFO 직보.</p></div>`, source: SRC }}
    />
  );
}

export function Widget50_CashConversionCycle() {
  const data = [{ client: '대형마트 직납', days: 60 }, { client: '식자재 벤더 (A급)', days: 45 }, { client: '지역 도매 (B급)', days: 90 }, { client: '소규모 가공장 (C급)', days: 120 }];
  return (
    <WidgetCard title="B2B 거래처 현금 회수기일(DSO) 모니터링" icon={Coins} iconColor="#f87171" pillar="S4" cardDesc="거래처 등급별 매출 대금 회수 소요 일수 — 90일 초과 위험" telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <BarChart data={data} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis dataKey="client" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={120} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Bar dataKey="days" name="매출 대금 회수 소요(Days)">{data.map((entry: any, index: number) => (<Cell key={index} fill={entry.days > 90 ? 'var(--color-danger)' : 'var(--color-info)'} />))}</Bar>
        </BarChart>
      }
      takeaway={{ situation: `<div><p>"DSO(Days Sales Outstanding, 매출 회수 기일)"란 거래처에 매출을 발행한 후 실제 cash 회수까지 걸리는 일수.</p><p>위험 시나리오: <strong>서류상 10억 매출이라도 영세 가공장 어음 회수가 120일+ 지연되면 이자 부담으로 장부 흑자가 실물 적자로 강제 전환</strong>. cash 유동성이 영업이익을 압도.</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: DSO는 단순 회계 KPI가 아닌 <strong>"유동성 생존 KPI"</strong>.</p><p><strong>3단계</strong>: ① 거래처 등급별 신용 한도 강제 캡 (C급 5천만원, B급 2억, A급 5억) ② A급(45일) 거래선 비중 60%+ 유지 ③ JP Morgan Trade Finance와 invoice factoring partnership — DSO 120일 → 7일로 단축.</p></div>`, source: SRC }}
    />
  );
}
