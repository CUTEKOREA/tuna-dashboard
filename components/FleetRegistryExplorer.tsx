'use client';

/**
 * 선단 등록부 탐색기 — 선박 한 척이 한 행인 원본 등록부를 필터·검색한다.
 *
 * 데이터는 scripts/build_fleet_db.py 산출물(public/data/*_fleet_db_v1.json)을
 * 런타임 fetch 로 받는다. 참치 4.2MB 를 정적 import 하면 번들 예산이 깨진다 —
 * 그래서 인테이크 모듈이 아니라 fetch 다 (ADR 0005 의 대상은 import 다).
 *
 * ⚠ 같은 배가 여러 기구에 등록될 수 있어 행 합계는 실제 척수가 아니다.
 *   이 경고를 화면에서 지우지 마라 — _meta.주의 를 그대로 띄운다.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Search, Ship, AlertTriangle } from 'lucide-react';

interface FleetRow {
  o: string; // 기구
  n: string; // 선명
  f: string; // 선적
  g: string; // 선종·어법
  t: number | null; // 총톤수
  y: number | null; // 건조년
  l: number | null; // 전장(m)
  w: string | null; // 소유사
  p: string | null; // 운영사
  h: string | null; // 등록항
  e: string | null; // 인가·비고
}

interface FleetDb {
  _meta: { 생성일: string; 출처: string; 행수: number; 주의: string; 기구별?: Record<string, number> };
  rows: FleetRow[];
}

const PAGE_SIZE = 50;

const cellStyle: React.CSSProperties = {
  padding: '0.45rem 0.6rem',
  borderBottom: '1px solid var(--dsc-surface-border, rgba(128,128,128,0.15))',
  fontSize: '0.8rem',
  whiteSpace: 'nowrap',
  color: 'var(--text-primary, inherit)',
};

const headStyle: React.CSSProperties = {
  ...cellStyle,
  fontWeight: 700,
  cursor: 'pointer',
  userSelect: 'none',
  position: 'sticky',
  top: 0,
  background: 'var(--dsc-bg-deep, var(--w-slate-900, #0f172a))',
};

const selectStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  borderRadius: 8,
  border: '1px solid var(--dsc-surface-border, rgba(128,128,128,0.3))',
  background: 'transparent',
  color: 'inherit',
  fontSize: '0.8rem',
};

export default function FleetRegistryExplorer({ src, title }: { src: string; title: string }) {
  const [db, setDb] = useState<FleetDb | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [org, setOrg] = useState('');
  const [flag, setFlag] = useState('');
  const [gear, setGear] = useState('');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof FleetRow>('t');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch(src)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json) => {
        if (alive) setDb(json as FleetDb);
      })
      .catch((err) => {
        if (alive) setError(String(err));
      });
    return () => {
      alive = false;
    };
  }, [src]);

  const options = useMemo(() => {
    if (!db) return { orgs: [], flags: [], gears: [] };
    const orgs = new Map<string, number>();
    const flags = new Map<string, number>();
    const gears = new Map<string, number>();
    for (const row of db.rows) {
      orgs.set(row.o, (orgs.get(row.o) ?? 0) + 1);
      flags.set(row.f, (flags.get(row.f) ?? 0) + 1);
      gears.set(row.g, (gears.get(row.g) ?? 0) + 1);
    }
    const top = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);
    return { orgs: top(orgs), flags: top(flags), gears: top(gears) };
  }, [db]);

  const filtered = useMemo(() => {
    if (!db) return [];
    const q = query.trim().toUpperCase();
    let rows = db.rows.filter(
      (row) =>
        (!org || row.o === org) &&
        (!flag || row.f === flag) &&
        (!gear || row.g === gear) &&
        (!q ||
          row.n.toUpperCase().includes(q) ||
          (row.w ?? '').toUpperCase().includes(q) ||
          (row.p ?? '').toUpperCase().includes(q)),
    );
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), 'ko');
      return sortDesc ? -cmp : cmp;
    });
    return rows;
  }, [db, org, flag, gear, query, sortKey, sortDesc]);

  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const sortBy = (key: keyof FleetRow) => {
    if (sortKey === key) setSortDesc((prev) => !prev);
    else {
      setSortKey(key);
      setSortDesc(true);
    }
    setPage(0);
  };

  if (error) {
    return <p style={{ padding: '1rem' }}>등록부를 불러오지 못했습니다: {error}</p>;
  }
  if (!db) {
    return <p style={{ padding: '1rem' }}>등록부 수신 중… (수만 행이라 수 초 걸릴 수 있습니다)</p>;
  }

  const columns: { key: keyof FleetRow; label: string }[] = [
    { key: 'o', label: '기구' },
    { key: 'n', label: '선명' },
    { key: 'f', label: '선적' },
    { key: 'g', label: '선종·어법' },
    { key: 't', label: '총톤수' },
    { key: 'l', label: '전장(m)' },
    { key: 'y', label: '건조년' },
    { key: 'w', label: '소유사' },
    { key: 'p', label: '운영사' },
    { key: 'h', label: '등록항' },
    { key: 'e', label: '인가·비고' },
  ];

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <header style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Ship size={16} aria-hidden="true" /> {title}
        </h3>
        <span style={{ fontSize: '0.78rem', opacity: 0.75 }}>
          {db._meta.출처} · {db._meta.생성일} 수집 · 전체 {db._meta.행수.toLocaleString()}행
        </span>
      </header>

      <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.8, display: 'flex', gap: '0.4rem' }}>
        <AlertTriangle size={14} style={{ flex: '0 0 auto', marginTop: 2 }} aria-hidden="true" />
        <span>{db._meta.주의}</span>
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {options.orgs.length > 1 && (
          <select style={selectStyle} value={org} onChange={(e) => { setOrg(e.target.value); setPage(0); }} aria-label="기구 필터">
            <option value="">기구 전체</option>
            {options.orgs.map(([name, count]) => (
              <option key={name} value={name}>{name} ({count.toLocaleString()})</option>
            ))}
          </select>
        )}
        <select style={selectStyle} value={flag} onChange={(e) => { setFlag(e.target.value); setPage(0); }} aria-label="선적 필터">
          <option value="">선적 전체</option>
          {options.flags.map(([name, count]) => (
            <option key={name} value={name}>{name} ({count.toLocaleString()})</option>
          ))}
        </select>
        <select style={selectStyle} value={gear} onChange={(e) => { setGear(e.target.value); setPage(0); }} aria-label="어법 필터">
          <option value="">선종·어법 전체</option>
          {options.gears.map(([name, count]) => (
            <option key={name} value={name}>{name} ({count.toLocaleString()})</option>
          ))}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
          <Search size={14} aria-hidden="true" />
          <input
            style={{ ...selectStyle, minWidth: '14rem' }}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder="선명·소유사·운영사 검색"
            aria-label="선명·소유사·운영사 검색"
          />
        </label>
        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
          필터 결과 {filtered.length.toLocaleString()}행
        </span>
      </div>

      <div style={{ overflowX: 'auto', maxHeight: '32rem', overflowY: 'auto', border: '1px solid var(--dsc-surface-border, rgba(128,128,128,0.2))', borderRadius: 10 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={headStyle} onClick={() => sortBy(col.key)} scope="col">
                  {col.label}{sortKey === col.key ? (sortDesc ? ' ▾' : ' ▴') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, index) => (
              <tr key={`${row.o}-${row.n}-${index}`}>
                <td style={cellStyle}>{row.o}</td>
                <td style={cellStyle}>{row.n}</td>
                <td style={cellStyle}>{row.f}</td>
                <td style={cellStyle}>{row.g}</td>
                <td style={{ ...cellStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.t?.toLocaleString() ?? '—'}</td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>{row.l ?? '—'}</td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>{row.y ?? '—'}</td>
                <td style={{ ...cellStyle, whiteSpace: 'normal', minWidth: '12rem' }}>{row.w ?? '—'}</td>
                <td style={{ ...cellStyle, whiteSpace: 'normal', minWidth: '10rem' }}>{row.p ?? '—'}</td>
                <td style={cellStyle}>{row.h ?? '—'}</td>
                <td style={cellStyle}>{row.e ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem' }}>
        <button type="button" style={selectStyle} disabled={page === 0} onClick={() => setPage((prev) => prev - 1)}>
          이전
        </button>
        <span>{page + 1} / {pageCount} 페이지</span>
        <button type="button" style={selectStyle} disabled={page + 1 >= pageCount} onClick={() => setPage((prev) => prev + 1)}>
          다음
        </button>
      </div>
    </section>
  );
}
