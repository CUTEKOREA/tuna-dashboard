'use client';

/**
 * 국내 산업 — 위젯 9개. 통합보고서(8_한국_오징어_산업_해부)의 수치를 scripts/squid_overlay_report.py 가 얹는다.
 *
 * squid-report-sync 소유 파일. 다른 섹션 파일과 공용 컴포넌트는 건드리지 않는다.
 *
 * 차트를 붙이는 방법: 아래 RENDERERS 에 위젯 id 를 키로 본문을 반환하는 함수를 추가한다.
 * 등록하지 않은 위젯은 GenericWidgetBody(표) 로 그려지므로 화면이 비는 구간이 없다.
 */

import React from 'react';
import SquidSection from './SquidSection';
import type { SquidSource, SquidV5, SquidWidget } from './types';

const RENDERERS: Record<
  string,
  (widget: SquidWidget, sources: SquidSource[]) => React.ReactNode
> = {
  // 예) A_chile_jibia_quota: (w) => <QuotaGauge data={w.data} />,
};

export const SectionF: React.FC<{ doc: SquidV5 }> = ({ doc }) => (
  <SquidSection
    section="F"
    doc={doc}
    render={(id, w, sources) => RENDERERS[id]?.(w, sources)}
  />
);

export default SectionF;
