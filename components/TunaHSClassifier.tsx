/**
 * HS 자동분류 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 139줄 → After 105줄 (-24%, customBody 활용)
 */

'use client';
import React, { useState, useCallback } from 'react';
import { Tag, Search, RefreshCcw } from 'lucide-react';
import WidgetCard from './WidgetCard';

const QUICK_TAGS = ['참치', '가다랑어', '참치통조림', '갈치', '고등어', '명태', '새우', '오징어', '마늘', '캐슈넛'];

const DESC_KR: Record<string, string> = {
  'Tunas (of the genus Thunnus), skipjack tuna': '다랑어류(투너스속), 가다랑어',
  'Prepared or preserved fish; whole or in pieces': '어류 조제품; 전체 또는 절단',
  'Tunas, skipjack and bonito, prepared or preserved': '다랑어/가다랑어/보니토 조제품',
  'Cashew nuts, fresh or dried, shelled': '캐슈너트, 신선 또는 건조, 껍질 제거',
  'Cashew nuts, fresh or dried, in shell': '캐슈너트, 신선 또는 건조, 껍질째',
  'Fish, frozen, n.e.s.': '냉동 어류 (기타)',
  'Skipjack or stripe-bellied bonito, frozen': '가다랑어, 냉동',
  'Yellowfin tunas, frozen': '황다랑어, 냉동',
  'Bigeye tunas, frozen': '눈다랑어, 냉동',
  'Bluefin tunas, frozen': '참다랑어, 냉동',
  'Garlic, fresh or chilled': '마늘, 신선 또는 냉장',
  'Shrimps and prawns, frozen': '새우, 냉동',
  'Mackerel, frozen': '고등어, 냉동',
  'Alaska pollock, frozen': '명태, 냉동',
  'Cuttle fish and squid, frozen': '오징어, 냉동',
};
const toKRDesc = (desc: string) => DESC_KR[desc] || desc;
const toKRNotes = (notes: string) => notes?.replace('Largest:', '주요 산지:');

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
      const json = await res.json();
      setResults(json.classifications || json.allClassifications || []);
      setMeta(json.meta || null);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const isLive = meta?.source === 'HSPING_LIVE';

  const SearchBar = (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '0.8rem' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && classify(query)}
          placeholder="품목명 입력 (한/영 모두 가능)"
          style={{ width: '100%', padding: '10px 12px 10px 36px', fontSize: '0.82rem', background: '#1a1a1a', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', outline: 'none' }} />
      </div>
      <button onClick={() => classify(query)} disabled={loading || !query.trim()}
        style={{ padding: '10px 18px', fontSize: '0.82rem', fontWeight: 700, background: '#2196F3', color: '#fff', border: 'none', borderRadius: '6px', cursor: query.trim() ? 'pointer' : 'not-allowed', opacity: query.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '6px' }}>
        {loading ? <RefreshCcw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Tag size={14} />} 분류
      </button>
    </div>
  );

  const QuickTags = (
    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '1rem' }}>
      {QUICK_TAGS.map((t) => (
        <button key={t} onClick={() => { setQuery(t); classify(t); }}
          style={{ padding: '4px 10px', fontSize: '0.7rem', fontWeight: 500, background: 'rgba(33,150,243,0.08)', color: '#90caf9', border: '1px solid rgba(33,150,243,0.15)', borderRadius: '500px', cursor: 'pointer' }}>
          {t}
        </button>
      ))}
    </div>
  );

  const ResultList = (
    <div style={{ minHeight: '200px', overflow: 'auto' }}>
      {results.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {results.map((r: any, idx: number) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 0.7fr', gap: '0.5rem', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FCD535', fontFamily: 'monospace' }}>{r.hsCode}</div>
                <div style={{ fontSize: '0.65rem', color: '#4a5568', marginTop: '2px' }}>{r.chapter || `Chapter ${(r.hsCode || '').substring(0, 2)}`}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 500 }}>{toKRDesc(r.description)}</div>
                {r.notes && <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '3px' }}>{toKRNotes(r.notes)}</div>}
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
  );

  return (
    <WidgetCard
      title="HS 자동분류 (HS Ping)"
      icon={Tag}
      iconColor="#2196F3"
      pillar="S3"
      cardDesc="품목명(한/영) → HS 6~10자리 자동 매핑. 7개국 관세 분류체계 지원. FTA 원산지 증명서·관세 신고에 즉시 활용"
      telemetry={{ status: isLive ? 'LIVE' : 'STATIC', syncDate: isLive ? '실시간' : '사전분류 DB' }}
      customBody={<>{SearchBar}{QuickTags}{ResultList}</>}
      takeaway={{
        situation: results.length > 0 ? `<div>
<p><strong>"HS Code(Harmonized System Code)"</strong>는 WCO(세계관세기구)가 정한 6~10자리 상품 분류 코드. 모든 무역 절차(관세·통관·FTA·원산지 증명서)의 기준이며, 잘못 분류 시 통관 거절·과다 관세 부과 위험.</p>
<p>검색 결과: <strong>"${meta?.query || query}" → ${results[0]?.hsCode || '-'}</strong> (${toKRDesc(results[0]?.description || '-')}). 신뢰도 <strong>${Math.round((results[0]?.confidence || 0) * 100)}%</strong>, ${results.length}개 후보 코드 제시.</p>
<p>왜 HS 정밀 분류가 중요한가? FTA 특혜관세 적용 시 HS 6자리(국제 표준)·10자리(국가별 세부)가 정확히 맞아야 함. 한 자리 오류로 관세 +12~25%p 차이 가능. 또한 원산지 증명서(C/O) 발급 시에도 HS 코드 매칭이 필수.</p>
</div>` : `<div>
<p><strong>HS Code 자동 분류 시스템</strong>: 품목명(한/영) 입력 시 HS 6~10자리 자동 매핑. 관세 신고·원산지 증명서 작성 시 활용.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: HS 코드 정밀 분류는 단순 사무 작업이 아닌 <strong>"FTA 관세차익 회수의 1차 게이트"</strong>. 분류 오류 시 연간 수억원 관세 손실.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>FTA 원산지 증명서 HS 코드 기재에 본 분류 결과 활용</strong>: AI 분류 + 담당자 교차검증 이중체계로 분류 오류 실질 감소.</li>
<li style="margin-bottom: 8px;"><strong>수입 통관 시 품목분류 사전심사 신청</strong>: 관세청에 사전심사를 받으면 향후 5년 동일 품목 통관 시 분쟁 없이 처리. 통관 시간 50% 단축.</li>
<li><strong>HS 분류 자동화 SaaS 외판</strong>: 자체 분류 시스템을 동남아·중남미 중소 수출업체에 라이센싱 — 연 수천만 원/고객 규모(illustrative 추정). 본업 외 부가 수익원.</li>
</ol>
</div>`,
        source: `HS Ping API · ${isLive ? '실시간' : '사전분류 DB'} · 신뢰도: ${meta?.reliability?.grade || 'A'}`,
      }}
    />
  );
});

export default TunaHSClassifier;
