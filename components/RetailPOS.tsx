'use client';

import React, { useState } from 'react';
import styles from './RetailPOS.module.css';
import { ShoppingCart, BellRing, Store, ArrowDownRight, Tag, Activity, FileText, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ComposedChart, Bar, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import PriceLagSimulator from './PriceLagSimulator';
import TermTooltip from './TermTooltip';
import { LandedCostCalculator, BuySignalDashboard } from './FieldTools';
import { ChartPatternDefs } from './ChartPatterns';

// V2: Interactive Market Share Data
const marketShareData = [
  { name: '대형마트 PB (이마트/홈플)', brandKey: 'MART_PB', value: 24.5, color: '#fbbf24' },
  { name: '쿠팡 PB (곰곰)', brandKey: 'COUPANG', value: 12.0, color: '#f43f5e' },
  { name: '동원참치 (NB)', brandKey: 'NB', value: 45.2, color: '#60a5fa' },
  { name: '사조/기타 (NB)', brandKey: 'OTHER', value: 18.3, color: '#94a3b8' },
];

const pbTrendData = [
  { month: '10월', pb: 22, nb: 55 },
  { month: '11월', pb: 25, nb: 53 },
  { month: '12월', pb: 29, nb: 50 },
  { month: '1월', pb: 32, nb: 48 },
  { month: '2월', pb: 35, nb: 46 },
  { month: '3월', pb: 36.5, nb: 45.2 },
];

const trackerData = [
  { id: '1', type: 'NB', brand: '동원참치 라이트스탠다드 150g 4입', normal: '12,480원', promo: '11,900원', gapText: '1,983원', trackColor: '#60a5fa', alert: '-', alertColor: '#94a3b8', brandKey: 'NB', width: 100 },
  { id: '2', type: 'PB', brand: 'E-Mart 노브랜드 살코기참치 150g 4입', normal: '8,900원', promo: '6,680원 (25%↓)', promoColor: '#fbbf24', gapText: '1,113원', trackColor: '#fbbf24', alert: '위험 (갭 43%)', alertColor: 'var(--color-danger)', brandKey: 'MART_PB', width: 56 },
  { id: '3', type: 'PB', brand: '홈플러스 시그니처 참치 150g 8입', normal: '15,900원', promo: '13,900원 (12%↓)', promoColor: '#34d399', gapText: '1,158원', trackColor: '#34d399', alert: '경계 (갭 41%)', alertColor: '#94a3b8', brandKey: 'MART_PB', width: 58 },
  { id: '4', type: 'PB', brand: '쿠팡 곰곰 살코기참치 150g 10입', normal: '21,000원', promo: '18,480원 (12%↓)', promoColor: '#f43f5e', gapText: '1,232원', trackColor: '#f43f5e', alert: '경계 (갭 37%)', alertColor: '#94a3b8', brandKey: 'COUPANG', width: 62 },
];

export default function RetailPOS({ hideHeader = false }: { hideHeader?: boolean }) {
  const [rawPriceBase, setRawPriceBase] = useState(1600);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedBrandKey, setSelectedBrandKey] = useState('ALL');
  const [promoEnacted, setPromoEnacted] = useState(false);
  
  // Base constants 
  const msrp = 6000;
  const freight = 200;
  const processing = 900;
  const retailMargin = 2700; 
  const margin = msrp - rawPriceBase - freight - processing - retailMargin;
  
  const waterfallData = [
    { step: '어획(원어)', range: [0, rawPriceBase], fill: 'var(--color-info)', value: rawPriceBase, smileLine: 40 },
    { step: '해상운송', range: [rawPriceBase, rawPriceBase + freight], fill: '#94a3b8', value: freight, smileLine: 15 },
    { step: '통조림가공', range: [rawPriceBase + freight, rawPriceBase + freight + processing], fill: 'var(--color-warning)', value: processing, smileLine: 5 },
    { 
      step: '제조사 마진', 
      range: margin >= 0 ? [rawPriceBase + freight + processing, rawPriceBase + freight + processing + margin] : [rawPriceBase + freight + processing + margin, rawPriceBase + freight + processing], 
      fill: margin >= 0 ? 'var(--color-success)' : 'var(--color-danger)', value: margin, smileLine: margin >= 0 ? (margin/msrp)*100 : (margin/msrp)*100 - 10
    },
    { step: '대형마트 유통', range: [msrp - retailMargin, msrp], fill: '#eab308', value: retailMargin, smileLine: 45 },
    { step: '소비자가', range: [0, msrp], fill: '#6366f1', value: msrp, smileLine: null }
  ];

  const onPieClick = (data: any, index: number) => {
    if (activeIndex === index) {
      setActiveIndex(-1);
      setSelectedBrandKey('ALL');
    } else {
      setActiveIndex(index);
      setSelectedBrandKey(marketShareData[index].brandKey);
    }
  };

  const filteredTracker = selectedBrandKey === 'ALL' 
    ? trackerData 
    : trackerData.filter(d => d.brandKey === selectedBrandKey || d.type === 'NB'); // Always show NB for baseline comparing

  return (
    <div className={styles.container}>
      {!hideHeader && (
        <div className={styles.header}>
          <ShoppingCart size={24} style={{ color: 'var(--w-sky-400)' }} />
          <TermTooltip term="소매 유통 POS 모니터 (PB vs NB)" description="전국 대형마트와 쿠팡 등 주요 온/오프라인 매장의 참치캔 실판매 현황(POS 데이터)과 가격 프로모션을 실시간으로 추적하는 모니터링 대시보드입니다." />
          <span className={styles.headerBadge}>V2 INTERACTIVE</span>
        </div>
      )}

      {/* Buy Signal Dashboard — moved from Field Tools */}
      <BuySignalDashboard />

      {promoEnacted ? (
        <div className={styles.alertBox} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--w-emerald-500)' }}>
          <div className={styles.alertIcon} style={{ color: 'var(--color-success)', animation: 'none' }}>
            <CheckCircle size={28} />
          </div>
          <div className={styles.alertContent}>
            <h4 style={{ color: 'var(--w-emerald-400)' }}>✅ 4+2 번들 프로모션 승인 완료 (ROI 분석)</h4>
            <p style={{ marginBottom: 0 }}>
              예상 점유율 방어 효과: <strong>+3.5%p</strong> 수성 역전 <br/>
              투입 비용: 마진율 2.5% 희생 분 ($450K) 대비 매출 방어 가치 $2.1M 달성.
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.alertBox}>
          <div className={styles.alertIcon}>
            <BellRing size={28} />
          </div>
          <div className={styles.alertContent}>
            <h4>⚠️ [초긴급] 대형마트 PB 할인율 임계치(30%) 돌파에 따른 점유율 이탈</h4>
            <p>
              SSG E-Mart에서 <strong>노브랜드 참치 150g x 8입</strong> 상품의 주말 특가 할인으로 NB 대비 100g당 단가 격차가 43% 발생했습니다.<br/>
              이에 따른 최근 한 달간 NB 점유율 이탈이 1.2%p 감지되었습니다. NB 방어를 위한 4+2 신규 번들 기획을 권고합니다.
            </p>
            <button className={styles.alertButton} onClick={() => setPromoEnacted(true)}>
              ROI 시뮬레이션 및 예산 기안하기 ⚡
            </button>
          </div>
        </div>
      )}

      {/* Price Lag & Inventory Release Simulator */}
      <PriceLagSimulator />

      {/* Landed Cost Calculator — moved from Field Tools */}
      <LandedCostCalculator />

      <div className={styles.topRow}>
        {/* V2: Interactive Offline Market Share Donut */}
        <div className={styles.card}>
          <div className={styles.controls}>
            <div className={styles.cardTitle} style={{ margin: 0 }}>
              <Store size={18} color="#60a5fa" />
              <TermTooltip term="오프라인/온라인 PB 점유율 추적" description="대형 소매상들이 자체적으로 만든 저가 상표(PB, 예: 노브랜드)와 제조사의 고유 상표(NB, 예: 동원참치) 간의 시장 점유율 뺏고 뺏기기를 시각화한 차트입니다." />
            </div>
            <span style={{fontSize:'11px', color:'var(--w-amber-400)', animation:'pulseWarning 2s infinite'}}>* 도넛 조각을 클릭하세요</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className={styles.uploadZone}>
              <SafeResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={marketShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    onClick={onPieClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {marketShareData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        opacity={activeIndex === -1 || activeIndex === index ? 1 : 0.3}
                        stroke={activeIndex === index ? 'var(--text-primary)' : 'none'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--w-slate-200)' }}
                    formatter={(value: any) => [`${value}%`, 'Market Share']}
                  />
                </PieChart>
              </SafeResponsiveContainer>
              <div className={styles.doughnutStats}>
                <div className={styles.statsVal}>36.5<span style={{fontSize:'16px'}}>%</span></div>
                <div className={styles.statsLabel}>Total PB Share</div>
                <div style={{ color: 'var(--color-danger)', fontSize: '11px', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDownRight size={12}/> +4.2%p MoM
                </div>
              </div>
            </div>

            {/* V2: Historical PB Threat Line */}
            <div style={{ width: '130px', height: '140px', paddingRight: '10px' }}>
              <div style={{ fontSize: '10px', color: 'var(--w-slate-300)', marginBottom: '8px', textAlign: 'right' }}><TermTooltip term="크로스오버 조짐(과거 6mo)" description="유통사 PB 상품의 점유율이 지속적으로 무섭게 올라가서, 결국 원래 1등이던 제조사(NB) 제품의 점유율을 추월(Crossover)하고 먹어치울 확률이 있는지를 사전 경고하는 지표입니다." /></div>
              <SafeResponsiveContainer width="100%" height={300}>
                <AreaChart data={pbTrendData} margin={{top:0,right:0,left:0,bottom:0}}>
                  <Area type="monotone" dataKey="nb" stroke="#60a5fa" fill="transparent" strokeWidth={2} />
                  <Area type="monotone" dataKey="pb" stroke="var(--w-amber-400)" fill="rgba(251, 191, 36, 0.1)" strokeWidth={2} />
                </AreaChart>
              </SafeResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--w-slate-500)', marginTop: '4px' }}>
                <span style={{color: '#60a5fa'}}>NB↓</span>
                <span style={{color: 'var(--w-amber-400)'}}>PB↑</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time E-Commerce Price Tracker */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <Tag size={18} color="#f43f5e" />
            <TermTooltip term="단가 갭(Gap) 트래커" description="제조사(NB) 참치와 유통사 자체 브랜드 참치 간의 100g당 실제 판매가 차이(가격 갭)를 추적합니다. 격차가 벌어질수록 고객이 저렴한 제품으로 넘어가버릴 확률(이탈 위험)이 커집니다." /> {selectedBrandKey !== 'ALL' && <span style={{fontSize:'11px', background:'#f43f5e', padding:'2px 6px', borderRadius:'4px', marginLeft:'8px'}}>필터 적용됨</span>}
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.trackerTable}>
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>품목명 (베스트셀러)</th>
                  <th style={{ width: '22%' }}>판매가 / 할인가</th>
                  <th style={{ width: '25%' }}>100g 단가 (격차)</th>
                  <th style={{ width: '13%' }}>알림</th>
                </tr>
              </thead>
              <tbody>
                {filteredTracker.map((row) => (
                  <tr key={row.id} style={{ opacity: row.type === 'NB' && selectedBrandKey !== 'NB' && selectedBrandKey !== 'ALL' ? 0.6 : 1 }}>
                    <td>
                      <div className={styles.brandGroup}>
                        <span className={`${styles.badge} ${row.type === 'NB' ? styles.badgeNB : styles.badgePB}`}>{row.type}</span>
                        {row.brand}
                      </div>
                    </td>
                    <td>
                      <span className={styles.priceNormal}>{row.normal}</span>
                      <span className={styles.pricePromo} style={{ color: row.promoColor || 'var(--text-primary)' }}>{row.promo}</span>
                    </td>
                    <td>
                      <div className={styles.unitPrice}>
                        <span className={styles.unitVal} style={{color: row.trackColor}}>{row.gapText}</span>
                        <div className={styles.barTrack}>
                          <div className={styles.barFill} style={{width: `${row.width}%`, background: row.trackColor}}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: row.alertColor, fontSize: '11px', fontWeight: 'bold' }}>{row.alert}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* NEW: Smile Curve & Waterfall Value Chain Negotiation Tool */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <Activity size={18} color="var(--color-success)" />
          <TermTooltip term="스마일 커브(Smile Curve) 마진율 배분 및 단가 협상 툴" description="참치캔 하나가 만들어질 때 바다에서 참치를 잡는 자원 채취 단계와 매대에서 참치를 파는 유통 판매 단계는 돈을 벌고, 중간에서 통조림을 만드는 제조사가 이익을 다 뺏기는 스마일 커브(U자형) 현상을 분석하여 대형마트와의 납품가 샅바싸움(협상 논리)에 활용합니다." />
        </div>
        
        <div className={styles.negotiationGrid}>
          <div className={styles.chartArea}>
            <SafeResponsiveContainer width="100%" height={320}>
              <ComposedChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <ChartPatternDefs />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
                <XAxis dataKey="step" tick={{fill: 'var(--w-slate-400)', fontSize: 11}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" domain={[0, 6500]} tick={{fill: 'var(--w-slate-400)', fontSize: 11}} tickFormatter={(val) => `$${Number(val).toLocaleString()}`} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[-20, 60]} hide />
                
                <Bar yAxisId="left" dataKey="range" isAnimationActive={false}>
                  {waterfallData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>

                <Line yAxisId="right" type="monotone" dataKey="smileLine" stroke="#eab308" strokeWidth={3} strokeDasharray="5 5" dot={{r: 4, fill: '#0a0f1f', stroke: '#eab308', strokeWidth: 2}} name="부가가치 궤적 (Smile Curve)" />
              </ComposedChart>
            </SafeResponsiveContainer>
          </div>

          <div className={styles.sliderArea}>
            <div className={styles.sliderGroup}>
              <div className={styles.sliderLabel}>
                <span>SKJ 원어가 변동 (어획가)</span>
                <span className={styles.sliderValue}>${rawPriceBase}/MT</span>
              </div>
              <input 
                type="range" 
                min="1200" max="2600" step="50" 
                value={rawPriceBase} 
                onChange={(e) => setRawPriceBase(Number(e.target.value))}
                className={styles.rangeInput}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: 'var(--w-slate-500)' }}>
                <span>$1,200 (하락장)</span>
                <span>$2,600 (초급등)</span>
              </div>
            </div>

            <div className={styles.reportBox}>
              <div className={styles.reportTitle}>
                <FileText size={16} /> Data-Driven 납품가 협상 논리
              </div>
              {margin < 0 ? (
                <>
                  현재 SKJ 어가가 <strong>${rawPriceBase}</strong>로 폭등함에 따라, 기존 납품가를 유지할 경우 당사 가공 마진은 <strong style={{color: 'var(--color-danger)'}}>{((margin/msrp)*100).toFixed(1)}% 적자</strong>로 전환됩니다.<br/><br/>
                  반면 대형마트는 전체 판매가(${msrp})의 <strong>45% 폭리</strong>를 그대로 취하고 있습니다.<br/><br/>
                  👉 <strong>적격 대응안:</strong> 유통 마진율을 40%로 타협(양보) 요구 및 소비자가 {Math.abs(margin / msrp * 100 + 5).toFixed(1)}% 인상 공문 즉시 발송
                </>
              ) : (
                <>
                  현재 어가(${rawPriceBase}) 기준, 제조사 마진은 <strong>{((margin/msrp)*100).toFixed(1)}%</strong> 수준으로 10% 안전마진 대비 {margin/msrp*100 < 10 ? <span style={{color: 'var(--color-danger)'}}>경고</span> : <span style={{color: 'var(--color-success)'}}>정상</span>} 상태입니다.<br/><br/>
                  '부가가치 스마일 커브'에 따르면 유통사(Marts)가 여전히 전체 파이의 45%를 빨아들입니다.<br/>
                  👉 프리미엄 라인 비중을 늘려 탈(脫)대형마트 D2C 전략 병행을 권고합니다.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
