// A unified caching utility for API routes (Rate Limit + Performance Cache)
// In production, this can be mapped to @vercel/kv or standard Redis.

const memoryCache = new Map<string, { value: any; expiry: number }>();

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(key);

  if (cached && cached.expiry > now) {
    console.log(`[Cache HIT] ${key}`);
    return cached.value;
  }

  console.log(`[Cache MISS] ${key} - Fetching new data...`);
  const data = await fetcher();
  
  // Set in cache
  memoryCache.set(key, {
    value: data,
    expiry: now + ttlSeconds * 1000,
  });

  return data;
}

export function clearCache(key: string) {
  memoryCache.delete(key);
}
