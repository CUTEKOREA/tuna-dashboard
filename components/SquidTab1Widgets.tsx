import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';

const glassContainerStyle = {
  background: 'rgba(0, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
  padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '16px', height: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative' as const
};

// 1. 글로벌 기후-어획량 상관관계 레이더
export function Widget01_ClimateYieldRadar() {
  const data = [
    { year: '2016', enso: 2.6, catch: 65, status: 'Super El Nino' },
    { year: '2017', enso: -0.5, catch: 90, status: 'Normal' },
    { year: '2018', enso: 0.9, catch: 85, status: 'El Nino' },
    { year: '2019', enso: 0.5, catch: 88, status: 'Normal' },
    { year: '2020', enso: -1.3, catch: 110, status: 'La Nina (Boom)' },
    { year: '2021', enso: -1.0, catch: 105, status: 'La Nina' },
    { year: '2022', enso: -0.9, catch: 108, status: 'La Nina' },
    { year: '2023', enso: 2.0, catch: 55, status: 'Super El Nino' },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>1. 기후-어획량 상관관계 (NOAA ENSO vs Catch) </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: KOSIS 연근해어업 및 캐나다 수산국. 1990년 대구 사태와 현재 살오징어 추락 궤적 비교
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis yAxisId="left" stroke="var(--color-danger)" fontSize={11} />
            <YAxis yAxisId="right" orientation="right" stroke="#67e8f9" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
            <Bar yAxisId="left" dataKey="catch" name="어획량(Index)" fill="var(--color-danger)" fillOpacity={0.6} />
            <Line yAxisId="right" type="monotone" dataKey="enso" name="ENSO(수온편차)" stroke="#67e8f9" strokeWidth={3} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[상관성 경보]</strong> 수온 1도 상승 시 페루 연안 어획량은 평균 35% 즉각 증발. 2023 대규모 엘니뇨 타격 입증.
      </div>
    </div>
  );
}

// 2. 자원 붕괴 카운트다운 오버레이
export function Widget02_CollapseCountdown() {
  const data = [
    { year: 'T-10', cod: 100, squid: 100 },
    { year: 'T-8', cod: 95, squid: 85 },
    { year: 'T-6', cod: 80, squid: 65 },
    { year: 'T-4', cod: 50, squid: 45 },
    { year: 'T-2', cod: 20, squid: 25 },
    { year: 'T-0', cod: 1, squid: null }, // Collapse
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>2. 자원 붕괴 카운트다운 오버레이 </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: NASA 글로벌 SST. 주요 조업 구역 수온 비정상 상승 추적
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
            <Line type="monotone" dataKey="cod" name="'90 캐나다 대구 추락" stroke="#64748b" strokeDasharray="5 5" strokeWidth={2} />
            <Line type="monotone" dataKey="squid" name="현재 한국 살오징어" stroke="#f87171" strokeWidth={3} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[자원 마지노선]</strong> 대구 사태 당시 T-4년 시점의 기울기와 현재 살오징어 궤적이 98% 일치. 자율 규제 실패 증명.
      </div>
    </div>
  );
}

// 3. 글로벌 해류 수온 편차 히트맵 (Bar for simplification)
export function Widget03_SSTAnomaly() {
  const data = [
    { area: 'Area 41 (S.America)', temp_diff: 1.2 },
    { area: 'Area 87 (Pacific)', temp_diff: 1.8 },
    { area: 'Area 61 (NW.Pacific)', temp_diff: 2.1 },
    { area: 'Area 51 (Indian)', temp_diff: 0.8 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>3. 해류 수온 편차 (SST Anomaly) </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: FAO 식품가격지수 및 무역량. 대체육류 대비 성장 델타
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} domain={[0, 2.5]}/>
            <YAxis dataKey="area" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={120} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
            <Bar dataKey="temp_diff" name="평년비 수온 델타(°C)">
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.temp_diff > 1.5 ? 'var(--color-danger)' : 'var(--color-warning)'} />
              ))}
            </Bar>
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[히트맵 감지]</strong> 북서태평양(한국/일본 연안) 수온 편차가 +2.1도로 가장 가혹함. 냉수성 살오징어 남하 완전 차단.
      </div>
    </div>
  );
}

// 4. 글로벌 단백질원 패권 성장률
export function Widget04_ProteinGrowth() {
  const data = [
    { protein: '연어', growth: 5.2 },
    { protein: '두족류(오징어)', growth: 4.8 },
    { protein: '계육', growth: 3.5 },
    { protein: '참치', growth: 2.1 },
    { protein: '돈육', growth: 1.8 },
    { protein: '우육', growth: 0.9 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>4. 단백질원별 글로벌 수요 성장률 </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: FishStatJ. 훔볼트 오징어의 주력 어종 편입 궤적
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="protein" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
            <Bar dataKey="growth" name="연평균 수요 성장률(%)" fill="var(--color-info)" radius={[4,4,0,0]} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[거시 수요]</strong> 두족류는 아시아를 넘어 북미/유럽 헬스푸드(저지방) 트렌드로 연평균 4.8% 폭발적 성장 중.
      </div>
    </div>
  );
}

// 5. 어종별 원시 생산 비중 트렌드
export function Widget05_SpeciesMix() {
  const data = [
    { year: '2010', 살오징어: 40, 대왕오징어: 20, 아르헨티나: 15, 기타: 25 },
    { year: '2015', 살오징어: 30, 대왕오징어: 35, 아르헨티나: 20, 기타: 15 },
    { year: '2020', 살오징어: 15, 대왕오징어: 50, 아르헨티나: 25, 기타: 10 },
    { year: '2023', 살오징어: 8, 대왕오징어: 60, 아르헨티나: 22, 기타: 10 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>5. 글로벌 두족류 어종별 생산 비중 </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: UNEP-WCMC. 
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Area type="monotone" dataKey="대왕오징어" stackId="1" fill="var(--color-danger)" stroke="var(--color-danger)" />
            <Area type="monotone" dataKey="아르헨티나" stackId="1" fill="#06b6d4" stroke="#06b6d4" />
            <Area type="monotone" dataKey="살오징어" stackId="1" fill="#8b5cf6" stroke="#8b5cf6" />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[어종 교체]</strong> 2010년 이단아 취급받던 대왕오징어가 점유율 60%를 돌파하며 사실상 '글로벌 표준 오징어'로 격상.
      </div>
    </div>
  );
}

// 6. MPA 확장 시뮬레이터
export function Widget06_MPAExpansion() {
  const data = [
    { year: '2015', mpa: 3, fishingZone: 97 },
    { year: '2020', mpa: 7, fishingZone: 93 },
    { year: '2025', mpa: 15, fishingZone: 85 },
    { year: '2030(E)', mpa: 30, fishingZone: 70 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>6. 해양보호구역(MPA) 및 조업 축소 시뮬 </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: RFMO 위도 기록. 한류/난류 교차점 북상 추적
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} stackOffset="expand">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(tick) => `${tick * 100}%`}/>
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="mpa" name="보호구역(조업금지)" stackId="a" fill="var(--color-success)" />
            <Bar dataKey="fishingZone" name="합법 조업구역" stackId="a" fill="var(--color-info)" fillOpacity={0.6} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[조업 면적 상실]</strong> UN 30x30 선언에 따라 2030년까지 글로벌 가용 공해 어장의 30%가 물리적으로 소멸됨.
      </div>
    </div>
  );
}

// 7. 생태계 이동 궤적 (위도)
export function Widget07_LatitudeShift() {
  const data = [
    { decade: '1990s', latitude: 35 },
    { decade: '2000s', latitude: 37 },
    { decade: '2010s', latitude: 40 },
    { decade: '2020s', latitude: 44 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>7. 기후 발(發) 군집 이동 위도선 (북상) </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: IFFO. 경제성 미달 소형 개체의 양식 사료 폐기율
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="decade" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis domain={['auto', 'auto']} stroke="rgba(255,255,255,0.5)" fontSize={11} label={{ value: '평균 위도(N)', angle: -90, position: 'insideLeft', fill: 'var(--text-primary)' }} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Line type="stepAfter" dataKey="latitude" name="주 조업 위도경계선" stroke="var(--color-warning)" strokeWidth={3} dot={{ r: 6 }} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[영해 이탈]</strong> 오징어 떼의 평균 주 서식지가 위도 44도(러시아 연해주 및 베링해 인근)까지 가파르게 북상.
      </div>
    </div>
  );
}

// 8. 어분/사료 전락 비율
export function Widget08_FishmealRatio() {
  const data = [
    { year: '2020', food: 88, feed: 12 },
    { year: '2021', food: 85, feed: 15 },
    { year: '2022', food: 78, feed: 22 },
    { year: '2023', food: 70, feed: 30 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>8. 글로벌 어분/사료(Feed) 전락 비율 </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: Global Fishing Watch AIS 추적. 무역 제재 발동 리스크 계량화
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Area type="monotone" dataKey="feed" stackId="1" fill="#ec4899" stroke="#ec4899" name="사료폐기/미달(%)" />
            <Area type="monotone" dataKey="food" stackId="1" fill="var(--color-info)" stroke="var(--color-info)" name="식용 가공(%)" />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[수율 악화]</strong> 어황 악화로 개체 크기가 급감, 잡아도 식용 마진이 안나와 연어/광어 사료로 갈려나가는 30%의 역설.
      </div>
    </div>
  );
}

// 9. IUU 조업 리스크
export function Widget09_IUURadar() {
  const data = [
    { country: 'C국(선단)', violations: 450, risk: 'Critical' },
    { country: 'T국(원양)', violations: 210, risk: 'High' },
    { country: 'V국(연안)', violations: 180, risk: 'High' },
    { country: '기타 7개국', violations: 130, risk: 'Medium' },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>9. IUU (불법/비보고 조업) 리스크 횟수 </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: RFMO TAC 문서 vs 실제 하역량. 인위적 초과 조업의 축적량
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="country" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="violations" name="AIS 이탈/침범 횟수" fill="#f43f5e" radius={[4,4,0,0]} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[지정학 리스크]</strong> 특정 거대 선단의 상습적 AIS 끄기 및 EEZ 침범. EU/미국의 수입 금지 제재(Red Card) 발동 트리거 대기 중.
      </div>
    </div>
  );
}

// 10. TAC 제한 vs 실조업 갭
export function Widget10_TACGap() {
  const data = [
    { year: '2019', tac: 100, actual: 110 },
    { year: '2020', tac: 90, actual: 115 },
    { year: '2021', tac: 80, actual: 105 },
    { year: '2022', tac: 70, actual: 95 },
    { year: '2023', tac: 60, actual: 98 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>10. 총허용어획량(TAC) vs 실 조업물량 갭 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Line type="monotone" dataKey="tac" name="과학적 한계(TAC)" stroke="var(--color-success)" strokeWidth={2} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="actual" name="실제 조업/남획량" stroke="#eab308" strokeWidth={3} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[초과 남획]</strong> 규제 당국이 매년 쿼터를 삭감함에도, 무허가 싹쓸이로 인해 실제 어획량이 TAC 곡선을 지속 하향 돌파 중.
      </div>
    </div>
  );
}
