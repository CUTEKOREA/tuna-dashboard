/**
 * 「시장 이해」 품목 레지스트리 — 허브(/industry)·공통 품목 라우트(/industry/[key])·왼쪽 메뉴가 함께 쓴다.
 *
 * 손으로 정하는 것은 `lib/industry-items.json`(이름·분류·전용 경로)뿐이다. 카드의 표지 수치와
 * 보고서 연월은 `python3 scripts/build_industry_hub.py` 가 원문 표지에서 읽어 `hub_v1.json` 에 담는다.
 */
import hubRaw from '@/public/data/industry/hub_v1.json';

export interface CoverFact {
  k: string;
  v: string;
  n: string;
}

export interface IndustryItem {
  key: string;
  name: string;
  category: string;
  /** 화면 경로. 전용 페이지가 있으면 그 경로(`/tuna-industry`), 없으면 `/industry/<key>` */
  href: string;
  /** 「보고서 원문 보기」 사본 */
  report: string;
  title: string;
  edition: string;
  facts: CoverFact[];
}

interface Hub {
  categories: string[];
  pinned: string[];
  items: IndustryItem[];
}

const HUB = hubRaw as unknown as Hub;

export const INDUSTRY_ITEMS: readonly IndustryItem[] = HUB.items;
export const INDUSTRY_CATEGORIES: readonly string[] = HUB.categories;
/** 메뉴 맨 위에 고정하는 주력 품목(★) */
export const INDUSTRY_PINNED: readonly IndustryItem[] = HUB.pinned.map((key) => {
  const item = HUB.items.find((entry) => entry.key === key);
  if (!item) throw new Error(`주력 품목 ${key} 가 레지스트리에 없다`);
  return item;
});

export const INDUSTRY_HUB_PATH = '/industry';

/** 전용 페이지가 없어 공통 라우트로 그리는 품목인가 */
export function isGenericIndustryItem(item: IndustryItem): boolean {
  return item.href === `${INDUSTRY_HUB_PATH}/${item.key}`;
}

export function industryItem(key: string): IndustryItem | undefined {
  return INDUSTRY_ITEMS.find((item) => item.key === key);
}

/** 그 경로가 가리키는 품목(전용 페이지 경로 포함). 허브·다른 메뉴면 undefined. */
export function industryItemForPath(pathname: string | null | undefined): IndustryItem | undefined {
  if (!pathname) return undefined;
  const path = pathname.replace(/\/+$/, '');
  return INDUSTRY_ITEMS.find((item) => item.href === path);
}

export function itemsInCategory(category: string): IndustryItem[] {
  return INDUSTRY_ITEMS.filter((item) => item.category === category);
}
