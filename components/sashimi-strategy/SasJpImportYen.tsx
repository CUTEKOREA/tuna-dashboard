'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

/* ── 엔저가 가른 일본 참치 수입 — 買い負け (일본 수산청 수산백서·SeafoodSource) ──
   검증(solid): 수산물 물량 정체(~220만t) vs 금액 +2.2%→¥2.1조, 엔저 USD/JPY 161.6(2024.7 37년 최저)→150중반,
   지중해 BFT 도매 ¥1,500(2024저점)→¥1,900~1,950(2025).
   정정(audit 2026-06-04): 지중해 BFT 총량은 ~5만t이며 약 4만t은 蓄養(축양)분 — '약 4만톤'을 총량처럼 제시하지 않도록 구분 명기.
   정정: 본마구로 국가별 구성비(대만 21.5% 등) 미검증으로 제외. */
const YEN = [
  { p: '2022', jpy: 131 }, { p: '2023', jpy: 140 }, { p: '24.7', jpy: 161 }, { p: '2025', jpy: 152 },
];

export default function SasJpImportYen() {
  return (
    <WidgetCard
      id="W-SAS55"
      title="엔저가 가른 일본 참치 수입 (買い負け)"
      description="물량 정체·금액 상승 — 엔저로 일본이 '사들이기 경쟁'서 밀려"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2025-12-31' }}
      cardDesc="엔저·일본 수산물 수입 물량/금액 디커플링·지중해 블루핀(BFT) 도매가 — 일본 수산청 수산백서(거시 수입통계)·SeafoodSource(도매가)"
      takeaway={{
        situation: "엔저가 일본 참치 수입 구조를 갈랐습니다. 일본 수산물 수입은 물량이 약 220만 톤으로 정체된 반면 금액은 +2.2%로 ¥2.1조까지 올라(상위 3대 품목에 가다랑어·참치 포함) '물량은 그대로인데 비싸게 산다'는 디커플링이 나타났습니다. USD/JPY가 2024년 7월 161엔대(약 37년 반 최저)까지 치솟았다가 2025년 150엔대 중반으로 일부 회복됐으나, 엔저로 일본이 글로벌 사들이기 경쟁에서 밀리는 '買い負け(가이마케)' 현상이 지속됩니다. 일본 의존도 90%+인 지중해 양식 블루핀(총량 약 5만 톤 중 蓄養(축양) 약 4만 톤) 도매가도 2024년 저점 ¥1,500/kg에서 2025년 ¥1,900~1,950/kg으로 회복했습니다.",
        actionPlan: "엔저는 한국 수출자에게 양날의 검입니다. ① 엔저로 일본의 구매력이 약해져 對일본 수출 단가가 압박받으므로, 일본 단일 의존을 줄이고 달러 결제 시장(미국·중동)으로 다변화하십시오. ② 반대로 엔저가 회복(엔강세)되면 일본의 사들이기 경쟁력이 살아나므로 환율 시나리오별 對일본 출하 비중을 동적으로 조정하고, 지중해 BFT 도매가 회복(¥1,950) 구간에 맞춰 고가 출하 타이밍을 포착하십시오.",
        source: "일본 수산청 수산백서(일본 수산물 수입 물량 정체·금액 +2.2%·¥2.1조 — Nippon.com 보도 경유) / USD/JPY 161.6(2024.7 37년 반 최저, 외환시장 시세) / SeafoodSource(지중해 BFT 도매 ¥1,500→¥1,900~1,950; 지중해 BFT 총량 ~5만t 중 蓄養(축양) ~4만t·90%+ 일본 유입)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>USD/JPY 환율 — 2024.7 161엔(37년 최저)</div>
          <div style={{ height: '155px', width: '100%' }}>
            <SafeResponsiveContainer width="100%" height="100%">
              <AreaChart data={YEN} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorYen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="p" fontSize={11} tickLine={false} axisLine={false} stroke="#64748b" />
                <YAxis domain={[120, 170]} tickFormatter={(v: number) => `¥${v}`} fontSize={10} tickLine={false} axisLine={false} stroke="#64748b" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#1e293b', color: '#e2e8f0' }} formatter={(v: number) => [`¥${v}/$`, '환율']} />
                <Area type="monotone" dataKey="jpy" name="USD/JPY" stroke="#ef4444" strokeWidth={2.5} fill="url(#colorYen)" isAnimationActive={false} />
              </AreaChart>
            </SafeResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', fontSize: '0.62rem', color: '#94a3b8', flexWrap: 'wrap' }}>
            <span>수입 물량 정체 vs 금액 <span style={{ color: '#f59e0b', fontWeight: 700 }}>+2.2%</span>(¥2.1조)</span>
            <span>지중해 BFT 도매 <span style={{ color: '#10b981', fontWeight: 700 }}>¥1,950</span>(2025 회복)</span>
          </div>
        </div>
      }
    />
  );
}
