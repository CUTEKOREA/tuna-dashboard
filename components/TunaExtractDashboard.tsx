'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Droplets, TrendingUp, AlertTriangle, Lightbulb, 
  Globe, FlaskConical, Target, ShieldCheck, PieChart as PieChartIcon, CheckCircle2,
  BookOpen, ChevronUp, ChevronDown, MessageSquare, Fish
} from 'lucide-react';
import styles from './TunaExtractDashboard.module.css';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';
import TunaEsgRiskRadar from './TunaEsgRiskRadar';
import TunaPngHubStrategy from './TunaPngHubStrategy';
import TunaGlobalHalalStrategy from './TunaGlobalHalalStrategy';
import TunaBioUpcyclingGap from './TunaBioUpcyclingGap';
import TunaPeptideEfficacy from './TunaPeptideEfficacy';
import TunaTacMonitor from './TunaTacMonitor';
import TunaSdgCircular from './TunaSdgCircular';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color, margin: '0.25rem 0', fontSize: '0.8rem' }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* A-02: TelemetryBadge — 위젯별 데이터 상태 표시 */
const TelemetryBadge = ({ status, syncDate }: { status: 'LIVE' | 'SYNCED' | 'STATIC'; syncDate?: string }) => {
  const cls = status === 'LIVE' ? styles.telemetryLive : status === 'SYNCED' ? styles.telemetrySynced : styles.telemetryStatic;
  return (
    <span className={cls}>
      {status === 'LIVE' ? '🟢' : status === 'SYNCED' ? '🔵' : '⚪'} {status}
      {syncDate && <span style={{ marginLeft: '0.2rem', opacity: 0.7 }}>({syncDate})</span>}
    </span>
  );
};

// Main Component
export default function TunaExtractDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEduOpen, setIsEduOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/tuna-extract');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch tuna extract data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Droplets size={48} className={styles.rotateIcon} color="#22d3ee" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>참치액젓 인텔리전스</h1>
          <p className={styles.subtitle}>간장 대체 시장 리딩 · 부산물 밸류업 전략 커맨드 센터 ({new Date().toLocaleDateString()})</p>
        </div>
        <div className={styles.lastUpdated}>
          <CheckCircle2 size={16} color="#22d3ee" />
          <TelemetryBadge status="SYNCED" syncDate="2025-Q4" />
        </div>
      </div>

      {/* Executive Command */}
      <div className={styles.executiveCommand}>
        <h3 className={styles.executiveCommandTitle}>
          <Target size={20} /> 경영진 전략 요약
        </h3>
        <p className={styles.executiveCommandText}>
          참치액젓은 간장 시장의 <b>파괴적 대체재</b>로 부상 중이며, 연 50% 매출 성장률이 이를 증명합니다. 
          참치 통조림 가공 부산물(자숙액)을 활용한 <b>원가 '0' 밸류업 전략</b>으로 그룹 내 수산 수직계열화를 극대화해야 합니다. 
          해외 시장(일본 한인마트, K-Food)과 연계한 수출 확대가 3~5년 내 실현 가능한 골든 윈도우입니다.
        </p>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiRow} style={{ marginBottom: '2rem' }}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{data.kpis.market_size.title}</div>
          <div className={styles.kpiValue}>
            {data.kpis.market_size.value} <span className={styles.kpiUnit}>억 원</span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{data.kpis.substitution_rate.title}</div>
          <div className={styles.kpiValue}>
            {data.kpis.substitution_rate.value} <span className={styles.kpiUnit}>%</span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{data.kpis.dongwon_growth.title}</div>
          <div className={styles.kpiValue}>
            {data.kpis.dongwon_growth.value} <span className={styles.kpiUnit}>% YoY</span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>{data.kpis.export_gap.title}</div>
          <div className={styles.kpiValue}>
            ${data.kpis.export_gap.value} <span className={styles.kpiUnit}>/kg</span>
          </div>
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
            background: isEduOpen ? 'rgba(34, 211, 238, 0.08)' : 'transparent',
            transition: 'background 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: 'rgba(34, 211, 238, 0.2)', padding: '0.5rem', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BookOpen size={20} color="#22d3ee" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                신입사원 가이드 및 AI 전략 어시스턴트
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                참치액젓 시장 진입 전략 및 핵심 역학 가이드
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
                  <Fish size={16} color="#22d3ee" /> 참치액젓 시장 핵심 역학
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.8 }}>
                  <li><strong>대체재 부상:</strong> 전통적인 간장 시장을 잠식하며 파괴적 대체재로 급부상 중.</li>
                  <li><strong>원가 '0' 밸류업:</strong> 참치 통조림 가공 시 발생하는 폐기물(<TermTooltip term="자숙액" description="참치 통조림(캔) 가공 시 참치를 끓이는 과정에서 발생하는 부산물 액체(Cooking Drip). 기존에는 폐수 처리 대상이었으나, 발효·숙성 공정을 거쳐 참치액젓으로 전환 가능." />)을 활용한 압도적 마진 구조.</li>
                  <li><strong>글로벌 확장:</strong> K-Food 열풍과 함께 일본, 대만 등 한인마트를 중심으로 침투율 상승.</li>
                  <li><strong><TermTooltip term="히스타민" description="아미노산(히스티딘)이 세균에 의해 분해되면서 생성되는 유해 물질. 발효 수산물에서 주로 발생하며, EU(200mg/kg), FDA(50ppm) 등 각국이 엄격한 허용 기준을 설정." /> 규제 리스크:</strong> EU 등 선진국 수출을 위한 발효/숙성 과정의 규제 통제가 핵심 선결 과제.</li>
                </ul>
              </div>

              {/* Right: NotebookLM Chatbot */}
              <div style={{ background: 'var(--surface-3)', borderRadius: '10px', padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '50px', height: '50px', background: 'var(--surface-3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <MessageSquare size={24} color="#22d3ee" />
                </div>
                <h3 style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                  참치액젓 전략 어시스턴트
                </h3>
                <a 
                  href="https://notebooklm.google.com/notebook/eea443b6-c221-411f-84d9-8ca48afdd1fd"
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
                    border: '1px solid #334155'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#334155'; }}
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

      {/* Part I: Market Structure */}
      <h3 className={styles.sectionHeader}>부문 I. 시장 구조</h3>
      <div className={styles.grid}>
        {/* W01 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><TrendingUp size={18} className={styles.cardIcon} color="#22d3ee"/> 간장 제국의 붕괴: 카니발리제이션 역설</h3>
            <TelemetryBadge status="SYNCED" syncDate="2025" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <ComposedChart data={data.d_w01}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="tunaExtract" name="참치액 시장 (억원)" fill="var(--color-info)" />
                <Line yAxisId="left" type="monotone" dataKey="soySales" name="간장 소매 매출 (억원)" stroke="#64748b" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="tunaGrowthPct" name="참치액 YoY 성장률(%)" stroke="var(--color-success)" strokeWidth={2} />
              </ComposedChart>
            </SafeResponsiveContainer>
            <TakeawayBox 
              situation="aT FIS 소매 POS 데이터 및 닐슨아이큐코리아 데이터에 따르면, 전통 간장 매출이 2020년 2,450억 원에서 2025E 1,600억 원으로 하락하는 속도와 정확히 비례하여, 참치액 시장이 급성장(2025E 720억 원 육박)하며 간장 시장을 직접적으로 침식(Cannibalization)하고 있습니다." 
              actionPlan="1) '단순 보조 조미료'가 아닌 '전통 간장의 대체재'로서 포지셔닝하여 유통사 매대 장악력을 극대화해야 합니다. 2) 간장 주 수요층(5060세대)을 흡수하기 위한 프리미엄 저염/무첨가 참치액 라인업을 강화해야 합니다." 
              source="마켓링크/aT FIS (2024~2025 간장 매출 감소분 교차분석) / 닐슨아이큐코리아(NIQ)" 
            />
          </div>
        </div>

        {/* W02 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><PieChartIcon size={18} className={styles.cardIcon} color="#22d3ee"/> 원조의 몰락과 자본의 승리 (2025 점유율 역전)</h3>
            <TelemetryBadge status="SYNCED" syncDate="2025" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <PieChart>
                <Pie data={data.d_w02} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({name, percent}: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.d_w02.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </SafeResponsiveContainer>
            <TakeawayBox 
              situation="2025~2026년 닐슨아이큐코리아 기준, 동원F&B가 압도적인 유통망과 공격적 PPL을 바탕으로 누적 750만 병을 판매하며 원조 브랜드인 한라식품(24%)을 꺾고 시장 1위(35%)를 차지했습니다." 
              actionPlan="1) 액상 조미료 시장의 본질이 '장인정신'에서 '대기업 자본/유통망' 싸움으로 완전히 전환되었음을 인지하고, 압도적 마케팅/판촉 투자가 필수적입니다. 2) 사조대림(20%)의 추격을 뿌리치기 위해 대형마트 PB OEM 생산 물량을 선점해야 합니다." 
              source="2025-2026 닐슨아이큐코리아(NIQ) 소매점 데이터 / 시장 점유율 재편성 리포트" 
            />
          </div>
        </div>
      </div>

      {/* Part II: Raw Material & Processing */}
      <h3 className={styles.sectionHeaderAlt}>부문 II. 원료·가공</h3>
      <div className={styles.grid}>
        {/* W03 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><Droplets size={18} className={styles.cardIcon} color="#3b82f6"/> 제로 코스트의 마법: 자숙액 부가가치</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <BarChart data={data.d_w03} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis dataKey="stage" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="부가가치 ($/kg)" fill="var(--color-info)" />
                <Bar dataKey="cost" name="가공비용 ($/kg)" fill="var(--color-danger)" />
              </BarChart>
            </SafeResponsiveContainer>
            <TakeawayBox 
              situation="태평양 가다랑어(Skipjack) 가격이 톤당 1,500달러 선에서 정체 중이나, 참치액은 참치캔 가공 후 버려지던 '제로 코스트(Zero-Cost)' 자숙액을 100% 재활용하므로 원재료 압박에서 완전히 해방된 초고수익 모델입니다. 폐기물($0.05/kg)이 완제품($4.8/kg)으로 96배 밸류업을 이룹니다." 
              actionPlan="1) 통조림 공장의 자숙액 폐수 처리 비용을 '매출 원천'으로 전환하는 극단적 ESG 순환 경제 모델을 전면에 내세워야 합니다. 2) '프리미엄 기능성 소스'($12.5/kg)로의 고도화를 위한 효소 가수분해(Protease) 투자를 최우선 집행하십시오." 
              source="INFOFISH 참치 시황 / 내부 원가 모델링 (Silla Co. R&D 2025)" 
            />
          </div>
        </div>

        {/* W04 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><TrendingUp size={18} className={styles.cardIcon} color="#3b82f6"/> 원물 가격 정체 vs 자숙액 초고마진 디커플링</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <ComposedChart data={data.d_w04}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="type" stroke="#94a3b8" fontSize={12}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-info)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="rawCost" name="원료 단가 (원)" fill="#64748b" />
                <Bar yAxisId="left" dataKey="retailPrice" name="소매 단가 (원)" fill="var(--color-success)" />
                <Line yAxisId="right" type="monotone" dataKey="margin" name="영업이익률 (%)" stroke="var(--color-info)" strokeWidth={3} />
              </ComposedChart>
            </SafeResponsiveContainer>
            <TakeawayBox 
              situation="어획량과 기후에 따라 원료 수급이 불안정한 멸치(마진율 18.2%), 까나리(12.8%) 액젓과 달리, 참치액은 참치캔 공장의 잉여 부산물을 100% 활용해 영업이익률 32.5%를 견고하게 유지합니다. 원물 가격 상승의 리스크가 제거된 압도적 마진 디커플링(Decoupling) 현상입니다." 
              actionPlan="1) 32.5%의 마진 룸(Margin Room)을 무기로 대형마트 1+1 기획전이나 엔드 매대 프로모션 등 가격 경쟁력을 투입하여 경쟁 액젓 제품을 압살(Crowding-out)해야 합니다. 2) 멸치액젓 시장 수요층을 참치액으로 강제 이주시키는 공격적 샘플링을 집행하십시오." 
              source="aT 가공식품 원가 구조 분석 모델 재해석 (2025)" 
            />
          </div>
        </div>
      </div>

      {/* Part III: Export & Regulation */}
      <h3 className={styles.sectionHeaderWarn}>부문 III. 수출·규제</h3>
      <div className={styles.grid}>
        {/* W05 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><Globe size={18} className={styles.cardIcon} color="#f59e0b"/> 주요국 참치액 유통 침투율</h3>
            <TelemetryBadge status="SYNCED" syncDate="2024" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <BarChart data={data.d_w05}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="country" stroke="#94a3b8" fontSize={12}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="penetration" name="유통 침투율 (%)" fill="var(--color-warning)" />
                <Bar dataKey="growth" name="전년비 성장률 (%)" fill="var(--color-success)" />
              </BarChart>
            </SafeResponsiveContainer>
            <TakeawayBox 
              situation="aT 해외시장 동향 보고서(2024-2025)에 따르면, K-Food 열풍에 힘입어 일본 한인마트의 참치액 유통 침투율이 42%에 달하며, 특히 대만(+65% YoY)과 태국(+72% YoY)에서 폭발적 성장세를 보이고 있습니다. 이는 해외 소비자들이 참치액을 '간장의 업그레이드 버전'이 아닌 '한국 고유의 감칠맛(Umami) 소스'로 새롭게 인식하기 시작했음을 시사합니다." 
              actionPlan="1) 일본 시장(침투율 42%)은 이미 성숙기 진입 — '프리미엄 라인(저염/유기농)' 업셀링으로 ARPU를 높여야 합니다. 2) 대만·태국은 초기 성장기(침투율 5~18%) — K-Food 수출 확대와 연계한 공격적 마케팅(한류 셰프 콜라보)이 효과적입니다. 3) 히스타민 규제 클리어 시 EU/미국 진출이 가능한 3~5년 내 '수출전용 라인' 설계가 필요합니다." 
              source="aT 해외시장 동향 보고서(2024) / KITA 수출통계 / 내부 해외영업팀 현지 조사 — 침투율 수치는 자체 조사 추정치" 
            />
          </div>
        </div>

        {/* W06 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><ShieldCheck size={18} className={styles.cardIcon} color="#f59e0b"/> <TermTooltip term="히스타민" description="아미노산(히스티딘)이 세균에 의해 분해되면서 생성되는 유해 물질. EU Regulation 2073/2005에서 발효 수산물의 허용 기준을 200mg/kg으로 규정하며, FDA는 50ppm으로 더 엄격하게 관리." /> 규제 리스크 맵</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.d_w06}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="axis" stroke="#94a3b8" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" />
                <Radar name="한국산 리스크 수준" dataKey="KR" stroke="var(--color-danger)" fill="var(--color-danger)" fillOpacity={0.3} />
                <Radar name="EU 허용 기준치 충족도" dataKey="EU" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.3} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RadarChart>
            </SafeResponsiveContainer>
            <TakeawayBox 
              situation="EU Regulation 2073/2005에 따르면 발효 수산물의 히스타민 허용 기준은 200mg/kg(안전 한도 400mg/kg)으로, 한국산 참치액젓은 발효·숙성 과정에서 히스타민 생성을 억제하는 공정 관리(HACCP)가 부족하여 EU 허용 기준 충족도가 55%에 불과합니다. CODEX 국제 기준(400ppm)과 FDA 기준(50ppm)도 각각 90%, 60% 수준으로, 수출 시장별로 차별화된 품질 관리 전략이 요구됩니다." 
              actionPlan="1) EU 수출을 위해 HACCP 기반 히스타민 제어 공정(냉장 발효 + 온도 모니터링) 구축이 최우선 과제입니다. 2) FDA 기준(50ppm)이 가장 엄격하므로, 미국 시장 진출 시 별도의 '수출전용 저히스타민 라인' 신설이 필요합니다. 3) 일본(MHLW 200ppm)은 현재 수준으로 대응 가능하나, 지속적 모니터링 체계가 요구됩니다." 
              source="EU Regulation (EC) No 2073/2005 / CODEX STAN 302 / FDA CPG 7108.240 / 식약처 식품공전" 
            />
          </div>
        </div>
      </div>

      {/* Part IV: Consumer & Trend */}
      <h3 className={styles.sectionHeaderDanger}>부문 IV. 소비자·트렌드</h3>
      <div className={styles.grid}>
        {/* W07 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><Target size={18} className={styles.cardIcon} color="#ef4444"/> 간장 대체 제품 소비자 선호도</h3>
            <TelemetryBadge status="SYNCED" syncDate="2021" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <BarChart data={data.d_w07} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis dataKey="product" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="current" name="현재 사용 (%)" fill="var(--color-danger)" stackId="a" />
                <Bar dataKey="potential" name="향후 사용 의향 (%)" fill="#fca5a5" stackId="a" />
              </BarChart>
            </SafeResponsiveContainer>
            <TakeawayBox 
              situation="aT 가공식품 세분시장 현황(간장, 2021) 소비자 조사에 따르면, '간장 대체 조미료'로서 참치액/참치액젓의 현재 사용률이 24.4%로 1위를 기록했으며, 향후 사용 의향(53.5%)도 식물성 '연두'(51.2%)를 앞서 가장 높은 잠재 수요를 보유하고 있습니다. 전통적 멸치액젓(18.7%)과의 격차도 벌어지는 추세로, 소비자 인식의 구조적 전환이 가시화되고 있습니다." 
              actionPlan="1) '향후 사용 의향 53.5%'의 잠재 수요를 실제 구매로 전환하기 위해, 대형마트 시식 이벤트 및 HMR 밀키트 동봉 전략이 가장 효과적입니다. 2) 경쟁 제품 '연두'(식물성)와의 차별점은 '동물성 감칠맛(Umami)'이므로, 요리 레시피 콘텐츠 마케팅에서 '깊은 맛'을 핵심 메시지로 소구해야 합니다." 
              source="aT(농수산식품유통공사) '가공식품 세분시장 현황 — 간장(2021)' 소비자 사용 패턴 조사" 
            />
          </div>
        </div>

        {/* W08 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><PieChartIcon size={18} className={styles.cardIcon} color="#ef4444"/> 참치액 활용 카테고리 확장 추이</h3>
            <TelemetryBadge status="SYNCED" syncDate="2024E" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <AreaChart data={data.d_w08}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="powder" name="분말/코인육수" stackId="1" stroke="#f472b6" fill="#f472b6" />
                <Area type="monotone" dataKey="hmr" name="HMR/밀키트 동봉" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                <Area type="monotone" dataKey="stew" name="찌개/국/볶음" stackId="1" stroke="var(--color-warning)" fill="var(--color-warning)" />
                <Area type="monotone" dataKey="traditional" name="무침/조림(전통)" stackId="1" stroke="var(--color-info)" fill="var(--color-info)" />
              </AreaChart>
            </SafeResponsiveContainer>
            <TakeawayBox 
              situation="참치액의 용도가 전통적인 '무침/조림'(2018년 65%)에서 '찌개/국/볶음'(2024E 32%), 'HMR/밀키트 동봉'(2024E 30%), 그리고 신규 '분말/코인육수'(2024E 25%)로 급속히 다변화되고 있습니다. 특히 코인 육수 시장은 +20% YoY 성장하며 참치액 분말화(Spray Drying)가 새로운 형태 혁신(Form Factor Innovation)으로 부상 중입니다. 냉동 컨테이너를 건화물로 전환 시 물류비 50% 이상 절감이 가능하여, 수출 경쟁력의 게임체인저입니다." 
              actionPlan="1) HMR/밀키트 소스 패킷 B2B 납품은 안정적 캐시카우 — CJ·풀무원 등 HMR 선두업체 대상 소스 패킷 OEM 제안이 최우선입니다. 2) '분말/코인육수' 카테고리의 +20% YoY 성장에 대응하여, 베트남 현지 분무건조(Spray Drying) 파일럿 라인 가동을 검토해야 합니다. TN 지수 1.5% 이상 고농축 스펙으로 기존 대기업 대비 프리미엄 포지셔닝이 가능합니다." 
              source="aT 가공식품 세분시장 현황(2021) / 식품산업통계정보 HMR 시장 동향 / 코인 육수 시장 동향(2024) — 분말 비율은 트렌드 추정치" 
            />
          </div>
        </div>
      </div>

      {/* Part V: R&D & Science */}
      <h3 className={styles.sectionHeaderViolet}>부문 V. 연구개발·기능성</h3>
      <div className={styles.grid}>
        <TunaBioUpcyclingGap />
        <TunaPeptideEfficacy />
        {/* W09 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><FlaskConical size={18} className={styles.cardIcon} color="#8b5cf6"/> 부산물 기능성 연구 파이프라인</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <ComposedChart data={data.d_w09} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" domain={[0, 100]}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis dataKey="research" type="category" stroke="#94a3b8" fontSize={11} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="연구 진척도/가능성" fill="#8b5cf6" barSize={20} />
              </ComposedChart>
            </SafeResponsiveContainer>
            <TakeawayBox 
              situation="2019~2023년 발표된 국내외 학술 논문에 따르면, 참치 자숙액 유래 펩타이드의 항염증 효과(RAW264.7 세포주 실험, 85% 진척도), 항아토피 효과(참치 심장 추출물, 78%), 지방생성 억제(자숙액 펩타이드, 72%), 항산화 펩타이드(양식 사료 응용, 68%) 등 다수의 기능성이 과학적으로 입증되었습니다. 특히 저염화 가수분해물의 기능식품 전환 연구(82%)가 가장 상업화에 근접해 있습니다." 
              actionPlan="1) 가장 진척도가 높은 '저염화 가수분해물 → 기능식품'(82%) 파이프라인을 최우선으로 상업화하여, 건기식 B2B 원료 납품 시장에 진입해야 합니다. 2) '항염증'(85%)과 '항아토피'(78%) 연구는 화장품/더마 원료로의 확장 가능성이 높아, 뷰티 업계와의 공동 R&D를 제안할 수 있습니다." 
              source="참치 가공 부산물 생리활성 평가 논문(2019-2023) — 구체적 DOI: 향후 매칭 필요 / Silla Co. R&D" 
            />
          </div>
        </div>

        {/* W10 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><Lightbulb size={18} className={styles.cardIcon} color="#8b5cf6"/> 규격 및 분류 체계 전략</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <div style={{ height: '280px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left', color: '#94a3b8' }}>카테고리</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', color: '#94a3b8' }}>품목</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', color: '#94a3b8' }}>HS 코드</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left', color: '#94a3b8' }}>기준 규격</th>
                  </tr>
                </thead>
                <tbody>
                  {data.d_w10.map((item: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#e2e8f0' }}>{item.category} &gt; {item.subCategory}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-info)', fontWeight: 600 }}>{item.item}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-warning)' }}>{item.hsCode}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#94a3b8' }}>{item.standard}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '1rem', background: '#0f172a', borderRadius: '8px', marginTop: '1rem', border: '1px dashed #334155' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1' }}>
                  <b>Taxonomy Note:</b> 참치액젓은 법적으로 '젓갈류'에 속하지만 대형마트에서는 '간장/소스' 매대에 진열됩니다. 분류의 모호성이 오히려 카테고리 확장의 무기입니다.
                </p>
              </div>
            </div>
            <TakeawayBox 
              situation="참치액젓은 식품공전상 '젓갈류 > 액젓'(HS 1604.14)으로 분류되지만, 실제 대형마트에서는 '간장/소스' 매대에 진열되어 소비자에게 '만능 조미소스'로 인식됩니다. 이 분류-유통 간 괴리는 오히려 전략적 자산입니다 — '소스류'(HS 2103.90)로도 분류 가능하여 FTA 관세 혜택이 달라지며, '추출가공식품'(HS 1603.00)으로의 재분류 시 건기식/기능성 식품 시장으로의 카테고리 확장이 가능합니다." 
              actionPlan="1) 수출 시 HS Code 선택에 따라 관세율이 달라지므로, 목적국별 최적 HS Code를 전략적으로 선택하는 '관세 엔지니어링'이 필요합니다. 2) 국내 마트 진열 시 '간장/소스' 매대 포지셔닝을 유지하면서, 온라인에서는 '건강 조미료/기능성' 카테고리를 동시 공략하는 듀얼 포지셔닝 전략을 구사해야 합니다." 
              source="식품의약품안전처 식품공전(2024) / 관세청 HS Code 분류 체계 / aT 가공식품 세분시장 현황(2021)" 
            />
          </div>
        </div>
      </div>

      {/* Part VI: Strategy Simulation */}
      <h3 className={styles.sectionHeaderPink}>부문 VI. 전략 시뮬레이션</h3>
      <div className={styles.grid}>
        {/* W11 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><Target size={18} className={styles.cardIcon} color="#f472b6"/> 진입 시나리오 시뮬레이터 (<TermTooltip term="ROIC" description="투하자본이익률. 투입된 자본 대비 영업이익을 나타내는 지표. ROIC가 높을수록 자본 효율성이 뛰어남." /> 기준)</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <ComposedChart data={data.d_w11_stress || data.d_w11}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="scenario" stroke="#94a3b8" fontSize={11}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" fontSize={12} domain={[-10, 50]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="roic_base" name="기본 ROIC (%)" fill="var(--color-info)" />
                <Bar dataKey="roic_stress" name="원물+33% 스트레스 (%)" fill="var(--color-warning)" />
                <Bar dataKey="roic_worst" name="FAD제한+공장중단 (%)" fill="var(--color-danger)" />
              </ComposedChart>
            </SafeResponsiveContainer>
            <TakeawayBox 
              situation="ICCAT/IOTC 쿼터 축소로 2030년까지 수산물 가격이 33% 급등할 전망(FAO)입니다. 원물 가격 +33% 스트레스 시나리오에서 S1(기존 OEM)의 ROIC는 42%→31%, S4(수출 전용)는 22%→12%로 하락합니다. 최악의 경우(FAD 72일 제한 + 공장 가동 2~6주 중단) S4는 ROIC -3%로 적자 전환됩니다. 반면 S3(기능성 특화)는 원물 의존도가 낮아 35%→28%→20%로 가장 높은 회복탄력성(Resilience)을 보입니다." 
              actionPlan="1) Phase 1(1~2년): S1(기존 OEM)으로 즉시 캐시플로우를 확보하되, 원물 가격 33% 상승 시에도 ROIC 31%를 유지하는 원가 구조를 확정해야 합니다. 2) S4(수출 전용)는 최악 시나리오에서 적자 전환 리스크가 있으므로, 히스타민 HACCP + 안전 재고 3개월분 확보를 선결 조건으로 설정해야 합니다. 3) S3(기능성 특화)의 회복탄력성이 가장 높으므로, R&D 투자를 가속화하여 원물 가격 변동에 둔감한 포트폴리오를 구축해야 합니다." 
              source="내부 재무 시뮬레이션 / FAO 수산물 가격 전망(+33%) / IOTC FAD 조업 제한 Macroeconomic Impact Study" 
            />
          </div>
        </div>

        {/* W12 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><TrendingUp size={18} className={styles.cardIcon} color="#f472b6"/> 참치액 vs 펫푸드 부가가치 비교</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <ComposedChart data={data.d_w12} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" xAxisId="bottom" stroke="#94a3b8"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <XAxis type="number" xAxisId="top" orientation="top" stroke="var(--color-success)"  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis dataKey="product" type="category" yAxisId="left" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" xAxisId="bottom" dataKey="valuePerTon" name="톤당 부가가치 ($)" fill="var(--color-info)" />
                <Line yAxisId="left" xAxisId="top" dataKey="marginRate" name="마진율 (%)" stroke="var(--color-success)" strokeWidth={3} />
              </ComposedChart>
            </SafeResponsiveContainer>
            <TakeawayBox 
              situation="참치 통조림 가공 시 발생하는 부산물을 용도별로 비교하면, 참치 심장→기능성 추출물($15,800/톤, 마진 45.2%)이 최고 부가가치이며, 적육→펫푸드($8,500/톤, 23.1%), 자숙액→참치액젓($4,800/톤, 32.5%) 순입니다. 백육→인간식용 캔($6,200/톤, 18.7%)은 기존 주력이나 마진율이 가장 낮아, 부산물 업사이클링이 오히려 더 높은 수익을 창출하는 역전 현상이 발생하고 있습니다." 
              actionPlan="1) '적육→펫푸드' + '자숙액→참치액젓'의 이중 밸류업(Dual Upcycling)을 동시 실행하여, 원물(통조림) 공장의 전사적 마진을 극대화해야 합니다. 2) 최고 부가가치인 '참치 심장→기능성 추출물'($15,800/톤)은 R&D 투자 후 건기식/화장품 B2B 채널로 납품하는 장기 전략으로 설계해야 합니다." 
              source="내부 부산물 원가 분석 모델 / 수산부산물 재활용 동향 리포트(수산과학원) — 톤당 단가는 내부 추산" 
            />
          </div>
        </div>
      </div>

      {/* Part VII: Strategic New Insights */}
      <h3 className={styles.sectionHeaderWarn}>부문 VII. 신규 글로벌 인텔리전스</h3>
      <div className={styles.grid}>
        <TunaPngHubStrategy />
        <TunaGlobalHalalStrategy />
        <TunaEsgRiskRadar />
      </div>

      {/* Part VIII: Supply Chain Risk & ESG */}
      <h3 className={styles.sectionHeaderDanger}>부문 VIII. 공급망 리스크 · 지속가능성</h3>
      <div className={styles.grid}>
        <TunaTacMonitor
          tacData={data.d_tac_monitor}
          forecastData={data.d_tac_price_forecast}
        />
        <TunaSdgCircular
          sdgData={data.d_sdg_circular}
        />
      </div>

      {/* Part IX: KFAS Research Intelligence */}
      <h3 className={styles.sectionHeaderTeal}>부문 IX. 수산발효·부산물 과학 실증 연구</h3>
      <div className={styles.grid}>

        {/* K01: 참치 부산물 안전성 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><ShieldCheck size={18} className={styles.cardIcon} color="#06b6d4"/> 통조림 부산물 위생안전성·영양 평가</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <ComposedChart data={data.d_k01_byproduct_safety}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="항목" stroke="#94a3b8" fontSize={10}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="생부산물" name="생 부산물" fill="var(--color-danger)" />
                <Bar yAxisId="left" dataKey="자숙부산물" name="자숙 부산물" fill="var(--color-success)" />
                <Line yAxisId="left" type="monotone" dataKey="기준치" name="안전 기준치" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="5 5" />
              </ComposedChart>
            </SafeResponsiveContainer>
            <TakeawayBox
              situation="KFAS 연구에서 가다랑어(K. pelamis) 통조림 가공공정의 생·자숙 부산물을 분석한 결과, 자숙 부산물은 히스타민 45mg/kg(기준 200 이하)으로 안전하며, 조단백이 24.8%로 생부산물(18.2%) 대비 36% 높아 고품질 원료로 활용 가능합니다."
              actionPlan="자숙액(참치액젓 원료)의 히스타민이 EU 기준(200mg/kg) 대비 77% 낮은 것은 수출 시 강력한 안전성 마케팅 포인트입니다. '자숙 공정 인증 원료' 라벨을 도입하여 프리미엄 참치액젓의 차별화 근거로 활용하십시오."
              source="KFAS 한국수산과학회지 — 참치(K. pelamis) 통조림 부산물 위생안전성 및 영양학적 품질 특성"
            />
          </div>
        </div>

        {/* K02: 참치 적색육 패티 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><Target size={18} className={styles.cardIcon} color="#06b6d4"/> 적색육+황새치 어육 패티 최적 배합</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <ComposedChart data={data.d_k02_patty_blend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="비율" stroke="#94a3b8" fontSize={10}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="경도" name="겔 경도 (gf)" fill="var(--color-info)" />
                <Line yAxisId="right" type="monotone" dataKey="관능점수" name="관능 평가 (9점)" stroke="var(--color-success)" strokeWidth={2.5} />
              </ComposedChart>
            </SafeResponsiveContainer>
            <TakeawayBox
              situation="KFAS 연구에서 황다랑어 적색육과 황새치 백색육을 혼합하여 어육 패티를 제조한 결과, 참치60:황새치40 비율에서 관능점수 8.1/9.0(최고), 원가 15% 절감을 동시 달성했습니다. 참치 적색육 단독 대비 물성(경도)과 색상 모두 개선됩니다."
              actionPlan="참치 통조림 가공 시 발생하는 적색육(Dark Meat)을 황새치와 6:4로 블렌딩하면, 기존 '폐기물'이 프리미엄 어육 패티로 전환됩니다. 참치액젓과 함께 '제로 웨이스트 듀얼 밸류업' 라인으로 사업화하십시오."
              source="KFAS 한국수산과학회지 — 참치 적색육·황새치 백색육 혼합 비율별 패티 품질 특성"
            />
          </div>
        </div>

        {/* K03: 가쓰오부시 위해요소 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><AlertTriangle size={18} className={styles.cardIcon} color="#06b6d4"/> 시판 가쓰오부시 위해요소 분석</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <BarChart data={data.d_k03_katsuobushi}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="항목" stroke="#94a3b8" fontSize={10}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="국내산" name="국내산" fill="var(--color-warning)" />
                <Bar dataKey="수입산" name="수입산 (일본)" fill="var(--color-info)" />
              </BarChart>
            </SafeResponsiveContainer>
            <TakeawayBox
              situation="KFAS 연구에서 시판 가쓰오부시(참치포)의 미생물·화학적 위해요소를 분석한 결과, 국내산이 수입산 대비 일반세균(4.5 vs 3.8 log), 곰팡이(3.2 vs 2.5 log) 모두 높았습니다. 수분활성도(0.72)가 높아 곰팡이 생성 위험이 상존합니다."
              actionPlan="가쓰오부시는 참치액젓의 '건조형 경쟁 제품'입니다. 국내산 가쓰오부시의 미생물 리스크를 역으로 활용하여, 참치액젓의 '가열 살균 완제품' 안전성 우위를 마케팅에 반영하십시오. '살균 완료 = 안심' 메시지가 핵심입니다."
              source="KFAS 한국수산과학회지 — 시판 가쓰오부시 미생물학적·화학적 위해요소분석 및 안전성 평가"
            />
          </div>
        </div>

        {/* K04: 황다랑어 알 기능성 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><FlaskConical size={18} className={styles.cardIcon} color="#06b6d4"/> 황다랑어 알 효소 가수분해물 생리활성</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <BarChart data={data.d_k04_yft_roe}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="효소" stroke="#94a3b8" fontSize={11}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="DPPH억제율" name="항산화 DPPH억제율(%)" fill="#8b5cf6" />
                <Bar dataKey="ACE억제율" name="항고혈압 ACE억제율(%)" fill="var(--color-success)" />
              </BarChart>
            </SafeResponsiveContainer>
            <TakeawayBox
              situation="KFAS 연구에서 황다랑어 알의 분리단백질을 4종 효소로 가수분해한 결과, Flavourzyme 처리 시 항산화(DPPH 85%), Neutrase 처리 시 항고혈압(ACE 82%) 억제율이 최고였습니다. 참치 알은 통조림 부산물 중 가장 높은 기능성 잠재력을 보유합니다."
              actionPlan="참치 알 가수분해물은 '건강기능식품 원료' 등록 후 B2B 납품이 가능한 고부가 파이프라인입니다. 참치액젓(자숙액)과 참치 알 추출물(기능성)을 동시에 사업화하면, 부산물 업사이클링의 수익 극대화가 가능합니다."
              source="KFAS 한국수산과학회지 — 황다랑어 알 농축분말 효소 가수분해물의 식품기능성 및 생리활성"
            />
          </div>
        </div>

        {/* K05: 속성발효 액젓 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><Droplets size={18} className={styles.cardIcon} color="#06b6d4"/> 속성발효 고순도 멸치액젓 — 발효 혁신</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <ComposedChart data={data.d_k05_rapid_anchovy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="발효일" stroke="#94a3b8" fontSize={11}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="속성발효TN" name="속성발효 TN (%)" stroke="var(--color-success)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="전통TN" name="전통발효 TN (%)" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" />
              </ComposedChart>
            </SafeResponsiveContainer>
            <TakeawayBox
              situation="KFAS 연구에서 염장발효덧(소금물에 숙성된 기존 발효액)을 활용한 속성발효 기술로, 60일 만에 TN(총질소) 1.35%를 달성했습니다. 전통발효(180일, TN 1.45%)의 93% 품질을 1/3 기간에 확보하는 혁신입니다."
              actionPlan="속성발효 기술은 참치액젓 생산에도 직접 적용 가능합니다. 자숙액에 '발효덧' 첨가 → 60일 속성발효로 생산 사이클을 6개월→2개월로 단축하면, 재고 회전율 3배 개선 및 운전자본 부담 대폭 경감이 가능합니다."
              source="KFAS 한국수산과학회지 — 멸치 염장발효덧 활용 속성발효 고순도 액젓의 제조 및 품질"
            />
          </div>
        </div>

        {/* K06: 바이오제닉 아민 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><AlertTriangle size={18} className={styles.cardIcon} color="#06b6d4"/> 젓갈 원료별 바이오제닉 아민 비교</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <BarChart data={data.d_k06_biogenic_amine}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="원료" stroke="#94a3b8" fontSize={10}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="히스타민" name="히스타민 (mg/kg)" fill="var(--color-danger)" />
                <Bar dataKey="티라민" name="티라민 (mg/kg)" fill="var(--color-warning)" />
              </BarChart>
            </SafeResponsiveContainer>
            <TakeawayBox
              situation="KFAS 연구에서 젓갈 원료별 바이오제닉 아민을 비교한 결과, 오징어젓(히스타민 210mg/kg)과 멸치액젓(185mg/kg)이 EU 기준(200mg/kg)에 근접·초과합니다. 반면 참치 자숙액 기반은 45mg/kg으로 안전 마진이 4배 이상 넓어 수출 적격성이 압도적입니다."
              actionPlan="참치액젓의 '저히스타민' 특성은 EU/FDA 수출의 결정적 차별점입니다. 멸치액젓(185mg/kg) 대비 참치액젓(45mg/kg)의 '4배 안전 마진'을 수출 마케팅의 핵심 키 메시지로 활용하여, 글로벌 바이어 대상 안전성 프리미엄을 확보하십시오."
              source="KFAS 한국수산과학회지 54(6), 2021 — 젓갈류 원료별 이화학적 성분 및 Biogenic Amine류 비교"
            />
          </div>
        </div>

        {/* K07: 쌀코지 어간장 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><Lightbulb size={18} className={styles.cardIcon} color="#06b6d4"/> 쌀코지 저염 어간장 발효특성 혁신</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <ComposedChart data={data.d_k07_kanari_koji}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="조건" stroke="#94a3b8" fontSize={9}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="아미노산" name="유리 아미노산 (mg/L)" fill="#8b5cf6" />
                <Line yAxisId="right" type="monotone" dataKey="관능" name="관능 점수 (9점)" stroke="var(--color-success)" strokeWidth={2.5} />
              </ComposedChart>
            </SafeResponsiveContainer>
            <TakeawayBox
              situation="KFAS 연구에서 까나리 어간장에 쌀코지(Rice Koji)를 첨가하고 저염(10%)으로 발효한 결과, TN 1.65%(무코지 0.85% 대비 94%↑), 유리아미노산 850mg/L, 관능 8.2/9.0을 달성했습니다. 식염 50% 절감과 품질 향상을 동시에 구현했습니다."
              actionPlan="쌀코지 기술은 참치액젓의 '프리미엄 저염 라인' 개발에 직접 적용 가능합니다. 자숙액+쌀코지 저염발효 → '프리미엄 저염 참치액젓(나트륨 50% 감소)' 제품 출시로, 5060 건강 소비층을 타겟하여 기존 대비 30% 높은 가격 프리미엄을 설정할 수 있습니다."
              source="KFAS 한국수산과학회지 55(3), 2022 — 쌀코지 처리·식염함량별 까나리 어간장 발효특성"
            />
          </div>
        </div>

        {/* K08: 쓴맛 개선 조미소스 */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><FlaskConical size={18} className={styles.cardIcon} color="#06b6d4"/> 오징어 효소 활용 멸치 조미소스 쓴맛 제거</h3>
            <TelemetryBadge status="STATIC" />
          </div>
          <div className={styles.cardBody}>
            <SafeResponsiveContainer height={280}>
              <ComposedChart data={data.d_k08_debit_sauce}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="처리단계" stroke="#94a3b8" fontSize={9}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="쓴맛강도" name="쓴맛 강도 (10점)" fill="var(--color-danger)" />
                <Line type="monotone" dataKey="감칠맛" name="감칠맛 (10점)" stroke="var(--color-success)" strokeWidth={2.5} />
              </ComposedChart>
            </SafeResponsiveContainer>
            <TakeawayBox
              situation="KFAS 연구에서 멸치 가수분해물의 쓴맛(8.5점)을 오징어 간췌장 유래 Aminopeptidase로 2차 처리한 결과, 쓴맛 2.1점으로 75% 절감하면서 감칠맛 8.5점을 달성했습니다. 효소적 디비터링(Debittering) 기술로 고순도 감칠맛 조미소스 제조가 가능합니다."
              actionPlan="참치 자숙액 가수분해 시에도 쓴맛이 발생할 수 있습니다. 오징어 간췌장 AP 효소를 활용한 디비터링 기술을 참치액젓 R&D에 도입하면, '제로 비린내, 순수 감칠맛' 프리미엄 라인 개발이 가능합니다. 이는 간장 대체재로서의 포지셔닝을 완성하는 핵심 기술입니다."
              source="KFAS 한국수산과학회지 — 오징어 간췌장 Aminopeptidase 활용 멸치 조미소스 쓴맛 개선"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
