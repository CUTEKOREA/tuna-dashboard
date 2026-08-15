/**
 * 글로벌 참다랑어 Catch vs Farmed — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 85줄 → After 57줄 (-33%)
 */

'use client';
import React from 'react';
import { Anchor } from 'lucide-react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ComposedChart } from 'recharts';
import { getTunaData } from '@/lib/data/tuna';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

const data = getTunaData('crossroads');

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: 'var(--w-slate-50)', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{`${label}년 참다랑어 공급`}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>{entry.name}: </span>
          <strong>{Number(entry.value).toLocaleString()} 톤</strong>
        </p>
      ))}
    </div>
  );
};

const TunaCrossroads = () => (
  <WidgetCard
    title="글로벌 참다랑어 생산량 크로스로드 (어획 vs 양식)"
    icon={Anchor}
    iconColor="#8b5cf6"
    pillar="S1"
    cardDesc="참다랑어 자연 어획량(쿼터로 1980년 이후 정체) vs 축양/양식량(우상향 돌파)을 ComposedChart로 결합 — 출처: FAO FishStatJ"
    telemetry={{ status: 'STATIC', syncDate: '2026-06-05' }}
    chartHeight={350}
    chart={
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis dataKey="Year" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
        <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} tickFormatter={(v) => `${v.toLocaleString()}`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Area type="monotone" dataKey="Wild_Volume" name="자연 어획량 (Wild Catch)" fill="rgba(var(--w-violet-500-rgb), 0.2)" stroke="var(--w-violet-500)" strokeWidth={2} />
        <Line type="monotone" dataKey="Aqua_Volume" name="축양/양식량 (Aquaculture)" stroke="#22c55e" strokeWidth={4} dot={false} activeDot={{ r: 8 }} />
      </ComposedChart>
    }
    takeaway={{
      situation: `<div>
<p>"Crossroads(갈림길)"란 한 길에서 두 길로 나뉘는 결정적 분기점. 글로벌 참다랑어 산업이 정확히 그 분기점에 있습니다.</p>
<p>40년 추세: <strong>천연산 어획량 1980년 이후 정체</strong>(ICCAT·IATTC 쿼터 강화). 반면 <strong>축양·양식 생산량은 우상향 돌파</strong>(2015년 자연산 추월, 현재 1.5배+). 두 선이 X자로 교차 후 점점 벌어지는 영구적 구조 전환.</p>
<p>의미: 어획(자연산) 중심 사업은 글로벌 쿼터 규제로 성장 정체. 향후 30년 성장의 돌파구는 양식·축양 한 길뿐. 자연산 어선·인프라에 묶인 자본은 향후 5~10년 stranded asset 가능성.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 자연산 어획 vs 양식의 갈림길은 한 번 지나가면 되돌아갈 수 없는 일방향 전환. capital allocation 의사결정의 최우선 순위.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>원양어선 capex 동결</strong>: 신규 자연산 어선 건조 100% 동결. 그 자본을 양식·축양 인프라로 재배치.</li>
<li style="margin-bottom: 8px;"><strong>완전양식(Closed-cycle) R&amp;D + 해상 가두리 인프라 capex</strong>: 호주 Cleanseas Tuna·일본 긴키대학·스페인 IEO와 partnership. 5~10년 R&amp;D 투자.</li>
<li><strong>"Hatchery equity 락업"</strong>: 천연 치어 쿼터 삭감 시 종묘 가격 폭등 — 핵심 hatchery(긴키대학·Balfegó hatchery) JV 또는 지분 투자로 원물 소스 선점. 향후 양식 시장 보틀넥 통제권.</li>
</ol>
</div>`,
      source: 'FAO FishStatJ — Bluefin Tuna Wild Catch vs Aquaculture',
    }}
  />
);

export default TunaCrossroads;
