/**
 * 한국 양식 참다랑어 수입 출처 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 132줄 → After 80줄 (-39%)
 */

'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Anchor } from 'lucide-react';
import koreaOriginsData from '../data/tuna_korea_import_origins.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

const formatNumber = (n: number) => new Intl.NumberFormat('en-US').format(n);

const colors: Record<string, string> = {
  '일본': '#ef4444', '호주': '#f59e0b', '튀르키예': '#22c55e', '스페인': '#8b5cf6',
  '몰타': '#06b6d4', '모로코': '#ec4899', '기타 (Others)': '#64748b',
};
const defaultColors = ['#ec4899', '#06b6d4', '#a855f7', '#3b82f6'];

const allKeys = new Set<string>();
(koreaOriginsData as any[]).forEach((item) => {
  Object.keys(item).forEach((k) => {
    if (k !== 'Year' && k !== '기타 (Others)') allKeys.add(k);
  });
});
const origins = Array.from(allKeys);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: '#0F172A', border: '1px solid #334155', padding: '12px', borderRadius: '8px', color: '#f8fafc' }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{`${label}년`}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ margin: '4px 0', color: entry.color, display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          <span>{entry.name}:</span>
          <span style={{ fontWeight: 'bold' }}>{formatNumber(entry.value)} 톤</span>
        </p>
      ))}
      <div style={{ borderTop: '1px solid #334155', marginTop: '8px', paddingTop: '8px' }}>
        <p style={{ margin: 0, display: 'flex', justifyContent: 'space-between', gap: '16px', color: '#f8fafc' }}>
          <span>총합:</span>
          <span style={{ fontWeight: 'bold' }}>{formatNumber(payload.reduce((acc: number, c: any) => acc + c.value, 0))} 톤</span>
        </p>
      </div>
    </div>
  );
};

const TunaKoreaOrigins = () => (
  <WidgetCard
    title="한국의 양식 참다랑어 수입 출처"
    icon={Anchor}
    iconColor="#8b5cf6"
    pillar="S3"
    cardDesc="FAO FishStatJ 한국 참다랑어 수입 5년치를 양식 Top 10 국가 발만 추출 — 튀르키예·스페인 등 지중해 축양이 한국 프리미엄 시장 장악"
    telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
    chartHeight={300}
    chart={
      <BarChart data={koreaOriginsData as any[]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
        <XAxis dataKey="Year" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${formatNumber(v)}`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        {origins.map((origin, i) => (
          <Bar key={origin} dataKey={origin} stackId="a" fill={colors[origin] || defaultColors[i % defaultColors.length]} animationDuration={2000} />
        ))}
        <Bar key="기타 (Others)" dataKey="기타 (Others)" stackId="a" fill={colors['기타 (Others)']} animationDuration={2000} />
      </BarChart>
    }
    takeaway={{
      situation: `<div>
<p>한국 참다랑어(Bluefin) 수입 원산지 비중이 지난 10년간 큰 변화. 과거: 일본 단순 중계 + 호주 자연산 + 멕시코 축양. 현재: <strong>지중해권(튀르키예·스페인·몰타) 축양 물량이 한국 프리미엄 시장 장악</strong>.</p>
<p>왜 이런 변화? ① 자연산 참다랑어 ICCAT 쿼터 강화로 공급 -25%p ② 지중해 축양은 사료·지방률·체급 정밀 통제로 일본 미슐랭 셰프 선호 증가 ③ 한국이 일본 토요스 의존을 벗어나 직접 수입 확대.</p>
<p>의미: 한국 프리미엄 참다랑어 시장은 <strong>"양식 + 직수입"</strong>이 신표준. 자연산·중계 의존 공급사는 점점 채널 잃음.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 지중해 축양 공급사와의 장기 지분 관계가 한국 프리미엄 시장 채널 락업의 핵심. 일본 상사 경유 패시브 소싱은 마진 없는 범용 조달.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>지중해 탑티어 팜과 5년 독점 직접 구매 계약</strong>: 스페인 발페고(Balfegó)·튀르키예 시르킬(Sirkir)·몰타 몰타피시파밍 등 소수 지분 5~10% 인수 + 매입권 락업.</li>
<li style="margin-bottom: 8px;"><strong>일본 상사 경유 우회</strong>: 직수입 비중 확대(자체추정: 현재 35% → 70% 목표). 중간 마진 직접 회수.</li>
<li><strong>지방 함량(오토로) 균일성·체급 맞춤 마케팅 전면</strong>: "지중해산 + 한국 숙성" 차별화 브랜드로 한국 미쉐린 스시·럭셔리 호텔 채널 락업. 단가 상승 여력(자체추정: 30~50%) 확보.</li>
</ol>
</div>`,
      source: '관세청 수입통계 HSK 0303.41/0303.42 + FAO FishStatJ',
    }}
  />
);

export default TunaKoreaOrigins;
