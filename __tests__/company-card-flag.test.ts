/**
 * 카드 뒷면 문양은 나라 단위다.
 *
 * 회사마다 다르게 두었더니 스페인이 로히괄다·이쿠리냐로, 이탈리아가 트리콜로레와
 * 그 축약형으로 갈려 일곱 장이 전부 다른 그림이 됐다. 나라를 못 읽는다는 지적을
 * 받고 나라당 한 벌로 묶었다. 회사가 늘 때 그 규칙이 다시 깨지는 것을 여기서 잡는다.
 */
import { describe, expect, it } from 'vitest';

import { COMPANY_CARDS } from '@/components/market-understanding/CompanyAnatomyDashboard';
import { countryOf } from '@/components/market-understanding/CompanyGallery';

describe('기업 해부 카드 뒷면', () => {
  it('같은 나라 카드는 문양과 잉크가 같다', () => {
    const byCountry = new Map<string, { flagCss: string; backInk: string }>();
    for (const c of COMPANY_CARDS) {
      const k = countryOf(c);
      const seen = byCountry.get(k);
      if (!seen) {
        byCountry.set(k, { flagCss: c.flagCss, backInk: c.backInk });
        continue;
      }
      expect(c.flagCss, `${k} - ${c.name} 문양이 같은 나라 다른 카드와 다르다`).toBe(seen.flagCss);
      expect(c.backInk, `${k} - ${c.name} 잉크가 같은 나라 다른 카드와 다르다`).toBe(seen.backInk);
    }
  });

  it('나라가 다르면 문양도 다르다', () => {
    const perCountry = new Map<string, string>();
    for (const c of COMPANY_CARDS) perCountry.set(countryOf(c), c.flagCss);
    const css = [...perCountry.values()];
    expect(new Set(css).size, '두 나라가 같은 문양을 쓰고 있다').toBe(css.length);
  });

  it('여덟 장이 여섯 나라에 들어간다', () => {
    expect(COMPANY_CARDS).toHaveLength(8);
    expect(new Set(COMPANY_CARDS.map(countryOf)).size).toBe(6);
  });
});
