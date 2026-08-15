'use client';
/**
 * 미국 참치 수입 관문 레이더 — Pillar S3 (물류·통관)
 *
 * /api/tuna/us-gateway (US Census HS 160414 hs10 합산) 연동.
 * 도넛(통관지구 분포) + 가로 바(원산지 top5, $M).
 * Harness: Loading / Error / Empty 3상태 명시 구현.
 * Telemetry: 응답 isLive 기반 동적 부여 (LIVE / STATIC — L-09 정직 표기).
 */
import { useEffect, useMemo, useState } from 'react';
import { Radar } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import WidgetCard from './WidgetCard';

interface OriginItem { name: string; valueMusd: number; sharePct: number; qtyT: number }
interface DistrictItem { name: string; valueMusd: number; sharePct: number }
interface GatewayData {
  isLive: boolean;
  month: string;
  totalValueMusd: number;
  origins: OriginItem[];
  districts: DistrictItem[];
  source: string;
}

const DONUT_COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
const BAR_COLOR = '#0ea5e9';

// D-05: 한글 라벨 7자 초과 시 truncate
const trunc7 = (s: string) => (s.length > 7 ? `${s.slice(0, 7)}…` : s);

// 서안 관문 (SIT 서안 vs 동안 재편 계산용)
const WEST_COAST = ['로스앤젤레스', '샌프란시스코', '시애틀', '샌디에이고', '포틀랜드', '앵커리지', '호놀룰루', '컬럼비아'];

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const d = p.payload;
  return (
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px', zIndex: 50 }}>
      <p style={{ color: 'var(--w-slate-50)', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{d.name}</p>
      <p style={{ color: 'var(--w-sky-400)', margin: '4px 0 0 0', fontSize: '0.8rem' }}>
        수입액: <strong>${Number(d.valueMusd).toFixed(1)}M</strong>
        {typeof d.sharePct === 'number' && <span> ({d.sharePct.toFixed(1)}%)</span>}
      </p>
      {typeof d.qtyT === 'number' && d.qtyT > 0 && (
        <p style={{ color: 'var(--w-slate-400)', margin: '2px 0 0 0', fontSize: '0.75rem' }}>
          물량: {d.qtyT.toLocaleString()} 톤
        </p>
      )}
    </div>
  );
};

const StateBox = ({ children, color = '#94a3b8' }: { children: React.ReactNode; color?: string }) => (
  <div style={{
    height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem',
    border: '1px dashed rgba(var(--w-slate-400-rgb), 0.15)', color, fontSize: '0.9rem',
  }}>
    {children}
  </div>
);

const TunaUsGatewayWidget = () => {
  const [data, setData] = useState<GatewayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/tuna/us-gateway')
      .then((res) => {
        if (!res.ok) throw new Error(`응답 오류 (${res.status})`);
        return res.json();
      })
      .then((json: GatewayData) => { if (!cancelled) setData(json); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const isEmpty = !loading && !error && (!data || !data.origins?.length || !data.districts?.length);

  const donutData = useMemo(
    () => (data?.districts ?? []).map((d) => ({ ...d, name: trunc7(d.name) })),
    [data],
  );
  const barData = useMemo(
    () => (data?.origins ?? []).map((o) => ({ ...o, name: trunc7(o.name) })),
    [data],
  );

  // SIT 동적 수치
  const sit = useMemo(() => {
    if (!data?.origins?.length || !data?.districts?.length) return '';
    const [top1] = data.origins;
    const ecu = data.origins.find((o) => o.name === '에콰도르');
    const vnm = data.origins.find((o) => o.name === '베트남');
    const westPct = data.districts
      .filter((d) => WEST_COAST.includes(d.name))
      .reduce((a, d) => a + d.sharePct, 0);
    const eastPct = data.districts
      .filter((d) => !WEST_COAST.includes(d.name) && d.name !== '기타')
      .reduce((a, d) => a + d.sharePct, 0);
    return `${data.month} 미국 참치캔(HS 160414) 수입 총 $${data.totalValueMusd.toFixed(1)}M 중 ${top1.name}이 $${top1.valueMusd.toFixed(1)}M(${top1.sharePct.toFixed(1)}%)로 1위이며, 에콰도르 ${ecu ? `${ecu.sharePct.toFixed(1)}%` : '점유 축소'} 대비 베트남 ${vnm ? `${vnm.sharePct.toFixed(1)}%` : '집계 미달'}의 추격으로 에콰도르 이탈분의 태국·베트남 흡수 여부가 월 단위로 포착됩니다. 통관 관문은 서안(로스앤젤레스 등) ${westPct.toFixed(1)}% 대 동안·내륙 ${eastPct.toFixed(1)}%로, 서배너·뉴욕 동안 축의 비중 변화가 관문 재편의 선행 신호입니다.`;
  }, [data]);

  return (
    <WidgetCard
      title="미국 참치 수입 관문 레이더"
      icon={Radar}
      iconColor="#0ea5e9"
      pillar="S3"
      cardDesc="미국 인구조사국 수입통계 HS 160414 hs10 합산 · 월 단위"
      unit="(단위: $M / %)"
      telemetry={
        loading
          ? { status: 'STATIC', syncDate: '동기화 중' }
          : data?.isLive
            ? { status: 'LIVE', syncDate: data.month }
            : { status: 'STATIC', syncDate: data?.month ?? '2026-04' }
      }
      customBody={
        loading ? (
          <StateBox>미국 인구조사국 데이터 불러오는 중…</StateBox>
        ) : error ? (
          <StateBox color="#f87171">데이터 로드 실패: {error} — 잠시 후 새로고침 해주세요.</StateBox>
        ) : isEmpty ? (
          <StateBox>표시할 수입 통계가 없습니다. (최근 4개월 미공표)</StateBox>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minWidth: 0 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.78rem', color: 'var(--w-slate-400)', textAlign: 'center' }}>
                통관지구 분포 (%)
              </p>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="sharePct"
                      nameKey="name"
                      cx="50%"
                      cy="46%"
                      innerRadius={52}
                      outerRadius={86}
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {donutData.map((_, i) => (
                        <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="rgba(10,15,31,0.6)" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--w-slate-300)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.78rem', color: 'var(--w-slate-400)', textAlign: 'center' }}>
                원산지 상위 5개국 수입액 ($M)
              </p>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      type="number"
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                      tickFormatter={(v) => `$${v}M`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={78}
                      stroke="rgba(255,255,255,0.5)"
                      tick={{ fill: 'var(--w-slate-300)', fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="valueMusd" name="수입액($M)" fill={BAR_COLOR} radius={[0, 4, 4, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )
      }
      takeaway={{
        situation: sit || '미국 참치캔(HS 160414) 월별 수입 원산지·통관지구 데이터를 집계 중입니다. 2026-04 실측 기준 태국 46.6%(수입액 $51.1M) 1위, 에콰도르 14.4%·베트남 10.3% 순이며 통관은 로스앤젤레스 24.9%·서배너 23.3%·뉴욕 21.4%로 서안·동안이 팽팽합니다.',
        actionPlan: '태국 46%대 집중과 에콰도르·베트남의 점유 교대를 월 단위로 추적해 대미 OEM 파트너 선정(태국 락인 vs 베트남 신규 위탁)의 협상 타이밍을 잡아야 합니다. 서배너·뉴욕 동안 관문 합산이 서안을 웃도는 달에는 파나마 경유 동안 직송 루트로 내륙 운송비를 절감하고, 서안 우위 반전 시 로스앤젤레스 직송으로 리드타임을 단축하는 이원 물류 체계를 가동합니다.',
        source: '미국 인구조사국(US Census Bureau) 수출입 통계 OpenAPI · HS 160414 hs10 합산',
      }}
    />
  );
};

export default TunaUsGatewayWidget;
