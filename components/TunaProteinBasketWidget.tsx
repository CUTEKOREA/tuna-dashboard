'use client';
import { useEffect, useMemo, useState } from 'react';
import { ShoppingBasket } from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import WidgetCard from './WidgetCard';

interface BasketItem {
  code: string;
  name: string;
  kind: string;
  unit: string;
  price: number;
  prevPrice: number | null;
  changePct: number | null;
}

interface BasketResponse {
  isLive: boolean;
  source: string;
  baseDate: string;
  lastUpdated: string;
  items: BasketItem[];
}

// 등락 방향 색 — 상승 rose / 하락 sky / 보합·미제공 slate
const UP_COLOR = '#f43f5e';
const DOWN_COLOR = '#38bdf8';
const FLAT_COLOR = '#94a3b8';

const directionColor = (changePct: number | null): string => {
  if (changePct == null || changePct === 0) return FLAT_COLOR;
  return changePct > 0 ? UP_COLOR : DOWN_COLOR;
};

const changeLabel = (changePct: number | null): string => {
  if (changePct == null) return '전일 미제공';
  if (changePct === 0) return '전일 대비 보합';
  return `전일 대비 ${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}%`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d: BasketItem = payload[0].payload;
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px', zIndex: 50 }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>
        {d.name} · {d.kind}
      </p>
      <p style={{ color: '#e2e8f0', margin: '4px 0 0 0', fontSize: '0.8rem' }}>
        소매가: <strong>{d.price.toLocaleString()}원</strong> ({d.unit})
      </p>
      <p style={{ color: directionColor(d.changePct), margin: '4px 0 0 0', fontSize: '0.8rem' }}>
        {changeLabel(d.changePct)}
      </p>
    </div>
  );
};

const bodyMsg = (text: string) => (
  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
    {text}
  </div>
);

const TunaProteinBasketWidget = () => {
  const [data, setData] = useState<BasketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/tuna/kamis-basket', { signal: AbortSignal.timeout(15000) })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: BasketResponse) => {
        if (alive) setData(json);
      })
      .catch(() => {
        if (alive) setError(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const isEmpty = !loading && !error && items.length === 0;
  const isLive = Boolean(data?.isLive) && items.length > 0;

  // Harness 3상태 + 성공 시 isLive 기반 동적 telemetry (L-09)
  const telemetry = isLive
    ? { status: 'LIVE' as const, syncDate: data?.baseDate }
    : { status: 'STATIC' as const, syncDate: data?.baseDate ?? '2026-07-03' };

  const { upCount, downCount, sitText } = useMemo(() => {
    if (items.length === 0) return { upCount: 0, downCount: 0, sitText: '' };
    const up = items.filter((it) => (it.changePct ?? 0) > 0).length;
    const down = items.filter((it) => (it.changePct ?? 0) < 0).length;
    const listed = items
      .map((it) => `${it.name}(${it.unit}) ${it.price.toLocaleString()}원`)
      .join(', ');
    const tone =
      up > down
        ? '대체 단백질 강세 국면으로 참치캔 판가 인상 여력이 열리는 신호입니다.'
        : up < down
          ? '대체 단백질 약세 국면으로 참치캔은 프로모션 경쟁 압박에 노출됩니다.'
          : '대체 단백질 가격이 보합권이라 참치캔 판가 전략의 방향 신호는 중립입니다.';
    const sit = `기준일 ${data?.baseDate ?? ''} 서울 소매가는 ${listed}입니다. 전일 대비 상승 ${up}개·하락 ${down}개 품목으로 집계됩니다. ${tone}`;
    return { upCount: up, downCount: down, sitText: sit };
  }, [items, data?.baseDate]);

  const kpiPanel = items.map((it) => ({
    label: `${it.name} (${it.unit})`,
    value: `${it.price.toLocaleString()}원`,
    sub: changeLabel(it.changePct),
    trendColor: directionColor(it.changePct),
  }));

  const chart =
    items.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis
            type="number"
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}천원`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={58}
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.85)', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="price" name="당일 소매가" barSize={22} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {items.map((it) => (
              <Cell key={it.code} fill={directionColor(it.changePct)} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    ) : undefined;

  return (
    <WidgetCard
      title="단백질 대체재 상대가격 바스켓"
      icon={ShoppingBasket}
      iconColor="#38bdf8"
      pillar="S4"
      cardDesc="KAMIS(농산물유통정보) 소매가 · 품목별 단위 상이(1손/1마리) — 절대 비교 불가, 등락 방향만 유의"
      unit="(단위: 원 · 1손/1마리)"
      telemetry={telemetry}
      chartHeight={220}
      chart={loading || error || isEmpty ? undefined : chart}
      kpiPanel={loading || error || isEmpty ? undefined : kpiPanel}
      customBody={
        loading
          ? bodyMsg('KAMIS 소매가를 불러오는 중입니다...')
          : error
            ? bodyMsg('소매가 조회에 실패했습니다. 잠시 후 다시 시도해 주세요.')
            : isEmpty
              ? bodyMsg('표시할 소매가 데이터가 없습니다.')
              : undefined
      }
      takeaway={{
        situation:
          sitText ||
          '대체 단백질(고등어·갈치·명태·오징어) 4품목의 서울 소매가와 전일 대비 등락을 집계합니다. 데이터 수신 후 당일 기준 수치가 표시됩니다.',
        actionPlan:
          upCount > downCount
            ? '대체재 강세 국면 — 참치캔 판가 인상·프로모션 축소 타이밍을 앞당겨 마진을 선확보하고, 강세 지속 여부를 주간 단위로 재점검한다.'
            : '대체재 약세·보합 국면 — 판가 인상은 보류하고 물량 프로모션으로 점유율 방어를 우선하되, 4품목 중 3개 이상 상승 전환 시 인상 시나리오를 재가동한다.',
        source: 'KAMIS 농산물유통정보 · 부류 600 수산물 서울 소매가 (품목 611·613·615·619)',
      }}
    />
  );
};

export default TunaProteinBasketWidget;
