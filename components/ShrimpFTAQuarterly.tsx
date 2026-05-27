'use client';
import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Cell, ResponsiveContainer, PieChart, Pie,
} from 'recharts';
import { Ship } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';
import raw from '../data/shrimp_fta_quarterly.json';

const tooltipStyle = {
  background: 'rgba(0,15,30,0.95)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function ShrimpFTAQuarterly() {
  const yearly = raw.yearly as Array<{ year: string; volume: number; value: number }>;
  const qSeries = raw.quarter as Array<{ q: string; qVolume: number; cumValue: number }>;
  const origin2026 = raw.originShift2026Q1 as Array<{ country: string; delta: number; shareVal: number }>;
  const prices = raw.unitPrice as Array<{ period: string; vietnam: number; china: number; peru: number }>;
  const formMix = raw.formMix2026Q1 as Array<{ name: string; value: number; color: string }>;

  const YearlyChart = (
    <div style={{ height: '240px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={yearly} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${v}천톤`} tick={{ fill: '#10b981', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}M`} tick={{ fill: '#14b8a6', fontSize: 10 }} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(val: any, name: any) => {
              if (name === '수입량') return [`${val}천 톤`, name];
              if (name === '수입액') return [`$${val}M`, name];
              return [val, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar yAxisId="left" dataKey="volume" name="수입량" fill="#10b981" opacity={0.75} radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="value" name="수입액" stroke="#5eead4" strokeWidth={2.5} dot={{ r: 4 }} />
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
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${v}천톤`} tick={{ fill: '#10b981', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}M`} tick={{ fill: '#14b8a6', fontSize: 10 }} />
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
              <Cell key={i} fill={d.q === '26Q1' ? '#10b981' : (d.q === '25Q4' ? '#fb923c' : '#34d399')} opacity={0.85} />
            ))}
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="cumValue" name="누적 수입액" stroke="#5eead4" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const PriceMatrix = (
    <div style={{ height: '210px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={prices} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="period" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} domain={[6.5, 9]} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any, name: any) => [`$${val}/kg`, name]} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Line type="monotone" dataKey="vietnam" name="베트남" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="peru"    name="페루"   stroke="#fb923c" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="china"   name="중국"   stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} />
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
    fontSize: '0.78rem', fontWeight: 700, color: '#5eead4',
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
        <div style={PanelTitle}>📊 연도별 對FTA 새우 수입 (2020~2025)</div>
        <div style={PanelDesc}>2022 가치 정점 → 2023 베트남 단가 폭락(−14.8%) → 2024~2025 물량·가치 동반 회복. 2025년 96.1천 톤·$761M으로 사상 최고치 갱신.</div>
        {YearlyChart}
      </div>

      <div style={PanelStyle}>
        <div style={PanelTitle}>🌊 분기별 흐름과 26 Q1 +17.1% 가속</div>
        <div style={PanelDesc}>25 Q4 −1.9%로 일시 둔화 → 26 Q1 22.1천 톤(+17.1%) 재가속. 중국·페루 동시 +36~+64%가 견인.</div>
        {QuarterChart}
      </div>

      <div style={PanelStyle}>
        <div style={PanelTitle}>💵 국가별 냉동 새우 단가 시계열</div>
        <div style={PanelDesc}>베트남 25Q1 $8.7→26Q1 $8.5/kg(−2.4%), 페루 $7.5→$7.4(−2.4%), 중국 $7.2~$7.3 안정. 중국 단가가 베트남 대비 −14%로 가격경쟁력 견고.</div>
        {PriceMatrix}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={PanelStyle}>
          <div style={PanelTitle}>🇨🇳 26 Q1 원산지 이동: 중국·페루 동반 급증</div>
          <div style={PanelDesc}>중국 +36.6% · 페루 +63.7%(질병 회복) · 베트남 +2.8%. 가치 비중 베트남 40.0% / 중국 25.5% / 페루 9.2%.</div>
          {OriginBars}
        </div>
        <div style={PanelStyle}>
          <div style={PanelTitle}>❄️ 26 Q1 가공 형태 구성</div>
          <div style={PanelDesc}>냉동 73.7% / 조미가공 23.5% / 건조 2.4%. 조미가공 비중은 25년 24.7%→26 Q1 23.5%로 소폭 감소 — 냉동 원물 재집중.</div>
          {FormPie}
        </div>
      </div>

      <div
        style={{
          ...PanelStyle,
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(20, 184, 166, 0.10))',
          borderColor: 'rgba(16, 185, 129, 0.25)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
        }}
      >
        {[
          { label: '2025년 수입 (사상 최고)', value: '96.1천 톤', sub: '$761.1M, +5.0%/+10.6%', color: '#10b981' },
          { label: '26 Q1 수입 (재가속)', value: '22.1천 톤', sub: '$173.0M, +17.1% YoY', color: '#5eead4' },
          { label: '중국산 점유율 도약', value: '+47.2%', sub: '25년 21.5천톤 (가치 25.5%)', color: '#38bdf8' },
          { label: '페루산 V자 회복', value: '+63.7%', sub: '질병 반송 사이클 종료', color: '#fb923c' },
        ].map((k, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${k.color}`, paddingLeft: '10px' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', marginBottom: '2px' }}>{k.label}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: k.color, lineHeight: 1.2 }}>{k.value}</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{k.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="FTA 새우 분기별 수입 동향 (KMI 21개 분기)"
      icon={Ship}
      iconColor="#10b981"
      pillar="S3"
      cardDesc="KMI(한국해양수산개발원) FTA 체결국 수산물 수입동향 보고서 2021 Q4~2026 Q1 원문 PDF 21건에서 추출한 새우 분기별 시계열. 2025년 사상 최고치(96.1천 톤·$761M) 직후 26 Q1 +17.1% 재가속 — 베트남 점유율 점진 감소와 중국·페루 동시 부상의 구조 전환점."
      telemetry={{ status: 'SYNCED', syncDate: '2026-05' }}
      customBody={Body}
      takeaway={{
        situation: `<div>
<p>"소싱 멀티-호스트(Multi-Host Sourcing)"란 단일 국가 의존을 해체하고 단가·리드타임·질병 리스크 프로파일이 다른 복수 공급국을 동시 운영하는 조달 구조. 새우는 EMS(조기 사망 증후군) 등 양식 질병이 국가 단위로 동기화되지 않아 멀티-호스트가 P&L 변동성을 직접 낮춘다.</p>
<p>실측: <strong>2025년 對FTA 새우 수입은 96.1천 톤·$761.1M으로 전년 대비 +5.0%/+10.6% 사상 최고치 갱신, 26 Q1도 22.1천 톤·$173M(+17.1%/+16.5%)로 가속 지속</strong>. 동시에 <strong>중국산 25년 +47.2%·26Q1 +36.6%</strong>, <strong>페루산 26Q1 +63.7%</strong> 등 비-베트남 공급원이 동시 부상. 베트남 가치 비중은 44.4%→40.0%로 5분기 만에 −4.4%p 하락.</p>
<p>가격 시그널: <strong>중국 단가 $7.3/kg = 베트남 $8.5/kg 대비 −14%</strong>로 가격경쟁력 견고. 베트남 자체도 26 Q1 −2.4% 단가 하락 — 공급 과잉 신호. 동시에 <strong>국내 1~11월 생산 17.5→16.7천 톤(−4.6%)</strong>로 국내 buffer는 미미.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 새우 조달은 베트남 단일 의존을 단순히 줄이는 차원이 아닌 <strong>"중국(가격)·페루(회복기)·인도/에콰도르(질병 분산) 다중 호스트로 분기별 비중을 동적 재배분하는 운영 시스템"</strong>으로 전환.</p>
<p><strong>3단계</strong>: ① 베트남 가치 비중 40% 이하 가드레일 유지 — 중국 비중을 현재 25.5%→35%로 확대(단가 −14% 우위로 마진 +200bp 확보 가능). ② 페루 회복기(질병 사이클 종료) 활용 — 정기 계약 라인 즉시 복원, +63.7% 모멘텀을 26 H2까지 락인. ③ 분기 KMI 발표일 +5영업일 내 단가 트리거(베트남 $8.5/kg 하한, 중국 $7.5/kg 상한) 모니터링 자동화 + S&OP 회의 의무 안건화.</p>
</div>`,
        source: 'KMI 한국해양수산개발원 — FTA 체결국 수산물 수입동향 2021 Q4~2026 Q1 (21개 분기 원본 PDF, agri_data/공통(General)/kmi_fta_quarterly/)',
      }}
    />
  );
}
