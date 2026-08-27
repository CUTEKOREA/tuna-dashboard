'use client';

import React, { useMemo, useState } from 'react';
import { Anchor, MapPin, Navigation, Package, Ship, type LucideIcon } from 'lucide-react';

import type { FleetDailyDetailPayload } from '@/lib/contracts/fleet-daily-api';
import { buildFleetRoster, formatFleetDailyNote, formatReportedMt, type FleetRoster } from '@/lib/fleet-daily-presentation';
import { resolveFleetHoldUtilization } from '@/lib/fleet-map-load-signal';
import s from './FleetCommandCenter.module.css';

function formatMt(value: number | null) {
  return formatReportedMt(value);
}

function formatCapacity(value: number) {
  return value.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
}

type FishingFleetRow = FleetRoster['pacific'][number];
type CarrierFleetRow = FleetRoster['carrier'][number];
type LonglineFleetRow = FleetRoster['longline'][number];

function FishingVesselCard({ vessel }: { vessel: FishingFleetRow }) {
  const [hovered, setHovered] = useState(false);
  const capacity = vessel.holdCapacity ?? null;
  const spec = vessel.vesselSpec ?? null;
  const utilization = resolveFleetHoldUtilization(vessel.loadedMt, capacity);
  const capacityText = capacity ? `${formatCapacity(capacity.value)} ${capacity.unit}` : '미확인';
  const utilizationText = utilization ? `${utilization.ratioPct}%` : capacity ? '미산출' : '미확인';
  const utilizationStatus = utilization?.level === 'nearCapacity'
    ? '만재 임박'
    : utilization?.level === 'high'
      ? '고적재'
      : null;
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={s.latestVesselCard}
      data-hovered={hovered || undefined}
    >
      <div className={s.latestVesselHeader}><strong>{vessel.displayName}</strong><span><MapPin size={12} aria-hidden="true" />{vessel.location}</span></div>
      <div className={s.latestVesselMetrics}>
        <div><span>일간 어획</span><strong>{formatMt(vessel.catchMt)} <small>(MT)</small></strong></div>
        <div><span>누적 적재</span><strong>{formatMt(vessel.loadedMt)} <small>(MT)</small></strong></div>
      </div>
      {spec ? (
        <div className={s.vesselSpec} role="group" aria-label={`${vessel.displayName} 등록 제원`}>
          <p><span>IMO {spec.imo}</span><span>{formatCapacity(spec.grossTonnage)} {spec.grossTonnageUnit}</span></p>
          <p><span>전장 {formatCapacity(spec.lengthM)}m</span><span>건조 {spec.builtYear}년</span></p>
          <small>제원 근거: {spec.reference}</small>
        </div>
      ) : null}
      <div
        className={s.holdUtilization}
        data-level={utilization?.level ?? (capacity ? 'unitMismatch' : 'missing')}
        aria-label={capacity ? `어창 용량 ${capacityText} · 적재율 ${utilizationText}` : '어창 용량 미확인'}
        title={capacity ? `${capacity.source} ${capacity.asOf} 기준` : undefined}
      >
        <div className={s.holdUtilizationHeader}>
          <span>어창 용량</span><strong>{capacityText}</strong>
          <span>적재율</span>
          <strong>{utilizationText}</strong>
        </div>
        {utilizationStatus ? <div className={s.holdStatusRow}><em className={s.holdStatusLabel}>{utilizationStatus}</em></div> : null}
        {utilization ? (
          <div
            className={s.holdProgress}
            role="progressbar"
            aria-label={`${vessel.displayName} 적재율 ${utilization.ratioPct}%${utilizationStatus ? ` · ${utilizationStatus}` : ''}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(utilization.ratioPct, 100)}
          >
            <span className={s.holdProgressFill} style={{ width: `${utilization.barPct}%` }} />
          </div>
        ) : null}
        {capacity?.unit === '㎥' ? <p className={s.holdCapacityNote}>적재량 MT와 어창 용량 ㎥의 단위가 다릅니다.</p> : null}
        {capacity?.reference ? <p className={s.holdEvidence}>용량 근거: {capacity.reference}</p> : null}
      </div>
      {vessel.note !== '-' ? <p className={s.latestVesselNote}>보고 당시 비고: {formatFleetDailyNote(vessel.note)}</p> : null}
    </article>
  );
}

function CarrierCard({ vessel }: { vessel: CarrierFleetRow }) {
  const [hovered, setHovered] = useState(false);
  const loadedPercent = vessel.loadedMt === null || vessel.capacityMt === null
    ? null
    : Math.min(Math.round(vessel.loadedMt / vessel.capacityMt * 100), 100);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={s.latestVesselCard}
      data-carrier-entity={vessel.entityType}
      data-hovered={hovered || undefined}
    >
      <div className={s.latestVesselHeader}><strong>{vessel.displayName}</strong><span>{vessel.entityType === 'container' ? <Package size={12} aria-hidden="true" /> : <MapPin size={12} aria-hidden="true" />}{vessel.location ?? '미보고'}</span></div>
      <div className={s.latestVesselMetrics}>
        <div><span>선적</span><strong>{formatMt(vessel.loadedMt)} <small>(MT)</small></strong></div>
        <div><span>예상잔량</span><strong>{formatMt(vessel.expectedRemainingMt)} <small>(MT)</small></strong></div>
      </div>
      <p className={s.latestVesselNote}>{vessel.entityType === 'container' ? '컨테이너 화물 기록' : `용량 ${formatMt(vessel.capacityMt)} (MT) · 적재율 ${loadedPercent === null ? '미보고' : `${loadedPercent}%`}`} · 보고 당시 비고: {formatFleetDailyNote(vessel.note)}</p>
    </article>
  );
}

function LonglineCard({ vessel }: { vessel: LonglineFleetRow }) {
  return <article className={s.latestVesselCard} data-longline-record="true"><div className={s.latestVesselHeader}><strong>{vessel.displayName}</strong></div><div className={s.latestVesselMetrics}><div><span>선적</span><strong>{formatMt(vessel.loadedMt)} <small>(MT)</small></strong></div></div><p className={s.latestVesselNote}>보고 당시 비고: {formatFleetDailyNote(vessel.note || '미보고')}</p></article>;
}

function SectionHeader({ icon: Icon, title, count, summary, countLabel = `${count}척 보고` }: { icon: LucideIcon; title: string; count: number; summary: string; countLabel?: string }) {
  return (
    <header className={s.latestRosterHeader}>
      <div><Icon size={18} aria-hidden="true" /><strong>{title}</strong><span>{countLabel}</span></div>
      <p>{summary}</p>
    </header>
  );
}

export default function FleetRosterGrid({ detail }: { detail: FleetDailyDetailPayload }) {
  const roster = useMemo(() => buildFleetRoster(detail), [detail]);
  const pacificSummary = `일간 ${detail.pacific.dailyMt.toLocaleString()} (MT) · 월간 ${detail.pacific.monthlyMt.toLocaleString()} (MT) · 연간 ${detail.pacific.annualMt.toLocaleString()} (MT) · ${detail.asOf}`;
  const atlanticSummary = `일간 ${detail.atlantic.dailyMt.toLocaleString()} (MT) · 월간 ${detail.atlantic.monthlyMt.toLocaleString()} (MT) · 연간 ${detail.atlantic.annualMt.toLocaleString()} (MT) · ${detail.asOf} · VOLTA GLORY는 매각 완료(사내 확인)로 현행 조업 명부에서 제외`;

  return (
    <div className={s.rosterGrid}>
      <section className={s.rosterSection}>
        <SectionHeader icon={Navigation} title="태평양 선망" count={roster.pacific.length} summary={pacificSummary} />
        <div className={s.latestRosterCards}>{roster.pacific.map((vessel) => <FishingVesselCard key={vessel.name} vessel={vessel} />)}</div>
      </section>
      <section className={s.rosterSection}>
        <SectionHeader icon={Ship} title="대서양 선망" count={roster.atlantic.length} summary={atlanticSummary} />
        <div className={s.latestRosterCards}>{roster.atlantic.map((vessel) => <FishingVesselCard key={vessel.name} vessel={vessel} />)}</div>
      </section>
      <section className={s.rosterSection}>
        <SectionHeader icon={Anchor} title="연승선" count={roster.longline.length} countLabel={`${roster.longline.length}척 보고`} summary="최신 일일보고 원문 상세" />
        {roster.longline.length === 0 ? <p className={s.emptyRoster}>최신 원문에 연승선 상세가 없어 표시하지 않습니다.</p> : <div className={s.latestRosterCards}>{roster.longline.map((vessel) => <LonglineCard key={vessel.name} vessel={vessel} />)}</div>}
      </section>
      <section className={s.rosterSection}>
        <SectionHeader icon={Package} title="운반선·컨테이너" count={roster.carrier.length} countLabel={`${roster.carrier.length}건`} summary={`선적 ${formatMt(detail.carrier.loadedTotalMt)} (MT) · 예상잔량 ${formatMt(detail.carrier.expectedRemainingMt)} (MT) · ${detail.asOf}`} />
        <div className={s.latestRosterCards}>{roster.carrier.map((vessel) => <CarrierCard key={vessel.name} vessel={vessel} />)}</div>
      </section>
    </div>
  );
}
