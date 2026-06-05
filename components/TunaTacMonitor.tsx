/**
 * TAC 쿼터 소진율 & 원료 가격 전망 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 141줄 → After 96줄 (-32%, customBody 활용)
 */

'use client';
import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

interface TacMonitorProps {
  tacData?: Array<{ rfmo: string; species: string; tac: number; consumed: number; pct: number; year: number; note?: string }>;
  forecastData?: Array<{ year: string; priceIndex: number; tacPressure: number }>;
}

const defaultForecast = [
  { year: '2022', priceIndex: 100, tacPressure: 15 },
  { year: '2023', priceIndex: 108, tacPressure: 22 },
  { year: '2024', priceIndex: 115, tacPressure: 35 },
  { year: '2025E', priceIndex: 120, tacPressure: 48 },
  { year: '2027E', priceIndex: 128, tacPressure: 62 },
  { year: '2030E', priceIndex: 133, tacPressure: 80 },
];

const defaultTac = [
  { rfmo: 'IOTC', species: '눈다랑어(BET)', tac: 80583, consumed: 72400, pct: 89.8, year: 2025 },
  { rfmo: 'ICCAT', species: '눈다랑어(BET)', tac: 73011, consumed: 61200, pct: 83.8, year: 2025 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '8px', color: '#f8fafc' }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '0.25rem 0', fontSize: '0.8rem' }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function TunaTacMonitor({ tacData, forecastData }: TacMonitorProps) {
  const chartData = forecastData || defaultForecast;
  const tacEntries = tacData?.filter((d) => d.tac > 0) || defaultTac;

  const TacGauges = (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '0.75rem' }}>
      {tacEntries.map((t, i) => {
        const pctColor = t.pct > 85 ? '#ef4444' : t.pct > 70 ? '#f59e0b' : '#22c55e';
        return (
          <div key={i} style={{ flex: 1, background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', padding: '0.75rem', border: `1px solid ${pctColor}40` }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>{t.rfmo} · {t.species}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: pctColor }}>{t.pct.toFixed(1)}%</div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(15, 23, 42, 0.9)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(t.pct, 100)}%`, height: '100%', borderRadius: '3px', background: pctColor, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>{t.consumed.toLocaleString()} / {t.tac.toLocaleString()} MT</div>
          </div>
        );
      })}
    </div>
  );

  const ChartArea = (
    <div style={{ height: '200px', width: '100%', position: 'relative', zIndex: 0 }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
          <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} domain={[90, 140]} />
          <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={11} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Line yAxisId="left" type="monotone" dataKey="priceIndex" name="수산물 가격 지수" stroke="#f59e0b" strokeWidth={3} />
          <Bar yAxisId="right" dataKey="tacPressure" name="쿼터 압력 (0~100)" fill="#ef4444" fillOpacity={0.6} />
        </ComposedChart>
      </SafeResponsiveContainer>
    </div>
  );

  return (
    <WidgetCard
      title="W-NEW. 글로벌 TAC 쿼터 소진율 & 원료 가격 전망"
      icon={AlertTriangle}
      iconColor="#ef4444"
      pillar="S5"
      cardDesc="ICCAT/IOTC 쿼터 축소 → 원물 가격 상승 → 자숙액 수급 불안정 연쇄 리스크 조기 경보"
      telemetry={{ status: 'STATIC', syncDate: 'IOTC-2026-S30-INF04 · ICCAT-2026 기준 (정적)' }}
      termTooltip={{ term: 'TAC', description: '총허용어획량(Total Allowable Catch). ICCAT·IOTC 등 RFMO가 매년 어종별로 설정하는 최대 어획량 상한선. 초과 시 100~125% 페이백(삭감) 페널티.' }}
      customBody={<>{TacGauges}{ChartArea}</>}
      takeaway={{
        situation: `<div>
<p><strong>TAC(Total Allowable Catch)</strong>는 RFMO(국제 수산기구)가 매년 어종별로 설정하는 최대 어획량 상한선. 초과 시 <strong>100~125% 페이백(다음 해 쿼터 삭감) 페널티</strong>.</p>
<p>2025 주요 TAC:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li>IOTC 눈다랑어(BET): <strong>80,583톤</strong></li>
<li>ICCAT 눈다랑어: <strong>73,011톤</strong></li>
<li>황다랑어: 기준 연도 대비 <strong>13~20% 감축 의무</strong></li>
<li>IOTC FAD 72일 제한 시 → 통조림 수출 -12%, 공장 연 2~6주 중단 리스크</li>
</ul>
<p>FAO SOFIA 2022 전망: 공급 제한 + 수요 증가로 <strong>2030년까지 수산물 가격 명목 +33% 상승</strong>(실질은 하락). 통조림 메이커는 원가 +33% 흡수 시 마진 -10~15%p 압박.</p>
<p>의미: TAC는 한국 어획·가공 capacity의 hard ceiling이며, 향후 5년 더 강화될 가능성 매우 높음. 우리 본업 EBITDA의 가장 큰 외생 변수.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: TAC는 단순 어획 제한이 아닌 <strong>"본업 EBITDA의 hard ceiling derivative"</strong>. 본사 risk 부서가 매 분기 쿼터 소진율을 monitoring + scenario 시뮬레이션.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>연쇄 시나리오 시뮬레이션</strong>: 가동률 저하 → 자숙액 감소 → 참치액 차질 chain effect를 분기별 BS·P&amp;L에 reflect.</li>
<li style="margin-bottom: 8px;"><strong>원물 +33% 상승 ROIC 감응도</strong>: 경영진 사전 보고 + 가격 헤지/안전 재고 확보. 6개월 forward + 12개월 forward 분할 락업.</li>
<li><strong>"쿼터 소진율 85%+ 자동 경보 트리거"</strong>: AI 기반 monitoring + 본사 trading desk 직보 시스템. 동시에 쿼터 보유 sovereign과 equity-level partnership으로 long-term access 보장.</li>
</ol>
</div>`,
        source: 'IOTC Compendium of Active Conservation Measures · ICCAT Compendium · FAO SOFIA 2022 · 가격-쿼터 연동 지수는 업계추정(illustrative)',
      }}
    />
  );
}
