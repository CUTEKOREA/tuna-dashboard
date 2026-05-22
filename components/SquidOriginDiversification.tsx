'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Route } from 'lucide-react';
import WidgetCard from './WidgetCard';
import data from '../data/squid_origin_diversification.json';

export default function SquidOriginDiversification() {
  return (
    <WidgetCard
      title="공급망 리드타임(Lead-Time) 분산 레이더"
      icon={Route}
      iconColor="#3b82f6"
      pillar="S3"
      cardDesc="해상 운송 및 통관 지연 기간에 따른 물류망 분산 타당성"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      chartHeight={400}
      chart={
        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickFormatter={(val) => `${val}일`} />
          <YAxis type="category" dataKey="route" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} width={120} />
          <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.95)', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-primary)', borderRadius: '8px' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
          <Bar dataKey="sea_freight" stackId="a" name="해상 배송 (일)" fill="var(--color-info)" />
          <Bar dataKey="customs" stackId="a" name="통관/검역 (일)" fill="var(--color-warning)" />
          <Bar dataKey="inland" stackId="a" name="내륙 배송 (일)" fill="var(--color-danger)" />
        </BarChart>
      }
      takeaway={{
        situation: "페루 해역 조업물을 중국 다롄 공장으로 이송 후 재가공 수입하는 기존 톨링 삼각무역 라인은 리드타임(Lead-time)이 최대 80일까지 지연되는 치명적 공급망 마비(Disruption) 리스크에 노출되어 있습니다.",
        actionPlan: "[Lead-time Hedging via FAS] 수에즈/파나마 운하 병목 등 지정학적 해운 리스크 폭발 시기를 대비하십시오. 중국 우회 라인 의존도(Exposure)를 40% 이하로 통제하고, 단가가 15% 이상 비싸더라도 선상동결(FAS) 후 30일 내 국내로 즉시 다이렉트 꽂히는 '미주 태평양 직항' 원물 라인 물량에 프리미엄을 주고 우선 장기 가계약(Hedging)을 맺어 블랙스완에 대비해야 합니다.",
        source: "선사 선박스케줄 & SCM 리포트",
      }}
    />
  );
}
