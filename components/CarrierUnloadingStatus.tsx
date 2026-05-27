"use client";

import React from 'react';
import { Ship, Anchor, AlertCircle, Info } from 'lucide-react';
import TermTooltip from './TermTooltip';

const currentUnloading = [
  { 
    sort: 'FCF', 
    no: 5, 
    carriers: 'HUA FU 107 (4,982 MT), ORANGE SEA (4,808 MT), DINOK (4,385 MT), HUA FU 207 (5,777 MT), SEIN PHOENIX (6,955 MT)'
  },
  { 
    sort: 'TRI', 
    no: 3, 
    carriers: 'BOYANG CAPELLA (5,697 MT), RYOMA (3,490 MT), GREENSEA BERMEO (5,200 MT)'
  },
  { 
    sort: 'ITO', 
    no: 1, 
    carriers: 'LAKE PEARL (4,955 MT)'
  },
  { 
    sort: 'DIRECT', 
    no: 2, 
    carriers: 'PACIFIC JOURNEY (3,485 MT), SEIN QUEEN (5,650 MT)'
  }
];

const incomingVessels = [
  { name: 'MING RUN', date: '05th of MAY' },
  { name: 'JOCHOH', date: '09th of MAY' },
  { name: 'CHERRY STAR', date: '12th of MAY' },
  { name: 'BAO LUCKY', date: '20th of MAY' },
];

export default function CarrierUnloadingStatus() {
  return (
    <div style={{
      background: 'var(--panel-bg)',
      border: '1px solid var(--panel-border)',
      borderRadius: '8px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Anchor size={20} color="var(--color-warning)" />
          Carrier and Unloading Status
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Current status of the carrier in the progress of unloading in Thailand (BANGKOK)
        </p>
      </div>

      <div style={{ border: '1px solid var(--panel-border)', borderRadius: '6px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--panel-border)' }}>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>Sort</th>
              <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', width: '60px' }}>No</th>
              <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>Carrier (mt)</th>
            </tr>
          </thead>
          <tbody>
            {currentUnloading.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--panel-border)' }}>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-main)' }}>{row.sort}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>{row.no}</td>
                <td style={{ padding: '12px', color: 'var(--text-main)', lineHeight: '1.5' }}>{row.carriers}</td>
              </tr>
            ))}
            <tr style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-success)' }}>Total</td>
              <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-success)' }}>11</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--color-success)' }}>55,384 MT</td>
            </tr>
          </tbody>
        </table>
        <div style={{ padding: '12px', fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)' }}>
          * The cumulative number of carriers was 5, and the cumulative unloading volume was 19,210 MT in MAY. SEIN PHOENIX 하역 중 (5/25 기준 누계 362.98t / 잔 6,592t).
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 12px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Ship size={16} color="var(--color-info)" />
          Incoming Vessels (BKK)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {incomingVessels.map((v, idx) => (
            <div key={idx} style={{ 
              padding: '12px', 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '6px', 
              borderLeft: '3px solid var(--color-info)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)' }}>{v.name}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ETA: {v.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
