/**
 * Upcycling 2개 위젯 — ADR-0005 WidgetCard 마이그레이션 (2026-05-21)
 * Before 159줄 → After 100줄 (-37%)
 */

'use client';
import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Recycle, TestTube } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs } from './ChartPatterns';

const BYPRODUCT_DATA = [
  { name: '머리/뼈', value: 35, color: '#06b6d4' },
  { name: '내장', value: 20, color: '#f59e0b' },
  { name: '피/혈합육', value: 15, color: '#ef4444' },
  { name: '껍질', value: 10, color: '#a78bfa' },
  { name: '기타(지느러미 등)', value: 20, color: '#22c55e' },
];

const UPCYCLE_PRODUCTS = [
  { product: 'DHA/EPA 오메가3', rawMaterial: '내장유', marketSize: 48.2, margin: 65, status: '상용화' },
  { product: '해양 콜라겐 펩타이드', rawMaterial: '피부/비늘', marketSize: 12.8, margin: 72, status: '상용화' },
  { product: '참치 뼈 칼슘제', rawMaterial: '뼈/골분', marketSize: 5.4, margin: 45, status: '성장' },
  { product: '참치 단백질 가수분해물', rawMaterial: '혈합육', marketSize: 3.2, margin: 58, status: 'R&D' },
  { product: '바이오 비료/사료', rawMaterial: '잔사', marketSize: 8.7, margin: 25, status: '상용화' },
  { product: '기능성 펩타이드 (항산화)', rawMaterial: '내장', marketSize: 2.1, margin: 80, status: 'R&D' },
];

export function TunaUpcyclingOpportunity() {
  return (
    <WidgetCard
      title="참치 부산물 업사이클링 기회 분석"
      icon={Recycle}
      iconColor="#22c55e"
      pillar="S5"
      cardDesc="참치 가공 부산물 구성비(머리·내장·혈합육·껍질·기타) + 6대 업사이클 제품 파이프라인 (상용화·성장·R&D)"
      unit="(단위: % / USD Billion)"
      telemetry={{ status: 'STATIC', syncDate: '2025-11 기준' }}
      customBody={
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ height: 280 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--w-slate-400)', marginBottom: 4, textAlign: 'center' }}>부산물 구성비 (가공 후)</div>
            <PieChart width={350} height={260}>
              <Pie data={BYPRODUCT_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1 }}
                isAnimationActive={false}
              >
                {BYPRODUCT_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.75rem' }} />
            </PieChart>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--w-slate-400)', marginBottom: 2 }}>업사이클 제품 파이프라인</div>
            {UPCYCLE_PRODUCTS.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(140,170,255,0.12)', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--w-slate-50)', fontWeight: 600, flex: 1 }}>{p.product}</span>
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, background: p.status === '상용화' ? 'rgba(34,197,94,0.15)' : p.status === '성장' ? 'rgba(var(--w-amber-500-rgb), 0.15)' : 'rgba(168,85,247,0.15)', color: p.status === '상용화' ? '#22c55e' : p.status === '성장' ? 'var(--w-amber-500)' : '#a855f7' }}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      }
      takeaway={{
        situation: `<div>
<p>참치 가공 시 총 중량의 <strong>40~55%가 부산물</strong>: 머리(35%)·내장(20%)·혈합육(15%)·껍질(10%). 한국 다랑어 어획량 29만 톤(MOF 2024) 기준 <strong>연 11.6~16만 톤 부산물</strong> 발생. 톤당 처리비 $50~80 들이며 폐기.</p>
<p>그런데 글로벌 EPA/DHA·해양 콜라겐 시장이 모두 두 자릿수 CAGR 성장. 동일 부산물이 폐기물(-$80/톤)에서 <strong>고부가 원료($4,000~12,000/톤)</strong>로 전환 가능 — 50~150배 밸류업.</p>
<p>의미: 한국 참치 가공 부산물은 업계 추정 기준 <strong>수억 달러 규모의 미회수 자원</strong>. 선점 설비 구축 시 5년 내 매출 증가 및 고마진 사업부 신설 가능성 존재(자체 추정, 정밀 검토 요).</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 부산물은 폐기물이 아닌 <strong>"미회수 원료 플랫폼 자산"</strong>. 비용 부서를 수익 부서로 전환.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>1단계 (즉시)</strong>: DHA/EPA(마진율 65%) + 해양 콜라겐 펩타이드(마진율 72%) 라인 증설 — <strong>연 매출 ₩50억+</strong>, 회수 18개월.</li>
<li style="margin-bottom: 8px;"><strong>2단계 (3년)</strong>: KFAS/NIFS 공동 R&amp;D로 <strong>ACE 억제 기능성 펩타이드(추정 마진율 80%)</strong> 상용화 + 특허 출원 및 글로벌 건강기능식품 시장 진입.</li>
<li><strong>3단계 (5~10년)</strong>: <strong>해양 바이오 원료 플랫폼</strong>으로 진화. Givaudan·Symrise·DSM 등 글로벌 기업 라이선싱 협상 + 기업가치 재평가 기회 확보.</li>
</ol>
</div>`,
        source: '(기본 2025-11) 수산물 업사이클링 생태계 조성 방안 연구 · MOF 2024 어업생산통계 (시장 규모는 추정·재확인 대상)',
      }}
    />
  );
}

export function TunaUpcyclingMarginMap() {
  const marginData = UPCYCLE_PRODUCTS.map((p) => ({
    name: p.product.length > 6 ? p.product.substring(0, 6) + '…' : p.product,
    fullName: p.product, margin: p.margin, market: p.marketSize, status: p.status,
  }));

  return (
    <WidgetCard
      title="바이오 업사이클 마진 매트릭스"
      icon={TestTube}
      iconColor="#a78bfa"
      pillar="S5"
      cardDesc="6대 업사이클 제품의 마진율(%) vs 시장규모($B) 매트릭스 — 마진과 시장 규모의 역상관 패턴 시각화"
      unit="(단위: 마진율 % / 시장규모 $B)"
      telemetry={{ status: 'STATIC', syncDate: '2025-11 기준' }}
      chartHeight={280}
      chart={
        <BarChart data={marginData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'var(--w-slate-300)', fontSize: 10, fontWeight: 500 }} stroke="var(--w-slate-500)" height={55} />
          <YAxis tick={{ fill: 'var(--w-slate-300)', fontSize: 10 }} stroke="var(--w-slate-500)" />
          <Tooltip
            contentStyle={{ background: 'rgba(20, 28, 52, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            itemStyle={{ color: 'var(--w-slate-200)', fontWeight: 500, fontSize: '13px' }}
            labelStyle={{ color: 'var(--w-slate-300)', fontWeight: 'bold', marginBottom: '8px' }}
            formatter={(value: any, name: any) => [typeof value === 'number' ? value.toFixed(1) : value, String(name)]}
            labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.fullName || String(label)}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="margin" fill="#a78bfa" name="마진율(%)" radius={[4, 4, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
          <Bar dataKey="market" fill="var(--w-cyan-500)" name="시장규모($B)" radius={[4, 4, 0, 0]} fillOpacity={0.85} isAnimationActive={false} />
        </BarChart>
      }
      takeaway={{
        situation: `<div>
<p>"마진율 vs 시장 규모"의 역상관 패턴 — 부산물 업사이클 제품 포트폴리오의 핵심 상충관계. 마진이 높은 제품은 시장이 작고, 시장이 큰 제품은 마진이 낮은 역상관 구조.</p>
<p>추정 매트릭스: <strong>기능성 펩타이드(마진율 80%, 시장 $2.1B, R&amp;D)</strong> · <strong>해양 콜라겐(마진율 72%, 시장 $12.8B, 상용화)</strong> · DHA/EPA(마진율 65%, 시장 $48.2B, 상용화) · 칼슘제(마진율 45%, 시장 $5.4B, 성장) · 바이오사료(마진율 25%, 시장 $8.7B, 상용화). (시장 규모 및 마진율은 업계 추정치)</p>
<p>의미: 단일 제품 집중이 아닌 <strong>포트폴리오 접근</strong> 필수. 즉시 수익(상용화 제품) + 중기 성장(R&amp;D 제품) + 장기(차세대) 3단 동시 운영이 수익률 최대화.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 업사이클 포트폴리오는 단순 제품 라인업이 아닌 <strong>"마진-시장 최적화 매트릭스"</strong>. 본사 자본배분 위원회가 분기마다 3단 비중을 동적 재조정.</p>
<p><strong>3단 실행</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>즉시 수익 단계</strong>: 해양 콜라겐 펩타이드 라인 증설(마진율 72%, 상용화). 회수 12~18개월, 설비투자 $5~10M.</li>
<li style="margin-bottom: 8px;"><strong>중기 성장 단계</strong>: 칼슘제 양산화(마진율 45%, 성장기). 원료 자급 우위로 경쟁우위 확보.</li>
<li><strong>장기 고수익 단계</strong>: KFAS/NIFS 공동 R&amp;D로 <strong>기능성 펩타이드(ACE 억제, 추정 마진율 80%)</strong> 3년 파이프라인. 동시에 바이오사료(마진율 25%)는 대량 부산물 처리용 병행 운영 — 고부가·소량과 저마진·대량의 투트랙 결합.</li>
</ol>
</div>`,
        source: '(기본 2025-11) 업사이클링 생태계 연구 · 업계 추정 (시장 규모는 Grand View Research 2025 등 재확인 대상)',
      }}
    />
  );
}
