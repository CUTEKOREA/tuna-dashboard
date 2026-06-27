'use client';
// 김(Laver) 시안 프리뷰 라우트 (Phase 4) — WIP, 프로덕션 nav 미등록.
// 실데이터 연동(A-01) + Forensic Audit(O-04) 후 정식 category 라우팅으로 승격 예정.
import dynamic from 'next/dynamic';

const KimDashboard = dynamic(() => import('../../components/KimDashboard'), { ssr: false });

export default function KimPreviewPage() {
  return <KimDashboard />;
}
