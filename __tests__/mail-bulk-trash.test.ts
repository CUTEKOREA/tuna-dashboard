import { describe, expect, it } from 'vitest';
import {
  MAX_BULK_TRASH_SELECTION,
  MAX_SELECT_ALL_TRASH,
  mapWithConcurrency,
  parseBulkTrashInput,
  selectAllTrashIds,
  toggleTrashSelection,
} from '../lib/mail/bulk-trash';

describe('Gmail 선택 휴지통 이동', () => {
  it('전체 선택은 화면 순서의 고유 메일 최대 20건만 선택한다', () => {
    const ids = Array.from({ length: 50 }, (_, index) => `message-${index + 1}`);

    expect(MAX_SELECT_ALL_TRASH).toBe(20);
    expect(selectAllTrashIds([...ids, ids[0]])).toEqual(ids.slice(0, 20));
  });

  it('개별 선택은 고유 메일 최대 50건까지 허용하고 51번째를 거부한다', () => {
    let selected: string[] = [];
    for (let index = 1; index <= MAX_BULK_TRASH_SELECTION; index += 1) {
      const result = toggleTrashSelection(selected, `message-${index}`);
      expect(result.limitReached).toBe(false);
      selected = result.selected;
    }

    const overflow = toggleTrashSelection(selected, 'message-51');
    expect(MAX_BULK_TRASH_SELECTION).toBe(50);
    expect(overflow).toEqual({ selected, limitReached: true });
    expect(toggleTrashSelection(selected, 'message-1')).toEqual({
      selected: selected.slice(1),
      limitReached: false,
    });
  });

  it('메일 작업은 지정 동시성 이하로 실행하고 입력 순서의 결과를 보존한다', async () => {
    let active = 0;
    let peak = 0;
    const results = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, value % 2 === 0 ? 2 : 1));
      active -= 1;
      return value * 10;
    });

    expect(peak).toBeLessThanOrEqual(2);
    expect(results).toEqual([10, 20, 30, 40, 50]);
  });

  it('비정상 동시성과 50건 초과 입력을 거부한다', async () => {
    await expect(mapWithConcurrency([1], 0, async (value) => value)).rejects.toThrow('동시 처리 수');
    await expect(mapWithConcurrency(
      Array.from({ length: 51 }, (_, index) => index),
      3,
      async (value) => value,
    )).rejects.toThrow('최대 50건');
  });

  it('batch 입력은 고유 Gmail ID·UUID 1~50건과 items 단일 키만 허용한다', () => {
    const valid = {
      items: [
        { messageId: 'gmail_id-1', requestId: '11111111-1111-4111-8111-111111111111' },
        { messageId: 'gmail_id-2', requestId: '22222222-2222-4222-8222-222222222222' },
      ],
    };
    expect(parseBulkTrashInput(valid)).toEqual(valid.items);
    expect(() => parseBulkTrashInput({ ...valid, extra: true })).toThrow('입력');
    expect(() => parseBulkTrashInput({
      items: [{ messageId: 'a'.repeat(257), requestId: valid.items[0].requestId }],
    })).toThrow('입력');
    expect(() => parseBulkTrashInput({ items: [valid.items[0], valid.items[0]] })).toThrow('중복');
    expect(() => parseBulkTrashInput({
      items: [valid.items[0], { messageId: 'gmail_id-2', requestId: valid.items[0].requestId }],
    })).toThrow('중복');
    expect(() => parseBulkTrashInput({ items: [] })).toThrow('1~50건');
    expect(() => parseBulkTrashInput({
      items: Array.from({ length: 51 }, (_, index) => ({
        messageId: `gmail-${index}`,
        requestId: `${String(index).padStart(8, '0')}-1111-4111-8111-111111111111`,
      })),
    })).toThrow('1~50건');
  });
});
