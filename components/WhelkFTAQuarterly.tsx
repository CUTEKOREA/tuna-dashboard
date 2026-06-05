'use client';
import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Cell, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { Ship } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';
import raw from '../data/whelk_fta_quarterly.json';

const tooltipStyle = {
  background: 'rgba(0,15,30,0.95)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function WhelkFTAQuarterly() {
  const yearly = raw.yearly as Array<{ year: string; volume: number; value: number }>;
  const shareSeries = raw.originShareVolume as Array<{ year: string; uk: number; ireland: number; other: number }>;
  const prices = raw.unitPriceQuarterly as Array<{ period: string; uk: number; ireland: number }>;
  const yoy = raw.yoy2025H1 as Array<{ country: string; volume: number; delta: number }>;

  const YearlyChart = (
    <div style={{ height: '240px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={yearly} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${v}천톤`} tick={{ fill: '#fbbf24', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}M`} tick={{ fill: '#d97706', fontSize: 10 }} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(val: any, name: any) => {
              if (name === '수입량') return [`${val}천 톤`, name];
              if (name === '수입액') return [`$${val}M`, name];
              return [val, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar yAxisId="left" dataKey="volume" name="수입량">
            {yearly.map((d, i) => (
              <Cell key={i} fill={d.year === '2025H1' ? '#10b981' : '#fbbf24'} opacity={0.85} />
            ))}
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="value" name="수입액" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const ShareChart = (
    <div style={{ height: '220px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={shareSeries} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${v}%`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any, name: any) => [`${val}%`, name]} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Area type="monotone" dataKey="uk" name="영국" stackId="1" fill="#fbbf24" stroke="#fbbf24" fillOpacity={0.8} />
          <Area type="monotone" dataKey="ireland" name="아일랜드" stackId="1" fill="#92400e" stroke="#92400e" fillOpacity={0.8} />
          <Area type="monotone" dataKey="other" name="기타" stackId="1" fill="#64748b" stroke="#64748b" fillOpacity={0.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  const PriceChart = (
    <div style={{ height: '220px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={prices} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="period" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} domain={[9, 16]} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any, name: any) => [`$${val}/kg`, name]} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Line type="monotone" dataKey="uk" name="영국" stroke="#fbbf24" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="ireland" name="아일랜드" stroke="#92400e" strokeWidth={2.5} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const YoYBars = (
    <div style={{ height: '180px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={yoy} layout="vertical" margin={{ top: 8, right: 30, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="country" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} width={70} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [`${val > 0 ? '+' : ''}${val}%`, '전년 동기 대비']} />
          <Bar dataKey="delta" name="전년 동기 대비" radius={[0, 4, 4, 0]}>
            {yoy.map((d, i) => (
              <Cell key={i} fill={d.delta > 0 ? '#10b981' : '#ef4444'} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const PanelStyle: React.CSSProperties = {
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    padding: '12px 14px',
  };
  const PanelTitle: React.CSSProperties = {
    fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24',
    letterSpacing: '0.04em', marginBottom: '6px',
    display: 'flex', alignItems: 'center', gap: '6px',
  };
  const PanelDesc: React.CSSProperties = {
    fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)',
    marginBottom: '4px', lineHeight: 1.45,
  };

  const Body = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={PanelStyle}>
        <div style={PanelTitle}>📊 연도별 對FTA 골뱅이 수입 (2020~2025 H1)</div>
        <div style={PanelDesc}>러-우 전쟁·영국 자원 위축 누적으로 4년간 5.9→3.3천 톤(−44.3%) 반토막. 2025 H1만으로 +17.6%/+36.2% 회복 시그널 첫 점화.</div>
        {YearlyChart}
      </div>

      <div style={PanelStyle}>
        <div style={PanelTitle}>🇬🇧 영국·아일랜드 점유율 추이</div>
        <div style={PanelDesc}>영국 비중 76.0%(2024) → 84.7%(2025 H1) +8.7%p 확대. 아일랜드는 18.9% → 14.4%로 축소 — 영국 단일 의존 심화.</div>
        {ShareChart}
      </div>

      <div style={PanelStyle}>
        <div style={PanelTitle}>💵 조제저장 골뱅이 단가 시계열 (HSK 1605591090)</div>
        <div style={PanelDesc}>영국 단가 $9.9 → $11.8/kg(+19%, 23Q4→25Q2), 아일랜드 $12.4 → $14.6/kg(+18%). 아일랜드 단가 분기 변동성 더 큼.</div>
        {PriceChart}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={PanelStyle}>
          <div style={PanelTitle}>📈 2025 H1 회복 사이클: 영국 +31.6%</div>
          <div style={PanelDesc}>영국 1.2천 톤(+31.6%) — 조업 시즌 개시 + 공급선 다변화 수요 동시. 아일랜드 −18.2%로 영국 쪽 흡수.</div>
          {YoYBars}
        </div>
        <div style={PanelStyle}>
          <div style={PanelTitle}>⚠️ 데이터 공백 주의</div>
          <div style={PanelDesc}>2025 Q3·Q4·2026 Q1 KMI 보고서에서 골뱅이가 주요 품목 기재에서 제외됨. <strong>KMI 통계명이 2025년부터 '골뱅이' → '고둥'으로 재분류</strong>됨. 향후 H2 데이터는 발표 시 보강 필요.</div>
          <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(251, 191, 36, 0.08)', borderLeft: '3px solid #fbbf24', borderRadius: '4px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            <strong style={{ color: '#fbbf24' }}>주요 사건 타임라인</strong><br/>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>2022:</span> 러-우 전쟁 공급 부족, 다운스펙 가공 시작<br/>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>2024:</span> 영국 자원 위축, 프랑스·중국 수요 경합<br/>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>2025 H1:</span> 영국 조업 시즌 개시, 공급선 다변화로 +31.6% 재진입
          </div>
        </div>
      </div>

      <div
        style={{
          ...PanelStyle,
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(146, 64, 14, 0.10))',
          borderColor: 'rgba(251, 191, 36, 0.25)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
        }}
      >
        {[
          { label: '4년 누적 수입 감소', value: '−44.3%', sub: '5.9→3.3천 톤 (2020→2024)', color: '#ef4444' },
          { label: '2025 H1 회복 (물량)', value: '+17.6%', sub: '1.5천 톤 / +36.2% 가치', color: '#10b981' },
          { label: '영국 점유율 확대', value: '+8.7%p', sub: '76.0→84.7% (가치 기준)', color: '#fbbf24' },
          { label: '단가 5분기 인상', value: '+19%', sub: '영국 $9.9→$11.8/kg', color: '#fb923c' },
        ].map((k, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${k.color}`, paddingLeft: '10px' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', marginBottom: '2px' }}>{k.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: k.color, lineHeight: 1.2 }}>{k.value}</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{k.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="FTA 골뱅이 분기별 수입 동향 (KMI 21개 분기)"
      icon={Ship}
      iconColor="#fbbf24"
      pillar="S3"
      cardDesc="KMI(한국해양수산개발원) FTA 체결국 수산물 수입동향 보고서 2021 Q4~2026 Q1 원문 PDF 21건에서 추출한 골뱅이 시계열. 2020~2024 4년간 −44.3% 반토막 사이클 + 2025 H1 영국 조업 시즌 개시로 +17.6% 회복 점화 — 영국 단일 의존 심화 구간."
      telemetry={{ status: 'STATIC', syncDate: '2026-05' }}
      customBody={Body}
      takeaway={{
        situation: `<div>
<p>"공급원 다중 충격(Compound Supply Shock)"이란 한 원물이 자원·지정학·환경 충격을 다년에 걸쳐 누적적으로 받아 베이스라인 자체가 영구 하향 조정되는 구조. 골뱅이(B. undatum)는 영국·아일랜드 북해 자원으로 양식이 불가능해 충격 분산 옵션이 가장 제약된 어종.</p>
<p>실측: <strong>2020~2024 4년 누적 對FTA 골뱅이 수입은 5.92→3.30천 톤(−44.3%), 가치 $67.6→$34.2M(−49.4%)로 반토막</strong>. 러-우 전쟁 공급 부족(2022)·영국 자원 위축(2024)·프랑스·중국 수요 경합이 직렬 작동. <strong>2024년 영국 76.0% / 아일랜드 18.9% 비중에서, 2025 H1엔 영국 84.7% / 아일랜드 14.4%로 영국 의존 +8.7%p 심화</strong>.</p>
<p>회복 시그널: <strong>2025 H1만으로 1.5천 톤·$20.1M (전년 동기 +17.6%/+36.2%)</strong>로 영국 조업 시즌 개시 효과 + 공급선 다변화 수요가 동시 점화. 단가는 영국 23Q4 $9.9→25Q2 $11.8/kg(+19%)·아일랜드 $12.4→$14.6/kg(+18%) 5분기 누적 인상 — 회복 = 단가 프리미엄 동반.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 골뱅이 조달은 단가 협상이 아닌 <strong>"영국 단일 의존 84.7%·양식 불가·다년 자원 절벽이라는 삼중 제약 하에서 회복 사이클을 락인하는 시점 선점 게임"</strong>.</p>
<p><strong>3단계</strong>: ① 2025 H1 영국 +31.6% 회복 모멘텀이 살아있을 때 <strong>다년 선도 계약(2-3년)</strong> 즉시 협상 — 단가 $11.8/kg 상단 락인하여 2026~2027 단가 +20% 추가 인상 리스크 헤지. ② 아일랜드 라인(−18.2%) 축소 대신 비중 유지 — 단가는 비싸지만 영국 충격 시 유일한 EU 대체 ($14.6/kg는 보험 비용으로 수용). ③ KMI가 2025년부터 통계명을 '고둥'으로 재분류, 주요 품목 기재 제외 — <strong>분기 보고서가 아닌 KCS 직접 조회(HSK 1605591090) 모니터링 라인 신설</strong> 의무화.</p>
</div>`,
        source: 'KMI 한국해양수산개발원 — FTA 체결국 수산물 수입동향 2021 Q4~2025 Q2 (골뱅이 기재 포함 16개 분기) · HSK 1605591090 기타 조제저장처리 골뱅이',
      }}
    />
  );
}
