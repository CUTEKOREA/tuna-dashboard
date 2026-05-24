/**
 * TradeIntel 3개 위젯 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 286줄 → After 180줄 (-37%)
 */

'use client';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Scale, Factory, TrendingUp, RefreshCcw } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const PIE_COLORS = ['#FCD535', '#0ECB81', '#2196F3', '#F6465D', '#9B72CB', '#F0B90B', '#FF9800', '#E91E63'];

const COUNTRY_KR: Record<string, string> = {
  Thailand: '태국', China: '중국', Spain: '스페인', Ecuador: '에콰도르',
  Indonesia: '인도네시아', Philippines: '필리핀', Vietnam: '베트남',
  USA: '미국', Japan: '일본', UK: '영국', 'South Korea': '한국',
  Germany: '독일', France: '프랑스', Italy: '이탈리아', Netherlands: '네덜란드',
  Australia: '호주', Canada: '캐나다', 'United States': '미국',
  'United Kingdom': '영국', Portugal: '포르투갈', Mexico: '멕시코',
};
const toKR = (n: string) => COUNTRY_KR[n] || n;

const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
    <RefreshCcw size={24} style={{ color: '#FCD535', animation: 'spin 1s linear infinite' }} />
  </div>
);

export const WitsTariffWidget = React.memo(function WitsTariffWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commodity: '참치통조림', reporter: '한국' }) })
      .then((r) => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const tariffData = data?.allTariffs
    ? Object.entries(data.allTariffs).map(([code, t]: [string, any]) => ({
        country: code === '410' ? '한국' : code === '842' ? '미국' : code === '764' ? '태국' : code === '392' ? '일본' : code,
        MFN: parseFloat(t.mfn) || 0, FTA: parseFloat(t.fta) || 0, Bound: parseFloat(t.bound) || 0,
      }))
    : [];
  const isLive = data?.meta?.source === 'WITS_LIVE';

  return (
    <WidgetCard
      title="WITS 수입 관세율 벤치마크"
      icon={Scale}
      iconColor="#FCD535"
      pillar="S3"
      cardDesc="World Bank WITS API로 주요국 참치 조제품 MFN·FTA·양허세율 비교. FTA 활용 시 관세 격차 시각화"
      telemetry={{ status: isLive ? 'LIVE' : 'STATIC', syncDate: isLive ? 'Real-time' : '2024년 기준' }}
      chartHeight={325}
      chart={loading ? undefined : (
        <BarChart data={tariffData} margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="country" stroke="#64748b" tick={{ fontSize: 10 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 9 }} unit="%" />
          <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="MFN" name="MFN 세율" fill="#F6465D" radius={[6, 6, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
          <Bar dataKey="FTA" name="FTA 적용" fill="#0ECB81" radius={[6, 6, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
          <Bar dataKey="Bound" name="양허세율" fill="#2196F3" radius={[6, 6, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
        </BarChart>
      )}
      customBody={loading ? <Spinner /> : undefined}
      takeaway={{
        situation: '한국 참치 조제품 MFN 관세율 20%는 AKFTA/RCEP 적용 시 0%로 전환. 미국은 KORUS FTA로 6%→0% 적용. 양허세율(Bound) 대비 실질 세율의 갭이 FTA 활용 기회를 보여줌.',
        actionPlan: 'FTA 극대화: 태국·인도네시아 원산지 원료 사용 시 AKFTA 원산지 증명서 발급으로 관세 0%. 미국 수출 시 KORUS FTA로 경쟁사 대비 6%p 가격 우위.',
        source: `World Bank WITS API · ${isLive ? 'LIVE' : 'Fallback DB'} · Reliability: ${data?.meta?.reliability?.grade || 'A'}`,
      }}
    />
  );
});

export const OecBenchmarkWidget = React.memo(function OecBenchmarkWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/oec', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commodity: '참치통조림' }) })
      .then((r) => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const exporterData = (data?.topExporters || []).slice(0, 8).map((d: any) => ({ name: toKR(d.country), value: d.value }));
  const importerData = (data?.topImporters || []).slice(0, 6).map((d: any) => ({ name: toKR(d.country), value: d.value }));
  const isLive = data?.meta?.source === 'OEC_LIVE';

  return (
    <WidgetCard
      title="OEC 글로벌 참치 가공 허브 단가 비교"
      icon={Factory}
      iconColor="#3b82f6"
      pillar="S3"
      cardDesc="Observatory of Economic Complexity 데이터로 글로벌 참치 조제품 Top 수출국·수입국 비중 비교"
      telemetry={{ status: isLive ? 'LIVE' : 'STATIC', syncDate: isLive ? 'Real-time' : '2024년 기준' }}
      customBody={loading ? <Spinner /> : (
        <div data-mobile-stack style={{ height: '325px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', textAlign: 'center' }}>Top 수출국</div>
            <PieChart width={250} height={280}>
              <Pie data={exporterData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={30}
                label={({ name, percent }: any) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''} labelLine={false} fontSize={9} isAnimationActive={false}>
                {exporterData.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            </PieChart>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', textAlign: 'center' }}>Top 수입국</div>
            <PieChart width={250} height={280}>
              <Pie data={importerData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={30}
                label={({ name, percent }: any) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''} labelLine={false} fontSize={9} isAnimationActive={false}>
                {importerData.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[(i + 3) % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            </PieChart>
          </div>
        </div>
      )}
      takeaway={{
        situation: `글로벌 참치 조제품 교역 규모 $${data?.globalTradeValueM ? (data.globalTradeValueM / 1000).toFixed(1) : '19.8'}B. 태국 22.8%로 수출 1위, 미국 15.7%로 수입 1위. 한국은 수입 5.7%로 4대 수입국.`,
        actionPlan: '포지셔닝: 태국 원료 의존도(Exposure)를 에콰도르·인도네시아로 분산하고, 미국·EU·일본 3대 소비 시장 프리미엄 가공품 수출 파이프라인을 구축해 밸류체인 상위 이동.',
        source: `OEC (Observatory of Economic Complexity) · ${isLive ? 'LIVE' : 'Benchmark DB'} · Reliability: ${data?.meta?.reliability?.grade || 'A'}`,
      }}
    />
  );
});

export const WitsTradeFlowWidget = React.memo(function WitsTradeFlowWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commodity: '참치', reporter: '한국', years: ['2020', '2021', '2022', '2023', '2024'] }) })
      .then((r) => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const chartData = (data?.tradeFlow || []).map((d: any) => ({
    Year: d.year,
    수입액: Math.round((d.importValueUSD || 0) / 1000),
    수출액: Math.round((d.exportValueUSD || 0) / 1000),
    수입량: Math.round((d.importWeightMT || 0) / 1000),
  }));
  const isLive = data?.meta?.source === 'WITS_LIVE';

  return (
    <WidgetCard
      title="한국 황다랑어 수출입 추이 (WITS)"
      icon={TrendingUp}
      iconColor="#0ECB81"
      pillar="S3"
      cardDesc="WITS / UN Comtrade로 한국 참치 5년치 수입액·수출액·수입량 동시 추적. 95%+ 수입 의존 구조 가시화"
      unit="(단위: $M / kMT)"
      telemetry={{ status: isLive ? 'LIVE' : 'STATIC', syncDate: isLive ? 'Real-time' : '2024년 기준' }}
      chartHeight={325}
      chart={loading ? undefined : (
        <BarChart data={chartData} margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="Year" stroke="#64748b" tick={{ fontSize: 10 }} />
          <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="수입액" name="수입액 ($M)" fill="#F6465D" radius={[6, 6, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
          <Bar dataKey="수출액" name="수출액 ($M)" fill="#0ECB81" radius={[6, 6, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
          <Bar dataKey="수입량" name="수입량 (kMT)" fill="#2196F3" radius={[6, 6, 0, 0]} fillOpacity={0.5} isAnimationActive={false} />
        </BarChart>
      )}
      customBody={loading ? <Spinner /> : undefined}
      takeaway={{
        situation: '한국 황다랑어 수입액은 5년 연속 증가($285M→$372M). 수출은 $17.5M에 불과. 수입 의존율 95%+로 공급 차질 시 가격 급등 리스크.',
        actionPlan: '공급 다변화: 인도네시아·에콰도르 신규 공급선 확보로 태국 의존도(Exposure) 완화. 장기 선물 계약으로 가격 변동성 헷지.',
        source: `World Bank WITS / UN Comtrade · ${isLive ? 'LIVE' : 'Snapshot'} · Reliability: ${data?.meta?.reliability?.grade || 'A'}`,
      }}
    />
  );
});
