'use client';

import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './TunaInsightsDashboard.module.css';
import { Recycle } from 'lucide-react';
import rawData from '../data/tuna_petcare_margin.json';
import TakeawayBox from './TakeawayBox';
import TelemetryBadge from './TelemetryBadge';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const COLORS = ['var(--color-danger)', 'var(--color-success)'];
const ACCENT = '#38bdf8';

export default function TunaPetCareMargin() {
  const data = rawData;

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '14px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', minWidth: '180px'
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

  const situation = '원어 가공 시 가식부 비중은 어종·공정별로 40~60% 범위(Klomklao & Benjakul 2016). 본 위젯은 가식부 48% / 부산물 52% 모델 케이스. 동원F&B 2024 전체 영업이익률은 4.1% (1,835억원 ÷ 4조 4,836억원), 2026 1Q 매출 1.2조원 돌파. 펫푸드 브랜드 \'뉴트리플랜\'은 펫푸드부문 브랜드파워 3년 연속 1위, 미국 습식캔 6종 출시 후 연 300억원 매출 기대. 부산물 기반 \'프리미엄 펫케어\'의 매출총이익률 28.5%는 비공개 증권사 추정치.';
  const takeaway = '수산 회사의 정체성을 \'식품 통조림 제조사\'에서 \'해양 바이오/헬스케어 원료 공급사\'로 재정의해야 합니다. 부산물(중량 40~55% 범위)을 펫푸드용 고단백 원료나 화장품용 해양 콜라겐으로 전환하기 위한 R&D 시설 투자를 집행하고, 기존 제약/바이오 기업과의 조인트 벤처를 조속히 추진하여 수율을 현금화해야 합니다.';
  const source = 'Thai Union 2024 연차 보고서 · 동원F&B 2024-2026 분기 IR (전체 영업이익률 4.1%) · 28.5% 펫푸드 마진은 비공개 증권사 추정치';

  return (
    <div className={styles.insightCard} style={{
      display: 'flex', flexDirection: 'column', minHeight: '480px'
    }}>
      {/* Card Header — renderWidgetCard 패턴 동일 */}
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Recycle size={20} color="var(--color-success)" />
          부산물 업사이클링: 프리미엄 펫케어
          <TelemetryBadge status="STATIC" syncDate="2024년 기준" />
          <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>(단위: %)</span>
          </div>
        </h3>
        <p className={styles.cardDesc}>
          타이유니온(Thai Union)의 2024년 재무 데이터 기준 펫케어 부문 매출총이익률 분석 반영. (참치 통조림 마진 4~9% 범위 — 출처별 편차 / 프리미엄 펫푸드 원료 28.5%, 추정 — 증권사 리포트 단일화 대기)
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
              <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} domain={[0, 35]} angle={0} textAnchor="middle" height={60} />
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
      <div style={{ padding: '0 20px 20px 20px', marginTop: 'auto' }}>
        <TakeawayBox
          situation={situation}
          actionPlan={takeaway}
          source={source}
        />
      </div>
    </div>
  );
}
