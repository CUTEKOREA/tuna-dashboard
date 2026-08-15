'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import WidgetCard from '../WidgetCard';

const milestones = [
  { year: '2023', event: 'WCPO 가다랑어 수확전략 채택', detail: '세계 최대 참치 자원 (~1.7M MT/년)', status: 'done', color: '#10b981' },
  { year: '2023', event: '북태평양 날개다랑어 다중 RFMO 수확전략', detail: '최초의 다중 RFMO 공동 수확전략', status: 'done', color: '#10b981' },
  { year: '2025', event: 'MSC CRv3.1 시행', detail: '강화된 증거 요건, P2 기준 강화', status: 'active', color: '#38bdf8' },
  { year: '2026-27', event: 'IOTC 수확전략 채택 예정', detail: '지연 시 인도양 전 인증 정지 리스크', status: 'pending', color: '#f59e0b' },
  { year: '2027', event: 'MSC 표준 v3.0 개정 시행', detail: 'P2 강화, 유령어구 방지, MCS 강화', status: 'pending', color: '#f59e0b' },
  { year: '2030', event: 'SDG14 달성 목표', detail: '16개 자원에 HCR 도입 필요 (현재 7개)', status: 'target', color: '#ef4444' },
];

const statusLabels: Record<string, { text: string; bg: string; fg: string }> = {
  done: { text: '완료', bg: 'rgba(16,185,129,0.15)', fg: '#10b981' },
  active: { text: '진행 중', bg: 'rgba(56,189,248,0.15)', fg: '#38bdf8' },
  pending: { text: '예정', bg: 'rgba(245,158,11,0.15)', fg: '#f59e0b' },
  target: { text: '목표', bg: 'rgba(239,68,68,0.15)', fg: '#ef4444' },
};

export default function MscHarvestStrategyTimeline() {
  return (
    <WidgetCard
      id="W-MSC24"
      title="수확전략 마일스톤 타임라인"
      icon={Clock}
      iconColor="#f59e0b"
      pillar="S1"
      cardDesc="2023~2030 MSC 핵심 수확전략 채택 및 표준 개정 로드맵"
      telemetry={{ status: 'STATIC', syncDate: '2025' }}
      takeaway={{
        situation: "2023년 WCPO 가다랑어 수확전략 채택으로 세계 최대 참치 자원의 관리 기반이 마련되었습니다. 그러나 2030년 SDG14 달성까지 16개 자원에 HCR 도입이 필요하며, 특히 IOTC(인도양)의 수확전략 채택이 2026~27년으로 예정되어 있으나 지연 리스크가 높습니다.",
        actionPlan: "MSC 표준 v3.0(2027)은 P2(생태계) 기준을 대폭 강화할 예정입니다. 한국 선단은 2027년 이전에 ① 혼획 저감장치 도입, ② 유령어구 관리 프로토콜 수립, ③ 옵저버 커버리지 100% 달성을 선제적으로 추진해야 합니다.",
        source: "ISSF 2025-08, MSC Annual Report 2024-2025",
      }}
      customBody={
        <div style={{ position: 'relative', padding: '8px 0 0 28px', width: '100%' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: '14px', top: '16px', bottom: '16px',
            width: '2px', background: 'linear-gradient(to bottom, var(--w-emerald-500), var(--w-sky-400), var(--w-amber-500), var(--w-red-500))',
            borderRadius: '2px',
          }} />

          {milestones.map((m, i) => {
            const sl = statusLabels[m.status];
            return (
              <div key={i} style={{
                position: 'relative', paddingLeft: '24px', marginBottom: i < milestones.length - 1 ? '20px' : '0',
              }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute', left: '-21px', top: '4px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: m.color, border: '3px solid rgba(20, 28, 52, 0.8)',
                  boxShadow: `0 0 8px ${m.color}50`,
                }} />

                {/* Content */}
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap',
                }}>
                  <div style={{
                    fontSize: '0.78rem', fontWeight: 700, color: m.color,
                    minWidth: '50px', fontVariantNumeric: 'tabular-nums',
                  }}>
                    {m.year}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '2px' }}>
                      {m.event}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--w-slate-400)', lineHeight: 1.4 }}>
                      {m.detail}
                    </div>
                  </div>
                  <div style={{
                    padding: '2px 8px', borderRadius: '12px',
                    background: sl.bg, color: sl.fg,
                    fontSize: '0.65rem', fontWeight: 600, whiteSpace: 'nowrap',
                  }}>
                    {sl.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary bar */}
          <div style={{
            marginTop: '16px', marginLeft: '-24px', padding: '10px 14px', borderRadius: '8px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '0.72rem', color: 'var(--w-slate-400)',
          }}>
            <span>HCR 완전 이행: <strong style={{ color: 'var(--w-red-500)' }}>7 / 23</strong> 자원</span>
            <span>2030까지 필요: <strong style={{ color: 'var(--w-amber-500)' }}>+16</strong> 자원</span>
          </div>
        </div>
      }
    />
  );
}
