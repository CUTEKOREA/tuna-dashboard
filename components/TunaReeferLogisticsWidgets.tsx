'use client';

import React from 'react';
import styles from './TunaOperationalInsights.module.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip,
  ComposedChart, Area, Line
} from 'recharts';
import { Factory, Anchor, TrendingUp, Ship } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TermTooltip from './TermTooltip';
import { ChartPatternDefs } from './ChartPatterns';
import { truncateXAxis } from '../lib/chart-standards';

// Mock Data based on the REEFER SHIP MOVEMENT analysis
const data_competitor_inflow = [
  { week: 'W01', ASIAN: 600, ISA: 938, 'I-TAIL': 800, MMP: 1933, UC: 509 },
  { week: 'W02', ASIAN: 341, ISA: 629, 'I-TAIL': 0, MMP: 0, UC: 1379 },
  { week: 'W03', ASIAN: 0, ISA: 2004, 'I-TAIL': 0, MMP: 0, UC: 1091 },
  { week: 'W04', ASIAN: 0, ISA: 0, 'I-TAIL': 0, MMP: 1000, UC: 941 },
  { week: 'W05', ASIAN: 500, ISA: 1679, 'I-TAIL': 0, MMP: 0, UC: 1321 },
];

const data_port_congestion = [
  { week: 'W01', berthedShips: 2, avgWaitDays: 1, capacityUtil: 65 },
  { week: 'W02', berthedShips: 3, avgWaitDays: 2.5, capacityUtil: 78 },
  { week: 'W03', berthedShips: 5, avgWaitDays: 4.2, capacityUtil: 95 },
  { week: 'W04', berthedShips: 4, avgWaitDays: 3.8, capacityUtil: 88 },
  { week: 'W05', berthedShips: 6, avgWaitDays: 6.5, capacityUtil: 110 },
];

const data_supply_price = [
  { week: 'W01', totalSupply: 7300, price: 1550 },
  { week: 'W02', totalSupply: 4500, price: 1580 },
  { week: 'W03', totalSupply: 5200, price: 1665 },
  { week: 'W04', totalSupply: 2900, price: 1800 },
  { week: 'W05', totalSupply: 6500, price: 1875 },
];

const data_carrier_efficiency = [
  { carrier: 'SEIN PHOENIX', agencies: 7, leadTimeHrs: 48, efficiencyScore: 92 },
  { carrier: 'FONG KUO 818', agencies: 5, leadTimeHrs: 65, efficiencyScore: 78 },
  { carrier: 'SEIN PRINCESS', agencies: 4, leadTimeHrs: 55, efficiencyScore: 85 },
  { carrier: 'SIRICHAI', agencies: 3, leadTimeHrs: 36, efficiencyScore: 95 },
  { carrier: 'NO.2 JOCHOH', agencies: 6, leadTimeHrs: 72, efficiencyScore: 70 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--w-navy-900)',
        border: '1px solid #334155',
        padding: '12px',
        borderRadius: '6px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <p style={{ margin: '0 0 8px 0', color: 'var(--w-slate-50)', fontWeight: 600, fontSize: '0.9rem' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: '4px 0 0 0', color: entry.color, fontSize: '0.85rem' }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CardHeader = ({ title, icon: Icon, term, desc }: any) => (
  <div className={styles.cardHeader}>
    <h3 className={styles.cardTitle}>
      <Icon size={18} className={styles.cardIcon} /> {title}
    </h3>
    <TermTooltip term={term} description={desc} />
  </div>
);

// We define takeaways locally since they are not in the main map
const InlineTakeaway = ({ situation, short, long, risk, source }: any) => (
  <div className={styles.takeaway} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>📊</span>
      <div>
        <strong style={{ color: '#7dd3fc', fontSize: '0.85rem' }}>현황 분석 (Situation):</strong>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.83rem', color: 'var(--w-slate-400)', lineHeight: 1.65 }}>{situation}</p>
        {source && (
          <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: 'var(--w-slate-500)', fontStyle: 'italic' }}>
            * 출처/근거: {source}
          </p>
        )}
      </div>
    </div>
    <div style={{ width: '100%', height: '1px', background: 'rgba(var(--w-sky-400-rgb), 0.1)' }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <span style={{ color: '#bae6fd', fontSize: '0.85rem', fontWeight: 'bold' }}>⚡ 실행 전략 (Executive Takeaway):</span>
    </div>
    <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--w-slate-200)', lineHeight: 1.65 }}>
      {short} {long} {risk}
    </p>
  </div>
);

export const ReeferCompetitorInflowWidget = () => (
  <div className={styles.card}>
    <CardHeader 
      title="경쟁 가공사별 원료 수급 동향 (태국)" 
      icon={Factory} 
      term="Competitor Inflow" 
      desc="태국 주요 가공업체별 실시간 원료 입항 및 하역 매입량 비교 분석" 
    />
    <div className={styles.cardBody}>
      <div className={styles.chartContainer}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data_competitor_inflow} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis} />
            <YAxis tickFormatter={(v) => `${v.toLocaleString()}`} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="MMP" name="MMP" stackId="a" fill="var(--w-sky-400)" />
            <Bar dataKey="ISA" name="ISA" stackId="a" fill="var(--w-violet-500)" />
            <Bar dataKey="UC" name="UC" stackId="a" fill="var(--w-amber-500)" />
            <Bar dataKey="I-TAIL" name="I-TAIL" stackId="a" fill="var(--w-emerald-500)" />
            <Bar dataKey="ASIAN" name="ASIAN" stackId="a" fill="var(--w-red-500)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <InlineTakeaway
        situation="태국 주요 참치 통조림 및 펫푸드(I-TAIL 등) 업체의 주간 원료 입고 톤수를 집계한 실시간 수급 현황입니다. 특정 업체의 매입량이 집중되는 주간 패턴을 확인할 수 있습니다."
        source="방콕/타친항 주간 하역 명세서 (Reefer Ship Manifest)"
        short="경쟁사의 매입량이 급증하는 사재기(Hoarding) 움직임을 포착하여, 향후 어가 상승 전 선제적 매집 전략을 구사해야 합니다."
      />
    </div>
  </div>
);

export const ReeferPortCongestionWidget = () => (
  <div className={styles.card}>
    <CardHeader 
      title="방콕/타친항 하역 병목 게이지" 
      icon={Anchor} 
      term="Port Congestion" 
      desc="접안 중인 운반선 수와 대기일수를 통해 항구의 하역 병목 리스크를 진단" 
    />
    <div className={styles.cardBody}>
      <div className={styles.chartContainer}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data_port_congestion} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="berthedShips" name="접안 선박 수" fill="rgba(var(--w-red-500-rgb), 0.6)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="avgWaitDays" name="평균 대기일수" stroke="var(--w-red-500)" strokeWidth={3} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <InlineTakeaway
        situation="현재 부두(Wharf)에 접안 중인 선박 수와 출항까지의 대기 시간(Lead time)을 나타냅니다. W05 등 특정 주차에 평균 대기일수가 급증하며 병목 현상이 발생하고 있습니다."
        source="해운청 접안/출항(Berthing/Departure) 로데이터 추적"
        short="하역 병목 심화 시 체선료(Demurrage) 발생 및 조업 차질이 예상되므로, 자사 셔틀 선박의 하역항을 인근 항구(사무트사콘 등)로 우회하는 라우팅 최적화가 필요합니다."
      />
    </div>
  </div>
);

export const ReeferSupplyPriceOverlayWidget = () => (
  <div className={styles.card}>
    <CardHeader 
      title="총 공급량 vs 시장 어가 상관관계" 
      icon={TrendingUp} 
      term="Supply vs Price" 
      desc="방콕 항구로 유입되는 총 물량과 실제 시장 어가 간의 시차 및 상관관계" 
    />
    <div className={styles.cardBody}>
      <div className={styles.chartContainer}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data_supply_price} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Area yAxisId="left" type="monotone" dataKey="totalSupply" name="주간 총 물량(MT)" fill="var(--w-blue-500)" stroke="#2563eb" fillOpacity={0.3} />
            <Line yAxisId="right" type="monotone" dataKey="price" name="SKJ 어가($/MT)" stroke="var(--w-amber-500)" strokeWidth={3} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <InlineTakeaway
        situation="해당 주간 태국 가공 시장에 풀리는 원료 총공급량과 실제 거래 어가의 교차 분석입니다. 공급량이 급감(W04)한 직후 어가가 폭등하는 디커플링 구간이 식별됩니다."
        source="Reefer 주간 물량 총계 및 Atuna 현물 어가 오버레이"
        short="선단 물량이 급감하는 공급 공백 시그널을 선제적으로 포착하여, 현물 어가 상승 1~2주 전에 공격적인 재고 확충(Long Position)에 나서야 합니다."
      />
    </div>
  </div>
);

export const ReeferCarrierEfficiencyWidget = () => (
  <div className={styles.card}>
    <CardHeader 
      title="운반선 하역 리드타임 효율성" 
      icon={Ship} 
      term="Carrier Efficiency" 
      desc="단일 운반선이 여러 화주 물량을 처리할 때의 속도 및 에이전시 효율성 점수" 
    />
    <div className={styles.cardBody}>
      <div className={styles.chartContainer}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data_carrier_efficiency} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="carrier" angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="efficiencyScore" name="효율성 점수" fill="var(--w-emerald-500)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="leadTimeHrs" name="하역 소요 시간(Hrs)" stroke="#f43f5e" strokeWidth={3} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <InlineTakeaway
        situation="단일 운반선이 여러 화주의 물량을 분할 하역할 때 발생하는 접안~출항까지의 소요 시간 및 에이전시 효율성 평가 결과입니다."
        source="운반선별 다중 화주 하역 리드타임 분석"
        short="하역 속도가 빠르고 퍼포먼스가 입증된 선박 및 에이전시를 우선 용선 계약 대상으로 편입하여 선단 회전율(Turnaround)을 극대화해야 합니다."
      />
    </div>
  </div>
);
