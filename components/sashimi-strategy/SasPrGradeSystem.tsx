'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 참치 사시미 등급(grade) 체계 — 색·지방이 가격을 가르는 구조 (업계 관행) ──
   검증(solid): 등급 #1(선홍·고지방·탄력)~#3(적갈·구이용), 판정 꼬리노치+sashibo 코어샘플,
   otoro 25~30%(겨울 40%)·chutoro 15~20% 지방, Fukuya 소매 otoro=akami 약 1.5배.
   정정: 공식 법정표준 없음('업계 관행/일본식 척도')로 프레이밍, 단가는 '참고/도체기준'. */
const GRADES = [
  { g: '#1', rc: '#ef4444', desc: '선홍색·투명감·고지방·탄력 — 최상급 사시미(오마카세)', price: '최고가' },
  { g: '#2+', rc: '#f59e0b', desc: '준수한 색·지방 — 고급 사시미/포케', price: '중상' },
  { g: '#2', rc: '#38bdf8', desc: '표준 사시미급 — 일반 외식·소매', price: '중' },
  { g: '#3', rc: '#64748b', desc: '적갈색·저지방 — 가열용(구이·통조림)', price: '저' },
];

export default function SasPrGradeSystem() {
  return (
    <WidgetCard
      id="W-SAS57"
      title="참치 사시미 등급 체계 (#1~#3)"
      description="색·지방·탄력이 가격을 가르는 업계 등급 구조"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2025-26' }}
      cardDesc="참치 사시미 등급 판정 기준·부위 지방함량·등급별 단가 배수 — 업계 관행(공식 표준 없음)"
      takeaway={{
        situation: "참치 사시미 가격은 어종·중량보다 '등급(grade)'이 가릅니다. 등급은 #1(선홍색·투명감·고지방·탄력 — 최상급)부터 #3(적갈색·저지방 — 가열용)까지 색·지방·탄력으로 매겨지며, 꼬리 노치 절단면과 아가미 뒤 코어샘플(sashibo)을 스포트라이트로 보고 황다랑어·눈다랑어는 색, 참다랑어는 지방으로 판정합니다. 부위별 지방은 오토로 25~30%(겨울 40%)·추토로 15~20%로, 소매가는 오토로가 아카미의 약 1.5배입니다. 단 이 등급은 법정 표준이 아니라 유통사별 편차가 있는 업계 관행·일본식 척도입니다.",
        actionPlan: "등급이 단가를 결정하므로 한국 공급의 핵심은 '등급 보존·등급 표준화'입니다. ① 어획~가공~수출 전 단계 콜드체인(-60℃)으로 #1 등급 비율을 높이면 같은 어종이라도 단가가 1.5배 이상 벌어지므로, 등급 유지 capex가 곧 마진입니다. ② 등급 판정이 주관적·유통사별 편차가 크다는 점을 역이용해, 한국산에 일관된 등급 판정·디지털 기록(트레이서빌리티)을 붙여 바이어 신뢰를 프리미엄으로 전환하십시오.",
        source: "Catalina Offshore·Samuels·BD Outdoors(등급 #1~#3 판정 기준·sashibo 코어샘플) / Sushi University·Umami Insider(오토로 25~30%·추토로 15~20% 지방) / Fukuya 소매(오토로=아카미 약 1.5배). ※공식 법정표준 아닌 업계 관행",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', width: '100%' }}>
          {GRADES.map((g) => (
            <div key={g.g} style={{ display: 'flex', alignItems: 'center', gap: '11px', background: `${g.rc}0d`, border: `1px solid ${g.rc}2e`, borderLeft: `3px solid ${g.rc}`, borderRadius: '9px', padding: '10px 12px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: g.rc, minWidth: '34px' }}>{g.g}</span>
              <span style={{ flex: 1, fontSize: '0.66rem', color: '#e2e8f0', lineHeight: 1.4 }}>{g.desc}</span>
              <span style={{ fontSize: '0.6rem', color: g.rc, background: `${g.rc}1f`, padding: '2px 8px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>{g.price}</span>
            </div>
          ))}
          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#94a3b8' }}>
            오토로 지방 <span style={{ color: '#ef4444', fontWeight: 700 }}>25~30%</span>(겨울 40%) · 소매 오토로=아카미 <span style={{ color: '#f59e0b', fontWeight: 700 }}>1.5배</span>
          </div>
        </div>
      }
    />
  );
}
