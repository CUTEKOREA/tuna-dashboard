"use client";

import React, { useState, useEffect } from 'react';
import {
  Factory, Truck, RefreshCcw,
  TrendingUp, Ship, Navigation, DollarSign, AlertTriangle
} from 'lucide-react';
import CanneryStatusCharts from './CanneryStatusCharts';
import SongkhlaCanneryStatusCharts from './SongkhlaCanneryStatusCharts';
import ReeferMovement from './ReeferMovement';
import TraderStatus from './TraderStatus';
import CarrierUnloadingStatus from './CarrierUnloadingStatus';
import WidgetCard from './WidgetCard';
import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';

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
            <span>정적 주간 보고 기반 <span style={{ color: 'var(--text-primary)' }}>최신 2026-08-05 · 위젯별 기준일 표기</span></span>
          </div>
        </div>
      </header>

      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <AlertTriangle size={24} color="var(--color-warning)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>8월 5일 운영 신호</h2>
        </div>
        <div data-mobile-stack style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
          <div className="ds-card" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <Ship size={20} color="var(--color-info)" />
            <p style={{ margin: '0.75rem 0 0.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>현재 하역 보고</p>
            <strong style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>{logisticsWeeklyReport.unloading.currentTotal.vessels}척 · {logisticsWeeklyReport.unloading.currentTotal.amount.toLocaleString()}MT</strong>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>8월 누계 2척·8,891MT, LAKE PEARL은 7월 반입분</p>
          </div>
          <div className="ds-card" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <DollarSign size={20} color="var(--color-success)" />
            <p style={{ margin: '0.75rem 0 0.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>원어 협의 시장가</p>
            <strong style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>${logisticsWeeklyReport.market.rawMaterialPriceUsdPerMt.toLocaleString()}/MT</strong>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>2026년 8월 5일 보고 · 트레이더-공장 협의 가격</p>
          </div>
          <div className="ds-card" style={{ padding: '1.25rem', borderRadius: '12px' }}>
            <AlertTriangle size={20} color="var(--color-warning)" />
            <p style={{ margin: '0.75rem 0 0.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>품질 모니터링</p>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>고반려 3개 공장 · 고염도 1개 공장</strong>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>TUG·CMC·UC·TUM 대상 잔량 및 클레임 추적 필요</p>
          </div>
        </div>
      </section>

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
          cardDesc="트레이더 단위 반입 물량·점유율 — 주간 보고 (2026년 1~8월, 2026-08-05 기준)"
          telemetry={{ status: 'STATIC', syncDate: '2026-08-05', label: '정적' }}
          customBody={<TraderStatus />}
          takeaway={{
            situation: '2026년 1~8월 트레이더별 누적 반입 물량은 월별 검산 기준 317,175MT이며, 8월 반입은 FCF 3,951MT와 ITOCHU 4,940MT입니다.',
            actionPlan: '8월 반입이 두 트레이더에 집중된 만큼 다음 주 보고에서 TRI MARINE·직거래 반입 재개 여부를 확인합니다.',
            source: '방콕 사무소 주간보고 (2026-08-05, 월별 합계 검산)',
          }}
        />
      </section>

      {/* ═══ Section 2: 가공 (Processing) ═══ */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <Factory size={24} color="var(--color-success)" />
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>가공 공장 가동 현황</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <WidgetCard
            title="가공 공장 가동 현황 (방콕)"
            icon={Factory}
            iconColor="var(--color-success)"
            pillar="S2"
            cardDesc="태국 방콕 통조림 공장 가동률·재고 — 주간 보고 (2026-08-05 기준)"
            telemetry={{ status: 'STATIC', syncDate: '2026-08-05', label: '정적' }}
            customBody={<CanneryStatusCharts />}
            takeaway={{
              situation: '2026-08-05 보고 기준 방콕 13개 공장은 일 2,650MT를 생산하고 원어 122,300MT를 보유해 생산능력 대비 64%, 보관능력 대비 59% 수준입니다.',
              actionPlan: 'THAI UNION의 창고 포화(62,000/62,000MT)와 KINGFISHER의 저가동(20/200MT)을 우선 확인합니다.',
              source: '방콕 사무소 주간보고 (2026-08-05)',
            }}
          />

          <WidgetCard
            title="가공 공장 가동 현황 (송클라)"
            icon={Factory}
            iconColor="var(--color-success)"
            pillar="S2"
            cardDesc="태국 송클라 통조림 공장 가동률·재고 — 주간 보고 (2026-08-05 기준)"
            telemetry={{ status: 'STATIC', syncDate: '2026-08-05', label: '정적' }}
            customBody={<SongkhlaCanneryStatusCharts />}
            takeaway={{
              situation: '2026-08-05 보고 기준 송클라 4개 공장은 일 330MT를 생산하고 원어 4,500MT를 보유해 생산능력 대비 37%, 보관능력 대비 17% 수준입니다.',
              actionPlan: '송클라의 낮은 재고율과 SCC 저가동(50/250MT)을 확인한 뒤 물량 전환 가능성을 판단합니다.',
              source: '방콕 사무소 주간보고 (2026-08-05)',
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
            cardDesc="방콕항 운반선 하역·입항 현황 — 주간 보고 (2026-08-05 기준)"
            telemetry={{ status: 'STATIC', syncDate: '2026-08-05', label: '정적' }}
            customBody={<CarrierUnloadingStatus />}
            takeaway={{
              situation: '2026-08-05 주간 보고에는 방콕 하역선 3척 13,764MT가 기록됐으며, 이 중 8월 누계는 2척 8,891MT입니다.',
              actionPlan: 'SEIN VENUS와 HENG HONG 9의 예정일이 도래했으므로 실제 입항·접안 여부를 확인합니다.',
              source: '방콕 사무소 주간보고 (2026-08-05)',
            }}
          />

          <WidgetCard
            title="냉동 운반선 이동 스케줄"
            icon={Navigation}
            iconColor="var(--color-info)"
            pillar="S3"
            cardDesc="방콕항 운반선 이동 스케줄 — 30주차 주간 보고 (2026-07-24~07-30 기준)"
            telemetry={{ status: 'STATIC', syncDate: '2026-07-30', label: '정적' }}
            customBody={<ReeferMovement />}
            takeaway={{
              situation: '30주차(2026-07-24~07-30) 보고 당시 방콕항 운반선과 캔 공장별 배분 물량입니다. 최신 입항·하역 상태가 아니므로 현재 운영 판단에는 재확인이 필요합니다.',
              actionPlan: '현재 체선일이 10일을 초과한 것으로 확인되는 경우에만 B/L 분할 양륙 또는 송클라 등으로의 목적지 변경을 검토합니다.',
              source: '방콕항 운반선 주간 스케줄 30주차 (2026-07-30 기준)',
            }}
          />
        </div>
      </section>
    </div>
  );
}
