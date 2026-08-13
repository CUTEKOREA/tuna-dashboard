"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  Factory, RefreshCcw, TrendingUp, Ship, Navigation
} from 'lucide-react';
import CanneryStatusCharts from './CanneryStatusCharts';
import SongkhlaCanneryStatusCharts from './SongkhlaCanneryStatusCharts';
import ReeferMovement from './ReeferMovement';
import TraderStatus from './TraderStatus';
import CarrierUnloadingStatus from './CarrierUnloadingStatus';
import WidgetCard from './WidgetCard';
import LogisticsOperationsPanel from './LogisticsOperationsPanel';
import styles from './LogisticsCommandCenter.module.css';
import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';

type LogisticsTab = 'operations' | 'receipts' | 'canneries' | 'vessels';

const tabs: Array<{ id: LogisticsTab; label: string; description: string }> = [
  { id: 'operations', label: '오늘의 운영', description: '예외 신호와 확인 과제' },
  { id: 'receipts', label: '반입·가격', description: '트레이더 반입과 시장가' },
  { id: 'canneries', label: '공장 운영', description: '방콕·송클라 생산과 재고' },
  { id: 'vessels', label: '선박·보고자료', description: '하역 현황과 보고 시점 이동표' },
];

export default function LogisticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LogisticsTab>('operations');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    // Simulate loading for the dashboard skeleton
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const selectTab = (tab: LogisticsTab, focus = false) => {
    setActiveTab(tab);
    if (focus) {
      const index = tabs.findIndex((item) => item.id === tab);
      tabRefs.current[index]?.focus();
    }
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    selectTab(tabs[nextIndex].id, true);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <RefreshCcw size={32} style={{ color: 'var(--color-success)', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>물류·가공 인텔리전스 로딩 중...</p>
    </div>
  );

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <Factory size={24} aria-hidden="true" />
            </div>
            <div>
              <h1>물류·가공 인텔리전스</h1>
              <p>글로벌 밸류체인 운영 상황실</p>
            </div>
          </div>
          <div className={styles.reportBadge}>
            <span>정적 보고 기반 <strong>최신 2026-08-13 · 위젯별 기준일 표기</strong></span>
          </div>
        </div>
      </header>

      <div className={styles.tabList} role="tablist" aria-label="물류·가공 업무 화면">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => { tabRefs.current[index] = element; }}
            id={`logistics-tab-${tab.id}`}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            role="tab"
            type="button"
            aria-selected={activeTab === tab.id}
            aria-controls={`logistics-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => selectTab(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            title={tab.description}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section
        id="logistics-panel-operations"
        className={styles.panel}
        role="tabpanel"
        aria-labelledby="logistics-tab-operations"
        hidden={activeTab !== 'operations'}
      >
        <LogisticsOperationsPanel />
      </section>

      <section
        id="logistics-panel-receipts"
        className={styles.panel}
        role="tabpanel"
        aria-labelledby="logistics-tab-receipts"
        hidden={activeTab !== 'receipts'}
      >
        <div className={styles.panelHeader}>
          <TrendingUp size={22} color="var(--color-info)" aria-hidden="true" />
          <div><h2>반입·가격</h2><p>월별 반입, 트레이더 구성, 시장 협의가와 데이터 상충을 확인합니다.</p></div>
        </div>
        <div className={styles.priceSummary}>
          <span>원어 협의 시장가</span>
          <strong>${logisticsWeeklyReport.market.rawMaterialPriceUsdPerMt.toLocaleString()}/MT</strong>
          <small>{logisticsWeeklyReport.market.reportDate} 보고 · 트레이더-통조림 공장 협의 가격</small>
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

      <section
        id="logistics-panel-canneries"
        className={styles.panel}
        role="tabpanel"
        aria-labelledby="logistics-tab-canneries"
        hidden={activeTab !== 'canneries'}
      >
        <div className={styles.panelHeader}>
          <Factory size={22} color="var(--color-success)" aria-hidden="true" />
          <div><h2>공장 운영</h2><p>방콕·송클라의 생산 가동률, 원어 재고와 예외 공장을 비교합니다.</p></div>
        </div>
        <div className={styles.stack}>
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

      <section
        id="logistics-panel-vessels"
        className={styles.panel}
        role="tabpanel"
        aria-labelledby="logistics-tab-vessels"
        hidden={activeTab !== 'vessels'}
      >
        <div className={styles.panelHeader}>
          <Ship size={22} color="var(--color-info)" aria-hidden="true" />
          <div><h2>선박·보고자료</h2><p>현재 하역 보고와 보고 시점 냉동 운반선 배분표를 분리해 확인합니다.</p></div>
        </div>
        <div className={styles.stack}>
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

          <div>
            <div className={styles.historyNotice}>보고 시점 자료 — 현재 운항 상태가 아닙니다. 실제 입항·접안·하역 여부는 최신 운영 기록으로 재확인해야 합니다.</div>
            <details className={styles.historyDetails}>
              <summary><span><Navigation size={17} aria-hidden="true" /> 냉동 운반선 보고자료 펼치기</span></summary>
              <div className={styles.historyBody}>
                <WidgetCard
                  title="냉동 운반선 이동 스케줄"
                  icon={Navigation}
                  iconColor="var(--color-info)"
                  pillar="S3"
                  cardDesc="방콕항 운반선 이동 스케줄 — 32주차 주간 보고 (2026-08-07~08-13 기준)"
                  telemetry={{ status: 'STATIC', syncDate: '2026-08-13', label: '정적' }}
                  customBody={<ReeferMovement />}
                  takeaway={{
                    situation: '32주차(2026-08-07~08-13) TTA 보고에는 방콕항 6척의 캔 공장별 배분 24,834.299MT가 기록됐으며, SEA STAR V와 PACIFIC JOURNEY가 추가됐습니다.',
                    actionPlan: '신규 보고된 SEA STAR V 3,951.273MT와 PACIFIC JOURNEY 2,240MT의 실제 하역 진행 상태를 이후 주간보고와 교차 확인합니다.',
                    source: 'TTA 운반선 이동표 32주차 (2026-08-13 기준)',
                  }}
                />
              </div>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
