'use client';

import React from 'react';
import * as chartFmt from '../lib/chartFormatters';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts';
import {
  TrendingUp,
  Globe,
  Award,
  ShieldCheck,
  Users,
  AlertTriangle,
} from 'lucide-react';
import styles from './TunaInsightsDashboard.module.css';
import TakeawayBox from './TakeawayBox';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TelemetryBadge from './TelemetryBadge';

/* ================================================================
   TOOLTIP STYLE (dark theme, shared)
================================================================ */
const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(20, 28, 52, 0.95)',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: '0.78rem',
  padding: '8px 12px',
};

/* ================================================================
   Widget 1: MscGlobalTunaGrowthTracker
================================================================ */
const growthTrend = [
  { year: '2023-24', sales: 242, certified: 2678 },
  { year: '2024-25', sales: 300, certified: 2849 },
  { year: '2025-26', sales: 400, certified: 3100 },
];

const growthKPIs = [
  { label: 'MSC 라벨 참치 판매', value: '400,000+ MT', sub: '연감 2025-26판 · YoY +39%', borderColor: '#38bdf8' },
  { label: 'MSC 인증 어획량', value: '3.1M MT', sub: '전 세계 어획의 51.7% (2025년 말)', borderColor: '#10b981' },
  { label: 'MSC 인증 어업', value: '71개', sub: '5개 심사 중 (ISSF 2026-03)', borderColor: '#a78bfa' },
  { label: 'MSC 라벨 전체 소매가치', value: 'US$14B', sub: '전 어종 합계 (2024/25)', borderColor: '#f59e0b' },
];

export function MscGlobalTunaGrowthTracker() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <TrendingUp size={20} style={{ color: '#38bdf8' }} />
          MSC 인증 참치 — 글로벌 성장 궤적
          <TelemetryBadge status="STATIC" syncDate="2025-26" />
        </h3>
        <p className={styles.cardDesc}>
          MSC 연감 2025-26판·연례보고서 부속 데이터 기준 3개년 성장 추이 — 전 세계 참치 어획의 51.7%가 MSC 인증(참여 기준 59%).
        </p>
      </div>

      <div className={styles.cardBody}>
        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {growthKPIs.map((kpi) => (
            <div
              key={kpi.label}
              style={{
                background: 'rgba(0,0,0,0.2)',
                borderLeft: `4px solid ${kpi.borderColor}`,
                padding: '16px',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={12} />
                {kpi.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Area Chart */}
        <div className={styles.chartContainer} style={{ height: 340 }}>
          <SafeResponsiveContainer width="100%" height={320}>
            <AreaChart data={growthTrend} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="msc-sales-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="msc-cert-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.4)" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fill: '#38bdf8', fontSize: 11 }} label={{ value: 'MSC 라벨 판매(천톤)', angle: -90, position: 'insideLeft', style: { fill: '#38bdf8', fontSize: 11 } }} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fill: '#10b981', fontSize: 11 }} label={{ value: 'MSC 인증 어획(천톤)', angle: 90, position: 'insideRight', style: { fill: '#10b981', fontSize: 11 } }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.78rem' }} />
              <Area isAnimationActive={false} yAxisId="left" type="monotone" dataKey="sales" name="MSC 라벨 판매(천톤)" stroke="#38bdf8" strokeWidth={2} fill="url(#msc-sales-grad)" dot={{ r: 4, fill: '#38bdf8' }} />
              <Area isAnimationActive={false} yAxisId="right" type="monotone" dataKey="certified" name="MSC 인증 어획(천톤)" stroke="#10b981" strokeWidth={2} fill="url(#msc-cert-grad)" dot={{ r: 4, fill: '#10b981' }} />
            </AreaChart>
          </SafeResponsiveContainer>
        </div>

        <TakeawayBox
          situation="MSC 라벨 참치 판매는 2년 연속 두 자릿수 성장률(2024/25 +24% → 2025/26 +39%)을 기록하며 전체 MSC 프로그램 성장의 최대 동력. 전 세계 참치 어획량의 절반 이상(2025년 말 51.7%)이 이미 MSC 인증 어업에서 나오고 있으며, 182개 어업이 프로그램에 참여(이 중 인증 완료는 71개, ISSF 2026-03 기준)."
          actionPlan="글로벌 유통사(Walmart, Tesco, Aldi)의 100% MSC 전환 공약이 실질적 구매력으로 전환. 한국 선단의 MSC 인증 확대가 유럽·미국 시장 접근권 확보의 핵심 전제조건."
          source="MSC Sustainable Tuna Yearbook 2025-26(라벨 판매·인증 어획), MSC Annual Report 2024-25 부속 데이터(인증 어획 2023-24·2024-25 회계연도 합계), ISSF MSC 인증 현황(2026-03)"
        />
      </div>
    </div>
  );
}

/* ================================================================
   Widget 2: MscEuropeCountryPenetration
================================================================ */
const euroPenetrationData = [
  { country: '독일 🇩🇪', penetration: 93, volume: 87862, plShare: 71, solvent: '혼합' },
  { country: '프랑스 🇫🇷', penetration: 67, volume: 32683, plShare: 32, solvent: '혼합' },
  { country: '영국 🇬🇧', penetration: 65, volume: 45840, plShare: 43, solvent: '염수/물' },
  { country: '이탈리아 🇮🇹', penetration: 50, volume: 0, plShare: 28, solvent: '올리브유' },
  { country: '스페인 🇪🇸', penetration: 32, volume: 0, plShare: 80, solvent: '올리브유' },
  { country: '폴란드 🇵🇱', penetration: 25, volume: 0, plShare: 0, solvent: '-' },
];

export function MscEuropeCountryPenetration() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Globe size={20} style={{ color: '#a78bfa' }} />
          유럽 국가별 MSC 참치 침투율
          <TelemetryBadge status="STATIC" syncDate="2025-26" />
        </h3>
        <p className={styles.cardDesc}>
          유럽 주요 6개국의 MSC 에코라벨 참치 침투율(%). 독일(93%)은 거의 포화, 폴란드(25%)는 고성장 잠재 시장.
        </p>
      </div>

      <div className={styles.cardBody}>
        {/* Horizontal Bar Chart */}
        <div className={styles.chartContainer} style={{ height: 320 }}>
          <SafeResponsiveContainer width="100%" height={300}>
            <BarChart data={euroPenetrationData} layout="vertical" margin={{ top: 10, right: 40, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.4)" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: unknown) => `${v}%`} />
              <YAxis type="category" dataKey="country" width={100} tick={{ fill: '#e2e8f0', fontSize: 12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: unknown) => [`${value}%`, 'MSC 침투율']} />
              <Bar dataKey="penetration" fill="#38bdf8" radius={[0, 6, 6, 0]} barSize={22} isAnimationActive={false}>
                <LabelList dataKey="penetration" position="right" style={{ fill: '#38bdf8', fontSize: 12, fontWeight: 700 }} formatter={(v: unknown) => `${v}%`} />
              </Bar>
            </BarChart>
          </SafeResponsiveContainer>
        </div>

        {/* Compact Table */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 10,
          border: '1px solid rgba(140,170,255,0.12)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['국가', 'MSC 침투율', 'MSC 라벨 물량(톤)', 'PB 점유율(%)', '주력 용매'].map((h) => (
                  <th key={h} style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {euroPenetrationData.map((row) => (
                <tr key={row.country} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 12px', color: '#e2e8f0', fontWeight: 600 }}>{row.country}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{
                      background: row.penetration >= 60 ? 'rgba(56,189,248,0.15)' : 'rgba(245,158,11,0.15)',
                      color: row.penetration >= 60 ? '#38bdf8' : '#f59e0b',
                      padding: '2px 8px',
                      borderRadius: 6,
                      fontWeight: 600,
                    }}>
                      {row.penetration}%
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', color: row.volume > 0 ? '#10b981' : '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                    {row.volume > 0 ? row.volume.toLocaleString() : '-'}
                  </td>
                  <td style={{ padding: '8px 12px', color: row.plShare >= 50 ? '#f59e0b' : '#94a3b8' }}>
                    {row.plShare > 0 ? `${row.plShare}%` : '-'}
                  </td>
                  <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{row.solvent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TakeawayBox
          situation="독일(93%)과 영국(65%)은 이미 MSC 포화 시장에 근접. 스페인은 PB 80%+ 시장에서 MSC 확산 중이며, 이탈리아는 Rio Mare의 99.7% 전환이 시장을 견인. 폴란드(+15.7% 성장)와 중앙유럽(+9.7%)이 차세대 성장 시장."
          actionPlan="한국 참치캔 유럽 수출 시 MSC 인증은 시장 진입 필수 조건으로 전환 완료. 독일·영국은 인증 없이 매대 진입 불가. 아직 포화되지 않은 남유럽·동유럽(이탈리아, 스페인, 폴란드)이 신규 진출 기회."
          source="MSC Tuna Yearbook 2026, MSC Country Market Analysis 2025-2026 (UK/DE/FR/IT/ES)"
        />
      </div>
    </div>
  );
}

/* ================================================================
   Widget 3: MscBrandSourcingScorecard
================================================================ */
const brandData = [
  { brand: 'Bolton (Rio Mare/Saupiquet)', rate: 99.7, markets: '🇮🇹🇫🇷🇪🇸', label: 'IO 황다랑어 74% 감축', color: '#10b981' },
  { brand: 'Thai Union (John West/Petit Navire)', rate: 98.9, markets: '🇬🇧🇫🇷🇮🇹🇳🇱', label: 'MSC 또는 FIP +14% vs 2023', color: '#3b82f6' },
  { brand: 'Walmart (US 자체브랜드)', rate: 100, markets: '🇺🇸', label: '캔 참치 전체 MSC', color: '#22d3ee' },
  { brand: 'Princes (UK)', rate: 100, markets: '🇬🇧', label: '2026년 2월 100% MSC 전환', color: '#a78bfa' },
  { brand: 'Nauterra/Calvo', rate: 92.8, markets: '🇪🇸🇮🇹', label: 'EUR 7.27억 매출 / 로인 인증', color: '#f59e0b' },
  { brand: 'Jealsa/Rianxeira', rate: 85, markets: '🇪🇸', label: 'ISSF 기반 소싱', color: '#ef4444' },
];

export function MscBrandSourcingScorecard() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Award size={20} style={{ color: '#10b981' }} />
          글로벌 브랜드 MSC 소싱 스코어카드
          <TelemetryBadge status="STATIC" syncDate="2025-26" />
        </h3>
        <p className={styles.cardDesc}>
          상위 6대 글로벌 참치 브랜드의 MSC 인증 원료 소싱률. 평균 96%+ 달성으로 비인증 원료 판매 채널 급속 축소 중.
        </p>
      </div>

      <div className={styles.cardBody}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {brandData.map((item) => (
            <div key={item.brand} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(140,170,255,0.12)',
              borderRadius: 10,
              padding: '14px 18px',
            }}>
              {/* Top row: brand name + percentage */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' }}>{item.brand}</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: item.color, fontVariantNumeric: 'tabular-nums' }}>{item.rate}%</span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', background: 'rgba(140,170,255,0.12)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                <div style={{
                  width: `${item.rate}%`,
                  height: '100%',
                  borderRadius: 6,
                  background: `linear-gradient(90deg, ${item.color}cc, ${item.color})`,
                  transition: 'width 0.6s ease',
                }} />
              </div>

              {/* Bottom row: markets + label */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {item.markets}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic' }}>
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <TakeawayBox
          situation="상위 5대 글로벌 참치 브랜드 평균 MSC 소싱률 97%+. 비인증 원료의 유통 채널이 급속 축소 중. Bolton(99.7%), Thai Union(98.9%), Princes(100%) 등 핵심 바이어가 사실상 MSC 전량 전환 완료."
          actionPlan="비MSC 원료의 유럽·미국 판매 채널이 2027년까지 사실상 소멸 전망. 한국 원양 선단의 인증 전환이 중장기 원료 판매 가격과 직결. 특히 Bolton의 IO 황다랑어 74% 감축은 인도양 조업 선대에 직접적 영향."
          source="MSC Annual Report 2024-2025, MSC Tuna Yearbook 2026, 각 기업 지속가능성 보고서"
        />
      </div>
    </div>
  );
}

/* ================================================================
   Widget 4: MscTunaStockHealthGauge
================================================================ */
const stockHealthData = [
  { name: '건전 자원', value: 12, fill: '#10b981' },
  { name: '비건전 자원', value: 11, fill: '#ef4444' },
];

const hcrData = [
  { name: 'HCR 이행', value: 7, fill: '#3b82f6' },
  { name: 'HCR 미이행', value: 16, fill: '#64748b' },
];

export function MscTunaStockHealthGauge() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <ShieldCheck size={20} style={{ color: '#10b981' }} />
          참치 자원 건강도 × 관리 이행 격차
          <TelemetryBadge status="STATIC" syncDate="2025" />
        </h3>
        <p className={styles.cardDesc}>
          23개 주요 상업 참치 자원의 건전성 비율과 수확 통제 규칙(HCR) 이행률 비교. 22%p 격차가 규제 진공 리스크를 의미.
        </p>
      </div>

      <div className={styles.cardBody}>
        {/* Donut Charts Side by Side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Stock Health Donut */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(140,170,255,0.12)',
            borderRadius: 12,
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              자원 건전성
            </div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <SafeResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={stockHealthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {stockHealthData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: unknown, name: unknown) => [`${chartFmt.toChartNumber(value)}개`, chartFmt.toChartText(name)]} />
                </PieChart>
              </SafeResponsiveContainer>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>52.2%</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>12/23</div>
              </div>
            </div>
          </div>

          {/* HCR Implementation Donut */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(140,170,255,0.12)',
            borderRadius: 12,
            padding: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              HCR 이행률
            </div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <SafeResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={hcrData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {hcrData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: unknown, name: unknown) => [`${chartFmt.toChartNumber(value)}개`, chartFmt.toChartText(name)]} />
                </PieChart>
              </SafeResponsiveContainer>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>30.4%</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>7/23</div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 10,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <AlertTriangle size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>
              규제 진공 격차: 22%p
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.6 }}>
              자원 건전성(52.2%) 대비 HCR 이행률(30.4%) 사이 22%p 격차는 &quot;건강하지만 관리되지 않는&quot; 자원이 존재함을 의미.
              RFMO 차원의 급격한 규제 도입 리스크 존재.
            </div>
          </div>
        </div>

        <TakeawayBox
          situation="23개 주요 상업 참치 자원 중 12개(52.2%)만 MSC 기준 건전 — 2024년 11개에서 1개 증가. 그러나 완전한 수확 통제 규칙(HCR)을 이행한 자원은 7개(30.4%)에 불과. 자원 건전성과 관리 이행 사이 22%p 격차는 규제 진공 상태를 의미."
          actionPlan="RFMO 차원의 급격한 어획 규제 도입 리스크 존재. 특히 WCPFC/IOTC에서 사전합의 수확전략(pre-agreed harvest strategy) 미이행 자원에 대한 규제 강화가 예상되며, 이는 VDS 비용 상승과 조업일수 축소로 직결. 원료 확보 전략에 규제 시나리오를 반영해야 함."
          source="MSC Preserving Ocean Life Biodiversity Report 2025, MSC Tuna Yearbook 2026"
        />
      </div>
    </div>
  );
}

/* ================================================================
   Widget 5: MscConsumerInsightsRadar
================================================================ */
const consumerRadarData = [
  { subject: '라벨 인지도', global: 50, uk: 54 },
  { subject: '프리미엄 지불 의향', global: 40, uk: 53 },
  { subject: 'MZ세대 지속가능 선택', global: 83, uk: 83 },
  { subject: '제3자 인증 신뢰', global: 65, uk: 75 },
  { subject: '불황 내 수요 유지', global: 60, uk: 70 },
];

const premiumMetrics = [
  { label: 'MSC 프리미엄', value: '+44.6%', sub: '헤도닉 모델', color: '#38bdf8' },
  { label: 'Dolphin-Safe 프리미엄', value: '+25.4%', sub: '단독 라벨', color: '#10b981' },
  { label: '이중 라벨 프리미엄', value: '+81.3%', sub: 'MSC + Dolphin-Safe', color: '#a78bfa' },
];

export function MscConsumerInsightsRadar() {
  return (
    <div className={styles.insightCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Users size={20} style={{ color: '#a78bfa' }} />
          MSC 소비자 인사이트 레이더
          <TelemetryBadge status="STATIC" syncDate="2025" />
        </h3>
        <p className={styles.cardDesc}>
          글로벌 및 영국 시장의 MSC 소비자 인지도·구매 의향·프리미엄 지표. MZ세대 83%가 지속가능 어류를 적극 선택.
        </p>
      </div>

      <div className={styles.cardBody}>
        {/* Radar Chart */}
        <div className={styles.chartContainer} style={{ height: 340 }}>
          <SafeResponsiveContainer width="100%" height={320}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={consumerRadarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
              <Radar name="글로벌 평균" dataKey="global" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
              <Radar name="영국" dataKey="uk" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.78rem' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: unknown) => [`${value}%`]} />
            </RadarChart>
          </SafeResponsiveContainer>
        </div>

        {/* Premium Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {premiumMetrics.map((m) => (
            <div key={m.label} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(140,170,255,0.12)',
              borderRadius: 10,
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                {m.label}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: m.color, fontVariantNumeric: 'tabular-nums' }}>
                {m.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                {m.sub}
              </div>
            </div>
          ))}
        </div>

        <TakeawayBox
          situation="MZ세대(30세 미만) 83%가 지속가능 어류를 적극 선택하며, 영국 소비자 53%가 MSC 인증 제품에 프리미엄 지불 의향. 2025년 헤도닉 가격 모델에서 MSC 프리미엄 +44.6%, 이중 라벨(MSC+Dolphin-Safe) +81.3% 확인. 불황에도 MSC 수요는 구조적으로 유지."
          actionPlan="MSC 프리미엄(+10~14%, EU 시장)은 인증 비용 대비 충분한 ROI 창출. 한국 참치 통조림의 유럽 수출 시 MSC+Dolphin-Safe 이중 라벨 전략으로 최대 81% 프리미엄 확보 가능. 다만 PB(자체브랜드) 시장에서의 가격 경쟁도 동시 심화 — 프리미엄 인증 + 가격 경쟁력의 이중 전략 필요."
          source="MSC Annual Report 2023-2024, Banguning Asgha et al. 2025 (Hedonic Price Model), GlobeScan/YouGov 2024"
        />
      </div>
    </div>
  );
}
