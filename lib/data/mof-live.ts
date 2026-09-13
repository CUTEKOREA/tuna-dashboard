/**
 * 해수부·관세청·한국은행에서 받아 둔 스냅숏 셋.
 *
 * 화면에서 API 를 직접 부르지 않는 이유는 양이다 — 위판은 하루가 1만 6천 행이고, 공표도 두세 달 늦어
 * 매 요청마다 뒤로 훑어야 한다. 대신 `scripts/sync_*.py` 가 미리 받아 여기에 담고, 화면은 이 JSON 만 읽는다.
 *
 *   scripts/sync_mof_auction.py        위판 일별 단가      → public/data/mof_auction_daily_v1.json
 *   scripts/sync_mof_trade.py          품목 월별 무역수지   → public/data/mof_trade_monthly_v1.json
 *   scripts/sync_landed_cost_trend.py  항로 운임 × 환율     → public/data/landed_cost_trend_v1.json
 */
import auctionRaw from '../../public/data/mof_auction_daily_v1.json';
import freightRaw from '../../public/data/landed_cost_trend_v1.json';
import tradeRaw from '../../public/data/mof_trade_monthly_v1.json';

export interface AuctionDay {
  검색어: string;
  건수: number;
  물량_kg: number;
  금액_원: number;
  /** 금액÷물량 가중평균. 물량이 0이면 null 이다 — 0 으로 채우지 않는다. */
  단가_원_kg: number | null;
  위판장수: number;
}

export interface TradeMonth {
  수출_kg: number;
  수출_usd: number;
  수입_kg: number;
  수입_usd: number;
  무역수지_usd: number;
  품목수: number;
}

export interface FreightPoint {
  period: string;
  USW: number | null;
  USE: number | null;
  EU: number | null;
  CN: number | null;
  JP: number | null;
  VN: number | null;
  /** 원/달러 매매기준율 일별의 월평균. */
  환율: number | null;
}

export const auctionMeta = auctionRaw._meta;
export const auctionDaily = auctionRaw.일별 as Record<string, Record<string, AuctionDay>>;
export const auctionMarkets = auctionRaw.위판장 as Record<string, string[]>;

export const tradeMeta = tradeRaw._meta;
export const tradeMonthly = tradeRaw.월별 as Record<string, Record<string, TradeMonth>>;
export const tradeItems = tradeRaw.품목 as Record<string, string[]>;

export const freightMeta = freightRaw._meta;
export const freightRoutes = freightRaw.항로 as Record<string, string>;
export const freightSeries = freightRaw.series as FreightPoint[];

/**
 * 한 검색어에 걸린 표준명들을 날짜순으로 편다.
 * 「오징어」는 살오징어·갑오징어류·오징어류를 함께 잡는다 — 묶지 않고 종별로 남긴다.
 */
export function auctionSeriesFor(keyword: string): Array<{ date: string; species: string } & AuctionDay> {
  const out: Array<{ date: string; species: string } & AuctionDay> = [];
  for (const [date, species] of Object.entries(auctionDaily)) {
    for (const [name, row] of Object.entries(species)) {
      if (row.검색어 === keyword) out.push({ date, species: name, ...row });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** 한 검색어의 월별 무역수지. 없는 달은 건너뛴다 — 0 으로 채우면 없는 사실이 생긴다. */
export function tradeSeriesFor(keyword: string): Array<{ month: string } & TradeMonth> {
  return Object.entries(tradeMonthly)
    .filter(([, species]) => species[keyword])
    .map(([month, species]) => ({ month, ...species[keyword] }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
