'use client';

import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell, ReferenceLine } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import styles from './CategoryPortfolio.module.css';
import { PackageSearch, TrendingUp } from 'lucide-react';
import TermTooltip from './TermTooltip';

const portfolioData = [
  { name: '노 드레인 파우치 (Pouch)', share: 25, growth: 28, rev: 2500, fill: '#38bdf8', category: 'Question Mark', insight: '공장 A-3 라인 파우치 전용 전환 시, 연간 OP +3.5% 상승 기회' },
  { name: '가미/조리참치 (Flavored)', share: 15, growth: 35, rev: 1200, fill: '#34d399', category: 'Question Mark', insight: 'K-Food 열풍. 초당옥수수/마라맛 등 MZ 타겟 한정판 추가 생산 요망' },
  { name: '일반 오일 캔 (Standard Cans)', share: 65, growth: 2, rev: 6000, fill: '#94a3b8', category: 'Cash Cow', insight: '성장 정체. 마케팅 비용은 축소하고 유지 보수만 하는 전략 권장' },
  { name: '식자재용 대용량 (Catering)', share: 45, growth: -5, rev: 2800, fill: '#cbd5e1', category: 'Dog', insight: 'B2B 시장 축소 중. 동남아 로컬 가트너에게 위탁 생산(OEM) 이관' },
  { name: '비건/대체 참치 (Plant-based)', share: 5, growth: 18, rev: 400, fill: '#fbbf24', category: 'Question Mark', insight: '유럽 틈새 시장 겨냥용. 단기적인 대규모 라인 배정은 유보' }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: '#0F172A', border: `1px solid ${data.fill}`, padding: '16px', borderRadius: '8px', width: '280px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold', color: data.fill }}>{data.name}</p>
        <span style={{ display: 'inline-block', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '11px', color: '#cbd5e1', marginBottom: '12px' }}>
          단면: {data.category}
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
          <div>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>시장 점유율</p>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{data.share}%</p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>매출 성장률(YoY)</p>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: data.growth > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {data.growth > 0 ? '+' : ''}{data.growth}%
            </p>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>연매출</p>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>${data.rev}M</p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#e2e8f0', lineHeight: 1.4 }}>
          <strong>AI 팩토리 제언:</strong><br/>
          {data.insight}
        </p>
      </div>
    );
  }
  return null;
};

export default function CategoryPortfolio() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <PackageSearch size={20} color="#fbbf24" />
          <TermTooltip term="패키징 포트폴리오 및 고성장 카테고리 시뮬레이터" description="BCG 매트릭스 기법을 활용하여, 우리 회사의 참치 제품군(일반 캔, 파우치, 조리참치 등) 중 어디에 투자를 집중하고 어디를 줄여야 할지 AI가 제안하는 전략 분석표입니다." />
        </div>
      </div>

      <div className={styles.chartWrapper}>
        {/* BCG Overlay Background */}
        <div className={styles.matrixBackground}>
          <div className={`${styles.quadrant} ${styles.tl}`}><span><TermTooltip term="Question Mark" description="시장 점유율은 아직 낮지만 매우 빠르게 성장하고 있어 본격적인 대규모 육성 투자가 필요할지도 모르는 '물음표' 사업군입니다. (예: 비건/대체 참치)" /></span></div>
          <div className={`${styles.quadrant} ${styles.tr}`}><span><TermTooltip term="Star" description="시장 점유율도 높고 성장률도 가파른 수익창출원입니다. 경쟁을 방어하기 위해 적극적인 투자가 필요한 '에이스' 단위입니다." /></span></div>
          <div className={`${styles.quadrant} ${styles.bl}`}><span><TermTooltip term="Dog" description="점유율도 낮고 성장률도 정체되어있어 시장 철수, 매각, 외주화를 고려해야 하는 '개' 사업군입니다." /></span></div>
          <div className={`${styles.quadrant} ${styles.br}`}><span><TermTooltip term="Cash Cow" description="성장률은 비교적 낮지만 시장 점유율을 바탕으로 회사에 꼬박꼬박 막대한 현금(돈줄)을 벌어다 주는 안정적 '캐시카우' 사업군입니다. (예: 일반 오일 참치 캔)" /></span></div>
        </div>

        <SafeResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            {/* Grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            
            {/* Quadrant Lines (Targeting center points of domain x:0~80, y:-10~40) */}
            <ReferenceLine x={40} stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="5 5" />
            <ReferenceLine y={10} stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="5 5" />

            <XAxis 
              type="number" 
              dataKey="share" 
              name="시장 점유율(%)" 
              domain={[0, 80]} 
              tick={{ fill: '#94a3b8', fontSize: 11 }} 
              label={{ value: '시장 점유율 %', position: 'insideBottom', fill: '#94a3b8', fontSize: 12, offset: -10 }} 
            />
            <YAxis 
              type="number" 
              dataKey="growth" 
              name="연평균 성장률(%)" 
              domain={[-10, 40]} 
              tick={{ fill: '#94a3b8', fontSize: 11 }} 
              label={{ value: '성장률 (YoY Growth) %', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }} 
            />
            <ZAxis type="number" dataKey="rev" range={[200, 5000]} />
            <RechartsTooltip cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} content={<CustomTooltip />} />
            
            <Scatter name="Portfolio" data={portfolioData}>
              {portfolioData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
              ))}
            </Scatter>
          </ScatterChart>
        </SafeResponsiveContainer>
      </div>

      <div className={styles.insightPanel}>
        <div className={styles.insightIcon}>
          <TrendingUp size={24} />
        </div>
        <div className={styles.insightContent}>
          <div className={styles.insightTitle}>최적화 제안: 파우치 및 가미 참치 생산 비중 확대</div>
          <div className={styles.insightDesc}>
            저마진 오일 캔(Cash Cow)의 수익 정체가 확인되었습니다. 고속 성장 중인 <span className={styles.highlight}>노 드레인 파우치(28%)</span> 및 <span className={styles.highlight}>가미 참치(35%)</span>의 수요를 맞추기 위해, 현재 가동률이 낮은 2공장의 B라인을 즉각 파우치 전용 라인으로 개조하는 방안이 권장됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}
