import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ReeferMovement from '@/components/ReeferMovement';
import { reeferWeeklyReport } from '@/lib/data/reefer-weekly';

describe('ReeferMovement', () => {
  it('최신 TTA 주차와 검산된 방콕 배분 총량을 렌더한다', () => {
    const html = renderToStaticMarkup(createElement(ReeferMovement));
    const { source, rows } = reeferWeeklyReport;

    /* 주차·기간·척수·총량은 매주 바뀐다 - 값을 못박으면 매주 이 테스트를 고쳐야 한다.
     * 지킬 것은 «화면이 계약과 같은 주차를 말하는가» 다. */
    const total = rows.reduce((sum, row) => sum + Object.entries(row.deliveries)
      .reduce((inner, [key, value]) => (key === 'OTHER' || key === 'SHIP' || value === ''
        ? inner : inner + Number.parseFloat(value.replaceAll(',', ''))), 0), 0);
    expect(html).toContain(`${source.week}주차 주간 보고`);
    expect(html).toContain(`${source.startDate} ~ ${source.endDate.slice(5)}`);
    expect(html).toContain(`${rows.length}척 · 공장 배분 ${total.toLocaleString('en-US')} MT`);
    for (const row of rows) expect(html).toContain(row.carrier);

    /* deliveries.OTHER 는 하역처가 아니라 부두(REMARK)다 - 화면도 「부두」로 렌더한다. */
    expect(html).toContain('부두');
    const berths = rows.map((row) => row.deliveries.OTHER).filter(Boolean);
    for (const berth of berths) expect(html).toContain(berth);

  });

  it('운반선 카드 서술에 주차 수치를 손으로 박지 않는다', () => {
    /* 표는 새 주차인데 카드 설명·SIT·TAK·syncDate 가 지난 주차에 남는 사고가 실제로 났다
     * (2026-09-10: 표 36주차 / 카드 34주차 25,214.952MT·PATSORN).
     * 이 파일의 운반선 카드 문자열은 전부 계약에서 파생해야 한다. */
    const source = readFileSync(join(process.cwd(), 'components/LogisticsDashboard.tsx'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')   // 주석 안 예시 숫자는 대상이 아니다
      .replace(/\/\/.*$/gm, '');
    const hardcoded = source.match(/\d{1,2}주차\(|\d{1,3},\d{3}\.\d{3}MT|TTA 운반선 이동표 \d+주차/g) ?? [];
    expect(hardcoded).toEqual([]);
  });
});
