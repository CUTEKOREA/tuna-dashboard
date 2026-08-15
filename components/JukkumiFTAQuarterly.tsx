'use client';
import React from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Cell, ResponsiveContainer, PieChart, Pie,
} from 'recharts';
import { Ship } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';
import { getFtaQuarterlyData } from '@/lib/data/fta-quarterly';

const tooltipStyle = {
  background: 'rgba(10, 16, 40, 0.95)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function JukkumiFTAQuarterly() {
  const raw = getFtaQuarterlyData('jukkumi');
  const yearly = raw.yearly as Array<{ year: string; volume: number; value: number; note: string }>;
  const qSeries = raw.quarter2025 as Array<{ q: string; qVolume: number; cumValue: number }>;
  const origin = raw.originShift as Array<{ country: string; v2025Q1: number; v2026Q1: number; delta: number; shareVal2026: number }>;
  const prices = raw.unitPrice as Array<{ period: string; vietnam: number; thailand: number; china: number }>;
  const formMix = raw.formMix2026Q1 as Array<{ name: string; value: number; color: string }>;

  // ── 관세청(KCS) HS 0307·1605 두족류 통합 — 2026.03-04 2개월 누적 ──
  const cu = (raw as any).customs as {
    byCountryValue: Array<{ country: string; share: number; valM: number; weightT: number; color: string }>;
    unitPriceByPartner: Array<{ country: string; usdkg: number }>;
    formMixWeight: Array<{ name: string; value: number; weightT: number; color: string }>;
    totalImportValueM: number; totalImportWeightT: number; overallCifPerKg: number;
  };
  const cuCountry = cu.byCountryValue;
  const cuPrice = cu.unitPriceByPartner;
  const cuForm = cu.formMixWeight;

  const YearlyChart = (
    <div style={{ height: '240px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={yearly} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${v}천톤`} tick={{ fill: 'var(--w-violet-500)', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}M`} tick={{ fill: 'var(--w-pink-500)', fontSize: 10 }} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(val: any, name: any) => {
              if (name === '수입량') return [`${val}천 톤`, name];
              if (name === '수입액') return [`$${val}M`, name];
              return [val, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar yAxisId="left" dataKey="volume" name="수입량" fill="var(--w-violet-500)" opacity={0.75} radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="value" name="수입액" stroke="var(--w-pink-500)" strokeWidth={2.5} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const QuarterChart = (
    <div style={{ height: '210px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={qSeries} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="q" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `${v}천톤`} tick={{ fill: 'var(--w-violet-500)', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}M`} tick={{ fill: '#a855f7', fontSize: 10 }} />
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
              <Cell key={i} fill={d.q === '26Q1' || d.q === '25Q4' ? 'var(--w-red-500)' : 'var(--w-violet-500)'} opacity={d.q === '26Q1' || d.q === '25Q4' ? 0.9 : 0.7} />
            ))}
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="cumValue" name="누적 수입액" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const PriceMatrix = (
    <div style={{ height: '210px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={prices} margin={{ top: 16, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="period" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(v) => `$${v}`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any, name: any) => [`$${val}/kg`, name]} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Line type="monotone" dataKey="thailand" name="태국" stroke="#fb923c" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="vietnam" name="베트남" stroke="var(--w-violet-500)" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="china" name="중국" stroke="var(--w-sky-400)" strokeWidth={2.5} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const OriginBars = (
    <div style={{ height: '180px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={origin} layout="vertical" margin={{ top: 8, right: 30, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="country" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} width={60} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [`${val > 0 ? '+' : ''}${val}%`, '전년 동기 대비']} />
          <Bar dataKey="delta" name="전년 동기 대비" radius={[0, 4, 4, 0]}>
            {origin.map((d, i) => (
              <Cell key={i} fill={d.delta > 0 ? 'var(--w-emerald-500)' : 'var(--w-red-500)'} opacity={0.85} />
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
            style={{ fontSize: '11px', fill: 'var(--w-slate-200)' }}>
            {formMix.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [`${val}%`, '비중']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const CustomsCountryPie = (
    <div style={{ height: '200px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={cuCountry} dataKey="share" nameKey="country" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={2}
            label={(p: any) => `${p.country} ${p.share}%`} labelLine={false}
            style={{ fontSize: '11px', fill: 'var(--w-slate-200)' }}>
            {cuCountry.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any, _n: any, p: any) => [`${val}% ($${p?.payload?.valM}M · ${p?.payload?.weightT}톤)`, p?.payload?.country]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const CustomsPriceBars = (
    <div style={{ height: '200px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={cuPrice} layout="vertical" margin={{ top: 8, right: 36, left: 24, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(v) => `$${v}`} domain={[0, 13]} />
          <YAxis type="category" dataKey="country" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} width={56} />
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [`$${val}/kg`, '평균 수입단가']} />
          <Bar dataKey="usdkg" name="평균 수입단가" radius={[0, 4, 4, 0]}>
            {cuPrice.map((d, i) => (
              <Cell key={i} fill={d.usdkg >= cu.overallCifPerKg ? '#fb7185' : 'var(--w-violet-500)'} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const CustomsFormPie = (
    <div style={{ height: '200px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={cuForm} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={2}
            label={({ name, value }) => `${name} ${value}%`} labelLine={false}
            style={{ fontSize: '11px', fill: 'var(--w-slate-200)' }}>
            {cuForm.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(val: any, _n: any, p: any) => [`${val}% (${p?.payload?.weightT}톤)`, p?.payload?.name]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  const PanelStyle: React.CSSProperties = {
    background: 'rgba(20, 28, 52, 0.4)',
    border: '1px solid rgba(140,170,255,0.12)',
    borderRadius: '10px',
    padding: '12px 14px',
  };
  const PanelTitle: React.CSSProperties = {
    fontSize: '0.78rem', fontWeight: 700, color: '#d946ef',
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
        <div style={PanelTitle}>📊 연도별 對FTA 주꾸미 수입 (2020~2025)</div>
        <div style={PanelDesc}>2023년 저점(−7.7%) → 2024년 회복(+10.8%) → 2025년 정체(+0.7%). 30천 톤·$200M 구조에서 박스권 형성.</div>
        {YearlyChart}
      </div>

      <div style={PanelStyle}>
        <div style={PanelTitle}>🌊 분기별 흐름과 25 Q4·26 Q1 동반 둔화</div>
        <div style={PanelDesc}>25 Q4(전년 동기 −8.9%) → 26 Q1(전년 동기 −8.4%) 2분기 연속 감소. 베트남 단가 인상과 현지 조업 부진이 직접 원인.</div>
        {QuarterChart}
      </div>

      <div style={PanelStyle}>
        <div style={PanelTitle}>💵 국가별 냉동 주꾸미 단가 시계열</div>
        <div style={PanelDesc}>태국 +8.0% ($7.3→$7.8) / 베트남 +6.3% ($6.1→$6.5) / 중국 ±0%대. 베트남·태국 단가 동시 인상으로 76.9% 의존도 비용 부담 가중.</div>
        {PriceMatrix}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div style={PanelStyle}>
          <div style={PanelTitle}>🇨🇳 26 Q1 원산지 이동: 중국 +3.6% 부상</div>
          <div style={PanelDesc}>베트남 −7.1% / 태국 −23.6% / 중국 +3.6%. 단가 우위(중국 $4.6/kg)로 중국이 침체기에 점유율 +6.2%p 회수.</div>
          {OriginBars}
        </div>
        <div style={PanelStyle}>
          <div style={PanelTitle}>❄️ 26 Q1 가공 형태 구성</div>
          <div style={PanelDesc}>냉동 86.5% vs 활·신선·냉장 13.5%. 냉동 절단형(HMR 원료) 절대 우위 — 콜드체인 의존도 고착화.</div>
          {FormPie}
        </div>
      </div>

      <div
        style={{
          ...PanelStyle,
          borderColor: 'rgba(217, 70, 239, 0.18)',
          background: 'rgba(30, 18, 40, 0.45)',
        }}
      >
        <div style={PanelTitle}>🛃 관세청 실측 보조 — 두족류 통합(HS 0307·1605) · 2026.03-04 2개월 누적</div>
        <div style={PanelDesc}>
          KMI 주꾸미 시계열(상단)은 종(種) 특정 통계이고, 아래는 관세청 원자료를 그대로 집계한 보조 패널이다.
          HS6 030751·030752·030759·160555에는 <strong>주꾸미·낙지·문어가 함께 묶여 종 분리가 불가</strong>하므로
          상단 KMI 점유율(베트남 76.9%)과 직접 비교는 불가하고, 두족류 전체 조달 구조의 보조 지표로만 읽는다.
          2개월 누적이라 절대값(수입액 $90.2M·물량 11,403톤)보다 <strong>점유율·단가·형태 비중</strong>이 유효하다.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '6px' }}>
          <div>
            <div style={{ ...PanelTitle, fontSize: '0.72rem', color: '#a855f7' }}>🌏 한국 수입 국가별 점유율 (수입액 기준)</div>
            <div style={PanelDesc}>중국 55.3% · 베트남 28.0%로 두족류 통합 기준 중국이 최대 공급국. 베트남 단일 의존이 두드러진 주꾸미(KMI)와 달리 낙지·문어 포함 시 중국 비중이 크게 상승.</div>
            {CustomsCountryPie}
          </div>
          <div>
            <div style={{ ...PanelTitle, fontSize: '0.72rem', color: '#a855f7' }}>💵 산지별 평균 수입단가 ($/kg)</div>
            <div style={PanelDesc}>전체 평균 $7.91/kg. 모리타니 $11.50 · 필리핀 $10.55(원양 자숙·활문어 프리미엄) vs 베트남 $6.97(최저, 냉동 절단 비중↑). 분홍 막대는 평균 초과 산지.</div>
            {CustomsPriceBars}
          </div>
        </div>
        <div style={{ marginTop: '12px' }}>
          <div style={{ ...PanelTitle, fontSize: '0.72rem', color: '#a855f7' }}>❄️ 형태 믹스 (물량 비중)</div>
          <div style={PanelDesc}>냉동 70.9% · 활·신선·냉장 20.5% · 조제·저장 8.6%. 두족류 통합 기준으로도 냉동이 절대 우위이나, 활·신선 비중(20.5%)이 KMI 주꾸미 단독(13.5%)보다 높은 건 활낙지·활문어 외식 수요가 더해진 결과.</div>
          <div style={{ maxWidth: '420px', margin: '0 auto' }}>{CustomsFormPie}</div>
        </div>
      </div>

      <div
        style={{
          ...PanelStyle,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(217, 70, 239, 0.10))',
          borderColor: 'rgba(139, 92, 246, 0.25)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
        }}
      >
        {[
          { label: '2025년 수입 (정체)', value: '30.7천 톤', sub: '$196.1M, +0.7% YoY', color: '#8b5cf6' },
          { label: '26 Q1 수입 (감소)', value: '6.57천 톤', sub: '$42.8M, −8.4% YoY', color: '#ef4444' },
          { label: '국내 생산 절벽', value: '−24.7%', sub: '2.2→1.6천 톤 (1~11월)', color: '#fb923c' },
          { label: '단가 인상 (베트남)', value: '+6.3%', sub: '$6.1→$6.5/kg', color: '#10b981' },
        ].map((k, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${k.color}`, paddingLeft: '10px' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', marginBottom: '2px' }}>{k.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: k.color, lineHeight: 1.2 }}>{k.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{k.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="FTA 주꾸미 분기별 수입 동향 (KMI 21개 분기)"
      icon={Ship}
      iconColor="#8b5cf6"
      pillar="S3"
      cardDesc="KMI(한국해양수산개발원) FTA 체결국 수산물 수입동향 보고서 2021 Q4~2026 Q1 원문 PDF 21건에서 추출한 주꾸미 분기별 시계열 + 관세청(KCS) HS 0307·1605 두족류 통합 실측(2026.03-04 2개월 누적) 보조 패널. 2025년 정체기 이후 25 Q4·26 Q1 2분기 연속 감소 — 베트남·태국 단가 동시 인상과 중국산의 침체기 점유율 회수가 동시에 진행."
      telemetry={{ status: 'SYNCED', syncDate: '2026.03-04(2개월 누적)' }}
      customBody={Body}
      takeaway={{
        situation: `<div>
<p>"단가 인상 쇼크(Unit Price Push)"란 베트남·태국 현지 조업 부진이 원물 가격에 누적 반영되어 한국 도착가가 단계적으로 인상되는 구조. 두족류 단년생 자원 특성상 회복 탄력성이 낮아 1~2 분기 만에 회복되지 않는다.</p>
<p>실측: <strong>2025년 對FTA 주꾸미 수입은 30.7천 톤·$196.1M으로 전년 대비 +0.7%/+3.5% 정체</strong>. 그러나 25 Q4 −8.9% / 26 Q1 −8.4%로 2분기 연속 감소. <strong>베트남 단가 $6.1→$6.5/kg(+6.3%)·태국 단가 $7.3→$7.8/kg(+8.0%)</strong>이 누적 작동. 동시에 <strong>국내 생산 1~11월 2.2→1.6천 톤(−24.7%)</strong>으로 국내 대체 buffer도 소멸.</p>
<p>구조 변화 시그널: <strong>중국 +3.6%</strong> 침체기에 점유율 +6.2%p 회수 — 단가 우위($4.6/kg, 베트남 대비 −29%)로 가격 민감 채널 흡수. 수입 의존도 95%+ 구조에서 단가가 마진의 결정 변수.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 주꾸미 조달은 단가 헤지 옵션이 아닌 <strong>"베트남 단일 노출 76.9%·국내산 1.6천 톤 절벽이라는 이중 취약성을 다국·다형태로 분산하는 운영 의무"</strong>.</p>
<p><strong>3단계</strong>: ① 베트남 비중 75% 가드레일 설정 — 중국산 냉동 절단형(단가 우위) 비중 8.1%→15% 이상으로 의도적 확대. ② 태국 활·신선($7.8/kg, 13.5% 비중) 라인은 HMR이 아닌 프리미엄 채널(횟감·요리주점) 전속 배정 — 단가 전가율 90%+ 채널에만 유통. ③ 분기 KMI 발표일 +5영업일 내 단가 변동 임계치(베트남 $6.5/kg, 태국 $8.0/kg) 트리거 → S&OP 위원회 자동 호출.</p>
</div>`,
        source: 'KMI 한국해양수산개발원 — FTA 체결국 수산물 수입동향 2021 Q4~2026 Q1 (21개 분기 원본 PDF, agri_data/공통(General)/kmi_fta_quarterly/) · 보조 패널: 관세청(KCS) 수출입무역통계 HS 0307·1605 두족류 통합(주꾸미·낙지·문어, 종 분리 불가), 2026.03-04 2개월 누적 (agri_data/jukkumi/customs_kr)',
      }}
    />
  );
}
