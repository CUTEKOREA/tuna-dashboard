import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * P3-8 리니지 가드 — scripts/widget_lineage.py 가 항상 돌 수 있고(파싱 실패 없음),
 * 산출 그래프가 무의미하게 쪼그라들지 않았음을 지킨다.
 * 산출물 자체(docs/lineage/*)는 커밋 스냅샷 — 재생성 명령은 문서 머리에 있다.
 */
describe('widget lineage (P3-8)', () => {
  it('generates the lineage graph without errors and with sane coverage', () => {
    const out = execFileSync('python3', ['scripts/widget_lineage.py'], {
      cwd: process.cwd(),
      encoding: 'utf-8',
    });
    expect(out).toContain('widgets');

    const payload = JSON.parse(
      readFileSync(join(process.cwd(), 'docs/lineage/widget-lineage.json'), 'utf-8'),
    ) as {
      _meta: { widgets: number; dataFiles: number; files: number };
      widgetToData: Record<string, { dataFiles: string[] }>;
      dataToWidgets: Record<string, string[]>;
    };

    // 그래프가 텅 비면(진입점·resolve 파손) 조용히 통과하지 못하게 하한을 박는다
    expect(payload._meta.widgets).toBeGreaterThanOrEqual(50);
    expect(payload._meta.dataFiles).toBeGreaterThanOrEqual(20);

    // 역인덱스의 모든 데이터 파일은 실제로 존재해야 한다 (깨진 참조 = 파손)
    for (const dataFile of Object.keys(payload.dataToWidgets)) {
      expect(existsSync(join(process.cwd(), dataFile)), `${dataFile} 실재`).toBe(true);
    }

    // 대표 사슬 하나를 고정 — 뉴스 위젯은 브리핑 JSON을 본다 (r5-A 채택 구조)
    expect(payload.dataToWidgets['public/data/tuna_daily_briefing.json'])
      .toContain('components/NewsFrontPage.tsx');
  });
});
