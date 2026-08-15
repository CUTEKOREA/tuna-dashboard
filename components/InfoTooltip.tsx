'use client';

import React from 'react';

interface InfoTooltipProps {
  title?: string;
  description?: string;
  dataSource?: string;
  methodology?: string;
  sources?: string[];
  theme?: 'dark' | 'light';
  reliabilityGrade?: 'S' | 'A' | 'B' | 'C';
  content?: string;
}

export default function InfoTooltip({ title, description, dataSource, methodology, sources, reliabilityGrade, content }: InfoTooltipProps) {
  const finalDesc = description || content;
  
  if (!title && !finalDesc && !methodology && !dataSource && (!sources || sources.length === 0)) return null;

  return (
    <span style={{
      display: 'block',
      width: '100%',
      marginTop: '8px',
      marginBottom: '12px',
      fontSize: '0.8rem',
      fontWeight: 400,
      color: 'var(--w-slate-400)',
      lineHeight: 1.5,
      letterSpacing: 'normal',
      whiteSpace: 'normal',
      wordBreak: 'keep-all',
      textTransform: 'none'
    }}>
      {title && (
        <span style={{ display: 'block', marginBottom: '4px' }}>
          {title} {finalDesc && `- ${finalDesc}`}
        </span>
      )}
      {!title && finalDesc && (
        <span style={{ display: 'block', marginBottom: '4px' }}>
          {finalDesc}
        </span>
      )}
      {methodology && (
        <span style={{ display: 'block', marginBottom: '4px' }}>
          {methodology}
        </span>
      )}
      {(dataSource || (sources && sources.length > 0)) && (
        <span style={{ display: 'block', color: 'var(--w-slate-500)', fontSize: '0.75rem', marginTop: '6px' }}>
          <strong>출처:</strong> {dataSource} {sources && sources.length > 0 ? sources.join(', ') : ''}
        </span>
      )}
      {reliabilityGrade && (
        <span style={{ display: 'block', color: reliabilityGrade === 'S' || reliabilityGrade === 'A' ? 'var(--color-success)' : reliabilityGrade === 'B' ? 'var(--color-warning)' : 'var(--color-danger)', fontSize: '0.75rem', marginTop: '2px' }}>
          <strong>신뢰성 등급:</strong> {reliabilityGrade}
        </span>
      )}
    </span>
  );
}
