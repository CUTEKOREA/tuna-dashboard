'use client';

import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './TunaExtractDashboard.module.css';
import { Globe } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import { ChartPatternDefs } from './ChartPatterns';
import { truncateXAxis } from '../lib/chart-standards';

const data = [
  { metric: "미국향 로인 수출($M, '24)", thailand: 75.1, vietnam: 54.9 },
  { metric: "인건비 (Labor $/MT)", thailand: 450, vietnam: 280 },
  { metric: "가공 수율 (Yield %)", thailand: 46, vietnam: 44 },
  { metric: "EU 관세 (Tariff %)", thailand: 20.5, vietnam: 0 },
  { metric: "항만 효율 (Port Eff)", thailand: 85, vietnam: 75 }
];

const ACCENT = 'var(--color-info)';

export default function TunaVietnamOemStrategy() {
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '14px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{payload[0].payload.metric}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <span style={{ color: '#8b5cf6' }}>태국 (Thai)</span>
            <span>{payload[0].payload.thailand}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <span style={{ color: 'var(--color-success)' }}>베트남 (Vietnam)</span>
            <span>{payload[0].payload.vietnam}</span>
          </div>
        </div>
      </div>
    );
  };

  const situation = 'FFA 데이터에 따르면 베트남은 2024년 5,490만 달러 규모의 프리쿡 로인(Pre-cooked loins)을 미국에 수출하며 중국을 제치고 태국에 이어 2위 수입국으로 부상했습니다. 베트남의 인건비는 태국 대비 38% 낮으며($280 vs $450/MT), EVFTA(EU-베트남 FTA)로 연 11,500mt의 캔 무관세 혜택이 있어 실제 글로벌 시장 잠식이 입증되고 있습니다.';
  const actionPlan = '1) 데이터로 입증된 베트남 OEM 파트너십 확대를 최우선 추진하되, 가공 수율(44% vs 46%) 격차 극복을 위한 품질 보증 방안을 병행해야 합니다. 2) 미국 및 EU의 관세 우회(Tariff-Hopping) 전략에 편승하여 태국 단일 의존도를 낮추는 공급망 다변화가 핵심입니다.';
  const source = 'FFA Markets Study 2025 UPDATE (US ITC 2024 데이터 기준) / 한국무역협회(KITA)';

  return (
    <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Globe size={18} className={styles.cardIcon} color={ACCENT} />
          베트남/동남아 OEM 파트너십 전략
        </h3>
      </div>

      <div style={{ height: '280px', width: '100%', marginBottom: '1rem', position: 'relative', zIndex: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
            <YAxis dataKey="metric" type="category" stroke="#94a3b8" fontSize={11} width={100} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Bar dataKey="thailand" name="태국 (기존 거점)" fill="#8b5cf6" />
            <Bar dataKey="vietnam" name="베트남 (신규 거점)" fill="var(--color-success)" />
          </BarChart>
        </SafeResponsiveContainer>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <TakeawayBox
          situation={situation}
          actionPlan={actionPlan}
          source={source}
        />
      </div>
    </div>
  );
}
