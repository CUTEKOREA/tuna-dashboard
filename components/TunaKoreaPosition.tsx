'use client';

import React from 'react';
import { Anchor } from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import styles from './TunaInsightsDashboard.module.css';
import data from '../data/tuna_korea_position.json';
import useContainerWidth from '../hooks/useContainerWidth';
import TakeawayBox from './TakeawayBox';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const TunaKoreaPosition = () => {
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
          <p className={styles.tooltipLabel}>{`${label}년 한국 참다랑어 수입`}</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((entry: any, index: number) => (
            <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <strong>
                {entry.dataKey === 'Value'
                  ? `$${Number(entry.value).toLocaleString()}천`
                  : `${Number(entry.value).toLocaleString()} 톤`
                }
              </strong>
            </p>
          ))}
          {payload.length >= 2 && payload[0].value > 0 && (
            <p className={styles.tooltipValue} style={{ color: '#fbbf24', marginTop: '4px' }}>
              <span>추정 단가:</span>
              <strong>${(payload[1].value / payload[0].value * 1000).toFixed(0)}/톤</strong>
            </p>
          )}
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
          한국의 양식 참다랑어 수입 경쟁력 (Korea Farmed Import Position)
          <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'rgba(16,185,129,0.1)', border:'1px solid #10b981', color:'var(--color-success)', fontSize:'0.65rem', fontWeight:600, padding:'1px 5px', borderRadius:'4px', letterSpacing:'0.2px', marginLeft:'6px' }}>🔵 SYNCED (FAO)</span>
        </h3>
        <p className={styles.cardSubtitle}>
          FAO FishStatJ 양자간 무역 데이터 중, 참다랑어 핵심 양식국(호주, 터키, 스페인 등 Top 10)에서 한국으로 수입된 물량과 금액만을 필터링한 이중 Y축 ComposedChart입니다. (자연산 수입분 제외) (순수 양식 물량은 정체되나 수입 총액은 견고 — 한국이 '최고급 프리미엄 오마카세' 성지가 된 증거)
        </p>
      </div>

      <div style={{ width: '100%', height: 350, marginTop: '20px' }}>
        <ComposedChart
          width={width > 0 ? width - 60 : 800}
          height={350}
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="Year" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
          <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fill: '#38bdf8', fontSize: 12 }} tickFormatter={(v) => `${v.toLocaleString()}`} />
          <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" tick={{ fill: '#f43f5e', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}M`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Bar yAxisId="left" dataKey="Volume" name="수입량 (톤)" fill="#38bdf8" fillOpacity={0.8} radius={[4, 4, 0, 0]} barSize={40} />
          <Line yAxisId="right" type="monotone" dataKey="Value" name="수입액 (천 USD)" stroke="#f43f5e" strokeWidth={4} dot={{ r: 5 }} activeDot={{ r: 8 }} />
        </ComposedChart>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TakeawayBox
          source="관세청 수입통계 &amp; FAO FishStatJ"
          situation="한국의 참다랑어 수입 물량과 금액 추이를 추적합니다. 물량 대비 금액 증가 속도가 빠르며 단가 구조적 상승(프리미엄화)이 뚜렷합니다."
          actionPlan="한국은 아시아 최대의 고급 Omakase 미식 시장으로 부상했으며 수입 규모의 증가 추세가 단가 상승을 입증합니다. 매입원가 상승 압박(환율, 물류비) 방어를 위해 선물환(FX Forward) 헷징 계약 체결이 필수적입니다. 또한 일본으로의 단순 중계를 넘어 사시미/초밥 세트 가공 설비에 신규 자본을 투입하고 국내 하이엔드 호레카(HoReCa) 직납 비중을 40% 이상으로 공격적으로 끌어올려 중간 유통 부가가치를 전격 내재화해야 합니다."
        />
      </div>
    </div>
  );
};

export default TunaKoreaPosition;
