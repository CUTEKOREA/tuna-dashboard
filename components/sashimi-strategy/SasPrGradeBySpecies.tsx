'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 어종별 사시미 등급 결정 요인 (Catalina·Easyfish·ScienceDirect) ──
   검증(solid): 황다·눈다=색 위주, 참다랑어=지방(마블링) 위주 판정(Catalina/Easyfish),
   미오글로빈 redox로 색 변화(옥시→메트미오글로빈 갈변, Springer), 야케(화상육) 어종별 근단백 차이(ScienceDirect),
   부위별 지방비율 아카미 5±2%·오토로 20±5%(Balshaw 2008, 양식 남방참다랑어 평균±표준편차 — 종·양식여부·개체별 변동). ※법정표준 아닌 업계 관행. */
const SPECIES = [
  { ko: '참다랑어', en: 'Bluefin·혼마구로', rc: '#ef4444', factor: '지방(마블링) ★', desc: '한류성 고지방·적색~보라빛 마블링. 오토로/추토로/아카미 마블링이 등급 결정 — 최고급.' },
  { ko: '눈다랑어', en: 'Bigeye·메바치', rc: '#f59e0b', factor: '색 + 지방(중상)', desc: '참다랑어와 황다랑어의 중간. 짙은 적색 + 열대종 중 고지방 → 우수 횟감.' },
  { ko: '황다랑어', en: 'Yellowfin·Ahi', rc: '#10b981', factor: '색(Color) ★', desc: '저지방·담백·단단함 → 지방이 적어 거의 색으로만 판정. 분홍빛 적색.' },
  { ko: '가다랑어', en: 'Skipjack·가쓰오', rc: '#64748b', factor: '선도·풍미(저등급)', desc: '주로 통조림·타타키. 강한 풍미·연한 육질, 야케·녹변 취약 → 횟감 최하.' },
  { ko: '날개다랑어', en: 'Albacore·빈초', rc: '#a78bfa', factor: '백색·식감', desc: '"흰 참치(화이트 튜나)" — 통조림 + 일부 사시미(빈초마구로). 백색·식감으로 판정.' },
];

export default function SasPrGradeBySpecies() {
  return (
    <WidgetCard
      id="W-SAS64"
      title="어종별 사시미 등급 결정 요인"
      description="참다랑어=지방 · 황다랑어=색 — 어종마다 다른 잣대"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2026-06-04' }}
      cardDesc="어종별 등급 주 결정요인(지방·색·선도)·미오글로빈 산화 변색·야케 — Catalina·Easyfish·Food Chemistry 2016"
      takeaway={{
        situation: "사시미 등급은 색·지방·선도·식감·결점(야케·혈점)의 복합이지만, 핵심은 어종마다 '주된 잣대'가 다르다는 점입니다. 참다랑어는 지방(마블링)으로, 눈다랑어는 색+지방으로, 황다랑어는 거의 색(Color)만으로 판정합니다(저지방이라 마블링 평가 여지가 없음). 가다랑어는 선도·풍미 중심의 저등급(주로 통조림), 날개다랑어는 백색육으로 분류됩니다. 색은 미오글로빈 산화상태(옥시미오글로빈 선홍 → 메트미오글로빈 갈변)가 지배하며, 어획 시 발버둥+체온상승으로 생기는 야케(화상육)는 어종별 근단백 차이로 발생율이 다릅니다. 단, 이 등급은 소 등급제 같은 법정표준이 아닌 업계 관행·바이어별 척도입니다.",
        actionPlan: "어종별로 마진 레버가 다릅니다. ① 황다랑어처럼 '색이 잣대'인 어종은 콜드체인(-60℃)이 곧 등급 — 미오글로빈 산화만 막으면 같은 물고기가 #3→#1로 점프하므로, 동원 슈퍼튜나처럼 ULT 동결로 색·육질을 보존해 횟감급 마진을 포착하십시오. ② 참다랑어는 '지방이 잣대'라 어획 시기(겨울 고지방)·산지(한류)·축양(지방 축적)이 등급을 좌우하므로, 축양 마블링 강화가 밸류업 레버입니다. ③ 야케·혈점 같은 결점은 어획~처리 속도(즉시 내장 제거)로 방어 — 등급 통과율 자체가 매출 KPI입니다.",
        source: "Catalina Offshore·Easyfish(황다·눈다=색/참다랑어=지방 판정) / 미오글로빈 산화(옥시→메트미오글로빈 갈변)는 식품과학 일반 / Erdaide 외, Food Chemistry 2016(PubMed 26868578: 황다·눈다·가다 어종별 야케 근단백 비교) / 부위별 지방비율은 Balshaw 외(2008), Food Chemistry 111:616-621 — 양식 남방참다랑어 아카미 5±2%·오토로 20±5%(평균±표준편차, 단일 고정값 아님·종/양식여부/개체별 변동, 2008년 자료) / 업계 관행·바이어별 척도(법정표준 아님)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          {SPECIES.map((s) => (
            <div key={s.ko} style={{ background: `${s.rc}0d`, border: `1px solid ${s.rc}2e`, borderLeft: `3px solid ${s.rc}`, borderRadius: '9px', padding: '9px 11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9' }}>{s.ko}</span>
                <span style={{ fontSize: '0.56rem', color: 'var(--w-slate-500)' }}>{s.en}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.62rem', fontWeight: 800, color: s.rc, background: `${s.rc}1f`, padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{s.factor}</span>
              </div>
              <span style={{ fontSize: '0.62rem', color: 'var(--w-slate-400)', lineHeight: 1.4 }}>{s.desc}</span>
            </div>
          ))}
          <div style={{ fontSize: '0.6rem', color: 'var(--w-slate-500)', lineHeight: 1.5, textAlign: 'center' }}>
            색=미오글로빈 산화(옥시→메트=갈변, CO처리가 위장) · 야케=어획 발버둥 화상육 · 부위별 지방 아카미 5±2%·오토로 20±5%(Balshaw 2008, 양식 남방참다랑어·개체별 편차)
          </div>
        </div>
      }
    />
  );
}
