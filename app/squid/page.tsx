'use client';

import dynamic from 'next/dynamic';

const SquidDashboard = dynamic(() => import('@/components/SquidDashboard'), {
  ssr: false,
  loading: () => (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <p>오징어 대시보드 불러오는 중...</p>
    </main>
  ),
});

/**
 * /squid — 오징어 조달 인텔리전스 v5 (A~F 6부).
 * #332 에서 메뉴 정리와 함께 퇴역시켰으나, 2026-08-22 통합보고서 6부(국내 산업)를 얹으면서
 * 정식 화면이 필요해져 되살린다. 사이드바 등록은 dashboard-registry 에서 따로 결정한다.
 */
export default function SquidPage() {
  return <SquidDashboard />;
}
