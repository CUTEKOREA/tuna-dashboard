'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft, ShieldAlert, Award, Landmark, Activity, Globe
} from 'lucide-react';
import styles from './FfaReport.module.css';

const usLoinData = [
  { year: '2016', 태국: 86.6, 베트남: 2.5, 피지: 68.5, 모리셔스: 40.2, 인도네시아: 8.6, 중국: 67.7 },
  { year: '2017', 태국: 98.3, 베트남: 2.7, 피지: 63.7, 모리셔스: 34.1, 인도네시아: 7.7, 중국: 96.7 },
  { year: '2018', 태국: 70.3, 베트남: 4.3, 피지: 67.8, 모리셔스: 49.3, 인도네시아: 4.3, 중국: 94.0 },
  { year: '2019', 태국: 118.6, 베트남: 25.7, 피지: 67.5, 모리셔스: 53.3, 인도네시아: 5.2, 중국: 7.9 },
  { year: '2020', 태국: 144.9, 베트남: 12.3, 피지: 84.4, 모리셔스: 39.2, 인도네시아: 24.3, 중국: 0.7 },
  { year: '2021', 태국: 65.3, 베트남: 42.9, 피지: 63.1, 모리셔스: 35.7, 인도네시아: 23.4, 중국: 0.0 },
  { year: '2022', 태국: 89.3, 베트남: 39.4, 피지: 76.2, 모리셔스: 33.1, 인도네시아: 25.2, 중국: 0.0 },
  { year: '2023', 태국: 78.5, 베트남: 49.3, 피지: 50.0, 모리셔스: 32.7, 인도네시아: 24.1, 중국: 0.0 },
  { year: '2024', 태국: 75.1, 베트남: 54.9, 피지: 49.9, 모리셔스: 26.1, 인도네시아: 9.2, 중국: 0.0 }
];

const bigFourData = [
  {
    name: 'Bolton & Tri Marine',
    brand: 'Rio Mare (이탈리아), John West',
    fleet: '어선 직접 보유 (솔로몬 제도 기지)',
    loining: '솔로몬 Soltuna에서 Loin 수급 → 이탈리아 공장 수송',
    tariff: 'EU 무관세 혜택 및 단일 자율 관세 할당량(ATQ) 활용',
    esg: '지속가능성 선도 (MSC 4건 보유, STF 참여)'
  },
  {
    name: 'Thai Union',
    brand: 'Chicken of the Sea (미국), John West',
    fleet: '어선 미보유 (100% 글로벌 원어 조달)',
    loining: '미국 조지아(Lyons) Loin 수입 공장 구축',
    tariff: '세이셸(IOT) 및 가나(PFC) 기지로 EU 무관세 수출',
    esg: 'SeaChange 2030 이니셔티브 발표, NGO 파트너십'
  },
  {
    name: 'FCF & Bumble Bee',
    brand: 'Bumble Bee (미국), Anova (회급)',
    fleet: '어선 미보유 (대만 선단 상업적 독점)',
    loining: '캘리포니아 공장에서 피지 PAFCO Loin 수입',
    tariff: 'PNG 공장 투자 (FSM 허가 락업, EU 무관세)',
    esg: '노동 착취 및 IUU 이슈로 NGO 주요 감시 대상'
  },
  {
    name: 'Dongwon & StarKist',
    brand: 'StarKist (미국 1위), 동원참치 (한국 1위)',
    fleet: '한국 최대 원양어선단 직접 보유 (동원산업)',
    loining: '미국령 사모아 공장 활용 본토 관세 면제',
    tariff: '에콰도르, 세네갈 공장으로 남미/EU/중동 우회',
    esg: 'SeaBOS 창립 회원, 한국 선망 MSC 인증 획득'
  }
];

const chinaDwfData = [
  { name: 'Shanghai Kaichuang', vessels: 11, flag: '중국 6척 / RMI 5척', catch: 211978, profit: 723, strategy: '마샬 Pan Pacific Foods 및 스페인 Albo 인수' },
  { name: 'Zhejiang Ocean Family', vessels: 9, flag: '중국 4척 / 키리바시 5척', catch: 73891, profit: 245, strategy: '키리바시 합작사 설립 및 중국수출입은행 지원' },
  { name: 'Shandong Zhonglu', vessels: 4, flag: '중국 4척', catch: 61608, profit: 302, strategy: '중국 국적 전용 선단 및 보조금 최적화' },
  { name: 'Zhongyu Global Seafood', vessels: 3, flag: '중국 3척', catch: 84892, profit: 267, strategy: '태평양 선망 조업 및 유통 수직 통합' }
];

export default function FfaReportPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedBigFour, setSelectedBigFour] = useState(0);

  const totalSlides = 7;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.pageWrapper}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <button 
            onClick={() => router.push('/value-chain')}
            className={styles.backBtn}
            title="대시보드로 돌아가기"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              참치왕국 기획보고서
            </h1>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              서중부태평양(WCPO) 참치 산업 및 무역 동향 슬라이드 덱
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => router.push('/value-chain')}
            style={{
              padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700,
              background: 'rgba(56, 189, 248, 0.08) !important',
              color: '#38bdf8 !important',
              border: '1px solid rgba(56, 189, 248, 0.2) !important',
              borderRadius: '500px !important', cursor: 'pointer',
              textTransform: 'none' as any, letterSpacing: 'normal'
            }}
          >
            메인 대시보드
          </button>
        </div>
      </header>

      {/* Slide Presenter Layout */}
      <div className={styles.container}>
        {/* Left Slide Thumbnails */}
        <aside className={styles.sidebar}>
          <span className={styles.sidebarTitle}>슬라이드 목차</span>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              '표지',
              '경영진 요약',
              '빅4 경쟁사 분석',
              '중국 DWF 선단 팽창',
              'ESG & 지속가능성 규격',
              '대미 로인 수입 & 관세',
              '한국 선단 액션 플랜'
            ].map((label, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`${styles.navLink} ${currentSlide === idx ? styles.navLinkActive : ''}`}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ opacity: 0.6 }}>0{idx + 1}</span> {label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Slide Viewer (16:9 Presentation Card) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '1rem', alignItems: 'center', justifyContent: 'center', background: '#0a0d14' }}>
          
          {/* Main Slide Card */}
          <div style={{
            width: '100%',
            maxWidth: '1000px',
            aspectRatio: '16 / 9',
            background: '#111827',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top Slide Header */}
            {currentSlide > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  FFA 시장 연구 2025 개정판 · 슬라이드 0{currentSlide}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 500 }}>신라교역 인텔리전스 리포트</span>
              </div>
            )}

            {/* Slide Body */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              
              {/* SLIDE 0: COVER SLIDE */}
              {currentSlide === 0 && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '6px 14px', borderRadius: '500px' }}>
                    <Landmark size={14} className="text-sky-400" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.1em' }}>경영진 브리핑 덱</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: '1.25' }}>
                      서중부태평양(WCPO) 참치 산업 및 무역 동향
                    </h2>
                    <p style={{ fontSize: '1rem', color: '#38bdf8', fontWeight: 600 }}>
                      수역별 가치사슬 분석 및 국내 선단 대응 전략 제언
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', width: '240px', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>기획조정실 전략기획본부</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>2026.05.30 | 대외비 (S-Grade)</span>
                  </div>
                </div>
              )}

              {/* SLIDE 1: EXECUTIVE SUMMARY */}
              {currentSlide === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    1. 경영진 핵심 요약 (Executive Summary)
                  </h3>
                  <div className={styles.grid2} style={{ flex: 1, alignContent: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ color: '#38bdf8' }}><Award size={18} /></div>
                      <div>
                        <strong style={{ fontSize: '0.8rem', color: '#fff', display: 'block', marginBottom: '2px' }}>PNA VDS 지대의 힘</strong>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>도서국(PIC)은 VDS 조업일수제도로 리스크 없는 지대를 선점. 반면 위탁 가공(Loining) 투자는 마진 스퀴즈 노출 리스크가 큼.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ color: '#10b981' }}><Globe size={18} /></div>
                      <div>
                        <strong style={{ fontSize: '0.8rem', color: '#fff', display: 'block', marginBottom: '2px' }}>관세 회피(Tariff-hopping) 고착</strong>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>통조림 완제품 고율 관세(US 35%, EU 24%) 극복을 위한 전가열 로인(Loin) 수입 및 현지 패키징 물류 모델 정착.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ color: '#8b5cf6' }}><ShieldAlert size={18} /></div>
                      <div>
                        <strong style={{ fontSize: '0.8rem', color: '#fff', display: 'block', marginBottom: '2px' }}>인권/노동 규제 강화</strong>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>미국 WRO 및 EU CSDDD로 인권 의심 선단 퇴출. ILO C188 및 STF 노동 기준 통과가 글로벌 수입의 핵심 선행조건.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ color: '#ef4444' }}><Landmark size={18} /></div>
                      <div>
                        <strong style={{ fontSize: '0.8rem', color: '#fff', display: 'block', marginBottom: '2px' }}>트럼프 2기 관세 리스크</strong>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>과거 중국산 로인에 가해진 30% 보복 관세 충격으로 수입 전멸. 베트남/피지 등 우회처로의 보편 관세 확산 가능성 존재.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 2: BIG FOUR COMPETITORS */}
              {currentSlide === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    2. 글로벌 빅 포 (Big Four) 밸류체인 및 수직 계통 구조
                  </h3>
                  <div className={styles.tabs} style={{ gap: '4px' }}>
                    {bigFourData.map((b, idx) => (
                      <button
                        key={b.name}
                        onClick={() => setSelectedBigFour(idx)}
                        className={`${styles.tabButton} ${selectedBigFour === idx ? styles.tabButtonActive : ''}`}
                        style={{ padding: '6px 8px', fontSize: '0.7rem' }}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                  <div className={styles.tabContent} style={{ padding: '1rem', flex: 1, justifyContent: 'center' }}>
                    <div className={styles.tabContentHeader} style={{ paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                      <span className={styles.tabContentTitle} style={{ fontSize: '0.9rem' }}>{bigFourData[selectedBigFour].name}</span>
                      <span className={styles.tabContentSub} style={{ fontSize: '0.65rem' }}>{bigFourData[selectedBigFour].brand}</span>
                    </div>
                    <div className={styles.tabBodyGrid} style={{ gap: '8px' }}>
                      <div className={styles.tabBodyCard} style={{ padding: '8px 12px' }}>
                        <span className={styles.tabBodyCardLabel}>선단(Fleet) 및 조업권</span>
                        <p className={styles.tabBodyCardValue} style={{ fontSize: '0.75rem' }}>{bigFourData[selectedBigFour].fleet}</p>
                      </div>
                      <div className={styles.tabBodyCard} style={{ padding: '8px 12px' }}>
                        <span className={styles.tabBodyCardLabel}>로인(Loin) 조달 모델</span>
                        <p className={styles.tabBodyCardValue} style={{ fontSize: '0.75rem' }}>{bigFourData[selectedBigFour].loining}</p>
                      </div>
                      <div className={styles.tabBodyCard} style={{ padding: '8px 12px' }}>
                        <span className={styles.tabBodyCardLabel}>관세 대응 전략</span>
                        <p className={styles.tabBodyCardValue} style={{ fontSize: '0.75rem' }}>{bigFourData[selectedBigFour].tariff}</p>
                      </div>
                      <div className={styles.tabBodyCard} style={{ padding: '8px 12px' }}>
                        <span className={styles.tabBodyCardLabel}>ESG / 지속가능성</span>
                        <p className={styles.tabBodyCardValue} style={{ fontSize: '0.75rem' }}>{bigFourData[selectedBigFour].esg}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 3: CHINESE DWF FLEET */}
              {currentSlide === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    3. 중국 주요 원양어업(DWF) 기업의 태평양 확장 구조
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1rem', alignItems: 'center' }}>
                    <div className={styles.tableContainer}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th style={{ padding: '6px 8px' }}>기업명</th>
                            <th style={{ padding: '6px 8px' }}>선망선</th>
                            <th style={{ padding: '6px 8px' }}>어획량 (톤)</th>
                            <th style={{ padding: '6px 8px' }}>영업이익</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chinaDwfData.map((c, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '6px 8px', fontWeight: 700, color: '#fff' }}>{c.name}</td>
                              <td style={{ padding: '6px 8px', color: '#38bdf8' }}>{c.vessels}척</td>
                              <td style={{ padding: '6px 8px' }}>{c.catch.toLocaleString()}</td>
                              <td style={{ padding: '6px 8px', color: '#10b981' }}>¥{c.profit}M</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '8px' }}>
                      <strong style={{ fontSize: '0.75rem', color: '#fff', display: 'block' }}>중국 선단의 특징 및 우회 경로</strong>
                      <ul style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '12px', listStyle: 'disc' }}>
                        <li><strong style={{ color: '#fff' }}>합작선 활용</strong>: 상해개창 마샬제도 5척, 절강양가 키리바시 5척 등 도서국 국적으로 PNA EEZ 우회 진입.</li>
                        <li><strong style={{ color: '#fff' }}>금융 정책 지원</strong>: 중국수출입은행 보증 및 성/시 단위의 국가 보조금을 결합한 외교적 쿼터 확보 지원.</li>
                        <li><strong style={{ color: '#fff' }}>수직 통합 인수</strong>: 스페인 Conservas Albo 및 캐나다 French Creek Seafood를 인수하여 유럽·북미 직채널을 선점.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 4: ESG & SUSTAINABILITY */}
              {currentSlide === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    4. 글로벌 ESG 환경 규제 및 노동 인권 리스크 구조
                  </h3>
                  <div className={styles.grid3} style={{ flex: 1, alignContent: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(56, 189, 248, 0.04)', border: '1px solid rgba(56, 189, 248, 0.12)', padding: '0.88rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8', fontWeight: 700, fontSize: '0.75rem' }}>
                        <Award size={14} />
                        <span>MSC & ISSF 가두리 표준</span>
                      </div>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        MSC 친환경 인증 없이는 리테일 납품 불가. ISSF PVR(프로액티브 등록부) 기준을 통과한 어획물만 거래되는 이중 필터링 구축.
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.12)', padding: '0.88rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontWeight: 700, fontSize: '0.75rem' }}>
                        <ShieldAlert size={14} />
                        <span>미국 WRO 및 노동 감사</span>
                      </div>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        강제노동 혐의 시 미국 CBP WRO(보류명령) 즉각 조치. ILO C188 및 STF 준수 증명이 글로벌 참치 시장의 진입 허가권으로 작동.
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.12)', padding: '0.88rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 700, fontSize: '0.75rem' }}>
                        <Activity size={14} />
                        <span>PIT 전자 감시 모델</span>
                      </div>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        Walmart가 100% 전자 모니터링(EM) 및 국내 양하를 충족하는 PIT 참치 독점 구매 선언. ESG 투명성이 바이어 유치력으로 직결.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 5: US LOIN IMPORTS & TARIFFS */}
              {currentSlide === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    5. 미국의 전가열 참치 로인(Loin) 수입액 추이 및 무역 타격
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '4.5fr 3.5fr', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ height: 180 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={usLoinData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                          <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: '0.65rem' }} />
                          <Area type="monotone" dataKey="태국" stackId="1" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.1} />
                          <Area type="monotone" dataKey="베트남" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                          <Area type="monotone" dataKey="피지" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                          <Area type="monotone" dataKey="중국" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <p>
                        <strong style={{ color: '#fff' }}>대중국 고율 관세의 흔적:</strong> 2018년 트럼프 행정부의 30% 보조 관세 부과 후, 연간 $94M를 상회하던 중국의 수입은 2021년 이후 <strong style={{ color: '#fff' }}>$0으로 완전 소멸</strong>했습니다.
                      </p>
                      <p>
                        <strong style={{ color: '#fff' }}>베트남의 대안 성장:</strong> 중국 퇴출에 따른 반사 혜택으로 베트남 수입액이 2016년 $2.5M에서 2024년 <strong style={{ color: '#fff' }}>$54.9M로 20배 이상 급증</strong>하여 2위로 올라섰습니다.
                      </p>
                      <p>
                        <strong style={{ color: '#fff' }}>트럼프 2기 리스크:</strong> 보편 추가 관세 15-20% 가해질 시 해외 로인 원가 우위가 마모되며 역내 미국령 사모아(StarKist) 기지로 쏠림 심화 예상.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 6: KOREAN FLEET STRATEGY */}
              {currentSlide === 6 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    6. 한국 참치 선단(동원·사조·신라) 전략적 제언
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', flex: 1, alignContent: 'center' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', padding: '0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <strong style={{ fontSize: '0.7rem', color: '#38bdf8' }}>① 미국령 사모아 활용</strong>
                      <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>트럼프 보편 관세 시 역외 loin 대비 면세 혜택을 누리는 StarKist 사모아 기지 독점력 확보.</p>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', padding: '0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <strong style={{ fontSize: '0.7rem', color: '#10b981' }}>② PNA 합작선 설립</strong>
                      <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>중국 ZOF식 키리바시 JV 모델 벤치마킹. 도서국 합작사 설립을 통한 장기 조업권 확보.</p>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', padding: '0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <strong style={{ fontSize: '0.7rem', color: '#8b5cf6' }}>③ 스페인 가공사 M&A</strong>
                      <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>스페인 Frime SA 인수 사례처럼 EU 역내 가공 지분 참여로 APR 인증 통관 장벽 우회.</p>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', padding: '0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <strong style={{ fontSize: '0.7rem', color: '#ef4444' }}>④ 100% 전자감시 도입</strong>
                      <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>Walmart-PIT 선례를 따라 전 함대 EM 도입으로 차별화된 프리미엄 공급망 락업 유도.</p>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', padding: '0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <strong style={{ fontSize: '0.7rem', color: '#eab308' }}>⑤ 바이오 업사이클링</strong>
                      <p style={{ fontSize: '0.62rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>참치 가공 부산물 고부가가치 순환 경제 시스템(Bio-Upcycling)으로 Valuation Rerating 달성.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Slide Footer (Page Indicators & Controllers) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                슬라이드 {currentSlide + 1} / {totalSlides}
              </span>
              
              {/* Controller Buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  disabled={currentSlide === 0}
                  onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
                  style={{
                    padding: '4px 12px', fontSize: '0.65rem', fontWeight: 800,
                    background: currentSlide === 0 ? 'rgba(255,255,255,0.02) !important' : 'rgba(255,255,255,0.05) !important',
                    color: currentSlide === 0 ? 'var(--text-dim) !important' : 'var(--text-primary) !important',
                    border: '1px solid var(--panel-border) !important',
                    borderRadius: '4px !important', cursor: currentSlide === 0 ? 'default' : 'pointer',
                    textTransform: 'none' as any, letterSpacing: 'normal'
                  }}
                >
                  이전
                </button>
                <button
                  disabled={currentSlide === totalSlides - 1}
                  onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1))}
                  style={{
                    padding: '4px 12px', fontSize: '0.65rem', fontWeight: 800,
                    background: currentSlide === totalSlides - 1 ? 'rgba(255,255,255,0.02) !important' : '#38bdf8 !important',
                    color: currentSlide === totalSlides - 1 ? 'var(--text-dim) !important' : '#0a0d14 !important',
                    border: '1px solid var(--panel-border) !important',
                    borderRadius: '4px !important', cursor: currentSlide === totalSlides - 1 ? 'default' : 'pointer',
                    textTransform: 'none' as any, letterSpacing: 'normal'
                  }}
                >
                  다음
                </button>
              </div>
            </div>
          </div>
          
          {/* Legend and Keyboard Tips */}
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', display: 'flex', gap: '16px' }}>
            <span>⌨ 키보드 <strong style={{ color: 'var(--text-muted)' }}>←</strong> / <strong style={{ color: 'var(--text-muted)' }}>→</strong> 또는 <strong style={{ color: 'var(--text-muted)' }}>Space</strong> 키를 사용하여 슬라이드를 넘길 수 있습니다.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
