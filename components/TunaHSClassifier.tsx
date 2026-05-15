'use client';
import React, { useState, useCallback } from 'react';
import { Tag, Search, RefreshCcw, ArrowRight, Globe } from 'lucide-react';
import styles from './TunaInsightsDashboard.module.css';
import TakeawayBox from './TakeawayBox';

const QUICK_TAGS = ['참치', '가다랑어', '참치통조림', '갈치', '고등어', '명태', '새우', '오징어', '마늘', '캐슈넛'];

const TunaHSClassifier = React.memo(function TunaHSClassifier() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);

  const classify = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/hs-ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, country: 'US' }),
      });
      if (!res.ok) throw new Error('Classification failed');
      const json = await res.json();
      setResults(json.classifications || json.allClassifications || []);
      setMeta(json.meta || null);
    } catch (err) {
      console.error('HS classify error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const isLive = meta?.source === 'HSPING_LIVE';

  return (
    <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
          <Tag size={18} style={{ color: '#2196F3' }} /> [HS 분류] AI HS 코드 자동분류 (HS Ping)
          <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: isLive ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)', border: isLive ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)', color: isLive ? '#10b981' : '#94a3b8' }}>
            {isLive ? '🟢 LIVE' : 'Pre-classified'}
          </span>
        </h3>
        <p className={styles.cardDesc} style={{ margin: '4px 0 0 0' }}>품목명(한/영)을 입력하면 HS Ping API를 통해 HS 6~10자리 코드를 자동 매핑합니다. 7개국 관세 분류체계를 지원하며, FTA 원산지 증명서 작성 및 관세 신고에 즉시 활용 가능합니다.</p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '0.8rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && classify(query)}
            placeholder="품목명 입력 (한/영 모두 가능)"
            style={{ width: '100%', padding: '10px 12px 10px 36px', fontSize: '0.82rem', background: '#1a1a1a', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', outline: 'none' }} />
        </div>
        <button onClick={() => classify(query)} disabled={loading || !query.trim()}
          style={{ padding: '10px 18px', fontSize: '0.82rem', fontWeight: 700, background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: query.trim() ? 'pointer' : 'not-allowed', opacity: query.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '6px' }}>
          {loading ? <RefreshCcw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Tag size={14} />} 분류
        </button>
      </div>

      {/* Quick Tags */}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {QUICK_TAGS.map(t => (
          <button key={t} onClick={() => { setQuery(t); classify(t); }}
            style={{ padding: '4px 10px', fontSize: '0.7rem', fontWeight: 500, background: 'rgba(33,150,243,0.08)', color: '#90caf9', border: '1px solid rgba(33,150,243,0.15)', borderRadius: '500px', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(33,150,243,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(33,150,243,0.08)'; }}>
            {t}
          </button>
        ))}
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflow: 'auto', marginBottom: '1rem' }}>
        {results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {results.map((r: any, idx: number) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 0.7fr', gap: '0.5rem', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FCD535', fontFamily: 'monospace' }}>{r.hsCode}</div>
                  <div style={{ fontSize: '0.65rem', color: '#4a5568', marginTop: '2px' }}>{r.chapter || `Chapter ${(r.hsCode || '').substring(0, 2)}`}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 500 }}>{r.description}</div>
                  {r.notes && <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '3px' }}>{r.notes}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: (r.confidence || 0) >= 0.95 ? '#0ECB81' : '#F0B90B' }}>
                    {Math.round((r.confidence || 0) * 100)}%
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#4a5568' }}>{r.country || 'US'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && meta && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.82rem' }}>분류 결과가 없습니다.</div>
        )}
        {!meta && !loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#4a5568', fontSize: '0.82rem' }}>
            위 Quick Tag를 클릭하거나 품목명을 입력하세요
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <TakeawayBox
          situation={results.length > 0 ? `[HS 분류] "${meta?.query || query}" → ${results[0]?.hsCode || '-'} (${results[0]?.description || '-'}). 신뢰도 ${Math.round((results[0]?.confidence || 0) * 100)}%. ${results.length}개 후보 코드 제시.` : '[HS 자동분류] 품목명(한/영) 입력 시 HS 6~10자리 코드를 자동 매핑. 관세 신고·원산지 증명서 작성 시 활용.'}
          actionPlan="[활용] FTA 원산지 증명서 HS 코드 기재 시 본 분류 결과 활용. 수입 통관 시 품목분류 사전심사(관세청) 신청 근거 자료."
          source={`HS Ping API · ${isLive ? '🟢 LIVE' : '🟡 Pre-classified DB'} · Reliability: ${meta?.reliability?.grade || 'A'}`}
        />
      </div>
    </div>
  );
});

export default TunaHSClassifier;
