'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Package } from 'lucide-react';
import WidgetCard from './WidgetCard';
import portfolioData from '../data/squid_import_portfolio.json';

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
      cardDesc={`냉동 원물 중심에서 양념·가공 오징어의 비중이 꾸준히 확대 — 양념 오징어 수입 +${seasonedGrowth}% 급증`}
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={380}
      chart={
        <BarChart data={portfolioData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
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
        situation: "한국의 전체 오징어 수입액 중 단순 '냉동 원물' 비중은 축소되는 반면, 고부가가치 '양념/가공품' 비중이 최근 10년간 폭발적으로 증가(양념 오징어 +245%)했습니다. 특히 자국 어획량 붕괴(연 1.3만 톤)로 인해 페루산 훔볼트 오징어(Pota) 원물과 이를 가공한 중국산 진미채가 하위 원자재 시장을 완전히 장악하며 '수입 품목 스펙트럼의 질적 편재화'가 발생했습니다.",
        actionPlan: "페루 및 칠레의 대왕오징어를 단순 수입하는 차원을 넘어, 가공 단가가 저렴한 베트남(혹은 현지)을 경유하여 완전 가공된 HMR(가정간편식) 및 양념육 형태로 반입하는 우회 포트폴리오를 다각화하십시오. 수입 후 국내 가공 방식은 최저임금 상승과 조정관세(22%) 부담으로 인해 역마진 리스크가 크므로, 완제품 해외 OEM 소싱 비율을 60% 이상으로 끌어올리는 것이 핵심입니다.",
        source: "옵시디안 오징어_마스터_인덱스 & FAO FishStatJ Trade Flow / 관세청 HS코드 수입통계",
      }}
    />
  );
}
