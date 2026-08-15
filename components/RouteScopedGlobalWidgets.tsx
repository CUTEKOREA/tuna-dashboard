'use client';

import { usePathname } from 'next/navigation';
import DeepOceanCreatures from './DeepOceanCreatures';
import PWARegister from './PWARegister';

const STANDALONE_ROUTES = new Set(['/bni-global']);

export default function RouteScopedGlobalWidgets() {
  const pathname = usePathname();
  const isStandaloneRoute = pathname ? STANDALONE_ROUTES.has(pathname) : false;

  return (
    <>
      {!isStandaloneRoute && <DeepOceanCreatures />}
      {/* HermesAgent 플로팅 챗 — 2026-08-15 사용자 지시로 노출 제거 (컴포넌트 파일은 보존) */}
      <PWARegister />
    </>
  );
}
