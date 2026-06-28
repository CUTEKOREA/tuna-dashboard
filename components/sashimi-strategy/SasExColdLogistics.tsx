'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

/* ── 부산발 참치 수출 콜드체인 운송 경로별 비용·리드타임 (CEVA·Freightos·KATI) ──
   검증(solid): 항공 2.5일(경유1~2)/해상 10~30일+, 수산물 항공 비중 <10%, 항공운임 $3~7/kg(2023)+
   콜드체인 핸들링 +$0.5~1.5/kg, 슈퍼프리저 리퍼 -40~-60℃(사시미급), 한국 수출 냉동필렛 최다(일본·태국·프랑스).
   항공 비용 프리미엄: CEVA 'From Sea to Plate' 원문 기준 해상 대비 "+50% 이상"(약 1.5배). */
const ROUTES = [
  { route: '해상 리퍼(-60℃)', usd: 1, days: '10~30일+', color: '#10b981' },
  { route: '항공(생물·고급)', usd: 1.5, days: '2.5일', color: '#ef4444' },
];

export default function SasExColdLogistics() {
  return (
    <WidgetCard
      id="W-SAS59"
      title="부산발 참치 수출 콜드체인 운송 경로"
      description="항공(생물 2.5일·고가) vs 해상 리퍼(냉동 10~30일·저가)"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2026-06-05' }}
      cardDesc="부산 참치 수출 항공/해상 운송 비용·리드타임·초저온 리퍼 — CEVA·Freightos·KATI"
      takeaway={{
        situation: "부산발 참치 수출은 어종·등급에 따라 두 경로로 갈립니다. 생물 사시미급은 항공(2.5일, 경유 1~2회)으로 나가지만 운임이 $3~7/kg에 콜드체인 핸들링 +$0.5~1.5/kg이 가산돼 해상 대비 +50% 이상(약 1.5배) 비싸, 수산물 전체의 항공 비중은 10% 미만입니다. 대량 냉동 로인/필렛은 슈퍼프리저 리퍼(-40~-60℃)로 해상 10~30일+에 저가 운송합니다. 한국 수출은 냉동 필렛이 최다이고 일본·태국·프랑스가 주 도착지로, 부산항은 정형·재수출 허브 역할을 합니다.",
        actionPlan: "운송 모드를 어종·등급별로 최적화하십시오. ① 생물 #1 사시미급은 단가가 운임 +50% 프리미엄을 흡수하므로 공항 인접 가공·항공 직결(미국 동·서부, 일본)로 신선도 프리미엄을 포착하고, ② 냉동 로인 대량분은 -60℃ 해상 리퍼로 운송비를 최소화하되 콜드체인 단절(리퍼 고장·환적 지연) 리스크를 보험·실시간 온도 모니터링으로 헤지하십시오. ③ 부산항의 재수출(정형 후 제3국) 허브 기능을 살려 보세·환적 마진을 추가 포착하십시오.",
        source: "CEVA 'From Sea to Plate'(항공 2.5일/해상 10~30일·수산물 항공 <10%·항공운임 해상 대비 +50% 이상) / Freightos(항공운임 $3~7/kg 2023·콜드체인 +$0.5~1.5/kg) / Maersk(슈퍼프리저 -40~-60℃) / KATI·KOTRA(한국 냉동필렛 최다·일본·태국·프랑스 도착)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>운송 모드별 상대 운임 (해상=1) · 항공 +50%(약 1.5배)</div>
          <div style={{ height: '150px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <BarChart data={ROUTES} layout="vertical" margin={{ top: 8, right: 40, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                <XAxis type="number" domain={[0, 2]} tickFormatter={(v: number) => `${v}x`} fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                <YAxis type="category" dataKey="route" fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" width={120} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#1a2442', color: '#e2e8f0' }} formatter={(v: number, _n: string, p: any) => [`${v}x 운임 · ${p.payload.days}`, '상대비용']} />
                <Bar dataKey="usd" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {ROUTES.map((d) => <Cell key={d.route} fill={d.color} />)}
                  <LabelList dataKey="usd" position="right" formatter={(v: number) => `${v}x`} fontSize={11} fill="#e2e8f0" />
                </Bar>
              </BarChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#94a3b8' }}>
            항공 $3~7/kg + 콜드체인 $0.5~1.5/kg · 수산물 항공 비중 <span style={{ color: '#ef4444', fontWeight: 700 }}>&lt;10%</span> · 부산=정형·재수출 허브
          </div>
        </div>
      }
    />
  );
}
