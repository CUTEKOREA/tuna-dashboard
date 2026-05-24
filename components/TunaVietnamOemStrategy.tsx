'use client';

import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './TunaExtractDashboard.module.css';
import { Globe } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const data = [
  { metric: "인건비 (Labor $/MT)", thailand: 450, vietnam: 280 },
  { metric: "가공 수율 (Yield %)", thailand: 46, vietnam: 44 },
  { metric: "EU 관세 (Tariff %)", thailand: 20.5, vietnam: 0 },
  { metric: "항만 효율 (Port Eff)", thailand: 85, vietnam: 75 }
];

const ACCENT = 'var(--color-info)';

export default function TunaVietnamOemStrategy() {
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
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

  const situation = 'CJ 등 국내 대형 B2B 고객사의 참치캔 납품 단가 인하 압박 및 태국 가공업체들의 원가 상승 딜레마 발생. 태국 대비 베트남의 인건비는 38% 낮으며($280 vs $450/MT), EU-베트남 FTA로 관세율이 0%(태국 20.5%)로 원가 경쟁력이 입니다. 다만 가공 수율(44% vs 46%)과 항만 효율(75 vs 85)은 태국이 우세하여 품질 관리 리스크가 존재합니다.';
  const actionPlan = '1) 인건비가 저렴하고 EU 관세 혜택이 있는 베트남 캔 가공(OEM) 파트너사를 적극 발굴하되, 가공 수율과 항만 효율 객에 대한 품질 보증 방안을 병행 구축해야 합니다. 2) 태국 단일 거점 의존도를 50% 이하로 낮추는 공급망 다변화가 리스크 헤지의 핵심입니다.';
  const source = '한국무역협회(KITA) 수출입 통계 / 베트남 관세청 관세율 DB / 내부 B2B 영업 전략 보고서 — 인건비/수율 데이터는 업계 평균 추정치';

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
            <Bar dataKey="thailand" name="태국 (기존 거점)" fill="url(#a11y-stripe-h)" color="#8b5cf6" />
            <Bar dataKey="vietnam" name="베트남 (신규 거점)" fill="url(#a11y-diag)" color="var(--color-success)" />
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
