// lib/realtime.ts
/**
 * Minimal mock real‑time price provider.
 * In production you would replace this with a proper WebSocket connection
 * to a market data feed (e.g. Yahoo Finance, Polygon, etc.).
 */
export type PriceListener = (price: number) => void;

class RealTimePriceProvider {
  private listeners: Map<string, Set<PriceListener>> = new Map();
  private intervals: Map<string, NodeJS.Timer> = new Map();

  /**
   * Starts emitting random price updates for a given symbol.
   * If already started, simply registers the new listener.
   */
  subscribe(symbol: string, listener: PriceListener) {
    if (!this.listeners.has(symbol)) this.listeners.set(symbol, new Set());
    this.listeners.get(symbol)!.add(listener);

    // If this is the first listener for the symbol, start a fake ticker.
    if (!this.intervals.has(symbol)) {
      const interval = setInterval(() => {
        const price = this.generatePrice(symbol);
        this.listeners.get(symbol)!.forEach(l => l(price));
      }, 2000); // emit every 2 seconds
      this.intervals.set(symbol, interval);
    }
  }

  /** Unsubscribe a listener; stops ticker when no listeners remain. */
  unsubscribe(symbol: string, listener: PriceListener) {
    const set = this.listeners.get(symbol);
    if (!set) return;
    set.delete(listener);
    if (set.size === 0) {
      const interval = this.intervals.get(symbol);
      if (interval) clearInterval(interval as any);
      this.intervals.delete(symbol);
      this.listeners.delete(symbol);
    }
  }

  /** Simple deterministic price generator – for demo we just vary around 100. */
  private generatePrice(symbol: string): number {
    // Use symbol hash to give each symbol its own base price.
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) hash = (hash << 5) - hash + symbol.charCodeAt(i);
    const base = 80 + (Math.abs(hash) % 40); // 80‑120 range
    const jitter = (Math.random() - 0.5) * 4; // ±2
    return Number((base + jitter).toFixed(2));
  }
}

export const realtimePriceProvider = new RealTimePriceProvider();
