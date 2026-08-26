'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ComposedChart, Line, Legend, ReferenceLine, CartesianGrid, Area, AreaChart, LineChart } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Building2, TrendingUp, DollarSign, Wallet, FileText, PieChart, AlertTriangle, Bell, FileSearch } from 'lucide-react';
import { getManagementData } from '@/lib/data/management';
import Link from 'next/link';
import InfoTooltip from '../../components/InfoTooltip';
import TermTooltip from '../../components/TermTooltip';
import SafeResponsiveContainer from '../../components/SafeResponsiveContainer';

const performData = getManagementData('performance');
const competitorData = getManagementData('competitor');
const listedCompaniesData = getManagementData('listedCompanies');
const foodtechData = getManagementData('foodtech');

// Color Palette — SM Report × Whale Report Premium Fusion
const theme = {
  navy: '#0F1A2E',
  navyLight: '#1A2436',
  gold: '#C9A050',
  goldLight: '#E8D5A3',
  cream: '#F7F5F0',
  creamDark: '#EDE9E0',
  white: '#FFFFFF',
  muted: '#64748b',
  border: '#e2e5ea',
  borderLight: '#f0ede7',
  danger: '#dc2626',
  success: '#059669',
  // Gradient tokens
  navyGradient: 'linear-gradient(135deg, #0F1A2E 0%, #1E3050 100%)',
  goldGradient: 'linear-gradient(90deg, #C9A050, #E8D5A3)',
  cardShadow: '0 2px 12px rgba(15, 26, 46, 0.06)',
  cardShadowHover: '0 16px 40px rgba(15, 26, 46, 0.12)',
  sectionShadow: '0 4px 20px rgba(15, 26, 46, 0.04)',
};



const mnaData = [
  {
    id: 'TGT-001',
    name: 'EquaSea Processing',
    sector: '수산물 가공 (Ecuador)',
    rationale: '미국-에콰도르 무관세 혜택 활용 및 고마진 수출망 확보. 관세 리스크 헷지 전략.',
    revenue: 1420,
    ebitda: 170,
    margin: 12.0,
    valuationMultiple: '6.5x',
    ev: 1105,
    risk: 'Low',
    status: 'NDD 진행중'
  },
  {
    id: 'TGT-002',
    name: 'CellMatrix Bio',
    sector: '푸드테크 B2B (US)',
    rationale: '배양육 세포 배양을 위한 3D 식용 비계(Scaffolds) 독점 기술. 완제품 B2C 리스크 회피(Pick-and-Shovel).',
    revenue: 250,
    ebitda: -40,
    margin: -16.0,
    valuationMultiple: '8.0x (Rev)',
    ev: 2000,
    risk: 'High',
    status: '초기 태핑'
  },
  {
    id: 'TGT-003',
    name: 'Nordic AutoFish',
    sector: '수산 로보틱스 (Norway)',
    rationale: 'AI 비전 및 소프트 로보틱스 기반 연어/참치 자동 필렛 가공. 인건비 절감 및 수율 극대화.',
    revenue: 580,
    ebitda: 116,
    margin: 20.0,
    valuationMultiple: '9.0x',
    ev: 1044,
    risk: 'Medium',
    status: 'LOI 제출'
  }
];

// Custom Tooltip for KPI cards and Main Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        background: theme.white, 
        border: `1px solid ${theme.gold}`, 
        padding: '16px', 
        borderRadius: '4px', 
        fontSize: '13px', 
        boxShadow: '0 8px 24px rgba(26,36,54,0.1)'
      }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: theme.navy, fontSize: '14px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '6px', fontFamily: 'serif' }}>{label}</p>
        {payload.map((entry: any, index: number) => {
          let suffix = '억';
          const nameStr = String(entry.name || '');
          if (nameStr.includes('달성률') || nameStr.includes('비율') || nameStr.includes('OPM') || nameStr.includes('성장률')) suffix = '%';
          else if (nameStr.includes('회전율') || nameStr.includes('PBR')) suffix = '배';
          else if (nameStr.includes('달러')) suffix = ''; // The label itself mentions dollars

          return (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', margin: '6px 0', color: entry.color, fontWeight: 600 }}>
              <span style={{ color: theme.muted }}>{entry.name}</span>
              <span style={{ color: theme.navy }}>
                {entry.value?.toLocaleString()}
                {suffix}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

// Executive KPI Card Component
const KPICard = ({ title, dataObj, color, icon: Icon, tooltipDesc }: any) => {
  const isDanger = dataObj.progress < 20;
  const isSuccess = dataObj.progress >= 25;
  const progressColor = isSuccess ? theme.success : (isDanger ? theme.danger : theme.gold);

  return (
    <div style={{ 
      position: 'relative', 
      overflow: 'hidden', 
      borderRadius: '12px',
      border: `1px solid ${theme.borderLight}`,
      borderTop: `4px solid ${color}`,
      background: theme.white, 
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
      cursor: 'default',
      padding: '28px',
      boxShadow: theme.cardShadow
    }}
    onMouseEnter={(e) => { 
      e.currentTarget.style.transform = 'translateY(-6px)'; 
      e.currentTarget.style.boxShadow = theme.cardShadowHover; 
    }}
    onMouseLeave={(e) => { 
      e.currentTarget.style.transform = 'translateY(0)'; 
      e.currentTarget.style.boxShadow = theme.cardShadow; 
    }}>
      
      <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.03, color: theme.navy, transform: 'rotate(-10deg)' }}>
        <Icon size={120} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: theme.cream, border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.navy }}>
            <Icon size={16} />
          </div>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: theme.navy, letterSpacing: '-0.02em', fontFamily: 'serif' }}>{title}</span>
          {tooltipDesc && <InfoTooltip title={title} description={tooltipDesc} />}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ fontSize: '13px', color: theme.muted, marginBottom: '4px', fontWeight: 500 }}>1분기(3월) 누적</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: theme.navy, lineHeight: 1, letterSpacing: '-0.03em' }}>
            {dataObj.actual.toLocaleString()} <span style={{ fontSize: '1rem', marginLeft: '2px', color: theme.muted, fontWeight: 600 }}>억원</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: theme.muted, marginBottom: '6px', fontWeight: 500 }}>진척률 (목표 25%)</div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 800, 
            color: progressColor,
            background: theme.cream,
            padding: '4px 10px',
            borderRadius: '2px',
            border: `1px solid ${theme.border}`
          }}>
            {dataObj.progress}%
          </div>
        </div>
      </div>

      {/* Target & Actual Simple HTML Bar */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: theme.muted, marginBottom: '4px' }}>
          <span>실적: {dataObj.actual.toLocaleString()}억</span>
          <span>목표: {dataObj.target.toLocaleString()}억</span>
        </div>
        <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
          {/* Target marker */}
          <div style={{ position: 'absolute', height: '100%', width: '4px', background: theme.navy, left: `${Math.min(100, (dataObj.target / Math.max(dataObj.target, dataObj.actual)) * 100)}%`, zIndex: 2 }}></div>
          {/* Actual progress */}
          <div style={{ position: 'absolute', height: '100%', left: 0, width: `${Math.min(100, (dataObj.actual / Math.max(dataObj.target, dataObj.actual)) * 100)}%`, background: color, zIndex: 1, borderRadius: '5px' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${theme.border}`, paddingTop: '16px', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '12px', color: theme.muted, fontWeight: 500 }}>전월 대비 증감 (MoM)</div>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700,
          color: dataObj.mom_diff > 0 ? theme.success : theme.danger
        }}>
          {dataObj.mom_diff > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(dataObj.mom_diff).toLocaleString()}억 ({dataObj.mom_diff > 0 ? '+' : ''}{dataObj.mom_diff_percent}%)
        </div>
      </div>
    </div>
  );
};

export default function ManagementDashboard() {
  const [activeTab, setActiveTab] = useState('revenue');
  const [dartData, setDartData] = useState<any>(listedCompaniesData);
  const [isLoadingDart, setIsLoadingDart] = useState(false);
  
  useEffect(() => {
    // Override body background for this page — premium cream gradient
    document.body.style.background = 'linear-gradient(180deg, #F7F5F0 0%, #FFFFFF 50%, #F7F5F0 100%)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.color = '#0F1A2E';
    return () => {
      document.body.style.background = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.color = '';
    };
  }, []);

  useEffect(() => {
    async function fetchDart() {
      setIsLoadingDart(true);
      try {
        const res = await fetch('/api/dart-insight');
        const data = await res.json();
        if (data.companies) {
          setDartData(data);
        }
      } catch (err) {
        console.error('Failed to fetch DART data:', err);
      } finally {
        setIsLoadingDart(false);
      }
    }
    fetchDart();
  }, []);

  // DART disclosure feed — static JSON snapshot, honestly dated (no fake 'LIVE')
  const dartNews: any[] = ((listedCompaniesData as any).dart_news || [])
    .slice()
    .sort((a: any, b: any) => (a.date < b.date ? 1 : -1));
  const dartNewsSyncDate = dartNews.length > 0 ? dartNews[0].date : null;

  let dataList: any[] = [];
  if (activeTab === 'revenue') dataList = performData.affiliate_revenue;
  if (activeTab === 'op') dataList = performData.affiliate_op;
  if (activeTab === 'ptp') dataList = performData.affiliate_ptp;

  // Filter out 합계 for charting
  const chartDataList = dataList.filter(d => d.name !== '합계');
  const cashChartData = performData.affiliate_cash.filter(d => d.name !== '합계');

  // Executive Takeaway Logic
  const getTakeaways = () => {
    if (activeTab === 'benchmark') {
      return (
        <div style={{ 
          marginTop: '24px',
          background: theme.white, 
          border: `1px solid ${theme.border}`, 
          borderRadius: '4px', 
          position: 'relative',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: theme.gold, borderRadius: '4px 0 0 4px' }} />
          <div style={{ padding: '24px 32px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: theme.navy, fontSize: '16px', fontFamily: 'serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSearch size={18} color={theme.gold}/> [투자심의 메모] 밸류에이션·동종업계 벤치마킹
            </h3>
            <div style={{ color: '#374151', fontSize: '14.5px', lineHeight: 1.7 }}>
              <div style={{ color: theme.navy, fontWeight: 700, marginTop: '8px', marginBottom: '4px', fontSize: '15px' }}>1. 수익성·자산 효율</div>
              신라교역의 <strong style={{ color: theme.success, fontWeight: 600 }}>영업이익률(OPM)은 3.38%</strong>로 안정적인 Cash-cow 역할을 수행 중입니다. <strong style={{ color: theme.success, fontWeight: 600 }}>재고자산 회전율(2.8배)</strong>은 고부가가치 어종 선별 보관 전략(Premium Pricing Strategy)에 기인하며, 동종업계 대비 다소 보수적이나 이익률 방어에 효과적으로 작용하고 있습니다.
              
              <div style={{ color: theme.navy, fontWeight: 700, marginTop: '16px', marginBottom: '4px', fontSize: '15px' }}>2. 밸류에이션 배수·재평가(Re-rating) 여력</div>
              반면, 당사의 <strong style={{ color: theme.danger, fontWeight: 600 }}>PBR은 0.32배</strong>로 경쟁사인 동원산업(0.58배), 사조산업 대비 현저한 Deep-Value 구간에 머물러 있습니다. 이는 보유 자산의 내재가치가 시장에서 완전히 할인(Discount)되고 있음을 의미하며, 향후 배당 성향 확대 및 자사주 매입 등 주주환원(Value-up) 정책을 통해 즉각적인 Re-rating 및 기업가치 제고 여력이 매우 높다고 판단됩니다.
            </div>
          </div>
        </div>
      );
    }
    if (activeTab === 'cash') {
      return (
        <div style={{ 
          marginTop: '24px',
          background: theme.white, 
          border: `1px solid ${theme.border}`, 
          borderRadius: '4px', 
          position: 'relative',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: theme.danger, borderRadius: '4px 0 0 4px' }} />
          <div style={{ padding: '24px 32px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: theme.danger, fontSize: '16px', fontFamily: 'serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color={theme.danger}/> [투자심의 메모] 유동성·차입 상환능력 점검
            </h3>
            <div style={{ color: '#374151', fontSize: '14.5px', lineHeight: 1.7 }}>
              <div style={{ color: theme.navy, fontWeight: 700, marginTop: '8px', marginBottom: '4px', fontSize: '15px' }}>1. 레버리지 리스크 완화</div>
              그룹 내 <strong style={{ color: theme.danger, fontWeight: 600 }}>원일특강(순현금 -569억)</strong> 및 <strong style={{ color: theme.danger, fontWeight: 600 }}>신라에스지(-194억)</strong>의 단기 차입금 비중이 그룹 내 가장 높은 수준입니다. 매크로 고금리 기조를 감안할 때, 해당 계열사들의 Refinancing Risk 점검 및 비핵심 자산 매각(Carve-out)을 통한 De-leveraging 전략이 즉각적으로 요구됩니다.
              
              <div style={{ color: theme.navy, fontWeight: 700, marginTop: '16px', marginBottom: '4px', fontSize: '15px' }}>2. 캐시카우·투자 여력(Dry-powder) 배분</div>
              반면, <strong style={{ color: theme.success, fontWeight: 600 }}>신라교역(+734억)</strong>과 <strong style={{ color: theme.success, fontWeight: 600 }}>비전힐스(+629억)</strong>는 견고한 잉여현금흐름(FCF)을 바탕으로 전월 대비 현금보유고를 늘리며 그룹 내 핵심 Cash-Cow 역할을 지속 수행 중입니다. 확보된 유동성은 향후 Inorganic Growth(M&A)를 위한 Dry-powder로 활용하거나 그룹 전반의 유동성 버퍼로 기능할 것입니다.
            </div>
          </div>
        </div>
      );
    }
    if (activeTab === 'research_insight') {
      return (
        <div style={{ 
          marginTop: '24px',
          background: theme.white, 
          border: `1px solid ${theme.border}`, 
          borderRadius: '4px', 
          position: 'relative',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: theme.gold, borderRadius: '4px 0 0 4px' }} />
          <div style={{ padding: '24px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: theme.navy, fontSize: '16px', fontFamily: 'serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSearch size={18} color={theme.gold}/> [투자심의 메모] 2026 푸드테크 심층분석·인수 전략
              </h3>
              <span style={{ fontSize: '12px', fontWeight: 600, color: theme.muted, background: theme.cream, padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                출처: Future Food-Tech 2026 (샌프란시스코)
              </span>
            </div>
            <div style={{ color: '#374151', fontSize: '14.5px', lineHeight: 1.7 }}>
              {(foodtechData as any).key_findings.map((item: any, idx: number) => (
                <div key={idx} style={{ marginBottom: idx === (foodtechData as any).key_findings.length - 1 ? 0 : '16px' }}>
                  <div style={{ color: theme.navy, fontWeight: 700, marginTop: '8px', marginBottom: '4px', fontSize: '15px' }}>
                    {idx + 1}. {item.title}
                  </div>
                  <div style={{ paddingLeft: '8px', borderLeft: `2px solid ${theme.border}`, marginLeft: '4px', color: '#4b5563' }}>
                    {/* Render bold tags as strong components */}
                    {item.content.split(/(\*\*.*?\*\*)/g).map((part: any, i: number) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} style={{ color: theme.navy, fontWeight: 700 }}>{part.replace(/\*\*/g, '')}</strong>;
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // Find significant remarks
    const significant = dataList.filter(d => d.remarks && d.remarks.length > 5 && d.name !== '합계').slice(0, 3);
    if (significant.length === 0) return null;

    let titlePrefix = "영업 실적";
    if (activeTab === 'revenue') titlePrefix = "매출 성장";
    if (activeTab === 'op') titlePrefix = "마진·수익성";
    if (activeTab === 'ptp') titlePrefix = "세전이익";

    return (
      <div style={{ 
        marginTop: '24px',
        background: theme.white, 
        border: `1px solid ${theme.border}`, 
        borderRadius: '4px', 
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: theme.gold, borderRadius: '4px 0 0 4px' }} />
        <div style={{ padding: '24px 32px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: theme.navy, fontSize: '16px', fontFamily: 'serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSearch size={18} color={theme.gold}/> [투자심의 메모] {titlePrefix} · 가치 창출
          </h3>
          <div style={{ color: '#374151', fontSize: '14.5px', lineHeight: 1.7 }}>
            {significant.map((item, idx) => (
              <div key={idx} style={{ marginBottom: idx === significant.length - 1 ? 0 : '16px' }}>
                <div style={{ color: theme.navy, fontWeight: 700, marginTop: '8px', marginBottom: '4px', fontSize: '15px' }}>
                  {idx + 1}. {item.name} - 가치 창출 평가
                </div>
                {item.remarks.split('\n').map((line: string, lIdx: number) => (
                  <div key={lIdx} style={{ paddingLeft: '8px', borderLeft: `2px solid ${theme.border}`, marginLeft: '4px', marginBottom: '4px' }}>
                    {line}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderVisuals = () => {
    if (activeTab === 'listed_companies') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
          {isLoadingDart && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <div style={{ background: theme.navy, color: theme.white, padding: '12px 24px', borderRadius: '24px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ width: '16px', height: '16px', border: `2px solid ${theme.gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                DART 연결재무제표(CFS) 데이터 조회 중...
              </div>
            </div>
          )}
          {dartData.companies.map((co: any, idx: number) => {
            if (co.error) {
              return (
                <div key={idx} style={{ background: '#fef2f2', border: `1px solid #f87171`, borderRadius: '4px', padding: '24px' }}>
                  <h3 style={{ color: '#991b1b', margin: '0 0 8px 0' }}>{co.name} ({co.ticker}) 데이터 연동 오류</h3>
                  <p style={{ color: '#b91c1c', margin: 0 }}>{co.insight}</p>
                </div>
              );
            }

            const insightParagraphs = co.insight.split('\n\n');

            return (
              <div key={idx} style={{ 
                background: theme.white, border: `1px solid ${theme.border}`, 
                borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
              }}>
                {/* Tear Sheet Header */}
                <div style={{ 
                  background: theme.navy, color: theme.white, padding: '20px 24px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: `3px solid ${theme.gold}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'serif', letterSpacing: '0.02em' }}>{co.name}</h2>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em' }}>{co.ticker}</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    DART 최신 공시 기준 · FY2025 투자 요약(연결재무제표)
                  </div>
                </div>

                <div style={{ padding: '32px 24px' }}>
                  {/* Financial KPI Grid */}
                  <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                    
                    {/* Col 1: P&L Summary */}
                    <div style={{ border: `1px solid ${theme.border}`, borderRadius: '4px', padding: '20px', background: theme.cream }}>
                      <h4 style={{ margin: '0 0 16px 0', color: theme.navy, fontSize: '14px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Wallet size={16} color={theme.gold} /> 손익 요약(P&L)
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: theme.muted, fontSize: '13px' }}>매출액 (Top-line)</span>
                          <span style={{ color: theme.navy, fontWeight: 700, fontSize: '15px' }}>
                            {co.q1_revenue?.toLocaleString()}억
                            <span style={{ fontSize: '12px', marginLeft: '6px', color: co.yoy_revenue > 0 ? theme.success : theme.danger }}>
                              ({co.yoy_revenue > 0 ? '+' : ''}{co.yoy_revenue}%)
                            </span>
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: theme.muted, fontSize: '13px' }}>영업이익 (OP)</span>
                          <span style={{ color: theme.navy, fontWeight: 700, fontSize: '15px' }}>
                            {co.q1_op?.toLocaleString()}억
                            <span style={{ fontSize: '12px', marginLeft: '6px', color: co.yoy_op !== null ? (co.yoy_op > 0 ? theme.success : theme.danger) : theme.danger }}>
                              {co.yoy_op !== null ? `(${co.yoy_op > 0 ? '+' : ''}${co.yoy_op}%)` : '(적자전환)'}
                            </span>
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: theme.muted, fontSize: '13px' }}>당기순이익 (NI)</span>
                          <span style={{ color: theme.navy, fontWeight: 700, fontSize: '15px' }}>{co.net_income?.toLocaleString()}억</span>
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Margin Profile */}
                    <div style={{ border: `1px solid ${theme.border}`, borderRadius: '4px', padding: '20px', background: theme.cream }}>
                      <h4 style={{ margin: '0 0 16px 0', color: theme.navy, fontSize: '14px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={16} color={theme.gold} /> 마진 구조
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: theme.muted, fontSize: '13px' }}>영업이익률 (OPM)</span>
                            <span style={{ color: co.opm > 5 ? theme.gold : (co.opm > 0 ? theme.navy : theme.danger), fontWeight: 700, fontSize: '14px' }}>{co.opm}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, co.opm * 5))}%`, background: co.opm > 5 ? theme.gold : theme.navy }} />
                          </div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: theme.muted, fontSize: '13px' }}>순이익률 (NIM)</span>
                            <span style={{ color: co.nim > 5 ? theme.gold : (co.nim > 0 ? theme.navy : theme.danger), fontWeight: 700, fontSize: '14px' }}>{co.nim}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, co.nim * 5))}%`, background: co.nim > 5 ? theme.gold : theme.navy }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: Capital Structure */}
                    <div style={{ border: `1px solid ${theme.border}`, borderRadius: '4px', padding: '20px', background: theme.cream }}>
                      <h4 style={{ margin: '0 0 16px 0', color: theme.navy, fontSize: '14px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={16} color={theme.gold} /> 자본 구조
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: theme.muted, fontSize: '13px' }}>자산총계 (Assets)</span>
                          <span style={{ color: theme.navy, fontWeight: 700, fontSize: '14px' }}>{co.total_assets?.toLocaleString()}억</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: theme.muted, fontSize: '13px' }}>자본총계 (Equity)</span>
                          <span style={{ color: theme.navy, fontWeight: 700, fontSize: '14px' }}>{co.total_equity?.toLocaleString()}억</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: theme.muted, fontSize: '13px' }}>부채총계 (Liabilities)</span>
                          <span style={{ color: theme.navy, fontWeight: 700, fontSize: '14px' }}>{co.total_liab?.toLocaleString()}억</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '8px', borderTop: `1px dashed ${theme.border}` }}>
                          <span style={{ color: theme.navy, fontSize: '13px', fontWeight: 600 }}>부채비율 (Leverage)</span>
                          <span style={{ color: co.debt_ratio > 100 ? theme.danger : theme.success, fontWeight: 800, fontSize: '15px' }}>{co.debt_ratio}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* IC Memo Section */}
                  <div style={{ border: `1px solid ${theme.border}`, borderRadius: '4px', background: theme.white, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: theme.gold, borderRadius: '4px 0 0 4px' }} />
                    <div style={{ padding: '24px 32px' }}>
                      {insightParagraphs.map((para: string, pIdx: number) => {
                        if (para.startsWith('[Investment Committee Memorandum]')) {
                          return <h3 key={pIdx} style={{ margin: '0 0 20px 0', color: theme.navy, fontSize: '16px', fontFamily: 'serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileSearch size={18} color={theme.gold} /> {para}
                          </h3>;
                        }
                        
                        // Parse bold markdown tags (e.g. **1. Top-line & Market Position**)
                        const parts = para.split(/(\*\*.*?\*\*)/g);
                        
                        return (
                          <div key={pIdx} style={{ marginBottom: pIdx === insightParagraphs.length - 1 ? 0 : '16px', color: '#374151', fontSize: '14.5px', lineHeight: 1.7 }}>
                            {parts.map((part: any, i: number) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <div key={i} style={{ color: theme.navy, fontWeight: 700, marginTop: '8px', marginBottom: '4px', fontSize: '15px' }}>{part.replace(/\*\*/g, '')}</div>;
                              }
                              return <span key={i}>{part}</span>;
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'benchmark') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {/* OPM Chart */}
            <div style={{ height: '350px', background: theme.white, borderRadius: '4px', padding: '20px 20px 0 0', border: `1px solid ${theme.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 10px 20px', gap: '8px' }}>
                <h4 style={{ margin: 0, color: theme.navy, fontSize: '14px', fontFamily: 'serif' }}>영업이익률(OPM) 추이</h4>
                <InfoTooltip theme="light" title="OPM 산출 근거 (신라교역)" description="• 26.1Q: 누적 영업이익(21.6억) ÷ 누적 매출(639.5억) = 3.38%&#10;• 25.1Q: 전년 누적 영업이익(9.3억) ÷ 전년 누적 매출(938.9억) = 0.99%" />
              </div>
              <SafeResponsiveContainer width="100%" height={290}>
                <LineChart data={competitorData.opm_comparison} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                  <XAxis dataKey="period" stroke={theme.muted} tick={{fill: theme.navy, fontSize: 12}} />
                  <YAxis stroke={theme.muted} tick={{fill: theme.navy, fontSize: 12}} tickFormatter={(val) => `${val}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="신라교역" stroke={theme.gold} strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="동원산업" stroke={theme.navy} strokeWidth={2} dot={{r: 3}} opacity={0.6} />
                  <Line type="monotone" dataKey="사조산업" stroke={theme.muted} strokeWidth={2} dot={{r: 3}} opacity={0.5} />
                </LineChart>
              </SafeResponsiveContainer>
            </div>
            {/* Inventory Turnover */}
            <div style={{ height: '350px', background: theme.white, borderRadius: '4px', padding: '20px 20px 0 0', border: `1px solid ${theme.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 10px 20px', gap: '8px' }}>
                <h4 style={{ margin: 0, color: theme.navy, fontSize: '14px', fontFamily: 'serif' }}>재고자산 회전율(자산 효율)</h4>
                <InfoTooltip theme="light" title="재고자산 회전율 산출 기준" description="연환산 매출원가를 평균 재고자산으로 나눈 지표입니다.&#10;수산업의 특성상 어가 변동 및 재고 비축 전략에 따라 변동성이 크며, 신라교역은 고부가가치 어종 선별 보관으로 인해 다소 보수적인 회전율을 보입니다." />
              </div>
              <SafeResponsiveContainer width="100%" height={290}>
                <BarChart data={competitorData.inventory_turnover} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                  <XAxis dataKey="name" stroke={theme.muted} tick={{fill: theme.navy, fontSize: 12}} />
                  <YAxis stroke={theme.muted} tick={{fill: theme.navy, fontSize: 12}} tickFormatter={(val) => `${val}회`} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: theme.cream}} />
                  <Bar dataKey="turnover" name="재고자산 회전율" radius={[2, 2, 0, 0]} barSize={40}>
                    {competitorData.inventory_turnover.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </SafeResponsiveContainer>
            </div>
            {/* PBR Chart */}
            <div style={{ height: '350px', background: theme.white, borderRadius: '4px', padding: '20px 20px 0 0', border: `1px solid ${theme.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 10px 20px', gap: '8px' }}>
                <h4 style={{ margin: 0, color: theme.navy, fontSize: '14px', fontFamily: 'serif' }}>주가순자산비율(PBR) 밸류에이션</h4>
                <InfoTooltip theme="light" title="PBR 및 밸류에이션 근거" description="현재가(26.1Q 기준)를 직전 사업연도 말 주당순자산(BPS)으로 나눈 값입니다.&#10;당사 PBR은 0.32배 수준으로 극심한 저평가 상태이며, 배당 확대 및 자사주 매입 등 밸류업(Value-up) 정책을 통해 추가 상승 여력이 매우 높음을 시사합니다." />
              </div>
              <SafeResponsiveContainer width="100%" height={290}>
                <BarChart data={competitorData.valuation_pbr} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                  <XAxis dataKey="name" stroke={theme.muted} tick={{fill: theme.navy, fontSize: 12}} />
                  <YAxis stroke={theme.muted} tick={{fill: theme.navy, fontSize: 12}} tickFormatter={(val) => `${val}배`} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: theme.cream}} />
                  <Bar dataKey="pbr" name="PBR" radius={[2, 2, 0, 0]} barSize={40}>
                    {competitorData.valuation_pbr.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </SafeResponsiveContainer>
            </div>
          </div>
          {getTakeaways()}
        </div>
      );
    }

    if (activeTab === 'research_insight') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {/* Chart 1: Investment Capital Flow */}
            <div style={{ height: '350px', background: theme.white, borderRadius: '4px', padding: '20px 20px 0 0', border: `1px solid ${theme.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 10px 20px', gap: '8px' }}>
                <h4 style={{ margin: 0, color: theme.navy, fontSize: '14px', fontFamily: 'serif' }}>푸드테크 VC 자금 흐름</h4>
                <InfoTooltip theme="light" title="자금 스름의 전환 (B2C -> B2B)" description="B2C 브랜드 투자는 급감한 반면, 정밀 발효 및 바이오 인프라(B2B)로 자본이 구조적으로 이동하고 있습니다." />
              </div>
              <SafeResponsiveContainer width="100%" height={290}>
                <AreaChart data={foodtechData.investment_trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorB2B" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.gold} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={theme.gold} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorB2C" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.muted} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={theme.muted} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                  <XAxis dataKey="period" stroke={theme.muted} tick={{fill: theme.navy, fontSize: 12}} />
                  <YAxis stroke={theme.muted} tick={{fill: theme.navy, fontSize: 12}} tickFormatter={(val) => `$${val}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="b2b_infra" name="B2B 바이오 인프라" stroke={theme.gold} fillOpacity={1} fill="url(#colorB2B)" strokeWidth={3} activeDot={{r: 6}} />
                  <Area type="monotone" dataKey="b2c_brands" name="B2C 완제품 브랜드" stroke={theme.muted} fillOpacity={1} fill="url(#colorB2C)" strokeWidth={2} />
                </AreaChart>
              </SafeResponsiveContainer>
            </div>
            
            {/* Chart 2: AI Margin Expansion */}
            <div style={{ height: '350px', background: theme.white, borderRadius: '4px', padding: '20px 20px 0 0', border: `1px solid ${theme.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 10px 20px', gap: '8px' }}>
                <h4 style={{ margin: 0, color: theme.navy, fontSize: '14px', fontFamily: 'serif' }}>AI 기반 마진 개선</h4>
                <InfoTooltip theme="light" title="운영 알파 (Operational Alpha)" description="AI 통합 단계가 고도화될수록 수율 및 에너지 효율이 극대화되어 EBITDA 마진이 2배 이상 개선됩니다." />
              </div>
              <SafeResponsiveContainer width="100%" height={290}>
                <ComposedChart data={foodtechData.ai_margin_expansion} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                  <XAxis dataKey="category" stroke={theme.muted} tick={{fill: theme.navy, fontSize: 11}} angle={-15} textAnchor="end" />
                  <YAxis yAxisId="left" stroke={theme.muted} tick={{fill: theme.navy, fontSize: 12}} tickFormatter={(val) => `${val}%`} />
                  <YAxis yAxisId="right" orientation="right" stroke={theme.muted} tick={{fill: theme.navy, fontSize: 12}} tickFormatter={(val) => `${val}%`} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: theme.cream}} />
                  <Bar yAxisId="left" dataKey="yield" name="생산 수율(Yield)" fill={theme.navy} radius={[2, 2, 0, 0]} barSize={25} />
                  <Bar yAxisId="left" dataKey="energy_eff" name="에너지 효율" fill={theme.goldLight} radius={[2, 2, 0, 0]} barSize={25} />
                  <Line yAxisId="right" type="step" dataKey="ebitda_margin" name="EBITDA 마진" stroke={theme.danger} strokeWidth={3} dot={{r: 4, fill: theme.white}} activeDot={{r: 6}} />
                </ComposedChart>
              </SafeResponsiveContainer>
            </div>

            {/* Chart 3: Cost Parity Projection */}
            <div style={{ height: '350px', background: theme.white, borderRadius: '4px', padding: '20px 20px 0 0', border: `1px solid ${theme.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 10px 20px', gap: '8px' }}>
                <h4 style={{ margin: 0, color: theme.navy, fontSize: '14px', fontFamily: 'serif' }}>생산 단가 동등화(Cost Parity)</h4>
                <InfoTooltip theme="light" title="단가 경쟁력 (Cost Parity)" description="정밀 발효 기술의 단가가 급격히 하락하며 2026-2028년 사이 기존 전통 방식(Conventional)과 Cost Parity를 이룰 전망입니다." />
              </div>
              <SafeResponsiveContainer width="100%" height={290}>
                <LineChart data={foodtechData.production_cost_parity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                  <XAxis dataKey="year" stroke={theme.muted} tick={{fill: theme.navy, fontSize: 12}} />
                  <YAxis stroke={theme.muted} tick={{fill: theme.navy, fontSize: 12}} tickFormatter={(val) => `$${val}/kg`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="cultured_meat" name="배양육 단가" stroke={theme.navyLight} strokeDasharray="5 5" strokeWidth={2} dot={{r: 3}} />
                  <Line type="monotone" dataKey="precision_fermentation" name="정밀발효 단가" stroke={theme.gold} strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="conventional" name="전통 육류 단가" stroke={theme.navy} strokeWidth={3} />
                </LineChart>
              </SafeResponsiveContainer>
            </div>
          </div>
          {getTakeaways()}
        </div>
      );
    }
    
    if (activeTab === 'm_and_a') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', background: theme.navy, color: theme.white, borderRadius: '8px', borderBottom: `3px solid ${theme.gold}` }}>
            <Building2 size={24} color={theme.gold} />
            <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'serif', letterSpacing: '0.02em' }}>비유기적 성장: 2026 M&A 타깃 파이프라인</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {mnaData.map((target, idx) => (
              <div key={idx} style={{ 
                background: theme.white, border: `1px solid ${theme.border}`, borderRadius: '8px', 
                padding: '24px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.gold; e.currentTarget.style.boxShadow = '0 8px 24px rgba(201,160,80,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}>
                
                {/* Company Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: theme.navy, background: theme.cream, padding: '4px 8px', borderRadius: '4px' }}>{target.id}</span>
                    <h4 style={{ margin: 0, fontSize: '18px', color: theme.navy, fontFamily: 'serif' }}>{target.name}</h4>
                  </div>
                  <div style={{ color: theme.gold, fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>{target.sector}</div>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#4b5563', lineHeight: 1.6 }}>{target.rationale}</p>
                </div>

                {/* Financials */}
                <div style={{ borderLeft: `1px solid ${theme.borderLight}`, paddingLeft: '24px' }}>
                  <div style={{ fontSize: '12px', color: theme.muted, fontWeight: 600, marginBottom: '16px' }}>핵심 재무 (FY25)</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ color: theme.muted }}>매출</span>
                    <span style={{ fontWeight: 700, color: theme.navy }}>{target.revenue}억</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ color: theme.muted }}>EBITDA</span>
                    <span style={{ fontWeight: 700, color: target.ebitda < 0 ? theme.danger : theme.navy }}>{target.ebitda}억</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: theme.muted }}>마진</span>
                    <span style={{ fontWeight: 700, color: target.margin < 0 ? theme.danger : theme.success }}>{target.margin}%</span>
                  </div>
                </div>

                {/* Valuation */}
                <div style={{ borderLeft: `1px solid ${theme.borderLight}`, paddingLeft: '24px' }}>
                  <div style={{ fontSize: '12px', color: theme.muted, fontWeight: 600, marginBottom: '16px' }}>추정 밸류에이션</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ color: theme.muted }}>적용 배수</span>
                    <span style={{ fontWeight: 700, color: theme.navy }}>{target.valuationMultiple}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: theme.muted }}>추정 기업가치(EV)</span>
                    <span style={{ fontWeight: 800, color: theme.navy, fontSize: '16px' }}>{target.ev}억</span>
                  </div>
                </div>

                {/* Status & Risk */}
                <div style={{ borderLeft: `1px solid ${theme.borderLight}`, paddingLeft: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: theme.muted, fontWeight: 600, marginBottom: '8px' }}>리스크 등급</div>
                    <span style={{ 
                      fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px',
                      background: target.risk === 'Low' ? '#ecfdf5' : (target.risk === 'Medium' ? '#fef3c7' : '#fef2f2'),
                      color: target.risk === 'Low' ? theme.success : (target.risk === 'Medium' ? '#d97706' : theme.danger),
                      border: `1px solid ${target.risk === 'Low' ? '#bbf7d0' : (target.risk === 'Medium' ? '#fde68a' : '#fecaca')}`
                    }}>
                      {target.risk === 'Low' ? '낮음' : target.risk === 'Medium' ? '중간' : '높음'} 리스크
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: theme.muted, fontWeight: 600, marginBottom: '8px' }}>딜 진행 단계</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: theme.navy }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: target.status === 'LOI 제출' ? theme.success : theme.gold }} />
                      {target.status}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (activeTab === 'cash') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: '450px', width: '100%', background: theme.white, borderRadius: '4px', padding: '20px 20px 0 0', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 10px 20px', gap: '8px' }}>
              <h4 style={{ margin: 0, color: theme.navy, fontSize: '15px', fontFamily: 'serif' }}>유동성 현황·순현금 창출</h4>
            </div>
            <SafeResponsiveContainer width="100%" height={390}>
              <ComposedChart data={cashChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                <XAxis dataKey="name" stroke={theme.muted} tick={{fill: theme.navy, fontSize: 13, fontWeight: 500}} dy={10} />
                <YAxis stroke={theme.muted} tickFormatter={(val) => `${val}억`} tick={{fill: theme.navy, fontSize: 13}} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: theme.cream}} />
                <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px', color: theme.navy }} iconType="circle" />
                <ReferenceLine y={0} stroke={theme.navy} strokeWidth={1} />
                <Bar dataKey="net_cash" name="순현금" radius={[2, 2, 2, 2]} barSize={40}>
                  {cashChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.net_cash >= 0 ? theme.success : theme.danger} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="cash_equivalents" name="현금성자산 (참고)" stroke={theme.gold} strokeWidth={3} dot={{r: 6, fill: theme.white, strokeWidth: 2}} activeDot={{r: 8}} />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>
          {getTakeaways()}
        </div>
      );
    }

    let chartTitle = "영업 실적 KPI 현황";
    if (activeTab === 'revenue') chartTitle = "매출 성장 KPI 현황";
    if (activeTab === 'op') chartTitle = "마진·수익성 KPI 현황";
    if (activeTab === 'ptp') chartTitle = "세전이익 KPI 현황";

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '450px', width: '100%', background: theme.white, borderRadius: '4px', padding: '20px 20px 0 0', border: `1px solid ${theme.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 10px 20px', gap: '8px' }}>
            <h4 style={{ margin: 0, color: theme.navy, fontSize: '15px', fontFamily: 'serif' }}>{chartTitle}</h4>
          </div>
          <SafeResponsiveContainer width="100%" height={390}>
            <ComposedChart data={chartDataList} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
              <XAxis dataKey="name" stroke={theme.muted} tick={{fill: theme.navy, fontSize: 13, fontWeight: 500}} dy={10} />
              <YAxis yAxisId="left" stroke={theme.muted} tickFormatter={(val) => `${val}억`} tick={{fill: theme.navy, fontSize: 13}} dx={-10} />
              <YAxis yAxisId="right" orientation="right" stroke={theme.muted} tickFormatter={(val) => `${val}%`} tick={{fill: theme.navy, fontSize: 13}} dx={10} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: theme.cream}} />
              <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px', color: theme.navy }} iconType="circle" />
              <Bar yAxisId="left" dataKey="cumulative_actual" name="누적 실적" fill={theme.navy} radius={[2, 2, 0, 0]} barSize={40} />
              <Line yAxisId="left" type="monotone" dataKey="last_year_cumulative" name="전년 동기 실적" stroke={theme.muted} strokeWidth={3} strokeDasharray="6 6" dot={false} activeDot={{r: 6}} />
              <Line yAxisId="right" type="monotone" dataKey="achievement_rate" name="당월 목표 달성률(%)" stroke={theme.gold} strokeWidth={4} dot={{r: 6, fill: theme.white, strokeWidth: 2}} activeDot={{r: 8}} connectNulls={true} />
              <ReferenceLine yAxisId="right" y={100} stroke={theme.success} strokeDasharray="3 3" label={{ position: 'top', value: '100% 목표', fill: theme.success, fontSize: 12, fontWeight: 'bold' }} />
            </ComposedChart>
          </SafeResponsiveContainer>
        </div>
        {getTakeaways()}
      </div>
    );
  };

  const renderTable = () => {
    if (activeTab === 'benchmark' || activeTab === 'listed_companies' || activeTab === 'research_insight' || activeTab === 'm_and_a') return null; // Hide table on benchmark, listed_companies, research_insight, and m_and_a tab
    return (
      <div style={{ overflowX: 'auto', background: theme.white, borderRadius: '4px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', height: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: theme.cream, borderBottom: `2px solid ${theme.navy}` }}>
              <th style={{ padding: '16px', textAlign: 'left', color: theme.navy, fontWeight: 700, fontFamily: 'serif' }}>계열사</th>
              {activeTab === 'cash' ? (
                <>
                  <th style={{ padding: '16px', color: theme.navy, fontWeight: 700 }}>현금성자산</th>
                  <th style={{ padding: '16px', color: theme.navy, fontWeight: 700 }}>차입금</th>
                  <th style={{ padding: '16px', color: theme.navy, fontWeight: 700 }}>순현금</th>
                </>
              ) : (
                <>
                  <th style={{ padding: '16px', color: theme.navy, fontWeight: 700 }}>당월 실적</th>
                  <th style={{ padding: '16px', color: theme.navy, fontWeight: 700 }}>당월 달성률</th>
                  <th style={{ padding: '16px', color: theme.navy, fontWeight: 700 }}>누적 실적</th>
                  <th style={{ padding: '16px', color: theme.navy, fontWeight: 700 }}>YoY 증감</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'cash' ? performData.affiliate_cash : dataList).map((row: any, idx: number) => {
              const isTotal = row.name === '합계';
              return (
                <tr key={idx} style={{ 
                  borderBottom: `1px solid ${theme.border}`,
                  backgroundColor: isTotal ? theme.cream : 'transparent',
                  transition: 'background 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.cream; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isTotal ? theme.cream : 'transparent'; }}
                >
                  <td style={{ padding: '16px', textAlign: 'left', color: theme.navy, fontWeight: isTotal ? 800 : 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {row.name}
                      {!isTotal && row.remarks && (
                        <InfoTooltip title={`${row.name} 브리핑`} description={row.remarks} />
                      )}
                    </div>
                  </td>
                  {activeTab === 'cash' ? (
                    <>
                      <td style={{ padding: '16px', color: theme.muted }}>{row.cash_equivalents?.toLocaleString()}</td>
                      <td style={{ padding: '16px', color: theme.muted }}>{row.borrowings?.toLocaleString()}</td>
                      <td style={{ padding: '16px', fontWeight: 700, color: row.net_cash < 0 ? theme.danger : theme.navy }}>
                        {row.net_cash?.toLocaleString()}
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '16px', color: theme.muted }}>{row.current_actual?.toLocaleString() || '-'}</td>
                      <td style={{ padding: '16px', fontWeight: 600, color: row.achievement_rate < 90 ? theme.danger : (row.achievement_rate >= 100 ? theme.success : theme.navy) }}>{row.achievement_rate ? `${row.achievement_rate}%` : '-'}</td>
                      <td style={{ padding: '16px', fontWeight: 800, color: theme.navy }}>{row.cumulative_actual?.toLocaleString() || '-'}</td>
                      <td style={{ padding: '16px', fontWeight: 600, color: row.yoy_diff < 0 ? theme.danger : theme.success }}>{row.yoy_diff > 0 ? '+' : ''}{row.yoy_diff?.toLocaleString() || '-'}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <main style={{ minHeight: '100vh', padding: '0', maxWidth: '100%', margin: '0 auto', fontFamily: 'var(--font-inter), "Pretendard", -apple-system, sans-serif' }}>
      
      {/* Premium Full-Width Header Banner */}
      <div style={{
        background: theme.navyGradient,
        padding: '0 0 0 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative gold line */}
        <div style={{ height: '3px', background: theme.goldGradient }} />
        
        {/* DART Feed Ticker — static JSON snapshot, honestly dated (no fake 'LIVE' / pulse / XBRL badge) */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 4rem',
          borderBottom: '1px solid rgba(140,170,255,0.12)',
          fontSize: '12px', color: 'rgba(255,255,255,0.7)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={13} color={theme.gold} />
            <strong style={{ color: theme.gold, letterSpacing: '0.08em', fontSize: '11px' }}>
              DART 공시{dartNewsSyncDate ? ` (${dartNewsSyncDate} 동기화)` : ''}
            </strong>
            <span style={{ opacity: 0.8 }}>
              {dartNews.slice(0, 3).map((n: any) => `[${n.company}] ${n.title} (${n.date})`).join(' · ')}
            </span>
          </div>
        </div>

        {/* Main Header Content */}
        <div style={{ padding: '2.5rem 4rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(201,160,80,0.15)', border: '1px solid rgba(201,160,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} color={theme.gold} />
              </div>
              <h1 style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', margin: 0, color: '#FFFFFF', fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700 }}>
                그룹 경영 대시보드
              </h1>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(201,160,80,0.9)', marginTop: '4px', fontWeight: 500, letterSpacing: '0.12em', marginLeft: '52px' }}>
              신라그룹 연결 경영실적 <TermTooltip term="NPS-Style" description="국민연금 등 대형 기관투자자의 정제된 보고서 양식을 차용한 프리미엄 클래식 뷰입니다."/>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/" style={{
               fontSize: '12px', padding: '8px 18px', 
               background: 'rgba(140,170,255,0.10)', 
               border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', 
               color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500,
               transition: 'all 0.3s', backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.gold; e.currentTarget.style.color = theme.gold; e.currentTarget.style.background = 'rgba(201,160,80,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(140,170,255,0.10)'; }}
            >
              ← 참치 대시보드로
            </Link>
            <div style={{ 
              background: 'rgba(201,160,80,0.1)', 
              color: theme.goldLight, border: `1px solid rgba(201,160,80,0.25)`, 
              padding: '8px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px',
              letterSpacing: '0.02em',
            }}>
              <FileText size={14} color={theme.gold} /> {performData.period} (누적)
            </div>
          </div>
        </div>
        {/* Bottom gold line */}
        <div style={{ height: '2px', background: theme.goldGradient, opacity: 0.5 }} />
      </div>

      {/* Content wrapper with padding */}
      <div style={{ padding: '2.5rem 4rem', maxWidth: '1600px', margin: '0 auto' }}>

      {/* KPI Cards Section */}
      <section data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <KPICard 
          title="그룹 매출액" 
          dataObj={performData.summary.revenue} 
          icon={Building2}
          color={theme.navy}
          chartData={[ { name: '실적', value: performData.summary.revenue.actual }, { name: '목표', value: performData.summary.revenue.target } ]}
          tooltipDesc="수산, 철강, 농산 등 9개 계열사의 1분기 누적 총 합산 매출입니다."
        />
        <KPICard 
          title="그룹 영업이익" 
          dataObj={performData.summary.operating_profit} 
          icon={TrendingUp}
          color={theme.gold}
          chartData={[ { name: '실적', value: performData.summary.operating_profit.actual }, { name: '목표', value: performData.summary.operating_profit.target } ]}
        />
        <KPICard 
          title="그룹 세전이익" 
          dataObj={performData.summary.pre_tax_profit} 
          icon={PieChart}
          color="#374151"
          chartData={[ { name: '실적', value: performData.summary.pre_tax_profit.actual }, { name: '목표', value: Math.max(performData.summary.pre_tax_profit.target, 20) } ]}
          tooltipDesc="기타 영업외수익 및 환율 효과 등이 모두 반영된 최종 세전 이익률 지표입니다."
        />
        {/* 현금성 자산 요약 */}
        <div style={{ 
          position: 'relative', overflow: 'hidden', borderRadius: '12px',
          border: `1px solid ${theme.borderLight}`, borderTop: `4px solid ${theme.success}`,
          background: theme.white, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          boxShadow: theme.cardShadow, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = theme.cardShadowHover; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = theme.cardShadow; }}>
          
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.03, color: theme.success, transform: 'rotate(-10deg)' }}>
            <Wallet size={120} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: theme.cream, border: `1px solid ${theme.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.navy }}>
              <Wallet size={16} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: theme.navy, letterSpacing: '-0.02em', fontFamily: 'Georgia, serif' }}>순현금 (그룹 전체)</span>
          </div>
          
          <div style={{ margin: '16px 0', fontSize: '2.8rem', fontWeight: 800, color: theme.navy, lineHeight: 1, letterSpacing: '-0.03em', position: 'relative', zIndex: 1 }}>
            {performData.summary.net_cash.amount.toLocaleString()} <span style={{ fontSize: '1.1rem', marginLeft: '2px', color: theme.muted, fontWeight: 600 }}>억원</span>
          </div>
          
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700,
            color: theme.success, background: '#ecfdf5', padding: '8px 14px', borderRadius: '8px',
            border: '1px solid #bbf7d0', width: 'fit-content', position: 'relative', zIndex: 1
          }}>
            <ArrowUpRight size={16} /> 전월 대비 {performData.summary.net_cash.mom_diff}억 증가
          </div>
        </div>
      </section>

      {/* Detail Section with Tabs */}
      <section style={{ 
        background: theme.white, 
        borderRadius: '16px', 
        border: `1px solid ${theme.borderLight}`, 
        padding: '32px',
        boxShadow: theme.sectionShadow
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '6px', background: theme.cream, padding: '4px', borderRadius: '12px', border: `1px solid ${theme.borderLight}` }}>
            {[
              { id: 'revenue', label: '📊 매출' },
              { id: 'op', label: '📈 영업이익' },
              { id: 'ptp', label: '🎯 세전이익' },
              { id: 'cash', label: '💰 현금 리스크' },
              { id: 'benchmark', label: '🏆 벤치마크' },
              { id: 'listed_companies', label: '상장사' },
              { id: 'research_insight', label: '🔬 투자 인사이트' },
              { id: 'm_and_a', label: '🤝 M&A 파이프라인' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: isActive ? theme.navy : 'transparent', 
                    border: 'none',
                    padding: '9px 20px',
                    fontSize: '13px', 
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? theme.white : theme.muted,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '8px',
                    letterSpacing: '-0.01em',
                    boxShadow: isActive ? '0 2px 8px rgba(15, 26, 46, 0.2)' : 'none'
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = theme.creamDark; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          <div style={{ 
            fontSize: '12px', color: theme.navy, background: theme.cream, 
            padding: '8px 16px', borderRadius: '10px', border: `1px solid ${theme.borderLight}`, 
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
          }}>
            <DollarSign size={14} color={theme.gold} /> <span style={{ color: theme.muted }}>진척률 기준:</span> <strong style={{ color: theme.navy }}>25.0%</strong>
          </div>
        </div>
        
        {/* Main Visualizations & Table (Side by Side) */}
        {activeTab === 'benchmark' || activeTab === 'listed_companies' || activeTab === 'research_insight' || activeTab === 'm_and_a' ? (
          <>
            {renderVisuals()}
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '24px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {renderVisuals()}
            </div>
            <div style={{ height: '100%' }}>
              {renderTable()}
            </div>
          </div>
        )}
      </section>
      </div>{/* end content wrapper */}
    </main>
  );
}
