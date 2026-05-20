'use client';

import React from 'react';
import { Anchor } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import styles from './TunaInsightsDashboard.module.css';
import data from '../data/tuna_aqua_hegemony.json';
import useContainerWidth from '../hooks/useContainerWidth';
import TakeawayBox from './TakeawayBox';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const TunaAquaHegemony = () => {
  const { containerRef, width } = useContainerWidth();

  // Extract country keys automatically from the first data object, ignoring 'Year'
  const countries = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'Year') : [];
  
  // High contrast premium colors
  const colors = ['#8b5cf6', 'var(--color-info)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-danger)', '#ec4899'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const total = payload.reduce((result: number, entry: any) => result + entry.value, 0);

      
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{`${label}년 생산량 분포`}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((entry: any, index: number) => (
            <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <strong>{Number(entry.value).toLocaleString()} 톤</strong>
            </p>
          ))}
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
          <p className={styles.tooltipValue} style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
            <span>총 양식량:</span>
            <strong>{Number(total).toLocaleString()} 톤</strong>
          </p>
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
          양식 참다랑어 생산 패권 (Global Aquaculture Hegemony)
          <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'rgba(16,185,129,0.1)', border:'1px solid #10b981', color:'var(--color-success)', fontSize:'0.65rem', fontWeight:600, padding:'1px 5px', borderRadius:'4px', letterSpacing:'0.2px', marginLeft:'6px' }}>🟢 LIVE API (FAO)</span>
        </h3>
        <p className={styles.cardSubtitle}>
          상위 생산 5개국을 추출하여 누적 면적 그래프(Stacked Area Chart)로 전체 시장의 크기와 점유율을 동시에 표현했습니다. (자금력과 기술력을 바탕으로 고부가가치 참다랑어 양식 패권을 장악하는 선진 해양국의 점유율 차트)
        </p>
      </div>

      <div style={{ width: '100%', height: 350, marginTop: '20px' }}>
        <AreaChart width={width > 0 ? width - 60 : 800} height={350} data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="Year" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
          <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} tickFormatter={(value) => `${value.toLocaleString()}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {countries.map((country, idx) => (
            <Area 
              key={country} 
              type="monotone" 
              dataKey={country} 
              stackId="1" 
              stroke={colors[idx % colors.length]} 
              fill={colors[idx % colors.length]} 
              fillOpacity={0.8} 
            />
          ))}
        </AreaChart>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          source="FAO FishStatJ Aquaculture Production by Country"
          situation="지중해권(호주, 일본, 스페인, 몰타, 멕시코)이 양식 참다랑어 생산의 절대 패권을 장악하고 있으며, 고부가가치 양식 시장의 지형이 빠르게 재편되고 있습니다."
          actionPlan="**[Actionable Insight]** 지중해 남부(호주/일본 자본 유입)와 일부 선진국이 고부가가치 양식 생태계를 독점하고 있습니다. 우리 기업이 이 카르텔을 단독으로 깨는 것은 불가능합니다. 차라리 자본력이 부족한 튀르키예나 크로아티아 등 후발 양식 국가에 ODA(공적개발원조) 또는 민간 합작 채널을 통해 설비(냉동/사료)를 선지원하고 반대급부로 양식 물량의 장기 매입권(Off-take)을 독점하는 투트랙 우회 전략을 구사하여 잉여현금흐름(FCF)을 극대화하십시오. (Strong Buy)"
        />
      </div>
    </div>
  );
};

export default TunaAquaHegemony;
