'use client';

import React from 'react';
import { BadgeCheck, ShieldCheck, Anchor, Building2, Fish } from 'lucide-react';
import WidgetCard from '../WidgetCard';

/* ── Data: 주요 수산 에코라벨의 인증 레지스트리 규모(공식 등록부 실측) ─────────
   출처: MSC 2024-25 Supplementary Data / Friend of the Sea 승인 선박 등록부(2026-04)
        / Earth Island Institute Dolphin Safe 승인 기업 목록(2026-05) / ASC 임팩트 보고서
   라벨마다 '단위'가 달라(어획량 vs 선박 vs 기업) 보증 강도·범위 차이를 함께 표기.   */

const labels = [
  {
    name: 'MSC',
    full: '해양관리협의회',
    metric: '1,480만 MT',
    metricNote: '연간 인증 어획량 (전 어종)',
    sub: '참치 285만 MT (참여 기준 305만) · 자연산 어업 단위 심사',
    scope: '자연산',
    color: '#10b981',
    icon: ShieldCheck,
    strength: '강 (제3자 현장심사·개선조건)',
  },
  {
    name: 'Friend of the Sea',
    full: '바다의 친구',
    metric: '4,907척',
    metricNote: '승인 선박 (2026.4 등록부)',
    sub: '선박 단위 등록 · 다국적 선단 포괄',
    scope: '자연산·양식',
    color: '#38bdf8',
    icon: Anchor,
    strength: '중 (선박 단위 기준)',
  },
  {
    name: 'Dolphin Safe',
    full: '돌고래 안전 (EII)',
    metric: '933개사',
    metricNote: '승인 기업 (82개국, 2026.5)',
    sub: '돌고래 혼획 1개 이슈 집중 · 기업 단위',
    scope: '참치 특화',
    color: '#a78bfa',
    icon: Building2,
    strength: '약 (단일 이슈·자기선언 기반)',
  },
  {
    name: 'ASC',
    full: '양식관리협의회',
    metric: '양식 전용',
    metricNote: '자연산 참치는 비해당',
    sub: '양식(farmed) 수산물 대상 — 참치캔 원물과 무관',
    scope: '양식',
    color: '#64748b',
    icon: Fish,
    strength: '강 (단, 자연산 비대상)',
  },
];

export default function MscEcolabelRegistryScale() {
  return (
    <WidgetCard
      id="W-MSC30"
      title="에코라벨 인증 레지스트리 규모"
      icon={BadgeCheck}
      iconColor="#10b981"
      pillar="S5"
      cardDesc="MSC·Friend of the Sea·Dolphin Safe·ASC의 공식 등록부 실측 규모 — 라벨별 단위·보증 강도 비교"
      telemetry={{ status: 'STATIC', syncDate: '2026-05' }}
      customBody={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {labels.map((l) => {
            const Icon = l.icon;
            return (
              <div key={l.name} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr auto', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '12px',
                background: `${l.color}0d`, border: `1px solid ${l.color}33`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                  background: `${l.color}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={l.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f1f5f9' }}>{l.name}</span>
                    <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>{l.full}</span>
                    <span style={{
                      fontSize: '0.58rem', fontWeight: 600, color: l.color,
                      background: `${l.color}1f`, borderRadius: '500px', padding: '1px 7px',
                    }}>{l.scope}</span>
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: '2px' }}>{l.sub}</div>
                  <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '1px' }}>보증 강도: {l.strength}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: l.color, lineHeight: 1.1 }}>{l.metric}</div>
                  <div style={{ fontSize: '0.58rem', color: '#94a3b8', marginTop: '2px', maxWidth: '120px' }}>{l.metricNote}</div>
                </div>
              </div>
            );
          })}
        </div>
      }
      takeaway={{
        situation: 'MSC는 연간 1,480만 톤(참치 285만 톤, 2024/25 회계연도)의 자연산 어획량을 제3자 현장심사로 인증하는 반면, Friend of the Sea는 4,907척 선박 등록, Dolphin Safe는 82개국 933개 기업을 돌고래 혼획 단일 이슈로 승인합니다. ASC는 양식 전용이라 자연산 참치캔과는 무관합니다.',
        actionPlan: '바이어가 요구하는 에코라벨이 무엇인지부터 확인해야 합니다. EU·영국 주류 리테일러는 MSC를 사실상 표준으로 요구하므로 MSC를 1순위로, 미국 시장은 Dolphin Safe를 병행 취득해 두 시장의 매대 진입 요건을 동시에 충족하는 듀얼 라벨 전략이 비용 대비 효과적입니다.',
        source: 'MSC 2024-25 Supplementary Data, Friend of the Sea 선박 등록부(2026-04), EII Dolphin Safe 기업목록(2026-05)',
      }}
    />
  );
}
