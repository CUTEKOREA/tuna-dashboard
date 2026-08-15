'use client';

import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('../page'), { 
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      /* V3 라이트: 전환 로딩 화면도 라이트 캔버스 (2026-08-15 사용자 지시) */
      background: '#f9fafb',
      color: '#5a6072',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '40px', height: '40px', 
          border: '3px solid rgba(80, 158, 227, 0.25)', 
          borderTop: '3px solid #509ee3',
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p>대시보드 로딩 중...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
});

export default function CategoryPage() {
  return <Dashboard />;
}
