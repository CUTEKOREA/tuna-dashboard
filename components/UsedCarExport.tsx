'use client';
import React, { useState, useEffect } from 'react';
import { CarFront, TrendingUp, Globe, Ship, AlertTriangle, DollarSign, Package, Calculator, Fuel, Zap, ShieldCheck, Target, FileText, Anchor, BarChart3, ExternalLink, BookOpen, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import TermTooltip from './TermTooltip';
import TakeawayBox from './TakeawayBox';
import { MarketGrowthChart, MarketShareChart, ShippingCostChart, HybridGrowthChart, FuelPriceChart, AgePenaltyChart } from './UsedCarCharts';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const glass = { background: '#181818', border: 'none', borderRadius: '8px', padding: '1.5rem' } as const;
const cardTitle = { margin: '0 0 1rem 0', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' } as const;

// L-09/L-12: LIVE 판정은 라우트가 출력한 isLive === true 단일 기준. fetch 완료 여부로 SYNCED 격상 금지.
const DataBadge = ({ source, isLive = false, asOf }: { source?: string; isLive?: boolean; asOf?: string }) => (
  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: isLive ? 'var(--color-success)' : '#94a3b8', background: isLive ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.1)', padding: '2px 8px', borderRadius: '12px', border: 'none', marginLeft: '8px', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
    <span style={{ width: '6px', height: '6px', background: isLive ? 'var(--color-success)' : '#64748b', borderRadius: '50%', marginRight: '4px' }}></span>
    {isLive ? 'LIVE' : 'STATIC'} {source ? `· ${source}` : ''}{asOf ? ` · ${asOf}` : ''}
  </span>
);

function KpiCard({ icon, label, value, sub, color }: any) {
  return (
    <div style={{ background: '#181818', padding: '1.1rem', borderRadius: '8px', border: `1px solid ${color}33`, borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>{icon} {label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>{sub}</div>}
    </div>
  );
}

function RegTable({ data }: { data: any[] }) {
  const riskColor: Record<string,string> = { high: 'var(--color-danger)', medium: 'var(--color-warning)', low: 'var(--color-success)' };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
          {['국가','연식제한','수입관세','부가세','특이사항','매력도'].map(h => <th key={h} style={{ padding: '10px 8px' }}>{h}</th>)}
        </tr></thead>
        <tbody>{data.map((r: any, i: number) => (
          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <td style={{ padding: '10px 8px', color: '#e2e8f0', fontWeight: 600 }}>{r.country}</td>
            <td style={{ padding: '10px 8px', color: '#e2e8f0' }}>{r.ageLimit}년</td>
            <td style={{ padding: '10px 8px', color: '#e2e8f0' }}>{r.importDuty}</td>
            <td style={{ padding: '10px 8px', color: '#e2e8f0' }}>{r.vat}</td>
            <td style={{ padding: '10px 8px' }}><span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', background: `${riskColor[r.risk]}22`, color: riskColor[r.risk] }}>{r.special}</span></td>
            <td style={{ padding: '10px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ width: `${r.score}%`, height: '100%', borderRadius: '3px', background: r.score >= 80 ? 'var(--color-success)' : r.score >= 70 ? 'var(--color-warning)' : 'var(--color-danger)' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.score}</span>
              </div>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function GhanaCustomsCalculator({ exchangeRate = 14.5 }: { exchangeRate?: number }) {
  const [fobUsd, setFobUsd] = useState<number>(3000);
  const [freightUsd, setFreightUsd] = useState<number>(1000);
  const [engineCC, setEngineCC] = useState<number>(998);
  const [year, setYear] = useState<number>(2015);
  const currentYear = new Date().getFullYear(); // 2026
  const age = currentYear - year;

  // 1. CIF Calculation
  const cifUsd = fobUsd + freightUsd;
  const cifGhs = cifUsd * exchangeRate;

  // 2. Duty Rates
  let importDutyRate = 0.20;
  if (engineCC < 1000) importDutyRate = 0.05;
  else if (engineCC <= 1500) importDutyRate = 0.10;
  
  let agePenaltyRate = 0;
  if (age > 15) agePenaltyRate = 0.50;
  else if (age > 12) agePenaltyRate = 0.20;
  else if (age > 10) agePenaltyRate = 0.05;

  // 3. Tax Calculation (GHS)
  const importDuty = cifGhs * importDutyRate;
  const agePenalty = cifGhs * agePenaltyRate;
  const baseValue = cifGhs + importDuty + agePenalty;

  const nhil = baseValue * 0.025;
  const getFund = baseValue * 0.025;
  const vat = (baseValue + nhil + getFund) * 0.15;
  
  const ecowas = cifGhs * 0.005;
  const exim = cifGhs * 0.0075;
  const inspection = cifGhs * 0.01;

  const totalTaxesGhs = importDuty + agePenalty + nhil + getFund + vat + ecowas + exim + inspection;
  const totalTaxesUsd = totalTaxesGhs / exchangeRate;
  const landedCostUsd = cifUsd + totalTaxesUsd;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', marginTop: '0.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: '#181818', padding: '1.25rem', borderRadius: '8px', border: 'none' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>FOB 차량 매입가 (USD)</label>
          <input type="number" value={fobUsd} onChange={e => setFobUsd(Number(e.target.value))} style={{ width: '100%', padding: '10px', background: '#181818', border: 'none', borderRadius: '8px', color: '#e2e8f0' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>해상 운임 (USD)</label>
          <input type="number" value={freightUsd} onChange={e => setFreightUsd(Number(e.target.value))} style={{ width: '100%', padding: '10px', background: '#181818', border: 'none', borderRadius: '8px', color: '#e2e8f0' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>배기량 (CC)</label>
          <select value={engineCC} onChange={e => setEngineCC(Number(e.target.value))} style={{ width: '100%', padding: '10px', background: '#181818', border: 'none', borderRadius: '8px', color: '#e2e8f0' }}>
            <option value={998}>~ 1.0L (기본관세 5%)</option>
            <option value={1498}>1.1L ~ 1.5L (기본관세 10%)</option>
            <option value={1998}>1.6L ~ 3.0L (기본관세 20%)</option>
            <option value={3500}>3.0L 초과 (기본관세 20%)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>제작 연도</label>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} style={{ width: '100%', padding: '10px', background: '#181818', border: 'none', borderRadius: '8px', color: '#e2e8f0' }} />
        </div>
      </div>
      
      <div style={{ background: 'rgba(139,92,246,0.05)', padding: '1.5rem', borderRadius: '8px', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>과세 표준 금액 (CIF)</span>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>${cifUsd.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>기본 수입 관세 ({(importDutyRate*100).toFixed(0)}%)</span>
          <span style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>+ ${(importDuty/exchangeRate).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>연식 초과 페널티 ({age}년 경과, {(agePenaltyRate*100).toFixed(0)}%)</span>
          <span style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>+ ${(agePenalty/exchangeRate).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>기타 제세공과금 (VAT 15%, NHIL 2.5%, 등)</span>
          <span style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>+ ${((nhil + getFund + vat + ecowas + exim + inspection)/exchangeRate).toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: '1rem' }}>통관 예상 총 세액 (Total Taxes)</span>
          <span style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: '1.1rem' }}>${totalTaxesUsd.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '12px 16px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', border: 'none' }}>
          <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '1.1rem' }}>가나 현지 최종 랜딩 코스트</span>
          <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '1.4rem' }}>${landedCostUsd.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
        </div>
      </div>
    </div>
  );
}

export default function UsedCarExport() {
  const [data, setData] = useState<any>(null);
  const [fx, setFx] = useState<any>(null); // 원/달러 환율 — /api/exchange 소비 (isLive 판정 포함)
  const [activeCountry, setActiveCountry] = useState('all');

  useEffect(() => {
    fetch('/api/used-car').then(r => r.json()).then(setData).catch(console.error);
    fetch('/api/exchange').then(r => r.json()).then(setFx).catch(() => {});
  }, []);

  if (!data) return <div style={{ padding: '2rem', color: '#94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>데이터를 불러오는 중입니다...</div>;

  const { marketGrowth, countryRegulations, shippingCostChart, marketShareTrend, fuelPrices, hybridGrowth, ghanaAgePenalty, kpiSummary, jijiGhanaData, arbitrageRadar } = data;
  const isLive = data?.isLive === true; // L-12: 라우트가 정직 표기한 라이브 여부 (현재 정적 스냅샷 = false)

  // 가나 GRA 연식 페널티 — 렌더 시점 계산 (하드코딩 연도 동결 방지)
  const nowYear = new Date().getFullYear();
  const age2012 = nowYear - 2012;
  const penalty2012 = age2012 > 15 ? 50 : age2012 > 12 ? 20 : age2012 > 10 ? 5 : 0; // 관세 시뮬레이터와 동일 구간 기준
  const year50For2012 = 2012 + 16; // 경과 연수 > 15년부터 50% 구간 (시뮬레이터 산식과 동일)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', animation: 'fadeIn 0.5s ease-out' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CarFront size={28} color="var(--color-info)" /> 서아프리카 중고차 수출 전략 인텔리전스
        </h2>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['🇬🇭 가나','🇳🇬 나이지리아','🇸🇳 세네갈','🇨🇮 코트디부아르'].map(c => (
            <span key={c} style={{ padding: '4px 10px', background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: '8px', fontSize: '0.78rem', color: '#60a5fa' }}>{c}</span>
          ))}
        </div>
      </div>

      {/* KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        <KpiCard icon={<TrendingUp size={14}/>} label="2025 수출액" value={kpiSummary.totalExport2025} sub="사상 최고치" color="var(--color-success)" />
        <KpiCard icon={<BarChart3 size={14}/>} label="전년 대비 성장" value={kpiSummary.exportGrowth} sub="수출 물량 88만대" color="var(--color-info)" />
        <KpiCard icon={<Globe size={14}/>} label="국내시장 CAGR" value={kpiSummary.domesticCAGR} sub="2024→2030" color="var(--color-warning)" />
        <KpiCard icon={<Zap size={14}/>} label="하이브리드 CAGR" value={kpiSummary.hybridCAGR} sub="2024→2030 / $302B" color="#8b5cf6" />
        <KpiCard icon={<CarFront size={14}/>} label="나이지리아 EV 합작" value={kpiSummary.nigeriaEVCapacity} sub="아프리카 최초 EV 공장" color="#ec4899" />
      </div>

      {/* ROW 1: Market Growth + Market Share */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        <div style={glass}>
          <h3 style={cardTitle}><TrendingUp size={18} color="var(--color-success)" /> 한국 중고차 시장 규모 & 수출 추이 <DataBadge source="Grand View Research·Just Auto 2025" isLive={isLive} />

          </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          한국 중고차 수출 규모(막대)와 국내 중고차 시장 규모(면적)의 연도별 추이를 2030년 전망치까지 복합 차트로 시각화합니다. Just Auto·KED Global의 2025년 수출 실적 통계와 Grand View Research·Research and Markets의 국내 시장 전망 보고서를 결합해 구성했습니다.
        </p>
          <MarketGrowthChart data={marketGrowth} />
          <TakeawayBox
            source="Grand View Research, Just Auto 2025"
            situation="한국 중고차 수출액은 2025년 $8.9B(YoY +75.1%)를 돌파하며 역사적 고점(All-time High)을 경신. 동시에 2030년 $926B 규모로 팽창(CAGR 12.7%)하는 국내 내수 시장은 아프리카향 수출 물량을 구조적으로 떠받치는 거대한 매물 공급 풀(Pool)로 작용하고 있음."
            actionPlan="국내 잉여 재고(Oversupply)와 서아프리카의 폭발적 수입 수요가 겹치는 펀더멘털 골든 윈도우 진입. 자본을 투입해 인천항 장기 재고를 즉각 싹쓸이(Sweep) 매입하고, 서아프리카 물류 파이프라인(RoRo/CNTR)을 장악하여 극대화된 마진 스프레드를 온전히 향유(Capture)할 것."
          />
        </div>
        <div style={glass}>
          <h3 style={cardTitle}><Globe size={18} color="var(--color-info)" /> 서아프리카 중고차 시장 점유율 변동 <DataBadge source="KED Global·Arirang News" isLive={isLive} />

          </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          서아프리카(나이지리아, 가나 중심) 중고차 수입 시장에서 한국차, 일본차, 유럽차의 연도별 점유율(%) 변화를 Stacked Bar로 시각화합니다. 한국차가 일본차를 역전하는 교차 구간을 확인할 수 있습니다. KED Global의 수출 통계, Arirang News의 시장 분석, 현지 딜러 인터뷰 데이터를 종합하여 국가별 수입 대수 기준 비율을 산출했습니다.
        </p>
          <MarketShareChart data={marketShareTrend} />
          <TakeawayBox
            source="KED Global, Arirang News"
            situation="서아프리카 시장 내 한국차(M/S 42%)가 일본차(37%)를 제치고 패권(Hegemony)을 장악하는 퀀텀 크로스가 발생. 좌핸들(LHD) 강제 규제와 가성비는, 나이라(NGN)/세디(GHS) 폭락으로 신음하는 현지 바이어들에게 구조적 대체재로 완벽히 자리 잡음."
            actionPlan="아프리카 모빌리티 패권이 이동하는 티핑 포인트. 현대·기아의 핵심 애프터마켓(Abossey Okai 등)에 순정/OEM 부품 조달망을 선제적으로 침투(Penetration)시켜 잔존가치(Resale Value)를 방어하고, 수십 년간 고착화된 토요타 의존도(Exposure)를 영구히 붕괴시키는 Lock-in 전략을 구사할 것."
          />
        </div>
      </div>

      {/* ROW 2: Country Regulations Table */}
      <div style={glass}>
        <h3 style={cardTitle}><ShieldCheck size={18} color="var(--color-warning)" /> 서아프리카 4개국 중고차 수입 규제 비교 <DataBadge source="GRA·NCS 공식 규정" isLive={isLive} />

        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          나이지리아, 가나, 세네갈, 코트디부아르의 중고차 수입 관련 핵심 규제(연식 제한, 관세율, 부가세, 특이사항)를 한 눈에 비교합니다. 각국 관세청 공식 문서, Wheelzar/WC Shipping의 실무 가이드, Seneweb/CNBC Africa의 최신 규제 변경 보도를 교차 검증하여 정리했습니다. 매력도 스코어는 (관세 부담 역수 40% + 시장 규모 30% + 물류 인프라 30%)로 산출됩니다.
        </p>
        <RegTable data={countryRegulations} />
        <div style={{ marginTop: '1rem' }}>
          <TakeawayBox
            source="Wheelzar, WC Shipping, Seneweb, CNBC Africa"
            situation="나이지리아(12년), 가나(10년) 등 핵심 타겟 국가의 수입 연식 상한 규제가 무역 밸류체인의 최대 병목(Bottleneck) 요인. 특히 나이지리아가 2026년 하반기부터 2.0L 초과 차량에 징벌적 Green Tax를 강행함에 따라 엑스트라 OPEX 리스크가 점증."
            actionPlan="규제의 틈새(Loophole)를 정밀 타격하는 포트폴리오 리밸런싱 지시: 가나는 1,000cc 미만 경차(관세 5% Tier)로 대량 진입, 나이지리아는 Green Tax가 완전 면제되는 하이브리드(HEV) 차종으로 전량 피봇. 세네갈의 연식 규제 완화(10년) 윈도우는 구형 재고 소진의 즉각적 캐시카우로 활용."
          />
        </div>
      </div>

      {/* ROW 2.5: Jiji Ghana Insight (2026-04-27 스크래핑 스냅샷) */}
      <div style={glass}>
        <h3 style={cardTitle}><AlertTriangle size={18} color="#ec4899" /> Jiji 가나 매물 & 차익거래 레이더 <DataBadge source="Jiji 가나 스크래핑" isLive={isLive} asOf={data?.dataAsOf} />

        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          가나 최대 온라인 마켓플레이스 Jiji에 등록된 현대/기아차 1,424대의 실거래 희망가(Asking Price)를 스크래핑하여 분석한 인사이트입니다. 2026년 4월 27일 기준 매물 1,424개(현대 1,027대, 기아 397대)를 Python 기반 자체 크롤러로 전수 조사 후 달러 환산(1 USD = 14.5 GHS)을 적용했습니다.
        </p>
        
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              <KpiCard icon={<CarFront size={14}/>} label="총 수집 매물 수" value={`${jijiGhanaData?.totalScraped?.toLocaleString() || 1424}대`} sub="현대/기아 승용 및 SUV" color="var(--color-info)" />
              <KpiCard icon={<DollarSign size={14}/>} label="현대 평균 소매가" value={`$${jijiGhanaData?.avgPrice?.hyundai?.toLocaleString() || '11,499'}`} sub="2012~2020년식 기준" color="var(--color-success)" />
              <KpiCard icon={<DollarSign size={14}/>} label="기아 평균 소매가" value={`$${jijiGhanaData?.avgPrice?.kia?.toLocaleString() || '11,046'}`} sub="2012~2020년식 기준" color="var(--color-warning)" />
              <KpiCard icon={<Target size={14}/>} label="최적의 마진 구간" value="$2,500+" sub="FOB $5K 매입 시 (대당)" color="#ec4899" />
            </div>
            
            <div style={{ background: '#181818', borderRadius: '8px', padding: '1rem', border: 'none' }}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '8px' }}>🔥 현지 Top 3 인기 모델 (스크래핑 데이터)</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 'bold' }}>Hyundai</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: '1.2rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {jijiGhanaData?.topModels?.filter((m: any) => m.brand === 'Hyundai').slice(0,3).map((m: any, i: number) => (
                      <li key={i}>{m.model} ({m.count}건)</li>
                    ))}
                  </ul>
                </div>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 'bold' }}>Kia</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: '1.2rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {jijiGhanaData?.topModels?.filter((m: any) => m.brand === 'Kia').slice(0,3).map((m: any, i: number) => (
                      <li key={i}>{m.model} ({m.count}건)</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ flex: 1, minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
              <div style={{ color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>명분 1: SUV 프리미엄 확증 (Data-backed)</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.5 }}>
                싼타페, 투싼, 쏘렌토, 스포티지가 양사 상위권을 차지합니다. 비포장 도로가 많은 현지 특성상 세단 대비 SUV에 +15~20% 프리미엄이 형성되어 수익 창출의 핵심 동력이 됩니다.
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
              <div style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>명분 2: 기아 모닝(Morning)의 폭발적 가성비</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.5 }}>
                기아 모닝이 68건으로 기아 모델 중 3위를 기록하며 현지 라이드헤일링(Uber/Bolt) 택시용 수요를 입증했습니다. 배기량 1,000cc 미만으로 가나 최저 수입 관세(5%) 혜택을 누릴 수 있습니다.
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(236,72,153,0.08)', borderRadius: '8px', borderLeft: '3px solid #ec4899' }}>
              <div style={{ color: '#f472b6', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>명분 3: 강한 $11,000 스윗스팟</div>
              <div style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.5 }}>
                현지 소매가 $11,000 수준은 동급 일본차 대비 20% 저렴하면서도 현지 중산층이 대출(Loan)로 구매 가능한 최적의 가격대입니다. 원화 약세를 활용한 무위험 차익거래 기회입니다.
              </div>
            </div>
          </div>
        </div>

        {/* --- 차익거래 레이더 (Arbitrage Radar) — 2026.04 정적 기준값 기반 추정 예시 --- */}
        {arbitrageRadar && arbitrageRadar.arbitrageOpportunities && (
          <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '1.25rem', border: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} /> 차익거래 레이더 (2026.04 기준 추정 예시)
              </h4>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                기준 환율({arbitrageRadar.asOf || '2026-04-27'}): 1 USD = {arbitrageRadar.exchangeRates?.GHS_USD} GHS | 운임 기준값(40ft, 포워더 견적): ${Number(arbitrageRadar.freightRates?.Tema_40ft || 0).toLocaleString()}
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>타겟 차종</th>
                    <th style={{ padding: '8px' }}>FOB 매입가 (추정)</th>
                    <th style={{ padding: '8px' }}>현지 소매가 (Jiji)</th>
                    <th style={{ padding: '8px' }}>예상 제세공과금</th>
                    <th style={{ padding: '8px' }}>대당 순마진 (Net)</th>
                    <th style={{ padding: '8px' }}>액션</th>
                  </tr>
                </thead>
                <tbody>
                  {arbitrageRadar.arbitrageOpportunities.map((opp: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 8px', color: '#e2e8f0', fontWeight: 600 }}>{opp.model}</td>
                      <td style={{ padding: '10px 8px', color: '#94a3b8' }}>${opp.fobKorea.toLocaleString()}</td>
                      <td style={{ padding: '10px 8px', color: '#94a3b8' }}>${opp.retailGhana.toLocaleString()}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--color-danger)' }}>-${opp.estTaxes.toLocaleString()}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--color-success)', fontWeight: 700 }}>
                        ${Math.round(opp.netMargin).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <button style={{ background: 'var(--color-info)', color: 'var(--text-primary)', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                          매입 타겟 지정
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ROW 3: Shipping + Fuel + Ghana Age Penalty */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        <div style={glass}>
          <h3 style={cardTitle}><Ship size={18} color="var(--color-success)" /> 해상 운송 비용 비교 (RoRo vs 컨테이너) <DataBadge source="포워더 견적 2026.04" isLive={isLive} />

          </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          인천항에서 서아프리카 4개 항구(테마, 라고스, 다카르, 아비장)까지의 해상 운송 비용을 RoRo(자동차 전용선)와 40ft HC 컨테이너 두 방식으로 비교합니다. Linear Shipping, Alkady Cars, WC Shipping, Ship Overseas 등 복수의 해운 포워더 견적을 크로스체크하여 2026년 기준 평균 운임을 산출했습니다. RoRo는 단일 차량 기준, 컨테이너는 40ft HC 1개 기준입니다.
        </p>
          <ShippingCostChart data={shippingCostChart} />
          <TakeawayBox
            source="Linear Shipping, Alkady Cars, WC Shipping"
            situation="해상 물류(Freight) 채널에서, 단가 효율이 15~30% 우수한 RoRo선과 고부가 부품 혼적이 가능한 40ft HC 컨테이너($4,500/테마) 간의 트레이드오프(Trade-off) 딜레마가 심화 중. 단일 물류 방식 고집은 매입원가 최적화 실패의 지름길임."
            actionPlan="화물 특성에 따른 이원화 배차(Bi-modal Routing) 강제 적용. 마진 룸이 큰 고부가 SUV는 RoRo를 통해 리드타임을 단축하고, 경·소형차(6대 팩) 및 애프터마켓 부품은 40ft HC 혼적 셔틀로 편성하여 대당 물류 단가(Unit Cost)를 파괴적으로 억제(Minimizing)할 것."
          />
        </div>
        <div style={glass}>
          <h3 style={cardTitle}><Fuel size={18} color="var(--color-danger)" /> 서아프리카 연료 가격 동향 (2026.4) <DataBadge source="GlobalPetrolPrices 2026.04" isLive={isLive} />

          </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          서아프리카 주요 6개국의 2026년 4월 기준 휘발유 소매가($/L)를 비교합니다. $1.50/L 이상인 국가는 빨간색, 미만은 주황색으로 표시하여 고유가 리스크 지역을 시각적으로 구분합니다. Business Insider Africa의 2026년 4월 보도와 GlobalPetrolPrices 집계 데이터를 기반으로 정리했습니다.
        </p>
          <FuelPriceChart data={fuelPrices} />
          <TakeawayBox
            source="Business Insider Africa 2026"
            situation="나이지리아 유가($1.85/L)가 50% 폭등하며 심리적 저항선을 돌파, 세네갈($1.60) 또한 살인적 인플레이션에 직면. 아프리카 현지의 주유 비용(TCO) 폭동은 고연비 차량과 하이브리드에 대한 폭발적 팬트업(Pent-up) 수요를 강제 점화시키고 있음."
            actionPlan="매크로발(Macro) 유가 쇼크를 역이용한 세일즈 피치(Sales Pitch) 강화. 한국산 경차 및 하이브리드의 '연비 TCO 절감 시뮬레이션' 데이터를 현지 B2B 딜러망에 배포하여, 딜러들이 고연비 차량에 즉각적인 프리미엄 프라이싱(Premium Pricing)을 적용토록 넛지(Nudge)할 것."
          />
        </div>
      </div>

      {/* ROW 4: Hybrid Growth + Ghana Penalty */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        <div style={glass}>
          <h3 style={cardTitle}><Zap size={18} color="#8b5cf6" /> 한국 중고차 파워트레인별 성장 전망 <DataBadge source="Coherent MI·R&M 2025" isLive={isLive} />

          </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          한국 국내 중고차 시장을 내연기관, 하이브리드, 전기차 세 카테고리로 분류하여 2024~2030년 시장 규모(억 달러) 전망을 Stacked Bar로 시각화합니다. 하이브리드가 CAGR 15.9%로 가장 빠른 성장을 보입니다. Coherent Market Insights의 Hybrid Vehicles Market 보고서(2026-2033)와 Research and Markets의 한국 중고차 시장 보고서(2025-2034)의 파워트레인별 세분화 데이터를 결합했습니다.
        </p>
          <HybridGrowthChart data={hybridGrowth} />
          <TakeawayBox
            source="Coherent Market Insights, R&M 2025"
            situation="한국 하이브리드 중고차 시장은 2030년 $302B 규모(CAGR 15.9%)로 팽창하며 레거시 내연기관(11.3%)을 압살(Outperform)할 전망. 이는 나이지리아의 Green Tax 면제 혜택 및 현지 펌프가(Pump Price) 상승과 맞물려 강한 수요-공급 정렬(Alignment)을 달성."
            actionPlan="내연기관 중심의 1차원적 매집 프로세스를 폐기. 하이브리드 중고차 라인업 선점 후, 한국-나이지리아 EV 합작 법인(연 30만대) 파이프라인과 전략적 연계(Strategic Tie-up)를 구축하여, 'HEV 수출 → 현지 EV 조립'으로 전환되는 2단계 밸류 점프(Value Jump) 시나리오를 가동할 것."
          />
        </div>
        <div style={glass}>
          <h3 style={cardTitle}><AlertTriangle size={18} color="var(--color-warning)" /> 가나 연식 초과 페널티 구조 <DataBadge source="GRA·WC Shipping 규정" isLive={isLive} />

          </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          가나(GRA/ICUMS)의 중고차 수입 시 차량 연식에 따른 추가 페널티율(CIF 가격 대비 %)을 시각화합니다. 연식이 오래될수록 기하급수적으로 페널티가 증가하는 구조입니다. 가나 관세청(GRA) 공식 규정 및 WC Shipping의 통관 실무 가이드를 교차 검증하여 구간별 페널티율을 정리했습니다.
        </p>
          <AgePenaltyChart data={ghanaAgePenalty} />
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.05)', border: 'none', borderRadius: '8px' }}>
            <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} /> 15년 초과 시 CIF 50% 폭탄 페널티
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>
              2012년식 차량은 {nowYear}년 기준 {age2012}년 경과로 <strong>{penalty2012}% 페널티</strong> 구간입니다. {age2012 > 15 ? (
                <>이미 50% 페널티 구간에 진입한 상태입니다.</>
              ) : (
                <>경과 연수가 15년을 초과하는 {year50For2012}년부터 50% 구간에 진입하므로 <strong>그 전 통관이 필수</strong>입니다.</>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 5: 현지 마켓 & EV 합작 */}
      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        <div style={glass}>
          <h3 style={cardTitle}><Target size={18} color="#ec4899" /> 현지 핵심 유통 허브

          </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          서아프리카에서 한국 중고차 및 부품이 유통되는 핵심 거점(마켓, 항만)의 현황과 디지털화 수준을 정리합니다. 부품 생태계 확보가 잔존가치 방어의 핵심입니다. Wikipedia(Ladipo Market), Apple App Store(Abossey Okai), Jiji Ghana, LadipoExpress 등의 실제 서비스를 직접 확인하고, 현지 보도 자료를 교차 검증하여 정리했습니다.
        </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { flag: '🇳🇬', name: 'Ladipo Market (라고스)', desc: '아프리카 최대 자동차 부품 허브. LadipoExpress 앱을 통해 한국 정품부품 온라인 주문 체계 구축 완료', color: 'var(--color-success)' },
              { flag: '🇬🇭', name: 'Abossey Okai (아크라)', desc: '가나 최대 부품 마켓. 전용 앱으로 현대/기아 부품 재고 확인 및 가격 비교 가능', color: 'var(--color-info)' },
              { flag: '🇬🇭', name: 'Tema Port', desc: '서아프리카 최대 컨테이너 항만. 인천→테마 직항 40~50일. GRA/ICUMS 전자통관 시스템 운영', color: 'var(--color-warning)' },
            ].map((hub, i) => (
              <div key={i} style={{ padding: '1rem', background: '#181818', borderRadius: '10px', borderLeft: `3px solid ${hub.color}` }}>
                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '4px' }}>{hub.flag} {hub.name}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>{hub.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={glass}>
          <h3 style={cardTitle}><Zap size={18} color="var(--color-success)" /> 나이지리아-한국 EV 합작 파트너십

          </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          2025년 1월 체결된 나이지리아 정부와 한국 AEDC 간의 전기차 제조·충전 인프라 파트너십의 핵심 내용을 정리합니다. 아프리카 최초의 대규모 EV 생산 시설로, 한국 기업의 부품 공급 및 기술 이전 기회를 제공합니다. Business Insider Africa와 West Africa Automotive의 공식 보도 자료, 나이지리아 정부 발표문을 기반으로 정리했습니다.
        </p>
          <div style={{ padding: '1.25rem', background: '#181818', borderRadius: '8px', border: 'none', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#34d399', marginBottom: '8px' }}>🏭 아프리카 최초 대규모 EV 공장 (2025.1 체결)</div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#94a3b8', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>나이지리아 정부 × 한국 AEDC 파트너십 체결</li>
              <li>연간 <strong style={{ color: '#e2e8f0' }}>30만 대</strong> 생산 능력 EV 공장 + 전국 충전 인프라</li>
              <li>200억 나이라(~$12M) 소비자 신용 지원 프로그램</li>
              <li>Green Tax 면제: EV·하이브리드 차량 관세 혜택</li>
            </ul>
          </div>
          <TakeawayBox
            situation="한국과 나이지리아 간 아프리카 최초 EV 합작법인 체결은 판을 뒤흔드는 메가 트렌드(Mega-trend). 단순 완성차 수출(CBU) 비즈니스에서 현지 조립(CKD/SKD) 및 생산 허브로 체급(Tier)이 격상되는 역사적 전환점을 돌파함."
            actionPlan="선(先) 중고 HEV 수출로 엠블럼 인지도(Brand Awareness)를 현지에 각인시키고, 후(後) EV 부품(배터리 팩, 모터) 독점 공급 및 기술 이전 벤더로 등극하는 롱테일 캐시플로우(Long-tail Cashflow) 모델을 고도화. 이를 통해 신생 중국 EV 업체들의 아프리카 진출 통로를 원천 봉쇄(Blockade)."
          />
        </div>
      </div>

      {/* FINANCIAL SIMULATION (기존 유지) */}
      <div style={{ ...glass, gridColumn: '1 / -1' }}>
        <h3 style={cardTitle}><DollarSign size={18} color="var(--color-info)" /> 파일럿 재무 시뮬레이션 (KIA Morning 12대 → Tema, Ghana)

        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          2012년식 기아 모닝 12대를 인천항에서 가나 테마항으로 컨테이너(40ft HC × 2) 선적 시의 총 비용 구조를 산출합니다. 매입가, 서류/적재비, 해상 운임을 합산하여 대당 랜딩 코스트를 도출합니다. 인천항 포워더 실견적(2026.4 기준) 및 AutoWini 플랫폼의 2012 KIA Morning 평균 매입가를 기반으로 산출했습니다. 해상 운임은 WiniLogis 및 Cargo Naija의 최신 견적을 교차 검증했습니다.
        </p>
        {fx && typeof fx.usd_krw === 'number' && (
          <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            참고 원/달러 환율: 1 USD = ₩{Number(fx.usd_krw).toLocaleString()}
            {fx.isLive === true ? ' (환율 API 연동' : ' (캐시 환율'}
            {fx.dataAsOf ? ` · 기준일 ${fx.dataAsOf})` : ')'} — 위 원화 수치는 2026.4 견적 시점 환산값입니다.
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          <KpiCard icon={<CarFront size={14}/>} label="매입 총액 (12대)" value="₩27,600,000" sub="단가 ₩2,300,000/대" color="#e2e8f0" />
          <KpiCard icon={<Package size={14}/>} label="Doc & Loading (2 CNTR)" value="₩1,100,000" sub="₩550,000 / 40ft HC" color="#e2e8f0" />
          <KpiCard icon={<Ship size={14}/>} label="해상 운임" value="$9,000" sub="$4,500 / 40ft HC" color="var(--color-warning)" />
          <KpiCard icon={<DollarSign size={14}/>} label="대당 랜딩 코스트" value="~₩3,500,000" sub="FOB 기준 마진 방어선 확보" color="var(--color-success)" />
        </div>
        <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.05)', border: 'none', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-warning)', fontWeight: 600, marginBottom: '6px' }}>⚠ 가나 관세 요약 (998cc 모닝 기준)</div>
          <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.6 }}>
            기본관세 <strong>5%</strong>(1000cc 미만) + 연식초과 페널티 <strong>20%</strong>(14년) + VAT 15% + NHIL 2.5% + GETFund 2.5% + ECOWAS 0.5% + EXIM 0.75% + 검사수수료 1%
          </div>
        </div>
      </div>

      {/* Custom Ghana Customs Calculator */}
      <div style={glass}>
        <h3 style={cardTitle}>
          <Calculator size={18} color="#8b5cf6" /> 가나 관세 시뮬레이터 (GRA ICUMS 기반)

        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          가나 국세청(GRA)의 수입 관세 공식을 내재화한 시뮬레이터입니다. FOB, 배기량, 연식 입력값에 따라 즉시 랜딩 코스트를 산출합니다. ICUMS 시스템과 동일하게 CIF 기준으로 5~20%의 배기량별 기본 관세율, 연식 초과 페널티(최대 50%), 및 VAT/ECOWAS/EXIM 등 부가 제세를 합산하여 랜딩 코스트를 계산합니다. 적용 환율은 1 USD = 14.5 GHS(2026-04-27 기준 고정값)입니다.
        </p>
        <GhanaCustomsCalculator exchangeRate={Number(arbitrageRadar?.exchangeRates?.GHS_USD) || 14.5} />
      </div>

      {/* Execution Playbook */}
      <div style={glass}>
        <h3 style={cardTitle}><FileText size={18} color="var(--color-success)" /> 실행 플레이북 (Execution Playbook)</h3>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
          {[
            { icon: <CarFront size={16}/>, title: '차량 매입 & 상품화', color: '#60a5fa', items: ['외관 복원(광택/스크래치)이 바이어 첫인상 가격 결정','AutoWini, BeForward 다중 채널 B2B 리드 창출','현지 특성: 옵션보다 구동계 내구성·에어컨 작동이 최우선','하이브리드 차량 우선 매입으로 Green Tax 차별화'] },
            { icon: <Anchor size={16}/>, title: '선적 & 통관 컴플라이언스', color: 'var(--color-success)', items: ['컨테이너(혼적) vs RoRo(단가) 전략적 선택','제작 연도(초기등록일 아님) 기준 수입 규제 엄격','필수서류: B/L, CI, PL, 수출말소증명서','나이지리아 SON-VehCAP 사전인증 필수'] },
            { icon: <Globe size={16}/>, title: '현지 네트워크 구축', color: 'var(--color-warning)', items: ['가나 Abossey Okai 부품 딜러 네트워크 선점','나이지리아 Ladipo Market 진출 (LadipoExpress 연동)','세네갈 다카르항 현지 에이전트 파트너십','Jiji/TradeKorea 온라인 마켓 병행 활용'] },
          ].map((sec, i) => (
            <div key={i}>
              <h4 style={{ fontSize: '0.9rem', color: sec.color, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px' }}>{sec.icon} {sec.title}</h4>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#94a3b8', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sec.items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: item }} />)}
              </ul>
            </div>
          ))}
          <div style={{ background: 'rgba(239,68,68,0.05)', border: 'none', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={14}/> Critical Risk Alerts</div>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#94a3b8', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong style={{ color: 'var(--color-danger)' }}>가나:</strong> 2012년식 차량 {year50For2012}년 이후 선적 시 50% 페널티 구간 진입</li>
              <li><strong style={{ color: 'var(--color-danger)' }}>나이지리아:</strong> 2026.7월 Green Tax 시행 — 대배기량 차종 원가 급등</li>
              <li><strong style={{ color: 'var(--color-danger)' }}>환율:</strong> 가나 세디(GHS) 변동성 극심 (10.2~15.5 GHS/USD)</li>
              <li><strong style={{ color: 'var(--color-danger)' }}>중국:</strong> 저가 중국 중고차 공세 본격화 — 가격 경쟁력 방어 필수</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 🎯 비즈니스 모델 근거: 한국 중고차 → 가나 수출 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ background: '#181818', border: 'none', borderRadius: '8px', padding: '1.5rem', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Ship size={22} color="#eab308" /> 비즈니스 모델 근거: 한국 중고차 매집 → 가나(Ghana) 수출
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
            인천항 기반 한국 중고차를 가나 테마(Tema)항으로 수출하는 비즈니스 모델의 사실(Fact) 기반 전략적 타당성 근거입니다.
          </p>
        </div>

        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>

          {/* 근거 1: 시장 규모 */}
          <div style={{ background: '#181818', border: 'none', borderRadius: '8px', padding: '1.25rem', borderTop: '3px solid #eab308' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(234,179,8,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📊</div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#eab308', fontWeight: 600, letterSpacing: '0.5px' }}>근거 #1 — 시장</div>
                <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: 700 }}>가나 차량 90%+ 수입 중고차</div>
              </div>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1rem', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.7 }}>
              <li>가나 자동차 시장의 <strong style={{ color: '#fbbf24' }}>90% 이상이 수입 중고차</strong> — 신차 시장 거의 부재</li>
              <li>2024년 한국→가나 차량 수출액 <strong style={{ color: '#fbbf24' }}>$4,218만</strong> (약 570억원)</li>
              <li>한국 중고차 수출 2025년 <strong>전년 대비 75% 급증</strong>, 사상 최고 $88.7억 기록</li>
              <li>가나 중산층 확대 + 라이드헤일링(Uber/Bolt) 성장 → 수요 구조적 증가</li>
            </ul>
            <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(234,179,8,0.08)', borderRadius: '8px', fontSize: '0.78rem', color: '#fcd34d' }}>
              📌 출처: OEC World Trade Data, Korea Times (2025), Trading Economics
            </div>
          </div>

          {/* 근거 2: 브랜드 파워 */}
          <div style={{ background: '#181818', border: 'none', borderRadius: '8px', padding: '1.25rem', borderTop: '3px solid #3b82f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🚗</div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-info)', fontWeight: 600, letterSpacing: '0.5px' }}>근거 #2 — 브랜드 신뢰</div>
                <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: 700 }}>현대·기아 가나 국민차 지위</div>
              </div>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1rem', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.7 }}>
              <li>현대·기아 가나 시장 <strong style={{ color: '#60a5fa' }}>Top 2~3위 브랜드</strong> (토요타 다음)</li>
              <li>내구성·연비·부품 가용성으로 <strong>"저위험 구매"</strong> 인식 확립</li>
              <li>Uber/Bolt 택시: <strong>기아 피칸토·리오·모닝</strong>이 선호 차종</li>
              <li>상용차: <strong style={{ color: '#60a5fa' }}>현대 포터II·기아 봉고III</strong> 1톤 트럭 아프리카 전역 인기</li>
            </ul>
            <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', fontSize: '0.78rem', color: '#93c5fd' }}>
              📌 출처: Ghanaian Times, SBT Japan Market Report, Valley View Motors
            </div>
          </div>

          {/* 근거 3: 규제 적합성 */}
          <div style={{ background: '#181818', border: 'none', borderRadius: '8px', padding: '1.25rem', borderTop: '3px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>📋</div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: 600, letterSpacing: '0.5px' }}>근거 #3 — 규제 적합</div>
                <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: 700 }}>한국차 = 좌핸들 + 10년 규칙 적합</div>
              </div>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1rem', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.7 }}>
              <li>가나 수입 필수: <strong style={{ color: '#34d399' }}>좌핸들(LHD)</strong> 차량만 허용 — 한국차 100% 적합</li>
              <li>연식 제한: 제조일 기준 <strong>10년 이내</strong> ({nowYear}년 기준 {nowYear - 10}년식 이후)</li>
              <li>배기 기준: <strong>Euro 2 이상</strong> — 한국차 기본 충족</li>
              <li>일본차(우핸들) <strong style={{ color: 'var(--color-danger)' }}>수입 금지</strong> → 한국차에 구조적 우위</li>
            </ul>
            <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', fontSize: '0.78rem', color: '#6ee7b7' }}>
              📌 출처: Ghana Standards Authority (GSA), U.S. Dept. of Commerce Trade.gov
            </div>
          </div>

          {/* 근거 4: 환율 우위 */}
          <div style={{ background: '#181818', border: 'none', borderRadius: '8px', padding: '1.25rem', borderTop: '3px solid #ec4899' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(236,72,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>💱</div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#ec4899', fontWeight: 600, letterSpacing: '0.5px' }}>근거 #4 — 원화 약세</div>
                <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: 700 }}>원/달러 환율 = 가격 경쟁력</div>
              </div>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1rem', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.7 }}>
              <li>원화 약세 → 한국 중고차 <strong style={{ color: '#f472b6' }}>달러 기준 가격 경쟁력 극대화</strong></li>
              <li>한국 중고차 수출 75% 급증의 핵심 동인 = <strong>원화 절하</strong></li>
              <li>가나 바이어에게 동급 일본차 대비 <strong>15~25% 저렴한 가격 포지셔닝</strong> 가능</li>
              <li>자동차는 한국 <strong>중소기업 수출 1위 품목</strong> — 정부 수출지원금 활용 가능</li>
            </ul>
            <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(236,72,153,0.08)', borderRadius: '8px', fontSize: '0.78rem', color: '#f9a8d4' }}>
              📌 출처: InvestKorea, 중소벤처기업부 수출지원 데이터 (2025)
            </div>
          </div>

          {/* 근거 5: 물류 인프라 */}
          <div style={{ background: '#181818', border: 'none', borderRadius: '8px', padding: '1.25rem', borderTop: '3px solid #8b5cf6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🚢</div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 600, letterSpacing: '0.5px' }}>근거 #5 — 물류 체계</div>
                <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: 700 }}>인천→테마항 확립된 해운 루트</div>
              </div>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1rem', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.7 }}>
              <li>인천항→테마항 <strong style={{ color: '#a78bfa' }}>RoRo·컨테이너</strong> 두 가지 방식 선택 가능</li>
              <li>40ft HC 컨테이너 기준 <strong>4~6대</strong> 동시 적재 — SUV/세단 혼합 가능</li>
              <li>주요 선사: <strong>Maersk, COSCO, MSC</strong> 등 정기 노선 운항</li>
              <li>인천 자동차 수출 전문 포워더·검수·서류 대행 업체 <strong>클러스터 형성</strong></li>
            </ul>
            <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(139,92,246,0.08)', borderRadius: '8px', fontSize: '0.78rem', color: '#c4b5fd' }}>
              📌 출처: WC Shipping, GB Freight, Export-Solutions
            </div>
          </div>

          {/* 근거 6: 상용차 블루오션 */}
          <div style={{ background: '#181818', border: 'none', borderRadius: '8px', padding: '1.25rem', borderTop: '3px solid #14b8a6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(20,184,166,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🛻</div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#14b8a6', fontWeight: 600, letterSpacing: '0.5px' }}>근거 #6 — 상용차 기회</div>
                <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: 700 }}>포터II·봉고III 초과 수요</div>
              </div>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1rem', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.7 }}>
              <li>아프리카·중동 1톤 트럭 시장에서 <strong style={{ color: '#2dd4bf' }}>포터II·봉고III = 표준 상용차</strong></li>
              <li>가나 도시 물류·농산물 운송·소매 배달에 <strong>필수 차종</strong></li>
              <li>승용차 대비 <strong style={{ color: '#2dd4bf' }}>마진율 30~50% 우위</strong> — 고수익 세그먼트</li>
              <li>한국 내 1톤 트럭 교체 주기 짧아 <strong>양질 매물 풍부</strong></li>
            </ul>
            <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(20,184,166,0.08)', borderRadius: '8px', fontSize: '0.78rem', color: '#5eead4' }}>
              📌 출처: 조선일보 아프리카 상용차 특집, Corea-Auto
            </div>
          </div>

          {/* 근거 7: 수익 모델 */}
          <div style={{ background: '#181818', border: 'none', borderRadius: '8px', padding: '1.25rem', borderTop: '3px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>💰</div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-warning)', fontWeight: 600, letterSpacing: '0.5px' }}>근거 #7 — 수익 구조</div>
                <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: 700 }}>대당 $1,500~3,000 순마진</div>
              </div>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1rem', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.7 }}>
              <li>한국 매입가 <strong>$2,000~5,000</strong> → 가나 현지 판매가 <strong style={{ color: '#fbbf24' }}>$5,500~9,000</strong></li>
              <li>해상 운송비(컨테이너) 대당 <strong>$800~1,200</strong> + 관세/VAT(CIF 기준 약 35~50%)</li>
              <li>순마진율 <strong style={{ color: '#fbbf24' }}>대당 $1,500~3,000</strong> (차종·연식 따라 변동)</li>
              <li>월 20대 규모 → 월 순이익 <strong>$30,000~60,000</strong> 수익 구간</li>
            </ul>
            <div style={{ marginTop: '10px', padding: '8px 10px', background: 'rgba(245,158,11,0.08)', borderRadius: '8px', fontSize: '0.78rem', color: '#fcd34d' }}>
              📌 출처: 업계 실거래 마진 분석, WC Shipping Rate Data
            </div>
          </div>
        </div>

        {/* 최종 결론 */}
        <TakeawayBox
          source="종합 분석: 시장 데이터 + 규제 환경 + 물류 인프라 기반"
          situation="가나는 시장 물량의 90%를 수입에 의존하는 극단적 공급 부족(Deficit) 국가. LHD 의무화 및 10년 연식 상한제(Age Cap)는 우핸들 일본차의 진입을 막고 한국차에 구조적 해자(Economic Moat)를 제공함. 가나향 수출액 증가 및 국내 중고차 총수출액 $88.7억(YoY +75%) 갱신은, 가나가 전략적 캐시플로우 타겟팅의 강한 과녁(Bullseye)임을 증명함."
          actionPlan={
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#e2e8f0', fontSize: '0.85rem' }}>
              <li style={{ marginBottom: '4px' }}><strong>[포트폴리오]</strong> 라이드헤일링(Uber) 특화 소형차(모닝)와 물류 상용차(포터II) 중심의 바벨 전략(Barbell Strategy) 구사, 턴어라운드 극대화</li>
              <li style={{ marginBottom: '4px' }}><strong>[규제 헷징]</strong> 2017년식 이후 차량으로 매집 풀(Pool) 제한, 가나 관세청의 치명적인 10년 초과 페널티(CIF 50% 헤어컷) 원천 회피</li>
              <li style={{ marginBottom: '4px' }}><strong>[단가 최적화]</strong> 인천 발(發) RoRo선 및 CNTR 복합 물류를 정례화(월 30대 롤아웃)하여 선사 대상 단가 협상력(Bargaining Power) 확보</li>
              <li><strong>[현지 금융 레버리지]</strong> Work-and-Pay(리스/렌탈) 딜러 카르텔과 독점(Exclusive) MOU를 속전속결 체결, Cash Conversion Cycle 압축</li>
            </ul>
          }
        />
      </div>
    </div>
  );
}
