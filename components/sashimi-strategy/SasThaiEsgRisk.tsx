'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 태국 수산 ESG 리스크: IUU·강제노동 컴플라이언스 (Pillar 5) ──
   검증(SOLID): EU IUU 옐로카드 2015.4→2019.1 해제(3.7년, EU IP-19-61),
   US TIP Tier 2 4년 연속(2025 TIP), 강제노동 처벌완화 법안 의회 계류(2025 TIP).
   삭제: '59% 동료살해 목격'(2009 노후), SIMP 상위3국(미검증). */
const ESG = [
  { rc: '#f59e0b', badge: 'EU IUU', title: '옐로카드 이력 (해제됨)', value: '2015.4 → 2019.1',
    desc: 'EU 불법어업(IUU) 옐로카드 3.7년 부여 후 해제. 어선 모니터링·선박위치추적장치(VMS) 의무화로 규제 인프라는 정비됐으나 재발 시 레드카드(EU 수출 금지) 리스크 상존.' },
  { rc: '#ef4444', badge: 'US TIP', title: '인신매매 등급 Tier 2', value: '4년 연속(2025)',
    desc: '미국 국무부 인신매매보고서(TIP) Tier 2 유지(2025년 보고서, 2022년 이래 4년 연속) — 비정부기구(NGO)의 Tier 3 강등 요구에도 불구. 어선 강제노동·인신매매 잔존 신호로 평가됨.' },
  { rc: '#a78bfa', badge: '노동법', title: '강제노동 처벌완화 법안 계류', value: '의회 심의 중',
    desc: '최저연령 예외·가중처벌 삭제를 담은 법안이 의회 계류 — 통과 시 노동 컴플라이언스 후퇴로 바이어 ESG 심사 리스크 상승.' },
];

export default function SasThaiEsgRisk() {
  return (
    <WidgetCard
      id="W-SAS38"
      title="태국 수산 ESG 리스크 (IUU·강제노동)"
      description="EU·미국 규제 게이트 — 바이어 소싱 다변화의 방아쇠"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025-06-04' }}
      cardDesc="태국 수산 노동·IUU 컴플라이언스 리스크 — EU 집행위·美 국무부 TIP 2025 1차 출처"
      takeaway={{
        situation: "태국 가공 허브는 경제적 우위 이면에 ESG 리스크를 안고 있습니다. EU IUU 옐로카드(2015.4~2019.1, 3.7년)는 해제됐으나 재발 시 레드카드(EU 수출 금지) 리스크가 상존하고, 미국 국무부 TIP는 4년 연속 Tier 2로 어선 강제노동·인신매매 잔존을 신호합니다. 여기에 강제노동 처벌을 완화(최저연령 예외·가중처벌 삭제)하는 법안이 의회에 계류 중이라, 통과 시 노동 컴플라이언스가 후퇴해 글로벌 바이어의 ESG 심사 통과가 어려워질 수 있습니다.",
        actionPlan: "태국의 ESG 리스크는 한국에게 소싱 다변화 기회입니다. ① 글로벌 바이어(특히 EU·영국 리테일러)가 ESG 심사를 강화할수록 태국 단일 의존을 줄이려는 수요가 커지므로, MSC 인증 + 어획 추적성 + 클린 노동 이력을 갖춘 한국 원양·가공을 'ESG 안전 공급원'으로 포지셔닝하십시오. ② 인수 듀딜리전스 시 타깃의 노동·IUU 이력을 핵심 리스크 항목으로 점검하고, 클린 추적성 인프라를 프리미엄 멀티플로 평가하십시오.",
        source: "EU 집행위 IP-19-61(옐로카드 해제 2019.1.8) / 美 국무부 2025 인신매매보고서(TIP, 태국 Tier 2 4년 연속·처벌완화 법안 계류, state.gov) / SeafoodSource 「US keeps Thailand on trafficking watchlist」(업계 보도)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          {ESG.map((e) => (
            <div key={e.badge} style={{
              background: `${e.rc}0d`, border: `1px solid ${e.rc}2e`, borderLeft: `3px solid ${e.rc}`,
              borderRadius: '10px', padding: '11px 13px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: e.rc, background: `${e.rc}22`, padding: '2px 7px', borderRadius: '4px' }}>{e.badge}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f1f5f9' }}>{e.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.82rem', fontWeight: 800, color: e.rc }}>{e.value}</span>
              </div>
              <span style={{ fontSize: '0.64rem', color: 'var(--w-slate-400)', lineHeight: 1.45 }}>{e.desc}</span>
            </div>
          ))}
          <div style={{ fontSize: '0.62rem', color: 'var(--w-slate-500)', lineHeight: 1.5 }}>
            ESG 리스크 = 바이어 소싱 다변화 방아쇠 → MSC·추적성·클린 노동 이력 갖춘 한국 공급의 진입 창구
          </div>
        </div>
      }
    />
  );
}
