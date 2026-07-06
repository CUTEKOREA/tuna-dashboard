'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Database,
  FileText,
  Globe2,
  LineChart,
  ShieldCheck,
  Wheat,
} from 'lucide-react';
import { getBniGlobalDashboard } from '../lib/data/bni-global';
import type { BniCommoditySignal, BniRiskLevel } from '../lib/data/bni-global';
import styles from './BniGlobalDashboard.module.css';

const data = getBniGlobalDashboard();

const ICONS: Record<string, React.ElementType> = {
  corn: Wheat,
  wheat: Wheat,
  soybean: Database,
  sugar: BarChart3,
  palm_oil: LineChart,
};

const riskTone: Record<BniRiskLevel, string> = {
  주의: 'caution',
  경계: 'warning',
  높음: 'danger',
};

const numberFormatter = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 1,
});

const compactFormatter = new Intl.NumberFormat('ko-KR', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatNumber(value: number | null | undefined, suffix = '') {
  if (value === null || value === undefined) return '-';
  return `${numberFormatter.format(value)}${suffix}`;
}

function formatCompact(value: number | null | undefined, suffix = '') {
  if (value === null || value === undefined) return '-';
  return `${compactFormatter.format(value)}${suffix}`;
}

function formatPct(value: number | null | undefined) {
  if (value === null || value === undefined) return '-';
  return `${value > 0 ? '+' : ''}${numberFormatter.format(value)}%`;
}

function formatPrice(commodity: BniCommoditySignal) {
  if (commodity.price.latestValue === null) return '-';
  return `${numberFormatter.format(commodity.price.latestValue)} ${commodity.price.unit}`;
}

function CommodityButton({
  commodity,
  active,
  onClick,
}: {
  commodity: BniCommoditySignal;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = ICONS[commodity.key] ?? Database;

  return (
    <button
      className={`${styles.commodityButton} ${active ? styles.activeCommodity : ''}`}
      onClick={onClick}
      type="button"
    >
      <Icon size={18} />
      <span>
        <strong>{commodity.name}</strong>
        <small>{commodity.stance}</small>
      </span>
      <b>{commodity.signalScore}</b>
    </button>
  );
}

function MetricBlock({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className={styles.metricBlock}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

export default function BniGlobalDashboard() {
  const [activeKey, setActiveKey] = React.useState(data.commodities[0]?.key ?? '');
  const activeCommodity = data.commodities.find((commodity) => commodity.key === activeKey) ?? data.commodities[0];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.brandMark}>
            <Globe2 size={24} />
          </div>
          <div>
            <p className={styles.eyebrow}>BNI GLOBAL MARKET INTELLIGENCE</p>
            <h1>거래처 정기 시장 브리핑</h1>
            <p className={styles.headerCopy}>
              설탕·곡물·유지류 정기 보고서를 가격, 수입, 교역 데이터와 연결한 고객 제공용 판단판입니다.
            </p>
          </div>
        </div>
        <div className={styles.syncPill}>
          <CalendarDays size={16} />
          <span>{data.latestReport.date}</span>
          <strong>{data.latestReport.file}</strong>
        </div>
      </header>

      <section className={styles.thesisBand}>
        <div>
          <span className={styles.sectionLabel}>이번 호 결론</span>
          <h2>{data.thesis.headline}</h2>
          <p>{data.thesis.body}</p>
        </div>
        <div className={styles.postureBox}>
          <span>권장 운용 톤</span>
          <strong>{data.thesis.posture}</strong>
        </div>
      </section>

      <section className={styles.kpiGrid} aria-label="BNI Global dashboard summary">
        {data.summaryKpis.map((kpi) => (
          <article className={styles.kpiCard} key={kpi.label}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <small>{kpi.note}</small>
          </article>
        ))}
      </section>

      <section className={styles.commodityWorkspace}>
        <section className={styles.commodityList}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionLabel}>상품별 브리핑</span>
            <h2>BNI 신호와 데이터 근거</h2>
          </div>
          <div className={styles.commodityButtons}>
            {data.commodities.map((commodity) => (
              <CommodityButton
                key={commodity.key}
                commodity={commodity}
                active={commodity.key === activeCommodity.key}
                onClick={() => setActiveKey(commodity.key)}
              />
            ))}
          </div>
        </section>

        <article className={styles.commodityDetail}>
          <div className={styles.detailHeader}>
            <div>
              <span className={styles.sectionLabel}>{activeCommodity.englishName}</span>
              <h2>{activeCommodity.name}</h2>
            </div>
            <div className={`${styles.riskBadge} ${styles[riskTone[activeCommodity.riskLevel]]}`}>
              {activeCommodity.riskLevel}
            </div>
          </div>

          <div className={styles.scoreRow}>
            <div>
              <span>종합 신호</span>
              <strong>{activeCommodity.signalScore}</strong>
            </div>
            <div className={styles.scoreTrack}>
              <i style={{ width: `${activeCommodity.signalScore}%` }} />
            </div>
          </div>

          <div className={styles.metricStrip}>
            <MetricBlock
              label="국제 가격"
              value={formatPrice(activeCommodity)}
              note={`${activeCommodity.price.latestDate} · ${formatPct(activeCommodity.price.monthChangePct)}`}
            />
            <MetricBlock
              label="한국 수입단가"
              value={formatNumber(activeCommodity.customs.unitUsdPerTon, ' USD/t')}
              note={`${activeCommodity.customs.latestMonth} · ${activeCommodity.customs.topCountry} ${formatPct(activeCommodity.customs.topCountrySharePct)}`}
            />
            <MetricBlock
              label="월 수입량"
              value={formatCompact(activeCommodity.customs.importTon, 't')}
              note={`${formatCompact(activeCommodity.customs.importUsd, '달러')} · KCS`}
            />
            <MetricBlock
              label="교역 커버리지"
              value={`${activeCommodity.comtrade.latestYear}년`}
              note={`${activeCommodity.comtrade.rows.toLocaleString('ko-KR')}행 · HS ${activeCommodity.hsCodes.length}개`}
            />
          </div>

          <div className={styles.narrativeGrid}>
            <div>
              <h3>BNI 동향</h3>
              <p>{activeCommodity.bniReview}</p>
            </div>
            <div>
              <h3>BNI 전망</h3>
              <p>{activeCommodity.bniOutlook}</p>
            </div>
            <div className={styles.customerMessage}>
              <h3>거래처 전달 문안</h3>
              <p>{activeCommodity.customerMessage}</p>
            </div>
          </div>
        </article>
      </section>

      <section className={styles.twoColumn}>
        <div className={styles.panel}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionLabel}>리스크 레이더</span>
            <h2>보고서 반복 변수</h2>
          </div>
          <div className={styles.riskList}>
            {data.riskRadar.map((risk) => (
              <article className={styles.riskItem} key={risk.factor}>
                <div className={styles.riskItemTop}>
                  <AlertTriangle size={17} />
                  <strong>{risk.factor}</strong>
                  <span className={`${styles.riskBadge} ${styles[riskTone[risk.level]]}`}>{risk.level}</span>
                </div>
                <p>{risk.evidence}</p>
                <div className={styles.affectedList}>
                  {risk.affected.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <small>{risk.action}</small>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionLabel}>보조 시장</span>
            <h2>유지류 확장 관찰</h2>
          </div>
          <div className={styles.supplementaryList}>
            {data.supplementaryMarkets.map((market) => (
              <article className={styles.supplementaryItem} key={market.name}>
                <div>
                  <span>{market.englishName}</span>
                  <strong>{market.name}</strong>
                </div>
                <p>{market.latestSignal}</p>
                <small>{market.watch}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.apiAndArchive}>
        <div className={styles.panel}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionLabel}>데이터 연결</span>
            <h2>활용 가능한 API와 파일</h2>
          </div>
          <div className={styles.coverageGrid}>
            {data.apiCoverage.map((coverage) => (
              <article className={styles.coverageItem} key={coverage.source}>
                <div>
                  <ShieldCheck size={16} />
                  <strong>{coverage.source}</strong>
                </div>
                <span>{coverage.status}</span>
                <p>{coverage.usage}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionLabel}>보고서 아카이브</span>
            <h2>BNI 정기 PDF {data.coverage.reportCount}건</h2>
          </div>
          <div className={styles.archiveList}>
            {data.reportArchive.slice().reverse().map((report) => (
              <article className={styles.archiveItem} key={report.file}>
                <FileText size={16} />
                <div>
                  <strong>{report.date}</strong>
                  <span>{report.file}</span>
                </div>
                <small>{report.pages ?? '-'}p</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.nextBuild}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionLabel}>다음 고도화</span>
          <h2>BNI 브리핑 자동화 후보</h2>
        </div>
        <div className={styles.nextList}>
          {data.nextBuild.map((item) => (
            <div className={styles.nextItem} key={item}>
              <ArrowUpRight size={16} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
