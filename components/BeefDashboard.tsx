// @ts-nocheck
'use client';
import React from 'react';
import { Beef, TrendingUp, Globe, ShoppingCart, Leaf, Activity, Clock } from 'lucide-react';
import styles from './MackerelStrategy.module.css';
import {
  W1_ProductionTrend, W2_Top5Producers, W3_SlaughterUtil, W4_FeedMargin,
  W5_TradeFlow, W6_KoreaImports, W7_KoreaSupply, W8_PriceGap,
  W9_DiseaseRisk, W10_CarbonFootprint, W11_Premium
} from './BeefWidgets';

const TelemetryBadge = ({ status, syncDate }: any) => {
  if (!status) return null;
  const c = status === 'live'
    ? { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#34d399', dot: '#10b981' }
    : { bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.3)', text: '#fca5a5', dot: '#dc2626' };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: c.bg, border: `1px solid ${c.border}`, padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 600, color: c.text }}>
      {status === 'live' ? <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.dot, boxShadow: `0 0 6px ${c.dot}`, animation: 'pulse 2s infinite' }} /> : <Clock size={10} color={c.dot} />}
      {status.toUpperCase()} {syncDate && <span style={{ opacity: 0.7, marginLeft: '2px', fontWeight: 400 }}>{syncDate}</span>}
    </div>
  );
};

const KPIS = [
  { title: '글로벌 소고기 생산량 (2024)', value: '73,862천톤', trend: '📊', desc: '10년 +8.9% 완만 성장', telemetry: 'synced', syncDate: 'FAOSTAT QCL', color: '#dc2626' },
  { title: '한국 1인당 소비량', value: '14.5kg', trend: '📈', desc: '10년간 +25% 꾸준 성장', telemetry: 'synced', syncDate: 'FBS 23Y', color: '#e11d48' },
  { title: '한국 총 수입량 (2023)', value: '521천톤', trend: '🚢', desc: '미·호 양강 83.7% 장악', telemetry: 'synced', syncDate: 'KCS TM 23Y', color: '#f43f5e' },
  { title: '한우 vs 호주산 가격 갭', value: '1.94배', trend: '⚠️', desc: '한우 ₩22.8K vs 호주 ₩11.8K', telemetry: 'synced', syncDate: 'KAMIS 24Y', color: '#fb923c' },
  { title: '소고기 탄소 배출', value: '99.5kg', trend: '🌱', desc: 'CO2e/kg — 돈육 대비 8배', telemetry: 'synced', syncDate: 'FAO LEAP', color: '#f59e0b' },
  { title: '한국 소고기 자급률', value: '36.9%', trend: '🎯', desc: '10년 -10.6%p 폭락', telemetry: 'synced', syncDate: 'KOSIS 23Y', color: '#fbbf24' },
];

const PILLARS = [
  { id: 'P1', title: '🐂 Pillar I — 원료 수급', desc: '글로벌 생산 동향 및 미·브라질 양강 공급 구조', color: '#dc2626', widgets: ['W1', 'W2'] },
  { id: 'P2', title: '🏭 Pillar II — 가공 및 생산', desc: '도축장 가동률 사이클 + 사료 곡물가 마진 압박', color: '#e11d48', widgets: ['W3', 'W4'] },
  { id: 'P3', title: '🚢 Pillar III — 물류 및 통관', desc: '글로벌 무역 흐름 + 한국 수입 파트너 다변화', color: '#f43f5e', widgets: ['W5', 'W6'] },
  { id: 'P4', title: '📈 Pillar IV — 판매 및 수요', desc: '한국 수급 구조 + 한우·수입육 가격 갭 + 질병 리스크', color: '#fb923c', widgets: ['W7', 'W8', 'W9'] },
  { id: 'P5', title: '🌱 Pillar V — ESG 및 지속가능성', desc: '탄소 발자국 비교 + 그래스피드·유기농 프리미엄', color: '#f59e0b', widgets: ['W10', 'W11'] },
];

const WIDGET_MAP: Record<string, React.FC<any>> = {
  W1: W1_ProductionTrend, W2: W2_Top5Producers, W3: W3_SlaughterUtil, W4: W4_FeedMargin,
  W5: W5_TradeFlow, W6: W6_KoreaImports, W7: W7_KoreaSupply, W8: W8_PriceGap,
  W9: W9_DiseaseRisk, W10: W10_CarbonFootprint, W11: W11_Premium,
};

export default function BeefDashboard() {

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'linear-gradient(135deg, #dc2626, #e11d48, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Beef size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#f8fafc' }}>
                🐂 소고기(Beef) 글로벌 밸류체인 대시보드
              </h1>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                [V4.2 S-Grade] FAOSTAT·KOSIS·KAMIS·WOAH 실데이터 기반 한우/수입육 공급망 + 광우병 리스크 분석 (11개 위젯)
              </p>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: '#181818', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#94a3b8' }}>
            <span style={{ color: '#dc2626' }}>PEF 지휘본부:</span> FAOSTAT 동기화 완료
          </div>
        </div>
      </header>

      {/* ═══ KPIs ═══ */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
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
          <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
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
