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
    <div style={{ background: '#0a0f1f', border: '1px solid #334155', borderRadius: 6, padding: '8px 12px' }}>
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
    telemetry={{ status: 'STATIC', syncDate: 'FAO FishStatJ 2022' }}
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
      situation: `<div>
<p>"양식 참다랑어"는 자연산 어획 한계 도래로 향후 20년 글로벌 고급 수산물 시장의 핵심 공급원. 그런데 그 생산 권력은 단 5개국에 집중되어 있습니다.</p>
<p>"5대 패권국": <strong>호주·일본·스페인·몰타·멕시코</strong>. 이 5개국이 글로벌 양식 참다랑어 생산의 90% 이상. 모두 ① 자본력(척당 3,000만~8,000만 달러 초기투자비용 필요) ② 기술력(15~20년 R&D) ③ ICCAT 쿼터 권리 보유 — 후발 진입자가 따라잡기 어려운 3중 진입장벽.</p>
<p>이 카르텔의 함의: 한국 같은 후발 양식국은 단독 진입 불가. 그러나 우회 경로 존재 — <strong>자본력 부족한 튀르키예·크로아티아 후발 양식국</strong>에 한국이 자본·기술을 공급하고 전용 물량을 받는 스왑 모델.</p>
</div>`,
      actionPlan: `<div>
<p><strong>재정의</strong>: 5대 카르텔 단독 돌파 불가. <strong>"후발 양식국 공적개발원조(ODA) + 민간 합작 스왑"</strong>으로 카르텔 외 채널 자체 구축.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>튀르키예·크로아티아 후발 양식국 자본 지원</strong>: ODA 또는 민간 합작 채널로 냉동·사료 설비 선지원. 반대급부로 양식 물량 5년 장기매입권 독점.</li>
<li style="margin-bottom: 8px;"><strong>한국 자체 양식 R&amp;D 가속</strong>: 완전순환양식 기술 확보 — 종묘부터 출하까지 자체 순환. 5~7년 기술 격차 따라잡기 + 정부 R&amp;D 자금 활용.</li>
<li><strong>"6번째 패권국" 진입</strong>: 5대 카르텔 외에 한국이 첫 번째 진입자가 되면 향후 30~50년 글로벌 양식 참다랑어 시장의 유일 대안 공급국. ICCAT 쿼터 보유국 지위 확보가 결정적.</li>
</ol>
</div>`,
      source: 'FAO FishStatJ Aquaculture Production by Country',
    }}
  />
);

export default TunaAquaHegemony;
