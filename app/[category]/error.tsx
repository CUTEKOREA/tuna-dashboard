'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          페이지 로딩 오류
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          대시보드를 렌더링하는 중 문제가 발생했습니다.
          <br />아래 버튼을 클릭하거나 메인 페이지로 이동해주세요.
        </p>
        {process.env.NODE_ENV === 'development' && error?.message && (
          <pre style={{
            fontSize: '0.75rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '1.5rem',
            textAlign: 'left',
            overflow: 'auto',
            maxHeight: '200px',
            color: '#fca5a5'
          }}>
            {error.message}
          </pre>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              padding: '10px 20px',
              background: '#38bdf8',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            다시 시도
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px',
              background: '#282828',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            메인으로
          </button>
        </div>
      </div>
    </div>
  );
}
