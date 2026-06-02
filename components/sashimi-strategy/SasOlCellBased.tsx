'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 세포배양·대체 참치의 2030 침투 전망 (GVR·FDA·BlueNalu) ──
   검증(solid): 식물성 참치 $945.3M(2023)→$1.59B(2030, CAGR 7.8%, GVR 상단추정),
   세포배양 수산물 첫 美 FDA 승인 Wildtype 코호연어(2025-05-28), BlueNalu APAC MOU(미쓰비시상사·풀무원·타이유니온, 2023-10),
   美 배양육 판매금지 7개주(FL·AL·MS·IN·MT·NE·TX). 정정: BlueNalu 75% 총이익률=회사 자체 조건부 추정. */
const ITEMS = [
  { rc: '#10b981', title: '식물성 참치 시장 (2030)', value: '$1.59B', desc: '2023 $945.3M → 2030 $1.59B(CAGR 7.8%, GVR 상단추정 — 기관별 편차 큼).' },
  { rc: '#38bdf8', title: '세포배양 수산물 첫 美 승인', value: '2025.5', desc: 'Wildtype 코호 연어 FDA "no questions"(2025-05-28) — 수산물 최초. 참치도 동일 경로 진입 가능.' },
  { rc: '#f59e0b', title: 'BlueNalu APAC 동맹', value: '3사 MOU', desc: '미쓰비시상사·풀무원(韓)·타이유니온 — 배양 블루핀 토로 APAC 공급(2023-10). 총이익률 75%는 회사 자체 조건부 추정.' },
  { rc: '#ef4444', title: '美 배양육 판매금지 州', value: '7개주', desc: 'FL·AL·MS·IN·MT·NE·TX — 규제 역풍이 상업화 속도의 핵심 변수.' },
];

export default function SasOlCellBased() {
  return (
    <WidgetCard
      id="W-SAS62"
      title="세포배양·대체 참치 2030 — 파괴적 위협"
      description="식물성 $1.59B + 세포배양 첫 FDA 승인 vs 규제 역풍"
      pillar="S5"
      telemetry={{ status: 'STATIC', syncDate: '2025' }}
      cardDesc="식물성·세포배양 참치 시장 전망·FDA 승인·APAC 동맹·규제 — GVR·FDA·BlueNalu(상단/조건부 추정 포함)"
      takeaway={{
        situation: "전통 참치에 대한 대체 기술이 2030을 향해 움직입니다. 식물성 참치(캔 대체) 시장은 2023년 $945.3M에서 2030년 $1.59B(CAGR 7.8%, 단 GVR 단일 출처 상단추정)로 전망되고, 세포배양 수산물은 2025년 5월 Wildtype 코호 연어가 미국 FDA 'no questions' 승인을 받아 수산물 최초로 상업 경로를 열었습니다. BlueNalu는 미쓰비시상사·풀무원·타이유니온과 APAC 동맹(2023-10)을 맺어 배양 블루핀 토로를 겨냥합니다(자체 총이익률 75%는 가동 전 조건부 추정). 반면 미국 7개 주가 배양육 판매를 금지하는 등 규제 역풍이 상업화 속도의 핵심 변수입니다.",
        actionPlan: "대체 참치를 '베이스 시나리오 위협'이 아니라 '옵션·헤지'로 다루십시오. ① 식물성·세포배양은 2030까지 전통 참치(특히 사시미급 프리미엄)를 직접 대체하기 어렵지만, 캔·가공급 저가 시장은 잠식 가능성이 있으므로 한국은 고부가 사시미급에 집중해 대체재 노출을 줄이십시오. ② 풀무원이 BlueNalu 동맹에 참여한 점은 한국 기업의 배양 참치 옵션 선점 사례이므로, 신라교역도 R&D 파일럿·라이선스로 소액 실물옵션을 확보해 기술 성숙 시 진입로를 열어두십시오.",
        source: "Grand View Research(식물성 참치 $945.3M→$1.59B CAGR 7.8%, 상단추정) / FDA·Food Dive(Wildtype 연어 2025-05-28 첫 승인) / BlueNalu·SeafoodSource(APAC MOU 미쓰비시·풀무원·타이유니온) / Food Safety Mag(배양육 금지 7개주)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', width: '100%' }}>
          {ITEMS.map((it) => (
            <div key={it.title} style={{ background: `${it.rc}0d`, border: `1px solid ${it.rc}2e`, borderLeft: `3px solid ${it.rc}`, borderRadius: '9px', padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f1f5f9' }}>{it.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.86rem', fontWeight: 800, color: it.rc }}>{it.value}</span>
              </div>
              <span style={{ fontSize: '0.62rem', color: '#94a3b8', lineHeight: 1.4 }}>{it.desc}</span>
            </div>
          ))}
        </div>
      }
    />
  );
}
