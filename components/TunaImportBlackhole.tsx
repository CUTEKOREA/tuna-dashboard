'use client';

import React from 'react';
import { Anchor } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import styles from './TunaInsightsDashboard.module.css';
import data from '../data/tuna_import_blackhole.json';
import useContainerWidth from '../hooks/useContainerWidth';
import TakeawayBox from './TakeawayBox';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const TunaImportBlackhole = () => {
  const { containerRef, width } = useContainerWidth();

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
          <p className={styles.tooltipLabel}>{label}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((entry: any, index: number) => (
            <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
              <span>총 수입량:</span>
              <strong>{Number(entry.value).toLocaleString()} 톤</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getBarColor = (country: string) => {
    if (country === '일본') return 'var(--color-danger)';
    if (country === '한국') return 'var(--color-info)';
    return '#64748b';
  };

  return (
    <div className={styles.insightCard} ref={containerRef}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Anchor size={20} />
          참다랑어 양식 블랙홀 수입국 분석 (Top Import Targets)
          <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'rgba(16,185,129,0.1)', border:'1px solid #10b981', color:'var(--color-success)', fontSize:'0.65rem', fontWeight:600, padding:'1px 5px', borderRadius:'4px', letterSpacing:'0.2px', marginLeft:'6px' }}>🟢 LIVE API (FAO)</span>
        </h3>
        <p className={styles.cardSubtitle}>
          FAO FishStatJ 양자간 무역 데이터 중, 세계 10대 참다랑어 양식국(호주, 몰타, 터키 등)에서 출발한 '양식 오리진(Farmed Origin)' 수입 물량만을 정밀 필터링하여 합산했습니다. (2019~2023년 전 세계 양식 참다랑어 수입 블랙홀 구조 분석)
        </p>
      </div>

      <div style={{ width: '100%', height: 380, marginTop: '20px' }}>
        <BarChart
          width={width > 0 ? width - 60 : 800}
          height={380}
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 40, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} angle={0} textAnchor="middle" height={60} />
          <YAxis type="category" dataKey="Country" width={140} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Volume" radius={[0, 6, 6, 0]} barSize={22}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.Country)} />
            ))}
          </Bar>
        </BarChart>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          source="FAO FishStatJ Farmed Bluefin Import Volume"
          situation="전 세계 양식 참다랑어 수입의 절반 이상을 일본이 빨아들이는 '블랙홀' 구조가 확인됩니다. 글로벌 소비 접근의 구조적 병목입니다."
          actionPlan="**[Actionable Insight]** 전 세계 수입 참다랑어의 과반 이상이 도쿄로 향하는 '기형적 블랙홀 파레토 원칙'이 작동 중입니다. 일본 바이어들이 물류와 경매 단가를 독식하는 구조를 깨야 합니다. 츠키지/도요스 시장 등 일본 경매를 경유하지 말고, 최대 산지인 호주·지중해(몰타) 양식장과 무조건 '산지 직거래(Direct Sourcing)' 채널을 개통하십시오. 중간 유통마진을 회수하여 한국발 미국/유럽행 직수출 프리미엄 브랜드의 가격 경쟁력을 단번에 확보해야 해야 합니다. (Conviction Buy)"
        />
      </div>
    </div>
  );
};

export default TunaImportBlackhole;
