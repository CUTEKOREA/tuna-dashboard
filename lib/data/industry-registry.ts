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

/**
 * 표지 cover-facts 가 없는 보고서(골뱅이 조달)의 허브 카드 수치.
 * 원문 0장(요지) 첫 단락에서 골랐다. `quote` 는 원문 평문에 그대로 있는 구절이고 `v` 를 품는다(테스트가 대조).
 * `hub_v1.json`(표지 전용)에는 넣지 않는다.
 */
export const BODY_CARD_FACTS: Record<string, Array<CoverFact & { quote: string }>> = {};

/** 허브 카드에 쓰는 수치 — 표지 타일, 없으면 본문 요지에서 고른 값. */
export function cardFacts(item: IndustryItem): CoverFact[] {
  return item.facts.length > 0 ? item.facts : (BODY_CARD_FACTS[item.key] ?? []);
}

/**
 * 탭 제목(document.title)의 앞부분. 공통 품목 라우트(/industry/<key>)는 메뉴 키가 모두 `industry` 라
 * 메뉴 제목(「전체 품목」)이 아니라 그 품목 이름을 쓴다. 그 밖은 메뉴 제목 그대로.
 */
export function industryPageTitle(pathname: string | null | undefined, menuTitle: string): string {
  const item = industryItemForPath(pathname);
  return item && isGenericIndustryItem(item) ? item.name : menuTitle;
}

export function itemsInCategory(category: string): IndustryItem[] {
  return INDUSTRY_ITEMS.filter((item) => item.category === category);
}
