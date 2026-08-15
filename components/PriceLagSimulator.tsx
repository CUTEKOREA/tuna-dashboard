'use client';

import React, { useState, useMemo } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ReferenceArea } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './PriceLagSimulator.module.css';
import { TrendingDown, Activity, DollarSign } from 'lucide-react';
import TermTooltip from './TermTooltip';
import { ChartPatternDefs } from './ChartPatterns';

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{label}</p>
        <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--w-sky-400)' }}>원어 원가: <strong style={{color:'var(--text-primary)'}}>${payload[0].value} / MT</strong></p>
        <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--w-amber-400)' }}>B2C 판가지수: <strong style={{color:'var(--text-primary)'}}>{payload[1].value} pt</strong></p>
      </div>
    );
  }
  return null;
}

export default function PriceLagSimulator() {
  const [lagMonths, setLagMonths] = useState(4); // 1 to 6 months

  // Derive data based on lag
  const { data, spreadProfit, p1_start, p1_end, p2_start, p2_end } = useMemo(() => {
    // 24 months of raw material data (peak at M6, bottom at M12-M15)
    const rawCosts = [1600, 1650, 1800, 1950, 2050, 2100, 2000, 1800, 1600, 1500, 1400, 1380, 1380, 1450, 1500, 1550, 1600, 1750, 1850, 1900, 1900, 1950, 2000, 2050];
    
    // Spread window logic: Raw is cheap (M11 to M14)
    const accumulateStart = 10; // M11
    const accumulateEnd = 13;   // M14

    // Retail price holds peak for `lag` months.
    const releaseStart = accumulateStart + Math.floor(lagMonths * 0.8);
    const releaseEnd = accumulateEnd + lagMonths;

    const chartData = [];
    let excessMarginAcc = 0;

    for(let i=0; i<24; i++) {
        const b2cIndex = i - lagMonths;
        // B2C price reacts slowly (Rockets and Feathers). Downward is slower by 'lagMonths'
        const baseCost = b2cIndex >= 0 ? rawCosts[b2cIndex] : rawCosts[0];
        
        // Convert to retail index (baseline 100)
        const cpi = 100 + ((baseCost - 1380) / 720) * 50; 
        
        // Calculate theoretical margin spread
        // Standard normal spread would be 0 (Cost correlates exactly to CPI)
        // Excess spread happens when CPI is high, but Cost is low.
        const standardCpiBasedOnCost = 100 + ((rawCosts[i] - 1380) / 720) * 50;
        const spread = cpi - standardCpiBasedOnCost;
        if (spread > 0) excessMarginAcc += spread;

        chartData.push({
            month: `M${i+1}`,
            cost: rawCosts[i],
            cpi: parseFloat(cpi.toFixed(1)),
            isSpreadWindow: i >= releaseStart && i <= releaseEnd
        });
    }

    // Convert accumulated margin to fake dollar amount for UX effect
    const totalProfit = 12.5 + (excessMarginAcc * 0.15); // Base 12.5M, plus excess

    return { 
      data: chartData, 
      spreadProfit: totalProfit.toFixed(1),
      p1_start: accumulateStart,
      p1_end: accumulateEnd,
      p2_start: releaseStart,
      p2_end: releaseEnd
    };
  }, [lagMonths]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Activity size={20} color="#fbbf24" />
          <TermTooltip term="원료 재고 사이클 및 반영 지연(Lag) 시뮬레이터" description="참치 원어의 국제 가격이 바닥을 쳤다 솟구칠 때, 마트에 풀리는 캔 참치 소비자가격은 얼마나 느리게 변동하는지 그 시차(Time Lag, 지연) 주기와 이익 구간을 수학적으로 시뮬레이션합니다." />
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.sliderGroup}>
          <div className={styles.sliderLabel}>
            <span><TermTooltip term="판가 반영 지연 기간 조작 (Rockets & Feathers 현상)" description="원가가 오를 땐 로켓(Rockets)처럼 소비자가를 빨리 올려버리고, 내릴 땐 깃털(Feathers)처럼 천천히 떨어뜨려 버티는 얄미운 유통업계의 생리를 반영할 수첩 수치(지연 개월수)입니다." /></span>
            <span className={styles.sliderVal}>{lagMonths} 개월 (Months)</span>
          </div>
          <input 
            type="range" 
            min="1" max="6" step="1"
            value={lagMonths} 
            onChange={(e) => setLagMonths(Number(e.target.value))}
            className={styles.slider}
          />
          <div style={{ fontSize: '11px', color: 'var(--w-slate-500)', marginTop: '8px' }}>
            * 대형마트 B2B 납품 단가 협상 시, 과거 피크치 단가를 인하해주기까지 버티는 '방어 기간'을 뜻합니다.
          </div>
        </div>

        <div className={styles.statsGroup}>
          <div className={styles.statTitle}><TermTooltip term="초과 영업이익 (Spread Margin)" description="국제 원물 원가는 이미 완전히 바닥으로 폭락했는데, 대형마트 참치캔 가격은 미처 내리지 못하고 비싸게 방어되고 있을 때 우리 회사가 임시로 극대화해 먹을 수 있는 막대한 잉여 추가 마진 금액입니다." /></div>
          <div className={`${styles.statValue} ${styles.updated}`} key={spreadProfit}>
            <DollarSign size={22} /> {spreadProfit}M
          </div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <SafeResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} />
            <YAxis yAxisId="left" domain={[1200, 2200]} tickFormatter={(val) => `${Number(val).toLocaleString()}`} tick={{ fill: 'var(--w-sky-400)', fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" domain={[80, 160]} tickFormatter={(val) => `$${Number(val).toLocaleString()}`} tick={{ fill: 'var(--w-amber-400)', fontSize: 11 }} />
            
            {/* Highlight Spread Window */}
            <ReferenceArea yAxisId="left" x1={`M${p2_start + 1}`} x2={`M${p2_end + 1}`} fill="rgba(var(--w-emerald-500-rgb), 0.15)" strokeOpacity={0} />

            <RechartsTooltip cursor={{ fill: 'rgba(140,170,255,0.10)' }} content={<CustomTooltip />} />
            
            <Line yAxisId="left" type="monotone" dataKey="cost" name="원어(SKJ) 가격" stroke="var(--w-sky-400)" strokeWidth={3} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="cpi" name="소매 지수" stroke="var(--w-amber-400)" strokeWidth={3} dot={false} strokeDasharray="5 5" />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>

      <div className={styles.ganttContainer}>
        <div className={styles.ganttRow}>
          <div className={styles.ganttLabel}><TermTooltip term="저점 비축 (Accumulate)" description="국제 어가가 폭락해 가장 저렴할 때 부산 초저온 냉동 창고에 싼값의 참치를 있는대로 끌어보아 그물망 채로 가득 쟁여두는 전략적 쇼핑(매입) 타이밍입니다." /></div>
          <div className={styles.ganttTrack}>
            <div className={`${styles.ganttBar} ${styles.barAccumulate}`} style={{ left: `${(p1_start/24)*100}%`, width: `${((p1_end-p1_start)/24)*100}%` }}>
              원어 집중 매수
            </div>
          </div>
        </div>
        <div className={styles.ganttRow}>
          <div className={styles.ganttLabel}><TermTooltip term="재고 방출 (Release)" description="아까 세상 싸게 비축해뒀던 원어를 꺼내서, 대형 마트 판매가격은 옛날 비싼 가격 그대로 유지되고 있을 때 통조림으로 가공해 집중적으로 방출함으로써 떼돈(초과 마진)을 버는 구간입니다." /></div>
          <div className={styles.ganttTrack}>
            <div className={`${styles.ganttBar} ${styles.barRelease}`} style={{ left: `${(p2_start/24)*100}%`, width: `${((p2_end-p2_start)/24)*100}%` }}>
              하이 마진 타겟 방출
            </div>
          </div>
        </div>
      </div>

      <div className={styles.insightPanel}>
        <TrendingDown size={16} color="#fbbf24" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
        <strong>협상 </strong> 원어가는 가라앉았지만 판가 지연(Lag) 기간인 {lagMonths}개월 동안 고점 가격이 유통시장에서 유지됩니다. 비축해 둔 초저가 원물을 <span style={{color: 'var(--color-success)', fontWeight: 'bold'}}>녹색 하이라이트 구간</span> 에 대량 소진하십시오. 이 시기에 대형마트 요구 단가 인하를 최대한 지연시킬수록 막대한 초과 영업이익(${(parseFloat(spreadProfit) - 12.5).toFixed(1)}M)이 발생합니다.
      </div>
    </div>
  );
}
