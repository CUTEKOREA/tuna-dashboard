'use client';

import React from 'react';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line } from 'recharts';
import { ShieldCheck } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getSalmonData } from '@/lib/data/salmon';
import { ChartPatternDefs } from './ChartPatterns';

const rawData = getSalmonData('smolt');

export default function SalmonInsightSmolt() {
  return (
    <WidgetCard
      title="생물학적 한계 돌파: 포스트 스몰트 & 심해 레이저"
      icon={ShieldCheck}
      iconColor="var(--color-success)"
      pillar="S1"
      cardDesc="육상 사육 연장 및 심해 차폐 기술로 바다이(Sea lice) 리스크 원천 차단 · 비중·폐사율 추이는 업계 정성 동향 기반 자체 추정(시나리오, illustrative)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      chartHeight={250}
      chart={
        <ComposedChart data={rawData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="year" stroke="var(--w-slate-400)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="var(--color-info)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis yAxisId="right" orientation="right" stroke="var(--color-danger)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip 
            contentStyle={{ background: '#11182f', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '0.85rem' }}
            formatter={(value: any, name: any) => {
              if (name === 'postSmolt') return [`${value}%`, '육상 포스트 스몰트 비중'];
              if (name === 'mortality') return [`${value}%`, '해상 폐사율 (바다이 등)'];
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
          <Bar yAxisId="left" dataKey="postSmolt" name="육상 포스트 스몰트 비중" fill="url(#colorSmolt)" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="mortality" name="해상 폐사율 (바다이 등)" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <defs>
            <linearGradient id="colorSmolt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"포스트 스몰트(Post-Smolt)"는 양식 연어 치어를 500g까지 육상 RAS에서 키운 후 해상 이동시키는 차세대 양식 모델.</p>
<p>전통 모델 한계: <strong>해상 가두리 양식은 바다이(Sea lice) + 수온 상승으로 폐사율 15% 돌파</strong>. 연안 양식 면허 신규 발급 전면 중단.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 전통 해상 가두리 양식은 한계에 직면. <strong>"RAS 포스트 스몰트 + 심해 잠수식 가두리"</strong>로의 전환이 핵심 흐름.</p>
<p><strong>3단계</strong>: ① 육상 RAS 포스트 스몰트 설비 capex 가속 — 초기 생존율 극대화 ② 바다이 차단 심해 잠수식 가두리 (SalMar Ocean Farm 1) 투자 ③ Mowi·Salmar·Grieg 같은 leader와 minority equity partnership — 차세대 양식 IP 라이센싱.</p>
</div>`,
        source: "Mowi ASA Annual Report 2024 · Grieg Seafood Q4-2024 IR (정성 동향) · 비중/폐사율 수치는 자체 추정(illustrative)"
      }}
    />
  );
}
