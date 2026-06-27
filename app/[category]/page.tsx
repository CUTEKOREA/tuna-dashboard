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
      background: '#070b18',
      color: '#94a3b8',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '40px', height: '40px', 
          border: '3px solid rgba(56, 189, 248, 0.2)', 
          borderTop: '3px solid #38bdf8',
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
