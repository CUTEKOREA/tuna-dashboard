'use client';

import React from 'react';
import { Anchor, CheckCircle2, Clock } from 'lucide-react';
import { useResponsiveChart } from '../lib/useResponsiveChart';
import TermTooltip from './TermTooltip';

const completedVessels = [
  { vessel: 'MV SEIN SKY', shipper: 'ALBACORE', cargo: 3461.00, discharged: 3515.31, arrived: '2026/04/19', etd: '2026/04/30', consignee: 'CENTURY, GENTUNA', overShort: '+54.31 (OVER)' },
  { vessel: 'MV HIKARI 1', shipper: 'TPJ/TSP/SHILLA', cargo: 3055.075, discharged: 2598.83, arrived: '2026/04/19', etd: '2026/05/02', consignee: 'FCF TRANSHIPMENT, ALLIANCE, CELEBES', overShort: '-456.24 (SHORT)' },
];

const incomingVessels = [
  { vessel: 'MV KATAH', shipper: 'ITOCHU', cargo: 'TBA', eta: '2026/05/11', consignee: 'TBA' },
  { vessel: 'MV VANDA 888 LOCAL', shipper: 'FRABELLE', cargo: '1,500.00 MT', eta: '2026/05/07', consignee: 'GENTUNA' },
  { vessel: 'MV IZAR ARGIA', shipper: 'KIBU', cargo: '4,400.00 MT', eta: 'TBA', consignee: 'CENTURY, GENTUNA' },
];

export default function GensanVesselStatus() {
  const rc = useResponsiveChart();

  return (
    <div style={{
      backgroundColor: 'var(--panel-bg)',
      border: '1px solid var(--panel-border)',
      borderRadius: rc.isMobile ? '12px' : '16px',
      padding: rc.isMobile ? '16px 12px' : '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: rc.isMobile ? '16px' : '18px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Anchor size={20} color="var(--color-info)" />
            <TermTooltip term="Gensan Fish Port Complex (GSFPC) Status" description="필리핀 제너럴 산토스 항구의 원어 하역 완료 및 입항 예정 선박 현황입니다." />
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Weekly Report (Prepared by GMTS) | 2026/05/06 기준
          </p>
        </div>
        <div style={{ padding: '8px 16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', color: '#60a5fa', fontSize: '13px', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span>Gensan Tuna Fish Price</span>
          <span style={{ fontSize: '18px', color: 'var(--text-primary)' }}>GSP (Non-MSC): <strong style={{ color: 'var(--color-success)' }}>$1,900</strong></span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: rc.isMobile ? 'column' : 'row', gap: '20px' }}>
        {/* Completed Discharging */}
        <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '16px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
            <CheckCircle2 size={16} color="var(--color-success)" />
            Completed Discharging Vessels (2)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {completedVessels.map((v, i) => (
              <div key={i} style={{ borderBottom: i === completedVessels.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: i === completedVessels.length - 1 ? 0 : '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#60a5fa', fontSize: '14px' }}>{v.vessel}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{v.shipper}</span>
                </div>
                <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div>Total Cargo: <strong style={{ color: 'var(--text-main)' }}>{v.cargo} MT</strong></div>
                  <div>Discharged: <strong style={{ color: 'var(--color-success)' }}>{v.discharged} MT</strong></div>
                  <div>Arrived: {v.arrived}</div>
                  <div>ETD: {v.etd}</div>
                  <div style={{ gridColumn: '1 / -1' }}>Over/Short: <strong style={{ color: v.overShort.includes('OVER') ? 'var(--color-warning)' : 'var(--color-danger)' }}>{v.overShort}</strong></div>
                  <div style={{ gridColumn: '1 / -1' }}>Consignee: {v.consignee}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Vessels */}
        <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '16px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
            <Clock size={16} color="var(--color-warning)" />
            Incoming Vessels (3)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incomingVessels.map((v, i) => (
              <div key={i} style={{ borderBottom: i === incomingVessels.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: i === incomingVessels.length - 1 ? 0 : '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: 'var(--color-warning)', fontSize: '14px' }}>{v.vessel}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{v.shipper}</span>
                </div>
                <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div>Total Cargo: <strong style={{ color: 'var(--text-main)' }}>{v.cargo}</strong></div>
                  <div>ETA: <strong style={{ color: 'var(--color-success)' }}>{v.eta}</strong></div>
                  <div style={{ gridColumn: '1 / -1' }}>Consignee: {v.consignee}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
