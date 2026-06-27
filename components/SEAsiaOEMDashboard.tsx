import React, { useState } from 'react';
import styles from './SEAsiaOEMDashboard.module.css';
import { Target, X, MapPin, ClipboardList, Globe2, BarChart3, Users, Building2, ShieldCheck, ExternalLink, Newspaper } from 'lucide-react';
import vendorsData from '../data/seasia_oem_vendors.json';
import ThaiTunaTradeStats from './ThaiTunaTradeStats';

interface Vendor {
  id: string;
  country: string;
  name: string;
  region: string;
  capacityMT: number;
  hasFDA: boolean;
  hasEU: boolean;
  msc: boolean;
  specialty: string;
  takeaway: string;
  tier: string;
  meetingData?: any;
  publicProfile?: any;
  publicProfileMeta?: any;
  isNew?: boolean;
  reviewFlag?: string;
}

// ── L-01 한글 매핑 (JSON 키는 영문 유지, 렌더 시점만 한글) ──
const TIER_KO: Record<string, string> = {
  'Tier 1: Sweet Spot': '티어1 · 최적 파트너',
  'Tier 1: Premium R&D': '티어1 · 프리미엄 R&D',
  'Tier 1: Volume Provider': '티어1 · 물량 공급형',
  'Tier 1: Global Giants': '티어1 · 글로벌 대기업',
  'Tier 1: Strategic': '티어1 · 전략 파트너',
  'Tier 2: Specialized': '티어2 · 특화형',
  'Tier 2: Global Giants': '티어2 · 글로벌 대기업',
  'Tier 2: Volume Provider': '티어2 · 물량 공급형',
  'Tier 3: Niche': '티어3 · 틈새 특화',
  'Tier 3: Domestic': '티어3 · 내수형',
};

const REGION_KO: Record<string, string> = {
  South: '남부', North: '북부', Central: '중부',
  'Samut Sakhon': '사뭇사콘', 'Samut Prakan': '사뭇쁘라깐', Songkhla: '송클라',
  'Khanh Hoa': '칸호아', 'Phu Yen': '푸옌', 'Binh Dinh': '빈딘', 'Ho Chi Minh': '호찌민',
  Vietnam: '베트남', Thailand: '태국',
};

const COUNTRY_KO: Record<string, string> = { Vietnam: '베트남', Thailand: '태국' };

const FILTER_KO: Record<string, string> = {
  All: '전체',
  'Tier 1: Sweet Spot': '최적 파트너',
  'Tier 1: Global Giants': '글로벌 대기업',
  'Volume Provider': '물량 공급형',
  Specialized: '특화형',
};

const tierKo = (t: string) => TIER_KO[t] || t;

const vendorLocation = (v: { region: string; country: string }) => {
  const r = REGION_KO[v.region] || v.region;
  const c = COUNTRY_KO[v.country] || v.country;
  return r === c ? c : `${r}, ${c}`;
};

// 자체 검증메모(verificationSummary)가 인증 주장(FDA/EU/MSC)을 입증하지 못한
// 신뢰도 '낮음' 업체는 인증 배지를 단정 표시하지 않고 '미확인'으로 렌더한다.
const isCertUnverified = (v: { publicProfileMeta?: any }) =>
  ((v.publicProfileMeta || {}).dataConfidence === 'low');

const SEAsiaOEMDashboard = React.memo(function SEAsiaOEMDashboard() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'stats'>('vendors');
  const [activeCountry, setActiveCountry] = useState<string>('All');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const filters = ['All', 'Tier 1: Sweet Spot', 'Tier 1: Global Giants', 'Volume Provider', 'Specialized'];
  const countries = ['All', 'Vietnam', 'Thailand'];

  const filteredData = vendorsData.filter((v: any) => {
    // Country Filter
    if (activeCountry !== 'All' && v.country !== activeCountry) return false;
    
    // Tier / Type Filter
    if (activeFilter === 'All') return true;
    if (activeFilter === 'FDA Approved') return v.hasFDA; // Optional additional filter if kept
    if (activeFilter === 'Volume Provider') return v.tier.includes('Volume');
    if (activeFilter === 'Tier 1: Sweet Spot') return v.tier.includes('Sweet Spot');
    if (activeFilter === 'Tier 1: Global Giants') return v.tier.includes('Global Giants');
    if (activeFilter === 'Specialized') return v.tier.includes('Specialized');
    return true;
  });

  // KPI computations
  const totalVendors = vendorsData.length;
  const vietnamCount = vendorsData.filter((v: any) => v.country === 'Vietnam').length;
  const thailandCount = vendorsData.filter((v: any) => v.country === 'Thailand').length;
  // 인증 KPI는 검증메모상 입증된 업체만 집계 (신뢰도 '낮음' = 인증 미입증 → 제외)
  const fdaCount = vendorsData.filter((v: any) => v.hasFDA && !isCertUnverified(v)).length;
  const euCount = vendorsData.filter((v: any) => v.hasEU && !isCertUnverified(v)).length;
  const certUnverifiedCount = vendorsData.filter((v: any) => (v.hasFDA || v.hasEU || v.msc) && isCertUnverified(v)).length;
  const maxCapacity = Math.max(...vendorsData.map((v: any) => v.capacityMT || 0));

  // Filter count helper
  const getFilterCount = (f: string) => {
    const baseData = activeCountry === 'All' ? vendorsData : vendorsData.filter((v: any) => v.country === activeCountry);
    if (f === 'All') return baseData.length;
    if (f === 'Volume Provider') return baseData.filter((v: any) => v.tier.includes('Volume')).length;
    if (f === 'Tier 1: Sweet Spot') return baseData.filter((v: any) => v.tier.includes('Sweet Spot')).length;
    if (f === 'Tier 1: Global Giants') return baseData.filter((v: any) => v.tier.includes('Global Giants')).length;
    if (f === 'Specialized') return baseData.filter((v: any) => v.tier.includes('Specialized')).length;
    return 0;
  };

  const getCountryCount = (c: string) => {
    if (c === 'All') return vendorsData.length;
    return vendorsData.filter((v: any) => v.country === c).length;
  };

  return (
    <div className={styles.container}>
      {/* ── Hero Header with gradient background ── */}
      <header style={{
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        position: 'relative',
        padding: '2rem 2rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(139,92,246,0.06) 50%, rgba(16,185,129,0.04) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        {/* Decorative glow behind header */}
        <div style={{
          position: 'absolute',
          top: '-40%',
          left: '-10%',
          width: '50%',
          height: '200%',
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div>
          <h2
            className={styles.title}
            style={{
              background: 'linear-gradient(135deg, #06B6D4, #8B5CF6, #10B981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '1.65rem',
              letterSpacing: '-0.5px',
            }}
          >
            글로벌 OEM 벤더 인텔리전스
          </h2>
          <p className={styles.subtitle}>태국 및 베트남 참치 통조림/가공업체 심층 프로필 및 전략적 파트너십 벤더 풀</p>
          <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.4rem 0 0 0', maxWidth: '720px', lineHeight: 1.4 }}>
            출처: 공개 기업정보·인증현황(US FDA FCE·EU 승인코드·MSC) 기반 큐레이션 — {vendorsData.filter((v: any) => v.meetingData).length}개사 현장 실사 완료, 나머지는 공개정보 기준(미실사). 생산능력·인증은 시점에 따라 변동 가능. 검증메모상 인증 미입증 업체({certUnverifiedCount}개사)는 '미확인'으로 표기하고 인증 집계에서 제외.
          </p>

          {/* ── KPI Stats Row ── */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1.25rem',
            flexWrap: 'wrap',
          }}>
            {[
              { label: '전체 벤더', value: totalVendors, color: '#06B6D4', icon: '🏭' },
              { label: '🇻🇳 베트남', value: vietnamCount, color: '#10B981', icon: '' },
              { label: '🇹🇭 태국', value: thailandCount, color: '#F59E0B', icon: '' },
              { label: 'FDA 인증', value: fdaCount, color: '#8B5CF6', icon: '✓' },
              { label: 'EU 인증', value: euCount, color: '#38BDF8', icon: '✓' },
            ].map((kpi, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.9rem',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: '10px',
                border: `1px solid ${kpi.color}22`,
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  color: kpi.color,
                  lineHeight: 1,
                }}>{kpi.value}</span>
                <span style={{
                  fontSize: '0.7rem',
                  color: '#94A3B8',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}>{kpi.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
          <button 
            onClick={() => setActiveTab('vendors')}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'vendors' ? 'linear-gradient(135deg, rgba(6,182,212,0.35), rgba(139,92,246,0.2))' : 'transparent',
              color: activeTab === 'vendors' ? '#fff' : '#94a3b8',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'vendors' ? '0 2px 12px rgba(6,182,212,0.2)' : 'none',
            }}
          >
            <Users size={16} /> 벤더 프로필
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'stats' ? 'linear-gradient(135deg, rgba(6,182,212,0.35), rgba(139,92,246,0.2))' : 'transparent',
              color: activeTab === 'stats' ? '#fff' : '#94a3b8',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'stats' ? '0 2px 12px rgba(6,182,212,0.2)' : 'none',
            }}
          >
            <BarChart3 size={16} /> 무역 통계
          </button>
        </div>
      </header>

      {/* ── Decorative divider ── */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.3), rgba(139,92,246,0.2), transparent)',
        margin: '-1rem 0 0.5rem 0',
      }} />

      {activeTab === 'vendors' ? (
        <>
          {/* 2-Step IA: Situation (Filter & Macro Stats) */}
          <div className={styles.filterBar}>
            <div className={styles.countryFilterGroup}>
              <button 
                className={`${styles.countryBtn} ${activeCountry === 'All' ? styles.active : ''}`}
                onClick={() => setActiveCountry('All')}
              >
                <Globe2 size={14} /> 전체
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  background: activeCountry === 'All' ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.08)',
                  color: activeCountry === 'All' ? '#06B6D4' : '#64748b',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  marginLeft: '2px',
                }}>{getCountryCount('All')}</span>
              </button>
              <button 
                className={`${styles.countryBtn} ${activeCountry === 'Vietnam' ? styles.active : ''}`}
                onClick={() => setActiveCountry('Vietnam')}
              >
                🇻🇳 베트남
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  background: activeCountry === 'Vietnam' ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.08)',
                  color: activeCountry === 'Vietnam' ? '#06B6D4' : '#64748b',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  marginLeft: '2px',
                }}>{getCountryCount('Vietnam')}</span>
              </button>
              <button 
                className={`${styles.countryBtn} ${activeCountry === 'Thailand' ? styles.active : ''}`}
                onClick={() => setActiveCountry('Thailand')}
              >
                🇹🇭 태국
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  background: activeCountry === 'Thailand' ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.08)',
                  color: activeCountry === 'Thailand' ? '#06B6D4' : '#64748b',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  marginLeft: '2px',
                }}>{getCountryCount('Thailand')}</span>
              </button>
            </div>
            
            <div className={styles.filterGroupDivider}></div>

            {filters.map(f => (
              <button 
                key={f}
                className={`${styles.filterBtn} ${activeFilter === f ? styles.active : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {FILTER_KO[f] || f.replace('Tier 1: ', '')}
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  background: activeFilter === f ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.06)',
                  color: activeFilter === f ? '#06B6D4' : '#64748b',
                  padding: '1px 5px',
                  borderRadius: '6px',
                  marginLeft: '5px',
                }}>{getFilterCount(f)}</span>
              </button>
            ))}
          </div>

          <div className={styles.masonryGrid}>
            {filteredData.map((vendor: any, cardIndex: number) => (
              <div key={vendor.id} className={styles.glassCard} onClick={() => setSelectedVendor(vendor)}>
                {/* ── Gradient top accent bar ── */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  borderRadius: '8px 8px 0 0',
                  background: vendor.tier.includes('Tier 1')
                    ? 'linear-gradient(90deg, #10B981, #06B6D4)'
                    : vendor.tier.includes('Volume')
                    ? 'linear-gradient(90deg, #38BDF8, #8B5CF6)'
                    : 'linear-gradient(90deg, #F59E0B, #F43F5E)',
                }} />

                {/* ── Card index number ── */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '14px',
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  color: 'rgba(255,255,255,0.04)',
                  lineHeight: 1,
                  letterSpacing: '-1px',
                  pointerEvents: 'none',
                  fontVariantNumeric: 'tabular-nums',
                }}>{String(cardIndex + 1).padStart(2, '0')}</div>

                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>
                      {vendor.country === 'Vietnam' ? '🇻🇳 ' : '🇹🇭 '}
                      {vendor.name}
                    </h3>
                    <div className={styles.cardRegion}><MapPin size={10} style={{ display: 'inline', marginRight: '3px' }}/>{vendorLocation(vendor)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    {vendor.isNew && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.18)', color: '#06B6D4', border: '1px solid rgba(6, 182, 212, 0.45)', letterSpacing: '0.5px' }}>신규 · 공개정보</span>
                    )}
                    {vendor.reviewFlag && (
                      <span title={vendor.reviewFlag} style={{ fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.45)', letterSpacing: '0.5px' }}>⚠️ 재확인 필요</span>
                    )}
                    <div className={`${styles.tierBadge} ${vendor.tier.includes('Tier 1') ? styles.tier1 : vendor.tier.includes('Tier 2') ? styles.tier2 : styles.tier3}`}>
                      {tierKo(vendor.tier)}
                    </div>
                  </div>
                </div>

                <div className={styles.metricsRow}>
                  <div className={styles.metricBox}>
                    <div className={styles.metricLabel}>일일 생산능력</div>
                    <div className={styles.metricValue}>
                      {vendor.capacityMT ? (<>{vendor.capacityMT}<span>MT/일</span></>) : (<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>공개정보 미확인</span>)}
                    </div>
                    {/* ── Mini capacity progress bar ── */}
                    {vendor.capacityMT > 0 && maxCapacity > 0 && (
                      <div style={{
                        marginTop: '6px',
                        height: '3px',
                        borderRadius: '2px',
                        background: 'rgba(255,255,255,0.06)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min((vendor.capacityMT / maxCapacity) * 100, 100)}%`,
                          borderRadius: '2px',
                          background: 'linear-gradient(90deg, #06B6D4, #8B5CF6)',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    )}
                  </div>
                  <div className={styles.metricBox}>
                    <div className={styles.metricLabel}>인증 현황</div>
                    <div className={styles.metricValue} style={{ fontSize: '0.9rem', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(() => {
                        // 검증 미입증(신뢰도 '낮음') 업체의 인증 주장은 단정 표시하지 않음
                        const unv = isCertUnverified(vendor);
                        const unvStyle = {
                          background: 'rgba(245,158,11,0.10)',
                          color: '#F59E0B',
                          border: '1px dashed rgba(245,158,11,0.45)',
                        };
                        return (
                          <>
                            {vendor.hasEU && (
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '2px 7px',
                                borderRadius: '6px',
                                background: 'rgba(139,92,246,0.12)',
                                color: '#C084FC',
                                border: '1px solid rgba(139,92,246,0.3)',
                                fontWeight: 600,
                                ...(unv ? unvStyle : {}),
                              }}>EU{unv ? ' 미확인' : ''}</span>
                            )}
                            {vendor.hasFDA && (
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '2px 7px',
                                borderRadius: '6px',
                                background: 'rgba(16,185,129,0.12)',
                                color: '#10B981',
                                border: '1px solid rgba(16,185,129,0.3)',
                                fontWeight: 600,
                                ...(unv ? unvStyle : {}),
                              }}>FDA{unv ? ' 미확인' : ''}</span>
                            )}
                            {vendor.msc && (
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '2px 7px',
                                borderRadius: '6px',
                                background: 'rgba(56,189,248,0.12)',
                                color: '#38BDF8',
                                border: '1px solid rgba(56,189,248,0.3)',
                                fontWeight: 600,
                                ...(unv ? unvStyle : {}),
                              }}>MSC{unv ? ' 미확인' : ''}</span>
                            )}
                            {!vendor.hasEU && !vendor.hasFDA && !vendor.msc && (
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '2px 7px',
                                borderRadius: '6px',
                                background: 'rgba(255,255,255,0.05)',
                                color: '#64748b',
                                border: '1px solid rgba(255,255,255,0.08)',
                                fontWeight: 600,
                              }}>국제인증 없음</span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className={styles.takeawayBox} style={{ marginTop: '0.5rem', background: 'transparent', borderLeft: '3px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem' }}>
                  <div className={styles.takeawayText} style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                    "{vendor.specialty}"
                  </div>
                </div>
                
                <div style={{
                  marginTop: '1rem',
                  textAlign: 'right',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'linear-gradient(90deg, #06B6D4, #8B5CF6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  상세 프로필 보기 →
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <ThaiTunaTradeStats />
      )}

      {/* Modal for Deep Dive (Takeaway) */}
      {selectedVendor && (
        <div className={styles.modalOverlay} onClick={() => setSelectedVendor(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            {/* ── Modal gradient header bar ── */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              borderRadius: '8px 8px 0 0',
              background: 'linear-gradient(90deg, #06B6D4, #8B5CF6, #10B981)',
            }} />

            <button className={styles.closeBtn} onClick={() => setSelectedVendor(null)}><X size={24} /></button>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {selectedVendor.country === 'Vietnam' ? '🇻🇳 ' : '🇹🇭 '}
              {selectedVendor.name}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span className={styles.cardRegion}><MapPin size={12} style={{ display: 'inline', marginRight: '3px' }}/>{vendorLocation(selectedVendor)}</span>
              <span className={styles.tierBadge} style={{ background: 'rgba(255,255,255,0.1)' }}>{tierKo(selectedVendor.tier)}</span>
            </div>

            {/* ── Section divider ── */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', margin: '0 0 1.2rem 0' }} />

            {selectedVendor.reviewFlag && (
              <div style={{ background: 'rgba(245, 158, 11, 0.07)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.75rem 1rem', borderRadius: '8px', margin: '0 0 1.2rem 0', fontSize: '0.82rem', color: '#FBBF24', lineHeight: 1.55 }}>
                ⚠️ <strong>재확인 필요</strong> — {selectedVendor.reviewFlag}
              </div>
            )}

            <div className={styles.specialtyBox}>
              <strong>전문 분야:</strong> {selectedVendor.specialty}
            </div>

            <div className={styles.certRow}>
              {(() => {
                const unv = isCertUnverified(selectedVendor);
                const certs: { label: string; held: boolean }[] = [
                  { label: 'US FDA FCE', held: selectedVendor.hasFDA },
                  { label: 'EU 승인코드', held: selectedVendor.hasEU },
                  { label: 'MSC / ISSF', held: selectedVendor.msc },
                ];
                return certs.map((c) => (
                  <span key={c.label} className={`${styles.certBadge} ${c.held && !unv ? styles.active : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block',
                      background: c.held ? (unv ? '#F59E0B' : '#10B981') : '#64748b',
                      boxShadow: c.held ? (unv ? '0 0 6px rgba(245,158,11,0.5)' : '0 0 6px rgba(16,185,129,0.5)') : 'none',
                    }} />
                    {c.label}{c.held && unv ? ' (미확인)' : ''}
                  </span>
                ));
              })()}
            </div>

            <div className={styles.takeawayBox} style={{ marginTop: '2rem' }}>
              <div className={styles.takeawayTitle}>
                <Target size={16} /> 신라교역 전략 시사점
              </div>
              <p className={styles.takeawayText}>{selectedVendor.takeaway}</p>
            </div>

            {selectedVendor.meetingData && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* ── Section divider ── */}
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.15), transparent)', margin: '0 0 1rem 0' }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ClipboardList size={18} color="#06B6D4" /> 벤더사 미팅/실사 결과 보고
                </h3>
                
                <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #10B981' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600, marginBottom: '0.5rem' }}>강점</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{selectedVendor.meetingData.summary.strength}</div>
                  </div>
                  <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #F43F5E' }}>
                    <div style={{ fontSize: '0.85rem', color: '#F43F5E', fontWeight: 600, marginBottom: '0.5rem' }}>약점</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{selectedVendor.meetingData.summary.weakness}</div>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', color: '#E2E8F0', marginBottom: '0.75rem' }}>세부 점검 항목</h4>
                <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <tbody>
                      {selectedVendor.meetingData.details.map((detail: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', width: '25%', verticalAlign: 'top' }}>{detail.category}</td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>
                            {detail.content}
                            {detail.note && (
                              <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: detail.note.includes('[주의]') ? '#F43F5E' : '#94A3B8' }}>
                                * {detail.note}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '1.25rem', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#38BDF8', marginBottom: '0.75rem', fontWeight: 600 }}>전략적 검토 및 시사점</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    {selectedVendor.meetingData.strategicReview.map((review: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>{review}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {selectedVendor.publicProfile && (() => {
              const pp = selectedVendor.publicProfile as any;
              const ppm = (selectedVendor.publicProfileMeta || {}) as any;
              const conf: string = ppm.dataConfidence || 'low';
              const confKor = conf === 'high' ? '높음' : conf === 'medium' ? '보통' : '낮음';
              const confColor = conf === 'high' ? '#10B981' : conf === 'medium' ? '#F59E0B' : '#F43F5E';
              const rows: [string, string][] = [
                ['설립', pp.founded],
                ['본사', pp.headquarters],
                ['소유구조', pp.ownership],
                ['공장', (pp.plants || []).join('  ·  ')],
                ['생산능력', pp.capacityNote],
                ['제품군', (pp.products || []).join(', ')],
                ['수출시장', (pp.exportMarkets || []).join(', ')],
                ['매출', pp.revenue],
                ['임직원', pp.employees],
              ].filter((r): r is [string, string] => Boolean(r[1]));
              const certs = (pp.certifications || []) as any[];
              const devs = (pp.recentDevelopments || []) as any[];
              const sources = (pp.sources || []) as any[];
              return (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                  {/* ── Section divider ── */}
                  <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent)', margin: '0 0 0.75rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={18} color="#38BDF8" /> 공개 기업 정보
                    </h3>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(148,163,184,0.12)', color: '#94A3B8', border: '1px solid rgba(148,163,184,0.25)' }}>공개정보 기반 · 미실사</span>
                      <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: `${confColor}22`, color: confColor, border: `1px solid ${confColor}55`, fontWeight: 700 }}>데이터 신뢰도 {confKor}</span>
                    </div>
                  </div>

                  {ppm.summary && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>{ppm.summary}</p>
                  )}

                  {rows.length > 0 && (
                    <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <tbody>
                          {rows.map(([label, value], idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--text-muted)', width: '24%', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{label}</td>
                              <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                                {value}
                              </td>
                            </tr>
                          ))}
                          {pp.website && (
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--text-muted)', verticalAlign: 'top', whiteSpace: 'nowrap' }}>웹사이트</td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>
                                <a href={pp.website} target="_blank" rel="noopener noreferrer" style={{ color: '#38BDF8', textDecoration: 'none', wordBreak: 'break-all' }}>{pp.website}</a>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {certs.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      {/* ── Section divider ── */}
                      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', margin: '0 0 0.75rem 0' }} />
                      <h4 style={{ fontSize: '0.9rem', color: '#E2E8F0', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ShieldCheck size={15} color="#38BDF8" /> 인증 현황 (출처 검증 결과 — 녹색: 코드 확인 · 황색: 번호 미확인)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {certs.map((c: any, idx: number) => (
                          <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.45, paddingLeft: '0.5rem', borderLeft: '2px solid rgba(56,189,248,0.3)', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{
                              width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block', flexShrink: 0,
                              background: c.code ? '#10B981' : '#F59E0B',
                              boxShadow: c.code ? '0 0 4px rgba(16,185,129,0.4)' : '0 0 4px rgba(245,158,11,0.4)',
                              marginTop: '2px',
                            }} />
                            <span>
                              <strong style={{ color: '#E2E8F0' }}>{c.standard}{c.code ? ` (${c.code})` : ''}</strong>
                              {c.note && <span style={{ color: '#94A3B8' }}> — {c.note}</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {devs.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      {/* ── Section divider ── */}
                      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', margin: '0 0 0.75rem 0' }} />
                      <h4 style={{ fontSize: '0.9rem', color: '#E2E8F0', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Newspaper size={15} color="#38BDF8" /> 최근 동향
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-main)', fontSize: '0.82rem', lineHeight: 1.55 }}>
                        {devs.map((d: any, idx: number) => (
                          <li key={idx} style={{ marginBottom: '0.4rem' }}>
                            {d.date && <span style={{ color: '#38BDF8', fontWeight: 600, marginRight: '0.4rem' }}>{d.date}</span>}
                            {d.summary}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ppm.verificationSummary && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: sources.length > 0 ? '1.25rem' : 0 }}>
                      <h4 style={{ fontSize: '0.85rem', color: '#F59E0B', marginBottom: '0.5rem', fontWeight: 600 }}>검증 메모 (무엇이 확인/미확인되었나)</h4>
                      <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.8rem', lineHeight: 1.6 }}>{ppm.verificationSummary}</p>
                    </div>
                  )}

                  {sources.length > 0 && (
                    <div>
                      {/* ── Section divider ── */}
                      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', margin: '0 0 0.75rem 0' }} />
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ExternalLink size={14} /> 출처
                      </h4>
                      <ol style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.6 }}>
                        {sources.map((s: any, idx: number) => (
                          <li key={idx} style={{ marginBottom: '0.25rem' }}>
                            {s.url ? (
                              <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'none' }}>{s.label || s.url}</a>
                            ) : (s.label)}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
});

export default SEAsiaOEMDashboard;
