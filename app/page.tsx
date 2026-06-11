'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ErrorBoundary from '../components/ErrorBoundary';
import styles from './page.module.css';
import CountUp from 'react-countup';
import { Database, Activity, Anchor, TrendingUp, TrendingDown, Ship, Sun, Moon, AlertTriangle, Lock, Radio, BarChart2, Navigation, Factory, BookOpen, Clock, Cpu, Target, ShoppingCart, Waves, Workflow, Fish, Hexagon, MonitorPlay, Command, Wrench, Leaf, Menu, X, Snowflake, CarFront, Compass, Shrimp, Droplets, FishSymbol, Shell, Nut, Sprout, LeafyGreen, Carrot, Coffee, Cherry, Drumstick, Beef, Search, FlaskConical , ScanSearch, Octagon, Box, FlaskRound, Map, TestTube, ShieldCheck} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { playVHFRadioChatter } from '../lib/audio';
import { motion } from 'framer-motion';

// ─── Always-loaded (lightweight or market page essentials) ───
import NotebookLMInsight from '../components/NotebookLMInsight';
import LiveTicker from '../components/LiveTicker';
import TermTooltip from '../components/TermTooltip';
import PageTransition from '../components/PageTransition';
import AmbientBackground from '../components/AmbientBackground';
import CommandPalette from '../components/CommandPalette';
import ScrollReveal from '../components/ScrollReveal';
import KeepAlivePanel from '../components/KeepAlivePanel';

// ─── Dynamic imports (loaded on-demand per page) ───
const MgoChartModal = dynamic(() => import('../components/MgoChartModal'));
const FleetCommandCenter = dynamic(() => import('../components/FleetCommandCenter'));
const FishingDaysStatus = dynamic(() => import('../components/FishingDaysStatus'));
const VesselVdsStatus = dynamic(() => import('../components/VesselVdsStatus'));
const ReeferMovement = dynamic(() => import('../components/ReeferMovement'));
// ReeferFreightChart·TraderImportChart 제거 (2026-06-11): 렌더되지 않는 죽은 import였고,
// 각각 합성 산식 라우트(/api/logistics/freight·trader-import, A-01 위반으로 비활성화)에 의존.
const GensanImportChart = dynamic(() => import('../components/GensanImportChart'));
const CanneryStatusCharts = dynamic(() => import('../components/CanneryStatusCharts'));
const GensanCanneryStatusCharts = dynamic(() => import('../components/GensanCanneryStatusCharts'));
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
const TunaDashboard = dynamic(() => import('../components/TunaDashboard'));
const LogisticsDashboard = dynamic(() => import('../components/LogisticsDashboard'));

const FieldTools = dynamic(() => import('../components/FieldTools'));
const SEAsiaOEMDashboard = dynamic(() => import('../components/SEAsiaOEMDashboard'));
const UsedCarExport = dynamic(() => import('../components/UsedCarExport'));
const AIForecast = dynamic(() => import('../components/AIForecast'));
const StrategyIntel = dynamic(() => import('../components/StrategyIntel'));
const RetailPOS = dynamic(() => import('../components/RetailPOS'));
const FleetStrategyMatrix = dynamic(() => import('../components/FleetStrategyMatrix'));
const KoreaConsignmentDashboard = dynamic(() => import('../components/KoreaConsignmentDashboard'));
const MangosteenDashboard = dynamic(() => import('../components/MangosteenDashboard'));
const ColdStorageDashboard = dynamic(() => import('../components/ColdStorageDashboard'));
const MarketDashboard = dynamic(() => import('../components/MarketDashboard'));
const ResearchLabDashboard = dynamic(() => import('../components/ResearchLabDashboard'));
const PurseSeinerDashboard = dynamic(() => import('../components/PurseSeinerDashboard'));
const MscStrategyDashboard = dynamic(() => import('../components/MscStrategyDashboard'));
const SashimiSteakDashboard = dynamic(() => import('../components/SashimiSteakDashboard'));


const initialChartData = [
  { month: '21-Q1', import: 52000, export: 38000, priceHist: 1283, brentPriceHist: 480 },
  { month: '21-Q2', import: 54000, export: 41000, priceHist: 1323, brentPriceHist: 544 },
  { month: '21-Q3', import: 58000, export: 45000, priceHist: 1400, brentPriceHist: 584 },
  { month: '21-Q4', import: 61000, export: 48000, priceHist: 1616, brentPriceHist: 640 },
  { month: '22-Q1', import: 63000, export: 46000, priceHist: 1716, brentPriceHist: 840 },
  { month: '22-Q2', import: 59000, export: 42000, priceHist: 1608, brentPriceHist: 960 },
  { month: '22-Q3', import: 62000, export: 44000, priceHist: 1666, brentPriceHist: 760 },
  { month: '22-Q4', import: 65000, export: 47000, priceHist: 1660, brentPriceHist: 680 },
  { month: '23-Q1', import: 45000, export: 35000, priceHist: 1820, brentPriceHist: 656 },
  { month: '23-Q2', import: 38000, export: 29000, priceHist: 2000, brentPriceHist: 624, note: '라니냐 장기화 (어획 급감)' },
  { month: '23-Q3', import: 42000, export: 32000, priceHist: 1800, brentPriceHist: 696 },
  { month: '23-Q4', import: 48000, export: 38000, priceHist: 1516, brentPriceHist: 640 },
  { month: '24-Q1', import: 55000, export: 42000, priceHist: 1333, brentPriceHist: 664 },
  { month: '24-Q2', import: 57000, export: 44000, priceHist: 1478, brentPriceHist: 680 },
  { month: '24-Q3', import: 59000, export: 45000, priceHist: 1576, brentPriceHist: 624 },
  { month: '24-Q4', import: 60000, export: 46000, priceHist: 1463, brentPriceHist: 600 },
  { month: '25-Q1', import: 58000, export: 45000, priceHist: 1660, brentPriceHist: 640 },
  { month: '25-Q2', import: 54000, export: 43000, priceHist: 1510, brentPriceHist: 672 },
  { month: '25-Q3', import: 52000, export: 41000, priceHist: 1550, brentPriceHist: 688 },
  { month: '25-Q4', import: 55000, export: 43000, priceHist: 1573, brentPriceHist: 664 },
  { month: '26-Q1', import: 42000, export: 32000, priceHist: 1580, brentPriceHist: 760 },
  { month: '26-Q2', import: 38000, export: 28000, priceHist: 2000, brentPriceHist: 785, priceEst: 2000, note: '전쟁 발발 (지정학 리스크)' },
];


export default function Home() {
  const router = useRouter();
  const [chartData, setChartData] = useState<any[]>(initialChartData);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCrisisMode, setIsCrisisMode] = useState(false);
  const [isRadioOn, setIsRadioOn] = useState(false);
  const [mgoData, setMgoData] = useState({ price: 0, change: 0, date: '', loading: true });
  const [fxData, setFxData] = useState({ usd_krw: 0, date: '', loading: true });
  const [liveData, setLiveData] = useState<any>(null);
  
  // Auth state
  const [session, setSession] = useState<any>(
    (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))) ? { user: { email: 'sillavip@sla.co.kr' } } : null
  );
  // 세션 확정 여부 — getSession() 완료 전에는 대시보드/로그인 어느 쪽도 마운트하지 않음 (플래시 방지)
  const [authChecked, setAuthChecked] = useState<boolean>(
    (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')))
  );
  const pathname = usePathname();
  
  const [activeMenu, setActiveMenu] = useState<'market' | 'fleet' | 'logistics' | 'unloading' | 'value-chain' | 'mackerel' | 'galchi' | 'squid' | 'jukkumi' | 'octopus' | 'cashew' | 'cassava' | 'garlic' | 'carrot' | 'cocoa' | 'mangosteen' | 'chicken' | 'pork' | 'beef' | 'whelk' | 'used-car' | 'pollock' | 'flatfish' | 'shrimp' | 'salmon' | 'seasia-oem' | 'fleet-strategy' | 'korea-market' | 'cold-storage' | 'research-lab' | 'purse-seiner-db' | 'msc' | 'sashimi-steak'>(() => {
    const path = pathname?.replace('/', '');
    const validMenus = ['market', 'fleet', 'logistics', 'unloading', 'value-chain', 'mackerel', 'galchi', 'squid', 'jukkumi', 'octopus', 'cashew', 'cassava', 'garlic', 'carrot', 'cocoa', 'mangosteen', 'chicken', 'pork', 'beef', 'whelk', 'used-car', 'pollock', 'flatfish', 'shrimp', 'salmon', 'seasia-oem', 'fleet-strategy', 'korea-market', 'cold-storage', 'research-lab', 'purse-seiner-db', 'msc', 'sashimi-steak'];
    if (path && validMenus.includes(path)) return path as any;
    return 'market';
  });

  const isFirstMount = React.useRef(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname.replace('/', '');
      const validMenus = ['market', 'fleet', 'logistics', 'unloading', 'value-chain', 'mackerel', 'galchi', 'squid', 'jukkumi', 'octopus', 'cashew', 'cassava', 'garlic', 'carrot', 'cocoa', 'mangosteen', 'chicken', 'pork', 'beef', 'whelk', 'used-car', 'pollock', 'flatfish', 'shrimp', 'salmon', 'seasia-oem', 'fleet-strategy', 'korea-market', 'cold-storage', 'research-lab', 'purse-seiner-db', 'msc', 'sashimi-steak'];
      
      if (isFirstMount.current) {
        isFirstMount.current = false;
        if (currentPath && validMenus.includes(currentPath) && currentPath !== activeMenu) {
          setActiveMenu(currentPath as any);
          return;
        }
      }

      if (currentPath !== activeMenu) {
        window.history.replaceState(null, '', `/${activeMenu}`);
      }
    }
  }, [activeMenu]);

  const handleMenuClick = (menu: any) => {
    if (activeMenu === menu) {
      window.location.reload();
    } else {
      setActiveMenu(menu);
    }
  };
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

  // Scroll to top and update page title when activeMenu changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const titles: Record<string, string> = {
      'market': '시장 동향', 'fleet': '선단 운영', 'logistics': '물류·가공',
      'unloading': '하역 현황', 'value-chain': '참치', 'mackerel': '고등어', 'galchi': '갈치',
      'squid': '오징어', 'jukkumi': '주꾸미', 'octopus': '낙지', 'pollock': '명태', 'flatfish': '가자미', 'shrimp': '새우', 'salmon': '연어',
      'ranching': '참다랑어 축양', 'seasia-oem': '글로벌 OEM', 'petfood': '펫푸드', 'tuna-extract': '참치액젓', 'cold-storage': '냉동창고', 'msc': 'MSC 전략', 'sashimi-steak': '사시미/스테이크 전략',
      'cashew': '캐슈넛', 'cassava': '카사바', 'garlic': '마늘', 'carrot': '당근', 'cocoa': '코코아', 'mangosteen': '망고스틴', 'chicken': '닭', 'pork': '돼지고기', 'beef': '소고기', 'whelk': '골뱅이', 'used-car': '중고차', 'fleet-strategy': '선대 전략 분석', 'korea-market': '국내 위판장 인텔리전스', 'research-lab': '연구 재료',
    };
    document.title = `${titles[activeMenu] || activeMenu} | 참치왕국`;
  }, [activeMenu]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');

    // Supabase auth listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))) {
        setSession({ user: { email: 'sillavip@sla.co.kr' } });
      } else {
        setSession(session);
      }
      setAuthChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))) {
        setSession({ user: { email: 'sillavip@sla.co.kr' } });
      } else {
        setSession(session);
      }
      setAuthChecked(true);
    });
    
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
        } catch (err) {
          setMgoData({ price: finalPrice, change: finalChange, date: today, loading: false });
        }
      
      // Inject real-time price into the chart data array
      setChartData(prev => {
        const newData = [...prev];
        const lastIdx = newData.length - 1;
        // Update current estimation point with exact live Brent price
        newData[lastIdx] = { ...newData[lastIdx], brentPriceEst: finalPrice, priceEst: 1975 };
        // Smooth the transition point
        newData[lastIdx - 1] = { ...newData[lastIdx - 1], brentPriceHist: finalPrice, brentPriceEst: finalPrice, priceHist: 1975, priceEst: 1975 };
        return newData;
      });
    }
    fetchMgoPrice();

    async function fetchExchangeRate() {
      try {
        const res = await fetch('/api/exchange', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setFxData({ usd_krw: data.usd_krw, date: data.date, loading: false });
        } else {
          setFxData({ usd_krw: 1455.75, date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'), loading: false });
        }
      } catch {
        setFxData({ usd_krw: 1455.75, date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'), loading: false });
      }
    }
    fetchExchangeRate();

    fetch('/api/tuna-live')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setLiveData(data.market);
        if (data.market && data.market.historicalChartData) {
          setChartData(data.market.historicalChartData);
        }
      })
      .catch(err => console.error("Failed to fetch live data", err));

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isRadioOn) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const scheduleNextTransmission = () => {
      // Random interval between 8 and 25 seconds
      const nextInterval = 8000 + Math.random() * 17000;
      timeoutId = setTimeout(() => {
        if (isRadioOn) {
          playVHFRadioChatter();
          scheduleNextTransmission();
        }
      }, nextInterval);
    };
    
    // Initial transmission shortly after turning on
    timeoutId = setTimeout(() => {
      playVHFRadioChatter();
      scheduleNextTransmission();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isRadioOn]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const toggleTheme = () => {
    if (isCrisisMode) return; // Disable standard theme toggle during crisis
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  };

  const playSirenAudio = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 0.4);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.8);
      osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 1.2);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 1.6);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + 1.5);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.6);
    } catch (e) {
      console.warn("Audio not supported or blocked");
    }
  };

  const toggleCrisisMode = () => {
    const newCrisis = !isCrisisMode;
    setIsCrisisMode(newCrisis);
    if (newCrisis) {
      document.documentElement.setAttribute('data-theme', 'crisis');
      playSirenAudio();
    } else {
      document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }
  };
  // Keyboard shortcuts for number keys
  useEffect(() => {
    const menuKeys = ['market', 'fleet', 'unloading', 'logistics', 'value-chain', 'mackerel', 'galchi', 'squid', 'jukkumi', 'octopus', 'pollock', 'flatfish', 'shrimp', 'salmon'] as const;
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= menuKeys.length) {
        setActiveMenu(menuKeys[num - 1] as any);
      }
      if (e.key === 'd' || e.key === 'D') toggleTheme();
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDarkMode, isCrisisMode]);

  // Ambient color based on active page
  const ambientAccent = (['cashew', 'cocoa'].includes(activeMenu)) ? 'emerald' as const
    : (['mackerel', 'galchi', 'fleet'].includes(activeMenu)) ? 'cyan' as const
    : 'cyan' as const;

  return (
    <div className={styles.appWrapper}>
      <AmbientBackground accent={ambientAccent} />
      {/* SwimmingTuna removed per user request */}
      <CommandPalette onNavigate={(menu) => setActiveMenu(menu as any)} />
      
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
        <a
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
          <img src="/logo1.png" alt="Company Logo" style={{ height: '48px', objectFit: 'contain', marginBottom: '8px' }} />
          <p className={styles.subtitle} style={{ fontSize: '0.75rem', marginBottom: '8px' }}>Tuna Market Intelligence</p>
          <div style={{
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
            borderTop: '1px solid rgba(255,255,255,0.05)',
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
        </a>
        
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
        
        {/* User / Meta in sidebar bottom */}
        {session ? (
            <button 
              onClick={handleLogout}
              style={{
                fontSize: '12px',
                padding: '10px 12px',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid var(--accent-danger)',
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
              <Lock size={14} /> Sign Out
            </button>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1rem' }}>
              <Lock size={14} /> Secured View
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

              <KeepAlivePanel active={activeMenu === 'market'}>
                <MarketDashboard />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'fleet'}>
                <FleetCommandCenter />
              </KeepAlivePanel>

              <KeepAlivePanel active={activeMenu === 'logistics'}>
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

              <KeepAlivePanel active={activeMenu === 'unloading'}>
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
                      <img src="/logo1.png" alt="Silla Co." className={styles.landingLogo} />
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
                        background: 'rgba(15, 23, 42, 0.5)',
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