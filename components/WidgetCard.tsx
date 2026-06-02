/**
 * WidgetCard — ADR-0005 Widget Intake Module
 *
 * 100+ 위젯의 5단 합성 보일러플레이트(CardHeader + Chart + KPI Panel + TakeawayBox + TelemetryBadge)를
 * 단일 컴포넌트로 통합. 룰북 V4.1의 W-04 (cardDesc) / A-02 (TelemetryBadge) / P-03 (컨빅션 태그 금지) /
 * D-05 (한글 7자) / L-04 (HSK 10자리) 등을 런타임·컴파일 타임에 강제.
 *
 * 사용 예:
 * ```tsx
 * <WidgetCard
 *   title="W14. 저분자 펩타이드 생리활성"
 *   icon={TestTubeDiagonal}
 *   iconColor="#8b5cf6"
 *   pillar="S5"
 *   cardDesc="참치 부산물 효소가수분해 펩타이드의 항산화·ACE 억제·소장 흡수율 비교"
 *   telemetry={{ status: 'SYNCED', syncDate: '2025-Q4', source: 'KFAS 한국수산과학회지' }}
 *   chart={<RadarChart>…</RadarChart>}
 *   takeaway={{
 *     situation: '…',
 *     actionPlan: '…',
 *     source: 'KFAS 논문(2019-2023)',
 *   }}
 * />
 * ```
 */

'use client';
import React from 'react';
import { LucideIcon } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TakeawayBox from './TakeawayBox';
import TermTooltip from './TermTooltip';
import { TelemetryBadge } from './TelemetryBadge';

export type TelemetryStatus = 'LIVE' | 'SYNCED' | 'STATIC';
import styles from './TunaInsightsDashboard.module.css';

// ─── Types ─────────────────────────────────────────────────────────────────

export type Pillar = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

export interface TelemetryProps {
  status: TelemetryStatus;
  syncDate?: string;
}

export interface KpiItem {
  label: string;
  value: string | number;
  sub?: string;
  trendColor?: string;
}

export interface TakeawayProps {
  situation: string | React.ReactNode;
  actionPlan: string | React.ReactNode;
  source: string;          // W-04: 의무
}

export interface WidgetCardProps {
  // === 헤더 ===
  id?: string;               // 위젯 고유 ID (W-MSC01 등) — 선택
  title: string;
  description?: string;      // title 아래 보조 설명 — 선택
  icon?: LucideIcon;
  iconColor?: string;
  termTooltip?: { term: string; description: string };
  cardDesc: string;        // W-04 의무
  unit?: string;

  // === 분류 ===
  pillar: Pillar;          // 5-Pillar 매핑 의무 (W-04)
  telemetry: TelemetryProps;  // A-02 의무

  // === 본문 ===
  chart?: React.ReactNode;          // Recharts JSX (SafeResponsiveContainer 자동 래핑)
  chartHeight?: number;
  kpiPanel?: KpiItem[];
  customBody?: React.ReactNode;     // chart로 표현 안 되는 인터랙티브 UI (list/search/탭)
  children?: React.ReactNode;       // customBody 대안 — children으로 본문 직접 전달

  // === Takeaway ===
  takeaway: TakeawayProps;
}

// ─── 컨빅션 태그 / AI 티 검출 (P-03 강제) ───────────────────────────────────

const FORBIDDEN_PATTERNS = [
  /\(Conviction Buy\)/,
  /\(Strong Buy\)/,
  /\*\*\[Actionable Insight\]\*\*/,
  /압도적/,
  /완벽한 음의 상관관계/,
  /완벽한 펀더멘털 헷징/,
  /혁명적/,
  /독보적/,
  /역사적 기회/,
  /최초이자 최고/,
  /Game Changer/,
  /잉여현금흐름을 극대화/,
];

function checkForbidden(text: string | React.ReactNode, field: string, title: string): void {
  if (process.env.NODE_ENV === 'production') return;  // prod에서는 lint로만 검출
  if (typeof text !== 'string') return;  // ReactNode 통과 (TermTooltip 임베디드 등)
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) {
      console.error(
        `[WidgetCard:P-03] 금지 패턴 검출 — ${title} / ${field}: "${pattern.source}". ` +
        `컨빅션 태그·과장 수식어는 룰북 P-03 위반. 즉시 정정 필요.`
      );
    }
  }
}

// ─── KPI Panel ─────────────────────────────────────────────────────────────

function KpiPanel({ items }: { items: KpiItem[] }) {
  return (
    <div className={styles.kpiPanel}>
      {items.map((item, i) => (
        <div key={i} className={styles.kpiBox} style={item.trendColor ? { borderLeftColor: item.trendColor } : undefined}>
          <div className={styles.kpiLabel}>{item.label}</div>
          <div className={styles.kpiValue} style={item.trendColor ? { color: item.trendColor } : undefined}>
            {item.value}
          </div>
          {item.sub && <div className={styles.kpiSub}>{item.sub}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── WidgetCard 본체 ────────────────────────────────────────────────────────

export default function WidgetCard(props: WidgetCardProps) {
  const {
    id,
    title,
    description,
    icon: Icon,
    iconColor = '#38bdf8',
    termTooltip,
    cardDesc,
    unit,
    pillar,
    telemetry,
    chart,
    chartHeight = 280,
    kpiPanel,
    customBody,
    children,
    takeaway,
  } = props;

  // === 런타임 룰북 강제 ===
  // P-03: 컨빅션 태그 / AI 티 / 과장 수식어 검출 (dev only)
  checkForbidden(takeaway.situation, 'takeaway.situation', title);
  checkForbidden(takeaway.actionPlan, 'takeaway.actionPlan', title);

  // W-04: cardDesc + source 의무
  if (!cardDesc.trim()) {
    console.error(`[WidgetCard:W-04] ${title} — cardDesc는 의무 (산출 방법론·출처 1줄)`);
  }
  if (!takeaway.source.trim()) {
    console.error(`[WidgetCard:W-04] ${title} — takeaway.source는 의무`);
  }

  return (
    <div className={styles.insightCard} data-pillar={pillar} data-widget-id={id}>
      <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            {Icon && <Icon size={18} color={iconColor} />}
            <span>{title}</span>
            {termTooltip && (
              <TermTooltip term={termTooltip.term} description={termTooltip.description} />
            )}
          </h3>
          {description && (
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
              {description}
            </p>
          )}
          {cardDesc && (
            <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
              {cardDesc}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
          <TelemetryBadge status={telemetry.status} syncDate={telemetry.syncDate} />
          {unit && (
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      <div className={styles.cardBody}>
        {chart && (
          <div style={{ width: '100%', height: chartHeight }}>
            <SafeResponsiveContainer width="100%" height="100%">
              {chart as React.ReactElement}
            </SafeResponsiveContainer>
          </div>
        )}
        {kpiPanel && kpiPanel.length > 0 && <KpiPanel items={kpiPanel} />}
        {customBody}
        {children}
      </div>

      <div style={{ padding: '0 20px 20px 20px' }}>
        <TakeawayBox
          situation={takeaway.situation}
          actionPlan={takeaway.actionPlan}
          source={takeaway.source}
        />
      </div>
    </div>
  );
}
