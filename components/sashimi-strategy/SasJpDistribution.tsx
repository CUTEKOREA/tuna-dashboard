'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 도요스 너머: 일본 사시미 유통 구조·상사 수직지배 (MAFF·기업공시) ──
   검증(solid): 도매시장 경유율 ~47%(2018, 20년 전 대비 ~3할 하락), 도요레이조(미쓰비시상사 계열)=
   사시미 참치 톱클래스·-50℃ 초저온 일관(8영업거점/2가공장), 중앙도매 수산 34곳(29개 도시).
   정정: 가정80/외식20·시장외 70~80% 등 미검증 수치 제외. */
const ITEMS = [
  { rc: '#f59e0b', title: '도매시장 경유율 붕괴', value: '약 47%', desc: '20년 전 대비 약 3할 하락(2018) — 산지 직거래·시장외 유통이 도요스 경매 비중을 잠식.' },
  { rc: '#ef4444', title: '상사 수직계열 지배', value: '미쓰비시', desc: '도요레이조(TOREI, 미쓰비시상사 계열)가 일본 사시미 참치 톱클래스 — 운반선·가공선·-50℃ 냉장창고·가공장(8영업거점/2가공장) 일관 밸류체인.' },
  { rc: '#38bdf8', title: '중앙도매시장(수산)', value: '34곳', desc: '29개 도시 34개 중앙도매 + 다수 지방시장. 도요스는 그중 최대 상징 시장일 뿐 가격선도 역할.' },
];

export default function SasJpDistribution() {
  return (
    <WidgetCard
      id="W-SAS56"
      title="도요스 너머 — 일본 사시미 유통 구조"
      description="시장 경유율 붕괴 + 상사(미쓰비시) 수직계열 지배"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      cardDesc="일본 도매시장 경유율·상사 수직계열·중앙도매 구조 — MAFF 수산백서·기업공시"
      takeaway={{
        situation: "도요스는 일본 사시미의 상징이자 가격선도 시장이지만, 실제 물류는 그 너머에서 재편되고 있습니다. 도매시장 경유율은 20년 전 대비 약 3할 하락해 2018년 약 47%까지 떨어졌고, 산지 직거래·시장외 유통이 경매 비중을 잠식합니다. 동시에 종합상사가 밸류체인을 수직 지배합니다 — 미쓰비시상사 계열 도요레이조(TOREI)가 일본 사시미 참치 톱클래스로 운반선·가공선·-50℃ 초저온 냉장창고·가공장(8영업거점/2가공장)을 일관 운영합니다. 즉 도요스 경매가는 가격 신호일 뿐, 물량과 마진은 상사 수직계열로 흘러갑니다.",
        actionPlan: "對일본 진입은 '도요스 경매 진입'이 아니라 '수직계열 상사와의 관계'가 본질입니다. ① 한국 사시미급을 일본에 팔려면 미쓰비시(도요레이조) 같은 상사의 -50℃ 콜드체인·가공 네트워크에 원료/반제품으로 편입되는 B2B 공급 관계가 경매 직판보다 현실적입니다. ② 시장외 직거래 비중 상승은 산지→외식·소매 직공급 채널이 열리고 있음을 의미 — 도요스를 우회한 직거래 라우트(고급 외식·EC)를 병행 개척하십시오.",
        source: "MAFF 수산백서(도매시장 경유율 ~47%, 2018·20년 전 대비 ~3할 하락) / 미쓰비시상사·도요레이조 공시(사시미 참치 톱클래스·-50℃ 일관·8영업거점/2가공장) / 농림수산성(중앙도매 수산 34곳)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          {ITEMS.map((it) => (
            <div key={it.title} style={{ background: `${it.rc}0d`, border: `1px solid ${it.rc}2e`, borderLeft: `3px solid ${it.rc}`, borderRadius: '10px', padding: '11px 13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f1f5f9' }}>{it.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: 800, color: it.rc }}>{it.value}</span>
              </div>
              <span style={{ fontSize: '0.64rem', color: '#94a3b8', lineHeight: 1.45 }}>{it.desc}</span>
            </div>
          ))}
        </div>
      }
    />
  );
}
