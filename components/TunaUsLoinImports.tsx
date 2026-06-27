'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Landmark } from 'lucide-react';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import WidgetCard from './WidgetCard';

const usLoinData = [
  { year: '2016', 태국: 86.6, 베트남: 2.5, 피지: 68.5, 모리셔스: 40.2, 인도네시아: 8.6, 중국: 67.7, 합계: 292.9 },
  { year: '2017', 태국: 98.3, 베트남: 2.7, 피지: 63.7, 모리셔스: 34.1, 인도네시아: 7.7, 중국: 96.7, 합계: 314.8 },
  { year: '2018', 태국: 70.3, 베트남: 4.3, 피지: 67.8, 모리셔스: 49.3, 인도네시아: 4.3, 중국: 94.0, 합계: 299.4 },
  { year: '2019', 태국: 118.6, 베트남: 25.7, 피지: 67.5, 모리셔스: 53.3, 인도네시아: 5.2, 중국: 7.9, 합계: 301.5 },
  { year: '2020', 태국: 144.9, 베트남: 12.3, 피지: 84.4, 모리셔스: 39.2, 인도네시아: 24.3, 중국: 0.7, 합계: 349.3 },
  { year: '2021', 태국: 65.3, 베트남: 42.9, 피지: 63.1, 모리셔스: 35.7, 인도네시아: 23.4, 중국: 0.0, 합계: 247.6 },
  { year: '2022', 태국: 89.3, 베트남: 39.4, 피지: 76.2, 모리셔스: 33.1, 인도네시아: 25.2, 중국: 0.0, 합계: 293.2 },
  { year: '2023', 태국: 78.5, 베트남: 49.3, 피지: 50.0, 모리셔스: 32.7, 인도네시아: 24.1, 중국: 0.0, 합계: 239.2 },
  { year: '2024', 태국: 75.1, 베트남: 54.9, 피지: 49.9, 모리셔스: 26.1, 인도네시아: 9.2, 중국: 0.0, 합계: 218.3 }
];

export default function TunaUsLoinImports() {
  return (
    <WidgetCard
      title="미국의 전가열 참치 로인 수입 추이 및 관세 영향"
      icon={Landmark}
      iconColor="#38bdf8"
      pillar="S3"
      cardDesc="FFA Markets Study 2025 p.88 표 6 — 미국의 1604.1440 관세 우회(Tariff-hopping)용 전가열 로인 수입액 트렌드 및 대중국 고율 관세 타격 분석"
      unit="(단위: 백만 USD)"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-30' }}
      kpiPanel={[
        { label: '2024 총 수입액', value: '$218.3M', trendColor: '#f8fafc' },
        { label: '베트남 성장 (16-24)', value: '+2,096%', trendColor: '#0ECB81' },
        { label: '중국 대미 수출', value: '$0.0M', trendColor: '#ef4444' },
      ]}
      customBody={
        <div style={{ height: 260 }}>
          <SafeResponsiveContainer width="100%" height="100%">
            <AreaChart data={usLoinData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,170,255,0.12)" />
              <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ background: '#1a2442', border: '1px solid #334155', borderRadius: 8, fontSize: '0.75rem' }} 
                formatter={(v: any) => [`$${v}M`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
              <Area type="monotone" dataKey="태국" stackId="1" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
              <Area type="monotone" dataKey="베트남" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              <Area type="monotone" dataKey="피지" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
              <Area type="monotone" dataKey="모리셔스" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              <Area type="monotone" dataKey="인도네시아" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.2} />
              <Area type="monotone" dataKey="중국" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
            </AreaChart>
          </SafeResponsiveContainer>
        </div>
      }
      takeaway={{
        situation: `<div>
<p>미국의 완제품 참치 통조림(기름) 관세는 <strong>35%의 고세율</strong>을 적용받으나, 전가열 참치 로인(1604.1440)은 <strong>6% 또는 1.1¢/kg</strong> 수준의 저율 관세가 적용됩니다. 이에 글로벌 4대 가공사들은 미국 본토(조지아 및 캘리포니아 공장)로 로인을 들여와 단순 밀봉 통조림화하는 '관세 우회(Tariff-hopping)' 전략을 취하고 있습니다.</p>
<p><strong>주요 관세 충격의 역사적 증거</strong>:</p>
<ul style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 4px;"><strong>중국 선단의 퇴출</strong>: 2018년 $94.0M로 미국 로인 수출 1위였던 중국은 트럼프 1기의 30% 보복 관세 부과 후 2019년 $7.9M로 폭락했으며, 2021년 이후 <strong>$0.0M로 미국 시장에서 완전히 퇴출</strong>되었습니다.</li>
<li style="margin-bottom: 4px;"><strong>베트남의 빈자리 점유</strong>: 중국이 배제된 공백을 베트남이 흡수하며 2016년 $2.5M에서 2024년 <strong>$54.9M로 수입액이 20배 이상 급증</strong>하여 태국에 이은 2대 공급국으로 부상했습니다.</li>
<li><strong>피지(PAFCO)의 전략적 가치</strong>: FCF/Bumble Bee의 가공을 대행하는 피지 PAFCO는 연 $50~84M 상당의 알바코어(날개다랑어) 화이트 미트 로인을 지속 공급하며 핵심 기지 역할을 수호하고 있습니다.</li>
</ul>
</div>`,
        actionPlan: `<div>
<p><strong>전략적 방향</strong>: 트럼프 2기의 보편 관세 추진(태국·베트남 19~20%, 피지 15% 추가 제안)으로 로인 물류 지형도의 변동이 예고되고 있습니다.</p>
<p><strong>실행 가이드라인</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 6px;"><strong>관세 프리 헤징처 확보</strong>: 미국의 보편 관세 리스크에 노출되지 않는 미국령 사모아(동원의 StarKist 공장)로의 원료 공급선을 강화하여 경쟁사(Bumble Bee, Chicken of the Sea) 대비 원가 우위를 도모합니다.</li>
<li style="margin-bottom: 6px;"><strong>베트남-스페인 다변화 포트폴리오 구축</strong>: 미국의 베트남산 로인 규제 가능성에 대비해, 한-EU FTA를 활용할 수 있는 스페인 가공 시설 및 베트남 로인 생산 라인의 무역 경로 변경 시나리오를 수립합니다.</li>
<li><strong>피지 PAFCO 수탁 가공 안정성 재평가</strong>: 신규 보편 관세가 적용될 경우 피지 원산지 로인의 마진 마모를 방지하기 위해 톤당 공급 단가의 인하 조정 또는 장기 조달 계약의 리비전을 검토합니다.</li>
</ol>
</div>`,
        source: 'USITC Dataweb (HS 1604.1440) · FFA Markets Study 2025 UPDATE p.88 Table 6'
      }}
    />
  );
}
