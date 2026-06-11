'use client';
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, BarChart, Bar, CartesianGrid } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Factory, AlertTriangle } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

import fishmealData from '../data/mackerel_fishmeal.json';
import chinaStealthData from '../data/mackerel_china_stealth.json';

const getKorCountry = (engName: string) => {
  const map: Record<string, string> = {
    'Chile': '칠레',
    'Peru': '페루',
    'China': '중국',
    'other': '기타',
  };
  return map[engName] || engName;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', zIndex: 1000}}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: '4px' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: '4px 0', color: entry.color || entry.payload.fill, fontSize: '13px', fontWeight: 600 }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString(undefined, {maximumFractionDigits: 1}) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MackerelProcessedWidgets() {
  const ChartObj1 = (
    <div style={{ height: '260px', width: '100%', position: 'relative' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <BarChart data={fishmealData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <ChartPatternDefs />
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} minTickGap={5} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v)=>`${v}k`}/>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="chile" stackId="1" name={getKorCountry("Chile")} fill={A11Y_PALETTE[6]} radius={[0, 0, 0, 0]} barSize={20} />
          <Bar dataKey="peru" stackId="1" name={getKorCountry("Peru")} fill={A11Y_PALETTE[1]} radius={[0, 0, 0, 0]} />
          <Bar dataKey="other" stackId="1" name="기타 비주류국가" fill={A11Y_PALETTE[7]} radius={[4, 4, 0, 0]} fillOpacity={0.6} />
        </BarChart>
      </SafeResponsiveContainer>
    </div>
  );

  const ChartObj2 = (
    <div style={{ height: '260px', width: '100%', position: 'relative' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <AreaChart data={chinaStealthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} minTickGap={2} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v)=>`${v}k`}/>
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="china" name="중국 고등어 가공량(천 톤)" stroke="var(--color-danger)" fill="url(#colorChina)" strokeWidth={2} />
          <defs>
            <linearGradient id="colorChina" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </SafeResponsiveContainer>
    </div>
  );

  return (
    <>
      <WidgetCard
        title="칠레-페루 어분(Fishmeal) 제국의 탄생"
        icon={Factory}
        iconColor="#eab308"
        pillar="S2"
        cardDesc="FAO FishStatJ Global Production & Non-Food Uses + IFFO — 칠레·페루 고등어류(jack mackerel) 연간 가공량 추이 및 연어 양식·펫케어 매입원가 연동 구조 (자체추정 포함, illustrative)"
        telemetry={{ status: 'STATIC', syncDate: 'FAO FishStatJ 2023 + IFFO' }}
        customBody={ChartObj1}
        takeaway={{
          situation: `<div>
<p>"Fishmeal(어분)"이란 펠라직 어종을 분쇄·건조해 만든 양식 사료·반려동물 식품 원료. 칠레/페루 jack mackerel(잭마커렐)이 글로벌 어분 시장의 단가 결정자(price setter).</p>
<p>실측: <strong>칠레 50.7만 톤 + 페루 17.6만 톤(2023년 FAO FishStatJ 고등어류 가공량 기준) — 식용 시장과 어분 시장이 단일 원물 풀에서 경쟁하는 구조로, 상당 비중이 fishmeal로 가공되는 것으로 업계 추정</strong>. 연어 양식·펫케어 시장의 성장이 floor price를 지지하는 구조.</p>
</div>`,
          actionPlan: `<div>
<p><strong>재정의</strong>: 고등어 단가는 더 이상 "서민 식탁"이 결정하는 변수가 아닌 <strong>"연어 양식·펫케어 매입원가에 연동된 derivative commodity"</strong>.</p>
<p><strong>3단계</strong>: ① 노르웨이 연어 양식 fishmeal 매입 단가를 고등어 매입 forward의 leading indicator로 트래킹 ② 펫케어 프리미엄 브랜드 OEM 진출 — fishmeal 다음 단계 monetization ③ 식용·fishmeal·펫케어 3-way arbitrage 모델 셋팅.</p>
</div>`,
          source: "FAO FishStatJ Global Production & Non-Food Uses",
        }}
      />
      <WidgetCard
        title="중국의 스텔스 싹쓸이 (블랙홀)"
        icon={AlertTriangle}
        iconColor="var(--color-danger)"
        pillar="S2"
        cardDesc="FAO FishStatJ 가공량 통계 — 중국의 고등어 가공량 연간 추이 (훠궈·어묵 내수 수요 견인, 식용/사료 시장 경계 모호화 신호)"
        telemetry={{ status: 'STATIC', syncDate: 'FAO FishStatJ 2023' }}
        customBody={ChartObj2}
          takeaway={{
          situation: `<div>
<p>"China Stealth Buy-up(중국의 스텔스 싹쓸이)"란 중국이 자국 통계 후공시·간접 무역 라우팅으로 글로벌 원물을 조용히 매집해 가공량이 5년/10년 단위로 수십 배 폭증하는 현상. 수리미·연어에 이어 고등어가 다음 타깃.</p>
<p>실측: <strong>중국 고등어 가공량 2000년 5,187톤 → 2023년 322,729톤 (62배 폭증) — 훠궈·어묵 내수 폭증이 동인. 글로벌 원물 buying power가 한국 vendor에서 중국 vendor로 빠르게 이전 중</strong>. 1~2년 내 한국 수입 단가가 중국 내수 가격에 따라 결정되는 종속 구조로 전환 위험.</p>
</div>`,
          actionPlan: `<div>
<p><strong>재정의</strong>: 중국 가공량 폭증은 단순 경쟁 증가가 아닌 <strong>"한국이 글로벌 buyer 지위에서 price taker로 강등되는 마지막 골든 window"</strong>.</p>
<p><strong>3단계</strong>: ① 노르웨이·아일랜드 vendor와 3~5년 장기 take-or-pay 계약 즉시 체결 — 중국 매집 전 lock-in ② 한국 가공·HMR 라인 capex 가속 — 원물 종속 → 가공품 export로 전환 ③ 일본·EU 프리미엄 시장 진출 — 중국이 진입 불가능한 brand moat 구축.</p>
</div>`,
          source: "FAO FishStatJ 가공량 통계",
        }}
      />
    </>
  );
}
