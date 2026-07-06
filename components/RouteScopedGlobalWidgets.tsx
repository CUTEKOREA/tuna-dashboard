'use client';

import { usePathname } from 'next/navigation';
import DeepOceanCreatures from './DeepOceanCreatures';
import HermesAgent from './HermesAgent';
import PWARegister from './PWARegister';

const STANDALONE_ROUTES = new Set(['/bni-global']);

export default function RouteScopedGlobalWidgets() {
  const pathname = usePathname();
  const isStandaloneRoute = pathname ? STANDALONE_ROUTES.has(pathname) : false;

  return (
    <>
      {!isStandaloneRoute && <DeepOceanCreatures />}
      {!isStandaloneRoute && <HermesAgent category="농수산물" />}
      <PWARegister />
    </>
  );
}
