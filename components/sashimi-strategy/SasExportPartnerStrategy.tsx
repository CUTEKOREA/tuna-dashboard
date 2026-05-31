'use client';

import React from 'react';
import { Target } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const markets = [
  {
    flag: '🇺🇸', name: '미국', color: '#10b981',
    character: '사시미·포케/스시 소비대국, 냉동 saku/loin 수요',
    tariff: '신선/냉동 무관세 (2025~26 상호관세 사전심사)',
    entry: 'SIMP + FDA(CO 라벨) + 히스타민 HACCP',
    topPartner: 'True World Foods (NJ)',
    partnerNote: '이미 한국산 bigeye saku 매입 중',
    top5: [
      { name: 'True World Foods', note: '한국산 saku 실매입' },
      { name: 'Sea Delight', note: '전 포맷 일치' },
      { name: 'Anova Food', note: 'CO·소매 전문' },
      { name: 'H-Mart', note: '한국 직수입 테스트' },
      { name: 'Netuno/Annasea', note: '포케 OEM' },
    ],
  },
  {
    flag: '🇬🇧', name: '영국', color: '#38bdf8',
    character: '캔 위주이나 냉동 스테이크·프리팩 스시 성장',
    tariff: 'Korea-UK FTA → MFN 18% 회피 = 동남아 대비 결정적 우위',
    entry: 'IUU Catch Cert + EHC + MSC CoC (권장)',
    topPartner: 'NESI (New England Seafood)',
    partnerNote: 'M&S·Waitrose·Tesco 납품, 英 최대',
    top5: [
      { name: 'NESI', note: '英 최대 슈퍼프로즌 수입' },
      { name: 'Atari-Ya/T&S', note: '빠른 파일럿 가능' },
      { name: 'Direct Seafoods', note: '사시미급 라인 보유' },
      { name: 'Taiko Foods', note: 'YO! Sushi, 대량 YF' },
      { name: 'M&J Seafood', note: '전국 외식망' },
    ],
  },
  {
    flag: '🇯🇵', name: '일본', color: '#f59e0b',
    character: '세계 사시미 기준시장 (한국 횟감 ~80% 이미 일본행)',
    tariff: '마구로類 수은규제 면제, 관세 낮음',
    entry: '-60℃ 콜드체인 + 히스타민 HACCP + 상사/仲卸 경유',
    topPartner: '東洋冷蔵 (미쓰비시, 1위)',
    partnerNote: '6어종, 8영업소·9공장·자가 운반선단',
    top5: [
      { name: '東洋冷蔵', note: '사시미참치 1위' },
      { name: '双日/TRY', note: '연 2.6만톤 흡수력' },
      { name: 'やま幸', note: '프리미엄 직거래' },
      { name: '極洋 Kyokuyo', note: '적색육 보충수요' },
      { name: '三井物産', note: '글로벌 상사 채널' },
    ],
  },
];

const strategy = [
  { phase: '빠른 파일럿', desc: '소량·고마진·직거래', targets: 'H-Mart / Atari-Ya / やま幸', color: '#10b981', icon: '🚀' },
  { phase: '볼륨 확대', desc: '인증 후 대량 납품', targets: 'Sea Delight / NESI / 東洋冷蔵', color: '#38bdf8', icon: '📦' },
  { phase: 'OEM/화이트라벨', desc: '규격공급 첫거래', targets: 'Netuno / Annasea / Jana', color: '#a78bfa', icon: '🏭' },
];

export default function SasExportPartnerStrategy() {
  return (
    <WidgetCard
      id="W-SAS23"
      title="한국 공장 수출 파트너 전략 (미국·영국·일본)"
      icon={Target}
      iconColor="#f59e0b"
      pillar="S2"
      cardDesc="부산 감천항 기반 -60℃ 사시미 가공공장의 3대 시장별 최우선 파트너 & 진입 전략"
      telemetry={{ status: 'STATIC', syncDate: '2025' }}
      takeaway={{
        situation: "한국 사시미 가공공장의 수출 전략은 3대 시장별로 명확히 차별화됩니다. 미국은 True World Foods가 이미 한국산 bigeye saku를 매입 중이며, 영국은 Korea-UK FTA(MFN 18% 회피)가 동남아 대비 결정적 가격 우위입니다. 일본은 한국 횟감의 80%가 이미 진입해 있으나, 상사(東洋冷蔵)·仲卸(やま幸) 채널 다변화가 필요합니다.",
        actionPlan: "3단계 접근이 권장됩니다. ① 빠른 파일럿(H-Mart·Atari-Ya·やま幸, 소량 직거래로 검증), ② 볼륨 확대(BRC/SQF/MSC 인증 후 Sea Delight·NESI·東洋冷蔵), ③ OEM(Netuno·Annasea 포케 cube/saku 규격공급). 공통 준비물: SIMP/IUU 어획 데이터, -60℃ 콜드체인 문서, BRC/MSC 인증, 영문/일문 스펙시트.",
        source: "KR_Export_Partners_Dossier (KOTRA·SeafoodSource·Seafish·도쿄도 중앙도매시장·NOAA SIMP)",
      }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* 3 Market Cards */}
          {markets.map((m) => (
            <div key={m.name} style={{
              background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '14px',
              border: `1px solid ${m.color}20`, borderLeft: `3px solid ${m.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{m.flag}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: m.color }}>{m.name}</span>
                </div>
                <div style={{
                  padding: '3px 8px', borderRadius: '12px', fontSize: '0.6rem', fontWeight: 600,
                  background: `${m.color}15`, color: m.color, border: `1px solid ${m.color}30`,
                }}>
                  {m.topPartner}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  <strong style={{ color: '#cbd5e1' }}>시장:</strong> {m.character}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  <strong style={{ color: '#cbd5e1' }}>관세:</strong> {m.tariff}
                </div>
              </div>

              <div style={{ fontSize: '0.62rem', color: '#64748b', marginBottom: '8px' }}>
                <strong style={{ color: '#94a3b8' }}>진입요건:</strong> {m.entry}
              </div>

              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {m.top5.map((p, i) => (
                  <div key={p.name} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '3px 8px', borderRadius: '14px',
                    background: i === 0 ? `${m.color}15` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${i === 0 ? m.color + '30' : 'rgba(255,255,255,0.06)'}`,
                    fontSize: '0.6rem', color: i === 0 ? m.color : '#94a3b8', fontWeight: i === 0 ? 600 : 400,
                  }}>
                    <span style={{ fontWeight: 700, color: i === 0 ? m.color : '#64748b' }}>#{i + 1}</span>
                    {p.name}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Strategy phases */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {strategy.map((s) => (
              <div key={s.phase} style={{
                padding: '10px', borderRadius: '8px', textAlign: 'center',
                background: `${s.color}08`, border: `1px solid ${s.color}15`,
              }}>
                <div style={{ fontSize: '1rem', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: s.color }}>{s.phase}</div>
                <div style={{ fontSize: '0.58rem', color: '#94a3b8', marginTop: '2px' }}>{s.desc}</div>
                <div style={{ fontSize: '0.55rem', color: '#64748b', marginTop: '4px' }}>{s.targets}</div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}
