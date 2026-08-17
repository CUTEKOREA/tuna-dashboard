/**
 * r3 시안 — 밀도형 스탯 스트립 + 주식 컬러 (2라운드 B 개량).
 * 2라운드 B의 «8허브 한 화면» 밀도를 그대로 두고 색 컨벤션만 주식식으로 교체:
 * 상승 빨강 / 하락 파랑 / 보합·불명 무채색. 어종은 배지 색으로 갈라 놓는다.
 */
'use client';

import {
  SKJ_ATUNA_HUBS,
  YF_ATUNA_HUBS,
  latestTwoForAtunaHub,
  calcAtunaDeltaPct,
  type AtunaHubDefinition,
  type AtunaPriceRow,
} from '../../../lib/data/atuna-price-summary';

/** 주식 컨벤션 — 상승 빨강, 하락 파랑 (한국·일본 증시 관례) */
const UP = '#ef4444';
const DOWN = '#3b82f6';
const FLAT = 'var(--text-muted)';

/** 어종 식별색 — 등락색(빨강·파랑)과 겹치지 않는 색만 쓴다 */
const SPECIES = {
  skj: { name: '가다랑어', tint: '#0f766e' },
  yf: { name: '황다랑어', tint: '#a16207' },
} as const;

type SpeciesKey = keyof typeof SPECIES;

function renderDelta(delta: number | null): { text: string; color: string } {
  if (delta === null) return { text: '직전 없음', color: FLAT };
  const abs = Math.abs(delta);
  // 0.05% 미만은 소수 1자리에서 0.0%로 찍힌다 — 방향색을 주면 거짓 신호가 된다
  if (abs < 0.05) return { text: '보합 0.0%', color: FLAT };
  return { text: `${delta > 0 ? '▲' : '▼'} ${abs.toFixed(1)}%`, color: delta > 0 ? UP : DOWN };
}

export default function HeroStripStock({ rows }: { rows: AtunaPriceRow[] }) {
  const hubs: { hub: AtunaHubDefinition; species: SpeciesKey }[] = [
    ...SKJ_ATUNA_HUBS.map((hub) => ({ hub, species: 'skj' as const })),
    ...YF_ATUNA_HUBS.map((hub) => ({ hub, species: 'yf' as const })),
  ];
  const cells = hubs.map(({ hub, species }) => {
    const pair = latestTwoForAtunaHub(rows, hub);
    return { hub, species, pair, delta: calcAtunaDeltaPct(pair) };
  });

  const bangkok = cells[0];
  const headDelta = renderDelta(bangkok.delta);
  // 기준일 = 화면에 찍힌 관측 중 가장 최신 — 허브마다 고시일이 다르다
  const latestDate = cells.reduce<string | null>(
    (max, cell) => (cell.pair.latest && (!max || cell.pair.latest.date > max) ? cell.pair.latest.date : max),
    null,
  );

  return (
    <div className="dsc-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>방콕 가다랑어 현물가</span>
        <span
          style={{
            fontSize: '2.6rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--text-main)',
          }}
        >
          {bangkok.pair.latest ? `$${bangkok.pair.latest.price.toLocaleString()}` : '—'}
        </span>
        <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>($/MT)</span>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: headDelta.color }}>{headDelta.text}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>
          기준일 {latestDate ? latestDate.replace(/-/g, '.') : '—'}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(124px, 1fr))',
          gap: 8,
          marginTop: 14,
        }}
      >
        {cells.map(({ hub, species, pair, delta }) => {
          const view = renderDelta(delta);
          const mark = SPECIES[species];
          return (
            <div
              key={hub.key}
              style={{
                border: '1px solid var(--card-border, #e2e4e9)',
                borderLeft: `3px solid ${mark.tint}`,
                borderRadius: 8,
                padding: '8px 10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: mark.tint,
                    border: `1px solid ${mark.tint}`,
                    borderRadius: 4,
                    padding: '0 4px',
                    lineHeight: 1.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {mark.name}
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>{hub.label}</span>
              </div>
              <div
                style={{
                  marginTop: 3,
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: 'var(--text-main)',
                }}
              >
                {pair.latest ? `$${pair.latest.price.toLocaleString()}` : '—'}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: view.color }}>{view.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
