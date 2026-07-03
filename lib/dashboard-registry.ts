export type DashboardSection = 'operation' | 'fishery' | 'strategy' | 'agriculture' | 'livestock';
export type DashboardAccent = 'cyan' | 'emerald' | 'gold' | 'rose';
export type SidebarIconKey =
  | 'Anchor'
  | 'BarChart2'
  | 'Beef'
  | 'Box'
  | 'CarFront'
  | 'Carrot'
  | 'Cherry'
  | 'Coffee'
  | 'Droplets'
  | 'Drumstick'
  | 'Factory'
  | 'Fish'
  | 'FishSymbol'
  | 'Hexagon'
  | 'Leaf'
  | 'LeafyGreen'
  | 'Navigation'
  | 'Nut'
  | 'Octagon'
  | 'ShieldCheck'
  | 'Shell'
  | 'Ship'
  | 'Shrimp'
  | 'Snowflake'
  | 'Sprout'
  | 'TestTube'
  | 'Waves';

interface SidebarMenuMeta {
  icon: SidebarIconKey;
  label?: string;
  suffix?: string;
}

interface DashboardMenuConfigShape {
  key: string;
  title: string;
  section: DashboardSection;
  accent: DashboardAccent;
  requiresOperationAccess?: boolean;
  shortcutOrder?: number;
  sidebar?: SidebarMenuMeta;
}

export const DASHBOARD_MENU_CONFIGS = [
  { key: 'market', title: '시장 동향', section: 'operation', accent: 'cyan', shortcutOrder: 1, sidebar: { icon: 'BarChart2', suffix: 'Market' } },
  { key: 'fleet', title: '선단 운영', section: 'operation', accent: 'cyan', requiresOperationAccess: true, shortcutOrder: 2, sidebar: { icon: 'Navigation', suffix: 'Fleet' } },
  { key: 'logistics', title: '물류·가공', section: 'operation', accent: 'cyan', requiresOperationAccess: true, shortcutOrder: 4, sidebar: { icon: 'Factory', suffix: 'Logistics' } },
  { key: 'unloading', title: '하역 현황', section: 'operation', accent: 'cyan', requiresOperationAccess: true, shortcutOrder: 3, sidebar: { icon: 'Anchor', suffix: 'Unloading' } },
  { key: 'value-chain', title: '참치', section: 'fishery', accent: 'cyan', shortcutOrder: 5, sidebar: { icon: 'Fish', suffix: 'Tuna' } },
  { key: 'mackerel', title: '고등어', section: 'fishery', accent: 'cyan', shortcutOrder: 6, sidebar: { icon: 'FishSymbol', suffix: 'Mackerel' } },
  { key: 'galchi', title: '갈치', section: 'fishery', accent: 'cyan', shortcutOrder: 7, sidebar: { icon: 'Fish', suffix: 'Hairtail' } },
  { key: 'squid', title: '오징어', section: 'fishery', accent: 'cyan', shortcutOrder: 8, sidebar: { icon: 'Droplets', suffix: 'Squid' } },
  { key: 'jukkumi', title: '주꾸미', section: 'fishery', accent: 'cyan', shortcutOrder: 9, sidebar: { icon: 'Octagon', suffix: 'Webfoot Octopus' } },
  { key: 'octopus', title: '낙지', section: 'fishery', accent: 'cyan', shortcutOrder: 10, sidebar: { icon: 'Octagon', suffix: 'Long-Arm Octopus' } },
  { key: 'cashew', title: '캐슈넛', section: 'agriculture', accent: 'emerald', sidebar: { icon: 'Nut', suffix: 'Cashew' } },
  { key: 'cassava', title: '카사바', section: 'agriculture', accent: 'cyan', sidebar: { icon: 'Sprout', suffix: 'Cassava' } },
  { key: 'garlic', title: '마늘', section: 'agriculture', accent: 'cyan', sidebar: { icon: 'LeafyGreen', suffix: 'Garlic' } },
  { key: 'carrot', title: '당근', section: 'agriculture', accent: 'cyan', sidebar: { icon: 'Carrot', suffix: 'Carrot' } },
  { key: 'cocoa', title: '코코아', section: 'agriculture', accent: 'emerald', sidebar: { icon: 'Coffee', suffix: 'Cocoa' } },
  { key: 'mangosteen', title: '망고스틴', section: 'agriculture', accent: 'cyan', sidebar: { icon: 'Cherry', suffix: 'Mangosteen' } },
  { key: 'chicken', title: '닭', section: 'livestock', accent: 'cyan', sidebar: { icon: 'Drumstick', suffix: 'Chicken' } },
  { key: 'pork', title: '돼지고기', section: 'livestock', accent: 'cyan', sidebar: { icon: 'Hexagon', suffix: 'Pork' } },
  { key: 'beef', title: '소고기', section: 'livestock', accent: 'cyan', sidebar: { icon: 'Beef', suffix: 'Beef' } },
  { key: 'whelk', title: '골뱅이', section: 'fishery', accent: 'cyan', sidebar: { icon: 'Shell', suffix: 'Whelk' } },
  { key: 'kim', title: '김', section: 'fishery', accent: 'cyan', sidebar: { icon: 'Leaf', suffix: 'Laver' } },
  { key: 'used-car', title: '중고차', section: 'strategy', accent: 'cyan', sidebar: { icon: 'CarFront', suffix: 'Used Car' } },
  { key: 'pollock', title: '명태', section: 'fishery', accent: 'cyan', shortcutOrder: 11, sidebar: { icon: 'Snowflake', suffix: 'Pollock' } },
  { key: 'flatfish', title: '가자미', section: 'fishery', accent: 'cyan', shortcutOrder: 12, sidebar: { icon: 'FishSymbol', suffix: 'Flatfish' } },
  { key: 'shrimp', title: '새우', section: 'fishery', accent: 'cyan', shortcutOrder: 13, sidebar: { icon: 'Shrimp', suffix: 'Shrimp' } },
  { key: 'salmon', title: '연어', section: 'fishery', accent: 'cyan', shortcutOrder: 14, sidebar: { icon: 'Waves', suffix: 'Salmon' } },
  { key: 'seasia-oem', title: '글로벌 OEM', section: 'strategy', accent: 'cyan', sidebar: { icon: 'Factory', suffix: 'VN/TH' } },
  { key: 'fleet-strategy', title: '선대 전략 분석', section: 'strategy', accent: 'cyan', sidebar: { icon: 'Ship', label: '선대 현황 및 분석' } },
  { key: 'korea-market', title: '국내 위판장 인텔리전스', section: 'strategy', accent: 'cyan', sidebar: { icon: 'Anchor' } },
  { key: 'cold-storage', title: '냉동창고', section: 'strategy', accent: 'cyan', sidebar: { icon: 'Box', suffix: 'Cold Storage' } },
  { key: 'research-lab', title: '연구 재료', section: 'strategy', accent: 'cyan', sidebar: { icon: 'TestTube', suffix: 'Research Lab' } },
  { key: 'purse-seiner-db', title: '선망선 DB', section: 'strategy', accent: 'cyan' },
  { key: 'msc', title: 'MSC 전략', section: 'strategy', accent: 'cyan', sidebar: { icon: 'ShieldCheck', label: 'MSC', suffix: '지속가능성' } },
  { key: 'sashimi-steak', title: '사시미/스테이크 전략', section: 'strategy', accent: 'cyan', sidebar: { icon: 'FishSymbol', label: '사시미/스테이크', suffix: 'Sashimi/Steak' } },
] as const satisfies readonly DashboardMenuConfigShape[];

export type ActiveMenu = (typeof DASHBOARD_MENU_CONFIGS)[number]['key'];
export type DashboardMenuConfig = Omit<DashboardMenuConfigShape, 'key'> & { key: ActiveMenu };

export interface SidebarMenuItem {
  key: ActiveMenu;
  label: string;
  suffix?: string;
  icon: SidebarIconKey;
}

export interface SidebarSection {
  section: DashboardSection;
  title: string;
  items: SidebarMenuItem[];
}

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

const SIDEBAR_SECTION_TITLES: Record<DashboardSection, string> = {
  operation: '📡 실시간 운영',
  fishery: '🐟 어종별 인텔리전스',
  strategy: '🔬 전략 분석',
  agriculture: '🌾 농산물 인텔리전스',
  livestock: '🥩 축산물 인텔리전스',
};

const SIDEBAR_SECTION_ORDER: readonly DashboardSection[] = [
  'operation',
  'fishery',
  'strategy',
  'agriculture',
  'livestock',
];

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

export const PUBLIC_DASHBOARD_ROUTES = DASHBOARD_MENU_CONFIGS
  .filter((menu) => menu.key !== 'market' && !requiresOperationAccess(menu))
  .map((menu) => menu.key) as readonly ActiveMenu[];

const SIDEBAR_SECTION_KEYS: Record<DashboardSection, readonly ActiveMenu[]> = {
  operation: ['market', 'fleet', 'unloading', 'logistics'],
  fishery: [
    'value-chain',
    'mackerel',
    'galchi',
    'squid',
    'jukkumi',
    'octopus',
    'pollock',
    'flatfish',
    'shrimp',
    'whelk',
    'kim',
    'salmon',
  ],
  strategy: [
    'cold-storage',
    'fleet-strategy',
    'korea-market',
    'seasia-oem',
    'used-car',
    'msc',
    'sashimi-steak',
    'research-lab',
  ],
  agriculture: ['cashew', 'cassava', 'garlic', 'carrot', 'cocoa', 'mangosteen'],
  livestock: ['chicken', 'pork', 'beef'],
};

function getMenuConfig(menu: ActiveMenu): DashboardMenuConfig {
  const config = DASHBOARD_MENU_CONFIGS.find((candidate) => candidate.key === menu);

  if (!config) {
    throw new Error(`Unknown dashboard menu: ${menu}`);
  }

  return config as DashboardMenuConfig;
}

function sidebarItemFor(menu: ActiveMenu): SidebarMenuItem {
  const config = getMenuConfig(menu);

  if (!config.sidebar) {
    throw new Error(`Dashboard menu has no sidebar metadata: ${menu}`);
  }

  return {
    key: menu,
    label: config.sidebar.label ?? config.title,
    suffix: config.sidebar.suffix,
    icon: config.sidebar.icon,
  };
}

export const SIDEBAR_SECTIONS = SIDEBAR_SECTION_ORDER.map((section) => ({
  section,
  title: SIDEBAR_SECTION_TITLES[section],
  items: SIDEBAR_SECTION_KEYS[section].map(sidebarItemFor),
})) as readonly SidebarSection[];

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
