'use client';

import { useCallback, useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void) {
  window.addEventListener('hashchange', onStoreChange);
  window.addEventListener('popstate', onStoreChange);
  return () => {
    window.removeEventListener('hashchange', onStoreChange);
    window.removeEventListener('popstate', onStoreChange);
  };
}

function readHash() {
  return window.location.hash.replace(/^#/, '');
}

/** 단계 키를 해시(#s03)와 맞춘다. 새로고침·공유·뒤로 가기가 단계를 보존한다. */
export function useStageKey(validKeys: readonly string[], fallback: string) {
  const hash = useSyncExternalStore(subscribe, readHash, () => '');
  const key = validKeys.includes(hash) ? hash : fallback;

  const go = useCallback(
    (next: string) => {
      if (!validKeys.includes(next)) return;
      const url = `${window.location.pathname}${window.location.search}#${next}`;
      window.history.replaceState(null, '', url);
      window.dispatchEvent(new Event('hashchange'));
    },
    [validKeys],
  );

  return [key, go] as const;
}
