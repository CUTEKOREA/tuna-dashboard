'use client';
import React, { useMemo, useSyncExternalStore } from 'react';
import s from './PnaAccessFeeWidgets.module.css';
import { pnaAccessFee, companyTotals, shinlaInstallmentDue } from '@/lib/data/pna-access-fee';

/* ═══════════════════════════════════════════════════════
   2026어기 PNA 수역별 입어료 배정
   데이터는 lib/data/pna-access-fee.ts 가 유일한 통로다 (ADR-0005).
   여기서 숫자를 다시 적지 않는다 — 다음 회차 배정표가 오면 계약만 고친다.
   ═══════════════════════════════════════════════════════ */

interface ZoneData {
  id: string;
  name: string;
  nameKr: string;
  vessels: number;
  days: number;
  unitCost: number;   // $/일
  fee: number;        // 해당 회차 입어료
  extras: number;     // 제반경비 + 송금수수료
  total: number;      // 소계
  color: string;
  installment: number;
  sharePct: number;
}

/** 화면은 신라교역 몫만 본다 — 회사별 전체는 아래 업계 점유율 카드가 맡는다 */
const ZONES: ZoneData[] = pnaAccessFee.zones.map((z) => {
  const mine = z.companies.find((c) => c.name === '신라교역');
  const days = mine?.days ?? 0;
  const fee = mine?.fee ?? 0;
  const extras = z.shinlaExtras + z.shinlaRemitFee;
  return {
    id: z.id, name: z.name, nameKr: z.nameKr,
    vessels: mine?.vessels ?? 0, days, unitCost: z.unitCost,
    fee, extras, total: fee + extras, color: z.color,
    installment: z.installment, sharePct: z.sharePct,
  };
});

const PAYMENTS = pnaAccessFee.payments;
const COMPANIES = companyTotals();
const SUPPORT_SHIPS = pnaAccessFee.supportShips;
const DUE = shinlaInstallmentDue();
const SYNC_DATE = pnaAccessFee.source.allocation.issuedAt;

/* 패턴 F 정정: D-day는 하드코딩하지 않고 렌더 시점에 납기일로부터 계산 */
const URGENT_WINDOW_DAYS = 30;
const subscribeClientSnapshot = () => () => {};
const getTodaySnapshot = (): string | null => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const getServerTodaySnapshot = (): string | null => null;

function getDDay(dateStr: string, today: Date): { diff: number; label: string } {
  const [y, m, d] = dateStr.split('.').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const diff = Math.round((target - base) / 86_400_000);
  const label = diff > 0 ? `D-${diff}` : diff === 0 ? 'D-DAY' : `D+${-diff} 경과`;
  return { diff, label };
}

/* ─── Utility ─── */
const fmt = (n: number) => n.toLocaleString('en-US');
const fmtK = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

/* ═══════════════════════════════════════════════════════
   1. Hero Cost Summary Card
   ═══════════════════════════════════════════════════════ */
function HeroCostCard() {
  const totalFee = ZONES.reduce((a, z) => a + z.fee, 0);
  const totalExtras = ZONES.reduce((a, z) => a + z.extras, 0);
  const totalAll = ZONES.reduce((a, z) => a + z.total, 0);
  const totalDays = ZONES.reduce((a, z) => a + z.days, 0);

  return (
    <div className={s.heroCard}>
      <h3 className={s.sectionTitle}>
        <span style={{ fontSize: '1.2em' }}>💰</span>
        2026어기 PNA 수역별 입어료 배정 총괄
        <span className={s.sectionSub}>신라교역 · 6척 기준 · STATIC · {SYNC_DATE} 배정표 동기화</span>
      </h3>
      <div className={s.heroGrid}>
        <div className={s.heroStat}>
          <div className={s.heroStatLabel}>총 입어 비용</div>
          <div className={`${s.heroStatValue} ${s.heroStatAccent}`}>
            ${(totalAll / 1_000_000).toFixed(2)}<span className={s.heroStatUnit}>M</span>
          </div>
        </div>
        <div className={s.heroStat}>
          <div className={s.heroStatLabel}>총 조업일수</div>
          <div className={s.heroStatValue}>
            {fmt(totalDays)}<span className={s.heroStatUnit}>일</span>
          </div>
        </div>
        <div className={s.heroStat}>
          <div className={s.heroStatLabel}>평균 일당 단가</div>
          <div className={s.heroStatValue}>
            ${fmt(Math.round(totalFee / totalDays))}<span className={s.heroStatUnit}>/일</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--w-amber-500)' }}>●</span> 입어료: <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>${fmt(Math.round(totalFee))}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--w-violet-500)' }}>●</span> 제반경비: <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>${fmt(Math.round(totalExtras))}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--w-cyan-500)' }}>●</span> 6개 수역 · 6척 배정
        </div>
      </div>
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
          이번 배정 — <strong style={{ color: 'var(--text-main)' }}>솔로몬·PNG 3차분</strong>
          {' '}(협회 송금 기한 <strong style={{ color: 'var(--w-amber-500)' }}>{DUE.remitBy.replace(/-/g, '.')}</strong>,
          {' '}정부 납기 {DUE.dueDate.replace(/-/g, '.')})
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: '0.8rem' }}>
          {DUE.zones.map((z) => (
            <span key={z.id} style={{ color: 'var(--text-muted)' }}>
              {z.nameKr} {z.installment}차분 {z.days}일{' '}
              <strong style={{ color: 'var(--text-main)' }}>${fmt(z.fee)}</strong>
            </span>
          ))}
          <span style={{ color: 'var(--text-muted)' }}>
            송금수수료 <strong style={{ color: 'var(--text-main)' }}>${fmt(DUE.remitFee)}</strong>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            합계 <strong style={{ color: 'var(--w-amber-500)' }}>${fmt(DUE.total)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   2. Zone Allocation Bars
   ═══════════════════════════════════════════════════════ */
function ZoneAllocationChart() {
  const maxFee = Math.max(...ZONES.map(z => z.fee));

  return (
    <div className={s.card}>
      <h4 className={s.cardTitle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--w-amber-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 21v-6"/><path d="M12 21V3"/><path d="M19 21V9"/></svg>
        수역별 입어료 배분
      </h4>
      <div className={s.zoneList}>
        {ZONES.map(z => (
          <div key={z.id} className={s.zoneRow}>
            <div className={s.zoneName} style={{ color: z.color }}>
              {z.name}
              <span style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                {z.installment}차분 {Math.round(z.sharePct * 100)}%
              </span>
            </div>
            <div className={s.zoneBarTrack}>
              <div
                className={s.zoneBarFill}
                style={{
                  width: `${(z.fee / maxFee) * 100}%`,
                  background: `linear-gradient(90deg, ${z.color}, ${z.color}88)`,
                }}
              >
                {z.days}일
              </div>
            </div>
            <div className={s.zoneAmount}>{fmtK(z.fee)}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 12px' }}>
        <span>총 {fmt(ZONES.reduce((a, z) => a + z.days, 0))}일</span>
        <span>총 {fmtK(ZONES.reduce((a, z) => a + z.fee, 0))}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   3. Unit Cost Comparison
   ═══════════════════════════════════════════════════════ */
function UnitCostComparison() {
  const maxCost = Math.max(...ZONES.map(z => z.unitCost));
  const sorted = [...ZONES].sort((a, b) => b.unitCost - a.unitCost);

  return (
    <div className={s.card}>
      <h4 className={s.cardTitle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--w-violet-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg>
        수역별 입어료 단가 비교
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>($/일)</span>
      </h4>
      <div className={s.unitCostList}>
        {sorted.map(z => {
          const isMax = z.unitCost === maxCost;
          return (
            <div key={z.id} className={s.unitCostRow}>
              <div className={s.unitCostHeader}>
                <span className={s.unitCostName}>
                  <span style={{ color: z.color, marginRight: 6 }}>●</span>
                  {z.name}
                  {isMax && <span style={{ marginLeft: 6, fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(var(--w-red-500-rgb), 0.15)', color: '#f87171', fontWeight: 700 }}>최고</span>}
                </span>
                <span className={s.unitCostValue} style={{ color: isMax ? '#f87171' : 'var(--text-main)' }}>
                  ${fmt(z.unitCost)}
                </span>
              </div>
              <div className={s.unitCostBarTrack}>
                <div
                  className={s.unitCostBarFill}
                  style={{
                    transform: `scaleX(${z.unitCost / maxCost})`,
                    background: isMax
                      ? 'linear-gradient(90deg, var(--w-red-500), #f87171)'
                      : `linear-gradient(90deg, ${z.color}, ${z.color}66)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16, fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        FSM이 $11,025/일로 가장 비싸며, 솔로몬·투발루·나우루가 $10,000/일로 가장 저렴
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   4. Payment Timeline
   ═══════════════════════════════════════════════════════ */
function PaymentTimeline() {
  // 하이드레이션 안전: 클라이언트 마운트 후에만 오늘 날짜 기반 D-day 계산
  const todayKey = useSyncExternalStore(subscribeClientSnapshot, getTodaySnapshot, getServerTodaySnapshot);
  const today = useMemo(() => todayKey ? new Date(`${todayKey}T00:00:00`) : null, [todayKey]);

  const rows = PAYMENTS.map(p => {
    if (p.done) return { ...p, status: 'done' as const, label: '✓ 납부완료' };
    if (!today) return { ...p, status: 'pending' as const, label: p.date };
    const { diff, label } = getDDay(p.date, today);
    const status = diff <= URGENT_WINDOW_DAYS ? ('urgent' as const) : ('pending' as const);
    return { ...p, status, label };
  });
  const urgentCount = rows.filter(r => r.status === 'urgent').length;

  return (
    <div className={s.card}>
      <h4 className={s.cardTitle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--w-red-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        납부 일정 타임라인
        {today && urgentCount > 0 && (
          <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 8, background: 'rgba(var(--w-red-500-rgb), 0.15)', color: '#f87171', fontWeight: 700, marginLeft: 8 }}>
            {urgentCount}건 임박
          </span>
        )}
      </h4>
      <div className={s.timeline}>
        {rows.map((p, i) => (
          <div key={i} className={s.timelineItem}>
            <div className={`${s.timelineDot} ${
              p.status === 'done' ? s.timelineDotDone :
              p.status === 'urgent' ? s.timelineDotUrgent :
              s.timelineDotPending
            }`} />
            <div className={s.timelineInfo}>
              <div className={s.timelineZone}>{p.zone}</div>
              <div className={s.timelineDate}>{p.date}</div>
            </div>
            <span className={`${s.timelineBadge} ${
              p.status === 'done' ? s.badgeDone :
              p.status === 'urgent' ? s.badgeUrgent :
              s.badgePending
            }`}>
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   5. Industry Share (Donut + Legend)
   ═══════════════════════════════════════════════════════ */
function IndustryShareChart() {
  const totalFee = COMPANIES.reduce((a, c) => a + c.fee, 0);
  const shinla = COMPANIES.find(c => c.isShinla)!;
  const shinlaPct = ((shinla.fee / totalFee) * 100).toFixed(1);

  // Build SVG donut
  const segments = useMemo(() => {
    const circumference = 2 * Math.PI * 52;
    return COMPANIES.reduce<{ items: Array<ReturnType<typeof companyTotals>[number] & { dasharray: string; dashoffset: number }>; offset: number }>((acc, c) => {
      const pct = c.fee / totalFee;
      const len = circumference * pct;
      const gap = circumference - len;
      return {
        items: [...acc.items, { ...c, dasharray: `${len} ${gap}`, dashoffset: -acc.offset }],
        offset: acc.offset + len,
      };
    }, { items: [], offset: 0 }).items;
  }, [totalFee]);

  return (
    <div className={s.card}>
      <h4 className={s.cardTitle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--w-cyan-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
        업계 입어료 점유율
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>2026어기 국적선</span>
      </h4>
      <div className={s.shareGrid}>
        <div className={s.donutContainer}>
          <svg viewBox="0 0 120 120" width="140" height="140">
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx="60" cy="60" r="52"
                fill="none"
                stroke={seg.color}
                strokeWidth={seg.isShinla ? 14 : 10}
                strokeDasharray={seg.dasharray}
                strokeDashoffset={seg.dashoffset}
                strokeLinecap="butt"
                transform="rotate(-90 60 60)"
                style={{ transition: 'all 0.8s ease', opacity: seg.isShinla ? 1 : 0.75 }}
              />
            ))}
          </svg>
          <div className={s.donutCenter}>
            <div className={s.donutCenterValue}>{shinlaPct}%</div>
            <div className={s.donutCenterLabel}>신라교역</div>
          </div>
        </div>
        <div className={s.legendList}>
          {COMPANIES.map(c => {
            const pct = ((c.fee / totalFee) * 100).toFixed(1);
            return (
              <div key={c.name} className={s.legendItem} style={c.isShinla ? { fontWeight: 700, color: 'var(--text-main)' } : {}}>
                <span className={s.legendDot} style={{ background: c.color }} />
                <span>{c.name}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.vessels}척</span>
                <span className={s.legendValue} style={c.isShinla ? { color: 'var(--w-amber-500)' } : {}}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   6. PNG Support Ship Table
   ═══════════════════════════════════════════════════════ */
function SupportShipTable() {
  const total = SUPPORT_SHIPS.reduce((a, sh) => a + sh.total, 0);

  return (
    <div className={s.card}>
      <h4 className={s.cardTitle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--w-emerald-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10.189V14"/><path d="M12 2v3"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76"/><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>
        2026어기 PNG 지원선 입어교섭 경비
      </h4>
      <table className={s.supportTable}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>선사</th>
            <th>척수</th>
            <th>합계($)</th>
            <th>비중</th>
          </tr>
        </thead>
        <tbody>
          {SUPPORT_SHIPS.map(sh => (
            <tr key={sh.name} className={sh.nameKr === '세인해운' ? s.highlightRow : ''}>
              <td style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600 }}>{sh.nameKr}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sh.name}</div>
              </td>
              <td>{sh.vessels}척</td>
              <td style={{ fontWeight: 600 }}>${fmt(sh.total)}</td>
              <td style={{ color: 'var(--text-muted)' }}>{((sh.total / total) * 100).toFixed(1)}%</td>
            </tr>
          ))}
          <tr style={{ background: 'rgba(255,255,255,0.03)', fontWeight: 700 }}>
            <td style={{ textAlign: 'left' }}>합계</td>
            <td>{SUPPORT_SHIPS.reduce((a, sh) => a + sh.vessels, 0)}척</td>
            <td style={{ color: 'var(--w-amber-500)' }}>${fmt(total)}</td>
            <td>100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Export
   ═══════════════════════════════════════════════════════ */
export default function PnaAccessFeeWidgets() {
  return (
    <section className={s.section}>
      {/* 1. Hero Cost Summary */}
      <HeroCostCard />

      {/* 2. Zone Allocation + Unit Cost */}
      <div className={s.twoCol}>
        <ZoneAllocationChart />
        <UnitCostComparison />
      </div>

      {/* 3. Payment Timeline + Industry Share */}
      <div className={s.twoCol}>
        <PaymentTimeline />
        <IndustryShareChart />
      </div>

      {/* 4. Support Ship Table */}
      <SupportShipTable />
    </section>
  );
}
