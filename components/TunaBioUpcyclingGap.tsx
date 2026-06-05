/**
 * 수산 부산물 업사이클링 격차 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 71줄 → After 51줄 (-28%)
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { ArrowUpRight } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

const data = [
  { name: '한국', rate: 19.5 },
  { name: '글로벌 평균', rate: 40.0 },
  { name: '아이슬란드', rate: 95.0 },
  { name: '노르웨이', rate: 99.0 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{label}</p>
      <p style={{ color: payload[0].payload.rate < 50 ? '#ef4444' : '#22c55e', margin: '4px 0 0 0', fontSize: '0.8rem' }}>
        업사이클링 비율: {payload[0].value}%
      </p>
    </div>
  );
};

export default function TunaBioUpcyclingGap() {
  return (
    <WidgetCard
      title="W13. 수산 부산물 업사이클링 격차"
      icon={ArrowUpRight}
      iconColor="#8b5cf6"
      pillar="S5"
      cardDesc="국가별 수산 부산물(내장·뼈·머리) 업사이클링 비율 — 한국 19.5% vs 글로벌 평균 40% vs 아이슬란드 95%·노르웨이 99%"
      telemetry={{ status: 'SYNCED', syncDate: 'FAO SOFIA 2022' }}
      chartHeight={280}
      chart={
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickMargin={10} angle={0} textAnchor="middle" height={60} />
          <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
          <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={50}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.rate > 90 ? '#8b5cf6' : entry.rate < 30 ? '#ef4444' : '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>"업사이클링 비율"이란 수산 가공 부산물(부피의 30~50%)을 폐기하지 않고 고부가 제품으로 재가공하는 비율. 국가 간 격차가 크다.</p>
<p>국가별 비율: <strong>아이슬란드 95% · 노르웨이 99% · 글로벌 평균 40% · 한국 19.5%</strong>. 한국은 글로벌 평균의 절반에도 못 미치며 아이슬란드 대비 <strong>5배 격차</strong>.</p>
<p>왜 한국이 뒤처졌나? ① 부산물 분리·가공 인프라 부족 ② 폐기 처분이 더 싸다는 인식 ③ B2B 원료 시장 미발달 ④ R&amp;D 부재. 글로벌 어분 27%·어유 48%가 이미 어획 부산물 기반인 점은 시장 규모가 크다는 방증이다.</p>
<p>동시에 EU CFP 하역 의무화 발효 중 — 부산물 자원화가 규제 의무로 전환되는 시점이라 선도 진입 우위가 존재한다(업계 추정).</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 업사이클링 격차는 한국 수산 산업의 미회수 자산. 아이슬란드 '폐기물 제로' 모델을 한국형으로 이식하면 부산물 매출 잠재가 있다(자체추정, 규모 미검증).</p>
<p><strong>3단계 로드맵</strong> (illustrative):</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>제로 웨이스트 로드맵 수립</strong>: 참치 가공 부산물 전량을 제약·건기식·펫푸드 B2B 원료로 전환. 단기 19.5% → 5년 80% 목표(자체추정).</li>
<li style="margin-bottom: 8px;"><strong>단계적 확대</strong>: 단기 자숙액 → 액젓(19.5→40%), 중장기 심장·뼈 → 기능성 추출물·칼슘 보충제(40→80%+)(자체추정).</li>
<li><strong>EU 하역 의무화 활용</strong>: "규제 준수 + 순환경제" 이중 가치로 EU 시장 진출 시 프리미엄 확보. 아이슬란드 Ocean Cluster와의 기술·노하우 제휴를 검토할 것.</li>
</ol>
</div>`,
        source: 'FAO SOFIA 2022 · 수산과학원 부산물 재활용 동향 · 아이슬란드 Ocean Cluster 사례 · A third assessment of global marine fisheries discards · EU CFP Landing Obligation',
      }}
    />
  );
}
