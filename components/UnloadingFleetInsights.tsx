'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Anchor, Clock, Fish, Gauge, MapPinned, Ruler, Scale, Ship } from 'lucide-react';
import {
  unloadingFleetInsights,
  type FleetInsights,
} from '../lib/data/unloading-fleet-insights';
import TakeawayBox from './TakeawayBox';
import TelemetryBadge from './TelemetryBadge';
import TermTooltip from './TermTooltip';
import historyStyles from './UnloadingHistory.module.css';
import styles from './UnloadingFleetInsights.module.css';
import { catchBreaks, GROUND_RAMP } from '../lib/unloading-history/fishing-grounds';

const FishingGroundsMap = dynamic(() => import('./UnloadingFishingGroundsMap'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>지도를 불러오는 중…</div>,
});

const SPECIES_KO = { SJ: '가다랑어', YF: '황다랑어', BET: '눈다랑어' } as const;
const LARGE_THRESHOLD = { SJ: '7.5 lbs 이상', YF: '20 lbs 이상', BET: '20 lbs 이상' } as const;
const SPECIES_ORDER = ['SJ', 'YF', 'BET'] as const;

const formatMt = (value: number) => value.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
const formatSignedPct = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

export const isPartialYear = (data: FleetInsights, year: number) =>
  year >= Number(data.syncDate.slice(0, 4));

export function summarizeFleetInsights(data: FleetInsights) {
  const complete = <T extends { year: number }>(rows: T[]) => {
    const sorted = [...rows].sort((a, b) => a.year - b.year);
    const done = sorted.filter((row) => !isPartialYear(data, row.year));
    return done.length ? done : sorted;
  };
  const vessels = [...data.vessels].sort((a, b) => b.variancePct - a.variancePct);
  const latestSchool = complete(data.schools);
  const leadDays = complete(data.leadDays);
  const effYear = complete(data.efficiency).at(-1)?.year;
  const schoolYear = complete(data.schoolEfficiency).at(-1)?.year;
  const schoolRow = (school: 'unassociated' | 'drifting_fad') =>
    data.schoolEfficiency.find((e) => e.year === schoolYear && e.school === school);
  return {
    effYear,
    effVessels: data.efficiency.filter((e) => e.year === effYear).sort((a, b) => b.catchPerSet - a.catchPerSet),
    schoolYear,
    freeSet: schoolRow('unassociated'),
    fadSet: schoolRow('drifting_fad'),
    groundYear: complete(data.grounds).at(-1)?.year,
    widest: vessels[0],
    narrowest: vessels[vessels.length - 1],
    topPort: [...data.transferPorts].sort((a, b) => b.sharePct - a.sharePct)[0],
    firstSchool: latestSchool[0],
    lastSchool: latestSchool[latestSchool.length - 1],
    firstLead: leadDays[0],
    lastLead: leadDays[leadDays.length - 1],
  };
}

export function UnloadingFleetInsightsView({ data }: { data: FleetInsights }) {
  const summary = summarizeFleetInsights(data);
  const vessels = [...data.vessels].sort((a, b) => b.variancePct - a.variancePct);
  const maxVariance = Math.max(...vessels.map((v) => Math.abs(v.variancePct)), 1);
  const maxShare = Math.max(...data.transferPorts.map((p) => p.sharePct), 1);
  const maxLead = Math.max(...data.leadDays.map((l) => l.medianDays), 1);
  const { widest, narrowest, topPort, firstSchool, lastSchool, firstLead, lastLead } = summary;
  const partial = (year: number) => (isPartialYear(data, year) ? ' · 진행 중' : '');
  const { effYear, effVessels, schoolYear, freeSet, fadSet } = summary;
  const [groundYear, setGroundYear] = useState(summary.groundYear);
  const ground = data.grounds.find((g) => g.year === groundYear) ?? data.grounds.at(-1);
  const groundSets = ground ? ground.cells.reduce((sum, c) => sum + c[2], 0) : 0;
  const breaks = ground ? catchBreaks(ground.cells) : [];
  const schoolYears = [...new Set(data.schoolEfficiency.map((e) => e.year))].sort((a, b) => a - b);

  return (
    <section
      className={historyStyles.section}
      data-testid="unloading-fleet-insights"
      aria-labelledby="unloading-fleet-insights-title"
    >
      <header className={historyStyles.header}>
        <div>
          <span className={historyStyles.eyebrow}>S3 물류·통관 · 본선·조업 분석</span>
          <h2 id="unloading-fleet-insights-title">본선·조업 분석</h2>
          <p className={historyStyles.cardDesc}>
            본선별 하역결과 {data.coverage.resultsTransfers}건(항차 {data.coverage.resultsVoyages}개), 사이즈 판정서, 선망 어획 일지
            {` ${data.coverage.logsheets}부`}를 집계했습니다. 항차 합계가 최종 하역결과와 맞는 자료만 씁니다.
          </p>
        </div>
        <div className={historyStyles.telemetry}>
          <TelemetryBadge status="SYNCED" syncDate={data.syncDate} label="SYNCED 정제 완료" />
        </div>
      </header>

      <div className={styles.kpiGrid4}>
        <article className={historyStyles.kpiCard}>
          <Scale size={17} /><span>검량 차이가 가장 큰 본선</span>
          <strong data-testid="fleet-kpi-widest">{widest.vessel} {formatSignedPct(widest.variancePct)}</strong>
          <small>전재 {widest.transfers}회 · 가장 작은 본선 {narrowest.vessel} {formatSignedPct(narrowest.variancePct)}</small>
        </article>
        <article className={historyStyles.kpiCard}>
          <Anchor size={17} /><span>최대 환적항</span>
          <strong data-testid="fleet-kpi-port">{topPort.nameKo} {topPort.sharePct}%</strong>
          <small>실측 하역량 기준 비중</small>
        </article>
        <article className={historyStyles.kpiCard}>
          <Clock size={17} /><span>환적→하역 중앙값</span>
          <strong data-testid="fleet-kpi-lead">{lastLead.medianDays}일 ({lastLead.year})</strong>
          <small>{firstLead.year}년 {firstLead.medianDays}일 대비 · 환적 종료일부터 하역 시작일까지</small>
        </article>
        <article className={historyStyles.kpiCard}>
          <Fish size={17} />
          <span>
            자유군 어획 비중{' '}
            <TermTooltip
              term="자유군·FAD"
              description="자유군은 떠다니는 물체에 모이지 않은 참치 무리, FAD는 인공 집어장치에 모인 무리입니다. 어획 일지의 어군 코드(1=자유군, 4=표류 FAD)로 나눴습니다."
            />
          </span>
          <strong data-testid="fleet-kpi-school">{lastSchool.unassociatedPct}% ({lastSchool.year})</strong>
          <small>{firstSchool.year}년 {firstSchool.unassociatedPct}% · 표류 FAD {lastSchool.driftingFadPct}%</small>
        </article>
      </div>

      <div className={styles.grid}>
        <div className={styles.block} data-testid="fleet-vessel-variance">
          <h3><Ship size={16} />본선별 보고 대비 실측</h3>
          <p className={styles.note}>전재 5회 이상 본선 {vessels.length}척 · 실측이 보고보다 많으면 +</p>
          <ul className={styles.rows}>
            {vessels.map((v) => (
              <li className={styles.row} key={v.vessel}>
                <span className={styles.label}>{v.vessel}<small>{v.transfers}회</small></span>
                <span className={styles.track} aria-hidden="true">
                  <span
                    className={`${styles.fill} ${v.variancePct >= 2.5 ? styles.fillWarn : ''} ${v.variancePct < 0 ? styles.fillMuted : ''}`}
                    style={{ width: `${(Math.abs(v.variancePct) / maxVariance) * 100}%` }}
                  />
                </span>
                <span className={styles.value}>{formatSignedPct(v.variancePct)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.block} data-testid="fleet-transfer-ports">
          <h3><Anchor size={16} />환적항 비중</h3>
          <p className={styles.note}>본선이 운반선에 어획물을 옮겨 실은 항구 · 실측 하역량 기준</p>
          <ul className={styles.rows}>
            {data.transferPorts.map((p) => (
              <li className={styles.row} key={p.port}>
                <span className={styles.label}>{p.nameKo}</span>
                <span className={styles.track} aria-hidden="true">
                  <span className={styles.fill} style={{ width: `${(p.sharePct / maxShare) * 100}%` }} />
                </span>
                <span className={styles.value}>{p.sharePct}%</span>
              </li>
            ))}
          </ul>
          <p className={styles.note} style={{ margin: '14px 0 8px' }}>환적 종료 → 하역 시작 일수 (중앙값)</p>
          <ul className={styles.rows}>
            {data.leadDays.map((l) => (
              <li className={styles.row} key={l.year}>
                <span className={styles.label}>{l.year}년<small>{l.transfers}건{partial(l.year)}</small></span>
                <span className={styles.track} aria-hidden="true">
                  <span className={styles.fill} style={{ width: `${(l.medianDays / maxLead) * 100}%` }} />
                </span>
                <span className={styles.value}>{l.medianDays}일</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.block} data-testid="fleet-school-types">
          <h3><Fish size={16} />어군 유형별 어획 비중</h3>
          <p className={styles.note}>선망 어획 일지의 투망별 어획량 · 투망 100회 이상 연도만</p>
          <ul className={styles.rows}>
            {data.schools.map((s) => (
              <li className={styles.row} key={s.year}>
                <span className={styles.label}>{s.year}년<small>{s.sets.toLocaleString('ko-KR')}회{partial(s.year)}</small></span>
                <span
                  className={styles.stack}
                  role="img"
                  aria-label={`${s.year}년 자유군 ${s.unassociatedPct}%, 표류 FAD ${s.driftingFadPct}%, 기타 ${s.otherPct}%`}
                >
                  <span className={styles.segFree} style={{ width: `${s.unassociatedPct}%` }} />
                  <span className={styles.segFad} style={{ width: `${s.driftingFadPct}%` }} />
                  <span className={styles.segOther} style={{ width: `${s.otherPct}%` }} />
                </span>
                <span className={styles.value}>{formatMt(s.catchMt)} MT</span>
              </li>
            ))}
          </ul>
          <div className={styles.legend}>
            <span><i className={styles.segFree} />자유군</span>
            <span><i className={styles.segFad} />표류 FAD</span>
            <span><i className={styles.segOther} />유목·고정 FAD·기타</span>
          </div>
        </div>

        <div className={styles.block} data-testid="fleet-sizing">
          <h3><Ruler size={16} />대형 사이즈 비중</h3>
          <p className={styles.note}>사이즈 판정서 합계가 최종 하역결과와 맞는 항차만 · 항차 5개 미만 연도 제외</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">연도</th>
                {SPECIES_ORDER.map((sp) => (
                  <th scope="col" key={sp}>{SPECIES_KO[sp]}<br />{LARGE_THRESHOLD[sp]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.sizing.map((row) => (
                <tr key={row.year}>
                  <td>{row.year}년<small>{row.voyages}항차{partial(row.year)}</small></td>
                  {SPECIES_ORDER.map((sp) => {
                    const cell = row.species.find((c) => c.species === sp);
                    return (
                      <td key={sp}>
                        {cell ? `${cell.largePct}%` : '—'}
                        {cell ? <small>{formatMt(cell.totalMt)} MT</small> : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ground ? (
          <div className={`${styles.block} ${styles.wide}`} data-testid="fleet-fishing-grounds">
            <h3><MapPinned size={16} />조업 위치 (1° 격자)</h3>
            <p className={styles.note}>
              어획 일지의 성공 투망 위치를 1°×1° 칸으로 묶은 어획량입니다. 본선명·일자는 넣지 않았습니다.
              {` ${groundYear}년 투망 ${groundSets.toLocaleString('ko-KR')}회 · ${ground.cells.length}칸${partial(ground.year)}`}
            </p>
            <div className={historyStyles.yearTabs} role="group" aria-label="조업 위치 연도">
              {data.grounds.map((g) => (
                <button
                  key={g.year}
                  type="button"
                  className={`${historyStyles.yearTab} ${g.year === ground.year ? historyStyles.yearTabActive : ''}`}
                  aria-pressed={g.year === ground.year}
                  data-testid={`ground-year-${g.year}`}
                  onClick={() => setGroundYear(g.year)}
                >
                  {g.year}{isPartialYear(data, g.year) ? '*' : ''}
                </button>
              ))}
            </div>
            <div className={styles.map}>
              <FishingGroundsMap key={ground.year} cells={ground.cells} />
            </div>
            <div className={styles.legend}>
              {GROUND_RAMP.map((color, i) => (
                <span key={color}>
                  <i style={{ background: color }} />
                  {i === 0 ? `≤ ${formatMt(breaks[0])}` : i < breaks.length ? `≤ ${formatMt(breaks[i])}` : `> ${formatMt(breaks[breaks.length - 1])}`} MT
                </span>
              ))}
              <span>* 진행 중인 연도</span>
            </div>
          </div>
        ) : null}

        {effYear ? (
          <div className={styles.block} data-testid="fleet-vessel-efficiency">
            <h3><Gauge size={16} />본선별 조업 효율 ({effYear})</h3>
            <p className={styles.note}>투망 40회 이상 본선 · 회당 어획량은 실패 투망 포함 평균, 실패율은 어획 0인 투망 비중</p>
            <table className={styles.table}>
              <thead>
                <tr><th scope="col">본선</th><th scope="col">투망</th><th scope="col">회당 MT</th><th scope="col">실패율</th></tr>
              </thead>
              <tbody>
                {effVessels.map((e) => (
                  <tr key={e.vessel}>
                    <td>{e.vessel}</td>
                    <td>{e.sets}회</td>
                    <td>{e.catchPerSet}</td>
                    <td>{e.zeroSetPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {schoolYears.length ? (
          <div className={styles.block} data-testid="fleet-school-efficiency">
            <h3><Fish size={16} />어군 유형별 투망 효율</h3>
            <p className={styles.note}>투망 50회 이상인 연도·유형만 · 회당 어획량(실패 포함)과 실패율</p>
            <table className={styles.table}>
              <thead>
                <tr><th scope="col">연도</th><th scope="col">자유군 회당</th><th scope="col">표류 FAD 회당</th></tr>
              </thead>
              <tbody>
                {schoolYears.map((year) => {
                  const cell = (school: 'unassociated' | 'drifting_fad') => {
                    const e = data.schoolEfficiency.find((x) => x.year === year && x.school === school);
                    return e ? <>{e.catchPerSet} MT<small>{e.sets.toLocaleString('ko-KR')}회 · 실패 {e.zeroSetPct}%</small></> : '—';
                  };
                  return (
                    <tr key={year}>
                      <td>{year}년{partial(year) ? <small>진행 중</small> : null}</td>
                      <td>{cell('unassociated')}</td>
                      <td>{cell('drifting_fad')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <TakeawayBox
        situation={`본선별 실측은 보고 대비 ${narrowest.vessel} ${formatSignedPct(narrowest.variancePct)}에서 ${widest.vessel} ${formatSignedPct(widest.variancePct)}까지 벌어집니다. 환적항은 ${topPort.nameKo}가 ${topPort.sharePct}%로 가장 많고, 환적부터 하역까지 중앙값은 ${firstLead.year}년 ${firstLead.medianDays}일에서 ${lastLead.year}년 ${lastLead.medianDays}일로 바뀌었습니다. 자유군 어획 비중은 ${firstSchool.year}년 ${firstSchool.unassociatedPct}%에서 ${lastSchool.year}년 ${lastSchool.unassociatedPct}%입니다.${freeSet && fadSet ? ` ${schoolYear}년 투망 1회당 어획량은 표류 FAD ${fadSet.catchPerSet} MT, 자유군 ${freeSet.catchPerSet} MT이고 실패율은 각각 ${fadSet.zeroSetPct}%, ${freeSet.zeroSetPct}%입니다.` : ''}`}
        takeaway="검량 차이가 큰 본선은 보고량을 판매·배선 계획에 그대로 쓰지 말고 과거 차이율로 보정해 검토합니다. 환적→하역 일수 증가는 운반선 회전과 재고 보유 기간 점검 신호로 봅니다. 자유군 비중이 커진 만큼 투망당 어획이 줄고 실패 투망이 늘어나는지 본선별 효율과 함께 점검합니다. 사이즈·어군·조업 위치는 확인된 일지·항차 표본 기준이며 전체 어획을 대표하지 않습니다."
        source={`구글 드라이브 하역업무 원자료 · 본선별 Results of unloading xlsx(결정론적 파싱) · SIZING 판정서(SAP 파싱 + Claude 추출, 합계 검증) · SPC/FFA 선망 LOGSHEET(Claude 추출, 쪽별 합계 검증) · 집계 ${data.syncDate}`}
      />
    </section>
  );
}

export default function UnloadingFleetInsights() {
  return <UnloadingFleetInsightsView data={unloadingFleetInsights} />;
}
