'use client';

import React, { useState } from 'react';
import { Globe, Target, Cpu, Droplets, ShieldCheck, TrendingUp, TrendingDown, Minus, Activity, AlertTriangle, FileText } from 'lucide-react';
import styles from './CashewIntelligence.module.css';
import { CASHEW_INTELLIGENCE_DATA } from './CashewIntelligenceData';

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe size={18} />,
  Target: <Target size={18} />,
  Cpu: <Cpu size={18} />,
  Droplets: <Droplets size={18} />,
  ShieldCheck: <ShieldCheck size={18} />,
};

export default function CashewIntelligence() {
  const [activeTab, setActiveTab] = useState(0);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp size={20} className={styles.trendUp} />;
      case 'down': return <TrendingDown size={20} className={styles.trendDown} />;
      case 'alert': return <AlertTriangle size={20} className={styles.trendAlert} />;
      default: return <Minus size={20} className={styles.trendNeutral} />;
    }
  };

  const getTrendClass = (trend: string) => {
    switch (trend) {
      case 'up': return styles.trendUp;
      case 'down': return styles.trendDown;
      case 'alert': return styles.trendAlert;
      default: return styles.trendNeutral;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Activity size={24} color="#fcd34d" />
          가나 스마트팩토리 매크로 인텔리전스 (Top 50 KPI)
        </div>
        <div className={styles.subtitle}>
          NotebookLM 추출 데이터 기반: 어림짐작을 배제한 유닛 이코노믹스 및 규제 압박 손익분기 증명서
        </div>
      </div>

      <div className={styles.tabsContainer}>
        {CASHEW_INTELLIGENCE_DATA.map((tab, index) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === index ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {iconMap[tab.iconName] || <Globe size={18} />}
            {tab.tabName}
          </button>
        ))}
      </div>

      <div className={styles.gridContent}>
        {CASHEW_INTELLIGENCE_DATA[activeTab].widgets.map((widget, idx) => (
          <div key={idx} className={styles.widgetCard}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetTitle}>
                {widget.title}
                {widget.reliability && widget.reliability <= 70 && (
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', background:'#292524', border:'1px solid var(--w-amber-500)', color:'var(--color-warning)', fontSize:'0.65rem', fontWeight:600, padding:'1px 5px', borderRadius:'4px', letterSpacing:'0.2px', marginLeft:'6px', whiteSpace:'nowrap' }}>📐 Estimate</span>
                )}
              </div>
              {getTrendIcon(widget.trend)}
            </div>
            
            <div className={styles.widgetValueBox}>
              <span className={`${styles.widgetValue} ${getTrendClass(widget.trend)}`}>
                {widget.value}
              </span>
              {widget.unit && <span className={styles.widgetUnit}>{widget.unit}</span>}
            </div>

            <div className={styles.widgetDesc}>
              {widget.desc}
            </div>

            <div className={styles.widgetSourceBox}>
              <FileText size={12} color="rgba(255,255,255,0.3)" />
              <div className={styles.widgetSource}>[출처] {widget.source}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
