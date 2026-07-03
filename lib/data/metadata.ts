export type DatasetStatus = 'LIVE' | 'SYNCED' | 'STATIC';

export type DatasetMeta = {
  source: string;
  status: DatasetStatus;
  fetchedAt?: string;
  method?: string;
  version?: string;
  cardDesc?: string;
  syncDate?: string;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : null;
}

function pickString(record: UnknownRecord | null, keys: string[]): string | undefined {
  if (!record) return undefined;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return undefined;
}

export function extractDatasetMeta(
  data: unknown,
  fallback: Partial<DatasetMeta> = {},
): DatasetMeta {
  const root = asRecord(data);
  const embeddedMeta =
    asRecord(root?._meta) ||
    asRecord(root?.meta) ||
    asRecord(root?.metadata);

  const source =
    pickString(embeddedMeta, ['source']) ||
    pickString(root, ['source']) ||
    fallback.source ||
    '출처 메타 없음';

  const fetchedAt =
    pickString(embeddedMeta, ['fetchedAt', 'fetched', 'lastUpdated']) ||
    pickString(root, ['fetchedAt', 'fetched', 'lastUpdated']) ||
    fallback.fetchedAt;

  const method =
    pickString(embeddedMeta, ['method', 'extracted_by', 'extractedBy']) ||
    pickString(root, ['method', 'extracted_by', 'extractedBy']) ||
    fallback.method;

  const version =
    pickString(embeddedMeta, ['version']) ||
    pickString(root, ['version']) ||
    fallback.version;

  const cardDesc =
    pickString(embeddedMeta, ['cardDesc']) ||
    pickString(root, ['cardDesc']) ||
    fallback.cardDesc;

  const syncDate =
    pickString(embeddedMeta, ['syncDate']) ||
    pickString(root, ['syncDate']) ||
    fallback.syncDate ||
    fetchedAt;

  return {
    source,
    status: fallback.status || 'STATIC',
    fetchedAt,
    method,
    version,
    cardDesc,
    syncDate,
  };
}
