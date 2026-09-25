'use client';

import React from 'react';
import HeroZone from './v2/HeroZone';
import { EmbeddedDashboardFrame } from './EmbeddedFrame';
import styles from './EmbeddedDashboardFrame.module.css';

// Static snapshot built in ~/my-project/kamis_ladder (build_v3.py → banana_v3.html). Not live data.
const KAMIS_OBSERVATORY_URL = '/reports/kamis_observatory.html';

export default function KamisObservatoryDashboard() {
  return (
    <div className={styles.dashboard}>
      <HeroZone
        variant="kpi"
        minHeight="auto"
        title="KAMIS 가격 사다리"
        subtitle="관세청 수입 원가(CIF) → KAMIS 도매가 → KAMIS 소매가를 kg당 원화로 이은 18개 품목의 가치사슬 관측소 · 2020.01~2026.08 월별 · 정적 스냅샷(STATIC, 2026-09-25 수집)"
      />
      <EmbeddedDashboardFrame
        src={KAMIS_OBSERVATORY_URL}
        title="KAMIS 가격 사다리"
        loadingLabel="KAMIS 가격 사다리 불러오는 중..."
        unavailableMessage="KAMIS 가격 사다리를 불러올 수 없습니다."
        externalLinkLabel="새 탭에서 열기"
      />
    </div>
  );
}
