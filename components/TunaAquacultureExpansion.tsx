'use client';

import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './TunaExtractDashboard.module.css';
import { TrendingUp } from 'lucide-react';
import TakeawayBox from './TakeawayBox';

const data = [
  { year: "2020", wild: 85000, farmed: 25000 },
  { year: "2022", wild: 78000, farmed: 35000 },
  { year: "2024", wild: 70000, farmed: 55000 },
  { year: "2026", wild: 62000, farmed: 85000 },
  { year: "2028", wild: 55000, farmed: 120000 },
  { year: "2030", wild: 50000, farmed: 160000 }
];

const ACCENT = '#f472b6';

export default function TunaAquacultureExpansion() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '14px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 8px 32px rgba(0,0,0,0.7)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
          {payload.map((entry: any, index: number) => (
             <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
               <span style={{ color: entry.color }}>{entry.name}</span>
               <span>{entry.value.toLocaleString()} MT</span>
             </div>
          ))}
        </div>
      </div>
    );
  };

  const situation = 'ICCAT/RFMO의 엄격한 어획 쿼터 축소(IOTC 눈다랑어 TAC 80,583톤, ICCAT 73,011톤, 2025 기준)로 태평양 참다랑어(BFT) 자연산 어획량이 2020년 85,000MT에서 2030년 50,000MT로 지속 축소되는 반면, 양식산(Farmed BFT)은 같은 기간 25,000→160,000MT로 6.4배 폭증하며 2026년경 공급량 역전(Cross-over)이 예상됩니다. 초과 어획 시 100~125% 페이백 페널티가 부과되어, 자연산 쿼터의 추가 확대는 사실상 불가능합니다.';
  const actionPlan = '1) 2026년 Cross-over 이전에 고부가가치 참치 축양(Ranching/Farming) 인프라 투자를 선점해야 합니다. 2) 호주/스페인/말타 등 기존 BFT 축양 선도 기업 대상 M&A 기회 탐색이 전략적 옵션입니다. 3) 양식산 비중 증가 시 가공 부산물(자숙액 등) 원료의 품질 일관성이 향상되어, 참치액젓 사업의 원료 안정성이 개선될 수 있습니다.';
  const source = 'ICCAT Compendium of Management Recommendations / IOTC Compendium of Active Conservation Measures / FAO Statistical Yearbook(2024) / 수산과학원 — 2026~2030년 데이터는 CAGR 기반 예측치';

  return (
    <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <TrendingUp size={18} className={styles.cardIcon} color={ACCENT} />
          글로벌 참치 양식(Aquaculture) 패러다임 시프트
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          RFMO 쿼터 축소로 인한 자연산 어획 한계와 양식산(Farmed) 참치 공급량 역전 시뮬레이션
        </p>
      </div>

      <div style={{ height: '280px', width: '100%', marginBottom: '1rem', position: 'relative', zIndex: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            <Area type="monotone" dataKey="farmed" name="양식산 (Farmed BFT)" stroke="#f472b6" fill="#f472b6" fillOpacity={0.6} />
            <Area type="monotone" dataKey="wild" name="자연산 (Wild Catch)" stroke="var(--color-info)" fill="var(--color-info)" fillOpacity={0.3} />
          </AreaChart>
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
