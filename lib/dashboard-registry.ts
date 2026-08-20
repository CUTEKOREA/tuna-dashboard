export type DashboardSection = 'operation' | 'understanding' | 'fishery' | 'strategy' | 'agriculture' | 'livestock';
export type DashboardAccent = 'cyan' | 'emerald' | 'gold' | 'rose' | 'purple' | 'amber' | 'teal';
export type SidebarIconKey =
  | 'Anchor'
  | 'BarChart2'
  | 'Droplets'
  | 'Factory'
  | 'Fish'
  | 'FishSymbol'
  | 'Hexagon'
  | 'LongArmOctopus'
  | 'Mail'
  | 'Navigation'
  | 'Shell'
  | 'Ship'
  | 'Shrimp'
  | 'Snowflake'
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
  requiresAdminAccess?: boolean;
  shortcutOrder?: number;
  sidebar?: SidebarMenuMeta;
}

export const DASHBOARD_MENU_CONFIGS = [
  { key: 'market', title: '시장 동향', section: 'operation', accent: 'cyan', shortcutOrder: 1, sidebar: { icon: 'BarChart2', suffix: 'Market' } },
  { key: 'fleet', title: '선단 운영', section: 'operation', accent: 'cyan', requiresOperationAccess: true, shortcutOrder: 2, sidebar: { icon: 'Navigation', suffix: 'Fleet' } },
  { key: 'logistics', title: '물류·가공', section: 'operation', accent: 'cyan', requiresOperationAccess: true, shortcutOrder: 4, sidebar: { icon: 'Factory', suffix: 'Logistics' } },
  { key: 'unloading', title: '하역 현황', section: 'operation', accent: 'cyan', requiresOperationAccess: true, shortcutOrder: 3, sidebar: { icon: 'Anchor', suffix: 'Unloading' } },
  { key: 'panofi', title: '파노피', section: 'operation', accent: 'cyan', sidebar: { icon: 'Ship' } },
  { key: 'cosmo', title: '코스모', section: 'operation', accent: 'cyan', sidebar: { icon: 'Hexagon' } },
  { key: 'bangkok-office', title: '방콕사무소', section: 'operation', accent: 'cyan', requiresOperationAccess: true, sidebar: { icon: 'Factory' } },
  { key: 'gmts', title: 'GMTS 주간보고', section: 'operation', accent: 'cyan', requiresOperationAccess: true, sidebar: { icon: 'Factory', label: 'GMTS' } },
  { key: 'mail', title: '메일', section: 'operation', accent: 'cyan', requiresAdminAccess: true, sidebar: { icon: 'Mail' } },
  { key: 'tuna-industry', title: '참치', section: 'understanding', accent: 'cyan', sidebar: { icon: 'Fish' } },
  { key: 'squid-industry', title: '오징어', section: 'understanding', accent: 'purple', sidebar: { icon: 'Waves' } },
  { key: 'mackerel-industry', title: '고등어', section: 'understanding', accent: 'cyan', sidebar: { icon: 'FishSymbol' } },
  { key: 'whelk-industry', title: '골뱅이', section: 'understanding', accent: 'amber', sidebar: { icon: 'Shell' } },
  { key: 'shrimp-industry', title: '새우', section: 'understanding', accent: 'teal', sidebar: { icon: 'Shrimp' } },
  // 품목이 아니라 회사를 해부한다. 「시장 이해」 끝에 두는 이유는 품목을 먼저 읽고 와야 뜻이 통해서다.
  { key: 'company-anatomy', title: '기업 해부', section: 'understanding', accent: 'amber', sidebar: { icon: 'Factory', suffix: 'Company' } },
  { key: 'pork', title: '돼지고기', section: 'livestock', accent: 'cyan', sidebar: { icon: 'Hexagon', suffix: 'Pork' } },
  { key: 'cross-intelligence', title: '통합 인텔리전스', section: 'strategy', accent: 'gold', sidebar: { icon: 'BarChart2', suffix: 'Cross' } },
  { key: 'purse-seiner-db', title: '선단 DB', section: 'strategy', accent: 'cyan', sidebar: { icon: 'Ship', suffix: 'FleetDb' } },
] as const satisfies readonly DashboardMenuConfigShape[];

export type ActiveMenu = (typeof DASHBOARD_MENU_CONFIGS)[number]['key'];
export type DashboardMenuConfig = Omit<DashboardMenuConfigShape, 'key'> & { key: ActiveMenu };

export const HIDDEN_DASHBOARD_MENU_KEYS = new Set<ActiveMenu>(['pork']);

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
  understanding: '시장 이해',
  fishery: '어종별 인텔리전스',
  strategy: '전략 분석',
  agriculture: '농산물 인텔리전스',
  livestock: '축산물 인텔리전스',
};

const SIDEBAR_SECTION_TITLES: Record<DashboardSection, string> = {
  operation: '📡 실시간 운영',
  understanding: '📚 시장 이해',
  fishery: '🐟 어종별 인텔리전스',
  strategy: '🔬 전략 분석',
  agriculture: '🌾 농산물 인텔리전스',
  livestock: '🥩 축산물 인텔리전스',
};

const SIDEBAR_SECTION_ORDER: readonly DashboardSection[] = [
  'operation',
  'understanding',
  'fishery',
  'strategy',
  'agriculture',
  'livestock',
];

export const VALID_MENUS = DASHBOARD_MENU_CONFIGS.map((menu) => menu.key) as readonly ActiveMenu[];
export const SESSION_ACCESS_MENU_KEYS = VALID_MENUS.filter((menu) => menu !== 'mail') as readonly ActiveMenu[];
export const SESSION_ACCESS_MENUS = new Set<ActiveMenu>(SESSION_ACCESS_MENU_KEYS);

export const DASHBOARD_TITLES = Object.freeze(
  Object.fromEntries(DASHBOARD_MENU_CONFIGS.map((menu) => [menu.key, menu.title])),
) as Readonly<Record<ActiveMenu, string>>;

function hasShortcutOrder(menu: DashboardMenuConfigShape): boolean {
  return typeof menu.shortcutOrder === 'number';
}

function shortcutOrderOf(menu: DashboardMenuConfigShape): number {
  return menu.shortcutOrder ?? 0;
}

function protectedMenuOrderOf(menu: DashboardMenuConfigShape): number {
  return menu.shortcutOrder ?? Number.MAX_SAFE_INTEGER;
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
  .sort((a, b) => protectedMenuOrderOf(a) - protectedMenuOrderOf(b))
  .map((menu) => menu.key) as readonly ActiveMenu[];

export const PROTECTED_OPERATION_MENUS = new Set<ActiveMenu>(PROTECTED_OPERATION_MENU_KEYS);

export const DASHBOARD_COMMANDS = DASHBOARD_MENU_CONFIGS
  .filter((menu) => !HIDDEN_DASHBOARD_MENU_KEYS.has(menu.key) && menu.key !== 'mail')
  .map((menu) => ({
    key: menu.key,
    label: menu.title,
    category: SECTION_LABELS[menu.section],
    section: menu.section,
  })) as readonly DashboardCommand[];

export const PUBLIC_DASHBOARD_ROUTES = DASHBOARD_MENU_CONFIGS
  .filter((menu) => (
    !SESSION_ACCESS_MENUS.has(menu.key)
    && menu.key !== 'mail'
    && !HIDDEN_DASHBOARD_MENU_KEYS.has(menu.key)
  ))
  .map((menu) => menu.key) as readonly ActiveMenu[];

export const DASHBOARD_PANEL_ORDER = [
  'market',
  'fleet',
  'logistics',
  'cross-intelligence',

  'pork',
  'unloading',
  'panofi',
  'cosmo',
  'bangkok-office',
  'gmts',
  'mail',
  'purse-seiner-db',
  'tuna-industry',
  'squid-industry',
  'mackerel-industry',
  'whelk-industry',
  'shrimp-industry',
  'company-anatomy',
] as const satisfies readonly ActiveMenu[];

const SIDEBAR_SECTION_KEYS: Record<DashboardSection, readonly ActiveMenu[]> = {
  operation: ['market', 'fleet', 'unloading', 'logistics', 'panofi', 'cosmo', 'bangkok-office', 'gmts', 'mail'],
  understanding: [
    'tuna-industry',
    'squid-industry',
    'mackerel-industry',
    'whelk-industry',
    'shrimp-industry',
    'company-anatomy',
  ],
  fishery: [],
  strategy: [
    // 2026-08-17: 선단 DB 에 전 해역 등록부 탐색기가 실리면서 사이드바로 승격.
    // cross-intelligence 는 종전대로 명령 팔레트 전용이다.
    'purse-seiner-db',
  ],
  agriculture: [],
  livestock: ['pork'],
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
    icon: config.sidebar.icon,
  };
}

export const SIDEBAR_SECTIONS = SIDEBAR_SECTION_ORDER
  .map((section) => ({
    section,
    title: SIDEBAR_SECTION_TITLES[section],
    items: SIDEBAR_SECTION_KEYS[section]
      .filter((menu) => !HIDDEN_DASHBOARD_MENU_KEYS.has(menu))
      .map(sidebarItemFor),
  }))
  .filter((section) => section.items.length > 0) as readonly SidebarSection[];

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
