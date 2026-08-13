'use client';

/**
 * 섹션 UI 가 아직 없는 위젯의 기본 표현.
 *
 * P3 가 섹션별로 제대로 된 차트를 넣기 전까지 모든 위젯이 이걸로 그려진다.
 * 덕분에 구 위젯을 지운 직후에도 /squid 는 항상 동작한다 — 화면이 비는 구간이 없다.
 * 차트가 붙은 위젯부터 하나씩 이 컴포넌트를 벗어나면 된다.
 */

import React, { useState } from 'react';
import type { SquidWidget } from './types';

const SIGNAL_COLOR: Record<string, string> = {
  조업중: '#10b981',
  어기중: '#38bdf8',
  '중단·제한': '#f59e0b',
  어기외: '#64748b',
  데이터공백: '#8b5cf6',
};

/** 신호등 보드 — 상태와 그 상태가 관측인지 일정 파생인지를 함께 보여준다. */
export const SignalBoard: React.FC<{ data: any[] }> = ({ data }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
    {data.map((o) => {
      const color = SIGNAL_COLOR[o.status] ?? '#64748b';
      const derived = o.state_evidence?.evidence_type === 'schedule_derived';
      const blank = o.status === '데이터공백';
      return (
        <div
          key={o.origin}
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${color}44`,
            // 데이터공백은 빗금으로 칠해 관측된 상태와 눈으로 구분되게 한다
            background: blank
              ? `repeating-linear-gradient(45deg, ${color}10, ${color}10 6px, transparent 6px, transparent 12px)`
              : `${color}12`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color,
                           boxShadow: `0 0 8px ${color}88` }} />
            <strong style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>{o.origin}</strong>
          </div>
          <div style={{ color, fontWeight: 800, fontSize: '0.95rem', marginTop: '4px' }}>
            {o.status}
            {derived && (
              <span style={{ fontSize: '0.6rem', fontWeight: 600, marginLeft: '5px', color: '#94a3b8',
                             border: '1px dashed #94a3b8', borderRadius: 4, padding: '1px 4px' }}>
                일정 파생
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.5,
                        wordBreak: 'keep-all' }}>
            {o.as_of ?? '기준일 없음'} · {o.reason}
          </div>
        </div>
      );
    })}
  </div>
);

/** 어떤 모양의 data 든 표로 떨어뜨린다. */
export const DataTable: React.FC<{ data: any; previewRows?: number }> = ({ data, previewRows = 6 }) => {
  const [all, setAll] = useState(false);
  const rows: any[] = Array.isArray(data) ? data : [data];
  if (!rows.length) return null;

  const shown = all ? rows : rows.slice(0, previewRows);
  const cols = Array.from(
    shown.reduce<Set<string>>((s, r) => {
      if (r && typeof r === 'object') Object.keys(r).forEach((k) => s.add(k));
      return s;
    }, new Set())
  ).slice(0, 8);

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.7rem', width: '100%' }}>
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c} style={{ textAlign: 'left', padding: '4px 8px', color: '#64748b',
                                     borderBottom: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i}>
                {cols.map((c) => {
                  const v = r?.[c];
                  const text = v === null || v === undefined ? '—'
                    : typeof v === 'object' ? JSON.stringify(v)
                      : String(v);
                  return (
                    <td key={c} style={{ padding: '4px 8px', color: '#cbd5e1',
                                         borderBottom: '1px solid rgba(255,255,255,0.04)',
                                         maxWidth: 260, overflow: 'hidden',
                                         textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > previewRows && (
        <button
          onClick={() => setAll((v) => !v)}
          style={{ marginTop: 6, background: 'none', border: 'none', color: '#38bdf8',
                   fontSize: '0.68rem', cursor: 'pointer', padding: 0 }}
        >
          {all ? '접기' : `전체 ${rows.length}행 보기`}
        </button>
      )}
    </div>
  );
};

/** 데이터가 원문 발췌 텍스트뿐인지 판별한다. 39개 중 15개가 여기 해당한다. */
export function isExcerptOnly(data: any): boolean {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every((r) => r && typeof r === 'object' && r.kind === 'source_excerpt')
  );
}

/**
 * 원문 발췌 목록.
 *
 * 표로 그리면 kind·source_path·text 3열이 되어 정작 읽어야 할 본문이 잘린다.
 * 규제·리스크(D 섹션) 8개는 전부 이 모양이라 읽히지 않으면 위젯 자체가 무의미하다.
 * 그래서 본문을 그대로 흘리고 출처 파일명만 각주로 단다.
 */
export const ExcerptList: React.FC<{ data: any[]; previewItems?: number }> = ({
  data, previewItems = 4,
}) => {
  const [all, setAll] = useState(false);
  const shown = all ? data : data.slice(0, previewItems);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {shown.map((r, i) => (
        <blockquote
          key={i}
          style={{
            margin: 0, padding: '8px 0 8px 12px',
            borderLeft: '2px solid rgba(139, 92, 246, 0.35)',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.78rem', lineHeight: 1.65, color: '#cbd5e1',
                      wordBreak: 'keep-all', whiteSpace: 'pre-wrap' }}>
            {r.text}
          </p>
          <cite style={{ display: 'block', marginTop: 4, fontSize: '0.62rem',
                         color: '#64748b', fontStyle: 'normal', wordBreak: 'break-all' }}>
            {String(r.source_path ?? '').split('/').pop()}
          </cite>
        </blockquote>
      ))}
      {data.length > previewItems && (
        <button
          onClick={() => setAll((v) => !v)}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none',
                   color: '#38bdf8', fontSize: '0.68rem', cursor: 'pointer', padding: 0 }}
        >
          {all ? '접기' : `발췌 ${data.length}건 전체 보기`}
        </button>
      )}
    </div>
  );
};

/** 위젯 본문의 기본 렌더러. P3 가 차트로 교체하기 전까지의 표준 표현. */
export const GenericWidgetBody: React.FC<{ widget: SquidWidget }> = ({ widget }) => {
  if (widget.chartType === 'signal') return <SignalBoard data={widget.data as any[]} />;
  if (isExcerptOnly(widget.data)) return <ExcerptList data={widget.data as any[]} />;
  return <DataTable data={widget.data} />;
};

export default GenericWidgetBody;
