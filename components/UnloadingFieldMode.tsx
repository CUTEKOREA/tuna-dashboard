'use client';
import React, { useState, useEffect } from 'react';
import styles from './UnloadingFieldMode.module.css';
import { X, ChevronDown, Calendar, Clock, Thermometer, CheckCircle } from 'lucide-react';

interface VesselInfo {
  id: string;
  name: string;
  reportedTotal: number;
  actualTotal: number;
  status: string;
  timeline: { date: string; time: string; targetHol: string; dailyAmount: number; cumAmount: number; quality: string }[];
}

interface FieldModeProps {
  vessels: VesselInfo[];
  onClose: () => void;
}

// RadialGauge (self-contained, same as UnloadingStatus but with larger default)
function RadialGauge({ progress, radius = 50, strokeWidth = 6, color = '#38bdf8' }: {
  progress: number; radius?: number; strokeWidth?: number; color?: string;
}) {
  const circumference = 2 * Math.PI * radius;
  const clean = isNaN(progress) || !isFinite(progress) ? 0 : progress;
  const offset = circumference * (1 - Math.min(clean, 100) / 100);

  return (
    <div style={{ position: 'relative', width: (radius + strokeWidth) * 2, height: (radius + strokeWidth) * 2, display: 'inline-block', flexShrink: 0 }}>
      <svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2} viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}>
        <defs>
          <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle
          cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius}
          fill="transparent" stroke="var(--dsc-surface-border)" strokeWidth={strokeWidth}
        />
        <circle
          cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius}
          fill="transparent" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" filter="url(#gauge-glow)"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--dsc-ink)',
      }}>
        {clean.toFixed(1)}%
      </div>
    </div>
  );
}

// Parse temperature from quality text
function parseLastTemp(quality: string): { min: number | null; max: number | null } {
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

export default function UnloadingFieldMode({ vessels, onClose }: FieldModeProps) {
  const [selectedId, setSelectedId] = useState<string>(vessels[0]?.id || '');
  const [formOpen, setFormOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // Form state
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [formDate, setFormDate] = useState(todayStr);
  const [formTimeStart, setFormTimeStart] = useState('08:00');
  const [formTimeEnd, setFormTimeEnd] = useState('17:00');
  const [formAmount, setFormAmount] = useState('');
  const [formHolds, setFormHolds] = useState('');
  const [formTempMin, setFormTempMin] = useState('');
  const [formTempMax, setFormTempMax] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  // Keyboard Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const selectedVessel = vessels.find(v => v.id === selectedId) || vessels[0];

  // Compute derived data for the selected vessel
  const progress = selectedVessel
    ? Math.min((selectedVessel.actualTotal / (selectedVessel.reportedTotal || 1)) * 100, 100)
    : 0;
  const remaining = selectedVessel
    ? Math.max(0, selectedVessel.reportedTotal - selectedVessel.actualTotal)
    : 0;

  // Last timeline entry
  const lastEntry = selectedVessel?.timeline?.[selectedVessel.timeline.length - 1];
  const lastTemp = lastEntry ? parseLastTemp(lastEntry.quality) : { min: null, max: null };
  const lastDate = lastEntry?.date || '—';

  // Today's entry (if exists)
  const todayMonthDay = `${today.getMonth() + 1}/${today.getDate()}`;
  const todayEntry = selectedVessel?.timeline?.find(t => t.date === todayMonthDay);

  const formatNum = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  const handleSubmit = () => {
    if (!selectedVessel) return;

    // Build report text (similar format to the dashboard's report style)
    const dateFormatted = formDate.replace(/-/g, '.');
    const amount = parseFloat(formAmount) || 0;
    const cumulative = selectedVessel.actualTotal + amount;
    const progressNew = Math.min((cumulative / (selectedVessel.reportedTotal || 1)) * 100, 100);

    const reportLines = [
      `📋 ${selectedVessel.name} 하역 보고서`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📅 날짜: ${dateFormatted}`,
      `⏰ 작업 시간: ${formTimeStart} ~ ${formTimeEnd}`,
      `📦 일일 하역량: ${formatNum(amount)} MT`,
      `📊 누적 하역량: ${formatNum(cumulative)} / ${formatNum(selectedVessel.reportedTotal)} MT (${progressNew.toFixed(1)}%)`,
      `🔲 작업 어창: ${formHolds || '미지정'}`,
    ];

    if (formTempMin || formTempMax) {
      reportLines.push(`🌡️ 어창 온도: ${formTempMin || '—'}℃ ~ ${formTempMax || '—'}℃`);
    }

    if (formNotes) {
      reportLines.push(`📝 품질 메모: ${formNotes}`);
    }

    reportLines.push(`━━━━━━━━━━━━━━━━━━━━`);
    reportLines.push(`잔여 하역량: ${formatNum(Math.max(0, selectedVessel.reportedTotal - cumulative))} MT`);

    const text = reportLines.join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2500);
    }).catch(() => {
      // Fallback: prompt
      window.prompt('보고서 텍스트를 복사하세요:', text);
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarTitle}>
            <span>🚢</span> Field Mode
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Vessel Selector */}
        <div className={styles.vesselSelectorLabel}>선박 선택</div>
        <div className={styles.vesselCards}>
          {vessels.map(v => {
            const isActive = v.id === selectedId;
            const isProgress = v.status.includes('하역중');
            return (
              <div
                key={v.id}
                className={`${styles.vesselSelectCard} ${isActive ? styles.active : ''}`}
                onClick={() => setSelectedId(v.id)}
              >
                <div>
                  <div className={styles.vesselSelectName}>{v.name}</div>
                  <div className={styles.vesselSelectMeta}>
                    {formatNum(v.actualTotal)} / {formatNum(v.reportedTotal)} MT
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${isProgress ? styles.progress : styles.completed}`}>
                  {isProgress ? '진행중' : '완료'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hero Card */}
        {selectedVessel && (
          <div className={styles.heroCard}>
            <div className={styles.heroGaugeRow}>
              <RadialGauge progress={progress} radius={50} />
              <div className={styles.heroNumbers}>
                <div className={styles.heroCumulative}>
                  {formatNum(selectedVessel.actualTotal)}
                </div>
                <div className={styles.heroTotal}>
                  / {formatNum(selectedVessel.reportedTotal)} MT
                </div>
              </div>
            </div>

            <div className={styles.heroStatusRow}>
              <span className={`${styles.statusBadge} ${selectedVessel.status.includes('하역중') ? styles.progress : styles.completed}`}>
                {selectedVessel.status.includes('하역중') ? '하역중' : '하역완료'}
              </span>
              <span className={styles.heroMetaItem}>
                <Calendar size={14} /> 마지막 작업: {lastDate}
              </span>
              {lastTemp.min !== null && (
                <span className={styles.heroMetaItem}>
                  <Thermometer size={14} /> {lastTemp.min}℃ ~ {lastTemp.max}℃
                </span>
              )}
            </div>

            <div className={styles.heroRemaining}>
              <div className={styles.heroRemainingLabel}>잔여 하역량</div>
              <div className={styles.heroRemainingValue}>
                {remaining > 0 ? `${formatNum(remaining)} MT` : '완료 ✓'}
              </div>
            </div>
          </div>
        )}

        {/* Today's Summary */}
        {todayEntry && (
          <div className={styles.todaySummary}>
            <div className={styles.todaySummaryTitle}>
              <Clock size={16} /> 오늘 ({todayMonthDay}) 작업 요약
            </div>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemLabel}>일일 하역량</div>
                <div className={styles.summaryItemValue}>{formatNum(todayEntry.dailyAmount)} MT</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemLabel}>누적</div>
                <div className={styles.summaryItemValue}>{formatNum(todayEntry.cumAmount)} MT</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemLabel}>작업 시간</div>
                <div className={styles.summaryItemValue}>{todayEntry.time}</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryItemLabel}>작업 어창</div>
                <div className={styles.summaryItemValue} style={{ fontSize: '0.85rem' }}>
                  {todayEntry.targetHol === '-' ? '—' : todayEntry.targetHol}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Data Input */}
        <div className={styles.inputSection}>
          <div className={styles.inputToggle} onClick={() => setFormOpen(o => !o)}>
            <span className={styles.inputToggleLabel}>
              <span>➕</span> 오늘 하역 입력
            </span>
            <span className={`${styles.inputToggleArrow} ${formOpen ? styles.open : ''}`}>
              <ChevronDown size={20} />
            </span>
          </div>

          {formOpen && (
            <div className={styles.inputForm}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>날짜</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                />
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>작업 시작</label>
                  <input
                    type="time"
                    className={styles.inputField}
                    value={formTimeStart}
                    onChange={e => setFormTimeStart(e.target.value)}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>작업 종료</label>
                  <input
                    type="time"
                    className={styles.inputField}
                    value={formTimeEnd}
                    onChange={e => setFormTimeEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>일일 하역량 (MT)</label>
                <input
                  type="number"
                  className={styles.inputField}
                  placeholder="예: 350.5"
                  value={formAmount}
                  onChange={e => setFormAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>작업 어창</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="예: #3-A, #3-B, #4-A"
                  value={formHolds}
                  onChange={e => setFormHolds(e.target.value)}
                />
              </div>

              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>최저 온도 (℃)</label>
                  <input
                    type="number"
                    className={styles.inputField}
                    placeholder="-22"
                    value={formTempMin}
                    onChange={e => setFormTempMin(e.target.value)}
                    step="0.1"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>최고 온도 (℃)</label>
                  <input
                    type="number"
                    className={styles.inputField}
                    placeholder="-18"
                    value={formTempMax}
                    onChange={e => setFormTempMax(e.target.value)}
                    step="0.1"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>품질 메모</label>
                <textarea
                  className={styles.textArea}
                  placeholder="외관상태 및 색택 전반적으로 양호..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                />
              </div>

              <button className={styles.submitBtn} onClick={handleSubmit}>
                📤 보고서 생성 &amp; 저장
              </button>
            </div>
          )}
        </div>

        {/* Toast */}
        {toastVisible && (
          <div className={styles.toast}>
            <CheckCircle size={18} /> 보고서가 클립보드에 복사되었습니다!
          </div>
        )}
      </div>
    </div>
  );
}
