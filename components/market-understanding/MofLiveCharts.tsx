/**
 * 해수부·관세청 실데이터 차트 셋.
 *
 * 대시보드가 쓰던 자리는 셋 다 정적 집계이거나 자체 추정치였다. 여기 값은 전부 스냅숏 스크립트가
 * 공공 API 에서 받아 온 것이고, 출처와 단위를 캡션에 적는다.
 *
 * 단위 함정 둘 — 운임은 **천원/2TEU**(40피트 1대, 원화)지 달러도 톤당도 아니다.
 * 위판 단가는 금액÷물량 **가중평균**이지 건별 단가의 산술평균이 아니다.
 */
'use client';

import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { SERIES, CHART_ROLE } from '@/lib/chart-palette';
import {
  auctionMeta,
  auctionSeriesFor,
  freightMeta,
  freightRoutes,
  freightSeries,
  tradeMeta,
  tradeSeriesFor,
} from '@/lib/data/mof-live';

const AXIS = { stroke: 'var(--w-slate-400)', tick: { fill: 'var(--w-slate-300)', fontSize: 11 } } as const;
const TOOLTIP = {
  backgroundColor: 'rgba(20, 28, 52, 0.92)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 8,
  fontSize: 12,
} as const;

const won = (v: number) => `${Math.round(v).toLocaleString()}`;

/** 항로 색은 순위가 아니라 대상을 따른다. 어느 화면에서든 미국서부는 같은 색이다. */
const ROUTE_COLOR: Record<string, string> = {
  USW: SERIES[0],
  USE: SERIES[1],
  EU: SERIES[2],
  CN: SERIES[3],
  JP: SERIES[4],
  VN: SERIES[5],
};

/* ── 위판 일별 단가 ─────────────────────────────────────────────────────── */

/**
 * 표준명이 여럿 걸린다(「오징어」→ 살오징어·갑오징어류·…). 물량이 많은 순으로 최대 네 종만 그린다.
 * 캡션도 같은 선택을 써야 한다 — 전체 기준으로 세면 그리지도 않은 종의 위판장 수가 캡션에 오른다.
 */
const TOP_SPECIES = 4;
/** 물량만 보면 며칠만 나오는 대물량 품목이 뽑힌다(새우젓이 28일 중 2일). 선이 점 두 개가 된다. */
const MIN_DAY_SHARE = 1 / 3;

function topSpecies(keyword: string) {
  const raw = auctionSeriesFor(keyword);
  const totalDays = new Set(raw.map((row) => row.date)).size;
  const weight = new Map<string, number>();
  const days = new Map<string, Set<string>>();
  for (const row of raw) {
    weight.set(row.species, (weight.get(row.species) ?? 0) + row.물량_kg);
    (days.get(row.species) ?? days.set(row.species, new Set()).get(row.species)!).add(row.date);
  }
  const eligible = [...weight.entries()].filter(
    ([name]) => (days.get(name)?.size ?? 0) >= Math.max(2, totalDays * MIN_DAY_SHARE),
  );
  // 하한을 넘는 종이 넷도 안 되면 그때만 하한을 푼다 — 빈 차트보다는 성긴 선이 낫다.
  const pool = eligible.length >= TOP_SPECIES ? eligible : [...weight.entries()];
  const names = pool
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_SPECIES)
    .map(([name]) => name);
  return { raw, names, shown: raw.filter((row) => names.includes(row.species)) };
}

export function AuctionPriceChart({ keyword }: { keyword: string }) {
  const { rows, species } = useMemo(() => {
    const { raw, names: top } = topSpecies(keyword);
    // 값이 없는 날도 행으로 남긴다. 행 자체가 빠지면 `connectNulls={false}` 여도
    // 앞뒤 날짜가 곧바로 이어져 「그날도 거래가 있었다」로 읽힌다.
    const dates = [...new Set(raw.map((row) => row.date))].sort();
    const byDate = new Map<string, Record<string, number | string | null>>(
      dates.map((date) => [date, { date: `${date.slice(4, 6)}-${date.slice(6)}`, ...Object.fromEntries(top.map((n) => [n, null])) }]),
    );
    for (const row of raw) {
      if (!top.includes(row.species)) continue;
      const bucket = byDate.get(row.date);
      if (bucket) bucket[row.species] = row.단가_원_kg;
    }
    return { rows: [...byDate.values()], species: top };
  }, [keyword]);

  if (rows.length === 0) return null;

  return (
    <LineChart data={rows} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
      <XAxis dataKey="date" {...AXIS} />
      <YAxis {...AXIS} tickFormatter={won} width={58} />
      <Tooltip contentStyle={TOOLTIP} formatter={(v: unknown, n: unknown) => [`${won(Number(v))}원/kg`, String(n)]} />
      <Legend wrapperStyle={{ fontSize: 11 }} />
      {species.map((name, index) => (
        <Line
          key={name}
          type="monotone"
          dataKey={name}
          name={name}
          stroke={SERIES[index % SERIES.length]}
          strokeWidth={2}
          dot={{ r: 2 }}
          // 위판이 없는 날(주말·공휴일)은 값이 없다. 0 으로 잇지 않고 선을 건너뛴다.
          connectNulls={false}
        />
      ))}
    </LineChart>
  );
}

export function auctionCaption(keyword: string) {
  const { raw, names, shown } = topSpecies(keyword);
  const days = new Set(shown.map((r) => r.date)).size;
  const markets = Math.max(0, ...shown.map((r) => r.위판장수));
  const dropped = new Set(raw.map((r) => r.species)).size - names.length;
  return `해양수산부 위판장별 위탁판매 ${auctionMeta.기간} 중 이 네 종의 위판이 있었던 ${days}일. 「${keyword}」 부분일치로 잡힌 표준명 가운데 ${names.join('·')} 넷이다 — 물량 순으로 고르되 관측일이 전체의 3분의 1에 못 미치는 종은 뺐다(며칠만 나오는 대물량 품목이 점 두 개짜리 선이 되기 때문이다)${dropped > 0 ? `. 그렇게 ${dropped}종을 뺐다` : ''}. 단가는 금액÷물량 가중평균이고 건별 단가의 평균이 아니며, 중량이 0인 행은 뺐다. 하루 최대 ${markets}개 위판장이 섞여 있다. 그날 그 종의 위판이 없으면 선이 끊긴다.`;
}

/* ── 품목 월별 무역수지 ─────────────────────────────────────────────────── */

/**
 * 백만 달러로 **정수** 반올림하면 작은 품목이 통째로 사라진다.
 * 골뱅이 2026-07 수출 $171,126 은 0 이 되고, 18개월 중 17개월 수출이 0 으로 찍혔다.
 * -$280,386 은 `-0` 이 되어 `>= 0` 판정에서 흑자로 넘어간다. 소수 두 자리까지 남긴다.
 */
const toMillion = (usd: number) => Math.round((usd / 1e6) * 100) / 100;

export function TradeBalanceChart({ keyword }: { keyword: string }) {
  const rows = useMemo(
    () =>
      tradeSeriesFor(keyword).map((row) => ({
        month: `${row.month.slice(2, 4)}.${row.month.slice(4)}`,
        수출: toMillion(row.수출_usd),
        수입: toMillion(row.수입_usd),
        // 수출·수입을 각각 반올림한 뒤 빼면 막대와 선이 서로 안 맞는다. 원값에서 낸다.
        무역수지: toMillion(row.무역수지_usd),
      })),
    [keyword],
  );
  if (rows.length === 0) return null;

  return (
    <ComposedChart data={rows} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
      <XAxis dataKey="month" {...AXIS} />
      <YAxis {...AXIS} width={54} tickFormatter={(v) => `$${v}M`} />
      <Tooltip
        contentStyle={TOOLTIP}
        formatter={(v: unknown, n: unknown) => [`$${Number(v).toFixed(2)}M`, String(n)]}
      />
      <Legend wrapperStyle={{ fontSize: 11 }} />
      {/* 0선을 그어야 흑자·적자가 눈에 들어온다. */}
      <ReferenceLine y={0} stroke="var(--w-slate-400)" strokeDasharray="2 2" />
      <Bar dataKey="수출" name="수출($M)" fill={CHART_ROLE.volume} radius={[3, 3, 0, 0]} />
      <Bar dataKey="수입" name="수입($M)" fill={CHART_ROLE.highlight} radius={[3, 3, 0, 0]} />
      <Line type="monotone" dataKey="무역수지" name="무역수지($M)" stroke={CHART_ROLE.second} strokeWidth={2} dot={false} />
    </ComposedChart>
  );
}

export function tradeCaption(keyword: string) {
  const rows = tradeSeriesFor(keyword);
  const last = rows[rows.length - 1];
  if (!last) return '';
  // 부호는 반올림 전 원값으로 판정한다. -$280,386 을 백만 단위로 먼저 반올림하면 -0 이 되어 흑자로 뒤집힌다.
  const surplus = last.무역수지_usd >= 0;
  const size = Math.abs(toMillion(last.무역수지_usd)).toFixed(2);
  return `해양수산부 수산물 품목별 수출입 ${tradeMeta.기간} (${rows.length}개월). 「${keyword}」 부분일치로 묶은 ${last.품목수}개 세부 품목 합계이고 「… 이외」 품목은 뺐다. 최신월 ${last.month.slice(0, 4)}-${last.month.slice(4)} 기준 ${surplus ? '흑자' : '적자'} $${size}M. 공표가 두세 달 늦어 최근 달은 아직 없다.`;
}

/* ── 항로 운임 × 환율 ───────────────────────────────────────────────────── */

export function FreightTrendChart() {
  const rows = useMemo(() => freightSeries.map((row) => ({ ...row, label: row.period.slice(2) })), []);
  const codes = useMemo(
    () => Object.keys(freightRoutes).filter((code) => rows.some((row) => row[code as keyof typeof row] != null)),
    [rows],
  );

  return (
    <ComposedChart data={rows} margin={{ top: 12, right: 8, left: 4, bottom: 4 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
      <XAxis dataKey="label" {...AXIS} />
      {/* 이중 축이다. 왼쪽은 천원/2TEU, 오른쪽은 원/달러 — 축 라벨에 단위를 적는다. */}
      <YAxis
        yAxisId="freight"
        {...AXIS}
        width={64}
        tickFormatter={won}
        label={{ value: '천원/2TEU', angle: -90, position: 'insideLeft', fill: 'var(--w-slate-300)', fontSize: 10 }}
      />
      <YAxis
        yAxisId="fx"
        orientation="right"
        {...AXIS}
        width={64}
        domain={['dataMin - 40', 'dataMax + 40']}
        label={{ value: '원/달러', angle: 90, position: 'insideRight', fill: 'var(--w-slate-300)', fontSize: 10 }}
      />
      <Tooltip
        contentStyle={TOOLTIP}
        formatter={(v: unknown, n: unknown) =>
          String(n) === '원/달러' ? [`${Number(v).toLocaleString()}원`, '원/달러'] : [`${won(Number(v))}천원/2TEU`, String(n)]
        }
      />
      <Legend wrapperStyle={{ fontSize: 11 }} />
      {codes.map((code) => (
        <Line
          key={code}
          yAxisId="freight"
          type="monotone"
          dataKey={code}
          name={freightRoutes[code]}
          stroke={ROUTE_COLOR[code] ?? SERIES[7]}
          strokeWidth={2}
          dot={false}
          // 스냅숏이 항로별 결측을 null 로 남긴다. 이으면 없던 운임선이 생긴다.
          connectNulls={false}
        />
      ))}
      <Line
        yAxisId="fx"
        type="monotone"
        dataKey="환율"
        name="원/달러"
        stroke={SERIES[7]}
        strokeWidth={2}
        strokeDasharray="4 3"
        dot={false}
      />
    </ComposedChart>
  );
}

export function freightCaption() {
  const last = freightSeries[freightSeries.length - 1];
  return `관세청 해상 수출입 운송비용 ${freightMeta.기간} 수입 방향. 왼쪽 축은 천원/2TEU(40피트 컨테이너 1대, 원화)로 달러도 톤당도 아니다. 오른쪽 점선은 한국은행 원/달러 일별의 월평균이다. 운임은 원화라 환율이 움직여도 그 자체는 변하지 않는다 — 달러로 값을 매기는 원물과 합칠 때 두 줄이 같이 움직인다. 최신 ${last?.period}: 미국서부 ${last?.USW?.toLocaleString() ?? '-'} · 중국 ${last?.CN?.toLocaleString() ?? '-'} 천원/2TEU, 환율 ${last?.환율?.toLocaleString() ?? '-'}원.`;
}

/** 항로별 최신 값 막대 — 「어디서 들여오면 물류비가 얼마나 다른가」를 한눈에. */
export function FreightByRouteChart() {
  const rows = useMemo(() => {
    const last = freightSeries[freightSeries.length - 1];
    if (!last) return [];
    return Object.keys(freightRoutes)
      .map((code) => ({ route: freightRoutes[code], code, value: last[code as keyof typeof last] as number | null }))
      .filter((row): row is { route: string; code: string; value: number } => typeof row.value === 'number')
      .sort((a, b) => b.value - a.value);
  }, []);

  return (
    <BarChart data={rows} layout="vertical" margin={{ top: 12, right: 24, left: 8, bottom: 4 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
      <XAxis type="number" {...AXIS} tickFormatter={won} />
      <YAxis type="category" dataKey="route" {...AXIS} width={72} />
      <Tooltip contentStyle={TOOLTIP} formatter={(v: unknown) => [`${won(Number(v))}천원/2TEU`, '']} />
      <Bar dataKey="value" name="운송비용" radius={[0, 3, 3, 0]} fill={CHART_ROLE.volume} />
    </BarChart>
  );
}
