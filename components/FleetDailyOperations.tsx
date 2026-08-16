import { CalendarClock, CheckCircle2, ClipboardCheck, LockKeyhole, Ship } from 'lucide-react';

import type { FleetDailyDetailState } from '@/lib/contracts/fleet-daily-api';
import {
  fleetDailyPublic,
  fleetDailyPublicDeltas,
  fleetDailyPublicLatest,
  fleetDailyPublicReconciliation,
} from '@/lib/data/fleet-daily-public';
import { formatFleetDailyDelta, formatFleetDailyNote, formatReportedMt } from '@/lib/fleet-daily-presentation';
import TelemetryBadge from './TelemetryBadge';
import s from './FleetCommandCenter.module.css';

function formatMt(value: number | null) {
  return formatReportedMt(value);
}

const reconciliationRows = [
  { label: '태평양 일간', result: fleetDailyPublicReconciliation.pacificDaily },
  { label: '대서양 일간', result: fleetDailyPublicReconciliation.atlanticDaily },
  { label: '운반선 선적', result: fleetDailyPublicReconciliation.carrierLoaded },
  { label: '운반선 예상잔량', result: fleetDailyPublicReconciliation.carrierExpectedRemaining },
];

function reconciliationLabel(matches: boolean | null) {
  if (matches === null) return '미보고 포함 · 검산 불가';
  return matches ? '일치' : '확인 필요';
}

function ProtectedSchedule({ detailState }: { detailState: FleetDailyDetailState }) {
  if (detailState.status === 'ready') {
    const latestSchedules = [
      ...detailState.detail.pacific.vessels,
      ...detailState.detail.atlantic.vessels,
      ...detailState.detail.carrier.vessels,
      ...detailState.detail.longline.vessels,
    ].filter((vessel) => vessel.note !== '-');
    return (
      <>
        <div className={s.dailyCardHeading}><CalendarClock size={18} aria-hidden="true" /><h3>보고 당시 상태·예정</h3></div>
        <p>아래 상태·일정·하역·전재는 최신 업무보고의 비고를 옮긴 것이며, 현재 상태를 추정하지 않습니다.</p>
        <ul className={s.scheduleList}>
          {latestSchedules.map((vessel) => (
            <li key={`${vessel.name}-${vessel.note}`}><strong>{vessel.name}</strong><span>선적 {formatMt(vessel.loadedMt)} (MT) · {formatFleetDailyNote(vessel.note)}</span></li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <>
      <div className={s.dailyCardHeading}><LockKeyhole size={18} aria-hidden="true" /><h3>선박 상세 보호</h3></div>
      <p>최신 일일보고에서 새로 추가된 좌표·비고·일정·적재 상세는 관리자·선단 허용목록과 2단계 인증을 모두 확인한 뒤에만 표시합니다.</p>
      <p className={s.protectedDetailStatus} role="status">
        {detailState.status === 'loading' ? '서버 권한을 확인하는 중입니다.' : detailState.code === 'mfa_required' ? '2단계 인증이 필요합니다.' : detailState.code === 'fleet_access_required' ? '선단 상세 권한이 없습니다.' : detailState.code === 'authentication_required' ? '서버 로그인이 필요합니다.' : '보호된 상세를 불러올 수 없습니다.'}
      </p>
    </>
  );
}

export default function FleetDailyOperations({ detailState }: { detailState: FleetDailyDetailState }) {
  const totalDailyMt = fleetDailyPublicLatest.pacific.dailyMt + fleetDailyPublicLatest.atlantic.dailyMt;
  const totalMonthlyMt = fleetDailyPublicLatest.pacific.monthlyMt + fleetDailyPublicLatest.atlantic.monthlyMt;
  const totalAnnualMt = fleetDailyPublicLatest.pacific.annualMt + fleetDailyPublicLatest.atlantic.annualMt;
  const counts = fleetDailyPublic.quality.counts;

  return (
    <section className={s.dailyOperations} aria-label="일일 선단 운영 보고">
      <header className={s.dailyOperationsHeader}>
        <div>
          <span className={s.eyebrow}>일일 운영 보고</span>
          <h2>보고일 {fleetDailyPublicLatest.reportDate} · 조업 기준일 {fleetDailyPublicLatest.asOf}</h2>
          <p>일일 업무보고의 공개 집계와 원문 검산 결과를 표시합니다.</p>
        </div>
        <TelemetryBadge status="SYNCED" syncDate={fleetDailyPublicLatest.reportDate} />
      </header>

      <div className={s.dailyMetricGrid}>
        {[
          { label: '태평양', daily: fleetDailyPublicLatest.pacific.dailyMt, monthly: fleetDailyPublicLatest.pacific.monthlyMt, annual: fleetDailyPublicLatest.pacific.annualMt, delta: fleetDailyPublicDeltas.pacificDailyMt },
          { label: '대서양', daily: fleetDailyPublicLatest.atlantic.dailyMt, monthly: fleetDailyPublicLatest.atlantic.monthlyMt, annual: fleetDailyPublicLatest.atlantic.annualMt, delta: fleetDailyPublicDeltas.atlanticDailyMt },
          { label: '합계', daily: totalDailyMt, monthly: totalMonthlyMt, annual: totalAnnualMt, delta: fleetDailyPublicDeltas.totalDailyMt },
        ].map((metric) => (
          <article key={metric.label} className={s.dailyMetricCard}>
            <span>{metric.label} 일간</span>
            <strong>{formatMt(metric.daily)} <small>(MT)</small></strong>
            <p>월간 {formatMt(metric.monthly)} (MT) · 연간 {formatMt(metric.annual)} (MT)</p>
            <em>{formatFleetDailyDelta(metric.delta)} (MT) 전일 대비</em>
          </article>
        ))}
        <article className={s.dailyMetricCard}>
          <span>운반선 선적</span>
          <strong>{formatMt(fleetDailyPublicLatest.carrier.loadedTotalMt)} <small>(MT)</small></strong>
          <p>예상잔량 {formatMt(fleetDailyPublicLatest.carrier.expectedRemainingMt)} (MT)</p>
          <em>원문 집계 기준</em>
        </article>
      </div>

      <div className={s.dailyDetailGrid}>
        <article className={s.dailyDetailCard}><ProtectedSchedule detailState={detailState} /></article>
        <article className={s.dailyDetailCard}>
          <div className={s.dailyCardHeading}><ClipboardCheck size={18} aria-hidden="true" /><h3>최신 검산</h3></div>
          <p>최신 상세 행 합계와 보고 합계를 비교합니다. 원문 이상은 자동 보정하지 않았습니다.</p>
          <ul className={s.reconciliationList}>
            {reconciliationRows.map(({ label, result }) => (
              <li key={label}>
                <span>{result.matches ? <CheckCircle2 size={16} aria-hidden="true" /> : <Ship size={16} aria-hidden="true" />}{label}</span>
                <strong>{formatMt(result.reportedMt)} / {formatMt(result.rowsMt)} (MT) · {reconciliationLabel(result.matches)}</strong>
              </li>
            ))}
          </ul>
          <div className={s.qualitySummary}>
            전체 보고 {fleetDailyPublic._meta.reportCount}건 · 전기간 검산 {counts.reconciliationChecks}회 · 완전 검산 {counts.reconciliationCompleteChecks}회 · 미보고 포함 {counts.reconciliationUnavailableChecks}회 / {counts.reconciliationUnavailableDocuments}문서 · 부분합 차이 전체 {counts.reconciliationPartialDifferences}건 / {counts.reconciliationPartialDifferenceDocuments}문서 · 확정 불일치 {counts.reconciliationIssues}건 / {counts.reconciliationDocuments}문서 · 미보고 포함 차이 {fleetDailyPublic.quality.incompletePartialDifferences}건 / {fleetDailyPublic.quality.incompletePartialDifferenceDocuments}문서 · 중복 선박 행 {counts.duplicateVesselRows}건 · 좌표 형식 이슈 {counts.coordinateFormatIssues}건 · 연승 구역 미기재 {counts.longlineSectionMissing}건 · 최신 검산 {fleetDailyPublicReconciliation.valid ? '일치' : fleetDailyPublicReconciliation.unavailableCount > 0 ? '미보고 포함 · 검산 불가' : '확인 필요'}
          </div>
        </article>
      </div>
    </section>
  );
}
