export const MAX_SELECT_ALL_TRASH = 20;
export const MAX_BULK_TRASH_SELECTION = 50;
export const BULK_TRASH_CONCURRENCY = 3;
const GMAIL_RESOURCE_ID = /^[A-Za-z0-9_-]+$/;
const REQUEST_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type BulkTrashInputItem = {
  messageId: string;
  requestId: string;
};

export function parseBulkTrashInput(value: unknown): BulkTrashInputItem[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('잘못된 batch 입력입니다');
  }
  const input = value as Record<string, unknown>;
  if (Object.keys(input).length !== 1 || !Array.isArray(input.items)) {
    throw new Error('잘못된 batch 입력입니다');
  }
  if (input.items.length < 1 || input.items.length > MAX_BULK_TRASH_SELECTION) {
    throw new Error('휴지통 이동은 1~50건이어야 합니다');
  }

  const messageIds = new Set<string>();
  const requestIds = new Set<string>();
  const items = input.items.map((item): BulkTrashInputItem => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error('잘못된 batch 입력입니다');
    }
    const row = item as Record<string, unknown>;
    if (Object.keys(row).length !== 2 || typeof row.messageId !== 'string'
      || row.messageId.length > 256 || typeof row.requestId !== 'string' || !GMAIL_RESOURCE_ID.test(row.messageId)
      || !REQUEST_ID_PATTERN.test(row.requestId)) {
      throw new Error('잘못된 batch 입력입니다');
    }
    if (messageIds.has(row.messageId) || requestIds.has(row.requestId)) {
      throw new Error('중복된 batch 입력입니다');
    }
    messageIds.add(row.messageId);
    requestIds.add(row.requestId);
    return { messageId: row.messageId, requestId: row.requestId };
  });
  return items;
}

function uniqueIds(messageIds: readonly string[]): string[] {
  return Array.from(new Set(messageIds.filter((messageId) => messageId.length > 0)));
}

export function selectAllTrashIds(messageIds: readonly string[]): string[] {
  return uniqueIds(messageIds).slice(0, MAX_SELECT_ALL_TRASH);
}

export function toggleTrashSelection(
  selectedIds: readonly string[],
  messageId: string,
): { selected: string[]; limitReached: boolean } {
  const selected = uniqueIds(selectedIds);
  if (selected.includes(messageId)) {
    return {
      selected: selected.filter((selectedId) => selectedId !== messageId),
      limitReached: false,
    };
  }
  if (selected.length >= MAX_BULK_TRASH_SELECTION) {
    return { selected, limitReached: true };
  }
  return { selected: [...selected, messageId], limitReached: false };
}

export async function mapWithConcurrency<Input, Output>(
  items: readonly Input[],
  concurrency: number,
  task: (item: Input, index: number) => Promise<Output>,
): Promise<Output[]> {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error('동시 처리 수는 1 이상의 정수여야 합니다');
  }
  if (items.length > MAX_BULK_TRASH_SELECTION) {
    throw new Error('휴지통 이동은 한 번에 최대 50건까지 가능합니다');
  }

  const results = new Array<Output>(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(concurrency, items.length);
  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await task(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}
