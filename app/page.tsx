'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import ErrorBoundary from '../components/ErrorBoundary';
import styles from './page.module.css';
import { Activity, Anchor, Ship, Lock, Radio, BarChart2, Navigation, Factory, BookOpen, Waves, Fish, Hexagon, Command, Leaf, Menu, X, Snowflake, CarFront, Shrimp, Droplets, FishSymbol, Shell, Nut, Sprout, LeafyGreen, Carrot, Coffee, Cherry, Drumstick, Beef,  Octagon, Box, TestTube, ShieldCheck} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ActiveMenu,
  getDashboardAccent,
  getDashboardTitle,
  isActiveMenu,
  KEYBOARD_SHORTCUT_MENUS,
  PROTECTED_OPERATION_MENUS,
} from '../lib/dashboard-registry';

// ─── Always-loaded (lightweight or market page essentials) ───
import LiveTicker from '../components/LiveTicker';
import PageTransition from '../components/PageTransition';
import AmbientBackground from '../components/AmbientBackground';
import CommandPalette from '../components/CommandPalette';
import KeepAlivePanel from '../components/KeepAlivePanel';

// ─── Dynamic imports (loaded on-demand per page) ───
const MgoChartModal = dynamic(() => import('../components/MgoChartModal'));
const FleetCommandCenter = dynamic(() => import('../components/FleetCommandCenter'));
// ReeferFreightChart·TraderImportChart 제거 (2026-06-11): 렌더되지 않는 죽은 import였고,
// 각각 합성 산식 라우트(/api/logistics/freight·trader-import, A-01 위반으로 비활성화)에 의존.
const UnloadingStatus = dynamic(() => import('../components/UnloadingStatus'));
const MackerelDashboard = dynamic(() => import('../components/MackerelDashboard'));
const GalchiDashboard = dynamic(() => import('../components/GalchiDashboard'));
const SquidDashboard = dynamic(() => import('../components/SquidDashboard'));
const JukkumiDashboard = dynamic(() => import('../components/JukkumiDashboard'));
const OctopusDashboard = dynamic(() => import('../components/OctopusDashboard'));
const PollockDashboard = dynamic(() => import('../components/PollockDashboard'));
const FlatfishDashboard = dynamic(() => import('../components/FlatfishDashboard'));
const ShrimpDashboard = dynamic(() => import('../components/ShrimpDashboard'));
const SalmonDashboard = dynamic(() => import('../components/SalmonDashboard'));
const CashewStrategy = dynamic(() => import('../components/CashewStrategy'));
const CassavaDashboard = dynamic(() => import('../components/CassavaDashboard'));
const GarlicDashboard = dynamic(() => import('../components/GarlicDashboard'));
const CarrotDashboard = dynamic(() => import('../components/CarrotDashboard'));
const CocoaDashboard = dynamic(() => import('../components/CocoaDashboard'));
const ChickenDashboard = dynamic(() => import('../components/ChickenDashboard'));
const PorkDashboard = dynamic(() => import('../components/PorkDashboard'));
const BeefDashboard = dynamic(() => import('../components/BeefDashboard'));
const WhelkDashboard = dynamic(() => import('../components/WhelkDashboard'));
const KimDashboard = dynamic(() => import('../components/KimDashboard'));
const TunaDashboard = dynamic(() => import('../components/TunaDashboard'));
const LogisticsDashboard = dynamic(() => import('../components/LogisticsDashboard'));

const SEAsiaOEMDashboard = dynamic(() => import('../components/SEAsiaOEMDashboard'));
const UsedCarExport = dynamic(() => import('../components/UsedCarExport'));
const FleetStrategyMatrix = dynamic(() => import('../components/FleetStrategyMatrix'));
const KoreaConsignmentDashboard = dynamic(() => import('../components/KoreaConsignmentDashboard'));
const MangosteenDashboard = dynamic(() => import('../components/MangosteenDashboard'));
const ColdStorageDashboard = dynamic(() => import('../components/ColdStorageDashboard'));
const MarketDashboard = dynamic(() => import('../components/MarketDashboard'));
const ResearchLabDashboard = dynamic(() => import('../components/ResearchLabDashboard'));
const PurseSeinerDashboard = dynamic(() => import('../components/PurseSeinerDashboard'));
const MscStrategyDashboard = dynamic(() => import('../components/MscStrategyDashboard'));
const SashimiSteakDashboard = dynamic(() => import('../components/SashimiSteakDashboard'));

const OPERATION_ACCESS_STORAGE_KEY = 'silla-operation-access';
const OPERATION_PASSWORD = '349900';


export default function Home() {
  const [mgoData, setMgoData] = useState({ price: 0, change: 0, date: '', loading: true });
  
  // 전체 Supabase 로그인 대신 실시간 운영 4개 메뉴만 세션 비밀번호로 잠근다.
  const session = { user: { email: 'public@silla.local' } };
  const authChecked = true;
  const pathname = usePathname();
  
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(() => {
    const path = pathname?.replace('/', '');
    if (path && isActiveMenu(path)) return path;
    return 'market';
  });

  useEffect(() => {
    const currentPath = window.location.pathname.replace('/', '');
    if (currentPath !== activeMenu) {
      window.history.replaceState(null, '', `/${activeMenu}`);
    }
  }, [activeMenu]);
  const [operationAccessGranted, setOperationAccessGranted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(OPERATION_ACCESS_STORAGE_KEY) === 'granted';
  });
  const [operationPassword, setOperationPassword] = useState('');
  const [operationAuthError, setOperationAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  
  // Modals state
  const [isMgoModalOpen, setIsMgoModalOpen] = useState(false);
  
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navigateToMenu = React.useCallback((menu: ActiveMenu) => {
    setOperationAuthError('');
    setOperationPassword('');
    setActiveMenu(menu);
  }, []);

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      if (error) {
        setAuthError(error.message);
      } else {
        setAuthSuccess('가입 신청이 완료되었습니다. 관리자의 승인을 기다려주세요.');
        setIsSignUp(false); // 가입 신청 후 로그인 화면으로 전환
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setAuthError('아직 관리자의 승인(Verify)이 완료되지 않았습니다.');
        } else {
          setAuthError('로그인 실패: 이메일과 내선번호를 확인하세요. (' + error.message + ')');
        }
      }
    }
    setAuthLoading(false);
  };

  const handleOperationPasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (operationPassword.trim() !== OPERATION_PASSWORD) {
      setOperationAuthError('비밀번호를 다시 확인해주세요.');
      return;
    }

    window.sessionStorage.setItem(OPERATION_ACCESS_STORAGE_KEY, 'granted');
    setOperationAccessGranted(true);
    setOperationAuthError('');
    setOperationPassword('');
  };

  const handleOperationLock = () => {
    window.sessionStorage.removeItem(OPERATION_ACCESS_STORAGE_KEY);
    setOperationAccessGranted(false);
    setOperationPassword('');
    setOperationAuthError('');
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
  const isOperationMenuLocked = PROTECTED_OPERATION_MENUS.has(activeMenu) && !operationAccessGranted;
  const activeMenuTitle = getDashboardTitle(activeMenu);
  const isPanelActive = (menu: ActiveMenu) => (
    activeMenu === menu && (!PROTECTED_OPERATION_MENUS.has(menu) || operationAccessGranted)
  );

  return (
    <div className={styles.appWrapper}>
      <AmbientBackground accent={ambientAccent} />
      {/* SwimmingTuna removed per user request */}
      <CommandPalette onNavigate={(menu) => navigateToMenu(menu as ActiveMenu)} />
      
      {/* Mobile Hamburger Button */}
      <button 
        className={styles.mobileMenuBtn} 
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        aria-label="Toggle menu"
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
          <Image src="/logo1.png" alt="Company Logo" width={184} height={48} style={{ height: '48px', width: 'auto', objectFit: 'contain', marginBottom: '8px' }} />
          <p className={styles.subtitle} style={{ fontSize: '0.75rem', marginBottom: '8px' }}>Tuna Market Intelligence</p>
          <div style={{
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
            borderTop: '1px solid rgba(140,170,255,0.10)',
            paddingTop: '8px',
            display: 'inline-block'
          }}>
            Architected by <span style={{
              fontWeight: 'bold',
              fontSize: '0.85rem',
              letterSpacing: '1px',
              background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>이동건</span>
          </div>
        </Link>
        
        <div className={styles.sidebarTitle}>📡 실시간 운영</div>
        
        <button 
          className={`${styles.menuItem} ${activeMenu === 'market' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('market'); setIsMobileSidebarOpen(false); }}
        >
          <BarChart2 size={18} />
          <span>시장 동향 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Market)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'fleet' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('fleet'); setIsMobileSidebarOpen(false); }}
        >
          <Navigation size={18} />
          <span>선단 운영 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Fleet)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'unloading' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('unloading'); setIsMobileSidebarOpen(false); }}
        >
          <Anchor size={18} />
          <span>하역 현황 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Unloading)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'logistics' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('logistics'); setIsMobileSidebarOpen(false); }}
        >
          <Factory size={18} />
          <span>물류·가공 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Logistics)</span></span>
        </button>

        <div className={styles.sidebarTitle} style={{ marginTop: '1.25rem' }}>🐟 어종별 인텔리전스</div>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'value-chain' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('value-chain'); setIsMobileSidebarOpen(false); }}
        >
          <Fish size={18} />
          <span>참치 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Tuna)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'mackerel' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('mackerel'); setIsMobileSidebarOpen(false); }}
        >
          <FishSymbol size={18} />
          <span>고등어 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Mackerel)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'galchi' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('galchi'); setIsMobileSidebarOpen(false); }}
        >
          <Fish size={18} />
          <span>갈치 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Hairtail)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'squid' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('squid'); setIsMobileSidebarOpen(false); }}
        >
          <Droplets size={18} />
          <span>오징어 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Squid)</span></span>
        </button>

        <button
          className={`${styles.menuItem} ${activeMenu === 'jukkumi' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('jukkumi'); setIsMobileSidebarOpen(false); }}
        >
          <Octagon size={18} />
          <span>주꾸미 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Webfoot Octopus)</span></span>
        </button>

        <button
          className={`${styles.menuItem} ${activeMenu === 'octopus' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('octopus'); setIsMobileSidebarOpen(false); }}
        >
          <Octagon size={18} />
          <span>낙지 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Long-Arm Octopus)</span></span>
        </button>

        <button
          className={`${styles.menuItem} ${activeMenu === 'pollock' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('pollock'); setIsMobileSidebarOpen(false); }}
        >
          <Snowflake size={18} />
          <span>명태 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Pollock)</span></span>
        </button>

        <button
          className={`${styles.menuItem} ${activeMenu === 'flatfish' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('flatfish'); setIsMobileSidebarOpen(false); }}
        >
          <FishSymbol size={18} />
          <span>가자미 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Flatfish)</span></span>
        </button>

        <button
          className={`${styles.menuItem} ${activeMenu === 'shrimp' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('shrimp'); setIsMobileSidebarOpen(false); }}
        >
          <Shrimp size={18} />
          <span>새우 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Shrimp)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'whelk' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('whelk'); setIsMobileSidebarOpen(false); }}
        >
          <Shell size={18} />
          <span>골뱅이 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Whelk)</span></span>
        </button>

        <button
          className={`${styles.menuItem} ${activeMenu === 'kim' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('kim'); setIsMobileSidebarOpen(false); }}
        >
          <Leaf size={18} />
          <span>김 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Laver)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'salmon' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('salmon'); setIsMobileSidebarOpen(false); }}
        >
          <Waves size={18} />
          <span>연어 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Salmon)</span></span>
        </button>

        <div className={styles.sidebarTitle} style={{ marginTop: '1.25rem' }}>🔬 전략 분석</div>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'cold-storage' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('cold-storage'); setIsMobileSidebarOpen(false); }}
        >
          <Box size={18} />
          <span>냉동창고 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Cold Storage)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'fleet-strategy' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('fleet-strategy'); setIsMobileSidebarOpen(false); }}
        >
          <Ship size={18} />
          <span>선대 현황 및 분석</span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'korea-market' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('korea-market'); setIsMobileSidebarOpen(false); }}
        >
          <Anchor size={18} />
          <span>국내 위판장 인텔리전스</span>
        </button>



        <button 
          className={`${styles.menuItem} ${activeMenu === 'seasia-oem' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('seasia-oem'); setIsMobileSidebarOpen(false); }}
        >
          <Factory size={18} />
          <span>글로벌 OEM <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(VN/TH)</span></span>
        </button>


        <button 
          className={`${styles.menuItem} ${activeMenu === 'used-car' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('used-car'); setIsMobileSidebarOpen(false); }}
        >
          <CarFront size={18} />
          <span>중고차 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Used Car)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'msc' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('msc'); setIsMobileSidebarOpen(false); }}
        >
          <ShieldCheck size={18} />
          <span>MSC <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(지속가능성)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'sashimi-steak' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('sashimi-steak'); setIsMobileSidebarOpen(false); }}
        >
          <FishSymbol size={18} />
          <span>사시미/스테이크 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Sashimi/Steak)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'research-lab' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('research-lab'); setIsMobileSidebarOpen(false); }}
        >
          <TestTube size={18} />
          <span>연구 재료 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Research Lab)</span></span>
        </button>

        <div className={styles.sidebarTitle} style={{ marginTop: '1.25rem' }}>🌾 농산물 인텔리전스</div>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'cashew' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('cashew'); setIsMobileSidebarOpen(false); }}
        >
          <Nut size={18} />
          <span>캐슈넛 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Cashew)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'cassava' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('cassava'); setIsMobileSidebarOpen(false); }}
        >
          <Sprout size={18} />
          <span>카사바 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Cassava)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'garlic' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('garlic'); setIsMobileSidebarOpen(false); }}
        >
          <LeafyGreen size={18} />
          <span>마늘 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Garlic)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'carrot' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('carrot'); setIsMobileSidebarOpen(false); }}
        >
          <Carrot size={18} />
          <span>당근 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Carrot)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'cocoa' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('cocoa'); setIsMobileSidebarOpen(false); }}
        >
          <Coffee size={18} />
          <span>코코아 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Cocoa)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'mangosteen' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('mangosteen'); setIsMobileSidebarOpen(false); }}
        >
          <Cherry size={18} />
          <span>망고스틴 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Mangosteen)</span></span>
        </button>

        <div className={styles.sidebarTitle} style={{ marginTop: '1.25rem' }}>🥩 축산물 인텔리전스</div>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'chicken' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('chicken'); setIsMobileSidebarOpen(false); }}
        >
          <Drumstick size={18} />
          <span>닭 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Chicken)</span></span>
        </button>

        <button 
          className={`${styles.menuItem} ${activeMenu === 'pork' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('pork'); setIsMobileSidebarOpen(false); }}
        >
          <Hexagon size={18} />
          <span>돼지고기 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Pork)</span></span>
        </button>

        <button
          className={`${styles.menuItem} ${activeMenu === 'beef' ? styles.menuItemActive : ''}`}
          onClick={() => { handleMenuClick('beef'); setIsMobileSidebarOpen(false); }}
        >
          <Beef size={18} />
          <span>소고기 <span style={{ fontSize: '0.75em', opacity: 0.8 }}>(Beef)</span></span>
        </button>

        <div style={{ flex: 1 }} />


        <div style={{
          padding: '8px 12px', margin: '8px 0',
          background: 'rgba(6, 182, 212, 0.05)',
          border: '1px solid rgba(6, 182, 212, 0.15)',
          borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          cursor: 'pointer',
        }} onClick={() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
        }} title="⌘K 로 검색">
          <Command size={12} /> ⌘K 빠른 검색
        </div>
        
        
        <button 
          className={styles.menuItem}
          onClick={() => window.open('https://wholesale-dashboard-navy.vercel.app/', '_blank')}
          style={{ marginBottom: '8px', color: '#10b981' }}
        >
          <Leaf size={18} />
          <span>청과제국 동화청과</span>
        </button>

        <button 
          className={styles.menuItem}
          onClick={() => window.open('https://silla-history.vercel.app/', '_blank')}
          style={{ marginBottom: '8px', color: '#eab308' }}
        >
          <BookOpen size={18} />
          <span>신라교역 50년사</span>
        </button>
        
        {/* Operational access state */}
        {operationAccessGranted ? (
          <button
            onClick={handleOperationLock}
            style={{
              fontSize: '12px',
              padding: '10px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '8px',
              color: 'var(--accent-danger)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              marginTop: '1rem'
            }}
          >
            <Lock size={14} /> 실시간 운영 잠금
          </button>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1rem' }}>
            <Lock size={14} /> 실시간 운영 잠김
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        <main className={styles.container}>
          {/* A-5 인증 게이팅: 세션 확정 전 → 로딩 / 미로그인 → 로그인 랜딩만 / 로그인 → 대시보드 마운트 */}
          {!authChecked ? (
            <div style={{
              minHeight: 'calc(100vh - 40px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: 'var(--text-muted)',
              fontSize: '14px'
            }}>
              <Activity size={16} /> 접속 권한 확인 중...
            </div>
          ) : session ? (
          <>
          {isOperationMenuLocked && (
            <div className={styles.landingOverlay} style={{ position: 'relative', inset: 'auto', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: 'clamp(32px, 8vh, 92px) var(--space-4)' }}>
              <div className={styles.loginPanel} style={{ width: 'min(420px, 100%)' }}>
                <Lock size={34} strokeWidth={1.5} style={{ margin: '0 auto 16px auto', color: 'var(--text-main)' }} />
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-main)' }}>
                  {activeMenuTitle} 접근 확인
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '22px', lineHeight: 1.6 }}>
                  실시간 운영 메뉴는 내부 확인 후 열람할 수 있습니다.
                </p>

                <form onSubmit={handleOperationPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="운영 비밀번호"
                    value={operationPassword}
                    onChange={(e) => setOperationPassword(e.target.value)}
                    autoFocus
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--panel-border)',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      color: 'var(--text-main)',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    required
                  />
                  {operationAuthError && (
                    <div style={{ color: 'var(--accent-danger)', fontSize: '12px', textAlign: 'left', marginTop: '-4px' }}>
                      {operationAuthError}
                    </div>
                  )}
                  <button
                    type="submit"
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--accent-primary)',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      marginTop: '8px',
                      transition: 'background-color 0.2s, transform 0.1s'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    확인
                  </button>
                </form>

                <div style={{ marginTop: '18px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  보호 대상: 시장 동향 · 선단 운영 · 하역 현황 · 물류·가공
                </div>
              </div>
            </div>
          )}

          {!isOperationMenuLocked && activeMenu === 'market' && (
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

              <KeepAlivePanel active={isPanelActive('market')}>
                <MarketDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={isPanelActive('fleet')}>
                <FleetCommandCenter />
              </KeepAlivePanel>

              <KeepAlivePanel active={isPanelActive('logistics')}>
                <LogisticsDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'cold-storage'}>
                <ColdStorageDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'mackerel'}>
                <MackerelDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'galchi'}>
                <GalchiDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'squid'}>
                <SquidDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'jukkumi'}>
                <JukkumiDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'octopus'}>
                <OctopusDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'pollock'}>
                <PollockDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'flatfish'}>
                <FlatfishDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'shrimp'}>
                <ShrimpDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'whelk'}>
                <WhelkDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'kim'}>
                <KimDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'salmon'}>
                <SalmonDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'cashew'}>
                <CashewStrategy />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'cassava'}>
                <CassavaDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'garlic'}>
                <GarlicDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'carrot'}>
                <CarrotDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'cocoa'}>
                <CocoaDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'mangosteen'}>
                <ErrorBoundary fallbackTitle="MangosteenDashboard Error">
                  <MangosteenDashboard />
                </ErrorBoundary>
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'chicken'}>
                <ChickenDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'pork'}>
                <PorkDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'beef'}>
                <BeefDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'used-car'}>
                <UsedCarExport />
              </KeepAlivePanel>

              <KeepAlivePanel active={isPanelActive('unloading')}>
                <UnloadingStatus />
              </KeepAlivePanel>



              <KeepAlivePanel active={activeMenu === 'value-chain'}>
                <TunaDashboard />
              </KeepAlivePanel>



              <KeepAlivePanel active={activeMenu === 'seasia-oem'}>
                <SEAsiaOEMDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'fleet-strategy'}>
                <FleetStrategyMatrix />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'korea-market'}>
                <KoreaConsignmentDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'research-lab'}>
                <ResearchLabDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'purse-seiner-db'}>
                <PurseSeinerDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'msc'}>
                <MscStrategyDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'sashimi-steak'}>
                <SashimiSteakDashboard />
              </KeepAlivePanel>

              </PageTransition>

            </div>
          </div>

          {isMgoModalOpen && <MgoChartModal currentPrice={mgoData.price} onClose={() => setIsMgoModalOpen(false)} />}
          </>
          ) : (
              /* 미로그인 — 대시보드 미마운트, 정적 소개 + 로그인 랜딩만 렌더 (atuna 페이월 fetch 없음 — 단 상단 useEffect의 mgo/exchange/tuna-live 공개 API 호출은 세션 무관 실행됨) */
              <div className={styles.landingOverlay} style={{ position: 'relative', inset: 'auto' }}>
                <div className={styles.landingTopRow}>
                  {/* Premium Hero Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={styles.landingHero}
                  >
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                      className={styles.landingBrand}
                    >
                      <Image src="/logo1.png" alt="Silla Co." width={345} height={90} className={styles.landingLogo} />
                      <h1 className={styles.landingTitle}>TUNA KINGDOM</h1>
                      <p className={styles.landingSubtitle}>S-Grade Executive Intelligence</p>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className={styles.landingMessage}
                    >
                      <p>글로벌 수산·물류 밸류체인의 핵심 동향을 실시간으로 통제합니다.</p>
                      <p>오직 인가된 임원진을 위한 최상위 전략 의사결정 커맨드 센터.</p>
                      <div style={{
                        marginTop: '18px',
                        padding: '14px 16px',
                        background: 'rgba(20, 28, 52, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        lineHeight: 1.9,
                        color: 'var(--text-muted)'
                      }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>제공 메뉴 미리보기</div>
                        <div>📡 실시간 운영 — 시장 동향 · 선단 운영 · 하역 현황 · 물류·가공</div>
                        <div>🐟 어종별 인텔리전스 — 참치 · 고등어 · 갈치 · 오징어 · 명태 · 새우 · 연어 외</div>
                        <div>🔬 전략 분석 — 냉동창고 · 선대 분석 · 글로벌 OEM · MSC · 사시미/스테이크</div>
                        <div>🌾 농·축산물 — 캐슈넛 · 카사바 · 코코아 · 망고스틴 · 닭 · 돼지고기 · 소고기</div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Login Form Panel */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className={styles.loginPanel}
                  >
                    <Lock size={36} strokeWidth={1.5} style={{ margin: '0 auto 16px auto', color: 'var(--text-main)' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-main)' }}>
                      {isSignUp ? '가입 신청하기' : '대시보드 로그인'}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                      {isSignUp 
                        ? '가입 신청 후 관리자가 Supabase에서 이메일을 승인(Verify)하면 접속할 수 있습니다.' 
                        : '실시간 시장 정보, 선단 동향 및 데이터를 열람하기 위해 로그인해주세요.'}
                    </p>
                    
                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {isSignUp && (
                        <input
                          type="text"
                          placeholder="이름 (Name)"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '8px',
                            border: '1px solid var(--panel-border)',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            color: 'var(--text-main)',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                          }}
                          required
                        />
                      )}
                      <input
                        type="email"
                        placeholder="이메일 (ID)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--panel-border)',
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          color: 'var(--text-main)',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        required
                      />
                      <input
                        type="password"
                        placeholder="내선번호 (비밀번호)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid var(--panel-border)',
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          color: 'var(--text-main)',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        required
                      />
                      {authError && <div style={{ color: 'var(--accent-danger)', fontSize: '12px', textAlign: 'left', marginTop: '-4px' }}>{authError}</div>}
                      {authSuccess && <div style={{ color: '#10b981', fontSize: '12px', textAlign: 'left', marginTop: '-4px', fontWeight: 'bold' }}>{authSuccess}</div>}
                      <button
                        type="submit"
                        disabled={authLoading}
                        style={{
                          padding: '14px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--accent-primary)',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          border: 'none',
                          cursor: authLoading ? 'default' : 'pointer',
                          opacity: authLoading ? 0.7 : 1,
                          marginTop: '10px',
                          transition: 'background-color 0.2s, transform 0.1s'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        {authLoading ? '처리중...' : (isSignUp ? '신청 완료' : '보안 접속 승인')}
                      </button>
                    </form>
                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      style={{
                        marginTop: '16px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {isSignUp ? '이미 승인된 계정이 있으신가요? 로그인' : '권한이 없으신가요? 가입 신청하기'}
                    </button>
                  </motion.div>
                </div>

                {/* Recent Updates Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className={styles.landingUpdates}
                >
                  <h3 className={styles.landingUpdatesTitle}>
                    <Radio size={16} color="var(--accent-primary)" />
                    최근 시스템 주요 업데이트
                  </h3>
                  <div className={styles.landingUpdatesGrid}>
                    <div className={styles.updateItem}>
                      <span className={styles.updateDate}>26.06.02</span>
                      <span className={styles.updateContent}>물류 현황 패널: BAO LUCKY BKK 하역 개시 (진척률 4.8%) 및 1일차 결과 반영</span>
                    </div>
                    <div className={styles.updateItem}>
                      <span className={styles.updateDate}>26.05.31</span>
                      <span className={styles.updateContent}>선단 운영 커맨드 센터: 5월 4주차 주간/월간 선장 실적 및 어획량 차트 갱신</span>
                    </div>
                    <div className={styles.updateItem}>
                      <span className={styles.updateDate}>26.05.31</span>
                      <span className={styles.updateContent}>물류 현황 패널: SEIN PHOENIX BKK 하역 진척률(33.1%) 실시간 연동 반영</span>
                    </div>
                    <div className={styles.updateItem}>
                      <span className={styles.updateDate}>26.05.30</span>
                      <span className={styles.updateContent}>참치(Tuna) 밸류체인: 태국산 가다랑어(SKJ) 수입 단가 및 Bangkok MGO 유가 업데이트</span>
                    </div>
                    <div className={styles.updateItem}>
                      <span className={styles.updateDate}>26.05.29</span>
                      <span className={styles.updateContent}>가자미(Flatfish) 대시보드 신규 런칭 및 글로벌 해상 운임(SCFI) 실시간 연동</span>
                    </div>
                  </div>
                </motion.div>
              </div>
          )}
        </main>
      </div>
    </div>
  );
}
