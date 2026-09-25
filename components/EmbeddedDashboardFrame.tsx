'use client';

import React from 'react';
import { bangkokWeeklyKpi } from '@/lib/data/bangkok-weekly';
import HeroZone from './v2/HeroZone';
import { EmbeddedDashboardFrame } from './EmbeddedFrame';
import styles from './EmbeddedDashboardFrame.module.css';

export { EmbeddedDashboardFrameView } from './EmbeddedFrame';
export type { EmbeddedDashboardFrameViewProps } from './EmbeddedFrame';

const BANGKOK_REPORT_URL = '/reports/bangkok_weekly_2020_2026.html';

export function BangkokOfficeDashboard() {
  return (
    <div className={styles.dashboard}>
      <HeroZone
        variant="kpi"
        title="방콕사무소 주간보고"
        subtitle={`분석 기간 ${bangkokWeeklyKpi.period} · 고유 ${bangkokWeeklyKpi.weeks}주`}
        primaryKpi={{
          label: '최신 시세',
          value: bangkokWeeklyKpi.latestPrice,
          unit: '($/MT)',
        }}
        secondaryKpis={[
          { label: '방콕 재고', value: bangkokWeeklyKpi.stockMt, unit: '(MT)' },
          { label: '2026 누적 하역', value: bangkokWeeklyKpi.cumUnloadMt, unit: '(MT)' },
          { label: '가공가능일수', value: bangkokWeeklyKpi.processDays, unit: '(일)' },
          { label: '하이솔트 확정액', value: bangkokWeeklyKpi.highSaltUsd, unit: '(USD)' },
        ]}
      />
      <EmbeddedDashboardFrame
        src={BANGKOK_REPORT_URL}
        title="방콕사무소 주간보고"
        loadingLabel="방콕사무소 주간보고 불러오는 중..."
        unavailableMessage="방콕사무소 주간보고를 불러올 수 없습니다."
        externalLinkLabel="새 탭에서 열기"
      />
    </div>
  );
}
