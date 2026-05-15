'use client';
import React, { useState, useCallback } from 'react';
import { ShieldCheck, Search, AlertTriangle, CheckCircle, XCircle, RefreshCcw, Clock } from 'lucide-react';
import styles from './TunaInsightsDashboard.module.css';
import TakeawayBox from './TakeawayBox';

interface ScreeningResult {
  entity: string;
  ofac: { status: string; detail: string };
  eu: { status: string; detail: string };
  riskScore: number;
  riskLevel: string;
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
        body: JSON.stringify({ entity: query.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
      } else {
        setResult({ entity: query, ofac: { status: 'partial', detail: 'API Error' }, eu: { status: 'partial', detail: 'API Error' }, riskScore: 50, riskLevel: 'MEDIUM' });
      }
    } catch (err) {
      setResult({ entity: query, ofac: { status: 'partial', detail: 'Network Error' }, eu: { status: 'partial', detail: 'Network Error' }, riskScore: 50, riskLevel: 'MEDIUM' });
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
          <ShieldCheck size={18} style={{ color: '#0ECB81' }} /> [제재 스크리닝] 컴플라이언스 레이더
          <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>OFAC + EU</span>
        </h3>
        <p className={styles.cardDesc} style={{ margin: '4px 0 0 0' }}>OFAC SDN(미국 해외자산통제국) 및 EU 통합 제재 목록을 실시간 듀얼 스크리닝하여 거래처의 제재 위반 여부를 자동 검증합니다. AI 오탐지(False Positive) 분석 엔진이 정확도를 보강합니다.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()}
            placeholder="거래처명 (예: Thai Union, Dongwon...)"
            style={{ width: '100%', padding: '10px 12px 10px 36px', fontSize: '0.82rem', background: '#1a1a1a', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', outline: 'none' }} />
        </div>
        <button onClick={run} disabled={loading || !query.trim()}
          style={{ padding: '10px 18px', fontSize: '0.82rem', fontWeight: 700, background: '#0ECB81', color: '#0d0d0d', border: 'none', borderRadius: '6px', cursor: query.trim() ? 'pointer' : 'not-allowed', opacity: query.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '6px' }}>
          {loading ? <RefreshCcw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ShieldCheck size={14} />} 스크리닝
        </button>
      </div>

      {result && !showHist && (
        <div style={{ flex: 1, marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
            <div style={{ background: result.ofac.status === 'clean' ? 'rgba(14,203,129,0.06)' : 'rgba(240,185,11,0.06)', border: `1px solid ${result.ofac.status === 'clean' ? 'rgba(14,203,129,0.2)' : 'rgba(240,185,11,0.2)'}`, borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>{statusIcon(result.ofac.status)}<span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>OFAC (미국)</span></div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{result.ofac.detail}</div>
            </div>
            <div style={{ background: result.eu.status === 'clean' ? 'rgba(14,203,129,0.06)' : 'rgba(240,185,11,0.06)', border: `1px solid ${result.eu.status === 'clean' ? 'rgba(14,203,129,0.2)' : 'rgba(240,185,11,0.2)'}`, borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>{statusIcon(result.eu.status)}<span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>EU 제재</span></div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{result.eu.detail}</div>
            </div>
            <div style={{ background: `${riskColor(result.riskLevel)}10`, border: `1px solid ${riskColor(result.riskLevel)}30`, borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>종합 위험도</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: riskColor(result.riskLevel) }}>{result.riskScore}<span style={{ fontSize: '0.8rem' }}>/100</span></div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, background: `${riskColor(result.riskLevel)}20`, color: riskColor(result.riskLevel), padding: '2px 8px', borderRadius: '500px' }}>{result.riskLevel === 'LOW' ? '저위험' : result.riskLevel === 'MEDIUM' ? '중위험' : '고위험'}</span>
            </div>
          </div>

          {result.aiAnalysis && (
            <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.15)', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', display: 'flex', gap: '10px' }}>
              <ShieldCheck size={18} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', marginBottom: '4px' }}>AI 오탐지 분석 엔진</div>
                <div style={{ fontSize: '0.75rem', color: '#f8fafc', marginBottom: '4px' }}>오탐지 위험도: <strong style={{ color: result.aiAnalysis.falsePositiveRisk === 'HIGH' ? '#F6465D' : '#0ECB81' }}>{result.aiAnalysis.falsePositiveRisk}</strong> (신뢰도: {(result.aiAnalysis.confidence * 100).toFixed(1)}%)</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4 }}>{result.aiAnalysis.recommendation}</div>
              </div>
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{result.entity}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>스크리닝 일시: {new Date().toLocaleDateString('ko-KR')} · OFAC SDN + EU 통합제재 + IUU 목록</div>
          </div>
        </div>
      )}

      {showHist && (
        <div style={{ flex: 1, marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={12} /> 최근 스크리닝 이력</div>
          {HISTORY.map((h, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 0.5fr', alignItems: 'center', padding: '7px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '3px' }}>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{h.entity}</span>
              <span style={{ color: h.score >= 85 ? '#0ECB81' : '#F0B90B', fontWeight: 600 }}>{h.result}</span>
              <span style={{ color: '#4a5568' }}>{h.date}</span>
              <span style={{ textAlign: 'right', color: h.score >= 85 ? '#0ECB81' : '#F0B90B', fontWeight: 700 }}>{h.score}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        <TakeawayBox
          situation={result && !showHist ? `[스크리닝] ${result.entity} — ${result.riskScore}/100 (${result.riskLevel}). OFAC: ${result.ofac.status}, EU: ${result.eu.status}.` : '[컴플라이언스] 주요 5개사 스크리닝 완료. Silla (98), Dongwon (97), Thai Union (95) Clean. Minh Phu (72) 주의.'}
          actionPlan={result && result.riskScore < 80 ? `[조치] ${result.entity} Enhanced Due Diligence 실시 권고.` : '[정기 점검] 전 거래처 월 1회 자동 스크리닝 수행 권고.'}
          source="OFAC SDN + EU 통합제재목록 · 사전심사 DB"
        />
      </div>
    </div>
  );
});

export default TunaComplianceRadar;
