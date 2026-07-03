'use client';
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { CloudLightning } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getMackerelData } from '@/lib/data/mackerel';
import SafeResponsiveContainer from './SafeResponsiveContainer';

const rawData = getMackerelData('climatePredictor');

export default function MackerelClimatePredictor() {
  const data = rawData as any[];

  const ChartObj = (
    <div style={{ height: '250px', width: '100%' }}>
      <SafeResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" />
        <XAxis type="number" dataKey="tempRise" name="수온 편차" unit="°C 상승" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
        <YAxis type="number" dataKey="catchRate" name="대형어 어획량 변동" unit="%" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'rgba(10, 16, 40, 0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
        <Scatter name="연도별 기후 파급" data={data} fill="var(--color-danger)">
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.tempRise > 1.4 ? 'var(--color-danger)' : 'var(--color-success)'} />
          ))}
        </Scatter>
      </ScatterChart>
      </SafeResponsiveContainer>
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
<p>연구 사례: <strong>SST(표층수온) +1.5℃ 임계점 돌파 시 타겟 어군 회유 경로가 북상하며 국내 EEZ 대형어 어획량의 급격한 감소 위험이 높아진다. 인적 직관 발주 모델은 기후 불확실성 앞에서 한계를 가진다</strong>. ENSO(엘니뇨·라니냐) 국면 전환에 따라 매입 물량 계획의 탄력적 조정이 요구된다.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 기후 리스크는 단순 비용 변수가 아닌 <strong>전사 손익(P&L)의 구조적 노출 — 기후 지표 연동 구매 계획 수립이 필수</strong>.</p>
<p><strong>3단계</strong>: ① NOAA ENSO 지수 +1.5℃ 돌파 신호 감지 시 노르웨이산 등 대체 원료 선구매 비중 확대 검토 ② 발주 계획에 ENSO 국면 시나리오(라니냐·엘니뇨) 민감도 분석 반영 ③ 업계 기후 파생상품(날씨 헤지 상품) 활용 가능성 검토 — tail risk 관리 방안 마련.</p>
</div>`,
        source: "NOAA ENSO Data (자체 SST anomaly 분석, 업계 추정)",
      }}
    />
  );
}
