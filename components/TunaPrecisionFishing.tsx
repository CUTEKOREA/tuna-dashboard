'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as RTooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './TunaInsightsDashboard.module.css';
import { Crosshair } from 'lucide-react';
import rawData from '../data/tuna_precision_fishing.json';
import TakeawayBox from './TakeawayBox';
import TelemetryBadge from './TelemetryBadge';

const ACCENT = '#38bdf8';

export default function TunaPrecisionFishing() {
  const data = rawData;

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
            <span style={{ color: '#cbd5e1' }}>🧭 과거 직관 조업</span>
            <span>{payload[0].payload.traditional_hunting}{payload[0].payload.unit}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>📡 스마트 정밀 조업</span>
            <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{payload[0].payload.precision_harvesting}{payload[0].payload.unit}</span>
          </div>
        </div>
      </div>
    );
  };

  const situation = '기후 변화(엘니뇨·라니냐)로 인한 수온 변화로, 어군의 서식지가 수천 킬로미터 단위로 예측 불가능하게 이동하고 있습니다. 이에 따라 선박을 동원해 바다를 맹목적으로 탐색하는 비용(막대한 항공유, 유류비)과, 애써 그물을 올렸음에도 가치가 없는 어종이 잡히는 \'공치기(Dry sets)\' 확률이 치명적 리스크로 작용합니다.';
  const takeaway = '단순 선박 건조(CapEx)를 멈추고 \'소프트웨어 및 센서 중심\'으로 투자를 전환하십시오. 무인 어군 탐지 드론과 AI 3D 소나를 도입하면 타겟 어군의 85% 이상을 사전 식별할 수 있습니다. 이는 불필요한 항해를 차단하여 유류비를 절감하고, 조업 효율을 단기간에 +15% 이상 폭발적으로 끌어올리는 \'핀포인트 수확(Proactive Intercept)\' 전략의 핵심입니다.';
  const source = 'ISSF Technical Report 2024 · SPC 어군 탐지 기술 평가 · FFA 스마트 FAD 파일럿 결과';

  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Crosshair size={20} color={ACCENT} />
          AI 기반 스마트 정밀 조업
          <TelemetryBadge status="STATIC" syncDate="2024년 기준" />
        </h3>
        <p className={styles.cardDesc}>
          전통적 방식(Traditional) 대비 스마트 정밀 조업(Precision Harvesting) 도입 시의 핵심 KPI 변화량 레이더 분석.
        </p>
      </div>
      
      <div className={styles.cardBody}>
        <div className={styles.chartContainer}>
          <SafeResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.15)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <RTooltip content={<CustomRadarTooltip />} />
              <Legend />
              <Radar name="🧭 과거 직관 의존 조업 (사냥)" dataKey="traditional_hunting" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
              <Radar name="📡 딥테크 정밀 조업 (수확)" dataKey="precision_harvesting" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.3} />
            </RadarChart>
          </SafeResponsiveContainer>
        </div>
        
        <div className={styles.kpiPanel}>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#38bdf8' }}>
            <div className={styles.kpiLabel}>타겟 어군 식별률</div>
            <div className={styles.kpiValue} style={{ color: '#38bdf8' }}>85%</div>
            <div className={styles.kpiSub}>AI 3D 소나 도입 시</div>
          </div>
          <div className={styles.kpiBox} style={{ borderLeftColor: '#10b981' }}>
            <div className={styles.kpiLabel}>조업 효율 향상</div>
            <div className={styles.kpiValue} style={{ color: '#10b981' }}>+15%</div>
            <div className={styles.kpiSub}>탐색 유류비 제로화</div>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation={situation}
          actionPlan={takeaway}
          source={source}
        />
      </div>
    </div>
  );
}
