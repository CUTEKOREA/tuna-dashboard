'use client';

import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './TunaExtractDashboard.module.css';
import { AlertTriangle } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


interface TacMonitorProps {
  tacData?: Array<{ rfmo: string; species: string; tac: number; consumed: number; pct: number; year: number; note?: string }>;
  forecastData?: Array<{ year: string; priceIndex: number; tacPressure: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '14px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '0.25rem 0', fontSize: '0.8rem' }}>
          {entry.name}: {entry.value}{entry.name.includes('지수') ? '' : entry.name.includes('압력') ? '' : ''}
        </p>
      ))}
    </div>
  );
};

export default function TunaTacMonitor({ tacData, forecastData }: TacMonitorProps) {
  const defaultForecast = [
    { year: '2022', priceIndex: 100, tacPressure: 15 },
    { year: '2023', priceIndex: 108, tacPressure: 22 },
    { year: '2024', priceIndex: 115, tacPressure: 35 },
    { year: '2025E', priceIndex: 120, tacPressure: 48 },
    { year: '2027E', priceIndex: 128, tacPressure: 62 },
    { year: '2030E', priceIndex: 133, tacPressure: 80 }
  ];

  const defaultTac = [
    { rfmo: 'IOTC', species: '눈다랑어(BET)', tac: 80583, consumed: 72400, pct: 89.8, year: 2025 },
    { rfmo: 'ICCAT', species: '눈다랑어(BET)', tac: 73011, consumed: 61200, pct: 83.8, year: 2025 }
  ];

  const chartData = forecastData || defaultForecast;
  const tacEntries = tacData?.filter(d => d.tac > 0) || defaultTac;

  return (
    <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <AlertTriangle size={18} className={styles.cardIcon} color="var(--color-danger)" />
          W-NEW. 글로벌{' '}
          <TermTooltip
            term="TAC"
            description="총허용어획량(Total Allowable Catch). ICCAT, IOTC 등 국제기구(RFMO)가 매년 어종별로 설정하는 최대 어획량 상한선. 초과 시 100~125% 페이백(삭감) 페널티."
          />
          {' '}쿼터 소진율 \u0026 원료 가격 전망
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          ICCAT/IOTC 쿼터 축소 → 원물 가격 상승 → 자숙액 수급 불안정 연쇄 리스크 조기 경보
        </p>
      </div>

      {/* TAC Gauges */}
      <div style={{ display: 'flex', gap: '12px', padding: '0 1rem', marginBottom: '0.75rem' }}>
        {tacEntries.map((t, i) => {
          const pctColor = t.pct > 85 ? 'var(--color-danger)' : t.pct > 70 ? 'var(--color-warning)' : 'var(--color-success)';
          return (
            <div key={i} style={{
              flex: 1, background: 'var(--surface-3)', borderRadius: '8px', padding: '0.75rem',
              border: `1px solid ${pctColor}20`
            }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>
                {t.rfmo} · {t.species}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: pctColor }}>
                {t.pct.toFixed(1)}%
              </div>
              <div style={{
                width: '100%', height: '6px', background: 'rgba(15, 23, 42, 0.9)', borderRadius: '3px', marginTop: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(t.pct, 100)}%`, height: '100%', borderRadius: '3px',
                  background: pctColor, transition: 'width 0.6s ease'
                }} />
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>
                {t.consumed.toLocaleString()} / {t.tac.toLocaleString()} MT
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Forecast Chart */}
      <div style={{ height: '200px', width: '100%', marginBottom: '0.5rem', position: 'relative', zIndex: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={11}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
            <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} domain={[90, 140]} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={11} domain={[0, 100]} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line yAxisId="left" type="monotone" dataKey="priceIndex" name="수산물 가격 지수" stroke="var(--color-warning)" strokeWidth={3} />
            <Bar yAxisId="right" dataKey="tacPressure" name="쿼터 압력 (0~100)" fill="var(--color-danger)" fillOpacity={0.6} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <TakeawayBox
          situation="IOTC는 눈다랑어(BET) TAC를 80,583톤(2025), ICCAT은 73,011톤(2025)으로 제한하고, 황다랑어(YFT)는 기준 연도 대비 13~20% 감축을 의무화했습니다. 초과 시 100~125% 페이백 페널티가 부과됩니다. FAO에 따르면 이러한 공급 제한과 수요 증가가 맞물려 2030년까지 수산물 가격이 명목 기준 약 33% 급등(Spike)할 전망입니다. IOTC FAD 72일 조업 제한 시 통조림 수출 물량이 12% 하락하고, 공장 가동이 연간 2~6주 중단될 리스크가 존재합니다."
          actionPlan="**[Actionable Insight]** 1) 참치 통조림 공장 가동률 저하 → 자숙액 공급 X톤 감소 → 참치액젓 생산 차질의 연쇄 시나리오를 분기별로 시뮬레이션해야 합니다. 2) 원물 가격 +33% 상승 시 각 진입 시나리오(S1~S4)별 ROIC 감응도 분석을 경영진에 사전 보고하여, 가격 헤지 또는 안전 재고 확보 전략을 선제 수립해야 합니다. 3) 쿼터 소진율 85% 이상 시 자동 경보(Alert)를 발동하는 트리거 시스템 구축이 필요해야 합니다. (Conviction Buy)"
          source="IOTC Compendium of Active Conservation Measures / ICCAT Compendium of Management Recommendations / FAO The State of World Fisheries 2022 / Macroeconomic impact of international fishery regulation (Marine Policy)"
        />
      </div>
    </div>
  );
}
