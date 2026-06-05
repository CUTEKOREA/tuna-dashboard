'use client';

import React, { useRef, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Globe } from 'lucide-react';
import rawData from '../data/mackerel_unit_price.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

export default function MackerelUnitPrice() {
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

  const data = (rawData as any[]).slice(0, 15);
  const maxPrice = Math.max(...data.map((d: any) => d.unit_price_usd));

  const PriceTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div style={{
        background: 'rgba(0, 15, 30, 0.95)', border: '1px solid rgba(245, 158, 11, 0.4)',
        padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '200px'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#fbbf24' }}>{d.country}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>💰 수입 단가</span><span style={{ fontWeight: 700, color: '#fbbf24' }}>${Math.round(d.unit_price_usd).toLocaleString()}/t</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>📦 수입량</span><span>{d.import_vol_t?.toLocaleString()}톤</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>💵 수입액</span><span>${d.import_val_usd_k?.toLocaleString()}K</span></div>
        </div>
      </div>
    );
  };

  const customBody = (
    <div ref={chartRef} style={{ width: '100%' }}>
      {chartWidth > 0 && (
        <BarChart width={chartWidth} height={450} data={data} margin={{ top: 10, right: 30, left: 30, bottom: 20 }} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
          <YAxis type="category" dataKey="country" width={110} stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
          <Tooltip content={<PriceTooltip />} />
          <Bar dataKey="unit_price_usd" name="수입 단가 ($/t)" radius={[0, 4, 4, 0]}>
            {data.map((d: any, i: number) => (
              <Cell key={i} fill={`rgba(245, 158, 11, ${0.3 + (d.unit_price_usd / maxPrice) * 0.7})`} />
            ))}
          </Bar>
        </BarChart>
      )}
    </div>
  );

  return (
    <WidgetCard
      title="글로벌 단위 단가 랭킹: 프리미엄 타겟 시장"
      icon={Globe}
      iconColor="#fbbf24"
      pillar="S4"
      cardDesc="2023년 가장 비싸게 고등어를 사가는 국가 Top 15 — 프리미엄 판로 배분 전략"
      telemetry={{ status: 'STATIC', syncDate: '2023' }}
      customBody={customBody}
      takeaway={{
        situation: `<div>
<p>고등어 글로벌 수입 단가 격차(FAO FishStatJ 2023): <strong>룩셈부르크 $7,479/t · 오스트리아 $7,321/t (프리미엄 완제품 상위권) vs 아프리카·아시아 벌크 시장(업계 추정 $1,500~2,000/t)</strong>. 프리미엄 대비 3~5배 격차.</p>
<p>의미: 아프리카 벌크 시장은 구조적으로 마진이 얇음. 프리미엄 niche는 단가 기준 현저히 유리한 구조.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 벌크 출혈 경쟁 폐기. <strong>"MSC/ASC 인증 = 프리미엄 시장 entry license"</strong>.</p>
<p><strong>3단계</strong>: ① 자체 조업망 MSC 인증 획득 capex 최우선 ② 인증 지연 시 아이슬란드·노르웨이 인증 파트너 물량 국내 특수 OEM 가공 ③ 선진국 메이저 리테일 재수출 라인 신설.</p>
</div>`,
        source: "FAO FishStatJ - Trade by Partner (2023) | 벌크 단가: 업계 추정"
      }}
    />
  );
}
