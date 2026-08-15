'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── EU 진입 규제 게이트 — 어획증명·CATCH 디지털 인증 (EU 집행위·IUU Watch 1차) ──
   검증(solid): CATCH 2026-01-10 의무화(종이 2028-01-10 종료), EU 수입 70%·IUU 80%,
   레드카드 5개국, 한국 KDE 17개(3어종 한정), 베트남 옐로카드 2017~ 미해제. */
const GATES = [
  { rc: '#38bdf8', badge: 'CATCH', title: '디지털 어획증명 의무화', value: '2026-01-10',
    desc: '모든 수입 수산물 어획증명을 CATCH 전자시스템으로만 검증·제출(종이 증명서 2028-01-10 유예 종료).' },
  { rc: '#ef4444', badge: '카딩', title: '제3국 레드카드(수출 차단)', value: '5개국',
    desc: '캄보디아·카메룬(2023)·코모로·세인트빈센트그레나딘·트리니다드토바고 활성. 베트남은 2017년부터 옐로카드 미해제.' },
  { rc: '#10b981', badge: 'KDE', title: '한국 핵심데이터요소 충족', value: '17개',
    desc: '한국은 17개 KDE를 충족한 첫 시장국이나 꽁치 등 3개 어종(20t 초과선)에 한정 — 참치 추적성 정비 필요.' },
];

export default function SasEuCatchGate() {
  return (
    <WidgetCard
      id="W-SAS40"
      title="EU 진입 규제 게이트 (CATCH 디지털 인증)"
      description="관세 아닌 어획증명 추적성 — 2026 디지털 의무화"
      pillar="S3"
      telemetry={{ status: 'STATIC', syncDate: '2025-04' }}
      cardDesc="EU IUU 어획증명·CATCH 디지털 인증·카딩 체계 — EU 집행위·IUU Watch 1차 출처"
      takeaway={{
        situation: "EU는 소비 수산물의 70%를 수입하고 그 80%가 IUU(불법·비보고·비규제) 규제 대상이라, 2026년 1월 10일부터 모든 수입 어획증명을 CATCH 디지털 시스템으로만 검증·제출해야 합니다(종이 증명서는 2028년 1월 10일 종료). 제3국 옐로/레드카드 체계로 현재 캄보디아·카메룬·코모로·세인트빈센트그레나딘·트리니다드토바고 5개국이 레드카드로 수출이 차단됐고, 경쟁 참치 수출국 베트남은 2017년부터 옐로카드가 미해제 상태입니다. 한국은 17개 KDE(핵심데이터요소)를 충족한 첫 시장국이지만 꽁치 등 3개 어종에 한정돼, 사시미/스테이크 참치 어종은 추적성 정비가 더 필요합니다.",
        actionPlan: "EU는 시장 규모보다 규제 게이트 통과가 진입의 선결 조건입니다. ① 참치 어종 단위로 어선 등록·어획증명·CATCH 전자제출 체계를 2026년 의무화 전에 선제 정비해, 베트남(옐로카드) 등 경쟁국이 막힌 동안을 점유 확대 창구로 전환하십시오. ② 인수 듀딜리전스 시 타깃의 어획증명 추적성 인프라를 핵심 리스크 항목으로 점검 — CATCH 대응 역량을 갖춘 공급사는 EU 진입 록인 가치를 가집니다.",
        source: "EU 집행위 Oceans & Fisheries(CATCH 2026-01-10·EU 수입 70%/IUU 80%, oceans-and-fisheries.ec.europa.eu/fisheries/rules/illegal-fishing) / IUU Watch 'Map of EU carding decisions'(iuuwatch.eu/map-of-eu-carding-decisions) 및 EC DG MARE IP/22/7890(카메룬 레드카드 2023-01) — 레드카드 5개국(캄보디아·카메룬·코모로·SVG·트리니다드토바고)·한국 KDE 17개·베트남 옐로카드",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          {GATES.map((g) => (
            <div key={g.badge} style={{ background: `${g.rc}0d`, border: `1px solid ${g.rc}2e`, borderLeft: `3px solid ${g.rc}`, borderRadius: '10px', padding: '11px 13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: g.rc, background: `${g.rc}22`, padding: '2px 7px', borderRadius: '4px' }}>{g.badge}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f1f5f9' }}>{g.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: 800, color: g.rc }}>{g.value}</span>
              </div>
              <span style={{ fontSize: '0.64rem', color: 'var(--w-slate-400)', lineHeight: 1.45 }}>{g.desc}</span>
            </div>
          ))}
          <div style={{ fontSize: '0.62rem', color: 'var(--w-slate-500)', lineHeight: 1.5 }}>
            규제 통과 = 경쟁국 배제 차익. 베트남 옐로카드 지속 동안 한국 추적성 선점이 진입 창구.
          </div>
        </div>
      }
    />
  );
}
