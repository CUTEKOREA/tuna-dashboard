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
import { ChartPatternDefs } from './ChartPatterns';

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
    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--w-slate-400)' }}>정책 리스크 데이터 로딩 중...</div>
  ) : (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ background: 'rgba(var(--w-red-500-rgb), 0.15)', borderRadius: '12px', padding: '12px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--w-red-500)' }}>{composite.overall}</div>
          <div style={{ fontSize: '0.7rem', color: '#fca5a5' }}>종합 리스크 ({composite.grade})</div>
        </div>
        <div style={{ flex: 1 }}>
          <SafeResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--w-slate-400)', fontSize: 9 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="심각도" dataKey="severity" stroke="var(--w-red-500)" fill="var(--w-red-500)" fillOpacity={0.3} />
              <Radar name="발생확률" dataKey="probability" stroke="var(--w-amber-500)" fill="var(--w-amber-500)" fillOpacity={0.2} />
            </RadarChart>
          </SafeResponsiveContainer>
        </div>
      </div>
      <div style={{ display: 'grid', gap: '6px' }}>
        {risks.slice(0, 4).map((r) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.72rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.severity >= 80 ? 'var(--w-red-500)' : r.severity >= 60 ? 'var(--w-amber-500)' : '#22c55e', flexShrink: 0 }} />
            <span style={{ flex: 1, color: 'var(--w-slate-50)' }}>{r.title}</span>
            <span style={{ color: r.severity >= 80 ? 'var(--w-red-500)' : 'var(--w-amber-500)', fontWeight: 700, fontFamily: 'monospace' }}>{r.severity}</span>
            <span style={{ color: 'var(--w-slate-400)', fontSize: '0.65rem' }}>${r.impact_usd_millions}M</span>
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
      telemetry={{ status: data ? 'SYNCED' : 'STATIC', syncDate: '국정연 보고서 8건' }}
      customBody={Body}
      takeaway={{
        situation: `<div>
<p>참치 산업의 6대 정책 리스크를 0~100 점수화한 종합 레이더. 현재 종합 점수 <strong>74점(B+)</strong>로 상승 추세 — 향후 24~36개월 내 정책 리스크가 본업 EBITDA의 8~15%를 잠식할 수 있음을 시그널.</p>
<p>핵심 2 리스크:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>미국 상호관세 (92점)</strong>: USTR이 한국 가공품 HSK 1604.14에 MFN 12.5~35% 추가 부과 시 한국 수출 연 약 <strong>$280M 차익 손실</strong> 추정.</li>
<li><strong>미국 강제노동법(UFLPA) (88점)</strong>: 공급망 강제노동 의심 업체 입증 시 미국 항구 화물 압류. 블랙리스트 18~36개월.</li>
</ul>
<p>의미: 두 리스크 모두 한국이 통제 불가능한 외부 변수지만, 미리 대비하지 않으면 EBITDA의 8~15% 잠재 손실. 정책 리스크는 사후 대응이 아닌 <strong>선제적 경영 수단</strong>으로.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 정책 리스크는 단순 ESG 보고서 항목이 아닌 <strong>"본업 EBITDA를 좌우하는 파생적 위험 포지션"</strong>. 리스크 담당 데스크가 매 분기 6대 리스크 점수를 마진 매트릭스에 반영.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>미국 관세 리스크 제로화</strong>: KORUS FTA + 원산지 증명서 자동화로 미국 수출 관세 0% 락업. 멕시코 USMCA 조건부 생산 용량 확보.</li>
<li style="margin-bottom: 8px;"><strong>강제노동법 컴플라이언스</strong>: 블록체인 이력추적(공급망 추적 플랫폼)으로 UFLPA 압류 100% 회피. 인증 자산을 컴플라이언스 서비스화(구독형 라이센싱).</li>
<li><strong>EU CBAM 대비 탄소 인벤토리</strong>: Scope 1·2·3 탄소 배출 정량화. EU CBAM 2027 발효 전 carbon offset 선매수.</li>
</ol>
</div>`,
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
            <div style={{ fontSize: '0.65rem', color: 'var(--w-slate-400)' }}>{r.route}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: r.savings_pct === 100 ? '#22c55e' : 'var(--w-amber-500)' }}>{r.savings_pct}%</div>
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
      telemetry={{ status: data ? 'SYNCED' : 'STATIC', syncDate: 'WITS API' }}
      chartHeight={200}
      chart={
        <BarChart data={chartData} barGap={2}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--w-slate-400)', fontSize: 10 }} />
          <YAxis tick={{ fill: 'var(--w-slate-400)', fontSize: 10 }} unit="%" />
          <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.75rem' }} />
          <Bar dataKey="MFN" fill="var(--w-red-500)" name="MFN 관세" radius={[4, 4, 0, 0]} />
          <Bar dataKey="FTA" fill="#22c55e" name="FTA 관세" radius={[4, 4, 0, 0]} />
        </BarChart>
      }
      customBody={Body}
      takeaway={{
        situation: `<div>
<p>FTA(Free Trade Agreement) 관세차익은 한국 수산업의 가장 중요한 가격 경쟁력. 한국→미국/EU 수출 시 FTA 미적용 업체 대비 6~35%p 가격 우위.</p>
<p>주요 루트:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>Korea→US</strong>: KORUS FTA로 MFN 12.5% → 0% (in oil은 35% → 0%)</li>
<li><strong>Korea→EU</strong>: 한-EU FTA로 MFN 25% → 0%</li>
<li><strong>Korea→ASEAN</strong>: AKFTA/RCEP로 MFN 5~20% → 0%</li>
</ul>
<p>차익 계산: 한국 대미 수출액 × MFN 12.5% (또는 in oil 35%) = 연간 <strong>$12M+ 절감 효과</strong> 추정. 단순 비용 절감이 아닌 <strong>경쟁사 대비 가격 협상 자유도</strong>로 작용해 추가 마진 +5~8%p 회수.</p>
<p>한 가지 더: FTA는 원산지 증명서(C/O) 발급해야 적용. 업계추정: 한국 수산 업체 평균 FTA 적용률 70~80% — 20~30%는 MFN 관세를 그대로 내고 있음. 이 갭이 즉시 회수 가능한 숨겨진 마진.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: FTA 관세차익은 단순 비용 절감이 아닌 <strong>"한국 수출업체만의 규제 해자(경쟁 장벽)"</strong>. 우리는 단순 구매자가 아닌 관세 차익 거래자(Trade Arbitrageur)로 포지셔닝.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>원산지 증명서 자동화 시스템</strong>: FTA 특혜관세 적용률 70% → 95%+ 달성. 즉시 회수되는 연 $5~8M 숨겨진 마진.</li>
<li style="margin-bottom: 8px;"><strong>한-ASEAN FTA 활용 태국 경유 가공 루트</strong>: 한국 원물 → 태국 가공(AKFTA) → EU 수출(EU-Thai FTA 일부 적용) — 단가 추가 -8~12% 절감.</li>
<li><strong>WITS API 실시간 모니터링</strong>: 관세 변동 즉시 대응 프로토콜 자동화. 본사 무역 데스크가 7개 FTA를 매주 모니터링 후 거래 장부에 반영. 동시에 FTA 활용 노하우를 다른 한국 수산 업체에 컨설팅 라이센싱.</li>
</ol>
</div>`,
        source: '추정치 — 박혜진(2024-06) 국정연 · KORUS FTA 양허 0% · WITS API',
      }}
    />
  );
}

export default PolicyRiskScorecard;
