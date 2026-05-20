'use client';
import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { Snowflake } from 'lucide-react';
import TakeawayBox from './TakeawayBox';
import styles from './MackerelStrategy.module.css';

const data = [
  { p: 'W1', storageVolume: 8000, turnoverDays: 14 },
  { p: 'W2', storageVolume: 12000, turnoverDays: 18 },
  { p: 'W3', storageVolume: 18000, turnoverDays: 35 },
  { p: 'W4', storageVolume: 22000, turnoverDays: 52 },
  { p: 'W5', storageVolume: 21000, turnoverDays: 45 },
];

export default function MackerelStorageTurnover() {
  return (
    <div className={styles.glassCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Snowflake size={20} />
          보세 냉동창고 매점매석/체화 추적기
          
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          전국 냉동 보세창고의 수입 임치 물량 적재 면적과 해당 분기 도매상의 출하 속도(회전일수)를 상호 모니터링하여 병목과 담합을 탐지합니다.
        </p>
      </div>
      <div style={{ width: '100%', height: 350 }}>
        <SafeResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="p" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" tickFormatter={(v)=>`${v}일`} tick={{ fill: '#fbbf24', fontSize: 10, fontWeight:'bold' }} />
            <Tooltip contentStyle={{ background: 'rgba(0,15,30,0.9)', border: '1px solid rgba(255,255,255,0.2)' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Area yAxisId="left" type="monotone" dataKey="storageVolume" name="창고 내 적재 물량(톤)" fill="rgba(6,182,212,0.15)" stroke="none" />
            <Line yAxisId="right" type="monotone" dataKey="turnoverDays" name="평균 재고 체류시간(일)" stroke="#fbbf24" strokeWidth={3} />
          </ComposedChart>
        </SafeResponsiveContainer>
      </div>
      <TakeawayBox situation="창고 텔레메트리(Telemetry) 분석 결과 치명적 이상치(Outlier)가 감지되었습니다. 물류 유입 볼륨은 폭증하나 출고(Outbound) 볼륨이 소멸하며 악성 재고 회전율(Inventory Turnover 52 days) 한계선을 붕괴시키는 전형적인 \'보틀넥(Bottleneck)\' 경고입니다." actionPlan="[Short-Squeeze Countermeasures] 이는 단순 유통 지연이 아닌, 관세 부과 및 성수기 단가 폭등을 노린 메이저 도매 벤더들의 전략적 매점매석(Hoarding) 카르텔 정황입니다. 당사는 직수입 공급망(Direct Importer)의 레버리지를 극대화하여 물량 출하를 전격 차단(Squeeze)하고, 역으로 최상위 도매 채널에 판가 협상권 100% 백지위임을 강요하는 독점적 프라이싱 파워를 행사." />
    </div>
  );
}