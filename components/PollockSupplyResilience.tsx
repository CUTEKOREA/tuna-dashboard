'use client';
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Globe, Anchor, RefreshCw } from 'lucide-react';
import WidgetCard from './WidgetCard';

/**
 * 명태 글로벌 공급망 레질리언스
 * API: /api/pollock-supply-chain
 * 근거: (일반 2023-10) 전략품목 관리 + (일반 2024-05) 공급망 관리 + (일반 2022-11) 대체관계
 */

// ═══ Widget SR1: 수입원 집중도(HHI) 추이 ═══
export function PollockConcentrationIndex() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pollock-supply-chain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(r => r.json()).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  const concentration = data?.concentration_index;
  const trend = concentration?.trend || [];

  return (
    <WidgetCard
      title="W-SR1 · 명태 수입원 집중도(HHI) 위기 추적기"
      icon={Globe}
      iconColor="#ef4444"
      pillar="S1"
      telemetry={{ status: data ? 'SYNCED' : 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="근거: (일반 2023-10) 전략품목 관리 | HHI 2,500+ 고집중, 6,000+ 극단적 집중 | KCS + Comtrade"
      takeaway={{
        situation: "HHI 7,100(2025년 추정) - 극단적 양두독점(러시아 42% + 중국 48% = 90%). 공급 쇼크 시 대체 소싱 가용 물량 극히 제한적. ※스코프: 명태 전 품목(원물·필레·연육)의 공급국(가공·선적국) 기준 추정 - 러시아산 원물의 중국 가공 경유분은 중국으로 집계되어, 원산지 기준 러시아 의존도(냉동 원물 HS 030367 94.8%, 2024 관세청)와 모수가 다름.",
        actionPlan: "미국 MSC(5%) 비중을 15%까지 확대 + 노르웨이·아이슬란드 대서양 명태 신규 소싱 채널 구축.",
        source: "(일반 2023-10) 전략품목 관리 + KCS 수출입통계"
      }}
      customBody={
        loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>불러오는 중...</div> : (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ flex: 1, background: 'rgba(var(--w-red-500-rgb), 0.12)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--w-red-500)' }}>{trend.at(-1)?.hhi?.toLocaleString()}</div>
                <div style={{ fontSize: '0.65rem', color: '#fca5a5' }}>현재 HHI (극단적 집중)</div>
              </div>
              <div style={{ display: 'grid', gap: '4px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(var(--w-red-500-rgb), 0.06)', borderRadius: '6px', fontSize: '0.68rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>🇷🇺 러시아</span>
                  <span style={{ fontWeight: 700, color: 'var(--w-red-500)' }}>{trend.at(-1)?.russia_pct}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(var(--w-amber-500-rgb), 0.06)', borderRadius: '6px', fontSize: '0.68rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>🇨🇳 중국</span>
                  <span style={{ fontWeight: 700, color: 'var(--w-amber-500)' }}>{trend.at(-1)?.china_pct}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: 'rgba(var(--w-blue-500-rgb), 0.06)', borderRadius: '6px', fontSize: '0.68rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>🇺🇸 미국</span>
                  <span style={{ fontWeight: 700, color: 'var(--w-blue-500)' }}>{trend.at(-1)?.us_pct}%</span>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', height: 200 }}>
              <AreaChart width={800} height={200} data={trend} style={{ width: '100%', height: '100%' }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" />
                <XAxis dataKey="year" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.75rem' }} />
                <Area type="monotone" dataKey="russia_pct" stackId="1" stroke="var(--w-red-500)" fill="#ef444466" name="러시아 %" />
                <Area type="monotone" dataKey="china_pct" stackId="1" stroke="var(--w-amber-500)" fill="#f59e0b66" name="중국 %" />
                <Area type="monotone" dataKey="us_pct" stackId="1" stroke="var(--w-blue-500)" fill="#3b82f666" name="미국 %" />
                <Area type="monotone" dataKey="other_pct" stackId="1" stroke="#6b7280" fill="#6b728066" name="기타 %" />
              </AreaChart>
            </div>
          </>
        )
      }
    />
  );
}

// ═══ Widget SR2: 대체 소싱 옵션 레이더 ═══
export function PollockAlternativeSourcing() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/pollock-supply-chain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const options = data?.alternative_sourcing?.options || [];
  const radarData = options.map((o: any) => ({
    country: o.country.slice(0, 6),
    cost: o.cost_competitiveness,
    quality: o.quality,
    reliability: o.reliability,
    esg: o.esg_compliance,
    barrier: o.trade_barrier,
  }));

  return (
    <WidgetCard
      title="W-SR2 · 대체 소싱 옵션 레이더"
      icon={RefreshCw}
      iconColor="#3b82f6"
      pillar="S1"
      telemetry={{ status: data ? 'SYNCED' : 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="근거: (일반 2024-05) 공급망 관리 개선 | 5개국 6축 평가 (원가/품질/신뢰성/ESG/장벽)"
      takeaway={{
        situation: "미국 알래스카(85점) 최우수 대체 소싱. 노르웨이(72점)/아이슬란드(68점) 중위. 베트남(62점) 가공 허브로 부상.",
        actionPlan: "단기: 미국 MSC 비중 3배 확대(5→15%). 중장기: 베트남 가공기지 합작투자 검토로 중국 가공 의존도 축소.",
        source: "(일반 2024-05) 공급망 관리 + 업계추정"
      }}
      customBody={
        <>
          <div style={{ width: '100%', height: 220 }}>
            <RadarChart width={400} height={220} data={radarData} style={{ width: '100%', height: '100%' }}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="country" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="원가 경쟁력" dataKey="cost" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
              <Radar name="품질" dataKey="quality" stroke="var(--w-blue-500)" fill="var(--w-blue-500)" fillOpacity={0.2} />
              <Radar name="ESG" dataKey="esg" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
            </RadarChart>
          </div>
          <div style={{ display: 'grid', gap: '4px', marginTop: '8px' }}>
            {options.slice(0, 4).map((o: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.68rem' }}>
                <span style={{ flex: 1, color: 'var(--text-primary)', fontWeight: 600 }}>{o.country}</span>
                <span style={{ fontWeight: 700, color: o.score >= 80 ? '#22c55e' : o.score >= 60 ? 'var(--w-amber-500)' : 'var(--w-red-500)', fontFamily: 'monospace' }}>{o.score}점</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.note}</span>
              </div>
            ))}
          </div>
        </>
      }
    />
  );
}

// ═══ Widget SR3: 대체 어종 교차탄력성 ═══
export function PollockSubstituteElasticity() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/pollock-supply-chain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      .then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const subs = data?.substitute_elasticity?.analysis || [];

  return (
    <WidgetCard
      title="W-SR3 · 수리미 대체 어종 교차탄력성"
      icon={Anchor}
      iconColor="#8b5cf6"
      pillar="S1"
      telemetry={{ status: data ? 'SYNCED' : 'STATIC', syncDate: '2026-05-21' }}
      cardDesc="근거: (일반 2022-11) 수입수산물과 국산 간의 대체관계 분석 | 명태 수리미 → 대체 어종 전환점 분석"
      takeaway={{
        situation: "명태 수리미 CIF $3,800/MT 돌파 시 실꼬리돔 블렌딩 30%까지 확대 가능 (매입원가 18% 절감).",
        actionPlan: "실꼬리돔(태국·인니산) 선제 확보 + 해파리 연육 10% 블렌딩 R&D로 가격 방어 체계 구축.",
        source: "(일반 2022-11) 대체관계 분석 연구"
      }}
      customBody={
        <div style={{ display: 'grid', gap: '6px' }}>
          {subs.map((s: any, i: number) => (
            <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid ${s.elasticity > 0.6 ? '#22c55e' : s.elasticity > 0.4 ? 'var(--w-amber-500)' : 'var(--w-red-500)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.substitute}</span>
                <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--w-violet-500)' }}>탄력성: {s.elasticity}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                <span>전환점: <strong style={{ color: 'var(--w-amber-500)' }}>${s.tipping_point_usd}/MT</strong></span>
                <span>최대 블렌딩: <strong style={{ color: '#22c55e' }}>{s.max_blend}%</strong></span>
                <span>현재: {s.current_share}%</span>
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{s.note}</div>
            </div>
          ))}
        </div>
      }
    />
  );
}

export default PollockConcentrationIndex;