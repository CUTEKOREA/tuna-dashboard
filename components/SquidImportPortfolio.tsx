'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Package } from 'lucide-react';
import WidgetCard from './WidgetCard';
import portfolioData from '../data/squid_import_portfolio.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const CATS = [
  { key: '냉동', color: 'var(--color-info)', label: '냉동 오징어' },
  { key: '가공/조미', color: 'var(--color-warning)', label: '가공/조미' },
  { key: '양념', color: 'var(--color-danger)', label: '양념 오징어' },
  { key: '건조/염장', color: '#8b5cf6', label: '건조/염장' },
  { key: '활/신선', color: 'var(--color-success)', label: '활/신선' },
  { key: '기타', color: '#64748b', label: '기타' },
];

const PortfolioTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background: 'rgba(0, 15, 30, 0.95)', border: '1px solid rgba(245, 158, 11, 0.4)',
      padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '240px',
    }}>
      <p style={{ margin: '0 0 10px', fontWeight: 'bold', fontSize: '1.05rem', color: '#fbbf24', borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: '8px' }}>
        {d.year}년 수입 포트폴리오
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
        {CATS.map(cat => {
          const vol = d[cat.key] || 0;
          const pct = d[`${cat.key}_pct`] || 0;
          const usd = d[`${cat.key}_usd_k`] || 0;
          if (vol === 0) return null;
          return (
            <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: cat.color, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: cat.color }} />
                {cat.label}
              </span>
              <span style={{ fontWeight: 600 }}>{vol.toLocaleString()}t ({pct}%) · ${(usd / 1000).toFixed(1)}M</span>
            </div>
          );
        })}
        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '5px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>합계</span>
          <span>{d.total?.toLocaleString()}톤</span>
        </div>
      </div>
    </div>
  );
};

export default function SquidImportPortfolio() {
  const latest = portfolioData[portfolioData.length - 1] as any;
  const first = portfolioData[0] as any;
  const seasonedGrowth = latest['양념'] > 0 && first['양념'] > 0
    ? Math.round((latest['양념'] / first['양념'] - 1) * 100) : 0;

  return (
    <WidgetCard
      title="한국 오징어 수입 품목 포트폴리오 (2010-2023)"
      icon={Package}
      iconColor="#fbbf24"
      pillar="S2"
      cardDesc={`관세청(KCS) HS 수입통계 2010-2023 (illustrative; 2024-2025 갱신 필요) — 냉동 원물 중심에서 양념·가공 오징어 비중 확대, 양념 수량 +${seasonedGrowth}% 증가(2010→2023)`}
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={380}
      chart={
        <BarChart data={portfolioData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
          <Tooltip content={<PortfolioTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }} iconType="square" />
          {CATS.map(cat => (
            <Bar key={cat.key} dataKey={cat.key} name={cat.label} stackId="portfolio" fill={cat.color} fillOpacity={0.85} />
          ))}
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>"수입 포트폴리오의 질적 편재화"란 단순 원물 → 가공품으로 수입 구성이 구조 전환하는 현상.</p>
<p>실측: <strong>"양념 오징어" 수입 +76%</strong> (2010→2023, 관세청 통계). 자국 어획 감소(업계 추정) 및 중국·페루산 원료 의존 심화 추세.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 단순 원물 수입 시대 축소세. <strong>"완제품 해외 OEM 소싱"</strong> 비중 확대 방향 검토.</p>
<p><strong>3단계</strong>: ① 베트남 경유 HMR·양념육 완성 형태 포트폴리오 ② 수입 후 국내 가공은 최저임금·조정관세(22%) 부담으로 역마진 리스크 주의 ③ 완제품 해외 OEM 소싱 비율 단계적 확대 검토.</p>
</div>`,
        source: "관세청 HS코드 수입통계 (KCS, 2010-2023) / 업계추정",
      }}
    />
  );
}
