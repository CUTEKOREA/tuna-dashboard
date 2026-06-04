'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 한국의 두 경로: 태국 원물공급 vs 영국 완제품 직수출 ──
   검증: 태국行 가다랑어 수출 $150.1M(14.8%·3위 공급국) — UN Comtrade 2024 무료 1차에서 재현
   (IndexBox는 동일 Comtrade 재가공 2차). 원물 캔용 단가 $1.4~1.9/kg(방콕 가다랑어, 업계 추정),
   태국 對美 19% 상호관세(2025-08, USTR 확정). 영국 MFN '20%p 핸디캡'은 1차 확인:
   캔참치(HS1604 14) 제3국(erga omnes) MFN 세율 20.00%, 태국은 DCTS 비수혜·UK-태국 FTA 부재로
   특혜 없이 전액 부담 → FTA·DCTS(0%) 대비 약 20%p 격차 (HMRC UK Integrated Online Tariff, Heading 1604).
   ※부가가치 '7~12x' 배수는 어종 비교오류로 삭제. */
const ROUTES = [
  {
    rc: '#38bdf8', tag: '경로 A — 원물 공급', title: '한국 → 태국 가공 허브',
    rows: [['태국行 가다랑어 수출', '$150.1M (14.8%)'], ['공급국 순위', '태국 수입 3위'], ['원물 캔용 단가', '$1.4~1.9/kg'], ['리스크', '태국 對美 19% 상호관세(25년) → 원료가 하방']],
    foot: '저마진 벌크 원물. 태국 단일 고객 의존도가 가격 협상력을 약화.',
  },
  {
    rc: '#10b981', tag: '경로 B — 완제품 직수출', title: '한국 → 영국 (FTA 우회)',
    rows: [['Korea-UK FTA 관세', '완제품 0%'], ['태국 대비 우위', '영국 MFN 20% 우회 (약 20%p)'], ['타깃', '스시·투고 외식 식자재'], ['포지션', '태국 가공 우회·고부가']],
    foot: 'MSC·스시그레이드로 차별화 시 무관세 + 프리미엄 동시 확보.',
  },
];

export default function SasKrDualRoute() {
  return (
    <WidgetCard
      id="W-SAS39"
      title="한국 두 경로 분기 (태국 원물 vs 영국 직수출)"
      description="저마진 원물 공급 vs 무관세 완제품 직수출의 자원 배분"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2026-06-05' }}
      cardDesc="한국의 태국 원물공급·영국 완제품 직수출 두 경로 비교 — UN Comtrade 2024·신라홀딩스 공식·자유무역협정(FTA) 기반"
      takeaway={{
        situation: "한국은 영국·태국 밸류체인에서 두 갈래 경로를 동시에 갖습니다. 경로 A는 태국 가공 허브에 원물을 공급하는 것으로, 2024년 태국行 가다랑어 수출이 $150.1M(가치 14.8%, 태국 수입 3위 공급국 — UN Comtrade)이나 캔용 원물 단가가 $1.4~1.9/kg에 그치는 저마진 벌크입니다. 경로 B는 한·영 자유무역협정(Korea-UK FTA, 완제품 0%)으로 영국에 직수출하는 것으로, 영국이 태국산 캔참치(HS1604 14)에 매기는 최혜국(MFN) 20.00% 관세를 우회해 고부가 스시·투고 채널을 겨냥합니다(태국은 영국 개발도상국 무역특혜제도(DCTS) 비수혜·UK-태국 FTA 부재로 20% 전액 부담 — 한·영 FTA 0% 대비 약 20%p 격차, HMRC 통합관세표 Heading 1604 확인). 태국의 對美 19% 상호관세(2025-08, USTR)가 원료가를 압박할수록 경로 A의 매력은 약화되고 경로 B의 상대 가치가 상승합니다.",
        actionPlan: "자원 배분을 경로 B(영국 직수출) 쪽으로 점진 이동하십시오. ① 경로 A는 태국 단일 고객 의존을 낮추고 유럽연합(EU)·일본 직판을 병행해 원료 협상력을 방어 — 신라홀딩스 선단(선망 17·연승 9·운반 1)의 원양 어획을 벌크 원물에만 묶지 마십시오. ② 경로 B는 무관세(0%) + 해양관리협의회(MSC) 인증·스시그레이드 프리미엄을 결합해 영국 외식 식자재로 직진입 — 태국 가공 마진을 한국이 내재화하는 구조 전환입니다. 태국 관세·ESG 리스크 상승기에 경로 B 비중 확대가 정답입니다.",
        source: "UN Comtrade 2024(태국行 한국 가다랑어 $150.1M·14.8%·태국 수입 3위, IndexBox 재가공과 일치) / 방콕 가다랑어 캔용 단가 $1.4~1.9/kg(업계 추정) / 한·영 자유무역협정(Korea-UK FTA, 완제품 0%) / 미 USTR 상호관세 19%(태국, 2025-08) / 영국 對태국 MFN 20.00%(HMRC UK Integrated Online Tariff, HS1604 14 제3국 세율) — 태국 DCTS 비수혜·UK-태국 FTA 부재로 한·영 FTA 0% 대비 약 20%p / 신라홀딩스 공식(선단 구성)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {ROUTES.map((r) => (
              <div key={r.tag} style={{ background: `${r.rc}0d`, border: `1px solid ${r.rc}2e`, borderTop: `3px solid ${r.rc}`, borderRadius: '10px', padding: '11px 12px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: r.rc, background: `${r.rc}22`, padding: '2px 7px', borderRadius: '4px' }}>{r.tag}</span>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>{r.title}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {r.rows.map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{k}</span>
                      <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#e2e8f0', textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '0.58rem', color: r.rc, lineHeight: 1.45, background: `${r.rc}12`, borderRadius: '6px', padding: '6px 8px' }}>{r.foot}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.62rem', color: '#64748b', lineHeight: 1.5, textAlign: 'center' }}>
            태국 관세·ESG 리스크 상승기 → 경로 B(영국 직수출) 비중 확대가 한국의 마진 내재화 전략
          </div>
        </div>
      }
    />
  );
}
