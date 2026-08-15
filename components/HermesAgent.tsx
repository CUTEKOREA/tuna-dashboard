'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ================================================================
 * HermesAgent — AI 전략 어시스턴트 위젯
 * ================================================================
 * 대시보드 내 삽입형 AI 챗봇. Ollama + Hermes3 모델을 통해
 * 실시간 농수산물 무역 전략 질의응답을 지원합니다.
 *
 * 사용법:
 *   <HermesAgent category="참치" context="현재 가다랑어 시세 $2,100/MT" />
 * ================================================================ */

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: string;
}

interface HermesAgentProps {
  category?: string;
  context?: string;
  suggestedQuestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  '현재 시세 동향을 분석해줘',
  '공급망 리스크를 평가해줘',
  '매입가 대비 마진율을 계산해줘',
  '차익거래 기회가 있는지 분석해줘',
];

export default function HermesAgent({
  category = '농수산물',
  context,
  suggestedQuestions,
}: HermesAgentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isExpanded, setIsExpanded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = suggestedQuestions || DEFAULT_SUGGESTIONS.map(q =>
    q.includes('시세') ? `${category} ${q}` : `${category} ${q}`
  );

  // ── 상태 확인 ──────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/hermes')
      .then(r => r.json())
      .then(d => setStatus(d.status === 'operational' ? 'online' : 'offline'))
      .catch(() => setStatus('offline'));
  }, []);

  // ── 자동 스크롤 ────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── 메시지 전송 ────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/hermes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text.trim(),
          context: context ? `[${category} 대시보드] ${context}` : undefined,
        }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.answer || data.error || '응답을 받을 수 없습니다.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        mode: data.mode,
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (data.answer) setStatus('online');
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ AI 서버에 연결할 수 없습니다. Ollama가 실행 중인지 확인해주세요.',
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      }]);
      setStatus('offline');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [loading, category, context]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ── 미니 버튼 (접힌 상태) ──────────────────────────────────
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, var(--w-violet-500) 50%, #a78bfa 100%)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(99, 102, 241, 0.4), 0 0 40px rgba(var(--w-violet-500-rgb), 0.15)',
          zIndex: 9999,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => {
          (e.target as HTMLElement).style.transform = 'scale(1.1)';
          (e.target as HTMLElement).style.boxShadow = '0 6px 32px rgba(99, 102, 241, 0.6)';
        }}
        onMouseLeave={e => {
          (e.target as HTMLElement).style.transform = 'scale(1)';
          (e.target as HTMLElement).style.boxShadow = '0 4px 24px rgba(99, 102, 241, 0.4)';
        }}
        title="Hermes AI 어시스턴트"
      >
        <span style={{ fontSize: '24px', lineHeight: 1 }}>🏛️</span>
      </button>
    );
  }

  // ── 메인 패널 (펼쳐진 상태) ────────────────────────────────
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '420px',
      maxHeight: '600px',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(15, 15, 20, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: '16px',
      boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 60px rgba(99, 102, 241, 0.08)',
      zIndex: 9999,
      overflow: 'hidden',
      fontFamily: "'Inter', 'Pretendard', -apple-system, sans-serif",
    }}>
      {/* ── 헤더 ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(var(--w-violet-500-rgb), 0.1))',
        borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🏛️</span>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--w-slate-200)', letterSpacing: '-0.01em' }}>
              Hermes AI Agent
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--w-slate-400)', marginTop: '1px' }}>
              {category} 전략 어시스턴트 · Ollama Local
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            borderRadius: '10px',
            background: status === 'online' ? 'rgba(var(--w-emerald-500-rgb), 0.15)' :
                        status === 'offline' ? 'rgba(var(--w-red-500-rgb), 0.15)' : 'rgba(234, 179, 8, 0.15)',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: status === 'online' ? 'var(--color-success)' :
                          status === 'offline' ? 'var(--color-danger)' : '#eab308',
              boxShadow: status === 'online' ? '0 0 6px var(--w-emerald-500)' : 'none',
            }} />
            <span style={{
              fontSize: '0.6rem', fontWeight: 600,
              color: status === 'online' ? 'var(--color-success)' :
                     status === 'offline' ? 'var(--color-danger)' : '#eab308',
            }}>
              {status === 'online' ? 'LIVE' : status === 'offline' ? 'OFFLINE' : 'CHECK'}
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--w-slate-400)', fontSize: '18px', padding: '2px',
              lineHeight: 1, borderRadius: '4px',
            }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = '#e2e8f0'}
            onMouseLeave={e => (e.target as HTMLElement).style.color = '#94a3b8'}
          >
            ✕
          </button>
        </div>
      </div>

      {/* ── 채팅 영역 ────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minHeight: '280px',
        maxHeight: '400px',
      }}>
        {messages.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '16px',
            padding: '20px 0',
          }}>
            <div style={{ fontSize: '40px', opacity: 0.6 }}>🏛️</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--w-slate-400)', marginBottom: '4px' }}>
                {category} 대시보드의 AI 전략 어시스턴트
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--w-slate-500)' }}>
                시세 조회 · 무역 통계 · 마진 계산 · 리스크 분석
              </div>
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              justifyContent: 'center',
              maxWidth: '340px',
            }}>
              {suggestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.7rem',
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '12px',
                    color: '#a5b4fc',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.background = 'rgba(99, 102, 241, 0.2)';
                    (e.target as HTMLElement).style.borderColor = 'rgba(99, 102, 241, 0.4)';
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.background = 'rgba(99, 102, 241, 0.08)';
                    (e.target as HTMLElement).style.borderColor = 'rgba(99, 102, 241, 0.2)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, var(--w-violet-500))'
                : 'rgba(30, 30, 40, 0.8)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(99, 102, 241, 0.1)',
              color: 'var(--w-slate-200)',
              fontSize: '0.8rem',
              lineHeight: 1.65,
              wordBreak: 'keep-all' as const,
              overflowWrap: 'break-word' as const,
            }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '6px',
                marginTop: '6px',
              }}>
                {msg.mode && (
                  <span style={{
                    fontSize: '0.55rem',
                    color: 'var(--w-slate-500)',
                    padding: '1px 5px',
                    background: 'rgba(var(--w-slate-500-rgb), 0.1)',
                    borderRadius: '4px',
                  }}>
                    {msg.mode === 'hermes-server' ? '🔧 Agent' : msg.mode === 'gemini-cloud' ? '☁️ Gemini' : '💬 Direct'}
                  </span>
                )}
                <span style={{ fontSize: '0.6rem', color: 'var(--w-slate-500)' }}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 16px',
              borderRadius: '14px 14px 14px 4px',
              background: 'rgba(30, 30, 40, 0.8)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              display: 'flex',
              gap: '4px',
              alignItems: 'center',
            }}>
              {[0, 150, 300].map(delay => (
                <div key={delay} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#6366f1',
                  animation: `hermesPulse 1.2s ease-in-out ${delay}ms infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── 입력 영역 ────────────────────────────────────────── */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(99, 102, 241, 0.1)',
        background: 'rgba(10, 10, 15, 0.6)',
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`${category}에 대해 질문하세요...`}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'rgba(30, 30, 40, 0.6)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              borderRadius: '10px',
              color: 'var(--w-slate-200)',
              fontSize: '0.8rem',
              outline: 'none',
              transition: 'border-color 0.2s',
              fontFamily: 'inherit',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(99, 102, 241, 0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(99, 102, 241, 0.15)'}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: 'none',
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #6366f1, var(--w-violet-500))'
                : 'rgba(30, 30, 40, 0.6)',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '16px', opacity: input.trim() && !loading ? 1 : 0.3 }}>
              ▲
            </span>
          </button>
        </div>
      </div>

      {/* ── 애니메이션 ────────────────────────────────────────── */}
      <style>{`
        @keyframes hermesPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
