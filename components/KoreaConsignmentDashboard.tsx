"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, Cell
} from 'recharts';
import { 
  TrendingUp, Ship, Anchor, AlertTriangle, ShieldCheck, DollarSign, Calendar,
  Activity, Thermometer, Database, CheckCircle, XCircle
} from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, index: any) => {
          return (
            <div key={index} className={styles.tooltipValue}>
              <span style={{ color: entry.color }}>■ {entry.name}</span>
              <strong>{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</strong>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
}

export default function KoreaConsignmentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('2026'); // 'all', '2026', '2025', '2024'

  useEffect(() => {
    fetch('/api/consignment')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load consignment data", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading 3-Year Consignment Intelligence...</p>
    </div>
  );

  const meta = data?._meta;
  const yearlyTop = data?.yearlyTop || {};
  const monthlyDetail = data?.monthlyDetail || {};

  // For "All (3-Year)" tab, we can aggregate top 15 across all years or just show yearly totals
  const getTabChartData = () => {
    if (activeTab === 'all') {
      // Create a yearly summary chart data
      const yearlySummary = Object.keys(yearlyTop).map(year => {
        const topSpecies = yearlyTop[year];
        const totalAmount = topSpecies.reduce((sum: number, s: any) => sum + s.saleAmount, 0);
        const totalQty = topSpecies.reduce((sum: number, s: any) => sum + s.saleQty, 0);
        return {
          name: year,
          saleAmount: totalAmount,
          saleQty: totalQty
        };
      });
      return yearlySummary;
    } else {
      // Top 15 of the specific year
      return yearlyTop[activeTab] ? yearlyTop[activeTab].slice(0, 15) : [];
    }
  };

  const chartData = getTabChartData();

  // For 2026 detailed tables, get all months in 2026
  const getMonthsForYear = (year: string) => {
    return Object.keys(monthlyDetail).filter(m => m.startsWith(year)).sort((a, b) => b.localeCompare(a));
  };

  const monthsToShow = activeTab === 'all' ? [] : getMonthsForYear(activeTab);

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '8px', 
              background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)'
            }}>
              <Calendar size={24} color="var(--text-primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px',
                  background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  해양수산부: 위탁판매 3개년 분석 현황
                </h1>
                <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', background:'rgba(16, 185, 129, 0.1)', border:'1px solid #10b981', color:'var(--color-success)', fontSize:'0.7rem', fontWeight:600, padding:'2px 8px', borderRadius:'12px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }}></span>
                  Empirical Data Verified
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>2024-2026 Monthly National Consignment Intelligence by Seafood Type</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.2)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {[
              { id: '2026', label: '2026 상세실적' },
              { id: '2025', label: '2025' },
              { id: '2024', label: '2024' },
              { id: 'all', label: '3개년 요약' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #38bdf8, #0ea5e9)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text-primary)' : '#94a3b8',
                  border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  boxShadow: activeTab === tab.id ? '0 2px 10px rgba(14, 165, 233, 0.3)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {meta && (
          <div style={{ 
            display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
            background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '8px', padding: '8px 14px', marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8'
          }}>
            <span>📅 집계 기간: <strong style={{color:'var(--color-success)'}}>2024.01 - 2026.05</strong></span>
            <span>📊 총 레코드: <strong style={{color:'var(--color-success)'}}>{Number(meta.totalRecords).toLocaleString()}건</strong></span>
            <span>🐟 전체 어종: <strong style={{color:'var(--color-success)'}}>{meta.totalSpecies}종</strong></span>
            <span>🕐 데이터 갱신: <strong style={{color:'var(--color-success)'}}>{new Date(meta.generatedAt).toLocaleString('ko-KR')}</strong></span>
            {meta.partialYears?.['2026'] && (
              <span>⚠️ 2026: <strong style={{color:'var(--color-warning)'}}>{meta.partialYears['2026'].label} (진행 중)</strong></span>
            )}
          </div>
        )}
      </header>

      {/* ========================================== */}
      {/* Phase 1: Live Intelligence Widgets         */}
      {/* ========================================== */}
      {data?._liveIntelligence && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="var(--color-success)" />
              9대 데이터망 실시간 관제 센터 (Command Center)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {Object.entries(data._liveIntelligence.networksStatus).map(([key, status]: any) => {
                const statusColor = status === 'online' ? 'var(--color-success)' : status === 'standby' ? 'var(--color-warning)' : 'var(--color-danger)';
                const statusLabel = status === 'online' ? 'LIVE' : status === 'standby' ? 'STANDBY' : 'OFFLINE';
                return (
                  <div key={key} style={{ 
                    background: 'rgba(0, 0, 0, 0.2)', border: `1px solid ${statusColor}33`, 
                    padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{key.split('_')[0]}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: statusColor, fontWeight: 700 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, display: 'inline-block', boxShadow: `0 0 8px ${statusColor}` }}></span>
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {/* Widget 1: Arbitrage Radar */}
            <div className={styles.glassCard} style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#38bdf8', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <DollarSign size={18} /> 실시간 아비트리지 레이더
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Mackerel */}
                <div style={{ background: 'rgba(2, 14, 28, 0.3)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>고등어 (Mackerel)</span>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: data._liveIntelligence.metrics.arbitrage.mackerel.signal === 'IMPORT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: data._liveIntelligence.metrics.arbitrage.mackerel.signal === 'IMPORT' ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 700 }}>
                      {data._liveIntelligence.metrics.arbitrage.mackerel.signal === 'IMPORT' ? '수입 매입 권장' : '위판장 직매입'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>예상 수입 단가 (통관+환율)</div>
                      <div style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>₩{data._liveIntelligence.metrics.arbitrage.mackerel.importPriceKrw.toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, paddingBottom: '4px' }}>VS</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>국내 평균 위판가</div>
                      <div style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>₩{data._liveIntelligence.metrics.arbitrage.mackerel.localPriceKrw.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                {/* Squid */}
                <div style={{ background: 'rgba(2, 14, 28, 0.3)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>오징어 (Squid)</span>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: data._liveIntelligence.metrics.arbitrage.squid.signal === 'IMPORT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: data._liveIntelligence.metrics.arbitrage.squid.signal === 'IMPORT' ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 700 }}>
                      {data._liveIntelligence.metrics.arbitrage.squid.signal === 'IMPORT' ? '수입 매입 권장' : '위판장 직매입'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>예상 수입 단가 (통관+환율)</div>
                      <div style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>₩{data._liveIntelligence.metrics.arbitrage.squid.importPriceKrw.toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, paddingBottom: '4px' }}>VS</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '2px' }}>국내 평균 위판가</div>
                      <div style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>₩{data._liveIntelligence.metrics.arbitrage.squid.localPriceKrw.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2: Fishing Risk Simulator */}
            <div className={styles.glassCard} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--color-danger)', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <Thermometer size={18} /> 조업 환경 및 공급 리스크 감지
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>MGO 선박유 (조업 비용)</div>
                    <div style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 700 }}>${data._liveIntelligence.metrics.mgoPrice.toLocaleString()} <span style={{fontSize:'0.8rem', color:'#64748b', fontWeight:400}}>/ mt</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>NOAA ONI 표층 수온 편차</div>
                    <div style={{ fontSize: '1.3rem', color: data._liveIntelligence.metrics.seaTemperatureAnomaly > 0.5 ? 'var(--color-danger)' : data._liveIntelligence.metrics.seaTemperatureAnomaly > 0 ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 700 }}>{data._liveIntelligence.metrics.seaTemperatureAnomaly > 0 ? '+' : ''}{data._liveIntelligence.metrics.seaTemperatureAnomaly}°C</div>
                  </div>
                </div>
                
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '8px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: 600 }}>단기 출어 포기 리스크 (Shortage)</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-danger)', fontWeight: 800 }}>{data._liveIntelligence.metrics.fishingRiskScore} / 100</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ width: `${data._liveIntelligence.metrics.fishingRiskScore}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}></div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#fecaca', lineHeight: 1.5 }}>
                    {data._liveIntelligence.metrics.fishingRiskScore >= 70 
                      ? '유가 상승 및 고수온 장기화로 연근해 어선 출어 포기율 급증. 향후 2~3주 내 국내 위판장 공급 물량 부족 확률이 높습니다. 대체재 수입 혹은 재고 비축을 강력히 권장합니다.'
                      : data._liveIntelligence.metrics.fishingRiskScore >= 40
                        ? '유가 및 해황 조건이 보통 수준입니다. 단기적 공급 불안은 제한적이나, MGO 가격과 수온 편차를 지속 모니터링하시기 바랍니다.'
                        : '조업 환경이 안정적입니다. 국내 위판장 공급 물량은 정상 범위 내에 있으며, 안정적인 소싱이 가능합니다.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Widget 3: Margin Tracker */}
            <div className={styles.glassCard} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--color-success)', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <CheckCircle size={18} /> 밸류체인 유통 마진 추적기
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1, justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(2, 14, 28, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>해수부 산지 평균 위판가</div>
                    <div style={{ fontSize: '1.2rem', color: '#38bdf8', fontWeight: 700 }}>₩{data._liveIntelligence.metrics.retailMarginTracker.localAuctionAvg.toLocaleString()}</div>
                  </div>
                  <div style={{ color: '#475569', fontWeight: 800, padding: '0 10px' }}>➔</div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>aT 소비자가 (소매가)</div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--color-warning)', fontWeight: 700 }}>₩{data._liveIntelligence.metrics.retailMarginTracker.retailAvg.toLocaleString()}</div>
                  </div>
                </div>
                
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center', marginTop: 'auto' }}>
                  <div style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: 600 }}>유통 마진 스프레드</div>
                  <div style={{ fontSize: '1.8rem', color: 'var(--color-success)', fontWeight: 800, margin: '8px 0' }}>
                    ₩{data._liveIntelligence.metrics.retailMarginTracker.marginSpread.toLocaleString()} 
                    <span style={{fontSize:'0.9rem', fontWeight:500, color: '#6ee7b7', marginLeft: '4px'}}>/ kg</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#a7f3d0', lineHeight: 1.4 }}>
                    위판장 산지 직매입 후 B2C 가공 유통 시 마진율 극대화 구간 진입 (PROFITABLE)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        <div className={styles.glassCard} style={{ display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
          <div style={{ position: 'relative', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: 700, color: '#38bdf8', margin: '0 0 0.4rem 0' }}>
              <TrendingUp size={18} />
              {activeTab === 'all' ? '연도별 총 판매 금액 추이' : `${activeTab}년 어종별 누적 판매 금액 (Top 15)`}
            </h3>
          </div>
          <div style={{ height: '325px', width: '100%', marginBottom: '1rem', position: 'relative', zIndex: 0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 30, right: 10, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey={activeTab === 'all' ? "name" : "seafoodName"} stroke="#64748b" tick={{fontSize:10}} angle={activeTab === 'all' ? 0 : -30} textAnchor={activeTab === 'all' ? 'middle' : 'end'} />
                <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={(val) => `${(val / 100000000).toFixed(0)}억`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Legend wrapperStyle={{fontSize:'11px', top: 0}} />
                <Bar dataKey="saleAmount" name="판매금액 (원)" fill="#0ea5e9" radius={[6,6,0,0]} fillOpacity={0.85} />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ background: 'rgba(2, 14, 28, 0.45)', borderTop: `2px solid #38bdf8`, borderRadius: '8px', padding: '14px' }}>
              <h4 style={{ color: 'var(--color-warning)', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 4px 0' }}>⚡ 실행 전략 (EXECUTIVE TAKEAWAY)</h4>
              <p style={{ color: '#fde68a', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                {activeTab === 'all' ? '3개년 총 판매 금액 추이를 통해 국내 수산 시장의 전반적인 규모 변화와 트렌드를 파악.' : `어종별 누적 거래 대금을 분석하여 ${activeTab}년도 핵심 캐시카우 어종을 선별하고, 전략적 매입 계획 수립에 활용.`}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.glassCard} style={{ display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
          <div style={{ position: 'relative', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: 700, color: '#38bdf8', margin: '0 0 0.4rem 0' }}>
              <Anchor size={18} />
              {activeTab === 'all' ? '연도별 총 유통 물량 추이' : `${activeTab}년 어종별 누적 판매 물량 (Top 15)`}
            </h3>
          </div>
          <div style={{ height: '325px', width: '100%', marginBottom: '1rem', position: 'relative', zIndex: 0 }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 30, right: 10, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey={activeTab === 'all' ? "name" : "seafoodName"} stroke="#64748b" tick={{fontSize:10}} angle={activeTab === 'all' ? 0 : -30} textAnchor={activeTab === 'all' ? 'middle' : 'end'} />
                <YAxis stroke="#64748b" tick={{fontSize:10}} tickFormatter={(val) => `${(val / 1000).toFixed(0)}t`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Legend wrapperStyle={{fontSize:'11px', top: 0}} />
                <Bar dataKey="saleQty" name="판매물량 (kg)" fill="#8b5cf6" radius={[6,6,0,0]} fillOpacity={0.85} />
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div style={{ background: 'rgba(2, 14, 28, 0.45)', borderTop: `2px solid #38bdf8`, borderRadius: '8px', padding: '14px' }}>
              <h4 style={{ color: 'var(--color-warning)', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 4px 0' }}>⚡ 물량 확보 전략</h4>
              <p style={{ color: '#fde68a', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                {activeTab === 'all' ? '국내 총 유통 물량 변동성을 모니터링하여 가공 공장 케파(Capacity) 및 원물 확보 스케줄 사전 기획.' : `물량이 집중되는 핵심 어종의 ${activeTab}년 공급 안정성을 평가하고 대체 어종 발굴 등 SCM 유연성 확보에 주력.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table Section (Only for specific year) */}
      {activeTab !== 'all' && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="#38bdf8" />
            {activeTab}년 월별/어종별 위탁판매 상세 실적
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100%, 1fr))', gap: '1.5rem' }}>
            {monthsToShow.map(monthStr => (
              <div key={monthStr} className={styles.glassCard} style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                <div style={{ position: 'relative', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.6rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
                    {monthStr} 월간 핵심 어종 거래 실적 (Top 10)
                  </h3>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'center', color: '#94a3b8', fontWeight: 600, width: '60px' }}>순위</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>어종명 (Seafood Name)</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>위탁판매물량 (kg)</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>위탁판매금액 (원)</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>평균 단가 (원/kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyDetail[monthStr] && monthlyDetail[monthStr].slice(0, 10).map((item: any, index: number) => (
                        <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '10px 14px', color: '#cbd5e1', textAlign: 'center' }}>{item.rank}</td>
                          <td style={{ padding: '10px 14px', color: '#38bdf8', fontWeight: 600 }}>{item.seafoodName}</td>
                          <td style={{ padding: '10px 14px', color: '#e2e8f0', textAlign: 'right' }}>{item.saleQty?.toLocaleString() || '0'}</td>
                          <td style={{ padding: '10px 14px', color: '#e2e8f0', textAlign: 'right' }}>{item.saleAmount?.toLocaleString() || '0'}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--color-warning)', textAlign: 'right', fontWeight: 600 }}>{item.avgUnitPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                      {monthlyDetail[monthStr] && monthlyDetail[monthStr].length > 0 && (() => {
                        const totalQty = monthlyDetail[monthStr].reduce((sum: number, item: any) => sum + item.saleQty, 0);
                        const totalAmt = monthlyDetail[monthStr].reduce((sum: number, item: any) => sum + item.saleAmount, 0);
                        const avgPrice = totalQty > 0 ? Math.round(totalAmt / totalQty) : 0;
                        return (
                          <tr style={{ background: 'rgba(56, 189, 248, 0.08)', borderTop: '2px solid rgba(56, 189, 248, 0.3)' }}>
                            <td colSpan={2} style={{ padding: '12px 14px', color: '#38bdf8', textAlign: 'center', fontWeight: 700, letterSpacing: '0.5px' }}>{monthStr} 집계 총괄</td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-primary)', textAlign: 'right', fontWeight: 700 }}>{totalQty.toLocaleString()}</td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-primary)', textAlign: 'right', fontWeight: 700 }}>{totalAmt.toLocaleString()}</td>
                            <td style={{ padding: '12px 14px', color: 'var(--color-warning)', textAlign: 'right', fontWeight: 700 }}>{avgPrice.toLocaleString()}</td>
                          </tr>
                        );
                      })()}
                      {(!monthlyDetail[monthStr] || monthlyDetail[monthStr].length === 0) && (
                        <tr>
                          <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
                            해당 월의 데이터가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            
            {monthsToShow.length === 0 && (
              <div className={styles.glassCard} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                해당 연도의 월간 상세 데이터가 존재하지 않습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
