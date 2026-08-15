/**
 * 콜드체인 운송비 격차 (ComposedChart) — Stage 1 검증 위젯 #4
 *
 * spec: artifacts/spec_stage1.md
 * pillar: S3 (🚢 물류·통관)
 * gradient: cyan → blue (참치 시그니처)
 * ADR-0005 WidgetCard 사용
 */

'use client';
import React from 'react';
import { Truck } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

// ─── 정적 mock 데이터 (Stage 1 한정) ─────────────────────────────────────────
// 단위: 만원/MT (Bar=해상, Line=항공)
// 출처: KMI 2025 Q3 해상물류통계 + 항공운임 자체조사 (Stage 1 mock)
// X축: 항로 한글 6자 이내 ✓ (D-05 통과)

const data = [
  { route: '방콕→부산',   sea: 95,  air: 1450 },
  { route: '발리→부산',   sea: 110, air: 1620 },
  { route: '마닐라→부산', sea: 85,  air: 1280 },
  { route: '나하→부산',   sea: 65,  air: 950 },
  { route: '하노이→부산', sea: 102, air: 1540 },
];

// ─── 커스텀 툴팁 (한글 100%, W-02 단위 명기) ─────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: 'var(--w-slate-50)', fontWeight: 600, margin: '0 0 4px 0', fontSize: '0.85rem' }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '2px 0', fontSize: '0.8rem' }}>
          {entry.dataKey === 'sea' ? '해상' : '항공'} · {entry.value.toLocaleString()}만원/MT
        </p>
      ))}
    </div>
  );
};

// ─── 위젯 본체 ───────────────────────────────────────────────────────────────

const TunaColdChainCostGap = () => (
  <WidgetCard
    title="콜드체인 운송비 격차"
    icon={Truck}
    iconColor="#22d3ee"
    pillar="S3"
    cardDesc="KMI 해상물류통계 + 항공운임 직접 조회로 산출한 5개 동남아 항로 콜드체인 운송비"
    unit="(만원/MT)"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    termTooltip={{
      term: 'KMI',
      description: 'KMI(한국해양수산개발원)는 해운·항만·수산 분야 국가 정책 연구기관으로, 분기별 해상물류통계를 발행.',
    }}
    chartHeight={300}
    chart={
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <ChartPatternDefs />
        <defs>
          <linearGradient id="tunaColdChainBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="var(--w-blue-500)" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis
          dataKey="route"
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
        />
        <YAxis
          yAxisId="sea"
          stroke="rgba(255,255,255,0.5)"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
          tickFormatter={(v) => v.toLocaleString()}
          label={{ value: '해상(만원)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
        />
        <YAxis
          yAxisId="air"
          orientation="right"
          stroke="rgba(255,255,255,0.3)"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          tickFormatter={(v) => v.toLocaleString()}
          label={{ value: '항공(만원)', angle: 90, position: 'insideRight', fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value: string) => (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
              {value === 'sea' ? '해상 운송비' : '항공 운송비'}
            </span>
          )}
        />
        <Bar yAxisId="sea" dataKey="sea" fill="url(#tunaColdChainBarGradient)" radius={[4, 4, 0, 0]} barSize={32} />
        <Line yAxisId="air" type="monotone" dataKey="air" stroke="var(--w-amber-500)" strokeWidth={2} dot={{ fill: 'var(--w-amber-500)', r: 4, strokeWidth: 0 }} />
      </ComposedChart>
    }
    takeaway={{
      situation: `<div>
<p>참치 운송에는 2가지 모드. <strong>해상</strong>(컨테이너선, 느림·저렴)과 <strong>항공</strong>(빠름·비쌈). 신선 참치는 동결·시간 압박 때문에 일부 항공 의존.</p>
<p>비용 격차: <strong>해상 평균 91만원 vs 항공 평균 1,368만원 = 15배</strong>. 항공이 뚜렷한으로 비쌈. 그런데 콜드체인 손실(부패·품질 저하)을 감안하면 <strong>해상 손실 약 1.8% vs 항공 약 0.3%(업계 추정)</strong>로 실효 격차는 8~10배 수준으로 축소.</p>
<p>절충 구조: 항공은 비싸지만 손실 적음, 해상은 싸지만 손실 큼. 핵심 질문: <strong>해상 손실율을 낮출 수 있다면?</strong> 그게 가능합니다.</p>
<p>해결책: <strong>MAP(변경기체포장, Modified Atmosphere Packaging)</strong>. 산소 비율을 낮추고 질소·CO2 비율을 높여 보존성 강화. 해상 손실율을 1.8% → 0.7% 수준으로 낮출 수 있음(자체추정).</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: MAP 해상 전환은 단순 비용 절감이 아닌 <strong>"항공 의존 구조 전환"</strong>. 본사 물류 KPI를 항공 비중에서 해상 MAP 전환률로 재설정.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>Q4 MAP 시범 운영</strong>: 부산→LA 노선 컨테이너 10대 파일럿. 해상 손실율 1.8% → 0.7% 목표치 검증.</li>
<li style="margin-bottom: 8px;"><strong>Q1 2026 전사 전환 로드맵</strong>: 항공 의존 30% → 10%로 축소. 연간 운송비 절감 목표는 파일럿 결과 확정 후 산정.</li>
<li><strong>MAP 패키징 기술 외부화</strong>: 자사 MAP 솔루션을 동남아·중남미 수산 협력사에 제공 — 수익 규모는 협력사 규모·계약 구조에 따라 결정되며 별도 검토 필요.</li>
</ol>
</div>`,
      source: 'KMI 2025 Q3 해상물류통계 + 항공운임 자체조사 (Stage 1 mock)',
    }}
  />
);

export default TunaColdChainCostGap;
