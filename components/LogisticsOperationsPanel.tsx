"use client";

import { AlertTriangle, Anchor, CheckCircle2, Database, Factory, Ship } from 'lucide-react';
import { logisticsWeeklyReport } from '@/lib/logistics-weekly-report';
import styles from './LogisticsCommandCenter.module.css';

type Priority = '즉시 확인' | '금주 확인' | '정보 상충';

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
    priority: '정보 상충',
    title: 'TRI MARINE 누계 상충',
    evidence: '원문 46,463MT · 월별 검산 56,463MT · 차이 10,000MT',
    action: '방콕 사무소에 누계 원문 정정을 요청합니다.',
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
    priority: '즉시 확인',
    title: '입항 상태 재확인',
    evidence: 'SEIN VENUS 8월 5일 · HENG HONG 9 8월 6일 도착 예정',
    action: '실제 입항·접안·하역 개시 여부를 갱신합니다.',
    icon: Anchor,
  },
];

const priorityClass: Record<Priority, string> = {
  '즉시 확인': styles.priorityUrgent,
  '금주 확인': styles.priorityWatch,
  '정보 상충': styles.priorityConflict,
};

export default function LogisticsOperationsPanel() {
  return (
    <div className={styles.operationsLayout}>
      <section className={styles.signalStrip} aria-labelledby="operations-signal-title">
        <div className={styles.sectionHeading}>
          <AlertTriangle size={20} aria-hidden="true" />
          <div>
            <h2 id="operations-signal-title">운영 예외 관제판</h2>
            <p>정상 항목보다 확인과 조치가 필요한 예외를 먼저 표시합니다.</p>
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
          <small>TRI MARINE 10,000MT 상충 공개</small>
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
