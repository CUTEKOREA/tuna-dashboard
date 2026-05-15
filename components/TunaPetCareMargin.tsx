'use client';

import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './TunaInsightsDashboard.module.css';
import { Recycle } from 'lucide-react';
import rawData from '../data/tuna_petcare_margin.json';
import TakeawayBox from './TakeawayBox';

const COLORS = ['var(--color-danger)', 'var(--color-success)'];
const ACCENT = '#38bdf8';

export default function TunaPetCareMargin() {
  const data = rawData;

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '14px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '180px'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: payload[0].fill }}>💰 마진율</span>
            <span style={{ fontWeight: 700 }}>{payload[0].value}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>📈 시장 성장률</span>
            <span>{payload[0].payload.growth_rate}%</span>
          </div>
        </div>
      </div>
    );
  };

  const situation = '원어 가공 시 실제로 소비되는 살코기(가식부)는 전체 중량의 48% 수준에 그칩니다. 전통 수산업의 마진이 1~5%대 박스권에 갇혀 있는 반면, 버려지던 52%의 부산물(뼈, 내장 등)을 가공한 \'프리미엄 펫케어 및 해양 바이오\' 부문은 28.5%라는 압도적인 매출총이익률을 달성하며 새로운 수익의 심장으로 떠올랐습니다.';
  const takeaway = '수산 회사의 정체성을 \'식품 통조림 제조사\'에서 \'해양 바이오/헬스케어 원료 공급사\'로 재정의해야 합니다. 52%의 부산물을 펫푸드용 고단백 원료나 화장품용 해양 콜라겐으로 전환하기 위한 R&D 시설 투자를 집행하고, 기존 제약/바이오 기업과의 조인트 벤처(JV)를 조속히 추진하여 수율을 100% 현금화(Monetization)해야 합니다.';
  const source = 'Thai Union 2024 연차 보고서 · NotebookLM 산업 분석';

  return (
    <div className={styles.insightCard} style={{
      display: 'flex', flexDirection: 'column', minHeight: '480px'
    }}>
      {/* Card Header — renderWidgetCard 패턴 동일 */}
      <div style={{ position: 'relative', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
        <h3 className={styles.cardTitle}>
          <Recycle size={20} color="var(--color-success)" />
          부산물 업사이클링: 프리미엄 펫케어 (Petcare Upcycling)
          <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>(단위: %)</span>
          </div>
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          타이유니온(Thai Union)의 2024년 재무 데이터 기준 펫케어 부문 매출총이익률 분석 반영. (참치 통조림(마진 4%) vs 프리미엄 펫푸드 원료(마진 28.5%))
        </p>
      </div>

      {/* Chart Area — Dual Chart Layout */}
      <div style={{ height: '250px', width: '100%', marginBottom: '1rem', display: 'flex', gap: '16px', position: 'relative', zIndex: 0 }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={5}
                dataKey="yield_pct"
                nameKey="category"
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </SafeResponsiveContainer>
        </div>

        <div style={{ flex: 1.5, minHeight: 0 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} domain={[0, 35]} />
              <YAxis type="category" dataKey="market_type" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 'bold' }} width={120} />
              <RechartsTooltip content={<CustomBarTooltip />} />
              <Bar dataKey="margin_pct" name="마진율 (%)" radius={[0, 4, 4, 0]}>
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </SafeResponsiveContainer>
        </div>
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
