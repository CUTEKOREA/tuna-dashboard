/**
 * 컴플라이언스 레이더 (제재 스크리닝) — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 141줄 → After 116줄 (-18%, customBody)
 */

'use client';
import React, { useState, useCallback } from 'react';
import { ShieldCheck, Search, AlertTriangle, CheckCircle, XCircle, RefreshCcw, Clock } from 'lucide-react';
import WidgetCard from './WidgetCard';

interface ScreeningResult {
  entity: string;
  ofac: { status: string; detail: string };
  eu: { status: string; detail: string };
  riskScore: number;
  riskLevel: string;
  isLive?: boolean;
  source?: string;
  aiAnalysis?: { confidence: number; falsePositiveRisk: string; recommendation: string };
}

const HISTORY = [
  { entity: 'Thai Union Group', result: '✅ 적합', date: '2026-05-13', score: 95 },
  { entity: 'Dongwon Industries', result: '✅ 적합', date: '2026-05-13', score: 97 },
  { entity: 'Silla Co., Ltd.', result: '✅ 적합', date: '2026-05-13', score: 98 },
  { entity: 'Nirsa S.A.', result: '✅ 적합', date: '2026-05-12', score: 90 },
  { entity: 'Minh Phu Seafood', result: '⚠️ 검토', date: '2026-05-11', score: 72 },
];

const riskColor = (l: string) => l === 'LOW' ? '#0ECB81' : l === 'MEDIUM' ? '#F0B90B' : '#F6465D';
const statusIcon = (s: string) => s === 'clean' ? <CheckCircle size={14} color="#0ECB81" /> : s === 'partial' ? <AlertTriangle size={14} color="#F0B90B" /> : <XCircle size={14} color="#F6465D" />;

const TunaComplianceRadar = React.memo(function TunaComplianceRadar() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [showHist, setShowHist] = useState(true);

  const run = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true); setShowHist(false);
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: query.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
      } else {
        setResult({ entity: query, ofac: { status: 'partial', detail: 'API Error' }, eu: { status: 'partial', detail: 'API Error' }, riskScore: 50, riskLevel: 'MEDIUM' });
      }
    } catch {
      setResult({ entity: query, ofac: { status: 'partial', detail: 'Network Error' }, eu: { status: 'partial', detail: 'Network Error' }, riskScore: 50, riskLevel: 'MEDIUM' });
    } finally {
      setLoading(false);
    }
  }, [query]);

  const Body = (
    <>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--w-slate-500)' }} />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()}
            placeholder="거래처명 (예: Thai Union, Dongwon...)"
            style={{ width: '100%', padding: '10px 12px 10px 36px', fontSize: '0.82rem', background: '#1a1a1a', color: 'var(--w-slate-50)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', outline: 'none' }} />
        </div>
        <button onClick={run} disabled={loading || !query.trim()}
          style={{ padding: '10px 18px', fontSize: '0.82rem', fontWeight: 700, background: '#0ECB81', color: '#0d0d0d', border: 'none', borderRadius: '6px', cursor: query.trim() ? 'pointer' : 'not-allowed', opacity: query.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '6px' }}>
          {loading ? <RefreshCcw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ShieldCheck size={14} />} 스크리닝
        </button>
      </div>
      {result && !showHist && (
        <div>
          <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
            <div style={{ background: result.ofac.status === 'clean' ? 'rgba(14,203,129,0.06)' : 'rgba(240,185,11,0.06)', border: `1px solid ${result.ofac.status === 'clean' ? 'rgba(14,203,129,0.2)' : 'rgba(240,185,11,0.2)'}`, borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>{statusIcon(result.ofac.status)}<span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--w-slate-50)' }}>OFAC (미국)</span></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--w-slate-400)' }}>{result.ofac.detail}</div>
            </div>
            <div style={{ background: result.eu.status === 'clean' ? 'rgba(14,203,129,0.06)' : 'rgba(240,185,11,0.06)', border: `1px solid ${result.eu.status === 'clean' ? 'rgba(14,203,129,0.2)' : 'rgba(240,185,11,0.2)'}`, borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>{statusIcon(result.eu.status)}<span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--w-slate-50)' }}>EU 제재</span></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--w-slate-400)' }}>{result.eu.detail}</div>
            </div>
            <div style={{ background: `${riskColor(result.riskLevel)}10`, border: `1px solid ${riskColor(result.riskLevel)}30`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--w-slate-500)', fontWeight: 600 }}>종합 위험도</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: riskColor(result.riskLevel) }}>{result.riskScore}<span style={{ fontSize: '0.8rem' }}>/100</span></div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, background: `${riskColor(result.riskLevel)}20`, color: riskColor(result.riskLevel), padding: '2px 8px', borderRadius: '500px' }}>{result.riskLevel === 'LOW' ? '저위험' : result.riskLevel === 'MEDIUM' ? '중위험' : '고위험'}</span>
            </div>
          </div>
          {result.aiAnalysis && (
            <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.15)', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', display: 'flex', gap: '10px' }}>
              <ShieldCheck size={18} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--w-cyan-500)', marginBottom: '4px' }}>AI 오탐지 분석</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-50)', marginBottom: '4px' }}>오탐지 위험도: <strong style={{ color: result.aiAnalysis.falsePositiveRisk === 'HIGH' ? '#F6465D' : '#0ECB81' }}>{result.aiAnalysis.falsePositiveRisk}</strong> (신뢰도: {(result.aiAnalysis.confidence * 100).toFixed(1)}%)</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--w-slate-400)', lineHeight: 1.4 }}>{result.aiAnalysis.recommendation}</div>
              </div>
            </div>
          )}
        </div>
      )}
      {showHist && (
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-500)', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={12} /> 최근 스크리닝 이력</div>
          {HISTORY.map((h, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 0.5fr', alignItems: 'center', padding: '7px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '3px' }}>
              <span style={{ color: 'var(--w-slate-50)', fontWeight: 600 }}>{h.entity}</span>
              <span style={{ color: h.score >= 85 ? '#0ECB81' : '#F0B90B', fontWeight: 600 }}>{h.result}</span>
              <span style={{ color: '#4a5568' }}>{h.date}</span>
              <span style={{ textAlign: 'right', color: h.score >= 85 ? '#0ECB81' : '#F0B90B', fontWeight: 700 }}>{h.score}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <WidgetCard
      title="컴플라이언스 레이더 — 제재 스크리닝"
      icon={ShieldCheck}
      iconColor="#0ECB81"
      pillar="S5"
      cardDesc="거래처명 입력 시 OFAC SDN(미국 해외자산통제국) 목록을 실시간 조회(공개 CSV)하고, EU·IUU 참조 DB로 보강. 조회 실패 시 사전심사 참조 DB로 폴백."
      telemetry={{ status: result?.isLive ? 'LIVE' : (result ? 'SYNCED' : 'STATIC'), syncDate: result?.isLive ? '실시간 OFAC SDN' : (result ? result.source ?? 'OFAC 조회 완료' : 'OFAC 조회 시 갱신') }}
      customBody={Body}
      takeaway={{
        situation: result && !showHist ? `<div>
<p><strong>"Sanction Screening"</strong>이란 거래 상대방이 미국 OFAC SDN(Specially Designated Nationals)·EU 통합제재목록·UN 안보리 제재 명단에 올라있는지 확인하는 절차. 등재된 vendor와 거래 시 우리 회사도 2차 제재(secondary sanction) 대상 — 글로벌 은행 거래 차단 + 미국 시장 영구 추방.</p>
<p>스크리닝 결과: <strong>${result.entity} — 위험점수 ${result.riskScore}/100 (${result.riskLevel})</strong>. OFAC: ${result.ofac.status}, EU: ${result.eu.status}.</p>
<p>점수 해석: 90+ 적합(거래 가능), 80~89 주의(추가 실사), 80 미만 위험(Enhanced Due Diligence 필수), 60 미만 거래 차단.</p>
</div>` : `<div>
<p><strong>"Sanction Screening"</strong>은 글로벌 비즈니스의 가장 중요한 컴플라이언스 절차. OFAC·EU·UN 제재 명단 등재 vendor와 거래 시 2차 제재(secondary sanction) 대상 — 글로벌 은행 거래 차단 + 미국 시장 영구 추방 가능성.</p>
<p>주요 5개사 스크리닝 결과: <strong>Silla(98), Dongwon(97), Thai Union(95) 적합. Minh Phu(72) 주의</strong>. Minh Phu는 추가 실사 + 거래 조건 강화 필요.</p>
</div>`,
        actionPlan: result && result.riskScore < 80 ? `<div>
<p><strong>강화 실사(EDD, Enhanced Due Diligence)</strong> 즉시 실시: ${result.entity}의 ① 최종 실소유자(UBO) 확인 ② 자금 출처 ③ 정치적 노출(PEP) ④ 부정적 언론 스크리닝 — 4중 검증. EDD 미통과 시 거래 보류 또는 종료.</p>
</div>` : `<div>
<p><strong>"전 거래처 월 1회 자동 스크리닝"</strong>: OFAC·EU 명단은 매주 갱신되므로 월간 자동 스크리닝 필수. 본사 컴플라이언스 데스크가 머신러닝 기반 위험 점수 모델로 자동화 — 분기마다 임계치 돌파 vendor 알림 발송.</p>
</div>`,
        source: 'OFAC SDN 공개 CSV + EU 통합제재·IUU 참조 DB · 조회 실패 시 내부 사전심사 DB 폴백',
      }}
    />
  );
});

export default TunaComplianceRadar;
