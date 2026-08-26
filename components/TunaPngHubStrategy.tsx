/**
 * PNG 가공 허브 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 74줄 → After 53줄 (-28%)
 */

'use client';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Anchor } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

export default function TunaPngHubStrategy() {
  const [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    fetch('/api/tuna-extract')
      .then((r) => r.json())
      .then((j) => setData(j.d_n1_png_hub))
      .catch(() => setData([]));
  }, []);

  if (!data) return null;

  return (
    <WidgetCard
      title="N1. 태평양 가공 허브 (PNG) vs 국내 조달 원가율 비교"
      icon={Anchor}
      iconColor="#f59e0b"
      pillar="S2"
      cardDesc="동원 RD Tuna Canners PNG 거점의 산지 1차 가공 vs 국내 직조달 비용유형별 단가 비교"
      telemetry={{ status: data && data.length > 0 ? 'SYNCED' : 'STATIC', syncDate: '2026-05' }}
      chartHeight={280}
      chart={
        <BarChart data={data} layout="vertical" margin={{ left: 50 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="var(--w-slate-400)" />
          <YAxis dataKey="cost_type" type="category" stroke="var(--w-slate-400)" fontSize={11} width={120} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(20, 28, 52, 0.9)', borderColor: '#334155', color: 'var(--w-slate-50)' }}
            itemStyle={{ color: 'var(--w-slate-50)' }}
          />
          <Legend />
          <Bar dataKey="domestic" name="국내 직조달 ($/톤)" fill="var(--w-red-500)" />
          <Bar dataKey="png_hub" name="PNG 산지 추출 ($/톤)" fill="var(--w-emerald-500)" />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>"파푸아뉴기니(PNG)"는 WCPO 어획 쿼터를 통제하는 PNA 8개국 중 가장 큰 회원국. 동시에 EU EBA(Everything But Arms) 무관세 + 한국 ODA 협력국이라는 3중 유리한 위치.</p>
<p>동원산업이 PNG Madang에 <strong>RD Tuna Canners</strong>를 구축해 현지 가공 허브를 선점한 것은 한국 수산 산업의 전략적 설비투자(자본지출) 결정 중 하나.</p>
<p>왜? 냉동 원물을 한국까지 들여와 가공하면 냉동 보관·내륙 물류비가 누적됩니다. 반면 산지(PNG)에서 즉시 해체·1차 자숙액 추출 시 물류비·보관비 상당 부분 절감(업계 추정). 동시에 EBA(최빈국 무관세 협정) 활용으로 EU 직수출 가능.</p>
<p>의미: PNG 허브는 단순 가공 거점이 아닌 <strong>"WCPO 원물 + EU 시장 + 동남아·호주 보조 유통망"</strong> 3중 복합 플랫폼.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: PNG 허브는 단순 가공 외주가 아닌 <strong>국가급 전략 자산</strong>. 한국 중소 경쟁사가 따라할 수 없는 매입원가·물류·관세 3중 진입장벽.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>"산지 1차 가공 → 국내 고도화" 글로벌 분업 모델</strong>: PNG에서 1차 자숙·로인(살코기) 가공, 한국에서 최종 통조림 제조·연구개발. 한라식품 등 국내 중소 경쟁사 대비 매입원가 진입장벽 -25%p 수준 구축(업계 추정).</li>
<li style="margin-bottom: 8px;"><strong>PNG 허브를 동남아·호주 직수출 전초 기지로 격상</strong>: 현재 한국 수출 전용 → 호주·뉴질랜드·인도네시아 직수출 확대.</li>
<li><strong>WCPO 주권 지분 파트너십</strong>: PNG 국부펀드와 유한책임 파트너 구조 - 앵커 출자자로 3,000~5,000만 달러 투입, 펀드가 PNG 인프라 재투자. 배당으로 매입원가 회수 + ESG 자산화.</li>
</ol>
</div>`,
        source: '자체추정/업계추정 (동원산업 공개자료 기반)',
      }}
    />
  );
}
