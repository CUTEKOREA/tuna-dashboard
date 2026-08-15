import React from 'react';
import TakeawayBox from './TakeawayBox';
import styles from './TunaExecutiveInsights.module.css';

export default function Gtc2026Insights() {
  const insights = [
    {
      title: "물리적 세계의 AI 지배력 전이: '피지컬 AI'와 제로 레이버(Zero Labor)",
      methodology: "단순 텍스트 처리를 넘어, NVIDIA Omniverse와 Open Physical AI Data Factory 블루프린트를 통해 시뮬레이션된 디지털 트윈 환경에서 로봇이 물리적 법칙을 자율 학습하여 현실의 액추에이터를 제어함.",
      situation: "엔비디아 GTC 2026의 핵심은 AI의 종착지가 '소프트웨어'가 아닌 '물리적 인프라'임을 선언한 것임. 휴머노이드 로봇 및 자율 공정이 실험실을 벗어나 연산 능력(Compute)을 통해 현실의 노동력(Labor)을 직접 대체하는 티핑 포인트에 도달.",
      takeaway: "자본 배분의 무게 중심을 단순 S/W 도입에서 '디지털 트윈 호환성'을 갖춘 로보틱스 및 제조 인프라로 즉각 전환할 것. 향후 M&A 실사 시 대상 기업의 물리적 인프라가 AI 관제(Omniverse)와 즉각 연동 가능한지 여부를 핵심 밸류에이션 지표로 편입해야 함.",
      source: "NVIDIA Open Physical AI Data Factory Blueprint"
    },
    {
      title: "에이전틱 AI(Agentic AI) 전용 아키텍처: 베라(Vera) CPU의 등장",
      methodology: "인간의 개입 없이 목표를 스스로 분할하고 실행하는 다중 에이전트(Multi-Agent) 생태계에 최적화된 Vera CPU는, 단일 신경망 연산을 넘어 복잡한 의사결정 트리를 초저지연으로 병렬 처리함.",
      situation: "단일 챗봇 모델의 시대가 끝나고, 기업의 구매/물류/HR을 자율적으로 통제하는 '에이전틱 워크플로우'가 엔터프라이즈 AI의 주류로 부상. 어도비(Adobe), 액센츄어 등 글로벌 파트너사들이 에이전틱 전환을 기정사실화함.",
      takeaway: "Silla Co. 내부 오퍼레이션을 'Human-in-the-loop(인간 개입)'에서 'Human-on-the-loop(인간 감독)' 체제로 혁신할 것. 공급망 관리 및 금융 리스크 헤지 업무에 자율형 에이전트를 배치하여, 미들오피스 운영 비용(OPEX)을 획기적으로 압축하는 BPR(Business Process Reengineering)을 즉각 실행할 것.",
      source: "NVIDIA Vera CPU & Agentic AI Ecosystem"
    },
    {
      title: "루빈(Rubin) AI 팩토리와 액침 냉각: 인프라 생존 게임의 재편",
      methodology: "개별 GPU 단위를 넘어 랙 단위(Rack-Scale)의 거대 연산 시스템인 Vera Rubin NVL72 아키텍처가 등장. 전력 소비와 발열이 극한에 달하며 액침 냉각 및 후방 전원 공급(Behind-the-Meter)이 필수화됨.",
      situation: "AI 모델의 규모가 조 단위 파라미터로 확장되면서, 칩셋 자체의 성능보다 '전력(Power) 및 냉각(Cooling) 인프라'를 확보하는 자만이 AI 공장(AI Factory)을 가동할 수 있는 생존 인프라 병목 현상이 발생.",
      takeaway: "향후 IT 인프라 증설 및 데이터센터 계약 시 최우선 조건으로 '액침 냉각 인프라 호환성' 및 '독립적 전원 공급망(SMR, 고체 배터리)' 확보를 명시할 것. 무탄소 기저부하(Baseload) 인프라가 결여된 단순 소프트웨어 벤더 투자를 지양하고, 하드웨어 냉각 기술 보유 벤더를 공급망에 편입할 것.",
      source: "NVIDIA Vera Rubin NVL72 AI Supercomputer"
    },
    {
      title: "추론 인프라의 극단적 가속: Groq 3 LPX와 엣지(Edge)의 역습",
      methodology: "AI의 부가가치 창출 패러다임이 '학습(Training)'에서 '초저지연 추론(Inference)'으로 이동. 저지연 가속기(Groq 3 LPX 등)를 통해 실시간 의사결정의 마이크로초(µs) 단위 지연을 제거.",
      situation: "거대 클라우드에 의존하던 중앙집중형 AI가 보안, 통신 지연, 비용 문제로 한계에 봉착. 산업 현장(공장, 선박, 로컬 디바이스)에서 실시간으로 추론을 수행하는 온디바이스/엣지 AI 네트워크 구축이 글로벌 스탠다드로 정착 중.",
      takeaway: "원양 선단, 양식장, 글로벌 물류 창고 등 Silla Co.의 핵심 물리적 인프라에 중앙 클라우드 의존도를 낮추는 '분산형 엣지 AI(Edge AI) 아키텍처'를 구축할 것. 통신망 단절 시에도 자체 추론이 가능한 시스템을 통해 극단적 운영 안정성(BCP)을 확보해야 함.",
      source: "Inside NVIDIA Groq 3 LPX & Inference Infrastructure"
    },
    {
      title: "알파마요(Alpamayo) 자율주행 생태계의 전 산업 확장",
      methodology: "차량용으로 국한되던 자율주행 칩과 소프트웨어 스택이 개방형 플랫폼으로 전환되어, 지게차, 드론, 물류 로봇 등 모든 모빌리티 디바이스에 범용적으로 이식됨.",
      situation: "NVIDIA와 글로벌 파트너들은 물류, 건설, 농업 등 전 산업군에 걸친 라스트마일 및 창고 이동의 무인화를 가속화하고 있음. 자율 주행은 이제 자동차 산업만의 전유물이 아님.",
      takeaway: "단순한 지게차 전동화 및 외주 물류 효율화 논의를 중단하고, 자율 네비게이션 스택이 내장된 '자율형 운송 인프라(Autonomous Fleet)' 전환 프로젝트로 투자 심의(IC) 기준을 상향할 것. 물류 비용을 변동비에서 고정비로 전환하여 거시 인플레이션에 완벽히 헤지(Hedge)할 것.",
      source: "NVIDIA Open Physical AI Data Factory & Autonomous Vehicles"
    },
    {
      title: "블루필드-4(BlueField-4)와 '컨텍스트 메모리' 기반 스토리지 혁신",
      methodology: "방대한 구조화/비구조화 데이터를 단순히 보관하는 저장소를 넘어, DPU(데이터 처리 장치)를 통해 AI가 실시간으로 맥락(Context)을 이해하고 즉시 연산 가능한 '능동형 메모리'로 스토리지의 역할이 전환됨.",
      situation: "데이터는 넘쳐나지만 연산기(GPU/CPU)로 전송하는 과정에서 치명적인 병목이 발생. 지능형 스토리지 아키텍처를 도입한 선도 기업만이 자체 보유한 독점적 데이터 가치를 100% 수익화하고 있음.",
      takeaway: "Silla Co.에 산재된 사일로화된 과거 데이터(수율, 유가, 조업 기록 등)를 능동형 컨텍스트 데이터 스토리지로 마이그레이션하는 'Data-to-Value' 프로젝트를 실행할 것. 피인수 기업 가치 평가 시 '데이터 정돈(Data Cleansing) 상태'를 즉각적인 무형 자산으로 환산하여 반영할 것.",
      source: "NVIDIA BlueField-4 STX Storage Architecture"
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>⚡</span>
          NVIDIA GTC 2026: Physical AI & Infrastructure
        </h2>
      </div>
      <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>
        AI 시대의 종착지 '물리적 인프라' 기반 최고경영진 자본 배분 및 OPEX 혁신 전략 (NVIDIA GTC 2026 Framework)
      </p>
      
      <div style={{ columnCount: 2, columnGap: '24px', marginTop: '1rem' }}>
        {insights.map((insight, index) => (
          <div key={index} style={{ 
            breakInside: 'avoid', 
            marginBottom: '24px',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1.4 }}>
              {insight.title}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                아키텍처 스펙 및 기술 메커니즘 (METHODOLOGY)
              </span>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--w-slate-400)', fontStyle: 'italic', lineHeight: 1.6 }}>
                {insight.methodology}
              </p>
            </div>

            <TakeawayBox 
              situation={insight.situation}
              actionPlan={insight.takeaway}
              source={insight.source}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
