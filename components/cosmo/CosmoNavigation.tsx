'use client';

import React, { createContext, useContext } from 'react';

export type CosmoTabKey =
  | 'home'
  | 'cash'
  | 'history'
  | 'market'
  | 'production'
  | 'profit'
  | 'quality'
  | 'sales'
  | 'share'
  | 'supply';

export type CosmoNavigate = (tab: CosmoTabKey, anchor?: string) => void;

const CosmoNavigationContext = createContext<CosmoNavigate>(() => undefined);

export function CosmoNavigationProvider({
  children,
  onNavigate,
}: {
  children: React.ReactNode;
  onNavigate: CosmoNavigate;
}) {
  return (
    <CosmoNavigationContext.Provider value={onNavigate}>
      {children}
    </CosmoNavigationContext.Provider>
  );
}

export function useCosmoNavigation() {
  return useContext(CosmoNavigationContext);
}

const TAB_BY_PATH: Record<string, CosmoTabKey> = {
  '/': 'home',
  '/cash': 'cash',
  '/history': 'history',
  '/market': 'market',
  '/production': 'production',
  '/profit': 'profit',
  '/quality': 'quality',
  '/sales': 'sales',
  '/share': 'share',
  '/supply': 'supply',
};

export function cosmoTargetFromHref(href: string) {
  const [path, fragment] = href.split('#');
  return {
    tab: TAB_BY_PATH[path] ?? 'home',
    anchor: fragment || undefined,
  };
}
