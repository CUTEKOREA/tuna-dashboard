'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ZAxis } from 'recharts';
import { Radar } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel_blackhole.json';
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
        background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(6, 182, 212, 0.4)',
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

  const customBody = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
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
    </div>
  );

  return (
    <WidgetCard
      title="&quot;고등어 블랙홀&quot; 신흥 시장 발굴"
      icon={Radar}
      iconColor="#fbbf24"
      pillar="S4"
      cardDesc="UN Comtrade + KCS 관세청 통계 — 2019→2023 수입량 증가율 vs 절대 규모, 폭발 성장 시장 조기 포착"
      telemetry={{ status: 'STATIC', syncDate: 'UN Comtrade 2019-2023 + KCS' }}
      customBody={customBody}
      takeaway={{
        situation: `<div>
<p>"수요 블랙홀"이란 5년 사이 수입량이 50~5,000% 폭증한 신흥 시장. 인구 증가율 + 단백질 결핍 + 저소득층 식량 안보 정책이 결합해 무역 흐름이 빨려 들어가는 국가군.</p>
<p>실측: <strong>토고 +5,932%, 말리 +1,300%, 필리핀 +167%, 코트디부아르 +81% 5년 성장률. 가나·나이지리아 전통 시장은 포화 진입, 인근 서아프리카 위성 시장에 신규 무역풍 형성</strong>. 선점 우위를 확보할 수 있는 기회 창이 1~2년으로 제한적이다.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 신흥 시장은 단순 분산이 아닌 <strong>"가나·나이지리아 포화 전환 전 서아프리카 전체 거점 네트워크 선점 기회"</strong>.</p>
<p><strong>3단계</strong>: ① 코트디부아르·필리핀·콩고민주공화국을 신규 전략 시장으로 즉시 지정 — 정기 컨테이너 수출 라인 개설 ② 300g 미만 소형어를 수익화 채널로 전환 ③ 가나 거점 인프라(테마항 콜드체인)를 활용해 인근 5개국 유통 허브로 확장 — 서아프리카 다국가 공급망 선점.</p>
</div>`,
        source: "FAO FishStatJ Trade by Partner (2019-2023)",
      }}
    />
  );
}
