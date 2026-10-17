/**
 * 시장 이해 품목 현황판 - 해부보고서 표를 옮긴 정적 스펙. 품목 하나 = JSON 하나(`data/industry_status_boards/<key>.json`).
 * 그리는 쪽은 components/market-understanding/IndustryStatusBoard. 스키마 검사는 __tests__/industry-status-boards.test.ts.
 */
import bananas from '../../data/industry_status_boards/bananas.json';
import beef from '../../data/industry_status_boards/beef.json';
import cassava from '../../data/industry_status_boards/cassava.json';
import cherries from '../../data/industry_status_boards/cherries.json';
import chicken from '../../data/industry_status_boards/chicken.json';
import corn from '../../data/industry_status_boards/corn.json';
import eggs from '../../data/industry_status_boards/eggs.json';
import hairtail from '../../data/industry_status_boards/hairtail.json';
import jukkumi from '../../data/industry_status_boards/jukkumi.json';
import kiwis from '../../data/industry_status_boards/kiwis.json';
import mackerel from '../../data/industry_status_boards/mackerel.json';
import mangosteen from '../../data/industry_status_boards/mangosteen.json';
import octopus from '../../data/industry_status_boards/octopus.json';
import pineapple from '../../data/industry_status_boards/pineapple.json';
import pollock from '../../data/industry_status_boards/pollock.json';
import pork from '../../data/industry_status_boards/pork.json';
import rice from '../../data/industry_status_boards/rice.json';
import salmon from '../../data/industry_status_boards/salmon.json';
import shrimp from '../../data/industry_status_boards/shrimp.json';
import soybean from '../../data/industry_status_boards/soybean.json';
import squid from '../../data/industry_status_boards/squid.json';
import surimi from '../../data/industry_status_boards/surimi.json';
import tapioca from '../../data/industry_status_boards/tapioca.json';
import tuna from '../../data/industry_status_boards/tuna.json';
import tunafarm from '../../data/industry_status_boards/tunafarm.json';
import wheat from '../../data/industry_status_boards/wheat.json';
import whelk from '../../data/industry_status_boards/whelk.json';
import yams from '../../data/industry_status_boards/yams.json';

export type BoardPoint = { x: string; v: number; partial?: boolean };
export type BoardSeries = { name: string; digits?: number; points: BoardPoint[] };

export type BoardChart =
  | { type: 'bars'; unit: string; digits?: number; series: BoardSeries[] }
  | { type: 'line'; unit: string; digits?: number; mark?: 'last' | 'peak'; series: BoardSeries[] }
  | { type: 'hbars'; unit: string; digits?: number; rows: { label: string; v: number; text?: string; hl?: boolean }[] }
  | { type: 'dumbbell'; unit: string; digits?: number; legend: [string, string, string?];
      rows: { label: string; a: number | null; b: number; c?: number | null }[] }
  | { type: 'butterfly'; left: string; right: string;
      rows: { label: string; l: number; r: number; hlL?: boolean; hlR?: boolean }[] }
  | { type: 'waterfall'; unit: string; steps: { label: string; kind: 'base' | 'delta' | 'total'; v: number }[] }
  | { type: 'stairs'; unit: string; rows: { label: string; add: number; price: number; note?: string }[] }
  | { type: 'closed'; flow: string[]; cells: { stage: string; system: string; how: string; basis: string }[] }
  | { type: 'table'; columns: string[]; rows: string[][] };

export type BoardCard = { title: string; note: string; wide?: boolean; chart: BoardChart };
export type BoardKpi = { label: string; value: number; digits?: number; unit: string; note?: string; basis: string; partial?: boolean };

export type IndustryStatusBoardSpec = {
  _meta: { source: string; as_of: string; tables: string[] };
  title: string;
  lede: string;
  src: string;
  kpis: BoardKpi[];
  sections: { title: string; sub?: string; cards: BoardCard[] }[];
};

export const INDUSTRY_STATUS_BOARDS: Record<string, IndustryStatusBoardSpec> = {
  bananas, beef, cassava, cherries, chicken, corn, eggs, hairtail, jukkumi, kiwis, mackerel, mangosteen, octopus, pineapple, pollock, pork, rice, salmon, shrimp, soybean, squid, surimi, tapioca, tuna, tunafarm, wheat, whelk, yams,
} as unknown as Record<string, IndustryStatusBoardSpec>;

export function industryStatusBoard(key: string): IndustryStatusBoardSpec | undefined {
  return INDUSTRY_STATUS_BOARDS[key];
}
