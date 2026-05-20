'use client';

import React, { useRef, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import styles from './MackerelStrategy.module.css';
import { Shield } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import rawData from '../data/mackerel_norway_alt.json';

const COLORS = ['var(--color-info)','var(--color-danger)','var(--color-success)','var(--color-warning)','#8b5cf6','#06b6d4','#ec4899','#f97316','#14b8a6','#6366f1','#84cc16','#e11d48'];

export default function MackerelNorwayAlt() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const measure = () => { const w = el.getBoundingClientRect().width; if (w > 0) setChartWidth(Math.floor(w)); };
    measure();
    const t = setTimeout(measure, 300);
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, []);

  const countries = (rawData as any[]);
  // Transform to year-based rows
  const years = [2019, 2020, 2021, 2022, 2023];
  const chartData = years.map(y => {
    const row: any = { year: y };
    countries.forEach((c: any) => { row[c.country] = c[String(y)] || 0; });
    return row;
  });

  const NorTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0);
    return (
      <div style={{
        background: 'rgba(0, 15, 30, 0.95)', border: '1px solid rgba(59, 130, 246, 0.4)',
        padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '240px', maxHeight: '300px', overflowY: 'auto'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#60a5fa' }}>{label}년 수출국 비중</p>
        {payload.sort((a: any, b: any) => (b.value || 0) - (a.value || 0)).map((p: any, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', gap: '12px' }}>
            <span style={{ color: p.color }}>{p.name}</span>
            <span>{(p.value / 1000).toFixed(0)}K톤 ({total > 0 ? ((p.value / total) * 100).toFixed(1) : 0}%)</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.glassCard} style={{ borderColor: 'rgba(59, 130, 246, 0.3)' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', marginBottom: '6px', fontWeight: 700, fontSize: '1.1rem' }}>
          <Shield size={20} /> 공급선 다변화: 노르웨이 독점 대항마
          
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', margin: 0 }}>
          글로벌 Top 12 수출국의 점유율 변화 — 신흥 소싱처 조기 감지
        </p>
      </div>

      <div ref={chartRef} style={{ width: '100%' }}>
        {chartWidth > 0 && (
          <BarChart width={chartWidth} height={400} data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
            <Tooltip content={<NorTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }} />
            {countries.map((c: any, i: number) => (
              <Bar key={c.country} dataKey={c.country} stackId="a" fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          source="옵시디안 고등어_마스터_인덱스 & ICES TAC Advisory / 관세청 TRQ 고시"
          situation="한국 수입의 80-90%를 차지하는 노르웨이산 고등어 어획 쿼터(TAC)가 MSC 인증 상실 여파로 52%(16.5만 → 7.9만 톤) 대폭 삭감되었으며, 환율 급등(Spike)까지 겹쳐 수입 단가가 전년 대비 20~30% 폭등하고 있습니다."
          actionPlan="**[Actionable Insight]** 칠레, 영국, 네덜란드 등 다양한 대체 수입 공급망을 전면적으로 개척하여 장기 공급 계약을 조기에 체결해야 합니다. 매입원가(COGS) 상승 국면을 타개하기 위해 정부의 물가안정용 할당관세(TRQ 0%) 제도를 선제적으로 활용하며 재고 중심의 헷징 전략을 치밀하게 구사하는 것이 필수적입니다. 향후 MSC 인증 미회복 사태가 장기화되어 노르웨이산 쿼터의 추가 삭감이 발생할 리스크에 대비해, 가나를 위시한 아프리카 등 비인증 시장으로의 판매 데스티네이션 전환 및 포트폴리오 다각화를 선제적으로 준비해야 합니다. (Conviction Buy)"
        />
      </div>
    </div>
  );
}
