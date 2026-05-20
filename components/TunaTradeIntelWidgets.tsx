'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { Globe, Scale, Factory, DollarSign, ShieldCheck, TrendingUp, RefreshCcw } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TakeawayBox from './TakeawayBox';
import styles from './TunaInsightsDashboard.module.css';

export const truncateXAxis = (tick: any) => {
  if (typeof tick !== 'string') return tick;
  const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
  return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
};


const PIE_COLORS = ["#FCD535", "#0ECB81", "#2196F3", "#F6465D", "#9B72CB", "#F0B90B", "#FF9800", "#E91E63"];

const COUNTRY_KR: Record<string, string> = {
  Thailand: '태국', China: '중국', Spain: '스페인', Ecuador: '에콰도르',
  Indonesia: '인도네시아', Philippines: '필리핀', Vietnam: '베트남',
  USA: '미국', Japan: '일본', UK: '영국', 'South Korea': '한국',
  Germany: '독일', France: '프랑스', Italy: '이탈리아', Netherlands: '네덜란드',
  Australia: '호주', Canada: '캐나다', 'United States': '미국',
  'United Kingdom': '영국', Portugal: '포르투갈', Mexico: '멕시코',
};
const toKR = (name: string) => COUNTRY_KR[name] || name;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    
  const truncateXAxis = (tick: any) => {
    if (typeof tick !== 'string') return tick;
    const noEng = tick.replace(/\s*\([A-Za-z\s]+\)/g, '');
    return noEng.length > 6 ? noEng.substring(0, 6) + '...' : noEng;
  };
return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((e: any, i: number) => (
          <div key={i} className={styles.tooltipValue}>
            <span style={{ color: e.color }}>■ {e.name}</span>
            <strong>{typeof e.value === 'number' ? Number(e.value.toFixed(1)).toLocaleString() : e.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ─── 1. WITS 관세 비교 위젯 ─── */
export const WitsTariffWidget = React.memo(function WitsTariffWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commodity: '참치통조림', reporter: '한국' }),
    })
      .then(r => r.json())
      .then(json => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.insightCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '480px' }}>
        <RefreshCcw size={24} style={{ color: '#FCD535', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // Build chart data from tariff info
  const tariffData = data?.allTariffs
    ? Object.entries(data.allTariffs).map(([countryCode, t]: [string, any]) => ({
        country: countryCode === '410' ? '한국' : countryCode === '842' ? '미국' : countryCode === '764' ? '태국' : countryCode === '392' ? '일본' : countryCode,
        MFN: parseFloat(t.mfn) || 0,
        FTA: parseFloat(t.fta) || 0,
        Bound: parseFloat(t.bound) || 0,
      }))
    : [];

  const isLive = data?.meta?.source === 'WITS_LIVE';

  return (
    <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
      <div style={{ position: 'relative', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
          <Scale size={18} style={{ color: '#FCD535' }} />
          [관세율] 국가별 참치 관세율 비교 (WITS)
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: isLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
            border: isLive ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
            color: isLive ? '#10b981' : '#94a3b8',
            fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
          }}>
            {isLive ? '🟢 실시간' : '폴백 DB'}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>(단위: 관세율 %)</span>
        </h3>
      </div>

      <div style={{ height: '325px', width: '100%', marginBottom: '1rem', position: 'relative', zIndex: 0, overflow: 'hidden' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={tariffData} margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="country" stroke="#64748b" tick={{ fontSize: 10 }}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
            <YAxis stroke="#64748b" tick={{ fontSize: 9 }} unit="%" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="MFN" name="MFN 세율" fill="#F6465D" radius={[6, 6, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
            <Bar dataKey="FTA" name="FTA 적용" fill="#0ECB81" radius={[6, 6, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
            <Bar dataKey="Bound" name="양허세율" fill="#2196F3" radius={[6, 6, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <TakeawayBox
          situation="한국 참치 조제품 MFN 관세율 20%는 AKFTA/RCEP 적용 시 0%로 전환. 미국은 KORUS FTA로 6%→0% 적용. 양허세율(Bound) 대비 실질 세율의 갭이 FTA 활용 기회를 보여줍니다."
          actionPlan="**[Actionable Insight]** [FTA 극대화] 태국·인도네시아 원산지 원료 사용 시 AKFTA 원산지 증명서 발급으로 관세 0% 확보. 미국 수출 시 KORUS FTA 활용으로 경쟁사 대비 6%p 가격 우위 확보해야 합니다."
          source={`World Bank WITS API · ${data?.meta?.apiStatus === 'live' ? '🟢 LIVE' : '🟡 Fallback DB'} · Reliability: ${data?.meta?.reliability?.grade || 'A'}`}
        />
      </div>
    </div>
  );
});

/* ─── 2. OEC 글로벌 교역 벤치마크 위젯 ─── */
export const OecBenchmarkWidget = React.memo(function OecBenchmarkWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/oec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commodity: '참치통조림' }),
    })
      .then(r => r.json())
      .then(json => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.insightCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '480px' }}>
        <RefreshCcw size={24} style={{ color: '#FCD535', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const exporterData = (data?.topExporters || []).slice(0, 8).map((d: any) => ({
    name: toKR(d.country),
    value: d.value,
  }));

  const importerData = (data?.topImporters || []).slice(0, 6).map((d: any) => ({
    name: toKR(d.country),
    value: d.value,
  }));

  const isLive = data?.meta?.source === 'OEC_LIVE';

  return (
    <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
      <div style={{ position: 'relative', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
          <Globe size={18} style={{ color: '#2196F3' }} />
          [교역 벤치마크] 글로벌 참치 조제품 교역 벤치마크 (OEC)
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: isLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
            border: isLive ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
            color: isLive ? '#10b981' : '#94a3b8',
            fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
          }}>
            {isLive ? '🟢 실시간' : '벤치마크 DB'}
          </span>
        </h3>
      </div>

      <div style={{ height: '325px', width: '100%', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Exporter Pie */}
        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', textAlign: 'center' }}>Top 수출국</div>
          <SafeResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={exporterData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={30}
                label={({ name, percent }: any) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''} labelLine={false} fontSize={9} isAnimationActive={false}>
                {exporterData.map((_: any, idx: number) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </SafeResponsiveContainer>
        </div>
        {/* Importer Pie */}
        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', textAlign: 'center' }}>Top 수입국</div>
          <SafeResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={importerData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={30}
                label={({ name, percent }: any) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''} labelLine={false} fontSize={9} isAnimationActive={false}>
                {importerData.map((_: any, idx: number) => <Cell key={idx} fill={PIE_COLORS[(idx + 3) % PIE_COLORS.length]} />)}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          </SafeResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <TakeawayBox
          situation={`[시장 구조] 글로벌 참치 조제품 교역 규모 $${data?.globalTradeValueM ? (data.globalTradeValueM / 1000).toFixed(1) : '19.8'}B. 태국이 22.8%로 수출 1위, 미국이 15.7%로 수입 1위. 한국은 수입 5.7% 비중으로 4대 수입국.`}
          actionPlan="**[Actionable Insight]** [포지셔닝] 태국 원료 의존도(Exposure)를 에콰도르·인도네시아로 분산하고, 미국·EU·일본 3대 소비 시장에 대한 프리미엄 가공품 수출 파이프라인을 구축하여 밸류체인 상위 이동."
          source={`OEC (Observatory of Economic Complexity) · ${isLive ? '🟢 LIVE' : '🟡 Benchmark DB'} · Reliability: ${data?.meta?.reliability?.grade || 'A'}`}
        />
      </div>
    </div>
  );
});

/* ─── 3. WITS 교역량 추이 위젯 ─── */
export const WitsTradeFlowWidget = React.memo(function WitsTradeFlowWidget() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commodity: '참치', reporter: '한국', years: ['2020', '2021', '2022', '2023', '2024'] }),
    })
      .then(r => r.json())
      .then(json => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.insightCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '480px' }}>
        <RefreshCcw size={24} style={{ color: '#FCD535', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const chartData = (data?.tradeFlow || []).map((d: any) => ({
    Year: d.year,
    수입액: Math.round((d.importValueUSD || 0) / 1000),
    수출액: Math.round((d.exportValueUSD || 0) / 1000),
    수입량: Math.round((d.importWeightMT || 0) / 1000),
  }));

  const isLive = data?.meta?.source === 'WITS_LIVE';

  return (
    <div className={styles.insightCard} style={{ display: 'flex', flexDirection: 'column', minHeight: '480px' }}>
      <div style={{ position: 'relative', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
          <TrendingUp size={18} style={{ color: '#0ECB81' }} />
          [수출입 추이] 한국 황다랑어 수출입 추이 (WITS)
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: isLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
            border: isLive ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
            color: isLive ? '#10b981' : '#94a3b8',
            fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
          }}>
            {isLive ? '🟢 실시간' : 'Comtrade 스냅샷'}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>(단위: $M / kMT)</span>
        </h3>
      </div>

      <div style={{ height: '325px', width: '100%', marginBottom: '1rem', position: 'relative', zIndex: 0, overflow: 'hidden' }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 30, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="Year" stroke="#64748b" tick={{ fontSize: 10 }}  angle={0} textAnchor="middle" height={60} tickFormatter={truncateXAxis}/>
            <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="수입액" name="수입액 ($M)" fill="#F6465D" radius={[6, 6, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
            <Bar dataKey="수출액" name="수출액 ($M)" fill="#0ECB81" radius={[6, 6, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
            <Bar dataKey="수입량" name="수입량 (kMT)" fill="#2196F3" radius={[6, 6, 0, 0]} fillOpacity={0.5} isAnimationActive={false} />
          </BarChart>
        </SafeResponsiveContainer>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <TakeawayBox
          situation="한국 황다랑어 수입액은 5년 연속 증가($285M→$372M), 수출은 $17.5M에 불과. 수입 의존율 95% 이상으로 공급 차질 시 가격 급등 리스크."
          actionPlan="**[Actionable Insight]** [공급 다변화] 인도네시아·에콰도르 신규 공급선 확보로 태국 의존도(Exposure) 완화. 장기 선물 계약으로 가격 변동성 헤지."
          source={`World Bank WITS / UN Comtrade · ${isLive ? '🟢 LIVE' : '🟡 Snapshot'} · Reliability: ${data?.meta?.reliability?.grade || 'A'}`}
        />
      </div>
    </div>
  );
});
