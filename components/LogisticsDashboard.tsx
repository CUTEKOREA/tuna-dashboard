"use client";

import React, { useState, useEffect } from 'react';
import { 
  Factory, Truck, Anchor, Activity, Globe, RefreshCcw, 
  AlertTriangle, TrendingUp, TrendingDown, Database, Ship, Navigation
} from 'lucide-react';
import CanneryStatusCharts from './CanneryStatusCharts';
import GensanCanneryStatusCharts from './GensanCanneryStatusCharts';
import ReeferFreightChart from './ReeferFreightChart';
import ReeferMovement from './ReeferMovement';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import CountUp from 'react-countup';
import TraderStatus from './TraderStatus';
import CarrierUnloadingStatus from './CarrierUnloadingStatus';

export default function LogisticsDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for the dashboard skeleton
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCcw size={32} style={{ color: 'var(--color-success)', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Loading Logistics Intelligence...</p>
    </div>
  );

  return (
    <div style={{ padding: '0 1.5rem 3rem', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'CircularSp', 'Inter', sans-serif" }}>
      {/* ═══ Header ═══ */}
      <header style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, #10b981, #059669)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
            }}>
              <Factory size={24} color="var(--bg-color)" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                물류·가공 인텔리전스 (Logistics & Processing)
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Global Value Chain Operation Command Center</p>
            </div>
          </div>
          <div className="ds-card" style={{
            fontSize: '0.88rem', padding: '8px 16px', 
            background: '#181818', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px #1ed760', animation: 'pulse 2s infinite' }} />
            <span>LIVE <span style={{ color: 'var(--color-success)' }}>Connected</span></span>
          </div>
        </div>
      </header>

      {/* ═══ Section 1: TRADER Status ═══ */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <TrendingUp size={24} color="var(--color-info)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>트레이더별 반입 물량 현황 (Trader Status)</h2>
        </div>
        <div className="ds-card" style={{ background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: 'none' }}>
          <TraderStatus />
        </div>
      </section>

      {/* ═══ Section 2: 가공 (Processing) ═══ */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <Factory size={24} color="var(--color-success)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>가공 공장(Cannery) 가동 현황</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="ds-card" style={{ background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: 'none' }}>
            <CanneryStatusCharts />
            <div style={{ background: 'var(--surface-2)', borderRadius: '6px', padding: '16px', marginTop: '1.5rem' }}>
              <div style={{ paddingBottom: '12px', marginBottom: '12px' }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>현황 분석 (방콕)</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  방콕 및 송클라 지역의 주요 통조림 공장들은 현재 총 보관 용량 대비 원어 재고가 타이트하게 유지되고 있으며, 전체 CAPA 대비 가동률은 안정적인 수준입니다. 최근 운반선 입항 지연으로 인해 향후 2~3주 내 일시적인 원료 부족 현상이 일부 중소 공장에서 발생할 수 있습니다.
                </p>
              </div>
              <div>
                <h4 style={{ color: 'var(--color-success)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>실행 전략</h4>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  현재 원료 수급이 안정적인 대형 공장(Thai Union, Sea Value 등) 중심으로 직거래 물량을 사전 확보하고, 재고가 부족한 공장을 타겟으로 현물(Spot) 프리미엄 판매 전략을 구사하여 이익을 극대화해야 합니다.
                </p>
              </div>
            </div>
          </div>

          <div className="ds-card" style={{ background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: 'none' }}>
            <GensanCanneryStatusCharts />
            <div style={{ background: 'var(--surface-2)', borderRadius: '6px', padding: '16px', marginTop: '1.5rem' }}>
              <div style={{ paddingBottom: '12px', marginBottom: '12px' }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>현황 분석 (필리핀 젠산)</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  제너럴 산토스 지역은 지역 연안 어획량 감소로 인해 수입 원어에 대한 의존도가 심화되고 있습니다. 창고 보관량은 여유가 있으나, 실질적인 공장 가동률은 방콕 대비 낮게 형성되어 있습니다.
                </p>
              </div>
              <div>
                <h4 style={{ color: 'var(--color-success)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>실행 전략</h4>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  필리핀 지역으로의 운반선 직항 노선을 확보하여, 방콕항 체선 시 대체 양륙항으로 활용하는 전략적 유연성이 요구됩니다. 이를 통해 방콕향 운임 상승 리스크를 헷지할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Section 3: 물류 (Logistics) ═══ */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <Truck size={24} color="var(--color-info)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>해상 운송 및 항만 인텔리전스</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="ds-card" style={{ background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: 'none' }}>
            <CarrierUnloadingStatus />
          </div>
          <div className="ds-card" style={{ background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: 'none' }}>
            <ReeferMovement />
            <div style={{ background: 'var(--surface-2)', borderRadius: '6px', padding: '16px', marginTop: '1.5rem' }}>
              <div style={{ paddingBottom: '12px', marginBottom: '12px' }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>현황 분석 (방콕항 체선율)</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  현재 방콕항 묘박지 대기 선박 및 체선율 지수가 실시간으로 모니터링되고 있습니다. 체선이 심화될 경우 하역 지연에 따른 운반선 데머리지(Demurrage, 체선료) 패널티 리스크가 급증하며 원물 선도 저하 문제가 발생합니다.
                </p>
              </div>
              <div>
                <h4 style={{ color: 'var(--color-success)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>실행 전략</h4>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  체선일이 10일을 초과하는 선박에 대해서는 선하증권(B/L) 분할 양륙 및 인근 송클라 또는 젠산 항구로의 목적지 변경(Diversion)을 적극 검토해야 합니다.
                </p>
              </div>
            </div>
          </div>

          <div className="ds-card" style={{ background: '#181818', padding: '1.5rem', borderRadius: '8px', boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px', border: 'none' }}>
            <ReeferFreightChart />
            <div style={{ background: 'var(--surface-2)', borderRadius: '6px', padding: '16px', marginTop: '1.5rem' }}>
              <div style={{ paddingBottom: '12px', marginBottom: '12px' }}>
                <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>현황 분석 (글로벌 해상 운임)</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  주요 허브(태국, 필리핀, 스페인 등)로 향하는 냉동 컨테이너(Reefer 40'HC) 운임이 지정학적 불안과 파나마/수에즈 운하 이슈로 인해 전반적인 상승 압력을 받고 있습니다.
                </p>
              </div>
              <div>
                <h4 style={{ color: 'var(--color-success)', fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0' }}>실행 전략</h4>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                  해상 운임 급등기에는 개별 컨테이너 선적보다 대형 냉동 운반선(Reefer Carrier) 벌크 용선의 경제성이 우월해집니다. 물류비를 방어하기 위해 관계사들과의 Joint Shipment 물량을 집중 구성해야 합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
