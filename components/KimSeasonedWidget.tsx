'use client';
/**
 * KimSeasonedWidget — 김 P3 조미김(고부가 가공) 통관 (LIVE API 연동)
 * /api/kim/customs-seasoned (관세청 KCS, HS 2008.99.50.10) + /api/kim/customs (마른김 1212.21) fetch.
 * isLive 필드 기반 telemetry 동적 부여 (L-12). 실패 시 fallback + 정직 STATIC.
 * 핵심 인사이트: 마른김(원초) vs 조미김(고부가) 통관 단가·대상국 채널 비교 (단가배수는 LIVE 산출).
 */
import React, { useEffect, useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, BarChart } from 'recharts';
import { Sparkles } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { truncateXAxis } from '../lib/chart-standards';

const tip = { background: 'rgba(10, 16, 40, 0.92)', border: '1px solid rgba(132,204,22,0.4)', borderRadius: '8px' };

export default function KimSeasonedWidget() {
  const [data, setData] = useState<any>(null);
  const [raw, setRaw] = useState<any>(null); // 마른김(원초) 비교용
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch('/api/kim/customs-seasoned').then(r => r.ok ? r.json() : null),
      fetch('/api/kim/customs').then(r => r.ok ? r.json() : null),
    ])
      .then(([s, m]) => { if (alive) { if (s) { setData(s); setRaw(m); } else setErrored(true); } })
      .catch(() => { if (alive) setErrored(true); });
    return () => { alive = false; };
  }, []);

  if (!data) {
    return (
      <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: '#64748b' }}>
        <Sparkles size={26} style={{ opacity: 0.5, marginBottom: '8px' }} />
        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{errored ? '조미김 통관 데이터를 불러오지 못했습니다' : '조미김 수출 통관 데이터 로딩 중…'}</div>
        <div style={{ fontSize: '0.72rem', marginTop: '4px' }}>{errored ? '관세청 KCS OpenAPI 응답 없음 — 잠시 후 새로고침' : '관세청 KCS OpenAPI (HS 2008.99.50.10)'}</div>
      </div>
    );
  }

  const isLive = !!data.isLive;
  const destIsLive = !!data.destIsLive;
  const monthly = data.monthly || [];
  const dest = data.dest || [];
  const latest = monthly[monthly.length - 1];

  // 원초 vs 조미김 단가($/kg) 비교: value(천USD)/volume(톤) = USD/kg
  const rawLatest = (raw?.monthly || [])[(raw?.monthly || []).length - 1];
  const cifKg = (mo: any) => (mo && mo.volume > 0) ? Math.round((mo.value / mo.volume) * 10) / 10 : 0;
  const seasonedKg = cifKg(latest);
  const rawKg = cifKg(rawLatest);
  const premiumX = rawKg > 0 ? Math.round((seasonedKg / rawKg) * 10) / 10 : 0;
  const compareData = [
    { k: '마른김(원초)', usd: rawKg, fill: '#65a30d' },
    { k: '조미김(가공)', usd: seasonedKg, fill: '#a3e635' },
  ];
  const bothLive = isLive && !!raw?.isLive;

  return (
    <>
      <WidgetCard
        title="조미김 수출 통관 추이 (고부가)"
        icon={Sparkles}
        iconColor="#84cc16"
        pillar="S3"
        cardDesc={`조미김(HS 2008.99.50.10) 월별 수출 통관 물량(톤)·금액(천 USD) — ${data.hsCode || ''}`}
        telemetry={{ status: isLive ? 'LIVE' : 'STATIC', syncDate: isLive ? '실시간' : '관세청 2026-06' }}
        chart={
          <ComposedChart data={monthly} margin={{ top: 10, right: 10, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickFormatter={truncateXAxis} />
            <YAxis yAxisId="l" stroke="#94a3b8" fontSize={11} />
            <YAxis yAxisId="r" orientation="right" stroke="#a3e635" fontSize={11} tickFormatter={(v) => `$${Math.round(v / 1000)}M`} />
            <Tooltip contentStyle={tip} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar yAxisId="l" dataKey="volume" name="수출 물량 (톤)" fill="#84cc16" radius={[3, 3, 0, 0]} barSize={20} />
            <Line yAxisId="r" type="monotone" dataKey="value" name="수출액 (천 USD)" stroke="#a3e635" strokeWidth={2.5} dot={{ r: 3 }} />
          </ComposedChart>
        }
        takeaway={{
          situation: `<div><p>관세청 KCS 통관 기준 조미김(HS 2008.99.50.10) 수출은 ${isLive ? '실시간 연동' : '관세청 2026-06 실수집 fallback'}으로 집계. ${latest ? `최근(${latest.month}) 물량 <strong>${latest.volume?.toLocaleString()}톤</strong>, 금액 <strong>$${Math.round((latest.value || 0) / 1000)}M</strong>.` : ''} 조미김은 김 수출액의 약 67%를 차지하는 <strong>고부가 가공 수출재</strong>(외부: 관세청·KATI 연간 기준)로, 원초(마른김) 통관 단가보다 약 ${premiumX}배 높다.</p></div>`,
          actionPlan: `<div><p><strong>재정의</strong>: 조미김은 "수산물"이 아닌 K-스낵 브랜드 게임 — 원초 약세기에도 가공 단가로 마진 방어.</p><p><strong>3단계</strong>: ① 미·일 편중(과반) 외 동남아·유럽 신흥 채널 확대 ② 프리미엄 SKU(김부각·김스낵)로 단가 상향 ③ 원초 선매입으로 가공 원가 헤지.</p></div>`,
          source: isLive ? '관세청 KCS OpenAPI 수출통관 (실시간, HS 2008.99.50.10)' : '관세청 2026-06 실수집 (fallback)',
        }}
      />
      <WidgetCard
        title="조미김 수출 대상국 비중 (통관 기준)"
        icon={Sparkles}
        iconColor="#84cc16"
        pillar="S3"
        cardDesc="조미김 수출 통관 물량 기준 주요 대상국 비중(%) — 미국·일본 양강"
        telemetry={{ status: destIsLive ? 'LIVE' : 'STATIC', syncDate: destIsLive ? '실시간' : '관세청 2026-06' }}
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
          situation: `<div><p>조미김 수출 대상국은 ${dest[0]?.name || '미국'}(${dest[0]?.value ?? ''}%)·${dest[1]?.name || '일본'}(${dest[1]?.value ?? ''}%)이 통관 물량의 과반. 미국은 김스낵 수요, 일본은 전통 김 수요로 채널 성격이 다르다.</p></div>`,
          actionPlan: `<div><p><strong>재정의</strong>: 상위국 집중은 리스크이자 단가 협상 레버리지.</p><p><strong>3단계</strong>: ① 미국 프리미엄 단가 방어 ② 일본 물량 안정 채널 ③ 베트남·필리핀 등 동남아 성장국 비중 확대로 분산.</p></div>`,
          source: destIsLive ? '관세청 KCS OpenAPI 수출통관 (실시간)' : '관세청 2026-06 실수집 (대상국 비중 fallback)',
        }}
      />
      <WidgetCard
        title="원초 vs 조미김 단가 프리미엄 ($/kg)"
        icon={Sparkles}
        iconColor="#84cc16"
        pillar="S3"
        cardDesc="통관 단가($/kg) = 수출액÷물량 — 마른김(원초) vs 조미김(가공) 직접 비교, 가공 부가가치의 LIVE 증거"
        telemetry={{ status: bothLive ? 'LIVE' : 'STATIC', syncDate: bothLive ? '실시간' : '관세청 2026-06' }}
        chart={
          <BarChart data={compareData} layout="vertical" margin={{ top: 10, right: 40, left: 18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" horizontal={false} />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}`} />
            <YAxis type="category" dataKey="k" stroke="#94a3b8" fontSize={12} width={92} />
            <Tooltip contentStyle={tip} cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v) => [`$${v}/kg`, '통관 단가']} />
            <Bar dataKey="usd" name="통관 단가 ($/kg)" radius={[0, 3, 3, 0]}>
              {compareData.map((d: any, i: number) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        }
        takeaway={{
          situation: `<div><p>최근 통관 단가 기준 조미김 <strong>$${seasonedKg}/kg</strong> vs 마른김(원초 김) <strong>$${rawKg}/kg</strong> — 조미김이 약 <strong>${premiumX}배</strong> 고단가. 원초 김 자체가 이미 고단가 건조품이라 통관 단가 프리미엄은 크지 않지만, 조미김은 단가보다 <strong>미국 등 소비시장 직판 채널</strong>로 흘러 소매 마진(소매가 2~4배)을 가져가는 점이 본질적 차이.</p></div>`,
          actionPlan: `<div><p><strong>재정의</strong>: 부가가치는 통관 단가(+${premiumX}배)가 아니라 "소비시장 직접 접근(채널)"에 있다 — 원초는 아시아 가공국 B2B, 조미김은 미국 B2C.</p><p><strong>3단계</strong>: ① 원초 약세기 선매입·계약재배로 가공 원가 고정 ② 조미·김부각 2차 가공 capa 증설 ③ 원물 직수출 비중 축소, 소비시장 직판 가공품 비중 상향.</p></div>`,
          source: bothLive ? '관세청 KCS OpenAPI 수출통관 (실시간, HS 1212.21.1x vs 2008.99.50.10)' : '관세청 2026-06 실수집 (fallback)',
        }}
      />
    </>
  );
}
