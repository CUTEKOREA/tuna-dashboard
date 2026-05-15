'use client';

import React, { useState } from 'react';
import { BookOpen, ChevronUp, ChevronDown, Fish, MessageSquare, TrendingUp, Globe, Plane, Target, ShieldAlert } from 'lucide-react';

export default function TunaRanchingEducation() {
  const [isEduOpen, setIsEduOpen] = useState(true);

  return (
    <>
      {/* 🚀 Top Executive Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: '양식 프리미엄', value: '+31.9%', sub: 'vs 야생 어획 단가', color: '#f472b6', icon: <TrendingUp size={16}/> },
          { label: '최고가 타겟 시장', value: '$48.00 / kg', sub: 'UAE 두바이 수입단가', color: '#ec4899', icon: <Globe size={16}/> },
          { label: 'CEPA 관세 절감', value: '5% → 0%', sub: '일본 대비 가격 우위', color: 'var(--color-info)', icon: <Plane size={16}/> },
          { label: '글로벌 쿼터 장벽', value: '단 0.8%', sub: '한국 할당량 (368톤)', color: '#eab308', icon: <Target size={16}/> },
          { label: '프리미엄 진입 장벽', value: '95점', sub: '할랄/초저온 충족 시', color: '#14b8a6', icon: <ShieldAlert size={16}/> },
        ].map((k, i) => (
          <div key={i} style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '1.25rem', borderRadius: '8px', border: `1px solid ${k.color}33`, borderTop: `3px solid ${k.color}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>{k.icon} {k.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.5px' }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: k.color }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(56, 189, 248, 0.3)',
      borderRadius: '8px',
      marginBottom: '2rem',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Toggle Header */}
      <div 
        onClick={() => setIsEduOpen(!isEduOpen)}
        style={{
          padding: '1.2rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: isEduOpen ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
          transition: 'background 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            background: 'rgba(56, 189, 248, 0.2)', padding: '0.5rem', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BookOpen size={20} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              신입직원 교육 가이드
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              축양 참치 밸류체인 및 시장 동향
            </p>
          </div>
        </div>
        <div>
          {isEduOpen ? <ChevronUp size={24} color="#94a3b8" /> : <ChevronDown size={24} color="#94a3b8" />}
        </div>
      </div>

      {/* Foldable Content */}
      {isEduOpen && (
        <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
            
            {/* Left: Quick Guide */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '1.2rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Fish size={16} /> 축양 참치 산업 핵심 포인트
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.8 }}>
                <li><strong>쿼터제도 기반 산업:</strong> 대서양참치보존위원회(ICCAT)의 엄격한 쿼터(TAC) 할당에 따라 사업 진출이 결정되는 규제 중심 산업.</li>
                <li><strong>BFT 프리미엄화:</strong> 철저한 이케지메(Ike-jime) 및 -60℃ 초저온 콜드체인을 통해 자연산 어획 단가를 추월하는 양식 참치 프리미엄 구축.</li>
                <li><strong>중동 신규 미식 마켓:</strong> 5성급 호텔 중심의 두바이(UAE), 사우디아라비아 등 중동 GCC 국가들의 하이엔드 참치 수요 폭발.</li>
                <li><strong>한국의 밸류체인 우위:</strong> 한-UAE CEPA 발효 시, 일본 대비 관세 우위를 바탕으로 한국 내 고급 가공 후 두바이로 수출하는 신규 비즈니스 모델 창출 가능.</li>
              </ul>
            </div>

            {/* Right: NotebookLM Chatbot */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)' }}>
                <MessageSquare size={24} color="var(--text-primary)" />
              </div>
              <h3 style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                축양 참치 지식 AI 챗봇
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '80%' }}>
                축양 참치 마스터 인덱스와 ICCAT 규제 및 중동 프리미엄 수요 데이터를 학습한 AI 챗봇입니다. 쿼터 현황이나 프리미엄 시장 전략을 질문해 보세요.
              </p>
              <a 
                href="https://notebooklm.google.com/notebook/f79add79-9b12-4030-ad85-db1095d5846e"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                  color: 'var(--text-primary)',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 10px rgba(56, 189, 248, 0.3)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(56, 189, 248, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(56, 189, 248, 0.3)'; }}
              >
                <MessageSquare size={16} />
                AI 챗봇과 대화하기
              </a>
            </div>

          </div>
        </div>
      )}
    </div>
    </>
  );
}
