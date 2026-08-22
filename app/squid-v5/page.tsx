'use client';

/**
 * squid v5 데이터 확인용 미리보기. P3 정식 섹션 UI 가 들어오기 전까지만 쓴다.
 * 차트를 그리지 않고 데이터와 근거 칩만 보여준다 — 지금 봐야 할 것은 디자인이 아니라
 * 어떤 수치가 어디서 왔는가이기 때문이다.
 */

import React, { useState } from 'react';
import SquidCard from '@/components/squid/SquidCard';
import { getSquidV5 } from '@/lib/data/squid-v5';

const doc = getSquidV5();

const SECTIONS: Record<string, string> = {
  A: '조달 가능성',
  B: '가격·마진',
  C: '무역 흐름',
  D: '규제·리스크',
  E: '근거·거버넌스',
  F: '국내 산업',
};

const SIGNAL_COLOR: Record<string, string> = {
  조업중: '#10b981',
  어기중: '#38bdf8',
  '중단·제한': '#f59e0b',
  어기외: '#64748b',
  데이터공백: '#8b5cf6',
};

/** 어떤 모양이든 표로 떨어뜨린다. 확인용이므로 정교할 필요가 없다. */
function DataPeek({ data }: { data: any }) {
  const [all, setAll] = useState(false);
  const rows: any[] = Array.isArray(data) ? data : [data];
  if (!rows.length) return null;

  const shown = all ? rows : rows.slice(0, 6);
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
                                         maxWidth: '260px', overflow: 'hidden',
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
      {rows.length > 6 && (
        <button
          onClick={() => setAll((v) => !v)}
          style={{ marginTop: '6px', background: 'none', border: 'none', color: '#38bdf8',
                   fontSize: '0.68rem', cursor: 'pointer', padding: 0 }}
        >
          {all ? '접기' : `전체 ${rows.length}행 보기`}
        </button>
      )}
    </div>
  );
}

function SignalBoard({ data }: { data: any[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
      {data.map((o) => {
        const color = SIGNAL_COLOR[o.status] ?? '#64748b';
        const derived = o.state_evidence?.evidence_type === 'schedule_derived';
        return (
          <div key={o.origin} style={{ padding: '10px 12px', borderRadius: '8px',
                                       background: `${color}12`, border: `1px solid ${color}44` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color,
                             boxShadow: `0 0 8px ${color}88` }} />
              <strong style={{ color: '#e2e8f0', fontSize: '0.8rem' }}>{o.origin}</strong>
            </div>
            <div style={{ color, fontWeight: 800, fontSize: '0.95rem', marginTop: '4px' }}>
              {o.status}
              {derived && (
                <span style={{ fontSize: '0.6rem', fontWeight: 600, marginLeft: '5px',
                               color: '#94a3b8', border: '1px dashed #94a3b8', borderRadius: 4,
                               padding: '1px 4px' }}>
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
}

export default function SquidV5Preview() {
  const entries = Object.entries(doc.widgets);
  const empty = entries.filter(([, w]) => !(Array.isArray(w.data) ? w.data.length : Object.keys(w.data || {}).length));

  return (
    <main style={{ minHeight: '100vh', background: '#070b18', color: '#e2e8f0',
                   fontFamily: "'Inter', sans-serif", padding: '24px 20px 80px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0,
                     background: 'linear-gradient(135deg, #e2e8f0, #8b5cf6)',
                     WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          오징어 v5 데이터 미리보기
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '6px' }}>
          위젯 {entries.length}개 · 데이터 {entries.length - empty.length} · 빈 카드 {empty.length} ·
          빌드 {doc.meta.built_at.slice(0, 16).replace('T', ' ')} · 아카이브 {doc.meta.archive_snapshot} ·
          출처 {doc.sources.length} · 게이트 {doc.gates.length} · 모니터링 {doc.monitoring.length}
        </p>
        <p style={{ color: '#f59e0b', fontSize: '0.72rem', marginTop: '4px' }}>
          확인용 화면이다. 차트·레이아웃은 P3 에서 만든다. 지금 볼 것은 수치와 근거 칩이다.
        </p>

        {Object.entries(SECTIONS).map(([key, label]) => {
          const list = entries.filter(([, w]) => w.section === key);
          if (!list.length) return null;
          return (
            <section key={key} style={{ marginTop: '32px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#cbd5e1',
                           borderLeft: '3px solid #8b5cf6', paddingLeft: '10px', margin: '0 0 12px' }}>
                {key}. {label} <span style={{ color: '#64748b', fontWeight: 500 }}>({list.length})</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '14px' }}>
                {list.map(([id, w]) => (
                  <SquidCard key={id} widget={w} sources={doc.sources} builtAt={doc.meta.built_at}>
                    {w.chartType === 'signal'
                      ? <SignalBoard data={w.data as any[]} />
                      : <DataPeek data={w.data} />}
                  </SquidCard>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
