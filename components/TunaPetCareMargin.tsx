/**
 * 부산물 업사이클링: 프리미엄 펫케어 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 128줄 → After 80줄 (-38%, customBody로 dual chart)
 */

'use client';
import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Recycle } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import rawData from '../data/tuna_petcare_margin.json';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

const COLORS = ['#ef4444', '#22c55e'];

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px', borderRadius: '8px', color: '#f8fafc', minWidth: '180px' }}>
      <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e2e8f0' }}>{label}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: payload[0].fill }}>💰 마진율</span>
          <span style={{ fontWeight: 700 }}>{payload[0].value}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>📈 시장 성장률</span>
          <span>{payload[0].payload.growth_rate}%</span>
        </div>
      </div>
    </div>
  );
};

export default function TunaPetCareMargin() {
  const data = rawData as any[];

  const DualChart = (
    <div style={{ height: '250px', width: '100%', display: 'flex', gap: '16px', position: 'relative', zIndex: 0 }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={5} dataKey="yield_pct" nameKey="category">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.8} />)}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </SafeResponsiveContainer>
      </div>
      <div style={{ flex: 1.5, minHeight: 0 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }} layout="vertical">
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
            <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(v: number) => `${v}%`} domain={[0, 35]} />
            <YAxis type="category" dataKey="market_type" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 'bold' }} width={120} />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar dataKey="margin_pct" name="마진율 (%)" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </SafeResponsiveContainer>
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="부산물 업사이클링: 프리미엄 펫케어"
      icon={Recycle}
      iconColor="#22c55e"
      pillar="S2"
      cardDesc="Thai Union 2024 재무 기준 펫케어 매출총이익률 참고. 수율 모델(가식부 48%/부산물 52%)은 illustrative 추정. 참치 통조림 마진 4~9% vs 프리미엄 펫푸드 원료 28.5%(비공개 증권사 추정)"
      unit="(단위: %)"
      telemetry={{ status: 'STATIC', syncDate: '2024 (Thai Union)' }}
      customBody={DualChart}
      takeaway={{
        situation: '원어 가공 시 가식부 비중은 어종·공정별 40~60%(Klomklao & Benjakul 2016). 본 위젯은 가식부 48% / 부산물 52% 모델 케이스. 동원F&B 2024 전체 영업이익률 4.1%(1,835억원 ÷ 4조 4,836억원), 2026 1Q 매출 1.2조원 돌파. 뉴트리플랜은 펫푸드 브랜드파워 3년 연속 1위, 미국 습식캔 6종 출시 후 연 300억원 매출 기대. 부산물 기반 프리미엄 펫케어 매출총이익률 28.5%는 비공개 증권사 추정치.',
        actionPlan: '수산 회사의 정체성을 \'식품 통조림 제조사\'에서 \'해양 바이오·헬스케어 원료 공급사\'로 재정의. 부산물(중량 40~55%)을 펫푸드 고단백 원료나 화장품용 해양 콜라겐으로 전환하는 R&D 시설 투자 + 제약·바이오 기업과 JV로 수율을 현금화.',
        source: 'Thai Union 2024 연차 보고서 · 동원F&B 2024-2026 분기 IR · 28.5% 펫푸드 마진은 비공개 증권사 추정치',
      }}
    />
  );
}
