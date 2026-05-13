'use client';

import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  activeKey: string;
}

export default function PageTransition({ children, activeKey }: PageTransitionProps) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {children}
    </div>
  );
}
