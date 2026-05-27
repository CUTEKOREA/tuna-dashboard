'use client';
import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Cell, ResponsiveContainer, PieChart, Pie,
} from 'recharts';
import { Ship } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';
import raw from '../data/octopus_fta_quarterly.json';

const tooltipStyle = {
  background: 'rgba(0,15,30,0.95)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function OctopusFTAQuarterly() {
  const yearly = raw.yearly as Array<{ year: string; volume: number; value: number }>;
  const qSeries = raw.quarter as Array<{ q: string; qVolume: number; cumValue: number }>;
  const origin2026 = raw.originShift2026Q1 as Array<{ country: string; delta: number; shareVal: number }>;
  const prices = raw.unitPriceVietnam as Array<{ period: string; vietnam: number }>;
  const formMix = raw.formMix2026Q1 as Array<{ name: string; value: number; color: string }>;

  const YearlyChart = (
    <div style={{ height: '240px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={yearly} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${v}천톤`} tick={{ fill: '#6366f1', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}M`} tick={{ fill: '#8b5cf6', fontSize: 10 }} />
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
              <Cell key={i} fill={d.year === '2022' ? '#a78bfa' : '#6366f1'} opacity={d.year === '2022' ? 0.95 : 0.75} />
            ))}
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="value" name="수입액" stroke="#c4b5fd" strokeWidth={2.5} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const QuarterChart = (
    <div style={{ height: '210px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={qSeries} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="q" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${v}천톤`} tick={{ fill: '#6366f1', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}M`} tick={{ fill: '#8b5cf6', fontSize: 10 }} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(val: any, name: any) => {
              if (name === '분기 수입량') return [`${val}천 톤`, name];
              if (name === '누적 수입액') return [`$${val}M`, name];
              return [val, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar yAxisId="left" dataKey="qVolume" name="분기 수입량">
            {qSeries.map((d, i) => (
              <Cell key={i} fill={d.q === '25Q4' ? '#10b981' : (d.q === '26Q1' ? '#ef4444' : '#6366f1')} opacity={0.85} />
            ))}
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="cumValue" name="누적 수입액" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const PriceChart = (
    <div style={{ height: '210px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={prices} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="period" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} domain={[6, 7.5]} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any, name: any) => [`$${val}/kg`, name]} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Line type="monotone" dataKey="vietnam" name="베트남 냉동 단가" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const OriginBars = (
    <div style={{ height: '180px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={origin2026} layout="vertical" margin={{ top: 8, right: 30, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="country" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} width={60} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [`${val > 0 ? '+' : ''}${val}%`, '전년 동기 대비']} />
          <Bar dataKey="delta" name="전년 동기 대비" radius={[0, 4, 4, 0]}>
            {origin2026.map((d, i) => (
              <Cell key={i} fill={d.delta > 0 ? '#10b981' : '#ef4444'} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const FormPie = (
    <div style={{ height: '180px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={formMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={38} paddingAngle={2}
            label={({ name, value }) => `${name} ${value}%`} labelLine={false}
            style={{ fontSize: '11px', fill: '#e2e8f0' }}>
            {formMix.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [`${val}%`, '비중']} />
        </PieChart>
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
    fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa',
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
        <div style={PanelTitle}>📊 연도별 對FTA 낙지 수입 (2020~2025)</div>
        <div style={PanelDesc}>2022년 31.3천 톤·$290M 사상 최고치(보복수요) → 3년 연속 하향 → 2025년 28.9천 톤(+0.3%)으로 안정화 진입. 가치는 $262.9M(+4.4%) 회복.</div>
        {YearlyChart}
      </div>

      <div style={PanelStyle}>
        <div style={PanelTitle}>🌊 분기별 흐름과 25 Q4 반전·26 Q1 재둔화</div>
        <div style={PanelDesc}>25 Q4 +2.1%로 1~3분기 감소세 반전 → 26 Q1 −1.6% 재둔화. 베트남 단가 인상이 직접 트리거.</div>
        {QuarterChart}
      </div>

      <div style={PanelStyle}>
        <div style={PanelTitle}>💵 對베트남 냉동 낙지 단가 시계열</div>
        <div style={PanelDesc}>$6.5(23)→$6.7(24)→$6.6(25)→$6.9/kg(26 Q1, +4.8%). 베트남 현지 조업 부진이 26년 단가 상승으로 전이 시작.</div>
        {PriceChart}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={PanelStyle}>
          <div style={PanelTitle}>🇨🇳 26 Q1 원산지: 중국 점유율 확대</div>
          <div style={PanelDesc}>중국 +1.5% / 베트남 −5.2% / 태국 −23.1%. 가치 비중 중국 77.6%·베트남 20.3%·태국 2.0%. 중국 84.3%(2025) 고착.</div>
          {OriginBars}
        </div>
        <div style={PanelStyle}>
          <div style={PanelTitle}>🐙 26 Q1 가공 형태 (낙지 특이성)</div>
          <div style={PanelDesc}>활·신선·냉장 29.8% — 주꾸미(13.5%)·새우(0.4%) 대비 압도적. 산낙지·연포탕 외식 수요가 채널 분리.</div>
          {FormPie}
        </div>
      </div>

      <div
        style={{
          ...PanelStyle,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(139, 92, 246, 0.10))',
          borderColor: 'rgba(139, 92, 246, 0.25)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
        }}
      >
        {[
          { label: '2025년 수입 (안정화)', value: '28.9천 톤', sub: '$262.9M, +0.3%/+4.4%', color: '#6366f1' },
          { label: '중국 단일 의존도', value: '84.3%', sub: '2025 가치 비중', color: '#ef4444' },
          { label: '활·신선·냉장 비중', value: '29.8%', sub: '주꾸미 대비 +2.2배', color: '#10b981' },
          { label: '베트남 단가 인상 시작', value: '+4.8%', sub: '$6.6→$6.9/kg (26 Q1)', color: '#fb923c' },
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
      title="FTA 낙지 분기별 수입 동향 (KMI 21개 분기)"
      icon={Ship}
      iconColor="#6366f1"
      pillar="S3"
      cardDesc="KMI(한국해양수산개발원) FTA 체결국 수산물 수입동향 보고서 2021 Q4~2026 Q1 원문 PDF 21건에서 추출한 낙지 분기별 시계열. 2022 사상 최고치 이후 정상화 → 2025 안정화 진입 시그널과 동시에 중국 84.3% 단일 의존이 26 Q1까지 고착. 활·신선·냉장 29.8% 비중은 두족류 중 압도적으로 한국 외식 수요 특이성을 노출."
      telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
      customBody={Body}
      takeaway={{
        situation: `<div>
<p>"단일국 고착(Single-Origin Lock-in)"이란 한 commodity의 가치 비중이 한 국가에서 80%+ 고착되어 가격·정치·검역 충격이 1:1로 한국 소매가에 전이되는 구조. 낙지는 양식이 사실상 미개발(FishStat 양식 156행)이라 자연산 어획에 의존, 한국 자체 자원도 −30.9% 절벽으로 buffer 부재.</p>
<p>실측: <strong>2025년 對FTA 낙지 수입 28.9천 톤·$262.9M으로 +0.3%/+4.4% 안정화. 그러나 중국 가치 비중 84.3%·26 Q1 77.6%로 단일국 의존 고착, 베트남 13.7%·태국 1.4%로 분산 효과 미미</strong>. 동시에 <strong>활·신선·냉장 29.8%</strong> — 주꾸미(13.5%)·새우(0.4%) 대비 2~70배 — 한국 외식 채널(산낙지·연포탕·세발낙지)이 절대적 수요 베이스.</p>
<p>구조 시그널: <strong>對베트남 냉동 단가 26 Q1 +4.8%($6.6→$6.9/kg)</strong>로 베트남 다변화 옵션도 cost-push 노출 시작. 2022년 보복수요 정점 후 3년 하향이 끝나고 다시 단가 인상 사이클 진입 가능성.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 낙지 조달은 단가 협상이 아닌 <strong>"중국 84% 고착·국내 −30.9% 절벽·양식 미개발이라는 3중 제약 하에서, 활·신선 외식 채널과 냉동 HMR 채널을 분리 운영하는 채널 전략"</strong>.</p>
<p><strong>3단계</strong>: ① 중국 비중 80% 가드레일 — 베트남 +7.7%(2025) 모멘텀을 활용해 20% → 25% 확대, 대신 단가 +4.8% 인상은 외식 채널에 직접 전가($/kg 메뉴가 인상 트리거). ② <strong>활·신선·냉장 29.8% 라인은 산낙지 외식업 전속</strong> — HMR 라인과 가격 분리, 단가 변동을 마진율 보호 도구로 전환. ③ 양식 미개발·국내 절벽은 단기 헤지 불가 — 분기 KMI 발표일 +5영업일 내 자원관리기본계획 2026~2030 TAC 신규 편입 모니터링 + KOSIS 어업생산동향(월별) 자동 알람.</p>
</div>`,
        source: 'KMI 한국해양수산개발원 — FTA 체결국 수산물 수입동향 2021 Q4~2026 Q1 (21개 분기 원본 PDF, agri_data/공통(General)/kmi_fta_quarterly/)',
      }}
    />
  );
}
