'use client';

/**
 * 오징어 조달 인텔리전스 (v5).
 *
 * 구 156위젯 가치사슬 서사에서 39위젯 조달 결정 흐름으로 전면 교체했다.
 * 모든 수치는 public/data/squid_v5.json 하나에서 오고, 그 파일은
 * scripts/validate_squid_v5.py 의 측정 게이트(G-001~011)를 통과해야만 빌드된다.
 *
 * 정적 JSON + 월간 배치이므로 상태는 항상 SYNCED 다. LIVE 라벨은 계약상 존재하지 않는다.
 */

import React from 'react';
import { TelemetryBadge } from './TelemetryBadge';
import SectionA from './squid/SectionA';
import SectionB from './squid/SectionB';
import SectionC from './squid/SectionC';
import SectionD from './squid/SectionD';
import SectionE from './squid/SectionE';
import { SECTION_META } from './squid/SquidSection';
import type { SquidV5 } from './squid/types';
import raw from '../public/data/squid_v5.json';

const doc = raw as unknown as SquidV5;

const SECTION_ORDER = ['A', 'B', 'C', 'D', 'E'] as const;

function SectionNav() {
  return (
    <nav
      style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}
      aria-label="섹션 이동"
    >
      {SECTION_ORDER.map((s) => {
        const meta = SECTION_META[s];
        const count = Object.values(doc.widgets).filter((w) => w.section === s).length;
        return (
          <a
            key={s}
            href={`#squid-section-${s}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8, textDecoration: 'none',
              background: 'rgba(15, 23, 42, 0.6)',
              border: `1px solid ${meta.color}44`,
              color: '#cbd5e1', fontSize: '0.76rem', fontWeight: 700,
            }}
          >
            <span style={{ color: meta.color }}>{s}</span>
            {meta.label}
            <span style={{ color: '#64748b', fontWeight: 500 }}>{count}</span>
          </a>
        );
      })}
    </nav>
  );
}

export default function SquidDashboard() {
  const total = Object.keys(doc.widgets).length;
  const empty = Object.values(doc.widgets).filter(
    (w) => !(Array.isArray(w.data) ? w.data.length : Object.keys(w.data || {}).length),
  ).length;

  return (
    <main
      style={{
        minHeight: '100vh', background: '#070b18', color: '#e2e8f0',
        fontFamily: "'Inter', sans-serif", padding: '24px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '1.6rem', fontWeight: 900, margin: 0,
                background: 'linear-gradient(135deg, #e2e8f0, #8b5cf6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}
            >
              🦑 오징어 조달 인텔리전스
            </h1>
            <TelemetryBadge status="SYNCED" syncDate={doc.meta.built_at.slice(0, 10)} />
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 8, lineHeight: 1.7 }}>
            위젯 {total}개 · 출처 {doc.sources.length} · 측정 게이트 {doc.gates.length} ·
            모니터링 {doc.monitoring.length}계열 · 아카이브 {doc.meta.archive_snapshot}
            {empty > 0 && (
              <>
                {' · '}
                <span style={{ color: '#f59e0b' }}>
                  수치 미확정 {empty}개는 원문 링크 카드로 표시
                </span>
              </>
            )}
          </p>
          <p style={{ color: '#64748b', fontSize: '0.72rem', marginTop: 4, wordBreak: 'keep-all' }}>
            모든 카드 하단의 근거 칩은 어종·중량기준·거래단계·기준일·출처 등급을 표시한다.
            칩을 누르면 원문 경로와 금지 용법이 열린다.
          </p>

          <SectionNav />
        </header>

        <SectionA doc={doc} />
        <SectionB doc={doc} />
        <SectionC doc={doc} />
        <SectionD doc={doc} />
        <SectionE doc={doc} />
      </div>
    </main>
  );
}
