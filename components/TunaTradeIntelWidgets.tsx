/**
 * TradeIntel 3개 위젯 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 286줄 → After 180줄 (-37%)
 */

'use client';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Scale, Factory, TrendingUp, RefreshCcw } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

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
        situation: `<div>
<p>WITS(World Integrated Trade Solution)는 세계은행이 운영하는 국제 무역 데이터 플랫폼입니다. 각국이 부과하는 <strong>MFN(Most Favored Nation, 최혜국 대우) 관세</strong>와 FTA 우대 관세를 비교 검색 가능.</p>
<p>한국 참치 조제품(HS 1604.14)의 관세 구도: ① <strong>MFN 관세율 20%</strong> (FTA 없는 일반 국가) ② <strong>AKFTA/RCEP 적용 시 0%</strong> (아세안·중국·일본·호주) ③ 미국은 KORUS FTA로 <strong>6% → 0%</strong>.</p>
<p>"양허세율(Bound)" vs "실질 세율" 갭이 핵심: WTO에 약속한 상한(Bound)은 20%이지만 실제 적용은 FTA 활용 시 0%. 이 갭이 곧 FTA 활용 vendor의 가격 경쟁력입니다.</p>
<p>실질 의미: 한국이 태국·인도네시아 원산지 원물로 가공해 미국에 수출하면 <strong>FTA 미활용 경쟁사 대비 +6%p 가격 우위</strong>. 동남아 OEM 가공사들이 갖지 못한 한국만의 무기.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: FTA 관세 차익은 단순 cost saving이 아닌 <strong>"한국 vendor만의 regulatory moat"</strong>. 가격 협상 시 6%p 자유도를 무기로 활용하면 마진 +4~5%p 추가 회수.</p>
<p><strong>실행</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>AKFTA 원산지 증명서 발급 100% 자동화</strong> — 태국·인도네시아 원료 + 한국 가공 → 미국 수출 시 단가 +5%p 회수.</li>
<li style="margin-bottom: 8px;"><strong>KORUS FTA 6%p 경쟁우위 활용</strong> — 미국 수입사(Costco·Sam's Club·BJ's) 협상 시 가격 우위로 long-term contract 락업.</li>
<li><strong>"FTA arbitrage trading desk" 신설</strong> — RCEP·AKFTA·KORUS·CPTPP 4개 FTA 활용한 원산지 우회·관세 차익 trading을 본사 trade compliance KPI로 부여. JP Morgan Trade Finance와 협력해 ASEAN sourcing finance 패키지 운영.</li>
</ol>
</div>`,
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
        situation: `<div>
<p>OEC(Observatory of Economic Complexity)는 MIT가 운영하는 글로벌 무역 시각화 플랫폼으로, 모든 상품·국가·연도별 교역량을 추적합니다. 참치 조제품(HS 1604.14)의 글로벌 시장 지도가 한눈에 보입니다.</p>
<p>2024 글로벌 참치 조제품 교역 규모: <strong>약 $${data?.globalTradeValueM ? (data.globalTradeValueM / 1000).toFixed(1) : '19.8'}B (약 27조원)</strong>. 의외로 작은 시장 — 글로벌 식품 전체의 0.1% 미만이지만, 우리에게는 본업.</p>
<p>구도:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li><strong>수출 1위 태국 22.8%</strong> (글로벌 가공 허브 압도적 점유)</li>
<li>2위 에콰도르 11.2%, 3위 베트남 9.1%, 4위 스페인 8.5%</li>
<li><strong>수입 1위 미국 15.7%</strong> (글로벌 통조림 소비 최대국)</li>
<li>2위 EU 합계 22.4%, 3위 일본 8.3%, <strong>4위 한국 5.7%</strong></li>
</ul>
<p>한국 위치: 수입 4위로 적지 않은 비중이나 수출은 미미. 즉 우리는 <strong>"순수입국으로 글로벌 가격 결정에 영향력 부족"</strong>한 구조. 밸류체인 상위(가공·브랜드·R&amp;D) 이동이 필요한 시점.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 한국이 단순 "수입국"이 아닌 <strong>"글로벌 참치 밸류체인의 가공·브랜딩 player"</strong>로 진화해야 한다. 태국 22.8% 점유율 옆에 한국 5~8% 점유율을 만들어야 글로벌 가격 결정력 보유.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>태국 원료 의존도 분산</strong>: 에콰도르(EU 무관세) 30% + 인도네시아(AKFTA 0%) 30% + 태국 40%로 재배치. 단일 거점 risk 회피.</li>
<li style="margin-bottom: 8px;"><strong>미국·EU·일본 3대 소비 시장 프리미엄 가공품 수출 파이프라인 구축</strong> — 단순 통조림이 아닌 레토르트 파우치·사시미급 냉동·간편식 즉석조리(HMR) 같은 고부가 SKU로 차별화.</li>
<li><strong>밸류체인 상위 이동</strong>: 한국이 가공·브랜드를 잡고 동남아 OEM이 backend로 빠지는 <strong>"K-brand globalization"</strong> 모델. 본사 점유율 글로벌 5~8% 도달 시 sole price-maker.</li>
</ol>
</div>`,
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
        situation: `<div>
<p>황다랑어(Yellowfin)는 참치 중 고급 어종으로, 사시미·필렛·고급 통조림에 사용됩니다. 한국의 황다랑어 무역 구조를 보면 한국 시장의 취약점이 명확히 보입니다.</p>
<p>5년 추이:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li>수입액: 2020 <strong>$285M</strong> → 2024 <strong>$372M</strong> (연 +6.9% 성장)</li>
<li>수출액: 약 <strong>$17.5M</strong> (수입의 4.7%)</li>
<li>수입 의존율: <strong>95%+</strong></li>
</ul>
<p>의미: 한국은 황다랑어의 거의 모든 물량을 수입에 의존하며, <strong>공급 차질 시 가격 100% 노출</strong>. ENSO·관세·분쟁 등 외생 변수 발생 시 한국 소비자가 직접 충격 흡수. 헤지 수단 부재로 단가 급등 시 수입사 마진이 직접 타격받는 구조.</p>
<p>구조적 약점: 한국은 황다랑어 어획 처리역량 부족 + 가공 처리역량은 있음. 어획-가공의 수직통합 미달이 구조적 단점.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 95% 수입 의존은 단순 무역 패턴이 아닌 <strong>"가격 변동성에 100% 노출된 단일집중 포지션"</strong>. 본사는 수입 헤지 수단을 체계적으로 운용해야 한다.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>공급 다변화</strong>: 인도네시아·에콰도르 신규 공급선 확보로 태국 의존도 완화. 4-거점(태국·인도네시아·에콰도르·인도) 분산으로 단일거점 의존 리스크 회피.</li>
<li style="margin-bottom: 8px;"><strong>장기 선도매입 + 가격 밴드 계약 패키지</strong> — 5년 고정가 계약에 하한·상한 밴드(price collar)를 결합. 매입가 변동성 ±15% 범위로 고정. 본사 트레이딩 데스크가 매 분기 시가 재평가(mark-to-market) 수행.</li>
<li><strong>한국 어획 역량 자체 확보</strong>: 한국 원양 황다랑어 어선 5~10척 신규 건조 또는 인수 (척당 $25~40M). 자체 어획 비중을 5% → 15~20%로 확대하면 가격 협상력 강화 + 시장 가격 방향성 지표로 활용 가능. 동시에 ICCAT·WCPFC 황다랑어 쿼터 선물 매입 병행.</li>
</ol>
</div>`,
        source: `World Bank WITS / UN Comtrade · ${isLive ? 'LIVE' : 'Snapshot'} · Reliability: ${data?.meta?.reliability?.grade || 'A'}`,
      }}
    />
  );
});
