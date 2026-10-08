/**
 * 인테이크 로더가 만들어진 JSON 을 하나도 빠뜨리지 않는가.
 *
 * ⚠ 이 파일이 왜 있는지. `build_report_{tables,prose,figures}.py` 는 SPECS 에 편을 추가하면
 * JSON 을 만들어 주지만, 그 JSON 을 화면에 올리는 것은 `lib/data/company-report-*.ts` 의
 * **손으로 적은 import 세 줄**이다. Next.js 가 정적 import 를 요구해 런타임 glob 을 못 쓴다.
 *
 * 2026-09-05 에 이것이 실제로 터졌다 — Nauterra 편(Ⅹ)이 JSON 세 벌을 다 갖고 발행됐는데
 * 세 로더 어디에도 import 가 없어 **표·서술·그림이 통째로 비어 있었다.** 빌드도 테스트도
 * 통과했다. 「추출 0건」은 에러가 아니라 빈 배열이기 때문이다.
 *
 * 그래서 파일시스템을 정본으로 삼고 로더를 대조한다. 편을 추가하고 import 를 잊으면
 * 여기서 빨갛게 죽는다.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { REPORT_FIGURE_COMPANIES } from '@/lib/data/company-report-figures';
import { REPORT_PROSE_COMPANIES } from '@/lib/data/company-report-prose';
import { REPORT_TABLE_COMPANIES } from '@/lib/data/company-report-tables';

const DIR = join(process.cwd(), 'public/data/companies');

function onDisk(kind: 'tables' | 'prose' | 'figures'): string[] {
  return readdirSync(DIR)
    .map((f) => new RegExp(`^(.+)_${kind}_v1\\.json$`).exec(f)?.[1])
    .filter((k): k is string => Boolean(k))
    .sort();
}

describe('보고서 인테이크가 빠짐없이 로더에 걸려 있다', () => {
  it.each([
    ['tables', () => REPORT_TABLE_COMPANIES],
    ['prose', () => REPORT_PROSE_COMPANIES],
    ['figures', () => REPORT_FIGURE_COMPANIES],
  ] as const)('%s — 디스크의 JSON 이 전부 로더에 있다', (kind, loaded) => {
    const disk = onDisk(kind);
    expect(disk.length).toBeGreaterThan(0);
    // 로더에만 있는 키(죽은 import)도, 디스크에만 있는 키(누락)도 없어야 한다
    expect([...loaded()].sort()).toEqual(disk);
  });

  it('세 인테이크가 같은 편 집합을 본다', () => {
    // 표만 있고 서술이 없는 편이 생기면 화면 절반이 빈다
    const t = [...REPORT_TABLE_COMPANIES].sort();
    expect([...REPORT_PROSE_COMPANIES].sort()).toEqual(t);
    expect([...REPORT_FIGURE_COMPANIES].sort()).toEqual(t);
  });
});
