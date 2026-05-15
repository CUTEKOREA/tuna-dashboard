"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Anchor } from 'lucide-react';
import styles from './TunaInsightsDashboard.module.css';
import koreaOriginsData from '../data/tuna_korea_import_origins.json';
import useContainerWidth from '../hooks/useContainerWidth';
import TakeawayBox from './TakeawayBox';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const TunaKoreaOrigins = () => {
  const { containerRef, width } = useContainerWidth();
  const [activeChart, setActiveChart] = useState<'koreaOrigins'>('koreaOrigins');

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
        <div style={{ backgroundColor: '#0F172A', border: '1px solid #334155', padding: '12px', borderRadius: '8px', color: '#f8fafc' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{`${label}년`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color, display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 'bold' }}>{formatNumber(entry.value)} 톤</span>
            </p>
          ))}
          <div style={{ borderTop: '1px solid #334155', marginTop: '8px', paddingTop: '8px' }}></div>
          <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between', gap: '16px', color: '#f8fafc' }}>
            <span>총합:</span>
            <span style={{ fontWeight: 'bold' }}>{formatNumber(payload.reduce((acc: number, curr: any) => acc + curr.value, 0))} 톤</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Ensure '기타' is always at the end
  const allKeys = new Set<string>();
  koreaOriginsData.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'Year' && key !== '기타 (Others)') {
        allKeys.add(key);
      }
    });
  });
  const origins = Array.from(allKeys);
  
  const colors: Record<string, string> = {
    '일본': 'var(--color-danger)',
    '호주': 'var(--color-warning)',
    '튀르키예': 'var(--color-success)',
    '스페인': '#8b5cf6',
    '몰타': '#06b6d4',
    '모로코': '#ec4899',
    '기타 (Others)': '#64748b',
  };
  const defaultColors = ['#ec4899', '#06b6d4', '#a855f7', 'var(--color-info)'];

  return (
    <div className={styles.insightCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Anchor size={20} />
          한국의 양식 참다랑어 수입 출처 (Korea Farmed Import Origins)
          <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'rgba(16,185,129,0.1)', border:'1px solid #10b981', color:'var(--color-success)', fontSize:'0.65rem', fontWeight:600, padding:'1px 5px', borderRadius:'4px', letterSpacing:'0.2px', marginLeft:'6px' }}>🟢 LIVE API (FAO)</span>
        </h3>
        <p className={styles.cardSubtitle}>
          FAO FishStatJ 무역 데이터 중 한국의 참다랑어 수입량 5년치를, 수출국(Partner country)이 세계 Top 10 참다랑어 양식국인 조건으로 교차 필터링하여 생성한 Stacked Bar Chart입니다. (한국의 양식 참다랑어 수입 경로 점유율 - 튀르키예, 스페인 등 지중해 축양 참치가 한국 프리미엄 시장 장악)
        </p>
      </div>

      <div style={{ width: '100%', height: '300px' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart
            data={koreaOriginsData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis dataKey="Year" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false}  angle={-25} textAnchor="end" height={60} tickFormatter={truncateXAxis}/>
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${formatNumber(value)}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {origins.map((origin, index) => (
              <Bar 
                key={origin} 
                dataKey={origin} 
                stackId="a" 
                fill={colors[origin] || defaultColors[index % defaultColors.length]} 
                animationDuration={2000} 
              />
            ))}
            <Bar 
              key="기타 (Others)" 
              dataKey="기타 (Others)" 
              stackId="a" 
              fill={colors['기타 (Others)']} 
              animationDuration={2000} 
            />
          </BarChart>
        </SafeResponsiveContainer>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          source="관세청 수입통계 HS코드 분석"
          situation="한국이 참다랑어를 수입하는 원산지별 비중과 변화를 분석합니다. 특정 산지 편중과 다변화 추이를 파악하는 핵심 지표입니다."
          actionPlan="대한민국 최고급 하이엔드 Omakase 시장을 타겟팅하려면 품질과 수율이 불확실한 자연산 조업보다 지중해권(튀르키예, 스페인 등) 축양 물량의 락인이 필수적입니다. 단순히 일본 상사를 거쳐 수입하는 패시브(Passive)한 소싱에서 벗어나 유럽 현지의 탑티어 팜(Farm)들과의 독점적인 장기 구매 계약채널을 열고, 국내 미식 소비자들이 열광하는 지방 함량(Otoro)의 균일성 등 '프리미엄 지표'를 마케팅 전면에 내세워야 초과 수익을 누릴 수 있습니다."
        />
      </div>
    </div>
  );
};

export default TunaKoreaOrigins;
