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

  const { kpis, d_simulator, d_channel_share, d_export_dest, d_w01, d_w02, d_w03, d_w04, d_w05, d_w06, d_w07, d_w08, d_w09, d_w10, d_w11, d_w12, d_w13, d_w14, d_w15, d_w16, d_w17, d_w18, d_w19, d_w20, d_w21, d_w22, d_w23, d_w24, d_w25, d_w26, d_w27_radar, d_w28, d_w30, d_w31, d_w32, d_nw01_bycatch, d_nw02_quota, d_nw03_climate, d_nw04_radar, d_nw05_retention, d_nw05_abidjan, d_nw06_mmpa, d_w33, d_w34, d_w35, d_w36, d_kfas_w01, d_kfas_w02, d_kfas_w03, d_kfas_w04, d_kfas_w05, d_illex_risk, d_protein_mix, d_macro_sensitivity, d_sg_b2b } = data;




  
  const xFmt = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const cleaned = tick.replace(/\s*\(.*?\)\s*/g, '').trim();
    return cleaned.length > 6 ? cleaned.substring(0, 6) + '..' : cleaned;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>🐾 펫푸드 산업 전략 인텔리전스</h1>
          <p className={styles.subtitle}>글로벌 거시 + 한국 심층 + 공급망 + 비즈모델 + 소비자 트렌드 = 핵심 전략 지표</p>
        </div>
        <div className={styles.lastUpdated}>
          <RefreshCcw size={14} className={styles.rotateIcon} />
          <span>최종 갱신일: 2026.05.17 (실시간 데이터 연동)</span>
        </div>
      </header>

      <div className={styles.content}>

        {/* ═══ Executive Strategy Command ═══ */}
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(145deg, #1e293b, #0f172a)', borderRadius: '12px', borderLeft: '4px solid #f472b6', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontSize: '1.25rem', marginTop: 0, marginBottom: '1rem' }}>
            <Crown size={22} color="#f472b6" /> [경영진 전략 지휘소]
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
            <strong>전략 요약:</strong> 글로벌 펫푸드 시장 진입의 <span style={{ color: '#f472b6' }}>골든 윈도우는 향후 3~5년</span>입니다. 한국산 펫푸드 수출이 12배 폭증(일본 중심)하고 있으나, 수입 역시 거대하여 1.5억 달러 무역 적자를 기록 중입니다. 경영진은 태국 OEM 인프라를 활용하는 <strong>[S2: D2C OEM]</strong> 모델을 최우선으로 검토하고, 중장기적으로 <strong>[S5: 처방식 JV]</strong>를 통해 고부가가치 시장(ROE 극대화)으로 이전해야 합니다.
          </p>
        </div>

        {/* ═══ 시장 진입 시나리오 예측기 ═══ */}
        <div className={styles.card} style={{ marginBottom: '3rem', border: '1px solid #334155' }}>
          <div className={styles.cardHeader} style={{ background: '#1e293b' }}>
            <h3 className={styles.cardTitle}><Activity size={18} className={styles.cardIcon} color="#f472b6" /> 시장 진입 시나리오 예측기 (Phase 3)</h3>
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




      </div>
    </div>
  );
}
