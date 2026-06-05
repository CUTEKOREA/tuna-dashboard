'use client';
import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area, Cell,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { ChartPatternDefs } from './ChartPatterns';
import domestic from '../data/octopus_domestic_resource.json';
import global from '../data/octopus_global_catch.json';

const tooltipStyle = {
  background: 'rgba(0,15,30,0.95)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function OctopusDomesticCliff() {
  const yearly = global.yearly as Array<any>;
  const koreaSeries = yearly.map((d) => ({ year: d.year, korea: Math.round(d.korea) }));

  const productionSeries = [
    { period: '24년 1~11월', kt: 5.4, label: '기준점' },
    { period: '25년 1~11월', kt: 3.7, label: '−30.9% 절벽' },
  ];

  const globalShare2022 = [
    { country: '중국', value: 109971 },
    { country: '모로코', value: 52453 },
    { country: '모리타니', value: 32896 },
    { country: '일본', value: 22200 },
    { country: '한국', value: 16069 },
    { country: '멕시코', value: 13220 },
    { country: '스페인', value: 6425 },
  ];

  const KoreaCatchChart = (
    <div style={{ height: '220px', width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <AreaChart data={koreaSeries} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <ChartPatternDefs />
          <defs>
            <linearGradient id="koreaCatchGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: '#8b5cf6', fontSize: 10 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [`${Number(val).toLocaleString()} 톤`, '한국 어획']} />
          <Area type="monotone" dataKey="korea" name="한국 어획" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#koreaCatchGradient)" />
        </AreaChart>
      </SafeResponsiveContainer>
    </div>
  );

  const CliffChart = (
    <div style={{ height: '180px', width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={productionSeries} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="period" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${v}천톤`} tick={{ fill: '#ef4444', fontSize: 10 }} domain={[0, 7]} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [`${val}천 톤`, '국내 생산']} />
          <Bar dataKey="kt" name="국내 생산">
            {productionSeries.map((d, i) => (
              <Cell key={i} fill={i === 0 ? '#a78bfa' : '#ef4444'} opacity={0.85} />
            ))}
          </Bar>
        </ComposedChart>
      </SafeResponsiveContainer>
    </div>
  );

  const GlobalShareChart = (
    <div style={{ height: '200px', width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={globalShare2022} layout="vertical" margin={{ top: 8, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <YAxis type="category" dataKey="country" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} width={50} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [`${Number(val).toLocaleString()} 톤`, '2022 어획']} />
          <Bar dataKey="value" name="2022 어획" radius={[0, 4, 4, 0]}>
            {globalShare2022.map((d, i) => (
              <Cell key={i} fill={d.country === '한국' ? '#ef4444' : '#6366f1'} opacity={d.country === '한국' ? 0.95 : 0.7} />
            ))}
          </Bar>
        </ComposedChart>
      </SafeResponsiveContainer>
    </div>
  );

  const policy = domestic.policyTimeline as Array<{ year: string; event: string; source: string }>;

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
        <div style={PanelTitle}>📉 한국 낙지 어획 장기 추세 (FishStat 2010~2022)</div>
        <div style={PanelDesc}>2010 20.8천 톤 → 2022 16.1천 톤(−22.6%). 13년간 완만한 하향, 2022년 추가 급락 — 자원 회복 신호 없음.</div>
        {KoreaCatchChart}
      </div>

      <div style={PanelStyle}>
        <div style={PanelTitle}>⚠️ 2025년 1~11월 절벽: −30.9%</div>
        <div style={PanelDesc}>24년 5.4천 톤 → 25년 3.7천 톤. KMI 25Q4 공식 발표. 베트남산 냉동 수입(+7.7%)으로 즉시 대체.</div>
        {CliffChart}
      </div>

      <div style={PanelStyle}>
        <div style={PanelTitle}>🌍 글로벌 어획 헤게모니 2022 (FishStat OCT)</div>
        <div style={PanelDesc}>중국 110천 톤(31%) · 모로코 52천 톤 · 모리타니 33천 톤 · 일본 22천 톤 · <strong>한국 16천 톤(5위)</strong>. 양식 사실상 미개발(FishStat 양식 156행).</div>
        {GlobalShareChart}
      </div>

      <div style={PanelStyle}>
        <div style={PanelTitle}>📜 자원관리 정책 타임라인 (2015~2030)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          {policy.map((p, i) => (
            <div key={i} style={{
              padding: '8px 10px',
              borderLeft: `3px solid ${p.year === '2025' ? '#ef4444' : p.year === '2026' ? '#10b981' : '#6366f1'}`,
              background: 'rgba(99, 102, 241, 0.05)',
              borderRadius: '4px',
              fontSize: '0.75rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontWeight: 700, color: p.year === '2025' ? '#ef4444' : p.year === '2026' ? '#10b981' : '#a78bfa' }}>{p.year}</span>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>{p.source}</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>{p.event}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          ...PanelStyle,
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(139, 92, 246, 0.10))',
          borderColor: 'rgba(239, 68, 68, 0.25)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
        }}
      >
        {[
          { label: '국내 생산 절벽', value: '−30.9%', sub: '24년→25년 1~11월', color: '#ef4444' },
          { label: '글로벌 순위', value: '5위', sub: '16.1천 톤 (2022)', color: '#fb923c' },
          { label: '13년 어획 감소', value: '−22.6%', sub: '2010→2022', color: '#a78bfa' },
          { label: 'TAC 직접 대상', value: '미지정', sub: '모니터링 17종에 포함', color: '#6366f1' },
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
      title="국내 낙지 자원 절벽 · 글로벌 헤게모니 · 자원관리 정책"
      icon={AlertTriangle}
      iconColor="#ef4444"
      pillar="S1"
      cardDesc="FAO FishStat 글로벌 어획(2010~2022) + 해수부 제4차 수산자원관리기본계획(2026~2030) + 2023 시행계획 + KMI FTA 25Q4 국내 생산. 한국 낙지가 양식 미개발 상태에서 13년 −22.6% 어획 감소를 지속하다 2025년 1~11월 −30.9% 절벽으로 진입한 자원 위기와 정책 대응 시계열."
      telemetry={{ status: 'STATIC', syncDate: '2026-05' }}
      customBody={Body}
      takeaway={{
        situation: `<div>
<p>"양식 미개발 자원(Wild-Only Stock)"이란 양식 기술이 산업화되지 않아 100% 자연산 어획에 의존하는 자원 카테고리. 낙지(Octopus minor)는 FAO FishStat 양식 보고가 156행에 불과 — 사실상 양식 미개발. 자연산 자원 감소가 곧 공급 감소로 직결되는 가장 취약한 카테고리.</p>
<p>실측: <strong>한국 낙지 어획 2010년 20.8천 톤 → 2022년 16.1천 톤(−22.6%) 13년 완만한 하향 후, 2025년 1~11월 5.4→3.7천 톤(−30.9%) 절벽 진입</strong>. 글로벌로는 중국 110천 톤(31%)·모로코 52천 톤·모리타니 33천 톤·일본 22천 톤에 이어 <strong>한국 16천 톤(5위)</strong>이지만 양식 buffer 없음.</p>
<p>정책 시그널: <strong>TAC 직접 대상에 미지정</strong>, 자원회복 모니터링 17종 + 산란·서식장 조성사업 16종 대상으로만 관리. 2026~2030 제4차 기본계획에서도 낙지는 TAC 신규 편입 명시 없음 — 자원관리 직접 수단 부재. 지자체 분권형 금어기·금지체장 관리로 일자별 보호 강도가 지자체별로 상이.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 낙지 국내 자원 위기는 R&D 투자가 아닌 <strong>"양식 미개발·TAC 미지정·지자체 분권 분산이라는 3중 정책 공백에서, 산란·서식장 조성사업 성과(CPUE +64.7%)를 사업별로 추적해 회복 변곡점을 선점하는 인텔리전스 게임"</strong>.</p>
<p><strong>3단계</strong>: ① 산란·서식장 23개소(2025~2026 누적) 사업별 CPUE 데이터를 분기 모니터링 — 성과 검증된 해역의 신규 조성 확대 정책 변화 시점 포착. ② <strong>중국·일본 두족류 양식 R&D 동향(Nueva Pescanova 스페인·일본 와카야마)</strong> 분기 추적 — 상업화 임계점 도달 시 한국 사료·종묘 시장 진입 기회 락인. ③ KOSIS 어업생산동향(월별) + 해수부 보도자료 자동 알람 + 분기 KMI 발표일 +5영업일 내 자원관리 위원회 안건화. 26년 +4.8% 단가 인상이 27년 +10%+ 가속될 가능성을 단가 헤지 instrument로 즉시 반영.</p>
</div>`,
        source: '해수부 제4차 수산자원관리기본계획(2026~2030) + 2023 시행계획 + KMI FTA 25Q4 + FAO FishStat Capture Production 2010~2022',
      }}
    />
  );
}
