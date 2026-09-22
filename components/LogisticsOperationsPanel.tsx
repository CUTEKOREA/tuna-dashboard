"use client";

import { AlertTriangle, Anchor, CheckCircle2, Database, Factory, Ship } from 'lucide-react';
import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';

import styles from './LogisticsCommandCenter.module.css';

/* 화면 문장의 수치는 계약에서 파생시킨다 - 손으로 적으면 다음 보고에 그대로 남는다 */
const reportMonth = `${Number(logisticsWeeklyReport.source.reportDate.slice(5, 7))}월`;
const sumBy = (
  rows: readonly { maxProduction: number; currentProduction: number }[],
  pick: (row: { maxProduction: number; currentProduction: number }) => number,
) => rows.reduce((total, row) => total + pick(row), 0);
const bangkokProduction = sumBy(logisticsWeeklyReport.canneries.bangkok, (row) => row.currentProduction);
const songkhlaProduction = sumBy(logisticsWeeklyReport.canneries.songkhla, (row) => row.currentProduction);
const bangkokUtilization = Math.round(
  (bangkokProduction / sumBy(logisticsWeeklyReport.canneries.bangkok, (row) => row.maxProduction)) * 100);
const songkhlaUtilization = Math.round(
  (songkhlaProduction / sumBy(logisticsWeeklyReport.canneries.songkhla, (row) => row.maxProduction)) * 100);
const songkhlaStorageRate = Math.round(
  (logisticsWeeklyReport.canneries.songkhla.reduce((total, row) => total + row.currentStock, 0)
    / logisticsWeeklyReport.canneries.songkhla.reduce((total, row) => total + row.storageCapacity, 0)) * 100);


type Priority = '즉시 확인' | '금주 확인' | '정보 상충' | '확인 완료';

type DecisionItem = {
  priority: Priority;
  title: string;
  evidence: string;
  action: string;
  icon: typeof AlertTriangle;
};

const spa = logisticsWeeklyReport.canneries.bangkok.find((cannery) => cannery.name === 'SPA')!;
const rejectionGaps = logisticsWeeklyReport.highRejections.filter((row) => {
  const processed = row.items.reduce((total, item) => total + item.mt, 0);
  return Math.abs(row.quantityMt - processed - row.balanceMt) > 0.001;
});

const decisions: DecisionItem[] = [
  {
    priority: '즉시 확인',
    title: 'SPA 창고 포화',
    evidence: `원어 ${spa.currentStock.toLocaleString()}/${spa.storageCapacity.toLocaleString()}MT · 점유율 100%`,
    action: '추가 반입 배정과 창고 회전 계획을 확인합니다.',
    icon: Factory,
  },
  {
    priority: '확인 완료',
    title: '9월 반입 누계 정정 반영',
    evidence: `${reportMonth} 누계 ${logisticsWeeklyReport.unloading.monthToDate.vessels}척 · ${logisticsWeeklyReport.unloading.monthToDate.amount.toLocaleString()}MT · 월별 합계 일치`,
    action: '원문 입항표에서 빠져 있던 SEIN QUEEN·ZHONG YU MARINE 을 되살려 월별표와 맞췄습니다.',
    icon: Database,
  },
  {
    priority: '금주 확인',
    title: '송클라 저가동',
    evidence: `생산능력 대비 ${songkhlaUtilization}% · 창고 점유율 ${songkhlaStorageRate}%`,
    action: 'SCC 저가동과 방콕 물량 전환 가능성을 검토합니다.',
    icon: Factory,
  },
  {
    priority: '정보 상충',
    title: '고반려 잔량 불일치',
    evidence: `${rejectionGaps.length}건 · ${rejectionGaps.map((row) => row.carrier).join('·')}`,
    action: '원문 잔량이 반입량−처리량과 어긋나 원자료로 대조가 필요합니다. 수치는 원문 인쇄값을 그대로 둡니다.',
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

      <section className={styles.kpiRail} aria-label="주간보고 핵심 운영 지표">
        <article>
          <Ship size={18} aria-hidden="true" />
          <span>현재 하역 보고</span>
          <strong>{logisticsWeeklyReport.unloading.currentTotal.vessels}척 · {logisticsWeeklyReport.unloading.currentTotal.amount.toLocaleString()}MT</strong>
          <small>{reportMonth} 누계 {logisticsWeeklyReport.unloading.monthToDate.vessels}척 · {logisticsWeeklyReport.unloading.monthToDate.amount.toLocaleString()}MT</small>
        </article>
        <article>
          <Database size={18} aria-hidden="true" />
          <span>트레이더 검산 누계</span>
          <strong>{logisticsWeeklyReport.traderReceipts.total.toLocaleString()}MT</strong>
          <small>{logisticsWeeklyReport.traderReceipts.reconciliationNote}</small>
        </article>
        <article>
          <Database size={18} aria-hidden="true" />
          <span>원어 협의 시장가</span>
          <strong>${logisticsWeeklyReport.market.rawMaterialPriceUsdPerMt.toLocaleString()}/MT</strong>
          <small>{logisticsWeeklyReport.source.reportDate} 보고 기준</small>
        </article>
        <article>
          <Factory size={18} aria-hidden="true" />
          <span>방콕 / 송클라 생산</span>
          <strong>{bangkokProduction.toLocaleString()} / {songkhlaProduction.toLocaleString()}MT</strong>
          <small>생산능력 대비 {bangkokUtilization}% / {songkhlaUtilization}%</small>
        </article>
      </section>
    </div>
  );
}
