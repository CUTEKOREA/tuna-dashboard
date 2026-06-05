'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import WidgetCard from './WidgetCard';
import TakeawayBox from './TakeawayBox';
import { ShoppingCart } from 'lucide-react';
import rawData from '../data/MackerelFilletPenetration.json';
// 데이터: 정적 JSON (업계 역산 추정치, STATIC)

export default function MackerelFilletPenetration() {
  const chartData = useMemo(() => rawData, []);

  const ChartArea = (
    <SafeResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorFillet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
        <YAxis tickFormatter={(val) => `${val}%`} stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
        <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
        <Area type="monotone" dataKey="filletShare" name="간편식 밥상 점유율(%)" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorFillet)" />
      </AreaChart>
    </SafeResponsiveContainer>
  );

  return (
    <WidgetCard
      title="순살 필렛 HMR 체제 전환 가속"
      subtitle="가공형태별 B2C 내수 침투율 추이 (자체추정·illustrative)"
      cardDesc="출처: 업계 역산 추정치 — HS 코드 병합으로 공공통계 미포착 B2C 마트 판매량 기반. STATIC 2025-01-01"
      icon={ShoppingCart}
      telemetry={{ status: 'STATIC', syncDate: '2025-01-01' }}
    >
      <div style={{ width: '100%', height: 350 }}>
        {ChartArea}
      </div>
      <TakeawayBox
        situation={`<div>
<p>"머리·내장 제거(H&amp;G)" 단계는 원물 1차 전처리 등급이며, "순살 필렛"은 뼈·껍질까지 제거한 HMR 최종 가공품으로 B2C 직접 소비 가능한 최고 부가가치 등급입니다.</p>
<p>업계 추정치 기준: <strong>1인 가구 증가 + 에어프라이어 보급이 맞물려 순살 필렛 내수 침투율이 2024년 62% 수준까지 상승한 것으로 추산됨.</strong> HS 코드 병합으로 공공통계에 직접 포착되지 않는 세부 시장의 구조적 전환 신호로 해석됩니다. (자체추정·illustrative — 공식 통계 아님)</p>
</div>`}
        actionPlan={`<div>
<p><strong>전략 방향</strong>: 가공은 부가 옵션이 아닌 원물 수율 손실 리스크를 해외 패커에게 사전 전가하는 공급망 선행 무기로 재정의할 수 있음.</p>
<p><strong>검토 과제</strong>: ① 노르웨이 공급망 계약 시 H&amp;G 등급 이상 스펙 선확보 조항 검토 ② 자동화 필레팅 라인 수율·가동용량 투자 타당성 점검 ③ B2C 직판 채널(쿠팡·마켓컬리) 진출 가능성 검토 — 마진 구조는 공식 사업계획 수립 시 별도 산출 필요.</p>
</div>`}
      />
    </WidgetCard>
  );
}
