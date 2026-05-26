'use client';
import React from 'react';
import { ThermometerSun } from 'lucide-react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import WidgetCard from './WidgetCard';
import data from '../data/squid_climate_radar.json';
import { ChartPatternDefs, A11Y_PALETTE } from './ChartPatterns';

export default function SquidClimateRadar() {
  return (
    <WidgetCard
      title="수온 기반 공급망 스위칭(Switching) 레이더"
      icon={ThermometerSun}
      iconColor="#fcd34d"
      pillar="S1"
      cardDesc="SST(표층수온) 이상 기온과 해역별 어획량 엇갈림"
      telemetry={{ status: 'LIVE', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <ComposedChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
          <ChartPatternDefs />
          <defs>
            <linearGradient id="colorSST" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
          <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `${val}℃`} />
          <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={(val) => `${val}k`} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
          <Area yAxisId="left" type="monotone" dataKey="sst_anomaly" name="수온 편차 (SST Anomaly)" stroke="url(#colorSST)" fillOpacity={1} fill="url(#colorSST)" />
          <Line yAxisId="right" type="monotone" dataKey="korea_catch" name="한국 어획량 (천톤)" stroke="#fcd34d" strokeWidth={3} dot={{ r: 3 }} />
          <Line yAxisId="right" type="monotone" dataKey="peru_catch" name="페루 어획량 (천톤)" stroke="#c4b5fd" strokeWidth={3} dot={{ r: 3 }} />
        </ComposedChart>
      }
      takeaway={{
        situation: `<div>
<p>"기후 디커플링(Climate Decoupling)"이란 동일 climate 충격(SST 상승)이 두 지역에 정반대 효과를 만드는 현상.</p>
<p>한국 vs 페루 비대칭: <strong>동해 SST +1.5℃ 시 한국 살오징어는 심해·북측 국경 이탈로 전멸 vs 페루 대왕오징어는 오히려 생산량 폭증</strong>. 같은 엘니뇨가 위협 + 기회 동시 발동.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: SST 모니터링은 단순 알람이 아닌 <strong>"supply chain switching trigger"</strong>.</p>
<p><strong>3단계</strong>: ① 실시간 SST 모니터링 임계점 자동 경보 ② 국내 연근해 매입 비중 축소 ③ 페루산 냉각품 선도 계약 확대 — climate decoupling을 alpha generator로 활용.</p>
</div>`,
        source: "NOAA SST + FAO FishStatJ 해역별 어획량 교차분석",
      }}
    />
  );
}
