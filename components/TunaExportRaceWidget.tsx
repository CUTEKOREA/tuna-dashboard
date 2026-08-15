'use client';
import { useEffect, useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import WidgetCard from './WidgetCard';

/**
 * A-5 글로벌 참치캔 수출 점유율 레이스 (Pillar S4 판매·수요)
 *
 * /api/tuna/comtrade-race 를 fetch하여 UN Comtrade HS 160414 수출액 기준
 * 6개국(태국·에콰도르·스페인·필리핀·중국·한국) 점유율 레이스(2015~2024, 스택 영역)와
 * 최신년 절대액(백만→억 달러 환산)을 렌더링.
 * 기존 미국 수입측 위젯(UsTunaMarketShareWidget)과 달리 '글로벌 수출측' 시각.
 * 분모는 세계 총계가 아닌 6개국 합 — cardDesc·SIT에 명시.
 */

type CountryKey = 'thailand' | 'ecuador' | 'spain' | 'philippines' | 'china' | 'korea';

type RaceYearRow = {
  year: string;
  abs: Record<CountryKey, number>;   // 백만 USD
  share: Record<CountryKey, number>; // %, 6개국 합=100
  totalUsdM: number;
};

type RaceApiData = {
  isLive: boolean;
  source: string;
  syncDate: string;
  latestYear: string;
  series: RaceYearRow[];
};

// 스택 순서 = 배열 순서 (아래→위). 한국은 최상단 + 밝은 노랑으로 미미해도 식별 가능하게 강조.
const COUNTRY_ORDER: { key: CountryKey; label: string; color: string }[] = [
  { key: 'thailand', label: '태국', color: '#0ea5e9' },
  { key: 'ecuador', label: '에콰도르', color: '#f59e0b' },
  { key: 'spain', label: '스페인', color: '#8b5cf6' },
  { key: 'philippines', label: '필리핀', color: '#10b981' },
  { key: 'china', label: '중국', color: '#ef4444' },
  { key: 'korea', label: '한국', color: '#fde047' },
];

const toEokUsd = (usdM: number) => (usdM / 100).toFixed(usdM >= 1000 ? 1 : 2); // 백만→억 달러

const RaceTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const row: RaceYearRow | undefined = payload[0]?.payload?.__row;
  return (
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px', zIndex: 50 }}>
      <p style={{ color: 'var(--w-slate-50)', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>
        {label}년 {row ? `· 6개국 합 ${toEokUsd(row.totalUsdM)}억 달러` : ''}
      </p>
      {[...payload].reverse().map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '0.78rem' }}>
          <span>{entry.name}: </span>
          <strong>{Number(entry.value).toFixed(1)}%</strong>
          {row && <span style={{ color: 'var(--w-slate-400)' }}> ({toEokUsd(row.abs[entry.dataKey as CountryKey])}억 달러)</span>}
        </p>
      ))}
    </div>
  );
};

const TunaExportRaceWidget = () => {
  const [data, setData] = useState<RaceApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/tuna/comtrade-race')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: RaceApiData) => {
        if (cancelled) return;
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setRetryKey((key) => key + 1);
  };

  const series = useMemo(() => data?.series ?? [], [data?.series]);
  const isEmpty = !loading && !error && series.length === 0;

  // 차트용 평탄화: { year, thailand: 40.3, ..., __row } (share %)
  const chartData = useMemo(
    () => series.map((r) => ({ year: r.year, ...r.share, __row: r })),
    [series]
  );

  const first = series[0];
  const last = series[series.length - 1];

  // SIT 동적 구성 (숫자 포함 2~3문장) — 태국 하락 vs 에콰도르·중국 상승 = 가공지 재편
  const situation = useMemo(() => {
    if (!first || !last) {
      return 'UN Comtrade 연간 수출액 기준 참치캔(HS 160414) 6개 주요 수출국의 점유율 레이스를 집계합니다. 태국 점유 하락과 에콰도르 상승이 동시에 관측되면 유럽연합(EU)향 무관세 우위에 따른 가공지 재편 신호입니다.';
    }
    const thDrop = first.share.thailand - last.share.thailand;
    const totalGrowth = ((last.totalUsdM - first.totalUsdM) / first.totalUsdM) * 100;
    return (
      `${first.year}→${last.year}년 태국 점유율은 ${first.share.thailand.toFixed(1)}%→${last.share.thailand.toFixed(1)}%로 ${thDrop.toFixed(1)}%p 하락한 반면, ` +
      `에콰도르는 ${first.share.ecuador.toFixed(1)}%→${last.share.ecuador.toFixed(1)}%, 중국은 ${first.share.china.toFixed(1)}%→${last.share.china.toFixed(1)}%로 상승 — ` +
      `가공 허브가 태국 단일 축에서 중남미(유럽연합·미국 무관세 우대)와 중국으로 재편되는 구조 추세입니다. ` +
      `${last.year}년 6개국 합산 수출액은 ${toEokUsd(last.totalUsdM)}억 달러로 ${series.length - 1}년간 ${totalGrowth.toFixed(0)}% 확대됐고, ` +
      `한국은 ${last.share.korea.toFixed(1)}%(${toEokUsd(last.abs.korea)}억 달러) 수준에 정체돼 있습니다. ` +
      `점유율 분모는 세계 총계가 아닌 6개국 합(글로벌 캔 수출의 약 70% 커버)입니다.`
    );
  }, [first, last, series.length]);

  // 최신년 절대액 사이드 표기 (억 달러)
  const kpiItems = useMemo(() => {
    if (!last) return undefined;
    return COUNTRY_ORDER.map((c) => ({
      label: `${c.label} (${last.year}년)`,
      value: `${toEokUsd(last.abs[c.key])}억 달러`,
      sub: `점유율 ${last.share[c.key].toFixed(1)}%`,
      trendColor: c.color,
    }));
  }, [last]);

  // Telemetry: 성공 시 SYNCED + '연간 확정치' 정직 표기 (L-09 — 월별 랙 17~19개월로 연간 설계),
  // 실패(fallback) 시 STATIC + 스냅샷 날짜
  const telemetry =
    data?.isLive === true
      ? { status: 'SYNCED' as const, syncDate: `연간 ${data.latestYear} 확정치` }
      : { status: 'STATIC' as const, syncDate: data?.syncDate ?? new Date().toISOString().slice(0, 10) };

  // ─── 본문 3상태 (Harness: Loading / Error / Empty) ───
  let stateBody: React.ReactNode = null;
  if (loading) {
    stateBody = (
      <div style={{ padding: '48px 12px', textAlign: 'center' }}>
        <p style={{ color: 'var(--w-slate-400)', fontSize: '0.85rem', margin: 0, animation: 'pulse 1.5s ease-in-out infinite' }}>
          유엔 무역통계(UN Comtrade) 연간 수출액 조회 중…
        </p>
      </div>
    );
  } else if (error) {
    stateBody = (
      <div style={{ padding: '40px 12px', textAlign: 'center' }}>
        <p style={{ color: '#f43f5e', fontSize: '0.85rem', margin: '0 0 10px 0' }}>
          수출 점유율 데이터 조회에 실패했습니다.
        </p>
        <button
          onClick={handleRetry}
          style={{
            background: 'rgba(34,211,238,0.1)',
            border: '1px solid rgba(34,211,238,0.35)',
            color: '#22d3ee',
            borderRadius: 6,
            padding: '5px 14px',
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          다시 조회
        </button>
      </div>
    );
  } else if (isEmpty) {
    stateBody = (
      <div style={{ padding: '40px 12px', textAlign: 'center' }}>
        <p style={{ color: 'var(--w-slate-400)', fontSize: '0.85rem', margin: 0 }}>
          집계 가능한 연간 수출 레코드가 없습니다 (6개국 전체).
        </p>
      </div>
    );
  }

  return (
    <WidgetCard
      title="글로벌 참치캔 수출 점유율 레이스"
      icon={Trophy}
      iconColor="#38bdf8"
      pillar="S4"
      description="기존 미국 수입측 점유율 위젯과 달리 '글로벌 수출측' 재편 지도 — 월별 통계는 공표 지연 17~19개월이라 연간 확정치 기준으로 설계"
      cardDesc="유엔 무역통계(UN Comtrade) 연간 수출액(HS 160414, 참치 조제품·통조림) 기준 태국·에콰도르·스페인·필리핀·중국·한국 점유율 — 분모는 세계 총계가 아닌 6개국 합(글로벌 캔 수출의 약 70% 커버)"
      unit="(단위: %, 6개국 합=100%)"
      telemetry={telemetry}
      chartHeight={stateBody ? 160 : 320}
      chart={
        stateBody ? undefined : (
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="year"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
              domain={[0, 100]}
            />
            <Tooltip content={<RaceTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--w-slate-300)' }} />
            {COUNTRY_ORDER.map((c) => (
              <Area
                key={c.key}
                type="monotone"
                dataKey={c.key}
                name={c.label}
                stackId="race"
                stroke={c.color}
                strokeWidth={c.key === 'korea' ? 2 : 1}
                fill={c.color}
                fillOpacity={c.key === 'korea' ? 0.95 : 0.65}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        )
      }
      customBody={stateBody}
      kpiPanel={stateBody ? undefined : kpiItems}
      takeaway={{
        situation,
        actionPlan:
          '태국 OEM(주문자상표부착생산) 의존 계약에는 에콰도르·중국 대체 견적을 상시 병행 확보해 단가 협상 레버리지로 쓰고, PNG(파푸아뉴기니) 가공 허브 전략의 투자 타당성 검토에 이 수출측 재편 지도를 기초 자료로 반영해야 합니다. 신선·냉동 단기 시그널은 미국 인구조사국(미국 수입측)·유로스탯(유럽연합 수입측) 위젯이 담당하므로, 본 위젯은 가공(캔) 공급망의 구조 판단에 한정해 활용합니다.',
        source: 'UN Comtrade 연간 무역 통계 (HS 160414 · 수출 · 상대국=세계 · 6개국 합 기준)',
      }}
    />
  );
};

export default TunaExportRaceWidget;
