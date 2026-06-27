// @ts-nocheck
'use client';
/**
 * KimLogisticsWidget — 김 P3 물류·통관 (LIVE API 연동)
 * /api/kim/customs (관세청 KCS 수출통관, HS 1212.21) fetch.
 * isLive 필드 기반으로 telemetry LIVE/STATIC 동적 부여 (L-12). 실패 시 fallback + 정직 STATIC.
 */
import React, { useEffect, useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, BarChart } from 'recharts';
import { Ship } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { truncateXAxis } from '../lib/chart-standards';

const tip = { background: 'rgba(10, 16, 40, 0.92)', border: '1px solid rgba(132,204,22,0.4)', borderRadius: '8px' };

export default function KimLogisticsWidget() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/kim/customs')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (alive) setData(d); })
      .catch(() => { if (alive) setData(null); });
    return () => { alive = false; };
  }, []);

  if (!data) {
    return (
      <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: '#64748b' }}>
        <Ship size={26} style={{ opacity: 0.5, marginBottom: '8px' }} />
        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>김 수출 통관 데이터 로딩 중…</div>
        <div style={{ fontSize: '0.72rem', marginTop: '4px' }}>관세청 KCS OpenAPI (HS 1212.21)</div>
      </div>
    );
  }

  const isLive = !!data.isLive;
  const destIsLive = !!data.destIsLive;
  const monthly = data.monthly || [];
  const dest = data.dest || [];
  const latest = monthly[monthly.length - 1];

  return (
    <>
      <WidgetCard
        title="김 수출 통관 추이 (관세청 KCS)"
        icon={Ship}
        iconColor="#4d7c0f"
        pillar="S3"
        cardDesc={`마른김(HS 1212.21) 월별 수출 통관 물량(톤)·금액(천 USD) — ${data.hsCode || ''}`}
        telemetry={{ status: isLive ? 'LIVE' : 'STATIC', syncDate: isLive ? '실시간' : 'KATI 2024' }}
        chart={
          <ComposedChart data={monthly} margin={{ top: 10, right: 10, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickFormatter={truncateXAxis} />
            <YAxis yAxisId="l" stroke="#94a3b8" fontSize={11} />
            <YAxis yAxisId="r" orientation="right" stroke="#a3e635" fontSize={11} tickFormatter={(v) => `$${Math.round(v / 1000)}M`} />
            <Tooltip contentStyle={tip} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar yAxisId="l" dataKey="volume" name="수출 물량 (톤)" fill="#65a30d" radius={[3, 3, 0, 0]} barSize={20} />
            <Line yAxisId="r" type="monotone" dataKey="value" name="수출액 (천 USD)" stroke="#a3e635" strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        }
        takeaway={{
          situation: `<div><p>관세청 KCS 통관 기준 마른김(HS 1212.21) 수출은 ${isLive ? '실시간 연동' : 'KATI 2024 기반 fallback'}으로 집계. ${latest ? `최근(${latest.month}) 물량 <strong>${latest.volume?.toLocaleString()}톤</strong>, 금액 <strong>$${Math.round((latest.value || 0) / 1000)}M</strong>.` : ''} 김은 한국이 수출국이라 통관 병목·검역(SPS)이 수출 capa의 핵심 변수.</p></div>`,
          actionPlan: `<div><p><strong>재정의</strong>: 통관은 비용이 아닌 "수출 리드타임·신선도 경쟁력" 변수.</p><p><strong>3단계</strong>: ① 성수기(연말) 통관 적체 사전 예약·서류 자동화 ② 미·일 대형 바이어향 콜드체인 직항 라인 ③ HS 1212.21(원초)·2008.99(조미김) 분리 통관 최적화로 관세·검역 비용 절감.</p></div>`,
          source: isLive ? '관세청 KCS OpenAPI 수출통관 (실시간, HS 1212.21)' : '관세청/KATI 2024 (fallback)',
        }}
      />
      <WidgetCard
        title="김 수출 대상국 비중 (통관 기준)"
        icon={Ship}
        iconColor="#4d7c0f"
        pillar="S3"
        cardDesc="마른김 수출 통관 물량 기준 주요 대상국 비중(%) — 미국·일본 양강"
        telemetry={{ status: destIsLive ? 'LIVE' : 'STATIC', syncDate: destIsLive ? '실시간' : 'KATI 2024' }}
        chart={
          <BarChart data={dest} layout="vertical" margin={{ top: 10, right: 24, left: 14, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" horizontal={false} />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={56} />
            <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v) => [`${v}%`, '비중']} />
            <Bar dataKey="value" name="수출 비중 (%)" radius={[0, 3, 3, 0]}>
              {dest.map((d: any, i: number) => <Cell key={i} fill={d.fill || '#84cc16'} />)}
            </Bar>
          </BarChart>
        }
        takeaway={{
          situation: `<div><p>김 수출 대상국은 미국·일본이 통관 물량의 과반. 단가는 미국이 최고(~$37/kg), 물량은 일본이 최대. 조미김 비중이 전체 수출의 67%, 미국향은 90%+.</p></div>`,
          actionPlan: `<div><p><strong>재정의</strong>: 대상국 집중(상위국 비중 높음)은 리스크이자 협상 레버리지.</p><p><strong>3단계</strong>: ① 미국 프리미엄 단가 방어 ② 일본 물량 안정 채널 ③ 태국·러시아 등 성장 신흥국 비중 확대로 분산.</p></div>`,
          source: destIsLive ? '관세청 KCS OpenAPI 수출통관 (실시간)' : '관세청/KATI 2024 (대상국 비중 fallback)',
        }}
      />
    </>
  );
}
