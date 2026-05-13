'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Anchor } from 'lucide-react';
import styles from './TunaExtractDashboard.module.css';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TakeawayBox from './TakeawayBox';

export default function TunaPngHubStrategy() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/tuna-extract');
        const json = await res.json();
        setData(json.d_n1_png_hub);
      } catch (err) {
        console.error("Failed to fetch PNG hub data", err);
      }
    };
    fetchData();
  }, []);

  if (!data) return null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Anchor size={18} className={styles.cardIcon} color="#f59e0b" />
          N1. 태평양 가공 허브 (PNG) vs 국내 조달 원가율 비교
        </h3>
      </div>
      <div className={styles.cardBody}>
        <SafeResponsiveContainer height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#94a3b8" />
            <YAxis dataKey="cost_type" type="category" stroke="#94a3b8" fontSize={11} width={120} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Legend />
            <Bar dataKey="domestic" name="국내 직조달 ($/톤)" fill="#ef4444" />
            <Bar dataKey="png_hub" name="PNG 산지 추출 ($/톤)" fill="#10b981" />
          </BarChart>
        </SafeResponsiveContainer>
        <TakeawayBox 
          situation="동원산업은 파푸아뉴기니(PNG)에 'RD Tuna Canners'를 구축하며 현지 가공 허브를 선점했습니다. 무거운 냉동 원물을 한국으로 들여와 가공할 경우 냉동 보관 및 내륙 물류비가 극심하게 발생하지만, 어획 산지에서 즉각 해체 및 1차 자숙액을 추출하면 물류비/보관비가 70% 이상 절감됩니다." 
          actionPlan="1) '산지 1차 가공 → 국내 고도화 숙성'의 글로벌 분업 모델(Global Arbitrage)을 적극 활용해 국내 중소규모 경쟁사(한라식품 등)가 따라올 수 없는 근본적인 원가 진입장벽을 구축해야 합니다. 2) PNG 허브를 동남아/호주로 직수출하는 전초 기지로 격상시킵니다." 
          source="동원산업 글로벌 Value Chain 전략 분석 및 수산물류 비용 구조 데이터" 
        />
      </div>
    </div>
  );
}
