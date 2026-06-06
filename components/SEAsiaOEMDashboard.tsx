import React, { useState } from 'react';
import styles from './SEAsiaOEMDashboard.module.css';
import { Target, CheckCircle2, Factory, X, MapPin, ClipboardList, Globe2, BarChart3, Users, Building2, ShieldCheck, ExternalLink, Newspaper } from 'lucide-react';
import vendorsData from '../data/seasia_oem_vendors.json';
import ThaiTunaTradeStats from './ThaiTunaTradeStats';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

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

  return (
    <div className={styles.container}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className={styles.title}>SE Asia OEM Intelligence</h2>
          <p className={styles.subtitle}>태국 및 베트남 참치 통조림/가공업체 심층 프로필 및 전략적 파트너십 벤더 풀</p>
          <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0.4rem 0 0 0', maxWidth: '720px', lineHeight: 1.4 }}>
            출처: 공개 기업정보·인증현황(US FDA FCE·EU Code·MSC) 기반 큐레이션 — {vendorsData.filter((v: any) => v.meetingData).length}개사 현장 실사 완료, 나머지는 공개정보 기준(미실사). 생산능력·인증은 시점에 따라 변동 가능.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={() => setActiveTab('vendors')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'vendors' ? 'var(--color-info)' : 'transparent',
              color: activeTab === 'vendors' ? 'var(--text-primary)' : '#94a3b8',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Users size={16} /> 벤더 프로필
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'stats' ? 'var(--color-info)' : 'transparent',
              color: activeTab === 'stats' ? 'var(--text-primary)' : '#94a3b8',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <BarChart3 size={16} /> 무역 통계
          </button>
        </div>
      </header>

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
              </button>
              <button 
                className={`${styles.countryBtn} ${activeCountry === 'Vietnam' ? styles.active : ''}`}
                onClick={() => setActiveCountry('Vietnam')}
              >
                🇻🇳 베트남
              </button>
              <button 
                className={`${styles.countryBtn} ${activeCountry === 'Thailand' ? styles.active : ''}`}
                onClick={() => setActiveCountry('Thailand')}
              >
                🇹🇭 태국
              </button>
            </div>
            
            <div className={styles.filterGroupDivider}></div>

            {filters.map(f => (
              <button 
                key={f}
                className={`${styles.filterBtn} ${activeFilter === f ? styles.active : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f.replace('Tier 1: ', '')}
              </button>
            ))}
          </div>

          <div className={styles.masonryGrid}>
            {filteredData.map((vendor: any) => (
              <div key={vendor.id} className={styles.glassCard} onClick={() => setSelectedVendor(vendor)}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>
                      {vendor.country === 'Vietnam' ? '🇻🇳 ' : '🇹🇭 '}
                      {vendor.name}
                    </h3>
                    <div className={styles.cardRegion}><MapPin size={10} style={{ display: 'inline', marginRight: '3px' }}/>{vendor.region}, {vendor.country}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    {vendor.isNew && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.18)', color: '#06B6D4', border: '1px solid rgba(6, 182, 212, 0.45)', letterSpacing: '0.5px' }}>NEW · 공개정보</span>
                    )}
                    <div className={`${styles.tierBadge} ${vendor.tier.includes('Tier 1') ? styles.tier1 : vendor.tier.includes('Tier 2') ? styles.tier2 : styles.tier3}`}>
                      {vendor.tier}
                    </div>
                  </div>
                </div>

                <div className={styles.metricsRow}>
                  <div className={styles.metricBox}>
                    <div className={styles.metricLabel}>Daily Capacity</div>
                    <div className={styles.metricValue}>
                      {vendor.capacityMT ? (<>{vendor.capacityMT}<span>MT/day</span></>) : (<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>공개정보 미확인</span>)}
                    </div>
                  </div>
                  <div className={styles.metricBox}>
                    <div className={styles.metricLabel}>Certifications</div>
                    <div className={styles.metricValue} style={{ fontSize: '1rem' }}>
                      {vendor.hasEU ? 'EU • ' : ''}{vendor.hasFDA ? 'FDA • ' : ''}{vendor.msc ? 'MSC' : ''}
                      {!vendor.hasEU && !vendor.hasFDA && !vendor.msc && 'Domestic'}
                    </div>
                  </div>
                </div>

                <div className={styles.takeawayBox} style={{ marginTop: '0.5rem', background: 'transparent', borderLeft: '3px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem' }}>
                  <div className={styles.takeawayText} style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                    "{vendor.specialty}"
                  </div>
                </div>
                
                <div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '0.75rem', color: '#06B6D4', fontWeight: 600 }}>
                  Click to view Silla Takeaway ➔
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
            <button className={styles.closeBtn} onClick={() => setSelectedVendor(null)}><X size={24} /></button>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {selectedVendor.country === 'Vietnam' ? '🇻🇳 ' : '🇹🇭 '}
              {selectedVendor.name}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span className={styles.cardRegion}><MapPin size={12} style={{ display: 'inline', marginRight: '3px' }}/>{selectedVendor.region}, {selectedVendor.country}</span>
              <span className={styles.tierBadge} style={{ background: 'rgba(255,255,255,0.1)' }}>{selectedVendor.tier}</span>
            </div>

            <div className={styles.specialtyBox}>
              <strong>Focus area:</strong> {selectedVendor.specialty}
            </div>

            <div className={styles.certRow}>
              <span className={`${styles.certBadge} ${selectedVendor.hasFDA ? styles.active : ''}`}>US FDA FCE</span>
              <span className={`${styles.certBadge} ${selectedVendor.hasEU ? styles.active : ''}`}>EU Code</span>
              <span className={`${styles.certBadge} ${selectedVendor.msc ? styles.active : ''}`}>MSC / ISSF</span>
            </div>

            <div className={styles.takeawayBox} style={{ marginTop: '2rem' }}>
              <div className={styles.takeawayTitle}>
                <Target size={16} /> Silla Strategic Takeaway
              </div>
              <p className={styles.takeawayText}>{selectedVendor.takeaway}</p>
            </div>

            {selectedVendor.meetingData && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ClipboardList size={18} color="#06B6D4" /> 벤더사 미팅/실사 결과 보고
                </h3>
                
                <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #10B981' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600, marginBottom: '0.5rem' }}>강점 (Strength)</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{selectedVendor.meetingData.summary.strength}</div>
                  </div>
                  <div style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #F43F5E' }}>
                    <div style={{ fontSize: '0.85rem', color: '#F43F5E', fontWeight: 600, marginBottom: '0.5rem' }}>약점 (Weakness)</div>
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
                      <h4 style={{ fontSize: '0.9rem', color: '#E2E8F0', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ShieldCheck size={15} color="#38BDF8" /> 인증 현황 (1차 출처 검증)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {certs.map((c: any, idx: number) => (
                          <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.45, paddingLeft: '0.5rem', borderLeft: '2px solid rgba(56,189,248,0.3)' }}>
                            <strong style={{ color: '#E2E8F0' }}>{c.standard}{c.code ? ` (${c.code})` : ''}</strong>
                            {c.note && <span style={{ color: '#94A3B8' }}> — {c.note}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {devs.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
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
