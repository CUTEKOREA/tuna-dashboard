'use client';
import React, { useState, useMemo, useCallback } from 'react';
import styles from './UnloadingReportGenerator.module.css';
import { FileText, Copy, Download, X, Check } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TimelineEntry {
  date: string;
  time: string;
  targetHol: string;
  dailyAmount: number;
  cumAmount: number;
  quality: string;
}

interface SpeciesEntry {
  id: string;
  name: string;
  reported: number;
  actual: number;
  surplus: number;
}

interface VesselData {
  name: string;
  reportedTotal: number;
  actualTotal: number;
  surplus: number;
  status: string;
  species: SpeciesEntry[];
  timeline: TimelineEntry[];
}

interface ReportGeneratorProps {
  vesselData: VesselData;
  vesselId: string;
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map shipper codes to species  */
const SKIPJACK_SHIPPERS = new Set([
  'UC', 'TUM', 'CMC',
  'S/SPR', 'S/HAR', 'S/EXP', 'S/PIO', 'S/JUP', 'S/CHA',
  'MOAKONA', 'MOAMARI', 'N/STAR', 'N/SUN',
  'PAPA RESTY', 'KONA', 'MK',
]);
const YELLOWFIN_SHIPPERS = new Set(['ISA', 'MMP', 'AAI']);

function classifySpecies(shipperCode: string): 'Skipjack' | 'Yellowfin' | 'Unknown' {
  const upper = shipperCode.toUpperCase().trim();
  if (YELLOWFIN_SHIPPERS.has(upper)) return 'Yellowfin';
  // Default most purse‑seiner codes to Skipjack
  if (SKIPJACK_SHIPPERS.has(upper) || upper.startsWith('S/') || upper.startsWith('N/')) return 'Skipjack';
  return 'Unknown';
}

/** Parse shipper(hold) entries from targetHol string */
function parseShipperHolds(targetHol: string): { shipper: string; holds: string }[] {
  if (!targetHol || targetHol === '-') return [];
  // Match patterns like "S/SPR(#4-A, #4-B)" or "N/STAR(#2-C:128.460)"
  const regex = /([A-Za-z/_ -]+?)\(([^)]+)\)/g;
  const results: { shipper: string; holds: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(targetHol)) !== null) {
    results.push({
      shipper: match[1].trim(),
      holds: match[2].replace(/:\d+(?:\.\d+)?/g, '').trim(), // strip weight annotations
    });
  }
  return results;
}

/** Extract temperature range from quality notes */
function parseTemperatures(quality: string): { min: string; max: string } | null {
  const temps: number[] = [];
  const regex = /([+-]?\d+(?:\.\d+)?)\s*(?:℃|°C)/gi;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(quality)) !== null) {
    temps.push(parseFloat(m[1]));
  }
  if (temps.length === 0) return null;
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  return { min: min.toFixed(1), max: max.toFixed(1) };
}

/** Extract per-shipper temperature blocks from quality text */
function parseShipperTemperatures(quality: string): { shipper: string; min: string; max: string }[] {
  // Patterns like "S/PIO(#3-B) - 어창 개방 측정온도는 -18.0℃ ~ -19.0℃" or "S/SPR: 어창 ... -20.0℃ ~ -24.0℃"
  const blockRegex = /([A-Za-z/_ -]+?)(?:\([^)]*\))?\s*[-:]?\s*어창[^.]*?([+-]?\d+(?:\.\d+)?)\s*(?:℃|°C)\s*~\s*([+-]?\d+(?:\.\d+)?)\s*(?:℃|°C)/gi;
  const results: { shipper: string; min: string; max: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = blockRegex.exec(quality)) !== null) {
    const t1 = parseFloat(m[2]);
    const t2 = parseFloat(m[3]);
    results.push({
      shipper: m[1].trim(),
      min: Math.min(t1, t2).toFixed(1),
      max: Math.max(t1, t2).toFixed(1),
    });
  }
  // Fallback: single global temperature range
  if (results.length === 0) {
    const global = parseTemperatures(quality);
    if (global) {
      results.push({ shipper: '', min: global.min, max: global.max });
    }
  }
  return results;
}

/** Extract next-day plan tonnage from quality notes */
function parseNextDayPlan(quality: string): string | null {
  const m = quality.match(/명일.*?약\s*(\d+)\s*톤/);
  return m ? m[1] : null;
}

/** Extract next-day date from quality notes */
function parseNextDayDate(quality: string): string | null {
  const m = quality.match(/명일\((\d+\/\d+)/);
  return m ? m[1] : null;
}

/** Build short vessel name for attachment line */
function shortVesselName(name: string): string {
  return name.replace(/^M\/V\s+/i, '').trim();
}

/** Format number with 3 decimal places */
function fmt(n: number): string {
  return n.toFixed(3);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function UnloadingReportGenerator({ vesselData, onClose }: ReportGeneratorProps) {
  // Dates with actual work (dailyAmount > 0)
  const workDates = useMemo(
    () => vesselData.timeline.filter(t => t.dailyAmount > 0 && t.targetHol !== '-'),
    [vesselData.timeline],
  );

  const [selectedDate, setSelectedDate] = useState<string>(
    workDates.length > 0 ? workDates[workDates.length - 1].date : '',
  );
  const [copied, setCopied] = useState(false);

  // Selected entry
  const entry = useMemo(
    () => vesselData.timeline.find(t => t.date === selectedDate) ?? null,
    [vesselData.timeline, selectedDate],
  );

  // Override fields
  const [overrides, setOverrides] = useState<{
    startTime: string;
    endTime: string;
    nextDayPlan: string;
    tempMin: string;
    tempMax: string;
  }>({ startTime: '', endTime: '', nextDayPlan: '', tempMin: '', tempMax: '' });

  // Derived values
  const derived = useMemo(() => {
    if (!entry) return null;

    const isCompleted = vesselData.status.includes('하역완료') || vesselData.status.includes('Completed');
    const dailyTotal = entry.dailyAmount;
    const cumulative = entry.cumAmount;
    const remaining = vesselData.reportedTotal - cumulative;
    const surplus = vesselData.surplus;

    // Parse times from entry.time "08:10 ~ 20:30"
    const timeParts = entry.time.split('~').map(s => s.trim());
    const startTime = overrides.startTime || timeParts[0] || '';
    const endTime = overrides.endTime || timeParts[1] || '';

    // Temperature
    const globalTemps = parseTemperatures(entry.quality);
    const tempMin = overrides.tempMin || globalTemps?.min || '';
    const tempMax = overrides.tempMax || globalTemps?.max || '';

    // Next day plan
    const nextDayPlan = overrides.nextDayPlan || parseNextDayPlan(entry.quality) || '';
    const nextDayDate = parseNextDayDate(entry.quality) || '';

    // Shipper-hold breakdown
    const shipperHolds = parseShipperHolds(entry.targetHol);

    // Per-shipper temperatures
    const shipperTemps = parseShipperTemperatures(entry.quality);

    return {
      isCompleted,
      dailyTotal,
      cumulative,
      remaining,
      surplus,
      startTime,
      endTime,
      tempMin,
      tempMax,
      nextDayPlan,
      nextDayDate,
      shipperHolds,
      shipperTemps,
    };
  }, [entry, vesselData, overrides]);

  // ─── Build report text ─────────────────────────────────────────────────────

  const reportText = useMemo(() => {
    if (!entry || !derived) return '보고서를 생성할 데이터가 없습니다.';

    const { isCompleted, dailyTotal, cumulative, remaining, surplus, startTime, endTime, nextDayPlan, nextDayDate, shipperHolds, shipperTemps } = derived;
    const vName = vesselData.name;
    const shortName = shortVesselName(vName);
    const date = entry.date;

    const lines: string[] = [];

    // Header
    lines.push('수신: 해양수산본부');
    lines.push('발신: 방콕사무소');
    lines.push('');

    // §1
    lines.push('1. 업무에 노고가 많으십니다.');
    lines.push('');

    // §2
    lines.push(`2. 금일(${date}) ${vName} 하역결과를 아래와 같이 보고 드립니다.`);
    lines.push('');

    // Species-by-shipper lines
    if (shipperHolds.length > 0) {
      for (const sh of shipperHolds) {
        const species = classifySpecies(sh.shipper);
        const code = species === 'Skipjack' ? 'SJ' : species === 'Yellowfin' ? 'YF' : '??';
        lines.push(`* ${code}:                ${fmt(dailyTotal)} MT (${sh.shipper}:${sh.holds})`);
      }
    } else {
      // Fallback — aggregate by species
      for (const sp of vesselData.species) {
        lines.push(`* ${sp.id}:                ${fmt(dailyTotal)} MT`);
      }
    }

    lines.push('-------------------------------------------------------------------------------');

    // Summary lines with alignment
    lines.push(`일일  하역량:             ${fmt(dailyTotal)} MT`);
    lines.push(`하 역 누 계:             ${fmt(cumulative)} MT`);

    if (isCompleted && cumulative >= vesselData.reportedTotal) {
      lines.push(`증      감:  +           ${fmt(Math.abs(surplus))} MT (총 적재량 : ${fmt(vesselData.reportedTotal)} MT)`);
    } else {
      const sign = remaining >= 0 ? '-' : '+';
      lines.push(`잔      량:  ${sign}        ${fmt(Math.abs(remaining))} MT (총 적재량 : ${fmt(vesselData.reportedTotal)} MT)`);
    }

    lines.push('');

    // §3
    if (startTime && endTime) {
      lines.push(`3. 금일(${date}) 하역작업은 ${startTime} ~ ${endTime} 까지 진행하였습니다.`);
    } else {
      lines.push(`3. 금일(${date}) 하역작업은 ${entry.time} 까지 진행하였습니다.`);
    }

    lines.push('');

    // §4 — Temperature observations
    lines.push(`4. 금일(${date}) 하역 시 관찰된 제품상태 관하여 다음과 같이 보고 드립니다.`);
    lines.push('');

    if (shipperTemps.length > 0) {
      for (const st of shipperTemps) {
        const label = st.shipper || (shipperHolds[0]?.shipper ?? '');
        // Find matching hold info
        const holdInfo = shipperHolds.find(sh => sh.shipper === st.shipper || sh.shipper.includes(st.shipper));
        const holdStr = holdInfo ? `(${holdInfo.holds})` : '';
        lines.push(`* ${label}${holdStr}`);
        lines.push(`- 어창 개방 측정온도는 ${st.min}℃ ~ ${st.max}℃ 입니다.`);
        lines.push('');
      }
    } else if (derived.tempMin && derived.tempMax) {
      const label = shipperHolds[0]?.shipper || '';
      const holdStr = shipperHolds[0] ? `(${shipperHolds[0].holds})` : '';
      lines.push(`* ${label}${holdStr}`);
      lines.push(`- 어창 개방 측정온도는 ${derived.tempMin}℃ ~ ${derived.tempMax}℃ 입니다.`);
      lines.push('');
    }

    // §5
    if (isCompleted && cumulative >= vesselData.reportedTotal) {
      lines.push(`5. 운반선 ${vName}에서 보고량(${fmt(vesselData.reportedTotal)}톤) 대비 ${fmt(Math.abs(surplus))}톤 증가한 ${fmt(vesselData.actualTotal)}톤 하역 종료하였습니다.`);
    } else if (nextDayPlan) {
      const ndDate = nextDayDate || '';
      lines.push(`5. 명일(${ndDate})은 약 ${nextDayPlan}톤 하역 작업 예정입니다.`);
    } else {
      lines.push('5. 명일 하역 작업 예정입니다.');
    }

    lines.push('');

    // §6
    lines.push('6. 수고하십시오.');
    lines.push('');

    // Attachment line
    lines.push(`*첨부 : ${shortName} 일일 하역결과보고(${date})`);

    return lines.join('\n');
  }, [entry, derived, vesselData]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = reportText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [reportText]);

  const handleExport = useCallback(() => {
    const shortName = shortVesselName(vesselData.name);
    const filename = `${shortName}_일일보고서_${selectedDate.replace('/', '-')}.txt`;
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [reportText, vesselData.name, selectedDate]);

  // ─── Close on overlay click ────────────────────────────────────────────────

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  // ─── Keyboard ──────────────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  const isCompleted = vesselData.status.includes('하역완료') || vesselData.status.includes('Completed');

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="일일 보고서 자동 생성"
      tabIndex={-1}
    >
      <div className={styles.modal}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.title}>
            <span className={styles.titleIcon}>📋</span>
            일일 보고서 자동 생성
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        {/* ── Left: Preview ── */}
        <div className={styles.previewPane}>
          <div className={styles.previewLabel}>
            <FileText size={14} />
            보고서 미리보기
          </div>
          <div className={styles.reportBox}>{reportText}</div>
        </div>

        {/* ── Right: Controls ── */}
        <div className={styles.controlsPane}>
          {/* Vessel info */}
          <div className={styles.controlSection}>
            <span className={styles.controlLabel}>운반선</span>
            <div className={styles.vesselBadge}>
              {vesselData.name}
              <span className={isCompleted ? styles.statusCompleted : styles.statusProgress}>
                {isCompleted ? '완료' : '진행중'}
              </span>
            </div>
          </div>

          {/* Date selector */}
          <div className={styles.controlSection}>
            <span className={styles.controlLabel}>보고서 날짜</span>
            <div className={styles.selectWrap}>
              <select
                className={styles.select}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              >
                {workDates.map(t => (
                  <option key={t.date} value={t.date}>
                    {t.date} — {fmt(t.dailyAmount)} MT
                  </option>
                ))}
              </select>
              <span className={styles.selectArrow}>▼</span>
            </div>
          </div>

          <div className={styles.separator} />

          {/* Override fields */}
          <div className={styles.controlSection}>
            <span className={styles.controlLabel}>수동 입력 (선택사항)</span>
            <div className={styles.overrideGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>작업 시작 시간</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder={derived?.startTime || '08:10'}
                  value={overrides.startTime}
                  onChange={e => setOverrides(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>작업 종료 시간</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder={derived?.endTime || '18:00'}
                  value={overrides.endTime}
                  onChange={e => setOverrides(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>최저 온도 (℃)</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder={derived?.tempMin || '-20.0'}
                  value={overrides.tempMin}
                  onChange={e => setOverrides(prev => ({ ...prev, tempMin: e.target.value }))}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>최고 온도 (℃)</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder={derived?.tempMax || '-18.0'}
                  value={overrides.tempMax}
                  onChange={e => setOverrides(prev => ({ ...prev, tempMax: e.target.value }))}
                />
              </div>
              <div className={styles.fieldGroupFull}>
                <label className={styles.fieldLabel}>명일 하역 예정량 (톤)</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  placeholder={derived?.nextDayPlan || '300'}
                  value={overrides.nextDayPlan}
                  onChange={e => setOverrides(prev => ({ ...prev, nextDayPlan: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Info card */}
          {entry && (
            <div className={styles.infoCard}>
              <strong>자동 파싱 결과</strong><br />
              일일: {fmt(entry.dailyAmount)} MT · 누계: {fmt(entry.cumAmount)} MT<br />
              잔량: {fmt(vesselData.reportedTotal - entry.cumAmount)} MT / 총 {fmt(vesselData.reportedTotal)} MT
            </div>
          )}

          {/* Action buttons */}
          <div className={styles.actionGroup}>
            <button
              className={copied ? styles.btnSuccess : styles.btnPrimary}
              onClick={handleCopy}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? '복사 완료 ✅' : '클립보드에 복사'}
            </button>
            <button className={styles.btnSecondary} onClick={handleExport}>
              <Download size={16} />
              텍스트 파일로 내보내기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
