'use client';
import React from 'react';
import { ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, BarChart, Cell } from 'recharts';
import { Timer, ShoppingCart, Warehouse } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE, getA11yBarProps } from './ChartPatterns';

const arbitrageData = [
  { month: '1월', domestic: 1950, brazil: 1750, thai: 2500, spread: 200 },
  { month: '3월', domestic: 2050, brazil: 1800, thai: 2600, spread: 250 },
  { month: '5월(HPAI)', domestic: 2300, brazil: 0, thai: 2750, spread: 2300 },
  { month: '7월(복날)', domestic: 2650, brazil: 0, thai: 2850, spread: 2650 },
  { month: '9월', domestic: 2200, brazil: 1850, thai: 2700, spread: 350 },
  { month: '11월', domestic: 2403, brazil: 2000, thai: 2650, spread: 403 },
];

const channelData = [
  { channel: '프랜차이즈 B2B', margin: 28, volume: 85, difficulty: 60 },
  { channel: '편의점 HMR', margin: 35, volume: 55, difficulty: 80 },
  { channel: '대형마트 냉동', margin: 18, volume: 70, difficulty: 50 },
  { channel: '식자재마트', margin: 12, volume: 90, difficulty: 30 },
];

const vmiLockData = [
  { stage: '초기 도입', retention: 45, margin: 8 },
  { stage: '3개월', retention: 62, margin: 12 },
  { stage: '6개월', retention: 78, margin: 18 },
  { stage: '12개월', retention: 88, margin: 22 },
  { stage: '24개월+', retention: 95, margin: 28 },
];

export function InsightTimeGapArbitrage() {
  return (
    <WidgetCard
      title="Insight A. 타임갭 차익거래 — 브라질 HPAI 전환 윈도우"
      icon={Timer}
      iconColor="#ef4444"
      pillar="S4"
      cardDesc="브라질 HPAI 수입금지(5~7월) 기간 국내 도매가 +10% 폭등 — 6~12개월 타임갭이 태국산 전환의 핵심 차익거래 윈도우"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={320}
      chart={
        <ComposedChart data={arbitrageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <ChartPatternDefs />
          <defs>
            <linearGradient id="spreadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis yAxisId="left" stroke="#94a3b8" unit="원" />
          <RTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Area yAxisId="left" type="monotone" dataKey="domestic" name="🇰🇷 국내 도매가" stroke="#f87171" fill="url(#spreadGrad)" />
          <Line yAxisId="left" type="monotone" dataKey="brazil" name="🇧🇷 브라질산 CIF" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
          <Line yAxisId="left" type="monotone" dataKey="thai" name="🇹🇭 태국산 CIF" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
        </ComposedChart>
      }
      kpiPanel={[
        { label: 'HPAI 기간 스프레드', value: '+2,650원', sub: '복날 시 최대 마진', trendColor: '#ef4444' },
      ]}
      takeaway={{
        situation: `<div>
<p>"HPAI(High Pathogenicity Avian Influenza, 고병원성 조류인플루엔자)"란 발병 즉시 해당국 가금육 수입을 100% 차단하는 SPS(위생검역) 트리거. "TCU(Total Cost of Use)"란 단순 kg 단가가 아닌 수율·인건비·로스까지 포함한 진짜 사용 원가.</p>
<p>실측: <strong>브라질 HPAI 수입금지(5~7월) → 국내 도매가 1,950 → 2,650원/kg +36% 폭등. 태국산 CIF 2,750원이 명목 단가 비싸 보이나 순살 수율(잔뼈 제로) + 주방 인건비 감안 시 TCU 동등</strong>. 가격 비교 framework 자체가 잘못된 게 본질.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: HPAI 수입금지는 cost 위협이 아닌 <strong>"6~12개월 타임갭 차익거래(Temporal Arbitrage) 윈도우"</strong>. 브라질 HPAI 사이클은 매년 반복.</p>
<p><strong>3단계</strong>: ① GFPT/Betagro 고정가 LTA 선도계약 즉시 체결 — Q1 TRQ 0% 무관세 쿼터 선점 ② 복날 3개월 전 냉동창고 비축 → 숏티지 발생 시 B2B 방출 20~30% 마진 ③ 바이어 설득 framework을 "kg당 단가" → "1인분당 TCU"로 전환 — 명목가 비싸도 본질가 동등 입증.</p>
</div>`,
        source: 'KAMIS 육계 도매가(2025.11) · KCS HS 0207 수입단가 (브라질 0=수입금지)',
      }}
    />
  );
}

export function InsightChannelMatrix() {
  return (
    <WidgetCard
      title="Insight B. 유통채널별 수익 매트릭스 — 4대 채널 공략 서열"
      icon={ShoppingCart}
      iconColor="#10b981"
      pillar="S4"
      cardDesc="편의점 HMR이 최고 수익성 캐시카우, 프랜차이즈 B2B가 1순위 볼륨 타깃. 대형마트 신선 코너는 국내산이 장악하여 진입 불가"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={320}
      chart={
        <BarChart data={channelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="#94a3b8" unit="%" />
          <YAxis dataKey="channel" type="category" stroke="#94a3b8" width={120} />
          <RTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="margin" name="마진율(%)" radius={[0, 4, 4, 0]}>
            {channelData.map((_, idx) => {
              const p = getA11yBarProps(idx);
              return <Cell key={idx} fill={p.fill} color={p.color} stroke={p.stroke} />;
            })}
          </Bar>
          <Bar dataKey="difficulty" name="진입난이도(%)" fill={A11Y_PALETTE[5]} radius={[0, 4, 4, 0]} fillOpacity={0.6} />
        </BarChart>
      }
      kpiPanel={[
        { label: '최고 수익 채널', value: 'HMR 35%', sub: '편의점 가공육 캐시카우', trendColor: '#10b981' },
      ]}
      takeaway={{
        situation: `<div>
<p>"채널 매트릭스(Channel Matrix)"란 마진율·볼륨·진입난이도 3축으로 유통 채널을 분석해 capital allocation 우선순위를 결정하는 framework. 단일 채널 의존은 P&L 변동성을 즉시 키움.</p>
<p>실측: <strong>편의점 HMR 마진 35% 최고 (캐시카우) · 프랜차이즈 B2B 마진 28% + 볼륨 85 (1순위) · 대형마트 생닭은 국내산 독점 진입 불가 · 식자재마트는 중국산 13~14% 저가 덤핑으로 마진 박</strong>. 채널별로 sourcing·spec·결제조건이 완전히 다른 별개 사업.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 태국산은 단순 commodity가 아닌 <strong>"정밀 가공 역량 + 결품 없는 공급 안정성을 동시 판매하는 dual-value product"</strong>.</p>
<p><strong>3단계</strong>: ① 프랜차이즈 B2B(맘스터치·BHC·교촌) 순살 LTA — 1순위 capital allocation ② 편의점 HMR(샐러드치킨·꼬치) — 캐시카우 마진 35% lock-in ③ 식자재마트는 volume backbone (마진 낮으나 capa 활용) — 대형마트 신선코너는 진입 포기.</p>
</div>`,
        source: 'NotebookLM 닭 479소스 교차분석 · KAMIS · KCS HS0207 · Thai DLD · CP Foods IR 2023',
      }}
    />
  );
}

export function InsightVMILockin() {
  return (
    <WidgetCard
      title="Insight C. VMI 락인 — 공급 안정성 판매 전략"
      icon={Warehouse}
      iconColor="#3b82f6"
      pillar="S3"
      cardDesc='닭고기가 아니라 "결품 없는 공급 안정성"을 판다. VMI(벤더재고관리) 도입 24개월 후 바이어 재계약률 95%+ 달성'
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={320}
      chart={
        <ComposedChart data={vmiLockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <ChartPatternDefs />
          <defs>
            <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="stage" stroke="#94a3b8" />
          <YAxis yAxisId="left" stroke="#94a3b8" unit="%" domain={[0, 100]} />
          <YAxis yAxisId="right" orientation="right" stroke="#10b981" unit="%" />
          <RTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Area yAxisId="left" type="monotone" dataKey="retention" name="바이어 재계약률(%)" stroke="#3b82f6" fill="url(#retGrad)" />
          <Line yAxisId="right" type="monotone" dataKey="margin" name="평균 마진율(%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
        </ComposedChart>
      }
      kpiPanel={[
        { label: 'VMI 24개월 재계약률', value: '95%', sub: 'Lock-in 마진 28%', trendColor: '#3b82f6' },
      ]}
      takeaway={{
        situation: `<div>
<p>"VMI(Vendor Managed Inventory, 벤더재고관리)"란 vendor가 바이어 측 창고 재고를 자체 관리하고 사용한 만큼만 매월 정산하는 공급망 모델. 바이어 입장에서는 결품 zero + working capital 부담 zero — 한 번 도입하면 vendor 교체 cost가 천문학적.</p>
<p>실측: <strong>초기 도입 재계약률 45% → 24개월+ 95% (lock-in 완성). 마진율도 8% → 28%로 3.5배 개선 — 시간이 vendor에게 일방적 우호하는 구조</strong>. 한국 프랜차이즈 본사의 결품 zero-tolerance 문화가 VMI에 완벽 fit.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: VMI는 "납품 방식"이 아닌 <strong>"바이어 supply chain 핏줄에 vendor를 영구 결합시키는 lock-in instrument"</strong>. 한 번 deep-integrate 되면 가격 협상력은 vendor 손에.</p>
<p><strong>3단계</strong>: ① 냉동창고 capex → "가공육 Repo(환매조건부)" 금융 모델 구축 — 회계상 off-balance 가능 ② 프랜차이즈 본사에 "주방 로스 절감 + 인건비 절감" 정량 수치로 ROI 제안 ③ 24개월 lock-in 완성 후 마진율 8% → 28% 3.5배 — "고기를 파는 게 아니라 supply guarantee를 판다" 패러다임 전환.</p>
</div>`,
        source: 'VMI 유통 모델링 · Thai DLD · CP Foods 2023 Value Chain Analysis',
      }}
    />
  );
}
