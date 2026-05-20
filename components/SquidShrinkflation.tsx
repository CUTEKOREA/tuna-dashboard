'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './MackerelStrategy.module.css';
import { TrendingUp } from 'lucide-react';
import data from '../data/squid_shrinkflation.json';
import TakeawayBox from './TakeawayBox';

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const m = () => { const v = el.getBoundingClientRect().width; if (v > 0) setW(Math.floor(v)); };
    m(); const t = setTimeout(m, 200);
    const ro = new ResizeObserver(m); ro.observe(el);
    window.addEventListener('resize', m);
    return () => { clearTimeout(t); ro.disconnect(); window.removeEventListener('resize', m); };
  }, [ref]);
  return w;
}

const ShrinkflationTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const catchVal = payload.find((p: any) => p.dataKey === 'catch_tonnes')?.value || 0;
  const tradeVal = payload.find((p: any) => p.dataKey === 'trade_usd_million')?.value || 0;
  
  return (
    <div style={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(239,68,68,0.3)', padding: '14px', borderRadius: '8px', color: 'var(--text-primary)', minWidth: '220px' }}>
      <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '1rem', color: 'var(--color-danger)' }}>{label}년</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ color: '#60a5fa' }}>총 어획량 (공급)</span>
        <span style={{ fontWeight: 600 }}>{catchVal.toLocaleString()} 톤</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--color-danger)' }}>글로벌 무역액 (가치)</span>
        <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>
          ${tradeVal.toLocaleString()} 백만
        </span>
      </div>
    </div>
  );
};

export default function SquidShrinkflation() {
  const ref = useRef<HTMLDivElement>(null);
  const w = useContainerWidth(ref);
  const mobile = w > 0 && w < 500;

  return (
    <div className={styles.glassCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <TrendingUp size={20} />
          슈링크플레이션
          
        </h3>
        <p className={styles.cardSubtitle}>
          기후 위기와 남획으로 글로벌 오징어 어획량(파란 영역)은 정체·감소 추세이나, 단가 상승으로 인해 글로벌 수출액(빨간 선)은 사상 최고치를 경신 중입니다. 오징어의 프리미엄화 현상을 증명합니다.
        </p>
      </div>
      <div ref={ref} style={{ width: '100%', overflowX: 'auto' }}>
        {w > 0 && (
          <ComposedChart width={w} height={mobile ? 300 : 380} data={data} margin={{ top: 10, right: mobile ? 5 : 20, left: mobile ? -5 : 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorCatch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: mobile ? 10 : 11 }} minTickGap={mobile ? 20 : 10} />
            <YAxis yAxisId="left" stroke="rgba(59,130,246,0.3)" tick={{ fill: '#60a5fa', fontSize: 10 }} tickFormatter={v => `${(v/10000).toFixed(0)}만`} width={mobile ? 35 : 45} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(239,68,68,0.3)" tick={{ fill: 'var(--color-danger)', fontSize: 10 }} tickFormatter={v => `$${v.toLocaleString()}`} width={mobile ? 40 : 50} />
            <Tooltip content={<ShrinkflationTooltip />} />
            <Legend wrapperStyle={{ fontSize: mobile ? '10px' : '12px', paddingTop: '8px' }} />
            
            <Area yAxisId="left" type="monotone" dataKey="catch_tonnes" name="글로벌 어획량 (톤)" fillOpacity={1} fill="url(#colorCatch)" stroke="var(--color-info)" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="trade_usd_million" name="무역액 (백만 USD)" stroke="var(--color-danger)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: 'var(--color-danger)', stroke: 'var(--text-primary)', strokeWidth: 2 }} />
          </ComposedChart>
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          source="FAO FishStatJ Global Squid Production &amp; Trade"
          situation="오징어 글로벌 생산량(파란선)은 남획과 해수온 상승(ENSO)으로 역대 최대 피크를 찍었던 2015년 이후 현재(2023년)까지 무려 약 -17% 급감하며 구조적 자원 부족 사이클을 견뎌내고 있습니다. 반면 동일 기간 글로벌 수출액(오렌지선)은 총량이 줄었음에도 불구하고 폭발적인 단가 상승으로 인해 95억 달러(2021년엔 100억 달러 이상 최고치) 수준의 막대한 무역액을 견인합니다. 이는 한 마리당 중량이 줄고 희귀해지는 '슈링크플레이션' 환경 속에서 오징어가 '초 프리미엄 원자재'로 격상되었음을 의미합니다."
          actionPlan="물량 쿼터 달성 중심의 박리다매 전략에서 전면 탈피하여, 한정된 원물을 최고가로 전환하는 '가치 부가(Value-Adding)' 체제로 전환해야 합니다. 소형어 비중 증가에 대응해 내장/먹물을 활용한 소스, 펫푸드 상품 개발을 서두르고 중대형어 판관 단가를 극대화하기 위해 글로벌 하이엔드 어장(스시/통구이) 유통 파이프라인의 수율(Yield) 최적화 공정을 도입."
        />
      </div>
    </div>
  );
}
