'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styles from './UnloadingTimelineReplay.module.css';
import { X, Play, Pause, ChevronLeft, ChevronRight, Anchor, Thermometer, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ReferenceLine, ResponsiveContainer, Legend } from 'recharts';

interface TimelineEntry {
  date: string;
  time: string;
  targetHol: string;
  dailyAmount: number;
  cumAmount: number;
  speciesAmounts?: { SJ: number; YF: number } | null;
  quality: string;
}

interface SpeciesEntry {
  id: string;
  name: string;
  reported: number;
  actual: number;
}

interface HoldData {
  dischargedVolume: number;
  lastTemperature: number | null;
  tempHistory: { date: string; temp: number }[];
  timeline: { date: string; amount: number }[];
  nominalCapacity: number;
  shippers: string[];
}

interface TimelineReplayProps {
  vesselData: {
    name: string;
    reportedTotal: number;
    actualTotal: number;
    unclassifiedActual?: number;
    timeline: TimelineEntry[];
    species: SpeciesEntry[];
  };
  vesselId: string;
  holdsData: Record<string, HoldData>;
  onClose: () => void;
}

// Temperature → color mapping (matches UnloadingStatus)
function getTempColor(temp: number | null): string {
  if (temp === null) return '#14b8a6';
  if (temp < -24.0) return '#0284c7';
  if (temp <= -18.0) return '#14b8a6';
  if (temp <= -17.0) return '#f59e0b';
  return '#ef4444';
}

// Parse target holds from a timeline entry
function parseTargetHolds(entry: TimelineEntry): string[] {
  const text = Array.isArray(entry.targetHol) ? (entry.targetHol as string[]).join(', ') : (entry.targetHol || '');
  const normalized = text.replace(/[\u2212\u2013\u2014]/g, '-');
  const holdRegex = /#([1-4])-([A-D])/g;
  const holds: string[] = [];
  let m;
  while ((m = holdRegex.exec(normalized)) !== null) {
    const id = `#${m[1]}-${m[2]}`;
    if (!holds.includes(id)) holds.push(id);
  }
  return holds;
}

// Parse temperatures from quality text
function parseTemperatures(quality: string): { min: number | null; max: number | null } {
  const raw = Array.isArray(quality) ? (quality as string[]).join(' ') : (quality || '');
  const regex = /([+-]?\d+(?:\.\d+)?)\s*(?:℃|°C|°|C)/gi;
  const temps: number[] = [];
  let m;
  while ((m = regex.exec(raw)) !== null) {
    const v = parseFloat(m[1]);
    if (!isNaN(v)) temps.push(v);
  }
  if (temps.length === 0) return { min: null, max: null };
  return { min: Math.min(...temps), max: Math.max(...temps) };
}

// Determine the hatch/level structure for a vessel
function getHoldStructure(vesselId: string): { hatch: number; levels: string[] }[] {
  const hatches = [4, 3, 2, 1];
  return hatches.map(h => {
    let levels = ['A', 'B', 'C'];
    if (vesselId === 'sein-phoenix' && h !== 1) {
      levels = ['A', 'B', 'C', 'D'];
    } else if (vesselId === 'shin-fuji' && h === 1) {
      levels = ['A', 'B'];
    }
    return { hatch: h, levels };
  });
}

// Compute cumulative discharge for each hold up to (and including) a given timeline index
function computeHoldCumulativeAtIndex(
  timeline: TimelineEntry[],
  holdsData: Record<string, HoldData>,
  upToIndex: number
): Record<string, { cumDischarge: number; lastTemp: number | null }> {
  const holdIds = Object.keys(holdsData);
  const result: Record<string, { cumDischarge: number; lastTemp: number | null }> = {};
  holdIds.forEach(id => {
    result[id] = { cumDischarge: 0, lastTemp: null };
  });

  // Walk through hold timelines and accumulate amounts up to dates that are
  // at or before the selected timeline index's date
  const selectedDates = new Set<string>();
  for (let i = 0; i <= Math.min(upToIndex, timeline.length - 1); i++) {
    selectedDates.add(timeline[i].date);
  }

  holdIds.forEach(holdId => {
    const holdTimeline = holdsData[holdId]?.timeline || [];
    const tempHistory = holdsData[holdId]?.tempHistory || [];

    let cumDischarge = 0;
    holdTimeline.forEach(ht => {
      if (selectedDates.has(ht.date)) {
        cumDischarge += ht.amount;
      }
    });

    let lastTemp: number | null = null;
    tempHistory.forEach(th => {
      if (selectedDates.has(th.date)) {
        lastTemp = th.temp;
      }
    });

    result[holdId] = { cumDischarge, lastTemp };
  });

  return result;
}

// Build stacked area chart data: cumulative SJ and YF over time
export function buildStackedAreaData(
  timeline: TimelineEntry[],
  species: SpeciesEntry[],
  totalActual: number
): { date: string; SJ: number; YF: number }[] {
  const workEntries = timeline.filter(entry => entry.dailyAmount > 0);
  const hasAnyExactAmounts = workEntries.some(entry => entry.speciesAmounts != null);
  const hasCompleteExactAmounts = workEntries.length > 0 && workEntries.every(entry => {
    const amounts = entry.speciesAmounts;
    return amounts != null
      && Number.isFinite(amounts.SJ)
      && Number.isFinite(amounts.YF)
      && Math.abs(amounts.SJ + amounts.YF - entry.dailyAmount) < 0.000001;
  });

  if (hasCompleteExactAmounts) {
    let cumulativeSj = 0;
    let cumulativeYf = 0;
    const roundMt = (amount: number) => Math.round((amount + Number.EPSILON) * 1000) / 1000;

    return timeline.map(entry => {
      if (entry.speciesAmounts) {
        cumulativeSj += entry.speciesAmounts.SJ;
        cumulativeYf += entry.speciesAmounts.YF;
      }
      return {
        date: entry.date,
        SJ: roundMt(cumulativeSj),
        YF: roundMt(cumulativeYf),
      };
    });
  }

  // 일부 날짜만 실측 어종값이 있으면 계획 비율로 빈 구간을 메우지 않습니다.
  if (hasAnyExactAmounts) return [];

  // 과거 선박은 일별 어종 원표가 없어 기존 누적 비율 표시를 유지합니다.
  const sjSpec = species.find(s => s.id === 'SJ');
  const yfSpec = species.find(s => s.id === 'YF');
  const sjRatio = sjSpec ? sjSpec.actual / (totalActual || 1) : 0.85;
  const yfRatio = yfSpec ? yfSpec.actual / (totalActual || 1) : 0.15;

  return timeline.map(entry => ({
    date: entry.date,
    SJ: Math.round(entry.cumAmount * sjRatio * 10) / 10,
    YF: Math.round(entry.cumAmount * yfRatio * 10) / 10,
  }));
}

export default function UnloadingTimelineReplay({
  vesselData,
  vesselId,
  holdsData,
  onClose,
}: TimelineReplayProps) {
  const { timeline, species, name, reportedTotal, actualTotal, unclassifiedActual = 0 } = vesselData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentIndex(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setCurrentIndex(i => Math.min(timeline.length - 1, i + 1));
      if (e.key === ' ') { e.preventDefault(); setIsPlaying(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, timeline.length]);

  // Autoplay logic
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= timeline.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, timeline.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(i => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex(i => Math.min(timeline.length - 1, i + 1));
  }, [timeline.length]);

  const togglePlay = useCallback(() => {
    setIsPlaying(p => !p);
  }, []);

  // Current entry
  const entry = timeline[currentIndex] || timeline[0];
  const isRestDay = entry.dailyAmount === 0 || entry.targetHol === '-';
  const targetHolds = parseTargetHolds(entry);
  const tempRange = parseTemperatures(entry.quality);
  const progressPercent = reportedTotal > 0 ? Math.min((entry.cumAmount / reportedTotal) * 100, 100) : 0;

  // Hold structure for the vessel
  const holdStructure = useMemo(() => getHoldStructure(vesselId), [vesselId]);

  // Cumulative hold data at current index
  const holdCumData = useMemo(
    () => computeHoldCumulativeAtIndex(timeline, holdsData, currentIndex),
    [timeline, holdsData, currentIndex]
  );

  // Stacked area chart data
  const hasUnclassifiedSpecies = unclassifiedActual > 0;
  const areaData = useMemo(
    () => hasUnclassifiedSpecies ? [] : buildStackedAreaData(timeline, species, actualTotal),
    [timeline, species, actualTotal, hasUnclassifiedSpecies]
  );

  const formatNum = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <span>🎬</span> 하역 리플레이
            <span className={styles.vesselTag}>{name}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Date Slider + Playback */}
        <div className={styles.sliderSection}>
          <div className={styles.sliderRow}>
            <button className={styles.playbackBtn} onClick={handlePrev} aria-label="Previous day">
              <ChevronLeft size={18} />
            </button>
            <button
              className={`${styles.playbackBtn} ${isPlaying ? styles.active : ''}`}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button className={styles.playbackBtn} onClick={handleNext} aria-label="Next day">
              <ChevronRight size={18} />
            </button>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={timeline.length - 1}
              value={currentIndex}
              onChange={e => setCurrentIndex(parseInt(e.target.value))}
            />
          </div>
          <div className={styles.dateLabels}>
            {timeline.map((t, i) => (
              <span
                key={i}
                className={`${styles.dateLabel} ${i === currentIndex ? styles.activeDateLabel : ''}`}
              >
                {t.date}
              </span>
            ))}
          </div>
        </div>

        {/* Middle: Hold Grid + Day Summary */}
        <div className={styles.middleContent}>
          {/* Hold Grid */}
          <div className={styles.holdGrid}>
            <div className={styles.holdGridTitle}>
              <Anchor size={16} /> 어창별 하역 현황 (Day {currentIndex + 1})
            </div>
            <div className={styles.hatchColumns}>
              {holdStructure.map(({ hatch, levels }) => (
                <div key={hatch} className={styles.hatchColumn}>
                  <div className={styles.hatchLabel}>Hatch #{hatch}</div>
                  {levels.map(level => {
                    const holdId = `#${hatch}-${level}`;
                    const holdInfo = holdsData[holdId];
                    if (!holdInfo) return null;

                    const cumData = holdCumData[holdId] || { cumDischarge: 0, lastTemp: null };
                    const capacity = holdInfo.nominalCapacity || 1;
                    const fillPercent = Math.min((cumData.cumDischarge / capacity) * 100, 100);
                    const isTarget = targetHolds.includes(holdId);
                    const tempColor = getTempColor(cumData.lastTemp);

                    return (
                      <div
                        key={holdId}
                        className={`${styles.holdCell} ${isTarget ? styles.targetHold : ''}`}
                      >
                        <div className={styles.holdCellId}>{holdId}</div>
                        <div className={styles.holdFillBarTrack}>
                          <div
                            className={styles.holdFillBar}
                            style={{
                              width: `${fillPercent}%`,
                              backgroundColor: cumData.cumDischarge > 0 ? tempColor : 'rgba(255,255,255,0.08)',
                            }}
                          />
                        </div>
                        <div className={styles.holdCellMT}>
                          {cumData.cumDischarge > 0 ? `${formatNum(cumData.cumDischarge)} MT` : '—'}
                        </div>
                        {cumData.lastTemp !== null && (
                          <div className={styles.holdCellTemp} style={{ color: tempColor }}>
                            {cumData.lastTemp}℃
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Day Summary Panel */}
          <div className={styles.daySummary}>
            <div className={styles.summaryDate}>{entry.date}</div>

            {isRestDay ? (
              <div className={styles.restDayBadge}>🔕 휴무일</div>
            ) : (
              <>
                <div>
                  <div className={styles.summaryLabel}>작업 시간</div>
                  <div className={styles.summaryValue}>{entry.time}</div>
                </div>

                <div>
                  <div className={styles.summaryLabel}>일일 하역량</div>
                  <div className={styles.dailyAmountHero}>
                    {formatNum(entry.dailyAmount)}
                    <span className={styles.dailyAmountUnit}>MT</span>
                  </div>
                </div>

                <div>
                  <div className={styles.summaryLabel}>
                    누적 하역량 ({progressPercent.toFixed(1)}%)
                  </div>
                  <div className={styles.summaryValue}>
                    {formatNum(entry.cumAmount)} / {formatNum(reportedTotal)} MT
                  </div>
                  <div className={styles.cumProgressTrack}>
                    <div className={styles.cumProgressFill} style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                {targetHolds.length > 0 && (
                  <div>
                    <div className={styles.summaryLabel}>작업 어창</div>
                    <div className={styles.targetHoldTags}>
                      {targetHolds.map(h => (
                        <span key={h} className={styles.holdTag}>{h}</span>
                      ))}
                    </div>
                  </div>
                )}

                {(tempRange.min !== null || tempRange.max !== null) && (
                  <div>
                    <div className={styles.summaryLabel}>
                      <Thermometer size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      온도 관측
                    </div>
                    <div className={styles.summaryValue} style={{ color: getTempColor(tempRange.min) }}>
                      {tempRange.min !== null ? `${tempRange.min}℃` : '—'}
                      {' ~ '}
                      {tempRange.max !== null ? `${tempRange.max}℃` : '—'}
                    </div>
                  </div>
                )}
              </>
            )}

            {entry.quality && (
              <div>
                <div className={styles.summaryLabel}>품질 메모</div>
                <div className={styles.qualityNote}>
                  {Array.isArray(entry.quality) ? (entry.quality as string[]).join(' ') : entry.quality}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Stacked Area Chart */}
        <div className={styles.chartSection}>
          <div className={styles.chartTitle}>
            <BarChart3 size={16} /> 어종별 누적 하역량 추이
          </div>
          {hasUnclassifiedSpecies || areaData.length === 0 ? (
            <div
              data-testid="replay-species-unclassified"
              style={{ minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, color: 'var(--w-slate-300)' }}
            >
              <strong style={{ color: 'var(--w-amber-400)', marginBottom: 8 }}>어종별 실적 추이 미제공</strong>
              <span>
                {hasUnclassifiedSpecies
                  ? `최신 일보 ${unclassifiedActual.toFixed(3)}톤은 어종별 근거가 없어 계획 비율로 추정하지 않습니다.`
                  : '일별 어종 실적이 완전하지 않아 계획 비율로 추정하지 않습니다.'}
              </span>
            </div>
          ) : (
            <div data-testid="replay-species-chart" style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={areaData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <defs>
                <linearGradient id="gradSJ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--w-sky-400)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--w-sky-400)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradYF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--w-amber-400)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--w-amber-400)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--w-slate-400)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--w-slate-400)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(1)}k`}
              />
              <RechartsTooltip
                contentStyle={{
                  background: 'rgba(20, 28, 52, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  fontSize: '0.8rem',
                  color: 'var(--w-slate-50)',
                }}
                formatter={(value: any, name: any) => [`${formatNum(Number(value))} MT`, name === 'SJ' ? 'Skipjack' : 'Yellowfin']}
              />
              <Legend
                wrapperStyle={{ fontSize: '0.75rem', color: 'var(--w-slate-400)' }}
                formatter={(value: string) => (value === 'SJ' ? 'Skipjack' : 'Yellowfin')}
              />
              <Area
                type="monotone"
                dataKey="SJ"
                stackId="1"
                stroke="var(--w-sky-400)"
                fill="url(#gradSJ)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="YF"
                stackId="1"
                stroke="var(--w-amber-400)"
                fill="url(#gradYF)"
                strokeWidth={2}
              />
              {/* Vertical reference line at current date */}
              <ReferenceLine
                x={entry.date}
                stroke="var(--w-sky-400)"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: '▼',
                  position: 'top',
                  fill: 'var(--w-sky-400)',
                  fontSize: 14,
                }}
              />
            </AreaChart>
            </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
