/**
 * OMO Stage 0 + Stage 1 검증 위젯 6개 한 화면 프리뷰
 *
 * 라우트: /omo-preview
 * 목적: 사람 게이트에서 6개 위젯의 시각 품질(7자 룰·Glassmorphism·TelemetryBadge·SIT/TAK)을 한눈에 확인
 */

import TunaOriginPriceTrend from '@/components/TunaOriginPriceTrend';
import TunaOriginPriceTrendLive from '@/components/TunaOriginPriceTrendLive';
import TunaCatchBySpeciesLive from '@/components/TunaCatchBySpeciesLive';
import TunaCatchVolumeTrend from '@/components/TunaCatchVolumeTrend';
import TunaSpeciesComposition from '@/components/TunaSpeciesComposition';
import TunaProcessingYield from '@/components/TunaProcessingYield';
import TunaColdChainCostGap from '@/components/TunaColdChainCostGap';
import TunaCannedMarketShare from '@/components/TunaCannedMarketShare';

export default function OmoPreviewPage() {
  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1
            style={{
              background: 'linear-gradient(135deg, #e2e8f0, #38bdf8)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              fontSize: '2rem',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            OMO Stage 0 + Stage 1 검증 위젯 프리뷰
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Antigravity OAuth Claude Opus 4.6 무인 루프 생성 · 6개 위젯 · S1×3 + S2 + S3 + S4
          </p>
        </header>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 600, marginBottom: '8px' }}>
            Stage 2.2 Live 위젯 — Atuna 가격 + FishStat 어획량
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>
            왼쪽: Stage 2.1 BarChart (Atuna 5 항구 단가) · 오른쪽: Stage 2.2 LineChart (FishStat 3 어종 8년 어획량). 둘 다 Claude Code 수집 매뉴얼 → OMO Sisyphus 무인 생성.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
              marginBottom: '32px',
            }}
          >
            <TunaOriginPriceTrendLive />
            <TunaCatchBySpeciesLive />
          </div>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 600, marginBottom: '8px' }}>
            Stage 2.1 비교 — Mock vs Live (참조용)
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>
            왼쪽: Stage 0 OMO 자체 mock 데이터 · 오른쪽: Stage 2.1 Claude Code 매뉴얼이 수집한 Atuna 실데이터 (USD/MT, SYNCED)
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
            }}
          >
            <TunaOriginPriceTrend />
            <TunaOriginPriceTrendLive />
          </div>
        </section>

        <section>
          <h2 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 600, marginBottom: '16px' }}>
            Stage 1 — 5개 위젯 (mock)
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
            }}
          >
            <TunaCatchVolumeTrend />
            <TunaSpeciesComposition />
            <TunaProcessingYield />
            <TunaColdChainCostGap />
            <TunaCannedMarketShare />
          </div>
        </section>
      </div>
    </div>
  );
}
