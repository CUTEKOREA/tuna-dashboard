'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Ship } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';

const data = [
  { q: '23.1Q', norway: 3.2, uk: 2.8, ireland: 2.7, chile: 1.5 },
  { q: '23.3Q', norway: 3.4, uk: 3.0, ireland: 2.9, chile: 1.6 },
  { q: '24.1Q', norway: 4.8, uk: 4.1, ireland: 4.0, chile: 2.1 },
  { q: '24.3Q', norway: 5.5, uk: 4.8, ireland: 4.5, chile: 2.4 },
  { q: '25.1Q', norway: 6.8, uk: 5.7, ireland: 5.2, chile: 3.0 }
];

export default function MackerelAltSourcingIndex() {
  return (
    <div className={styles.glassCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Ship size={20} />
          대체 공급망 단가 매력도 지수
          
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          노르웨이를 제치고 부상 중인 칠레, 아일랜드, 영국산 고등어의 C&F 수입단가(USD/kg) 상대 추이 트래킹입니다. 분기별 통관단가 기준
        </p>
      </div>
      <div style={{ width: '100%', height: 350 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="q" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`$${v}`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line type="monotone" dataKey="norway" name="노르웨이산" stroke="#38bdf8" strokeWidth={3} />
            <Line type="monotone" dataKey="uk" name="영국산" stroke="#cbd5e1" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="ireland" name="아일랜드산" stroke="var(--color-success)" />
            <Line type="monotone" dataKey="chile" name="칠레산" stroke="var(--color-warning)" strokeWidth={2} />
          </LineChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox source="HSCustoms & UN Comtrade" situation="[Sourcing Diversification Dynamics] 노르웨이산의 초프리미엄(Hyper-premium) 지배력이 정점에 달한 가운데, 영국/아일랜드산이 티어 1.5 포지션으로 차익 거래 틈새를 침투 중입니다. 반면 칠레/페루산(펠라직 혼용)은 압도적 매입원가(COGS) 우위(Cost Leadership)로 밑바닥 볼륨 마켓을 잠식하는 명확한 시장 분절(Fragmentation)이 포착됩니다." actionPlan="**[Actionable Insight]** [Bifurcated Capital Allocation] 단일 소싱의 함정(Vendor Lock-in)을 즉각 해체하십시오. 단가 탄력성이 높은 B2B 통조림/식자재 유통 라인은 칠레산 기반의 파격적 로우코스트(Low-cost) 네트워크로 전면 개편하고, 투자가용자본(Dry Powder)은 철저히 B2C 대형 마트의 \'노르웨이 프리미엄 매대\' 브랜드 독점력 강화에만 100% 집중하는 투-트랙(Two-Track) 엣지를 실행해야 합니다. (Conviction Buy)" />
    </div>
  );
}