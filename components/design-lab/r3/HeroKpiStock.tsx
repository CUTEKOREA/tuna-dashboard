/**
 * r3 시안 — 현행 KPI형 + 주식 컬러 (2라운드 A 개량).
 * 현행 히어로의 «주 KPI 하나 + 보조 셋» 구성을 자체 마크업으로 재현하고,
 * 등락만 주식 컨벤션(상승 빨강·하락 파랑)과 ▲▼로 바꾼다. 구성은 그대로, 색만 교체.
 */
'use client';

import {
  SKJ_ATUNA_HUBS,
  YF_ATUNA_HUBS,
  latestTwoForAtunaHub,
  calcAtunaDeltaPct,
  type AtunaHubDefinition,
  type AtunaHubObservation,
  type AtunaPriceRow,
} from '../../../lib/data/atuna-price-summary';

/** 주식 컨벤션 — 상승 빨강, 하락 파랑 (한국·일본 증시 관례) */
const UP = '#ef4444';
const DOWN = '#3b82f6';
const FLAT = 'var(--text-muted)';

function renderDelta(delta: number | null): { text: string; color: string } {
  if (delta === null) return { text: '직전 없음', color: FLAT };
  const abs = Math.abs(delta);
  // 0.05% 미만은 소수 1자리에서 0.0%로 찍힌다 — 방향색을 주면 거짓 신호가 된다
  if (abs < 0.05) return { text: '보합 0.0%', color: FLAT };
  return { text: `${delta > 0 ? '▲' : '▼'} ${abs.toFixed(1)}%`, color: delta > 0 ? UP : DOWN };
}

/** 고시일이 허브마다 달라 «가장 최근에 고시된 허브»를 대표로 삼는다 (동률이면 정의 순서) */
function latestAcrossHubs(rows: AtunaPriceRow[], hubs: AtunaHubDefinition[]) {
  return hubs
    .map((hub) => latestTwoForAtunaHub(rows, hub))
    .filter((pair) => pair.latest !== null)
    .sort((a, b) => (b.latest as AtunaHubObservation).date.localeCompare((a.latest as AtunaHubObservation).date))[0]
    ?? { latest: null, prev: null };
}

function SecondaryKpi({ label, value, unit, delta, valueColor }: {
  label: string;
  value: string;
  unit: string;
  delta: { text: string; color: string };
  /** 값 자체가 증감인 KPI만 지정 — 기본은 본문색 */
  valueColor?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '1.5rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: valueColor ?? 'var(--text-main)', whiteSpace: 'nowrap' }}>
        {value}
        <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>{unit}</span>
      </span>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: delta.color }}>{delta.text}</span>
    </div>
  );
}

export default function HeroKpiStock({ rows }: { rows: AtunaPriceRow[] }) {
  const bangkok = latestTwoForAtunaHub(rows, SKJ_ATUNA_HUBS[0]);
  const manta = latestTwoForAtunaHub(rows, SKJ_ATUNA_HUBS[1]);
  const yellowfin = latestAcrossHubs(rows, YF_ATUNA_HUBS);

  const bangkokDelta = renderDelta(calcAtunaDeltaPct(bangkok));
  const bangkokGap = bangkok.latest && bangkok.prev ? bangkok.latest.price - bangkok.prev.price : null;
  const gapView = bangkokGap === null
    ? { text: '직전 없음', color: FLAT, value: '—' }
    : bangkokGap === 0
      ? { text: '보합', color: FLAT, value: '$0' }
      : {
        text: bangkokGap > 0 ? '직전 고시 대비 상승' : '직전 고시 대비 하락',
        color: bangkokGap > 0 ? UP : DOWN,
        value: `${bangkokGap > 0 ? '▲' : '▼'} $${Math.abs(bangkokGap).toLocaleString()}`,
      };

  return (
    <div className="dsc-card" style={{ padding: '20px 22px' }}>
      <div style={{ fontSize: '1.35rem', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
        시장 동향
      </div>
      <div style={{ marginTop: 6, fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>
        {bangkok.latest
          ? `방콕 현물가 기준일 ${bangkok.latest.date.replace(/-/g, '.')} · 직전 고시 대비 ${bangkokDelta.text}`
          : '기준일 — · 참치 가격 관측 없음'}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 40, flexWrap: 'wrap', marginTop: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>방콕 가다랑어 현물가</span>
          <span
            style={{
              fontSize: '2.6rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
            }}
          >
            {bangkok.latest ? `$${bangkok.latest.price.toLocaleString()}` : '—'}
            <span style={{ fontSize: '0.95rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>($/MT)</span>
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: bangkokDelta.color }}>{bangkokDelta.text}</span>
        </div>

        <SecondaryKpi
          label="만타 가다랑어 현물가"
          value={manta.latest ? `$${manta.latest.price.toLocaleString()}` : '—'}
          unit="($/MT)"
          delta={renderDelta(calcAtunaDeltaPct(manta))}
        />
        <SecondaryKpi
          label="방콕 주간 변동"
          value={gapView.value}
          unit="($/MT)"
          delta={{ text: gapView.text, color: gapView.color }}
          valueColor={gapView.color}
        />
        <SecondaryKpi
          label="황다랑어 현물가"
          value={yellowfin.latest ? `$${yellowfin.latest.price.toLocaleString()}` : '—'}
          unit="($/MT)"
          delta={renderDelta(calcAtunaDeltaPct(yellowfin))}
        />
      </div>
    </div>
  );
}
