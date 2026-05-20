'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ZAxis } from 'recharts';
import styles from './MackerelStrategy.module.css';
import { Radar } from 'lucide-react';
import rawData from '../data/mackerel_blackhole.json';
import TakeawayBox from './TakeawayBox';
import WestAfricaMap from './WestAfricaMap';

export default function MackerelBlackhole() {
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

  const data = (rawData as any[]).filter(d => d.growth_pct > -100 && d.import_2023_t > 50);

  const getColor = (growth: number) => {
    if (growth > 100) return 'var(--color-success)';
    if (growth > 50) return '#34d399';
    if (growth > 0) return '#fbbf24';
    return 'var(--color-danger)';
  };

  const BHTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={{
        background: 'rgba(0, 15, 30, 0.95)', border: '1px solid rgba(6, 182, 212, 0.4)',
        padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '220px'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '1rem', color: '#67e8f9' }}>{d.country}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>2019 수입량</span><span style={{ fontWeight: 600 }}>{d.import_2019_t?.toLocaleString()}톤</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>2023 수입량</span><span style={{ fontWeight: 600 }}>{d.import_2023_t?.toLocaleString()}톤</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: d.growth_pct > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            <span>성장률</span><span style={{ fontWeight: 700 }}>{d.growth_pct > 0 ? '+' : ''}{d.growth_pct.toLocaleString()}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>2023 수입액</span><span style={{ fontWeight: 600 }}>${d.import_value_2023_usd_k?.toLocaleString()}K</span>
          </div>
        </div>
      </div>
    );
  };

  const top5Growth = [...data].filter(d => d.growth_pct > 0).sort((a, b) => b.growth_pct - a.growth_pct).slice(0, 5);

  return (
    <div className={styles.glassCard} style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', marginBottom: '6px', fontWeight: 700, fontSize: '1.1rem' }}>
          <Radar size={20} /> &quot;고등어 블랙홀&quot; 신흥 시장 발굴
          
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', margin: 0 }}>
          2019→2023 수입량 증가율 vs 절대 규모 — 폭발 성장 시장을 조기 포착
        </p>
      </div>

      {/* Top 5 Growth Markets */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {top5Growth.map((d, i) => (
          <div key={i} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '8px 14px', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>🚀 {d.country}</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', marginLeft: '8px' }}>+{d.growth_pct.toLocaleString()}%</span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <WestAfricaMap />
      </div>

      <div ref={chartRef} style={{ width: '100%' }}>
        {chartWidth > 0 && (
          <ScatterChart width={chartWidth} height={400} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" dataKey="import_2023_t" name="2023 수입량" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : `${v}`} label={{ value: '2023 수입량 (톤)', position: 'bottom', offset: 0, style: { fill: 'rgba(255,255,255,0.4)', fontSize: 11 } }} />
            <YAxis type="number" dataKey="growth_pct" name="성장률" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `${v}%`} label={{ value: '5년 성장률 (%)', angle: -90, position: 'insideLeft', style: { fill: 'rgba(255,255,255,0.4)', fontSize: 11 } }} />
            <ZAxis type="number" dataKey="import_value_2023_usd_k" range={[30, 400]} />
            <Tooltip content={<BHTooltip />} />
            <Scatter data={data}>
              {data.map((d: any, i: number) => <Cell key={i} fill={getColor(d.growth_pct)} fillOpacity={0.7} />)}
            </Scatter>
          </ScatterChart>
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          source="FAO FishStatJ - Trade by Partner (2019-2023)"
          situation="2019~2023년 데이터를 분석한 결과, 토고(+5,932%), 말리(+1,300%), 필리핀(+167%), 코트디부아르(+81%) 등 아프리카 및 동남아 신흥 국가들의 고등어 수입량이 폭발적으로 증가하며 '신흥 블랙홀'을 형성하고 있습니다. 이들 국가의 인구 증가와 저렴한 단백질 수요가 세계 고등어 무역 지형을 빠르게 바꾸고 있습니다."
          actionPlan="**[Actionable Insight]** 코트디부아르·필리핀·콩고민주공화국 등 수입 성장세가 뚜렷한 국가들을 신규 전략 시장으로 지정하고, 국내에서 상품성이 낮은 소형어(300g 미만)의 정기 컨테이너 수출 물량을 대폭 확대하십시오. 과거 최대 시장이었던 가나·나이지리아의 점유율이 점차 하락하는 추세임을 고려해, 서아프리카 인근 다른 거점 국가로의 선제적인 유통망 다변화 투자가 핵심입니다."
        />
      </div>
    </div>
  );
}
