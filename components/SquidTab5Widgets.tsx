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
    <WidgetCard title="선단 운영 유류비 손익분기점(BEP) 임계선" icon={Fuel} iconColor="#f43f5e" pillar="S1" cardDesc="WTI 유가 변동과 일일 BEP 어획량 — 출항 포기선 모니터 (자체추정·illustrative)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
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
      takeaway={{ situation: `<div><p>"유류비 BEP(Break-Even Point)"는 어선 출항 시 흑자가 되는 최소 일일 어획량. 유가 변동에 따라 동적으로 변한다.</p><p>업계 추정: <strong>WTI 배럴당 $110 수준 도달 시 일 160톤 이상 어획하지 못하면 출항할수록 손실이 누적될 수 있다</strong>. 유가 고공 구간에서 어선 고정비 압박이 가중된다. (자체추정 — 실제 운영 데이터로 검증 필요)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 유가 BEP는 단순 운영비(OPEX)가 아닌 <strong>"어선 출항 자체의 경제적 타당성 판정선"</strong>.</p><p><strong>3단계</strong>: ① WTI $90 돌파 자동 출항 자제 알고리즘 ② LNG·하이브리드 전환선 신조 투자 (IMO 2030 대비) ③ 유가 연동 항차 의사결정 자동화.</p></div>`, source: SRC }}
    />
  );
}

export function Widget42_MiddlemenCollapse() {
  const data = [{ year: '2015', middlemen_margin: 25, direct_sourcing: 5 }, { year: '2019', middlemen_margin: 18, direct_sourcing: 15 }, { year: '2023', middlemen_margin: 8, direct_sourcing: 40 }];
  return (
    <WidgetCard title="중간 도매상(Middlemen) 마진 붕괴 궤적" icon={Users} iconColor="#fcd34d" pillar="S4" cardDesc="중도매인 vs 프랜차이즈 직수입 비율 변화 추정 (자체추정·illustrative)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
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
      takeaway={{ situation: `<div><p>"중간 도매상(Middlemen) 마진 붕괴"란 다단계 하청 원물 유통이 사라지고 직거래로 전환되는 구조 변화. 아래 수치는 업계 추정치다.</p><p>업계 추정: <strong>대형 프랜차이즈(BBQ·BHC·맘스터치·SPC) 일부가 수입사와 직거래를 확대하면서 중도매인 마진 비중이 감소 추세</strong>. 다단계 도매 단계 축소가 관찰된다. (자체추정 — 공식 통계로 검증 필요)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 중도매 마진 축소 추세는 위협이 아닌 <strong>"직거래 라인 확대의 기회 구간"</strong>.</p><p><strong>3단계</strong>: ① 신라교역 → 대형 프랜차이즈 직거래 라인 확대 ② 도매시장 의존도 점진 축소 ③ 주요 프랜차이즈와 중장기 공급 계약 추진.</p></div>`, source: SRC }}
    />
  );
}

export function Widget43_WaterfallMargin() {
  const data = [{ step: '선사(조업)', value: 30 }, { step: '수입상', value: 15 }, { step: '가공장', value: 25 }, { step: '소매마트', value: 30 }];
  return (
    <WidgetCard title="밸류체인 스텝별 폭포수(Waterfall) 마진 분배" icon={BarChart3} iconColor="#10b981" pillar="S4" cardDesc="조업-수입-가공-소매 4단계 마진 분배 추정 (자체추정·illustrative — 실측 검증 필요)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
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
      takeaway={{ situation: `<div><p>"폭포수(Waterfall) 마진 분배"란 가치사슬 단계별 누가 얼마를 가져가는지의 추정 분석. 아래 수치는 illustrative 합성치이며 실측과 다를 수 있다.</p><p>업계 추정: <strong>조업 약 30% · 수입 약 15% · 가공 약 25% · 소매 약 30%</strong>. 가공 단계가 수입 단계보다 마진 비중이 높을 수 있어 수직 통합의 유인이 존재한다. (자체추정 — 실측 데이터로 검증 필요)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 수입상 마진 구간 단독으로는 포지셔닝이 취약. <strong>"가공·소매 인접 영역 수직 통합"</strong>이 마진 개선 경로.</p><p><strong>3단계</strong>: ① 가공 라인 투자 — 가공 마진 구간 직접 진입 ② 자체 B2C 채널 구축 — 소매 마진 흡수 ③ 수입+가공+B2C 통합 플랫폼으로 단계적 확장.</p></div>`, source: SRC }}
    />
  );
}

export function Widget44_StorageDeadcross() {
  const data = [{ month: '1개월', price_gain: 5, storage_cost: -2 }, { month: '3개월', price_gain: 15, storage_cost: -7 }, { month: '6개월', price_gain: 20, storage_cost: -18 }, { month: '10개월', price_gain: 22, storage_cost: -30 }];
  return (
    <WidgetCard title="장기보관 한계: 보관료 누적 vs 시세 차익 데드크로스" icon={Snowflake} iconColor="#f87171" pillar="S3" cardDesc="시세 상승 기대 vs 보관료 누적 임계점 추정 (자체추정·illustrative)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
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
      takeaway={{ situation: `<div><p>장기 보관 데드크로스란 시세 상승 기대로 창고에 장기 보관할 때 누적 보관료가 시세 차익을 잠식하는 임계점. 아래 수치는 illustrative 추정치다.</p><p>업계 추정: <strong>보관 기간이 길어질수록(추정 8개월 전후) 누적 창고료가 시세 차익을 초과할 가능성이 높아진다</strong>. 매월 보관료 누적과 가격 상승률 격차를 정기 모니터링해야 한다. (자체추정 — 실제 창고료·시세 데이터로 검증 필요)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 보관 타이밍은 단순 의사결정이 아닌 <strong>"보관료 vs 시세 차익 손익 규율 체계"</strong>.</p><p><strong>3단계</strong>: ① 보관 한계 기간 기준선 시스템 설정 ② 임계 시점 자동 알림 + 출하 검토 ③ 재고 노령화 대시보드 — 주간 모니터링.</p></div>`, source: SRC }}
    />
  );
}

export function Widget45_YieldLoss() {
  const data = [{ supplier: 'A사 (중국)', actual_meat: 85, ice_glaze: 15 }, { supplier: 'B사 (베트남)', actual_meat: 90, ice_glaze: 10 }, { supplier: 'C사 (페루 원물)', actual_meat: 98, ice_glaze: 2 }];
  return (
    <WidgetCard title="물코기(Glazing) 수율 조작에 따른 손실 추정" icon={Droplets} iconColor="#06b6d4" pillar="S2" cardDesc="공급사 유형별 살코기 vs 얼음 코팅 비율 추정 (자체추정·illustrative — 실측 검증 필요)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
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
      takeaway={{ situation: `<div><p>"물코기(Glazing)"란 냉동 수산물 표면에 얼음 코팅을 입혀 중량을 부풀리는 관행. 글로벌 수산 무역에서 광범위하게 발생하는 구조적 문제다.</p><p>업계 추정: <strong>공급사에 따라 해동 후 실제 살코기 비율이 계약 중량 대비 10~15% 이상 낮을 수 있다</strong>. 원산지·공급사별 실제 수율 차이가 매입 단가 경쟁력에 직접 영향을 준다. (자체추정 — 통관 샘플링 데이터로 검증 권장)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 글레이징은 단순 공급사 트릭이 아닌 <strong>"매입 원가에 숨겨진 수율 손실 리스크"</strong>.</p><p><strong>3단계</strong>: ① 공급사 인보이스에 순중량 기준 조항 의무화 ② 통관 시 해동 샘플링 무작위 검증 — 기준 초과 시 페널티 ③ 공급사 수율 신뢰도 등급제 구축.</p></div>`, source: SRC }}
    />
  );
}

export function Widget46_AutomationROI() {
  const data = [{ year: 'Year 0', manual_labor: -100, baader_machine: -500 }, { year: 'Year 1', manual_labor: -220, baader_machine: -550 }, { year: 'Year 2', manual_labor: -350, baader_machine: -600 }, { year: 'Year 3', manual_labor: -500, baader_machine: -650 }];
  return (
    <WidgetCard title="인건비 폭동 vs 스마트(H&G 자동화) 기기 도입 ROI" icon={Wrench} iconColor="#67e8f9" pillar="S2" cardDesc="수작업 인건비 누적 vs 자동화 설비 투자비 회수 추정 (자체추정·illustrative)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
      chart={
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
          <Line type="monotone" dataKey="manual_labor" name="기존 수작업 인건비 누적 타격" stroke="#f43f5e" strokeWidth={3} />
          <Line type="monotone" dataKey="baader_machine" name="자동화 기기 설비투자비 + 유지비" stroke="var(--color-info)" strokeWidth={3} />
        </LineChart>
      }
      takeaway={{ situation: `<div><p>"H&amp;G(Head &amp; Gut, 머리·내장 제거) 자동화" ROI 추정 분석. 수작업 인건비 누적과 자동화 설비투자비의 교차점을 시뮬레이션한 illustrative 수치다.</p><p>업계 추정: <strong>초기 설비투자비가 크나 가공장 인건비 상승 추세를 대체할 경우 약 2~3년 내 투자비 회수가 가능한 것으로 추정된다</strong>. 인건비 상승 속도에 따라 회수 기간은 단축될 수 있다. (자체추정 — 실제 운영비 구조로 검증 필요)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 자동화는 옵션이 아닌 <strong>"인건비 상승 리스크 헤지 수단"</strong>.</p><p><strong>3단계</strong>: ① H&amp;G 자동화 라인 도입 검토 착수 ② Baader/Marel 기기 분할 도입으로 초기 투자비 부담 분산 ③ 자체 자동화 역량의 외부 라이선싱 수익원 탐색.</p></div>`, source: SRC }}
    />
  );
}

export function Widget47_ChannelMarginTracker() {
  const data = [{ channel: '도매 직납', margin: 6, volume_share: 50 }, { channel: 'B2B 급식', margin: 12, volume_share: 30 }, { channel: '밀키트(자사몰)', margin: 25, volume_share: 20 }];
  return (
    <WidgetCard title="B2B 식자재 타겟 영업 채널 조합 트래커" icon={Target} iconColor="#10b981" pillar="S4" cardDesc="채널별 영업이익률 vs 투입 물량 비중 추정 (자체추정·illustrative)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
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
      takeaway={{ situation: `<div><p>"채널 믹스 최적화"란 영업이익률을 극대화하는 채널 포트폴리오 비중 탐색. 아래 수치는 illustrative 추정치다.</p><p>업계 추정: <strong>도매 직납은 물량 기반 주축 채널이지만 마진율이 낮고, B2C/밀키트 채널은 물량 비중이 작아도 전체 이익 기여도가 상대적으로 높을 수 있다</strong>. 채널별 실제 마진 구조 측정이 선행되어야 한다. (자체추정 — 실측 채널별 손익 데이터 필요)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 채널 믹스는 단순 매출 분배가 아닌 <strong>"마진 포트폴리오 최적화"</strong>.</p><p><strong>3단계</strong>: ① B2C 밀키트·자사몰 비중 단계적 확대 ② 도매 직납 의존도 점진 축소 ③ 직접 판매 채널 구축으로 마진 회수율 제고.</p></div>`, source: SRC }}
    />
  );
}

export function Widget48_OpPerDay() {
  const data = [{ target: '순항 효율', revenue: 50000, cost: 35000, margin: 15000 }, { target: '저조 효율', revenue: 20000, cost: 35000, margin: -15000 }];
  return (
    <WidgetCard title="조업일 당 순수익 (OP per Sea-Day) 마일스톤" icon={AlertTriangle} iconColor="#f87171" pillar="S1" cardDesc="순항 vs 저조 조업 효율 비교 추정 (자체추정·illustrative)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
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
      takeaway={{ situation: `<div><p>"OP per Sea-Day(조업일 당 순수익)"란 어선이 바다에 떠 있는 1일 기준 순수익. 어선 효율의 핵심 KPI. 아래 수치는 illustrative 추정치다.</p><p>업계 추정: <strong>선박 일일 고정비(연료·선원비·감가상각 등)는 선형 규모에 따라 수만 달러 수준이며, 어획이 없는 날이 지속될 경우 손실이 빠르게 누적된다</strong>. 저조 조업 구간이 장기화되면 항차 채산성에 직접 영향을 준다. (자체추정 — 실제 원가 구조로 검증 필요)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: OP per Sea-Day는 단순 KPI가 아닌 <strong>"어선 출항 의사결정의 경제적 판정 기준"</strong>.</p><p><strong>3단계</strong>: ① 연속 공치 시 자동 회항 기준 설정 ② 신규 어장 탐색은 별도 탐사선으로 분리 ③ 어군 탐지 기술 도입으로 공치 비율 저감.</p></div>`, source: SRC }}
    />
  );
}

export function Widget49_InventoryTurns() {
  const data = [{ items: '살오징어(특)', turns: 6 }, { items: '대왕오징어', turns: 4 }, { items: '냉동 링', turns: 8 }, { items: '원양 튜브', turns: 1.5 }];
  return (
    <WidgetCard title="재고 회전율 악성 경보 지연" icon={RotateCw} iconColor="#6366f1" pillar="S2" cardDesc="SKU별 연간 회전율 추정 — 2회전 미만은 손절매 검토 기준 (자체추정)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
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
      takeaway={{ situation: `<div><p>"재고 회전율(Inventory Turnover)"이란 연 재고 회전 횟수. 수산물 냉동 재고의 경우 4~6회전이 일반적이며, 2회전 미만은 유동성 리스크 경계선으로 본다.</p><p>업계 추정: <strong>원양 튜브 등 일부 SKU는 회전율이 낮아질 경우 창고료 누적과 품질 저하 리스크가 동시에 발생할 수 있다</strong>. 2회전 미만 SKU는 손절매 여부를 적극 검토해야 한다. (자체추정 — 실제 재고 데이터로 검증 필요)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: 재고 회전율 모니터링은 단순 운영이 아닌 <strong>"재무 건전성 KPI"</strong>.</p><p><strong>3단계</strong>: ① 2회전 미만 SKU 자동 알림 시스템 구축 ② 임계 기간 초과 시 손절매 가격 출회 검토 ③ SKU별 주간 모니터링 + 경영진 직보 체계.</p></div>`, source: SRC }}
    />
  );
}

export function Widget50_CashConversionCycle() {
  const data = [{ client: '대형마트 직납', days: 60 }, { client: '식자재 벤더 (A급)', days: 45 }, { client: '지역 도매 (B급)', days: 90 }, { client: '소규모 가공장 (C급)', days: 120 }];
  return (
    <WidgetCard title="B2B 거래처 현금 회수기일(DSO) 모니터링" icon={Coins} iconColor="#f87171" pillar="S4" cardDesc="거래처 등급별 매출 대금 회수 소요 일수 추정 — 90일 초과 위험 (자체추정)" telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }} chartHeight={250}
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
      takeaway={{ situation: `<div><p>"DSO(Days Sales Outstanding, 매출 회수 기일)"란 거래처에 매출을 발행한 후 실제 현금 회수까지 걸리는 일수.</p><p>업계 추정: <strong>거래처 등급이 낮을수록 DSO가 90~120일 이상으로 길어질 수 있으며, 이 경우 이자 부담과 유동성 압박이 실질 영업이익을 잠식할 수 있다</strong>. 장부 흑자와 현금 흐름의 괴리가 경영 리스크로 이어질 수 있다. (자체추정 — 실제 거래처 데이터로 검증 필요)</p></div>`, actionPlan: `<div><p><strong>재정의</strong>: DSO는 단순 회계 KPI가 아닌 <strong>"유동성 건전성 KPI"</strong>.</p><p><strong>3단계</strong>: ① 거래처 등급별 신용 한도 설정 ② 우량 거래처(단기 회수) 비중 확대 ③ 인보이스 팩토링 등 DSO 단축 금융 수단 검토.</p></div>`, source: SRC }}
    />
  );
}
