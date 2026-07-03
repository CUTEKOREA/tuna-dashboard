export type DashboardSection = 'operation' | 'fishery' | 'strategy' | 'agriculture' | 'livestock';
export type DashboardAccent = 'cyan' | 'emerald' | 'gold' | 'rose';

interface DashboardMenuConfigShape {
  key: string;
  title: string;
  section: DashboardSection;
  accent: DashboardAccent;
  requiresOperationAccess?: boolean;
  shortcutOrder?: number;
}

export const DASHBOARD_MENU_CONFIGS = [
  { key: 'market', title: '시장 동향', section: 'operation', accent: 'cyan', shortcutOrder: 1 },
  { key: 'fleet', title: '선단 운영', section: 'operation', accent: 'cyan', requiresOperationAccess: true, shortcutOrder: 2 },
  { key: 'logistics', title: '물류·가공', section: 'operation', accent: 'cyan', requiresOperationAccess: true, shortcutOrder: 4 },
  { key: 'unloading', title: '하역 현황', section: 'operation', accent: 'cyan', requiresOperationAccess: true, shortcutOrder: 3 },
  { key: 'value-chain', title: '참치', section: 'fishery', accent: 'cyan', shortcutOrder: 5 },
  { key: 'mackerel', title: '고등어', section: 'fishery', accent: 'cyan', shortcutOrder: 6 },
  { key: 'galchi', title: '갈치', section: 'fishery', accent: 'cyan', shortcutOrder: 7 },
  { key: 'squid', title: '오징어', section: 'fishery', accent: 'cyan', shortcutOrder: 8 },
  { key: 'jukkumi', title: '주꾸미', section: 'fishery', accent: 'cyan', shortcutOrder: 9 },
  { key: 'octopus', title: '낙지', section: 'fishery', accent: 'cyan', shortcutOrder: 10 },
  { key: 'cashew', title: '캐슈넛', section: 'agriculture', accent: 'emerald' },
  { key: 'cassava', title: '카사바', section: 'agriculture', accent: 'cyan' },
  { key: 'garlic', title: '마늘', section: 'agriculture', accent: 'cyan' },
  { key: 'carrot', title: '당근', section: 'agriculture', accent: 'cyan' },
  { key: 'cocoa', title: '코코아', section: 'agriculture', accent: 'emerald' },
  { key: 'mangosteen', title: '망고스틴', section: 'agriculture', accent: 'cyan' },
  { key: 'chicken', title: '닭', section: 'livestock', accent: 'cyan' },
  { key: 'pork', title: '돼지고기', section: 'livestock', accent: 'cyan' },
  { key: 'beef', title: '소고기', section: 'livestock', accent: 'cyan' },
  { key: 'whelk', title: '골뱅이', section: 'fishery', accent: 'cyan' },
  { key: 'kim', title: '김', section: 'fishery', accent: 'cyan' },
  { key: 'used-car', title: '중고차', section: 'strategy', accent: 'cyan' },
  { key: 'pollock', title: '명태', section: 'fishery', accent: 'cyan', shortcutOrder: 11 },
  { key: 'flatfish', title: '가자미', section: 'fishery', accent: 'cyan', shortcutOrder: 12 },
  { key: 'shrimp', title: '새우', section: 'fishery', accent: 'cyan', shortcutOrder: 13 },
  { key: 'salmon', title: '연어', section: 'fishery', accent: 'cyan', shortcutOrder: 14 },
  { key: 'seasia-oem', title: '글로벌 OEM', section: 'strategy', accent: 'cyan' },
  { key: 'fleet-strategy', title: '선대 전략 분석', section: 'strategy', accent: 'cyan' },
  { key: 'korea-market', title: '국내 위판장 인텔리전스', section: 'strategy', accent: 'cyan' },
  { key: 'cold-storage', title: '냉동창고', section: 'strategy', accent: 'cyan' },
  { key: 'research-lab', title: '연구 재료', section: 'strategy', accent: 'cyan' },
  { key: 'purse-seiner-db', title: '선망선 DB', section: 'strategy', accent: 'cyan' },
  { key: 'msc', title: 'MSC 전략', section: 'strategy', accent: 'cyan' },
  { key: 'sashimi-steak', title: '사시미/스테이크 전략', section: 'strategy', accent: 'cyan' },
] as const satisfies readonly DashboardMenuConfigShape[];

export type ActiveMenu = (typeof DASHBOARD_MENU_CONFIGS)[number]['key'];
export type DashboardMenuConfig = Omit<DashboardMenuConfigShape, 'key'> & { key: ActiveMenu };

export interface DashboardCommand {
  key: ActiveMenu;
  label: string;
  category: string;
  section: DashboardSection;
}

const SECTION_LABELS: Record<DashboardSection, string> = {
  operation: '실시간 운영',
  fishery: '어종별 인텔리전스',
  strategy: '전략 분석',
  agriculture: '농산물 인텔리전스',
  livestock: '축산물 인텔리전스',
};

export const VALID_MENUS = DASHBOARD_MENU_CONFIGS.map((menu) => menu.key) as readonly ActiveMenu[];

export const DASHBOARD_TITLES = Object.freeze(
  Object.fromEntries(DASHBOARD_MENU_CONFIGS.map((menu) => [menu.key, menu.title])),
) as Readonly<Record<ActiveMenu, string>>;

function hasShortcutOrder(menu: DashboardMenuConfigShape): boolean {
  return typeof menu.shortcutOrder === 'number';
}

function shortcutOrderOf(menu: DashboardMenuConfigShape): number {
  return menu.shortcutOrder ?? 0;
}

function requiresOperationAccess(menu: DashboardMenuConfigShape): boolean {
  return Boolean(menu.requiresOperationAccess);
}

export const KEYBOARD_SHORTCUT_MENUS = DASHBOARD_MENU_CONFIGS
  .filter((menu) => hasShortcutOrder(menu))
  .sort((a, b) => shortcutOrderOf(a) - shortcutOrderOf(b))
  .map((menu) => menu.key) as readonly ActiveMenu[];

export const PROTECTED_OPERATION_MENU_KEYS = DASHBOARD_MENU_CONFIGS
  .filter((menu) => requiresOperationAccess(menu))
  .sort((a, b) => shortcutOrderOf(a) - shortcutOrderOf(b))
  .map((menu) => menu.key) as readonly ActiveMenu[];

export const PROTECTED_OPERATION_MENUS = new Set<ActiveMenu>(PROTECTED_OPERATION_MENU_KEYS);

export const DASHBOARD_COMMANDS = DASHBOARD_MENU_CONFIGS.map((menu) => ({
  key: menu.key,
  label: menu.title,
  category: SECTION_LABELS[menu.section],
  section: menu.section,
})) as readonly DashboardCommand[];

const VALID_MENU_SET = new Set<string>(VALID_MENUS);

export function isActiveMenu(value: string): value is ActiveMenu {
  return VALID_MENU_SET.has(value);
}

export function getDashboardTitle(menu: ActiveMenu): string {
  return DASHBOARD_TITLES[menu];
}

export function getDashboardAccent(menu: ActiveMenu): DashboardAccent {
  return DASHBOARD_MENU_CONFIGS.find((config) => config.key === menu)?.accent ?? 'cyan';
}
