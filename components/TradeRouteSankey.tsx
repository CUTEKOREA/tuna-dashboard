'use client';

import React, { useState } from 'react';
import styles from './TradeRouteSankey.module.css';
import { Route, AlertTriangle, Calculator, Anchor, Package, Compass } from 'lucide-react';
import TermTooltip from './TermTooltip';

export default function TradeRouteSankey() {
  const [atqExhaustion, setAtqExhaustion] = useState(60);
  const [thaiFtaActive, setThaiFtaActive] = useState(false);

  const isAtqExhausted = atqExhaustion >= 100;
  const isAtqWarning = atqExhaustion >= 85 && atqExhaustion < 100;

  // Calculate Operating Profit Impact
  let baseOp = 12.5; // $12.5M
  if (isAtqExhausted) {
    baseOp -= 3.2; // Massive hit for losing 0% tariff
  }
  if (thaiFtaActive) {
    baseOp += 2.8; // New highly profitable route
  }

  // Bezier curve generator (percentages 0-100)
  const drawPath = (x1: number, y1: number, x2: number, y2: number) => {
    // control points 15% out horizontally
    return `M ${x1} ${y1} C ${x1 + 15} ${y1}, ${x2 - 15} ${y2}, ${x2} ${y2}`;
  };

  const getVietEuStatus = () => {
    if (isAtqExhausted) return styles.danger;
    if (isAtqWarning) return styles.active;
    return styles.active;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Route size={20} color="#38bdf8" />
          <TermTooltip term="글로벌 관세 장벽 & 무역 경로 최적화 시뮬레이터" description="WCPFC 등 어장(어획지)에서 잡은 참치를 동남아 등 가공공장을 거쳐 최종적으로 EU나 미국(소비지)에 팔 때, 가장 관세 혜택과 마진이 큰 운송 경로를 찾고 시뮬레이션하는 기능입니다." />
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <div className={styles.label}>
            <span><TermTooltip term="EU 특정품목(ATQ) 무관세 쿼터 소진율" description="ATQ(Autonomous Tariff Quota). EU가 참치 원료 수입 시 일정 물량(약 3.5만 톤)까지 24%의 관세를 0%로 면제해주는 파격 쿼터입니다. 모두 소진되면 24% 관세 폭탄을 맞습니다." /></span>
            <span style={{ color: isAtqExhausted ? 'var(--color-danger)' : (isAtqWarning ? '#fbbf24' : '#38bdf8') }}>
              {atqExhaustion}% {isAtqExhausted ? '(소진 완료)' : ''}
            </span>
          </div>
          <input 
            type="range" 
            min="0" max="100" 
            value={atqExhaustion} 
            onChange={(e) => setAtqExhaustion(Number(e.target.value))}
            className={styles.slider}
            style={{ accentColor: isAtqExhausted ? 'var(--color-danger)' : '#38bdf8' }}
          />
        </div>

        <div className={styles.controlGroup}>
          <div className={styles.label}>
            <span><TermTooltip term="태국-EU FTA 발효 (시뮬레이션)" description="한국 국적의 참치선들이 주로 하역하는 태국 공장이, 미래에 EU와 자유무역협정(FTA)을 체결하여 0% 관세 특혜를 받게 될 경우 회사의 영업이익 증가를 예측하는 시나리오입니다." /></span>
            <span style={{ color: thaiFtaActive ? 'var(--color-success)' : '#64748b' }}>
              {thaiFtaActive ? '발효 ON (0% 관세)' : '미체결 (24% 기본)'}
            </span>
          </div>
          <div className={styles.toggleWrapper} onClick={() => setThaiFtaActive(!thaiFtaActive)}>
            <div className={`${styles.toggleSwitch} ${thaiFtaActive ? styles.active : ''}`}>
              <div className={styles.toggleHandle}></div>
            </div>
            <span style={{ fontSize: '11px', color: '#cbd5e1' }}>What-if 경로 개방</span>
          </div>
        </div>

        <div className={`${styles.impactBox} ${isAtqExhausted && !thaiFtaActive ? styles.danger : ''}`}>
          <div className={styles.impactTitle}>예상 영업이익 (OP Impact)</div>
          <div className={`${styles.impactValue} ${isAtqExhausted && !thaiFtaActive ? styles.danger : ''}`}>
            ${baseOp.toFixed(1)}M USD (연간)
          </div>
        </div>
      </div>

      <div className={styles.sankeyArea}>
        {/* SVG Path Layer (100x100 viewBox for percentage mapping) */}
        <svg className={styles.svgLayer} viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* WCPFC -> Thai */}
          <path d={drawPath(20, 20, 40, 25)} className={`${styles.pathLine} ${styles.thick} ${styles.active}`} />
          {/* WCPFC -> Viet */}
          <path d={drawPath(20, 20, 40, 50)} className={`${styles.pathLine} ${styles.thick} ${styles.active}`} />
          {/* EPO -> Ecua */}
          <path d={drawPath(20, 80, 40, 80)} className={`${styles.pathLine} ${styles.thick} ${styles.active}`} />
          
          {/* Thai -> EU */}
          {thaiFtaActive ? (
            <path d={drawPath(60, 25, 80, 25)} className={`${styles.pathLine} ${styles.thick} ${styles.success}`} />
          ) : (
            <path d={drawPath(60, 25, 80, 25)} className={`${styles.pathLine} ${styles.thin}`} stroke="rgba(255,255,255,0.1)" />  
          )}
          {/* Thai -> US */}
          <path d={drawPath(60, 25, 80, 50)} className={`${styles.pathLine} ${styles.medium} ${styles.active}`} />
          
          {/* Viet -> EU */}
          <path d={drawPath(60, 50, 80, 25)} className={`${styles.pathLine} ${styles.thick} ${getVietEuStatus()}`} />
          
          {/* Ecua -> EU */}
          <path d={drawPath(60, 80, 80, 25)} className={`${styles.pathLine} ${styles.medium} ${styles.success}`} />
          {/* Ecua -> ROW */}
          <path d={drawPath(60, 80, 80, 80)} className={`${styles.pathLine} ${styles.medium} ${styles.active}`} />
        </svg>

        {/* Origin Nodes */}
        <div style={{ position: 'absolute', top: '20%', left: '0', width: '20%', transform: 'translateY(-50%)' }} className={styles.node}>
          <div className={styles.nodeName}><Compass size={14} color="var(--color-info)"/> <TermTooltip term="WCPFC" description="중서부태평양수산위원회. 대한민국 선단이 진출해 있는 가장 핵심적인 어장으로 전 세계 참치의 절반 이상이 이곳에서 잡힙니다." /></div>
          <div className={styles.nodeSub}>서부태평양 어획</div>
        </div>
        <div style={{ position: 'absolute', top: '80%', left: '0', width: '20%', transform: 'translateY(-50%)' }} className={styles.node}>
          <div className={styles.nodeName}><Compass size={14} color="var(--color-info)"/> <TermTooltip term="EPO" description="동부태평양어장(Eastern Pacific Ocean). 아메리카 대륙 인근의 어장으로 에콰도르 공장 납품에 절대적으로 유리한 위치에 있습니다." /></div>
          <div className={styles.nodeSub}>동부태평양 어획</div>
        </div>

        {/* Processing Hub Nodes */}
        <div style={{ position: 'absolute', top: '25%', left: '40%', width: '20%', transform: 'translateY(-50%)' }} className={styles.node}>
          <div className={styles.nodeName}><Package size={14} color="var(--color-warning)"/> Thailand (태국)</div>
          <div className={styles.nodeSub}>제1가공 허브</div>
          <div className={`${styles.nodeBadge} ${thaiFtaActive ? '' : styles.danger}`}>
            {thaiFtaActive ? 'EU 0% (FTA 발효가정)' : 'EU 24% 관세 (장벽)'}
          </div>
        </div>
        
        <div style={{ position: 'absolute', top: '50%', left: '40%', width: '20%', transform: 'translateY(-50%)' }} className={styles.node}>
          <div className={styles.nodeName}><Package size={14} color="var(--color-warning)"/> Vietnam / Phil</div>
          <div className={styles.nodeSub}>대체 가공기지</div>
          <div className={`${styles.nodeBadge} ${isAtqExhausted ? styles.danger : ''}`}>
            {isAtqExhausted ? 'EU 24% (ATQ 쿼터초과)' : 'EU 0% (ATQ 적용)'}
          </div>
        </div>

        <div style={{ position: 'absolute', top: '80%', left: '40%', width: '20%', transform: 'translateY(-50%)' }} className={styles.node}>
          <div className={styles.nodeName}><Package size={14} color="var(--color-warning)"/> Ecuador</div>
          <div className={styles.nodeSub}>아메리카 전진기지</div>
          <div className={styles.nodeBadge}>
            EU 0% (영구 FTA)
          </div>
        </div>

        {/* Destination Nodes */}
        <div style={{ position: 'absolute', top: '25%', left: '80%', width: '20%', transform: 'translateY(-50%)' }} className={styles.node}>
          <div className={styles.nodeName}><Anchor size={14} color="#8b5cf6"/> EU Market</div>
          <div className={styles.nodeSub}>프리미엄 시장</div>
        </div>
        <div style={{ position: 'absolute', top: '50%', left: '80%', width: '20%', transform: 'translateY(-50%)' }} className={styles.node}>
          <div className={styles.nodeName}><Anchor size={14} color="#8b5cf6"/> US Market</div>
          <div className={styles.nodeSub}>로우엔드 소비지</div>
        </div>
        <div style={{ position: 'absolute', top: '80%', left: '80%', width: '20%', transform: 'translateY(-50%)' }} className={styles.node}>
          <div className={styles.nodeName}><Anchor size={14} color="#8b5cf6"/> ROW Market</div>
          <div className={styles.nodeSub}>기타 유통</div>
        </div>
      </div>

      {/* Dynamic AI Insights based on slider rules */}
      {isAtqExhausted && !thaiFtaActive && (
        <div className={styles.aiInsight}>
          <AlertTriangle size={16} color="var(--color-danger)" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
          <strong>AI 긴급 경보:</strong> 파트너 국가의 EU 무관세 쿼터(ATQ)가 전면 소진되었습니다. 베트남/필리핀산 제품이 24%의 관세 장벽에 부딪혔습니다.<br/>
          👉 즉시 WCPFC 원어를 에콰도르 공장으로 우회 배정하여 EU발 납품 취소 및 운임 적자를 방어하십시오.
        </div>
      )}

      {thaiFtaActive && (
        <div className={styles.aiInsight} style={{ borderLeftColor: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <Calculator size={16} color="var(--color-success)" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
          <strong>전략 분석:</strong> 태국-EU FTA가 발효될 경우, 동원/사조 등 한국 국적 선사들의 태국향 WCPFC 물동량 수요가 폭증할 것으로 예상됩니다.<br/>
          👉 현재의 베트남/에콰도르 의존도를 낮추고 태국 공장의 가동률을 극대화하여 유럽 시장 마진을 +18% 이상 재확보할 수 있습니다.
        </div>
      )}

      {!isAtqExhausted && !thaiFtaActive && (
        <div className={styles.aiInsight}>
           <Route size={16} color="#38bdf8" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
          <strong>평시 체제:</strong> EU ATQ 잔여 쿼터를 실시간으로 트래킹 중입니다. 선박 이동 소요 기간(4주)을 감안하여 소진율 85% 도달 시 즉각적인 물량 우회 스크립트가 실행 대기 중입니다.
        </div>
      )}

    </div>
  );
}
