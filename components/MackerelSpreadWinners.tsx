'use client';

import React, { useRef, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Scissors } from 'lucide-react';
import rawData from '../data/mackerel_spread.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

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
        background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(139, 92, 246, 0.4)',
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
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
        situation: `<div>
<p>"가공 스프레드(Processing Spread)"란 원물 수입 단가와 가공품 수출 단가의 차이 = 가공 인프라 부가가치의 간접 지표. 톤당 $1,000 미만은 단순 중계 무역 수준, $3,000+ 는 고부가가치 가공 구간으로 추정.</p>
<p>데이터 기준: <strong>호주 $11,508/t(수출량 316t 소량 — 프리미엄 틈새 시장) · 폴란드 $3,178/t · 체코 $2,558/t(동유럽 가공 밸류업)</strong>. 한국은 본 데이터셋에 포함되지 않아 직접 비교 불가; 별도 KCS 통관 데이터 교차 확인 필요.</p>
</div>`,
        actionPlan: `<div>
<p><strong>방향</strong>: 단순 원물 수출(상품 경쟁)에서 벗어나 고부가가치 2차 가공(가공 스프레드 확대)으로 이동하는 것이 수익성 개선의 경로. 이를 '원자재 함정(Commodity Trap)'으로 부른다.</p>
<p><strong>3단계</strong>: ① 폴란드 모델 벤치마킹 — HMR·구이 필레·양념 2차 가공 라인 capex 검토 ② 호주 모델 참고 — 저가 벌크 / 고가 프리미엄 이원화 프라이싱 구조 ③ 가공 스프레드 $3,000/t 수준 도달을 중기 목표로 설정해 투자 ROI 재평가 기준으로 활용.</p>
</div>`,
        source: "FAO FishStatJ 고등어 수입·수출 단가 (2023) — 수입→수출 단가 차이를 가공 부가가치 지표로 해석한 자체 추정(illustrative); 품목 혼재 가능"
      }}
    />
  );
}
