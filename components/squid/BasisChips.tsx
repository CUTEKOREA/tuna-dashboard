'use client';

/**
 * 근거 칩 — squid v5 의 모든 위젯 하단에 예외 없이 붙는다.
 *
 *   ⚠ 2026-01~05만 관측 · 🦑 대왕오징어 · ⚖ 제품중량 · 🏷 소비자가 · 📅 2026-08-11 (D+2) · 🅰 KMI
 *
 * 칩을 누르면 원문 아카이브 경로와 발행처 링크가 열린다.
 * 숫자가 어디서 왔고 어떻게 쓰면 안 되는지를 화면에서 감추지 않는 것이 이 컴포넌트의 목적이다.
 */

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import type { SquidSource, WidgetBasis } from './types';
import {
  koreanUiText,
  squidCurrencyLabel,
  squidFrequencyLabel,
  squidPublisherLabel,
  squidSpeciesLabel,
} from './localization';

const SCOPE_KO: Record<string, string> = {
  squid_only: '오징어만',
  incl_cuttlefish: '갑오징어 포함',
  cephalopods_nei: '두족류 전체',
};

const WEIGHT_KO: Record<string, string> = {
  live_weight: '생중량',
  product_weight: '제품중량',
  net_weight: '순중량',
  'n/a': '',
};

const STAGE_KO: Record<string, string> = {
  consumer: '소비자가',
  wholesale: '도매가',
  import_unit: '수입단가',
  export_unit: '수출단가',
  first_sale: '1차판매가',
  'n/a': '',
};

const QUOTA_KO: Record<string, string> = {
  legal_limit: '법정한도',
  allocation: '배분량',
  consumption: '소진량',
  catch: '어획실적',
  closure_notice: '중단공지',
  effort_limit: '노력량한도',
  'n/a': '',
};

/** 기준일로부터 경과일. 90일 이내 정상, 365일 이내 주의, 그 이상 경고. */
export function daysSince(dateStr: string, now: Date): number | null {
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(dateStr);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = m[2] ? Number(m[2]) : 12;
  const d = m[3] ? Number(m[3]) : new Date(y, mo, 0).getDate(); // 월/연만 있으면 기간 끝
  const then = new Date(y, mo - 1, d);
  return Math.floor((now.getTime() - then.getTime()) / 86_400_000);
}

export function freshnessColor(days: number | null): string {
  if (days === null) return '#94a3b8';
  if (days <= 90) return '#10b981';
  if (days <= 365) return '#f59e0b';
  return '#f43f5e';
}

const GRADE_MARK: Record<string, string> = { A: '🅰', B: '🅱', C: '🅲' };

/** 하이드레이션 불일치 없이 클라이언트 시각을 한 번만 얻는다. */
function createClientDateStore() {
  let date: Date | null = null;
  const listeners = new Set<() => void>();
  return {
    subscribe(fn: () => void) {
      listeners.add(fn);
      if (date === null) {
        date = new Date();
        Promise.resolve().then(() => listeners.forEach((l) => l()));
      }
      return () => listeners.delete(fn);
    },
    getSnapshot() {
      return date;
    },
  };
}

function useClientOnlyDate() {
  const store = useMemo(() => createClientDateStore(), []);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => null);
}

interface ChipProps {
  icon: string;
  label: string;
  title?: string;
  color?: string;
  onClick?: () => void;
}

const Chip: React.FC<ChipProps> = ({ icon, label, title, color = '#94a3b8', onClick }) => (
  <span
    title={title}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 7px',
      borderRadius: '5px',
      background: 'rgba(20, 28, 52, 0.55)',
      border: `1px solid ${color}33`,
      color,
      fontSize: '0.62rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      cursor: onClick ? 'pointer' : 'default',
    }}
  >
    <span aria-hidden="true">{icon}</span>
    {label}
  </span>
);

export interface BasisChipsProps {
  basis: WidgetBasis;
  /** squid_v5.json 의 sources[] — 발행처명과 landing_url 조회용 */
  sources?: SquidSource[];
  /** 신선도 계산 기준 시각. 넘기지 않으면 마운트 시점의 브라우저 시각 */
  now?: Date;
}

export const BasisChips: React.FC<BasisChipsProps> = ({ basis, sources = [], now }) => {
  const [open, setOpen] = useState(false);

  // 경과일은 "지금" 기준이라야 의미가 있는데, 서버 렌더 시각과 브라우저 시각이
  // 달라 그대로 쓰면 하이드레이션이 어긋난다. 서버 스냅샷은 null로 두고
  // 클라이언트 마운트 후에 D+n 을 채운다. 빌드 시각으로 대신하면 월간 배치 특성상
  // 최대 한 달치 낡음이 감춰지므로 그 절충은 쓰지 않는다.
  const clientNow = useClientOnlyDate();
  const asOf = now ?? clientNow;

  const species = basis.species.filter((s) => s !== 'n/a');
  const speciesLabel =
    species.length === 0 ? null
      : species.length <= 2 ? species.map((s) => squidSpeciesLabel(s)).join('·')
        : `${squidSpeciesLabel(species[0])} 외 ${species.length - 1}종`;

  const days = asOf ? daysSince(basis.coverage_end, asOf) : null;
  const srcById = new Map(sources.map((s) => [s.source_id, s]));
  const publishers = basis.source_ids
    .map((id) => squidPublisherLabel(srcById.get(id)?.publisher ?? id))
    .filter((v, i, a) => a.indexOf(v) === i);

  const weight = WEIGHT_KO[basis.weight_basis];
  const stage = STAGE_KO[basis.market_stage];
  const quota = basis.quota_semantics ? QUOTA_KO[basis.quota_semantics] : '';

  return (
    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
        {/* 제한은 항상 선두 — 못 보고 지나치면 안 되는 정보 */}
        {basis.restrictions.map((r) => (
          <Chip key={r} icon="⚠" label={koreanUiText(r)} color="#f59e0b" title="이 지표에는 사용 제한이 걸려 있다" />
        ))}

        {speciesLabel && (
          <Chip icon="🦑" label={speciesLabel} title={species.join(', ')} />
        )}

        {basis.taxon_scope !== 'squid_only' && (
          <Chip
            icon="🔀"
            label={SCOPE_KO[basis.taxon_scope]}
            color="#f59e0b"
            title={koreanUiText(basis.taxon_note ?? '오징어 이외 분류군이 섞여 있다')}
          />
        )}

        {weight && <Chip icon="⚖" label={weight} />}
        {stage && <Chip icon="🏷" label={stage} />}
        {quota && <Chip icon="📐" label={quota} />}

        {basis.currency && basis.currency !== 'n/a' && (
          <Chip
            icon="💱"
            label={squidCurrencyLabel(basis.currency)}
            title={basis.currency_converted ? `환산 기준일 ${basis.fx_date ?? '미상'}` : '원통화 표시'}
          />
        )}

        <Chip
          icon="📅"
          label={days === null ? basis.coverage_end : `${basis.coverage_end} (기준일+${days}일)`}
          color={freshnessColor(days)}
          title={`관측 ${basis.coverage_start}~${basis.coverage_end} · 발간 ${basis.published_at} · 수집 ${basis.retrieved_at}`}
        />

        <Chip
          icon={GRADE_MARK[basis.source_grade] ?? '🅰'}
          label={publishers.join('·')}
          color={basis.source_grade === 'C' ? '#f59e0b' : '#94a3b8'}
          title={basis.source_grade === 'C' ? 'C등급 — 보조검증 필요' : `출처 등급 ${basis.source_grade}`}
          onClick={() => setOpen((v) => !v)}
        />
      </div>

      {open && (
        <div
          style={{
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '0.72rem',
            lineHeight: 1.6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '6px' }}>원문 근거</div>
          {basis.archive_path.split(';').map((p) => (
            <div key={p} style={{ color: '#94a3b8', wordBreak: 'break-all' }}>· {p}</div>
          ))}
          {basis.source_ids.map((id, index) => {
            const s = srcById.get(id);
            if (!s) return <div key={id} style={{ color: '#94a3b8' }}>· 출처 {index + 1}</div>;
            return (
              <div key={id} style={{ marginTop: '4px' }}>
                <a
                  href={s.landing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#38bdf8' }}
                >
                  {squidPublisherLabel(s.publisher)} — {koreanUiText(s.series ?? `출처 ${index + 1}`)}
                </a>
                <span style={{ color: '#64748b' }}>
                  {' '}(우선순위 {s.priority.replace('P', '')}·{s.grade === 'A' ? '1' : s.grade === 'B' ? '2' : '3'}등급·{squidFrequencyLabel(s.frequency)})
                </span>
              </div>
            );
          })}
          {basis.blocked_use.length > 0 && (
            <div style={{ marginTop: '8px', color: '#fda4af' }}>
              <strong>금지 용법:</strong> {basis.blocked_use.join(' / ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BasisChips;
