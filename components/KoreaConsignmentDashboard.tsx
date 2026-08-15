"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';
import { 
  TrendingUp, Anchor, ShieldCheck, DollarSign, Calendar,
  Activity, Thermometer, CheckCircle
} from 'lucide-react';
import styles from './MackerelStrategy.module.css';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';
import { getConsignmentNetworkPresentation } from '../lib/consignment-data';

// 9대 데이터망 한글 표기 (L-01) — 약어(KAMIS·NOAA·FAO 등)는 화이트리스트 허용
const NETWORK_LABELS: Record<string, string> = {
  mof_consignment: '해수부 위판',
  kcs_customs: '관세청 통관',
  kamis_retail: 'KAMIS 시세',
  nifs_ocean: '수산과학원',
  mgo_energy: '선박유 시세',
  bok_exchange: '환율(USD)',
  noaa_climate: 'NOAA 기후',
  fao_global: 'FAO 통계',
  fbx_freight: '해상 운임',
};

const PRICE_TREND_COLORS = ['#38bdf8', '#f59e0b', '#10b981', '#a78bfa', '#f43f5e', '#22d3ee'];

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

const UnitPriceTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const validPayload = payload.filter((entry: any) => typeof entry.value === 'number');
    if (validPayload.length === 0) return null;
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {validPayload.map((entry: any, index: number) => (
          <div key={index} className={styles.tooltipValue}>
            <span style={{ color: entry.color }}>{entry.name}</span>
            <strong>₩{Math.round(entry.value).toLocaleString()} / kg</strong>
          </div>
        ))}
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
      <p style={{ color: 'var(--w-slate-400)', fontSize: '1rem' }}>3개년 위탁판매 인텔리전스 불러오는 중...</p>
    </div>
  );

  const meta = data?._meta;
  const yearlyTop = data?.yearlyTop || {};
  const monthlyDetail = data?.monthlyDetail || {};

  // 집계 기간·동기화 기준월은 하드코딩하지 않고 실데이터 월 목록에서 산출
  const dataMonths: string[] = (meta?.months && Array.isArray(meta.months) && meta.months.length > 0)
    ? [...meta.months].sort()
    : Object.keys(monthlyDetail).sort();
  const coverageLabel = dataMonths.length > 0
    ? `${dataMonths[0].replace('-', '.')} - ${dataMonths[dataMonths.length - 1].replace('-', '.')}`
    : null;
  const lastDataMonth = dataMonths.length > 0 ? dataMonths[dataMonths.length - 1].replace('-', '.') : undefined;
  const live = data?._liveIntelligence;
  const liveBaseTime = live?.timestamp ? new Date(live.timestamp).toLocaleString('ko-KR') : null;

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

  const getUnitPriceTrend = () => {
    const months = activeTab === 'all'
      ? Object.keys(monthlyDetail).sort()
      : getMonthsForYear(activeTab).sort();

    const amountBySpecies = new Map<string, number>();
    months.forEach(month => {
      (monthlyDetail[month] || []).forEach((item: any) => {
        amountBySpecies.set(item.seafoodName, (amountBySpecies.get(item.seafoodName) || 0) + (item.saleAmount || 0));
      });
    });

    const species = Array.from(amountBySpecies.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);

    const trendData = months.map(month => {
      const row: Record<string, string | number | null> = { month: month.replace('-', '.') };
      species.forEach(name => {
        const found = (monthlyDetail[month] || []).find((item: any) => item.seafoodName === name);
        row[name] = found?.avgUnitPrice ?? null;
      });
      return row;
    });

    return { species, trendData };
  };

  const unitPriceTrend = getUnitPriceTrend();

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--w-slate-50)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
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
                  background: 'linear-gradient(135deg, var(--w-sky-400), #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  해양수산부: 위탁판매 3개년 분석 현황
                </h1>
                <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', background:'rgba(var(--w-emerald-500-rgb), 0.1)', border:'1px solid var(--w-emerald-500)', color:'var(--color-success)', fontSize:'0.7rem', fontWeight:600, padding:'2px 8px', borderRadius:'12px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }}></span>
                  일자별 전체 거래 동기화
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--w-slate-500)' }}>2024-2026 어종별 월간 국내 위탁판매 현황</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.2)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(140,170,255,0.10)' }}>
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
                  background: activeTab === tab.id ? 'linear-gradient(135deg, var(--w-sky-400), #0ea5e9)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--w-slate-400)',
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
            background: 'rgba(var(--w-emerald-500-rgb), 0.05)', border: '1px solid rgba(var(--w-emerald-500-rgb), 0.15)',
            borderRadius: '8px', padding: '8px 14px', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--w-slate-400)'
          }}>
            <span>📅 집계 기간: <strong style={{color:'var(--color-success)'}}>{coverageLabel || '집계 월 미상'}</strong></span>
            <span>📊 월·어종 집계행: <strong style={{color:'var(--color-success)'}}>{Number(meta.totalRecords).toLocaleString()}건</strong></span>
            <span>🐟 전체 어종: <strong style={{color:'var(--color-success)'}}>{meta.totalSpecies}종</strong></span>
            <span>🕐 데이터 갱신: <strong style={{color:'var(--color-success)'}}>{new Date(meta.generatedAt).toLocaleString('ko-KR')}</strong></span>
            {meta.latestAuctionDate && (
              <span>⚓ 최신 위판일: <strong style={{color:'var(--color-success)'}}>{meta.latestAuctionDate.replaceAll('-', '.')}</strong></span>
            )}
            {meta.officialThrough && (
              <span>✅ 공식 월집계: <strong style={{color:'var(--color-success)'}}>{meta.officialThrough.replace('-', '.')}까지</strong></span>
            )}
            {meta.liveFrom && meta.liveThrough && (
              <span>⏱️ 일별 잠정집계: <strong style={{color:'var(--color-warning)'}}>{meta.liveFrom.replaceAll('-', '.')} - {meta.liveThrough.replaceAll('-', '.')}</strong></span>
            )}
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
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--w-slate-50)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Activity size={20} color="var(--color-success)" />
              9대 데이터망 연동 상태 관제
              {liveBaseTime && (
                <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--w-slate-500)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '10px' }}>
                  조회 기준 시각: {liveBaseTime}
                </span>
              )}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {Object.entries(data._liveIntelligence.networksStatus).map(([key, status]: any) => {
                const presentation = getConsignmentNetworkPresentation(status);
                const statusColor = presentation.tone === 'success' ? 'var(--color-success)' : presentation.tone === 'warning' ? 'var(--color-warning)' : 'var(--color-danger)';
                const statusLabel = presentation.label;
                return (
                  <div key={key} style={{ 
                    background: 'rgba(0, 0, 0, 0.2)', border: `1px solid ${statusColor}33`, 
                    padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--w-slate-400)', fontWeight: 600 }}>{NETWORK_LABELS[key] || key.split('_')[0].toUpperCase()}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: statusColor, fontWeight: 700 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, display: 'inline-block', boxShadow: `0 0 8px ${statusColor}` }}></span>
                      {statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {/* Widget 1: Arbitrage Radar */}
            <div className={styles.glassCard} style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--w-sky-400)', margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <DollarSign size={18} /> 수입·국내 도매 아비트리지 레이더
              </h3>
              <p style={{ margin: '0 0 1.2rem 0', fontSize: '0.7rem', color: 'var(--w-slate-500)', lineHeight: 1.5 }}>
                {data._liveIntelligence.metrics.arbitrage.basis}
                {liveBaseTime && <> · 환율 조회 기준 {liveBaseTime}</>}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Mackerel */}
                <div style={{ background: 'rgba(2, 14, 28, 0.3)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(140,170,255,0.10)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--w-slate-400)', fontWeight: 600 }}>고등어</span>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: data._liveIntelligence.metrics.arbitrage.mackerel.signal === 'IMPORT' ? 'rgba(var(--w-emerald-500-rgb), 0.15)' : 'rgba(var(--w-amber-500-rgb), 0.15)', color: data._liveIntelligence.metrics.arbitrage.mackerel.signal === 'IMPORT' ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 700 }}>
                      {data._liveIntelligence.metrics.arbitrage.mackerel.signal === 'IMPORT' ? '수입 매입 우위' : '국내 매입 우위'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-500)', marginBottom: '2px' }}>추정 수입단가 (CIF 기준치×환율)</div>
                      <div style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>₩{data._liveIntelligence.metrics.arbitrage.mackerel.importPriceKrw.toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, paddingBottom: '4px' }}>대</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-500)', marginBottom: '2px' }}>국내 도매가 (KAMIS{data._liveIntelligence.metrics.arbitrage.mackerel.isLocalLive ? ' 당일' : ' 조회 실패 — 고정 기준치'})</div>
                      <div style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>₩{data._liveIntelligence.metrics.arbitrage.mackerel.localPriceKrw.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                {/* Squid */}
                <div style={{ background: 'rgba(2, 14, 28, 0.3)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(140,170,255,0.10)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--w-slate-400)', fontWeight: 600 }}>오징어</span>
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: data._liveIntelligence.metrics.arbitrage.squid.signal === 'IMPORT' ? 'rgba(var(--w-emerald-500-rgb), 0.15)' : 'rgba(var(--w-amber-500-rgb), 0.15)', color: data._liveIntelligence.metrics.arbitrage.squid.signal === 'IMPORT' ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 700 }}>
                      {data._liveIntelligence.metrics.arbitrage.squid.signal === 'IMPORT' ? '수입 매입 우위' : '국내 매입 우위'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-500)', marginBottom: '2px' }}>추정 수입단가 (CIF 기준치×환율)</div>
                      <div style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>₩{data._liveIntelligence.metrics.arbitrage.squid.importPriceKrw.toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, paddingBottom: '4px' }}>대</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-500)', marginBottom: '2px' }}>국내 도매가 (KAMIS{data._liveIntelligence.metrics.arbitrage.squid.isLocalLive ? ' 당일' : ' 조회 실패 — 고정 기준치'})</div>
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-400)', marginBottom: '4px' }}>MGO 선박유 ($/MT) {data._liveIntelligence.metrics.isMgoLive ? '— 브렌트 프록시 환산' : '— 고정 기준치 (조회 실패)'}</div>
                    <div style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 700 }}>${data._liveIntelligence.metrics.mgoPrice.toLocaleString()} <span style={{fontSize:'0.8rem', color:'var(--w-slate-500)', fontWeight:400}}>/ MT</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-400)', marginBottom: '4px' }}>NOAA ONI 표층 수온 편차{data._liveIntelligence.metrics.isSstLive === false ? ' — 조회 실패 (0 표시)' : ''}</div>
                    <div style={{ fontSize: '1.3rem', color: data._liveIntelligence.metrics.seaTemperatureAnomaly > 0.5 ? 'var(--color-danger)' : data._liveIntelligence.metrics.seaTemperatureAnomaly > 0 ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 700 }}>{data._liveIntelligence.metrics.seaTemperatureAnomaly > 0 ? '+' : ''}{data._liveIntelligence.metrics.seaTemperatureAnomaly}°C</div>
                  </div>
                </div>
                
                <div style={{ background: 'rgba(var(--w-red-500-rgb), 0.08)', border: '1px solid rgba(var(--w-red-500-rgb), 0.2)', padding: '16px', borderRadius: '8px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: 600 }}>단기 출어 포기 리스크 (공급 부족)</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-danger)', fontWeight: 800 }}>{data._liveIntelligence.metrics.fishingRiskScore} / 100</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ width: `${data._liveIntelligence.metrics.fishingRiskScore}%`, height: '100%', background: 'linear-gradient(90deg, var(--w-amber-500), var(--w-red-500))' }}></div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#fecaca', lineHeight: 1.5 }}>
                    {data._liveIntelligence.metrics.fishingRiskScore >= 70 
                      ? '유가 상승 및 고수온 장기화로 연근해 어선 출어 포기율 급증. 향후 2~3주 내 국내 위판장 공급 물량 부족 확률이 높습니다. 대체재 수입 혹은 재고 비축을 강력히 권장합니다.'
                      : data._liveIntelligence.metrics.fishingRiskScore >= 40
                        ? '유가 및 해황 조건이 보통 수준입니다. 단기적 공급 불안은 제한적이나, MGO 가격과 수온 편차를 지속 모니터링하시기 바랍니다.'
                        : '조업 환경이 안정적입니다. 국내 위판장 공급 물량은 정상 범위 내에 있으며, 안정적인 소싱이 가능합니다.'}
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.68rem', color: 'var(--w-slate-400)', lineHeight: 1.5 }}>
                    ※ {data._liveIntelligence.metrics.fishingRiskBasis || '자체 산식 기반 추정 점수 — 실측 출어 통계 아님'}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(2, 14, 28, 0.4)', borderRadius: '8px', border: '1px solid rgba(140,170,255,0.10)' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-400)', marginBottom: '6px' }}>산지 평균 위판가 ({data._liveIntelligence.metrics.latestAuctionMonth} 실측)</div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--w-sky-400)', fontWeight: 700 }}>₩{data._liveIntelligence.metrics.retailMarginTracker.localAuctionAvg.toLocaleString()}</div>
                  </div>
                  <div style={{ color: '#475569', fontWeight: 800, padding: '0 10px' }}>➔</div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--w-slate-400)', marginBottom: '6px' }}>추정 소매가 (산지가 ×{data._liveIntelligence.metrics.retailMarginTracker.retailMultiplier ?? 2.0})</div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--color-warning)', fontWeight: 700 }}>₩{data._liveIntelligence.metrics.retailMarginTracker.retailAvg.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(var(--w-emerald-500-rgb), 0.08)', border: '1px solid rgba(var(--w-emerald-500-rgb), 0.2)', padding: '16px', borderRadius: '8px', textAlign: 'center', marginTop: 'auto' }}>
                  <div style={{ fontSize: '0.85rem', color: '#6ee7b7', fontWeight: 600 }}>유통 마진 스프레드 (추정)</div>
                  <div style={{ fontSize: '1.8rem', color: 'var(--color-success)', fontWeight: 800, margin: '8px 0' }}>
                    ₩{data._liveIntelligence.metrics.retailMarginTracker.marginSpread.toLocaleString()}
                    <span style={{fontSize:'0.9rem', fontWeight:500, color: '#6ee7b7', marginLeft: '4px'}}>/ kg</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#a7f3d0', lineHeight: 1.5 }}>
                    {data._liveIntelligence.metrics.retailMarginTracker.retailBasis || '추정 소매가 = 산지 위판가 × 추정 계수 — 실측 소매가 아님'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        <WidgetCard
          title={activeTab === 'all' ? '연도별 총 판매 금액 추이' : `${activeTab}년 어종별 누적 판매 금액 (Top 15)`}
          icon={TrendingUp}
          iconColor="#38bdf8"
          pillar="S4"
          cardDesc="단위: 원 — 노량진·자갈치 등 위판장 통계 집계"
          telemetry={{ status: data ? 'SYNCED' : 'STATIC', syncDate: lastDataMonth }}
          chartHeight={325}
          chart={
            <BarChart data={chartData} margin={{ top: 30, right: 10, left: 20, bottom: 40 }}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
              <XAxis dataKey={activeTab === 'all' ? "name" : "seafoodName"} stroke="var(--w-slate-500)" tick={{fontSize:10}} angle={activeTab === 'all' ? 0 : -30} textAnchor={activeTab === 'all' ? 'middle' : 'end'} />
              <YAxis stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={(val) => `${(val / 100000000).toFixed(0)}억`} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(140,170,255,0.10)'}} />
              <Legend wrapperStyle={{fontSize:'11px', top: 0}} />
              <Bar dataKey="saleAmount" name="판매금액 (원)" fill="#0ea5e9" radius={[6,6,0,0]} fillOpacity={0.85} />
            </BarChart>
          }
          takeaway={{
            situation: activeTab === 'all' ? '3개년 총 판매 금액 추이를 통해 국내 수산 시장의 전반적인 규모 변화와 트렌드를 파악.' : `${activeTab}년 어종별 누적 거래 대금을 단일 화면에서 비교.`,
            actionPlan: activeTab === 'all' ? '시장 규모 변화 트렌드에 맞춰 매입·판매 전략을 조정.' : `어종별 거래 대금을 분석하여 ${activeTab}년도 핵심 캐시카우 어종을 선별하고, 전략적 매입 계획 수립에 활용.`,
            source: '위판장 집계 데이터',
          }}
        />

        <WidgetCard
          title={activeTab === 'all' ? '연도별 총 유통 물량 추이' : `${activeTab}년 어종별 누적 판매 물량 (Top 15)`}
          icon={Anchor}
          iconColor="#38bdf8"
          pillar="S3"
          cardDesc="단위: kg — 노량진·자갈치 등 위판장 물량 집계"
          telemetry={{ status: data ? 'SYNCED' : 'STATIC', syncDate: lastDataMonth }}
          chartHeight={325}
          chart={
            <BarChart data={chartData} margin={{ top: 30, right: 10, left: 20, bottom: 40 }}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
              <XAxis dataKey={activeTab === 'all' ? "name" : "seafoodName"} stroke="var(--w-slate-500)" tick={{fontSize:10}} angle={activeTab === 'all' ? 0 : -30} textAnchor={activeTab === 'all' ? 'middle' : 'end'} />
              <YAxis stroke="var(--w-slate-500)" tick={{fontSize:10}} tickFormatter={(val) => `${(val / 1000).toFixed(0)}t`} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(140,170,255,0.10)'}} />
              <Legend wrapperStyle={{fontSize:'11px', top: 0}} />
              <Bar dataKey="saleQty" name="판매물량 (kg)" fill="var(--w-violet-500)" radius={[6,6,0,0]} fillOpacity={0.85} />
            </BarChart>
          }
          takeaway={{
            situation: activeTab === 'all' ? '국내 총 유통 물량 변동성을 모니터링하여 가공 공장 케파(Capacity) 및 원물 확보 스케줄 사전 기획.' : `${activeTab}년 어종별 누적 판매 물량을 비교.`,
            actionPlan: activeTab === 'all' ? '유통 물량 변동성에 맞춰 가공 공장 케파·원물 확보 일정을 사전 조정.' : `물량이 집중되는 핵심 어종의 ${activeTab}년 공급 안정성을 평가하고 대체 어종 발굴 등 SCM 유연성 확보에 주력.`,
            source: '위판장 집계 데이터',
          }}
        />
      </div>

      {unitPriceTrend.species.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <WidgetCard
            title={activeTab === 'all' ? '3개년 어종별 평균 단가 추이' : `${activeTab}년 어종별 평균 단가 추이`}
            icon={DollarSign}
            iconColor="#f59e0b"
            pillar="S4"
            cardDesc="월별 평균 단가 = 위탁판매금액 ÷ 위탁판매물량. 선택 기간 거래금액 상위 6개 어종 기준"
            unit="원/kg"
            telemetry={{ status: data ? 'SYNCED' : 'STATIC', syncDate: lastDataMonth }}
            chartHeight={360}
            chart={
              <LineChart data={unitPriceTrend.trendData} margin={{ top: 24, right: 24, left: 8, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--w-slate-500)" tick={{ fontSize: 10 }} />
                <YAxis stroke="var(--w-slate-500)" tick={{ fontSize: 10 }} tickFormatter={(val) => `${Math.round(Number(val) / 1000)}천`} />
                <RechartsTooltip content={<UnitPriceTooltip />} cursor={{ stroke: 'rgba(var(--w-slate-400-rgb), 0.35)', strokeWidth: 1 }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                {unitPriceTrend.species.map((name, index) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    name={name}
                    stroke={PRICE_TREND_COLORS[index % PRICE_TREND_COLORS.length]}
                    strokeWidth={2.4}
                    dot={{ r: 3, strokeWidth: 1.5 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            }
            takeaway={{
              situation: activeTab === 'all'
                ? '3개년 월별 평균 단가를 같은 축에서 비교해 거래금액 상위 어종의 가격 변동성과 계절성을 확인합니다.'
                : `${activeTab}년 거래금액 상위 어종의 월별 kg당 평균 위판 단가를 비교합니다.`,
              actionPlan: '단가가 급등한 어종은 매입 시점을 나누고, 물량은 유지되지만 단가가 안정적인 어종은 대체 소싱 후보로 우선 검토합니다.',
              source: '해양수산부 위판장별 위탁판매 현황 월별 집계',
            }}
          />
        </div>
      )}

      {/* Detailed Table Section (Only for specific year) */}
      {activeTab !== 'all' && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--w-slate-50)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="#38bdf8" />
            {activeTab}년 월별/어종별 위탁판매 상세 실적
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100%, 1fr))', gap: '1.5rem' }}>
            {monthsToShow.map(monthStr => (
              <div key={monthStr} className={styles.glassCard} style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                <div style={{ position: 'relative', marginBottom: '1rem', borderBottom: '1px solid rgba(140,170,255,0.10)', paddingBottom: '0.6rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--w-slate-200)', margin: 0 }}>
                    {monthStr} 월간 핵심 어종 거래 실적 (Top 10)
                  </h3>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--w-slate-400)', fontWeight: 600, width: '60px' }}>순위</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--w-slate-400)', fontWeight: 600 }}>어종명</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--w-slate-400)', fontWeight: 600 }}>위탁판매물량 (kg)</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--w-slate-400)', fontWeight: 600 }}>위탁판매금액 (원)</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', color: 'var(--w-slate-400)', fontWeight: 600 }}>평균 단가 (원/kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyDetail[monthStr] && monthlyDetail[monthStr].slice(0, 10).map((item: any, index: number) => (
                        <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '10px 14px', color: 'var(--w-slate-300)', textAlign: 'center' }}>{item.rank}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--w-sky-400)', fontWeight: 600 }}>{item.seafoodName}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--w-slate-200)', textAlign: 'right' }}>{item.saleQty?.toLocaleString() || '0'}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--w-slate-200)', textAlign: 'right' }}>{item.saleAmount?.toLocaleString() || '0'}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--color-warning)', textAlign: 'right', fontWeight: 600 }}>{item.avgUnitPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                      {monthlyDetail[monthStr] && monthlyDetail[monthStr].length > 0 && (() => {
                        const totalQty = monthlyDetail[monthStr].reduce((sum: number, item: any) => sum + item.saleQty, 0);
                        const totalAmt = monthlyDetail[monthStr].reduce((sum: number, item: any) => sum + item.saleAmount, 0);
                        const avgPrice = totalQty > 0 ? Math.round(totalAmt / totalQty) : 0;
                        return (
                          <tr style={{ background: 'rgba(var(--w-sky-400-rgb), 0.08)', borderTop: '2px solid rgba(var(--w-sky-400-rgb), 0.3)' }}>
                            <td colSpan={2} style={{ padding: '12px 14px', color: 'var(--w-sky-400)', textAlign: 'center', fontWeight: 700, letterSpacing: '0.5px' }}>{monthStr} 집계 총괄</td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-primary)', textAlign: 'right', fontWeight: 700 }}>{totalQty.toLocaleString()}</td>
                            <td style={{ padding: '12px 14px', color: 'var(--text-primary)', textAlign: 'right', fontWeight: 700 }}>{totalAmt.toLocaleString()}</td>
                            <td style={{ padding: '12px 14px', color: 'var(--color-warning)', textAlign: 'right', fontWeight: 700 }}>{avgPrice.toLocaleString()}</td>
                          </tr>
                        );
                      })()}
                      {(!monthlyDetail[monthStr] || monthlyDetail[monthStr].length === 0) && (
                        <tr>
                          <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--w-slate-500)' }}>
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
              <div className={styles.glassCard} style={{ padding: '2rem', textAlign: 'center', color: 'var(--w-slate-500)' }}>
                해당 연도의 월간 상세 데이터가 존재하지 않습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
