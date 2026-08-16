'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle, LockKeyhole, RotateCcw, Ship } from 'lucide-react';
import type { FleetDailyDetailErrorCode, FleetDailyDetailState } from '@/lib/contracts/fleet-daily-api';
import { validateFleetDailyDetailResponse } from '@/lib/contracts/fleet-daily-api';
import {
  fleetDailyPublicDeltas,
  fleetDailyPublicLatest,
  fleetDailyPublicReconciliation,
} from '@/lib/data/fleet-daily-public';
import { formatFleetDailyDelta, formatReportedMt } from '@/lib/fleet-daily-presentation';
import FleetDailyOperations from './FleetDailyOperations';
import FleetHeroKPI from './FleetHeroKPI';
import FleetRosterGrid from './FleetRosterGrid';
import { FleetChartSection, FleetDetailPanel } from './FleetAnalysisPanels';
import VdsStrategyMatrix from './VdsStrategyMatrix';
import PnaAccessFeeWidgets from './PnaAccessFeeWidgets';
import VesselVdsStatus from './VesselVdsStatus';
import HeroZone from './v2/HeroZone';
import PillTabs from './v2/PillTabs';
import s from './FleetCommandCenter.module.css';

const FleetRealMap = dynamic(() => import('./FleetRealMap'), {
  ssr: false,
  loading: () => <p style={{ padding: '24px 4px', color: 'var(--text-muted)' }}>지도를 불러오는 중입니다.</p>,
});

type FleetTaskTab = 'operations' | 'vessels' | 'performance' | 'access';

const taskTabs = [
  { id: 'operations', label: '오늘의 운영' },
  { id: 'vessels', label: '선박·수역' },
  { id: 'performance', label: '실적 분석' },
  { id: 'access', label: 'VDS·입어료' },
] as const;

const dailyTotalMt = fleetDailyPublicLatest.pacific.dailyMt + fleetDailyPublicLatest.atlantic.dailyMt;
const dailyMonthlyMt = fleetDailyPublicLatest.pacific.monthlyMt + fleetDailyPublicLatest.atlantic.monthlyMt;
const dailyAnnualMt = fleetDailyPublicLatest.pacific.annualMt + fleetDailyPublicLatest.atlantic.annualMt;
const formatOptionalMt = (value: number | null) => formatReportedMt(value);
const dailyHeroSecondaryKpis = [
  { label: '월간 합계', value: dailyMonthlyMt, unit: '(MT)' },
  { label: '연간 합계', value: dailyAnnualMt, unit: '(MT)', decimals: 1 },
  ...(fleetDailyPublicLatest.carrier.loadedTotalMt === null
    ? []
    : [{ label: '운반선 선적', value: fleetDailyPublicLatest.carrier.loadedTotalMt, unit: '(MT)', decimals: 1 }]),
];

const decisions = [
  { icon: Ship, level: '태평양', title: `일간 ${fleetDailyPublicLatest.pacific.dailyMt.toLocaleString()} (MT)`, detail: `전일 대비 ${formatFleetDailyDelta(fleetDailyPublicDeltas.pacificDailyMt)} (MT) · 월간 ${fleetDailyPublicLatest.pacific.monthlyMt.toLocaleString()} (MT)`, tone: 'primary' },
  { icon: Ship, level: '대서양', title: `일간 ${fleetDailyPublicLatest.atlantic.dailyMt.toLocaleString()} (MT)`, detail: `전일 대비 ${formatFleetDailyDelta(fleetDailyPublicDeltas.atlanticDailyMt)} (MT) · 월간 ${fleetDailyPublicLatest.atlantic.monthlyMt.toLocaleString()} (MT)`, tone: 'primary' },
  { icon: Ship, level: '운반선', title: `선적 ${formatOptionalMt(fleetDailyPublicLatest.carrier.loadedTotalMt)} (MT)`, detail: `예상잔량 ${formatOptionalMt(fleetDailyPublicLatest.carrier.expectedRemainingMt)} (MT)`, tone: 'primary' },
  { icon: AlertTriangle, level: '검산', title: fleetDailyPublicReconciliation.valid ? '최신 상세 행 검산 일치' : fleetDailyPublicReconciliation.unavailableCount > 0 ? '미보고 포함 · 검산 불가' : '최신 상세 행 확인 필요', detail: `전일 합계 ${formatFleetDailyDelta(fleetDailyPublicDeltas.totalDailyMt)} (MT) · 이슈 ${fleetDailyPublicReconciliation.issueCount}건`, tone: fleetDailyPublicReconciliation.valid ? 'primary' : 'danger' },
] as const;

const nowDecisionIndex = Math.max(0, decisions.findIndex((item) => item.tone === 'danger'));

function accessAction(code: FleetDailyDetailErrorCode) {
  if (code === 'authentication_required') return { href: '/mail/login?next=/fleet', label: '서버 로그인' };
  if (code === 'mfa_required') return { href: '/mail', label: '2단계 인증' };
  return null;
}

function VesselDetailBoundary({ state, onRetry }: { state: FleetDailyDetailState; onRetry: () => void }) {
  if (state.status === 'ready') {
    return <><FleetRealMap detail={state.detail} /><FleetRosterGrid detail={state.detail} /></>;
  }

  const action = state.status === 'loading' ? null : accessAction(state.code);
  const message = state.status === 'loading'
    ? '서버 권한을 확인하는 중입니다.'
    : state.code === 'authentication_required'
      ? '최신 좌표·비고·일정·적재 상세를 보려면 서버 로그인이 필요합니다.'
      : state.code === 'mfa_required'
        ? '선박 상세는 2단계 인증 후 표시됩니다.'
        : state.code === 'fleet_access_required'
          ? '이 계정에는 선단 상세 권한이 없습니다.'
          : '보호된 상세를 불러올 수 없습니다.';

  return (
    <section className={s.protectedDetailGate} aria-live="polite">
      <LockKeyhole size={24} aria-hidden="true" />
      <div><strong>선박 상세 보호</strong><p>{message}</p></div>
      {action ? <a href={action.href}>{action.label}</a> : null}
      {state.status === 'error' ? <button type="button" onClick={onRetry}><RotateCcw size={15} aria-hidden="true" />다시 확인</button> : null}
    </section>
  );
}

export default function FleetCommandCenter({ heroOnly = false }: { heroOnly?: boolean }) {
  const [activeTab, setActiveTab] = useState<FleetTaskTab>('operations');
  const [detailState, setDetailState] = useState<FleetDailyDetailState>({ status: 'loading' });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (heroOnly) return undefined;
    const controller = new AbortController();
    void fetch('/api/fleet/daily', {
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    }).then(async (response) => {
      const payload = validateFleetDailyDetailResponse(await response.json());
      if (response.ok && payload.ok) {
        setDetailState({ status: 'ready', detail: payload.detail });
        return;
      }
      if (!payload.ok) {
        const denied = ['authentication_required', 'fleet_access_required', 'mfa_required'].includes(payload.code);
        setDetailState({ status: denied ? 'denied' : 'error', code: payload.code });
        return;
      }
      setDetailState({ status: 'error', code: 'fleet_data_unavailable' });
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setDetailState({ status: 'error', code: 'fleet_data_unavailable' });
    });
    return () => controller.abort();
  }, [heroOnly, retryCount]);

  const fleetHero = (
    <HeroZone
      className={s.fleetHero}
      variant="vessel"
      title="선단 일일 작전"
      subtitle={`${fleetDailyPublicLatest.reportDate} 보고 · ${fleetDailyPublicLatest.asOf} 조업 기준`}
      primaryKpi={{ label: '일간 합계', value: dailyTotalMt, unit: '(MT)' }}
      secondaryKpis={dailyHeroSecondaryKpis}
      strip={<div className={s.missionStrip}>{decisions.map(({ icon: Icon, level, title, detail, tone }, index) => {
        const now = index === nowDecisionIndex;
        return (
          <article key={title} className={`${s.missionCard} ${s[`decision_${tone}`]} ${now ? s.missionCardNow : ''}`} data-now={now ? 'true' : 'false'}>
            <Icon size={18} aria-hidden="true" />
            <div>
              <span className={s.decisionLevel}>{now ? `지금 · ${level}` : level}</span>
              <strong>{title}</strong>
              <p>{detail}</p>
            </div>
          </article>
        );
      })}</div>}
    />
  );

  if (heroOnly) return <div className={s.wrapper}>{fleetHero}</div>;

  return (
    <div className={s.wrapper}>
      {fleetHero}
      <PillTabs className={s.taskTabs} tabs={taskTabs.map((tab) => ({ key: tab.id, label: tab.label }))} activeKey={activeTab} onChange={(key) => setActiveTab(key as FleetTaskTab)} ariaLabel="선단 업무 보기" tabIdPrefix="fleet-tab" panelIdPrefix="fleet-panel" />
      <section id="fleet-panel-operations" role="tabpanel" aria-labelledby="fleet-tab-operations" className={s.tabPanel} hidden={activeTab !== 'operations'}><FleetDailyOperations detailState={detailState} /></section>
      <section id="fleet-panel-vessels" role="tabpanel" aria-labelledby="fleet-tab-vessels" className={s.tabPanel} hidden={activeTab !== 'vessels'}><VesselDetailBoundary state={detailState} onRetry={() => { setDetailState({ status: 'loading' }); setRetryCount((value) => value + 1); }} /></section>
      <section id="fleet-panel-performance" role="tabpanel" aria-labelledby="fleet-tab-performance" className={s.tabPanel} hidden={activeTab !== 'performance'}><FleetHeroKPI mode="weekly" /><FleetChartSection /><FleetDetailPanel /></section>
      <section id="fleet-panel-access" role="tabpanel" aria-labelledby="fleet-tab-access" className={s.tabPanel} hidden={activeTab !== 'access'}><div className={s.accessAlert}><AlertTriangle size={18} aria-hidden="true" /><div><strong>국적선과 키리바시 선박을 분리 집계</strong><p>국적선 6척과 키리바시 선박 4척은 별도 모집단입니다. 음수 잔여는 원문을 그대로 표시했습니다.</p></div></div><VesselVdsStatus /><VdsStrategyMatrix /><PnaAccessFeeWidgets /></section>
    </div>
  );
}
