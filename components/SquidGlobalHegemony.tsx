'use client';
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Globe2 } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';
import data from '../data/fishstatj_hegemony.json';
import useContainerWidth from '../hooks/useContainerWidth';

export default function SquidGlobalHegemony() {
  const { containerRef, width } = useContainerWidth();
  
  // Custom parsing to separate scatters by country
  const chinaData = data.filter(d => d.country === '중국');
  const koreaData = data.filter(d => d.country.includes('한국'));
  const japanData = data.filter(d => d.country === '일본');

  return (
    <div className={styles.glassCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Globe2 size={20} /> 글로벌 어획 패권 블랙홀 (Hegemony Shift)
          
        </h3>
        <p className={styles.cardSubtitle}>국가별 원양 선단 팽창에 따른 타 국가 조업 붕괴 현상</p>
      </div>
      <div style={{ width: '100%', height: width < 600 ? 350 : 400 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" dataKey="year" name="연도" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} domain={[1988, 2027]} ticks={[1990, 2005, 2025]} />
            <YAxis type="category" dataKey="area" name="FAO 해역" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} width={120} />
            <ZAxis type="number" dataKey="catch" name="어획 비중" range={[50, 2000]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius:'8px' }} />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
            <Scatter name="중국 선단" data={chinaData} fill="var(--color-danger)" fillOpacity={0.7} />
            <Scatter name="한국 선단" data={koreaData} fill="var(--color-info)" fillOpacity={0.7} />
            <Scatter name="일본 선단" data={japanData} fill="var(--color-success)" fillOpacity={0.7} />
          </ScatterChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox source="FAO FishStatJ (1990-2025)" situation="1990년대 북태평양을 지배했던 한국/일본 선단의 생물량 장악력(M/S)은 소멸(Evaporation) 직전이며, 막강한 국가 보조금(Subsidies)으로 무장한 중국의 극양망(Mega-trawler) 선단이 전체 글로벌 오징어 어장의 파이를 독식하는 패권 장악(Hegemony Shift)이 완료되었습니다." actionPlan="[Blue Ocean Pivot] 중국의 자본 공세가 휩쓰는 북태평양/남서대서양 메인 어장(Red Ocean)에서의 소모전(Attrition Warfare)을 즉시 포기 선언하십시오. 중국 선단 투사율이 10% 미만인 아프리카 서안이나 인도양 미개척 FAO Area 등 극단적 블루오션으로 선단을 100% 우회 전개하는 프론티어 탐사(Frontier Exploration) 조업에 전사 CAPEX를 올인해야 합니다." />
    </div>
  );
}
