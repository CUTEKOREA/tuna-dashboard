'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { AlertOctagon } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getSquidData } from '@/lib/data/squid';

const data = getSquidData('collapseCountdown');

export default function SquidCollapseCountdown() {
  return (
    <WidgetCard
      title="연대기적 자원 붕괴 카운트다운 (Collapse Trajectory)"
      icon={AlertOctagon}
      iconColor="#ef4444"
      pillar="S1"
      cardDesc="돌이킬 수 없는 'V자 반등 불가 지점(Point of No Return)' 경고"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.10)" vertical={false} />
          <XAxis dataKey="yearsFromPeak" name="정점 이후 경과년도" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(val) => `Peak ${val > 0 ? '+' + val : val}년`} />
          <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: 'rgba(10, 16, 40, 0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <ReferenceLine x={0} stroke="#fcd34d" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '역사적 어획 정점 (Peak Year)', fill: '#fcd34d', fontSize: 10 }} />
          <ReferenceLine x={6} stroke="var(--color-danger)" strokeDasharray="5 5" label={{ position: 'insideBottomRight', value: 'Point of No Return', fill: 'var(--color-danger)', fontSize: 10, offset: 20 }} />
          <Line type="monotone" dataKey="canada_cod" name="캐나다 대서양 대구 (1990s 붕괴 사례)" stroke="#64748b" strokeWidth={2} dot={false} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="korea_squid" name="한국 연근해 오징어 (현재 타임라인)" stroke="var(--color-danger)" strokeWidth={4} activeDot={{ r: 8 }} />
        </LineChart>
      }
      takeaway={{
        situation: `<div>
<p>"붕괴 카운트다운(Collapse Countdown)"이란 어종이 회복 불가능 임계점까지 남은 시간을 추적하는 quant 모델.</p>
<p>FishStatJ 분석(자체 재구성): <strong>한국 살오징어 어획량 추락 궤적이 1990년대 캐나다 대서양 대구 붕괴 패턴과 구조적으로 유사</strong>. 캐나다 대구는 붕괴 후 수십 년간 회복이 극히 제한적. 살오징어도 유사한 경로를 밟을 가능성이 높다.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: V자 반등 기대를 경영 가정에서 제거. <strong>"전략적 자원 재배분(Strategic Resource Reallocation)"</strong>이 본질.</p>
<p><strong>3단계</strong>: ① 국내 연근해 원물 소싱 의존도 단계적 축소 ② 포클랜드·남미 대왕오징어 글로벌 소싱 데스크에 예산 우선 배분 ③ 살오징어 라인 자산 손상차손 사전 충당 검토.</p>
</div>`,
        source: "FAO FishStatJ 붕괴 사례 분석 (자체 재구성, illustrative)",
      }}
    />
  );
}
