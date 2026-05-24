'use client';
import React, { useEffect, useState } from 'react';
import { Activity, BarChart2, CheckCircle2, Egg } from 'lucide-react';
import { LineChart, Line, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function ChickenEmpiricalInsights() {
  const [arbData, setArbData] = useState<any>(null);
  const [procData, setProcData] = useState<any>(null);
  const [eggsData, setEggsData] = useState<any>(null);
  // risk-radar는 2026-05-24 Forensic Audit에서 archive (C-grade, _archive/api/chicken/risk-radar/)

  useEffect(() => {
    // 각 fetch를 독립 처리하여 한 endpoint 실패가 전체 로딩을 막지 않도록 함
    const safeFetch = (url: string) =>
      fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null);

    Promise.all([
      safeFetch('/api/chicken/arbitrage'),
      safeFetch('/api/chicken/processing'),
      safeFetch('/api/chicken/eggs'),
    ]).then(([arb, proc, eggs]) => {
      setArbData(arb);
      setProcData(proc);
      setEggsData(eggs);
    });
  }, []);

  if (!arbData || !procData || !eggsData) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>실증 인사이트 로딩 중...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', gridColumn: '1 / -1' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <Activity size={24} color="var(--color-success)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#f8fafc', fontWeight: 800 }}>S-Grade 닭고기 인텔리전스: 실증 인사이트</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>실시간 API 통합 (차익거래, 리스크 헤징, 가공 밸류체인, 계란 가격 변동성)</p>
          </div>
        </div>
      </div>

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        <WidgetCard
          title={arbData.title}
          icon={BarChart2}
          iconColor="var(--color-success)"
          pillar="S4"
          cardDesc="국내 vs 브라질 vs 태국 도매가 스프레드 실시간 트래킹"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }}
          chartHeight={240}
          chart={
            <LineChart data={arbData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
              <RechartsTooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="domestic" name="국내산 도매가 (KRW/kg)" stroke="#f87171" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="brazil" name="브라질산 수입 원가" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="thai" name="태국산 수입 원가" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          }
          takeaway={{ situation: arbData.sit, actionPlan: arbData.strat, source: arbData.source }}
        />

        {/* risk-radar 위젯 archive (2026-05-24 Forensic Audit, C-grade) — _archive/api/chicken/risk-radar/ */}

        <WidgetCard
          title={procData.title}
          icon={CheckCircle2}
          iconColor="var(--color-warning)"
          pillar="S2"
          cardDesc="단계별 인건비 비중 vs 부가가치 곡선"
          telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
          chartHeight={280}
          chart={
            <ComposedChart data={procData.data}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="stage" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 10 }} />
              <RechartsTooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar yAxisId="left" dataKey="laborCost" name="인건비 비중 (%)" fill={A11Y_PALETTE[5]} radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Area yAxisId="right" type="monotone" dataKey="valueAdded" name="부가가치 (Value Added)" fill="var(--color-warning)" stroke="var(--color-warning)" fillOpacity={0.2} strokeWidth={3} />
            </ComposedChart>
          }
          takeaway={{ situation: procData.sit, actionPlan: procData.strat, source: procData.source }}
        />

        <WidgetCard
          title={eggsData.title}
          icon={Egg}
          iconColor="#ec4899"
          pillar="S4"
          cardDesc="액상·건조 계란 수입 vs 신선란 도매가 변동성"
          telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }}
          chartHeight={280}
          chart={
            <ComposedChart data={eggsData.data}>
              <ChartPatternDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 250]} />
              <RechartsTooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar yAxisId="left" dataKey="liquidImport" stackId="a" name="액상 계란 수입 (톤)" fill={A11Y_PALETTE[0]} radius={[0, 0, 0, 0]} maxBarSize={60} />
              <Bar yAxisId="left" dataKey="driedImport" stackId="a" name="건조 계란 수입 (톤)" fill={A11Y_PALETTE[3]} radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Line yAxisId="right" type="monotone" dataKey="priceIndex" name="신선란 도매가 지수" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          }
          takeaway={{ situation: eggsData.sit, actionPlan: eggsData.strat, source: eggsData.source }}
        />
      </div>
    </div>
  );
}
