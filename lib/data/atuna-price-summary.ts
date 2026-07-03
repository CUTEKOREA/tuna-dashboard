export type AtunaPriceRow = {
  date: string;
  [hubKey: string]: number | string | undefined;
};

export type AtunaHubDefinition = {
  key: string;
  label: string;
};

export type AtunaHubObservation = {
  key: string;
  label: string;
  price: number;
  date: string;
};

export type AtunaSpreadSummary = {
  latest: AtunaHubObservation | null;
  previousForLatestHub: AtunaHubObservation | null;
  deltaPct: number | null;
  spread: {
    minPrice: number;
    maxPrice: number;
    minLabel: string;
    maxLabel: string;
    count: number;
  } | null;
};

export const SKJ_ATUNA_HUBS: AtunaHubDefinition[] = [
  { key: 'skj_bkk', label: '방콕' },
  { key: 'skj_mnt', label: '만타' },
  { key: 'skj_abj', label: '아비장' },
  { key: 'skj_sey', label: '세이셸' },
  { key: 'skj_vig', label: '비고' },
];

export const YF_ATUNA_HUBS: AtunaHubDefinition[] = [
  { key: 'yf_abj', label: '아비장' },
  { key: 'yf_sey', label: '세이셸' },
  { key: 'yf_vig', label: '비고' },
];

function toObservation(row: AtunaPriceRow | undefined, hub: AtunaHubDefinition): AtunaHubObservation | null {
  if (!row || typeof row.date !== 'string') return null;
  const value = row[hub.key];
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return {
    key: hub.key,
    label: hub.label,
    price: value,
    date: row.date,
  };
}

export function latestTwoForAtunaHub(
  rows: AtunaPriceRow[],
  hub: AtunaHubDefinition,
): {
  latest: AtunaHubObservation | null;
  prev: AtunaHubObservation | null;
} {
  const hits = rows
    .filter((row) => typeof row.date === 'string' && typeof row[hub.key] === 'number' && Number.isFinite(row[hub.key]))
    .sort((a, b) => b.date.localeCompare(a.date));

  return {
    latest: toObservation(hits[0], hub),
    prev: toObservation(hits[1], hub),
  };
}

export function calcAtunaDeltaPct(pair: {
  latest: { price: number } | null;
  prev: { price: number } | null;
}): number | null {
  if (!pair.latest || !pair.prev || pair.prev.price === 0) return null;
  return ((pair.latest.price - pair.prev.price) / pair.prev.price) * 100;
}

export function buildAtunaSpreadSummary(
  rows: AtunaPriceRow[],
  hubs: AtunaHubDefinition[],
): AtunaSpreadSummary {
  const hubPairs = hubs
    .map((hub, index) => ({
      hub,
      index,
      pair: latestTwoForAtunaHub(rows, hub),
    }))
    .filter((item) => item.pair.latest !== null);

  const latestPoints = hubPairs.map((item) => item.pair.latest as AtunaHubObservation);
  if (latestPoints.length === 0) {
    return { latest: null, previousForLatestHub: null, deltaPct: null, spread: null };
  }

  const latestItem = hubPairs
    .slice()
    .sort((a, b) => {
      const aDate = a.pair.latest?.date ?? '';
      const bDate = b.pair.latest?.date ?? '';
      const dateOrder = bDate.localeCompare(aDate);
      return dateOrder !== 0 ? dateOrder : a.index - b.index;
    })[0];

  const latest = latestItem.pair.latest;
  const previousForLatestHub = latestItem.pair.prev;
  const sortedByPrice = latestPoints
    .slice()
    .sort((a, b) => a.price - b.price || a.label.localeCompare(b.label));
  const min = sortedByPrice[0];
  const max = sortedByPrice[sortedByPrice.length - 1];

  return {
    latest,
    previousForLatestHub,
    deltaPct: calcAtunaDeltaPct({
      latest,
      prev: previousForLatestHub,
    }),
    spread: {
      minPrice: min.price,
      maxPrice: max.price,
      minLabel: min.label,
      maxLabel: max.label,
      count: latestPoints.length,
    },
  };
}

export function buildAtunaMarketSummaries(rows: AtunaPriceRow[]): {
  skj: AtunaSpreadSummary;
  yf: AtunaSpreadSummary;
} {
  return {
    skj: buildAtunaSpreadSummary(rows, SKJ_ATUNA_HUBS),
    yf: buildAtunaSpreadSummary(rows, YF_ATUNA_HUBS),
  };
}
