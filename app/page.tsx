'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import { Anchor, Ship, LogOut, Moon, Printer, BarChart2, Navigation, Factory, Waves, Fish, Hexagon, Mail, Menu, X, Snowflake, Shrimp, Droplets, FishSymbol, Shell, TestTube } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePathname, useRouter } from 'next/navigation';
import {
  ActiveMenu,
  DASHBOARD_PANEL_ORDER,
  getDashboardAccent,
  getDashboardTitle,
  isActiveMenu,
  KEYBOARD_SHORTCUT_MENUS,
  SIDEBAR_SECTIONS,
} from '../lib/dashboard-registry';
import type { SidebarIconKey, SidebarMenuItem } from '../lib/dashboard-registry';

// ─── Always-loaded (lightweight or market page essentials) ───
import LiveTicker from '../components/LiveTicker';
import PageTransition from '../components/PageTransition';
import AmbientBackground from '../components/AmbientBackground';
import CommandPalette from '../components/CommandPalette';
import KeepAlivePanel from '../components/KeepAlivePanel';

import { LongArmOctopusIcon } from '../components/SeafoodSidebarIcons';

// ─── Dynamic imports (loaded on-demand per page) ───
const MgoChartModal = dynamic(() => import('../components/MgoChartModal'));
const FleetCommandCenter = dynamic(() => import('../components/FleetCommandCenter'));
// ReeferFreightChart·TraderImportChart 제거 (2026-06-11): 렌더되지 않는 죽은 import였고,
// 각각 합성 산식 라우트(/api/logistics/freight·trader-import, A-01 위반으로 비활성화)에 의존.
const UnloadingStatus = dynamic(() => import('../components/UnloadingStatus'));


const PorkDashboard = dynamic(() => import('../components/PorkDashboard'));
const LogisticsDashboard = dynamic(() => import('../components/LogisticsDashboard'));
const CrossCommodityIntelligenceDashboard = dynamic(() => import('../components/CrossCommodityIntelligenceDashboard'));

const MarketDashboard = dynamic(() => import('../components/MarketDashboard'));
const PurseSeinerDashboard = dynamic(() => import('../components/PurseSeinerDashboard'));
const PanofiDashboard = dynamic(() => import('../components/panofi/PanofiDashboard'));
const CosmoDashboard = dynamic(() => import('../components/cosmo/CosmoDashboard'));
const BangkokDashboard = dynamic(() => import('../components/bangkok/BangkokDashboard'));
const GmtsDashboard = dynamic(() => import('../components/gmts/GmtsDashboard'));
const MailInboxDashboard = dynamic(() => import('../components/MailInboxDashboard'));
const TunaIndustryDashboard = dynamic(() => import('../components/market-understanding/TunaIndustryDashboard'));
const SquidIndustryDashboard = dynamic(() => import('../components/market-understanding/SquidIndustryDashboard'));
const MackerelIndustryDashboard = dynamic(() => import('../components/market-understanding/MackerelIndustryDashboard'));
const WhelkIndustryDashboard = dynamic(() => import('../components/market-understanding/WhelkIndustryDashboard'));
const ShrimpIndustryDashboard = dynamic(() => import('../components/market-understanding/ShrimpIndustryDashboard'));
const PollockIndustryDashboard = dynamic(() => import('../components/market-understanding/PollockIndustryDashboard'));
const CompanyAnatomyDashboard = dynamic(() => import('../components/market-understanding/CompanyAnatomyDashboard'));

const INSTITUTIONAL_MENU_KEYS = new Set<ActiveMenu>([
  'market',
  'fleet',
  'unloading',
  'logistics',
  'pork',
  'cross-intelligence',
  'purse-seiner-db',
  'panofi',
  'cosmo',
]);

const SIDEBAR_ICONS: Record<SidebarIconKey, React.ElementType> = {
  Anchor,
  BarChart2,
  Droplets,
  Factory,
  Fish,
  FishSymbol,
  Hexagon,
  LongArmOctopus: LongArmOctopusIcon,
  Mail,
  Navigation,
  Shell,
  Ship,
  Shrimp,
  Snowflake,
  TestTube,
  Waves,
};


export default function Home() {
  const [mgoData, setMgoData] = useState({ price: 0, change: 0, date: '', loading: true });
  const pathname = usePathname();
  const router = useRouter();
  
  const activeMenu = React.useMemo<ActiveMenu>(() => {
    const path = pathname?.replace('/', '');
    if (path && isActiveMenu(path)) return path;
    return 'market';
  }, [pathname]);
  const [mailAdminVisible, setMailAdminVisible] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  
  // Modals state
  const [isMgoModalOpen, setIsMgoModalOpen] = useState(false);
  
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);


  // 다크 모드 — 결정 ①(라이트 기본, 다크는 토글 보존). data-v3='light' 스코프를 떼면
  // :root의 기존 다크 토큰으로 복귀한다. 별도 다크 팔레트를 새로 만들지 않는다.
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('theme-mode') === 'dark';
  });
  useEffect(() => {
    window.localStorage.setItem('theme-mode', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const navigateToMenu = React.useCallback((menu: ActiveMenu) => {
    router.replace(`/${menu}`, { scroll: false });
  }, [router]);

  const handleMenuClick = (menu: ActiveMenu) => {
    if (activeMenu === menu) {
      window.location.reload();
    } else {
      navigateToMenu(menu);
    }
  };

  // Scroll to top and update page title when activeMenu changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `${getDashboardTitle(activeMenu)} | 참치왕국`;
  }, [activeMenu]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    
      // Fetch live MGO Price
      async function fetchMgoPrice() {
        let finalPrice = 2050.00; // default fallback
        let finalChange = 0;
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
        try {
          const res = await fetch('/api/mgo', { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            finalPrice = data.price;
            finalChange = data.change || 0;
            setMgoData({ price: finalPrice, change: finalChange, date: data.date || today, loading: false });
          } else {
            setMgoData({ price: finalPrice, change: finalChange, date: today, loading: false });
          }
        } catch {
          setMgoData({ price: finalPrice, change: finalChange, date: today, loading: false });
        }
      
    }
    fetchMgoPrice();
  }, []);

  useEffect(() => {
    let active = true;
    const refreshMailVisibility = async (hasSession: boolean) => {
      if (!hasSession) {
        if (active) setMailAdminVisible(false);
        return;
      }
      try {
        const response = await fetch('/api/mail/status', {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        if (active) setMailAdminVisible(response.ok);
      } catch {
        if (active) setMailAdminVisible(false);
      }
    };

    void supabase.auth.getSession().then(({ data }) => (
      refreshMailVisibility(Boolean(data.session))
    ));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void refreshMailVisibility(Boolean(nextSession));
    });
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    if (signOutLoading) return;
    setSignOutLoading(true);
    setSignOutError('');
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        setSignOutError('로그아웃하지 못했습니다. 다시 시도해주세요.');
        return;
      }
      if ('caches' in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
      }
      window.location.replace('/login');
    } catch {
      setSignOutError('로그아웃하지 못했습니다. 다시 시도해주세요.');
    } finally {
      setSignOutLoading(false);
    }
  };

  const toggleTheme = React.useCallback(() => {
    const newTheme = document.documentElement.getAttribute('data-theme') !== 'dark';
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  }, []);
  // Keyboard shortcuts for number keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= KEYBOARD_SHORTCUT_MENUS.length) {
        navigateToMenu(KEYBOARD_SHORTCUT_MENUS[num - 1]);
      }
      if (e.key === 'd' || e.key === 'D') toggleTheme();
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigateToMenu, toggleTheme]);

  // Ambient color based on active page
  const ambientAccent = getDashboardAccent(activeMenu);
  const isPanelActive = (menu: ActiveMenu) => activeMenu === menu;
  const renderSidebarItem = (item: SidebarMenuItem) => {
    if (item.key === 'mail' && !mailAdminVisible) return null;
    const Icon = SIDEBAR_ICONS[item.icon];

    return (
      <button
        key={item.key}
        className={`${styles.menuItem} ${activeMenu === item.key ? styles.menuItemActive : ''}`}
        onClick={() => { handleMenuClick(item.key); setIsMobileSidebarOpen(false); }}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </button>
    );
  };
  const dashboardPanels: Record<ActiveMenu, React.ReactNode> = {
    market: <MarketDashboard />,
    'cross-intelligence': <CrossCommodityIntelligenceDashboard />,
    fleet: <FleetCommandCenter />,
    logistics: <LogisticsDashboard />,

    pork: <PorkDashboard />,
    unloading: <UnloadingStatus />,
    panofi: <PanofiDashboard />,
    cosmo: <CosmoDashboard />,
    'bangkok-office': <BangkokDashboard />,
    gmts: <GmtsDashboard />,
    mail: mailAdminVisible ? <MailInboxDashboard /> : null,
    'purse-seiner-db': <PurseSeinerDashboard />,
    'tuna-industry': <TunaIndustryDashboard />,
    'squid-industry': <SquidIndustryDashboard />,
    'mackerel-industry': <MackerelIndustryDashboard />,
    'whelk-industry': <WhelkIndustryDashboard />,
    'shrimp-industry': <ShrimpIndustryDashboard />,
    'pollock-industry': <PollockIndustryDashboard />,
    'company-anatomy': <CompanyAnatomyDashboard />,
  };
  return (
    <div className={styles.appWrapper} data-v3={darkMode ? undefined : 'light'}>
      {!INSTITUTIONAL_MENU_KEYS.has(activeMenu) && (
        <AmbientBackground accent={ambientAccent} />
      )}
      {/* SwimmingTuna removed per user request */}
      <CommandPalette onNavigate={(menu) => navigateToMenu(menu as ActiveMenu)} />
      
      {/* Mobile Hamburger Button */}
      <button 
        className={styles.mobileMenuBtn} 
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        aria-label={isMobileSidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
      >
        {isMobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className={`${styles.sidebarOverlay} ${isMobileSidebarOpen ? styles.active : ''}`} 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}
      
      {/* Sidebar Area */}
      <aside className={`${styles.sidebar} ${isMobileSidebarOpen ? styles.sidebarOpen : ''}`}>
        <Link
          href="/"
          onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
          title="홈으로 이동 (전체 새로고침)"
          style={{
            display: 'block',
            marginBottom: '2rem',
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <Image src="/logo1.png" alt="신라 로고" width={184} height={48} style={{ height: '48px', width: 'auto', objectFit: 'contain', marginBottom: '8px' }} />
          <p className={styles.subtitle} style={{ fontSize: '0.75rem', marginBottom: '8px' }}>참치 산업 인텔리전스</p>
          <div style={{
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
            borderTop: '1px solid rgba(140,170,255,0.10)',
            paddingTop: '8px',
            display: 'inline-block'
          }}>
            미경1팀 <span style={{
              fontWeight: 'bold',
              fontSize: '0.85rem',
              letterSpacing: '1px',
              background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>이동건</span>
          </div>
        </Link>
        
        {SIDEBAR_SECTIONS.map((section, index) => (
          <React.Fragment key={section.section}>
            <div className={styles.sidebarTitle} style={index === 0 ? undefined : { marginTop: '1.25rem' }}>
              {section.title}
            </div>
            {section.items.map(renderSidebarItem)}
          </React.Fragment>
        ))}

        <div style={{ flex: 1 }} />


        {/* «⌘ 빠른 검색» 버튼 제거 (2026-08-15 사용자 지시) — Cmd+K 단축키·CommandPalette는 유지 */}

        <button
          type="button"
          onClick={() => setDarkMode((prev) => !prev)}
          aria-pressed={darkMode}
          title="다크 모드 — 이전 다크 팔레트로 전환"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', margin: '4px 0',
            border: '1px solid ' + (darkMode ? 'rgba(80, 158, 227, 0.5)' : 'var(--dsc-surface-border, #e2e4e9)'),
            borderRadius: 8, background: darkMode ? 'rgba(80, 158, 227, 0.10)' : 'transparent',
            color: darkMode ? '#1c6bb0' : 'var(--text-tertiary)',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', width: '100%',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Moon size={13} /> 다크 모드
          </span>
          <span style={{ fontSize: 11, fontWeight: 400 }}>{darkMode ? '켜짐' : '꺼짐'}</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          title="현재 화면을 브라우저 인쇄로 PDF 저장 — 아침 스냅샷 공유용 (P3-7 1단계)"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', margin: '4px 0',
            border: '1px solid var(--dsc-surface-border, #e2e4e9)',
            borderRadius: 8, background: 'transparent',
            color: 'var(--text-tertiary)',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', width: '100%',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Printer size={13} /> PDF 내보내기
          </span>
          <span style={{ fontSize: 11, fontWeight: 400 }}>인쇄</span>
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signOutLoading}
          style={{
            fontSize: '12px',
            padding: '10px 12px',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '8px',
            color: 'var(--accent-danger)',
            cursor: signOutLoading ? 'wait' : 'pointer',
            opacity: signOutLoading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            marginTop: '1rem'
          }}
        >
          <LogOut size={14} /> {signOutLoading ? '로그아웃 중' : '보안 로그아웃'}
        </button>
        {signOutError && (
          <div role="alert" style={{ color: 'var(--accent-danger)', fontSize: '11px', lineHeight: 1.5, marginTop: '8px' }}>
            {signOutError}
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        <main className={styles.container}>
          {activeMenu === 'market' && (
            <>
              <LiveTicker />
            </>
          )}

          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <PageTransition activeKey={activeMenu}>

              {/* V3 라이트: 스코프는 appWrapper(셸 전체)에 있다 — 2026-08-15 사이드바 포함 확장 */}
              {DASHBOARD_PANEL_ORDER.map((menu) => (
                <KeepAlivePanel key={menu} active={isPanelActive(menu)}>
                  {dashboardPanels[menu]}
                </KeepAlivePanel>
              ))}

              </PageTransition>

            </div>
          </div>

          {isMgoModalOpen && <MgoChartModal currentPrice={mgoData.price} onClose={() => setIsMgoModalOpen(false)} />}
        </main>
      </div>
    </div>
  );
}
