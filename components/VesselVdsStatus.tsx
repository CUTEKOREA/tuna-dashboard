'use client';

import React, { useState } from 'react';
import { Ship, AlertTriangle, TrendingUp } from 'lucide-react';
import TermTooltip from './TermTooltip';

type VesselData = {
  vessel: string;
  total: number;
  consumed: number;
  remaining: number;
  weekly: number;
  rate: number;
};

const nationalVdsData: Record<string, VesselData[]> = {
  "PNG": [
    { vessel: "S/EXP", total: 55.17, consumed: 10.00, remaining: 45.17, weekly: 0.00, rate: 18 },
    { vessel: "S/PIO", total: 55.17, consumed: 0.40, remaining: 54.77, weekly: 0.00, rate: 1 },
    { vessel: "S/CHA", total: 55.17, consumed: 0.80, remaining: 54.37, weekly: 0.00, rate: 1 },
    { vessel: "S/HAR", total: 55.17, consumed: 1.50, remaining: 53.67, weekly: 0.00, rate: 3 },
    { vessel: "S/JUP", total: 55.17, consumed: 2.40, remaining: 52.77, weekly: 0.00, rate: 4 },
    { vessel: "S/SPR", total: 55.17, consumed: 0.00, remaining: 55.17, weekly: 0.00, rate: 0 },
  ],
  "SOLOMON": [
    { vessel: "S/EXP", total: 7.33, consumed: 4.40, remaining: 2.93, weekly: 0.00, rate: 60 },
    { vessel: "S/PIO", total: 7.33, consumed: 1.50, remaining: 5.83, weekly: 0.00, rate: 20 },
    { vessel: "S/CHA", total: 7.33, consumed: 4.40, remaining: 2.93, weekly: 0.00, rate: 60 },
    { vessel: "S/HAR", total: 7.33, consumed: 4.60, remaining: 2.73, weekly: 0.00, rate: 63 },
    { vessel: "S/JUP", total: 7.33, consumed: 4.30, remaining: 3.03, weekly: 0.00, rate: 59 },
    { vessel: "S/SPR", total: 7.33, consumed: 4.60, remaining: 2.73, weekly: 0.00, rate: 63 },
  ],
  "FSM": [
    { vessel: "S/EXP", total: 8.17, consumed: 12.80, remaining: -4.63, weekly: 0.00, rate: 157 },
    { vessel: "S/PIO", total: 8.17, consumed: 0.30, remaining: 7.87, weekly: 0.00, rate: 4 },
    { vessel: "S/CHA", total: 8.17, consumed: 1.10, remaining: 7.07, weekly: 0.00, rate: 13 },
    { vessel: "S/HAR", total: 8.17, consumed: 3.80, remaining: 4.37, weekly: 0.00, rate: 47 },
    { vessel: "S/JUP", total: 8.17, consumed: 0.70, remaining: 7.47, weekly: 0.00, rate: 9 },
    { vessel: "S/SPR", total: 8.17, consumed: 0.00, remaining: 8.17, weekly: 0.00, rate: 0 },
  ],
  "KIRIBATI": [
    { vessel: "S/EXP", total: 77.33, consumed: 57.10, remaining: 20.23, weekly: 0.00, rate: 74 },
    { vessel: "S/PIO", total: 77.33, consumed: 86.20, remaining: -8.87, weekly: 1.00, rate: 111 },
    { vessel: "S/CHA", total: 77.33, consumed: 78.90, remaining: -1.57, weekly: 0.00, rate: 102 },
    { vessel: "S/HAR", total: 77.33, consumed: 75.80, remaining: 1.53, weekly: 0.00, rate: 98 },
    { vessel: "S/JUP", total: 77.33, consumed: 76.40, remaining: 0.93, weekly: 0.00, rate: 99 },
    { vessel: "S/SPR", total: 77.33, consumed: 75.90, remaining: 1.43, weekly: 0.00, rate: 98 },
  ],
  "TUVALU": [
    { vessel: "S/EXP", total: 17.00, consumed: 9.60, remaining: 7.40, weekly: 0.00, rate: 56 },
    { vessel: "S/PIO", total: 17.00, consumed: 18.70, remaining: -1.70, weekly: 0.00, rate: 110 },
    { vessel: "S/CHA", total: 17.00, consumed: 9.60, remaining: 7.40, weekly: 0.00, rate: 56 },
    { vessel: "S/HAR", total: 17.00, consumed: 12.30, remaining: 4.70, weekly: 0.00, rate: 72 },
    { vessel: "S/JUP", total: 17.00, consumed: 24.90, remaining: -7.90, weekly: 0.00, rate: 146 },
    { vessel: "S/SPR", total: 17.00, consumed: 17.40, remaining: -0.40, weekly: 0.00, rate: 102 },
  ],
  "NAURU": [
    { vessel: "S/EXP", total: 23.67, consumed: 21.30, remaining: 2.37, weekly: 0.00, rate: 90 },
    { vessel: "S/PIO", total: 23.67, consumed: 18.10, remaining: 5.57, weekly: 0.00, rate: 76 },
    { vessel: "S/CHA", total: 23.67, consumed: 28.50, remaining: -4.83, weekly: 0.00, rate: 120 },
    { vessel: "S/HAR", total: 23.67, consumed: 14.30, remaining: 9.37, weekly: 0.00, rate: 60 },
    { vessel: "S/JUP", total: 23.67, consumed: 16.20, remaining: 7.47, weekly: 0.00, rate: 68 },
    { vessel: "S/SPR", total: 23.67, consumed: 24.40, remaining: -0.73, weekly: 0.00, rate: 103 },
  ],
  "MARSHALL": [
    { vessel: "S/EXP", total: 5.00, consumed: 3.30, remaining: 1.70, weekly: 0.00, rate: 66 },
    { vessel: "S/PIO", total: 0.00, consumed: 0.00, remaining: 0.00, weekly: 0.00, rate: 0 },
    { vessel: "S/CHA", total: 0.00, consumed: 0.00, remaining: 0.00, weekly: 0.00, rate: 0 },
    { vessel: "S/HAR", total: 5.00, consumed: 2.90, remaining: 2.10, weekly: 0.00, rate: 58 },
    { vessel: "S/JUP", total: 0.00, consumed: 0.00, remaining: 0.00, weekly: 0.00, rate: 0 },
    { vessel: "S/SPR", total: 5.00, consumed: 0.50, remaining: 4.50, weekly: 0.00, rate: 10 },
  ],
  "EAST OPEN SEA": [
    { vessel: "S/EXP", total: 8.63, consumed: 0.00, remaining: 8.63, weekly: 0.00, rate: 0 },
    { vessel: "S/PIO", total: 8.63, consumed: 0.00, remaining: 8.63, weekly: 0.00, rate: 0 },
    { vessel: "S/CHA", total: 8.63, consumed: 0.00, remaining: 8.63, weekly: 0.00, rate: 0 },
    { vessel: "S/HAR", total: 8.63, consumed: 0.00, remaining: 8.63, weekly: 0.00, rate: 0 },
    { vessel: "S/JUP", total: 8.63, consumed: 1.00, remaining: 7.63, weekly: 0.00, rate: 12 },
    { vessel: "S/SPR", total: 8.63, consumed: 0.00, remaining: 8.63, weekly: 0.00, rate: 0 },
  ],
};

export const kiribatiVdsData: Record<string, VesselData[]> = {
  "FSMA": [
    { vessel: "MOAMARI", total: 9.50, consumed: 5.20, remaining: 4.30, weekly: 0.00, rate: 55 },
    { vessel: "MOAKONA", total: 9.50, consumed: 7.60, remaining: 1.90, weekly: 0.00, rate: 80 },
  ],
  "KIRIBATI": [
    { vessel: "MOAMARI", total: 57.75, consumed: 51.90, remaining: 5.85, weekly: 1.00, rate: 90 },
    { vessel: "MOAKONA", total: 57.75, consumed: 53.40, remaining: 4.35, weekly: 0.00, rate: 92 },
    { vessel: "NAOERO SUN", total: 57.75, consumed: 38.40, remaining: 19.35, weekly: 0.30, rate: 66 },
    { vessel: "NAOERO STAR", total: 57.75, consumed: 58.00, remaining: -0.25, weekly: 0.40, rate: 100 },
  ],
  "FSM": [
    { vessel: "MOAMARI", total: 8.75, consumed: 4.00, remaining: 4.75, weekly: 0.00, rate: 46 },
    { vessel: "MOAKONA", total: 8.75, consumed: 3.50, remaining: 5.25, weekly: 0.00, rate: 40 },
    { vessel: "NAOERO SUN", total: 8.75, consumed: 21.10, remaining: -12.35, weekly: 0.00, rate: 241 },
    { vessel: "NAOERO STAR", total: 8.75, consumed: 6.30, remaining: 2.45, weekly: 0.00, rate: 72 },
  ],
  "NAURU": [
    { vessel: "MOAMARI", total: 24.00, consumed: 7.80, remaining: 16.20, weekly: 0.00, rate: 33 },
    { vessel: "MOAKONA", total: 24.00, consumed: 10.80, remaining: 13.20, weekly: 0.00, rate: 45 },
    { vessel: "NAOERO SUN", total: 25.00, consumed: 2.50, remaining: 22.50, weekly: 0.00, rate: 10 },
    { vessel: "NAOERO STAR", total: 25.00, consumed: 10.40, remaining: 14.60, weekly: 0.00, rate: 42 },
  ],
  "PNG": [
    { vessel: "MOAMARI", total: 35.75, consumed: 0.00, remaining: 35.75, weekly: 0.00, rate: 0 },
    { vessel: "MOAKONA", total: 35.75, consumed: 23.70, remaining: 12.05, weekly: 0.00, rate: 66 },
    { vessel: "NAOERO SUN", total: 35.75, consumed: 7.90, remaining: 27.85, weekly: 0.00, rate: 22 },
    { vessel: "NAOERO STAR", total: 35.75, consumed: 8.10, remaining: 27.65, weekly: 0.00, rate: 23 },
  ],
  "SOLOMON": [
    { vessel: "MOAMARI", total: 3.50, consumed: 3.60, remaining: -0.10, weekly: 0.00, rate: 103 },
    { vessel: "MOAKONA", total: 3.50, consumed: 2.80, remaining: 0.70, weekly: 0.00, rate: 80 },
    { vessel: "NAOERO SUN", total: 3.50, consumed: 3.20, remaining: 0.30, weekly: 0.00, rate: 91 },
    { vessel: "NAOERO STAR", total: 3.50, consumed: 2.00, remaining: 1.50, weekly: 0.00, rate: 57 },
  ],
  "TUVALU": [
    { vessel: "MOAMARI", total: 15.00, consumed: 16.60, remaining: -1.60, weekly: 0.00, rate: 111 },
    { vessel: "MOAKONA", total: 15.00, consumed: 8.00, remaining: 7.00, weekly: 0.00, rate: 53 },
    { vessel: "NAOERO SUN", total: 15.00, consumed: 8.00, remaining: 7.00, weekly: 0.00, rate: 53 },
    { vessel: "NAOERO STAR", total: 15.00, consumed: 24.20, remaining: -9.20, weekly: 0.00, rate: 161 },
  ],
  "HIGH SEA": [
    { vessel: "MOAMARI", total: 23.00, consumed: 23.00, remaining: 0.00, weekly: 0.00, rate: 100 },
    { vessel: "MOAKONA", total: 11.00, consumed: 11.00, remaining: 0.00, weekly: 1.00, rate: 100 },
    { vessel: "NAOERO SUN", total: 17.00, consumed: 17.00, remaining: 0.00, weekly: 0.00, rate: 100 },
    { vessel: "NAOERO STAR", total: 16.00, consumed: 16.00, remaining: 0.00, weekly: 0.00, rate: 100 },
  ],
};


const getProgressColor = (rate: number, max: number) => {
  if (max === 0) return 'rgba(255,255,255,0.1)';
  if (rate >= 100) return 'var(--accent-danger)'; // Over-consumed (Danger)
  if (rate >= 85) return 'var(--accent-warning)'; // Near limit (Warning)
  return 'var(--accent-primary)'; // Safe (Blue for vessels)
};

export default function VesselVdsStatus() {
  const [fleetType, setFleetType] = useState<"NATIONAL" | "KIRIBATI">("NATIONAL");
  const [activeArea, setActiveArea] = useState<string>("KIRIBATI");
  
  const currentDataset = fleetType === "NATIONAL" ? nationalVdsData : kiribatiVdsData;
  const areas = Object.keys(currentDataset);
  
  // If activeArea is not in the dataset (when toggling), fallback to KIRIBATI or first area
  const currentData = currentDataset[activeArea] || currentDataset["KIRIBATI"] || currentDataset[areas[0]];

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--panel-bg)',
      border: '1px solid var(--panel-border)',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        gap: '16px'
      }}>
        <div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 0 4px 0'
          }}>
            <Ship color="var(--accent-primary)" size={20} />
            수역별 VDS 소진 현황 &lt;5월 25일&gt;
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            2026년 기준 선박별 <TermTooltip term="조업일수(VDS)" description="VDS(Vessel Day Scheme)는 태평양 도서국이 자국 배타적경제수역(EEZ) 내에서 조업을 허가하는 '권리'입니다. 한정된 VDS 일수를 초과하면 해당 수역에서 조업할 수 없거나 비싼 추가 비용을 내야 합니다." /> (배정일, 소진일, 주간 소모)
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {currentData.some(d => d.rate >= 100 && d.total > 0) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--accent-danger)',
              fontSize: '13px',
              borderRadius: '8px'
            }}>
              <AlertTriangle size={16} />
              <span>초과 위험 선박 존재</span>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(140,170,255,0.10)', padding: '4px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
            <button
              onClick={() => { setFleetType('NATIONAL'); setActiveArea('KIRIBATI'); }}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '13px',
                fontWeight: fleetType === 'NATIONAL' ? 'bold' : 'normal',
                backgroundColor: fleetType === 'NATIONAL' ? 'var(--accent-primary)' : 'transparent',
                color: fleetType === 'NATIONAL' ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: fleetType === 'NATIONAL' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              국적선
            </button>
            <button
              onClick={() => { setFleetType('KIRIBATI'); setActiveArea('KIRIBATI'); }}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '13px',
                fontWeight: fleetType === 'KIRIBATI' ? 'bold' : 'normal',
                backgroundColor: fleetType === 'KIRIBATI' ? 'var(--accent-primary)' : 'transparent',
                color: fleetType === 'KIRIBATI' ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: fleetType === 'KIRIBATI' ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              키리바시(합작/용선)
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--panel-border)',
        paddingBottom: '2px'
      }}>
        {areas.map(area => {
          const isActive = area === activeArea;
          const hasDanger = currentDataset[area].some(d => d.rate >= 100 && d.total > 0);
          return (
            <button
              key={area}
              onClick={() => setActiveArea(area)}
              style={{
                padding: '10px 16px',
                fontWeight: isActive ? 'bold' : 'normal',
                fontSize: '14px',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
                background: isActive ? 'rgba(140, 170, 255, 0.10)' : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {area}
              {hasDanger && (
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--accent-danger)'
                }} title="초과 소진 위험" />
              )}
            </button>
          );
        })}
      </div>

      {/* Data Table */}
      <div style={{
        overflowX: 'auto',
        borderRadius: '8px',
        border: '1px solid var(--panel-border)'
      }}>
        <table style={{ width: '100%', textAlign: 'left', fontSize: '13px', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
          <thead style={{ backgroundColor: 'var(--table-th-bg)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '12px' }}>
            <tr>
              <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>선박</th>
              <th style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'right' }}>배정일</th>
              <th style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'right' }}>소진일</th>
              <th style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'right' }}>잔여일수</th>
              <th style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'right' }}>주간소모</th>
              <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>소진률 (%)</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, idx) => {
              const isOver = row.rate >= 100 && row.total > 0;
              const isEmpty = row.total === 0;
              return (
                <tr key={idx} style={{ 
                  borderBottom: idx !== currentData.length - 1 ? '1px solid var(--panel-border)' : 'none',
                  backgroundColor: isEmpty ? 'rgba(255,255,255,0.02)' : 'transparent',
                  opacity: isEmpty ? 0.6 : 1
                }}>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{row.vessel}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>{row.total.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>{row.consumed.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: isOver ? 'var(--accent-danger)' : 'var(--text-main)' }}>
                    {row.remaining.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: row.weekly > 0 ? 'bold' : 'normal', color: row.weekly > 0 ? 'var(--accent-warning)' : 'var(--text-muted)' }}>
                    {row.weekly.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '40px', fontWeight: 'bold', textAlign: 'right', color: isOver ? 'var(--accent-danger)' : 'var(--text-main)' }}>
                        {isEmpty ? '-' : `${row.rate}%`}
                      </span>
                      <div style={{ flex: 1, height: '8px', backgroundColor: 'rgba(140,170,255,0.10)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{
                            height: '100%',
                            backgroundColor: getProgressColor(row.rate, row.total),
                            width: `${Math.min(row.rate, 100)}%`,
                            transition: 'width 0.5s ease'
                          }}
                        />
                      </div>
                      <div style={{ width: '16px' }}>
                        {isOver && <TrendingUp size={14} color="var(--accent-danger)" />}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
