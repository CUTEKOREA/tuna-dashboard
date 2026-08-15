import React, { useState } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ResponsiveContainer } from 'recharts';
import { Ship, Anchor } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';
import { getSalmonData } from '@/lib/data/salmon';

const rawData = getSalmonData('logisticsResilience');
const euImportData = rawData.euImportData;
const freightData = rawData.freightData;

const FreightTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const eventItem = freightData.find(d => d.year === label);
    return (
      <div style={{ background: '#11182f', borderRadius: '8px', padding: '0.75rem', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px' }}>
        <p style={{ margin: '0 0 0.25rem 0', fontWeight: 700, color: 'var(--w-sky-400)' }}>{label}</p>
        {eventItem?.event && (
          <p style={{ margin: '0 0 0.5rem 0', color: '#f97316', fontSize: '0.75rem', fontStyle: 'italic' }}>
            ⚡ {eventItem.event}
          </p>
        )}
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ margin: '0.15rem 0', color: entry.color }}>
            {entry.name}: <strong>{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</strong>
            {entry.dataKey === 'euRouteCost' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SalmonInsightLogisticsResilience() {
  const [activePanel, setActivePanel] = useState<'eu' | 'freight'>('eu');

  const takeaway = activePanel === 'eu'
    ? {
        situation: "코로나19, 브렉시트 통관 지연, 러-우 전쟁발 운임 변동이라는 거시 충격 국면에도 EU의 연어 수입 물량(약 100만 톤)은 980~1,010천 톤 박스권에서 견고하게 유지됩니다. 다만 같은 기간 수입 단가는 2019년 6.46 EUR/kg에서 2024년 8.40 EUR/kg(+30%)로 상승했습니다(이상 수치는 EUMOFA 무역통계 추이를 토대로 한 자체 추정·시나리오값).",
        actionPlan: "물류 지연 리스크를 줄이기 위해, 신선육(Fresh) 수입 비중을 낮추고 보관 유연성이 큰 냉동/2차 가공품(Frozen & Value-added) 포트폴리오를 확대하는 방안을 검토할 만합니다. 동시에 노르웨이에 편중된 단일 공급망을 북미/아이슬란드로 분산(Hedging)하는 전략을 함께 고려합니다.",
        source: "자체 추정·시나리오 (illustrative) · EUMOFA 무역통계 참조",
      }
    : {
        situation: "2023년 말 촉발된 홍해 분쟁이 2024년 심화되며 BDI·CCFI 운임 지수가 재상승했고, 특히 유럽 노선 운임(YoY)이 2024년 +218%로 표기됩니다. 여기에 2023년 발효된 IMO EEXI/CII 환경 규제에 따른 선박 감속 운항이 더해져 신선 연어의 운송 리드타임과 물류 매입원가 부담이 커지는 국면입니다(운임 수치는 공개 지수 추이를 토대로 한 자체 추정·시나리오값).",
        actionPlan: "운임 변동성 리스크를 완화하기 위해 장기 운송 계약(COA) 비중을 확대하고, 감속 운항에 대응할 해상 콜드체인(Super-chilling) 역량을 갖춘 벤더 위주로 공급망을 재편하는 방안을 검토합니다.",
        source: "자체 추정·시나리오 (illustrative) · Krungsri·UNCTAD 공개자료 참조",
      };

  const tabs = (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
      <button
        onClick={() => setActivePanel('eu')}
        style={{
          padding: '0.35rem 0.75rem',
          borderRadius: '8px',
          border: activePanel === 'eu' ? '1px solid var(--w-cyan-500)' : '1px solid rgba(255,255,255,0.1)',
          background: activePanel === 'eu' ? 'rgba(var(--w-cyan-500-rgb), 0.15)' : 'rgba(255,255,255,0.03)',
          color: activePanel === 'eu' ? 'var(--w-cyan-500)' : 'var(--w-slate-400)',
          fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
          display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}
      >
        <Anchor size={13} /> EU 수입 구조
      </button>
      <button
        onClick={() => setActivePanel('freight')}
        style={{
          padding: '0.35rem 0.75rem',
          borderRadius: '8px',
          border: activePanel === 'freight' ? '1px solid #f97316' : '1px solid rgba(255,255,255,0.1)',
          background: activePanel === 'freight' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.03)',
          color: activePanel === 'freight' ? '#f97316' : 'var(--w-slate-400)',
          fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
          display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}
      >
        <Ship size={13} /> 글로벌 운임 지수
      </button>
    </div>
  );

  const chartArea = (
    <div style={{ height: 250, width: '100%', marginBottom: '1rem' }}>
      {activePanel === 'eu' && (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={euImportData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <ChartPatternDefs />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="var(--w-slate-400)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="var(--color-info)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}k`} />
            <YAxis yAxisId="right" orientation="right" stroke="#f97316" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
            <Tooltip contentStyle={{ background: '#11182f', border: 'none', borderRadius: '8px' }} itemStyle={{ fontSize: '0.85rem' }} />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />

            <Bar yAxisId="left" dataKey="importVol" name="EU 역외 수입량 (천 톤)" fill={A11Y_PALETTE[0]} radius={[4, 4, 0, 0]} barSize={24} />
            <Line yAxisId="right" type="monotone" dataKey="importVal" name="수입 총액 (EUR Billion)" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line yAxisId="right" type="monotone" dataKey="unitVal" name="수입 단가 (EUR/kg)" stroke="var(--color-danger)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} strokeDasharray="5 3" />
          </ComposedChart>
        </ResponsiveContainer>
      )}
      {activePanel === 'freight' && (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={freightData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <ChartPatternDefs />
            <defs>
              <linearGradient id="bdiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="ccfiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="year" stroke="var(--w-slate-400)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="var(--color-info)" fontSize={11} tickLine={false} axisLine={false} domain={[500, 3200]} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-success)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`} />
            <Tooltip content={<FreightTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />

            <Area yAxisId="left" type="monotone" dataKey="bdi" name="BDI (발틱건화물지수)" stroke="var(--color-info)" strokeWidth={2} fill="url(#bdiGradient)" dot={{ r: 3, fill: 'var(--color-info)' }} activeDot={{ r: 5 }} />
            <Area yAxisId="left" type="monotone" dataKey="ccfi" name="CCFI (중국컨테이너지수)" stroke="#f97316" strokeWidth={2} fill="url(#ccfiGradient)" dot={{ r: 3, fill: '#f97316' }} activeDot={{ r: 5 }} />
            <Bar yAxisId="right" dataKey="euRouteCost" name="EU 노선 운임 YoY (%)" fill={A11Y_PALETTE[2]} radius={[4, 4, 0, 0]} barSize={18} fillOpacity={0.7} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  return (
    <WidgetCard
      title="[물류] 거시 충격과 EU 연어 수입 물류 회복탄력성"
      icon={Ship}
      iconColor="#06b6d4"
      pillar="S3"
      cardDesc={activePanel === 'eu'
        ? 'EU 역외 수입 물량·총액·단가 3축 회복탄력성 (2019-2024) · 자체 추정·시나리오(illustrative)'
        : 'BDI·CCFI·EU 노선 운임 지수 거시 충격 트래킹 (2019-2024) · 자체 추정·시나리오(illustrative)'}
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      customBody={<>{tabs}{chartArea}</>}
      takeaway={takeaway}
    />
  );
}
