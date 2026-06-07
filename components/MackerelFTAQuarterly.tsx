'use client';
import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Cell,
} from 'recharts';
import { Ship } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import raw from '../data/mackerel_fta_quarterly.json';

const tooltipStyle = {
  background: 'rgba(0,15,30,0.95)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function MackerelFTAQuarterly() {
  const yearly = raw.yearly as Array<{ year: string; volume: number; value: number; note: string }>;
  const qSeries = raw.quarter2025 as Array<{ q: string; qVolume: number; cumValue: number }>;
  const origin = raw.originShift as Array<{ country: string; v2025Q1: number; v2026Q1: number; delta: number; share2026: number }>;
  const norwayPrice = raw.norwayUnitPrice as Array<{ period: string; usdPerKg: number }>;

  const YearlyChart = (
    <div style={{ height: '260px', width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={yearly} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${v}천톤`} tick={{ fill: '#38bdf8', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}M`} tick={{ fill: '#f59e0b', fontSize: 10 }} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(val: any, name: any) => {
              if (name === '수입량') return [`${val}천 톤`, name];
              if (name === '수입액') return [`$${val}M`, name];
              return [val, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar yAxisId="left" dataKey="volume" name="수입량" fill="#38bdf8" opacity={0.75} radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="value" name="수입액" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
        </ComposedChart>
      </SafeResponsiveContainer>
    </div>
  );

  const QuarterChart = (
    <div style={{ height: '220px', width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={qSeries} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="q" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${v}천톤`} tick={{ fill: '#38bdf8', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}M`} tick={{ fill: '#a78bfa', fontSize: 10 }} />
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
              <Cell key={i} fill={d.q === '26Q1' ? '#ef4444' : '#38bdf8'} opacity={d.q === '26Q1' ? 0.9 : 0.7} />
            ))}
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="cumValue" name="누적 수입액" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </SafeResponsiveContainer>
    </div>
  );

  const OriginChart = (
    <div style={{ height: '200px', width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={origin} layout="vertical" margin={{ top: 8, right: 30, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="country" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} width={60} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(val: any, name: any) => {
              if (name === '전년 동기 대비 증감') return [`${val > 0 ? '+' : ''}${val}%`, name];
              return [val, name];
            }}
          />
          <Bar dataKey="delta" name="전년 동기 대비 증감" radius={[0, 4, 4, 0]}>
            {origin.map((d, i) => (
              <Cell key={i} fill={d.delta > 0 ? '#10b981' : '#ef4444'} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </SafeResponsiveContainer>
    </div>
  );

  const NorwayPriceChart = (
    <div style={{ height: '180px', width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={norwayPrice} margin={{ top: 12, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="period" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}`} tick={{ fill: '#fb923c', fontSize: 10 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [`$${val}/kg`, '냉동 단가']} />
          <Line type="monotone" dataKey="usdPerKg" name="냉동 단가" stroke="#fb923c" strokeWidth={3} dot={{ r: 5, fill: '#fb923c' }} />
        </ComposedChart>
      </SafeResponsiveContainer>
    </div>
  );

  const PanelStyle: React.CSSProperties = {
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    padding: '12px 14px',
  };
  const PanelTitle: React.CSSProperties = {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#7dd3fc',
    letterSpacing: '0.04em',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };
  const PanelDesc: React.CSSProperties = {
    fontSize: '0.72rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '4px',
    lineHeight: 1.45,
  };

  const Body = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={PanelStyle}>
        <div style={PanelTitle}>📊 연도별 對FTA 고등어 수입 추이 (2020~2025)</div>
        <div style={PanelDesc}>2025년 사상 최고치 — 61.7천 톤 / $201M (전년 대비 +37.4%/+63.6%). 노르웨이 대량 매집 사이클.</div>
        {YearlyChart}
      </div>

      <div style={PanelStyle}>
        <div style={PanelTitle}>🌊 분기별 흐름과 2026 Q1 절벽</div>
        <div style={PanelDesc}>2025년 매 분기 증가세 → 2026 Q1 10.1천 톤(전년 동기 대비 −52.7%)으로 급락. 노르웨이 어획 쿼터 삭감이 직접 원인.</div>
        {QuarterChart}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={PanelStyle}>
          <div style={PanelTitle}>🇬🇧 원산지 이동: 영국산 부상</div>
          <div style={PanelDesc}>노르웨이 −62.9% / 중국 −42.7% / 영국 +216.1%. 가치 비중 노르웨이 73.9%·영국 12.1%·중국 8.0%.</div>
          {OriginChart}
        </div>
        <div style={PanelStyle}>
          <div style={PanelTitle}>💵 노르웨이 냉동 고등어 단가</div>
          <div style={PanelDesc}>2025 Q1 $2.7/kg → 2026 Q1 $4.9/kg, +81.5%. 어획 쿼터 삭감 → cost-push 충격.</div>
          {NorwayPriceChart}
        </div>
      </div>

      <div
        style={{
          ...PanelStyle,
          background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.18), rgba(59, 130, 246, 0.10))',
          borderColor: 'rgba(56, 189, 248, 0.25)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
        }}
      >
        {[
          { label: '2025년 수입 (사상 최고)', value: '61.7천 톤', sub: '$201.1M, +37.4% YoY', color: '#38bdf8' },
          { label: '2026 Q1 수입 (절벽)', value: '10.1천 톤', sub: '$45.6M, −52.7% YoY', color: '#ef4444' },
          { label: '노르웨이 단가 충격', value: '+81.5%', sub: '$2.7→$4.9/kg', color: '#fb923c' },
          { label: '국내 1~2월 생산 회복', value: '+49.7%', sub: '31.8→47.6천 톤', color: '#10b981' },
        ].map((k, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${k.color}`, paddingLeft: '10px' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', marginBottom: '2px' }}>{k.label}</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: k.color, lineHeight: 1.2 }}>{k.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{k.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="FTA 고등어 분기별 수입 동향 (KMI 21개 분기)"
      icon={Ship}
      iconColor="#38bdf8"
      pillar="S3"
      cardDesc="KMI(한국해양수산개발원) FTA 체결국 수산물 수입동향 보고서 2021 Q4~2026 Q1 원문 PDF 21건에서 추출한 고등어 분기별 수입 시계열. 2025년 사상 최고치 직후 2026 Q1 쿼터 절벽이 노르웨이 단가 +78%와 영국산 +216% 대체 부상으로 동시에 나타난 구조 전환점."
      telemetry={{ status: 'STATIC', syncDate: 'KMI FTA 수입동향 보고서 21건 수동 추출 (2021 Q4~2026 Q1)' }}
      customBody={Body}
      takeaway={{
        situation: `<div>
<p>"쿼터 절벽(Quota Cliff)"이란 어획국이 자원 보호를 위해 연도별 어획쿼터를 급감 조정할 때 발생하는 공급 차단 충격. 북동대서양 고등어는 노르웨이·EU·영국·러시아 간 쿼터 분쟁 누적 + ICES 자원평가 하향이 동시 작동.</p>
<p>실측: <strong>2025년 對FTA 고등어 수입 61.7천 톤·$201M으로 사상 최고치 달성 후, 2026 Q1만에 −52.7% 절벽. 노르웨이 냉동 단가 $2.7→$4.9/kg(+81.5%)·노르웨이 가치 비중 73.9%·냉동 비중 97.7%</strong>로 한 국가·한 형태에 집중된 구조가 그대로 충격으로 노출.</p>
<p>구조 변화 시그널: <strong>영국산 +216.1%</strong> 급증이 노르웨이 대체 통로로 부상. 국내 1~2월 생산도 +49.7% 회복 — 수입 의존 완화 동시 진행.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 쿼터 절벽은 외부 충격이 아니라 <strong>"73.9% 단일국 의존을 정상 운영했던 조달 정책의 후행 청구서"</strong>. 다변화는 옵션이 아니라 마진 방어 의무.</p>
<p><strong>3단계</strong>: ① 노르웨이 비중 75% 이하 가드레일 설정 — 영국·아일랜드(북동대서양 다른 쿼터국) 직거래 라인 즉시 개설. ② 2026 Q1 단가 $4.9/kg 락인된 노르웨이 장기계약 재협상 + 국내산 1~2월 회복분(+49.7%)을 활용한 도매가 협상력 회수. ③ 분기별 KMI FTA 동향 데이터를 사내 S&OP 사이클에 정식 입력 — 분기 발표일 +5영업일 내 조달 위원회 의사결정 트리거화.</p>
</div>`,
        source: 'KMI 한국해양수산개발원 — FTA 체결국 수산물 수입동향 2021 Q4~2026 Q1 (21개 분기 원본 PDF, agri_data/공통(General)/kmi_fta_quarterly/)',
      }}
    />
  );
}
