'use client';

import { BarChart3, TrendingUp } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  GMTS_MONTHLY_COMPANIES,
  getGmtsMonthly,
  type GmtsMonthlyCompany,
  type GmtsMonthlyFundsRecord,
  type GmtsMonthlyTrend,
} from '@/lib/data/gmts-monthly';
import { TelemetryBadge } from '../TelemetryBadge';
import WidgetCard from '../WidgetCard';
import styles from './GmtsDashboard.module.css';
import { C } from './palette';

const MONTHLY = getGmtsMonthly();
const LATEST = MONTHLY.reports[MONTHLY.reports.length - 1];

const MONTHLY_TELEMETRY = {
  status: MONTHLY.metadata.status,
  syncDate: MONTHLY.metadata.latestReportDate,
  label: '정적',
} as const;

const MONTHLY_SOURCE_RANGE = [
  'GMTS 월간보고',
  `${formatDisplayDate(MONTHLY.metadata.firstReportDate)}~${formatDisplayDate(MONTHLY.metadata.latestReportDate)}`,
  `${MONTHLY.metadata.reportCount}건`,
].join(' · ');

const KOREAN_MONTHS = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
] as const;

const FUND_ROWS: ReadonlyArray<{ key: keyof GmtsMonthlyFundsRecord; label: string; group: '자산' | '채무' | '잔액' }> = [
  { key: 'cash', label: '현금', group: '자산' },
  { key: 'deposit', label: '예금', group: '자산' },
  { key: 'receivable', label: '채권', group: '자산' },
  { key: 'assetSubtotal', label: '자산 소계', group: '자산' },
  { key: 'toSilla', label: '신라교역', group: '채무' },
  { key: 'toGmts', label: 'GMTS', group: '채무' },
  { key: 'toOthers', label: '기타업체', group: '채무' },
  { key: 'debtSubtotal', label: '채무 소계', group: '채무' },
  { key: 'netBalance', label: '채권잔액/채무잔액', group: '잔액' },
];

interface MonthlyChartSizeProps {
  width?: number;
  height?: number;
}

function formatDisplayDate(value: string): string {
  return value.replaceAll('-', '.');
}

function formatAmount(value: number | null): string {
  if (value === null) return '—';
  const text = Math.abs(value).toLocaleString('ko-KR');
  return value < 0 ? `(${text})` : text;
}

interface TrendPoint {
  month: string;
  current: number | null;
  prior: number | null;
}

function trendPoints(trend: GmtsMonthlyTrend): TrendPoint[] {
  const prior = trend.series['2025'] ?? [];
  const current = trend.series['2026'] ?? [];
  return KOREAN_MONTHS.map((month, index) => ({
    month,
    current: current[index] ?? null,
    prior: prior[index] ?? null,
  }));
}

const CATCH_POINTS = trendPoints(MONTHLY.catchTrend);
const PRICE_POINTS = trendPoints(MONTHLY.priceTrend);

function latestPoint(points: TrendPoint[]): { month: string; current: number; prior: number | null } | null {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    const { month, current, prior } = points[index];
    if (current !== null) return { month, current, prior };
  }
  return null;
}

function TrendTooltip({ active, label, payload }: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ name?: string | number; value?: number | string | ReadonlyArray<number | string> }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={styles.chartTooltip}>
      <strong>{label}</strong>
      <dl>
        {payload.map((entry) => (
          <div key={String(entry.name)}>
            <dt>{entry.name}</dt>
            <dd>{typeof entry.value === 'number' ? entry.value.toLocaleString('ko-KR') : '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function MonthlyCatchChart({ width, height }: MonthlyChartSizeProps) {
  return (
    <ComposedChart
      width={width}
      height={height}
      data={CATCH_POINTS}
      margin={{ top: 20, right: 18, left: 8, bottom: 12 }}
      role="img"
      aria-label="합작선 월별 어획량 2025·2026년 비교"
      accessibilityLayer
    >
      <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="month"
        tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
        axisLine={{ stroke: 'var(--chart-grid)' }}
        tickLine={false}
      />
      <YAxis
        width={56}
        tickFormatter={(value: number) => value.toLocaleString('ko-KR')}
        tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        label={{ value: 'M/T', angle: -90, position: 'insideLeft', fill: 'var(--chart-axis)' }}
      />
      <RechartsTooltip content={<TrendTooltip />} filterNull={false} isAnimationActive={false} />
      <Legend verticalAlign="top" height={34} />
      <Bar dataKey="current" name="2026년" fill={C.currentYear} radius={[4, 4, 0, 0]} isAnimationActive={false} />
      <Bar dataKey="prior" name="2025년" fill={C.priorYear} radius={[4, 4, 0, 0]} isAnimationActive={false} />
    </ComposedChart>
  );
}

export function GensanMonthlyPriceChart({ width, height }: MonthlyChartSizeProps) {
  return (
    <ComposedChart
      width={width}
      height={height}
      data={PRICE_POINTS}
      margin={{ top: 20, right: 18, left: 8, bottom: 12 }}
      role="img"
      aria-label="GENSAN 월별 어가 2025·2026년 비교"
      accessibilityLayer
    >
      <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="month"
        tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
        axisLine={{ stroke: 'var(--chart-grid)' }}
        tickLine={false}
      />
      <YAxis
        width={56}
        domain={['auto', 'auto']}
        tickFormatter={(value: number) => value.toLocaleString('ko-KR')}
        tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        label={{ value: 'USD/MT', angle: -90, position: 'insideLeft', fill: 'var(--chart-axis)' }}
      />
      <RechartsTooltip content={<TrendTooltip />} filterNull={false} isAnimationActive={false} />
      <Legend verticalAlign="top" height={34} />
      <Line dataKey="current" name="2026년" stroke={C.gsp} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
      <Line dataKey="prior" name="2025년" stroke={C.priorYear} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
    </ComposedChart>
  );
}

function ProfitTables() {
  return (
    <div className={styles.widgetGrid} data-gmts-monthly-profit>
      {GMTS_MONTHLY_COMPANIES.map((company) => {
        const values = LATEST.profit.companies[company];
        return (
          <div
            key={company}
            className={styles.tableScroll}
            role="region"
            aria-label={`${company} ${LATEST.profit.periodLabel} 표`}
            tabIndex={0}
          >
            <table className={`${styles.dataTable} ${styles.compactTable}`}>
              <caption>{company} · {LATEST.profit.periodLabel} (단위: $)</caption>
              <thead>
                <tr>
                  <th scope="col">계정</th>
                  <th scope="col">2025</th>
                  <th scope="col">2026</th>
                </tr>
              </thead>
              <tbody>
                {LATEST.profit.rows.map((row, index) => (
                  <tr key={row}>
                    <th scope="row">{row}</th>
                    <td>{formatAmount(values.y2025[index])}</td>
                    <td>{formatAmount(values.y2026[index])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

function FundsTable() {
  return (
    <div
      className={styles.tableScroll}
      role="region"
      aria-label={`${LATEST.funds.asOfLabel} 표`}
      tabIndex={0}
    >
      <table className={`${styles.dataTable} ${styles.compactTable}`}>
        <caption>{LATEST.funds.asOfLabel} (단위: $)</caption>
        <thead>
          <tr>
            <th scope="col">구분</th>
            <th scope="col">항목</th>
            {GMTS_MONTHLY_COMPANIES.map((company) => (
              <th key={company} scope="col">{company}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FUND_ROWS.map(({ key, label, group }, index) => {
            const groupStart = index === 0 || FUND_ROWS[index - 1].group !== group;
            const groupSize = FUND_ROWS.filter((row) => row.group === group).length;
            return (
              <tr key={key}>
                {groupStart ? <th scope="row" rowSpan={groupSize}>{group}</th> : null}
                <th scope="row">{label}</th>
                {GMTS_MONTHLY_COMPANIES.map((company) => (
                  <td key={company}>{formatAmount(LATEST.funds.companies[company][key])}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FundsNotes() {
  const entries = GMTS_MONTHLY_COMPANIES
    .map((company) => ({ company, note: LATEST.funds.notes[company] }))
    .filter((entry): entry is { company: GmtsMonthlyCompany; note: string } => Boolean(entry.note));
  if (entries.length === 0) return null;
  return (
    <div className={styles.qualityWarnings}>
      {entries.map(({ company, note }) => (
        <article key={company}>
          <span>비고</span>
          <strong>{company}</strong>
          <p>{note}</p>
        </article>
      ))}
    </div>
  );
}

function QualityFlagList() {
  if (MONTHLY.qualityFlags.length === 0) return null;
  return (
    <div className={styles.qualityWarnings}>
      {MONTHLY.qualityFlags.map((flag) => (
        <article key={flag.where} className={styles.capacityWarning}>
          <span>원문 확인 필요</span>
          <strong>{flag.where}</strong>
          <p>
            표기값 {formatAmount(flag.printed)}와 항목 합산 {formatAmount(flag.expected)}가 다릅니다.
            원문 표기값을 자동 정정하지 않았습니다.
          </p>
        </article>
      ))}
    </div>
  );
}

export function MonthlyPanel() {
  const latestCatch = latestPoint(CATCH_POINTS);
  const latestPrice = latestPoint(PRICE_POINTS);
  const catchSituation = latestCatch
    ? `2026년 ${latestCatch.month} 합작선 어획량은 ${formatAmount(latestCatch.current)} M/T이고, 전년 동월은 ${formatAmount(latestCatch.prior)} M/T입니다.`
    : '월간보고 어획량 시계열이 비어 있습니다.';
  const priceSituation = latestPrice
    ? `2026년 ${latestPrice.month} GENSAN 어가는 ${formatAmount(latestPrice.current)} USD/MT이고, 최신 보고 기재는 「${LATEST.priceNote}」입니다.`
    : '월간보고 어가 시계열이 비어 있습니다.';

  return (
    <div className={styles.panelStack}>
      <div className={styles.widgetGrid} data-gmts-widget-grid="monthly">
        <WidgetCard
          id="gmts-monthly-catch"
          title="합작선 월별 어획량"
          icon={BarChart3}
          iconColor={C.icon}
          pillar="S1"
          unit="(M/T)"
          cardDesc={`${MONTHLY.metadata.reportCount}건 GMTS 월간보고 차트의 2025·2026년 월별 어획량 비교`}
          telemetry={MONTHLY_TELEMETRY}
          chart={<MonthlyCatchChart />}
          chartHeight={330}
          takeaway={{
            situation: catchSituation,
            actionPlan: '다음 월간보고 수신 시 스냅샷을 재생성해 월별 추세를 이어서 봅니다.',
            source: MONTHLY_SOURCE_RANGE,
          }}
        />
        <WidgetCard
          id="gmts-monthly-price"
          title="GENSAN 어가 동향"
          icon={TrendingUp}
          iconColor={C.icon}
          pillar="S1"
          unit="(USD/MT)"
          cardDesc={`${MONTHLY.metadata.reportCount}건 GMTS 월간보고 차트의 2025·2026년 GENSAN 어가 비교`}
          telemetry={MONTHLY_TELEMETRY}
          chart={<GensanMonthlyPriceChart />}
          chartHeight={330}
          takeaway={{
            situation: priceSituation,
            actionPlan: '어가 급변 구간은 해당 월 월간보고 원문 기재와 대조해 확인합니다.',
            source: MONTHLY_SOURCE_RANGE,
          }}
        />
      </div>

      <section className={styles.qualitySection} aria-labelledby="gmts-monthly-profit-title">
        <header className={styles.sectionHeader}>
          <div>
            <span className={styles.eyebrow}>3사 손익</span>
            <h2 id="gmts-monthly-profit-title">{LATEST.profit.periodLabel}</h2>
            <p>{formatDisplayDate(LATEST.reportDate)} 월간보고 기재 원문 수치 (단위: $)</p>
          </div>
          <TelemetryBadge {...MONTHLY_TELEMETRY} />
        </header>
        <ProfitTables />
        <QualityFlagList />
      </section>

      <section className={styles.qualitySection} aria-labelledby="gmts-monthly-funds-title">
        <header className={styles.sectionHeader}>
          <div>
            <span className={styles.eyebrow}>자금 현황</span>
            <h2 id="gmts-monthly-funds-title">{LATEST.funds.asOfLabel}</h2>
            <p>{formatDisplayDate(LATEST.reportDate)} 월간보고 기재 원문 수치 (단위: $)</p>
          </div>
        </header>
        <FundsTable />
        <FundsNotes />
      </section>

      <section className={styles.qualitySection} aria-labelledby="gmts-monthly-briefing-title">
        <header className={styles.sectionHeader}>
          <div>
            <span className={styles.eyebrow}>업무 보고</span>
            <h2 id="gmts-monthly-briefing-title">월별 업무 및 동향</h2>
          </div>
        </header>
        <div className={styles.qualityWarnings}>
          {[...MONTHLY.reports].reverse().map((report) => (
            <article key={report.reportDate}>
              <span>{report.reportMonth}월 보고</span>
              <strong>{formatDisplayDate(report.reportDate)}</strong>
              {report.briefing.map((line) => <p key={line}>{line}</p>)}
              {report.briefingFootnotes.map((line) => <small key={line}>{line}</small>)}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.archiveSection} aria-labelledby="gmts-monthly-archive-title">
        <header className={styles.sectionHeader}>
          <div>
            <span className={styles.eyebrow}>출처 매니페스트</span>
            <h2 id="gmts-monthly-archive-title">월간보고 원문 아카이브</h2>
            <p>
              {MONTHLY.metadata.reportCount}건 ·{' '}
              {formatDisplayDate(MONTHLY.metadata.firstReportDate)}~{formatDisplayDate(MONTHLY.metadata.latestReportDate)}
            </p>
          </div>
        </header>
        <div
          className={styles.tableScroll}
          role="region"
          aria-label={`GMTS 월간보고 원문 ${MONTHLY.metadata.reportCount}건 목록`}
          tabIndex={0}
        >
          <table className={`${styles.dataTable} ${styles.archiveTable}`}>
            <caption>보고일·파일명·해시 앞 12자리</caption>
            <thead>
              <tr>
                <th scope="col">보고일</th>
                <th scope="col">원문 파일명</th>
                <th scope="col">해시 앞 12자리</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY.sources.map((source) => (
                <tr key={source.sha256} data-source-report={source.reportDate}>
                  <th scope="row">{formatDisplayDate(source.reportDate)}</th>
                  <td>{source.fileName}</td>
                  <td><code>{source.sha256.slice(0, 12)}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
