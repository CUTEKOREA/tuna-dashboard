'use client';

import React, { useState } from 'react';
import { 
  Search, Globe, Database, Network, Mail, ArrowRight, BookOpen, ChevronRight, CheckCircle2, ShieldCheck, Zap, Copy, Loader2, BarChart2, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import styles from './TunaExtractDashboard.module.css';

// Expanded Mock Data for various commodities
const allMockSuppliers = [
  // Seafood
  { id: 1, name: 'PT. Ocean Harvest Indonesia', country: 'Indonesia', trust: 98, lastShipment: '2026-05-12', products: 'Frozen Tuna, Skipjack', category: 'tuna', hsCode: '1604.14', tariff: '8.5%' },
  { id: 2, name: 'Thai Union Group PCL', country: 'Thailand', trust: 99, lastShipment: '2026-05-10', products: 'Canned Tuna, Tuna Loins', category: 'tuna', hsCode: '1604.14', tariff: '8.5%' },
  { id: 3, name: 'Vinh Hoan Corp', country: 'Vietnam', trust: 95, lastShipment: '2026-05-09', products: 'Pangasius, Shrimp', category: 'shrimp', hsCode: '0306.17', tariff: '5.0%' },
  
  // Agriculture
  { id: 4, name: 'Shandong Jinxiang Garlic Group', country: '중국', trust: 96, lastShipment: '2026-05-11', products: 'Fresh Garlic, Peeled Garlic', category: 'garlic', hsCode: '0703.20', tariff: '15.0%' },
  { id: 5, name: 'Qingdao Agritech Exports', country: '중국', trust: 92, lastShipment: '2026-05-08', products: 'Garlic Flakes, Fresh Garlic', category: 'garlic', hsCode: '0703.20', tariff: '15.0%' },
  { id: 6, name: 'Olam Agri Vietnam', country: '베트남', trust: 97, lastShipment: '2026-05-12', products: 'Raw Cashew Nuts, W320', category: 'cashew', hsCode: '0801.32', tariff: '0.0%' },
  { id: 7, name: 'Cargill Cocoa West Africa', country: 'Ivory Coast', trust: 99, lastShipment: '2026-05-13', products: 'Cocoa Beans, Cocoa Butter', category: 'cocoa', hsCode: '1801.00', tariff: '2.0%' },
  { id: 8, name: 'Chanthaburi Fresh Fruits', country: '태국', trust: 94, lastShipment: '2026-05-11', products: 'Fresh Mangosteen, Tropical Fruits', category: 'mangosteen', hsCode: '0804.50', tariff: '24.0%' },
  { id: 9, name: 'Agro Cassava Exporters', country: 'Nigeria', trust: 90, lastShipment: '2026-05-02', products: 'Dried Cassava Chips', category: 'cassava', hsCode: '0714.10', tariff: '5.0%' }
];

const trendData = [
  { month: 'Jan', demand: 4000 }, { month: 'Feb', demand: 4500 },
  { month: 'Mar', demand: 4200 }, { month: 'Apr', demand: 5800 },
  { month: 'May', demand: 6200 }, { month: 'Jun', demand: 7100 },
];

export default function SupplierDiscoveryDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeHsCode, setActiveHsCode] = useState({ code: '', tariff: '' });
  
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isGeneratingRfq, setIsGeneratingRfq] = useState(false);
  const [rfqText, setRfqText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Macro Search State
  const [macroItem, setMacroItem] = useState('');
  const [macroCountry, setMacroCountry] = useState('중국');
  const [isMacroSearching, setIsMacroSearching] = useState(false);
  const [macroData, setMacroData] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const results = allMockSuppliers.filter(s => 
        s.category.includes(query) || s.products.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
      );
      
      if (results.length === 0) {
        setSearchResults([{ id: 999, name: 'Global Agri Trading Corp', country: 'Singapore', trust: 88, lastShipment: '2026-05-05', products: searchQuery, category: 'general', hsCode: 'Unknown', tariff: 'N/A' }]);
        setActiveHsCode({ code: 'Auto-Matched', tariff: 'TBD' });
      } else {
        setSearchResults(results);
        setActiveHsCode({ code: results[0].hsCode, tariff: results[0].tariff });
      }
      setIsSearching(false);
    }, 1200);
  };

  const handleMacroSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!macroItem.trim()) return;
    setIsMacroSearching(true);
    try {
      const res = await fetch('/api/trade-macro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: macroItem, targetCountry: macroCountry })
      });
      const data = await res.json();
      setMacroData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMacroSearching(false);
    }
  };

  const handleOpenRfq = async (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsGeneratingRfq(true);
    setRfqText('');
    
    try {
      const res = await fetch('/api/generate-rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier, query: searchQuery })
      });
      const data = await res.json();
      if (data.rfq) {
        setRfqText(data.rfq);
      } else {
        setRfqText('Failed to generate RFQ. Please try again.');
      }
    } catch (err) {
      setRfqText('Error connecting to LLM server.');
    } finally {
      setIsGeneratingRfq(false);
    }
  };

  const handleCopyRfq = () => {
    navigator.clipboard.writeText(rfqText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getGradeColor = (grade: string) => {
    if(grade === 'S') return '#ec4899'; // Pink
    if(grade === 'A') return '#3b82f6'; // Blue
    if(grade === 'B') return '#10b981'; // Green
    return '#f59e0b'; // Orange
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className={styles.title}>글로벌 공급처 발굴 (Global Sourcing) 워크스페이스</h1>
          <p className={styles.subtitle}>AI 및 빅데이터 기반 조달망 해킹 파이프라인 (수산물/농산물 통합 터미널)</p>
        </motion.div>
      </div>

      {/* Phase 1: Workflow */}
      <motion.div initial="hidden" animate="show" variants={containerVariants} style={{ marginBottom: '3rem' }}>
        <h3 style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '0.75rem', marginBottom: '1.5rem', color: '#e2e8f0' }}>
          Phase 1: 데이터 기반 조달망 해킹 워크플로우
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { step: 1, color: '#3b82f6', title: 'Macro: 거시 분석', desc: 'UN Trade Map을 활용하여 타겟 국가의 관세율과 HS Code별 누적 물동량을 파악합니다. 유망 대체 시장을 선제적으로 필터링합니다.' },
            { step: 2, color: '#10b981', title: 'Micro: 마이크로 타겟팅', desc: "Trademo Intel의 선적 데이터(B/L) 교차 분석 AI를 통해 'Company Blind' 처리된 경쟁사의 숨겨진 공급처를 98% 확률로 역추적합니다." },
            { step: 3, color: '#f59e0b', title: 'Outreach: 컨택 및 검증', desc: 'Alibaba B2B 시스템의 RFQ 기능을 활용, 발굴한 타겟 리스트에 공격적으로 견적을 요청하여 셀러 간 단가 경쟁을 유도합니다.' }
          ].map((item, idx) => (
            <React.Fragment key={item.step}>
              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} style={{ flex: '1 1 280px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: item.color, opacity: 0.1, borderRadius: '50%' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: item.color, color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{item.step}</div>
                  <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>{item.title}</h4>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>{item.desc}</p>
              </motion.div>
              {idx < 2 && <ArrowRight size={24} color="#475569" style={{ alignSelf: 'center', flexShrink: 0 }} />}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* UN Trade Map Macro Terminal */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: '3rem' }}>
        <h3 style={{ borderLeft: '4px solid #ec4899', paddingLeft: '0.75rem', marginBottom: '1.5rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Phase 1.5: 관세 및 물동량 거시 분석기 (UN Trade Map & KCS API 연동) <BarChart2 size={18} color="#ec4899" />
        </h3>
        
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', borderRadius: '12px', padding: '2rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
          <form onSubmit={handleMacroSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: macroData ? '2rem' : 0 }}>
            <div style={{ flex: 2, position: 'relative', minWidth: '200px' }}>
              <Search size={20} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                value={macroItem}
                onChange={(e) => setMacroItem(e.target.value)}
                placeholder="관세 조회 품목명 (예: 마늘, 새우, 캐슈넛)" 
                style={{
                  width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#0f172a', border: '1px solid #334155', 
                  borderRadius: '8px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#ec4899'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>
            
            <div style={{ flex: 1, minWidth: '150px' }}>
              <select 
                value={macroCountry}
                onChange={(e) => setMacroCountry(e.target.value)}
                style={{
                  width: '100%', padding: '1rem', background: '#0f172a', border: '1px solid #334155', 
                  borderRadius: '8px', color: 'white', fontSize: '1rem', outline: 'none'
                }}
              >
                <option value="중국">🇨🇳 중국 (China)</option>
                <option value="베트남">🇻🇳 베트남 (Vietnam)</option>
                <option value="태국">🇹🇭 태국 (Thailand)</option>
                <option value="인도네시아">🇮🇩 인도네시아 (Indonesia)</option>
                <option value="미국">🇺🇸 미국 (USA)</option>
              </select>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isMacroSearching || !macroItem.trim()}
              style={{
                background: '#ec4899', color: 'white', border: 'none', borderRadius: '8px', padding: '0 2rem', 
                fontSize: '1rem', fontWeight: 'bold', cursor: isMacroSearching ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                opacity: isMacroSearching || !macroItem.trim() ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px', justifyContent: 'center'
              }}
            >
              {isMacroSearching ? <><Loader2 size={18} className={styles.spin} /> 관세선 분석 중</> : '거시 분석 (조회)'}
            </motion.button>
          </form>

          {/* Macro Data Visualization */}
          <AnimatePresence mode="wait">
            {macroData && !isMacroSearching && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(400px, 2fr)', gap: '1.5rem', marginTop: '1.5rem', width: '100%' }}>
                  
                  {/* Tariff & HS Code Stats */}
                  <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid #ec4899', borderRadius: '8px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>AI HS Code 매핑</span>
                        <strong style={{ color: '#f8fafc', fontSize: '1.5rem', display: 'block' }}>{macroData.hsCode}</strong>
                        <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{macroData.itemDesc}</span>
                      </div>
                      <Globe color="#ec4899" size={32} opacity={0.6} />
                    </div>
                    
                    <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '6px', border: '1px solid #334155' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block' }}>기본 관세율 (MFN)</span>
                        <strong style={{ color: '#f8fafc', fontSize: '1.2rem' }}>{macroData.tariff.base}</strong>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block' }}>FTA 협정 세율 ({macroCountry})</span>
                        <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>{macroData.tariff.fta}</strong>
                      </div>
                      {macroData.kamisPrice && (
                        <div style={{ marginBottom: '1rem', borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block' }}>국내 도매가 (aT KAMIS API)</span>
                          <strong style={{ color: '#fbbf24', fontSize: '1.1rem' }}>{macroData.kamisPrice}</strong>
                        </div>
                      )}
                      {macroData.mfdsRejection && (
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem', display: 'block' }}>식약처 수입적발 내역 (MFDS API)</span>
                          <strong style={{ color: '#f87171', fontSize: '1.1rem' }}>{macroData.mfdsRejection}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Volume Chart */}
                  <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.5rem', minWidth: '400px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#f8fafc', fontSize: '1.1rem' }}>한국 ↔ {macroCountry} 누적 물동량 (MT) 추이</h4>
                    <div style={{ width: '100%', height: 220, position: 'relative', overflowX: 'auto', overflowY: 'hidden' }}>
                        <BarChart width={600} height={220} data={macroData.tradeVolume} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={40} />
                          <RechartsTooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#f8fafc' }} />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          <Bar dataKey="importVolume" name="한국 수입량" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25} />
                          <Bar dataKey="exportVolume" name="한국 수출량" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={25} />
                        </BarChart>
                    </div>
                  </div>

                </div>

                {/* Market Attractiveness Scorecard */}
                {macroData.scorecard && (
                  <div style={{ marginTop: '1.5rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1.5rem 0', color: '#f8fafc', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={20} color="#10b981" /> 수입시장 매력도 (Market Attractiveness) 상세 평가
                      <span style={{ marginLeft: 'auto', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        종합 점수: {macroData.scorecard.totalScore} / 100점 ({macroData.scorecard.verdict})
                      </span>
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                      {[
                        { key: 'demand', title: '1. 수요 (Demand)', data: macroData.scorecard.demand },
                        { key: 'accessibility', title: '2. 접근성 (Accessibility)', data: macroData.scorecard.accessibility },
                        { key: 'stability', title: '3. 안정성 (Stability)', data: macroData.scorecard.stability }
                      ].map((category) => (
                        <div key={category.key} style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '8px', borderTop: `4px solid ${getGradeColor(category.data.grade)}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: '1.05rem' }}>{category.title}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ color: '#f8fafc', fontWeight: 'bold' }}>{category.data.score}/{category.data.maxScore}</span>
                              <span style={{ color: getGradeColor(category.data.grade), fontWeight: 'bold', background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{category.data.grade}</span>
                            </div>
                          </div>
                          
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {category.data.details.map((detail: any, idx: number) => (
                              <li key={idx} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '6px', borderLeft: '2px solid #475569' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                  <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: '500' }}>{detail.label}</span>
                                  <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 'bold' }}>{detail.score} / {detail.max}</span>
                                </div>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', lineHeight: '1.3' }}>{detail.desc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Phase 2: Toolkit */}
      {/* ... keeping the toolkit for reference ... */}

      {/* Phase 3: Sourcing Terminal */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 style={{ borderLeft: '4px solid #8b5cf6', paddingLeft: '0.75rem', marginBottom: '1.5rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Phase 3: 마이크로 타겟팅 통합 소싱 터미널 (Trademo / Alibaba 연동) <Zap size={18} color="#8b5cf6" />
        </h3>
        
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #334155', borderRadius: '12px', padding: '2rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="공급처(Vendor) 발굴 품목명 검색 (예: 마늘, 새우, 캐슈넛)..." 
                style={{
                  width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#0f172a', border: '1px solid #334155', 
                  borderRadius: '8px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              disabled={isSearching || !searchQuery.trim()}
              style={{
                background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', padding: '0 2rem', 
                fontSize: '1rem', fontWeight: 'bold', cursor: isSearching ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                opacity: isSearching || !searchQuery.trim() ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              {isSearching ? <><Loader2 size={18} className={styles.spin} /> AI 분석 중</> : '공급처 탐색'}
            </motion.button>
          </form>

          <AnimatePresence>
            {searchResults.length > 0 && !isSearching && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <h4 style={{ color: '#f8fafc', marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Database size={18} color="#10b981" /> AI 추천 글로벌 공급처 리스트
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {searchResults.map((supplier, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                      key={supplier.id} 
                      style={{ 
                        background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                      }}
                      whileHover={{ borderColor: '#8b5cf6', scale: 1.01 }}
                      onClick={() => handleOpenRfq(supplier)}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <h5 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>{supplier.name}</h5>
                          <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <ShieldCheck size={14} /> Trust: {supplier.trust}
                          </span>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                          <span>📍 {supplier.country}</span>
                          <span>🚢 최근 선적: {supplier.lastShipment}</span>
                          <span>📦 주력: {supplier.products}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', fontWeight: '500', fontSize: '0.9rem', flexShrink: 0 }}>
                        <Mail size={16} /> AI 메일(RFQ) 생성 <ChevronRight size={16} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* RFQ Generator Modal */}
      <AnimatePresence>
        {selectedSupplier && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', width: '90%', maxWidth: '700px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={20} color="#f59e0b" /> LLM Generative RFQ Draft
                </h3>
                <button onClick={() => setSelectedSupplier(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
              </div>
              
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', minHeight: '200px', position: 'relative' }}>
                {isGeneratingRfq ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8b5cf6' }}>
                    <Loader2 size={32} className={styles.spin} style={{ marginBottom: '1rem' }} />
                    <p style={{ margin: 0 }}>OpenAI / Gemini API 통신 중...</p>
                  </div>
                ) : (
                  <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'monospace' }}>
                    {rfqText}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => setSelectedSupplier(null)} style={{ background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>닫기</button>
                <button 
                  disabled={isGeneratingRfq}
                  onClick={handleCopyRfq} 
                  style={{ 
                    background: isCopied ? '#10b981' : '#8b5cf6', border: 'none', color: 'white', padding: '0.75rem 1.5rem', 
                    borderRadius: '8px', cursor: isGeneratingRfq ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s',
                    opacity: isGeneratingRfq ? 0.5 : 1
                  }}
                >
                  {isCopied ? <><CheckCircle2 size={18} /> 복사 완료!</> : <><Copy size={18} /> 클립보드에 복사</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .${styles.spin} { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
