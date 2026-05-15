'use client';

import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './TunaInsightsDashboard.module.css';
import { TrendingUp } from 'lucide-react';
import rawData from '../data/tuna_price_decoupling.json';
import TakeawayBox from './TakeawayBox';

const ACCENT = '#38bdf8';

export default function TunaPriceDecoupling() {
  const data = rawData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '14px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', minWidth: '220px'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{label}월</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-info)' }}>🐟 원어 국제시세(USD/t)</span>
            <span>${payload.find((p:any) => p.dataKey === 'raw_price_usd')?.value?.toLocaleString()}/t</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-danger)' }}>🥫 소매 납품가(₩/캔 150g)</span>
            <span>₩{payload.find((p:any) => p.dataKey === 'retail_price_krw')?.value?.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '4px' }}>
            <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>💰 초과 마진 독식 스프레드</span>
            <span style={{ fontWeight: 700, color: 'var(--color-warning)' }}>
              +{payload.find((p:any) => p.dataKey === 'margin_spread')?.value?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const situation = '2023년 4월 톤당 2,000달러를 돌파했던 가다랑어 국제 시세가 2024년 1월 기준 1,400달러 선까지 약 30% 폭락했습니다. 그럼에도 불구하고 주요 참치 캔 제조사의 소매 납품 단가는 지속 인상되거나 유지되는 \'완벽한 디커플링(Decoupling)\'이 관측되었습니다.';
  const takeaway = '원가와 판가의 비동조화 현상은 산업의 이윤 중심이 \'원물 어획\'에서 \'유통 장악력\'으로 넘어갔음을 증명합니다. 단순 원어 공급을 넘어, 유통망(리테일)을 쥐고 있는 B2C 브랜드와의 장기 납품 계약(Hedging)을 체결하거나, 자사 보유 원물을 활용해 OEM/ODM 방식으로 고마진 가공식품 시장에 직접 침투하는 수직 계열화 전략 도입이 시급합니다.';
  const source = '글로벌 참치 무역 데이터 & 한국소비자원 가격정보 (2023.04-2024.03)';

  return (
    <div className={styles.insightCard} style={{
      display: 'flex', flexDirection: 'column', minHeight: '480px'
    }}>
      {/* Card Header — renderWidgetCard 패턴 동일 */}
      <div style={{ position: 'relative', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
        <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: 700, color: ACCENT, margin: '0 0 0.4rem 0' }}>
          <TrendingUp size={20} color={ACCENT} />
          원가 vs 소매가: 완벽한 디커플링
          <span style={{ display:'inline-block', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', fontSize:'0.65rem', padding:'2px 6px', borderRadius:'4px', marginLeft:'8px', fontWeight:500 }}>정적 데이터</span>
          <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>(단위: USD/t · ₩/캔)</span>
          </div>
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          X축: 년/월. Y축(좌): 원어 가다랑어 국제 시세(USD/톤). Y축(우): 국내 참치 통조림(150g) 소매 납품가(원/캔). (원어 시세 30% 폭락에도 흔들리지 않는 통조림 소매가 — 새로운 이윤 창출의 틈새)
        </p>
      </div>

      {/* Chart Area — renderWidgetCard 패턴 동일 */}
      <div style={{ height: '250px', width: '100%', marginBottom: '1rem', position: 'relative', zIndex: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 50, left: 30, bottom: 20 }}>
            <defs>
              <linearGradient id="marginSpread" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis yAxisId="left" stroke="rgba(59,130,246,0.5)" tick={{ fill: 'var(--color-info)', fontSize: 11 }} tickFormatter={(v) => `$${v}`} domain={[1300, 2100]} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(239,68,68,0.5)" tick={{ fill: 'var(--color-danger)', fontSize: 11 }} tickFormatter={(v) => `₩${v}`} domain={[2500, 3500]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
            
            <Area yAxisId="right" type="monotone" dataKey="margin_spread" name="초과 마진 독식 스프레드" fill="url(#marginSpread)" stroke="none" />
            <Line yAxisId="left" type="monotone" dataKey="raw_price_usd" name="🐟 원어 국제시세 (USD/t)" stroke="var(--color-info)" strokeWidth={3} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="retail_price_krw" name="🥫 소매가 (₩/캔 150g)" stroke="var(--color-danger)" strokeWidth={3} dot={true} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>

      {/* Takeaway Box — renderWidgetCard 패턴 동일 */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          situation={situation}
          actionPlan={takeaway}
          source={source}
        />
      </div>
      </div>
    </div>
  );
}
