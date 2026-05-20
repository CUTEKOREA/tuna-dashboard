'use client';

import React, { useState, useEffect } from 'react';
import { Factory, MapPin, Users, RefreshCcw } from 'lucide-react';
import styles from './TunaInsightsDashboard.module.css';
import TakeawayBox from './TakeawayBox';
import TelemetryBadge from './TelemetryBadge';
import TermTooltip from './TermTooltip';

/* ═══════════════════════════════════════════════════════════════════
   OSH Supplier Discovery Hub (공급업체 발굴 허브)
   API Source: Open Supply Hub (OSH) — /api/osh
   ═══════════════════════════════════════════════════════════════════ */

interface Facility {
  name: string;
  country: string;
  address: string;
  sector: string;
  productType: string;
  parentCompany?: string;
  workers?: string;
  osId: string;
  coordinates?: number[];
}

const COUNTRIES = [
  { code: '태국', flag: '🇹🇭' },
  { code: '베트남', flag: '🇻🇳' },
  { code: '인도네시아', flag: '🇮🇩' },
  { code: '중국', flag: '🇨🇳' },
  { code: '에콰도르', flag: '🇪🇨' },
  { code: '한국', flag: '🇰🇷' },
];

const COUNTRY_FLAG: Record<string, string> = {
  TH: '🇹🇭', VN: '🇻🇳', ID: '🇮🇩', CN: '🇨🇳', EC: '🇪🇨', KR: '🇰🇷',
  PH: '🇵🇭', MY: '🇲🇾', JP: '🇯🇵', US: '🇺🇸', ES: '🇪🇸', NO: '🇳🇴',
};

const TunaSupplierHub = React.memo(function TunaSupplierHub() {
  const [selectedCountry, setSelectedCountry] = useState('태국');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);

  const fetchFacilities = async (country: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/osh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, sector: '수산', query: 'tuna seafood' }),
      });
      if (!res.ok) throw new Error('OSH fetch failed');
      const json = await res.json();
      setFacilities(json.facilities || []);
      setSource(json.meta?.source || 'OSH_FALLBACK');
      setTotalCount(json.meta?.count || json.facilities?.length || 0);
    } catch (err) {
      console.error('OSH error:', err);
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities(selectedCountry);
  }, [selectedCountry]);

  const isLive = source === 'OSH_LIVE';

  // Summary stats
  const totalWorkers = facilities.reduce((sum, f) => {
    const match = (f.workers || '').match(/([\d,]+)/);
    return sum + (match ? parseInt(match[1].replace(/,/g, '')) : 0);
  }, 0);

  return (
    <div className={styles.insightCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Factory size={20} color="#9B72CB" />
          [공급업체] 글로벌 참치 공급업체 발굴 허브
          <TermTooltip term="OSH" description="Open Supply Hub (공급망 허브): 전 세계 가공 시설의 위치, 근로자 수, 모기업 정보를 투명하게 추적하는 글로벌 공공 플랫폼 데이터베이스입니다." />
          <TelemetryBadge status={isLive ? 'LIVE' : 'STATIC'} syncDate={isLive ? 'Today' : '2026-H1'} />
        </h3>
        <p className={styles.cardDesc}>
          Open Supply Hub(OSH) API를 연동하여 6개국(태국/베트남/인도네시아/중국/에콰도르/한국)의 수산물 가공시설 데이터를 검색합니다. 시설별 근로자 수, 모기업, ESG 인증 현황을 교차 분석하여 공급선 다변화 후보를 발굴합니다.
        </p>
      </div>

      <div className={styles.cardBody} style={{ gap: '1rem' }}>
        {/* Country Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              onClick={() => setSelectedCountry(c.code)}
              style={{
                padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600,
                background: selectedCountry === c.code ? 'rgba(155,114,203,0.2)' : 'rgba(255,255,255,0.03)',
                color: selectedCountry === c.code ? '#c4b5fd' : '#64748b',
                border: `1px solid ${selectedCountry === c.code ? '#9B72CB' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '500px', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              {c.flag} {c.code}
            </button>
          ))}
        </div>

        {/* Summary KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>{totalCount}</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>시설 수</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FCD535' }}>{totalWorkers > 0 ? `${(totalWorkers / 1000).toFixed(0)}K+` : '-'}</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>총 근로자</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0ECB81' }}>{new Set(facilities.map(f => f.parentCompany).filter(Boolean)).size}</div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>모기업 수</div>
          </div>
        </div>

        {/* Facility List */}
        <div style={{ flex: 1, minHeight: '240px', maxHeight: '320px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
              <RefreshCcw size={24} style={{ color: '#9B72CB', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : facilities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.82rem' }}>
              해당 국가에 등록된 수산 시설이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {facilities.slice(0, 8).map((f, idx) => (
                <div
                  key={f.osId || idx}
                  style={{
                    display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 0.8fr',
                    gap: '0.5rem', alignItems: 'center',
                    padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px',
                    transition: 'all 0.2s', cursor: 'default',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(155,114,203,0.06)'; e.currentTarget.style.borderColor = 'rgba(155,114,203,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {COUNTRY_FLAG[f.country] || '🏭'} {f.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                      <MapPin size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {f.address}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {f.productType}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {f.parentCompany && <span style={{ color: '#c4b5fd' }}>{f.parentCompany}</span>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {f.workers && (
                      <span style={{ fontSize: '0.68rem', color: '#0ECB81', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                        <Users size={10} /> {f.workers}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Takeaway */}
      <div style={{ padding: '0 20px 20px 20px', marginTop: 'auto' }}>
        <TakeawayBox
          situation={`[공급망 인텔리전스] ${COUNTRIES.find(c => c.code === selectedCountry)?.flag || ''} ${selectedCountry} 수산물 가공시설 ${totalCount}개 확인. ${totalWorkers > 0 ? `총 근로자 ${(totalWorkers / 1000).toFixed(0)}K+ 규모.` : ''} ${facilities[0]?.parentCompany ? `최대 기업: ${facilities[0].parentCompany}.` : ''}`}
          actionPlan="[소싱 전략] 시설별 생산 능력/ESG 인증 상태를 교차 검증하여 Silla Co. 원료 공급선 다변화 후보 목록 구축. IUU 어업/강제노동 리스크가 있는 시설은 우선 배제."
          source={`Open Supply Hub (CC BY-SA) · ${isLive ? '실시간 연동' : '고정 데이터'} · 6개국 ${Object.values(facilities).length}개 시설`}
        />
      </div>
    </div>
  );
});

export default TunaSupplierHub;
