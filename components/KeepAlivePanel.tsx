'use client';

import React, { useState } from 'react';

interface KeepAlivePanelProps {
  active: boolean;
  children: React.ReactNode;
}

/**
 * Lazy-mount + keep-alive panel.
 * - First time active: mounts the children (triggers dynamic import + fetch).
 * - When inactive: keeps children mounted but hides with display:none to prevent scroll area expansion.
 * - When active again: instantly shows with no flicker.
 */
export default function KeepAlivePanel({ active, children }: KeepAlivePanelProps) {
  const [hasBeenActive, setHasBeenActive] = useState(active);

  if (active && !hasBeenActive) {
    setHasBeenActive(true);
  }

  if (!hasBeenActive) return null;

  return (
    <div
      style={{
        display: active ? 'block' : 'none',
      }}
    >
      {children}
    </div>
  );
}
