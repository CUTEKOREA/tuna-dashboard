'use client';

import React, { useState } from 'react';
import { CalendarDays, AlertTriangle, TrendingUp } from 'lucide-react';
import TermTooltip from './TermTooltip';

type FishingData = {
  company: string;
  total: number;
  consumed: number;
  remaining: number;
  rate: number;
};

const fishingDaysData: Record<string, FishingData[]> = {
  "PNG": [
    { company: "동원산업", total: 472.00, consumed: 11.28, remaining: 460.72, rate: 2 },
    { company: "사조산업", total: 300.00, consumed: 6.90, remaining: 293.10, rate: 2 },
    { company: "사조씨푸드", total: 61.00, consumed: 0, remaining: 61.00, rate: 0 },
    { company: "사조오양", total: 61.00, consumed: 5.20, remaining: 55.80, rate: 9 },
    { company: "신라교역", total: 331.00, consumed: 16.30, remaining: 314.70, rate: 5 },
  ],
  "Solomon": [
    { company: "동원산업", total: 150.00, consumed: 148.53, remaining: 1.47, rate: 99 },
    { company: "사조산업", total: 83.00, consumed: 54.92, remaining: 28.08, rate: 66 },
    { company: "사조씨푸드", total: 16.00, consumed: 21.40, remaining: -5.40, rate: 134 },
    { company: "사조오양", total: 16.00, consumed: 29.60, remaining: -13.60, rate: 185 },
    { company: "신라교역", total: 44.00, consumed: 23.80, remaining: 20.20, rate: 54 },
  ],
  "Kiribati": [
    { company: "동원산업", total: 352.00, consumed: 149.10, remaining: 202.90, rate: 42 },
    { company: "사조산업", total: 194.00, consumed: 104.32, remaining: 89.68, rate: 54 },
    { company: "사조씨푸드", total: 40.00, consumed: 25.07, remaining: 14.93, rate: 63 },
    { company: "사조오양", total: 40.00, consumed: 15.96, remaining: 24.04, rate: 40 },
    { company: "신라교역", total: 654.00, consumed: 619.80, remaining: 34.10, rate: 95 },
  ],
  "Tuvalu": [
    { company: "동원산업", total: 146.00, consumed: 79.73, remaining: 66.27, rate: 55 },
    { company: "사조산업", total: 71.00, consumed: 64.81, remaining: 6.19, rate: 91 },
    { company: "사조씨푸드", total: 14.00, consumed: 10.80, remaining: 3.20, rate: 77 },
    { company: "사조오양", total: 14.00, consumed: 7.31, remaining: 6.69, rate: 52 },
    { company: "신라교역", total: 102.00, consumed: 94.20, remaining: 7.80, rate: 92 },
  ],
  "Nauru": [
    { company: "동원산업", total: 208.00, consumed: 174.11, remaining: 33.89, rate: 84 },
    { company: "사조산업", total: 68.00, consumed: 61.74, remaining: 6.26, rate: 91 },
    { company: "사조씨푸드", total: 15.00, consumed: 14.30, remaining: 0.70, rate: 95 },
    { company: "사조오양", total: 15.00, consumed: 15.65, remaining: -0.65, rate: 104 },
    { company: "신라교역", total: 142.00, consumed: 122.50, remaining: 19.50, rate: 86 },
  ],
  "FSM": [
    { company: "동원산업", total: 142.00, consumed: 87.71, remaining: 54.29, rate: 62 },
    { company: "사조산업", total: 65.00, consumed: 34.71, remaining: 30.29, rate: 53 },
    { company: "사조씨푸드", total: 12.00, consumed: 0, remaining: 12.00, rate: 0 },
    { company: "사조오양", total: 12.00, consumed: 0, remaining: 12.00, rate: 0 },
    { company: "신라교역", total: 49.00, consumed: 16.80, remaining: 32.20, rate: 34 },
  ],
};

const getProgressColor = (rate: number) => {
  if (rate >= 100) return 'var(--accent-danger)'; // Over-consumed (Danger)
  if (rate >= 85) return 'var(--accent-warning)'; // Near limit (Warning)
  return 'var(--color-success)'; // Safe (Emerald)
};

export default function FishingDaysStatus() {
  const [activeArea, setActiveArea] = useState<string>("Solomon");
  const areas = Object.keys(fishingDaysData);
  const currentData = fishingDaysData[activeArea];

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
            <CalendarDays color="var(--accent-primary)" size={20} />
            수역별 회사별 조업일수 소진 현황
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            2026년 기준 <TermTooltip term="조업일수 (Fishing Days)" description="연안국의 수역에서 실제로 그물을 내리거나 탐색한 날짜의 수입니다. 하루를 쓴다는 것은 선망선 1척당 매일 약 1만 달러 이상의 입어료가 소진됨을 의미하므로 효율적인 관리가 필수적입니다." /> (Total Available, Consumed, Remaining Days)
          </p>
        </div>
        
        {currentData.some(d => d.rate >= 100) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: 'rgba(var(--w-red-500-rgb), 0.1)',
            border: '1px solid rgba(var(--w-red-500-rgb), 0.2)',
            color: 'var(--accent-danger)',
            fontSize: '13px',
            borderRadius: '8px'
          }}>
            <AlertTriangle size={16} />
            <span>초과 소진된 할당량이 있습니다.</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--panel-border)'
      }}>
        {areas.map(area => {
          const isActive = area === activeArea;
          const hasDanger = fishingDaysData[area].some(d => d.rate >= 100);
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
                borderBottom: isActive ? '2px solid var(--w-emerald-500)' : '2px solid transparent',
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
              <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>회사명</th>
              <th style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'right' }}>총가용일수</th>
              <th style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'right' }}>소진일수</th>
              <th style={{ padding: '12px 16px', fontWeight: 'bold', textAlign: 'right' }}>잔여일수</th>
              <th style={{ padding: '12px 16px', fontWeight: 'bold' }}>소진률 (%)</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, idx) => {
              const isOver = row.rate >= 100;
              return (
                <tr key={idx} style={{ borderBottom: idx !== currentData.length - 1 ? '1px solid var(--panel-border)' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{row.company}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>{row.total.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>{row.consumed.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: isOver ? 'var(--accent-danger)' : 'var(--color-success)' }}>
                    {row.remaining.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '40px', fontWeight: 'bold', textAlign: 'right', color: isOver ? 'var(--accent-danger)' : 'var(--text-main)' }}>
                        {row.rate}%
                      </span>
                      <div style={{ flex: 1, height: '8px', backgroundColor: 'rgba(140,170,255,0.10)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{
                            height: '100%',
                            backgroundColor: getProgressColor(row.rate),
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
