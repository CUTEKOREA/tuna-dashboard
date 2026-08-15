'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

const productionData = {
  total: { volume: '479,000t', value: '1.53조원', growth: '+16.8%' },
  gear: [
    { type: '선망 (Purse Seine)', volume: '288,742t', unitPrice: '2,003원/kg', purpose: '캐닝용', color: '#38bdf8', pct: 60 },
    { type: '연승 (Longline)', volume: '46,619t', unitPrice: '6,722원/kg', purpose: '사시미용', color: '#f59e0b', pct: 10 },
    { type: '기타', volume: '143,639t', unitPrice: '-', purpose: '혼합', color: '#64748b', pct: 30 },
  ],
  species: [
    { name: '가다랑어', volume: '249,196t', growth: '+23.5%', price: '1,910', color: '#38bdf8' },
    { name: '황다랑어', volume: '56,516t', growth: '-6.6%', price: '3,761', color: '#10b981' },
    { name: '눈다랑어', volume: '21,960t', growth: '-11.3%', price: '7,093', color: '#a78bfa' },
    { name: 'SBT', volume: '1,326t', growth: '-', price: '17,447', color: '#ef4444' },
  ],
  trade: { exports: '$543M', imports: '$128M', ratio: '4.2x 순수출' },
};

export default function SasKoreaProductionStructure() {
  return (
    <WidgetCard
      id="W-SAS13"
      title="한국 참치 생산 구조 (이중 구조)"
      description="선망(캐닝) vs 연승(사시미) 이중 생산 체계"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="한국의 어법별·어종별 참치 생산량과 단가, 수출입 구조를 Sankey 흐름도로 시각화"
      takeaway={{
        situation: '한국은 세계 6위 참치 생산국으로 2024년 479,000t(전년 대비 +16.8%), 1.53조원을 생산했습니다. 선망(캐닝용) 288,742t vs 연승(사시미용) 46,619t으로, 연승의 kg당 단가(6,722원)는 선망(2,003원)의 3.3배입니다. 수출 $543M vs 수입 $128M으로 4.2배 순수출국입니다.',
        actionPlan: '연승 사시미용 어획은 물량(10%)은 적지만 부가가치는 3.3배 높습니다. 가다랑어 가격 하락 시 연승 사시미 비중을 확대하는 구조적 전환이 수익성 방어의 핵심입니다.',
        source: 'KR Sashimi Steak Market Dossier (KOSTAT/KOSIS 2024)',
      }}
      customBody={
        <div style={{ padding: '8px 0' }}>
          {/* ── Total Banner ── */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '24px', padding: '10px 16px',
            background: 'linear-gradient(90deg, rgba(56,189,248,0.08), rgba(245,158,11,0.08))',
            borderRadius: '8px', marginBottom: '16px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)' }}>총 생산량</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--w-slate-200)' }}>{productionData.total.volume}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)' }}>총 생산액</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--w-slate-200)' }}>{productionData.total.value}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)' }}>전년 대비</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--w-emerald-500)' }}>{productionData.total.growth}</div>
            </div>
          </div>

          {/* ── 3-Tier Flow ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: '0', alignItems: 'stretch', minHeight: '260px' }}>

            {/* ── LEFT: Gear Types ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--w-slate-500)', textAlign: 'center', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>어법 (Gear)</div>
              {productionData.gear.map((g, i) => (
                <div key={i} style={{
                  background: `${g.color}12`, border: `1px solid ${g.color}30`,
                  borderLeft: `3px solid ${g.color}`, borderRadius: '6px', padding: '10px 12px',
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: g.color }}>{g.type}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--w-slate-200)', fontWeight: 700, marginTop: '2px' }}>{g.volume}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--w-slate-400)' }}>{g.unitPrice}</span>
                    <span style={{
                      fontSize: '0.65rem', background: `${g.color}25`, color: g.color,
                      padding: '1px 6px', borderRadius: '4px', fontWeight: 600,
                    }}>{g.purpose}</span>
                  </div>
                  {/* Percentage bar */}
                  <div style={{ marginTop: '6px', background: 'var(--w-navy-900)', borderRadius: '3px', height: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${g.pct}%`, height: '100%', background: g.color, borderRadius: '3px' }} />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--w-slate-500)', marginTop: '2px', textAlign: 'right' }}>{g.pct}%</div>
                </div>
              ))}
            </div>

            {/* ── Arrow 1 ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <svg width="24" height="120" viewBox="0 0 24 120">
                  <defs>
                    <linearGradient id="arrow1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--w-sky-400)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="var(--w-amber-500)" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <path d="M12 0 L12 100 M6 94 L12 106 L18 94" fill="none" stroke="url(#arrow1)" strokeWidth={2} />
                </svg>
                <div style={{ fontSize: '0.6rem', color: 'var(--w-slate-500)', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>어획→어종</div>
              </div>
            </div>

            {/* ── CENTER: Species ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--w-slate-500)', textAlign: 'center', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>어종 (Species)</div>
              {productionData.species.map((s, i) => (
                <div key={i} style={{
                  background: `${s.color}10`, border: `1px solid ${s.color}25`,
                  borderRadius: '6px', padding: '8px 12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: s.color }}>{s.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-300)', marginTop: '2px' }}>{s.volume}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '0.7rem', fontWeight: 600,
                      color: s.growth.startsWith('+') ? 'var(--w-emerald-500)' : s.growth === '-' ? 'var(--w-slate-500)' : 'var(--w-red-500)',
                    }}>{s.growth}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--w-slate-400)', marginTop: '2px' }}>₩{s.price}/kg</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Arrow 2 ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <svg width="24" height="120" viewBox="0 0 24 120">
                  <defs>
                    <linearGradient id="arrow2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--w-emerald-500)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <path d="M12 0 L12 100 M6 94 L12 106 L18 94" fill="none" stroke="url(#arrow2)" strokeWidth={2} />
                </svg>
                <div style={{ fontSize: '0.6rem', color: 'var(--w-slate-500)', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>어종→무역</div>
              </div>
            </div>

            {/* ── RIGHT: Trade ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--w-slate-500)', textAlign: 'center', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>무역 (Trade)</div>
              <div style={{
                background: '#10b98112', border: '1px solid #10b98130',
                borderRadius: '8px', padding: '14px',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)' }}>수출</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--w-emerald-500)' }}>{productionData.trade.exports}</div>
              </div>
              <div style={{
                background: '#ef444412', border: '1px solid #ef444430',
                borderRadius: '8px', padding: '14px',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)' }}>수입</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--w-red-500)' }}>{productionData.trade.imports}</div>
              </div>
              <div style={{
                background: '#a78bfa12', border: '1px solid #a78bfa30',
                borderRadius: '8px', padding: '10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a78bfa' }}>{productionData.trade.ratio}</div>
              </div>
            </div>
          </div>

          {/* ── Price Premium Callout ── */}
          <div style={{
            marginTop: '16px', padding: '12px 16px',
            background: 'linear-gradient(90deg, #f59e0b15, #38bdf815)',
            border: '1px solid #f59e0b30', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="var(--w-amber-500)" strokeWidth="1.5" />
              <path d="M10 6v5M10 13v1" stroke="var(--w-amber-500)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--w-amber-500)' }}>
              선망 vs 연승: 3.3배 가격 프리미엄
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)' }}>
              (2,003원/kg → 6,722원/kg)
            </span>
          </div>
        </div>
      }
    />
  );
}
