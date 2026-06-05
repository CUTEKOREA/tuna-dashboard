import React from 'react';
import styles from './MackerelStrategy.module.css';
import { TrendingUp, AlertTriangle, Ship, Target, Clock, ShieldCheck, DollarSign, Pickaxe } from 'lucide-react';
import WidgetCard from '@/components/widgets/WidgetCard';

export default function MackerelStrategy() {
  return (
    <WidgetCard
      title="한국 태평양고등어 가나 수출 전략 (테스트 성과 보고)"
      icon={Target}
      iconColor="#3b82f6"
      pillar="S4"
      cardDesc="2026년 2월 부산 출항 1컨테이너 파일럿 판매 결과 및 향후 물량 확대 전략 시나리오"
      telemetry={{ status: 'STATIC', syncDate: '2026-Q1' }}
      takeaway={{
        situation: `<div>
<p>"Pilot Export(파일럿 수출)"란 본격 양산 전 1컨테이너 단위 시범 출하로 P&L·통관·수요 실측을 동시 검증하는 단계. 가나는 참치(면세) vs 고등어(10% 관세 + 20% 제세금)의 구조적 페널티 비대칭이 존재.</p>
<p>실측: <strong>1컨테이너 매출 $60,311, 순수익 $2,550, 마진율 6.21% — 2019년 1.93% 대비 3.2배 개선. 단, 매입원가 $34,482의 67%인 $23,278이 가나 세금(관세+VAT+NHIL+GETFund)에 전가</strong>. 부산-테마항 50일 콜드체인 무사고 통관 성공.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 가나 수출은 "마진 게임"이 아닌 <strong>"참치 어획 사이클의 음(陰)면 헤징 수단"</strong>. 라니냐로 참치 어획이 저조한 분기에 고등어를 대체 단백질로 푸쉬.</p>
<p><strong>3단계</strong>: ① Q2 성수기 2컨테이너 집중 + Q1 매입 최저가 줍줍($26.5/카톤) — 마진 16% 시나리오 목표 ② B2B 직납 구조로 20% 간접세 전가 ③ 참치-고등어 교차 헤징으로 연간 6컨테이너 안정 운영(시나리오 추정).</p>
</div>`,
        source: '내부 수출 시뮬레이션 · 가나 테마항 파일럿 실증 데이터 (2026 Q1)'
      }}
      customBody={
        <div className={styles.container} style={{ padding: 0, marginTop: '1rem' }}>
          <div className={styles.grid}>
            {/* KPI 1 : Import Cost */}
            <div className={styles.glassCard}>
              <span className={styles.metricLabel}>수입 원가 (제품+운송)</span>
              <span className={`${styles.metricValue} ${styles.colorAccent}`}>
                $34,482
              </span>
              <div className={styles.specRow} style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <span>단가 200/300g (16kg)</span>
                <span>$20.97</span>
              </div>
              <div className={styles.specRow}>
                <span>단가 150/250g (20kg)</span>
                <span>$25.78</span>
              </div>
              <div className={styles.glowBox}></div>
            </div>

            {/* KPI 2 : Taxes */}
            <div className={styles.glassCard} style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <span className={styles.metricLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertTriangle size={14} color="var(--color-danger)" />
                가나 관세 및 제세금
              </span>
              <span className={`${styles.metricValue} ${styles.colorDanger}`}>
                $23,278
              </span>
              <div className={styles.specRow} style={{ marginTop: 'auto', paddingTop: '1rem', color: 'var(--color-danger)' }}>
                <span>관세 (Duty Etc)</span>
                <span>$11,216</span>
              </div>
              <div className={styles.specRow} style={{ color: 'var(--color-danger)' }}>
                <span>부가세 등 (20%)</span>
                <span>$12,062</span>
              </div>
            </div>

            {/* KPI 3 : Total Revenue */}
            <div className={styles.glassCard}>
              <span className={styles.metricLabel}>총 매출액</span>
              <span className={`${styles.metricValue}`}>
                $60,311
              </span>
              <div className={styles.specRow} style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <span>200/300g 판매가</span>
                <span>$45.66 (500₵)</span>
              </div>
              <div className={styles.specRow}>
                <span>150/250g 판매가</span>
                <span>$44.75 (490₵)</span>
              </div>
            </div>

            {/* KPI 4 : Net Profit */}
            <div className={styles.glassCard} style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <span className={styles.metricLabel}>최종 순수익 (마진율)</span>
              <span className={`${styles.metricValue} ${styles.colorSuccess}`}>
                6.21%
              </span>
              <div className={styles.specRow} style={{ marginTop: 'auto', paddingTop: '1rem', color: 'var(--color-success)' }}>
                <span>전체 순수익</span>
                <span>$2,550</span>
              </div>
              <div className={styles.specRow} style={{ color: 'var(--color-success)' }}>
                <span>2019년 수입판매 수익</span>
                <span>1.93%</span>
              </div>
              <div className={styles.glowBox} style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)' }}></div>
            </div>
          </div>

          {/* Timeline Bar */}
          <h3 className={styles.sectionHeader}><Ship size={18} className={styles.colorAccent} /> 운송 및 통관 프로세스 타임라인 (S. japonicus 1,328 카톤)</h3>
          <div className={styles.glassCard} style={{ padding: '0.5rem 2rem 2rem 2rem' }}>
            <div className={styles.timelineRow}>
              <div className={styles.timelineItem}>
                <div className={styles.timeDot}></div>
                <span className={styles.timeLocation}>출항 (부산항)</span>
                <span className={styles.timeDate}>2026.02.04</span>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timeDot} style={{ background: 'var(--color-info)', boxShadow: '0 0 15px #3B82F6' }}></div>
                <span className={styles.timeLocation}>입항 (테마항)</span>
                <span className={styles.timeDate}>2026.03.20</span>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timeDot} style={{ background: 'var(--color-warning)', boxShadow: '0 0 15px #F59E0B' }}></div>
                <span className={styles.timeLocation}>통관 (FDA검사)</span>
                <span className={styles.timeDate}>2026.03.25</span>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timeDot} style={{ background: 'var(--color-success)', boxShadow: '0 0 15px #10B981' }}></div>
                <span className={styles.timeLocation}>입고 (GGL 2번 창고)</span>
                <span className={styles.timeDate}>2026.03.26</span>
              </div>
            </div>
          </div>

          {/* Future Strategy Extrapolation */}
          <h3 className={styles.sectionHeader}><Target size={18} className={styles.colorAccent} /> 점진적 물량 확대를 위한 극복 및 보완 전략</h3>
          <div className={styles.strategyGrid}>
            <div className={styles.strategyItem}>
              <h4 className={styles.strategyTitle}><Clock size={16} /> 골든 타임 세일즈 (금어기 공략)</h4>
              <p className={styles.strategyDesc}>
                상반기(3월 중순~4월 초) FAD 조업 금지로 인해 현지 냉동 창고에 여유가 발생합니다. 
                단백질 대체 수요가 급증하는 이 시기를 노려 연간 1~2 컨테이너 수준의 스팟성 초단기 완판을 진행하여, 체류 페널티와 지방 감소(드라이 현상) 리스크를 원천 차단해야 합니다.
              </p>
            </div>

            <div className={styles.strategyItem}>
              <h4 className={styles.strategyTitle}><ShieldCheck size={16} /> 참치(Tuna)와의 헤징(Hedging) 전략</h4>
              <p className={styles.strategyDesc}>
                가나 내 참치와 고등어는 상호 강력한 대체재 관계입니다. 
                참치 재고가 다량 보유 중일 때는 고등어 수입을 지양하고, 반대로 라니냐/기후변화로 참치 어획이 저조할 때 고등어를 고급 단백질원(지방 9~13g 프리미엄)으로 어필하여 가격 방어선을 구축합니다.
              </p>
            </div>

            <div className={styles.strategyItem} style={{ borderLeftColor: 'var(--color-danger)' }}>
              <h4 className={styles.strategyTitle}><DollarSign size={16} /> 최우선 과제: Tax Optimization</h4>
              <p className={styles.strategyDesc}>
                참치(면세)와 달리 고등어는 10% 관세 및 20%의 제세금(VAT+NHIL+GETFund) 등 세금 공제가 불가능한 구조적 페널티가 있습니다. 
                물량을 과도하게 늘리기 전에 현지 대형 벤더사(B2B)와의 직납 구조 다변화를 통해 간접세 전가 시스템을 마련하는 것이 수익성 대폭 확장의 핵심입니다.
              </p>
            </div>
          </div>
          {/* 2026 Quarterly Roadmap (1~4Q) */}
          <h3 className={styles.sectionHeader} style={{ marginTop: '2rem' }}>
            <Ship size={18} className={styles.colorAccent} /> 2026 가나 현지 분기별 수출 마스터플랜 (Q1~Q4 전방위 로드맵)
          </h3>
          <div className={styles.roadmapGrid}>
            
            {/* Q1 Card */}
            <div className={styles.strategyItem} style={{ borderLeftColor: 'var(--color-info)' }}>
              <div className={`${styles.roadmapBadge} ${styles.badgeQ1}`} style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-info)', border: '1px solid rgba(59, 130, 246, 0.4)' }}>Q1 (1 Container)</div>
              <h4 className={styles.strategyTitle}>초기 시장 진입 (파일럿)</h4>
              <p className={styles.strategyDesc}>
                물류 및 통관 리드타임을 검증하고, 현지 바이어의 상품성 평가를 완료하기 위한 선도 물량입니다.
              </p>
              <div className={styles.roadmapDetail}>
                <div className={styles.detailRow}>
                  <span>선적 일정 (Lead Time 45일)</span>
                  <span className={styles.detailValue}>당해 전분기(4분기말) 선적</span>
                </div>
                <div className={styles.detailRow}>
                  <span>적용 매입 단가 (2025기준)</span>
                  <span className={styles.detailValue}>$29.50 (4Q 안정가 적용)</span>
                </div>
                <div className={styles.detailRow}>
                  <span>기대 수익률 (마진)</span>
                  <span className={styles.detailValue} style={{ color: 'var(--color-info)' }}>14.5% (추정)</span>
                </div>
              </div>
            </div>

            {/* Q2 Card */}
            <div className={styles.strategyItem} style={{ borderLeftColor: 'var(--color-success)' }}>
              <div className={`${styles.roadmapBadge} ${styles.badgeQ2}`}>Q2 (2 Containers)</div>
              <h4 className={styles.strategyTitle}>가나 최고 성수기 집중 공략</h4>
              <p className={styles.strategyDesc}>
                FAD 금어기로 인한 대체 수요가 가장 높은 시기. 한국 1분기 최저가 매입 물량을 투입하여 수익률을 극대화합니다.
              </p>
              <div className={styles.roadmapDetail}>
                <div className={styles.detailRow}>
                  <span>선적 일정 (Lead Time 45일)</span>
                  <span className={styles.detailValue}>1분기 (3월 발송)</span>
                </div>
                <div className={styles.detailRow}>
                  <span>적용 매입 단가 (2025기준)</span>
                  <span className={styles.detailValue}>$26.50 (최저가 줍줍)</span>
                </div>
                <div className={styles.detailRow}>
                  <span>기대 수익률 (마진)</span>
                  <span className={styles.detailValue} style={{ color: 'var(--color-success)' }}>16.0% (추정)</span>
                </div>
              </div>
            </div>

            {/* Q3 Card */}
            <div className={styles.strategyItem} style={{ borderLeftColor: 'var(--color-warning)' }}>
              <div className={`${styles.roadmapBadge} ${styles.badgeQ3}`}>Q3 (1 Container)</div>
              <h4 className={styles.strategyTitle}>건기 침체 방어 및 헤징</h4>
              <p className={styles.strategyDesc}>
                건기 및 어획량 회복기에 맞춘 보수적 물량. 수요 변동성에 대응하여 재고 리스크를 최소화합니다.
              </p>
              <div className={styles.roadmapDetail}>
                <div className={styles.detailRow}>
                  <span>선적 일정 (Lead Time 45일)</span>
                  <span className={styles.detailValue}>2분기 (5~6월 발송)</span>
                </div>
                <div className={styles.detailRow}>
                  <span>적용 매입 단가 (2025기준)</span>
                  <span className={styles.detailValue}>$28.00 (시장 안정가)</span>
                </div>
                <div className={styles.detailRow}>
                  <span>기대 수익률 (마진)</span>
                  <span className={styles.detailValue} style={{ color: 'var(--color-warning)' }}>12.0% (추정)</span>
                </div>
              </div>
            </div>

            {/* Q4 Card */}
            <div className={styles.strategyItem} style={{ borderLeftColor: '#8B5CF6' }}>
              <div className={`${styles.roadmapBadge} ${styles.badgeQ4}`}>Q4 (2 Containers)</div>
              <h4 className={styles.strategyTitle}>연말 성수기 프리미엄 릴리즈</h4>
              <p className={styles.strategyDesc}>
                연말/연초 축제 특수 대응. 3분기 매입가는 높지만 프리미엄급 지방(Fat) 상품으로 현지 고가 판로를 공략합니다.
              </p>
              <div className={styles.roadmapDetail}>
                <div className={styles.detailRow}>
                  <span>선적 일정 (Lead Time 45일)</span>
                  <span className={styles.detailValue}>3분기 (8~9월 발송)</span>
                </div>
                <div className={styles.detailRow}>
                  <span>적용 매입 단가 (2025기준)</span>
                  <span className={styles.detailValue}>$31.00 (어획 전 고가)</span>
                </div>
                <div className={styles.detailRow}>
                  <span>기대 수익률 (마진)</span>
                  <span className={styles.detailValue} style={{ color: '#8B5CF6' }}>13.0% (추정)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      }
    />
  );
}
