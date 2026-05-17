import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';

const glassContainerStyle = {
  background: 'rgba(0, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
  padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '16px', height: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative' as const
};

// 31. 수입 단가 스프레드
export function Widget31_PriceSpread() {
  const data = [
    { month: '1월', peru: 2100, argentine: 2500, china: 2800 },
    { month: '3월', peru: 2200, argentine: 2700, china: 2900 },
    { month: '5월', peru: 2500, argentine: 3100, china: 3000 },
    { month: '7월', peru: 2900, argentine: 3000, china: 3200 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>31. 원산지별 C&F 수입 단가 스프레드 수렴 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis domain={['auto', 'auto']} stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Line type="monotone" dataKey="peru" name="페루(훔볼트)" stroke="var(--color-success)" strokeWidth={3} />
            <Line type="monotone" dataKey="argentine" name="아르헨티나(숏핀)" stroke="var(--color-info)" strokeWidth={2} />
            <Line type="monotone" dataKey="china" name="중국(원양)" stroke="var(--color-danger)" strokeWidth={2} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[저가 방어막 붕괴]</strong> 저가의 대명사였던 페루 대왕오징어 단가가 아르헨티나산 숏핀 단가와 갭을 좁히며 맹렬히 수렴 중.
      </div>
    </div>
  );
}

// 32. 슈링크플레이션
export function Widget32_Shrinkflation() {
  const data = [
    { year: '2020', price: 10000, actualWeight: 1000, labelWeight: 1000 },
    { year: '2021', price: 10000, actualWeight: 850, labelWeight: 1000 },
    { year: '2022', price: 10500, actualWeight: 750, labelWeight: 1000 },
    { year: '2023', price: 11000, actualWeight: 600, labelWeight: 1000 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>32. 제품량 삭감(Shrinkflation) 실중량 추적기 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis yAxisId="left" domain={[0, 12000]} stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 1200]} stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar yAxisId="right" dataKey="actualWeight" name="실제 해동 중량(g)" fill="#8b5cf6" fillOpacity={0.7} />
            <Line yAxisId="left" type="step" dataKey="price" name="판매 명목 가격(원)" stroke="#fcd34d" strokeWidth={3} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[기만적 인플레]</strong> 소비자가 인지하는 1팩당 가격은 방어한 듯 보이나, 해동 시 실제 살코기 중량은 3년새 40% 이상 증발.
      </div>
    </div>
  );
}

// 33. 관세 회피 차익거래 다트판
export function Widget33_TariffArbitrage() {
  const data = [
    { route: '남미 직수입', cost: 100, tariff: 20, margin: 10 },
    { route: '중국 가공 우회', cost: 110, tariff: 0, margin: 25 },
    { route: '베트남 우회', cost: 105, tariff: 0, margin: 30 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>33. 글로벌 정책/비관세 우회 가공 무역 차익 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" stackOffset="expand">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t*100}%`}/>
            <YAxis dataKey="route" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={90}/>
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="margin" name="최종 영업 마진율" stackId="a" fill="var(--color-success)" />
            <Bar dataKey="tariff" name="관세 차감분" stackId="a" fill="var(--color-danger)" />
            <Bar dataKey="cost" name="원가 및 운송비" stackId="a" fill="var(--color-info)" fillOpacity={0.5}/>
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[루트 아비트라지]</strong> 남미 물량을 한국으로 직접 반입 시 맞는 관세 폭탄(20%)을 회피하기 위해, 베트남에서 튜브로 가공 후 무관세(FTA) 입항이 절대 공식화.
      </div>
    </div>
  );
}

// 34. 사이즈 프리미엄 역전
export function Widget34_SizePremium() {
  const data = [
    { year: '2020', small: 100, large: 110 },
    { year: '2021', small: 110, large: 130 },
    { year: '2022', small: 130, large: 180 },
    { year: '2023', small: 150, large: 250 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>34. 대형어 vs 소형어 사이즈 프리미엄 스퀴즈 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Line type="monotone" dataKey="large" name="대형 특품 프리미엄" stroke="#f43f5e" strokeWidth={3} />
            <Line type="monotone" dataKey="small" name="소형/일반품 단가" stroke="var(--color-info)" strokeWidth={2} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[희소성의 덫]</strong> 굶주림으로 어체 크기가 소형화되며, 정상 규격의 '대형 특품'은 돈을 주고도 못 구하는 하이엔드 럭셔리 요금제로 진입.
      </div>
    </div>
  );
}

// 35. 환율 헷징 지표
export function Widget35_FXHedging() {
  const data = [
    { month: 'Jan', usd_krw: 1250, profit_margin: 12 },
    { month: 'Mar', usd_krw: 1300, profit_margin: 8 },
    { month: 'Jun', usd_krw: 1360, profit_margin: 2 },
    { month: 'Sep', usd_krw: 1400, profit_margin: -5 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>35. 환율 민감도 연동 원가 헷징 레벨 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis yAxisId="left" domain={[1200, 1450]} stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar yAxisId="right" dataKey="profit_margin" name="영업 흑자/적자(%)">
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.profit_margin < 0 ? 'var(--color-danger)' : 'var(--color-success)'} />
              ))}
            </Bar>
            <Line yAxisId="left" type="monotone" dataKey="usd_krw" name="환율(USD/KRW)" stroke="var(--color-warning)" strokeWidth={3} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[매크로 폭격]</strong> 달러당 1,350원을 돌파하는 순간 C&F 결제 무역사들의 마진 룸이 소멸. 선물환(Forward) 사전 매수 여부가 생사를 가름.
      </div>
    </div>
  );
}

// 36. 부가가치 스프레드
export function Widget36_VASpread() {
  const data = [
    { type: '원물 (Block)', value: 100 },
    { type: '포장 변경', value: 110 },
    { type: '내장/머리 제거 (H&G)', value: 140 },
    { type: '절단 가공 (Ring/Tube)', value: 200 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>36. 가공 단계별 부가가치 전가 스프레드 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="type" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="value" name="판매 가치(Index)" fill="var(--color-info)" radius={[4,4,0,0]} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[Value Add]</strong> 원물을 그대로 파는 마진은 0에 수렴. 먹기 편하게 링(Ring)으로 한번만 써는 순간 단가는 2배로 폭증.
      </div>
    </div>
  );
}

// 37. 유가 연동 프리미엄
export function Widget37_FreightPremium() {
  const data = [
    { year: '2021', wti: 60, freightCost: 15 },
    { year: '2022(전쟁)', wti: 110, freightCost: 45 },
    { year: '2023', wti: 80, freightCost: 25 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>37. WTI 유가 / BDI 연동 해상 물류비 프리미엄 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Line yAxisId="left" type="monotone" dataKey="wti" name="WTI 유가(USD/B)" stroke="#f43f5e" strokeWidth={2} />
            <Line yAxisId="right" type="stepAfter" dataKey="freightCost" name="운임 포함 단가상승분(%)" stroke="#8b5cf6" strokeWidth={3} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[운임 충격]</strong> 글로벌 유가 병목 시, 수입 원가의 최고 45%가 순수 '냉동 컨테이너 물류비'로 지출되는 패널티 발생.
      </div>
    </div>
  );
}

// 38. 훔볼트 원가 점프
export function Widget38_JumboJump() {
  const data = [
    { year: '2019', price_index: 100 },
    { year: '2020', price_index: 110 },
    { year: '2021', price_index: 135 },
    { year: '2022', price_index: 180 },
    { year: '2023', price_index: 250 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>38. 대왕오징어(훔볼트) 원가 퀀텀 점프 가속도 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Area type="monotone" dataKey="price_index" name="페루산 대왕오징어 원가 지수" fill="#ec4899" stroke="#ec4899" fillOpacity={0.4} />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[신분 상승]</strong> 살오징어를 쓰던 모든 프랜차이즈가 대체재로 대왕(훔볼트)을 찾자, 수요 폭발로 인해 4년새 원가가 2.5배 퀀텀 점프.
      </div>
    </div>
  );
}

// 39. 선도 vs 스팟 차익
export function Widget39_ForwardSpot() {
  const data = [
    { period: '시즌 전(선도/Forward)', price: 100 },
    { period: '항해 중(중도매)', price: 120 },
    { period: '상장/하역(Spot)', price: 160 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>39. 사전 선도계약(Forward) vs 스팟 펌핑 스프레드 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="period" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="price" name="계약 체결 단가(Index)" fill="var(--color-info)">
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={index === 2 ? 'var(--color-danger)' : 'var(--color-info)'} />
              ))}
            </Bar>
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[위험의 대상]</strong> 항해 개시 전, 흉어를 예감하고 선도 계약(입도선매)을 체결한 트레이딩 팀은 수입상사 도착 시점 무위험 60% 펌핑 차익 시현.
      </div>
    </div>
  );
}

// 40. 대체 탄력성 회귀 모델
export function Widget40_SubstitutionElasticity() {
  const data = [
    { squid_increase: '+10%', substitute_rate: 15 },
    { squid_increase: '+20%', substitute_rate: 35 },
    { squid_increase: '+30%', substitute_rate: 70 },
    { squid_increase: '+40%', substitute_rate: 95 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>40. 가격 상승폭 대비 레시피 대체 탄력성(Elasticity) </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="squid_increase" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t}%`} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Line type="monotone" dataKey="substitute_rate" name="대왕징어로의 전환 비율(%)" stroke="var(--color-success)" strokeWidth={4} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[대체 폭주선]</strong> 일반 오징어 단가가 30% 상승하는 순간, B2B 식당들이 메뉴판 수정 대신 레시피를 대왕오징어로 70% 교체하는 티핑포인트 도달.
      </div>
    </div>
  );
}
