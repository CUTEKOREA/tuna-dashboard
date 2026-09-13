/**
 * 「시장 이해 > 참치 양식」.
 *
 * 골격은 `CommodityIndustryDashboard` 가 갖고 있다. 여기는 히어로 수치와
 * **발행본에서 옮긴 표·콜아웃 배치**를 정한다.
 *
 * 표는 손으로 옮기지 않는다. 발행본 HTML 에서 추출한 JSON(`lib/data/tunafarm-industry.ts`)을
 * 장 단위로 읽어 그대로 낸다 — 표 46개·콜아웃 19개다. 처음엔 서술만 옮겼는데
 * 사용자가 「보고서와 차이가 크다」고 지적했다. 옳은 지적이었다.
 *
 * ⚠ 히어로 주수치는 **FAO 2024 세계 양식 생산량**이다. 다만 이것은 세계 전수가 아니라
 *   **보고한 나라들의 합**이다 — 2024년 결측이 10항목이고 2015년 5개에서 늘었다.
 * ⚠ 인가 입식 상한(75,199.84 t)과 동부 총허용어획량(48,403 t)은 **층이 다르다**.
 * ⚠ 표의 숫자를 다시 계산하지 않는다. 발행본이 정본이고, 그 값들은 적대 검증
 *   세 축의 P0 아홉을 반영한 뒤의 값이다.
 */
'use client';

import React from 'react';

import {
  getTunafarmChapter,
  type TunafarmCallout,
  type TunafarmTable,
} from '@/lib/data/tunafarm-industry';
import {
  TUNAFARM_BRIEFING_POINTS,
  TUNAFARM_CHAPTER_BY_STAGE,
  TUNAFARM_NARRATIVES,
  TUNAFARM_SOURCE_NOTES,
} from '@/lib/tunafarm-industry-content';
import styles from './TunaIndustryDashboard.module.css';
import CommodityIndustryDashboard, {
  type ChartSlot,
  type CommoditySpec,
} from './CommodityIndustryDashboard';

/** 축양 페이지 강조색. 지중해 가두리의 남색 계열. */
const TUNAFARM_ACCENT = '#2f6f8f';

const REPORT_SYNC = { status: 'STATIC' as const, syncDate: '세계 참치 양식 조사 제1보 2026-09-13' };

/** 숫자·단위만 든 칸은 오른쪽으로 붙인다. 한글이 섞이면 왼쪽. */
const NUMERIC = /^[\d,.\s%+\-~·()t€$/]*$/;

function ReportTable({ table }: { table: TunafarmTable }) {
  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <thead>
          <tr>
            {table.cols.map((c, i) => (
              <th key={`${c}-${i}`} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} style={row.emph ? { fontWeight: 500 } : undefined}>
              {row.cells.map((cell, j) => (
                <td key={j} className={j > 0 && NUMERIC.test(cell) ? styles.factNum : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportCallout({ callout }: { callout: TunafarmCallout }) {
  const border =
    callout.kind === 'warn' ? '#c2410c' : callout.kind === 'good' ? '#15803d' : '#509ee3';
  return (
    <div
      style={{
        borderLeft: `3px solid ${border}`,
        background: 'rgba(80,158,227,0.05)',
        padding: '0.85rem 1.1rem',
        margin: '0 0 0.9rem',
        borderRadius: '0 4px 4px 0',
      }}
    >
      <div
        style={{
          fontSize: '0.72rem',
          letterSpacing: '0.08em',
          color: border,
          fontWeight: 600,
          marginBottom: '0.35rem',
        }}
      >
        {callout.head}
      </div>
      <div style={{ fontSize: '0.86rem', lineHeight: 1.75, color: '#3f4657' }}>{callout.body}</div>
    </div>
  );
}

/**
 * 단계별 표·콜아웃 슬롯.
 *
 * 발행본의 장 하나가 단계 하나에 대응한다. 표는 발행본 순서를 지키고,
 * 그 장의 콜아웃은 표 뒤에 한 덩어리로 붙인다 — 발행본에서는 표 사이에
 * 섞여 있지만 골격이 그 자리를 주지 않으므로 장 끝에 모은다.
 */
const CHART_SLOTS: Record<string, ChartSlot[]> = (() => {
  const out: Record<string, ChartSlot[]> = {};
  for (const n of TUNAFARM_NARRATIVES) {
    const chapterName = TUNAFARM_CHAPTER_BY_STAGE[n.key];
    if (!chapterName) continue;
    const chapter = getTunafarmChapter(chapterName);
    const slots: ChartSlot[] = chapter.tables.map((t, i) => ({
      title: `${chapterName} 표 ${i + 1} — ${t.title}`,
      caption: t.caption,
      telemetry: REPORT_SYNC,
      span: 'full' as const,
      render: () => <ReportTable table={t} />,
    }));
    if (chapter.callouts.length > 0) {
      slots.push({
        title: `${chapterName} — 읽는 법`,
        caption:
          '발행본의 경고·확정 상자를 장 끝에 모았다. 어느 숫자를 어떻게 읽으면 안 되는지가 여기 있다.',
        telemetry: REPORT_SYNC,
        span: 'full' as const,
        render: () => (
          <div>
            {chapter.callouts.map((c, i) => (
              <ReportCallout key={i} callout={c} />
            ))}
          </div>
        ),
      });
    }
    if (slots.length > 0) out[n.key] = slots;
  }
  return out;
})();

const SPEC: CommoditySpec = {
  // 단계를 탭으로 넘기지 않고 한 페이지에 전부 출력한다(2026-09-10 사용자 지시).
  continuous: true,
  key: 'tunafarm',
  title: '참치 양식',
  subtitle:
    '세계 참치 축양 해부 · 넣은 무게와 판 무게를 다른 기관이 센다 - 경계·층·명부·통계·값·원가·기업·한국·축양사',
  accent: TUNAFARM_ACCENT,
  primaryKpi: {
    label: '2024 세계 양식 생산 (보고한 나라 합)',
    value: 68443,
    unit: '(톤)',
    accent: TUNAFARM_ACCENT,
  },
  secondaryKpis: [
    { label: '2024 산지 출하 단가', value: 13.52, unit: '(달러/kg)', decimals: 2 },
    { label: '일본 인공종묘 유래 출하 2024', value: 405, unit: '(톤)' },
    { label: '2025 한국 참다랑어 수입', value: 7168.3, unit: '(톤)', decimals: 1 },
  ],
  stripItems: [
    { eyebrow: '기준', title: '거의 전부가 축양이다', body: '야생 개체를 잡아 가두리에서 살찌운다' },
    { eyebrow: '명부', title: '인가 양식장', body: '대서양 74곳 · 남방 농장 8곳(허가 10건)' },
    { eyebrow: '상한', title: '연간 야생 입식 상한', body: '75,199.84 t — 총허용어획량과 다른 층' },
    { eyebrow: '원가', title: '종묘 대 사료', body: '1.85배 — 사료가 아니라 종묘다' },
    { eyebrow: '한국', title: '일본 경유 대서양참다랑어', body: '987 / 1,207건 (81.8%)' },
    { now: true, eyebrow: '지금', title: '명부 조회가 고장나 있다', body: '결과 페이지 HTTP 500 (2026-09-13)' },
  ],
  briefing: TUNAFARM_BRIEFING_POINTS,
  narratives: TUNAFARM_NARRATIVES,
  chartSlots: CHART_SLOTS,
  sourceNotes: TUNAFARM_SOURCE_NOTES,
  sourceMeta: [
    '세계 참치 양식 조사 제1보 2026-09-13',
    'FAO FishStat 2026.1.0',
    'ICCAT 명부 2023-09-22 보존본',
    'CCSBT 명부 2026-09-13',
    '일본 수산청 2026-02',
    '식약처 원장 2026-09-11',
    '관세청 2026-09',
  ].join(' · '),
};

export const TUNAFARM_CHART_SLOTS = CHART_SLOTS;

export interface TunafarmIndustryDashboardProps {
  heroOnly?: boolean;
}

export default function TunafarmIndustryDashboard({ heroOnly = false }: TunafarmIndustryDashboardProps) {
  return <CommodityIndustryDashboard spec={SPEC} heroOnly={heroOnly} />;
}
