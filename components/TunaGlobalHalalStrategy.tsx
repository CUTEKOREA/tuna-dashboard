'use client';

import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Globe2 } from 'lucide-react';
import styles from './TunaExtractDashboard.module.css';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TakeawayBox from './TakeawayBox';

export default function TunaGlobalHalalStrategy() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/tuna-extract');
        const json = await res.json();
        setData(json.d_n2_global_fishsauce);
      } catch (err) {
        console.error("Failed to fetch Global Halal data", err);
      }
    };
    fetchData();
  }, []);

  if (!data) return null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Globe2 size={18} className={styles.cardIcon} color="#3b82f6" />
          N2. K-피시소스 글로벌 할랄 침투 포텐셜 (단위: 십억 달러)
        </h3>
      </div>
      <div className={styles.cardBody}>
        <SafeResponsiveContainer height={280}>
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              innerRadius={60} 
              outerRadius={100} 
              paddingAngle={5} 
              dataKey="size" 
              nameKey="market"
              label={({name, value}: any) => `${name}: $${value.toFixed(2)}B`}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Legend />
          </PieChart>
        </SafeResponsiveContainer>
        <TakeawayBox 
          situation="한국 참치액 시장(약 $70M)은 내수 포화 단계에 진입 중이나, 글로벌 피시소스 시장($4.5B)과 할랄 시장($1.2B)은 여전히 구시대적 발효 공정과 특유의 비린내(Fishy smell) 한계를 겪고 있습니다. 참치액은 훈연 공정(Smoked)으로 비린내를 완벽히 잡은 프리미엄 'K-피시소스'로서 압도적 품질 우위를 갖습니다." 
          actionPlan="1) 인도네시아/말레이시아 타겟팅을 위한 JAKIM(말레이시아 할랄) 또는 MUI(인도네시아 할랄) 인증 획득을 최우선 추진합니다. 2) 현지 피시소스 1위 브랜드들과 B2B 원료(베이스 액) 납품 계약을 체결하여 마케팅 비용 없이 시장 파이를 확보합니다." 
          source="UNIDO 동남아 피시소스 공정 현대화 보고서 / KOTRA 글로벌 할랄 푸드 시장 트렌드" 
        />
      </div>
    </div>
  );
}
