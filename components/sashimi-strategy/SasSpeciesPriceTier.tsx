'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const speciesData = [
  {
    name: '남방참다랑어 (SBT)', nameEn: 'Southern Bluefin',
    krPrice: '17,447', usPrice: '$25-50', jpPrice: '¥15,000+',
    use: '사시미/스시 최고급', grade: '오토로·주토로',
    mercury: '높음', stock: '회복 중', gear: '연승',
    color: '#ef4444', barWidth: 100,
  },
  {
    name: '참다랑어 (BFT)', nameEn: 'Atlantic Bluefin',
    krPrice: '수입 $18.79/kg', usPrice: '$26.71', jpPrice: '¥8-10K',
    use: '사시미/스시', grade: '오토로·주토로·아카미',
    mercury: '높음', stock: 'ICCAT TAC +19.3%', gear: '축양/연승',
    color: '#f59e0b', barWidth: 92,
  },
  {
    name: '눈다랑어 (Bigeye)', nameEn: 'Bigeye',
    krPrice: '7,093', usPrice: '$13.99', jpPrice: '¥3-5K',
    use: '사시미/스시/스테이크', grade: '주토로·아카미',
    mercury: '중간', stock: '자원 압박', gear: '연승/선망',
    color: '#a78bfa', barWidth: 65,
  },
  {
    name: '황다랑어 (Yellowfin)', nameEn: 'Yellowfin',
    krPrice: '3,761', usPrice: '$13.00', jpPrice: '¥2-3K',
    use: '스테이크/포케/사시미', grade: '아카미·스테이크',
    mercury: '낮음', stock: '건전', gear: '선망/연승',
    color: '#10b981', barWidth: 48,
  },
  {
    name: '가다랑어 (Skipjack)', nameEn: 'Skipjack',
    krPrice: '1,910', usPrice: '$1.5-2.5', jpPrice: '¥1-1.5K',
    use: '캔/가쓰오부시', grade: '—',
    mercury: '낮음', stock: '건전', gear: '선망',
    color: '#38bdf8', barWidth: 22,
  },
];

export default function SasSpeciesPriceTier() {
  return (
    <WidgetCard
      id="W-SAS22"
      title="어종별 가격 위계 & 용도 매트릭스"
      icon={Layers}
      iconColor="#f59e0b"
      pillar="S1"
      cardDesc="5대 참치 어종의 가격·용도·자원 상태 — 사시미급 프리미엄 구조 분석"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      takeaway={{
        situation: "사시미 참치는 SBT(17,447원/kg) > BFT(수입 $18.79/kg) > 눈다랑어(7,093) > 황다랑어(3,761) > 가다랑어(1,910)의 명확한 5단계 가격 위계를 보입니다. 연승(사시미) vs 선망(캔) 어법에 따라 3.3배 가격 차이가 발생합니다.",
        actionPlan: "황다랑어는 미국 포케·스테이크 시장에서 '가성비 사시미'로 급성장 중이며, 눈다랑어는 일본 스시 시장의 핵심 원료입니다. BFT는 ICCAT 쿼터 +19.3% 증가로 공급 확대가 예상되나, 가격 하방 압력이 동시에 작용합니다. SBT는 물량이 극히 제한적(한국 1,326t)이므로 니치 전략이 적합합니다.",
        source: "KR_KPI_metrics.csv, US_KPI_metrics.csv, GLOBEFISH",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.8fr',
            padding: '6px 10px', fontSize: '0.6rem', fontWeight: 600, color: 'var(--w-slate-500)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            borderBottom: '1px solid rgba(140,170,255,0.12)',
          }}>
            <span>어종</span><span>한국 (원/kg)</span><span>미국 ($/kg)</span><span>용도</span><span>자원 상태</span><span>수은</span>
          </div>

          {/* Rows */}
          {speciesData.map((s) => (
            <div key={s.name} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.8fr',
              padding: '10px', alignItems: 'center', borderRadius: '8px',
              background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${s.color}`,
              gap: '4px',
            }}>
              {/* Species Name */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: s.color }}>{s.name}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--w-slate-500)' }}>{s.nameEn} · {s.gear}</div>
              </div>
              {/* KR Price */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f1f5f9' }}>{s.krPrice}</div>
                {/* Price bar */}
                <div style={{ height: '3px', background: 'rgba(140,170,255,0.12)', borderRadius: '2px', marginTop: '3px', width: '100%' }}>
                  <div style={{ height: '100%', width: `${s.barWidth}%`, background: s.color, borderRadius: '2px' }} />
                </div>
              </div>
              {/* US Price */}
              <div style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)' }}>{s.usPrice}</div>
              {/* Use */}
              <div style={{ fontSize: '0.65rem', color: 'var(--w-slate-400)' }}>{s.use}</div>
              {/* Stock */}
              <div style={{ fontSize: '0.65rem', color: s.stock.includes('압박') || s.stock.includes('회복') ? 'var(--w-amber-500)' : 'var(--w-emerald-500)' }}>{s.stock}</div>
              {/* Mercury */}
              <div style={{
                fontSize: '0.6rem', fontWeight: 600,
                color: s.mercury === '높음' ? 'var(--w-red-500)' : s.mercury === '중간' ? 'var(--w-amber-500)' : 'var(--w-emerald-500)',
              }}>{s.mercury}</div>
            </div>
          ))}

          {/* Premium callout */}
          <div style={{
            marginTop: '8px', padding: '10px 14px', borderRadius: '8px',
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)',
            fontSize: '0.7rem', color: 'var(--w-slate-400)', textAlign: 'center',
          }}>
            💡 연승(사시미) <strong style={{ color: 'var(--w-amber-500)' }}>6,722원/kg</strong> vs 선망(캔) <strong style={{ color: 'var(--w-sky-400)' }}>2,003원/kg</strong> → <strong style={{ color: 'var(--w-amber-500)' }}>3.3배</strong> 가격 프리미엄
          </div>
        </div>
      }
    />
  );
}
