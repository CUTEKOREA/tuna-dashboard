"use client";

import { AlertTriangle, Anchor, CheckCircle2, Database, Factory, Ship } from 'lucide-react';
import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';
import styles from './LogisticsCommandCenter.module.css';

type Priority = '즉시 확인' | '금주 확인' | '정보 상충' | '확인 완료';

type DecisionItem = {
  priority: Priority;
  title: string;
  evidence: string;
  action: string;
  icon: typeof AlertTriangle;
};

const decisions: DecisionItem[] = [
  {
    priority: '즉시 확인',
    title: 'THAI UNION 창고 포화',
    evidence: '원어 62,000/62,000MT · 점유율 100%',
    action: '추가 반입 배정과 창고 회전 계획을 확인합니다.',
    icon: Factory,
  },
  {
    priority: '확인 완료',
    title: 'TRI MARINE 누계 정정 반영',
    evidence: '누계 56,463MT · 월별 합계 일치',
    action: '10,000MT 상충 경고를 해제하고 정정 누계를 적용했습니다.',
    icon: Database,
  },
  {
    priority: '금주 확인',
    title: '송클라 저가동',
    evidence: '생산능력 대비 37% · 창고 점유율 17%',
    action: 'SCC 저가동과 방콕 물량 전환 가능성을 검토합니다.',
    icon: Factory,
  },
  {
    priority: '확인 완료',
    title: '입항 상태 확인 완료',
    evidence: 'SEIN VENUS 하역완료(8/22) · HENG HONG 9 배분 보고 확인(8/6)',
    action: '예정 상태 경고를 해제하고 후속 보고 상태로 전환합니다.',
    icon: Anchor,
  },
];

const priorityClass: Record<Priority, string> = {
  '즉시 확인': styles.priorityUrgent,
  '금주 확인': styles.priorityWatch,
  '정보 상충': styles.priorityConflict,
  '확인 완료': styles.priorityResolved,
};

export default function LogisticsOperationsPanel() {
  return (
    <div className={styles.operationsLayout}>
      <section className={styles.signalStrip} aria-labelledby="operations-signal-title">
        <div className={styles.sectionHeading}>
          <AlertTriangle size={20} aria-hidden="true" />
          <div>
            <h2 id="operations-signal-title">운영 확인 관제판</h2>
            <p>조치가 필요한 예외와 후속 확인이 끝난 항목을 함께 표시합니다.</p>
          </div>
        </div>

        <div className={styles.decisionList}>
          {decisions.map((item) => {
            const Icon = item.icon;
            return (
              <article className={styles.decisionRow} key={item.title}>
                <div className={styles.decisionIcon}><Icon size={18} aria-hidden="true" /></div>
                <div className={styles.decisionMain}>
                  <div className={styles.decisionTitleRow}>
                    <span className={`${styles.priority} ${priorityClass[item.priority]}`}>{item.priority}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <p className={styles.evidence}>{item.evidence}</p>
                </div>
                <div className={styles.actionCell}>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{item.action}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.kpiRail} aria-label="8월 5일 핵심 운영 지표">
        <article>
          <Ship size={18} aria-hidden="true" />
          <span>현재 하역 보고</span>
          <strong>{logisticsWeeklyReport.unloading.currentTotal.vessels}척 · {logisticsWeeklyReport.unloading.currentTotal.amount.toLocaleString()}MT</strong>
          <small>8월 누계 {logisticsWeeklyReport.unloading.monthToDate.vessels}척 · {logisticsWeeklyReport.unloading.monthToDate.amount.toLocaleString()}MT</small>
        </article>
        <article>
          <Database size={18} aria-hidden="true" />
          <span>트레이더 검산 누계</span>
          <strong>{logisticsWeeklyReport.traderReceipts.total.toLocaleString()}MT</strong>
          <small>TRI MARINE 56,463MT 정정 반영</small>
        </article>
        <article>
          <Database size={18} aria-hidden="true" />
          <span>원어 협의 시장가</span>
          <strong>${logisticsWeeklyReport.market.rawMaterialPriceUsdPerMt.toLocaleString()}/MT</strong>
          <small>2026년 8월 5일 보고 기준</small>
        </article>
        <article>
          <Factory size={18} aria-hidden="true" />
          <span>방콕 / 송클라 생산</span>
          <strong>2,650 / 330MT</strong>
          <small>생산능력 대비 64% / 37%</small>
        </article>
      </section>
    </div>
  );
}
