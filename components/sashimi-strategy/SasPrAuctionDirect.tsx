'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 경매 가격발견 vs 직거래 부두값 — 글로벌 참치 가치배분 2층위 (PLOS One·PNA) ──
   검증(solid): 도요스 일일 생물 ~200미+냉동 ~1,000미, 도쿄=글로벌 가격선도(PLOS One 2019),
   PNA VDS 입어료 ~$60M→2016 ~$500M(부두/렌트 가치포착 상승).
   정정: PNA 가다랑어 EEZ 비중 ~75%(WCPO 가다랑어 기준), 부두 가치포착 2~3%→25%는 방향성만(2차출처). */
const LAYERS = [
  { rc: '#f59e0b', tag: '상층 — 경매 가격발견', title: '도요스(도쿄) 글로벌 가격선도',
    rows: [['일일 거래', '생물 ~200미 + 냉동 ~1,000미'], ['역할', '냉동 블루핀 글로벌 가격선도자(PLOS One)'], ['특징', '투명 경매 → 전세계 직거래가의 기준점']] },
  { rc: '#38bdf8', tag: '하층 — 직거래 부두값', title: '산지 부두·입어료(렌트)',
    rows: [['PNA 입어료(렌트)', '~$60M → 2016 ~$500M'], ['가치포착', '도서국 렌트 상승(부두값 추세 ↑)'], ['연동', '직거래 부두값이 경매 가격선도에 후행 연동']] },
];

export default function SasPrAuctionDirect() {
  return (
    <WidgetCard
      id="W-SAS58"
      title="경매 가격발견 vs 직거래 부두값"
      description="도요스 경매가 = 글로벌 기준점, 부두값은 후행 연동"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2024' }}
      cardDesc="글로벌 참치 가격형성 2층위(경매 가격발견·직거래 부두/렌트) — PLOS One 2019·PNA"
      takeaway={{
        situation: "글로벌 참치 가격은 두 층위로 형성됩니다. 상층은 도요스(도쿄) 경매로, 일일 생물 약 200미·냉동 약 1,000미가 거래되며 냉동 블루핀의 '단일 글로벌 가격선도자' 역할(PLOS One 2019)을 해 전세계 직거래가의 기준점이 됩니다. 하층은 산지 부두값·입어료(렌트)로, PNA 도서국 입어수입이 약 $60M에서 2016년 약 $500M으로 급증하며 원물 단계 가치포착이 커졌습니다. 즉 직거래 부두값은 경매 가격발견에 후행 연동되며, 가치는 경매(소비지)와 부두/렌트(산지) 양 끝에서 배분됩니다.",
        actionPlan: "가격형성 2층위를 이해하면 마진 포착 지점이 보입니다. ① 도요스 경매가가 글로벌 기준점이므로 한국 공급가는 경매 신호에 연동해 동적으로 책정하되, ② 경매(소비지)와 부두/렌트(산지) 사이의 중간 유통 마진이 가장 크므로, 한국 원양이 '산지 어획 + 자체 가공·직판'으로 두 층위를 모두 내재화하면 경매·중간상에 배분되던 가치를 흡수할 수 있습니다. 입어료(렌트) 상승은 산지 비용 압박이므로 어획효율로 방어하십시오.",
        source: "Nippon.com(도요스 일일 생물 ~200미·냉동 ~1,000미) / PLOS One 2019(도쿄=글로벌 가격선도자) / Wiley·PNA(VDS 입어료 ~$60M→2016 ~$500M)",
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
                    <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{k}</span>
                    <span style={{ fontSize: '0.66rem', fontWeight: 600, color: '#e2e8f0', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', fontSize: '0.6rem', color: '#64748b' }}>
            🧭 최대 마진 = 경매(소비지)~부두(산지) 사이 중간 유통 → 한국 원양 자체 가공·직판으로 내재화
          </div>
        </div>
      }
    />
  );
}
