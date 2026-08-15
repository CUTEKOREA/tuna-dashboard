'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

/* ── 동원산업 '슈퍼튜나(Super Tuna)' — 선망 어획의 횟감 업그레이드 ──
   검증(아시아경제 2018 단독·특허 10-1800430): 선망 가다랑어·황다랑어를 -45~-55℃ 초저온 급속동결로
   횟감급 전환 → 통조림용 대비 부가가치 3배·이익률 +30%, 동결 4배 단축, 빙결정 최소화로 원어 육질 복원.
   ※개념·특허 출원 2017~2018 기준(STATIC). 동원F&B 'BTS 진 슈퍼튜나포유' 마케팅과는 별개. */
const VALUE = [
  { use: '선망 통조림용', idx: 100, color: '#64748b' },
  { use: '슈퍼튜나(횟감급)', idx: 300, color: '#38bdf8' },
];
const TECH = [
  { label: '초저온 급속동결', value: '-45~-55℃', sub: '빙결점 통과 전 급속동결' },
  { label: '동결 시간 단축', value: '4배+', sub: '염수 수냉→공냉 전환' },
  { label: '통조림 대비 이익률', value: '+30%', sub: '부가가치 3배' },
];

export default function SasKrSuperTuna() {
  return (
    <WidgetCard
      id="W-SAS63"
      title="동원산업 '슈퍼튜나' — 선망 어획 횟감 업그레이드"
      description="선망 가다랑어를 초저온 동결(ULT)로 횟감급 전환 — 부가가치 3배·마진 +30%"
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2018-01-30' }}
      cardDesc="동원산업 슈퍼튜나 초저온 동결 기술·수익성 — 아시아경제 2018 단독·국내특허 10-1800430(2017~2018 기준, 이후 갱신 미반영)"
      takeaway={{
        situation: "참치 어업은 전통적으로 이원 구조였습니다 — 선망(purse seine)은 가다랑어·황다랑어를 대량 어획해 저마진 통조림용으로, 연승(longline)은 참다랑어·눈다랑어를 초저온 동결해 고마진 횟감용으로 갈렸습니다. 동원산업의 '슈퍼튜나'(김재철 회장 주도, 세계 최초)는 이 장벽을 깬 개념으로, 선망 어획분에 연승급 초저온 동결 기술(-45~-55℃ 급속동결, 빙결점 통과 전 급속 처리로 빙결정 최소화)을 적용해 해동 시 혈점 없이 원어 육질이 복원되는 횟감급으로 업그레이드합니다. 동결 시간을 4배 이상 단축하며(특허 10-1800430), 통조림용 대비 부가가치 3배·이익률 30%+ 향상이 핵심입니다.",
        actionPlan: "슈퍼튜나는 한국 원양 선단의 '볼륨→밸류업' 전략 템플릿입니다. ① 대량 선망 어획(가다랑어)의 일부를 초저온 동결(ULT) 횟감급으로 전환하면 같은 어획량에서 마진을 30%+ 끌어올릴 수 있으므로, 선단의 -45~-60℃ 초저온 동결 설비투자(capex)를 '비용'이 아닌 '마진 레버'로 평가하십시오. ② 통조림 저마진 경쟁(태국 등)을 회피하고 사시미급 프리미엄으로 이동하는 구조 전환의 실증 사례이므로, 신규 선망선 건조·동결설비 투자 시 슈퍼튜나 비중 확대를 밸류업 테제로 삼으십시오. ③ 해외(대만·필리핀·태국) 특허로 기술 해자를 구축한 점은 인수합병(M&A)·라이선스 가치로도 환산됩니다.",
        source: "아시아경제 2018-01-30 단독 '세계 최초 슈퍼 튜나 생산' / 국내특허 10-1800430(초저온 냉동 참치 생산방법) / 동원산업 사업소개. ※개념·특허 2017~2018 기준",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: 'var(--w-slate-400)', fontWeight: 600, textAlign: 'center' }}>선망 어획 부가가치 지수 (통조림용=100)</div>
          <div style={{ height: '150px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={VALUE} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="use" fontSize={10} tickLine={false} axisLine={false} stroke="var(--w-slate-500)" interval={0} />
                <YAxis domain={[0, 330]} tickFormatter={(v: unknown) => `${v}`} fontSize={10} tickLine={false} axisLine={false} stroke="var(--w-slate-500)" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--w-navy-900)', color: 'var(--w-slate-200)' }} formatter={(v: unknown) => [`지수 ${v}`, '부가가치']} />
                <Bar dataKey="idx" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                  {VALUE.map((d) => <Cell key={d.use} fill={d.color} />)}
                  <LabelList dataKey="idx" position="top" formatter={(v: unknown) => v === 300 ? '300 (3배)' : `${v}`} fontSize={10.5} fill="var(--w-slate-200)" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {TECH.map((t) => (
              <div key={t.label} style={{ background: 'rgba(var(--w-sky-400-rgb), 0.08)', border: '1px solid rgba(var(--w-sky-400-rgb), 0.2)', borderRadius: '8px', padding: '8px 9px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.56rem', color: 'var(--w-slate-400)' }}>{t.label}</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--w-sky-400)' }}>{t.value}</span>
                <span style={{ fontSize: '0.52rem', color: 'var(--w-slate-500)' }}>{t.sub}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.6rem', color: 'var(--w-slate-500)', lineHeight: 1.5, textAlign: 'center' }}>
            동원산업 기술·사업 개념(2017~2018 특허) — 동원F&B 'BTS 진 슈퍼튜나포유' 마케팅과는 별개
          </div>
        </div>
      }
    />
  );
}
