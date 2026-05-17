import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';

const glassContainerStyle = {
  background: 'rgba(0, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
  padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '16px', height: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative' as const
};

// 41. 유류비 BEP 감지기
export function Widget41_FuelBEP() {
  const data = [
    { year: '2021', wti: 60, break_even_catch: 100 },
    { year: '2022', wti: 110, break_even_catch: 160 },
    { year: '2023', wti: 80, break_even_catch: 125 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>41. 선단 운영 유류비 손익분기점(BEP) 임계선 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Line yAxisId="left" type="step" dataKey="break_even_catch" name="필요 최소 어획량(BEP 톤)" stroke="var(--color-danger)" strokeWidth={3} strokeDasharray="5 5" />
            <Bar yAxisId="right" dataKey="wti" name="WTI 유가" fill="#64748b" fillOpacity={0.6} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[출항 포기선]</strong> 배럴당 $110 돌파 시, 하루 160톤 이상 잡지 못하면 출항할수록 손실이 누적되는 적자(Negative Margin) 발생.
      </div>
    </div>
  );
}

// 42. 중간 벤더 연쇄 붕괴 (직거래 이행)
export function Widget42_MiddlemenCollapse() {
  const data = [
    { year: '2015', middlemen_margin: 25, direct_sourcing: 5 },
    { year: '2019', middlemen_margin: 18, direct_sourcing: 15 },
    { year: '2023', middlemen_margin: 8, direct_sourcing: 40 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>42. 중간 도매상(Middlemen) 마진 붕괴 궤적 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t}%`} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Line type="monotone" dataKey="middlemen_margin" name="중도매인 장악 마진 파이(%)" stroke="var(--color-warning)" strokeWidth={3} />
            <Line type="monotone" dataKey="direct_sourcing" name="프랜차이즈 직수입 비율(%)" stroke="var(--color-info)" strokeWidth={3} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[브로커의 종말]</strong> 다단계 하청을 거치던 원물 유통 구조가 붕괴되고, 대형 프랜차이즈가 수입사와 다이렉트로 조인하며 거품이 70% 증발.
      </div>
    </div>
  );
}

// 43. 밸류체인 Waterfall 마진
export function Widget43_WaterfallMargin() {
  const data = [
    { step: '선사(조업)', value: 30, pv: 30 },
    { step: '수입상', value: 15, pv: 45 },
    { step: '가공장', value: 25, pv: 70 },
    { step: '소매마트', value: 30, pv: 100 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>43. 밸류체인 스텝별 폭포수(Waterfall) 마진 분배 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} domain={[0, 100]} />
            <YAxis dataKey="step" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={80} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="value" name="해당 단계 마진 폭(%)" fill="var(--color-success)" />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[피도 눈물도 없는 파이]</strong> 바다에서 잡는 사람(30%)과 마트 진열장(30%)이 동일한 마진을 가져가며, 가공장(25%)이 칼질 한번에 수입상(15%)보다 많이 챙기는 구조.
      </div>
    </div>
  );
}

// 44. 보관료 데드크로스
export function Widget44_StorageDeadcross() {
  const data = [
    { month: '1개월', price_gain: 5, storage_cost: -2 },
    { month: '3개월', price_gain: 15, storage_cost: -7 },
    { month: '6개월', price_gain: 20, storage_cost: -18 },
    { month: '10개월', price_gain: 22, storage_cost: -30 }, // Deadcross
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>44. 존버 실패: 보관료 누적 vs 시세 차익 데드크로스 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="price_gain" name="스팟 시세 상승 예상분(%)" fill="var(--color-info)" />
            <Line type="monotone" dataKey="storage_cost" name="월간 누적 창고 보관료(%)" stroke="var(--color-danger)" strokeWidth={3} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[창고 이자의 덫]</strong> 시세 펌핑을 노리고 8개월 이상 "존버"할 경우, 누적 창고료 패널티가 시세 차익을 잡아먹고 적자로 진입하는 한계점 입증.
      </div>
    </div>
  );
}

// 45. 원료 수율 하락 백테스트
export function Widget45_YieldLoss() {
  const data = [
    { supplier: 'A사 (중국)', invoice_weight: 100, actual_meat: 85, ice_glaze: 15 },
    { supplier: 'B사 (베트남)', invoice_weight: 100, actual_meat: 90, ice_glaze: 10 },
    { supplier: 'C사 (페루 원물)', invoice_weight: 100, actual_meat: 98, ice_glaze: 2 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>45. 물코기(Glazing) 수율 조작에 따른 손실 백테스트 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" stackOffset="expand">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t*100}%`}/>
            <YAxis dataKey="supplier" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={100} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="actual_meat" name="실제 살코기 수율(%)" stackId="a" fill="var(--color-success)" />
            <Bar dataKey="ice_glaze" name="얼음물(글레이징) 마이너스" stackId="a" fill="var(--color-danger)" />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[수분 뻥튀기]</strong> 서류상 100톤을 구매했으나 해동 시 얼음 코팅으로 15톤이 물로 사라지는 마법 발생. C&F 단가에 추가 원가 15% 가산 필수.
      </div>
    </div>
  );
}

// 46. 기계 도입 ROI
export function Widget46_AutomationROI() {
  const data = [
    { year: 'Year 0', manual_labor: -100, baader_machine: -500 },
    { year: 'Year 1', manual_labor: -220, baader_machine: -550 },
    { year: 'Year 2', manual_labor: -350, baader_machine: -600 },
    { year: 'Year 3', manual_labor: -500, baader_machine: -650 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>46. 인건비 폭동 vs 스마트(H&G 자동화) 기기 도입 ROI </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Line type="monotone" dataKey="manual_labor" name="기존 수작업 인건비 누적 타격" stroke="#f43f5e" strokeWidth={3} />
            <Line type="monotone" dataKey="baader_machine" name="자동화 기기 CAPEX + 유지비" stroke="var(--color-info)" strokeWidth={3} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[원금 회수]</strong> 기계 도입 시 초기 CAPEX는 크나, 매년 급등하는 가공장 최저임금을 대체하여 정확히 2.5년째에 크로스(Payback) 완료.
      </div>
    </div>
  );
}

// 47. 채널 믹스 마진
export function Widget47_ChannelMarginTracker() {
  const data = [
    { channel: '도매 직납', margin: 6, volume_share: 50 },
    { channel: 'B2B 급식', margin: 12, volume_share: 30 },
    { channel: '밀키트(자사몰)', margin: 25, volume_share: 20 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>47. B2B 식자재 타겟 영업 채널 조합 트래커 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis dataKey="channel" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={80} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="margin" name="채널별 영업이익률(%)" fill="var(--color-success)" barSize={20} />
            <Scatter dataKey="volume_share" name="투입 물량 비중(%)" fill="var(--color-info)" />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[최적 포트폴리오]</strong> 도매 직납으로 물량을 털어내고(50%), 고마진 B2C/밀키트 채널(20%)로 최종 영업이익률을 펌핑하는 골든 믹스 증명.
      </div>
    </div>
  );
}

// 48. 일일 순이익
export function Widget48_OpPerDay() {
  const data = [
    { target: '순항 효율', revenue: 50000, cost: 35000, margin: 15000 },
    { target: '저조 효율', revenue: 20000, cost: 35000, margin: -15000 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>48. 조업일 당 순수익 (OP per Sea-Day) 마일스톤 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="target" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="margin" name="바다 1일당 순 흑자/적자($)">
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.margin < 0 ? 'var(--color-danger)' : 'var(--color-success)'} />
              ))}
            </Bar>
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[공중분해 주의]</strong> 선박이 바다에 떠있는 것만으로 하루 $35,000의 비용이 공중 분해됨. 투망 없는 며칠이 한달 치 적자를 확정.
      </div>
    </div>
  );
}

// 49. 재고 회전률
export function Widget49_InventoryTurns() {
  const data = [
    { quarter: '1Q', items: '살오징어(특)', turns: 6 },
    { quarter: '2Q', items: '대왕오징어', turns: 4 },
    { quarter: '3Q', items: '냉동 링', turns: 8 },
    { quarter: '4Q', items: '원양 튜브', turns: 1.5 }, // Problem
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>49. 재고 회전율 악성 경보 지연 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis dataKey="items" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={80}/>
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="turns" name="연간 회전율(Turns/Yr)">
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.turns < 2 ? 'var(--color-danger)' : '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[블라인드 리스크]</strong> 창고에 처박힌 튜브가 1.5회전 밑으로 떨어지면 손절매(Dumping) 버튼을 강제로 눌러 유동성을 확보해야만 흑자도산을 막음.
      </div>
    </div>
  );
}

// 50. 현금 흐름 회수 주기
export function Widget50_CashConversionCycle() {
  const data = [
    { client: '대형마트 직납', days: 60, risk: 'Low' },
    { client: '식자재 벤더 (A급)', days: 45, risk: 'Low' },
    { client: '지역 도매 (B급)', days: 90, risk: 'Medium' },
    { client: '소규모 가공장 (C급)', days: 120, risk: 'High' },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>50. B2B 거래처 현금 회수기일(DSO) 모니터링 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis dataKey="client" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={120} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="days" name="매출 대금 회수 소요(Days)">
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.days > 90 ? 'var(--color-danger)' : 'var(--color-info)'} />
              ))}
            </Bar>
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[피의 유동성]</strong> 서류상 10억을 팔아도 영세 가공장 어음 회수가 120일 넘게 지연되면, 이자 부담에 의해 장부상 흑자가 실물 적자로 강제 전환.
      </div>
    </div>
  );
}
