"use client";

import React from 'react';
import { motion } from 'framer-motion';

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
      <div className="ds-situation-box" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-info)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          📊 현황 분석 (SITUATION)
        </span>
        <div style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {situation}
        </div>
      </div>
      
      <div className="ds-takeaway-box" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-success)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          ⚡️ 실행 전략 (EXECUTIVE TAKEAWAY)
        </span>
        <div style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {takeaway || actionPlan}
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
