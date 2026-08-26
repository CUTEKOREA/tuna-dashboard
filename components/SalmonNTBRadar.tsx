"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, AlertCircle, RefreshCcw, FileSearch } from 'lucide-react';
import WidgetCard from './WidgetCard';
import { getSalmonData } from '@/lib/data/salmon';

const rawData = getSalmonData('ntbRadar');
const staticItems = rawData.complianceItems;

export default function SalmonNTBRadar() {
  const [loading, setLoading] = useState(true);
  const items = staticItems;

  const fetchComplianceData = useCallback(async () => {
    try {
      await fetch('/api/wits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hsCode: '030214', reporter: '410', partner: '152' }),
      });
    } catch (e) { console.warn('[NTB] WITS error:', e); }

    try {
      await fetch('/api/risk-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: 'Russian Federation Salmon', country: '러시아', hsCode: '030214' }),
      });
    } catch (e) { console.warn('[NTB] OFAC error:', e); }

    setLoading(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void fetchComplianceData();
    }, 0);
    return () => window.clearTimeout(id);
  }, [fetchComplianceData]);

  const handleRefresh = () => {
    setLoading(true);
    void fetchComplianceData();
  };

  const statusConfig: any = {
    safe: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: '🟢 정상', icon: CheckCircle },
    warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: '🟡 주의', icon: AlertTriangle },
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: '🔴 위험', icon: AlertCircle },
    monitor: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', label: '🔵 모니터링', icon: FileSearch },
  };

  const counts = {
    safe: items.filter(i => i.status === 'safe').length,
    monitor: items.filter(i => i.status === 'monitor').length,
    warning: items.filter(i => i.status === 'warning').length,
    critical: items.filter(i => i.status === 'critical').length,
  };

  const body = (
    <div style={{ padding: '0 0 0.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
        <button onClick={handleRefresh} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--w-slate-500)', padding: '4px',
        }}>
          <RefreshCcw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
        {items.map((item, i) => {
          const cfg = statusConfig[item.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={i} style={{
              background: cfg.bg, border: `1px solid ${cfg.border}`,
              borderRadius: '8px', padding: '0.9rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <StatusIcon size={14} color={cfg.color} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--w-slate-50)' }}>{item.regulation}</span>
                </div>
                <span style={{
                  fontSize: '0.6rem', padding: '1px 5px', borderRadius: '3px',
                  background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontWeight: 600,
                }}>{cfg.label}</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--w-slate-400)', marginBottom: '0.3rem' }}>{item.country}</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--w-slate-300)', lineHeight: 1.5, margin: '0 0 0.4rem 0' }}>{item.detail}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.6rem', color: '#475569' }}>📡 {item.source}</span>
                {item.researchBasis && (
                  <span style={{ fontSize: '0.55rem', color: 'var(--w-slate-500)', fontStyle: 'italic', maxWidth: '60%', textAlign: 'right' }}>
                    📚 {item.researchBasis.slice(0, 40)}...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '0.75rem',
        padding: '0.6rem 0.5rem',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        {(['safe', 'monitor', 'warning', 'critical'] as const).map(s => (
          counts[s] > 0 ? (
            <span key={s} style={{ fontSize: '0.7rem', color: statusConfig[s].color, fontWeight: 600 }}>
              {statusConfig[s].label} {counts[s]}건
            </span>
          ) : null
        ))}
      </div>
    </div>
  );

  return (
    <WidgetCard
      title="비관세장벽 & 컴플라이언스 레이더"
      icon={Shield}
      iconColor="#3b82f6"
      pillar="S3"
      cardDesc="WITS·MFDS·KMI 정책연구 스냅샷(STATIC)"
      telemetry={{ status: 'STATIC', syncDate: '2026-05-29' }}
      customBody={body}
      takeaway={{
        situation: `<div>
<p>"NTB(Non-Tariff Barrier, 비관세 장벽) 레이더"는 글로벌 6개 비관세 규제 트랙을 실시간 모니터링하는 dashboard.</p>
<p>현황: 정상 <strong>${counts.safe}건</strong> · 모니터링 ${counts.monitor}건 · 주의 ${counts.warning}건 · 위험 <strong>${counts.critical}건</strong>. <strong>러시아 OFAC/EU 제재 critical · 미국 SIMP 확대(2026.01~) warning</strong>.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: NTB는 단순 규제 정보가 아닌 <strong>"vendor whitelist 등재 instrument"</strong>.</p>
<p><strong>3단계</strong>: ① 미국 SIMP 시행 D-30 노르웨이·칠레 1차 가공사 디지털 이력추적 인증 완료 ② 러시아 제3국 우회 의심 거래선 즉시 차단 ③ 한-EFTA C/O 발급 요건 엄격화 대응 - 노르웨이 신선 원산지 증명 프로세스 사전 정비.</p>
</div>`,
        source: "WITS NTM · OFAC SDN · MFDS · 박혜진(2023, 2025) · 이정미(2025) · KMI(2026)",
      }}
    />
  );
}
