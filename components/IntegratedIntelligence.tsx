'use client';

import React from 'react';
import AIForecast from './AIForecast';
import StrategyIntel from './StrategyIntel';
import RetailPOS from './RetailPOS';
import { Target, Activity, Cpu } from 'lucide-react';
import styles from './IntegratedIntelligence.module.css';

export default function IntegratedIntelligence() {
  return (
    <div className={styles.container}>
      <div className={styles.mainHeader}>
        <Target size={28} />
        글로벌 전략 통합 리서치 (Integrated Intelligence)
        <span className={styles.badge}>
          V2 UNIFIED
        </span>
      </div>
      
      {/* 1. Macro & Forecast */}
      <div className={styles.sectionCard}>
         <div className={styles.sectionHeader} style={{ color: '#c4b5fd' }}>
            <Cpu size={20}/> 1. 거시 지표 및 유가-단가 예측 (Macro & Forecast)
         </div>
         <AIForecast hideHeader={true} />
      </div>

      {/* 2. Competitor Strategy */}
      <div className={styles.sectionCard}>
         <div className={styles.sectionHeader} style={{ color: '#0ea5e9' }}>
            <Target size={20}/> 2. 경쟁사 동향 및 파이프라인 (Competitor Intelligence)
         </div>
         <StrategyIntel hideHeader={true} />
      </div>

      {/* 3. Retail & POS */}
      <div className={styles.sectionCard}>
         <div className={styles.sectionHeader} style={{ color: 'var(--color-success)' }}>
            <Activity size={20}/> 3. 소매 채널 방어 및 실행안 (Retail & Execution)
         </div>
         <RetailPOS hideHeader={true} />
      </div>
    </div>
  );
}
