'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

/* ── 미국 참치 수요 드라이버 + 계절성 ──
   검증(Track C 1차): NFI Top 10 — 캔참치 1인당 2.0lb/년(2023년 데이터·2024 발표,
   미국 소비 3위, 전년比 -0.20lb; 1위 새우 5.10·2위 연어 3.51lb; 2.2lb는 2019/2020 구값).
   IFIC 단백질 추구 67%→71%(2024). FMI 해산물 섭취 증가 응답 54%는 1차 미확인이라 제외.
   계절 인덱스는 정성(여름 그릴링·연말 스시 피크) — 가격밴드(블로그 추정)는 제외. */
const SEASON_INDEX = [
  { m: '1월', idx: 72 }, { m: '2월', idx: 70 }, { m: '3월', idx: 74 }, { m: '4월', idx: 80 },
  { m: '5월', idx: 90 }, { m: '6월', idx: 97 }, { m: '7월', idx: 100 }, { m: '8월', idx: 95 },
  { m: '9월', idx: 83 }, { m: '10월', idx: 78 }, { m: '11월', idx: 84 }, { m: '12월', idx: 93 },
];
const DRIVERS = [
  { label: '1인당 캔참치 소비', value: '2.0', unit: 'lb/년', sub: 'NFI 2023(2024 발표) · 전년比 -0.20 · 수산물 3위', color: '#38bdf8' },
  { label: '단백질 추구 소비자', value: '71', unit: '% (2024)', sub: 'IFIC 67%(2023)→71%(2024)', color: '#10b981' },
  { label: '단백질 추구 추이', value: '59→71', unit: '% (2022→2024)', sub: 'IFIC Food & Health Survey', color: '#f59e0b' },
];

export default function SasUsDemandSeasonality() {
  return (
    <WidgetCard
      id="W-SAS34"
      title="미국 참치 수요 드라이버 & 계절성"
      description="단백질 트렌드 + 그릴링·연말 수요 피크 (정성 인덱스)"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2026-06-05' }}
      cardDesc="수요 구조 — NFI 1인당 소비(2023년·2024 발표)·IFIC 단백질 트렌드(2024) + 계절 수요 정성 인덱스(자체 추정, 무출처)"
      takeaway={{
        situation: "미국 참치 수요는 구조적 단백질 전환이 견인합니다. 단백질을 적극 추구하는 소비자가 2022년 59%→2024년 71%로 늘었고(IFIC Food & Health Survey), 1인당 캔참치 소비는 2.0lb/년으로 미국 소비 수산물 3위입니다(NFI Top 10, 2023년 데이터·2024년 발표 — 1위 새우 5.10lb·2위 연어 3.51lb, 캔참치는 전년比 0.20lb 감소). 계절적으로는 여름 그릴링 시즌(6~8월)과 연말(12월) 스시·외식 수요가 피크를 이루는 패턴이며, 월별 수요 인덱스는 1차 출처가 없는 자체 정성 추정치(여름 고점·겨울 저점)로 정밀 수치가 아닌 방향성 참고용입니다.",
        actionPlan: "① 수요 피크(여름 그릴링·연말)에 맞춰 -60℃ 비축 물량을 선출하하는 계절 재고 운용으로 성수기 단가 프리미엄을 포착하십시오. ② 단백질 추구 71% 트렌드는 스테이크/포케용 사쿠의 '고단백·저지방' 포지셔닝과 직결 — 캔을 넘어 신선·냉동 사쿠 리테일(그로서리·코스트코)로 카테고리를 확장할 구조적 수요 기반입니다.",
        source: "NFI Top 10 Seafood(2023년 데이터·2024년 발표 — 1인당 캔참치 2.0lb·미국 소비 3위, 전년比 -0.20lb) / IFIC Food & Health Survey(단백질 추구 67%→71%, 2024). 계절 인덱스는 그릴링·연말 수요 패턴 기반 자체 정성 추정(1차 출처 없음). FMI 54% 주장은 1차 미확인으로 제외",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ height: '180px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <AreaChart data={SEASON_INDEX} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSeason" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="m" fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" interval={0} />
                <YAxis domain={[60, 105]} tickFormatter={(v: number) => `${v}`} fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', background: '#1a2442', color: '#e2e8f0' }}
                  formatter={(v: number) => [`${v} (인덱스)`, '계절 수요']}
                />
                <Area type="monotone" dataKey="idx" name="계절 수요 인덱스" stroke="#38bdf8" strokeWidth={2} fill="url(#colorSeason)" isAnimationActive={false} />
              </AreaChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#94a3b8', marginTop: '-4px' }}>
            여름 그릴링(7월 고점) · 연말(12월) 피크 · 비수기 2월 저점 · 정성 추정
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {DRIVERS.map((d) => (
              <div key={d.label} style={{ background: `${d.color}0f`, border: `1px solid ${d.color}2e`, borderRadius: '8px', padding: '8px 9px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>{d.label}</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: d.color }}>{d.value}</span>
                  <span style={{ fontSize: '0.58rem', color: '#94a3b8' }}>{d.unit}</span>
                </span>
                <span style={{ fontSize: '0.56rem', color: '#64748b' }}>{d.sub}</span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
