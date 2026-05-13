'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import { Crosshair } from 'lucide-react';
import rawData from '../data/tuna_precision_fishing.json';
import TakeawayBox from './TakeawayBox';

const ACCENT = '#38bdf8';

export default function TunaPrecisionFishing() {
  const data = rawData;

  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '14px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 8px 32px rgba(0,0,0,0.7)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{payload[0].payload.metric}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <span style={{ color: '#94a3b8' }}>🧭 과거 (직관/사냥)</span>
            <span>{payload[0].payload.traditional_hunting}{payload[0].payload.unit}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>📡 미래 (데이터/수확)</span>
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
    <div className={styles.glassCard} style={{
      display: 'flex', flexDirection: 'column', minHeight: '480px'
    }}>
      {/* Card Header — renderWidgetCard 패턴 동일 */}
      <div style={{ position: 'relative', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
        <h3 className={styles.cardTitle}>
          <Crosshair size={20} color={ACCENT} />
          AI 기반 스마트 정밀 조업 (Precision Harvesting)
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          전통적 방식(Traditional) 대비 스마트 정밀 조업(Precision Harvesting) 도입 시의 핵심 KPI 변화량 레이더 분석. (무인 탐색 드론 및 3D 소나 사전 식별을 통한 유류비 제로화 및 조업 효율 극대화)
        </p>
      </div>

      {/* Chart Area — renderWidgetCard 패턴 동일 */}
      <div style={{ height: '250px', width: '100%', marginBottom: '1rem', position: 'relative', zIndex: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 'bold' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <RechartsTooltip content={<CustomRadarTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Radar name="🧭 과거 직관 의존 조업 (사냥)" dataKey="traditional_hunting" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
            <Radar name="📡 딥테크 정밀 조업 (수확)" dataKey="precision_harvesting" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.6} />
          </RadarChart>
        </SafeResponsiveContainer>
      </div>

      {/* Takeaway Box — renderWidgetCard 패턴 동일 */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          situation={situation}
          actionPlan={takeaway}
          source={source}
        />
      </div>
      </div>
    </div>
  );
}
