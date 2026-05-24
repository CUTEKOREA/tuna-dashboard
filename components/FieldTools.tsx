'use client';

import React, { useState, useMemo } from 'react';
import styles from './FieldTools.module.css';
import {
  Calculator, TrendingUp, Handshake, Timer, CloudLightning,
  Fuel, Ship, Anchor, FileText, DollarSign, AlertTriangle,
  CheckCircle2, ArrowRight, Gauge, Globe2, Thermometer,
  ArrowUpRight, ArrowDownRight, Compass, Search, Crosshair, TrendingDown,
  Shuffle, BarChart2, Activity, Award, Recycle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, Cell
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import FleetOperationStatus from './FleetOperationStatus';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

type ToolTab = 'fleet' | 'logistics' | 'finance' | 'esg';

export default function FieldTools() {
  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <Calculator size={28} /> 현장 투입 실무 도구 (Field Ops)
        </div>
        <div className={styles.pageSubtitle}>
          조달, 물류, 재무, ESG 등 실무자 부서별 데이터 기반 의사결정 시뮬레이터
        </div>
      </div>

      <div data-mobile-stack className={styles.toolGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {/* Fleet */}
        <FleetOperationStatus />
        <FuiMarginSimulator />
        <DroneRoiTracker />
        <VDSBurnTracker />
        <ClimateRiskAlert />
        
        {/* Logistics */}
        <CanalDisruptionIndex />
        <StorageTariffCalculator />
        <YieldFreightSpread />
        
        {/* Finance */}
        <BuySignalDashboard />
        <LandedCostCalculator />
        <NegotiationSimulator />
        <ExchangeShockIndex />
        <PriceAsymmetryChart />
        <SubstitutionElasticityMonitor />
        
        {/* ESG */}
        <EcolabelRoiCalculator />
        <ByproductUpcycleTracker />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 1: Landed Cost Calculator
 * ═══════════════════════════════════════════════ */
export function LandedCostCalculator() {
  const [rawPrice, setRawPrice] = useState(1580);
  const [fuelCost, setFuelCost] = useState(85);
  const [reeferCost, setReeferCost] = useState(320);
  const [portCost] = useState(45);
  const [tariff] = useState(32);
  const [insurance] = useState(18);
  const [sellingPrice, setSellingPrice] = useState(2350);

  const totalCost = rawPrice + fuelCost + reeferCost + portCost + tariff + insurance;
  const margin = sellingPrice - totalCost;
  const marginPct = ((margin / sellingPrice) * 100).toFixed(1);
  const marginStatus = parseFloat(marginPct) >= 10 ? 'positive' : parseFloat(marginPct) >= 5 ? 'warning' : 'negative';

  const insight = parseFloat(marginPct) >= 10
    ? '현재 마진이 10% 이상 — 매입 적정 구간입니다. 추가 물량 확보를 검토하세요.'
    : parseFloat(marginPct) >= 5
    ? '마진 5~10% 경계 구간 — 원어가 하락 추이 확인 후 매입을 권장합니다.'
    : '마진 5% 미만 — 적자 위험 구간입니다. 납품가 재협상 또는 매입 보류를 권고합니다.';

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <Calculator size={22} color="var(--color-warning)" />
        <div className={styles.toolTitle}>선적 원가 계산기 (Landed Cost Calculator)</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}>LIVE DATA</span>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: '8px' }}>📐 Estimate</span>
      </div>

      <div className={styles.costGrid}>
        <div className={styles.costInputs}>
          <div className={styles.costRow}>
            <div className={styles.costLabel}><Ship size={14} /> 원어 매입가 (SKJ CFR)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>$</span>
              <input className={styles.costInput} type="number" value={rawPrice} onChange={e => setRawPrice(+e.target.value)} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/MT</span>
            </div>
          </div>
          <div className={styles.costRow}>
            <div className={styles.costLabel}><Fuel size={14} /> 운반선 연료비 (MGO) <span className={styles.costAutoTag}>AUTO</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>$</span>
              <input className={styles.costInput} type="number" value={fuelCost} onChange={e => setFuelCost(+e.target.value)} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/MT</span>
            </div>
          </div>
          <div className={styles.costRow}>
            <div className={styles.costLabel}><Globe2 size={14} /> 리퍼 컨테이너 운임 <span className={styles.costAutoTag}>AUTO</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>$</span>
              <input className={styles.costInput} type="number" value={reeferCost} onChange={e => setReeferCost(+e.target.value)} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/MT</span>
            </div>
          </div>
          <div className={styles.costRow}>
            <div className={styles.costLabel}><Anchor size={14} /> 부산항 하역료</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>$</span>
              <input className={styles.costInput} type="number" value={portCost} disabled style={{ opacity: 0.5 }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/MT</span>
            </div>
          </div>
          <div className={styles.costRow}>
            <div className={styles.costLabel}><FileText size={14} /> 관세·통관비 (8%)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>$</span>
              <input className={styles.costInput} type="number" value={tariff} disabled style={{ opacity: 0.5 }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/MT</span>
            </div>
          </div>
          <div className={styles.costRow}>
            <div className={styles.costLabel}><FileText size={14} /> 보험·기타 (1.2% CIF)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>$</span>
              <input className={styles.costInput} type="number" value={insurance} disabled style={{ opacity: 0.5 }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/MT</span>
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(6, 182, 212, 0.08)', paddingTop: '0.75rem' }}>
            <div className={styles.costRow} style={{ border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div className={styles.costLabel}><DollarSign size={14} color="var(--color-warning)" /> <strong>대형마트 납품가</strong></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>$</span>
                <input className={styles.costInput} type="number" value={sellingPrice} onChange={e => setSellingPrice(+e.target.value)} style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/MT</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.costResult}>
          <div className={styles.totalCostCard}>
            <div className={styles.totalLabel}>총 Landed Cost</div>
            <div className={styles.totalValue}>${totalCost.toLocaleString()}<span className={styles.totalUnit}>/MT</span></div>
          </div>

          <div className={`${styles.marginCard} ${marginStatus === 'positive' ? styles.marginPositive : marginStatus === 'warning' ? styles.marginWarning : styles.marginNegative}`}>
            <div className={styles.marginPercent} style={{ color: marginStatus === 'positive' ? 'var(--color-success)' : marginStatus === 'warning' ? 'var(--color-warning)' : 'var(--color-danger)' }}>
              {margin >= 0 ? '+' : ''}{marginPct}%
            </div>
            <div className={styles.marginLabel}>예상 마진 (${margin.toLocaleString()}/MT)</div>
          </div>

          <div className={styles.insightBox}>
            {insight}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 2: Buy Signal Dashboard
 * ═══════════════════════════════════════════════ */
export function BuySignalDashboard() {
  const factors = [
    { name: 'SKJ 단가 vs 5년 평균', value: '$2,050 (+28.7%)', score: 25, color: 'var(--color-danger)', note: '고가 구간' },
    { name: 'Brent 원유가', value: '$99.40/bbl', score: 35, color: 'var(--color-warning)', note: '상승 중' },
    { name: '리퍼 운임지수', value: '$2,800 (안정)', score: 72, color: 'var(--color-success)', note: '안정권' },
    { name: 'WCPO 어획률', value: '전년 대비 -8%', score: 40, color: 'var(--color-warning)', note: '감소 추세' },
    { name: '라니냐/엘니뇨', value: '중립 (Neutral)', score: 65, color: '#06B6D4', note: '정상' },
    { name: '계절 지수', value: 'Q2 (비수기)', score: 75, color: 'var(--color-success)', note: '매수 적기' },
  ];

  const compositeScore = Math.round(factors.reduce((sum, f) => sum + f.score, 0) / factors.length);
  const signalText = compositeScore >= 70 ? '매수 적극 권장' : compositeScore >= 50 ? '관망 (Hold)' : '매수 보류';
  const signalColor = compositeScore >= 70 ? 'var(--color-success)' : compositeScore >= 50 ? 'var(--color-warning)' : 'var(--color-danger)';

  // SVG gauge
  const gaugeRadius = 80;
  const circumference = Math.PI * gaugeRadius;
  const progress = (compositeScore / 100) * circumference;

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <Gauge size={22} color="#06B6D4" />
        <div className={styles.toolTitle}>원어 매입 타이밍 시그널 (Buy Signal)</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: 'auto' }}>📐 Estimate</span>
      </div>

      <div className={styles.signalGrid}>
        <div className={styles.gaugeWrapper}>
          <svg width="200" height="120" viewBox="0 0 200 120" className={styles.gaugeSvg}>
            <path d="M 10 110 A 80 80 0 0 1 190 110" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeLinecap="round" />
            <path d="M 10 110 A 80 80 0 0 1 190 110" fill="none" stroke={signalColor} strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              style={{ filter: `drop-shadow(0 0 10px ${signalColor})`, transition: 'stroke-dasharray 1s ease' }}
            />
            <text x="100" y="90" textAnchor="middle" fontSize="36" fontWeight="800" fill={signalColor} fontFamily="Inter, sans-serif">{compositeScore}</text>
            <text x="100" y="108" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.5)">/ 100</text>
          </svg>
          <div className={styles.signalLabel} style={{ color: signalColor }}>{signalText}</div>
        </div>

        <div className={styles.factorList}>
          {factors.map(f => (
            <div key={f.name} className={styles.factorRow}>
              <div>
                <div className={styles.factorName}>{f.name}</div>
                <div className={styles.factorBar}>
                  <div className={styles.factorFill} style={{ width: `${f.score}%`, background: f.color }} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={styles.factorValue} style={{ color: f.color }}>{f.value}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{f.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 3: Price Negotiation Simulator
 * ═══════════════════════════════════════════════ */
function NegotiationSimulator() {
  const [buyerAsk, setBuyerAsk] = useState(2100);
  const [ourAsk, setOurAsk] = useState(2350);
  const landedCost = 2080;
  const annualVolume = 24000; // MT

  const midPoint = Math.round((buyerAsk + ourAsk) / 2);

  const scenarios = [
    {
      label: '바이어 요구 수용',
      price: buyerAsk,
      margin: buyerAsk - landedCost,
      pct: (((buyerAsk - landedCost) / buyerAsk) * 100).toFixed(1),
      annual: ((buyerAsk - landedCost) * annualVolume / 1000000).toFixed(1),
      color: parseFloat((((buyerAsk - landedCost) / buyerAsk) * 100).toFixed(1)) < 3 ? 'var(--color-danger)' : 'var(--color-warning)',
      bgColor: parseFloat((((buyerAsk - landedCost) / buyerAsk) * 100).toFixed(1)) < 3 ? 'rgba(239, 68, 68, 0.06)' : 'rgba(245, 158, 11, 0.06)',
      borderColor: parseFloat((((buyerAsk - landedCost) / buyerAsk) * 100).toFixed(1)) < 3 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
    },
    {
      label: '중간 타협안',
      price: midPoint,
      margin: midPoint - landedCost,
      pct: (((midPoint - landedCost) / midPoint) * 100).toFixed(1),
      annual: ((midPoint - landedCost) * annualVolume / 1000000).toFixed(1),
      color: 'var(--color-warning)',
      bgColor: 'rgba(245, 158, 11, 0.06)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    {
      label: '우리 희망가 관철',
      price: ourAsk,
      margin: ourAsk - landedCost,
      pct: (((ourAsk - landedCost) / ourAsk) * 100).toFixed(1),
      annual: ((ourAsk - landedCost) * annualVolume / 1000000).toFixed(1),
      color: 'var(--color-success)',
      bgColor: 'rgba(16, 185, 129, 0.06)',
      borderColor: 'rgba(16, 185, 129, 0.2)',
    },
  ];

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <Handshake size={22} color="#8b5cf6" />
        <div className={styles.toolTitle}>B2B 납품 단가 협상 시뮬레이터</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: 'auto' }}>📐 Estimate</span>
      </div>

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className={styles.costRow}>
          <div className={styles.costLabel}>바이어 요구가</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>$</span>
            <input className={styles.costInput} type="number" value={buyerAsk} onChange={e => setBuyerAsk(+e.target.value)} style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }} />
          </div>
        </div>
        <div className={styles.costRow} style={{ background: 'rgba(139, 92, 246, 0.05)' }}>
          <div className={styles.costLabel}>현재 Landed Cost</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8b5cf6' }}>${landedCost.toLocaleString()}/MT</div>
        </div>
        <div className={styles.costRow}>
          <div className={styles.costLabel}>우리 희망가</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: 'var(--color-success)', fontSize: '0.8rem' }}>$</span>
            <input className={styles.costInput} type="number" value={ourAsk} onChange={e => setOurAsk(+e.target.value)} style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }} />
          </div>
        </div>
      </div>

      <div className={styles.negoGrid}>
        {scenarios.map(s => (
          <div key={s.label} className={styles.scenarioCard} style={{ background: s.bgColor, border: `1px solid ${s.borderColor}` }}>
            <div className={styles.scenarioTitle} style={{ color: s.color }}>{s.label}</div>
            <div className={styles.scenarioPrice} style={{ color: 'var(--text-main)' }}>${s.price.toLocaleString()}</div>
            <div className={styles.scenarioMargin} style={{ color: s.color }}>
              마진 {s.pct}% (${s.margin.toLocaleString()}/MT)
            </div>
            <div className={styles.scenarioImpact}>
              연간 영향: ${s.annual}M ({s.margin >= 0 ? '이익' : '손실'})
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insightBox} style={{ marginTop: '1.5rem' }}>
        <strong>협상 전략:</strong> 현재 원어가 상승 추세(라니냐 영향)를 근거로 "원가 상승 불가피" 논리를 앞세워 ${midPoint.toLocaleString()}/MT 이상에서 타결을 목표로 하되, "원어가 3개월 내 10% 하락 시 재협상" 조건부 조항 삽입을 권장합니다. (연간 볼륨 기준: {annualVolume.toLocaleString()} MT)
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 4: VDS Quota Burn-Down Tracker
 * ═══════════════════════════════════════════════ */
function VDSBurnTracker() {
  const today = new Date('2026-05-03T12:00:00Z');
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const yearEnd = new Date(today.getFullYear(), 11, 31);
  const dayOfYear = Math.floor((today.getTime() - yearStart.getTime()) / 86400000);
  const daysInYear = 365;
  const idealPct = Math.round((dayOfYear / daysInYear) * 100);

  const zones = [
    { country: '🇰🇮 키리바시 (Kiribati)', total: 565, used: 509, color: 'var(--color-danger)' },
    { country: '🇹🇻 투발루 (Tuvalu)', total: 152, used: 144.2, color: '#f97316' },
    { country: '🇳🇷 나우루 (Nauru)', total: 240, used: 153.2, color: 'var(--color-warning)' },
    { country: '🇵🇬 파푸아뉴기니 (PNG)', total: 474, used: 54.8, color: 'var(--color-success)' },
  ];

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <Timer size={22} color="#f97316" />
        <div className={styles.toolTitle}>VDS 조업일수 쿼터 소진율 추적기</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
          연간 경과: {idealPct}%
        </span>
        <span className={styles.toolBadge} style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', marginLeft: '8px' }}>
          ✓ 실데이터 (2026.05.03)
        </span>
      </div>

      <div className={styles.burnGrid}>
        {zones.map(z => {
          const pct = Math.round((z.used / z.total) * 100);
          const remaining = z.total - z.used;
          const burnRate = z.used / dayOfYear;
          const daysUntilEmpty = Math.round(remaining / burnRate);
          const exhaustDate = new Date(today.getTime() + daysUntilEmpty * 86400000);
          const exhaustStr = `${exhaustDate.getMonth() + 1}월 ${exhaustDate.getDate()}일`;
          const isOverBurn = pct > idealPct + 10;

          return (
            <div key={z.country} className={styles.burnCard}>
              <div className={styles.burnHeader}>
                <div className={styles.burnCountry}>{z.country}</div>
                <div className={styles.burnPercent} style={{ color: isOverBurn ? 'var(--color-danger)' : z.color }}>{pct}% 소진</div>
              </div>
              <div className={styles.burnBarTrack}>
                <div className={styles.burnBarFill} style={{ width: `${pct}%`, background: isOverBurn ? `linear-gradient(90deg, ${z.color}, #ef4444)` : z.color }} />
              </div>
              <div className={styles.burnStats}>
                <span>사용: {z.used.toFixed(1)}일 / 배정: {z.total}일</span>
                <span>잔여: {remaining.toFixed(1)}일</span>
              </div>
              {isOverBurn ? (
                <div className={styles.burnAlert} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  ⚠️ 과소진 경보 — 현재 속도면 <strong>{exhaustStr}</strong>에 쿼터 고갈 예상
                </div>
              ) : (
                <div className={styles.burnAlert} style={{ background: 'rgba(16, 185, 129, 0.06)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                  ✅ 정상 범위 — 연말까지 {remaining.toFixed(1)}일 잔여
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 5: Climate Risk Alert
 * ═══════════════════════════════════════════════ */
function ClimateRiskAlert() {
  const hasActiveAlert = true; // Simulate active typhoon

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <CloudLightning size={22} color="var(--color-danger)" />
        <div className={styles.toolTitle}>태풍·라니냐 조업 리스크 얼럿 시스템</div>
        {hasActiveAlert && (
          <span className={styles.toolBadge} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', animation: 'alertPulse 2s infinite' }}>
            ⚡ ACTIVE ALERT
          </span>
        )}
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: 'auto' }}>📐 Estimate</span>
      </div>

      {/* Active Typhoon Alert */}
      <div className={`${styles.alertCard} ${styles.alertCardActive}`}>
        <div className={styles.alertTitle} style={{ color: '#fca5a5' }}>
          <AlertTriangle size={18} /> 🌀 열대폭풍 "마와르" (Tropical Storm → Cat. 2 예상)
        </div>
        <div className={styles.alertGrid}>
          <div className={styles.alertSection}>
            <div className={styles.alertSectionTitle}>🌊 기상 정보</div>
            <div>현재 위치: 13.8°N, 147.2°E</div>
            <div>예상 경로: 미크로네시아 → 필리핀 북부</div>
            <div>최대 풍속: 95 kt (Cat. 2 예상)</div>
            <div>영향 기간: 2026.04.14 ~ 04.20 (약 7일)</div>

            <div className={styles.alertSectionTitle} style={{ marginTop: '1rem' }}>📊 과거 유사 패턴 (2023 Cat.2급)</div>
            <div>어획량 영향: <span style={{ color: '#fca5a5', fontWeight: 700 }}>-28% (3주간)</span></div>
            <div>SKJ 단가 영향: <span style={{ color: '#fca5a5', fontWeight: 700 }}>+$95/MT (5주 후 반영)</span></div>
          </div>

          <div className={styles.alertSection}>
            <div className={styles.alertSectionTitle}>🚢 영향 받는 우리 선박</div>
            <div className={styles.vesselList}>
              <div className={styles.vesselItem}>
                <span>신라 201호 (Zone 3 조업 중)</span>
                <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>⚠️ 위험</span>
              </div>
              <div className={styles.vesselItem}>
                <span>신라 205호 (Zone 5)</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✅ 안전</span>
              </div>
              <div className={styles.vesselItem}>
                <span>신라 207호 (부산항 하역 중)</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✅ 안전</span>
              </div>
              <div className={styles.vesselItem}>
                <span>신라 209호 (Zone 4 이동 중)</span>
                <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>⚠ 주의</span>
              </div>
            </div>

            <div className={styles.alertSectionTitle} style={{ marginTop: '1rem' }}>권장 조치</div>
            <div className={styles.actionList}>
              <div className={styles.actionItem}>1. 신라 201호 <strong>Zone 5로 즉시 우회</strong> 지시</div>
              <div className={styles.actionItem}>2. 단기 원어 <strong>추가 매입 +2,000 MT</strong> 검토</div>
              <div className={styles.actionItem}>3. 바이어에게 공급 차질 가능성 <strong>선제 통보</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* ENSO Status */}
      <div className={`${styles.alertCard} ${styles.alertCardSafe}`}>
        <div className={styles.alertTitle} style={{ color: '#6ee7b7' }}>
          <Thermometer size={18} /> ENSO 현황: 중립 (Neutral Phase)
        </div>
        <div className={styles.alertGrid}>
          <div className={styles.alertSection}>
            <div className={styles.alertSectionTitle}>🌡️ 현재 상태</div>
            <div>Niño 3.4 SST 편차: <strong>+0.3°C</strong> (중립 범위)</div>
            <div>향후 3개월 전망: 엘니뇨 전환 확률 <strong>35%</strong></div>
            <div>라니냐 재발 확률: <strong>15%</strong> (낮음)</div>
          </div>
          <div className={styles.alertSection}>
            <div className={styles.alertSectionTitle}>📈 어업 영향 전망</div>
            <div>중립 상태 유지 시: 어획량 정상 범위 기대</div>
            <div>엘니뇨 전환 시: 서태평양 어군 동쪽 이동 → <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>조업 해역 변경 필요</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 6: FUI-Adjusted Margin Simulator
 * ═══════════════════════════════════════════════ */
function FuiMarginSimulator() {
  const [skipjackPrice, setSkipjackPrice] = useState(1650);
  const [mdoPrice, setMdoPrice] = useState(720);
  const [fui, setFui] = useState(450); // Liters per MT

  // 1 MDO metric ton is roughly 1100 liters
  const mdoCostPerLiter = mdoPrice / 1100;
  const fuelCostPerMtOfFish = fui * mdoCostPerLiter;
  const otherCosts = 800; // Fixed OPEX per MT
  const totalCost = fuelCostPerMtOfFish + otherCosts;
  const margin = skipjackPrice - totalCost;
  const isLayup = margin < 100;

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <Fuel size={22} color="var(--color-danger)" />
        <div className={styles.toolTitle}>FUI 한계 순수익 시뮬레이터 (FUI Margin)</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: 'auto' }}>📐 Estimate</span>
      </div>
      <div className={styles.costGrid}>
        <div className={styles.costInputs}>
          <div className={styles.costRow}>
            <div className={styles.costLabel}>가다랑어 단가 (CFR 방콕)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>$</span>
              <input className={styles.costInput} type="number" value={skipjackPrice} onChange={e => setSkipjackPrice(+e.target.value)} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/MT</span>
            </div>
          </div>
          <div className={styles.costRow}>
            <div className={styles.costLabel}>싱가포르 MDO 현재 시세</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>$</span>
              <input className={styles.costInput} type="number" value={mdoPrice} onChange={e => setMdoPrice(+e.target.value)} style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}/>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/MT</span>
            </div>
          </div>
          <div className={styles.costRow}>
            <div className={styles.costLabel}>우리 선단 평균 FUI (연료사용지수)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input className={styles.costInput} type="number" value={fui} onChange={e => setFui(+e.target.value)} style={{ width: '60px' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Liters/MT</span>
            </div>
          </div>
        </div>
        <div className={styles.costResult}>
          <div className={styles.totalCostCard} style={{ background: isLayup ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderColor: isLayup ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)' }}>
            <div className={styles.totalLabel}>예상 톤당 순이익 (Net Margin)</div>
            <div className={styles.totalValue} style={{ color: isLayup ? 'var(--color-danger)' : 'var(--color-success)' }}>${Math.round(margin).toLocaleString()}</div>
          </div>
          <div className={styles.insightBox} style={{ marginTop: '1rem', borderLeftColor: isLayup ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {isLayup ? (
              <>⚠️ <strong>조업 중단 (Lay-up) 경고:</strong> 유류비 대비 마진이 $100 미만입니다. 출항을 보류하고 타 선사로의 쿼터(VDS) 임대를 적극 검토해야 합니다.</>
            ) : (
              <>✅ <strong>조업 속개:</strong> 투입 유류비 대비 채산성이 긍정적입니다. 즉시 출항 및 조업을 계속 진행하십시오.</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 7: Drone/AI Scouting ROI Tracker
 * ═══════════════════════════════════════════════ */
function DroneRoiTracker() {
  const data = [
    { name: '무작위 탐색 (기존)', drySet: 45, fuelWaste: 180 },
    { name: 'AI 소나 + 드론 (현재)', drySet: 12, fuelWaste: 45 },
  ];
  const opexSavings = 250000;
  const capex = 1200000;
  const payback = (capex / opexSavings).toFixed(1);

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <Crosshair size={22} color="#06b6d4" />
        <div className={styles.toolTitle}>AI·드론 조업 탐지 효율 (ROI) 모니터링</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: 'auto' }}>📐 Estimate</span>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
        <div style={{ flex: 2, height: '220px' }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="drySet" name="공치기 확률 (%)" fill="url(#a11y-stripe-h)" color="var(--color-danger)" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="fuelWaste" name="낭비 연료(MT/월)" fill="url(#a11y-diag)" color="var(--color-warning)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </SafeResponsiveContainer>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
          <div className={styles.kpiBox} style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.2rem' }}>장비 투자금</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>$1.2M</div>
          </div>
          <div className={styles.kpiBox} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.2rem' }}>월 유류 절감 (OPEX)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>+$250K</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.8rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>투자 회수 기간 (Payback)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#06b6d4' }}>{payback}개월</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 8: Canal Disruption Freight & Emission Index
 * ═══════════════════════════════════════════════ */
function CanalDisruptionIndex() {
  const [route, setRoute] = useState('suez');
  const baseFreight = 2500;
  
  const surcharge = route === 'suez' ? 0 : 3500; // bypass cost
  const etsCost = route === 'suez' ? 120 : 400; // carbon tax
  const leadTimeDelta = route === 'suez' ? 0 : 15; // +15 days

  const totalCost = baseFreight + surcharge + etsCost;

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <Globe2 size={22} color="var(--color-success)" />
        <div className={styles.toolTitle}>물류 우회 가중비용 환산기 (운임 & 탄소세)</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: 'auto' }}>📐 Estimate</span>
      </div>
      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>극동 → 유럽 (EU) 컨테이너 항로 옵션</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            style={{ flex: 1, padding: '0.8rem', borderRadius: '6px', background: route === 'suez' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.2)', border: `1px solid ${route === 'suez' ? 'var(--color-success)' : '#334155'}`, color: route === 'suez' ? 'var(--color-success)' : '#cbd5e1', cursor: 'pointer' }}
            onClick={() => setRoute('suez')}
          >
            기본 수에즈 운하 (정상)
          </button>
          <button 
            style={{ flex: 1, padding: '0.8rem', borderRadius: '6px', background: route === 'cape' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0,0,0,0.2)', border: `1px solid ${route === 'cape' ? 'var(--color-danger)' : '#334155'}`, color: route === 'cape' ? 'var(--color-danger)' : '#cbd5e1', cursor: 'pointer' }}
            onClick={() => setRoute('cape')}
          >
            희망봉 우회 (홍해 차질)
          </button>
        </div>
      </div>
      
      <div className={styles.costGrid} style={{ gridTemplateColumns: '1fr' }}>
        <div className={styles.costInputs}>
          <div className={styles.costRow}>
            <div className={styles.costLabel}>기본 해상 운임 (Base Freight)</div>
            <div className={styles.costValue}>${baseFreight.toLocaleString()}/TEU</div>
          </div>
          <div className={styles.costRow} style={{ color: route === 'cape' ? 'var(--color-danger)' : 'inherit' }}>
            <div className={styles.costLabel}>우회 할증료 (Surcharge)</div>
            <div className={styles.costValue}>+ ${surcharge.toLocaleString()}</div>
          </div>
          <div className={styles.costRow} style={{ color: route === 'cape' ? 'var(--color-warning)' : 'inherit' }}>
            <div className={styles.costLabel}>EU ETS 탄소배출 패널티</div>
            <div className={styles.costValue}>+ ${etsCost.toLocaleString()}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <div className={styles.totalCostCard} style={{ flex: 1 }}>
            <div className={styles.totalLabel}>실질 화물 코스트</div>
            <div className={styles.totalValue}>${totalCost.toLocaleString()}<span className={styles.totalUnit}>/TEU</span></div>
          </div>
          <div className={styles.totalCostCard} style={{ flex: 1, background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div className={styles.totalLabel}>리드타임 딜레이</div>
            <div className={styles.totalValue} style={{ color: 'var(--color-warning)' }}>+{leadTimeDelta} 일</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 9: Holding vs Tariff Hedge Spread
 * ═══════════════════════════════════════════════ */
function StorageTariffCalculator() {
  const [holdingDays, setHoldingDays] = useState(60);
  const importVolume = 500; // MT
  const storageCostPerMtDay = 1.2; // -60도 냉동창고
  const rawValuePerMt = 1800; // 수입 단가
  
  const storageTotalCost = importVolume * holdingDays * storageCostPerMtDay;
  const tariffSaving = importVolume * rawValuePerMt * 0.20; // 20% 관세 절감
  const netHedgeProfit = tariffSaving - storageTotalCost;
  const bepDays = Math.round((rawValuePerMt * 0.20) / storageCostPerMtDay);

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <Thermometer size={22} color="#38bdf8" />
        <div className={styles.toolTitle}>관세 장벽 vs 한파 창고료 손익분기 (Hedge BEP)</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: 'auto' }}>📐 Estimate</span>
      </div>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', marginTop: '0.8rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>사전 비축 (관세 면제 기대) 일수 설정</div>
          <input 
            type="range" 
            min="10" max="300" 
            value={holdingDays} 
            onChange={e => setHoldingDays(+e.target.value)} 
            style={{ width: '100%', accentColor: netHedgeProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }} 
          />
          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>
            {holdingDays}일 대기
          </div>
        </div>
        
        <div style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>예상 창고료 (-60°C)</span>
            <span style={{ color: 'var(--color-danger)' }}>-${storageTotalCost.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>관세 폭탄 회피 수익 (20%)</span>
            <span style={{ color: 'var(--color-success)' }}>+${tariffSaving.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontWeight: 700 }}>
            <span>순수 헤지 손익</span>
            <span style={{ color: netHedgeProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {netHedgeProfit >= 0 ? '+' : '-'}${Math.abs(netHedgeProfit).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.insightBox} style={{ borderLeftColor: netHedgeProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
        창고 유지비가 관세 수익을 갉아먹기 시작하는 <strong>데드라인(BEP)은 {bepDays}일</strong>입니다. 가급적 {bepDays}일 이내에 원물을 공장에 투입하거나 출하해야 비축의 의미가 있습니다.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 10: Yield-Freight Spread
 * ═══════════════════════════════════════════════ */
function YieldFreightSpread() {
  const [oceanFreight, setOceanFreight] = useState(200); // per MT
  const laborLocal = 150; // 국내 공장 인건비/MT
  const laborOverseas = 45; // 해외 현지 임가공/MT
  
  // Whole Round vs Loin Eq
  const yieldRatio = 0.45; // 45% 정육
  const wholeCost = (1600 + oceanFreight + laborLocal);
  const loinEquivalentCost = wholeCost / yieldRatio; // 실제 1톤의 Loin을 얻기 위해 들어가는 총비용
  
  const loinImportPrice = 3800; // 해외 가공 완료된 Loin 직수입 단가
  const directLoinCost = loinImportPrice + oceanFreight; // 운임 합산

  const delta = directLoinCost - loinEquivalentCost;
  const recommendLoin = delta < 0;

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <Ship size={22} color="#8b5cf6" />
        <div className={styles.toolTitle}>원어 수입 vs 1차 가공(Loin) 직수입 단가 분기점</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: 'auto' }}>📐 Estimate</span>
      </div>
      
      <div className={styles.costGrid} style={{ marginBottom: '1.5rem', marginTop: '0.8rem' }}>
        <div className={styles.costInputs}>
          <div className={styles.costRow}>
            <div className={styles.costLabel}>현재 냉동 해상운임 트렌드</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>$</span>
              <input className={styles.costInput} type="number" value={oceanFreight} onChange={e => setOceanFreight(+e.target.value)} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/MT</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div className={styles.totalCostCard} style={{ flex: 1, background: recommendLoin ? 'rgba(255,255,255,0.03)' : 'rgba(16, 185, 129, 0.1)', border: recommendLoin ? '1px solid rgba(255,255,255,0.05)' : '1px solid #10b981' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>A안. 원어 수입 후 국내 가공 (통관/폐기 포함)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>${Math.round(loinEquivalentCost).toLocaleString()}<span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}> / Meat 1MT당</span></div>
        </div>
        <div className={styles.totalCostCard} style={{ flex: 1, background: recommendLoin ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.03)', border: recommendLoin ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>B안. 현지 Loin(뼈 제거) 수입 (가공마진 포함)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>${Math.round(directLoinCost).toLocaleString()}<span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}> / Loin 1MT당</span></div>
        </div>
      </div>

      <div className={styles.insightBox} style={{ borderLeftColor: recommendLoin ? '#8b5cf6' : 'var(--color-success)' }}>
        {recommendLoin ? (
           <><strong>Loin(1차 가공육) 수입 권장:</strong> 해상운임과 국내 인건비 상승으로 인해, 버려질 부산물(55%)까지 운임을 내느니 해외에서 Loin을 수입하는 것이 Loin 1톤당 <strong>${Math.abs(Math.round(delta)).toLocaleString()} 유리</strong>합니다.</>
        ) : (
           <><strong>원어 상태 직수입 권장:</strong> 아직 운임이 감당할 만한 수준이라 원어를 그대로 들여와 국내 공장 수율을 극대화하는 게 <strong>${Math.round(delta).toLocaleString()} 절감</strong>됩니다.</>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 11: FX vs Cost Shock Index
 * ═══════════════════════════════════════════════ */
function ExchangeShockIndex() {
  const [fxRate, setFxRate] = useState(1350); // KRW/USD
  const baseCostUSD = 1800; // 가다랑어 원어 수입 단가 (USD)
  const previousFxRate = 1300;
  
  const costKRW = baseCostUSD * fxRate;
  const previousCostKRW = baseCostUSD * previousFxRate;
  const shockDelta = costKRW - previousCostKRW;
  const shockPercent = (shockDelta / previousCostKRW) * 100;

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <DollarSign size={22} color="var(--color-warning)" />
        <div className={styles.toolTitle}>환율-원가 충격 기상도 (FX Shock Index)</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: 'auto' }}>📐 Estimate</span>
      </div>
      
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>목표 환율 (KRW/USD) 시뮬레이션</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>₩</span>
            <input 
              type="number" 
              className={styles.costInput} 
              style={{ fontSize: '1.5rem', width: '120px', padding: '0.5rem' }} 
              value={fxRate} 
              onChange={e => setFxRate(+e.target.value)} 
            />
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>기준 환율: ₩{previousFxRate} (전분기 평균)</div>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className={styles.totalCostCard} style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)', padding: '1rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.2rem' }}>1MT 수입 원가 (KRW 환산)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>₩{(costKRW / 10000).toFixed(1)}만</div>
          </div>
          <div className={styles.totalCostCard} style={{ background: shockPercent > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderColor: shockPercent > 0 ? 'var(--color-danger)' : 'var(--color-success)', padding: '1rem' }}>
            <div style={{ color: shockPercent > 0 ? '#fca5a5' : '#6ee7b7', fontSize: '0.8rem', marginBottom: '0.2rem' }}>환차손익 충격 (vs 전분기)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: shockPercent > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {shockPercent > 0 ? '+' : ''}{shockPercent.toFixed(1)}% (₩{(shockDelta / 10000).toFixed(1)}만)
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.insightBox} style={{ borderLeftColor: shockPercent > 5 ? 'var(--color-danger)' : 'var(--color-warning)' }}>
        {shockPercent > 5 ? (
          <>⚠️ <strong>환 충격 심각:</strong> 원가 상승분이 5%를 초과했습니다. 제품 출고가 인상 협상을 시작하거나, 외환(선물환) 헤지 비율을 즉각 상향 조정하십시오.</>
        ) : (
          <><strong>환율 안정권:</strong> 환율 등락에 따른 수입단가 변동성이 통제 가능한 범위 내에 있습니다. 현재 환오픈 포지션 비율 유지를 권장합니다.</>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 12: Retail-Wholesale Price Asymmetry
 * ═══════════════════════════════════════════════ */
function PriceAsymmetryChart() {
  const data = [
    { month: '1월', raw: 1500, wholesale: 2100, retail: 3500 },
    { month: '2월', raw: 1550, wholesale: 2150, retail: 3500 },
    { month: '3월', raw: 1650, wholesale: 2200, retail: 3550 },
    { month: '4월', raw: 1800, wholesale: 2350, retail: 3600 },
    { month: '5월', raw: 1750, wholesale: 2400, retail: 3650 },
    { month: '6월', raw: 1600, wholesale: 2300, retail: 3650 },
  ];

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <BarChart2 size={22} color="#0ea5e9" />
        <div className={styles.toolTitle}>B2C 소매가 비대칭성 모니터 (Rockets & Feathers)</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: 'auto' }}>📐 Estimate</span>
      </div>
      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
        "로켓처럼 오르고 깃털처럼 내린다" - 원어가는 하락해도 참치캔 소비자가는 유지되는 현상 추적
      </div>
      
      <div style={{ height: '250px', marginBottom: '1.5rem' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickMargin={10} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '0.85rem' }} itemStyle={{ color: 'var(--text-primary)' }} />
            <Line type="monotone" dataKey="retail" name="소비자가 (대형마트 캔)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9' }} />
            <Line type="monotone" dataKey="wholesale" name="도매가 (공장 출고)" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="raw" name="원어가 (방콕 CFR)" stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>

      <div className={styles.insightBox} style={{ borderLeftColor: '#0ea5e9' }}>
        <strong>분석 인텔리전스:</strong> 6월들어 원어가(방콕 CFR)는 급락($1,750→$1,600)했으나, 소매가는 $3,650에 고정되어 있습니다. 이 '비대칭 마진(Asymmetric Margin)' 구간에서는 B2C 참치캔 프로모션(1+1 등) 여력이 크게 확대됩니다. 대형마트 유통망과의 행사 기획을 제안하십시오.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 13: Substitution Elasticity Monitor
 * ═══════════════════════════════════════════════ */
function SubstitutionElasticityMonitor() {
  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <Activity size={22} color="#ec4899" />
        <div className={styles.toolTitle}>어종별 가격 대체 탄력성 모니터링</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: 'auto' }}>📐 Estimate</span>
      </div>
      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
        연어/닭가슴살 가격 변동이 캔참치 수요에 미치는 영향성(교차탄력성) 분석
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className={styles.kpiBox} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>노르웨이 연어 (Salmon)</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>단가 추이: 사상 최고치 경신 중 (+18%)</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.2rem' }}>교차탄력성 지수</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ec4899' }}>+0.45 <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-success)' }}>(대체수요 유입중)</span></div>
          </div>
        </div>

        <div className={styles.kpiBox} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>육계 (Chicken Breast)</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>단가 추이: 조류독감(AI) 영향 완화 (-5%)</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.2rem' }}>교차탄력성 지수</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8' }}>-0.12 <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-danger)' }}>(단백질 수요 이탈 우려)</span></div>
          </div>
        </div>
      </div>
      
      <div className={styles.insightBox} style={{ marginTop: '1.2rem', borderLeftColor: '#ec4899' }}>
        프리미엄 단백질(연어)의 초강세로 인해, 서구권 식단에서 연어를 대체할 <strong>프리미엄 통조림(스테이크용 참치, 올리브유 캔)의 수요가 단기 급증</strong>하고 있습니다. 해당 품목의 마케팅/생산 비중을 확대하십시오.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 14: Ecolabel (MSC) ROI Calculator
 * ═══════════════════════════════════════════════ */
function EcolabelRoiCalculator() {
  const [certCost, setCertCost] = useState(250000); // 인증/감사 비용 (CAPEX 성격)
  const [volume, setVolume] = useState(15000); // 해당 조업선단 연간 어획량 MT
  
  const basePrice = 1650; // 일반 가다랑어 달러당 단가
  const mscPremiumPct = 5.0; // MSC 프리미엄 5%
  
  const mscPremiumDollar = basePrice * (mscPremiumPct / 100);
  const totalPremiumProfit = volume * mscPremiumDollar;
  
  const roi = ((totalPremiumProfit - certCost) / certCost) * 100;

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <Award size={22} color="var(--color-success)" />
        <div className={styles.toolTitle}>에코라벨 (MSC/FAD-Free) 인증 투자 수익률(ROI) 판별기</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: 'auto' }}>📐 Estimate</span>
      </div>
      
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1 }}>
          <div className={styles.costRow} style={{ marginBottom: '1rem' }}>
            <div className={styles.costLabel}>연간 인증/심사 유지비용</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>$</span>
              <input className={styles.costInput} type="number" value={certCost} onChange={e => setCertCost(+e.target.value)} style={{ width: '100px' }} />
            </div>
          </div>
          <div className={styles.costRow}>
            <div className={styles.costLabel}>적용 선단 연간 어획량</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input className={styles.costInput} type="number" value={volume} onChange={e => setVolume(+e.target.value)} style={{ width: '100px' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/MT</span>
            </div>
          </div>
        </div>
        
        <div style={{ flex: 1, padding: '1.2rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>예상 톤당 프리미엄 (MSC {mscPremiumPct}%)</span>
            <span style={{ color: 'var(--text-primary)' }}>+${Math.round(mscPremiumDollar)}/MT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>연간 프리미엄 총수익금</span>
            <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>+${Math.round(totalPremiumProfit).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>순수 인증 ROI (Return on Investment)</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: roi >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {roi > 0 && '+'}{roi.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.insightBox} style={{ borderLeftColor: 'var(--color-success)' }}>
        <strong>MSC 인증 적극 추진:</strong> 월마트, 테스코 등 글로벌 유통망의 ESG 소싱 의무화로 인해 MSC 라벨 부착 시 5~10%의 프리미엄을 기대할 수 있습니다. ROI가 으로 높으므로 즉시 어가 연합과 심사 절차에 착수하십시오.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
 * TOOL 15: Byproduct Upcycling Value Tracker
 * ═══════════════════════════════════════════════ */
function ByproductUpcycleTracker() {
  const data = [
    { name: '폐기 (기존납부금)', value: -80, color: 'var(--color-danger)' }, // MT당 처리비용
    { name: '어분/사료 분쇄', value: 45, color: 'var(--color-warning)' },
    { name: '펫푸드(습식)', value: 120, color: '#38bdf8' },
    { name: '콜라겐 추출가공', value: 380, color: '#ec4899' }, // 고부가가치업
  ];

  const chartData = data.map(d => ({
    name: d.name,
    profit: d.value > 0 ? d.value : 0,
    cost: d.value < 0 ? Math.abs(d.value) : 0,
    color: d.color
  }));

  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <Recycle size={22} color="#ec4899" />
        <div className={styles.toolTitle}>폐기물 업사이클링 (펫푸드·바이오) 수익화 트래커</div>
        <span className={styles.toolBadge} style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)', marginLeft: 'auto' }}>📐 Estimate</span>
      </div>
      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
        가다랑어 가공 시 발생하는 55%의 잔여물(뼈, 껍질, 내장) 1MT당 파생 가치
      </div>
      
      <div style={{ height: '220px', marginBottom: '1.5rem', padding: '0 10px' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={90} />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} 
              formatter={(value, name) => [`$${value}`, name === 'profit' ? '단순 수익' : '폐기 비용']} 
            />
            <Bar dataKey="cost" stackId="a" fill="url(#a11y-stripe-h)" color="var(--color-danger)" radius={[4, 0, 0, 4]} barSize={20} />
            <Bar dataKey="profit" stackId="a" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </SafeResponsiveContainer>
      </div>

      <div className={styles.insightBox} style={{ borderLeftColor: '#ec4899' }}>
        과거 마이너스 자산이었던 폐기물이 '펫푸드(습식용 파우치)' 및 '화장품용 해양 콜라겐' 원료로 고부가가치화되고 있습니다. 폐기 업체 납부를 중단하고 즉시 국내외 펫푸드 제휴사로의 직납 라인을 개설하십시오.
      </div>
    </div>
  );
}
