import React, { useState } from 'react';
import styles from './SEAsiaOEMDashboard.module.css';
import { Target, CheckCircle2, Factory, X, MapPin, ClipboardList, Globe2, BarChart3, Users } from 'lucide-react';
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
                  <div className={`${styles.tierBadge} ${vendor.tier.includes('Tier 1') ? styles.tier1 : vendor.tier.includes('Tier 2') ? styles.tier2 : styles.tier3}`}>
                    {vendor.tier}
                  </div>
                </div>

                <div className={styles.metricsRow}>
                  <div className={styles.metricBox}>
                    <div className={styles.metricLabel}>Daily Capacity</div>
                    <div className={styles.metricValue}>{vendor.capacityMT}<span>MT/day</span></div>
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
          </div>
        </div>
      )}
    </div>
  );
});

export default SEAsiaOEMDashboard;
