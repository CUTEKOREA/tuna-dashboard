'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { BarChart2 } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';

const data = [
  { year: '2015', multiplier: 1.8 },
  { year: '2017', multiplier: 2.1 },
  { year: '2019', multiplier: 2.5 },
  { year: '2021', multiplier: 3.2 },
  { year: '2023', multiplier: 4.6 },
  { year: '2024', multiplier: 5.8 },
  { year: '2025', multiplier: 7.2 }
];

export default function MackerelSizePremium() {
  return (
    <div className={styles.glassCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <BarChart2 size={20} />
          사이즈간 체급 프리미엄 배수
          
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          소형어(200g 미만) 가격을 
        </p>
      </div>
      <div style={{ width: '100%', height: 350 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorMult" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`${v}x`} tick={{ fill: 'var(--color-warning)', fontSize: 10, fontWeight: 'bold' }} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)' }} />
            <Area type="monotone" dataKey="multiplier" name="대형 가격 배수" stroke="var(--color-warning)" strokeWidth={3} fillOpacity={1} fill="url(#colorMult)" />
          </AreaChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox situation="해양 생태계 변화로 국내산 대형 사이즈 생물량(Biomass)이 절멸 국면에 진입하면서, 대-소 체급 간 단가 스프레드가 7배(7x Multiple) 위로 폭발적으로 팽창하는 극단적 마켓 양극화(Super-Polarization)가 완성되었습니다." actionPlan="[Supply Monopolization & Product Mix] 대형 체급은 단순 소비재가 아닌 \'Veblen Good(과시재)\'으로 격상되었습니다. 최상위 선단에 대한 독점적 조업 선도자금(Pre-financing) 투입으로 대형물을 100% 싹쓸이(Sweep)하고, 소형물은 당사 HMR(가정간편식) 브랜드의 순살 가공 블렌딩 원료로 강제 치환하는 정밀한 티어링(Tiering) 설계가 필요합니다." />
    </div>
  );
}