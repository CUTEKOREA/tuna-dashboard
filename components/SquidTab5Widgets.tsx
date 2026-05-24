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
      takeaway={{ situation: '배럴당 $110 돌파 시 하루 160톤 이상 잡지 못하면 출항할수록 손실 누적 — 적자(Negative Margin) 발생.', actionPlan: '[출항 포기선] 유가 $90 돌파 시 자동 출항 자제 알고리즘 가동 + LNG 전환선 신조 CAPEX 검토.', source: SRC }}
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
      takeaway={{ situation: '다단계 하청 원물 유통 구조 붕괴, 대형 프랜차이즈가 수입사와 다이렉트로 조인 — 거품 70% 증발.', actionPlan: '[브로커의 종말] 신라교역 → 대형 프랜차이즈 직거래 라인을 60% 이상 확대, 도매시장 의존도 30% 이하 통제.', source: SRC }}
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
      takeaway={{ situation: '바다에서 잡는 사람(30%)과 마트 진열장(30%)이 동일 마진. 가공장(25%)이 칼질 한번에 수입상(15%)보다 많이 챙기는 구조.', actionPlan: '[피도 눈물도 없는 파이] 수입상 마진 15% 영역을 가공·소매 인접 영역으로 확장(수직 통합) 추진.', source: SRC }}
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
      takeaway={{ situation: '8개월 이상 \'존버\' 시 누적 창고료 패널티가 시세 차익을 잡아먹고 적자 진입하는 한계점 입증.', actionPlan: '[창고 이자의 덫] 강제 청산 한계선 6개월(W26)로 시스템 하드코딩하여 악성 재고 누적 봉쇄.', source: SRC }}
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
      takeaway={{ situation: '서류상 100톤 구매했으나 해동 시 얼음 코팅으로 15톤이 물로 사라지는 마법 — C&F 단가에 15% 가산 필수.', actionPlan: '[수분 뻥튀기] 공급사 인보이스에 \'순중량 100% 기준\' 조항 의무화 + 통관 시 해동 샘플링 무작위 검증.', source: SRC }}
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
      takeaway={{ situation: '기계 도입 초기 CAPEX는 크나, 매년 급등하는 가공장 최저임금을 대체하여 정확히 2.5년째 크로스(Payback) 완료.', actionPlan: '[원금 회수] 2026년 H&G 자동화 라인 도입 결의 — Baader 기기 분할 도입으로 CAPEX 부담 분산.', source: SRC }}
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
      takeaway={{ situation: '도매 직납으로 물량을 털어내고(50%), 고마진 B2C/밀키트 채널(20%)로 최종 영업이익률을 펌핑하는 골든 믹스 증명.', actionPlan: '[최적 포트폴리오] B2C 밀키트 자사몰 비중을 2026년 30%로 확대, 도매 직납 의존도 50% → 40%로 점진 축소.', source: SRC }}
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
      takeaway={{ situation: '선박이 바다에 떠 있는 것만으로 하루 $35,000 비용 공중 분해 — 투망 없는 며칠이 한달 치 적자를 확정.', actionPlan: '[공중분해 주의] 3일 연속 어획량 0 시 자동 회항 알고리즘 가동, 신규 어장 탐색은 별도 탐사선으로 분리.', source: SRC }}
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
      takeaway={{ situation: '창고에 처박힌 튜브가 1.5회전 밑으로 떨어지면 손절매(Dumping) 버튼을 강제로 눌러 유동성 확보 필요.', actionPlan: '[블라인드 리스크] 2회전 미만 SKU 자동 알림 시스템 구축 + 30일 이내 50% 덤핑 가격으로 강제 출회.', source: SRC }}
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
      takeaway={{ situation: '서류상 10억을 팔아도 영세 가공장 어음 회수가 120일 넘게 지연되면, 이자 부담에 의해 장부상 흑자가 실물 적자로 강제 전환.', actionPlan: '[피의 유동성] C급 거래처 신용 한도 5천만원으로 강제 캡 설정, A급(45일) 거래선 비중을 60% 이상으로 끌어올림.', source: SRC }}
    />
  );
}
