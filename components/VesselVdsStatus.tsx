'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Ship } from 'lucide-react';

import { kiribatiVds, nationalVds, type VdsArea } from '@/lib/fleet-operations-2026-08-09';
import TelemetryBadge from './TelemetryBadge';
import TermTooltip from './TermTooltip';
import s from './FleetCommandCenter.module.css';

type FleetType = 'national' | 'kiribati';

const formatDay = (value: number) => value.toLocaleString('ko-KR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const areaSummary = (area: VdsArea) => {
  const rate = area.totals.allocated > 0 ? area.totals.consumed / area.totals.allocated * 100 : 0;
  const overrunCount = area.rows.filter((row) => row.remaining < 0).length;
  return { rate, overrunCount };
};

export default function VesselVdsStatus() {
  const [fleetType, setFleetType] = useState<FleetType>('national');
  const dataset = fleetType === 'national' ? nationalVds : kiribatiVds;
  const [selectedAreaByFleet, setSelectedAreaByFleet] = useState<Record<FleetType, string>>({
    national: '키리바시',
    kiribati: '키리바시',
  });
  const selectedArea = selectedAreaByFleet[fleetType];
  const currentArea = useMemo(
    () => dataset.areas.find((item) => item.area === selectedArea) ?? dataset.areas[0],
    [dataset, selectedArea],
  );
  const totalRate = dataset.totals.consumed / dataset.totals.allocated * 100;
  const totalOverruns = dataset.areas.flatMap((item) => item.rows).filter((row) => row.remaining < 0).length;

  return (
    <section aria-labelledby="fleet-vds-title" className={s.vdsPanel}>
      <div className={s.vdsHeader}>
        <div>
          <span className={s.eyebrow}>수역별 조업권 사용 현황</span>
          <h3 id="fleet-vds-title"><Ship size={19} aria-hidden="true" /> 2026년 선박별 VDS 소진현황</h3>
          <p>
            배정일·소진일·잔여일·주간소모 · <TermTooltip term="VDS" description="태평양 도서국이 자국 배타적경제수역에서 선박 1척의 하루 조업을 허가하는 권리입니다." />
          </p>
        </div>
        <TelemetryBadge status="STATIC" syncDate="2026-08-09" label="첨부 원문" />
      </div>

      <div className={s.vdsFleetTabs} role="tablist" aria-label="선단 구분">
        <button type="button" role="tab" aria-selected={fleetType === 'national'} className={fleetType === 'national' ? s.vdsFleetTabActive : ''} onClick={() => setFleetType('national')}>
          국적선 6척
        </button>
        <button type="button" role="tab" aria-selected={fleetType === 'kiribati'} className={fleetType === 'kiribati' ? s.vdsFleetTabActive : ''} onClick={() => setFleetType('kiribati')}>
          키리바시 선박 4척
        </button>
      </div>

      <div className={s.vdsSummaryGrid}>
        {[
          ['총 배정일', dataset.totals.allocated, '#38bdf8'],
          ['총 소진일', dataset.totals.consumed, '#a78bfa'],
          ['총 잔여일', dataset.totals.remaining, '#34d399'],
          ['주간 소모', dataset.totals.weekly, '#fbbf24'],
        ].map(([label, value, color]) => (
          <article key={String(label)} style={{ borderTopColor: String(color) }}>
            <span>{label}</span><strong>{Number(value).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}일</strong>
          </article>
        ))}
      </div>

      <div className={s.vdsStatusLine}>
        <span>전체 소진률 <strong>{totalRate.toFixed(1)}%</strong></span>
        {totalOverruns > 0 && <span className={s.vdsDanger}><AlertTriangle size={14} aria-hidden="true" /> 음수 잔여 {totalOverruns}건</span>}
        <span>{dataset.source}</span>
      </div>

      <div className={s.vdsAreaTabs} role="tablist" aria-label="VDS 수역">
        {dataset.areas.map((item) => {
          const summary = areaSummary(item);
          const active = item.area === currentArea.area;
          return (
            <button
              key={item.area}
              type="button"
              role="tab"
              aria-selected={active}
              className={active ? s.vdsAreaTabActive : ''}
              onClick={() => setSelectedAreaByFleet((current) => ({ ...current, [fleetType]: item.area }))}
            >
              <span>{item.area}</span>
              <small>{summary.rate.toFixed(0)}%{summary.overrunCount ? ` · 초과 ${summary.overrunCount}` : ''}</small>
            </button>
          );
        })}
      </div>

      <div className={s.vdsTableWrap}>
        <table className={s.vdsTable}>
          <thead><tr><th>선박</th><th>배정일</th><th>소진일</th><th>잔여일</th><th>주간소모</th><th>소진률</th></tr></thead>
          <tbody>
            {currentArea.rows.map((row) => {
              const rate = row.allocated > 0 ? row.consumed / row.allocated * 100 : 0;
              const isOver = row.remaining < 0;
              return (
                <tr key={row.vessel}>
                  <td>{row.vessel}</td><td>{formatDay(row.allocated)}</td><td>{formatDay(row.consumed)}</td>
                  <td className={isOver ? s.vdsNegative : ''}>{formatDay(row.remaining)}</td><td>{formatDay(row.weekly)}</td>
                  <td><div className={s.vdsGauge}><i style={{ width: `${Math.min(rate, 100)}%` }} /><span>{row.allocated === 0 ? '-' : `${rate.toFixed(0)}%`}</span></div></td>
                </tr>
              );
            })}
            <tr className={s.vdsTotalRow}>
              <td>소계</td><td>{formatDay(currentArea.totals.allocated)}</td><td>{formatDay(currentArea.totals.consumed)}</td>
              <td>{formatDay(currentArea.totals.remaining)}</td><td>{formatDay(currentArea.totals.weekly)}</td><td>{areaSummary(currentArea).rate.toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      {(['allocated', 'consumed', 'remaining', 'weekly'] as const).some((key) => Math.abs(currentArea.rowSums[key] - currentArea.totals[key]) >= 0.005) && (
        <p className={s.vdsNote}>※ 인쇄 소계와 선박 행 합계가 다릅니다. 인쇄 소계를 표시했으며 행 합계는 배정 {formatDay(currentArea.rowSums.allocated)} · 소진 {formatDay(currentArea.rowSums.consumed)} · 잔여 {formatDay(currentArea.rowSums.remaining)} · 주간 {formatDay(currentArea.rowSums.weekly)}일입니다.</p>
      )}
      {currentArea.note && <p className={s.vdsNote}>※ {currentArea.area}: {currentArea.note}</p>}
    </section>
  );
}
