'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 미국 참치 수입·유통 경쟁 구도 (업계 2차 매체 종합) ──
   출처는 모두 공개 2차 매체(미디어·시장조사)이며 1차 RFMO/공시 교차검증은 미실시.
   True World Foods 23물류센터(미국·캐나다·런던·마드리드 합산)·8,200레스토랑·도요스 최대 참치수출상(Wikipedia·TWF·SeafoodSource),
   TWF 연매출 5억달러 이상(2020, SeafoodSource),
   FCF(대만) 연매출 약 17억달러(2020 추정) + Bumble Bee 인수 9.28억달러(2020, Undercurrent·Food Dive),
   StarKist/동원 미국 캔참치 점유 47.5%(2022, 시장조사 2차; 동원 IR 공식 약 46%) — 생물·사시미는 공백. */
const PLAYERS = [
  { flag: '🇯🇵', name: 'True World Foods', tag: '일본계 · 생물 사시미 유통 1위', rc: '#ef4444',
    stats: [['글로벌 물류센터', '23곳'], ['배송 레스토랑', '8,200개'], ['연매출', '5억달러+ (2020)']] },
  { flag: '🇹🇼', name: 'FCF (대만)', tag: '글로벌 참치 트레이딩 + 캔 수직계열', rc: '#38bdf8',
    stats: [['연매출', '약 17억달러 (2020 추정)'], ['Bumble Bee 인수', '9.28억달러 (2020)'], ['지배력', '원물 조달~브랜드 통합']] },
  { flag: '🇰🇷', name: '동원 / StarKist', tag: '캔참치 강자 · 생물 사시미는 공백', rc: '#f59e0b',
    stats: [['미국 캔참치 점유', '47.5% (2022, 2차)'], ['카테고리', '상온 캔 중심'], ['사시미 유통', '미진입 (기회 공간)']] },
];

export default function SasUsCompetitorMap() {
  return (
    <WidgetCard
      id="W-SAS33"
      title="미국 사시미 유통 경쟁 지도"
      description="일본·대만계 장악 구조와 한국의 생물 사시미 공백"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2026-06-05' }}
      cardDesc="미국 참치 수입·유통 주요 그룹 지배력 — TWF·FCF·동원 공개 2차 매체 종합(1차 교차검증 미실시)"
      takeaway={{
        situation: "미국 사시미 유통은 일본·대만계가 장악합니다. True World Foods(일본계)는 글로벌 23개 물류센터(미국·캐나다·런던·마드리드 합산)·8,200개 레스토랑 배송망으로 생물 사시미 공급 1위이며 도쿄 도요스 최대 참치수출상이 원천입니다. FCF(대만)는 연매출 약 17억달러(2020 추정)로 Bumble Bee를 9.28억달러(2020)에 인수해 원물 조달부터 브랜드까지 수직계열화했습니다. 한국 동원은 StarKist로 미국 캔참치 47.5%(2022, 시장조사 2차 기준; 동원 IR 공식 약 46%)를 점유하지만 상온 캔 중심이라 생물·사시미 유통 채널은 사실상 공백입니다.",
        actionPlan: "한국의 공백은 곧 진입 공간입니다. ① 캔(동원/StarKist)이 이미 확보한 미국 유통·B2B 신뢰를 레버리지해 -60℃ 사쿠/사시미급 콜드체인 유통으로 카테고리를 확장 — 캔 강자가 생물로 넘어가는 인접 확장입니다. ② True World가 쥔 8,200개 레스토랑 채널에 직접 경쟁하기보다, 포케·그로서리(코스트코 등) 리테일 사쿠 채널로 우회 진입해 일본계가 약한 소매 사쿠 세그먼트를 선점하십시오.",
        source: "공개 2차 매체 종합(1차 교차검증 미실시) — True World Foods 공식·Wikipedia·SeafoodSource(글로벌 23센터·8,200레스토랑·TWF 연매출 5억달러+ 2020) / Undercurrent·Food Dive(FCF 연매출 약 17억달러 2020 추정·Bumble Bee 9.28억달러 2020) / 시장조사 2차(StarKist 47.5% 2022; 동원 IR 공식 약 46%)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          {PLAYERS.map((p) => (
            <div key={p.name} style={{
              background: `${p.rc}0d`, border: `1px solid ${p.rc}2e`, borderLeft: `3px solid ${p.rc}`,
              borderRadius: '10px', padding: '11px 13px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.05rem' }}>{p.flag}</span>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f1f5f9' }}>{p.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: p.rc, background: `${p.rc}1f`, padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>{p.tag}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {p.stats.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '0.58rem', color: '#64748b' }}>{k}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ fontSize: '0.62rem', color: '#64748b', lineHeight: 1.5 }}>
            ※ 일본계(미쓰비시·도요레이조 등) 영향력 + 대만 FCF 수직계열이 원물~유통을 압박. 한국은 생물 사시미 유통이 빈 공간.
          </div>
        </div>
      }
    />
  );
}
