'use client';
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { CloudLightning } from 'lucide-react';
import WidgetCard from './WidgetCard';
import rawData from '../data/mackerel_climate_predictor.json';

export default function MackerelClimatePredictor() {
  const data = rawData as any[];

  const ChartObj = (
    <div style={{ height: '250px', width: '100%' }}>
      <ScatterChart margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis type="number" dataKey="tempRise" name="수온 편차" unit="°C 상승" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
        <YAxis type="number" dataKey="catchRate" name="대형어 어획량 변동" unit="%" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
        <Scatter name="연도별 기후 파급" data={data} fill="var(--color-danger)">
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.tempRise > 1.4 ? 'var(--color-danger)' : 'var(--color-success)'} />
          ))}
        </Scatter>
      </ScatterChart>
    </div>
  );

  return (
    <WidgetCard
      title="지구온난화 대형어 흉작 예측 모델"
      icon={CloudLightning}
      iconColor="#fbbf24"
      pillar="S1"
      cardDesc="전년도 한반도 남해안 표층수온 상승 이상편차(SST Anomaly) 값을 X축으로 두고 당해 연도 고수익"
      telemetry={{ status: 'STATIC', syncDate: '2024 (NOAA)' }}
      customBody={ChartObj}
      takeaway={{
        situation: `<div>
<p>"SST(Sea Surface Temperature) Anomaly"란 해당 해역의 30년 평균 표층수온 대비 편차. 한반도 남해안의 +1.5℃ 돌파는 회유어 isotherm(등온선) 영구 북상의 tipping point.</p>
<p>실측: <strong>SST +1.5℃ 임계점 돌파 시 타겟 어군 회유 경로 영구 붕괴 → 국내 EEZ 대형어 수확량 65% 증발 tail risk. 인적 직관 발주 모델은 climate stochasticity 앞에 무력</strong>. 매년 ENSO phase shift에 따라 매입 volume이 ±300% 변동해야 정상.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 기후 리스크는 단순 cost 변수가 아닌 <strong>"전사 P&L의 가장 큰 미헤지 노출 — 자산 운용사 수준 quant 헤징 필수"</strong>.</p>
<p><strong>3단계</strong>: ① NOAA ENSO 지수 +1.5℃ 돌파 즉시 알고리즘 트리거 — 차기 노르웨이산 forward 3배 lock-in ② 인적 직관 발주 폐기 → "Climate-Quant" 자동 매입 알고리즘 도입 ③ JP Morgan 어종 weather derivative OTC 헤지 contract 체결 — tail risk 자본화.</p>
</div>`,
        source: "NASA · NOAA ENSO Data (자체 SST anomaly 모델 결합)",
      }}
    />
  );
}
