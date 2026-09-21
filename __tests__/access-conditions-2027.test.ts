import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AccessConditions2027 } from '@/components/PnaAccessFeeWidgets';
import {
  accessConditions2027,
  pngShinlaOutlook2027,
  valatop2027,
  valatopTierOf,
  valatopTransferInUpgrade,
} from '@/lib/data/access-conditions-2027';

describe('2027어기 입어조건 변경', () => {
  it('회의자료의 변경만 옮기고 사람 이름은 남기지 않는다', () => {
    expect(accessConditions2027.source.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(accessConditions2027.source.meetingDate).toBe('2026-09-21');

    const png = accessConditions2027.changes.filter((row) => row.zone === '파푸아뉴기니');
    expect(png.map((row) => [row.y2026, row.y2027])).toEqual([
      ['1,325일', '989일'],
      ['2,209일', '1,694일'],
      ['최근 5개년 + 10% 가산', '최근 9개년, 가산 없음'],
    ]);
    // 솔로몬은 반대로 완화된다 - 한쪽만 싣지 않는다
    expect(accessConditions2027.changes.filter((row) => row.direction === 'ease')).toHaveLength(3);
    expect(accessConditions2027.changes.find((row) => row.item.startsWith('FSMA'))).toMatchObject({
      y2026: '$4,000/일',
      y2027: '$6,000/일',
      direction: 'tighten',
    });

    const text = JSON.stringify(accessConditions2027);
    expect(text).not.toMatch(/[가-힣]{2,3}\s*(과장|부장|차장|서기관|장관|청장|대리)/);
  });

  it('우리 몫 전망은 배정표 비중에서 파생한다', () => {
    const outlook = pngShinlaOutlook2027()!;

    // 2026 PNG 배정 1,325일 중 신라 361일 = 27.2%
    expect(outlook.days2026).toBe(361);
    expect(outlook.share).toBeCloseTo(361 / 1_325, 6);
    // 제안서 최초 할당 989일에 같은 비중을 적용하면 269일
    expect(outlook.days2027).toBe(269);
    expect(outlook.deltaDays).toBe(-92);
    expect(outlook.feeDelta).toBe(-92 * 10_500);
  });

  it('전배 4단계를 서한 그대로 싣고 구간을 파생한다', () => {
    expect(valatop2027.fixedAllocationDays).toBe(1_694);
    expect(valatop2027.startUpDays).toBe(989);
    expect(valatop2027.tiers.map((tier) => [tier.minDays, tier.maxDays])).toEqual([
      [1_694, null], [1_525, 1_693], [1_355, 1_524], [989, 1_354],
    ]);
    // 최초 할당(60%)만 받으면 PNG 로 끌어오는 전배가 막힌다 - 본문 표에는 이 사실이 없다
    expect(valatopTierOf(989)!.transferIn).toBe('불가');
    expect(valatopTierOf(1_355)!.transferIn).toBe('고정할당의 20%까지');
    expect(valatopTierOf(1_525)!.transferIn).toBe('무제한');
    expect(valatopTierOf(1_694)!.transferInFee).toBe('무료');
    // 2026 구매 1,325일은 그 해 고정할당 2,209일의 60% - 같은 규칙이라면 지금도 최초 할당 구간이다
    expect(valatopTierOf(1_325)!.label).toBe('최초 할당 (60%)');
    // 합작선은 협회와 별도 배정이다
    expect(valatop2027.jointVentures.map((jv) => [jv.fixedAllocationDays, jv.startUpDays]))
      .toEqual([[268, 161], [192, 115]]);
    // 서한의 수신·서명자 이름은 옮기지 않는다
    expect(JSON.stringify(valatop2027)).not.toMatch(/Baek|Ilakini|[가-힣]{2,3}\s*(회장|청장)/);
  });

  it('전배 IN 을 여는 데 드는 추가 비용을 파생한다', () => {
    const upgrade = valatopTransferInUpgrade();

    // 989일 → 1,355일: 366일 × $10,500
    expect(upgrade).toMatchObject({ fromDays: 989, toDays: 1_355, extraDays: 366, extraUsd: 3_843_000 });
    expect(upgrade.shinlaExtraDays).toBeNull();

    const share = pngShinlaOutlook2027()!.share;
    const mine = valatopTransferInUpgrade(share);
    expect(mine.shinlaExtraDays).toBe(Math.round(366 * share));
    expect(mine.shinlaExtraUsd).toBe(Math.round(366 * share) * 10_500);
  });

  it('VDS 탭이 2027 변경표를 렌더한다', () => {
    const markup = renderToStaticMarkup(React.createElement(AccessConditions2027));

    expect(markup).toContain('2027어기');
    expect(markup).toContain('989일');
    expect(markup).toContain('231일');
    expect(markup).toContain('$6,000/일');
    // 협상 전이라는 단서를 반드시 같이 낸다
    expect(markup).toContain('협상');

    const source = readFileSync(join(process.cwd(), 'components/PnaAccessFeeWidgets.tsx'), 'utf8');
    expect(source).toContain('<AccessConditions2027 />');
    // 전배 단계표와 상향 비용도 같은 카드에 있다
    expect(markup).toContain('전배');
    expect(markup).toContain('불가');
    expect(markup).toContain('1,355일');
    // 전망 수치를 손으로 적으면 배정표가 바뀔 때 어긋난다
    expect(source).not.toContain('269일');
  });
});
