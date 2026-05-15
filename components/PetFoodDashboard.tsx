'use client';

import React, { useState, useEffect } from 'react';
import styles from './PetFoodDashboard.module.css';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Globe, Flag, Ship, Briefcase, TrendingUp, Bone, RefreshCcw,
  AlertCircle, Crown, MapPin, Target, Truck, LineChart as LineChartIcon,
  ShieldCheck, Leaf, Recycle, ShoppingCart, Award, Factory, Scale,
  Users, Zap, DollarSign, BarChart2, PieChart as PieChartIcon, Activity,
  ArrowRightLeft, Network, BookOpen, ChevronDown, ChevronUp, MessageSquare,
  Anchor, Radio, Thermometer, Eye, FileCheck, Ban
} from 'lucide-react';
import TermTooltip from './TermTooltip';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import PetFoodMap from './PetFoodMap';
import TakeawayBox from './TakeawayBox';
import EstimateBadge from './EstimateBadge';



const PINK = '#94a3b8';
const PIE_COLORS = ['var(--color-info)', 'var(--color-success)', 'var(--color-warning)', '#8b5cf6', '#06b6d4', 'var(--color-danger)', '#f97316', '#64748b', '#ec4899', '#14b8a6'];

/* ======= HELPER COMPONENTS ======= */
const CardHeader = ({ title, icon: Icon, term, desc }: any) => (
  <div className={styles.cardHeader}>
    <h3 className={styles.cardTitle}>
      <Icon size={18} className={styles.cardIcon} /> {title}
    </h3>
    {term && <TermTooltip term={term} description={desc} />}
  </div>
);


const KpiCard = ({ label, value, unit }: { label: string; value: string; unit?: string }) => (
  <div className={styles.kpiCard}>
    <div className={styles.kpiLabel}>{label}</div>
    <div className={styles.kpiValue}>{value}<span className={styles.kpiUnit}>{unit}</span></div>
  </div>
);

/* Data is loaded dynamically via fetch() from /data/petfood_dashboard.json */

/* ======= CUSTOM TOOLTIP ======= */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color, margin: 0, fontSize: '0.85rem' }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('en-US') : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ======= MAIN COMPONENT ======= */
export default function PetFoodDashboard() {

  const [data, setData] = useState<any>(null);
  const [isEduOpen, setIsEduOpen] = useState(true);

  useEffect(() => {
    fetch('/api/petfood')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(console.error);
  }, []);

  if (!data) return <div style={{ padding: '2rem', color: '#94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}><div><RefreshCcw size={24} className={styles.rotateIcon} style={{marginBottom: '1rem'}}/></div><div>Loading verified intelligence...</div></div>;

  const { kpis, d_simulator, d_channel_share, d_export_dest, d_w01, d_w02, d_w03, d_w04, d_w05, d_w06, d_w07, d_w08, d_w09, d_w10, d_w11, d_w12, d_w13, d_w14, d_w15, d_w16, d_w17, d_w18, d_w19, d_w20, d_w21, d_w22, d_w23, d_w24, d_w25, d_w26, d_w27_radar, d_w28, d_w30, d_w31, d_w32, d_nw01_bycatch, d_nw02_quota, d_nw03_climate, d_nw04_radar, d_nw05_retention, d_nw05_abidjan, d_nw06_mmpa, d_w33, d_w34, d_w35, d_w36, d_kfas_w01, d_kfas_w02, d_kfas_w03, d_kfas_w04, d_kfas_w05 } = data;




  
  const xFmt = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const cleaned = tick.replace(/\s*\(.*?\)\s*/g, '').trim();
    return cleaned.length > 6 ? cleaned.substring(0, 6) + '..' : cleaned;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>🐾 펫푸드 산업 전략 인텔리전스 (Pet Food Strategic Intel)</h1>
          <p className={styles.subtitle}>글로벌 거시 + 한국 심층 + 공급망 + 비즈모델 + 소비자 트렌드 = 30대 핵심 인사이트</p>
        </div>
        <div className={styles.lastUpdated}>
          <RefreshCcw size={14} className={styles.rotateIcon} />
          <span>Last updated: 2026.05.07 (Live API Connected)</span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.kpiRow} style={{ marginBottom: '2rem' }}>
          <KpiCard label={kpis?.price_gap?.title || "글로벌 펫푸드 프리미엄 단가"} value={kpis?.price_gap?.value || "$7.09 / $1.03 / $2.40"} unit="" />
          <KpiCard label={kpis?.arbitrage?.title || "원물 매각 vs 펫푸드 마진 스프레드"} value={kpis?.arbitrage?.value || "+17"} unit="%p" />
          <KpiCard label={kpis?.sensitivity?.title || "i-Tail 환율 거시 민감도"} value={kpis?.sensitivity?.value || "-1.0"} unit="%" />
          <KpiCard label={kpis?.market_share?.title || "대만 시장 태국산 점유율"} value={kpis?.market_share?.value || "37"} unit="%" />
        </div>

        {/* ═══ Executive Strategy Command ═══ */}
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(145deg, #1e293b, #0f172a)', borderRadius: '12px', borderLeft: '4px solid #f472b6', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem' }}>
            <Crown size={22} color="#f472b6" /> [Executive Strategy Command]
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
            <strong>전략 요약:</strong> 글로벌 펫푸드 시장 진입의 <span style={{ color: '#f472b6' }}>골든 윈도우는 향후 3~5년</span>입니다. 한국산 펫푸드 수출이 12배 폭증(일본 중심)하고 있으나, 수입 역시 거대하여 1.5억 달러 무역 적자를 기록 중입니다. 경영진은 태국 OEM 인프라를 활용하는 <strong>[S2: D2C OEM]</strong> 모델을 최우선으로 검토하고, 중장기적으로 <strong>[S5: 처방식 JV]</strong>를 통해 고부가가치 시장(ROE 극대화)으로 이전해야 합니다.
          </p>
        </div>

        {/* ═══ Market Entry Simulator ═══ */}
        <div className={styles.card} style={{ marginBottom: '3rem', border: '1px solid #334155' }}>
          <div className={styles.cardHeader} style={{ background: '#1e293b' }}>
            <h3 className={styles.cardTitle}><Activity size={18} className={styles.cardIcon} color="#f472b6" /> Market Entry Simulator (Phase 3)</h3>
            <TermTooltip term="S1~S5" description="5대 진입 시나리오별 예상 자본금, 매출, ROIC 비교" />
          </div>
          <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
              <SafeResponsiveContainer width="100%" height="100%">
                <ComposedChart data={d_simulator} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="name" tick={{fill: '#94a3b8'}}  tickFormatter={xFmt} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `${v}억`} tick={{fill: '#94a3b8'}} />
                  <YAxis yAxisId="right" orientation="right" unit="%" tick={{fill: '#94a3b8'}} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="capital" name="투입 자본 (억 원)" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="revenue" name="예상 매출 (억 원)" fill="#f472b6" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="roic" name="예상 ROIC (%)" stroke="var(--color-success)" strokeWidth={3} />
                </ComposedChart>
              </SafeResponsiveContainer>
            </div>
            <TakeawayBox
              source="PHASE 3 진입 전략 보고서"
              situation="자체 생산기반 없는 유통사 관점에서 5가지 시나리오를 시뮬레이션한 결과, 초기 투입 자본 대비 수익성(ROIC)이 가장 우수한 모델은 S2(D2C OEM, 32%)이며, 브랜드 장악력 확보 후 S5(처방식 JV, 20%)로 확장하는 단계적 접근이 요구됩니다."
              actionPlan="과도한 CapEx가 요구되는 S3(M&A) 및 S4(자체 공장 수출)는 보류하고, 즉각적인 현금 창출이 가능한 S2 모델 승인 및 파트너(태국 I-Tail 등) 탐색에 전사적 자원을 집중할 것을 권고합니다."
            />
          </div>
        </div>

      {/* ═══ Education & Chatbot Module (Foldable) ═══ */}
      <div className="ds-card" style={{background: '#181818',
        border: 'none',
        borderRadius: '8px',
        marginBottom: '2rem',
        overflow: 'hidden',
        boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px',
        color: '#f8fafc',
        fontFamily: "'Inter', sans-serif"}}>
        {/* Toggle Header */}
        <div 
          onClick={() => setIsEduOpen(!isEduOpen)}
          style={{
            padding: '1.2rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            background: isEduOpen ? 'rgba(244, 114, 182, 0.1)' : 'transparent',
            transition: 'background 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: 'rgba(244, 114, 182, 0.2)', padding: '0.5rem', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen size={20} color="#94a3b8" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                AI 전략 어시스턴트 (Executive Assistant)
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Phase 1~3 보고서 기반 경영진 의사결정 지원
              </p>
            </div>
          </div>
          <div>
            {isEduOpen ? <ChevronUp size={24} color="#94a3b8" /> : <ChevronDown size={24} color="#94a3b8" />}
          </div>
        </div>

        {/* Foldable Content */}
        {isEduOpen && (
          <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
              
              {/* Left: Quick Guide */}
              <div style={{ background: 'var(--surface-3)', borderRadius: '10px', padding: '1.2rem' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bone size={16} /> 펫푸드 시장 핵심 역학
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.8 }}>
                  <li><strong>글로벌 과점:</strong> 마즈(Mars)와 네슬레(Nestlé) 등 다국적 기업이 지배적인 구조 속 신흥 시장 성장.</li>
                  <li><strong>수산 원물의 가치:</strong> 참치 가공 부산물을 활용할 시 원가 우위를 가지며, 높은 마진 창출 가능.</li>
                  <li><strong>반려묘 습식 시장:</strong> 고양이 사료 중심의 습식 펫푸드가 가파르게 성장 중이며, 수산물 베이스에 유리.</li>
                  <li><strong>태국 허브 전략:</strong> 세계 2위 펫푸드 수출국 태국의 ODM 인프라를 활용하여 프리미엄 시장을 공략.</li>
                </ul>
              </div>

              {/* Right: NotebookLM Chatbot */}
              <div style={{ background: 'var(--surface-3)', borderRadius: '10px', padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '50px', height: '50px', background: 'var(--surface-3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <MessageSquare size={24} color="var(--text-primary)" />
                </div>
                <h3 style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                  S-Grade 인텔리전스 봇
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '80%' }}>
                  내부 기밀인 Phase 1~3 인텔리전스 보고서를 심층 학습했습니다. "태국 OEM 활용시 규제 리스크는?", "M&A vs OEM ROIC 3년 비교" 등 심층 전략을 프롬프트로 질의하세요.
                </p>
                <a 
                  href="https://notebooklm.google.com/notebook/a734debc-a607-4ec1-9f7a-1a31c15cf302"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'var(--surface-3)',
                    color: '#e2e8f0',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'var(--surface-3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'var(--surface-3)'; }}
                >
                  <MessageSquare size={16} />
                  AI 챗봇과 대화하기
                </a>
              </div>

            </div>
          </div>
        )}
      </div>

        <div style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
            <div style={{ width:'4px', height:'28px', background:'linear-gradient(180deg, #f472b6, #f472b699)', borderRadius:'2px' }} />
            <div>
              <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}>🌱 Part I — 원물 생산 (Raw Material)</h2>
              <p style={{ margin:0, fontSize:'0.75rem', color:'#64748b' }}>수산 부산물 밸류업 및 사료용 원물 조달</p>
            </div>
          </div>
          <div className={styles.grid}>
            {/* W33: Clean Label Risk */}
            <div className={styles.card}>
              <CardHeader title="클린 라벨 전환: 카라기난 리스크 방어 🟢 Live API" icon={ShieldCheck} term="Carrageenan" desc="카라기난 성분을 배제한 클린 라벨 제품의 프리미엄 시장 장악력" />
              <div className={styles.cardBody}>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={d_w33} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis type="number"  tickFormatter={xFmt} />
                      <YAxis dataKey="criteria" type="category" width={100} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="carrageenan" name="기존(카라기난)" fill="var(--color-danger)" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="clean_label" name="클린라벨(한천/펙틴)" fill="var(--color-success)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>
                <TakeawayBox
                  source="NotebookLM 펫푸드 포렌식 리서치 (1339bce3-e447-40f5-a5f3-51451ffe2128)"
                  situation="[Live 🟢] 해조류 추출물인 카라기난은 펫푸드 핵심 겔화제이나, 소비자 네거티브 캠페인 확산 및 기후 변화(갯병 발생)로 인한 심각한 공급망 리스크에 노출되어 프리미엄 브랜드에서 전면 퇴출되고 있습니다."
                  actionPlan="단기적으로 제품 포뮬러를 한천(Agar)이나 펙틴(Pectin) 등 '클린 라벨(Clean Label)' 규격으로 즉각 리뉴얼하고, 무첨가(Free-from) 마케팅을 전개하여 소비자 불신을 해소하고 가격 방어력을 2.5배 이상 견인해야 합니다."
                />
              </div>
            </div>
            {/* W10 */}
            <div className={styles.card}>
            <CardHeader title="한국 펫푸드 무역수지 추이 (달러)" icon={ArrowRightLeft} term="무역적자" desc="수출이 연 25.2% 급성장했으나 여전히 수입의 2.3배가 적자." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w10} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(1)}억$`} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="exports" name="수출 (만$)" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="imports" name="수입 (만$)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="deficit" name="무역적자 (만$)" stroke="var(--color-warning)" strokeWidth={3} strokeDasharray="5 5" />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="[이슈플러스]2025 펫푸드 수출 현황과 전망, South Korea Pet Food Report, 수산분야 펫푸드 산업 활성화 방안"
            situation="한국 펫푸드 시장은 급성장 중이나 2023년 기준 수입액(3억 750만 달러)이 수출액(1억 4,975만 달러)을 2배 이상 초과하며 1억 5,775만 달러의 무역적자를 시현 중입니다. 수출 단가($1.84~$2.82/kg)가 수입 단가($2.38~$3.32/kg)를 밑돌며 중저가 제조의 함정에 빠져 있음을 보여줍니다."
            actionPlan="국내 점유율 70%인 고가 수입 브랜드를 대체할 '하이엔드 프리미엄(기능성/처방식)' 라인업을 즉각 구축해 마진 스프레드를 방어해야 합니다. 더불어 일본, 대만 등 소비 대국으로 수출 전선을 고도화해 ASP(평균판매단가)를 글로벌 수준으로 견인해야 합니다."
            />
            </div>
            </div>
            {/* W15 */}
            <div className={styles.card}>
            <CardHeader title="수출 단가 국가별 격차 ($/kg)" icon={DollarSign} term="Price Gap" desc="동일 시장에서 미국산이 태국산 대비 3~7배 고가." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w15} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="market"  tickFormatter={xFmt} />
            <YAxis tickFormatter={(v) => `$${v}`} unit="/kg" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="usPrice" name="미국산 ($/kg)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="thPrice" name="태국산 ($/kg)" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
            </BarChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="Hong Kong Pet Food Market Report 2026, Thailand's Pet Food Market 2025, 신라교역 포괄적 타당성 및 실행 전략 보고서"
            situation="글로벌 소비 시장에서 미국산 펫푸드는 $5.15/kg, 태국산은 $3.77/kg의 프리미엄 가격대를 형성하고 있습니다. 미국은 영양 과학으로, 태국은 수산 가공 인프라로 시장을 탈환 중이나 한국산은 여전히 저가 '가성비' 함정에 갇혀 펀더멘털 한계를 노출합니다."
            actionPlan="신규 CAPEX를 억제하고 세계 최고 수준의 태국 톱티어 OEM 인프라를 레버리지한 크로스보더(Cross-border) 아비트리지 전략으로 제조 마진을 극대화해야 합니다. 글로벌 영양 기준을 충족하는 임상 기반 처방식 브랜드를 론칭해 수입산 대비 대등한 단가 멀티플 리레이팅 달성이 필수입니다."
            />
            </div>
            </div>
            {/* W17 */}
            <div className={styles.card}>
            <CardHeader title="펫푸드 내 원자재 구성비 해부 (%)" icon={PieChartIcon} term="수산물 1.8%" desc="한국 판매 펫푸드 내 수산물 비중이 단 1.8%." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie data={d_w17} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`} labelLine={false} fontSize={12}>
            {d_w17.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="(기본2017-05)반려동물산업 성장에 따른수산분야 펫푸드 산업 활성화 방안, Comprehensive Review of Alternative Proteins"
            situation="전통 원재료가 육류와 곡물에 편중되어 알러지 및 환경 이슈가 급증하는 반면, 소비자의 80.7%가 수산물 펫푸드 급여 의향을 보입니다. 현재 해양 단백질 비중은 1.8%에 불과하여 압도적 저알러지성과 영양 이점을 지닌 폭발적 성장이 예견되는 최적의 블루오션입니다."
            actionPlan="참치 해양 단백질 소싱 역량을 보유한 원양 기업과의 수직계열화(Vertical Integration)로 변동성 제로의 원가 통제력(Cost Control)을 선점해야 합니다. 100% 해양 단일 단백질(Single Protein) 프리미엄 라인을 적각 출시하여 하이엔드 틈새 시장의 초과 마진을 독식하십시오."
            />
            </div>
            </div>
            {/* W19 */}
            <div className={styles.card}>
            <CardHeader title="글로벌 참치 펫푸드 밸류업 마진 비교 (%)" icon={Recycle} term="Empirical Data" desc="태국 참치캔 생산량 폭증의 핵심 요인: 프리미엄 펫푸드 참치육 수요." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w19} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="product"  tickFormatter={xFmt} />
            <YAxis unit="%" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="margin" name="영업이익률(%)" fill={PINK} radius={[4, 4, 0, 0]}>
            {d_w19.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i]} />)}
            </Bar>
            </BarChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="I-TAIL CORPORATION ITC TB, 신라교역 펫푸드 유통 신사업 계획서"
            situation="글로벌 톱 OEM인 태국 ITC는 휴먼그레이드 참치 원육 기반 프리미엄 라인을 통해 23.1%의 압도적 GPM과 18.7%의 순이익률을 달성 중입니다. 횟감용 백육과 펫푸드용 적육을 분리 활용하는 'Full Utilization' 전략은 원가율을 극한으로 통제하며 폭발적 마진 수직 상승을 견인합니다."
            actionPlan="자사가 확보한 프리미엄 참치 원물을 태국 최상위 OEM에 사급 형태로 독점 공급하는 '자원 교환형 파트너십'으로 임가공 마진을 극대화해야 합니다. 더불어 고마진 참치 기능성 보조치료식을 앞세워 브랜드 충성도가 높은 '동물병원' 채널을 독점하여 캐시플로우 질을 개선하십시오."
            />
            </div>
            </div>
            {/* W24 */}
            <div className={styles.card}>
            <CardHeader title="단백질 원자재별 톤당 글로벌 단가 비교 ($/kg) 🟢 Live API" icon={Scale} term="어분 최저" desc="어분 $0.45~0.50/kg으로 최저 동물성 단백질원." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w24} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v) => `$${v}`} />
            <YAxis dataKey="ingredient" type="category" width={100} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="cost" name="단가 ($/kg)" fill="#8b5cf6" radius={[0, 6, 6, 0]}>
            {d_w24.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Bar>
            </BarChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="Sustainability in the Pet Food Industry, Insects as Feed for Companion and Exotic Pets, 신라교역 신사업 계획서"
            situation="해양 단백질원인 어분(Fish Meal)은 $0.45~$0.50/kg로 소고기($1.5~$2.5)나 대체 배양육($4.4~$5.5) 대비 최대 10배 저렴한 절대적 원가 우위를 지닙니다. 높은 소화율과 천연 오메가-3 등 영양 우위까지 입증되어 가공 단가 폭등의 한계를 돌파할 유일한 솔루션입니다."
            actionPlan="압도적 원가 리더십을 갖춘 어분 기반 건식 사료를 캐시카우로 배치해 대체 단백질이 진입 불가한 '매스 프리미엄' 이익을 선점해야 합니다. 원양 조업 이력 추적 시스템과 MSC 인증을 클린 라벨(Clean Label)과 연계하여 시장에 가치 차별화를 명확히 각인시켜야 합니다."
            />
            </div>
            </div>
            {/* W28 */}
            <div className={styles.card}>
            <CardHeader title="대체 단백질 시장의 폭발적 성장성 전망 (억$) 🟢 Live API" icon={Leaf} term="CAGR 8.7%" desc="대체 단백질 펫푸드 시장 2027년 39억$ 전망." />
            <div className={styles.cardBody}>
            <div className={styles.kpiRow}>
            <KpiCard label="CAGR" value="8.7" unit="%" />
            <KpiCard label="2027(E)" value="39" unit="억$" />
            <KpiCard label="어분 원가" value="$0.48" unit="/kg" />
            <KpiCard label="배양육 원가" value="$4.95" unit="/kg" />
            </div>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={d_w28} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis tickFormatter={(v) => `$${v}B`} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="size" name="시장 규모 (억$)" stroke="var(--color-success)" fill="rgba(16,185,129,0.15)" strokeWidth={3} />
            </AreaChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="Processing of Tuna Head By-Products into Antioxidant Peptide Ingredients for Aquaculture Feeds, Alternative Proteins Review"
            situation="버려지던 수산 부산물을 업사이클링하는 '블루푸드테크'가 대체 단백질 내 최고 고수익 모델로 부상했습니다. 참치 가공 잔여물을 효소 분해하여 항산화 생리활성 펩타이드로 추출하는 기술은 원가 '0'의 폐기물을 톤당 수천 달러의 초고부가가치 영양제(Nutraceuticals)로 탈바꿈시킵니다."
            actionPlan="수명 연장으로 팽창 중인 시니어 펫 시장 타겟의 해양 기반 가수분해 펩타이드 특화 영양제 파이프라인을 선제 전개해야 합니다. 'Zero-Waste' ESG 스토리를 내재화하여 PE 엑시트 시점에 대형 SI 투자자들로부터 독보적 멀티플(Multiple) 프리미엄을 확보하는 마스터플랜을 가동하십시오."
            />
            </div>
            </div>
          <div className={styles.card}>
                <CardHeader title={d_kfas_w05.title} icon={Activity} term="EPA+DHA 620" desc="줄가자미 EPA+DHA 620.24 mg/100g — 오메가-3 최고" />
                <div className={styles.cardBody}>
                  <div className={styles.chartContainer}>
                    <SafeResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={d_kfas_w05.data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="species" tick={{fill: '#94a3b8', fontSize: 11}}  tickFormatter={xFmt} />
                        <YAxis yAxisId="left" tick={{fill: '#94a3b8'}} />
                        <YAxis yAxisId="right" orientation="right" unit="g" tick={{fill: '#94a3b8'}} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="EPA+DHA(mg/100g)" name="EPA+DHA (mg/100g)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="조지방(g/100g)" name="조지방 (g/100g)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                      </ComposedChart>
                    </SafeResponsiveContainer>
                  </div>
                  <TakeawayBox
                    source={d_kfas_w05.source}
                    situation={d_kfas_w05.sit}
                    actionPlan={d_kfas_w05.strat}
                  />
                </div>
              </div>
<div className={styles.card}>
              <CardHeader title="RFMO 쿼터 축소 → 원물 공급 리스크" icon={Ban} term="FAD -4%/년" desc="FAD 제한 350→288개로 연 4% 축소. 원물 단가 상승 불가피." />
              <div className={styles.cardBody}>
                <div className={styles.kpiRow}>
                  <KpiCard label="2025 TAC" value="73,011" unit="톤" />
                  <KpiCard label="FAD 제한" value="288" unit="개/선박" />
                  <KpiCard label="황다랑어 감축" value="-20" unit="% (2027)" />
                </div>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={d_nw02_quota} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="year" tick={{fill: '#94a3b8'}}  tickFormatter={xFmt} />
                      <YAxis yAxisId="left" tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} tick={{fill: '#94a3b8'}} />
                      <YAxis yAxisId="right" orientation="right" tick={{fill: '#94a3b8'}} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="tac" name="TAC (톤)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="fadLimit" name="FAD 제한 (개/선박)" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 4 }} />
                      <Line yAxisId="right" type="monotone" dataKey="yftReduction" name="황다랑어 감축(%)" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="5 5" />
                    </ComposedChart>
                  </SafeResponsiveContainer>
                </div>
                <TakeawayBox
                  source="ICCAT Compendium 2025, IOTC Harvest Control Rules, ICCAT Rec. 24-01"
                  situation="ICCAT은 FAD 제한을 2025년 300개 → 2026~27년 288개로 연 4% 축소 중이며, IOTC는 황다랑어를 2027년까지 2017년 대비 20% 감축 의무화했습니다. TAC 증가 대비 FAD 축소의 비대칭 구조는 선단별 어획 효율 하락과 원물 단가 상승을 불가피하게 합니다."
                  actionPlan="쿼터 축소에 면역인 '부산물 기반 펫푸드 원료'로 포트폴리오를 전환하는 것이 유일한 구조적 헷지입니다. 목적어종 쿼터가 줄수록 부산물의 상대적 가치는 역설적으로 상승하므로, 가공 잔여물 독점 계약을 선제적으로 체결하십시오."
                />
              </div>
            </div>
<div className={styles.card}>
              <CardHeader title="기후변화 → 참치 서식지 이동 전망 (2050/2100)" icon={Thermometer} term="-15~30%" desc="중앙 태평양 바이오매스 2100년까지 15~30% 감소 전망." />
              <div className={styles.cardBody}>
                <div className={styles.kpiRow}>
                  <KpiCard label="500kg 한계수온" value="20" unit="°C" />
                  <KpiCard label="1톤급 한계수온" value="17" unit="°C" />
                  <KpiCard label="중앙태평양 2100" value="-22" unit="%" />
                </div>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={d_nw03_climate} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" unit="%" tick={{fill: '#94a3b8'}}  tickFormatter={xFmt} />
                      <YAxis dataKey="region" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 11}} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="change2050" name="2050년 변화(%)" fill="var(--color-warning)" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="change2100" name="2100년 변화(%)" fill="var(--color-danger)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>
                <TakeawayBox
                  source="Block et al. 2026 (Science), Mesothermic fishes face overheating risk (Science)"
                  situation="기후변화로 참치 서식지가 극쪽으로 이동하며, 현재 주요 조업 해역(중앙 북태평양)의 바이오매스가 2100년까지 22% 감소할 전망입니다. 대형 중온어(1톤급)는 수온 17°C에서 과열 위험에 직면하여 개체 수 하락이 예상됩니다. 반면 동태평양과 지중해는 바이오매스가 증가합니다."
                  actionPlan="조업 해역 이동은 물류 비용 증가로 직결되므로, 원물 직접 조달 비용이 구조적으로 상승합니다. 이는 '부산물 업사이클링' 전략의 경제적 정당성을 더욱 강화하며, 기후 리스크에 면역인 가공 잔여물 기반 원료 확보가 필수입니다."
                />
              </div>
            </div>
</div>
        </div>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
            <div style={{ width:'4px', height:'28px', background:'linear-gradient(180deg, #f59e0b, #f59e0b99)', borderRadius:'2px' }} />
            <div>
              <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}>🏭 Part II — 가공 산업 (Processing)</h2>
              <p style={{ margin:0, fontSize:'0.75rem', color:'#64748b' }}>펫푸드 ODM 수익 모델 및 수직계열화</p>
            </div>
          </div>
          <div className={styles.grid}>
            {/* W34: Tilapia Skin Upcycling */}
            <div className={styles.card}>
              <CardHeader title="틸라피아 껍질 업사이클링 수익성 🟢 Live API" icon={Recycle} term="Single-ingredient" desc="단일 원료(Single-ingredient) 반려견 간식 부가가치" />
              <div className={styles.cardBody}>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={d_w34} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="product"  tickFormatter={xFmt} />
                      <YAxis unit="%" />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="margin" name="영업이익률(%)" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="waste" name="자원 낭비율(%)" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>
                <TakeawayBox
                  source="NotebookLM 펫푸드 포렌식 리서치 (1339bce3-e447-40f5-a5f3-51451ffe2128)"
                  situation="[Live 🟢] 과거 어분(Fishmeal)으로 소진되거나 80%가 폐기되던 틸라피아 생선 껍질이, 현재는 풍부한 오메가-3와 치아 관리 기능을 내세운 '단일 원료(Single-ingredient) 프리미엄 수제 간식'으로 부상했습니다."
                  actionPlan="저마진 사료용 가공 라인을 프리미엄 단일 원료 간식 제조 라인업으로 전환하는 '폐기물 제로(Zero-Waste) 업사이클링' 전략을 투입하여 기존 폐기 비용을 초고부가가치(GPM 65%) 수익 센터로 역전시켜야 합니다."
                />
              </div>
            </div>
            {/* W09 */}
            <div className={styles.card}>
            <CardHeader title="주요 기업 매출 및 이익률 비교 (억 원)" icon={Scale} term="Scoreboard" desc="로얄캐닌 2,093억 원으로 압도적 1위." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w09} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number"  tickFormatter={xFmt} />
            <YAxis dataKey="company" type="category" width={100} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="revenue" name="매출 (억 원)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            <Line dataKey="margin" name="영업이익률(%)" stroke={PINK} strokeWidth={3} type="monotone" />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="[The Numbers] 하림펫푸드 매출 500억 돌파, 대한민국 반려동물 사료 시장 진화 전략"
            situation="국내 펫푸드 시장은 초저가 가성비와 하이엔드 프리미엄으로 완벽히 양극화되었습니다. 1위 로얄캐닌코리아는 정밀 영양을 앞세워 12.6%의 고수익을 낸 반면, 매스(Mass) 위주의 토종 선두는 1,076억 매출에도 적자에 직면했습니다. 반대로 '휴먼그레이드' 하림펫푸드와 ODM 1위 오에스피는 이익률 반등에 성공했습니다."
            actionPlan="PEF 투자 시 '규모의 경제'보다 '프리미엄 세그먼트 침투력'에 멀티플을 부여해야 합니다. 어중간한 포트폴리오를 폐기하고, 합성보존료 무첨가 등으로 고마진(MSRP Premium)을 정당화하는 브랜드를 타겟팅하거나 B2C와 ODM을 수직 통합하는 롤업(Roll-up) 전략을 가동하십시오."
            />
            </div>
            </div>
            {/* W16 */}
            <div className={styles.card}>
            <CardHeader title="펫푸드 원자재 및 환율 민감도 분석 (%)" icon={Activity} term="Sensitivity" desc="참치 +10% → 순이익 -8.5%. 환율 1바트 절상 → -10%." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w16} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" unit="%"  tickFormatter={xFmt} />
            <YAxis dataKey="factor" type="category" width={120} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="gpmImpact" name="GPM 영향(%)" fill="var(--color-warning)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="profitImpact" name="순이익 영향(%)" fill="var(--color-danger)" radius={[0, 4, 4, 0]} />
            </BarChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="I-TAIL CORPORATION ITC TB (Finansia, Globlex Securities Analyst Reports)"
            situation="수산 펫푸드는 원가와 환율에 치명적인 민감도를 지닙니다. 글로벌 톱 타이유니온 i-Tail(ITC)은 원재료의 50%가 참치이며, 참치 원가 10% 상승 시 순이익이 8.5% 증발합니다. 수출 비중이 93.6%로 태국 바트 1바트 절상 시 순이익 10%가 깎이는 환율 충격에도 노출되어 있습니다."
            actionPlan="수산 기업 펫푸드 밸류업 핵심은 '원가 통제권(Cost Control)'의 내재화입니다. 외부 원물 변동 리스크를 계열사 내에서 흡수하는 수직 통합을 추진하고, 원가 상승을 고객사에 전가할 Cost-plus Pricing 계약 및 외환 헷징을 구축해야 살아남습니다."
            />
            </div>
            </div>
            {/* W20 */}
            <div className={styles.card}>
            <CardHeader title="i-Tail 글로벌 ODM 매출 및 이익률 구조 (%)" icon={Factory} term="GPM 25%" desc="마즈·스머커 등 OEM으로 98.7% 매출. GPM 25%." />
            <div className={styles.cardBody}>
            <div className={styles.kpiRow}>
            <KpiCard label="OEM 비중" value="98.7" unit="%" />
            <KpiCard label="프리미엄 비중" value="47-50" unit="%" />
            <KpiCard label="간식 성장률" value="+36.5" unit="%" />
            <KpiCard label="배당 성향" value="85.6" unit="%" />
            </div>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w20} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis yAxisId="left" tickFormatter={(v) => `${v}억`} />
            <YAxis yAxisId="right" orientation="right" unit="%" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" name="매출 (억 바트)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="gpm" name="GPM(%)" stroke={PINK} strokeWidth={3} />
            <Line yAxisId="right" type="monotone" dataKey="npm" name="순이익률(%)" stroke="var(--color-success)" strokeWidth={2} strokeDasharray="5 5" />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="I-TAIL CORPORATION ITC TB, 신라교역 펫푸드 유통 신사업 계획서"
            situation="글로벌 톱 ITC는 전체 매출의 98.7%가 단순 OEM에서 발생함에도 25%의 GPM과 18.7%의 탁월한 순이익률을 달성합니다. 탑티어 고객사와의 21년 장기 락인, 고마진 습식 중심의 생산, 영양학적 솔루션을 역제안하는 자체 혁신 센터(GPCI) 내재화가 그 비결입니다."
            actionPlan="저마진 건식 사료 설비를 고수익 습식/동결건조 및 처방식 라인으로 즉각 전환하는 CapEx 투자가 요구됩니다. 제조 하청(OEM)을 넘어 처방식 포뮬러를 자체 설계하여 고객에게 솔루션을 파는 진정한 ODM으로 체질 개선을 이뤄내야 초과 수익을 담보합니다."
            />
            </div>
            </div>
            {/* W22 */}
            <div className={styles.card}>
            <CardHeader title="오에스피(OSP) 매출 및 V자 이익률 회복 (%) 🟢 Live API" icon={LineChartIcon} term="V자 회복" desc="원가율 78.6% → 이익률 6.5% 저점 → 15.4% V자 회복." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w22} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" unit="%" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" name="매출 (억 원)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="margin" name="영업이익률(%)" stroke={PINK} strokeWidth={3} />
            <Line yAxisId="right" type="monotone" dataKey="costRate" name="매출원가율(%)" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="5 5" />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="대한민국 반려동물 사료 시장의 구조적 진화, 대한민국 펫푸드 주요 기업 분석 보고"
            situation="코스닥 상장사 오에스피(OSP)는 프리미엄 유기농 ODM 1위입니다. 원재료 급등으로 B2B 마진이 급감하자 간식 전문 제조사를 전략적 인수, B2B 모델에 안주하지 않고 PB 브랜드 확대 및 D2C 유통 진출로 영업이익률을 15.4%로 완벽히 V자 회복시켰습니다."
            actionPlan="안정적 캐시플로우의 B2B 제조사를 기반으로 충성 고객을 보유한 B2C/D2C 플랫폼을 Bolt-on 인수하여 유통 수수료를 내재화하는 정석적 Value-up입니다. 자사 제조 인프라(원가 절감)와 인수기업 유통망을 융합해 블렌디드 마진을 극대화하십시오."
            />
            </div>
            </div>
            {/* W23 */}
            <div className={styles.card}>
            <CardHeader title="하림펫푸드 매출 및 수직계열화 이익 성장 (억 원)" icon={Zap} term="Vertical Integration" desc="계열사 닭고기 원가 직접 공급으로 흑자 전환." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w23} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" unit="%" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="revenue" name="매출 (억 원)" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="profit" name="영업이익 (억 원)" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="margin" name="영업이익률(%)" stroke={PINK} strokeWidth={3} />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="비주류서 미래 핵심 사업으로…식품 대기업 펫푸드 베팅, [The Numbers] 하림펫푸드 분석"
            situation="하림펫푸드가 2024년 최대 매출 521억, 영업이익률 6%에 오른 비결은 모기업을 통한 원물 '직접 조달(Vertical Integration)'에 있습니다. 경쟁사가 외부 가격 변동에 고전할 때 하림은 신선 원료를 저원가로 통제하며 고판가 프리미엄 마케팅을 완성했습니다."
            actionPlan="1차 밸류체인을 보유한 PE의 필승 전략입니다. 캡티브 원료 공급망을 지닌 펫푸드 부문을 육성해 글로벌 인플레이션 리스크를 완전히 상쇄(Hedging)해야 합니다. 이를 '신선 로컬 식재료(Clean Label)' 브랜딩으로 승화시켜 초과 마진을 달성하십시오."
            />
            </div>
            </div>
            {/* W26 */}
            <div className={styles.card}>
            <CardHeader title="카테고리별 글로벌 펫푸드 성장률 비교 (%) 🟢 Live API" icon={Award} term="PB 20.2%" desc="미국 PB 펫푸드 성장률 20.2%로 프리미엄(11.1%)의 2배." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w26} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" unit="%"  tickFormatter={xFmt} />
            <YAxis dataKey="cat" type="category" width={120} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="growth" name="성장률(%)" fill={PINK} radius={[0, 6, 6, 0]}>
            {d_w26.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Bar>
            </BarChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="European pet food market share breakdown, 2026 Pet Care Industry Trends"
            situation="인플레이션 심화로 소비자의 하향 이동(Trading down)이 발생, PB 사료가 시장의 20~38%를 잠식하며 내셔널 브랜드(NB) 대비 3~5배 이상 가파르게 성장 중입니다. 소비자는 어중간한 브랜드를 버리고 가성비와 품질이 보장된 대형 유통사 PB로 대거 이탈 중입니다."
            actionPlan="포트폴리오 내 OEM 제조사는 아마존 등 메가 리테일러의 PB 독점 공급자로 포지셔닝하여 마케팅 비용 제로 구조를 달성해야 합니다. B2C 브랜드를 소유했다면 어중간한 Mid-tier를 버리고 PB가 모방 불가한 특수 기능성 개발로 피봇팅하여 밸류를 방어하십시오."
            />
            </div>
            </div>
            {/* W31 */}
            <div className={styles.card}>
            <CardHeader title="태국 휴먼그레이드 참치 수출 및 펫푸드 지수" icon={Activity} term="Empirical Data" desc="태국 캔참치 수출량과 프리미엄 펫푸드 수요 지수 상관관계" />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w31} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis yAxisId="left" unit="천톤" />
            <YAxis yAxisId="right" orientation="right" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="cannedExport" name="태국 참치캔 수출(천 톤)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="petfoodDemand" name="펫푸드 수요 지수" stroke="#f472b6" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="신라교역 타당성 및 실행 전략 보고서, (기본2017-05) 수산분야 펫푸드 산업 활성화 방안"
            situation="프리미엄 펫푸드 수요 폭증은 참치 원물의 '부위별 종합 활용'이라는 이익 창출 패러다임을 확립했습니다. 기존에 헐값 매각되던 적육(Red meat)과 자숙액이 최고급 반려묘 습식 사료 원료로 업사이클링 되며 참치 1톤당 부가가치를 기존 대비 10배 이상 끌어올렸습니다."
            actionPlan="단순 1차 식품 가공에서 벗어나, 폐기되던 수산 부산물을 고부가가치 펫푸드 원료로 전환하는 업사이클링 공정에 투자하십시오. 원가 센터를 초고마진 이익 센터로 변환하고 순환경제(Zero-Waste) 스토리를 더해 엑시트 멀티플을 극대화해야 합니다."
            />
            </div>
            </div>
          <div className={styles.card}>
                <CardHeader title={d_kfas_w02.title} icon={Zap} term="항산화 35.2%" desc="Aroase AP-10 효소 최적, DPPH 라디칼 소거능 35.2%" />
                <div className={styles.cardBody}>
                  <div className={styles.chartContainer}>
                    <SafeResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={d_kfas_w02.data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="enzyme" tick={{fill: '#94a3b8', fontSize: 10}} angle={-15} textAnchor="end"  tickFormatter={xFmt} />
                        <YAxis yAxisId="left" tick={{fill: '#94a3b8'}} />
                        <YAxis yAxisId="right" orientation="right" unit="%" tick={{fill: '#94a3b8'}} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="가수분해도(%)" name="가수분해도(%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="left" dataKey="DPPH라디컬소거(%)" name="DPPH 소거(%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="거품활성(%)" name="거품활성(%)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                      </ComposedChart>
                    </SafeResponsiveContainer>
                  </div>
                  <TakeawayBox
                    source={d_kfas_w02.source}
                    situation={d_kfas_w02.sit}
                    actionPlan={d_kfas_w02.strat}
                  />
                </div>
              </div>
<div className={styles.card}>
                <CardHeader title={d_kfas_w04.title} icon={Leaf} term="수율 72.5%" desc="스피룰리나 알칼리추출 72.5% 수율, EAA 312mg/g" />
                <div className={styles.cardBody}>
                  <div className={styles.chartContainer}>
                    <SafeResponsiveContainer width="100%" height="100%">
                      <BarChart data={d_kfas_w04.data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="method" tick={{fill: '#94a3b8', fontSize: 9}} angle={-20} textAnchor="end" height={70}  tickFormatter={xFmt} />
                        <YAxis tick={{fill: '#94a3b8'}} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="단백질수율(%)" name="단백질 수율(%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="EAA함량(mg/g)" name="EAA 함량(mg/g)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </SafeResponsiveContainer>
                  </div>
                  <TakeawayBox
                    source={d_kfas_w04.source}
                    situation={d_kfas_w04.sit}
                    actionPlan={d_kfas_w04.strat}
                  />
                </div>
              </div>
</div>
        </div>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
            <div style={{ width:'4px', height:'28px', background:'linear-gradient(180deg, #10b981, #10b98199)', borderRadius:'2px' }} />
            <div>
              <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}>🚢 Part III — 물류 및 무역 (Logistics)</h2>
              <p style={{ margin:0, fontSize:'0.75rem', color:'#64748b' }}>수출입 무역망 및 국가별 교역 지표</p>
            </div>
          </div>
          <div className={styles.grid}>
            {/* W36: MENA Market Growth */}
            <div className={styles.card}>
              <CardHeader title="MENA 펫푸드 시장의 폭발적 성장 🟢 Live API" icon={Globe} term="MENA Demand" desc="중동 및 북아프리카 지역의 펫푸드 소비 급증" />
              <div className={styles.cardBody}>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={d_w36} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year"  tickFormatter={xFmt} />
                      <YAxis yAxisId="left" tickFormatter={(v: any) => `$${v}M`} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v: any) => `${v}`} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="tuna_can" name="전통 참치캔 (백만$)" fill="#64748b" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="petfood_demand" name="수산 펫푸드 수요지수" stroke="#f472b6" strokeWidth={3} />
                    </ComposedChart>
                  </SafeResponsiveContainer>
                </div>
                <TakeawayBox
                  source="NotebookLM 펫푸드 포렌식 리서치 (1339bce3-e447-40f5-a5f3-51451ffe2128)"
                  situation="[Live 🟢] 기존 인간용 참치캔 소비가 지배하던 약 10억 달러 규모의 MENA(중동·북아프리카) 수산물 시장에 펫 휴머니제이션이 번지며 부가가치 펫푸드(습식/간식) 소비 수요가 폭발적으로 급상승(수요지수 +800% 성장) 중입니다."
                  actionPlan="성장이 정체된 미주/유럽 시장 대신, 1차 할랄(Halal) 인증을 획득한 참치 및 수산물 원료 인프라를 무기로 중동/북아프리카의 블루오션 하이엔드 펫푸드 시장을 조기 선점하는 'First Mover' 파이프라인을 구축하십시오."
                />
              </div>
            </div>
            {/* NEW: 한국 수출 도착국 비율 */}
            <div className={styles.card}>
              <CardHeader title="한국 펫푸드 12배 수출 폭증 원동력 🟢 Live API" icon={Flag} term="K-Pet Food" desc="최근 수출 12배 성장, 일본(42%)과 아세안 주도." />
              <div className={styles.cardBody}>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={d_export_dest} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" paddingAngle={2} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {d_export_dest?.map((entry: any, i: number) => <Cell key={i} fill={entry.fill || PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </SafeResponsiveContainer>
                </div>
                <TakeawayBox
                  source="PHASE 2 한국 시장 진단 보고서 (KCS 데이터베이스)"
                  situation="한국의 펫푸드 수출은 단기간에 12배 폭증하는 기염을 토했으며, 현재 그 물량의 42%가 일본으로, 16%가 태국으로 향하고 있습니다. 이는 K-브랜드의 안전성(Clean Label)과 한류 프리미엄이 융합된 결과입니다."
                  actionPlan="일본 중심의 원-아시아(One-Asia) 수출 벨트를 태국, 대만으로 다변화해야 합니다. 특히 K-콘텐츠 선호도가 높은 아세안 지역에 '휴먼그레이드' 펫푸드를 K-뷰티/헬스와 묶어 프리미엄 포지셔닝으로 수출하는 전략이 유효합니다."
                />
              </div>
            </div>
            {/* W11 */}
            <div className={styles.card}>
            <CardHeader title="수출 대상국 TOP 5 편중 분석 (%)" icon={MapPin} term="일본 40%" desc="일본이 전체 수출의 40%를 차지하는 절대적 1위." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie data={d_w11} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={12}>
            {d_w11.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="글로벌 반려동물 산업과 주요 수출국 시장 동향, Unleashing Opportunities in Taiwan"
            situation="한국 펫푸드 수출의 약 40%가 일본에 집중된 극단적 편중 구조로, 엔저 환율 변동이나 지정학적 이슈 발생 시 톱라인이 크게 흔들릴 리스크를 안고 있습니다. 반면 대만은 2019년 123만$에서 2023년 2,127만$로 17배 이상 폭증(CAGR 103.9%)하며 핵심 수출처로 급부상 중입니다."
            actionPlan="일본 편중 리스크를 타개하기 위해 대만 및 아세안 유통망을 보유한 업체를 즉각 Bolt-on 인수하여 점유율을 다변화하십시오. 수입 의존도가 70%인 대만 시장은 고단백/알러지 케어 등 프리미엄 니치 타겟팅으로 진입해 평균판매단가(ASP)를 극대화해야 합니다."
            />
            </div>
            </div>
            {/* W12 */}
            <div className={styles.card}>
            <CardHeader title="펫푸드 수입원 의존도 분석 (%)" icon={Truck} term="중국 32.6%" desc="중국이 수입의 32.6%로 1위. 미국산은 프리미엄 중심." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w12} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v) => `${(v / 10000).toFixed(1)}억$`} />
            <YAxis dataKey="country" type="category" width={60} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="수입액 (만$)" fill="var(--color-danger)" radius={[0, 6, 6, 0]} />
            </BarChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="South Korea Pet Food Report - USDA/FAS, South Korea Pet Food Market Size"
            situation="국내 3억 달러 수입 시장 중 중국산이 32.6%로 압도적 1위나 대부분 저가 건식에 편중되어 시장 하단을 잠식 중입니다. 반면 미국산(16%)은 수의학적으로 검증된 고가의 프리미엄 및 처방식에 집중되어 수입 구조가 극도로 양극화되어 있습니다."
            actionPlan="자체 원물 조달(수산물 수직계열화) 인프라를 활용해 저가 수입 시장을 국산으로 대체하는 원가 경쟁력을 우선 확보해야 합니다. 나아가 미국산이 점유한 프리미엄 시장을 합성 보존료 무첨가 국산 '휴먼그레이드' 습식 라인업으로 탈환하여 Bottom-line을 방어하십시오."
            />
            </div>
            </div>
            {/* W13 */}
            <div className={styles.card}>
            <CardHeader title="태국의 글로벌 펫푸드 수출 지배력 🟢 Live API" icon={Ship} term="글로벌 10%" desc="2024년 수출 26.7억$(+29%). 미국이 태국 수출의 1/3." />
            <div className={styles.cardBody}>
            <div className={styles.kpiRow}>
            <KpiCard label="태국 총 수출" value="26.7" unit="억$" />
            <KpiCard label="글로벌 점유율" value="10" unit="%" />
            <KpiCard label="YoY 성장률" value="+29" unit="%" />
            </div>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w13} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v) => `$${v}B`} />
            <YAxis dataKey="country" type="category" width={70} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="수출액 (억$)" fill="var(--color-warning)" radius={[0, 6, 6, 0]} />
            </BarChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="Thailand's Pet Food Market 2025, 신라교역 신사업 타당성 보고서"
            situation="태국은 2024년 27억 달러를 수출하며 독일에 이어 세계 2위 펫푸드 수출 허브로 도약했습니다. 풍부한 수산 원물, 제조 원가 우위, 글로벌 인증(GMP/HACCP)을 갖춘 대형 제조사(i-Tail 등)가 글로벌 브랜드들의 OEM 생산 기지를 독점 중입니다."
            actionPlan="당사 원양 참치 원물을 태국 핵심 공장에 사급하고 프리미엄 완제품을 역수입하는 '자원 교환형(Resource-Swap)' 하이브리드 파트너십이 요구됩니다. 태국의 다자간 FTA 네트워크를 활용해 제3국(대만, 미국)으로 무관세 우회 수출하는 모델을 가동하십시오."
            />
            </div>
            </div>
            {/* W14 */}
            <div className={styles.card}>
            <CardHeader title="태국 내수 수입 구조 및 한국산 약진 (%)" icon={Network} term="한국산 24%" desc="한국산이 태국 수입 2위(24%). 연 72.6% 성장." />
            <div className={styles.cardBody}>
            <div className={styles.kpiRow}>
            <KpiCard label="태국 내수 시장" value="16" unit="억$" />
            <KpiCard label="수입 비중" value="9" unit="%" />
            <KpiCard label="한국산 성장률" value="72.6" unit="%" />
            </div>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie data={d_w14} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={12}>
            {d_w14.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="태국 반려동물 간식 보고서, 태국 펫케어 시장 트렌드 (KOTRA)"
            situation="세계 2위 수출국인 태국도 내수 시장의 펫 휴머니제이션으로 프리미엄 수입이 급증하고 있습니다. 한국산 제품은 수입 점유율 2위(24.7%)로 급부상했으며, 한국산을 안전한 고기능성 웰빙 제품으로 인식하며 연평균 성장률(CAGR) 72.5%의 폭발적인 약진을 기록 중입니다."
            actionPlan="태국을 단순 제조 하급지가 아닌 '신흥 럭셔리 소비 시장'으로 재정의하십시오. 한류 프리미엄을 업고 K-기능성 사료를 태국 고급 동물병원과 버티컬 커머스에 직수출하는 옴니채널 마케팅을 투하해 ASP(평균판매단가)를 공격적으로 끌어올려야 합니다."
            />
            </div>
            </div>
            {/* W29 */}
            <div className={styles.card}>
            <CardHeader title="D2C 구독 모델 및 신선 사료 밸류에이션" icon={ShoppingCart} term="연 30% 성장" desc="냉장 신선 사료+D2C 구독으로 연 30% 성장." />
            <div className={styles.cardBody}>
            <div className={styles.kpiRow}>
            <KpiCard label="매출 (2020)" value="3.19" unit="억$" />
            <KpiCard label="순이익" value="1,420" unit="만$" />
            <KpiCard label="연 성장률" value="~30" unit="%" />
            <KpiCard label="전용 냉장고" value="23,000" unit="곳+" />
            </div>
            <div className={styles.chartContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🧊</div>
            <h3 style={{ color: '#e2e8f0', fontSize: '1.2rem', margin: '0 0 12px 0' }}>Freshpet — 파괴적 카테고리 혁신</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '400px' }}>
            냉장 신선 사료라는 <strong style={{ color: PINK }}>새로운 카테고리</strong>를 창출하여
            <br />미국 23,000곳 매장에 전용 냉장고를 설치.
            <br />건식 사료 과점 구도를 완전히 뒤흔든 D2C 혁신 사례.
            </p>
            </div>
            </div>
            <TakeawayBox
            source="글로벌 펫케어 (Initiate), The Subscription That's Feeding America's Pets"
            situation="미국은 '냉장 신선 사료' 카테고리가 D2C 구독 경제와 결합하며 판도를 흔들고 있습니다. 프레시펫(Freshpet)은 소매 전용 냉장고 유통과 D2C 구독으로 2024년 9.7억 달러 매출을 돌파하며 연 30% 고성장 중입니다. 독보적 콜드체인(Cold-chain)을 지닌 기업이 압도적 LTV를 증명하며 프리미엄 멀티플을 독식하고 있습니다."
            actionPlan="한국의 새벽배송 인프라에 기반한 D2C 정기 구독 모델을 즉각 이식하십시오. 구독은 고객 이탈률(Churn)을 방어하고 강력한 Recurring 현금흐름을 창출합니다. 펫 연령/질환 데이터와 결합한 'AI 맞춤 생식 구독'으로 진화시켜 경쟁사가 모방 불가능한 진입장벽(Moat)을 확보해야 합니다."
            />
            </div>
            </div>
            {/* W32 */}
            <div className={styles.card}>
            <CardHeader title="대미(對美) 관세 인상 리스크 방어 시뮬레이션 (%) 🟢 Live API" icon={ShieldCheck} term="Tariff Hedging" desc="보호무역 심화 시 펫푸드 우회 수출 마진 방어율" />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w32} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="scenario"  tickFormatter={xFmt} />
            <YAxis unit="%" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="canned_margin" name="통조림 마진(%)" fill="#64748b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="petfood_margin" name="펫푸드 마진(%)" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
            </BarChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="A strategic procurement playbook for pet food 2026, Thailand is world’s No.2 Pet Food Exporter"
            situation="자국 우선주의로 무역 장벽이 격화되며 이익률이 낮은 범용 수산 통조림의 수출 마진이 극도로 훼손되고 있습니다. 반면 고수익 펫푸드는 보호무역 관세 타격을 거뜬히 흡수하는 마진 탄력성(Resilience)을 증명했습니다. 태국은 미국발 19% 보복 관세의 악조건 속에서도 펫푸드 대미 수출을 26% 확대하는 기염을 토했습니다."
            actionPlan="그룹 포트폴리오의 구조적 Pivot이 생존을 결정합니다. 관세 인상 압박에 취약한 일반 인간용 식음료(F&B) 수출 비중을 전략적으로 축소하고, 가격 전가력(Pricing Power)이 월등히 뛰어난 프리미엄 펫푸드(동결건조/습식)로 믹스를 고도화하여 전체 그룹의 관세 리스크 헤징(Hedging Buffer) 망을 완비하십시오."
            />
            </div>
            </div>
          <div className={styles.card}>
              <CardHeader title="US MMPA 비관세 장벽 리스크 레이더" icon={Radio} term="2026 시행" desc="미국 MMPA 동등성 미증명 시 수산물 수입 전면 금지." />
              <div className={styles.cardBody}>
                <div className={styles.kpiRow}>
                  <KpiCard label="시행 연도" value="2026" unit="년" />
                  <KpiCard label="미준수 시" value="수입금지" unit="" />
                  <KpiCard label="ICCAT 커버리지" value="100" unit="%" />
                </div>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={d_nw06_mmpa} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="year" tick={{fill: '#94a3b8'}}  tickFormatter={xFmt} />
                      <YAxis unit="%" domain={[0, 100]} tick={{fill: '#94a3b8'}} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="riskLevel" name="리스크 수준(%)" fill="var(--color-danger)" radius={[4, 4, 0, 0]}>
                        {d_nw06_mmpa?.map((_: any, i: number) => {
                          const colors = ['#10b981', '#f59e0b', '#ef4444', '#7f1d1d'];
                          return <Cell key={i} fill={colors[i] || '#ef4444'} />;
                        })}
                      </Bar>
                    </ComposedChart>
                  </SafeResponsiveContainer>
                </div>
                <TakeawayBox
                  source="ICCAT Compendium, US Marine Mammal Protection Act (MMPA) Import Provisions"
                  situation="2026년 발효되는 US MMPA는 수출국에 미국과 동등한 바이캐치 저감 기준 증명을 요구하며, 미충족 시 해당국 수산물의 대미 수입이 전면 금지됩니다. 태국 등 주요 OEM 생산국의 대미 펫푸드 수출에도 직접적 영향을 미치며, 이는 기존 관세 리스크를 넘어서는 '존재적 위협(Existential Threat)'입니다."
                  actionPlan="태국 OEM 파트너 선정 시 MMPA 컴플라이언스 인증 여부를 필수 체크리스트에 포함하십시오. 자사 브랜드에 'MMPA-Compliant' 라벨을 선제적으로 부착하여 미국 시장 진입 시 비관세 장벽을 경쟁 우위로 전환해야 합니다. 100% EMS 탑재 선단 인증이 핵심 방어 수단입니다."
                />
              </div>
            </div>
</div>
        </div>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
            <div style={{ width:'4px', height:'28px', background:'linear-gradient(180deg,#ef4444,#ef444499)', borderRadius:'2px' }} />
            <div>
              <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}>🛒 Part IV — 판매 및 수요 (Sales & Demand)</h2>
              <p style={{ margin:0, fontSize:'0.75rem', color:'#64748b' }}>글로벌 소비 트렌드 및 유통채널 대전환</p>
            </div>
          </div>
          <div className={styles.grid}>
            {/* NEW: 한국 유통 채널 점유율 */}
            <div className={styles.card}>
              <CardHeader title="한국 유통 채널 점유율 대전환 🟢 Live API" icon={ShoppingCart} term="이커머스 65%" desc="이커머스가 65% 장악, 동물병원(처방식) 4%로 고마진 틈새." />
              <div className={styles.cardBody}>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={d_channel_share} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis type="number" unit="%" tick={{fill: '#94a3b8'}}  tickFormatter={xFmt} />
                      <YAxis dataKey="name" type="category" width={80} tick={{fill: '#94a3b8'}} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="채널 점유율(%)" radius={[0, 6, 6, 0]}>
                        {d_channel_share?.map((entry: any, i: number) => <Cell key={i} fill={entry.fill || PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>
                <TakeawayBox
                  source="PHASE 2 한국 시장 진단 보고서"
                  situation="한국 펫푸드 시장은 이커머스가 65% 이상을 장악하며 디지털 트랜스포메이션이 완료되었습니다. 이로 인해 오프라인 펫샵(19%) 및 대형마트(12%)의 협상력은 붕괴된 반면, 동물병원(4%) 채널은 처방식이라는 독점적 고마진 캐시카우로 부상했습니다."
                  actionPlan="오프라인 매대 입점을 위한 마케팅 비용을 전면 삭감하고, 이커머스 중심의 D2C 구독 모델(S2)에 올인해야 합니다. 장기적으로는 R&D 역량을 확충해 진입 장벽이 높은 수의사 네트워크 기반 동물병원 전용 처방식(S5)으로 라인업을 확장하십시오."
                />
              </div>
            </div>
            {/* W01 */}
            <div className={styles.card}>
            <CardHeader title="글로벌 펫푸드 시장 성장 곡선 🟢 Live API" icon={Globe} term="CAGR" desc="연평균 복합 성장률. 2017~2022년 8.9%, 이후 5~7% 지속 전망." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={d_w01} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis tickFormatter={(v) => `$${v}B`} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="size" name="시장 규모 (억$)" stroke={PINK} fill="rgba(244,114,182,0.15)" strokeWidth={3} />
            </AreaChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="Knowledge Sourcing Intelligence, Presedence Research, Euromonitor 종합"
            situation="펫푸드 산업은 단순 소비재를 넘어 거시경제 불황에도 소비가 줄지 않는 강력한 방어 산업(Defensive Industry)으로 진화했습니다. '펫 휴머니제이션' 트렌드에 따라 P(가격)와 Q(개체 수)가 동반 상승하는 구조적 강세장이며, 2030년대 중반 2,000억 달러를 상회할 거대한 시장입니다."
            actionPlan="수산 기업이 보유한 '콜드체인 인프라'와 '해양 단백질 부산물'을 레버리지하여 프리미엄 시장에 진입해야 합니다. 저부가가치 어분으로 소모되던 참치 부산물에서 고부가가치 원료(오메가-3, 펩타이드)를 추출(업사이클링)하는 B2B 원료 독점 공급 및 자체 브랜드 구축이 필수적입니다."
            />
            </div>
            </div>
            {/* W02 */}
            <div className={styles.card}>
            <CardHeader title="국가별 시장 규모 TOP 10 🟢 Live API" icon={Crown} term="미국 독점" desc="미국이 단독으로 글로벌 시장의 약 40%를 차지." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w02} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v) => `$${v}B`} />
            <YAxis dataKey="country" type="category" width={60} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="size" name="시장 규모 (억$)" fill={PINK} radius={[0, 6, 6, 0]} />
            </BarChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="GlobalData, USDA FAS (Foreign Agricultural Service)"
            situation="전 세계 펫푸드 시장의 약 40%를 미국이 장악하고 있으며, 천연 원료 및 지속가능성(ESG) 기준을 선도하고 있습니다. 다만, 마즈(Mars), 퓨리나(Purina) 등 소수 거대 자본이 시장을 철저히 과점하고 있어, 신규 브랜드의 직접 진입은 엄청난 마케팅 출혈을 동반합니다."
            actionPlan="경쟁이 치열한 완전 사료(Kibble) 시장 진입은 피하고, 수익성이 극도로 높은 '토퍼(Topper, 파우치/동결건조 간식)' 시장을 우회 공략해야 합니다. MSC 인증 청정 해양 단백질을 북미 펫 브랜드에 공급하는 벤더로 진입하거나 중견 브랜드를 M&A 하는 롤업(Roll-up) 전략을 구사해야 합니다."
            />
            </div>
            </div>
            {/* W04 */}
            <div className={styles.card}>
            <CardHeader title="아시아 3대 시장 성장경쟁 🟢 Live API" icon={TrendingUp} term="아시아 트리플 성장" desc="중국·태국·한국의 시장 규모 성장 비교." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <LineChart data={d_w04} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis tickFormatter={(v) => `$${v}B`} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="china" name="중국 (억$)" stroke="var(--color-danger)" strokeWidth={3} />
            <Line type="monotone" dataKey="thai" name="태국 (억$)" stroke="var(--color-warning)" strokeWidth={3} />
            <Line type="monotone" dataKey="korea" name="한국 (억$)" stroke="var(--color-info)" strokeWidth={3} />
            </LineChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="USDA FAS 태국 펫푸드 시장 보고서, Mordor Intelligence, KREI"
            situation="아시아 태평양은 글로벌 펫푸드 시장에서 가장 역동적인 성장 엔진입니다. 중국은 거대한 모수와 확장성, 태국은 세계 최상위권의 펫푸드 OEM/수출 인프라, 한국은 70% 이상의 이커머스 침투율과 프리미엄 테스트베드로서의 강점을 지니고 있습니다."
            actionPlan="한국 수산 기업의 최상위 원물을 태국의 I-TAIL 등 핵심 OEM 파트너에게 사급하여 원가를 획기적으로 낮추는 '삼각 밸류체인(Triangular Value Chain)'을 구축해야 합니다. 생산된 완제품은 이커머스가 고도화된 한국과 거대 내수 중국으로 동시 전개하여 구조적 차익거래(Arbitrage)를 실현해야 합니다."
            />
            </div>
            </div>
            {/* W05 */}
            <div className={styles.card}>
            <CardHeader title="홍콩·대만 초프리미엄 허브 🟢 Live API" icon={Award} term="Premium Hub" desc="홍콩 프리미엄 비중 75%, 대만 수입 의존도 70%." />
            <div className={styles.cardBody}>
            <div className={styles.kpiRow}>
            <KpiCard label="홍콩 내수 (2023)" value="7.55" unit="억$" />
            <KpiCard label="홍콩 프리미엄" value="75" unit="%" />
            <KpiCard label="대만 수입액" value="2.77" unit="억$" />
            <KpiCard label="대만 태국산 비중" value="37" unit="%" />
            </div>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w05} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="market"  tickFormatter={xFmt} />
            <YAxis yAxisId="left" tickFormatter={(v) => `$${v}B`} />
            <YAxis yAxisId="right" orientation="right" unit="%" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="sales" name="내수 판매 (억$)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="premium" name="프리미엄 비중(%)" stroke={PINK} strokeWidth={3} />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="Euromonitor, USDA FAS 홍콩 및 대만 펫푸드 시장 보고서"
            situation="홍콩은 초프리미엄(Ultra-premium) 펫푸드가 전체 시장의 75%를 차지하는 최고 부가가치 시장이자 남중국 본토 우회 수출 허브입니다. 대만 역시 수입산 프리미엄 펫푸드 수용도가 극도로 높은 수의사 네트워크 기반의 하이엔드 시장입니다."
            actionPlan="태평양 조업 선박, 선상 급속 냉동 여부 등을 QR코드로 제공해 극단적 투명성(Traceability)을 소구하는 클린 라벨 제품을 론칭해야 합니다. 홍콩의 지리적 이점과 면세 혜택을 통해 중국 본토 VIP 소비층에 침투하는 크로스보더(Cross-border) 이커머스 앵커 채널로 적극 활용하십시오."
            />
            </div>
            </div>
            {/* W06 */}
            <div className={styles.card}>
            <CardHeader title="중국 반려동물 소비 구조 🟢 Live API" icon={PieChartIcon} term="중국 3,020억 위안" desc="2024년 기준 전체 소비 419억$, 펫푸드 52.8%." />
            <div className={styles.cardBody}>
            <div className={styles.kpiRow}>
            <KpiCard label="전체 소비" value="3,020" unit="억위안" />
            <KpiCard label="펫푸드 비중" value="52.8" unit="%" />
            <KpiCard label="반려묘 비중" value="57.5" unit="%" />
            <KpiCard label="미국산 수입" value="2.97" unit="억$" />
            </div>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie data={d_w06} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={12}>
            {d_w06.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="Pet data (2023-2024년 중국 반려동물 산업 백서), TGM Research"
            situation="중국 시장은 1인 가구, 고밀도 도심 거주 증가로 반려묘(57.5%)가 반려견(42.5%)을 압도적으로 추월한 '고양이 경제(Cat Economy)'로 재편되었습니다. 특히 젊은 여성층을 중심으로 프리미엄 습식 사료와 기능성 간식 지출이 폭발적입니다."
            actionPlan="반려견 사료는 철저히 배제하고 참치 원물의 강점이 100% 발휘되는 반려묘 습식(캔/파우치)에 자본을 집중해야 합니다. 숏폼 비디오(Douyin) 중심의 시각적 패키징을 무기로 타오바오/징동의 2030 여성 묘주를 직접 타격하는 D2C 전략을 통해 유통 마진을 철저히 내재화해야 합니다."
            />
            </div>
            </div>
            {/* W07 */}
            <div className={styles.card}>
            <CardHeader title="한국 펫푸드 시장 성장 궤적 🟢 Live API" icon={Flag} term="CAGR 10.7%" desc="2009→2022년 연평균 10.7% 성장. 3가구 중 1곳 반려동물 보유." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={d_w07} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(1)}조`} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="size" name="시장 규모 (억 원)" stroke="var(--color-info)" fill="rgba(59,130,246,0.15)" strokeWidth={3} />
            </AreaChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="Euromonitor, 삼정KPMG 펫 비즈니스 트렌드 보고서, KREI"
            situation="한국은 연평균 두 자릿수(CAGR 10.7%) 성장을 거듭해 2028년 2.5조 원 규모에 달할 전망입니다. 수입 브랜드가 70% 이상을 점유 중이나 세계 최고 수준의 이커머스 침투율(78%) 덕분에 신규 브랜드의 디지털 채널 접근성이 매우 뛰어납니다."
            actionPlan="압도적 원물 소싱 스토리를 바탕으로 '매스 프리미엄(Masstige)' 포지셔닝을 취해 외산 대비 가격 경쟁력을 선점해야 합니다. 오프라인 출혈 경쟁을 배제하고 자사몰 D2C 정기 구독 모델에 마케팅을 집중, 초기 고객 확보 후 영양 컴플라이언스로 방어막을 구축하여 LTV를 극대화하십시오."
            />
            </div>
            </div>
            {/* W08 */}
            <div className={styles.card}>
            <CardHeader title="카테고리별 성장 역학 🟢 Live API" icon={BarChart2} term="반려묘 15.4%" desc="반려묘 사료가 연 15.4%로 가장 가파르게 성장." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w08} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="cat"  tickFormatter={xFmt} />
            <YAxis unit="%" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="cagr" name="연평균 성장률(CAGR %)" fill={PINK} radius={[4, 4, 0, 0]} />
            <Bar dataKey="share" name="현재 시장 비중(%)" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
            </BarChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="Euromonitor, KATI 농식품수출정보, 글로벌 시장조사기관 종합"
            situation="반려묘 습식 시장은 연평균 15% 이상 폭발 성장하며 전체 산업 마진을 견인하고 있습니다. 신장/비뇨기계 질환(CKD) 예방 목적의 수분 공급을 위해 소비자들이 건사료 대비 높은 비용을 기꺼이 지불하는 비탄력적 특성을 가집니다."
            actionPlan="'참치 Full Utilization 모델'의 수익성을 극대화해야 합니다. 고부가가치 적육은 습식 파우치로 제조하고, 수의학 임상 데이터 기반의 메디컬 보조치료식 시장을 독점 선점하십시오. 10년 이상 장기 급여되는 처방식 특성상 가격 경쟁을 회피하는 가장 강력한 Cash-cow가 될 것입니다."
            />
            </div>
            </div>
            {/* W18 */}
            <div className={styles.card}>
            <CardHeader title="글로벌 유통채널 대전환 비교 🟢 Live API" icon={ShoppingCart} term="Omnichannel" desc="한국이 온라인 78%로 글로벌 1위." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={d_w18} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" unit="%" domain={[0, 100]}  tickFormatter={xFmt} />
            <YAxis dataKey="country" type="category" width={80} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="online" name="온라인 비중(%)" fill={PINK} radius={[0, 6, 6, 0]} />
            </BarChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="데일리벳, 유로모니터 세미나 분석"
            situation="한국 펫푸드 시장의 온라인 유통 비중은 78%에 달해 글로벌 시장 내에서 압도적인 1위입니다. 사료 특유의 부피 문제와 한국의 초고도화된 새벽배송 인프라가 결합되며 오프라인 유통 헤게모니가 이커머스로 완전히 이전되었습니다."
            actionPlan="신사업 진출 시 불필요한 오프라인 영업망 구축을 철저히 배제하십시오. 자사 콜드체인 인프라와 '원양 선단 직접 조달 스토리'를 무기로 쿠팡, 네이버 등 버티컬 커머스에 마케팅을 집중하여 중간 마진을 내재화하는 D2C 중심 수익 모델을 구축해야 합니다."
            />
            </div>
            </div>
            {/* W21 */}
            <div className={styles.card}>
            <CardHeader title="프리미엄 가격 전이력 (펫택스) 🟢 Live API" icon={DollarSign} term="Pet Tax" desc="프리미엄 사료가 저가의 4.6배로 판매. 가격 인상 저항 극소." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <ComposedChart data={d_w21} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="grade"  tickFormatter={xFmt} />
            <YAxis yAxisId="left" tickFormatter={(v) => `$${v}`} />
            <YAxis yAxisId="right" orientation="right" unit="%" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="price" name="가격 ($/lb)" fill={PINK} radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="cagr" name="CAGR(%)" stroke="var(--color-success)" strokeWidth={3} />
            </ComposedChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="KATI 2024 반려동물 연관산업 맞춤형 정보조사"
            situation="반려동물을 가족으로 여기는 트렌드는 소비자 가격 민감도를 비탄력적으로 만들어 강력한 '펫택스(가격 전이력)'를 창출합니다. 태국/대만 등 주요 아시아 시장에서 기능성 프리미엄 사료는 저가형 대비 최대 4~10배의 압도적 판가 프리미엄을 보입니다."
            actionPlan="육가공 부산물 위주의 이코노미 시장 진입을 배제하십시오. 참치/연어의 오메가-3 등 수의학적 기능성을 전면에 내세워, 일반 사료 대비 4배 이상 마진을 창출하는 '초프리미엄 습식 라인'으로 직행하는 가치 기반 가격(Value-based Pricing) 전략을 취해야 합니다."
            />
            </div>
            </div>
            {/* W25 */}
            <div className={styles.card}>
            <CardHeader title="한국 온라인 유통 대전환 🟢 Live API" icon={ShoppingCart} term="78% 온라인" desc="14년 만에 온라인 22%→78%. 글로벌 최고 디지털 전환." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={d_w25} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis unit="%" domain={[0, 100]} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="online" name="온라인(%)" stroke={PINK} fill="rgba(244,114,182,0.15)" strokeWidth={3} />
            <Area type="monotone" dataKey="offline" name="오프라인(%)" stroke="#64748b" fill="rgba(100,116,139,0.1)" strokeWidth={2} />
            </AreaChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="데일리벳 및 삼정KPMG 펫 비즈니스 트렌드 보고서"
            situation="한국 온라인 유통 비중이 22%에서 78%로 폭증한 것은 단순한 채널 변화가 아닌 '구독 경제(Subscription Model)'로의 질적 패러다임 전환입니다. 반복 구매가 필수인 사료 특성상 기업은 예측 가능한 연간 반복 수익(ARR)을 확보할 수 있게 되었습니다."
            actionPlan="이커머스 브랜드 전환 장벽(Switching Cost) 구축을 위해 자사 어획 '100% 해양 단백질' 라인업을 구독 상품화해야 합니다. 반려묘 습식을 타깃으로 한 D2C 정기구독 락인(Lock-in) 전략을 통해 고객획득비용(CAC)을 절감하고 기업 엑시트 밸류에이션을 극대화하십시오."
            />
            </div>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
            <div style={{ width:'4px', height:'28px', background:'linear-gradient(180deg, #3b82f6, #3b82f699)', borderRadius:'2px' }} />
            <div>
              <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}>🌍 Part V — ESG 및 순환경제 (Sustainability)</h2>
              <p style={{ margin:0, fontSize:'0.75rem', color:'#64748b' }}>휴머나이제이션 및 대체 단백질 임팩트</p>
            </div>
          </div>
          <div className={styles.grid}>
            {/* W35: Invasive Species ESG Rebranding */}
            <div className={styles.card}>
              <CardHeader title="생태계 교란종의 친환경 펫푸드화 🟢 Live API" icon={Leaf} term="Copi Rebranding" desc="은잉어(Asian carp) 'Copi' 리브랜딩과 프리미엄화" />
              <div className={styles.cardBody}>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <AreaChart data={d_w35} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year"  tickFormatter={xFmt} />
                      <YAxis yAxisId="left" unit="톤" />
                      <YAxis yAxisId="right" orientation="right" unit="%" />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="copi_usage" name="코피(Copi) 펫푸드 조달량" fill="rgba(16,185,129,0.2)" stroke="var(--color-success)" strokeWidth={3} />
                      <Line yAxisId="right" type="monotone" dataKey="esg_premium" name="친환경 마케팅 가산 마진(%)" stroke="#8b5cf6" strokeWidth={3} />
                    </AreaChart>
                  </SafeResponsiveContainer>
                </div>
                <TakeawayBox
                  source="NotebookLM 펫푸드 포렌식 리서치 (1339bce3-e447-40f5-a5f3-51451ffe2128)"
                  situation="[Live 🟢] 미국 생태계를 파괴하던 골칫거리 아시아 잉어가 'Copi'라는 식재료로 리브랜딩되면서, Arch Pet Food 등 탑티어 펫푸드 브랜드에서 최고급 오메가-3 단백질원이자 '생태계 회복'을 상징하는 천연 원료로 각광받고 있습니다."
                  actionPlan="환경 파괴 이슈가 없는 국산/수입 외래 생태계 교란종(예: 배스/블루길/기타 잉어류)의 수매 및 포뮬러 통합(Upcycling)을 기획하여, ESG 투자 펀드의 엄격한 요건을 100% 충족하는 지속가능성 스토리를 밸류업 엑시트 무기로 활용하십시오."
                />
              </div>
            </div>
            {/* W03 */}
            <div className={styles.card}>
            <CardHeader title="글로벌 M2 과점 구도" icon={Target} term="Mars-Nestlé" desc="마즈(23%)+네슬레(20%)가 글로벌의 43%를 과점." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie data={d_w03} cx="50%" cy="50%" outerRadius={110} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
            {d_w03.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="미래에셋증권 글로벌 펫케어 산업 리포트, Bloomberg"
            situation="글로벌 펫푸드 생태계는 마즈(Mars)와 네슬레(Nestlé) 등 거대 자본이 40% 이상을 장악한 과점(Oligopoly) 구도입니다. 이들은 거대한 현금 창출력을 바탕으로 프리미엄 강소 브랜드를 공격적으로 M&A하며 지배력을 더욱 확장하고 있습니다."
            actionPlan="이들과 동일한 육류(소/닭) 시장에서 정면 승부하는 것은 필패 전략입니다. 수산 기업의 절대적 해자(Moat)인 '원양 선단 어획망 및 해양 단백질 수급력'을 독점적 무기로 삼아 '해양 원물 100% 니치 마켓'을 선점, 추후 대형사의 핵심 M&A 타깃으로 엑시트하는 전략이 유효합니다."
            />
            </div>
            </div>
            {/* W27 */}
            <div className={styles.card}>
            <CardHeader title="펫 휴머나이제이션 지표 🟢 Live API" icon={Users} term="Human-grade" desc="북미 양육자 77%가 반려동물을 '가족'으로 인식." />
            <div className={styles.cardBody}>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius={100} data={d_w27_radar}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="지수" dataKey="A" stroke={PINK} fill="rgba(244,114,182,0.2)" fillOpacity={0.6} />
            </RadarChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="APPA 리포트, MSC(해양관리협의회) 연례 보고서"
            situation="북미 양육자 77% 이상이 펫을 가족으로 인식하며 휴먼그레이드 및 Non-GMO 제품 선호도가 급증했습니다. 나아가 윤리적 가치 소비가 확산되며 MSC 지속가능어업 인증을 받은 펫푸드가 전년 대비 29.3% 고성장하는 등 프리미엄 기준이 ESG로 고도화되었습니다."
            actionPlan="제품 전면에 원료 포획 해역, 선박명, 일자를 QR코드로 제공하는 '극단적 이력 추적성(Traceability)' 브랜딩을 도입하십시오. 자사 선단의 MSC 인증을 무기로 '인간의 식탁에 오르는 가장 윤리적인 참치' 프레임을 선점해 까다로운 선진국 수출 시장을 공략해야 합니다."
            />
            </div>
            </div>
            {/* W30 */}
            
          <div className={styles.card}>
            <CardHeader title="생선 기반 펫푸드 — 최종 결론 🟢 Live API" icon={Bone} term="118억$ (2036E)" desc="수산물 비중 1.8% + 원가 최저 + 성장률 최고 = 미개척 블루오션." />
            <div className={styles.cardBody}>
            <div className={styles.kpiRow}>
            <KpiCard label="시장 규모 (2036E)" value="118" unit="억$" />
            <KpiCard label="수산물 비중" value="1.8" unit="%" />
            <KpiCard label="MSC 성장률" value="29.3" unit="%" />
            <KpiCard label="어분 원가" value="$0.48" unit="/kg" />
            </div>
            <div className={styles.chartContainer}>
            <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={d_w30} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year"  tickFormatter={xFmt} />
            <YAxis tickFormatter={(v) => `$${v}B`} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="size" name="Fish-based 시장 (억$)" stroke={PINK} fill="rgba(244,114,182,0.2)" strokeWidth={3} />
            </AreaChart>
            </SafeResponsiveContainer>
            </div>
            <TakeawayBox
            source="Future Market Insights, Mordor Intelligence 글로벌 보고서"
            situation="반려동물 육류 알러지 증가와 신장/관절 건강 중시 기조로 생선 기반(Fish-Based) 펫푸드 시장은 연 6.7% 초고속 성장하여 2036년 118억 달러(약 16조 원)에 도달할 거대 블루오션으로 평가받습니다."
            actionPlan="'버려지던 잉여 가치의 금맥화'를 실현하십시오. 통조림용 백육 가공 후 버려지던 적육(Blood meat)을 주원료로, 폐기되던 자숙액·뼈를 기능성 펩타이드로 100% 업사이클링하는 'Full Utilization' 모델을 도입하여 원가를 0에 수렴시키는 궁극의 수익률 퀀텀점프 모델을 완성하십시오."
            />
            </div>
            </div>
<div className={styles.card}>
                <CardHeader title={d_kfas_w03.title} icon={Leaf} term="BSF 5%→98%" desc="BSF 탈지분 5% 대체 시 성장률 98%, 면역 +18%" />
                <div className={styles.cardBody}>
                  <div className={styles.chartContainer}>
                    <SafeResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={d_kfas_w03.data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="group" tick={{fill: '#94a3b8', fontSize: 9}} angle={-20} textAnchor="end" height={60}  tickFormatter={xFmt} />
                        <YAxis yAxisId="left" tick={{fill: '#94a3b8'}} />
                        <YAxis yAxisId="right" orientation="right" tick={{fill: '#94a3b8'}} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="성장률(%)" name="성장률(%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="left" dataKey="사료효율(%)" name="사료효율(%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="면역지표(Lysozyme)" name="면역지표(Lysozyme)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                      </ComposedChart>
                    </SafeResponsiveContainer>
                  </div>
                  <TakeawayBox
                    source={d_kfas_w03.source}
                    situation={d_kfas_w03.sit}
                    actionPlan={d_kfas_w03.strat}
                  />
                </div>
              </div>
<div className={styles.card}>
              <CardHeader title="참치 바이캐치 구조 해부 (대서양 vs 인도양)" icon={Anchor} term="FAD 88%" desc="FAD 세트가 전체 혼획의 88% 이상을 유발." />
              <div className={styles.cardBody}>
                <div className={styles.kpiRow}>
                  <KpiCard label="FAD 혼획 비율" value="88" unit="%+" />
                  <KpiCard label="대서양 비목적어" value="6.46" unit="t/KT" />
                  <KpiCard label="인도양 비목적어" value="2.87" unit="t/KT" />
                  <KpiCard label="실크샤크 생존율" value="14.4" unit="%" />
                </div>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={d_nw01_bycatch} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis dataKey="region" tick={{fill: '#94a3b8'}}  tickFormatter={xFmt} />
                      <YAxis unit="%" tick={{fill: '#94a3b8'}} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="smallTuna" name="소형 참치(%)" fill="var(--color-info)" radius={[4, 4, 0, 0]} stackId="a" />
                      <Bar dataKey="otherFish" name="기타 어류(%)" fill="var(--color-success)" radius={[0, 0, 0, 0]} stackId="a" />
                      <Bar dataKey="sharks" name="상어류(%)" fill="var(--color-danger)" radius={[0, 0, 0, 0]} stackId="a" />
                      <Bar dataKey="billfish" name="새치류(%)" fill="var(--color-warning)" radius={[0, 0, 4, 4]} stackId="a" />
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>
                <TakeawayBox
                  source="ICCAT/IOTC 바이캐치 비교 연구, Global comparison of purse seine bycatch, Bycatch trend and fate 2025"
                  situation="FAD(집어장치) 세트가 전체 혼획의 88%를 유발하며, 자유 군집 대비 5배의 비목적 어종을 포획합니다. 이 중 소형 참치(69.4%)와 기타 어류(19%)는 RFMO Full Retention 정책에 의해 폐기가 금지되어 항구에 강제 양륙됩니다. 이는 연간 수만 톤의 저상업가치 단백질이 펫푸드 원료로 전환 가능한 '제도적 공급 파이프라인'이 이미 확립되어 있음을 의미합니다."
                  actionPlan="아비장, 세이셸 등 주요 양륙항의 Faux-Poisson(혼획 양륙물) 구매 네트워크를 선제적으로 구축하십시오. 연 21,000톤 이상의 저가 단백질을 원가 0에 수렴하는 가격으로 확보할 수 있으며, 이를 어분/펩타이드로 전환 시 원가 우위가 극대화됩니다."
                />
              </div>
            </div>
<div className={styles.card}>
              <CardHeader title="전자감시(EMS) 컴플라이언스 스코어카드" icon={Eye} term="EMS 100%" desc="ICCAT 100% 옵저버 의무. 인간 옵저버 상어 미탐지 50~81%." />
              <div className={styles.cardBody}>
                <div className={styles.kpiRow}>
                  <KpiCard label="EMS 위치정확도" value="100" unit="%" />
                  <KpiCard label="인간 상어탐지" value="19~50" unit="%" />
                  <KpiCard label="커버리지 의무" value="100" unit="%" />
                </div>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius={100} data={d_nw04_radar}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="달성률(%)" dataKey="A" stroke="var(--color-danger)" fill="rgba(239,68,68,0.2)" fillOpacity={0.6} />
                    </RadarChart>
                  </SafeResponsiveContainer>
                </div>
                <TakeawayBox
                  source="ICCAT EMS 최소 기준 권고, Undetected silky sharks in the wellboat (2024)"
                  situation="인간 옵저버는 고속 브레일링 과정(1회 4~6톤)에서 상어 바이캐치를 50~81% 미탐지합니다. 이로 인해 멸종위기종(ETP)이 선별 없이 냉동실에 혼입되어, 펫푸드 원료에 미식별 상어육이 포함될 리스크가 존재합니다. 반면 EMS는 위치/일시를 100% 정확하게 기록합니다."
                  actionPlan="펫푸드 원료 조달 시 100% EMS 탑재 선단에서만 구매하는 '디지털 트레이서빌리티 정책'을 수립하십시오. 이는 ESG 리스크 방어인 동시에, 'Zero-Shark 클린 라벨'로 전환하여 프리미엄 마켓의 신뢰를 확보하는 공격적 브랜딩 전략입니다."
                />
              </div>
            </div>
<div className={styles.card}>
              <CardHeader title="Full Retention 양륙 → 펫푸드 원료 파이프라인" icon={FileCheck} term="양륙 78%" desc="대서양 바이캐치 78% 보존/양륙. 폐기율 1.47%." />
              <div className={styles.cardBody}>
                <div className={styles.kpiRow}>
                  <KpiCard label="아비장 양륙" value="21,582" unit="톤/년" />
                  <KpiCard label="소형참치 비중" value="86.9" unit="%" />
                  <KpiCard label="대서양 폐기율" value="1.47" unit="%" />
                  <KpiCard label="인도양 폐기율" value="0.97" unit="%" />
                </div>
                <div className={styles.chartContainer}>
                  <SafeResponsiveContainer width="100%" height="100%">
                    <BarChart data={d_nw05_abidjan} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis dataKey="category" tick={{fill: '#94a3b8', fontSize: 11}}  tickFormatter={xFmt} />
                      <YAxis tickFormatter={(v) => `${(v/1000).toFixed(1)}K`} tick={{fill: '#94a3b8'}} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="volume" name="양륙량 (톤)" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                        {d_nw05_abidjan?.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </SafeResponsiveContainer>
                </div>
                <TakeawayBox
                  source="Utilization and Trade of Faux Poisson landed in Abidjan, Bycatch trend and fate of Spanish purse seiners 2025"
                  situation="RFMO Full Retention 정책으로 폐기율이 1~1.5%로 극소화되면서, 연간 수만 톤의 비목적 어종이 항구에 의무 양륙됩니다. 아비장 단일 항구에서만 21,582톤이 처리되며, 이 중 86.9%가 상업적 활용이 제한된 소형 참치입니다. 대서양 보존율 90% 이상, 인도양 50% 이상이 Full Retention으로 양륙됩니다."
                  actionPlan="아비장, 빅토리아(세이셸), 포트루이스(모리셔스) 등 주요 양륙 허브에서 Faux-Poisson 독점 구매 계약을 체결하십시오. 경쟁사가 인지하지 못한 '규제 파생 원료'를 선점하면, 톤당 수백 달러 수준의 초저가 수산 단백질을 안정적으로 확보하여 원가 경쟁력의 구조적 해자를 구축할 수 있습니다."
                />
              </div>
            </div>
</div>
        </div>

        {/* ═══ Part VII — KFAS 학술 연구 기반 R&D 인텔리전스 ═══ */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
            <div style={{ width:'4px', height:'28px', background:'linear-gradient(180deg,#06b6d4,#06b6d499)', borderRadius:'2px' }} />
            <div>
              <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}>🔬 Part VII — KFAS 학술 연구 기반 R&D 인텔리전스</h2>
              <p style={{ margin:0, fontSize:'0.75rem', color:'#64748b' }}>국립수산과학원(NIFS) 논문 5건 기반 고정밀 포렌식 데이터 — Reliability 100</p>
            </div>
          </div>
          <div className={styles.grid}>
            {/* 참치 부산물 영양·안전성 */}
            {d_kfas_w01 && (
              <div className={styles.card} style={{ gridColumn: 'span 2' }}>
                <CardHeader title={d_kfas_w01.title} icon={Recycle} term="부산물 59.5%" desc="참치 3.5kg 가공 시 약 59.5%가 부산물 — 혈합육 단백질 26.75 g/100g" />
                <div className={styles.cardBody}>
                  <div className={styles.kpiRow}>
                    <KpiCard label="부산물 발생률" value="59.5" unit="%" />
                    <KpiCard label="혈합육 단백질" value="26.75" unit="g/100g" />
                    <KpiCard label="EAA비율(FAO기준40%↑)" value="42.3" unit="%" />
                    <KpiCard label="신뢰도" value="100" unit="/100" />
                  </div>
                  <div className={styles.chartContainer}>
                    <SafeResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={d_kfas_w01.data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="part" tick={{fill: '#94a3b8', fontSize: 11}}  tickFormatter={xFmt} />
                        <YAxis yAxisId="left" tick={{fill: '#94a3b8'}} />
                        <YAxis yAxisId="right" orientation="right" unit="%" domain={[35, 45]} tick={{fill: '#94a3b8'}} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="단백질(g/100g)" name="단백질 (g/100g)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="left" dataKey="조지방(g/100g)" name="조지방 (g/100g)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="EAA비율(%)" name="필수아미노산 비율(%)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                      </ComposedChart>
                    </SafeResponsiveContainer>
                  </div>
                  {/* Safety Table */}
                  <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} /> 부산물 위생안전성 검사 결과
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                      {d_kfas_w01.safety?.map((s: any, i: number) => (
                        <div key={i} style={{
                          padding: '0.6rem',
                          background: s.적합 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                          borderRadius: '8px',
                          border: `1px solid ${s.적합 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          fontSize: '0.75rem'
                        }}>
                          <div style={{ fontWeight: 700, color: s.적합 ? '#10b981' : '#ef4444', marginBottom: '4px' }}>
                            {s.적합 ? '✅' : '⚠️'} {s.항목}
                          </div>
                          <div style={{ color: '#94a3b8' }}>측정: {s.자숙혼합}</div>
                          <div style={{ color: '#64748b' }}>기준: {s.기준치}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <TakeawayBox
                    source={d_kfas_w01.source}
                    situation={d_kfas_w01.sit}
                    actionPlan={d_kfas_w01.strat}
                  />
                </div>
              </div>
            )}

            {/* 황다랑어 알 효소가수분해물 */}
            {/* d_kfas_w02 — placeholder */}

            {/* 곤충단백질 어분 대체 */}
            {/* d_kfas_w03 — placeholder */}

            {/* 미세조류 단백질 추출 */}
            {/* d_kfas_w04 — placeholder */}

            {/* 가자미 5종 EPA/DHA 프로파일 */}
            {/* d_kfas_w05 — placeholder */}
          </div>
        </div>

        {/* ═══ Part VI — 공급망 리스크 인텔리전스 ═══ */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.8rem' }}>
            <div style={{ width:'4px', height:'28px', background:'linear-gradient(180deg,#ef4444,#f9731699)', borderRadius:'2px' }} />
            <div>
              <h2 style={{ margin:0, fontSize:'1.15rem', fontWeight:700, color:'#f8fafc' }}>⚠️ Part VI — 공급망 리스크 인텔리전스 (Supply Chain Risk)</h2>
              <p style={{ margin:0, fontSize:'0.75rem', color:'#64748b' }}>ICCAT · IOTC · FAO · Science 48개 학술 논문 기반 원물 조달 리스크</p>
            </div>
          </div>
          <div className={styles.grid}>

            {/* NW-1: 바이캐치 구조 해부 */}
            

            {/* NW-2: RFMO 쿼터 축소 시뮬레이터 */}
            

            {/* NW-3: 기후변화 바이오매스 이동 */}
            

            {/* NW-4: EMS 컴플라이언스 스코어카드 */}
            

            {/* NW-5: Full Retention 파이프라인 */}
            

            {/* NW-6: US MMPA 비관세 장벽 */}
            

          </div>
        </div>
      </div>
    </div>
  );
}
