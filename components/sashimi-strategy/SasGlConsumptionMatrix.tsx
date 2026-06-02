'use client';

import React from 'react';
import WidgetCard from '../WidgetCard';

/* ── 국가별 참치 사시미 소비시장 비교 (6개국 × 어종/등급/소비처/규모) ──
   검증(FAO GLOBEFISH·IMARC·WWF Japan·CBI·BlueWeave·IndexBox): 일본 세계 참치 1/4~1/5 소비·참다랑어 72%,
   미국 스시외식 $279억·포케 $61억, 한국 무한리필 731개, 중국 일식당 4만개, EU 일식당 1.2만개.
   ※주의: '사시미 단독' 공식 시장규모 통계는 부재 → 외식채널·수입물량 근사. 정정: 중국 가다랑어 $1,418/t. */
const ROWS = [
  { rc: '#ef4444', flag: '🇯🇵', name: '일본', size: '세계 최대(1/4~1/5 소비)', mass: '눈다랑어 30%·황다랑어', prem: '참다랑어(세계 72%)', ch: '회전초밥·오마카세·도요스' },
  { rc: '#10b981', flag: '🇺🇸', name: '미국', size: '스시외식 $279억·포케 $61억', mass: '황다랑어(Ahi)·포케', prem: '블루핀·빅아이(오마카세)', ch: '스시·포케체인·코스트코' },
  { rc: '#f59e0b', flag: '🇰🇷', name: '한국', size: '횟감 ~$500M(추정)', mass: '눈다랑어·황다랑어', prem: '참다랑어·뱃살(토로)', ch: '무한리필 731개·전문점' },
  { rc: '#38bdf8', flag: '🇨🇳', name: '중국', size: '총참치 $1.76B(사시미 niche)', mass: '황다랑어 AAA 사쿠', prem: '블루핀(상하이 집중)', ch: '일식당 4만개·이커머스' },
  { rc: '#a78bfa', flag: '🇹🇼🇭🇰', name: '대만·홍콩', size: '소규모·프리미엄 편중', mass: '빅아이·황다랑어', prem: '블루핀(동강·홍콩 Toyosu)', ch: '동강축제·홍콩 오마카세' },
  { rc: '#22d3ee', flag: '🇪🇺', name: 'EU', size: '캔 위주, 사시미 niche', mass: '황다랑어(역외 신선 75%)', prem: '지중해 블루핀(대부분 일본行)', ch: '일식당 1.2만개·슈퍼스시' },
];

export default function SasGlConsumptionMatrix() {
  return (
    <WidgetCard
      id="W-SAS65"
      title="국가별 참치 사시미 소비시장 비교"
      description="6개국 × 규모·주어종·프리미엄·소비채널 매트릭스"
      pillar="S4"
      telemetry={{ status: 'STATIC', syncDate: '2024-25' }}
      cardDesc="국가별 사시미 소비 규모·어종·등급·채널 — FAO GLOBEFISH·IMARC·WWF Japan·CBI·IndexBox(외식·수입 근사)"
      takeaway={{
        situation: "참치 사시미 소비는 국가마다 어종·등급·채널이 뚜렷이 갈립니다. 일본은 세계 참치의 1/4~1/5을 소비하는 압도적 1위로 눈다랑어(메바치) 30%가 대중 주력이고 참다랑어(세계 소비의 72%)가 프리미엄 정점입니다. 미국은 황다랑어(Ahi) 포케·사쿠 대중 시장(포케 외식 $61억)과 블루핀 오마카세 프리미엄으로 이원화됐고, 한국은 눈다랑어 '가성비 횟감'과 무한리필 731개 채널이 특징입니다. 중국은 폭증 수입의 대부분이 가공용 저가 가다랑어이고 사시미는 황다랑어 AAA 사쿠 중심의 신흥 niche(일식당 4만개), EU는 캔 위주 시장에서 사시미가 소수입니다. ⚠ 모든 국가에서 '사시미 단독' 공식 시장규모 통계는 부재해 외식·수입 물량으로 근사한 수치입니다.",
        actionPlan: "한국 수출 포트폴리오를 국가별 어종·등급에 맞춰 분기하십시오. ① 일본·홍콩·대만·중국 상하이는 블루핀·고지방 프리미엄 정점 시장 — 한국 양식·고급 참다랑어를 오마카세·호텔 일식에 직공급. ② 미국·중국 대중·EU는 황다랑어 사쿠·포케급이 물량 주력 — 동원 슈퍼튜나식 ULT로 색·등급을 보존해 포케급을 사시미급으로 끌어올리면 마진을 30%+ 포착. ③ 한국 무한리필·중국 일식당 급증 같은 외식 채널 성장처에 B2B 식자재로 진입하십시오.",
        source: "FAO GLOBEFISH·IMARC(일본)·Statista/Technavio(미국 스시 $279억·포케 $61억)·WWF Japan(참다랑어 72%)·IMARC/MRFR(한국)·BlueWeave/IndexBox(중국)·CBI(EU). ※사시미 단독 통계 부재로 외식·수입 근사",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', width: '100%' }}>
          {ROWS.map((r) => (
            <div key={r.name} style={{ background: `${r.rc}0d`, border: `1px solid ${r.rc}2e`, borderLeft: `3px solid ${r.rc}`, borderRadius: '9px', padding: '8px 11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.92rem' }}>{r.flag}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f1f5f9' }}>{r.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.58rem', color: r.rc, fontWeight: 600 }}>{r.size}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px' }}>
                <div><span style={{ fontSize: '0.52rem', color: '#64748b' }}>대중 어종 </span><span style={{ fontSize: '0.6rem', color: '#e2e8f0', fontWeight: 600 }}>{r.mass}</span></div>
                <div><span style={{ fontSize: '0.52rem', color: '#64748b' }}>프리미엄 ★ </span><span style={{ fontSize: '0.6rem', color: '#e2e8f0', fontWeight: 600 }}>{r.prem}</span></div>
                <div style={{ gridColumn: '1 / -1' }}><span style={{ fontSize: '0.52rem', color: '#64748b' }}>채널 </span><span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{r.ch}</span></div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: '0.56rem', color: '#64748b', lineHeight: 1.5, textAlign: 'center' }}>
            ⚠ '사시미 단독' 공식 시장규모 통계 부재 → 외식·수입물량 근사 · 등급: 블루핀(정점)〉빅아이〉황다랑어, 가다랑어=캔 전용
          </div>
        </div>
      }
    />
  );
}
