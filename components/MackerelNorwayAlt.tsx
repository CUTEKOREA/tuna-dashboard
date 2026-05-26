'use client';

import React, { useRef, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Shield } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel_norway_alt.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

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

  const customBody = (
    <div ref={chartRef} style={{ width: '100%' }}>
      {chartWidth > 0 && (
        <BarChart width={chartWidth} height={400} data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 20 }}>
          <ChartPatternDefs />
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
  );

  return (
    <WidgetCard
      title="공급선 다변화: 노르웨이 독점 대항마"
      icon={Shield}
      iconColor="#60a5fa"
      pillar="S1"
      cardDesc="글로벌 Top 12 수출국의 점유율 변화 — 신흥 소싱처 조기 감지"
      telemetry={{ status: 'STATIC' }}
      customBody={customBody}
      takeaway={{
        situation: `<div>
<p>"TAC(Total Allowable Catch, 총허용어획량)"란 어종별 자원량 평가를 바탕으로 ICES·NEAFC가 매년 결정하는 국제 어획 쿼터. MSC 인증은 글로벌 retailer(EU·일본·한국 대형마트) 진입의 사실상 lock.</p>
<p>실측: <strong>노르웨이 TAC 52% 삭감 (16.5만 → 7.9만 톤) + MSC 인증 상실 + 환율 급등 트리플 펀치 → 수입 단가 전년比 20~30% 폭등. 한국 수입의 80~90% 단일 의존이 즉시 P&L 폭탄으로 전환</strong>.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 노르웨이 의존 80%는 단순 sourcing 편중이 아닌 <strong>"북동대서양 단일 fish stock 의존 = paper company"</strong> 수준의 fundamental risk.</p>
<p><strong>3단계</strong>: ① 칠레·영국·네덜란드 장기 공급 계약 즉시 체결 (분산 sourcing) ② 정부 TRQ 0% 제도 선제 활용 + 재고 헤지 ③ MSC 인증 미회복 장기화 대비 — 가나/아프리카 비인증 시장 판매 destination 전환 포트폴리오 구축.</p>
</div>`,
        source: "고등어 마스터 인덱스 · ICES TAC Advisory · 관세청 TRQ 고시"
      }}
    />
  );
}
