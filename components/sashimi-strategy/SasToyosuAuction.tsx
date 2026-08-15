'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { Gavel } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const auctionPrices = [
  { year: '2023', price: 36, priceUsd: 0.23, weight: 212 },
  { year: '2024', price: 114, priceUsd: 0.74, weight: 238 },
  { year: '2025', price: 270, priceUsd: 1.75, weight: 276 },
  { year: '2026', price: 510.3, priceUsd: 3.2, weight: 243 },
];

const marketStructure = [
  { label: '일일 경매', value: '~200마리', desc: '참다랑어 기준', color: '#f59e0b' },
  { label: '공인 도매상', value: '5개사', desc: '어협→도매 독점 매입', color: '#ef4444' },
  { label: '仲卸 (중개)', value: '~460개사', desc: '약 1/3이 참치 전문', color: '#a78bfa' },
  { label: '어부 수취율', value: '~80%', desc: '나머지 20% = 수수료·운송', color: '#10b981' },
];

const priceRanges = [
  { grade: '일반 거래', range: '¥8,000-10,000/kg', color: '#38bdf8' },
  { grade: '연말 피크', range: '¥20,000+/kg', color: '#f59e0b' },
  { grade: '초고가 (특별)', range: '¥100,000+/kg', color: '#ef4444' },
];

const japanMarket = {
  current: 'USD 1.94B',
  forecast: 'USD 2.53B',
  cagr: '2.98%',
  year: '2033',
};

export default function SasToyosuAuction() {
  return (
    <WidgetCard
      id="W-SAS27"
      title="🇯🇵 도요스 경매 & 일본 사시미 시장"
      icon={Gavel}
      iconColor="#ef4444"
      pillar="S1"
      cardDesc="세계 최대 수산물 도매시장 — 신년 경매 기네스, 경매 구조, 일본 $1.94B 시장"
      telemetry={{ status: 'STATIC', syncDate: '2026' }}
      takeaway={{
        situation: "도요스 시장은 일일 ~200마리의 참다랑어가 경매되며, 5개 공인 도매상→460개 仲卸의 2단계 유통 구조입니다. 2026년 신년 첫 경매에서 243kg 오마 참다랑어가 ¥510.3M($3.2M)에 낙찰되어 기네스 신기록을 세웠습니다(4년간 14배 상승). 일본 참치 시장은 $1.94B(2024) → $2.53B(2033) CAGR 2.98% 성장 전망입니다.",
        actionPlan: "도요스 경매가는 '마케팅 비용'적 성격이 강하지만, 일상 거래가(¥8-10K/kg)가 글로벌 사시미 벤치마크입니다. 한국 원양 연승 어획물의 시미즈항 직접 양륙 → 도요스 상장 루트와, 부산 가공 → 상사/仲卸 경유 루트를 병행하는 이중 채널 전략이 유효합니다.",
        source: "Nippon.com Toyosu, Bernama Guinness Record 2026, Japan Tuna Market Trends 2033",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {/* Auction Price Chart */}
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--w-slate-400)', marginBottom: '6px' }}>
              🐟 도요스 신년 첫 경매 낙찰가 (¥ 백만)
            </div>
            <div style={{ height: 160, width: '100%' }}>
              <SafeResponsiveContainer width="100%" height="100%">
                <BarChart data={auctionPrices} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="year" stroke="var(--w-slate-500)" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--w-slate-500)" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `¥${v}M`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: 'rgba(30,41,59,0.95)', color: 'var(--w-slate-200)' }}
                    formatter={(value: unknown) => [`¥${value}M`, '낙찰가']}
                    labelFormatter={(label) => `${label}년 신년 경매`}
                  />
                  <Bar dataKey="price" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                    {auctionPrices.map((entry, i) => (
                      <Cell key={i} fill={i === auctionPrices.length - 1 ? 'var(--w-red-500)' : 'var(--w-amber-500)'} />
                    ))}
                  </Bar>
                </BarChart>
              </SafeResponsiveContainer>
            </div>
            <div style={{
              textAlign: 'center', fontSize: '0.62rem', color: 'var(--w-red-500)', fontWeight: 600, marginTop: '4px',
            }}>
              🏆 2026년 ¥510.3M ($3.2M) — 기네스 세계신기록 (4년간 14배)
            </div>
          </div>

          {/* Market Structure */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {marketStructure.map((m) => (
              <div key={m.label} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px',
                border: '1px solid rgba(140,170,255,0.12)', textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--w-slate-400)', marginTop: '1px' }}>{m.label}</div>
                <div style={{ fontSize: '0.52rem', color: 'var(--w-slate-500)', marginTop: '1px' }}>{m.desc}</div>
              </div>
            ))}
          </div>

          {/* Price ranges + Market forecast */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{
              padding: '10px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(140,170,255,0.12)',
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--w-slate-300)', marginBottom: '6px' }}>일상 거래가</div>
              {priceRanges.map((p) => (
                <div key={p.grade} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '0.65rem' }}>
                  <span style={{ color: 'var(--w-slate-400)' }}>{p.grade}</span>
                  <span style={{ color: p.color, fontWeight: 600 }}>{p.range}</span>
                </div>
              ))}
            </div>
            <div style={{
              padding: '10px', borderRadius: '8px',
              background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)',
              textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{ fontSize: '0.62rem', color: 'var(--w-slate-500)' }}>일본 참치 시장 전망</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--w-sky-400)', margin: '4px 0' }}>
                {japanMarket.current} → {japanMarket.forecast}
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--w-slate-400)' }}>CAGR {japanMarket.cagr} ({japanMarket.year})</div>
            </div>
          </div>
        </div>
      }
    />
  );
}
