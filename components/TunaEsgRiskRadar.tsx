'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './TunaInsightsDashboard.module.css';
import { ShieldCheck } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';
import TelemetryBadge from './TelemetryBadge';

const data = [
  { metric: "강제노동 위험", indonesia: 85, pna: 35 },
  { metric: "불법 환적 가능성", indonesia: 90, pna: 25 },
  { metric: "해양 생태계 파괴", indonesia: 80, pna: 40 },
  { metric: "어족자원 남획", indonesia: 75, pna: 30 }
];

const ACCENT = 'var(--color-warning)';

export default function TunaEsgRiskRadar() {
  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '14px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{payload[0].payload.metric}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <span style={{ color: 'var(--color-danger)' }}>인도네시아 조업</span>
            <span>{payload[0].payload.indonesia}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <span style={{ color: 'var(--color-success)' }}>WCPFC/PNA (기준)</span>
            <span>{payload[0].payload.pna}</span>
          </div>
        </div>
      </div>
    );
  };

  const situation = '서구권 규제 기관의 IUU(불법·비보고·비규제) 어업 및 강제 노동 제재 강화로 인도네시아산 참치의 수출입 차질 가시화. ILO 보고서에 따르면 인도네시아 원양 어업의 강제노동 위험도는 85점(100점 만점)으로, WCPFC/PNA 관리 구역(35점) 대비 2.4배 높습니다.';
  const actionPlan = '신라교역의 태평양 원양 어획물에 대한 \'Clean Supply Chain\' 프리미엄 마케팅 전개 및 인도네시아 벤더 ESG 실사 강화.';
  const source = '국제 노동 기구(ILO) / 인도네시아 해양수산부 / 내부 ESG 실사 보고서';

  return (
    <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <ShieldCheck size={18} className={styles.cardIcon} color={ACCENT} style={{ marginRight: 8 }} />
          인도네시아 참치 ESG 리스크 모니터링
          <TelemetryBadge status="STATIC" syncDate="2025-11 기준" />
        </h3>
        <p className={styles.cardDesc}>
          글로벌 참치 공급망의 강제 노동 및 환경 파괴 리스크 수준 비교 (인도네시아 vs WCPFC/PNA)
        </p>
      </div>

      <div style={{ height: '280px', width: '100%', marginBottom: '1rem', position: 'relative', zIndex: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 'bold' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <RechartsTooltip content={<CustomRadarTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Radar name="인도네시아 리스크" dataKey="indonesia" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.4} />
            <Radar name="PNA (기준선)" dataKey="pna" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.4} />
          </RadarChart>
        </SafeResponsiveContainer>
      </div>

      <div style={{ padding: '0 20px 20px 20px', marginTop: 'auto' }}>
        <TakeawayBox
          situation={situation}
          actionPlan={actionPlan}
          source={source}
        />
      </div>
    </div>
  );
}
