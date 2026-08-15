'use client';

/**
 * squid v5 위젯 껍데기. 제목 + 본문 + (선택)해석 + 근거 칩.
 * 근거 칩은 선택이 아니다 — basis 없는 위젯은 계약상 존재할 수 없다.
 */

import React from 'react';
import BasisChips from './BasisChips';
import TakeawayBox from '../TakeawayBox';
import { TelemetryBadge } from '../TelemetryBadge';
import { koreanUiText, squidWidgetTitle } from './localization';
import type { SquidSource, SquidWidget } from './types';

export interface SquidCardProps {
  widget: SquidWidget;
  sources?: SquidSource[];
  /** meta.built_at — SYNCED 배지에 표시 */
  builtAt?: string;
  children?: React.ReactNode;
}

export const SquidCard: React.FC<SquidCardProps> = ({ widget, sources, builtAt, children }) => {
  const isEmpty = Array.isArray(widget.data) ? widget.data.length === 0 : !widget.data;

  return (
    <div
      className="ds-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minWidth: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontSize: '0.95rem',
              fontWeight: 800,
              color: 'var(--w-slate-200)',
              wordBreak: 'keep-all',
              lineHeight: 1.4,
            }}
          >
            {squidWidgetTitle(widget.title)}
          </h3>
          {widget.subtitle && (
            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--w-slate-400)', wordBreak: 'keep-all' }}>
              {koreanUiText(widget.subtitle)}
            </p>
          )}
        </div>
        <TelemetryBadge status="SYNCED" syncDate={builtAt?.slice(0, 10)} label="동기화" />
      </header>

      <div style={{ minWidth: 0 }}>
        {isEmpty ? (
          <div
            style={{
              padding: '18px 14px',
              borderRadius: '8px',
              border: '1px dashed rgba(var(--w-amber-500-rgb), 0.35)',
              background: 'rgba(var(--w-amber-500-rgb), 0.05)',
              color: 'var(--w-amber-500)',
              fontSize: '0.78rem',
              lineHeight: 1.6,
            }}
          >
            원문에서 수치를 확정하지 못해 도표를 비워 둔다. 아래 근거 칩의 원문 경로를 직접 확인할 것.
          </div>
        ) : (
          children
        )}
      </div>

      {(widget.situation || widget.takeaway) && (
        <TakeawayBox
          situation={koreanUiText(widget.situation ?? '')}
          takeaway={widget.takeaway ? koreanUiText(widget.takeaway) : undefined}
        />
      )}

      <BasisChips basis={widget.basis} sources={sources} />
    </div>
  );
};

export default SquidCard;
