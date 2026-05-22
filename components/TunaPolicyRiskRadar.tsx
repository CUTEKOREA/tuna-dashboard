/**
 * 정책 리스크 + FTA 최적화 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 155줄 → After 116줄 (-25%, 2개 위젯 통합)
 */

'use client';
import React, { useState, useEffect } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Shield, TrendingUp } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import WidgetCard from './WidgetCard';

interface PolicyRisk {
  id: string; title: string; severity: number; probability: number;
  impact_usd_millions: number;
}
interface FtaRoute {
  route: string; fta: string; tariff_mfn: number; tariff_fta: number;
  savings_pct: number; product: string;
}

export function PolicyRiskScorecard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tuna-policy-risk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then((r) => r.json()).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  const risks: PolicyRisk[] = data?.trade_policy_risks || [];
  const composite = data?.composite_risk_score || { overall: 74, grade: 'B+' };
  const radarData = risks.map((r) => ({ subject: r.title.split('(')[0].trim().slice(0, 12), severity: r.severity, probability: r.probability }));

  const Body = loading ? (
    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>정책 리스크 데이터 로딩 중...</div>
  ) : (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ background: 'rgba(239,68,68,0.15)', borderRadius: '12px', padding: '12px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{composite.overall}</div>
          <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>종합 리스크 ({composite.grade})</div>
        </div>
        <div style={{ flex: 1 }}>
          <SafeResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="심각도" dataKey="severity" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              <Radar name="발생확률" dataKey="probability" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
            </RadarChart>
          </SafeResponsiveContainer>
        </div>
      </div>
      <div style={{ display: 'grid', gap: '6px' }}>
        {risks.slice(0, 4).map((r) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.72rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.severity >= 80 ? '#ef4444' : r.severity >= 60 ? '#f59e0b' : '#22c55e', flexShrink: 0 }} />
            <span style={{ flex: 1, color: '#f8fafc' }}>{r.title}</span>
            <span style={{ color: r.severity >= 80 ? '#ef4444' : '#f59e0b', fontWeight: 700, fontFamily: 'monospace' }}>{r.severity}</span>
            <span style={{ color: '#94a3b8', fontSize: '0.65rem' }}>${r.impact_usd_millions}M</span>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <WidgetCard
      title="글로벌 통상정책 충격 스코어카드"
      icon={Shield}
      iconColor="#ef4444"
      pillar="S5"
      cardDesc="국정연 보고서 8건 교차분석으로 참치 산업에 영향을 미치는 6대 통상정책 리스크를 심각도×발생확률 가중 합산으로 정량화"
      unit="(단위: 리스크 점수 0~100)"
      telemetry={{ status: 'SYNCED', syncDate: '국정연 보고서 8건' }}
      customBody={Body}
      takeaway={{
        situation: '미국 상호관세(92점)와 강제노동법(88점)이 참치 산업의 최대 정책 리스크. 6대 정책 리스크 종합 점수 74점(B+). 미국 관세 인상 시 한국 참치 가공품 수출(HSK 1604.14) × MFN 12.5~35% 차익 시나리오 추정치는 연 약 $280M.',
        actionPlan: '① KORUS FTA 관세차익 활용으로 미국 관세 리스크 제로화, ② 블록체인 이력추적으로 강제노동법 컴플라이언스 확보, ③ EU CBAM 대비 탄소배출 인벤토리 선제 구축을 즉각 실행해야 합니다.',
        source: '추정치 — 박혜진(2024-06) 「신통상규범 확대에 따른 수산분야 영향 및 대응방안」 국정연 · WTO Tariff Schedule · WITS API',
      }}
    />
  );
}

export function FtaTariffOptimizer() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/tuna-policy-risk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  const routes: FtaRoute[] = data?.fta_tariff_matrix || [];
  const chartData = routes.map((r) => ({ name: r.route.split('→').map((s) => s.trim().slice(0, 3)).join('→'), MFN: r.tariff_mfn, FTA: r.tariff_fta, savings: r.savings_pct }));

  const Body = (
    <>
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginTop: '8px' }}>
        {routes.slice(0, 3).map((r, i) => (
          <div key={i} style={{ background: 'rgba(34,197,94,0.06)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{r.route}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: r.savings_pct === 100 ? '#22c55e' : '#f59e0b' }}>{r.savings_pct}%</div>
            <div style={{ fontSize: '0.6rem', color: '#86efac' }}>관세 절감</div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <WidgetCard
      title="FTA 관세 차익 최적화 매트릭스"
      icon={TrendingUp}
      iconColor="#22c55e"
      pillar="S3"
      cardDesc="WTO MFN 관세율 vs FTA 특혜관세율 루트별 비교로 최적 관세 절감 경로 식별 (KORUS·한-ASEAN·한-EU FTA WITS API 연동)"
      unit="(단위: 관세율 %)"
      telemetry={{ status: 'LIVE', syncDate: 'WITS API' }}
      chartHeight={200}
      chart={
        <BarChart data={chartData} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
          <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.75rem' }} />
          <Bar dataKey="MFN" fill="#ef4444" name="MFN 관세" radius={[4, 4, 0, 0]} />
          <Bar dataKey="FTA" fill="#22c55e" name="FTA 관세" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      customBody={Body}
      takeaway={{
        situation: 'Korea→EU/US 루트에서 KORUS·한-EU FTA 적용 시 참치 가공품 관세 0%. 한국 대미 수출액 × (미 MFN 12.5%/35% in oil) 차익 산정 시 연간 $12M+ 절감 효과 추정.',
        actionPlan: '① 원산지 증명서 자동화 시스템으로 FTA 특혜관세 적용률 95%+ 달성, ② 한-ASEAN FTA 활용 태국 경유 가공 루트로 EU 수출 시 추가 절감, ③ WITS API 실시간 모니터링으로 관세 변동 즉시 대응 체계 가동.',
        source: '추정치 — 박혜진(2024-06) 국정연 · KORUS FTA 양허 0% · WITS API',
      }}
    />
  );
}

export default PolicyRiskScorecard;
