'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 경매 가격발견 vs 직거래 부두값 — 글로벌 참치 가치배분 2층위 ──
   검증(solid): 도요스 일일 생물 ~200미+냉동 ~1,000미(Nippon.com),
   PNA VDS 입어료 ~$60M(2010)→2018 ~$500M(부두/렌트 가치포착 상승; 2016은 $450M+ 검증치로 $500M은 2018 도달치 — FAO Tech.Paper 667 Ch.12).
   주의: 도요스 경매의 '냉동 블루핀 글로벌 가격선도' 단정은 인용된 PLOS One 2019(pone.0221147)가 뒷받침하지 않음
   — 해당 연구는 냉동 BFT 대다수가 경매 미경유·직판이며 가격선도(price leadership) 실증검정이 없고,
   분석시장도 쓰키지/아다치/오타(2003-2016)로 도요스가 아님. 따라서 '신선 BFT의 가격참조·냉동은 간접영향'으로 톤다운.
   PNA 가다랑어 EEZ 비중 ~75%(WCPO 가다랑어 기준), 부두 가치포착 2~3%→25%는 방향성만(2차출처). */
const LAYERS = [
  { rc: '#f59e0b', tag: '상층 — 경매 가격발견', title: '도요스(도쿄) 신선 참치 가격참조',
    rows: [['일일 거래', '생물 ~200미 + 냉동 ~1,000미'], ['역할', '신선 블루핀 가격참조 시장(냉동은 간접영향)'], ['특징', '투명 경매 → 직거래가 협상의 참조점(업계 통념)']] },
  { rc: '#38bdf8', tag: '하층 — 직거래 부두값', title: '산지 부두·입어료(렌트)',
    rows: [['PNA 입어료(렌트)', '~$60M → 2018 ~$500M'], ['가치포착', '도서국 렌트 상승(부두값 추세 ↑)'], ['연동', '직거래 부두값과 경매 신호는 상호 참조']] },
];

export default function SasPrAuctionDirect() {
  return (
    <WidgetCard
      id="W-SAS58"
      title="경매 가격발견 vs 직거래 부두값"
      description="도요스 경매가 = 신선 참치 가격참조, 부두값은 상호 연동"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2024-01-01' }}
      cardDesc="글로벌 참치 가격형성 2층위(경매 가격참조·직거래 부두/렌트) — Nippon.com·PNA(VDS). 도요스 글로벌 가격선도 단정은 1차출처 미입증으로 신선 BFT 가격참조로 톤다운"
      takeaway={{
        situation: "글로벌 참치 가격은 두 층위로 형성됩니다. 상층은 도요스(도쿄) 경매로, 일일 생물 약 200미·냉동 약 1,000미가 거래되며 신선 블루핀의 투명한 가격참조 시장 역할을 합니다(냉동 BFT는 대부분 경매를 거치지 않고 직판되어 간접 영향에 그칩니다 — PLOS One 2019는 도요스의 글로벌 가격선도를 실증하지 않으며 분석시장도 쓰키지·오타입니다). 하층은 산지 부두값·입어료(렌트)로, PNA 도서국 입어수입이 약 $60M(2010)에서 2018년 약 $500M으로 급증하며(2016년 이미 $450M+ 검증치) 원물 단계 가치포착이 커졌습니다. 즉 직거래 부두값과 경매 신호는 상호 참조되며, 가치는 경매(소비지)와 부두/렌트(산지) 양 끝에서 배분됩니다.",
        actionPlan: "가격형성 2층위를 이해하면 마진 포착 지점이 보입니다. ① 도요스 경매가는 신선 참치의 주요 가격참조 신호이므로 한국 공급가 책정 시 참조하되 냉동·직판가는 별도 협상 채널을 두고, ② 경매(소비지)와 부두/렌트(산지) 사이의 중간 유통 마진이 가장 크므로, 한국 원양이 산지 어획 + 자체 가공·직판으로 두 층위를 모두 내재화하면 경매·중간상에 배분되던 가치를 흡수할 수 있습니다. 입어료(렌트) 상승은 산지 비용 압박이므로 어획효율로 방어하십시오.",
        source: "Nippon.com(도요스 일일 생물 ~200미·냉동 ~1,000미) / PLOS One 2019 pone.0221147(쓰키지·오타 신선 BFT 경매가 분석; 도요스 글로벌 가격선도 실증 아님 — 본 위젯은 신선 가격참조로만 인용) / PNA·FFA(VDS 입어료 ~$60M(2010)→2018 ~$500M) / Clark·Bell·Adams 외(2021) FAO Fisheries Tech.Paper 667 Ch.12(2016 입어료 $450M+ 검증; 원천 FFA 2018a,b)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          {LAYERS.map((l) => (
            <div key={l.tag} style={{ background: `${l.rc}0d`, border: `1px solid ${l.rc}2e`, borderLeft: `3px solid ${l.rc}`, borderRadius: '10px', padding: '11px 13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, color: l.rc, background: `${l.rc}22`, padding: '2px 7px', borderRadius: '4px' }}>{l.tag}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f1f5f9' }}>{l.title}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {l.rows.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--w-slate-500)' }}>{k}</span>
                    <span style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--w-slate-200)', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--w-slate-500)' }}>
            최대 마진 = 경매(소비지)~부두(산지) 사이 중간 유통 → 한국 원양 자체 가공·직판으로 내재화
          </div>
        </div>
      }
    />
  );
}
