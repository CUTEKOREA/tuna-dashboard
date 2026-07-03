'use client';

import React from 'react';
import styles from '../app/page.module.css';
import TermTooltip from './TermTooltip';

export default function NotebookLMInsight({ liveData, mgoData }: { liveData?: any, mgoData?: any, fxData?: any }) {
  const mgoPriceStr = mgoData?.price ? mgoData.price.toLocaleString('en-US') : '2,050';
  const skjPriceStr = liveData?.arbitrageRadar?.skjPrice ? liveData.arbitrageRadar.skjPrice.toLocaleString('en-US') : '1,975';
  const importVolStr = liveData?.thaiTrade?.importVol ? liveData.thaiTrade.importVol.toLocaleString('en-US') : '193,367';
  const exportVolStr = liveData?.thaiTrade?.exportVol ? liveData.thaiTrade.exportVol.toLocaleString('en-US') : '118,723';
  const importTrend = liveData?.thaiTrade?.importTrend ?? '-7';
  const exportTrend = liveData?.thaiTrade?.exportTrend ?? '-12';

  return (
    <div className={styles.insightSidebar}>
      <div className={styles.sidebarTitle}>
        Daily Insights
        <span className={styles.sidebarUpdate}>2026.05.11</span>
      </div>
      
      <div className={styles.insightList}>
        <div className={styles.insightItem}>
          <span className={styles.insightObjTitle}>🛢️ ENERGY: 호르무즈 사태 및 MGO {mgoPriceStr}달러 폭등</span>
          <p className={styles.insightObjText}>
            지정학적 분쟁 심화로 선박용 경유(MGO) 가격이 <TermTooltip term={`${mgoPriceStr}달러`} description="현재 싱가포르 거래소 기준, 평시 대비 150% 폭등한 수준입니다." />까지 치솟았습니다. 이는 선단 운영비의 극단적 상승을 초래하여 다수의 원양 어선들이 조업을 포기하거나 귀항을 서두르는 한계 상황에 직면해 있습니다.
          </p>
        </div>

        <div className={styles.insightItem}>
          <span className={styles.insightObjTitle}>📉 MARKET: 방콕 가다랑어(SKJ) {skjPriceStr}달러 (수요 파괴)</span>
          <p className={styles.insightObjText}>
            유가 폭등에도 불구하고 방콕 가다랑어 거래가는 톤당 {skjPriceStr}달러로 단기 하락했습니다. 이는 원어 공급이 안정된 것이 아니라, 높은 원가를 감당하지 못한 가공업체들의 극심한 <TermTooltip term="수요 파괴(Demand Destruction)" description="가격 급등으로 인해 소비자가 구매를 포기하면서 전체적인 수요가 줄어드는 현상입니다." />와 관망세가 시장에 반영된 결과입니다.
          </p>
        </div>

        <div className={styles.insightItem}>
          <span className={styles.insightObjTitle}>🚢 TRADE: 태국 1분기 원어 수입 및 캔 수출 동반 급감</span>
          <p className={styles.insightObjText}>
            2026년 1분기 태국의 참치 원어 수입량은 {importVolStr}톤으로 전년 대비 {Math.abs(Number(importTrend))}% 감소했으며, 참치캔 수출량 역시 {exportVolStr}톤으로 {Math.abs(Number(exportTrend))}% 급감했습니다. 특히 미국발 무역 병목 현상과 재고 누적이 수출 부진의 주원인으로 지목되고 있습니다.
          </p>
        </div>

        <div className={styles.insightItem}>
          <span className={styles.insightObjTitle}>💱 FX & MACRO: 고환율 기조 지속 및 통상 환경 악화</span>
          <p className={styles.insightObjText}>
            미국 달러 강세 기조가 장기화되면서 환율은 지속적인 상방 압력을 받고 있습니다. 여기에 각국의 자국 우선주의 무역 정책이 맞물려 글로벌 소싱 비용 및 통관 리스크가 최고조에 달한 상태입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
