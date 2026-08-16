'use client';

import React, { useMemo, useState } from 'react';
import { Anchor, MapPin, Navigation, Package, Ship, type LucideIcon } from 'lucide-react';

import type { FleetDailyDetailPayload } from '@/lib/contracts/fleet-daily-api';
import { buildFleetRoster, formatFleetDailyNote, formatReportedMt, type FleetRoster } from '@/lib/fleet-daily-presentation';
import s from './FleetCommandCenter.module.css';

function formatMt(value: number | null) {
  return formatReportedMt(value);
}

type FishingFleetRow = FleetRoster['pacific'][number];
type CarrierFleetRow = FleetRoster['carrier'][number];
type LonglineFleetRow = FleetRoster['longline'][number];

function FishingVesselCard({ vessel }: { vessel: FishingFleetRow }) {
  const [hovered, setHovered] = useState(false);
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
  const atlanticSummary = `일간 ${detail.atlantic.dailyMt.toLocaleString()} (MT) · 월간 ${detail.atlantic.monthlyMt.toLocaleString()} (MT) · 연간 ${detail.atlantic.annualMt.toLocaleString()} (MT) · ${detail.asOf}`;

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
