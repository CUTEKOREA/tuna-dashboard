'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Waves } from 'lucide-react';
import WidgetCard from './WidgetCard';

const PacificMapWithNoSSR = dynamic(() => import('./PacificVesselMap'), {
  ssr: false,
  loading: () => <div style={{ height: '550px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(140,170,255,0.10)' }}>지도 로딩 중...</div>
});

interface EezData {
  country: string;
  countryEn: string;
  areaSqKm: number;
  location: string;
  vdsFee2024: number;
  species: string;
  characteristics: string;
}

export default function PacificEezStrategicWidget() {
  const [data, setData] = useState<EezData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'table' | 'map'>('table');

  useEffect(() => {
    fetch('/data/pacific_eez_data.json')
      .then(res => res.json())
      .then(data => {
        setData(data.sort((a: EezData, b: EezData) => b.areaSqKm - a.areaSqKm));
        setLoading(false);
      });
  }, []);

  const formatArea = (val: number) => (val / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 }) + '만';
  const formatFee = (val: number) => '$' + (val / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + 'M';

  const body = loading ? (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '480px', color: 'var(--text-secondary)' }}>EEZ 데이터 로딩 중...</div>
  ) : (
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        PNA 8개국의 합산 EEZ는 약 <strong>1,430만 km²</strong>로 미국 본토 면적의 1.5배에 달하며, 전 세계 가다랑어(Skipjack) 공급의 50%를 통제하는 핵심 조업 수역입니다. 조업일수제도(VDS) 전략 수립을 위한 수역별 특성입니다.
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('table')}
          style={{
            padding: '6px 14px', fontSize: '0.75rem', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer',
            background: activeTab === 'table' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            color: activeTab === 'table' ? '#60a5fa' : '#94a3b8',
            borderBottom: activeTab === 'table' ? '2px solid #3b82f6' : 'none',
            transition: 'all 0.2s'
          }}
        >
          📋 수역 데이터 시트
        </button>
        <button
          onClick={() => setActiveTab('map')}
          style={{
            padding: '6px 14px', fontSize: '0.75rem', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer',
            background: activeTab === 'map' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: activeTab === 'map' ? '#34d399' : '#94a3b8',
            borderBottom: activeTab === 'map' ? '2px solid #10b981' : 'none',
            transition: 'all 0.2s'
          }}
        >
          🗺️ 수역 지리적 지도 (EEZ Map Overlay)
        </button>
      </div>

      {activeTab === 'table' ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '10px 12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>국가</th>
                <th style={{ padding: '10px 10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>위치</th>
                <th style={{ padding: '10px 10px', color: 'var(--text-tertiary)', fontWeight: 600, textAlign: 'right' }}>EEZ 면적 (km²)</th>
                <th style={{ padding: '10px 10px', color: 'var(--text-tertiary)', fontWeight: 600 }}>주요 어종 분포</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>수역 특성 및 전략적 가치</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(140,170,255,0.10)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>{row.country}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{row.countryEn}</div>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{row.location}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: '#3b82f6' }}>{formatArea(row.areaSqKm)}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>입어료: {row.vdsFee2024 ? formatFee(row.vdsFee2024) : '-'}</div>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                    {row.species.split(',').map((s, i) => (
                      <div key={i} style={{ marginBottom: 2 }}>{s.trim()}</div>
                    ))}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {row.characteristics}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ width: '100%', height: '550px', position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
          <PacificMapWithNoSSR defaultEezActive={true} />
        </div>
      )}
    </div>
  );

  return (
    <WidgetCard
      title="태평양 도서국(PNA) 배타적 경제수역(EEZ) 포트폴리오"
      icon={Waves}
      iconColor="#3b82f6"
      pillar="S1"
      cardDesc="WCPFC 과학위원회 + PNA 조업일수제도(VDS) — 8개국 합산 EEZ 1,430만 km² 거점별 입어 전략"
      unit="km², USD"
      telemetry={{ status: 'STATIC', syncDate: 'WCPFC CMM 2025-02 (2026-02 발효)' }}
      customBody={body}
      takeaway={{
        situation: '태평양도서국(PNA) 8개국의 합산 EEZ는 약 1,430만 km²로, 전 세계 가다랑어 공급의 약 50%를 장악하는 핵심 수역입니다.',
        actionPlan: 'PNA 조업일수제도(VDS) 입어료 상승에 대응해 키리바시·솔로몬 등 거점 수역별 입어권 일수를 탄력적으로 조정하고 양자 협상을 강화합니다.',
        source: 'WCPFC 과학위원회 · PNA 조업일수제도(VDS) 통계',
      }}
    />
  );
}
