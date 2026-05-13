'use client';
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { ShieldAlert } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';
import data from '../data/squid_compliance_risk.json';
import useContainerWidth from '../hooks/useContainerWidth';

export default function SquidComplianceRisk() {
  const { containerRef, width } = useContainerWidth();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: 'rgba(0,15,30,0.95)', border: `1px solid ${data.color}`, padding: '12px', borderRadius: '8px', color: 'var(--text-primary)' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>해역: {data.country}</p>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>ITQ 쿼터 접근성: <strong style={{ color: 'var(--text-primary)' }}>{data.itq_index}</strong></p>
          <p style={{ margin: '4px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>IUU & ESG 리스크: <strong style={{ color: 'var(--color-danger)' }}>{data.iuu_risk}</strong></p>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>잠재 생산량: <strong style={{ color: 'var(--text-primary)' }}>{data.volume}k 톤</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <ShieldAlert size={20} />
          글로벌 ITQ 쿼터 및 IUU 컴플라이언스 리스크 매트릭스
          
        </h3>
        <p className={styles.cardSubtitle}>
          지속 가능성 기반 합작 법인(JV) 투자 타당성 검토
        </p>
      </div>

      <div style={{ width: '100%', height: width < 600 ? 350 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" dataKey="itq_index" name="ITQ 쿼터 접근성" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} label={{ value: '쿼터 지분 접근성 (Low <- -> High)', position: 'insideBottom', offset: -25, fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} domain={[0, 100]} />
            <YAxis type="number" dataKey="iuu_risk" name="IUU 사회적 리스크" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} label={{ value: '리스크 지표 (Heightened)', angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} domain={[0, 100]} />
            <ZAxis type="number" dataKey="volume" range={[200, 2000]} name="잠재 생산량" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
            
            <ReferenceLine y={50} stroke="rgba(239, 68, 68, 0.4)" strokeDasharray="3 3" />
            <ReferenceLine x={50} stroke="rgba(59, 130, 246, 0.4)" strokeDasharray="3 3" />
            
            <Scatter name="해역별 리스크 프로파일" data={data}>
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Scatter>
          </ScatterChart>
        </SafeResponsiveContainer>
      </div>

      <TakeawayBox source="국제해사기구(IMO) & 포클랜드 ITQ-B 제도 보고서" situation="중국 원양 선단이 장악한 공해상은 막대한 어획량을 보장하지만, 불법 환적(IUU) 리스크가 95에 달해 향후 구미(US/EU) 대형 유통망 수출 시 전면 차단될 '시한폭탄'입니다. 반면 포클랜드 해역은 25년 장기 어업권(ITQ-B) 접근이 가능하고 리스크가 현저히 낮습니다."
        actionPlan="저가 중심의 단기 출혈 경쟁 시대는 끝났습니다. 신라교역의 막대한 자본력을 바탕으로, 포클랜드나 아르헨티나 현지 합작 법인(JV) 지분 인수를 통한 '안전한 프리미엄 쿼터' 선점에 투자해야 글로벌 B2B 공급망 심사에서 1차 벤더 지위를 확보할 수 있습니다."
      />
    </div>
  );
}
