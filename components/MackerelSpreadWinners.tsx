'use client';

import React, { useRef, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ReferenceLine } from 'recharts';
import { Scissors } from 'lucide-react';
import rawData from '../data/mackerel_spread.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function MackerelSpreadWinners() {
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

  const data = (rawData as any[]).slice(0, 12);

  const SpreadTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={{
        background: 'rgba(0, 15, 30, 0.95)', border: '1px solid rgba(139, 92, 246, 0.4)',
        padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '240px'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '1rem', color: '#c4b5fd' }}>{d.country}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-danger)' }}>📥 수입 단가</span><span>${d.import_price_usd?.toLocaleString()}/t</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--color-success)' }}>📤 수출 단가</span><span>${d.export_price_usd?.toLocaleString()}/t</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '4px' }}>
            <span style={{ color: '#a78bfa' }}>💰 스프레드</span><span style={{ fontWeight: 700, color: d.margin_usd > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>${d.margin_usd?.toLocaleString()}/t ({d.margin_pct}%)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>수입량</span><span>{d.import_vol_t?.toLocaleString()}t</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>수출량</span><span>{d.export_vol_t?.toLocaleString()}t</span></div>
        </div>
      </div>
    );
  };

  const customBody = (
    <div ref={chartRef} style={{ width: '100%' }}>
      {chartWidth > 0 && (
        <BarChart width={chartWidth} height={400} data={data} margin={{ top: 10, right: 30, left: 30, bottom: 60 }} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
          <YAxis type="category" dataKey="country" width={100} stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
          <Tooltip content={<SpreadTooltip />} />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" />
          <Bar dataKey="margin_usd" name="가공 스프레드 ($/t)" radius={[0, 4, 4, 0]}>
            {data.map((d: any, i: number) => (
              <Cell key={i} fill={d.margin_usd > 0 ? `rgba(16, 185, 129, ${0.4 + Math.min(d.margin_usd / 5000, 0.6)})` : 'rgba(239, 68, 68, 0.5)'} />
            ))}
          </Bar>
        </BarChart>
      )}
    </div>
  );

  return (
    <WidgetCard
      title="가공 차익의 승자들"
      icon={Scissors}
      iconColor="#a78bfa"
      pillar="S2"
      cardDesc="2023년 기준 수입→수출 가공 스프레드 상위 국가 — 가공 인프라 투자 ROI 판단"
      telemetry={{ status: 'STATIC' }}
      customBody={customBody}
      takeaway={{
        situation: "호주가 톤당 $11,508의 최고 마진 달성률을 보이고 선별적인 프리미엄 시장 수요를 파고들었으며, 폴란드($3,178/t), 체코($2,558/t) 등 주요 유럽 인접국들이 동유럽 중심의 견고한 가공 스프레드를 기록하고 있어 서유럽 향 '밸류업 팩토리' 역할을 지속 중입니다. 반면 한국은 단순 벌크 원물 수입 후 유사한 가격대에 재수출되는 비효율(Inefficiency)적 중계 물동량이 많아 부가가치 창출 구조 개선이 절실합니다.",
        actionPlan: "동유럽/폴란드식 고수익 가공 모델을 참고하여 수입산 펠라직 어종을 HMR(간편식)·구이용 필레·양념 및 특수 포장 제품 등 2차 가공품으로 전환할 자체 인프라를 구축해야 합니다. 또한 호주 사례와 같이 철저히 시장을 분리하여 저가 대량 유통과 고가 소량 프리미엄 시장(수출 및 내수)을 동시에 타겟팅하는 '프라이싱 이원화' 전략을 수립.",
        source: "FAO FishStatJ Import/Export Price Spread Analysis (2023)"
      }}
    />
  );
}
