'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── EU 폐쇄형(완전양식) 참다랑어 신기술: 야생쿼터 탈피 마일스톤 (검증 정정 반영) ──
   검증(solid): 스페인 해양연구소(IEO ICRA) 육상 완전번식 세계최초(2023.07, 수정란 300만+),
   넥스트튜나(Next Tuna) €70M=폐쇄형 양식 완성까지 전체 추정 투자액(2024 파일럿 착수, 환경라이선스 2025.02 취득),
   노르투나(Nortuna) 카보베르데 500t→1만t 계획 후 2024 세리올라(부시리류) 전환(경고신호), 긴키대(Kindai) 2002 태평양종 폐쇄.
   audit 정정(2026-06-04): (1) 21,503톤은 ICCAT 전체 TAC(40,570톤)가 아니라 그 중 EU 배분쿼터 — 라벨 교정.
   (2) €70M은 2024 단년 착수액이 아니라 폐쇄형 시스템 완성까지 전체 추정 투자액(1차: mispeces·seafood.media)으로 스코프 명확화.
   (3) Nortuna 500t→1만t 계획은 1차출처(Undercurrent/SeafoodSource) 확인됨 — 유지. */
const MILESTONES = [
  { yr: '2002', rc: '#64748b', label: '긴키대(Kindai·일본) 태평양 참다랑어 생활사 세계최초 폐쇄', tag: '기술 입증' },
  { yr: '2023.07', rc: '#10b981', label: '스페인 해양연구소(IEO ICRA) 육상 탱크 대서양 참다랑어 완전번식 - 수정란 300만+', tag: '육상 완전번식' },
  { yr: '2024→28', rc: '#38bdf8', label: '넥스트튜나(카스테욘) 부유식 해상 순환여과양식(RAS) - 2024 파일럿 착수·2028 풀캐파 목표(€70M=전체 추정 투자액)', tag: '상업화 추진' },
  { yr: '2024', rc: '#ef4444', label: '노르투나(카보베르데) 참다랑어 500t→1만t 계획 후 세리올라(부시리류)로 전환', tag: '상업화 난이도' },
];

export default function SasEuClosedCycle() {
  return (
    <WidgetCard
      id="W-SAS46"
      title="EU 완전양식 참다랑어 - 야생쿼터 탈피 신기술"
      description="축양(야생치어)을 넘는 완전양식 상업화 마일스톤 추적"
      pillar="S2"
      telemetry={{ status: 'STATIC', syncDate: '2026-06-04' }}
      cardDesc="폐쇄형 완전양식 참다랑어 상업화 단계 - 스페인 해양연구소(IEO)·넥스트튜나·노르투나(SeafoodSource·The Fish Site, 업계 보도 종합)"
      takeaway={{
        situation: "EU 양식 참다랑어는 사실상 전량이 야생 치어를 살찌우는 축양(ranching)이라 ICCAT가 EU에 배분한 어획쿼터(21,503톤 - 동대서양·지중해 전체 TAC 40,570톤 중 EU 몫)에 공급 상한이 묶여 있습니다. 이를 깨는 유일한 구조적 레버가 폐쇄형 완전양식입니다. 기술은 입증됐습니다 - 일본 긴키대(Kindai)가 2002년 태평양종 생활사를 최초로 폐쇄했고, 스페인 해양연구소(IEO ICRA)가 2023년 7월 육상 탱크에서 대서양 참다랑어 완전번식(수정란 300만+)에 세계 최초로 성공했습니다. 이를 토대로 넥스트튜나가 카스테욘에 부유식 해상 순환여과양식(RAS)을 추진(2024 파일럿 착수→2028 풀캐파 목표, €70M은 시스템 완성까지 전체 추정 투자액)하나, 노르투나(카보베르데)가 참다랑어 1만톤 계획을 접고 세리올라로 전환한 데서 보듯 상업화 난이도는 여전히 높습니다.",
        actionPlan: "완전양식을 '곧 올 공급 증분'이 아니라 '쿼터 탈피 옵션의 마일스톤 게이지'로 다루십시오. ① 향후 12~24개월은 볼륨이 아닌 단계 통과(첫먹이→10kg 이관 생존율, 상업 출하 첫 로트)를 추적 - 넥스트튜나 2028 일정의 지연 여부가 핵심 신호입니다. ② 노르투나 피벗은 '기술 가능 ≠ 상업 채산성'의 경고등이므로 완전양식 공급을 베이스 시나리오에서 0에 가깝게 두고 업사이드 옵션으로만 모델링하되, 본격화 시 ICCAT 쿼터·어획증명(CATCH) 게이트 밖 공급이 열리므로 스페인 해양연구소(IEO)·넥스트튜나와의 조기 인수계약(오프테이크) 옵션을 소액 실물옵션으로 선점할 가치가 있습니다.",
        source: "쿼터: ICCAT 동대서양·지중해 BFT TAC 40,570톤·EU 배분 21,503톤(EU 집행위 Oceans & Fisheries, 2023–2025) / 기술: IEO·The Fish Site·SeafoodSource(2023.07 완전번식 수정란 300만+) / mispeces·seafood.media(넥스트튜나 €70M=전체 추정 투자액·부유식 RAS·환경라이선스 2025.02) / Undercurrent News·SeafoodSource(노르투나 500t→1만t 계획 후 세리올라 전환) / globalseafood(긴키대 2002)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          {MILESTONES.map((m) => (
            <div key={m.yr} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: `${m.rc}0d`, border: `1px solid ${m.rc}2e`, borderLeft: `3px solid ${m.rc}`, borderRadius: '9px', padding: '9px 11px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: m.rc, minWidth: '52px' }}>{m.yr}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.66rem', color: 'var(--w-slate-200)', lineHeight: 1.45 }}>{m.label}</div>
              </div>
              <span style={{ fontSize: '0.54rem', color: m.rc, background: `${m.rc}1f`, padding: '2px 6px', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap' }}>{m.tag}</span>
            </div>
          ))}
          <div style={{ fontSize: '0.62rem', color: 'var(--w-slate-500)', lineHeight: 1.5, textAlign: 'center' }}>
            완전양식 = ICCAT 배분쿼터 탈피 레버 - 단 상업 채산성은 아직 '실물옵션'
          </div>
        </div>
      }
    />
  );
}
