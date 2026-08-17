/**
 * 조종석 모드 전용 보조 지표 (2026-08-17 스펙 cockpit-mode-design §3 — 2단계).
 *
 * 1단계는 같은 정보를 압축하는 것이었다. 2단계는 **차트가 이미 쓰고 있는 데이터에서**
 * 화면에 안 나온 수치를 꺼내 보여준다.
 *
 * ⚠ 규율 하나. **새 사실을 만들지 않는다.** 여기 나오는 값은 전부 그 차트가 받은 배열에서
 *   직접 세거나 고른 것이다. 다른 출처를 끌어오거나 비율·증감률을 새로 계산하지 않는다 —
 *   그 순간 화면에 «검증되지 않은 수치»가 생기고, 보조 지표라 아무도 검수하지 않는다.
 *
 * 노출은 **CSS 계층으로만** 한다. `data-density='cockpit'` 이 아니면 `display:none` 이라
 * JS 분기도, 하이드레이션 불일치도 없다. 스펙 §2의 「컴포넌트 분기 금지」를 그대로 따른다.
 */
import React from 'react';

/** 조종석 모드에서만 보이는 껍데기. 기본 모드에서는 CSS 가 통째로 숨긴다. */
export function CockpitOnly({ children }: { children: React.ReactNode }) {
  return (
    <div className="cockpit-only" data-cockpit-extra>
      {children}
    </div>
  );
}

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function fmt(v: number): string {
  return Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('ko-KR') : `${v}`;
}

export interface SeriesStatsProps<T> {
  /** 차트가 받은 그 배열. 다른 데이터를 넣지 마라 — 화면과 어긋난다. */
  rows: readonly T[];
  /** 항목 이름 칸 (국가·연도·종 등). 없는 키를 적으면 컴파일에서 걸린다. */
  labelKey: keyof T & string;
  /** 값 칸. 실제로 「생산량」이 아니라 「합계」인 자료가 있어 타입으로 못 박는다. */
  valueKey: keyof T & string;
  /** 단위. 괄호까지 포함해 적는다 — `(톤)`, `($/kg)` */
  unit: string;
  /** 차트가 실제로 그린 개수. 전체보다 적으면 «몇 개가 잘렸는지»가 정보가 된다. */
  shown?: number;
  /** 합계가 뜻을 갖는 계열에서만 켠다. 비율·단가 계열에서는 켜면 안 된다. */
  sum?: boolean;
}

/**
 * 계열 요약 한 줄. 차트가 보여주지 않는 것 — 표본이 몇 개인지, 몇 개가 잘렸는지,
 * 양 끝이 무엇인지 — 만 싣는다.
 */
export function SeriesStats<T extends object>({
  rows,
  labelKey,
  valueKey,
  unit,
  shown,
  sum = false,
}: SeriesStatsProps<T>) {
  const pairs = rows
    .map((r) => ({
      label: String((r as Record<string, unknown>)[labelKey] ?? ''),
      value: num((r as Record<string, unknown>)[valueKey]),
    }))
    .filter((p): p is { label: string; value: number } => p.value !== null);

  if (pairs.length === 0) return null;

  const max = pairs.reduce((a, b) => (b.value > a.value ? b : a));
  const min = pairs.reduce((a, b) => (b.value < a.value ? b : a));
  const hidden = shown !== undefined ? Math.max(0, pairs.length - shown) : 0;

  const items: [string, string][] = [
    ['표본', `${pairs.length}개`],
    ['최대', `${max.label} ${fmt(max.value)}`],
    ['최소', `${min.label} ${fmt(min.value)}`],
  ];
  if (sum) {
    items.push(['합계', fmt(pairs.reduce((n, p) => n + p.value, 0))]);
  }
  if (hidden > 0) {
    // 잘린 것이 있다는 사실 자체가 정보다. 그래프만 보면 상위 몇 개가 전부인 줄 안다.
    items.push(['차트에 없음', `${hidden}개`]);
  }

  return (
    <CockpitOnly>
      <dl className="cockpit-stats">
        {items.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        <div>
          <dt>단위</dt>
          <dd>{unit}</dd>
        </div>
      </dl>
    </CockpitOnly>
  );
}
