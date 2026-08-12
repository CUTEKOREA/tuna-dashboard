'use client';

import React, { useRef, useState } from 'react';
import { AlertTriangle, Anchor, CalendarClock, Ship, Wrench } from 'lucide-react';
import FleetHeroKPI from './FleetHeroKPI';
import FleetRosterGrid from './FleetRosterGrid';
import { FleetChartSection, FleetDetailPanel } from './FleetAnalysisPanels';
import FleetPixelMap from './FleetPixelMap';
import VdsStrategyMatrix from './VdsStrategyMatrix';
import PnaAccessFeeWidgets from './PnaAccessFeeWidgets';
import s from './FleetCommandCenter.module.css';

type FleetTaskTab = 'operations' | 'vessels' | 'performance' | 'access';

const taskTabs = [
  { id: 'operations', label: '오늘의 운영' },
  { id: 'vessels', label: '선박·수역' },
  { id: 'performance', label: '실적 분석' },
  { id: 'access', label: 'VDS·입어료' },
] as const;

const climateRisk = {
  sstAnomaly: '+1.2℃',
  impact: 'S/JUP 기관 수리와 대기 운반선 3척의 일정 확인이 필요합니다.',
  riskLevel: '주의',
};

const decisions = [
  { icon: Wrench, level: '긴급', title: 'S/JUP 기관 수리', detail: '출항 일정 미확정 · 기술자 일정 확인', tone: 'danger' },
  { icon: Ship, level: '관리', title: '운반선 3척 대기', detail: 'SEIN KASAMA · SHIN IZU · SEIN GALAXY 전재 순서 확정', tone: 'warning' },
  { icon: Anchor, level: '확인', title: 'SEIN VENUS 하역 중', detail: '방콕 하역 진척은 하역 현황에서 확인', tone: 'primary' },
  { icon: CalendarClock, level: '기한', title: '입어료 납부 상태', detail: '경과 표시 4건의 실제 납부 여부 재확인', tone: 'danger' },
] as const;

export default function FleetCommandCenter() {
  const [activeTab, setActiveTab] = useState<FleetTaskTab>('operations');
  const tabRefs = useRef<Record<FleetTaskTab, HTMLButtonElement | null>>({ operations: null, vessels: null, performance: null, access: null });

  const selectTab = (tab: FleetTaskTab) => {
    setActiveTab(tab);
    requestAnimationFrame(() => tabRefs.current[tab]?.focus());
  };

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % taskTabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + taskTabs.length) % taskTabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = taskTabs.length - 1;
    else return;
    event.preventDefault();
    selectTab(taskTabs[nextIndex].id);
  };

  return (
    <div className={s.wrapper}>
      <div className={s.taskTabs} role="tablist" aria-label="선단 업무 보기">
        {taskTabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`fleet-tab-${tab.id}`}
            ref={(node) => { tabRefs.current[tab.id] = node; }}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`fleet-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`${s.taskTab} ${activeTab === tab.id ? s.taskTabActive : ''}`}
            onClick={() => selectTab(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'operations' && (
        <section id="fleet-panel-operations" role="tabpanel" aria-labelledby="fleet-tab-operations" className={s.tabPanel}>
          <FleetHeroKPI mode="daily" climateRisk={climateRisk} />
          <div className={s.decisionPanel}>
            <div className={s.decisionHeader}>
              <div><span className={s.eyebrow}>오늘의 운영 판단</span><h3>확인과 조치가 필요한 4건</h3></div>
              <span className={s.staticBadge}>7월 31일 보고 기준</span>
            </div>
            <div className={s.decisionGrid}>
              {decisions.map(({ icon: Icon, level, title, detail, tone }) => (
                <article key={title} className={`${s.decisionItem} ${s[`decision_${tone}`]}`}>
                  <Icon size={18} aria-hidden="true" />
                  <div><span className={s.decisionLevel}>{level}</span><strong>{title}</strong><p>{detail}</p></div>
                </article>
              ))}
            </div>
            <details className={s.reportDetails}>
              <summary>업무보고 원문 펼치기</summary>
              <p>S/CHA 전재 후 출항 완료. S/JUP 기관 수리 중이며 출항 일정은 기술자 확인이 필요합니다. 운반선 대기 순서와 대서양 하역 일정을 관리해야 합니다.</p>
            </details>
          </div>
        </section>
      )}

      {activeTab === 'vessels' && (
        <section id="fleet-panel-vessels" role="tabpanel" aria-labelledby="fleet-tab-vessels" className={s.tabPanel}>
          <div className={s.sectionHeading}><div><span className={s.eyebrow}>선박·수역</span><h3>예외 선박과 수역별 배치</h3></div><span>지도는 보고 좌표의 개략 위치입니다</span></div>
          <FleetPixelMap />
          <FleetRosterGrid />
        </section>
      )}

      {activeTab === 'performance' && (
        <section id="fleet-panel-performance" role="tabpanel" aria-labelledby="fleet-tab-performance" className={s.tabPanel}>
          <FleetHeroKPI mode="weekly" />
          <FleetChartSection />
          <FleetDetailPanel />
        </section>
      )}

      {activeTab === 'access' && (
        <section id="fleet-panel-access" role="tabpanel" aria-labelledby="fleet-tab-access" className={s.tabPanel}>
          <div className={s.accessAlert}><AlertTriangle size={18} aria-hidden="true" /><div><strong>입어료 납부 상태 확인 필요</strong><p>경과 표시 4건은 정적 배정표 기준입니다. 실제 납부 여부를 확인한 뒤 상태를 갱신하세요.</p></div></div>
          <VdsStrategyMatrix />
          <PnaAccessFeeWidgets />
        </section>
      )}
    </div>
  );
}
