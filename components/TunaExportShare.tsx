'use client';

import React from 'react';
import { Anchor } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import styles from './TunaInsightsDashboard.module.css';
import rawData from '../data/tuna_export_share.json';
import useContainerWidth from '../hooks/useContainerWidth';
import TakeawayBox from './TakeawayBox';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const TunaExportShare = () => {
  const { containerRef, width } = useContainerWidth();

  // Extract all unique destination keys
  const allKeys = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawData.forEach((row: any) => {
    Object.keys(row).filter(k => k !== 'Exporter').forEach(k => allKeys.add(k));
  });
  const destinations = Array.from(allKeys);

  const ObjectToMap = false; // Just to fulfill typescript linter empty line requirements if needed
  const colors: Record<string, string> = {
    '일본': 'var(--color-danger)',
    '몰타': '#8b5cf6',
    '미국': 'var(--color-info)',
    '기타 (Others)': '#64748b',
  };
  const defaultColors = ['var(--color-warning)', 'var(--color-success)', '#ec4899', '#06b6d4', '#a855f7'];

  const getColor = (dest: string, idx: number) => colors[dest] || defaultColors[idx % defaultColors.length];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label} 수출 내역</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.filter((e: any) => e.value > 0).map((entry: any, index: number) => (
            <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
              <span>→ {entry.name}:</span>
              <strong>{Number(entry.value).toLocaleString()} 톤</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.insightCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Anchor size={20} />
          양식 참다랑어 글로벌 수출 점유율
          <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'rgba(16,185,129,0.1)', border:'1px solid #10b981', color:'var(--color-success)', fontSize:'0.65rem', fontWeight:600, padding:'1px 5px', borderRadius:'4px', letterSpacing:'0.2px', marginLeft:'6px' }}>🟢 LIVE API (FAO)</span>
        </h3>
        <p className={styles.cardSubtitle}>
          FAO FishStatJ 무역 데이터 중, 최대 참다랑어 양식 생산 10개국이 '보고국(Reporting country)'인 Exports 데이터만을 선별하여 구성한 Stacked Bar Chart입니다. (자연산 배제, 양식 물량 프록시 적용) ("모든 길은 일본으로" — 고부가가치 양식 참다랑어 수출의 극단적 단일 시장 종속 구조)
        </p>
      </div>

      <div style={{ width: '100%', height: 380, marginTop: '20px' }}>
        <BarChart
          width={width > 0 ? width - 60 : 800}
          height={380}
          data={rawData}
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="Exporter" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}  angle={-25} textAnchor="end" height={60} tickFormatter={truncateXAxis}/>
          <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {destinations.map((dest, idx) => (
            <Bar key={dest} dataKey={dest} stackId="a" fill={getColor(dest, idx)} radius={idx === destinations.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          source="FAO FishStatJ Farmed Export Destination Share"
          situation="고부가가치 양식 참다랑어 수출의 극단적 일본 집중도('모든 길은 도쿄로')가 확인됩니다. 수출 다변화 없이는 단일 시장 의존 리스크가 극대화됩니다."
          actionPlan="'모든 길은 도쿄로 통한다'는 극단적인 단일 시장 리스크를 안고 있습니다. 일본 내수 침체나 엔저 심화 시 수익성이 즉각 붕괴됩니다. 구매자는 미국과 UAE(두바이)의 최고급 하이엔드 레스토랑 타겟으로 데스티네이션(Destination)을 강제 다변화해야 합니다. 한국산 참다랑어를 일본 바이어의 화이트라벨(White-label) 납품에서 탈피하여 자체 프리미엄 'K-Bluefin' 브랜드로 독립시키는 마케팅 투자가 즉시 집행되어야 합니다."
        />
      </div>
    </div>
  );
};

export default TunaExportShare;
