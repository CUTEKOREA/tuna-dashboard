"use client";

import React from 'react';
import { motion } from 'framer-motion';
import styles from './TakeawayBox.module.css';

export default function TakeawayBox({ situation, actionPlan, takeaway, source }: { situation: React.ReactNode, actionPlan?: React.ReactNode, takeaway?: React.ReactNode, source?: string }) {
  return (
    <motion.div 
      className="ds-card-insight"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflowWrap: 'break-word',
        wordBreak: 'keep-all',
      }}
    >
      <div className={`ds-situation-box ${styles.sit}`} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--w-slate-400)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span aria-hidden="true" style={{ fontSize: '0.8rem', lineHeight: 1 }}>📊</span>
          현황 분석
        </span>
        <div style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {typeof situation === 'string' ? (
            situation.includes('<ul') || situation.includes('<li') || situation.includes('<div') ? (
              <div dangerouslySetInnerHTML={{ __html: situation }} />
            ) : (
              <ul><li>{situation}</li></ul>
            )
          ) : situation}
        </div>
      </div>
      
      <div className={`ds-takeaway-box ${styles.tak}`} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22d3ee', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span aria-hidden="true" style={{ fontSize: '0.8rem', lineHeight: 1 }}>⚡️</span>
          실행 전략
        </span>
        <div style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {typeof (takeaway || actionPlan) === 'string' ? (
            ((takeaway || actionPlan) as string).includes('<ul') || ((takeaway || actionPlan) as string).includes('<li') || ((takeaway || actionPlan) as string).includes('<div') ? (
              <div dangerouslySetInnerHTML={{ __html: (takeaway || actionPlan) as string }} />
            ) : (
              <ul><li>{(takeaway || actionPlan)}</li></ul>
            )
          ) : (takeaway || actionPlan)}
        </div>
      </div>

      {source && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '4px', paddingLeft: '4px' }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginTop: '1px' }}>🔗</span>
          <div style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
            출처: {source}
          </div>
        </div>
      )}
    </motion.div>
  );
}
