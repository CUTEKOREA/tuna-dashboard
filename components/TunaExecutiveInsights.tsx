import React from 'react';
import styles from './TunaExecutiveInsights.module.css';
import { Lightbulb, TrendingUp, Ship, BadgeDollarSign, ShieldAlert, Globe, Crosshair, ArrowRightLeft, ThermometerSun, Anchor } from 'lucide-react';

const insightsData = [
  {
    track: "트랙 1: 무역 및 스프레드 최적화 (Trading & Margin)",
    icon: <TrendingUp size={20} color="#38bdf8" />,
    items: [
      {
        title: "차익거래 마진 레이더",
        desc: "원어 매입가와 2차 가공 수출가 사이의 마진 스플릿을 추적하여 '가장 싸게 사서 가공 후 가장 비싸게 파는' 스프레드 구간(Spread Winner) 발굴.",
        tag: "마진 최적화",
        icon: <ArrowRightLeft size={16} />
      },
      {
        title: "가공 허브 패권 지도",
        desc: "미/일에서 태국, 무관세 혜택 국가들로 이동하는 가공 기지 데이터 분석을 통한 차기 합작법인(JV) 및 아웃소싱 거점 예측.",
        tag: "공급망 탐색",
        icon: <Globe size={16} />
      },
      {
        title: "신흥 소비 블랙홀 마켓",
        desc: "저소득에서 중진국으로 상승하며 통조림/단백질 수입이 급증하는 아프리카·중남미 타겟 시장 선점 시그널.",
        tag: "신규 시장",
        icon: <Crosshair size={16} />
      }
    ]
  },
  {
    track: "트랙 2: 조업 및 공급망 (Capture & Supply Chain)",
    icon: <Ship size={20} color="#818cf8" />,
    items: [
      {
        title: "어장 제로섬 역학 뷰어",
        desc: "엘니뇨 등 기후 변화로 태평양 조업이 위축될 때 대서양/인도양 어획량이 급증하는 제로섬 관계 기반 선단 재배치.",
        tag: "선단 오퍼레이션",
        icon: <Anchor size={16} />
      },
      {
        title: "대체 수산물 헷징 매트릭스",
        desc: "참치 어황 저조 시 고등어 등 대체 표층수 어종 무역량이 급증하는 트리거 포인트 분석으로 수급 리스크 방어.",
        tag: "리스크 방어",
        icon: <BadgeDollarSign size={16} />
      },
      {
        title: "다크 트레이딩 의심 경로",
        desc: "국가 간 수출-수입 불일치 데이터를 악용한 해상 전재(Transshipment) 패턴 및 불법 어획(IUU) 벤더 필터링.",
        tag: "ESG 통제",
        icon: <ShieldAlert size={16} />
      }
    ]
  },
  {
    track: "트랙 3 & 4: 프리미엄 시장 및 매크로 리스크 컨트롤",
    icon: <Lightbulb size={20} color="#f472b6" />,
    items: [
      {
        title: "양식 vs 어획 가치 역전",
        desc: "일관된 품질의 축양 참치가 야생 어획의 단가를 뒤집는 '프리미엄 파라독스' 교차점 분석으로 양식업 진출 타당성 점검.",
        tag: "프리미엄 전략",
        icon: <TrendingUp size={16} />
      },
      {
        title: "독과점 HHI 지수 경보",
        desc: "기후 변화로 특정 국가에 참치 어획이 초집중되는 어종을 모니터링하여 가공업체의 사전 선도매입(Hedging) 전략 지원.",
        tag: "공급망 독점 통제",
        icon: <ShieldAlert size={16} />
      },
      {
        title: "기후 쇼크 시뮬레이터",
        desc: "수온 상승에 따른 수역별 어종 믹스(한대성 분열, 열대성 확장) 추이 분석으로 향후 10년 뒤 선박 스펙 기획.",
        tag: "초거시 기후대응",
        icon: <ThermometerSun size={16} />
      }
    ]
  }
];

export default function TunaExecutiveInsights() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '0.75rem', borderRadius: '50%' }}>
          <Lightbulb size={24} color="#38bdf8" />
        </div>
        <div>
          <h2 className={styles.title}>Data-Driven Executive Insights</h2>
          <p className={styles.subtitle}>74년치 FAO 데이터(생산, 무역, 단가)에서 도출된 글로벌 수산 실무자용 10대 핵심 행동 전략</p>
        </div>
      </header>

      <div className={styles.trackGrid}>
        {insightsData.map((track, idx) => (
          <div key={idx} className={styles.trackSection}>
            <div className={styles.trackHeader}>
              {track.icon}
              <h3 className={styles.trackTitle}>{track.track}</h3>
            </div>
            <div className={styles.cardsGrid}>
              {track.items.map((item, i) => (
                <div key={i} className={styles.card}>
                  <div className={styles.cardTitle}>
                    {item.icon}
                    {item.title}
                  </div>
                  <p className={styles.cardDesc}>{item.desc}</p>
                  <span className={styles.cardTag}>{item.tag}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
