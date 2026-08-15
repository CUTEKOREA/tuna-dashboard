"use client";

import React from 'react';
import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';

type MarginIndex = {
  rawCost: number;
  freight: number;
  processing: number;
  retailPrice: number;
  netMargin: string;
  analysis: string;
};

/* 시나리오 추정 지표 — 공장 가동 현황(주간보고)과 기준일이 달라 별도 카드로 분리한다 */
export default function ValueChainMarginIndex() {
  const [margin, setMargin] = React.useState<MarginIndex | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    fetch('/api/tuna-live')
      .then((res) => res.json())
      .then((data) => setMargin(data.logistics?.marginIndex ?? null))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>마진율 시나리오를 불러오지 못했습니다.</p>;
  if (!margin) return <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>마진율 시나리오를 불러오는 중입니다.</p>;

  const reportPrice = logisticsWeeklyReport.market.rawMaterialPriceUsdPerMt;
  const items = [
    { label: '원어 원가', value: margin.rawCost, accent: false },
    { label: '물류비', value: margin.freight, accent: false },
    { label: '가공비', value: margin.processing, accent: false },
    { label: '최종 판매가', value: margin.retailPrice, accent: true },
  ];

  return (
    <div style={{ background: 'var(--panel-bg)', border: '1px solid rgba(var(--w-violet-500-rgb), 0.3)', borderRadius: '8px', padding: '20px' }}>
      <div style={{ marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', padding: '2px 8px', background: 'rgba(var(--w-slate-400-rgb), 0.1)', color: 'var(--text-muted)', borderRadius: '12px', border: '1px solid rgba(var(--w-slate-400-rgb), 0.25)' }}>
          전구간 순마진(추정): {margin.netMargin}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
        {items.map((item) => (
          <span key={item.label} style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {item.label}: <strong style={{ color: item.accent ? 'var(--accent-info)' : 'var(--text-main)' }}>${item.value.toLocaleString()}</strong>
            <span style={{ fontSize: '12px' }}> (달러/톤)</span>
          </span>
        ))}
      </div>
      <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', opacity: 0.8, fontStyle: 'italic' }}>* {margin.analysis}</p>
      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', opacity: 0.8 }}>
        전제 원어 원가 ${margin.rawCost.toLocaleString()}는 2026-05-20 시나리오값입니다. {logisticsWeeklyReport.market.reportDate} 주간보고 협의가는 ${reportPrice.toLocaleString()}로 ${(margin.rawCost - reportPrice).toLocaleString()} 낮습니다.
      </p>
    </div>
  );
}
