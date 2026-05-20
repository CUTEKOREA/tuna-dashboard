/**
 * 양식 참다랑어 생산 패권 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 107줄 → After 65줄 (-39%)
 */

'use client';
import React from 'react';
import { Anchor } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import data from '../data/tuna_aqua_hegemony.json';
import WidgetCard from './WidgetCard';

const countries = (data as any[]).length > 0
  ? Object.keys((data as any[])[0]).filter((k) => k !== 'Year')
  : [];

const colors = ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, e: any) => s + e.value, 0);
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
      <p style={{ color: '#f8fafc', fontWeight: 600, margin: 0, fontSize: '0.85rem' }}>{`${label}년 생산량 분포`}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color, margin: '4px 0 0 0', fontSize: '0.8rem' }}>
          <span>{entry.name}: </span><strong>{Number(entry.value).toLocaleString()} 톤</strong>
        </p>
      ))}
      <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
      <p style={{ color: '#f8fafc', margin: 0, fontSize: '0.8rem', fontWeight: 'bold' }}>
        <span>총 양식량: </span><strong>{Number(total).toLocaleString()} 톤</strong>
      </p>
    </div>
  );
};

const TunaAquaHegemony = () => (
  <WidgetCard
    title="양식 참다랑어 생산 패권"
    icon={Anchor}
    iconColor="#8b5cf6"
    pillar="S1"
    cardDesc="FAO FishStatJ로 상위 양식국 5개를 누적 면적으로 시각화 — 지중해권(호주·일본·스페인·몰타·멕시코)의 고부가가치 양식 시장 점유율 추이"
    telemetry={{ status: 'SYNCED', syncDate: 'FAO FishStatJ' }}
    chartHeight={350}
    chart={
      <AreaChart data={data as any[]} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
        <XAxis dataKey="Year" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
        <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} tickFormatter={(v) => `${v.toLocaleString()}`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        {countries.map((country, idx) => (
          <Area key={country} type="monotone" dataKey={country} stackId="1" stroke={colors[idx % colors.length]} fill={colors[idx % colors.length]} fillOpacity={0.8} />
        ))}
      </AreaChart>
    }
    takeaway={{
      situation: '지중해권(호주·일본·스페인·몰타·멕시코)이 양식 참다랑어 생산 패권을 장악. 고부가가치 양식 시장이 자본력·기술력 기반으로 선진 해양국에 집중되며 빠르게 재편 중.',
      actionPlan: '지중해 남부(호주·일본 자본 유입) 카르텔을 단독 돌파하기는 어려움. 자본력이 부족한 튀르키예·크로아티아 등 후발 양식국에 ODA 또는 민간 합작 채널로 설비(냉동·사료) 선지원, 반대급부로 양식 물량 장기 매입권(Off-take) 독점하는 투트랙 우회 전략.',
      source: 'FAO FishStatJ Aquaculture Production by Country',
    }}
  />
);

export default TunaAquaHegemony;
