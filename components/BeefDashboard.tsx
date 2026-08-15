'use client';
import React, { useState } from 'react';
import { Beef } from 'lucide-react';
import {
  W1_ProductionTrend, W2_Top5Producers, W3_SlaughterUtil, W4_FeedMargin,
  W5_TradeFlow, W6_KoreaImports, W7_KoreaSupply, W8_PriceGap,
  W9_DiseaseRisk, W10_CarbonFootprint, W11_Premium
} from './BeefWidgets';
import BeefUsdaWidgets from './BeefUsdaWidgets';
import { InsightFeedCostSpread, InsightCutTracker, InsightDiseaseRadar } from './BeefEmpiricalInsights';
import { TelemetryBadge } from './TelemetryBadge';
import { getUsdaWidgetData } from '@/lib/data/usda-widgets';

const beefUsdaRaw = getUsdaWidgetData('beef');

const KPIS = [
  { title: '글로벌 소고기 생산량 (2024)', value: '73,862천톤', trend: '📊', desc: '10년 +8.9% 완만 성장', telemetry: 'synced', syncDate: 'FAOSTAT QCL', color: '#dc2626' },
  { title: '한국 1인당 소비량', value: '14.5kg', trend: '📈', desc: '10년간 +25% 꾸준 성장', telemetry: 'synced', syncDate: 'FBS 23Y', color: '#e11d48' },
  { title: '한국 총 수입량 (2023)', value: '521천톤', trend: '🚢', desc: '미·호 양강 83.7% 장악', telemetry: 'synced', syncDate: 'KCS TM 23Y', color: '#f43f5e' },
  { title: '한우 vs 호주산 가격 갭', value: '1.94배', trend: '⚠️', desc: '한우 ₩22.8K vs 호주 ₩11.8K', telemetry: 'synced', syncDate: 'KAMIS 24Y', color: '#fb923c' },
  { title: '소고기 탄소 배출', value: '99.5kg', trend: '🌱', desc: 'CO2e/kg — 돈육 대비 8배', telemetry: 'synced', syncDate: 'FAO LEAP', color: '#f59e0b' },
  { title: '한국 소고기 자급률', value: '36.9%', trend: '🎯', desc: '10년 -10.6%p 폭락', telemetry: 'synced', syncDate: 'KOSIS 23Y', color: '#fbbf24' },
] as const;

// 5-Pillar 네비게이터 메타 (소고기 시그니처 그라디언트 — 룰북 D-04 red→rose→amber)
const PILLARS = [
  { id: 'P1', num: '❶', label: '원료 수급', title: '🐂 Pillar I — 원료 수급', desc: '글로벌 생산 동향 및 미·브라질 양강 공급 구조', color: '#dc2626', widgets: ['W1', 'W2'] },
  { id: 'P2', num: '❷', label: '가공·생산', title: '🏭 Pillar II — 가공 및 생산', desc: '도축장 가동률 사이클 + 사료 곡물가 마진 압박', color: '#e11d48', widgets: ['W3', 'W4'] },
  { id: 'P3', num: '❸', label: '물류·통관', title: '🚢 Pillar III — 물류 및 통관', desc: '글로벌 무역 흐름 + 한국 수입 파트너 다변화', color: '#f43f5e', widgets: ['W5', 'W6'] },
  { id: 'P4', num: '❹', label: '판매·수요', title: '📈 Pillar IV — 판매 및 수요', desc: '한국 수급 구조 + 한우·수입육 가격 갭 + 질병 리스크', color: '#fb923c', widgets: ['W7', 'W8', 'W9'] },
  { id: 'P5', num: '❺', label: 'ESG·지속가능성', title: '🌱 Pillar V — ESG 및 지속가능성', desc: '탄소 발자국 비교 + 그래스피드·유기농 프리미엄', color: '#f59e0b', widgets: ['W10', 'W11'] },
];

const WIDGET_MAP: Record<string, React.FC<any>> = {
  W1: W1_ProductionTrend, W2: W2_Top5Producers, W3: W3_SlaughterUtil, W4: W4_FeedMargin,
  W5: W5_TradeFlow, W6: W6_KoreaImports, W7: W7_KoreaSupply, W8: W8_PriceGap,
  W9: W9_DiseaseRisk, W10: W10_CarbonFootprint, W11: W11_Premium,
};

// 헤더 위젯 카운트 — 하드코딩 금지(패턴 I), 실렌더 구성에서 동적 산출
const INSIGHT_COMPONENTS = [InsightFeedCostSpread, InsightCutTracker, InsightDiseaseRadar];
const TOTAL_WIDGET_COUNT = Object.keys(WIDGET_MAP).length
  + ((beefUsdaRaw as any).widgets?.length || 0)
  + INSIGHT_COMPONENTS.length;

export default function BeefDashboard() {
  const [activePart, setActivePart] = useState<'P1' | 'P2' | 'P3' | 'P4' | 'P5'>('P1');

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--w-slate-50)', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>

      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'linear-gradient(135deg, #dc2626, #e11d48, var(--w-amber-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Beef size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--w-slate-50)' }}>
                🐂 소고기(Beef) 글로벌 밸류체인 대시보드
              </h1>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--w-slate-400)' }}>
                [V4.2 S-Grade] FAOSTAT·KOSIS·KAMIS·WOAH 실데이터 기반 한우/수입육 공급망 + 광우병 리스크 분석 ({TOTAL_WIDGET_COUNT}개 위젯)
              </p>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: '#11182f', border: '1px solid rgba(140,170,255,0.10)', borderRadius: '8px', color: 'var(--w-slate-400)' }}>
            <span style={{ color: '#dc2626' }}>PEF 지휘본부:</span> FAOSTAT 동기화 완료
          </div>
        </div>
      </header>

      {/* ═══ KPIs ═══ */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {KPIS.map((kpi, idx) => (
          <div key={idx} style={{ background: '#11182f', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '60px', height: '60px', borderRadius: '50%', background: `radial-gradient(circle,${kpi.color}40,transparent)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)', fontWeight: 600 }}>{kpi.title}</span>
              <TelemetryBadge status={kpi.telemetry} syncDate={kpi.syncDate} />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--w-slate-50)', marginTop: '4px' }}>{kpi.value}</div>
            <div style={{ fontSize: '0.68rem', color: kpi.color, fontWeight: 600 }}>
              <span style={{ background: `${kpi.color}20`, padding: '2px 5px', borderRadius: '4px', marginRight: '4px' }}>{kpi.trend}</span>{kpi.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ 5-Pillar 밸류체인 네비게이터 ═══ */}
      <div style={{ background: 'linear-gradient(180deg, rgba(20, 28, 52, 0.5), rgba(20, 28, 52, 0.2))', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '6px', marginBottom: '2rem', boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(140,170,255,0.10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '4px 0 8px', borderBottom: '1px solid rgba(140,170,255,0.10)', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(var(--w-slate-400-rgb), 0.7)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>밸류체인 네비게이터 — 아래 단계를 클릭하여 탐색하세요</span>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {PILLARS.map((s, idx) => {
            const isActive = activePart === s.id;
            return (
              <button key={s.id} onClick={() => setActivePart(s.id as any)}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(140,170,255,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = `${s.color}40`; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'transparent'; } }}
                style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 8px 14px', background: isActive ? `${s.color}12` : 'transparent', border: `1.5px solid ${isActive ? s.color : 'transparent'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: isActive ? `0 0 20px ${s.color}25, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none', overflow: 'hidden' }}>
                {isActive && (<div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px', background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`, borderRadius: '3px 3px 0 0' }} />)}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? s.color : 'rgba(140,170,255,0.12)', color: isActive ? '#0a0f1f' : 'rgba(var(--w-slate-400-rgb), 0.6)', fontSize: '0.75rem', fontWeight: 800, boxShadow: isActive ? `0 0 12px ${s.color}50` : 'none' }}>{idx + 1}</div>
                <span style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, color: isActive ? s.color : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ 5-PILLAR ARCHITECTURE (activePart 필터링) ═══ */}
      {PILLARS.filter(s => s.id === activePart).map((sec) => (
        <div key={sec.id} style={{ marginBottom: '4rem' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '4px', height: '28px', background: `linear-gradient(180deg,${sec.color},${sec.color}99)`, borderRadius: '2px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--w-slate-50)', letterSpacing: '-0.3px' }}>{sec.title}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--w-slate-400)' }}>{sec.desc}</p>
            </div>
          </div>
          <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {sec.widgets.map((wId) => {
              const Comp = WIDGET_MAP[wId];
              if (!Comp) return null;
              return <Comp key={wId} accent={sec.color} />;
            })}
            {/* 🆕 USDA FAS Beef 인텔리전스 (S1=중국 TRQ / S3=등록 갱신 / S4=한국 시계열·Top5·대중국) */}
            {sec.id === 'P1' && <BeefUsdaWidgets filterPillar="S1" />}
            {sec.id === 'P3' && <BeefUsdaWidgets filterPillar="S3" />}
            {sec.id === 'P4' && <BeefUsdaWidgets filterPillar="S4" />}
            {/* 🆕 실증 인사이트 (Empirical Insights) */}
            {sec.id === 'P2' && <InsightFeedCostSpread accent={sec.color} />}
            {sec.id === 'P4' && <InsightCutTracker accent={sec.color} />}
            {sec.id === 'P4' && <InsightDiseaseRadar accent={sec.color} />}
          </div>
        </div>
      ))}
    </div>
  );
}
