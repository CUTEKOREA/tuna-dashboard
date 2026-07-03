'use client';

import React, { useEffect, useMemo, useSyncExternalStore } from 'react';

interface KeepAlivePanelProps {
  active: boolean;
  children: React.ReactNode;
}

function createActivationStore() {
  let hasBeenActive = false;
  const listeners = new Set<() => void>();

  return {
    activate() {
      if (hasBeenActive) return;
      hasBeenActive = true;
      listeners.forEach((listener) => listener());
    },
    getSnapshot() {
      return hasBeenActive;
    },
    getServerSnapshot() {
      return false;
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/**
 * Lazy-mount + keep-alive panel.
 * - First time active: mounts the children (triggers dynamic import + fetch).
 * - When inactive: keeps children mounted but hides with display:none to prevent scroll area expansion.
 * - When active again: instantly shows with no flicker.
 */
export default function KeepAlivePanel({ active, children }: KeepAlivePanelProps) {
  const activationStore = useMemo(() => createActivationStore(), []);
  const hasBeenActive = useSyncExternalStore(
    activationStore.subscribe,
    activationStore.getSnapshot,
    activationStore.getServerSnapshot,
  );

  useEffect(() => {
    if (active) activationStore.activate();
  }, [active, activationStore]);

  if (!hasBeenActive && !active) return null;

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
