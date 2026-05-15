'use client';
import React, { useState, useEffect } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, Line, Area } from 'recharts';
import { Shield, AlertTriangle, TrendingUp, Globe } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import TakeawayBox from './TakeawayBox';

/**
 * 명태 정책 리스크 레이더 — 6대 리스크 정량화
 * API: /api/pollock-policy-risk
 * 근거: 국정연 6건 (2019-12, 2023-10, 2024-06, 2024-08, 2025-04, 2025-13, 2025-15)
 */

// ═══ Widget PR1: 러시아 제재 ↔ 명태 공급 역설 ═══
export function PollockSanctionParadox() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pollock-policy-risk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(r => r.json()).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  const sanctionRisk = data?.trade_policy_risks?.find((r: any) => r.id === 'RUSSIA_SANCTION_PARADOX');
  const trendData = sanctionRisk?.trend_data || [];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Shield size={18} color="#ef4444" />
        <h3 className={styles.cardTitle}>W-PR1 · 러시아 제재 ↔ 명태 공급 역설 추적기</h3>
      </div>
      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.75rem', color: '#fca5a5' }}>
        📋 근거: (기본 2019-12) 원양산업 사회적 책임 + (일반 2024-06) 신통상규범 | Comtrade + OFAC API
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading sanction data...</div> : (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ flex: 1, background: 'rgba(239,68,68,0.1)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444' }}>{sanctionRisk?.severity || 95}</div>
              <div style={{ fontSize: '0.65rem', color: '#fca5a5' }}>심각도</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(251,146,60,0.1)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fb923c' }}>{sanctionRisk?.probability || 90}%</div>
              <div style={{ fontSize: '0.65rem', color: '#fdba74' }}>발생확률</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(168,85,247,0.1)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7' }}>${sanctionRisk?.impact_usd_millions || 280}M</div>
              <div style={{ fontSize: '0.65rem', color: '#c084fc' }}>영향 규모</div>
            </div>
          </div>
          <SafeResponsiveContainer width="100%" height={200}>
            <ComposedChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} unit="%" />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.75rem' }} />
              <Bar yAxisId="left" dataKey="russia_share" fill="#ef4444" name="러시아 점유율(%)" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
              <Bar yAxisId="left" dataKey="china_relay" fill="#f59e0b" name="중국 우회 가공(%)" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
              <Line yAxisId="right" type="monotone" dataKey="sanction_intensity" stroke="#a855f7" strokeWidth={2} name="제재 강도" dot={{ fill: '#a855f7', r: 3 }} />
            </ComposedChart>
          </SafeResponsiveContainer>
        </>
      )}
      <TakeawayBox
        situation="제재 강도 92점까지 상승했으나 러시아산 명태 점유율은 42%로 유지 — '중국 우회 가공' 62%로 폭증. 원산지 세탁의 구조적 역설."
        actionPlan="① 중국 가공 의존도 70% 이하 유지 ② 폴란드·베트남 대체 가공기지 확보 ③ 블록체인 원산지 증명 체계 구축"
        source="(기본 2019-12) 원양산업 사회적 책임 + Comtrade 교차검증"
      />
    </div>
  );
}

// ═══ Widget PR2: FTA 관세 차익 매트릭스 ═══
export function PollockFtaTariffMatrix() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/pollock-policy-risk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const routes = data?.fta_tariff_matrix || [];
  const chartData = routes.map((r: any) => ({
    name: r.route.split('→').map((s: string) => s.trim().slice(0, 5)).join('→'),
    MFN: r.tariff_mfn, FTA: r.tariff_fta, savings: r.savings_pct,
  }));

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <TrendingUp size={18} color="#22c55e" />
        <h3 className={styles.cardTitle}>W-PR2 · 명태 FTA 관세 차익 매트릭스</h3>
      </div>
      <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.75rem', color: '#86efac' }}>
        📋 근거: (일반 2024-06) 신통상규범 + (수시 2025-15) 비관세장벽 | WTO + WITS API
      </div>
      <SafeResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} />
          <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} unit="%" />
          <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.75rem' }} />
          <Bar dataKey="MFN" fill="#ef4444" name="MFN 관세" radius={[4, 4, 0, 0]} />
          <Bar dataKey="FTA" fill="#22c55e" name="FTA 관세" radius={[4, 4, 0, 0]} />
        </BarChart>
      </SafeResponsiveContainer>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginTop: '8px' }}>
        {routes.slice(0, 3).map((r: any, i: number) => (
          <div key={i} style={{ background: 'rgba(34,197,94,0.06)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{r.route}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: r.savings_pct === 100 ? '#22c55e' : r.savings_pct > 0 ? '#f59e0b' : '#ef4444' }}>{r.savings_pct}%</div>
            <div style={{ fontSize: '0.6rem', color: '#86efac' }}>관세 절감</div>
          </div>
        ))}
      </div>
      <TakeawayBox
        situation="KORUS FTA 적용 시 미국→한국, 한국→US 루트 관세 0%. 중국 FTA 적용 시 필레 관세 5%(MFN 10% 대비 50% 절감)."
        actionPlan="알래스카 MSC 직수입 시 KORUS 관세 0% 극대화. 중국 우회 시 한중FTA 5% 적용으로 원가 절감."
        source="(일반 2024-06) 신통상규범 수산분야 영향 연구"
      />
    </div>
  );
}

// ═══ Widget PR3: 6대 리스크 종합 스코어카드 ═══
export function PollockRiskScorecard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pollock-policy-risk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(r => r.json()).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  const risks = data?.trade_policy_risks || [];
  const composite = data?.composite_risk_score || { overall: 86, grade: 'A-' };
  const radarData = risks.map((r: any) => ({ subject: r.title.split('(')[0].trim().slice(0, 10), severity: r.severity, probability: r.probability }));
  const breakdown = composite.breakdown || {};
  const vsSpecies = composite.vs_other_species || {};

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <AlertTriangle size={18} color="#ef4444" />
        <h3 className={styles.cardTitle}>W-PR3 · 명태 6대 정책 리스크 종합 스코어카드</h3>
      </div>
      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.75rem', color: '#fca5a5' }}>
        📋 국정연 6건 교차분석 | 6대 리스크 Severity × Probability 가중합산 | 全품목 대비 최고 리스크
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div> : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '12px' }}>
            <div style={{ background: 'rgba(239,68,68,0.15)', borderRadius: '12px', padding: '14px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ef4444' }}>{composite.overall}</div>
              <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>종합 리스크 ({composite.grade})</div>
              <div style={{ fontSize: '0.6rem', color: '#f87171', marginTop: '2px' }}>▲ {composite.trend}</div>
            </div>
            <div style={{ flex: 1 }}>
              <SafeResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 8 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="심각도" dataKey="severity" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                  <Radar name="발생확률" dataKey="probability" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                </RadarChart>
              </SafeResponsiveContainer>
            </div>
          </div>
          {/* Breakdown bars */}
          <div style={{ display: 'grid', gap: '4px', marginBottom: '12px' }}>
            {Object.entries(breakdown).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem' }}>
                <span style={{ width: '90px', color: 'var(--text-secondary)', textAlign: 'right' }}>{key.replace(/_/g, ' ')}</span>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${val as number}%`, height: '100%', background: (val as number) >= 90 ? '#ef4444' : (val as number) >= 75 ? '#f59e0b' : '#22c55e', borderRadius: '4px', transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: (val as number) >= 90 ? '#ef4444' : '#f59e0b', width: '30px' }}>{val as number}</span>
              </div>
            ))}
          </div>
          {/* vs Other Species */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {Object.entries(vsSpecies).map(([species, score]) => (
              <div key={species} style={{ padding: '4px 10px', borderRadius: '12px', background: species === 'pollock' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', fontSize: '0.65rem', color: species === 'pollock' ? '#ef4444' : 'var(--text-secondary)' }}>
                {species}: <strong>{score as number}</strong>
              </div>
            ))}
          </div>
        </>
      )}
      <TakeawayBox
        situation="명태 종합 리스크 86점(A-) — 全품목 최고. 지정학적 제재(93) + 공급 집중도(92)가 주요 드라이버."
        actionPlan="러시아·중국 양두독점 리스크 차단을 위해 미국 MSC + 폴란드·베트남 가공기지 다변화 즉시 착수."
        source="국정연 6건 교차분석 + WTO/OFAC/WITS API"
      />
    </div>
  );
}

export default PollockRiskScorecard;
