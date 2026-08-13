'use client';

/**
 * 섹션 공통 껍데기. SectionA~E 가 이걸 감싸 쓴다.
 *
 * P3 세션은 자기 SectionX.tsx 안에서 `render` 를 넘겨 특정 위젯만 차트로 바꾸고,
 * 넘기지 않은 위젯은 자동으로 GenericWidgetBody 로 그려진다. 그래서 다섯 세션이
 * 서로를 기다리지 않고 각자 진도만큼 화면을 개선할 수 있다.
 */

import React from 'react';
import SquidCard from './SquidCard';
import GenericWidgetBody from './GenericWidget';
import type { SquidSource, SquidV5, SquidWidget } from './types';

export const SECTION_META: Record<string, { label: string; desc: string; color: string }> = {
  A: { label: '조달 가능성', desc: '산지별 조업 상태 · 쿼터 · 어기 · 자원', color: '#8b5cf6' },
  B: { label: '가격·마진', desc: '거래단계별 가격 · 랜딩코스트 · 신선도', color: '#a855f7' },
  C: { label: '무역 흐름', desc: 'HS 분류 · 수입 월별 · 커버리지 한계', color: '#d946ef' },
  D: { label: '규제·리스크', desc: 'IUU · 준수 · 수입요건 · 노동', color: '#ec4899' },
  E: { label: '근거·거버넌스', desc: '출처 원장 · 측정 게이트 · 갱신 일정', color: '#f43f5e' },
};

export interface SquidSectionProps {
  section: 'A' | 'B' | 'C' | 'D' | 'E';
  doc: SquidV5;
  /** 위젯별 전용 본문. 반환값이 없으면 기본 렌더러가 쓰인다. */
  render?: (id: string, widget: SquidWidget, sources: SquidSource[]) => React.ReactNode | undefined;
  /** 기본 접힘 (E 섹션처럼 상시 노출이 불필요한 경우) */
  defaultCollapsed?: boolean;
}

export const SquidSection: React.FC<SquidSectionProps> = ({
  section, doc, render, defaultCollapsed = false,
}) => {
  const [open, setOpen] = React.useState(!defaultCollapsed);
  const meta = SECTION_META[section];
  const list = Object.entries(doc.widgets).filter(([, w]) => w.section === section);
  if (!list.length) return null;

  return (
    <section id={`squid-section-${section}`} style={{ marginTop: 28 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'baseline', gap: 10, width: '100%', textAlign: 'left',
          background: 'none', border: 'none', borderLeft: `3px solid ${meta.color}`,
          padding: '0 0 0 10px', margin: '0 0 12px', cursor: 'pointer',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
          {section}. {meta.label}
        </h2>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8', wordBreak: 'keep-all' }}>{meta.desc}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#64748b' }}>
          {list.length}개 {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 14 }}>
          {list.map(([id, w]) => (
            <SquidCard key={id} widget={w} sources={doc.sources} builtAt={doc.meta.built_at}>
              {render?.(id, w, doc.sources) ?? <GenericWidgetBody widget={w} />}
            </SquidCard>
          ))}
        </div>
      )}
    </section>
  );
};

export default SquidSection;
