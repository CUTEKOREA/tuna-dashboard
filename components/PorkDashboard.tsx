// @ts-nocheck
'use client';
import React, { useState } from 'react';
import { Factory, TrendingUp, Globe, ShoppingCart, Leaf, Database, Activity, Clock } from 'lucide-react';
import styles from './MackerelStrategy.module.css';
import { W1_ASFCycle, W2_FeedMargin, W3_TradeSpread, W4_ESG, W5_Top10, W6_Trend, W7_KoreaSupply, W8_ImportPartners, W9_ASFSeafood, W10_Portfolio, W11_SelfSufficiency } from './PorkWidgets';

const TelemetryBadge = ({ status, syncDate }: any) => {
  if (!status) return null;
  const c = status === 'live'
    ? { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#34d399', dot: '#10b981' }
    : { bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.3)', text: '#7dd3fc', dot: '#38bdf8' };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: c.bg, border: `1px solid ${c.border}`, padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 600, color: c.text }}>
      {status === 'live' ? <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.dot, boxShadow: `0 0 6px ${c.dot}`, animation: 'pulse 2s infinite' }} /> : <Clock size={10} color={c.dot} />}
      {status.toUpperCase()} {syncDate && <span style={{ opacity: 0.7, marginLeft: '2px', fontWeight: 400 }}>{syncDate}</span>}
    </div>
  );
};

const KPIS = [
  { title: '글로벌 돈육 생산량 (2024)', value: '57,948천톤', trend: '📊', desc: '전년비 -1.5% 소폭 감소', telemetry: 'synced', syncDate: 'FAOSTAT', color: '#f43f5e' },
  { title: '한국 1인당 소비량', value: '41.4kg', trend: '📈', desc: '10년간 +34% 폭증', telemetry: 'synced', syncDate: 'FBS 22Y', color: '#ec4899' },
  { title: '한국 총 수입량 (2022)', value: '663천톤', trend: '🚢', desc: '스페인+미국 52.8% 장악', telemetry: 'synced', syncDate: 'TM 22Y', color: '#8b5cf6' },
  { title: 'ASF 최대 충격폭', value: '-20.9%', trend: '⚠️', desc: '2019 중국 생산량 급감', telemetry: 'synced', syncDate: 'QCL', color: '#ef4444' },
  { title: '돈육 탄소 배출', value: '12.3kg', trend: '🌱', desc: 'CO2e/kg — 수산물 대비 6배', telemetry: 'synced', syncDate: 'FAO', color: '#10b981' },
  { title: '한국 돈육 자급률', value: '66%', trend: '🎯', desc: '34% 구조적 수입 의존', telemetry: 'synced', syncDate: 'PSD', color: '#f59e0b' },
];

const PILLARS = [
  { id: 'P1', title: '🐷 Pillar I — 원료 수급', desc: '글로벌 생산량 모니터링 및 ASF 질병 헤징 전략', color: '#f43f5e', widgets: ['W1', 'W5', 'W6', 'W9'] },
  { id: 'P2', title: '🏭 Pillar II — 가공 및 생산', desc: '사료가 연동 마진 관리 및 단백질 포트폴리오 최적화', color: '#ec4899', widgets: ['W2', 'W10'] },
  { id: 'P3', title: '🚢 Pillar III — 물류 및 통관', desc: '대륙간 무역 단가 스프레드 및 수입 파트너 다변화', color: '#8b5cf6', widgets: ['W3', 'W8'] },
  { id: 'P4', title: '📈 Pillar IV — 판매 및 수요', desc: '한국 수급 구조 분석 및 자급률 갭 공략', color: '#f97316', widgets: ['W7', 'W11'] },
  { id: 'P5', title: '🌱 Pillar V — ESG 및 지속가능성', desc: '탄소 배출 비교 및 그린 프리미엄 전략', color: '#10b981', widgets: ['W4'] },
];

const WIDGET_MAP: Record<string, React.FC<any>> = {
  W1: W1_ASFCycle, W2: W2_FeedMargin, W3: W3_TradeSpread, W4: W4_ESG,
  W5: W5_Top10, W6: W6_Trend, W7: W7_KoreaSupply, W8: W8_ImportPartners,
  W9: W9_ASFSeafood, W10: W10_Portfolio, W11: W11_SelfSufficiency,
};

export default function PorkDashboard() {

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Factory size={24} color="#f43f5e" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#f8fafc' }}>
                🐷 돼지고기(Pork) 글로벌 밸류체인 대시보드
              </h1>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                [V4.2 S-Grade] FAOSTAT 실데이터 기반 글로벌 돈육 공급망 · 수산물 대체 탄력성 분석 (11개 위젯)
              </p>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: '#181818', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#94a3b8' }}>
            <span style={{ color: '#f43f5e' }}>PEF Command Center:</span> FAOSTAT Synced
          </div>
        </div>
      </header>

      {/* ═══ KPIs ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {KPIS.map((kpi, idx) => (
          <div key={idx} style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: `radial-gradient(circle,${kpi.color}40,transparent)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{kpi.title}</span>
              <TelemetryBadge status={kpi.telemetry} syncDate={kpi.syncDate} />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>{kpi.value}</div>
            <div style={{ fontSize: '0.68rem', color: kpi.color, fontWeight: 600 }}>
              <span style={{ background: `${kpi.color}20`, padding: '2px 5px', borderRadius: '4px', marginRight: '4px' }}>{kpi.trend}</span>{kpi.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ 5-PILLAR ARCHITECTURE ═══ */}
      {PILLARS.map((sec) => (
        <div key={sec.id} style={{ marginBottom: '4rem' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '4px', height: '28px', background: `linear-gradient(180deg,${sec.color},${sec.color}99)`, borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px' }}>{sec.title}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{sec.desc}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {sec.widgets.map((wId) => {
              const Comp = WIDGET_MAP[wId];
              if (!Comp) return null;
              return <Comp key={wId} accent={sec.color} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
