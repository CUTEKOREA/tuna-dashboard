"use client";

import React, { useState, useEffect } from 'react';
import {
  Factory, Truck, RefreshCcw,
  TrendingUp, Ship, Navigation
} from 'lucide-react';
import CanneryStatusCharts from './CanneryStatusCharts';
import SongkhlaCanneryStatusCharts from './SongkhlaCanneryStatusCharts';
import ReeferMovement from './ReeferMovement';
import TraderStatus from './TraderStatus';
import CarrierUnloadingStatus from './CarrierUnloadingStatus';
import WidgetCard from './WidgetCard';

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
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>물류·가공 인텔리전스 로딩 중...</p>
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
                물류·가공 인텔리전스
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>글로벌 밸류체인 운영 상황실</p>
            </div>
          </div>
          <div className="ds-card" style={{
            fontSize: '0.88rem', padding: '8px 16px', 
            background: '#11182f', border: 'none', 
            borderRadius: '500px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: 'rgba(0,0,0,0.3) 0px 8px 8px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-secondary)' }} />
            <span>정적 주간 보고 기반 <span style={{ color: 'var(--text-primary)' }}>최신 2026-07-31 · 위젯별 기준일 표기</span></span>
          </div>
        </div>
      </header>

      {/* ═══ Section 1: TRADER Status ═══ */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <TrendingUp size={24} color="var(--color-info)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>트레이더별 반입 물량 현황</h2>
        </div>
        <WidgetCard
          title="트레이더별 반입 물량"
          icon={TrendingUp}
          iconColor="var(--color-info)"
          pillar="S4"
          cardDesc="트레이더 단위 반입 물량·점유율 — 사내 집계 (2026년 1~7월, 2026-07 기준)"
          telemetry={{ status: 'STATIC', syncDate: '2026-07' }}
          customBody={<TraderStatus />}
          takeaway={{
            situation: '2026년 1~7월 트레이더별 누적 반입 물량(합계 308,284MT)으로 핵심 거래 파트너의 거래 비중을 식별.',
            actionPlan: '점유율 상위 트레이더와의 거래 안정성 강화 + 신규 트레이더 발굴을 통한 거래 다변화.',
            source: '사내 트레이더 반입 집계 (2026-07 기준)',
          }}
        />
      </section>

      {/* ═══ Section 2: 가공 (Processing) ═══ */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <Factory size={24} color="var(--color-success)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>가공 공장(Cannery) 가동 현황</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <WidgetCard
            title="가공 공장 가동 현황 (방콕)"
            icon={Factory}
            iconColor="var(--color-success)"
            pillar="S2"
            cardDesc="태국 방콕 통조림 공장 가동률·재고 — 사내 정적 집계 (2026-07 기준)"
            telemetry={{ status: 'STATIC', syncDate: '2026-07' }}
            customBody={<CanneryStatusCharts />}
            takeaway={{
              situation: '2026-07 보고 기준 방콕 지역 주요 통조림 공장들은 총 보관 용량 대비 원어 재고가 타이트하게 유지됐으며, 전체 CAPA 대비 가동률은 안정적인 수준입니다.',
              actionPlan: '현재 원료 수급이 안정적인 대형 공장(Thai Union, Sea Value 등) 중심으로 직거래 물량을 사전 확보하고 이익을 극대화해야 합니다.',
              source: '태국 방콕 캐너리 인텔리전스',
            }}
          />

          <WidgetCard
            title="가공 공장 가동 현황 (송클라)"
            icon={Factory}
            iconColor="var(--color-success)"
            pillar="S2"
            cardDesc="태국 송클라 통조림 공장 가동률 — 사내 정적 집계 (2026-07 기준)"
            telemetry={{ status: 'STATIC', syncDate: '2026-07' }}
            customBody={<SongkhlaCanneryStatusCharts />}
            takeaway={{
              situation: '2026-07 보고 기준 송클라 지역은 방콕 대비 안정적인 가동률을 보이고 있습니다.',
              actionPlan: '송클라 지역 공장으로의 물량 배정을 늘려 수익성을 제고하고 물류 리스크를 분산합니다.',
              source: '태국 송클라 캐너리 인텔리전스',
            }}
          />
        </div>
      </section>

      {/* ═══ Section 3: 물류 (Logistics) ═══ */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <Truck size={24} color="var(--color-info)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>해상 운송 및 항만 인텔리전스</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <WidgetCard
            title="운반선 하역 현황"
            icon={Ship}
            iconColor="var(--color-info)"
            pillar="S3"
            cardDesc="방콕항 운반선 하역·입항 현황 — 주간 보고 (2026-07-31 기준)"
            telemetry={{ status: 'STATIC', syncDate: '2026-07-31' }}
            customBody={<CarrierUnloadingStatus />}
            takeaway={{
              situation: '2026-07-31 주간 보고 기준 방콕항에서 운반선 6척(16,047MT)이 양륙 중/대기 중임.',
              actionPlan: '체선이 심화된 항만에서 다른 항만으로 하역 일정 조정 검토.',
              source: '방콕항 주간 하역 보고 (2026-07-31)',
            }}
          />

          <WidgetCard
            title="냉동 운반선 이동 스케줄"
            icon={Navigation}
            iconColor="var(--color-info)"
            pillar="S3"
            cardDesc="방콕항 운반선 이동 스케줄 — WEEK 30 주간 보고 (2026-07-24~07-31 기준)"
            telemetry={{ status: 'STATIC', syncDate: '2026-07-31' }}
            customBody={<ReeferMovement />}
            takeaway={{
              situation: 'WEEK 30(2026-07-24~07-31) 주간 보고 기준 방콕항 입항 운반선 현황 및 캔 공장별 배분 물량을 집계. 체선이 심화될 경우 하역 지연에 따른 운반선 데머리지 패널티 리스크가 급증하며 원물 선도 저하 문제가 발생합니다.',
              actionPlan: '체선일이 10일을 초과하는 선박에 대해서는 B/L 분할 양륙 및 인근 송클라 등으로의 목적지 변경(Diversion)을 검토해야 합니다.',
              source: '방콕항 운반선 주간 스케줄 WEEK 30 (2026-07-31 기준)',
            }}
          />
        </div>
      </section>
    </div>
  );
}
