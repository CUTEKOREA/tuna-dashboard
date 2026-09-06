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
    const byCountry = new Map<string, { flagSrc: string; backInk: string }>();
    for (const c of COMPANY_CARDS) {
      const k = countryOf(c);
      const seen = byCountry.get(k);
      if (!seen) {
        byCountry.set(k, { flagSrc: c.flagSrc, backInk: c.backInk });
        continue;
      }
      expect(c.flagSrc, `${k} - ${c.name} 문양이 같은 나라 다른 카드와 다르다`).toBe(seen.flagSrc);
      expect(c.backInk, `${k} - ${c.name} 잉크가 같은 나라 다른 카드와 다르다`).toBe(seen.backInk);
    }
  });

  it('나라가 다르면 문양도 다르다', () => {
    const perCountry = new Map<string, string>();
    for (const c of COMPANY_CARDS) perCountry.set(countryOf(c), c.flagSrc);
    const css = [...perCountry.values()];
    expect(new Set(css).size, '두 나라가 같은 문양을 쓰고 있다').toBe(css.length);
  });

  it('카드마다 나라가 읽히고 문양이 붙어 있다', () => {
    // ⚠ 장수를 리터럴로 적지 마라. 9 로 박아 뒀더니 열 번째 편이 붙었을 때
    // 「카드가 깨졌다」가 아니라 「테스트가 낡았다」로 빌드가 멈췄다.
    // 세어야 할 것은 장수가 아니라 **한 장도 빠짐없이 나라와 문양을 갖는가**다.
    expect(COMPANY_CARDS.length).toBeGreaterThanOrEqual(9);
    for (const c of COMPANY_CARDS) {
      expect(countryOf(c), `${c.name} 나라를 못 읽는다`).toBeTruthy();
      expect(c.flagSrc, `${c.name} 문양이 없다`).toBeTruthy();
      expect(c.backInk, `${c.name} 잉크가 없다`).toBeTruthy();
    }
    // 로마숫자는 수록순이라 중복되면 안 된다.
    const numerals = COMPANY_CARDS.map((c) => c.numeral);
    expect(new Set(numerals).size, `로마숫자 중복: ${numerals.join(' ')}`).toBe(numerals.length);
    // 나라 수는 카드 수보다 적다 — 스페인처럼 여러 장인 나라가 있다.
    expect(new Set(COMPANY_CARDS.map(countryOf)).size).toBeLessThan(COMPANY_CARDS.length);
  });
});
