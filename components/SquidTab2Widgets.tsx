import React from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';

const glassContainerStyle = {
  background: 'rgba(0, 15, 30, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
  padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '16px', height: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative' as const
};

// 11. 글로벌 오징어 어획 패권 버블 차트
export function Widget11_HegemonyBubble() {
  const data = [
    { country: 'C국', catch: 800, growth: 12, size: 80 },
    { country: 'P국', catch: 550, growth: 4, size: 55 },
    { country: 'A국', catch: 350, growth: 2, size: 35 },
    { country: 'K국', catch: 50, growth: -18, size: 5 },
    { country: 'J국', catch: 40, growth: -22, size: 4 }
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>11. 글로벌 어획 패권 블랙홀 </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: 포클랜드 및 페루 연안 쿼터 리포트. 연간 허용량의 월별 조기 소진율
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" dataKey="catch" name="생산량(만톤)" stroke="rgba(255,255,255,0.5)" fontSize={11} domain={[0, 1000]} />
            <YAxis type="number" dataKey="growth" name="성장률(%)" stroke="rgba(255,255,255,0.5)" fontSize={11} domain={[-30, 20]} />
            <ZAxis type="number" dataKey="size" range={[50, 800]} name="선단규모" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Scatter name="국가" data={data} fill="var(--color-danger)">
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.growth < 0 ? '#64748b' : (entry.catch > 400 ? 'var(--color-danger)' : 'var(--color-info)')} />
              ))}
            </Scatter>
          </ScatterChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[자본의 블랙홀]</strong> P국, A국의 EEZ 자원을 C국 선단이 원양 조업으로 흡수 중. 동북아 연안국(한/일)은 궤도에서 완전 이탈.
      </div>
    </div>
  );
}

// 12. 쿼터 연소율
export function Widget12_QuotaBurnRate() {
  const data = [
    { month: 'Jan', rate: 10 },
    { month: 'Feb', rate: 45 },
    { month: 'Mar', rate: 85 },
    { month: 'Apr', rate: 100, isClosed: true }
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>12. 국가별/어장별 쿼터 소진 속도 (Burn Rate) </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: 글로벌 AIS 선박 추적망. 어선수 증가 대비 톤수(Size)의 폭발 비율
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(tick) => `${tick}%`} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="rate" name="쿼터 소진율(%)">
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.isClosed ? 'var(--color-danger)' : 'var(--color-info)'} />
              ))}
            </Bar>
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[조기 클로징]</strong> 군집 밀도 상승과 선단 집적에 의해 아르헨 앞바다 쿼터가 4월에 100% 조기 소진 방어망 발동.
      </div>
    </div>
  );
}

// 13. 중국 원양 선단 팽창 다이내믹스
export function Widget13_FleetExpansion() {
  const data = [
    { year: '2015', ships: 400, tonnage: 800 },
    { year: '2019', ships: 600, tonnage: 1500 },
    { year: '2023', ships: 850, tonnage: 2800 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>13. C국 초대형 원양 선단 팽창 다이내믹스 </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: WTO 무역통계 및 NotebookLM 관세 자료. 자국산 진흥을 위한 수출세/입항료 폭등
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Line yAxisId="left" type="monotone" dataKey="ships" name="선박 수(척)" stroke="var(--color-info)" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="tonnage" name="총 톤수(GT Index)" stroke="var(--color-danger)" strokeWidth={3} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[체급 확장]</strong> 배 척수는 2배 늘었지만, 총 톤수와 집어등 마력(HP)은 3.5배 상승. 싹쓸이급 '스카이 워커' 선단화.
      </div>
    </div>
  );
}

// 14. 연안국(EEZ) 보호주의 지수
export function Widget14_EEZProtectionism() {
  const data = [
    { year: '2020', tariff: 5, fee: 100 },
    { year: '2021', tariff: 6, fee: 150 },
    { year: '2022', tariff: 10, fee: 250 },
    { year: '2023', tariff: 15, fee: 400 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>14. 연안국(아르헨/페루) 배타적 보호주의 지표 </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: 주요 RFMO 일일 조업 실적. 자본 집약적 기술이 생산을 좌우
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Area type="monotone" dataKey="fee" name="외국적선 입항/조업료 지수" stroke="var(--color-warning)" fill="var(--color-warning)" fillOpacity={0.3} />
            <Area type="step" dataKey="tariff" name="스팟 수출세/관세율(%)" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.6} />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[자원 무기화]</strong> 자원국들이 원물 반출에 15%의 패널티 관세를 물리거나, 외국선 조업료를 400% 인상하며 마진을 선취.
      </div>
    </div>
  );
}

// 15. 조업 기술력 vs CPUE
export function Widget15_TechVsCPUE() {
  const data = [
    { name: 'K국 (구형)', hp: 100, cpue: 25 },
    { name: 'J국 (구형)', hp: 120, cpue: 30 },
    { name: 'C국 (신형 집어등)', hp: 300, cpue: 120 },
    { name: 'P국 (초대형망)', hp: 280, cpue: 150 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>15. 등선 마력(HP) 기술력 vs 단위어획량(CPUE) </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: UN Comtrade. 남미 원물이 중국을 거쳐 가공된 후 북반구로 소비되는 Sankey 형태
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={100} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="cpue" name="하루 어획량 효율(CPUE)" fill="var(--color-success)" />
            <Bar dataKey="hp" name="광원/마력 투입 자본" fill="#6366f1" />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[자본의 승리]</strong> 동일 어장 내에서도 C/P국이 압도적인 집어등 마력과 소나 탐지기로 CPUE 효율을 5배 격차로 벌림.
      </div>
    </div>
  );
}

// 16. 글로벌 오징어 무역 매트릭스 (simplified node linking)
export function Widget16_TradeFlows() {
  const data = [
    { source: '페루/아르헨', dest: '중국 가공장', value: 600 },
    { source: '중국 가공장', dest: '한국/일본', value: 300 },
    { source: '중국 가공장', dest: '미국/EU', value: 250 },
    { source: '대서양 공해', dest: '유럽', value: 150 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>16. 무역 흐름(Flow) 블랙홀 경로 </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: 각국 항만공사 하역 데이터. 거점 이동 트렌드 증명
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            {/* Visualizing flow as bar for dashboard simplicity */}
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis dataKey="dest" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} width={100}/>
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="value" name="이동 물동량(천톤)" fill="#8b5cf6" />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[병목 지점]</strong> 전 세계 물량의 60%가 중국 Zhoushan/Shidao 등을 거쳐야만 최종 상품(Tube/Ring)으로 전환. 심각한 의존성 구조.
      </div>
    </div>
  );
}

// 17. 최상위 허브 항구 하역 물동량
export function Widget17_PortHubs() {
  const data = [
    { month: 'Q1', Zhoushan_CN: 120, Callao_PE: 90, Busan_KR: 20 },
    { month: 'Q2', Zhoushan_CN: 180, Callao_PE: 150, Busan_KR: 15 },
    { month: 'Q3', Zhoushan_CN: 210, Callao_PE: 60, Busan_KR: 12 },
    { month: 'Q4', Zhoushan_CN: 150, Callao_PE: 80, Busan_KR: 18 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>17. 글로벌 거점 항구 하역 물동량 추이 </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: NotebookLM B2B 벨류체인 데이터. 인건비 상승에 따른 제3국 낙수 효과
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Line type="monotone" dataKey="Zhoushan_CN" stroke="var(--color-danger)" strokeWidth={3} />
            <Line type="monotone" dataKey="Callao_PE" stroke="var(--color-info)" strokeWidth={2} />
            <Line type="monotone" dataKey="Busan_KR" stroke="#64748b" strokeWidth={2} strokeDasharray="3 3"/>
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[인프라 쏠림]</strong> 선사들이 높은 위판고를 보장하는 중국 저우산 항구로 직행 뱃머리를 돌리며 한국/일본 하역량 이탈 지속.
      </div>
    </div>
  );
}

// 18. 가공 공장 블랙홀 집중 지수
export function Widget18_ProcessingBlackhole() {
  const data = [
    { year: '2019', Vietnam: 20, India: 5, China: 65, Others: 10 },
    { year: '2023', Vietnam: 35, India: 15, China: 45, Others: 5 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>18. 글로벌 임가공 거점 이동 (블랙홀 현상) </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: OECD 어업 지원금 데이터. 보조금이 적외선 선단 운영 연장을 돕는 역설
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" stackOffset="expand">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={(t) => `${t*100}%`}/>
            <YAxis dataKey="year" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="Vietnam" stackId="a" fill="var(--color-success)" />
            <Bar dataKey="India" stackId="a" fill="var(--color-warning)" />
            <Bar dataKey="China" stackId="a" fill="var(--color-danger)" />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[거점 분산]</strong> 중국 인건비 상승으로 인해 해체/절단 작업이 베트남, 인도로 대거 아웃소싱되며 동남아가 새로운 가공 블랙홀로 부상.
      </div>
    </div>
  );
}

// 19. 어업 보조금 vs 자원 고갈률
export function Widget19_SubsidiesVsDepletion() {
  const data = [
    { name: '보조금 높음', subsidies: 80, depletionRate: 25 },
    { name: '보조금 중간', subsidies: 40, depletionRate: 12 },
    { name: '보조금 낮음', subsidies: 10, depletionRate: 5 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>19. 유류 보조금 vs 초과 남획 상관관계 </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          출처: IMO 탄소 규제 로드맵 계산기. 낡은 어선 유지비 vs 신조선 교체기
        </p>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Bar dataKey="subsidies" name="보조금 지수" fill="var(--color-info)" />
            <Bar dataKey="depletionRate" name="어장 고갈 가속도" fill="var(--color-danger)" />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[시장 교란]</strong> 유류 보조금을 가장 많이 투입하는 국가일수록 철수해야 할 한계 기업 어선들이 바다에 남아 싹쓸이 남획 주도.
      </div>
    </div>
  );
}

// 20. 탄소세 연동 Capex 시뮬레이터
export function Widget20_CarbonTaxCapex() {
  const data = [
    { year: '2025', carbonPenalty: 12, newShipCapex: 10 },
    { year: '2027', carbonPenalty: 28, newShipCapex: 20 },
    { year: '2030', carbonPenalty: 65, newShipCapex: 40 },
  ];
  return (
    <div style={glassContainerStyle}>
      <h3 className={styles.widgetTitle}>20. 탄소 배출 규제(IMO) 한계 비용 교차점 </h3>
      <div style={{ height: 250 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)' }} />
            <Area type="monotone" dataKey="carbonPenalty" name="노후선 탄소세 패널티 누적" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.4} />
            <Area type="monotone" dataKey="newShipCapex" name="신조선 친환경 설비 감가상각" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.4} />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
      <div className={styles.takeawayBox}>
        <strong>[자본 도태]</strong> 2028년을 기점으로 노후 선박에 부과되는 탄소세/입항 페널티가 신조선 건조 비용(CAPEX)을 추월. 중소 선사의 강제 퇴출기.
      </div>
    </div>
  );
}
