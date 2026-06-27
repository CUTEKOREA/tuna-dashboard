'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, BarChart2, Anchor, Factory, Target, ShoppingCart, Waves, Fish, Hexagon, Navigation, Cpu, Workflow, Activity } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  onNavigate: (menu: string) => void;
}

export default function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    { id: 'market', label: '시장 동향 (Market)', category: '페이지', icon: <BarChart2 size={16} />, action: () => onNavigate('market') },
    { id: 'fleet', label: '선단 운영', category: '페이지', icon: <Navigation size={16} />, action: () => onNavigate('fleet') },
    { id: 'logistics', label: '물류 및 가공 (Logistics)', category: '페이지', icon: <Factory size={16} />, action: () => onNavigate('logistics') },
    { id: 'unloading', label: '하역 현황 (Unloading)', category: '페이지', icon: <Anchor size={16} />, action: () => onNavigate('unloading') },
    { id: 'value-chain', label: '밸류체인 (Value Chain)', category: 'BETA', icon: <Workflow size={16} />, action: () => onNavigate('value-chain') },
    { id: 'ai-forecast', label: 'AI 유가·단가 예측', category: 'BETA', icon: <Cpu size={16} />, action: () => onNavigate('ai-forecast') },
    { id: 'strategy', label: '글로벌 전략 (Strategy)', category: 'BETA', icon: <Target size={16} />, action: () => onNavigate('strategy') },
    { id: 'retail', label: '소매 유통 (Retail POS)', category: '페이지', icon: <ShoppingCart size={16} />, action: () => onNavigate('retail') },
    { id: 'ranching', label: '참다랑어 축양', category: '페이지', icon: <Waves size={16} />, action: () => onNavigate('ranching') },
    { id: 'mackerel', label: '고등어 (Mackerel)', category: '페이지', icon: <Fish size={16} />, action: () => onNavigate('mackerel') },
    { id: 'squid', label: '오징어 (Squid)', category: '페이지', icon: <Activity size={16} />, action: () => onNavigate('squid') },
    { id: 'jukkumi', label: '주꾸미 (Webfoot Octopus)', category: '페이지', icon: <Activity size={16} />, action: () => onNavigate('jukkumi') },
    { id: 'octopus', label: '낙지 (Long-Arm Octopus)', category: '페이지', icon: <Activity size={16} />, action: () => onNavigate('octopus') },
    { id: 'cashew', label: '캐슈넛 (Cashew Nut)', category: '페이지', icon: <Hexagon size={16} />, action: () => onNavigate('cashew') },
    { id: 'cassava', label: '카사바 (Cassava)', category: '페이지', icon: <Hexagon size={16} />, action: () => onNavigate('cassava') },
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.id.includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
      setIsOpen(false);
    }
  }, [filtered, selectedIndex]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed', top: '18%', left: '50%', transform: 'translateX(-50%)',
              width: 580, maxWidth: '90vw', zIndex: 9999,
              background: 'rgba(6, 14, 28, 0.92)',
              border: '1px solid rgba(6, 182, 212, 0.15)',
              borderRadius: 8, overflow: 'hidden',
              boxShadow: '0 32px 100px rgba(0,0,0,0.7), 0 0 60px rgba(6, 182, 212, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Search size={18} color="#06b6d4" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="페이지 검색... (↑↓ 이동, Enter 선택)"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: 15, fontFamily: 'inherit',
                }}
              />
              <span style={{
                fontSize: 11, color: 'rgba(255,255,255,0.3)',
                padding: '2px 6px', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 4,
              }}>ESC</span>
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px' }}>
              {filtered.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                  검색 결과가 없습니다
                </div>
              )}
              {filtered.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => { item.action(); setIsOpen(false); }}
                  onMouseEnter={() => setSelectedIndex(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                    background: i === selectedIndex ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                    color: i === selectedIndex ? 'var(--text-primary)' : 'rgba(255,255,255,0.6)',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ opacity: 0.6 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 14 }}>{item.label}</span>
                  <span style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.3)',
                    padding: '2px 8px', background: 'rgba(140,170,255,0.10)',
                    borderRadius: 4,
                  }}>{item.category}</span>
                  {i === selectedIndex && <ArrowRight size={14} style={{ opacity: 0.4 }} />}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
