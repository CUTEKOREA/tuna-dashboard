'use client';

import React, { useEffect, useState } from 'react';
import * as chartFmt from '../lib/chartFormatters';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import WidgetCard from './WidgetCard';

interface CatchEntry {
  year: string;
  가다랑어: number;
  황다랑어: number;
  눈다랑어: number;
}

export default function TunaCatchBySpeciesLive() {
  const [data, setData] = useState<CatchEntry[]>([]);

  useEffect(() => {
    fetch('/data/tuna/catch_by_species.json')
      .then((r) => r.json())
      .then((json) => setData(json.data))
      .catch((err) => console.error('Failed to load tuna catch data:', err));
  }, []);

  return (
    <WidgetCard
      title="참치 어종별 글로벌 어획량 추이"
      pillar="S1"
      unit="(톤, 생중량 Q_tlw)"
      cardDesc="FAO FishStat 2015-2022 어획량 통계(Q_tlw, 톤 생중량) 기반 3대 참치 어종 어획량 시계열"
      telemetry={{ status: 'SYNCED', syncDate: '2026-05-21' }}
      termTooltip={{
        term: 'FishStat · Q_tlw',
        description: 'FishStat는 FAO의 수산물 생산 통계 데이터베이스. Q_tlw는 살아있는 무게 환산 톤 단위 어획량.'
      }}
      chart={
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <XAxis 
            dataKey="year" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (v / 1000000).toFixed(1) + 'M'}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a2442', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc', fontSize: '13px' }}
            formatter={(value: unknown, name: unknown) => [`${chartFmt.formatChartNumber(value)}톤`, chartFmt.toChartText(name)]}
            labelFormatter={(label) => `${label}년`}
            labelStyle={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Line type="monotone" dataKey="가다랑어" name="가다랑어" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: '#1a2442', strokeWidth: 2 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="황다랑어" name="황다랑어" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#1a2442', strokeWidth: 2 }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="눈다랑어" name="눈다랑어" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#1a2442', strokeWidth: 2 }} activeDot={{ r: 5 }} />
        </LineChart>
      }
      takeaway={{
        situation: `<div>
<p>FAO FishStat 글로벌 참치 어획량 실측(2022): <strong>가다랑어(Skipjack) 3,061,304톤(61%)</strong> · 황다랑어(Yellowfin) 1,563,619톤(31%) · 눈다랑어(Bigeye) 357,628톤(7%).</p>
<p>8년 추세(2015-2022): 가다랑어 ~3M톤 박스권 안정(어획 한계 도달), 황다랑어 1.4 → 1.6M톤 점진 증가, 눈다랑어 0.35M톤 박스권(자원 회복 우려로 IOTC TAC 강화).</p>
<p>의미: 글로벌 참치 어획은 가다랑어 60% 단일 의존 구조. ENSO·라니냐 한 번에 글로벌 공급 60%가 휘청. 황다랑어 추가 어획 여력이 최적 확장 여지이지만 쿼터 강화 속도 빠름.</p>
</div>`,
        actionPlan: `<div>
<p><strong>재정의</strong>: 가다랑어 60% 의존은 기후 베타 100% 노출 단일 어종 구조. 황다랑어·날개다랑어 분산이 샤프지수 2배 개선 수단.</p>
<p><strong>3단계</strong>:</p>
<ol style="margin: 4px 0 0 18px; padding: 0;">
<li style="margin-bottom: 8px;"><strong>황다랑어 비중 30% → 35%+ 확대</strong>: IATTC·WCPFC 황다랑어 쿼터 선도 매입 + 황다랑어 어획권 보유 선사와 5년 장기 공급 계약.</li>
<li style="margin-bottom: 8px;"><strong>'어종 포트폴리오 샤프지수' KPI</strong>: 본사 리스크 부서가 매 분기 어종 비중을 현대 포트폴리오 이론 기반 동적 재조정.</li>
<li><strong>차세대 어종(날개다랑어·청새치) 선제 진입</strong>: 기후변화로 서식 위도 상승 시 신규 어장 출현 — 미리 어업 라이선스 선도 매입.</li>
</ol>
</div>`,
        source: 'FAO FishStat Capture Statistics 2015-2022 (Q_tlw, 자료수집 매뉴얼 v28.4 §2 FishStat 3 zip)'
      }}
    />
  );
}
