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
        situation: '한국의 수산 부산물 업사이클링 비율은 19.5%로 글로벌 평균(40%)의 절반에도 못 미치며, 아이슬란드(95%)·노르웨이(99%) 대비 5배 격차. 2020년 기준 글로벌 어분 27%, 어유 48%가 이미 어획 부산물 기반인 점을 감안하면 한국에 막대한 미회수 가치가 잠재. EU 공동어로정책(CFP) 하역 의무화로 부산물 자원화가 규제적 의무로 전환 중.',
        actionPlan: '1) 아이슬란드 \'Nothing is Waste\' 모델을 벤치마킹해 참치 가공 부산물 전량을 제약·건기식·펫푸드 B2B 원료로 전환하는 제로 웨이스트 로드맵 수립. 2) 단기 자숙액→액젓(19.5→40%), 중장기 심장·뼈→기능성 추출물·칼슘 보충제(40→80%+)로 단계적 확대. 3) EU 하역 의무화 정책 활용 \'규제 준수 + 순환경제\' 이중 가치로 EU 시장 진출 시 프리미엄 확보.',
        source: 'FAO SOFIA 2022 · 수산과학원 부산물 재활용 동향 · 아이슬란드 Ocean Cluster 사례 · A third assessment of global marine fisheries discards · EU CFP Landing Obligation',
      }}
    />
  );
}
