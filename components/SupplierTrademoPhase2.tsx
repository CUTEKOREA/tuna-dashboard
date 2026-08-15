import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, EyeOff, Target, ShieldCheck } from 'lucide-react';
import styles from './TunaExtractDashboard.module.css';

interface SupplierTrademoPhase2Props {
  isAnalyzing: boolean;
  results: any[] | null;
  targetKeyword: string;
}

export default function SupplierTrademoPhase2({ isAnalyzing, results, targetKeyword }: SupplierTrademoPhase2Props) {
  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'S': return '#10b981'; // Green
      case 'A': return '#3b82f6'; // Blue
      case 'B': return '#f59e0b'; // Yellow
      case 'C': return '#ef4444'; // Red
      default: return '#94a3b8';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: '3rem' }}>
      <h3 style={{ borderLeft: '4px solid var(--w-emerald-500)', paddingLeft: '0.75rem', marginBottom: '1.5rem', color: 'var(--w-slate-200)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Phase 2: 마이크로 타겟팅 (Trademo B/L 역추적 AI) <Target size={18} color="#10b981" />
      </h3>
      
      <div style={{ background: 'rgba(20, 28, 52, 0.8)', border: '1px solid #334155', borderRadius: '12px', padding: '2rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>
        <p style={{ color: 'var(--w-slate-400)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
          수입되는 품목의 글로벌 선적 데이터(B/L)를 관세청 수출입 실적과 교차 대조합니다. 'Company Blind' 처리된 선하증권의 원공급처(Shipper)를 AI 모델이 확률적으로 역추적합니다.
        </p>

        <AnimatePresence>
          {!results && !isAnalyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: 'var(--w-slate-400)', textAlign: 'center', padding: '2rem' }}>
              상단 지능형 엔진에서 품목을 검색하시면 자동으로 역추적 분석이 실행됩니다.
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem', color: 'var(--w-emerald-500)' }}>
              <Loader2 size={24} className={styles.spin} /> {targetKeyword} 글로벌 공급망 포렌식 분석 중...
            </motion.div>
          )}

          {results && !isAnalyzing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #334155', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--w-slate-50)', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="#10b981" /> 역추적 성공 (Unblinded Suppliers)
                </h4>
                <span style={{ color: 'var(--w-slate-400)', fontSize: '0.85rem' }}>
                  타겟 품목: <strong style={{ color: 'var(--w-slate-50)' }}>{targetKeyword}</strong> 글로벌 공급망
                </span>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {results.map((item, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                    key={item.id} 
                    style={{ 
                      background: 'var(--w-navy-900)', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem',
                      display: 'flex', flexDirection: 'column', gap: '1rem'
                    }}
                  >
                    {/* Top Row: Blind -> Unblind */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#0a0f1f', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px dashed var(--w-slate-500)', color: 'var(--w-slate-400)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <EyeOff size={14} /> {item.blindedName}
                        </div>
                        <ArrowRight size={18} color="#10b981" />
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--w-emerald-500)', padding: '0.5rem 1rem', borderRadius: '6px', color: 'var(--w-emerald-500)', fontSize: '1.05rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {item.unblindedName}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ color: 'var(--w-slate-400)', fontSize: '0.75rem' }}>AI 확신도</span>
                          <strong style={{ color: 'var(--w-slate-50)', fontSize: '1.1rem' }}>{item.confidence}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Metadata */}
                    <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid #334155', paddingTop: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ color: 'var(--w-slate-400)', fontSize: '0.8rem', display: 'block' }}>선적 경로 (POL &rarr; POD)</span>
                        <strong style={{ color: 'var(--w-slate-300)', fontSize: '0.9rem' }}>{item.pol} &rarr; {item.pod}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--w-slate-400)', fontSize: '0.8rem', display: 'block' }}>관측 물동량 (KCS 교차)</span>
                        <strong style={{ color: 'var(--w-slate-300)', fontSize: '0.9rem' }}>{item.volume} ({item.hsCode})</strong>
                      </div>
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: 'var(--w-slate-400)', fontSize: '0.8rem', display: 'block' }}>안정성 리스크 평가</span>
                          <span style={{ color: getRiskColor(item.risk), fontSize: '0.85rem' }}>{item.riskDesc}</span>
                        </div>
                        <div style={{ background: getRiskColor(item.risk), color: '#0a0f1f', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem' }}>
                          {item.risk}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
