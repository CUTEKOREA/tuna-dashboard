import { describe, expect, it } from 'vitest';
import { squidValueLabel } from '../components/squid/localization';
import { getSquidV5 } from '../lib/data/squid-v5';

/**
 * 식별자는 사용자가 출처 원장·측정 게이트 표와 맞춰 보는 코드다. 한글화 계층이
 * 이걸 번역하면 대조가 끊긴다. 실제로 `G-006` 이 `그램-006`(단위 그램)으로,
 * `SQ-PROD-FAO-FISHSTAT` 가 `SQ-PROD-유엔식량농업기구-FISHSTAT` 로 나갔다.
 */
describe('식별자 무결성', () => {
  it('게이트 번호·출처 코드·HS 코드는 번역하지 않는다', () => {
    const doc = getSquidV5();
    const ids = new Set<string>();
    doc.gates.forEach((g) => ids.add(g.gate_id));
    doc.sources.forEach((s) => ids.add(s.source_id));
    Object.values(doc.widgets).forEach((w) =>
      (w.basis.restrictions ?? []).forEach((r) => { if (/^G-\d{3}$/.test(r)) ids.add(r); }),
    );
    const rows = doc.widgets['C_hs_classification_map']?.data;
    if (Array.isArray(rows)) rows.forEach((r: any) => ids.add(String(r.hs6)));

    const broken = [...ids].filter((id) => squidValueLabel(id) !== id);
    expect(broken).toEqual([]);
  });

  it('그램 단위는 숫자 뒤에서만 변환한다', () => {
    expect(squidValueLabel('100-300 g/pc')).toContain('그램');
    // 산문 안의 게이트 번호는 '측정 기준 004번' 으로 옮기는 별도 규칙이 있다.
    // 그건 그대로 두되, G 가 단위 그램으로 둔갑하지만 않으면 된다.
    expect(squidValueLabel('G-004 적용')).not.toContain('그램');
    expect(squidValueLabel('G-004 적용')).toContain('004');
  });
});
