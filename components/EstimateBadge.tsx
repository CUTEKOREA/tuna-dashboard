import React from 'react';

export default function EstimateBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '4px',
      border: '1px solid var(--w-amber-500)',
      backgroundColor: 'var(--w-navy-900)',
      color: 'var(--color-warning)',
      fontSize: '0.75rem',
      fontWeight: 600,
      marginLeft: '8px',
      verticalAlign: 'middle',
      lineHeight: 1.2
    }}>
      <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>📐</span> 추정치
    </span>
  );
}
